import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { levelSync } from "../utils/levelSync";
import { syncProgressWithBackend } from "../utils/experienceSystem";
import "./NavBar.css";

function NavBar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true; // Mode sombre par défaut si aucune préférence
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  
  // State for user level and XP - synchronized across all pages
  const [userLevel, setUserLevel] = useState(() => {
    const userData = JSON.parse(localStorage.getItem('userExperience') || '{}');
    return {
      level: userData.level || 1,
      currentLevelXp: userData.currentLevelXp || 0,
      xpToNextLevel: userData.xpToNextLevel || 100,
      totalXp: userData.totalXp || 0
    };
  });

  // Theme management
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

  const isActiveLink = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const closeUserMenu = () => {
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const handleSyncProgress = async () => {
    console.log('🔄 [MANUEL] Synchronisation manuelle démarrée...');
    const success = await syncProgressWithBackend();
    if (success) {
      alert('✅ Synchronisation réussie ! Votre progression a été sauvegardée.');
    } else {
      alert('❌ Erreur lors de la synchronisation. Vérifiez votre connexion.');
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Synchronize level across all pages
  useEffect(() => {
    const updateLevel = (data) => {
      setUserLevel({
        level: data.level || 1,
        currentLevelXp: data.currentLevelXp || 0,
        xpToNextLevel: data.xpToNextLevel || 100,
        totalXp: data.totalXp || 0
      });
    };

    // Listen to level updates
    levelSync.addListener(updateLevel);
    
    // Also listen to custom event
    const handleLevelUpdate = (e) => updateLevel(e.detail);
    window.addEventListener('levelUpdate', handleLevelUpdate);

    // Load initial data
    const initialData = levelSync.getCurrentData();
    if (Object.keys(initialData).length > 0) {
      updateLevel(initialData);
    }

    return () => {
      levelSync.removeListener(updateLevel);
      window.removeEventListener('levelUpdate', handleLevelUpdate);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={closeMobileMenu}>
        <div className="logo-icon">🛡️</div>
        <div className="logo-text">
          <span className="cyber">Cyber</span>
          <span className="forge">Forge</span>
        </div>
      </Link>

      {/* Menu burger pour mobile */}
      <button 
        className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-content ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={isActiveLink("/")}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">{t('home')}</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/quizzes" 
              className={isActiveLink("/quizzes")}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">🎯</span>
              <span className="nav-text">Quiz</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/leaderboard" 
              className={isActiveLink("/leaderboard")}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">🏆</span>
              <span className="nav-text">{t('leaderboard')}</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/cybergame" 
              className={isActiveLink("/cybergame")}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">🎮</span>
              <span className="nav-text">CyberGame</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/ctf-lab" 
              className={isActiveLink("/ctf-lab")}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">🎯</span>
              <span className="nav-text">CTF Lab</span>
            </Link>
          </li>
        </ul>

        <div className="nav-actions">
          {/* Boutons d'authentification ou menu utilisateur */}
          {isAuthenticated() ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-btn" 
                onClick={toggleUserMenu}
                aria-label="Menu utilisateur"
              >
                <span className="user-avatar-small">
                  {user?.username?.charAt(0)?.toUpperCase() || '👤'}
                </span>
                <span className="user-name-small">{user?.username}</span>
                <span className={`dropdown-arrow ${userMenuOpen ? 'open' : ''}`}>▼</span>
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-details">
                      <span className="username">{user?.username}</span>
                      <span className="user-email">{user?.email}</span>
                      <div className="user-level-info">
                        <span className="level-badge">⭐ Level {userLevel.level}</span>
                        <div className="xp-mini-bar">
                          <div 
                            className="xp-mini-fill" 
                            style={{width: `${(userLevel.currentLevelXp / userLevel.xpToNextLevel) * 100}%`}}
                          ></div>
                        </div>
                        <span className="xp-text">{userLevel.currentLevelXp} / {userLevel.xpToNextLevel} XP</span>
                      </div>
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
                  {user?.is_admin && (
                    <>
                      <Link 
                        to="/admin" 
                        className="admin-link"
                        onClick={closeUserMenu}
                      >
                        <span className="admin-icon">🔧</span>
                        <span className="admin-text">Administration</span>
                      </Link>
                      <hr className="dropdown-divider" />
                    </>
                  )}
                  <button 
                    className="logout-btn" 
                    onClick={handleSyncProgress}
                    aria-label="Synchroniser la progression"
                    style={{backgroundColor: '#4CAF50', marginBottom: '8px'}}
                  >
                    <span className="logout-icon">🔄</span>
                    <span className="logout-text">Synchroniser</span>
                  </button>
                  <button 
                    className="logout-btn" 
                    onClick={handleLogout}
                    aria-label="Se déconnecter"
                  >
                    <span className="logout-icon">🚪</span>
                    <span className="logout-text">Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link login-link">
                <span className="auth-icon">🚪</span>
                <span className="auth-text">{t('signIn')}</span>
              </Link>
              <Link to="/register" className="auth-link register-link">
                <span className="auth-icon">👤</span>
                <span className="auth-text">{t('createAccount')}</span>
              </Link>
            </div>
          )}
          
          {/* Sélecteur de langue */}
          <button 
            className="language-toggle-btn"
            onClick={toggleLanguage}
            aria-label={`Switch to ${language === 'fr' ? 'English' : 'Français'}`}
          >
            <div className="language-display">
              <span className="language-flag">
                {language === 'fr' ? '🇫🇷' : '🇺🇸'}
              </span>
              <span className="language-text">
                {language === 'fr' ? 'FR' : 'EN'}
              </span>
            </div>
          </button>
          
          <button 
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? (language === 'fr' ? "Mode clair" : "Light mode") : (language === 'fr' ? "Mode sombre" : "Dark mode")}
          >
            <div className={`toggle-slider ${darkMode ? 'dark' : 'light'}`}>
              <div className="toggle-circle">
                {darkMode ? "🌙" : "☀️"}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Overlay pour fermer le menu mobile */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
}

export default NavBar;
