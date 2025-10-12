from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  # allow frontend requests

# --- MySQL Configuration ---
db_config = {
    "host": "localhost",
    "user": "root",          # your MySQL username
    "password": "root",          # your MySQL password (if any)
    "database": "cyberlearn" # the database you created
}

def get_connection():
    return mysql.connector.connect(**db_config)


# --- Get the question ---
@app.route("/question", methods=["GET"])
def get_question():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, question FROM questions LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify({"id": row[0], "question": row[1]})
    else:
        return jsonify({"error": "No question found"}), 404


# --- Check the user’s answer ---
@app.route("/check-answer", methods=["POST"])
def check_answer():
    data = request.get_json()
    user_answer = data.get("answer", "").strip().lower()

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT answer FROM questions LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "No question found"}), 400

    correct_answer = row[0].strip().lower()

    if user_answer == correct_answer:
        return jsonify({"result": "correct"})
    else:
        return jsonify({"result": "wrong"})


if __name__ == "__main__":
    app.run(debug=True)
 