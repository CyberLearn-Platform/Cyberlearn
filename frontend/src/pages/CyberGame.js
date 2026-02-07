import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useGameRoom } from '../hooks/useSocket';
import NavBar from '../components/NavBar';
import './CyberGame.css';

const CyberGame = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // WebSocket pour le mode en ligne
  const {
    socket,
    isConnected,
    roomCode,
    opponent,
    gameStarted: onlineGameStarted,
    isMyTurn,
    error: socketError,
    playerName: onlinePlayerName,
    opponentName: onlineOpponentName,
    notification,
    createRoom,
    joinRoom,
    startGame: startOnlineGame,
    sendAnswer,
    updateHealth,
    leaveRoom
  } = useGameRoom();
  
  // Game state
  const [gameMode, setGameMode] = useState(null); // 'local' ou 'online'
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('player');
  const [battleLog, setBattleLog] = useState([]);
  
  // États pour le mode en ligne
  const [showRoomInterface, setShowRoomInterface] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomAction, setRoomAction] = useState(null); // 'create' ou 'join'
  
  // Player state - Synchronisé avec le système d'XP des Quiz
  const [player, setPlayer] = useState(() => {
    // Utiliser le même localStorage que les Quiz
    const userExperience = JSON.parse(localStorage.getItem('userExperience') || '{}');
    const level = userExperience.level || 1;
    const totalXp = userExperience.totalXp || 0;
    const xpToNextLevel = userExperience.xpToNextLevel || 100;
    
    // Calculer les stats basées sur le niveau (même formule que dans le jeu)
    const maxHealth = 100 + (level - 1) * 15;
    const maxMana = 50 + (level - 1) * 10;
    const attack = 20 + (level - 1) * 3;
    const defense = 10 + (level - 1) * 2;
    
    return {
      name: 'CyberDefender',
      health: maxHealth,
      maxHealth: maxHealth,
      attack: attack,
      defense: defense,
      level: level,
      experience: totalXp,
      experienceToNext: xpToNextLevel,
      mana: maxMana,
      maxMana: maxMana
    };
  });
  
  // Animation states
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  
  // Arena and enemy states
  const [currentArena, setCurrentArena] = useState(1);
  const [arenaEnemiesDefeated, setArenaEnemiesDefeated] = useState(0);
  const [totalArenaEnemies, setTotalArenaEnemies] = useState(3);
  const [arenaBonus, setArenaBonus] = useState(0);
  const [arenaType, setArenaType] = useState('cyber_fortress');
  
  // Arena definitions
  const arenaTypes = {
    cyber_fortress: {
      name: 'Forteresse Cybernétique',
      description: 'Une forteresse numérique protégée par des défenses IA',
      icon: '🏰',
      color: '#2563eb',
      enemies: ['Gardien IA', 'Sentinelle Cyber', 'Boss Firewall'],
      bonus: { exp: 1.2, difficulty: 'normal' }
    },
    data_vault: {
      name: 'Coffre-fort de Données',
      description: 'Un système de stockage ultra-sécurisé',
      icon: '🔐',
      color: '#059669',
      enemies: ['Crypteur Elite', 'Scanner Malveillant', 'Maître Chiffrement'],
      bonus: { exp: 1.5, difficulty: 'hard' }
    },
    network_maze: {
      name: 'Labyrinthe Réseau',
      description: 'Un réseau complexe plein de pièges',
      icon: '🌐',
      color: '#dc2626',
      enemies: ['Routeur Piégé', 'Proxy Malveillant', 'Seigneur du Réseau'],
      bonus: { exp: 1.8, difficulty: 'expert' }
    }
  };
  
  const [enemy, setEnemy] = useState({
    name: 'Cyber Criminel',
    health: 120,
    maxHealth: 120,
    attack: 18,
    defense: 8,
    type: 'hacker',
    difficulty: 'normal'
  });
  
  // Question system
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);
  const [selectedModule, setSelectedModule] = useState('global');
  const [selectedChoice, setSelectedChoice] = useState('');
  const [isHealingQuestion, setIsHealingQuestion] = useState(false);
  
  // Animation states
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // Bot AI state (pour mode local)
  const [botThinking, setBotThinking] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState('medium'); // easy, medium, hard
  
  // Synchroniser avec le système d'XP global des Quiz (uniquement en mode local)
  useEffect(() => {
    // Ne pas sauvegarder pendant le mode PvP pour ne pas écraser le vrai niveau
    if (gameMode === 'online' && gameStarted) {
      return; // Ne rien faire en mode PvP
    }
    
    const userExperience = {
      level: player.level,
      totalXp: player.experience,
      xpToNextLevel: player.experienceToNext,
      currentXp: 0 // XP dans le niveau actuel
    };
    localStorage.setItem('userExperience', JSON.stringify(userExperience));
    
    // Déclencher un événement pour synchroniser avec les autres pages
    window.dispatchEvent(new CustomEvent('levelUpdate', { detail: userExperience }));
  }, [player.level, player.experience, player.experienceToNext, gameMode, gameStarted]);
  
  // Écouter les événements WebSocket pour le mode online
  useEffect(() => {
    if (gameMode !== 'online' || !onlineGameStarted || !socket) return;
    
    const handleOpponentAttack = (data) => {
      console.log('🔥 OPPONENT ATTACK RECEIVED:', data);
      const damage = data.damage;
      const serverPlayerHealth = data.your_new_health; // Santé calculée par le serveur
      
      setPlayer(prev => {
        console.log('🛡️ Updating player health from', prev.health, 'to', serverPlayerHealth);
        return { ...prev, health: serverPlayerHealth };
      });
      
      setEnemy(prev => {
        const newEnemyHealth = data.attacker_health;
        console.log('👾 Updating enemy health to', newEnemyHealth);
        return { ...prev, health: newEnemyHealth };
      });
      
      setBattleLog(prev => [...prev, `💥 ${onlineOpponentName} vous attaque et inflige ${damage} dégâts !`]);
      
      // Animation de dégâts reçus
      setPlayerAttacking(true);
      setTimeout(() => setPlayerAttacking(false), 400);
      
      if (serverPlayerHealth <= 0) {
        setBattleLog(prev => [...prev, `💀 Défaite ! ${onlineOpponentName} vous a vaincu !`]);
        setShowDefeat(true);
        setTimeout(() => setShowDefeat(false), 3000);
        setTimeout(() => {
          setGameStarted(false);
          leaveRoom();
          navigate('/');
        }, 3000);
      }
    };
    
    const handleOpponentHealthUpdate = (data) => {
      setEnemy(prev => ({ ...prev, health: data.opponent_health }));
    };
    
    const handleAttackConfirmed = (data) => {
      console.log('✅ ATTACK CONFIRMED:', data);
      // Mettre à jour la santé de l'ennemi avec la valeur du serveur
      setEnemy(prev => {
        console.log('👾 Enemy health confirmed:', data.victim_new_health);
        return { ...prev, health: data.victim_new_health };
      });
    };
    
    const handleTurnChanged = (data) => {
      if (data.your_turn) {
        setBattleLog(prev => [...prev, "✨ C'est votre tour !"]);
        setCurrentQuestion(null);
      } else {
        setBattleLog(prev => [...prev, `⏳ Tour de ${onlineOpponentName}...`]);
      }
    };
    
    const handleGameEnded = (data) => {
      console.log('🏁 GAME ENDED:', data);
      setBattleLog(prev => [...prev, data.message]);
      
      if (data.winner) {
        // Victoire
        setShowVictory(true);
        setTimeout(() => setShowVictory(false), 3000);
      } else {
        // Défaite
        setShowDefeat(true);
        setTimeout(() => setShowDefeat(false), 3000);
      }
      
      setGameStarted(false);
      setTimeout(() => {
        leaveRoom();
        navigate('/');
      }, 4000);
    };
    
    // Écouter les événements
    socket.on('opponent_attack', handleOpponentAttack);
    socket.on('opponent_health_update', handleOpponentHealthUpdate);
    socket.on('attack_confirmed', handleAttackConfirmed);
    socket.on('turn_changed', handleTurnChanged);
    socket.on('game_ended', handleGameEnded);
    
    return () => {
      socket.off('opponent_attack', handleOpponentAttack);
      socket.off('opponent_health_update', handleOpponentHealthUpdate);
      socket.off('attack_confirmed', handleAttackConfirmed);
      socket.off('turn_changed', handleTurnChanged);
      socket.off('game_ended', handleGameEnded);
    };
    
  }, [gameMode, onlineGameStarted, player.health, onlineOpponentName, leaveRoom, navigate, socket]);
  
  // Synchroniser le démarrage du jeu en mode online
  useEffect(() => {
    if (gameMode === 'online' && onlineGameStarted && !gameStarted) {
      // Mettre à jour les noms des joueurs depuis le serveur
      if (onlinePlayerName) {
        setPlayer(prev => ({ ...prev, name: onlinePlayerName }));
      }
      if (onlineOpponentName) {
        setEnemy(prev => ({ ...prev, name: onlineOpponentName }));
      }
      setGameStarted(true);
      startBattle();
    }
  }, [onlineGameStarted, gameMode, onlinePlayerName, onlineOpponentName]);
  
  // Gérer la déconnexion de l'adversaire pendant la partie
  useEffect(() => {
    if (gameMode === 'online' && gameStarted && !opponent && !onlineGameStarted) {
      // L'adversaire a quitté pendant la partie
      setBattleLog(prev => [...prev, "⚠️ Votre adversaire a quitté la partie !"]);
      setTimeout(() => {
        setGameStarted(false);
        leaveRoom();
        navigate('/');
      }, 2000);
    }
  }, [opponent, gameMode, gameStarted, onlineGameStarted, leaveRoom, navigate]);
  
  // Questions database
  const questionsDB = {
    cryptography: [
      { 
        id: 1, 
        question: "Que signifie AES ?", 
        choices: ["Advanced Encryption Standard", "Application Encryption System", "Automatic Encryption Service", "Advanced Electronic Security"],
        correct: 0,
        explanation: "AES (Advanced Encryption Standard) est l'algorithme de chiffrement symétrique standard actuel." 
      },
      { 
        id: 2, 
        question: "Quelle est la principale différence entre hachage et chiffrement ?", 
        choices: ["Le hachage est réversible", "Le hachage est irréversible", "Le chiffrement est plus rapide", "Il n'y a pas de différence"],
        correct: 1,
        explanation: "Le hachage est irréversible et crée une empreinte, le chiffrement est réversible avec la clé." 
      },
      { 
        id: 3, 
        question: "Que signifie PKI ?", 
        choices: ["Private Key Infrastructure", "Public Key Infrastructure", "Password Key Interface", "Protected Key Implementation"],
        correct: 1,
        explanation: "Infrastructure à clé publique pour gérer les certificats et clés de chiffrement asymétrique." 
      },
      { 
        id: 4, 
        question: "Quel algorithme de hachage est recommandé aujourd'hui ?", 
        choices: ["MD5", "SHA-1", "SHA-256", "DES"],
        correct: 2,
        explanation: "SHA-256 fait partie de SHA-2 et est actuellement sûr, contrairement à MD5 et SHA-1." 
      },
      { 
        id: 5, 
        question: "Qu'est-ce qu'un salt en cryptographie ?", 
        choices: ["Un mot de passe", "Des données aléatoires ajoutées avant hachage", "Un algorithme de chiffrement", "Une clé secrète"],
        correct: 1,
        explanation: "Données aléatoires ajoutées avant hachage pour empêcher les attaques par dictionnaire." 
      }
    ],
    web_security: [
      { 
        id: 1, 
        question: "Que signifie XSS en sécurité web ?", 
        choices: ["Cross-Site Scripting", "Extended Security System", "XML Security Service", "eXtra Safe Security"],
        correct: 0,
        explanation: "XSS (Cross-Site Scripting) permet d'injecter du code JavaScript malveillant dans des pages web." 
      },
      { 
        id: 2, 
        question: "Quelle est la meilleure défense contre l'injection SQL ?", 
        choices: ["Utiliser des MD5", "Requêtes préparées", "Chiffrer la base de données", "Utiliser HTTPS"],
        correct: 1,
        explanation: "Les requêtes préparées empêchent l'injection SQL en séparant le code SQL des données." 
      },
      { 
        id: 3, 
        question: "Que signifie CSRF ?", 
        choices: ["Cross-Site Request Forgery", "Cyber Security Risk Factor", "Client-Server Response Failure", "Cross-Site Resource Filtering"],
        correct: 0,
        explanation: "CSRF permet d'exécuter des actions non autorisées au nom d'un utilisateur authentifié." 
      },
      { 
        id: 4, 
        question: "Quel header HTTP aide à prévenir les attaques XSS ?", 
        choices: ["X-Frame-Options", "Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options"],
        correct: 1,
        explanation: "Content Security Policy (CSP) limite les sources autorisées pour le contenu exécutable." 
      },
      { 
        id: 5, 
        question: "Qu'est-ce que l'OWASP Top 10 ?", 
        choices: ["10 meilleurs outils de sécurité", "Liste des 10 vulnérabilités web les plus critiques", "10 meilleures pratiques", "Classement des hackers"],
        correct: 1,
        explanation: "Liste des 10 vulnérabilités web les plus critiques maintenue par l'OWASP." 
      }
    ]
  };
  
  // Enemy types with difficulty scaling
  const enemyTypes = {
    hacker: { 
      name: 'Cyber Criminel', 
      health: 120, 
      attack: 18, 
      defense: 8, 
      emoji: '🥷',
      abilities: ['Injection SQL', 'Phishing']
    },
    malware: { 
      name: 'Malware Avancé', 
      health: 100, 
      attack: 25, 
      defense: 5, 
      emoji: '🦠',
      abilities: ['Corruption', 'Réplication']
    },
    phisher: { 
      name: 'Social Engineer', 
      health: 110, 
      attack: 15, 
      defense: 12, 
      emoji: '🎣',
      abilities: ['Manipulation', 'Ingénierie Sociale']
    },
    ransomware: { 
      name: 'CryptoLocker', 
      health: 150, 
      attack: 22, 
      defense: 15, 
      emoji: '🔒',
      abilities: ['Chiffrement', 'Extorsion']
    },
    botnet: { 
      name: 'BotNet Master', 
      health: 180, 
      attack: 28, 
      defense: 18, 
      emoji: '🕷️',
      abilities: ['DDoS', 'Contrôle à Distance']
    }
  };

  const getRandomQuestion = () => {
    if (selectedModule === 'global') {
      // Combine all modules
      const allQuestions = [
        ...questionsDB.cryptography,
        ...questionsDB.web_security
      ];
      return allQuestions[Math.floor(Math.random() * allQuestions.length)];
    } else {
      const questions = questionsDB[selectedModule];
      return questions[Math.floor(Math.random() * questions.length)];
    }
  };

  const checkAnswer = (selectedChoice, correctIndex) => {
    return parseInt(selectedChoice) === correctIndex;
  };

  const startBattle = () => {
    setGameStarted(true);
    
    // Mode en ligne : Combat PvP (pas d'arène ni d'ennemi IA)
    if (gameMode === 'online') {
      setBattleLog([
        "🎮 Combat PvP - Le duel commence !",
        `⚔️ ${onlinePlayerName} VS ${onlineOpponentName}`,
        "🎯 Bonne chance !",
        "⚖️ Mode équilibré : Stats égales pour tous les joueurs"
      ]);
      
      // Initialiser les stats pour le PvP - Stats par défaut égales pour tous
      // On garde le niveau du joueur pour l'affichage, mais les stats de combat sont égales
      setPlayer(prev => ({ 
        ...prev,
        name: onlinePlayerName,
        health: 100,
        maxHealth: 100,
        attack: 20,
        defense: 10,
        mana: 50,
        maxMana: 50
        // Le niveau reste inchangé pour l'affichage de la progression
      }));
      
      // L'adversaire commence avec les mêmes stats (équilibré)
      setEnemy({
        name: onlineOpponentName,
        health: 100,
        maxHealth: 100,
        attack: 20,
        defense: 10,
        type: 'player',
        difficulty: 'pvp'
      });
      
      setCurrentTurn('player');
      return;
    }
    
    // Mode local : Combat contre IA avec arènes
    const currentArenaInfo = arenaTypes[arenaType];
    setBattleLog([
      "🎮 Le combat commence !",
      `🏟️ Arène sélectionnée: ${currentArenaInfo.name}`,
      `⚔️ Difficulté: ${currentArenaInfo.bonus.difficulty.toUpperCase()}`,
      `🎯 Bonus XP: +${Math.round((currentArenaInfo.bonus.exp - 1) * 100)}%`
    ]);
    setCurrentTurn('player');
    
    // Reset stats pour nouvelle partie (CONSERVER le niveau et les stats sauvegardés)
    setPlayer(prev => ({ 
      ...prev, 
      health: prev.maxHealth, // Restore health to max
      mana: prev.maxMana // Restore mana to max
      // NE PAS réinitialiser level, experience, attack, defense, etc.
      // Le joueur garde sa progression entre les parties !
    }));
    setCurrentArena(1);
    setArenaEnemiesDefeated(0);
    
    // Spawn premier ennemi de l'arène choisie
    setTimeout(() => {
      spawnNewEnemy();
    }, 1000);
  };

  const playerAttack = () => {
    const question = getRandomQuestion();
    setCurrentQuestion(question);
    setSelectedChoice('');
    setShowResult(false);
    setIsHealingQuestion(false);
    
    // Start 5 second timer for answering (increased difficulty)
    startTimer(5, () => {
      if (!showResult) {
        setBattleLog(prev => [...prev, "⏰ Temps écoulé ! Votre attaque échoue !"]);
        setCurrentQuestion(null);
        
        // En mode online, envoyer une attaque ratée (0 dégâts) pour passer le tour
        if (gameMode === 'online' && onlineGameStarted) {
          console.log('⏰ TIMEOUT: Sending failed attack to switch turn');
          sendAnswer(false, 0, player.health);
        } else if (gameMode === 'local') {
          // En mode local, l'ennemi attaque
          startTimer(3, enemyAttack);
        }
      }
    });
  };

  const startTimer = (duration, callback) => {
    setTimeRemaining(duration);
    setTimerActive(true);
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          callback();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSubmit = () => {
    if (!currentQuestion || selectedChoice === '') return;
    
    // En mode online, vérifier si c'est notre tour
    if (gameMode === 'online' && onlineGameStarted && !isMyTurn) {
      setBattleLog(prev => [...prev, "❌ Ce n'est pas votre tour !"]);
      return;
    }
    
    // Stop timer
    setTimerActive(false);
    setTimeRemaining(0);
    
    // Trigger player attack animation when attacking
    setPlayerAttacking(true);
    setTimeout(() => setPlayerAttacking(false), 600);
    
    const isCorrect = checkAnswer(selectedChoice, currentQuestion.correct);
    setAnswerCorrect(isCorrect);
    setShowResult(true);
    
    if (isCorrect) {
      // Calculate damage with critical hit chance
      let baseDamage = player.attack - enemy.defense;
      let criticalHit = Math.random() < 0.2; // 20% critical chance
      let damage = baseDamage + Math.floor(Math.random() * 10);
      
      if (criticalHit) {
        damage = Math.floor(damage * 1.5);
        setBattleLog(prev => [...prev, `⚡ COUP CRITIQUE ! Vous infligez ${damage} dégâts !`]);
      } else {
        setBattleLog(prev => [...prev, `✅ Bonne réponse ! Vous infligez ${damage} dégâts !`]);
      }
      
      damage = Math.max(1, damage);
      
      // En mode online, NE PAS mettre à jour la santé localement
      // Le serveur va envoyer attack_confirmed avec la vraie valeur
      if (gameMode === 'online' && onlineGameStarted) {
        console.log('📤 SENDING ATTACK:', { damage, playerHealth: player.health });
        sendAnswer(true, damage, player.health);
        
        // Enemy shake animation on hit (damage received)
        setTimeout(() => {
          setEnemyAttacking(true);
          setTimeout(() => setEnemyAttacking(false), 400);
        }, 300);
      } else {
        // Mode local : calcul normal
        const newEnemyHealth = Math.max(0, enemy.health - damage);
        setEnemy(prev => ({ ...prev, health: newEnemyHealth }));
        
        // Enemy shake animation on hit (damage received)
        setTimeout(() => {
          setEnemyAttacking(true);
          setTimeout(() => setEnemyAttacking(false), 400);
        }, 300);
      }
      
      // Gain mana on successful attack
      const manaGain = 10;
      setPlayer(prev => ({ 
        ...prev, 
        mana: Math.min(prev.maxMana, prev.mana + manaGain)
      }));
      
      // En mode online, ne pas gérer la victoire ici (géré par le serveur)
      if (gameMode === 'online' && onlineGameStarted) {
        // Fermer la question après l'attaque
        startTimer(5, () => {
          setCurrentQuestion(null);
          setShowResult(false);
        });
        return; // Sortir de la fonction
      }
      
      // Mode local : vérifier la victoire
      const newEnemyHealth = enemy.health; // Utiliser la santé actuelle de l'ennemi
      if (newEnemyHealth <= 0) {
        const defeatedCount = arenaEnemiesDefeated + 1;
        setArenaEnemiesDefeated(defeatedCount);
        
        const currentArenaInfo = arenaTypes[arenaType];
        const baseExp = 75;
        const arenaExpBonus = currentArena * 25;
        const difficultyBonus = Math.floor(baseExp * (currentArenaInfo.bonus.exp - 1));
        const totalExp = baseExp + arenaExpBonus + difficultyBonus;
        
        setBattleLog(prev => [...prev, 
          `🎉 ${enemy.name} vaincu !`,
          `📖 Bonne réponse ! Vous progressez en cybersécurité !`,
          `💰 +${totalExp} XP (${defeatedCount}/${totalArenaEnemies})`
        ]);
        
        // Update player with experience and check for level up (utilise formule Quiz)
        setPlayer(prev => {
          const newExp = prev.experience + totalExp;
          let newLevel = prev.level;
          let newExpToNext = prev.experienceToNext;
          let newMaxHealth = prev.maxHealth;
          let newMaxMana = prev.maxMana;
          let newAttack = prev.attack;
          let newDefense = prev.defense;
          
          // Utiliser la même formule que les Quiz : 100 * (1.5 ^ (level - 1))
          const calculateXpForLevel = (level) => Math.floor(100 * Math.pow(1.5, level - 1));
          
          // Check for level up
          let leveledUp = false;
          while (newExp >= newExpToNext) {
            newLevel = newLevel + 1;
            newExpToNext = calculateXpForLevel(newLevel);
            newMaxHealth = 100 + (newLevel - 1) * 15; // +15 HP per level
            newMaxMana = 50 + (newLevel - 1) * 10; // +10 Mana per level
            newAttack = 20 + (newLevel - 1) * 3; // +3 Attack per level
            newDefense = 10 + (newLevel - 1) * 2; // +2 Defense per level
            leveledUp = true;
          }
          
          if (leveledUp) {
            // Trigger level up animation
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
            
            setBattleLog(prevLog => [...prevLog, 
              `🌟 NIVEAU SUPÉRIEUR ! Niveau ${newLevel} !`,
              `💪 Force augmentée : ATK +3, DEF +2, PV +15, MANA +10`
            ]);
          }
          
          return {
            ...prev,
            experience: newExp,
            level: newLevel,
            experienceToNext: newExpToNext,
            maxHealth: newMaxHealth,
            maxMana: newMaxMana,
            attack: newAttack,
            defense: newDefense,
            health: prev.health, // Keep current health, don't auto-heal
            mana: Math.min(newMaxMana, prev.mana + 20)
          };
        });
        
        if (defeatedCount >= totalArenaEnemies) {
          // Show victory animation
          setShowVictory(true);
          setTimeout(() => setShowVictory(false), 2500);
          setTimeout(() => {
            completeArena();
          }, 2000);
        } else {
          setTimeout(() => {
            spawnNewEnemy();
          }, 2000);
        }
      } else {
        // En mode local UNIQUEMENT, le bot joue après un délai
        if (gameMode === 'local' && enemy.health > 0) {
          setTimeout(() => {
            handleBotTurn();
          }, 2000);
        }
        // En mode online, on ne fait RIEN (le joueur attend son tour)
      }
    } else {
      setBattleLog(prev => [...prev, "❌ Mauvaise réponse ! Votre attaque échoue !"]);
      // Lose mana on failed attack
      setPlayer(prev => ({ 
        ...prev, 
        mana: Math.max(0, prev.mana - 5)
      }));
      
      // En mode local UNIQUEMENT, le bot joue après un délai
      if (gameMode === 'local') {
        setTimeout(() => {
          handleBotTurn();
        }, 2000);
      }
      // En mode online, on ne fait RIEN (le serveur gère les tours)
    }
    
    startTimer(5, () => {
      setCurrentQuestion(null);
      setShowResult(false);
    });
  };

  // Fonction IA du Bot pour mode local
  const handleBotTurn = () => {
    if (enemy.health <= 0 || player.health <= 0) return;
    
    setBotThinking(true);
    setBattleLog(prev => [...prev, `🤖 ${enemy.name} réfléchit à sa stratégie...`]);
    
    // Simuler un temps de réflexion (1-3 secondes)
    const thinkingTime = 1000 + Math.random() * 2000;
    
    setTimeout(() => {
      setBotThinking(false);
      
      // Calculer la probabilité de bonne réponse selon la difficulté
      let correctChance;
      switch (botDifficulty) {
        case 'easy':
          correctChance = 0.4; // 40% de chance
          break;
        case 'medium':
          correctChance = 0.6; // 60% de chance
          break;
        case 'hard':
          correctChance = 0.8; // 80% de chance
          break;
        default:
          correctChance = 0.6;
      }
      
      // Le bot répond
      const botCorrect = Math.random() < correctChance;
      
      if (botCorrect) {
        // Bot attaque le joueur
        let baseDamage = enemy.attack;
        let criticalHit = Math.random() < 0.15; // 15% critique pour le bot
        let damage = baseDamage - player.defense + Math.floor(Math.random() * 8);
        
        if (criticalHit) {
          damage = Math.floor(damage * 1.5);
          setBattleLog(prev => [...prev, `⚡ ${enemy.name} COUP CRITIQUE ! ${damage} dégâts !`]);
        } else {
          setBattleLog(prev => [...prev, `✅ ${enemy.name} répond correctement et vous attaque ! ${damage} dégâts !`]);
        }
        
        damage = Math.max(1, damage);
        const newPlayerHealth = Math.max(0, player.health - damage);
        
        // Animation d'attaque du bot
        setEnemyAttacking(true);
        setTimeout(() => setEnemyAttacking(false), 600);
        
        setTimeout(() => {
          setPlayerAttacking(true);
          setTimeout(() => setPlayerAttacking(false), 400);
        }, 300);
        
        setPlayer(prev => ({ ...prev, health: newPlayerHealth }));
        
        if (newPlayerHealth <= 0) {
          setBattleLog(prev => [...prev, "💀 Défaite ! Le Bot vous a vaincu !"]);
          setShowDefeat(true);
          setTimeout(() => setShowDefeat(false), 3000);
          setTimeout(() => {
            setGameStarted(false);
            setGameMode(null);
          }, 2000);
        }
      } else {
        // Bot rate sa réponse
        setBattleLog(prev => [...prev, `❌ ${enemy.name} se trompe ! Son attaque échoue !`]);
      }
    }, thinkingTime);
  };

  const enemyAttack = () => {
    if (enemy.health <= 0) return;
    
    // Enemy attack animation
    setEnemyAttacking(true);
    setTimeout(() => setEnemyAttacking(false), 600);
    
    // Variable damage based on enemy type
    let baseDamage = enemy.attack;
    let variation = Math.floor(Math.random() * 12) - 6; // -6 to +6 variation
    const damage = Math.max(1, baseDamage - player.defense + variation);
    const newPlayerHealth = Math.max(0, player.health - damage);
    
    // Player shake animation on hit
    setTimeout(() => {
      setPlayerAttacking(true);
      setTimeout(() => setPlayerAttacking(false), 400);
    }, 300);
    
    setPlayer(prev => ({ ...prev, health: newPlayerHealth }));
    setBattleLog(prev => [...prev, `💥 ${enemy.name} vous attaque et inflige ${damage} dégâts !`]);
    
    if (newPlayerHealth <= 0) {
      setBattleLog(prev => [...prev, "💀 Défaite ! Vous avez été vaincu !"]);
      // Show defeat animation
      setShowDefeat(true);
      setTimeout(() => setShowDefeat(false), 3000);
      setTimeout(() => {
        setGameStarted(false);
      }, 2000);
    } else {
      setCurrentTurn('player');
    }
  };

  const healPlayer = () => {
    const question = getRandomQuestion();
    setCurrentQuestion(question);
    setSelectedChoice('');
    setShowResult(false);
    setIsHealingQuestion(true);
    
    // Start 5 second timer for healing question (increased difficulty)
    startTimer(5, () => {
      if (!showResult) {
        setBattleLog(prev => [...prev, "⏰ Temps écoulé ! Votre soin échoue !"]);
        setCurrentQuestion(null);
        setIsHealingQuestion(false);
        
        // En mode online, envoyer une action ratée (0 dégâts) pour passer le tour
        if (gameMode === 'online' && onlineGameStarted) {
          console.log('⏰ TIMEOUT: Sending failed heal to switch turn');
          sendAnswer(false, 0, player.health);
        } else if (gameMode === 'local') {
          // En mode local, l'ennemi attaque
          startTimer(3, enemyAttack);
        }
      }
    });
  };

  const handleHealSubmit = () => {
    if (!currentQuestion || selectedChoice === '') return;
    
    // En mode online, vérifier si c'est notre tour
    if (gameMode === 'online' && onlineGameStarted && !isMyTurn) {
      setBattleLog(prev => [...prev, "❌ Ce n'est pas votre tour !"]);
      return;
    }
    
    // Stop timer
    setTimerActive(false);
    setTimeRemaining(0);
    
    const isCorrect = checkAnswer(selectedChoice, currentQuestion.correct);
    setAnswerCorrect(isCorrect);
    setShowResult(true);
    
    if (isCorrect) {
      // Check if player has enough mana for healing
      if (player.mana >= 20) {
        const healAmount = Math.floor(player.maxHealth * 0.3); // 30% of max health
        const newHealth = Math.min(player.maxHealth, player.health + healAmount);
        setPlayer(prev => ({ 
          ...prev, 
          health: newHealth,
          mana: prev.mana - 20 // Cost mana for healing
        }));
        setBattleLog(prev => [...prev, `💚 Bonne réponse ! Vous récupérez ${healAmount} PV et dépensez 20 mana !`]);
        
        // En mode online, mettre à jour la santé via WebSocket
        if (gameMode === 'online' && onlineGameStarted) {
          updateHealth(newHealth);
        }
      } else {
        setBattleLog(prev => [...prev, "🔵 Bonne réponse mais pas assez de mana ! (20 requis)"]);
      }
    } else {
      setBattleLog(prev => [...prev, "❌ Mauvaise réponse ! Votre soin échoue !"]);
      // Lose more mana on failed heal
      setPlayer(prev => ({ 
        ...prev, 
        mana: Math.max(0, prev.mana - 10)
      }));
    }
    
    // En mode local, enemy attaque après
    if (gameMode === 'local') {
      startTimer(3, enemyAttack);
    }
    
    startTimer(5, () => {
      setCurrentQuestion(null);
      setShowResult(false);
      setIsHealingQuestion(false);
    });
  };

  const spawnNewEnemy = () => {
    const currentArenaInfo = arenaTypes[arenaType];
    const arenaEnemyNames = currentArenaInfo.enemies;
    
    // Choix cyclique des ennemis spécifiques à l'arène
    const enemyIndex = arenaEnemiesDefeated % arenaEnemyNames.length;
    const selectedName = arenaEnemyNames[enemyIndex];
    
    // Statistiques basées sur l'arène et la difficulté
    const difficultyMultipliers = {
      'normal': 1,
      'hard': 1.4,
      'expert': 1.8
    };
    
    const arenaMultiplier = difficultyMultipliers[currentArenaInfo.bonus.difficulty];
    const progressionMultiplier = 1 + (currentArena - 1) * 0.3;
    const finalMultiplier = arenaMultiplier * progressionMultiplier;
    
    const baseHealth = Math.floor((100 + (currentArena * 20)) * finalMultiplier);
    const baseAttack = Math.floor((18 + (currentArena * 4)) * finalMultiplier);
    const baseDefense = Math.floor((8 + (currentArena * 2)) * finalMultiplier);
    
    // Types d'ennemis basés sur l'arène
    const arenaEnemyTypes = {
      'cyber_fortress': 'ai_guardian',
      'data_vault': 'crypto_master', 
      'network_maze': 'network_demon'
    };
    
    // Emojis spécifiques à chaque arène
    const arenaEmojis = {
      'cyber_fortress': ['🤖', '🛡️', '⚡'],
      'data_vault': ['🔐', '💎', '🗝️'],
      'network_maze': ['🕷️', '🌐', '⚡']
    };
    
    const enemyEmoji = arenaEmojis[arenaType][enemyIndex % arenaEmojis[arenaType].length];
    
    setEnemy({
      name: selectedName,
      health: baseHealth,
      maxHealth: baseHealth,
      attack: baseAttack,
      defense: baseDefense,
      type: arenaEnemyTypes[arenaType] || 'hacker',
      emoji: enemyEmoji,
      difficulty: currentArenaInfo.bonus.difficulty,
      arenaType: arenaType,
      abilities: [`Attaque ${currentArenaInfo.bonus.difficulty}`, 'Résistance Cyber']
    });
    
    setBattleLog(prev => [...prev, 
      `🆕 [${currentArenaInfo.name}] ${selectedName} apparaît !`,
      `💀 Difficulté: ${currentArenaInfo.bonus.difficulty.toUpperCase()} | 💪 PV: ${baseHealth}`
    ]);
    setCurrentTurn('player');
  };

  const completeArena = () => {
    const currentArenaInfo = arenaTypes[arenaType];
    const baseReward = currentArena * 100;
    const arenaMultipliedReward = Math.floor(baseReward * currentArenaInfo.bonus.exp);
    const totalReward = arenaMultipliedReward + arenaBonus;
    const manaReward = 30;
    
    setBattleLog(prev => [...prev, 
      `🏆 ARÈNE ${currentArena} TERMINÉE !`,
      `🎯 ${currentArenaInfo.name} conquise !`,
      `💰 +${totalReward} XP (${Math.round((currentArenaInfo.bonus.exp - 1) * 100)}% bonus) | ⚡ +${manaReward} Mana`,
      `📚 Vous maîtrisez mieux la cybersécurité !`
    ]);
    
    setPlayer(prev => ({ 
      ...prev, 
      experience: prev.experience + totalReward,
      mana: Math.min(prev.maxMana, prev.mana + manaReward)
      // Ne PAS restaurer la santé automatiquement entre les arènes
      // Le joueur doit utiliser "Se soigner" pour récupérer des PV
    }));
    
    // Advance to next arena
    setCurrentArena(prev => prev + 1);
    setArenaEnemiesDefeated(0);
    setTotalArenaEnemies(Math.min(5, 3 + Math.floor(currentArena / 2))); // More enemies per arena
    setArenaBonus(0);
    
    setTimeout(() => {
      spawnNewEnemy();
    }, 3000);
  };

  return (
    <>
      <NavBar />
      <div className="cyber-game">
        {/* Notification Toast */}
        {notification && (
          <div className={`notification-toast ${notification.type}`}>
            {notification.type === 'success' && '✅ '}
            {notification.type === 'warning' && '⚠️ '}
            {notification.type === 'error' && '❌ '}
            {notification.message}
          </div>
        )}
        
        <div className="game-header">
          <h1>{t('cyberGameTitle')}</h1>
        
        {!gameStarted && (
          <>
            {/* Info Panel Toggle for Setup */}
            <button 
              className={`info-toggle-btn ${showInfoPanel ? 'active' : ''}`}
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              title="Informations sur le niveau et la force"
            >
              ℹ️
            </button>
            
            {/* Info Panel for Setup */}
            {showInfoPanel && (
              <div className="info-panel">
                <div className="info-panel-header">
                  <h3>📊 Guide du Débutant</h3>
                  <button 
                    className="close-info-btn"
                    onClick={() => setShowInfoPanel(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="info-content">
                  <div className="info-tip">
                    <h4>🎯 Comment Gagner en Force</h4>
                    <p><strong>Votre niveau détermine votre succès !</strong></p>
                    <ul>
                      <li>🎮 Jouez pour gagner de l'expérience (XP)</li>
                      <li>⭐ Montez de niveau automatiquement</li>
                      <li>💪 Chaque niveau = +3 ATK, +2 DEF, +15 PV, +10 Mana</li>
                      <li>🏆 Plus de niveau = Arènes plus faciles à battre</li>
                    </ul>
                  </div>
                  
                  <div className="stat-section">
                    <h4>🏛️ Difficulté des Arènes</h4>
                    <div className="arena-difficulty-guide">
                      <div className="difficulty-item">
                        <span className="difficulty normal">NORMAL</span>
                        <span>🏰 Forteresse - Idéal pour débuter</span>
                      </div>
                      <div className="difficulty-item">
                        <span className="difficulty hard">HARD</span>
                        <span>🔐 Coffre-fort - Pour joueurs expérimentés</span>
                      </div>
                      <div className="difficulty-item">
                        <span className="difficulty expert">EXPERT</span>
                        <span>🌐 Labyrinthe - Défi ultime</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="current-stats">
                    <h4>📈 Vos Stats Actuelles</h4>
                    <div className="stat-grid">
                      <div className="stat-item">
                        <span className="stat-label">⭐ Niveau</span>
                        <span className="stat-value">{player.level}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">⚔️ Attaque</span>
                        <span className="stat-value">{player.attack}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">🛡️ Défense</span>
                        <span className="stat-value">{player.defense}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">❤️ PV Max</span>
                        <span className="stat-value">{player.maxHealth}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">⚡ Mana Max</span>
                        <span className="stat-value">{player.maxMana}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">📊 XP Total</span>
                        <span className="stat-value">{player.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {!gameStarted && !gameMode && (
          <div className="game-mode-selection">
            <h1 className="mode-title">🎮 CyberGame</h1>
            <p className="mode-subtitle">{t('chooseGameMode')}</p>
            
            <div className="mode-cards">
              <div className="mode-card local" onClick={() => setGameMode('local')}>
                <div className="mode-icon">🤖</div>
                <h3>{t('localMode')}</h3>
                <p>{t('localModeDesc')}</p>
                <ul className="mode-features">
                  <li>{t('localModeFeature1')}</li>
                  <li>{t('localModeFeature2')}</li>
                  <li>{t('localModeFeature3')}</li>
                  <li>{t('localModeFeature4')}</li>
                </ul>
                <button className="mode-btn">
                  <span>{t('playLocal')}</span>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
              
              <div className="mode-card online" onClick={() => {
                setGameMode('online');
                setShowRoomInterface(true);
              }}>
                <div className="mode-icon">🌐</div>
                <h3>{t('onlineMode')}</h3>
                <p>{t('onlineModeDesc')}</p>
                <ul className="mode-features">
                  <li>{t('onlineModeFeature1')}</li>
                  <li>{t('onlineModeFeature2')}</li>
                  <li>{t('onlineModeFeature3')}</li>
                  <li>{t('onlineModeFeature4')}</li>
                </ul>
                <button className="mode-btn online">
                  <span>{t('playOnline')}</span>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
            
            <button className="back-btn" onClick={() => navigate('/')}>
              {t('backToHome')}
            </button>
          </div>
        )}
        
        {/* Interface de salle pour le mode en ligne */}
        {!gameStarted && gameMode === 'online' && showRoomInterface && !roomCode && (
          <div className="online-room-interface">
            <h1 className="room-title">🌐 Mode En Ligne</h1>
            <p className="room-subtitle">
              {isConnected ? '✅ Connecté au serveur' : '⏳ Connexion au serveur...'}
            </p>

            {socketError && (
              <div className="error-message">
                ❌ {socketError}
              </div>
            )}

            {!roomAction && (
              <div className="room-actions">
                <div className="room-action-card" onClick={() => setRoomAction('create')}>
                  <div className="action-icon">🎮</div>
                  <h3>{t('createRoom')}</h3>
                  <p>Créez une salle privée et partagez le code avec un ami</p>
                  <button className="action-btn">
                    {t('createRoom')} →
                  </button>
                </div>

                <div className="room-action-card" onClick={() => setRoomAction('join')}>
                  <div className="action-icon">🔗</div>
                  <h3>{t('joinRoom')}</h3>
                  <p>Entrez le code d'une salle existante pour rejoindre la partie</p>
                  <button className="action-btn">
                    {t('joinRoom')} →
                  </button>
                </div>
              </div>
            )}

            {roomAction === 'create' && (
              <div className="room-form">
                <h2>{t('createRoomTitle')}</h2>
                <div className="form-group">
                  <label>{t('playerName')}</label>
                  <input
                    type="text"
                    placeholder={t('enterPlayerName')}
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                    maxLength={20}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="btn-create"
                    onClick={() => {
                      if (playerNameInput.trim()) {
                        createRoom(playerNameInput);
                      }
                    }}
                    disabled={!playerNameInput.trim() || !isConnected}
                  >
                    🎮 Créer la Salle
                  </button>
                  <button 
                    className="btn-back"
                    onClick={() => {
                      setRoomAction(null);
                      setPlayerNameInput('');
                    }}
                  >
                    ← Retour
                  </button>
                </div>
              </div>
            )}

            {roomAction === 'join' && (
              <div className="room-form">
                <h2>{t('joinRoomTitle')}</h2>
                <div className="form-group">
                  <label>{t('playerName')}</label>
                  <input
                    type="text"
                    placeholder={t('enterPlayerName')}
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                    maxLength={20}
                  />
                </div>
                <div className="form-group">
                  <label>Code de la Salle</label>
                  <input
                    type="text"
                    placeholder="Ex: ABC123"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem' }}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="btn-join"
                    onClick={() => {
                      if (playerNameInput.trim() && roomCodeInput.trim()) {
                        joinRoom(roomCodeInput, playerNameInput);
                      }
                    }}
                    disabled={!playerNameInput.trim() || !roomCodeInput.trim() || !isConnected}
                  >
                    🔗 Rejoindre la Salle
                  </button>
                  <button 
                    className="btn-back"
                    onClick={() => {
                      setRoomAction(null);
                      setPlayerNameInput('');
                      setRoomCodeInput('');
                    }}
                  >
                    ← Retour
                  </button>
                </div>
              </div>
            )}

            <button className="back-btn" onClick={() => {
              setGameMode(null);
              setShowRoomInterface(false);
              setRoomAction(null);
            }}>
              ← Retour au menu
            </button>
          </div>
        )}

        {/* Salle d'attente pour le mode en ligne */}
        {!gameStarted && gameMode === 'online' && roomCode && !onlineGameStarted && (
          <div className="waiting-room">
            <h1 className="room-title">🎮 Salle de Jeu</h1>
            
            <div className="room-code-display">
              <h2>Code de la Salle</h2>
              <div className="code-box">{roomCode}</div>
              <p className="code-hint">Partagez ce code avec votre adversaire</p>
            </div>

            <div className="players-waiting">
              <div className="player-card you">
                <span className="player-icon">👤</span>
                <span className="player-name">{onlinePlayerName || playerNameInput}</span>
                <span className="player-status">✅ Prêt</span>
              </div>

              {opponent ? (
                <div className="player-card opponent">
                  <span className="player-icon">👤</span>
                  <span className="player-name">{opponent}</span>
                  <span className="player-status">✅ Prêt</span>
                </div>
              ) : (
                <div className="player-card waiting">
                  <span className="player-icon">⏳</span>
                  <span className="player-name">En attente...</span>
                  <span className="player-status">Partagez le code</span>
                </div>
              )}
            </div>

            {opponent && (
              <button className="btn-start-game" onClick={startOnlineGame}>
                ⚔️ Commencer la Partie
              </button>
            )}

            <button className="btn-leave" onClick={() => {
              leaveRoom();
              setShowRoomInterface(true);
            }}>
              🚪 Quitter la Salle
            </button>
          </div>
        )}

        {!gameStarted && gameMode && !showRoomInterface && (
          <div className="game-setup">
            <div className="mode-indicator">
              <span className="mode-badge">
                {gameMode === 'local' ? '🤖 Mode Local' : '🌐 Mode En Ligne'}
              </span>
              <button className="change-mode-btn" onClick={() => setGameMode(null)}>
                ↩️ Changer de mode
              </button>
            </div>
            
            <h2>🎯 Choisissez votre module de combat :</h2>
            
            {gameMode === 'local' && (
              <div className="bot-difficulty-selector">
                <h3>🤖 Difficulté du Bot IA</h3>
                <div className="difficulty-buttons">
                  <button 
                    className={`difficulty-btn easy ${botDifficulty === 'easy' ? 'active' : ''}`}
                    onClick={() => setBotDifficulty('easy')}
                  >
                    <span className="diff-icon">😊</span>
                    <span className="diff-label">Facile</span>
                    <span className="diff-desc">40% précision</span>
                  </button>
                  <button 
                    className={`difficulty-btn medium ${botDifficulty === 'medium' ? 'active' : ''}`}
                    onClick={() => setBotDifficulty('medium')}
                  >
                    <span className="diff-icon">😐</span>
                    <span className="diff-label">Moyen</span>
                    <span className="diff-desc">60% précision</span>
                  </button>
                  <button 
                    className={`difficulty-btn hard ${botDifficulty === 'hard' ? 'active' : ''}`}
                    onClick={() => setBotDifficulty('hard')}
                  >
                    <span className="diff-icon">😤</span>
                    <span className="diff-label">Difficile</span>
                    <span className="diff-desc">80% précision</span>
                  </button>
                </div>
              </div>
            )}
            
            <div className="arena-selector">
              <h3>🏛️ Choisissez votre Arène de Combat</h3>
              <div className="arena-grid">
                {Object.entries(arenaTypes).map(([key, arena]) => (
                  <div 
                    key={key}
                    className={`arena-card ${arenaType === key ? 'selected' : ''}`}
                    onClick={() => setArenaType(key)}
                  >
                    <div className="arena-icon" style={{ color: arena.color }}>
                      {arena.icon}
                    </div>
                    <div className="arena-info">
                      <h4>{arena.name}</h4>
                      <p>{arena.description}</p>
                      <div className="arena-stats">
                        <span className="exp-bonus">+{Math.round((arena.bonus.exp - 1) * 100)}% EXP</span>
                        <span className={`difficulty ${arena.bonus.difficulty}`}>
                          {arena.bonus.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <div className="arena-enemies">
                        {arena.enemies.map((enemy, idx) => (
                          <span key={idx} className="enemy-preview">{enemy}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="module-selector">
              <button 
                className={`module-btn global ${selectedModule === 'global' ? 'active' : ''}`}
                onClick={() => setSelectedModule('global')}
              >
                <span className="module-icon">🌟</span>
                <span className="module-text">
                  <strong>Global</strong>
                  <small>Tous les modules</small>
                </span>
              </button>
              <button 
                className={`module-btn ${selectedModule === 'cryptography' ? 'active' : ''}`}
                onClick={() => setSelectedModule('cryptography')}
              >
                <span className="module-icon">🔐</span>
                <span className="module-text">
                  <strong>Cryptographie</strong>
                  <small>AES, PKI, Hachage</small>
                </span>
              </button>
              <button 
                className={`module-btn ${selectedModule === 'web_security' ? 'active' : ''}`}
                onClick={() => setSelectedModule('web_security')}
              >
                <span className="module-icon">🌐</span>
                <span className="module-text">
                  <strong>Sécurité Web</strong>
                  <small>XSS, SQL, CSRF</small>
                </span>
              </button>
            </div>
            <button className="start-btn" onClick={startBattle}>
              ⚔️ Commencer le Combat
            </button>
          </div>
        )}
      </div>

      {gameStarted && (
        <div className="game-arena">
          {/* Info Panel Toggle */}
          <button 
            className={`info-toggle-btn ${showInfoPanel ? 'active' : ''}`}
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            title="Informations sur le niveau et la force"
          >
            ℹ️
          </button>
          
          {/* Info Panel */}
          {showInfoPanel && (
            <div className="info-panel">
              <div className="info-panel-header">
                <h3>📊 Statistiques du Joueur</h3>
                <button 
                  className="close-info-btn"
                  onClick={() => setShowInfoPanel(false)}
                >
                  ✕
                </button>
              </div>
              <div className="info-content">
                <div className="stat-section">
                  <h4>💪 Force Actuelle</h4>
                  <div className="stat-grid">
                    <div className="stat-item">
                      <span className="stat-label">⚔️ Attaque</span>
                      <span className="stat-value">{player.attack}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">🛡️ Défense</span>
                      <span className="stat-value">{player.defense}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">❤️ PV Max</span>
                      <span className="stat-value">{player.maxHealth}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">⚡ Mana Max</span>
                      <span className="stat-value">{player.maxMana}</span>
                    </div>
                  </div>
                </div>
                
                <div className="level-section">
                  <h4>⭐ Progression</h4>
                  <div className="level-info">
                    <span className="level-display">Niveau {player.level}</span>
                    <div className="exp-bar">
                      <div 
                        className="exp-fill"
                        style={{ width: `${(player.experience / player.experienceToNext) * 100}%` }}
                      ></div>
                    </div>
                    <span className="exp-text">{player.experience}/{player.experienceToNext} XP</span>
                  </div>
                </div>
                
                <div className="info-tip">
                  <h4>💡 Information Importante</h4>
                  <p>
                    <strong>Le niveau augmente automatiquement votre force !</strong>
                  </p>
                  <ul>
                    <li>🎯 Chaque niveau : +3 Attaque, +2 Défense</li>
                    <li>❤️ +15 Points de Vie maximum</li>
                    <li>⚡ +10 Mana maximum</li>
                    <li>🏆 Plus de force = Arènes plus faciles</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Level Up Animation */}
          {showLevelUp && (
            <div className="level-up-animation">
              <div className="level-up-content">
                <h2>🌟 NIVEAU SUPÉRIEUR ! 🌟</h2>
                <p>Niveau {player.level}</p>
                <div className="level-up-stats">
                  <span>⚔️ +3 ATK</span>
                  <span>🛡️ +2 DEF</span>
                  <span>❤️ +15 PV</span>
                  <span>⚡ +10 MANA</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Victory Animation */}
          {showVictory && (
            <div className="victory-animation">
              <div className="victory-content">
                <h2>🎉 ARÈNE TERMINÉE ! 🎉</h2>
                <p>Excellent travail, Cyber Defender !</p>
              </div>
            </div>
          )}
          
          {/* Defeat Animation */}
          {showDefeat && (
            <div className="defeat-animation">
              <div className="defeat-content">
                <h2>💀 DÉFAITE 💀</h2>
                <p>Continuez à apprendre et réessayez !</p>
              </div>
            </div>
          )}
          {/* Arena Information Panel */}
          <div className="arena-info">
            <div className="arena-header">
              <div className="arena-title-section">
                <h2 className="arena-title">
                  {arenaTypes[arenaType].icon} {arenaTypes[arenaType].name} - Arène {currentArena}
                </h2>
                <span className={`arena-difficulty-badge ${arenaTypes[arenaType].bonus.difficulty}`}>
                  {arenaTypes[arenaType].bonus.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="arena-progress">
                <span className="progress-text">Ennemis vaincus: {arenaEnemiesDefeated}/{totalArenaEnemies}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(arenaEnemiesDefeated / totalArenaEnemies) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="arena-rewards">
                <span className="reward-info">
                  🏆 Récompense: {Math.floor((currentArena * 100) * arenaTypes[arenaType].bonus.exp) + arenaBonus} XP
                </span>
                <span className="bonus-info">
                  ⚡ Bonus: +{Math.round((arenaTypes[arenaType].bonus.exp - 1) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="characters">
            <div className={`character player ${playerAttacking ? 'shaking' : ''}`}>
              <div className="character-avatar">🛡️</div>
              <div className="character-info">
                <h3>{player.name}</h3>
                <div className="health-bar">
                  <div 
                    className="health-fill player-health" 
                    style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                  ></div>
                  <span className="health-text">{player.health}/{player.maxHealth}</span>
                </div>
                <div className="health-bar mana-bar">
                  <div 
                    className="health-fill mana-fill" 
                    style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
                  ></div>
                  <span className="health-text mana-text">{player.mana}/{player.maxMana} ⚡</span>
                </div>
                <div className="stats">
                  <span>⚔️ {player.attack}</span>
                  <span>🛡️ {player.defense}</span>
                  <span>⭐ Niv. {player.level}</span>
                </div>
                <div className="experience-bar">
                  <div className="exp-label">
                    <span>💫 Expérience</span>
                    <span className="exp-numbers">{player.experience}/{player.experienceToNext}</span>
                  </div>
                  <div className="exp-progress-bar">
                    <div 
                      className="exp-progress-fill"
                      style={{ width: `${(player.experience / player.experienceToNext) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="vs-indicator">
              <span>VS</span>
            </div>

            <div className={`character enemy ${enemyAttacking ? 'shaking' : ''}`}>
              <div className="character-avatar">{enemy.emoji || '👾'}</div>
              <div className="character-info">
                <h3>{enemy.name}</h3>
                <div className="health-bar">
                  <div 
                    className="health-fill enemy-health" 
                    style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                  ></div>
                  <span className="health-text">{enemy.health}/{enemy.maxHealth}</span>
                </div>
                <div className="stats">
                  <span>⚔️ {enemy.attack}</span>
                  <span>🛡️ {enemy.defense}</span>
                  <span className="difficulty-badge">{enemy.difficulty?.toUpperCase()}</span>
                </div>
                <div className="enemy-abilities">
                  <span className="abilities-label">🔥 Capacités:</span>
                  {enemyTypes[enemy.type]?.abilities.map((ability, index) => (
                    <span key={index} className="ability-tag">{ability}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Indicateur de tour pour le mode online */}
          {gameMode === 'online' && onlineGameStarted && (
            <div className={`turn-indicator ${isMyTurn ? 'your-turn' : 'opponent-turn'}`}>
              {isMyTurn ? (
                <>
                  <span className="turn-icon">✨</span>
                  <span className="turn-text">C'est votre tour !</span>
                </>
              ) : (
                <>
                  <span className="turn-icon">⏳</span>
                  <span className="turn-text">Tour de l'adversaire...</span>
                </>
              )}
            </div>
          )}

          {currentQuestion && (
            <div className={`question-panel ${isHealingQuestion ? 'healing' : ''}`}>
              <div className="question-header">
                <span className="question-type">
                  {isHealingQuestion ? t('healQuestion') : t('attackQuestion')}
                </span>
                <span className="question-module">
                  {currentQuestion.id <= 5 ? '🔐 Cryptographie' : '🌐 Sécurité Web'}
                </span>
                <span className={`question-timer ${timeRemaining <= 3 ? 'urgent' : ''}`}>
                  ⏱️ {timerActive ? `${timeRemaining}s` : 'Répondez !'}
                </span>
              </div>
              <p className="question">{currentQuestion.question}</p>
              
              {!showResult && (
                <div className="answer-section">
                  <div className="choices-grid">
                    {currentQuestion.choices.map((choice, index) => (
                      <button
                        key={index}
                        className={`choice-btn ${selectedChoice === index.toString() ? 'selected' : ''}`}
                        onClick={() => setSelectedChoice(index.toString())}
                      >
                        <span className="choice-letter">{String.fromCharCode(65 + index)}.</span>
                        <span className="choice-text">{choice}</span>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={isHealingQuestion ? handleHealSubmit : handleAnswerSubmit} 
                    className={`submit-btn ${selectedChoice === '' ? 'disabled' : ''} ${isHealingQuestion ? 'heal-submit' : ''}`}
                    disabled={selectedChoice === ''}
                  >
                    {isHealingQuestion ? t('healAction') : t('attackAction')}
                  </button>
                </div>
              )}

              {showResult && (
                <div className={`result ${answerCorrect ? 'correct' : 'incorrect'}`}>
                  <p className="result-text">
                    {answerCorrect ? '✅ Correct !' : '❌ Incorrect !'}
                  </p>
                  <p className="explanation">{currentQuestion.explanation}</p>
                  <p className="correct-answer">
                    Bonne réponse : {String.fromCharCode(65 + currentQuestion.correct)}. {currentQuestion.choices[currentQuestion.correct]}
                  </p>
                </div>
              )}
            </div>
          )}

          {!currentQuestion && currentTurn === 'player' && player.health > 0 && enemy.health > 0 && (
            <div className="action-panel">
              <div className="action-buttons-grid">
                <button 
                  onClick={playerAttack} 
                  className="action-btn attack-btn"
                  disabled={gameMode === 'online' && onlineGameStarted && !isMyTurn}
                >
                  <div className="btn-icon">⚔️</div>
                  <div className="btn-content">
                    <span className="btn-title">ATTAQUER</span>
                    <span className="btn-subtitle">Répondre à une question de cybersécurité</span>
                  </div>
                  <div className="btn-effect"></div>
                </button>
                <button 
                  onClick={healPlayer} 
                  className="action-btn heal-btn"
                  disabled={player.health === player.maxHealth || player.mana < 20 || (gameMode === 'online' && onlineGameStarted && !isMyTurn)}
                >
                  <div className="btn-icon">💚</div>
                  <div className="btn-content">
                    <span className="btn-title">SE SOIGNER</span>
                    <span className="btn-subtitle">Récupère {Math.floor(player.maxHealth * 0.3)} PV • Coûte 20 ⚡</span>
                  </div>
                  <div className="btn-effect"></div>
                </button>
              </div>
            </div>
          )}

          <div className="battle-log">
            <h3>📜 Journal de Combat</h3>
            {botThinking && gameMode === 'local' && (
              <div className="bot-thinking-indicator">
                <span className="thinking-dots">🤖 Le bot réfléchit</span>
                <span className="dots">...</span>
              </div>
            )}
            <div className="log-entries">
              {battleLog.map((entry, index) => (
                <div key={index} className="log-entry">
                  {entry}
                </div>
              ))}
            </div>
          </div>

          {(player.health <= 0 || enemy.health <= 0) && (
            <div className="game-over">
              <button onClick={() => setGameStarted(false)} className="restart-btn">
                🔄 Nouvelle Partie
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};

export default CyberGame;