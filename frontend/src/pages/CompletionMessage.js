import React from 'react';
import './CompletionMessage.css';

function CompletionMessage({ show, onClose, moduleCompleted, nextModule }) {
  if (!show) return null;

  return (
    <div className="completion-overlay">
      <div className="completion-modal">
        <div className="completion-header">
          <div className="completion-icon">🎉</div>
          <h2>Module terminé avec succès !</h2>
        </div>
        
        <div className="completion-content">
          <p>Félicitations ! Vous avez terminé le module <strong>{moduleCompleted}</strong>.</p>
          
          {nextModule ? (
            <div className="unlock-notification">
              <div className="unlock-icon">🔓</div>
              <p>Le module <strong>{nextModule}</strong> est maintenant débloqué !</p>
            </div>
          ) : (
            <div className="final-completion">
              <div className="mastery-icon">🏆</div>
              <p>Vous avez terminé tous les modules ! Vous êtes un expert en cybersécurité !</p>
            </div>
          )}
        </div>
        
        <div className="completion-actions">
          <button onClick={onClose} className="continue-btn">
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletionMessage;