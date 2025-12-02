import React, { useState, useEffect } from 'react';
import './XPGainAnimation.css';

function XPGainAnimation({ show, amount, isPositive = true, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete && onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className={`xp-gain-animation ${isPositive ? 'positive' : 'negative'}`}>
      <div className="xp-amount">
        {isPositive ? '+' : ''}{amount} XP
      </div>
      <div className="xp-sparkles">
        {isPositive ? (
          <>
            <span className="sparkle">✨</span>
            <span className="sparkle">⭐</span>
            <span className="sparkle">💫</span>
          </>
        ) : (
          <>
            <span className="sparkle">💥</span>
            <span className="sparkle">❌</span>
            <span className="sparkle">💔</span>
          </>
        )}
      </div>
    </div>
  );
}

export default XPGainAnimation;