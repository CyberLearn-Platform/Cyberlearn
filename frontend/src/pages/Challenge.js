import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import NavBar from "../components/NavBar";
import "./Challenge.css";

function Challenge() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [challenge, setChallenge] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);

  useEffect(() => {
    fetchChallenge();
  }, [moduleId]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/challenge/${moduleId}`, {
        headers: {
          'Accept-Language': language
        }
      });
      
      if (response.status === 403) {
        alert(t('courseLocked'));
        navigate("/");
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Vérifier si le module est complètement terminé
      if (data.module_completed) {
        console.log('Module terminé:', data.message);
        setLoading(false);
        return;
      }
      
      // Vérifier que les données sont valides
      if (!data || !data.question || !data.question.question || !data.question.options) {
        throw new Error('Invalid question data received');
      }
      
      setChallenge(data);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
    } catch (error) {
      console.error("Failed to fetch challenge:", error);
      // Reessayer une seule fois
      setTimeout(() => {
        if (loading) {
          fetchChallenge();
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null) {
      alert("Please select an answer!");
      return;
    }

    setAnswering(true);
    try {
      const response = await fetch("http://localhost:5000/api/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question_id: challenge.question.id,
          selected_answer: selectedAnswer,
          module_id: moduleId
        })
      });

      const data = await response.json();
      setResult(data);
      setShowResult(true);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setAnswering(false);
    }
  };

  const nextQuestion = () => {
    fetchChallenge();
  };

  if (loading) {
    return (
      <div className="challenge-page">
        <NavBar />
        <div className="loading-container">
          <div className="cyber-loader"></div>
          <p>{t('loadingCourse')}</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="challenge-page">
        <NavBar />
        <div className="error-container">
          <h2>🚫 {t('courseNotFound')}</h2>
          <button onClick={() => navigate("/")} className="btn-primary">
            {t('backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-page">
      <NavBar />
      
      <div className="challenge-container">
        {/* Module Header */}
        <div className="module-header">
          <button onClick={() => navigate("/")} className="back-btn">
            ← {t('backToDashboard')}
          </button>
          <div className="module-info">
            <h1>{challenge.module.title}</h1>
            <p>{challenge.module.description}</p>
            <div className="progress-indicator">
              <span>{t('progress')}: {challenge.completed}/{challenge.total_questions} {t('completed')}</span>
              <div className="module-progress-bar">
                <div 
                  className="module-progress-fill"
                  style={{ width: `${(challenge.completed / challenge.total_questions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-header">
            <span className={`difficulty-badge difficulty-${challenge.question.difficulty}`}>
              {t(challenge.question.difficulty)}
            </span>
            <span className="xp-badge">+{challenge.question.xp_value} {t('xp')}</span>
          </div>
          
          <h2 className="question-text">
            {challenge.question.question || 'Question non disponible'}
          </h2>
          
          <div className="options-container">
            {challenge.question.options?.map((optionText, index) => (
              <button
                key={index}
                className={`option-btn ${selectedAnswer === index ? 'selected' : ''} 
                           ${showResult ? (result.correct && selectedAnswer === index ? 'correct' : 
                                         !result.correct && selectedAnswer === index ? 'incorrect' : 
                                         index === result.correct_answer_index ? 'correct-answer' : '') : ''}`}
                onClick={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">
                  {optionText || `Option ${index + 1}`}
                </span>
              </button>
            ))}
          </div>

          {!showResult && (
            <button 
              className={`submit-btn ${selectedAnswer !== null ? 'active' : ''}`}
              onClick={submitAnswer}
              disabled={answering || selectedAnswer === null}
            >
              {answering ? t('submitting') : t('submitAnswer')}
            </button>
          )}
        </div>

        {/* Result Panel */}
        {showResult && result && (
          <div className={`result-panel ${result.correct ? 'success' : 'error'}`}>
            <div className="result-header">
              <h3>
                {result.correct ? (
                  <>🎉 {t('correct')}</>
                ) : (
                  <>❌ {t('incorrect')}</>
                )}
              </h3>
              {result.correct && (
                <div className="rewards">
                  <span className="xp-gained">+{result.xp_gained} XP</span>
                  {result.streak > 1 && (
                    <span className="streak">🔥 {result.streak} streak!</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="explanation">
              <h4>{t('explanation')}</h4>
              <p>{result.explanation}</p>
              {!result.correct && result.correct_answer_index !== undefined && (
                <p><strong>{t('correctAnswer')}</strong> {challenge.question.options[result.correct_answer_index]}</p>
              )}
            </div>

            {/* Special notifications */}
            {result.level_up && (
              <div className="level-up-notification">
                🌟 {t('levelUp', { level: result.new_level })}
              </div>
            )}

            {result.badge_earned && (
              <div className="badge-notification">
                🏅 {t('badgeEarned', { badge: result.badge_earned })}
              </div>
            )}

            {result.module_completed && (
              <div className="module-completed-notification">
                ✨ {t('moduleCompleted', { title: challenge.module.title })}
              </div>
            )}

            <button className="next-btn" onClick={nextQuestion}>
              {t('nextChallenge')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Challenge;