import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [userProgress, setUserProgress] = useState(null);
  const [modules, setModules] = useState({});

  // Mapping des modules pour les traductions
  const moduleTranslations = {
    network_basics: {
      title: t('networkBasics'),
      description: t('networkBasicsDesc')
    },
    web_security: {
      title: t('webSecurity'),
      description: t('webSecurityDesc')
    },
    cryptography: {
      title: t('cryptography'),
      description: t('cryptographyDesc')
    },
    incident_response: {
      title: t('incidentResponse'),
      description: t('incidentResponseDesc')
    },
    ethical_hacking: {
      title: t('ethicalHacking'),
      description: t('ethicalHackingDesc')
    }
  };

  useEffect(() => {
    fetchUserProgress();
    fetchModules();
    
    // SYNCHRONISATION GLOBALE AUTOMATIQUE - Met à jour dès qu'il y a un gain d'XP
    const handleGlobalSync = (event) => {
      if (event.detail) {
        // Données depuis l'événement custom
        const levelData = event.detail;
        const currentLevelXp = levelData.currentLevelXp || 0;
        const xpNeeded = levelData.xpToNextLevel || 100;
        const totalXpForLevel = currentLevelXp + xpNeeded; // Total XP nécessaire pour ce niveau
        const progressPercent = totalXpForLevel > 0 ? Math.floor((currentLevelXp / totalXpForLevel) * 100) : 0;
        
        setUserProgress({
          current_level: levelData.level || 1,
          xp_current: currentLevelXp,
          xp_needed: xpNeeded,
          progress_percent: progressPercent,
          streak: levelData.streak || 0,
          badges: levelData.badges || []
        });
        console.log('🔄 Home synchronized with level:', levelData.level, 'Progress:', progressPercent + '%');
      } else {
        // Relire depuis localStorage
        fetchUserProgress();
      }
    };

    // Écouter aussi BroadcastChannel pour synchronisation cross-tab
    const handleBroadcast = (event) => {
      const levelData = event.data;
      const currentLevelXp = levelData.currentLevelXp || 0;
      const xpNeeded = levelData.xpToNextLevel || 100;
      const totalXpForLevel = currentLevelXp + xpNeeded;
      const progressPercent = totalXpForLevel > 0 ? Math.floor((currentLevelXp / totalXpForLevel) * 100) : 0;
      
      setUserProgress({
        current_level: levelData.level || 1,
        xp_current: currentLevelXp,
        xp_needed: xpNeeded,
        progress_percent: progressPercent,
        streak: levelData.streak || 0,
        badges: levelData.badges || []
      });
      console.log('📡 Home synchronized via broadcast:', levelData.level, 'Progress:', progressPercent + '%');
    };

    const broadcastChannel = new BroadcastChannel('levelSync');
    broadcastChannel.onmessage = handleBroadcast;

    // Écouter TOUS les types d'événements de synchronisation
    window.addEventListener('globalLevelSync', handleGlobalSync);
    window.addEventListener('storage', handleGlobalSync);
    window.addEventListener('focus', fetchUserProgress);
    
    // Vérification périodique pour s'assurer de la synchronisation
    const syncInterval = setInterval(() => {
      fetchUserProgress();
    }, 2000);
    
    return () => {
      window.removeEventListener('globalLevelSync', handleGlobalSync);
      window.removeEventListener('storage', handleGlobalSync);
      window.removeEventListener('focus', fetchUserProgress);
      clearInterval(syncInterval);
      broadcastChannel.close();
    };
  }, []);

  const fetchUserProgress = async () => {
    try {
      // D'abord, essayer de récupérer les données locales du système de quiz
      const localUserData = JSON.parse(localStorage.getItem('userExperience') || '{}');
      if (localUserData.level) {
        // Utiliser les données locales du système de quiz
        const currentLevelXp = localUserData.currentLevelXp || 0;
        const xpNeeded = localUserData.xpToNextLevel || 100;
        const totalXpForLevel = currentLevelXp + xpNeeded;
        const progressPercent = totalXpForLevel > 0 ? Math.floor((currentLevelXp / totalXpForLevel) * 100) : 0;
        
        setUserProgress({
          current_level: localUserData.level,
          xp_current: currentLevelXp,
          xp_needed: xpNeeded,
          progress_percent: progressPercent,
          streak: localUserData.streak || 0,
          badges: localUserData.badges || []
        });
        console.log('📊 [HOME] Progress bar:', progressPercent + '%', 'XP:', currentLevelXp, '/', totalXpForLevel);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        // Données par défaut pour utilisateur non connecté
        setUserProgress({
          current_level: 1,
          xp_current: 0,
          xp_needed: 100,
          progress_percent: 0,
          streak: 0,
          badges: []
        });
        return;
      }

      const response = await fetch("http://localhost:5000/api/user/progress", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProgress(data);
      } else {
        // Données par défaut
        setUserProgress({
          current_level: 1,
          xp_current: 0,
          xp_needed: 100,
          progress_percent: 0,
          streak: 0,
          badges: []
        });
      }
    } catch (error) {
      console.error("Failed to fetch user progress:", error);
      // Données par défaut en cas d'erreur
      setUserProgress({
        current_level: 1,
        xp_current: 0,
        xp_needed: 100,
        progress_percent: 0,
        streak: 0,
        badges: []
      });
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/modules");
      const data = await response.json();
      
      // Récupérer les données de progression utilisateur
      const userData = JSON.parse(localStorage.getItem('userProgress') || '{}');
      const completedQuizzes = userData.completedQuizzes || [];
      
      // 🔐 Vérifier si l'utilisateur est admin (depuis la base de données via API)
      const token = localStorage.getItem('auth_token');
      let isAdmin = false;
      
      if (token) {
        try {
          const userResponse = await fetch('http://localhost:5000/api/user/data', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            isAdmin = userData.is_admin || false;
            console.log('🔑 [HOME] Utilisateur admin:', isAdmin);
          }
        } catch (err) {
          console.error('Erreur vérification admin:', err);
        }
      }
      
      // Définir la carte des prérequis
      const prerequisiteMap = {
        'cryptography': 'web_security',
        'ethical_hacking': 'cryptography',
        'incident_response': 'ethical_hacking'
      };
      
      // Transformer les données pour correspondre au format attendu
      const modulesWithDefaults = {};
      data.modules.forEach(module => {
        // Vérifier si le module est déverrouillé
        const isCompleted = completedQuizzes.some(quiz => quiz.id === module.id);
        let isUnlocked = module.id === 'web_security'; // Premier module toujours déverrouillé
        
        // 🔓 SI ADMIN : Déverrouiller TOUS les modules
        if (isAdmin) {
          isUnlocked = true;
        } else {
          // 🔒 Utilisateurs normaux : Vérifier les prérequis
          if (module.id !== 'web_security') {
            const prerequisite = prerequisiteMap[module.id];
            if (prerequisite) {
              isUnlocked = completedQuizzes.some(quiz => quiz.id === prerequisite);
            }
          }
        }
        
        modulesWithDefaults[module.id] = {
          ...module,
          unlocked: isUnlocked,
          completed: isCompleted,
          level_requirement: module.id === 'web_security' ? 1 : 
                           module.id === 'cryptography' ? 2 :
                           module.id === 'ethical_hacking' ? 3 : 4,
          xp_reward: module.id === 'web_security' ? 100 : 
                    module.id === 'cryptography' ? 150 :
                    module.id === 'ethical_hacking' ? 200 : 180,
          badge: null,
          reason: isUnlocked ? null : `Terminez le module précédent pour débloquer`,
          prerequisite: prerequisiteMap[module.id] || null
        };
      });
      
      setModules(modulesWithDefaults);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
      // Fallback avec des données par défaut si l'API échoue
      const userData = JSON.parse(localStorage.getItem('userProgress') || '{}');
      
      // 🔐 Vérifier si l'utilisateur est admin
      const token = localStorage.getItem('auth_token');
      let isAdmin = false;
      
      if (token) {
        try {
          const userResponse = await fetch('http://localhost:5000/api/user/data', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (userResponse.ok) {
            const userDataFromAPI = await userResponse.json();
            isAdmin = userDataFromAPI.is_admin || false;
          }
        } catch (err) {
          console.error('Erreur vérification admin:', err);
        }
      }
      
      setModules({
        web_security: {
          id: "web_security",
          title: moduleTranslations.web_security?.title || "Sécurité Web",
          description: moduleTranslations.web_security?.description || "Apprenez les bases de la sécurité web et les vulnérabilités communes",
          icon: "🌐",
          difficulty: t('beginner'),
          duration: `45 ${t('minutes')}`,
          unlocked: true,
          completed: false,
          level_requirement: 1,
          xp_reward: 100
        },
        cryptography: {
          id: "cryptography", 
          title: moduleTranslations.cryptography?.title || "Cryptographie",
          description: moduleTranslations.cryptography?.description || "Maîtrisez les concepts fondamentaux de la cryptographie moderne",
          icon: "🔐",
          difficulty: t('intermediate'),
          duration: `60 ${t('minutes')}`,
          unlocked: isAdmin ? true : false,
          completed: false,
          level_requirement: 2,
          xp_reward: 150,
          prerequisite: "web_security"
        },
        ethical_hacking: {
          id: "ethical_hacking",
          title: moduleTranslations.ethical_hacking?.title || "Hacking Éthique", 
          description: moduleTranslations.ethical_hacking?.description || "Apprenez les techniques de pentesting",
          icon: "🎯",
          difficulty: t('advanced'),
          duration: `75 ${t('minutes')}`,
          unlocked: isAdmin ? true : false,
          completed: false,
          level_requirement: 3,
          xp_reward: 200,
          prerequisite: "cryptography"
        },
        incident_response: {
          id: "incident_response",
          title: moduleTranslations.incident_response?.title || "Réponse aux Incidents",
          description: moduleTranslations.incident_response?.description || "Gérez efficacement les incidents",
          icon: "🚨", 
          difficulty: t('advanced'),
          duration: `50 ${t('minutes')}`,
          unlocked: isAdmin ? true : false,
          completed: false,
          level_requirement: 4,
          xp_reward: 180,
          prerequisite: "ethical_hacking"
        }
      });
    }
  };

  return (
    <div className="home-page">
      {/* Particules animées de fond */}
      <div className="animated-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      <NavBar />

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>
            {t('welcomeTitle').split('CyberForge')[0]}<span className="cyber-text">CyberForge</span>
          </h1>
          <p className="hero-subtitle">
            {t('welcomeSubtitle')}
          </p>
          <div className="hero-stats">
            {userProgress && (
              <>
                <div className="stat-item">
                  <span className="stat-value">{userProgress.current_level}</span>
                  <span className="stat-label">{t('level')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userProgress.xp_current}</span>
                  <span className="stat-label">{t('xp')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userProgress.streak}</span>
                  <span className="stat-label">{t('streak')}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="cyber-globe">🌐</div>
          <div className="floating-icons">
            <span className="float-icon">🔒</span>
            <span className="float-icon">🛡️</span>
            <span className="float-icon">🔐</span>
            <span className="float-icon">🕵️</span>
          </div>
        </div>
      </header>


      {/* Progress Bar for logged users */}
      {userProgress && (
        <section className="progress-section">
          <h3>{t('levelProgress', { level: userProgress.current_level })}</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${userProgress.progress_percent}%` }}
            ></div>
          </div>
          <p>{t('xpToNextLevel', { xp: userProgress.xp_needed })}</p>
        </section>
      )}

      {/* Learning Modules */}
      <section className="modules-section">
        <h2 className={`modules-title ${language === 'en' ? 'modules-title-light' : ''}`}>
          {t('cyberSecurityModules')}
        </h2>
        <div className="modules-grid">
          {Object.entries(modules).map(([moduleId, module]) => {
            const translation = moduleTranslations[moduleId] || { title: module.title, description: module.description };
            return (
              <div 
                key={moduleId}
                className={`module-card ${!module.unlocked ? 'locked' : ''} ${module.completed ? 'completed' : ''}`}
              >
                <div className="module-header">
                  <span className="module-icon">{module.icon}</span>
                  <h3>{module.title}</h3>
                  {!module.unlocked && <span className="lock-icon">🔒</span>}
                  {module.completed && <span className="check-icon">✅</span>}
                </div>
                <p>{module.description}</p>
                <div className="module-meta">
                  <span className="difficulty">{module.difficulty}</span>
                  <span className="duration">{module.duration}</span>
                </div>
                
                {/* Message de déverrouillage */}
                {!module.unlocked && module.reason && (
                  <div className="unlock-requirement">
                    <span className="requirement-icon">🔒</span>
                    <span className="requirement-text">
                      {module.reason}
                    </span>
                  </div>
                )}
                
                <div className="module-info-row">
                  <span className="course-indicator">{t('courseQuiz')}</span>
                </div>
                <div className="module-footer">
                  <span className="level-req">{t('level')} {module.level_requirement}+</span>
                  <span className="xp-reward">+{module.xp_reward} {t('xp')}</span>
                </div>
              {module.badge && (
                <div className="badge-preview">{module.badge}</div>
              )}
              
              {/* Menu de choix au survol */}
              {module.unlocked && (
                <div className="module-options">
                  <button 
                    className="option-btn course-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/course/${moduleId}`);
                    }}
                  >
                    <span className="option-icon">📚</span>
                    <span className="option-text">Cours</span>
                  </button>
                  <button 
                    className="option-btn quiz-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/challenge/${moduleId}`);
                    }}
                  >
                    <span className="option-icon">🎯</span>
                    <span className="option-text">Quiz</span>
                  </button>
                </div>
              )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Actions Rapides */}
      <section className="quick-actions">
        <div className="action-card" onClick={() => navigate("/leaderboard")}>
          <h3>{t('quickActionsLeaderboard')}</h3>
          <p>{t('leaderboardDesc')}</p>
        </div>

        <div className="action-card disabled">
          <h3>{t('cyberLabs')}</h3>
          <p>{t('cyberLabsDesc')}</p>
        </div>

        <div className="action-card disabled">
          <h3>{t('advancedChallenges')}</h3>
          <p>{t('advancedChallengesDesc')}</p>
        </div>
      </section>

      {/* Badges Section */}
      {userProgress && userProgress.badges.length > 0 && (
        <section className="badges-section">
          <h2>{t('achievements')}</h2>
          <div className="badges-container">
            {userProgress.badges.map((badge, index) => (
              <div key={index} className="badge-item">
                {badge}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
