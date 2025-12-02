import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { EXPERIENCE_SYSTEM, useUserExperience } from "../utils/experienceSystem";
import "./NewLeaderboard.css";

function NewLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const { getUserData } = useUserExperience();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Générer des données simulées pour le leaderboard
      const mockUsers = generateMockLeaderboard();
      
      // Ajouter l'utilisateur actuel s'il existe
      const currentUser = getUserData();
      if (currentUser.totalXp > 0) {
        const userEntry = {
          username: localStorage.getItem('username') || 'Vous',
          level: currentUser.level,
          totalXp: currentUser.totalXp,
          title: EXPERIENCE_SYSTEM.getLevelTitle(currentUser.level),
          isCurrentUser: true,
          completedQuizzes: currentUser.completedQuizzes?.length || 0,
          completedLessons: currentUser.completedLessons?.length || 0
        };
        mockUsers.push(userEntry);
      }
      
      // Trier par XP total
      mockUsers.sort((a, b) => b.totalXp - a.totalXp);
      
      // Ajouter les rangs
      const rankedUsers = mockUsers.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
      
      // Trouver le rang de l'utilisateur actuel
      const currentUserRank = rankedUsers.find(user => user.isCurrentUser);
      setUserRank(currentUserRank?.rank || null);
      
      setLeaderboard(rankedUsers.slice(0, 20)); // Top 20
    } catch (error) {
      console.error("Erreur lors du chargement du leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockLeaderboard = () => {
    const mockNames = [
      "CyberNinja", "H4ck3rPro", "SecMaster", "CryptoWiz", "PentestKing",
      "FirewallGuru", "SQLHunter", "XSSFinder", "BugBountyHero", "MalwareAnalyst",
      "SOCExpert", "ForensicAce", "RedTeamer", "BlueDefender", "ThreatHunter",
      "ZeroDayHunter", "CyberSamurai", "InfoSecNinja", "SecuritySage", "HackerEthic"
    ];
    
    return mockNames.map((name, index) => {
      const level = Math.max(1, Math.floor(Math.random() * 25) + (20 - index));
      const baseXp = EXPERIENCE_SYSTEM.getXpForLevel(level) * (level - 1) + 
                     Math.floor(Math.random() * EXPERIENCE_SYSTEM.getXpForLevel(level));
      
      return {
        username: name,
        level: level,
        totalXp: baseXp + Math.floor(Math.random() * 500),
        title: EXPERIENCE_SYSTEM.getLevelTitle(level),
        completedQuizzes: Math.floor(Math.random() * 20) + level,
        completedLessons: Math.floor(Math.random() * 15) + level,
        isCurrentUser: false
      };
    });
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return "👑";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return rank <= 10 ? "⭐" : "💫";
    }
  };

  const getRankClass = (rank) => {
    if (rank === 1) return "rank-gold";
    if (rank === 2) return "rank-silver";
    if (rank === 3) return "rank-bronze";
    if (rank <= 10) return "rank-top10";
    return "rank-normal";
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <NavBar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du classement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <NavBar />
      
      <div className="leaderboard-container">
        <header className="leaderboard-header">
          <div className="header-content">
            <h1>🏆 Classement CyberForge</h1>
            <p>Les meilleurs experts en cybersécurité</p>
            
            {userRank && (
              <div className="user-rank-badge">
                <span className="rank-text">Votre rang :</span>
                <span className="rank-number">#{userRank}</span>
              </div>
            )}
          </div>
        </header>

        <div className="podium-section">
          {leaderboard.slice(0, 3).map((user, index) => (
            <div key={user.username} className={`podium-place place-${index + 1}`}>
              <div className="podium-rank">{getRankIcon(index + 1)}</div>
              <div className="podium-user">
                <div className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="username">{user.username}</div>
                  <div className="level-badge">Niv. {user.level}</div>
                  <div className="xp-amount">{user.totalXp.toLocaleString()} XP</div>
                </div>
              </div>
              <div className="user-title">{user.title}</div>
            </div>
          ))}
        </div>

        <div className="leaderboard-table">
          <div className="table-header">
            <div className="header-cell rank-col">Rang</div>
            <div className="header-cell user-col">Utilisateur</div>
            <div className="header-cell level-col">Niveau</div>
            <div className="header-cell xp-col">Expérience</div>
            <div className="header-cell stats-col">Statistiques</div>
          </div>
          
          <div className="table-body">
            {leaderboard.map((user, index) => (
              <div 
                key={user.username} 
                className={`table-row ${getRankClass(user.rank)} ${user.isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="table-cell rank-col">
                  <span className="rank-icon">{getRankIcon(user.rank)}</span>
                  <span className="rank-number">#{user.rank}</span>
                </div>
                
                <div className="table-cell user-col">
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <div className="username">
                      {user.username}
                      {user.isCurrentUser && <span className="you-badge">Vous</span>}
                    </div>
                    <div className="user-title">{user.title}</div>
                  </div>
                </div>
                
                <div className="table-cell level-col">
                  <div className="level-display">
                    <span className="level-number">{user.level}</span>
                    <div className="level-progress">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${EXPERIENCE_SYSTEM.getLevelProgress(user.totalXp)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="table-cell xp-col">
                  <div className="xp-display">
                    <span className="xp-amount">{user.totalXp.toLocaleString()}</span>
                    <span className="xp-label">XP</span>
                  </div>
                </div>
                
                <div className="table-cell stats-col">
                  <div className="stats">
                    <div className="stat-item">
                      <span className="stat-icon">🎯</span>
                      <span className="stat-value">{user.completedQuizzes}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">📚</span>
                      <span className="stat-value">{user.completedLessons}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="leaderboard-info">
          <h3>💡 Comment gravir le classement</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">🎯</span>
              <div className="tip-content">
                <h4>Réussir les quiz</h4>
                <p>+50 XP par bonne réponse</p>
              </div>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🏆</span>
              <div className="tip-content">
                <h4>Quiz parfait</h4>
                <p>+200 XP de bonus</p>
              </div>
            </div>
            <div className="tip-card">
              <span className="tip-icon">📚</span>
              <div className="tip-content">
                <h4>Terminer les cours</h4>
                <p>+100 XP par leçon</p>
              </div>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🔥</span>
              <div className="tip-content">
                <h4>Rester actif</h4>
                <p>Pratiquez régulièrement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewLeaderboard;