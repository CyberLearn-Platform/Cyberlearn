import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    loadUserXP();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
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