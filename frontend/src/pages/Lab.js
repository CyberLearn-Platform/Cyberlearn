import React, { useState } from "react";
import { startLab, submitFlag } from "../utils/labs";

function Lab() {
  const [lab, setLab] = useState(null);
  const [flag, setFlag] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStartLab() {
    setLoading(true);
    setMessage("");

    try {
      // TEMP: replace later with logged-in user
      const data = await startLab("wael");
      setLab(data);
      setMessage("✅ Lab started");
    } catch (error) {
      setMessage("❌ Failed to start lab");
    }

    setLoading(false);
  }

  async function handleSubmitFlag() {
    try {
      const res = await submitFlag(flag);
      setMessage(res.success ? "🏁 Correct flag!" : "❌ Wrong flag");
    } catch (error) {
      setMessage("⚠️ Error submitting flag");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Web SQL Injection Lab</h1>

      <button onClick={handleStartLab} disabled={loading}>
        {loading ? "Starting..." : "Start Lab"}
      </button>

      {lab && (
        <>
          <p>
            Target:&nbsp;
            <a
              href={`http://${lab.target}:${lab.port}`}
              target="_blank"
              rel="noreferrer"
            >
              http://{lab.target}:{lab.port}
            </a>
          </p>

          <input
            type="text"
            placeholder="FLAG{...}"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
          />

          <button onClick={handleSubmitFlag}>Submit Flag</button>
        </>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default Lab;
