import React, { useEffect, useState, useRef } from "react";
import "./Quests.css";

/**
 * Quests component — centered, no header, futuristic style.
 * - Loads /quest1.json from public/ if present
 * - Fallback: 8 questions
 */

export default function Quests() {
  const DATA_URLS = ["/quest1.json"];
  const PREF = "cyber_q_";
  const KEY_CORRECT = PREF + "correct";
  const KEY_MISTAKES = PREF + "mistakes";
  const KEY_INDEX = PREF + "index";

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const inputRef = useRef();

  // restore saved state
  useEffect(() => {
    try {
      const sc = parseInt(localStorage.getItem(KEY_CORRECT) || "0", 10);
      const sm = JSON.parse(localStorage.getItem(KEY_MISTAKES) || "[]");
      const si = parseInt(localStorage.getItem(KEY_INDEX) || "0", 10);
      if (!isNaN(sc)) setCorrectCount(sc);
      if (Array.isArray(sm)) setMistakes(sm);
      if (!isNaN(si)) setIndex(si);
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // load questions
  useEffect(() => {
    let canceled = false;
    async function fetchData() {
      let data = null;
      for (const url of DATA_URLS) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("not ok");
          data = await res.json();
          break;
        } catch (e) {
          // try next
        }
      }
      if (canceled) return;
      if (Array.isArray(data) && data.length) {
        setQuestions(data);
      } else {
        // fallback 8 questions
        setQuestions([
          { id: 1, question: "Qu'est-ce qu'une adresse IP ?", answer: "adresse ip|ip address|internet protocol address", explanation: "Adresse réseau unique d'un appareil." },
          { id: 2, question: "Que signifie SQL ?", answer: "sql|structured query language", explanation: "Langage pour interroger les bases de données." },
          { id: 3, question: "Qu'est-ce qu'un firewall ?", answer: "firewall|pare-feu", explanation: "Filtre le trafic réseau." },
          { id: 4, question: "Que signifie XSS ?", answer: "xss|cross site scripting", explanation: "Injection de script malveillant dans une page web." },
          { id: 5, question: "Qu'est-ce qu'un VPN ?", answer: "vpn|virtual private network", explanation: "Tunnel chiffré pour sécuriser la connexion." },
          { id: 6, question: "Que veut dire DDoS ?", answer: "ddos|distributed denial of service", explanation: "Attaque visant à rendre un service indisponible." },
          { id: 7, question: "Qu'est-ce qu'un hash ?", answer: "hash|hachage|empreinte", explanation: "Transformation irréversible des données." },
          { id: 8, question: "Que veut dire phishing ?", answer: "phishing|hameçonnage", explanation: "Tentative de tromper et voler des informations." }
        ]);
      }
      setTimeout(() => inputRef.current?.focus(), 80);
    }
    fetchData();
    return () => { canceled = true; };
  }, []);

  // persist index
  useEffect(() => {
    localStorage.setItem(KEY_INDEX, String(index));
  }, [index]);

  function normalize(s) {
    if (!s) return "";
    return s.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function matches(answerText, accepted) {
    const user = normalize(answerText);
    const variants = accepted.toString().split("|").map(v => normalize(v));
    return variants.some(v => v && (user === v || (v.includes(user) && user.length >= 3)));
  }

  function handleSubmit() {
    if (!questions.length) return;
    const q = questions[index];
    if (!q || !q.answer) {
      setMessage("⚠️ Question mal configurée.");
      return;
    }

    const ok = matches(input, q.answer);
    if (ok) {
      const nc = correctCount + 1;
      setCorrectCount(nc);
      localStorage.setItem(KEY_CORRECT, String(nc));
      setMessage("✅ Bonne réponse !");
      const remaining = mistakes.filter(m => m.id !== q.id);
      setMistakes(remaining);
      localStorage.setItem(KEY_MISTAKES, JSON.stringify(remaining));
      setShowExplanation(true);
      setTimeout(() => { setShowExplanation(false); goNext(); }, 700);
    } else {
      setMessage("❌ Mauvaise réponse — consulte l'explication.");
      setShowExplanation(true);
      const exists = mistakes.find(m => m.id === q.id);
      const updated = exists ? mistakes : [...mistakes, { id: q.id, question: q.question, given: input || "(vide)", expected: q.answer, explanation: q.explanation || "" }];
      setMistakes(updated);
      localStorage.setItem(KEY_MISTAKES, JSON.stringify(updated));
    }
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 90);
  }

  function goNext() {
    if (!questions.length) return;
    setMessage("");
    setShowExplanation(false);
    setIndex((prev) => (prev + 1) % questions.length);
    setInput("");
  }

  function goPrev() {
    if (!questions.length) return;
    setMessage("");
    setShowExplanation(false);
    setIndex((prev) => (prev - 1 + questions.length) % questions.length);
    setInput("");
  }

  function gotoMistake(m) {
    const qi = questions.findIndex(q => q.id === m.id);
    if (qi >= 0) setIndex(qi);
    setMessage("");
  }

  const total = questions.length || 1;
  const pct = Math.round((correctCount / total) * 100);
  const q = questions[index] || {};

  return (
    <div className="quests-root" role="main" aria-live="polite">
      <main className="quests-main">
        <section className="card question-card" aria-labelledby="qtitle">
          <div className="progress-wrap" aria-hidden="false">
            <div className="meta" id="qtitle">Question {index + 1} / {total}</div>

            <div className="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={pct}>
              <div className="progress-fill" style={{ width: `${Math.min(pct,100)}%` }} />
            </div>

            <div className="bubbles" style={{ marginTop: 8 }}>
              {Array.from({ length: total }).map((_, i) => {
                const done = i < correctCount;
                const current = i === index;
                return (
                  <button
                    key={i}
                    className={`bubble ${done ? "done" : ""} ${current ? "current" : ""}`}
                    onClick={() => setIndex(i)}
                    aria-label={`Aller à question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="question-text" id={`question-${q.id}`}>
            {q.question}
          </div>

          <div className="answer-row">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "ArrowRight") goNext(); if (e.key === "ArrowLeft") goPrev(); }}
              placeholder="Tape ta réponse puis Enter"
              aria-label="Réponse"
            />

            <div className="controls" role="group" aria-label="Contrôles">
              <button className="btn primary" onClick={handleSubmit}>Valider</button>
              <button className="btn" onClick={goNext}>Suivante</button>
              <button className="btn ghost" onClick={goPrev}>Précédente</button>
            </div>
          </div>

          {message && <div style={{ marginTop: 12 }} className={`feedback ${message.startsWith("✅") ? "good" : "bad"}`}>{message}</div>}

          {showExplanation && (
            <div className="explanation" role="status" aria-live="polite">
              <strong>Explication</strong>
              <p style={{ marginTop: 8 }}>{q.explanation || "Aucune explication fournie."}</p>
            </div>
          )}
        </section>

        <aside className="card panel-card" aria-label="Erreurs enregistrées">
          <h3>Erreurs</h3>

          {mistakes.length === 0 ? (
            <div className="muted">Aucune erreur pour l'instant — bien joué !</div>
          ) : (
            <ul className="mistake-list">
              {mistakes.map(m => (
                <li key={m.id}>
                  <div style={{ fontWeight:700, marginBottom:6 }}>{m.question}</div>
                  <div style={{ marginTop:6 }}><strong>Ta réponse:</strong> {m.given}</div>
                  <div style={{ marginTop:6 }}><strong>Attendu:</strong> {m.expected}</div>
                  {m.explanation && <div className="muted" style={{ marginTop:8 }}>{m.explanation}</div>}
                  <div style={{ display: "flex", gap: 10, marginTop:12 }}>
                    <button className="btn" onClick={() => gotoMistake(m)}>Aller à</button>
                    <button className="btn ghost" onClick={() => {
                      const remaining = mistakes.filter(x => x.id !== m.id);
                      setMistakes(remaining);
                      localStorage.setItem(KEY_MISTAKES, JSON.stringify(remaining));
                    }}>Supprimer</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>
    </div>
  );
}
