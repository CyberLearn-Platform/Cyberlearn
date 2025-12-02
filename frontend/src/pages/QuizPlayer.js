import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/Quiz.css";

function QuizPlayer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef();

  useEffect(() => {
    fetchQuiz();
  }, [moduleId]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/quest/${moduleId}`);
      
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        setQuestions(data.questions || []);
      } else {
        console.error("Erreur lors du chargement du quiz");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeAnswer = (answer) => {
    return answer
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const checkAnswer = (userAnswer, correctAnswer) => {
    const userNormalized = normalizeAnswer(userAnswer);
    const acceptedAnswers = correctAnswer.toLowerCase().split("|");
    
    return acceptedAnswers.some(answer => {
      const normalized = normalizeAnswer(answer);
      return userNormalized === normalized || 
             (userNormalized.length >= 3 && normalized.includes(userNormalized));
    });
  };

  const handleSubmit = () => {
    const question = questions[currentQuestion];
    const correct = checkAnswer(userAnswer, question.answer);
    
    setIsCorrect(correct);
    setShowExplanation(true);
    
    const newAnswer = {
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: question.answer.split("|")[0],
      isCorrect: correct,
      explanation: question.explanation
    };
    
    setAnswers([...answers, newAnswer]);
    
    if (correct) {
      setScore(score + 1);
    }
  };


  const nextQuestion = () => {
    setShowExplanation(false);
    setUserAnswer("");
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswer("");
    setScore(0);
    setAnswers([]);
    setShowResult(false);
    setShowExplanation(false);
  };

  const goToModule = () => {
    navigate(`/course/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <NavBar />
        <div className="quiz-loading">Chargement du quiz...</div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="quiz-page">
        <NavBar />
        <div className="quiz-error">
          <h2>Quiz non trouvé</h2>
          <button onClick={() => navigate("/quizzes")} className="back-btn">
            Retour aux quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="quiz-page">
        <NavBar />
        <div className="quiz-results">
          <div className="results-card">
            <div className="results-header">
              <span className="quiz-icon">{quiz.icon}</span>
              <h2>Quiz terminé !</h2>
            </div>
            
            <div className="score-display">
              <div className="score-circle">
                <span className="score-number">{percentage}%</span>
                <span className="score-text">{score}/{questions.length}</span>
              </div>
            </div>
            
            <div className="score-message">
              {percentage >= 80 ? "🎉 Excellent travail !" :
               percentage >= 60 ? "👍 Bon travail !" :
               "💪 Continuez vos efforts !"}
            </div>
            
            <div className="answers-review">
              <h3>Résumé des réponses</h3>
              {answers.map((answer, index) => (
                <div key={index} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="answer-question">{answer.question}</div>
                  <div className="answer-details">
                    <span className="user-answer">Votre réponse: {answer.userAnswer || "Aucune réponse"}</span>
                    {!answer.isCorrect && (
                      <span className="correct-answer">Réponse: {answer.correctAnswer}</span>
                    )}
                  </div>
                  {answer.explanation && (
                    <div className="answer-explanation">{answer.explanation}</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="results-actions">
              <button onClick={restartQuiz} className="retry-btn">
                Recommencer
              </button>
              <button onClick={goToModule} className="course-btn">
                Voir le cours
              </button>
              <button onClick={() => navigate("/quizzes")} className="back-btn">
                Autres quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz-page">
      <NavBar />
      
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="quiz-info">
            <span className="quiz-icon">{quiz.icon}</span>
            <h1>{quiz.title}</h1>
          </div>
          
          <div className="quiz-progress">
            <span className="progress-text">
              Question {currentQuestion + 1} sur {questions.length}
            </span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="question-card">
          <div className="question-content">
            <h2>Q{currentQuestion + 1}. {question.question}</h2>
            
            <div className="answer-input">
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && userAnswer.trim() && !showExplanation) {
                    handleSubmit();
                  }
                }}
                placeholder="Tapez votre réponse ici..."
                disabled={showExplanation}
                className={showExplanation ? (isCorrect ? 'correct' : 'incorrect') : ''}
              />
            </div>
            
            {/* Action buttons */}
            <div className="action-buttons">
              {!showExplanation ? (
                <button 
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="submit-btn"
                >
                  Valider
                </button>
              ) : (
                <button 
                  onClick={nextQuestion}
                  className="next-btn"
                >
                  {currentQuestion < questions.length - 1 ? "Suivant" : "Voir résultats"}
                </button>
              )}
            </div>

            {showExplanation && (
              <div className={`result-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="feedback-header">
                  {isCorrect ? "✅ Bonne réponse !" : "❌ Mauvaise réponse"}
                </div>
                {!isCorrect && (
                  <div className="correct-answer">
                    Réponse attendue: {question.answer.split("|")[0]}
                  </div>
                )}
                <div className="explanation">
                  <strong>Explication:</strong> {question.explanation}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="quiz-footer">
          <div className="score-display">
            Score: {score}/{currentQuestion + (showExplanation ? 1 : 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPlayer;