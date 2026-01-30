// Configuration des URLs pour différents environnements
const config = {
  development: {
    // Utiliser l'IP du réseau local pour permettre les connexions d'autres PC
    API_BASE_URL: process.env.REACT_APP_API_URL || "http://127.0.0.1:5000",
    FRONTEND_URL: "http://localhost:3000",
  },
  production: {
    API_BASE_URL: "https://your-backend-domain.com",
    FRONTEND_URL: "https://your-frontend-domain.com",
  },
};

// Détection automatique de l'environnement
const environment = process.env.NODE_ENV || "development";
const currentConfig = config[environment];

export const API_BASE_URL = currentConfig.API_BASE_URL;
export const FRONTEND_URL = currentConfig.FRONTEND_URL;

// Utilitaires pour les requêtes API
export const apiEndpoints = {
  auth: {
    login: `${API_BASE_URL}/api/login`,
    register: `${API_BASE_URL}/api/register`,
    logout: `${API_BASE_URL}/api/logout`,
  },
  modules: {
    list: `${API_BASE_URL}/api/modules`,
    detail: (id) => `${API_BASE_URL}/api/module/${id}`,
  },
  quests: {
    list: `${API_BASE_URL}/api/quests`,
    detail: (id) => `${API_BASE_URL}/api/quest/${id}`,
  },
  user: {
    progress: `${API_BASE_URL}/api/user/progress`,
    profile: `${API_BASE_URL}/api/user/profile`,
  },
  game: {
    leaderboard: `${API_BASE_URL}/api/leaderboard`,
    health: `${API_BASE_URL}/api/health`,
  },
  labs: {
    start: `${API_BASE_URL}/api/start-lab`,
    submitFlag: `${API_BASE_URL}/api/submit-flag`,
  },
};

export default currentConfig;
