import React, { useState, useEffect } from 'react';
import { EXPERIENCE_SYSTEM } from '../utils/experienceSystem';
import './XPProgressBar.css';

function XPProgressBar({ currentXp, showAnimation = false, xpGained = 0 }) {
  const [animatedXp, setAnimatedXp] = useState(currentXp);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentLevel = EXPERIENCE_SYSTEM.getLevelFromXp(currentXp);
  const currentLevelXp = EXPERIENCE_SYSTEM.getCurrentLevelXp(currentXp);
  const xpForCurrentLevel = EXPERIENCE_SYSTEM.getXpForLevel(currentLevel);
  const progressPercentage = Math.round((currentLevelXp / xpForCurrentLevel) * 100);
  const xpNeededForNext = EXPERIENCE_SYSTEM.getXpNeededForNextLevel(currentXp);

  useEffect(() => {
    if (showAnimation && xpGained !== 0) {
      setIsAnimating(true);
      
      // Animation progressive de la barre
      const startXp = currentXp - xpGained;
      const duration = 1500; // 1.5 secondes
      const steps = 60;
      const stepDuration = duration / steps;
      const xpStep = xpGained / steps;
      
      let currentStep = 0;
      const animationInterval = setInterval(() => {
        currentStep++;
        const newXp = startXp + (xpStep * currentStep);
        setAnimatedXp(Math.round(newXp));
        
        if (currentStep >= steps) {
          clearInterval(animationInterval);
          setAnimatedXp(currentXp);
          setIsAnimating(false);
        }
      }, stepDuration);

      return () => clearInterval(animationInterval);
    } else {
      setAnimatedXp(currentXp);
    }
  }, [currentXp, showAnimation, xpGained]);

  const animatedLevel = EXPERIENCE_SYSTEM.getLevelFromXp(animatedXp);
  const animatedCurrentLevelXp = EXPERIENCE_SYSTEM.getCurrentLevelXp(animatedXp);
  const animatedXpForCurrentLevel = EXPERIENCE_SYSTEM.getXpForLevel(animatedLevel);
  const animatedProgressPercentage = Math.round((animatedCurrentLevelXp / animatedXpForCurrentLevel) * 100);

  return (
    <div className={`xp-progress-container ${isAnimating ? 'animating' : ''}`}>
      <div className="xp-progress-header">
        <div className="level-info">
          <span className="current-level">Niveau {currentLevel}</span>
          <span className="level-title">{EXPERIENCE_SYSTEM.getLevelTitle(currentLevel)}</span>
        </div>
        <div className="xp-info">
          <span className="current-xp">{currentLevelXp.toLocaleString()}</span>
          <span className="xp-separator">/</span>
          <span className="max-xp">{xpForCurrentLevel.toLocaleString()} XP</span>
        </div>
      </div>
      
      <div className="xp-progress-bar-container">
        <div className="xp-progress-bar">
          <div 
            className="xp-progress-fill"
            style={{ 
              width: `${animatedProgressPercentage}%`,
              transition: isAnimating ? 'width 0.1s ease-out' : 'width 0.3s ease'
            }}
          >
            <div className="xp-progress-shine"></div>
          </div>
          
          {/* Particules d'XP pendant l'animation */}
          {isAnimating && (
            <div className="xp-particles">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="xp-particle" style={{
                  left: `${animatedProgressPercentage}%`,
                  animationDelay: `${i * 0.1}s`
                }}>
                  ✨
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="xp-progress-labels">
          <span className="progress-percentage">{progressPercentage}%</span>
          <span className="next-level-info">
            {xpNeededForNext} XP pour niveau {currentLevel + 1}
          </span>
        </div>
      </div>

      {/* Animation de gain XP */}
      {isAnimating && xpGained > 0 && (
        <div className="xp-gain-indicator">
          <span className={`xp-gain-amount ${xpGained > 0 ? 'positive' : 'negative'}`}>
            {xpGained > 0 ? '+' : ''}{xpGained} XP
          </span>
        </div>
      )}
    </div>
  );
}

export default XPProgressBar;