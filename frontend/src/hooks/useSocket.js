import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL } from '../config';

const SOCKET_URL = API_BASE_URL;

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Créer la connexion Socket.IO
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Nettoyer la connexion lors du démontage
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected
  };
};

export const useGameRoom = () => {
  const { socket, isConnected } = useSocket();
  const [roomCode, setRoomCode] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [opponentName, setOpponentName] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Écouter les événements de la salle
    socket.on('room_created', (data) => {
      console.log('Room created:', data);
      setRoomCode(data.room_code);
      setPlayerName(data.player_name);
      setError(null);
    });

    socket.on('room_joined', (data) => {
      console.log('Room joined:', data);
      setRoomCode(data.room_code);
      setPlayerName(data.player_name);
      setOpponentName(data.opponent_name);
      setOpponent(data.opponent_name);
      setError(null);
    });

    socket.on('opponent_joined', (data) => {
      console.log('Opponent joined:', data);
      setOpponent(data.opponent_name);
      setOpponentName(data.opponent_name);
      setNotification({ type: 'success', message: `${data.opponent_name} a rejoint la salle !` });
      setTimeout(() => setNotification(null), 3000);
    });

    socket.on('opponent_left', (data) => {
      console.log('Opponent left:', data);
      const wasInGame = gameStarted; // Garder l'état avant modification
      setOpponent(null);
      setOpponentName(null);
      setGameStarted(false);
      setNotification({ 
        type: 'warning', 
        message: data.message || 'Votre adversaire a quitté la salle.' 
      });
      setTimeout(() => setNotification(null), 5000);
      
      // Si on était en jeu, signaler la déconnexion pour redirection
      if (wasInGame) {
        setNotification({
          type: 'error',
          message: '⚠️ Votre adversaire a quitté la partie ! Retour à l\'accueil...'
        });
      }
    });

    socket.on('game_started', (data) => {
      console.log('Game started:', data);
      setGameStarted(true);
      setIsMyTurn(data.your_turn);
      // Mettre à jour les noms des joueurs depuis les données du serveur
      if (data.player_name) {
        setPlayerName(data.player_name);
      }
      if (data.opponent_name) {
        setOpponentName(data.opponent_name);
      }
    });

    socket.on('turn_changed', (data) => {
      console.log('Turn changed:', data);
      setIsMyTurn(data.your_turn);
    });

    // Note: opponent_attack et game_ended sont gérés dans CyberGame.js
    // pour avoir accès aux states du jeu

    socket.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('opponent_joined');
      socket.off('opponent_left');
      socket.off('game_started');
      socket.off('turn_changed');
      socket.off('error');
      // opponent_attack et game_ended sont nettoyés dans CyberGame.js
    };
  }, [socket]);

  const createRoom = (playerName) => {
    if (socket && isConnected) {
      socket.emit('create_room', { player_name: playerName });
    }
  };

  const joinRoom = (code, playerName) => {
    if (socket && isConnected) {
      socket.emit('join_room', { room_code: code, player_name: playerName });
    }
  };

  const startGame = () => {
    if (socket && isConnected) {
      socket.emit('start_game', {});
    }
  };

  const sendAnswer = (isCorrect, damage, newHealth) => {
    if (socket && isConnected) {
      socket.emit('player_answer', {
        is_correct: isCorrect,
        damage: damage,
        new_health: newHealth
      });
    }
  };

  const updateHealth = (health) => {
    if (socket && isConnected) {
      socket.emit('update_health', { health });
    }
  };

  const leaveRoom = () => {
    if (socket && isConnected) {
      socket.emit('leave_room', {});
      setRoomCode(null);
      setOpponent(null);
      setGameStarted(false);
    }
  };

  return {
    socket,
    isConnected,
    roomCode,
    opponent,
    gameStarted,
    isMyTurn,
    error,
    playerName,
    opponentName,
    notification,
    createRoom,
    joinRoom,
    startGame,
    sendAnswer,
    updateHealth,
    leaveRoom
  };
};
