import React, { useState, useEffect } from "react";
import "./NavBar.css";

function NavBar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Sauvegarde du thème
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="cyber">Cyber</span>
        <span className="learn">Learn</span>
      </div>

      <ul className="nav-links">
        <li>
          <a href="/">Accueil</a>
        </li>
        <li>
          <a href="/quests">Quests</a>
        </li>
        <li>
          <a href="/about">À propos</a>
        </li>
      </ul>

      <div className="toggle-container">
        <input
          type="checkbox"
          id="theme-toggle"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />
        <label htmlFor="theme-toggle" className="toggle">
          <span className="circle"></span>
        </label>
      </div>
    </nav>
  );
}

export default NavBar;
