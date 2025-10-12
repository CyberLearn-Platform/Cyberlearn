import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <NavBar />

      <header className="hero-section">
        <h1>
          Welcome to <span>CyberQuest</span>
        </h1>
        <p>
          Master cybersecurity skills through interactive missions, labs, and
          real-world simulations.
        </p>
      </header>

      <section className="cards-section">
        <div className="quest-card" onClick={() => navigate("/quests")}>
          <h2>⚡ Quests</h2>
          <p>Start your interactive cybersecurity challenges.</p>
        </div>

        <div className="quest-card disabled">
          <h2>🔐 Labs</h2>
          <p>Hands-on labs — Coming soon.</p>
        </div>

        <div className="quest-card disabled">
          <h2>📘 Learning Paths</h2>
          <p>Guided paths to grow your hacking skills.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
