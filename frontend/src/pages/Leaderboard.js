import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import "./Leaderboard.css";

function Leaderboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, week, month

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const response = await fetch("http://localhost:5000/api/leaderboard");
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboard(data || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setError(error.message);
      // Set mock data for demonstration
      setLeaderboard([
        { username: "CyberMaster", level: 25, xp: 15420, score: 9850 },
        { username: "HackNinja", level: 22, xp: 13200, score: 8900 },
        { username: "CodeWarrior", level: 20, xp: 11500, score: 7850 },
        { username: user?.username || "Player", level: user?.level || 5, xp: user?.xp || 500, score: 1200 },
        { username: "NetGuardian", level: 18, xp: 9800, score: 6500 },
        { username: "ByteHunter", level: 15, xp: 7500, score: 5200 },
        { username: "ScriptKiddo", level: 12, xp: 5200, score: 3800 },
        { username: "InfoSec", level: 10, xp: 4100, score: 2900 },
        { username: "Rookie", level: 8, xp: 2800, score: 1800 },
        { username: "Newbie", level: 5, xp: 1200, score: 800 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return rank;
    }
  };

  const getLevelColor = (level) => {
    if (level >= 20) return "legendary";
    if (level >= 15) return "epic";
    if (level >= 10) return "rare";
    if (level >= 5) return "uncommon";
    return "common";
  };

  const getLevelTitle = (level) => {
    if (level >= 20) return "Legend";
    if (level >= 15) return "Master";
    if (level >= 10) return "Expert";
    if (level >= 5) return "Apprentice";
    return "Novice";
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <NavBar />
        <div className="loading-container">
          <div className="cyber-loader">
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
          </div>
          <p className="loading-text">Loading Elite Warriors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <NavBar />
      
      <div className="leaderboard-wrapper">
        {/* Animated Background */}
        <div className="cyber-grid"></div>
        
        <div className="leaderboard-container">
          {/* Header Section */}
          <header className="leaderboard-header">
            <div className="header-content">
              <div className="title-section">
                <div className="title-icon">🏆</div>
                <div>
                  <h1 className="main-title">GLOBAL LEADERBOARD</h1>
                  <p className="subtitle">Top Cyber Warriors Worldwide</p>
                </div>
              </div>
              
              {/* Filter Tabs */}
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Time
                </button>
                <button 
                  className={`filter-tab ${filter === 'week' ? 'active' : ''}`}
                  onClick={() => setFilter('week')}
                >
                  This Week
                </button>
                <button 
                  className={`filter-tab ${filter === 'month' ? 'active' : ''}`}
                  onClick={() => setFilter('month')}
                >
                  This Month
                </button>
              </div>
            </div>
          </header>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="podium-section">
              <div className="podium-container">
                {/* 2nd Place */}
                <div className="podium-card second-place">
                  <div className="podium-rank">
                    <span className="rank-number">2</span>
                    <div className="medal">🥈</div>
                  </div>
                  <div className="podium-avatar">
                    <div className="avatar-ring silver">
                      <div className="avatar-inner">
                        <span className="avatar-emoji">🧑‍💻</span>
                      </div>
                    </div>
                  </div>
                  <div className="podium-info">
                    <h3 className="podium-name">{leaderboard[1].username}</h3>
                    <div className={`podium-level ${getLevelColor(leaderboard[1].level)}`}>
                      <span className="level-icon">⚡</span>
                      Level {leaderboard[1].level}
                    </div>
                    <div className="podium-stats">
                      <div className="stat-item">
                        <span className="stat-label">XP</span>
                        <span className="stat-value">{leaderboard[1].xp.toLocaleString()}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{leaderboard[1].score.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="podium-card first-place">
                  <div className="crown-icon">👑</div>
                  <div className="podium-rank">
                    <span className="rank-number">1</span>
                    <div className="medal">🥇</div>
                  </div>
                  <div className="podium-avatar">
                    <div className="avatar-ring gold">
                      <div className="avatar-inner">
                        <span className="avatar-emoji">👨‍💻</span>
                      </div>
                    </div>
                  </div>
                  <div className="podium-info">
                    <h3 className="podium-name">{leaderboard[0].username}</h3>
                    <div className={`podium-level ${getLevelColor(leaderboard[0].level)}`}>
                      <span className="level-icon">⚡</span>
                      Level {leaderboard[0].level}
                    </div>
                    <div className="podium-stats">
                      <div className="stat-item">
                        <span className="stat-label">XP</span>
                        <span className="stat-value">{leaderboard[0].xp.toLocaleString()}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{leaderboard[0].score.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="podium-card third-place">
                  <div className="podium-rank">
                    <span className="rank-number">3</span>
                    <div className="medal">🥉</div>
                  </div>
                  <div className="podium-avatar">
                    <div className="avatar-ring bronze">
                      <div className="avatar-inner">
                        <span className="avatar-emoji">👩‍💻</span>
                      </div>
                    </div>
                  </div>
                  <div className="podium-info">
                    <h3 className="podium-name">{leaderboard[2].username}</h3>
                    <div className={`podium-level ${getLevelColor(leaderboard[2].level)}`}>
                      <span className="level-icon">⚡</span>
                      Level {leaderboard[2].level}
                    </div>
                    <div className="podium-stats">
                      <div className="stat-item">
                        <span className="stat-label">XP</span>
                        <span className="stat-value">{leaderboard[2].xp.toLocaleString()}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{leaderboard[2].score.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Rankings List */}
          <div className="rankings-section">
            <h2 className="section-title">Complete Rankings</h2>
            
            <div className="rankings-list">
              {leaderboard.map((player, index) => {
                const isCurrentUser = user && player.username === user.username;
                const rank = index + 1;
                
                return (
                  <div 
                    key={index} 
                    className={`ranking-card ${isCurrentUser ? 'current-user' : ''} ${rank <= 3 ? 'top-three' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="rank-badge">
                      <span className="rank-text">{getRankIcon(rank)}</span>
                    </div>
                    
                    <div className="player-avatar-small">
                      <div className={`avatar-circle ${getLevelColor(player.level)}`}>
                        <span>👤</span>
                      </div>
                    </div>
                    
                    <div className="player-details">
                      <div className="player-name-wrapper">
                        <span className="player-username">{player.username}</span>
                        {isCurrentUser && <span className="you-tag">YOU</span>}
                      </div>
                      <div className="player-title">{getLevelTitle(player.level)}</div>
                    </div>
                    
                    <div className="player-stats-inline">
                      <div className="stat-box">
                        <span className="stat-icon">⚡</span>
                        <div className="stat-content">
                          <span className="stat-label-small">Level</span>
                          <span className={`stat-value-large ${getLevelColor(player.level)}`}>
                            {player.level}
                          </span>
                        </div>
                      </div>
                      
                      <div className="stat-box">
                        <span className="stat-icon">✨</span>
                        <div className="stat-content">
                          <span className="stat-label-small">XP</span>
                          <span className="stat-value-large">{player.xp.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="stat-box">
                        <span className="stat-icon">🎯</span>
                        <div className="stat-content">
                          <span className="stat-label-small">Score</span>
                          <span className="stat-value-large">{player.score.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="player-progress">
                      <div className="progress-bar-mini">
                        <div 
                          className={`progress-fill ${getLevelColor(player.level)}`}
                          style={{ width: `${(player.xp % 1000) / 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {leaderboard.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🏆</div>
              <h3>No Warriors Yet</h3>
              <p>Be the first to climb the ranks!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;