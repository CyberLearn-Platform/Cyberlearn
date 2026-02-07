import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "./NewLeaderboard.css";
import { io } from "socket.io-client";

const NewLeaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUser(user);
    }
    fetchLeaderboard();

    // 🔄 CONNEXION WEBSOCKET POUR MISES À JOUR EN TEMPS RÉEL
    const socket = io("http://localhost:5000", {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('🔌 [LEADERBOARD] Connecté au serveur WebSocket');
    });

    // Écouter les mises à jour du leaderboard
    socket.on('leaderboard_update', (data) => {
      console.log('📡 [LEADERBOARD] Mise à jour reçue:', data);
      
      // Afficher une notification
      showNotification(data.message);
      
      // Recharger le leaderboard automatiquement
      fetchLeaderboard();
    });

    socket.on('disconnect', () => {
      console.log('🔌 [LEADERBOARD] Déconnecté du serveur WebSocket');
    });

    // ÉCOUTER L'ÉVÉNEMENT DE MONTÉE DE NIVEAU
    const handleForceRefresh = () => {
      console.log('🔄 [LEADERBOARD] Rechargement forcé suite à une montée de niveau');
      fetchLeaderboard();
    };

    window.addEventListener('forceLeaderboardRefresh', handleForceRefresh);

    // RAFRAÎCHISSEMENT AUTOMATIQUE TOUTES LES 10 SECONDES
    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 [LEADERBOARD] Rafraîchissement automatique...');
      fetchLeaderboard();
    }, 10000); // 10 secondes

    // Nettoyer la connexion quand le composant est démonté
    return () => {
      socket.disconnect();
      window.removeEventListener('forceLeaderboardRefresh', handleForceRefresh);
      clearInterval(autoRefreshInterval);
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/leaderboard");
      const data = await response.json();
      console.log("📊 [LEADERBOARD] Données chargées:", data);
      setLeaderboardData(data);
    } catch (error) {
      console.error("❌ [LEADERBOARD] Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message) => {
    // Créer une notification en haut de l'écran
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      font-weight: 600;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = `🎉 ${message}`;
    document.body.appendChild(notification);

    // Supprimer après 3 secondes
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return "rank-gold";
    if (rank === 2) return "rank-silver";
    if (rank === 3) return "rank-bronze";
    return "";
  };

  const getLevelColor = (level) => {
    if (level >= 50) return "#FFD700";
    if (level >= 30) return "#C0C0C0";
    if (level >= 10) return "#CD7F32";
    return "#4ECDC4";
  };

  const formatXP = (xp) => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp;
  };

  const getPlayerBadge = (level, xp) => {
    if (xp >= 100000) return { name: "🏆 Legend", color: "#FFD700" };
    if (xp >= 50000) return { name: "⚔️ Master", color: "#E5E4E2" };
    if (xp >= 20000) return { name: "🛡️ Expert", color: "#CD7F32" };
    if (xp >= 5000) return { name: "⚡ Advanced", color: "#4ECDC4" };
    return { name: "🌟 Beginner", color: "#95E1D3" };
  };

  const filteredData = leaderboardData.filter(player => 
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="leaderboard-page">
        <NavBar />
        <div className="leaderboard-container">
          <div className="loading-screen">
            <div className="cyber-loader">
              <div className="loader-ring"></div>
              <div className="loader-ring"></div>
              <div className="loader-ring"></div>
              <span className="loader-text">LOADING RANKINGS...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <NavBar />
      <div className="leaderboard-container">
        <div className="cyber-background">
          <div className="cyber-grid"></div>
          <div className="cyber-lines"></div>
        </div>

        <div className="leaderboard-header">
          <div className="header-content">
            <div className="title-section">
              <div className="title-badge">GLOBAL RANKINGS</div>
              <h1 className="main-title">
                <span className="title-icon">🏆</span>
                HALL OF FAME
                <span className="title-glow"></span>
              </h1>
              <p className="subtitle">Elite CyberForge Warriors • Real-Time Leaderboard</p>
            </div>
            
            <div className="stats-summary">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-value">{leaderboardData.length}</div>
                  <div className="stat-label">Total Players</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-info">
                  <div className="stat-value">
                    {formatXP(leaderboardData[0]?.xp || 0)}
                  </div>
                  <div className="stat-label">Top XP</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <div className="stat-value">
                    {leaderboardData.findIndex(p => p.username === currentUser?.username) + 1 || "-"}
                  </div>
                  <div className="stat-label">Your Rank</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {filteredData.length >= 3 && (
          <div className="podium-section">
            <div className="podium-container">
              <div className="podium-position second-place">
                <div className="podium-card">
                  <div className="rank-medal">🥈</div>
                  <div className="player-avatar-container">
                    <div className="avatar-glow silver"></div>
                    <div className="player-avatar silver">
                      {filteredData[1].username[0].toUpperCase()}
                    </div>
                    <div className="level-badge" style={{ background: getLevelColor(filteredData[1].level) }}>
                      Lv {filteredData[1].level}
                    </div>
                  </div>
                  <h3 className="player-username">{filteredData[1].username}</h3>
                  <div className="player-badge" style={{ color: getPlayerBadge(filteredData[1].level, filteredData[1].xp).color }}>
                    {getPlayerBadge(filteredData[1].level, filteredData[1].xp).name}
                  </div>
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-label">XP</span>
                      <span className="stat-value">{formatXP(filteredData[1].xp)}</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                      <span className="stat-label">Score</span>
                      <span className="stat-value">{formatXP(filteredData[1].score)}</span>
                    </div>
                  </div>
                </div>
                <div className="podium-base second">
                  <span className="base-rank">#2</span>
                </div>
              </div>

              <div className="podium-position first-place">
                <div className="podium-card champion">
                  <div className="champion-crown">👑</div>
                  <div className="rank-medal">🥇</div>
                  <div className="player-avatar-container">
                    <div className="avatar-glow gold"></div>
                    <div className="player-avatar gold">
                      {filteredData[0].username[0].toUpperCase()}
                    </div>
                    <div className="level-badge champion-level" style={{ background: getLevelColor(filteredData[0].level) }}>
                      Lv {filteredData[0].level}
                    </div>
                  </div>
                  <h3 className="player-username champion-name">{filteredData[0].username}</h3>
                  <div className="player-badge champion-badge" style={{ color: getPlayerBadge(filteredData[0].level, filteredData[0].xp).color }}>
                    {getPlayerBadge(filteredData[0].level, filteredData[0].xp).name}
                  </div>
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-label">XP</span>
                      <span className="stat-value">{formatXP(filteredData[0].xp)}</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                      <span className="stat-label">Score</span>
                      <span className="stat-value">{formatXP(filteredData[0].score)}</span>
                    </div>
                  </div>
                </div>
                <div className="podium-base first">
                  <span className="base-rank">#1</span>
                </div>
              </div>

              <div className="podium-position third-place">
                <div className="podium-card">
                  <div className="rank-medal">🥉</div>
                  <div className="player-avatar-container">
                    <div className="avatar-glow bronze"></div>
                    <div className="player-avatar bronze">
                      {filteredData[2].username[0].toUpperCase()}
                    </div>
                    <div className="level-badge" style={{ background: getLevelColor(filteredData[2].level) }}>
                      Lv {filteredData[2].level}
                    </div>
                  </div>
                  <h3 className="player-username">{filteredData[2].username}</h3>
                  <div className="player-badge" style={{ color: getPlayerBadge(filteredData[2].level, filteredData[2].xp).color }}>
                    {getPlayerBadge(filteredData[2].level, filteredData[2].xp).name}
                  </div>
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-label">XP</span>
                      <span className="stat-value">{formatXP(filteredData[2].xp)}</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                      <span className="stat-label">Score</span>
                      <span className="stat-value">{formatXP(filteredData[2].score)}</span>
                    </div>
                  </div>
                </div>
                <div className="podium-base third">
                  <span className="base-rank">#3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="ranking-table-section">
          <div className="section-title">
            <h2>Complete Rankings</h2>
            <div className="title-line"></div>
          </div>

          <div className="ranking-table">
            <div className="table-header">
              <div className="th rank-col">Rank</div>
              <div className="th player-col">Player</div>
              <div className="th badge-col">Badge</div>
              <div className="th level-col">Level</div>
              <div className="th xp-col">Experience</div>
              <div className="th score-col">Score</div>
            </div>

            <div className="table-body">
              {filteredData.map((player, index) => {
                const isCurrentUser = currentUser && player.username === currentUser.username;
                const badge = getPlayerBadge(player.level, player.xp);
                
                return (
                  <div
                    key={player.username}
                    className={`table-row ${isCurrentUser ? "current-user" : ""} ${getRankClass(index + 1)}`}
                  >
                    <div className="td rank-col">
                      <div className="rank-display">
                        <span className="rank-number">{getRankIcon(index + 1)}</span>
                      </div>
                    </div>
                    
                    <div className="td player-col">
                      <div className="player-cell">
                        <div
                          className="mini-avatar"
                          style={{
                            background: `linear-gradient(135deg, ${getLevelColor(player.level)}, #667eea)`,
                          }}
                        >
                          {player.username[0].toUpperCase()}
                        </div>
                        <div className="player-info">
                          <span className="username">
                            {player.username}
                            {isCurrentUser && <span className="you-tag">YOU</span>}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="td badge-col">
                      <span className="badge-tag" style={{ color: badge.color }}>
                        {badge.name}
                      </span>
                    </div>

                    <div className="td level-col">
                      <span className="level-display" style={{ color: getLevelColor(player.level) }}>
                        Lv {player.level}
                      </span>
                    </div>

                    <div className="td xp-col">
                      <div className="xp-display">
                        <span className="xp-amount">{formatXP(player.xp)}</span>
                        <span className="xp-label">XP</span>
                      </div>
                    </div>

                    <div className="td score-col">
                      <div className="score-display">
                        {formatXP(player.score)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {filteredData.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>No Players Found</h2>
            <p>Try adjusting your search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewLeaderboard;
