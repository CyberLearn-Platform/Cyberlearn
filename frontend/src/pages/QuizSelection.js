import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "./QuizSelection.css";

function QuizSelection() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/quests");
      const data = await response.json();
      console.log("Quests data:", data); // Debug
      setQuests(data.quests || []);
    } catch (error) {
      console.error("Failed to fetch quests:", error);
      // Fallback avec des données par défaut
      setQuests([
        {
          id: "web_security",
          title: "Sécurité Web",
          icon: "🌐",
          difficulty: "Débutant",
          questions: []
        },
        {
          id: "cryptography", 
          title: "Cryptographie",
          icon: "🔐",
          difficulty: "Intermédiaire", 
          questions: []
        },
        {
          id: "ethical_hacking",
          title: "Hacking Éthique",
          icon: "🎯", 
          difficulty: "Avancé",
          questions: []
        },
        {
          id: "incident_response",
          title: "Réponse aux Incidents",
          icon: "🚨",
          difficulty: "Avancé", 
          questions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (questId) => {
    navigate(`/challenge/${questId}`);
  };

  if (loading) {
    return (
      <div className="quiz-selection">
        <NavBar />
        <div className="loading">Chargement des quiz...</div>
      </div>
    );
  }

  return (
    <div className="quiz-selection">
      <NavBar />
      
      <div className="quiz-content">
        <header className="quiz-header">
          <h1>🎯 Quiz de Cybersécurité</h1>
          <p>Testez vos connaissances avec nos quiz interactifs</p>
        </header>

        <div className="quiz-grid">
          {quests.map((quest) => (
            <div key={quest.id} className="quiz-card">
              <div className="quiz-icon">{quest.icon}</div>
              <h3>{quest.title}</h3>
              
              <div className="quiz-meta">
                <span className={`difficulty ${quest.difficulty.toLowerCase()}`}>
                  {quest.difficulty}
                </span>
                <span className="question-count">
                  {quest.questions?.length || 5} questions
                </span>
              </div>
              
              <button 
                className="start-quiz-btn"
                onClick={() => startQuiz(quest.id)}
              >
                Commencer le Quiz
              </button>
            </div>
          ))}
        </div>

        <div className="quiz-info">
          <h3>💡 Comment ça marche ?</h3>
          <div className="quiz-features">
            <div className="feature-grid">
              <div className="feature-item">
                <span className="feature-icon">⏱️</span>
                <div className="feature-content">
                  <h4>À votre rythme</h4>
                  <p>Pas de limite de temps, prenez le temps de réfléchir</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">💡</span>
                <div className="feature-content">
                  <h4>Explications détaillées</h4>
                  <p>Chaque réponse est accompagnée d'une explication pédagogique</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <div className="feature-content">
                  <h4>Modes variés</h4>
                  <p>QCM intelligent et saisie libre pour tester différentes compétences</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <div className="feature-content">
                  <h4>Système XP</h4>
                  <p>+50 XP par bonne réponse, bonus pour les quiz parfaits</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">🔓</span>
                <div className="feature-content">
                  <h4>Déblocage progressif</h4>
                  <p>60% minimum requis pour débloquer le module suivant</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">📈</span>
                <div className="feature-content">
                  <h4>Suivi de progression</h4>
                  <p>Consultez vos erreurs et améliorez-vous continuellement</p>
                </div>
              </div>
            </div>
            
            <div className="quiz-tips">
              <h4>💪 Conseils pour réussir :</h4>
              <ul>
                <li>Lisez attentivement le cours avant de faire le quiz</li>
                <li>N'hésitez pas à faire des recherches supplémentaires</li>
                <li>Les abréviations sont acceptées (ex: "xss" pour "Cross-Site Scripting")</li>
                <li>Refaites les quiz pour améliorer votre score</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizSelection;