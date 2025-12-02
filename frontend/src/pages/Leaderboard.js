import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import NavBar from "../components/NavBar";
import "./Leaderboard.css";

function Leaderboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/leaderboard");
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const getLevelColor = (level) => {
    if (level >= 20) return "legendary";
    if (level >= 15) return "epic";
    if (level >= 10) return "rare";
    if (level >= 5) return "uncommon";
    return "common";
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <NavBar />
        <div className="loading-container">
          <div className="cyber-loader"></div>
          <p>{t('loadingLeaderboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <NavBar />
      
      <div className="leaderboard-container">
        <header className="leaderboard-header">
          <h1>{t('cyberWarriorsLeaderboard')}</h1>
          <p>{t('leaderboardSubtitle')}</p>
        </header>

        <div className="leaderboard-content">
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="podium-section">
              <div className="podium">
                {/* 2nd Place */}
                <div className="podium-item second">
                  <div className="rank-icon">🥈</div>
                  <div className="player-avatar">👤</div>
                  <div className="player-name">{leaderboard[1].username}</div>
                  <div className={`player-level ${getLevelColor(leaderboard[1].level)}`}>
                    Level {leaderboard[1].level}
                  </div>
                  <div className="player-xp">{leaderboard[1].xp} XP</div>
                </div>

                {/* 1st Place */}
                <div className="podium-item first">
                  <div className="crown">👑</div>
                  <div className="rank-icon">🥇</div>
                  <div className="player-avatar">👤</div>
                  <div className="player-name">{leaderboard[0].username}</div>
                  <div className={`player-level ${getLevelColor(leaderboard[0].level)}`}>
                    Level {leaderboard[0].level}
                  </div>
                  <div className="player-xp">{leaderboard[0].xp} XP</div>
                </div>

                {/* 3rd Place */}
                <div className="podium-item third">
                  <div className="rank-icon">🥉</div>
                  <div className="player-avatar">👤</div>
                  <div className="player-name">{leaderboard[2].username}</div>
                  <div className={`player-level ${getLevelColor(leaderboard[2].level)}`}>
                    Level {leaderboard[2].level}
                  </div>
                  <div className="player-xp">{leaderboard[2].xp} XP</div>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="leaderboard-table">
            <div className="table-header">
              <div className="rank-col">{t('rank')}</div>
              <div className="player-col">{t('player')}</div>
              <div className="level-col">{t('level')}</div>
              <div className="xp-col">{t('xp')}</div>
              <div className="score-col">{t('score')}</div>
            </div>
            
            {leaderboard.map((player, index) => (
              <div 
                key={index} 
                className={`table-row ${player.username === "You" ? "current-user" : ""}`}
              >
                <div className="rank-col">
                  <span className="rank-display">{getRankIcon(index + 1)}</span>
                </div>
                <div className="player-col">
                  <div className="player-info">
                    <span className="player-avatar">👤</span>
                    <span className="player-name">
                      {player.username}
                      {player.username === "You" && <span className="you-badge">{t('you')}</span>}
                    </span>
                  </div>
                </div>
                <div className="level-col">
                  <span className={`level-badge ${getLevelColor(player.level)}`}>
                    {player.level}
                  </span>
                </div>
                <div className="xp-col">{player.xp.toLocaleString()}</div>
                <div className="score-col">{player.score.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="empty-leaderboard">
              <h3>{t('noDataYet')}</h3>
              <p>{t('noDataDesc')}</p>
            </div>
          )}
        </div>

        <div className="leaderboard-footer">
          <div className="level-legend">
            <h3>{t('levelTiers')}</h3>
            <div className="legend-items">
              <span className="legend-item common">{t('novice')}</span>
              <span className="legend-item uncommon">{t('apprentice')}</span>
              <span className="legend-item rare">{t('expert')}</span>
              <span className="legend-item epic">{t('master')}</span>
              <span className="legend-item legendary">{t('legend')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;