import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { syncProgressWithBackend } from '../utils/experienceSystem';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userXP, setUserXP] = useState(null);

  useEffect(() => {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    
    // Charger les données XP
    loadUserXP();
    setLoading(false);
  }, []);

  // Auto-synchronisation périodique avec le backend (toutes les 5 secondes)
  useEffect(() => {
    if (!token) return;

    console.log('🔄 [AUTO-SYNC] Démarrage de la synchronisation automatique (toutes les 5 secondes)...');
    
    // Synchroniser immédiatement
    setTimeout(() => {
      console.log('🔄 [AUTO-SYNC] Première synchronisation...');
      syncProgressWithBackend();
    }, 1000);
    
    // Puis toutes les 5 secondes
    const syncInterval = setInterval(() => {
      console.log('🔄 [AUTO-SYNC] Synchronisation périodique...');
      syncProgressWithBackend();
    }, 5000); // 5 secondes

    return () => {
      console.log('🛑 [AUTO-SYNC] Arrêt de la synchronisation automatique');
      clearInterval(syncInterval);
    };
  }, [token]);

  // Écouter l'événement tokenExpired pour déconnecter automatiquement
  useEffect(() => {
    const handleTokenExpired = () => {
      console.error('🔴 [AUTH] Token expiré - Déconnexion automatique...');
      alert('⚠️ Votre session a expiré. Veuillez vous reconnecter.');
      logout();
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  // Synchronisation globale des données XP
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userExperience' || e.storageArea === localStorage) {
        loadUserXP();
      }
    };

    const handleLevelUpdate = (e) => {
      if (e.detail) {
        setUserXP(e.detail);
      }
    };

    // Écouter les changements de localStorage et les événements custom
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('levelUpdate', handleLevelUpdate);
    window.addEventListener('globalLevelSync', handleLevelUpdate);

    // BroadcastChannel pour synchronisation cross-tab
    const broadcastChannel = new BroadcastChannel('levelSync');
    broadcastChannel.onmessage = (event) => {
      setUserXP(event.data);
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('levelUpdate', handleLevelUpdate);
      window.removeEventListener('globalLevelSync', handleLevelUpdate);
      broadcastChannel.close();
    };
  }, []);

  const loadUserXP = () => {
    try {
      const xpData = localStorage.getItem('userExperience');
      if (xpData) {
        const parsedData = JSON.parse(xpData);
        setUserXP(parsedData);
      } else {
        // Données par défaut
        const defaultXP = {
          level: 1,
          totalXp: 0,
          currentLevelXp: 0,
          xpToNextLevel: 100,
          streak: 0,
          badges: []
        };
        setUserXP(defaultXP);
        localStorage.setItem('userExperience', JSON.stringify(defaultXP));
      }
    } catch (error) {
      console.error('Error loading user XP:', error);
    }
  };

  const updateUserXP = (newXPData) => {
    setUserXP(newXPData);
    localStorage.setItem('userExperience', JSON.stringify(newXPData));
    
    // Notifier tous les composants et onglets
    window.dispatchEvent(new CustomEvent('levelUpdate', { detail: newXPData }));
    const broadcastChannel = new BroadcastChannel('levelSync');
    broadcastChannel.postMessage(newXPData);
    broadcastChannel.close();
  };

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // 🔄 CHARGER LES VRAIES DONNÉES DEPUIS LE BACKEND
    console.log('🔄 [LOGIN] Récupération des données utilisateur depuis le backend...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const backendUserData = await response.json();
        
        console.log('✅ [LOGIN] Données chargées depuis le backend:', {
          level: backendUserData.level,
          experience: backendUserData.experience
        });
        
        // Calculer correctement l'XP pour le niveau actuel
        let xpUsedForPreviousLevels = 0;
        for (let i = 1; i < backendUserData.level; i++) {
          xpUsedForPreviousLevels += Math.floor(100 * Math.pow(1.5, i - 1));
        }
        const currentLevelXp = backendUserData.experience - xpUsedForPreviousLevels;
        const xpForNextLevel = Math.floor(100 * Math.pow(1.5, backendUserData.level - 1));
        const xpNeededForNextLevel = Math.max(0, xpForNextLevel - currentLevelXp);
        
        console.log('📊 [LOGIN] Calcul XP:', {
          totalXp: backendUserData.experience,
          level: backendUserData.level,
          xpUsedForPreviousLevels,
          currentLevelXp,
          xpForNextLevel,
          xpNeededForNextLevel
        });
        
        const xpData = {
          level: backendUserData.level,
          totalXp: backendUserData.experience,
          currentLevelXp: Math.max(0, currentLevelXp),
          xpToNextLevel: xpNeededForNextLevel,
          streak: 0,
          badges: []
        };
        
        // ÉCRASER le localStorage avec les données du backend
        localStorage.setItem('userExperience', JSON.stringify(xpData));
        
        const userProgressData = {
          totalXp: backendUserData.experience,
          level: backendUserData.level,
          completedQuizzes: backendUserData.completed_quizzes || [],
          completedLessons: backendUserData.completed_modules || []
        };
        
        localStorage.setItem('userProgress', JSON.stringify(userProgressData));
        
        if (backendUserData.completed_quizzes) {
          const completedQuizzesFormatted = backendUserData.completed_quizzes.map(quizId => ({
            id: quizId,
            completed: true
          }));
          localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzesFormatted));
        }
        
        updateUserXP(xpData);
        
        // Notifier tous les composants + RAFRAÎCHIR LE LEADERBOARD
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('levelUpdate', { detail: xpData }));
          window.dispatchEvent(new CustomEvent('globalLevelSync', { detail: xpData }));
          window.dispatchEvent(new CustomEvent('forceLeaderboardRefresh'));
          console.log('🔄 [LOGIN] Événement de rafraîchissement du leaderboard envoyé');
        }, 100);
        
        // SYNCHRONISER IMMÉDIATEMENT les données chargées vers le backend
        setTimeout(() => {
          console.log('🔄 [LOGIN] Synchronisation immédiate après chargement...');
          syncProgressWithBackend();
        }, 500);
        
      } else {
        console.error('❌ [LOGIN] Erreur lors du chargement des données backend');
        loadUserXP();
      }
    } catch (error) {
      console.error('❌ [LOGIN] Erreur:', error);
      loadUserXP();
    }
  };

  const logout = async () => {
    // Sauvegarder la progression avant de se déconnecter
    try {
      const token = localStorage.getItem('auth_token');
      const userProgress = localStorage.getItem('userProgress');
      const userExperience = localStorage.getItem('userExperience');
      
      if (token && (userProgress || userExperience)) {
        const progressData = JSON.parse(userProgress || '{}');
        const xpData = JSON.parse(userExperience || '{}');
        
        console.log('💾 [LOGOUT] Sauvegarde de la progression avant déconnexion...');
        
        // Envoyer la progression finale au backend
        await fetch(`${API_BASE_URL}/api/user/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            experience: xpData.totalXp || progressData.totalXp || 0,
            level: xpData.level || progressData.level || 1,
            progress: progressData,
            completed_quizzes: progressData.completedQuizzes || [],
            completed_modules: progressData.completedLessons || []
          })
        });
        
        console.log('✅ [LOGOUT] Progression sauvegardée avec succès');
      }
    } catch (error) {
      console.error('❌ [LOGOUT] Erreur lors de la sauvegarde:', error);
    }
    
    // Nettoyer les données locales après sauvegarde
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('userProgress');
    localStorage.removeItem('userExperience');
    localStorage.removeItem('completedQuizzes');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    userXP,
    updateUserXP,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};