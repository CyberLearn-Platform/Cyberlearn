import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import XPGainAnimation from "../components/XPGainAnimation";
import XPProgressBar from "../components/XPProgressBar";
import { EXPERIENCE_SYSTEM, useUserExperience } from "../utils/experienceSystem";
import { levelSync } from '../utils/levelSync';
import "./NewQuiz.css";

function NewQuizPlayer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [answerMode, setAnswerMode] = useState("multiple"); // "multiple" ou "text"
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [xpGained, setXpGained] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakMessage, setStreakMessage] = useState("");
  const [totalXpGained, setTotalXpGained] = useState(0);
  const [totalWrongAnswers, setTotalWrongAnswers] = useState(0);
  const [showXpBarAnimation, setShowXpBarAnimation] = useState(false);
  const [previousXp, setPreviousXp] = useState(0);
  const inputRef = useRef();
  const { getUserData, markQuizCompleted, updateUserXp } = useUserExperience();

  useEffect(() => {
    fetchQuiz();
    // Initialiser les données utilisateur actuelles depuis levelSync
    const userData = levelSync.getCurrentData();
    setCurrentUserData(userData);
    setPreviousXp(userData.totalXp || 0);
  }, [moduleId]);

  useEffect(() => {
    if (inputRef.current && answerMode === "text") {
      inputRef.current.focus();
    }
  }, [currentQuestion, answerMode]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000/api/quest/${moduleId}`);
      
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        const enhancedQuestions = data.questions.map(q => createQuestionOptions(q));
        setQuestions(enhancedQuestions);
        
        // Définir le mode de réponse selon le type de la première question
        if (enhancedQuestions.length > 0) {
          setAnswerMode(enhancedQuestions[0].hasMultipleChoice ? "multiple" : "text");
        }
      } else {
        console.error("Erreur lors du chargement du quiz");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const createQuestionOptions = (question) => {
    // Si la question a des choix multiples définis OU si elle a un type multiple_choice
    // OU si le type n'est pas défini (anciens quiz = QCM par défaut)
    const isMultipleChoice = (question.choices && question.choices.length > 0) || 
                             question.type === 'multiple_choice' ||
                             !question.type; // Par défaut, si pas de type = QCM
    
    // Exception : si le type est explicitement "text", c'est une question texte
    if (question.type === 'text') {
      return {
        ...question,
        hasMultipleChoice: false
      };
    }
    
    if (isMultipleChoice) {
      // Utiliser les choices fournis s'ils existent, sinon générer
      let allOptions;
      if (question.choices && question.choices.length > 0) {
        allOptions = [...question.choices].sort(() => Math.random() - 0.5);
      } else {
        const correctAnswers = question.answer.toLowerCase().split("|");
        const mainAnswer = correctAnswers[0];
        const wrongAnswers = generateWrongAnswers(question.question, mainAnswer);
        allOptions = [mainAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      }
      
      const correctAnswer = question.answer.toLowerCase();
      const correctIndex = allOptions.findIndex(opt => 
        opt.toLowerCase() === correctAnswer
      );
      
      return {
        ...question,
        options: allOptions,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        hasMultipleChoice: true
      };
    } else {
      // Question de type texte libre
      return {
        ...question,
        hasMultipleChoice: false
      };
    }
  };

  const generateWrongAnswers = (question, correctAnswer) => {
    const questionLower = question.toLowerCase();
    const correctLower = correctAnswer.toLowerCase();
    
    // Banque étendue de fausses réponses contextuelles
    const contextBank = {
      // Sécurité Web
      'xss': ['CSRF Attack', 'SQL Injection', 'Session Hijacking', 'Buffer Overflow'],
      'cross site scripting': ['Cross-Site Request Forgery', 'Server-Side Scripting', 'Client-Side Request'],
      'sql': ['XSS Attack', 'NoSQL Injection', 'LDAP Injection', 'Command Injection'],
      'injection sql': ['Requêtes dynamiques', 'Validation côté client', 'Encodage des entrées'],
      'requetes preparees': ['Requêtes dynamiques', 'Stored procedures', 'Validation input'],
      'csrf': ['XSS', 'SQL Injection', 'Session Fixation', 'Clickjacking'],
      'cross site request': ['Cross-Origin Request', 'Server Request Forgery', 'Client Request Attack'],
      'header': ['Meta tags', 'Cookie attributes', 'Session tokens', 'CORS policy'],
      'csp': ['CORS', 'CSP-Report', 'X-Frame-Options', 'Cookie Policy'],
      'content security': ['Content Protection', 'Security Headers', 'CORS Policy'],
      
      // OWASP & Standards
      'owasp': ['NIST', 'ISO 27001', 'SANS Institute', 'CIS Controls'],
      'top 10': ['Top 5', 'Top 20', 'Top 25'],
      'waf': ['IDS', 'IPS', 'Firewall réseau', 'Proxy inverse'],
      'web application firewall': ['Network Firewall', 'Application Gateway', 'Load Balancer'],
      
      // Protocoles
      'https': ['HTTP/2', 'FTPS', 'SSH', 'SFTP'],
      'http secure': ['Secure HTTP', 'HTTP Protocol', 'Transfer Protocol Secure'],
      'ssl': ['TLS', 'SSH', 'IPSec', 'VPN'],
      'tls': ['SSL', 'DTLS', 'SSH', 'IPSec'],
      'secure socket': ['Transport Layer', 'Session Layer', 'Network Security'],
      
      // Cryptographie
      'aes': ['DES', 'RSA', '3DES', 'Blowfish'],
      'advanced encryption': ['Enhanced Encryption', 'Symmetric Algorithm', 'Block Cipher'],
      'rsa': ['DSA', 'ECC', 'AES', 'DES'],
      'rivest shamir': ['Diffie-Hellman', 'ElGamal', 'Elliptic Curve'],
      'hash': ['Encryption', 'Encoding', 'Compression', 'Signature'],
      'hachage': ['Chiffrement', 'Encodage', 'Signature numérique'],
      'chiffrement': ['Hachage', 'Encodage', 'Compression'],
      'sha': ['MD5', 'SHA-1', 'RIPEMD', 'Whirlpool'],
      'sha-256': ['SHA-1', 'MD5', 'SHA-512', 'SHA-128'],
      'pki': ['PKC', 'KMS', 'CA', 'HSM'],
      'public key': ['Private Key', 'Symmetric Key', 'Session Key'],
      'salt': ['Pepper', 'IV', 'Nonce', 'Hash'],
      'ecc': ['RSA', 'DSA', 'ElGamal', 'Diffie-Hellman'],
      'elliptic': ['Parabolic Curve', 'Hyperbolic System', 'Linear Algorithm'],
      'pfs': ['Forward Secrecy', 'Backward Secrecy', 'Session Persistence'],
      'perfect forward': ['Complete Secrecy', 'Forward Encryption', 'Session Security'],
      
      // Hacking Éthique  
      'osint': ['SIGINT', 'HUMINT', 'TECHINT', 'IMINT'],
      'open source intelligence': ['Closed Intelligence', 'Internal Data', 'Private Information'],
      'nmap': ['Wireshark', 'Metasploit', 'Burp Suite', 'Nessus'],
      '-ss': ['-sT', '-sU', '-sA', '-sF'],
      'scan furtif': ['Scan complet', 'Scan UDP', 'Scan ping'],
      'boite noire': ['Boîte blanche', 'Boîte grise', 'Test interne'],
      'black box': ['White box', 'Gray box', 'Clear box'],
      'pentest': ['Audit', 'Scan vulnérabilités', 'Revue de code'],
      'contrat': ['Périmètre', 'Budget', 'Planning'],
      'perimetre': ['Contrat', 'Timeline', 'Budget'],
      'enumeration': ['Scanning', 'Exploitation', 'Reconnaissance'],
      'énumération': ['Scanning', 'Exploitation', 'Reconnaissance'],
      'cve': ['CVD', 'CVSS', 'CWE', 'NVD'],
      'common vulnerabilities': ['Critical Exploits', 'Security Flaws', 'Known Bugs'],
      'metasploit': ['Nmap', 'Burp Suite', 'Wireshark', 'Aircrack'],
      'rce': ['LFI', 'RFI', 'SQLi', 'XSS'],
      'remote code execution': ['Local Execution', 'Remote Access', 'Code Injection'],
      
      // Réponse aux Incidents
      'ioc': ['IOA', 'TTPs', 'SIEM', 'IDS'],
      'indicators of compromise': ['Attack Indicators', 'Security Events', 'Threat Signatures'],
      'nist': ['ISO', 'SANS', 'CIS', 'COBIT'],
      '4': ['3', '5', '6', '7'],
      'quatre': ['trois', 'cinq', 'six'],
      'phases': ['Étapes', 'Cycles', 'Niveaux'],
      'siem': ['SOAR', 'IDS', 'IPS', 'EDR'],
      'security information': ['Security Operations', 'Event Management', 'Log Analysis'],
      'chain of custody': ['Evidence chain', 'Audit trail', 'Documentation process'],
      'chaine de possession': ['Traçabilité', 'Audit trail', 'Documentation'],
      'preservation': ['Documentation', 'Investigation', 'Reporting'],
      'priorité': ['Analyse', 'Reporting', 'Communication'],
      'csirt': ['CERT', 'SOC', 'CIRT', 'ISAC'],
      'computer security incident': ['Security Operations', 'Incident Management', 'Threat Response'],
      'honeypot': ['IDS', 'Firewall', 'Sandbox', 'DMZ'],
      'pot de miel': ['Zone sécurisée', 'Pare-feu', 'IDS'],
      'dfir': ['SIEM', 'SOC', 'CERT', 'EDR'],
      'digital forensics': ['Cyber Forensics', 'Network Analysis', 'Security Investigation']
    };
    
    // Rechercher les meilleures correspondances
    let wrongAnswers = [];
    for (const [key, answers] of Object.entries(contextBank)) {
      if (questionLower.includes(key)) {
        wrongAnswers = [...wrongAnswers, ...answers];
        if (wrongAnswers.length >= 6) break; // Optimisation
      }
    }
    
    // Filtrer pour éviter les doublons et la bonne réponse
    wrongAnswers = [...new Set(wrongAnswers)].filter(ans => {
      const ansLower = ans.toLowerCase();
      return ansLower !== correctLower && 
             !correctLower.includes(ansLower) &&
             !ansLower.includes(correctLower);
    });
    
    // Si pas assez de réponses, ajouter des distracteurs génériques pertinents
    if (wrongAnswers.length < 3) {
      const fallbackAnswers = [
        'Protocole de sécurité',
        'Méthode de protection',
        'Outil de défense',
        'Standard de sécurité',
        'Technique d\'attaque'
      ];
      wrongAnswers = [...wrongAnswers, ...fallbackAnswers];
    }
    
    // Retourner exactement 3 fausses réponses
    return wrongAnswers.slice(0, 3);
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
    const answerToCheck = answerMode === "multiple" ? selectedAnswer : userAnswer;
    const correct = answerMode === "multiple" 
      ? selectedAnswer === question.options[question.correctIndex]
      : checkAnswer(answerToCheck, question.answer);
    
    setIsCorrect(correct);
    setShowExplanation(true);
    
    const newAnswer = {
      questionId: question.id,
      question: question.question,
      userAnswer: answerToCheck,
      correctAnswer: question.answer,
      isCorrect: correct,
      explanation: question.explanation,
      answerMode
    };
    
    setAnswers([...answers, newAnswer]);
    
    // Calculer l'XP avec le nouveau système
    const answerXp = EXPERIENCE_SYSTEM.calculateAnswerXp(correct, currentStreak);
    
    // Synchroniser avec levelSync pour que l'XP soit global
    const result = levelSync.updateExperience(answerXp.totalXp);
    
    if (correct) {
      setScore(score + 1);
      setCurrentStreak(answerXp.currentStreak);
      
      // Afficher message de série si applicable
      if (answerXp.streakMessage) {
        setStreakMessage(answerXp.streakMessage);
        setTimeout(() => setStreakMessage(""), 3000);
      }
    } else {
      setCurrentStreak(0);
      setTotalWrongAnswers(prev => prev + 1);
    }
    
    // Mettre à jour l'XP total gagné
    setTotalXpGained(prev => prev + answerXp.totalXp);
    setXpGained(answerXp.totalXp);
    setShowXpAnimation(true);
    
    // Déclencher l'animation de la barre XP
    const newUserData = levelSync.getCurrentData();
    setShowXpBarAnimation(true);
    setPreviousXp(currentUserData?.totalXp || 0);
    setCurrentUserData(newUserData);
    
    // Animation XP
    setTimeout(() => {
      setShowXpAnimation(false);
      setShowXpBarAnimation(false);
    }, 2000);
    
    // Vérifier si l'utilisateur a gagné un niveau
    if (result.leveledUp) {
      setLevelUp(true);
      setTimeout(() => {
        alert(`🎉 NIVEAU SUPÉRIEUR ! Vous êtes maintenant niveau ${result.level} ! 
        
🏆 ${EXPERIENCE_SYSTEM.getLevelTitle(result.level)}`);
        setLevelUp(false);
      }, 2500);
    }
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer("");
    setUserAnswer("");
    
    if (currentQuestion < questions.length - 1) {
      const nextQuestionIndex = currentQuestion + 1;
      setCurrentQuestion(nextQuestionIndex);
      // Définir le mode selon le type de la question suivante
      setAnswerMode(questions[nextQuestionIndex].hasMultipleChoice ? "multiple" : "text");
    } else {
      // Quiz terminé - calculer les récompenses XP avec le nouveau système
      const finalScore = score + (isCorrect ? 1 : 0);
      const finalWrongAnswers = questions.length - finalScore;
      
      // Ne plus donner d'XP ici car déjà donné à chaque réponse
      // Juste marquer comme complété pour les statistiques
      const userData = getUserData();
      const completedQuizData = {
        id: moduleId,
        score: finalScore,
        totalQuestions: questions.length,
        wrongAnswers: finalWrongAnswers,
        completedAt: new Date().toISOString(),
        xpEarned: totalXpGained
      };
      
      // Sauvegarder les statistiques du quiz
      const currentData = JSON.parse(localStorage.getItem('userProgress') || '{}');
      if (!currentData.completedQuizzes) currentData.completedQuizzes = [];
      currentData.completedQuizzes.push(completedQuizData);
      localStorage.setItem('userProgress', JSON.stringify(currentData));
      
      // Marquer le module comme terminé pour débloquer le suivant
      if (finalScore >= Math.ceil(questions.length * 0.6)) { // 60% minimum requis
        const userData = JSON.parse(localStorage.getItem('userProgress') || '{}');
        if (!userData.completedModules) userData.completedModules = [];
        if (!userData.completedModules.includes(moduleId)) {
          userData.completedModules.push(moduleId);
          localStorage.setItem('userProgress', JSON.stringify(userData));
        }
      }
      
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setUserAnswer("");
    setScore(0);
    setAnswers([]);
    setShowResult(false);
    setShowExplanation(false);
    setAnswerMode("multiple");
    setCurrentStreak(0);
    setStreakMessage("");
    setTotalXpGained(0);
    setTotalWrongAnswers(0);
    setShowXpBarAnimation(false);
    
    // Réinitialiser les données utilisateur
    const userData = getUserData();
    setCurrentUserData(userData);
    setPreviousXp(userData.totalXp);
  };

  const goToModule = () => {
    navigate(`/course/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="new-quiz-page">
        <NavBar />
        <div className="quiz-loading">
          <div className="loading-spinner"></div>
          <p>Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="new-quiz-page">
        <NavBar />
        <div className="quiz-error">
          <div className="error-icon">❌</div>
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
    const userData = levelSync.getCurrentData();
    const rewards = EXPERIENCE_SYSTEM.calculateQuizRewards(score, questions.length);
    
    return (
      <div className="new-quiz-page">
        <NavBar />
        <div className="quiz-results">
          <div className="results-card">
            <div className="results-header">
              <div className="quiz-completion-icon">🎉</div>
              <h2>Quiz terminé !</h2>
              <p className="quiz-title">{quiz.title}</p>
            </div>
            
            <div className="score-circle">
              <div className="circle-bg">
                <div className="circle-fill" style={{ strokeDasharray: `${percentage * 2.83} 283` }}></div>
              </div>
              <div className="score-content">
                <div className="percentage">{percentage}%</div>
                <div className="fraction">{score}/{questions.length}</div>
              </div>
            </div>
            
            <div className="performance-message">
              {percentage >= 80 ? "🏆 Excellent travail !" :
               percentage >= 60 ? "👍 Bon travail !" :
               percentage >= 40 ? "💪 Pas mal, continuez !" :
               "📚 Il faut encore étudier !"}
            </div>

            {/* Affichage des récompenses XP amélioré */}
            <div className="xp-rewards">
              <h3>🎁 Récompenses gagnées</h3>
              <div className="reward-breakdown">
                <div className="reward-item correct">
                  <span className="reward-label">✅ Bonnes réponses ({score})</span>
                  <span className="reward-value">+{score * EXPERIENCE_SYSTEM.XP_PER_CORRECT_ANSWER} XP</span>
                </div>
                {totalWrongAnswers > 0 && (
                  <div className="reward-item incorrect">
                    <span className="reward-label">❌ Mauvaises réponses ({totalWrongAnswers})</span>
                    <span className="reward-value">{totalWrongAnswers * EXPERIENCE_SYSTEM.XP_PER_WRONG_ANSWER} XP</span>
                  </div>
                )}
                <div className="reward-item base">
                  <span className="reward-label">📊 XP de base</span>
                  <span className="reward-value">{score * EXPERIENCE_SYSTEM.XP_PER_CORRECT_ANSWER + totalWrongAnswers * EXPERIENCE_SYSTEM.XP_PER_WRONG_ANSWER} XP</span>
                </div>
                {rewards.bonusXp > 0 && (
                  <div className="reward-item bonus">
                    <span className="reward-label">🏆 {rewards.reason}</span>
                    <span className="reward-value">+{rewards.bonusXp} XP</span>
                  </div>
                )}
                <div className="reward-total">
                  <span className="reward-label">💫 Total XP final</span>
                  <span className="reward-value total">+{rewards.totalXp} XP</span>
                </div>
              </div>
              
              {/* Statistiques détaillées */}
              <div className="quiz-stats">
                <div className="stat-item">
                  <span className="stat-icon">🎯</span>
                  <span className="stat-label">Précision</span>
                  <span className="stat-value">{percentage}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⚡</span>
                  <span className="stat-label">XP par question</span>
                  <span className="stat-value">{Math.round(rewards.totalXp / questions.length)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📈</span>
                  <span className="stat-label">Performance</span>
                  <span className="stat-value">
                    {percentage >= 90 ? "Exceptionnelle" :
                     percentage >= 80 ? "Excellente" :
                     percentage >= 70 ? "Très bonne" :
                     percentage >= 60 ? "Bonne" :
                     percentage >= 50 ? "Moyenne" : "À améliorer"}
                  </span>
                </div>
              </div>
              
              <div className="level-info">
                <div className="current-level">
                  <span className="level-badge">Niveau {userData.level}</span>
                  <span className="level-title">{EXPERIENCE_SYSTEM.getLevelTitle(userData.level)}</span>
                </div>
                {levelUp && (
                  <div className="level-up-animation">
                    🎉 NIVEAU SUPÉRIEUR ! 🎉
                  </div>
                )}
              </div>
            </div>
            
            <div className="detailed-results">
              <h3>📊 Résultats détaillés</h3>
              <div className="results-grid">
                {answers.map((answer, index) => (
                  <div key={index} className={`result-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="result-header">
                      <span className="result-icon">
                        {answer.isCorrect ? '✅' : '❌'}
                      </span>
                      <span className="question-number">Q{index + 1}</span>
                      <span className="answer-mode-badge">
                        {answer.answerMode === 'multiple' ? '🎯 QCM' : '✏️ Libre'}
                      </span>
                    </div>
                    <div className="question-text">{answer.question}</div>
                    <div className="answer-comparison">
                      <div className="user-answer">
                        <strong>Votre réponse:</strong> {answer.userAnswer || "Aucune réponse"}
                      </div>
                      {!answer.isCorrect && (
                        <div className="correct-answer">
                          <strong>Réponse correcte:</strong> {answer.correctAnswer.split('|')[0]}
                        </div>
                      )}
                    </div>
                    <div className="explanation">{answer.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="results-actions">
              <button onClick={restartQuiz} className="action-btn retry-btn">
                🔄 Recommencer
              </button>
              <button onClick={goToModule} className="action-btn course-btn">
                📚 Revoir le cours
              </button>
              <button onClick={() => navigate("/quizzes")} className="action-btn quiz-btn">
                🎯 Autres quiz
              </button>
              <button onClick={() => navigate("/")} className="action-btn home-btn">
                🏠 Accueil
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
    <div className="new-quiz-page">
      <NavBar />
      
      <div className="quiz-container">
        <header className="quiz-header">
          <div className="quiz-info">
            <span className="quiz-icon">{quiz.icon}</span>
            <div className="quiz-title-info">
              <h1>{quiz.title}</h1>
              <p>Mode: {answerMode === "multiple" ? "🎯 Choix multiple" : "✏️ Réponse libre"}</p>
            </div>
          </div>
          
          <div className="quiz-progress">
            <div className="progress-info">
              <span>Question {currentQuestion + 1} / {questions.length}</span>
              <span className="score-info">Score: {score}/{currentQuestion + (showExplanation ? 1 : 0)}</span>
              <span className="xp-info">💫 {totalXpGained} XP</span>
              {currentStreak > 0 && (
                <span className="streak-info">🔥 {currentStreak}</span>
              )}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            
            {/* Barre de progression XP synchronisée */}
            {currentUserData && (
              <XPProgressBar 
                currentXp={currentUserData.totalXp}
                showAnimation={showXpBarAnimation}
                xpGained={xpGained}
              />
            )}
          </div>
        </header>

        <main className="question-container">
          <div className="question-card">
            <div className="question-header">
              <span className="question-number">Question {currentQuestion + 1}</span>
              <span className="mode-indicator">
                {answerMode === "multiple" ? "🎯 Choisissez la bonne réponse" : "✏️ Tapez votre réponse"}
              </span>
            </div>
            
            <h2 className="question-text">{question.question}</h2>
            
            <div className="answer-section">
              {answerMode === "multiple" ? (
                <div className="multiple-choice">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                      disabled={showExplanation}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-answer">
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
                    className={`answer-input ${showExplanation ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                  />
                </div>
              )}
            </div>

            {showExplanation && (
              <div className={`explanation-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="explanation-header">
                  <span className="result-icon">
                    {isCorrect ? '🎉' : '💡'}
                  </span>
                  <span className="result-text">
                    {isCorrect ? "Excellente réponse !" : "Pas tout à fait..."}
                  </span>
                </div>
                {!isCorrect && answerMode === "text" && (
                  <div className="correct-answer-show">
                    <strong>Réponse attendue:</strong> {question.answer.split("|")[0]}
                  </div>
                )}
                <div className="explanation-content">
                  <strong>💡 Explication:</strong> {question.explanation}
                </div>
              </div>
            )}
          </div>

          <footer className="question-controls">
            {!showExplanation ? (
              <button 
                onClick={handleSubmit}
                disabled={answerMode === "multiple" ? !selectedAnswer : !userAnswer.trim()}
                className="control-btn submit-btn"
              >
                Valider la réponse
              </button>
            ) : (
              <button 
                onClick={nextQuestion}
                className="control-btn next-btn"
              >
                {currentQuestion < questions.length - 1 ? "Question suivante →" : "Voir les résultats 🏆"}
              </button>
            )}
          </footer>
        </main>

        {/* Animations et notifications */}
        {showXpAnimation && (
          <XPGainAnimation 
            show={showXpAnimation} 
            amount={xpGained}
            isPositive={xpGained > 0}
            onComplete={() => setShowXpAnimation(false)}
          />
        )}

        {streakMessage && (
          <div className="streak-notification">
            <div className="streak-content">
              {streakMessage}
            </div>
          </div>
        )}

        {levelUp && (
          <div className="level-up-overlay">
            <div className="level-up-animation">
              <div className="level-up-content">
                <h1>🎉 NIVEAU SUPÉRIEUR ! 🎉</h1>
                <p>Félicitations !</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewQuizPlayer;