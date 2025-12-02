import React from 'react';

// Système de synchronisation global des niveaux et XP
class LevelSyncManager {
  constructor() {
    this.listeners = new Set();
    this.setupStorageListener();
  }

  // Ajouter un listener pour être notifié des changements
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Supprimer un listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notifier tous les listeners d'un changement
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Erreur dans listener:', error);
      }
    });
  }

  // Écouter les changements de localStorage
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'userExperience') {
        const newData = JSON.parse(e.newValue || '{}');
        this.notifyListeners(newData);
      }
    });
  }

  // Mettre à jour l'XP et notifier tous les composants
  updateExperience(xpGained) {
    const userData = JSON.parse(localStorage.getItem('userExperience') || '{}');
    
    const currentData = {
      level: userData.level || 1,
      totalXp: userData.totalXp || 0,
      currentLevelXp: userData.currentLevelXp || 0,
      xpToNextLevel: userData.xpToNextLevel || 100,
      streak: userData.streak || 0,
      badges: userData.badges || []
    };

    // Ajouter XP
    currentData.totalXp += xpGained;
    currentData.currentLevelXp += xpGained;

    // Vérifier montée de niveau
    let leveledUp = false;
    while (currentData.currentLevelXp >= currentData.xpToNextLevel) {
      currentData.currentLevelXp -= currentData.xpToNextLevel;
      currentData.level += 1;
      currentData.xpToNextLevel = this.calculateXpForLevel(currentData.level + 1);
      leveledUp = true;
    }

    // Sauvegarder
    localStorage.setItem('userExperience', JSON.stringify(currentData));

    // Notifier TOUS les composants immédiatement
    this.notifyListeners(currentData);

    // Déclencher événement custom pour forcer la mise à jour
    window.dispatchEvent(new CustomEvent('levelUpdate', { detail: currentData }));

    return { ...currentData, leveledUp };
  }

  // Calculer XP requis pour un niveau
  calculateXpForLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  // Obtenir les données actuelles
  getCurrentData() {
    return JSON.parse(localStorage.getItem('userExperience') || '{}');
  }

  // Forcer la synchronisation de toutes les pages
  forceSyncAll() {
    const currentData = this.getCurrentData();
    this.notifyListeners(currentData);
    window.dispatchEvent(new CustomEvent('levelUpdate', { detail: currentData }));
  }
}

// Instance globale
export const levelSync = new LevelSyncManager();

// Hook React pour utiliser le système
export const useLevelSync = (callback) => {
  React.useEffect(() => {
    levelSync.addListener(callback);
    
    // Écouter aussi les événements custom
    const handleLevelUpdate = (e) => callback(e.detail);
    window.addEventListener('levelUpdate', handleLevelUpdate);
    
    // Données initiales
    const initialData = levelSync.getCurrentData();
    if (Object.keys(initialData).length > 0) {
      callback(initialData);
    }

    return () => {
      levelSync.removeListener(callback);
      window.removeEventListener('levelUpdate', handleLevelUpdate);
    };
  }, [callback]);
};