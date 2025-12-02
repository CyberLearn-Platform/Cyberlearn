import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login: loginUser } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Nom d\'utilisateur requis');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email requis');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Format d\'email invalide');
      return false;
    }

    if (!formData.password) {
      setError('Mot de passe requis');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
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
      const response = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('🎉 Compte créé avec succès ! Connexion automatique en cours...');
        
        // Connexion automatique avec les données reçues du serveur
        if (data.token && data.user) {
          loginUser(data.user, data.token);
          
          // Initialiser les données de progression utilisateur
          const initialUserData = {
            totalXp: 0,
            level: 1,
            completedQuizzes: [],
            completedLessons: [],
            completedModules: [],
            createdAt: new Date().toISOString(),
            username: formData.username
          };
          localStorage.setItem('userProgress', JSON.stringify(initialUserData));
          localStorage.setItem('username', formData.username);
          
          setTimeout(() => {
            navigate("/", {
              replace: true,
              state: {
                message: "🎉 Bienvenue sur CyberForge ! Votre compte a été créé et vous êtes maintenant connecté. Commencez votre apprentissage en cybersécurité !"
              }
            });
          }, 2000);
        } else {
          // Fallback vers la page de login si pas de token
          setTimeout(() => {
            navigate("/login", {
              state: {
                message: "✅ Compte créé avec succès ! Veuillez vous connecter.",
                username: formData.username
              }
            });
          }, 2000);
        }
      } else {
        setError(data.error || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      console.error("Registration error:", error);
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
          <h2>Créer un compte</h2>
          <p>🚀 Rejoignez CyberForge et devenez un expert en cybersécurité !</p>
          <div className="benefits-preview">
            <span className="benefit">🎯 Quiz interactifs</span>
            <span className="benefit">📚 Cours détaillés</span>
            <span className="benefit">⚡ Système XP</span>
          </div>
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
              placeholder="Choisissez un nom d'utilisateur"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${error && !formData.email ? 'error' : ''}`}
              placeholder="votre.email@exemple.com"
              disabled={loading}
              autoComplete="email"
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
              placeholder="Minimum 8 caractères"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${error && formData.password !== formData.confirmPassword ? 'error' : ''}`}
              placeholder="Répétez votre mot de passe"
              disabled={loading}
              autoComplete="new-password"
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
                  Création en cours...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Créer mon compte
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
            Vous avez déjà un compte ?{' '}
            <button 
              onClick={() => navigate("/login")}
              className="auth-link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;