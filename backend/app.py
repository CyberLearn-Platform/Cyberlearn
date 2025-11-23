# /mnt/data/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import tempfile
import pyotp
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Use a secret key for signing short-lived tokens:
APP_SECRET = os.environ.get("APP_SECRET", "change-this-secret")
serializer = URLSafeTimedSerializer(APP_SECRET)

# Paths
BASE_DIR = os.path.dirname(__file__)
QUEST_FILE = os.path.join(BASE_DIR, "quests", "quest1.json")
USERS_DIR = os.path.join(BASE_DIR, "data")
USERS_FILE = os.path.join(USERS_DIR, "users.json")

# Utility: load/save users with atomic write
def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_users(users):
    # atomic write: write to temp file then replace
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    dirpath = os.path.dirname(USERS_FILE) or "."
    fd, tmp = tempfile.mkstemp(dir=dirpath)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2)
        os.replace(tmp, USERS_FILE)
    except Exception:
        if os.path.exists(tmp):
            os.remove(tmp)
        raise

# Create a default users.json if it doesn't exist
def ensure_users_file():
    if not os.path.exists(USERS_FILE):
        os.makedirs(USERS_DIR, exist_ok=True)
        default_email = "admin@cyberquest.com"
        default_password = "test123"
        print(f"[startup] creating {USERS_FILE} with default user {default_email} (password: {default_password})")
        users = [
            {
                "email": default_email,
                # hash the default password
                "password": generate_password_hash(default_password),
                "2fa_enabled": False,
                "2fa_secret": None
            }
        ]
        save_users(users)

# --- Load the question from JSON ---
@app.route("/question", methods=["GET"])
def get_question():
    if not os.path.exists(QUEST_FILE):
        return jsonify({"error": "Question file not found"}), 404

    with open(QUEST_FILE, "r", encoding="utf-8") as f:
        quest = json.load(f)

    return jsonify({
        "id": quest["id"],
        "question": quest["question"]
    })

# --- Check the user's answer ---
@app.route("/check-answer", methods=["POST"])
def check_answer():
    if not os.path.exists(QUEST_FILE):
        return jsonify({"error": "Question file not found"}), 404

    data = request.get_json()
    user_answer = data.get("answer", "").strip().lower()

    with open(QUEST_FILE, "r", encoding="utf-8") as f:
        quest = json.load(f)

    correct_answer = quest["answer"].strip().lower()

    if user_answer == correct_answer:
        return jsonify({"result": "correct", "message": "✅ Correct! Well done!"})
    else:
        return jsonify({"result": "wrong", "message": "❌ Wrong answer, try again."})

# ----------------------------
# Authentication (file-based)
# ----------------------------

@app.route("/register", methods=["POST"])
def register():
    """
    Register a new user (appends to users.json).
    Body: { "email": "...", "password": "..." }
    """
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Missing email or password"}), 400

    users = load_users()
    if any(u["email"] == email for u in users):
        return jsonify({"success": False, "message": "User already exists"}), 409

    users.append({
        "email": email,
        "password": generate_password_hash(password),
        "2fa_enabled": False,
        "2fa_secret": None
    })
    save_users(users)
    return jsonify({"success": True, "message": "User registered"}), 201

@app.route("/login", methods=["POST"])
def login():
    """
    Login route checks users.json for the email and compares hashed password.
    If 2FA is enabled for the user, returns a short-lived temp_token and indicates 2FA is required.
    """
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Missing credentials"}), 400

    users = load_users()
    user = next((u for u in users if u["email"] == email), None)
    if user is None:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    if not check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    if user.get("2fa_enabled"):
        # create a short-lived token (e.g., 5 minutes)
        temp_token = serializer.dumps({"email": email})
        return jsonify({"success": False, "2fa_required": True, "temp_token": temp_token}), 200

    # No 2FA -> login success
    return jsonify({"success": True, "message": "Login successful", "email": email})

# ----------------------------
# 2FA endpoints
# ----------------------------

@app.route("/2fa/setup", methods=["POST"])
def twofa_setup():
    """
    Body: { email, password }
    Returns: { success, provisioning_uri, secret }
    """
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Missing credentials"}), 400

    users = load_users()
    user = next((u for u in users if u["email"] == email), None)
    if user is None or not check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    # generate secret and store temporarily in user record as '2fa_temp_secret'
    secret = pyotp.random_base32()
    user["2fa_temp_secret"] = secret
    save_users(users)

    provisioning_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name="Cyberquest")
    return jsonify({"success": True, "provisioning_uri": provisioning_uri, "secret": secret})

@app.route("/2fa/confirm", methods=["POST"])
def twofa_confirm():
    """
    Body: { email, password, token }
    Moves 2fa_temp_secret -> 2fa_secret and enables 2fa when token verifies
    """
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    token = (data.get("token") or "").strip()

    if not email or not password or not token:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    users = load_users()
    user = next((u for u in users if u["email"] == email), None)
    if user is None or not check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    secret = user.get("2fa_temp_secret")
    if not secret:
        return jsonify({"success": False, "message": "No pending 2FA setup"}), 400

    totp = pyotp.TOTP(secret)
    if not totp.verify(token, valid_window=1):
        return jsonify({"success": False, "message": "Invalid token"}), 401

    # success: persist secret and enable 2fa
    user["2fa_secret"] = secret
    user["2fa_enabled"] = True
    user.pop("2fa_temp_secret", None)
    save_users(users)
    return jsonify({"success": True, "message": "2FA enabled"})

@app.route("/2fa/login-verify", methods=["POST"])
def twofa_login_verify():
    """
    Body: { temp_token, token }
    Verifies the signed temp_token and the TOTP token. Returns final success on valid.
    """
    data = request.get_json() or {}
    temp_token = data.get("temp_token")
    token = (data.get("token") or "").strip()

    if not temp_token or not token:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    try:
        payload = serializer.loads(temp_token, max_age=300)  # 5 minutes
        email = payload.get("email")
    except SignatureExpired:
        return jsonify({"success": False, "message": "2FA token expired"}), 401
    except BadSignature:
        return jsonify({"success": False, "message": "Invalid token"}), 401

    users = load_users()
    user = next((u for u in users if u["email"] == email), None)
    if user is None:
        return jsonify({"success": False, "message": "Invalid token"}), 401

    secret = user.get("2fa_secret")
    if not secret:
        return jsonify({"success": False, "message": "2FA not configured"}), 400

    totp = pyotp.TOTP(secret)
    if not totp.verify(token, valid_window=1):
        return jsonify({"success": False, "message": "Invalid 2FA code"}), 401

    # 2FA success -> return final success + optionally issue session/JWT
    return jsonify({"success": True, "message": "Login successful", "email": email})

# ----------------------------
# Startup
# ----------------------------
if __name__ == "__main__":
    ensure_users_file()
    app.run(debug=True, port=5000)
