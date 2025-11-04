from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# ✅ Path to the JSON file inside backend/quests/
QUEST_FILE = os.path.join(os.path.dirname(__file__), "quests", "quest1.json")

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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
