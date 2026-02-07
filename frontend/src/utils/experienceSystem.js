// Système d'expérience et de niveaux amélioré
import { API_BASE_URL } from '../config';

export const EXPERIENCE_SYSTEM = {
  XP_PER_CORRECT_ANSWER: 25,
  XP_PER_WRONG_ANSWER: 0, // Pas de pénalité, juste pas de gain
  XP_PER_LESSON_COMPLETED: 100,
  XP_BONUS_PERFECT_QUIZ: 200,
  XP_BONUS_STREAK_3: 15,
  XP_BONUS_STREAK_5: 35,
  XP_BONUS_STREAK_10: 75,
  
  // Formule pour calculer l'XP nécessaire pour atteindre le niveau suivant
  getXpForLevel: (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  },
  
  // Calculer le niveau basé sur l'XP total
  getLevelFromXp: (totalXp) => {
    let level = 1;
    let xpNeeded = 0;
    
    while (xpNeeded <= totalXp) {
      xpNeeded += EXPERIENCE_SYSTEM.getXpForLevel(level);
      if (xpNeeded <= totalXp) {
        level++;
      }
    }
    
    return level;
  },
  
  // Calculer l'XP actuel pour le niveau en cours
  getCurrentLevelXp: (totalXp) => {
    let level = 1;
    let xpUsed = 0;
    
    while (true) {
      const xpForThisLevel = EXPERIENCE_SYSTEM.getXpForLevel(level);
      if (xpUsed + xpForThisLevel > totalXp) {
        return totalXp - xpUsed;
      }
      xpUsed += xpForThisLevel;
      level++;
    }
  },
  
  // Calculer l'XP nécessaire pour le prochain niveau
  getXpNeededForNextLevel: (totalXp) => {
    const currentLevel = EXPERIENCE_SYSTEM.getLevelFromXp(totalXp);
    const currentLevelXp = EXPERIENCE_SYSTEM.getCurrentLevelXp(totalXp);
    const xpForNextLevel = EXPERIENCE_SYSTEM.getXpForLevel(currentLevel);
    
    return xpForNextLevel - currentLevelXp;
  },
  
  // Calculer le pourcentage de progression du niveau actuel
  getLevelProgress: (totalXp) => {
    const currentLevelXp = EXPERIENCE_SYSTEM.getCurrentLevelXp(totalXp);
    const currentLevel = EXPERIENCE_SYSTEM.getLevelFromXp(totalXp);
    const xpForCurrentLevel = EXPERIENCE_SYSTEM.getXpForLevel(currentLevel);
    
    return Math.round((currentLevelXp / xpForCurrentLevel) * 100);
  },
  
  // Obtenir le titre/badge selon le niveau
  getLevelTitle: (level) => {
    if (level >= 50) return "🏆 Maître de la Cybersécurité";
    if (level >= 40) return "🛡️ Expert Sécurité";
    if (level >= 30) return "🔒 Spécialiste Cyber";
    if (level >= 25) return "💻 Analyste Senior";
    if (level >= 20) return "🕵️ Investigateur";
    if (level >= 15) return "🔐 Cryptographe";
    if (level >= 12) return "⚡ Pentester";
    if (level >= 10) return "🎯 Chasseur de Bugs";
    if (level >= 8) return "🔍 Analyste Junior";
    if (level >= 6) return "🛡️ Défenseur";
    if (level >= 4) return "💡 Apprenti Expert";
    if (level >= 2) return "🌟 Apprenti";
    return "🚀 Débutant";
  },
  
  // Calculer les récompenses XP avec nouveau système
  calculateQuizRewards: (correctAnswers, totalQuestions, wrongAnswers = 0) => {
    const correctXp = correctAnswers * EXPERIENCE_SYSTEM.XP_PER_CORRECT_ANSWER;
    const wrongXp = wrongAnswers * EXPERIENCE_SYSTEM.XP_PER_WRONG_ANSWER;
    const baseXp = correctXp + wrongXp;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    let bonusXp = 0;
    let bonusReason = "";
    
    if (percentage === 100) {
      bonusXp = EXPERIENCE_SYSTEM.XP_BONUS_PERFECT_QUIZ;
      bonusReason = "Quiz parfait !";
    } else if (percentage >= 80) {
      bonusXp = 100;
      bonusReason = "Excellente performance !";
    } else if (percentage >= 60) {
      bonusXp = 50;
      bonusReason = "Bonne performance !";
    }
    
    const totalXp = Math.max(0, baseXp + bonusXp); // Empêcher XP négatif total
    
    return {
      correctXp,
      wrongXp,
      baseXp,
      bonusXp,
      totalXp,
      reason: bonusReason,
      breakdown: {
        correct: { count: correctAnswers, xp: correctXp },
        wrong: { count: wrongAnswers, xp: wrongXp },
        bonus: { xp: bonusXp, reason: bonusReason }
      }
    };
  },

  // Calculer XP pour une réponse individuelle avec streak bonus
  calculateAnswerXp: (isCorrect, currentStreak = 0) => {
    let xp = isCorrect ? EXPERIENCE_SYSTEM.XP_PER_CORRECT_ANSWER : EXPERIENCE_SYSTEM.XP_PER_WRONG_ANSWER;
    let streakBonus = 0;
    let streakMessage = "";
    
    if (isCorrect && currentStreak > 0) {
      if (currentStreak >= 10) {
        streakBonus = EXPERIENCE_SYSTEM.XP_BONUS_STREAK_10;
        streakMessage = "🔥 Série incroyable de 10+ !";
      } else if (currentStreak >= 5) {
        streakBonus = EXPERIENCE_SYSTEM.XP_BONUS_STREAK_5;
        streakMessage = "🔥 Super série de 5+ !";
      } else if (currentStreak >= 3) {
        streakBonus = EXPERIENCE_SYSTEM.XP_BONUS_STREAK_3;
        streakMessage = "🔥 Bonne série de 3+ !";
      }
    }
    
    return {
      baseXp: xp,
      streakBonus,
      totalXp: xp + streakBonus,
      streakMessage,
      currentStreak: isCorrect ? currentStreak + 1 : 0
    };
  }
};

// Hook pour gérer l'expérience utilisateur
export const useUserExperience = () => {
  const getUserData = () => {
    const userData = JSON.parse(localStorage.getItem('userProgress') || '{}');
    return {
      totalXp: userData.totalXp || 0,
      level: userData.level || 1,
      completedQuizzes: userData.completedQuizzes || [],
      completedLessons: userData.completedLessons || []
    };
  };
  
  const updateUserXp = async (xpGained, source = 'unknown') => {
    const currentData = getUserData();
    // Empêcher l'XP négatif - minimum 0
    const newTotalXp = Math.max(0, currentData.totalXp + xpGained);
    const newLevel = EXPERIENCE_SYSTEM.getLevelFromXp(newTotalXp);
    const leveledUp = newLevel > currentData.level;
    
    const updatedData = {
      ...currentData,
      totalXp: newTotalXp,
      level: newLevel,
      lastXpGain: {
        amount: xpGained,
        source,
        timestamp: new Date().toISOString()
      }
    };
    
    localStorage.setItem('userProgress', JSON.stringify(updatedData));
    
    // SYNCHRONISATION GLOBALE - Mettre à jour aussi userExperience pour AuthContext
    const currentLevelXp = EXPERIENCE_SYSTEM.getCurrentLevelXp(newTotalXp);
    const xpForNextLevel = EXPERIENCE_SYSTEM.getXpForLevel(newLevel);
    
    const globalXpData = {
      level: newLevel,
      totalXp: newTotalXp,
      currentLevelXp: currentLevelXp,
      xpToNextLevel: xpForNextLevel,
      streak: updatedData.streak || 0,
      badges: updatedData.badges || []
    };
    
    localStorage.setItem('userExperience', JSON.stringify(globalXpData));
    
    // SYNCHRONISER AVEC LE BACKEND
    const syncWithBackend = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          console.log('🔄 [SYNC] Envoi des données au backend:', { 
            experience: newTotalXp, 
            level: newLevel,
            completedQuizzes: currentData.completedQuizzes?.length || 0,
            completedModules: currentData.completedLessons?.length || 0,
            source 
          });
          
          const response = await fetch(`${API_BASE_URL}/api/user/progress`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              experience: newTotalXp,
              level: newLevel,
              progress: currentData,
              completed_quizzes: currentData.completedQuizzes || [],
              completed_modules: currentData.completedLessons || []
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ [SYNC] Synchronisation backend réussie:', result.message);
          } else if (response.status === 401) {
            console.error('❌ [SYNC] Token invalide - Déconnexion automatique...');
            window.dispatchEvent(new CustomEvent('tokenExpired'));
          } else {
            const error = await response.json();
            console.error('❌ [SYNC] Erreur backend:', error);
          }
        } else {
          console.warn('⚠️ [SYNC] Pas de token d\'authentification - synchronisation ignorée');
        }
      } catch (error) {
        console.error('❌ [SYNC] Échec de synchronisation avec backend:', error);
      }
    };
    // FORCER LA SYNCHRONISATION IMMÉDIATE ET ATTENDRE LA CONFIRMATION
    await syncWithBackend();
    
    // SI MONTÉE DE NIVEAU, FORCER LE RECHARGEMENT DU LEADERBOARD
    if (leveledUp) {
      console.log('🎉 [LEVEL UP] Montée de niveau détectée ! Rechargement du leaderboard...');
      // Attendre un peu que le backend mette à jour
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('forceLeaderboardRefresh'));
      }, 1000);
    }
    
    // Notifier TOUS les composants via événements multiples
    window.dispatchEvent(new CustomEvent('levelUpdate', { detail: globalXpData }));
    window.dispatchEvent(new CustomEvent('globalLevelSync', { detail: globalXpData }));
    
    // Synchronisation cross-tab via BroadcastChannel
    try {
      const broadcastChannel = new BroadcastChannel('levelSync');
      broadcastChannel.postMessage(globalXpData);
      broadcastChannel.close();
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }
    
    return {
      leveledUp,
      newLevel,
      newTotalXp,
      xpGained
    };
  };
  
  const markQuizCompleted = (quizId, score, totalQuestions) => {
    const currentData = getUserData();
    const rewards = EXPERIENCE_SYSTEM.calculateQuizRewards(score, totalQuestions);
    
    const updatedData = {
      ...currentData,
      completedQuizzes: [...currentData.completedQuizzes, {
        id: quizId,
        score,
        totalQuestions,
        completedAt: new Date().toISOString(),
        xpEarned: rewards.totalXp
      }]
    };
    
    localStorage.setItem('userProgress', JSON.stringify(updatedData));
    
    return updateUserXp(rewards.totalXp, `Quiz ${quizId}`);
  };
  
  const markLessonCompleted = (lessonId) => {
    const currentData = getUserData();
    
    // Éviter les doublons
    if (currentData.completedLessons.includes(lessonId)) {
      return { leveledUp: false, newLevel: currentData.level, newTotalXp: currentData.totalXp, xpGained: 0 };
    }
    
    const updatedData = {
      ...currentData,
      completedLessons: [...currentData.completedLessons, lessonId]
    };
    
    localStorage.setItem('userProgress', JSON.stringify(updatedData));
    
    return updateUserXp(EXPERIENCE_SYSTEM.XP_PER_LESSON_COMPLETED, `Lesson ${lessonId}`);
  };
  
  return {
    getUserData,
    updateUserXp,
    markQuizCompleted,
    markLessonCompleted
  };
};

