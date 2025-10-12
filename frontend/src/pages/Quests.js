import React, { useEffect, useState } from "react";
import "./Quests.css";

function Quests() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");

  // Fetch question at page load
  useEffect(() => {
    fetch("http://127.0.0.1:5000/question")
      .then((res) => res.json())
      .then((data) => setQuestion(data.question))
      .catch((err) => console.error("Error fetching question:", err));
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });

      const data = await res.json();
      setResult(data.result === "correct" ? "✅ Correct!" : "❌ Wrong!");
    } catch (err) {
      console.error("Error sending answer:", err);
      setResult("⚠️ Connection error!");
    }
  };

  return (
    <div className="home-container">
      <div className="neon-line">
        <span className="question">{question || "⚙️ Loading question..."}</span>

        <input
          type="text"
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="neon-input"
        />

        <button onClick={handleSubmit} className="neon-btn">
          Submit
        </button>
      </div>

      {result && (
        <div
          className={`result ${
            result.includes("Correct") ? "success" : "error"
          }`}
        >
          {result}
        </div>
      )}
    </div>
  );
}

export default Quests;
