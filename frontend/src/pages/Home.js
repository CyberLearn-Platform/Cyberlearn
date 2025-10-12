import React, { useEffect, useState } from "react";
import "./Home.css"; // 👈 import the CSS file

function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/question")
      .then((res) => res.json())
      .then((data) => {
        if (data.question) setQuestion(data.question);
      })
      .catch((err) => console.error("Error fetching question:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:5000/check-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });

    const data = await res.json();
    setResult(data.result === "correct" ? "✅ Correct!" : "❌ Wrong answer.");
  };

  return (
    <div className="home">
      <h1>🧠 CyberLearn Platform</h1>

      {question ? (
        <>
          <h2 className="question">{question}</h2>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              placeholder="Enter your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn">
              Submit
            </button>
          </form>
          {result && <p className="result">{result}</p>}
        </>
      ) : (
        <p>Loading question...</p>
      )}
    </div>
  );
}

export default Home;