// Fonction pour synchroniser manuellement avec le backend
export const syncProgressWithBackend = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const userProgress = localStorage.getItem('userProgress');
    const userExperience = localStorage.getItem('userExperience');
    
    if (!token) {
      console.warn('⚠️ [SYNC] Pas de token - synchronisation ignorée');
      return false;
    }
    
    const progressData = JSON.parse(userProgress || '{}');
    const xpData = JSON.parse(userExperience || '{}');
    
    const totalXp = xpData.totalXp || progressData.totalXp || 0;
    const level = xpData.level || progressData.level || 1;
    
    console.log('🔄 [SYNC] Synchronisation...', { level, totalXp });
    
    const response = await fetch(`${API_BASE_URL}/api/user/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        experience: totalXp,
        level: level,
        progress: progressData,
        completed_quizzes: progressData.completedQuizzes || [],
        completed_modules: progressData.completedLessons || []
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ [SYNC] Synchronisation réussie - Level', level, 'XP', totalXp);
      return true;
    } else if (response.status === 401) {
      console.error('❌ [SYNC] Token invalide ou expiré - Reconnexion requise');
      // Déclencher un événement pour forcer la déconnexion
      window.dispatchEvent(new CustomEvent('tokenExpired'));
      return false;
    } else {
      const error = await response.json();
      console.error('❌ [SYNC] Erreur:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ [SYNC] Échec:', error);
    return false;
  }
};