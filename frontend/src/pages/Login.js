import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { login: loginUser } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check for success message from registration/2FA setup
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      if (location.state?.username) {
        setFormData(prev => ({
          ...prev,
          username: location.state.username
        }));
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Nom d\'utilisateur requis');
      return false;
    }

    if (!formData.password) {
      setError('Mot de passe requis');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful - authentification simple
        loginUser(data.user, data.token);
        setSuccess('Connexion réussie ! Redirection...');
        
        // Sauvegarder le nom d'utilisateur
        localStorage.setItem('username', formData.username);
        
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setError(data.error || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🛡️</span>
            <h1>CyberForge</h1>
          </div>
          <h2>Se connecter</h2>
          <p>Accédez à votre espace d'apprentissage cybersécurité</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${error && !formData.username ? 'error' : ''}`}
              placeholder="Votre nom d'utilisateur"
              disabled={loading}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${error && !formData.password ? 'error' : ''}`}
              placeholder="Votre mot de passe"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="message-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="success-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="message-icon">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
              {success}
            </div>
          )}

          <div className="auth-actions">
            <button 
              type="submit" 
              className="auth-btn primary full-width"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Connexion...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10,17 15,12 10,7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  Se connecter
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={() => navigate("/")}
              className="auth-btn secondary full-width"
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12,19 5,12 12,5"></polyline>
              </svg>
              Retour à l'accueil
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Vous n'avez pas de compte ?{' '}
            <button 
              onClick={() => navigate("/register")}
              className="auth-link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;