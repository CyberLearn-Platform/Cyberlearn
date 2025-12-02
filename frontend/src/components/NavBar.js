import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
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
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
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
