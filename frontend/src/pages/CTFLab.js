import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import NavBar from "../components/NavBar";
import XPGainAnimation from "../components/XPGainAnimation";
import { levelSync } from "../utils/levelSync";
import "./CTFLab.css";

function CTFLab() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [activeLab, setActiveLab] = useState(null);
  const [flag, setFlag] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // Load user progress from localStorage immediately
  const [userProgress, setUserProgress] = useState(() => {
    const savedProgress = localStorage.getItem('ctfLabProgress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        console.log('✅ Loaded CTF progress from localStorage:', parsed);
        return parsed;
      } catch (error) {
        console.error('❌ Error loading saved progress:', error);
      }
    }
    console.log('ℹ️ No saved progress found, using defaults');
    return {
      completed: [],
      points: 0,
      rank: "Beginner"
    };
  });
  const [xpGain, setXpGain] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);

  // Save user progress to localStorage whenever it changes
  useEffect(() => {
    console.log('💾 Saving CTF progress to localStorage:', userProgress);
    localStorage.setItem('ctfLabProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  // CTF Lab categories with challenges
  const ctfLabs = [
    {
      id: "web-sqli",
      name: "SQL Injection",
      category: "Web Security",
      difficulty: "Medium",
      points: 100,
      description: "Exploit SQL injection vulnerabilities to extract sensitive data",
      icon: "🗃️",
      tags: ["SQL", "Database", "Web"],
      estimatedTime: "30 min"
    },
    {
      id: "web-xss",
      name: "Cross-Site Scripting",
      category: "Web Security",
      difficulty: "Easy",
      points: 75,
      description: "Find and exploit XSS vulnerabilities in a vulnerable web application",
      icon: "🔗",
      tags: ["XSS", "JavaScript", "Web"],
      estimatedTime: "20 min"
    },
    {
      id: "crypto-caesar",
      name: "Caesar Cipher",
      category: "Cryptography",
      difficulty: "Easy",
      points: 50,
      description: "Decrypt a message encrypted with Caesar cipher (ROT13)",
      icon: "🔐",
      tags: ["Crypto", "Classical", "ROT13"],
      estimatedTime: "15 min"
    },
    {
      id: "crypto-rsa",
      name: "RSA Challenge",
      category: "Cryptography",
      difficulty: "Hard",
      points: 150,
      description: "Break a weak RSA implementation by factoring small primes",
      icon: "🔑",
      tags: ["RSA", "Public Key", "Factorization"],
      estimatedTime: "45 min"
    },
    {
      id: "network-pcap",
      name: "Packet Analysis",
      category: "Network Security",
      difficulty: "Medium",
      points: 100,
      description: "Analyze network traffic to find hidden flags",
      icon: "📡",
      tags: ["Wireshark", "PCAP", "Network"],
      estimatedTime: "40 min"
    },
    {
      id: "reverse-crackme",
      name: "CrackMe Basic",
      category: "Reverse Engineering",
      difficulty: "Medium",
      points: 100,
      description: "Reverse engineer a binary to find the correct password",
      icon: "🔍",
      tags: ["Assembly", "Binary", "Debugging"],
      estimatedTime: "45 min"
    },
    {
      id: "pwn-buffer",
      name: "Buffer Overflow",
      category: "Binary Exploitation",
      difficulty: "Hard",
      points: 150,
      description: "Exploit a buffer overflow vulnerability to gain shell access",
      icon: "💥",
      tags: ["Buffer Overflow", "Shellcode", "Memory"],
      estimatedTime: "90 min"
    },
    {
      id: "forensics-image",
      name: "Image Steganography",
      category: "Forensics",
      difficulty: "Easy",
      points: 50,
      description: "Extract hidden data from an image file",
      icon: "🖼️",
      tags: ["Stego", "Image", "Hidden Data"],
      estimatedTime: "20 min"
    },
    {
      id: "web-auth-bypass",
      name: "Authentication Bypass",
      category: "Web Security",
      difficulty: "Medium",
      points: 100,
      description: "Bypass authentication mechanisms to access admin panel",
      icon: "🚪",
      tags: ["Auth", "Session", "Web"],
      estimatedTime: "35 min"
    },
    {
      id: "misc-osint",
      name: "OSINT Challenge",
      category: "OSINT",
      difficulty: "Easy",
      points: 75,
      description: "Use open-source intelligence techniques to find information",
      icon: "🔎",
      tags: ["OSINT", "Research", "Investigation"],
      estimatedTime: "30 min"
    }
  ];

  const categories = ["all", "Web Security", "Cryptography", "Network Security", "Reverse Engineering", "Binary Exploitation", "Forensics", "OSINT"];
  const difficulties = ["all", "Easy", "Medium", "Hard"];

  // Filter labs based on selected category and difficulty
  const filteredLabs = ctfLabs.filter(lab => {
    const categoryMatch = selectedCategory === "all" || lab.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === "all" || lab.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Easy": return "#4ade80";
      case "Medium": return "#fbbf24";
      case "Hard": return "#f87171";
      default: return "#a855f7";
    }
  };

  // Start a lab
  const handleStartLab = async (lab) => {
    setLoading(true);
    setMessage("");
    setFlag("");

    try {
      // Call backend API to start Docker container
      const response = await fetch('http://localhost:5000/api/start-lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user?.username || 'guest',
          lab_id: lab.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setActiveLab({
          ...lab,
          target: data.target,
          port: data.port,
          container: data.container,
          startTime: new Date()
        });
        
        setMessage(t('labEnvironmentReady'));
      } else {
        setMessage(`${t('labStartFailed')} ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(t('dockerNotRunning'));
      console.error('Lab start error:', error);
    }

    setLoading(false);
  };

  // Calculate XP based on difficulty
  const getXPForDifficulty = (difficulty) => {
    switch(difficulty) {
      case "Easy": return 100;
      case "Medium": return 150;
      case "Hard": return 200;
      default: return 100;
    }
  };

  // Submit flag
  const handleSubmitFlag = async () => {
    if (!flag.trim()) {
      setMessage(t('enterFlag'));
      return;
    }

    setLoading(true);

    try {
      // Call backend API to validate flag
      const response = await fetch('http://localhost:5000/api/submit-flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flag: flag,
          lab_id: activeLab.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(t('flagCorrect'));
        
        // Update user progress and trigger XP animation
        if (!userProgress.completed.includes(activeLab.id)) {
          // Calculate XP based on difficulty (Easy=100, Medium=150, Hard=200)
          const xpEarned = getXPForDifficulty(activeLab.difficulty);
          
          setUserProgress(prev => ({
            ...prev,
            completed: [...prev.completed, activeLab.id],
            points: prev.points + xpEarned
          }));
          
          // Synchronize XP with global level system
          const result = levelSync.updateExperience(xpEarned);
          
          // Show XP animation
          setXpGain(xpEarned);
          setShowXPAnimation(true);
          
          // Show level up message if leveled up
          if (result.leveledUp) {
            setTimeout(() => {
              setMessage(`🎉 Flag captured! +${xpEarned} XP | 🎊 LEVEL UP! You are now level ${result.level}!`);
            }, 500);
          }
          
          // Hide animation after 3 seconds
          setTimeout(() => {
            setShowXPAnimation(false);
          }, 3000);
        }
      } else {
        setMessage(data.message || t('flagIncorrect'));
      }
    } catch (error) {
      setMessage(t('flagSubmitError'));
      console.error('Flag submission error:', error);
    }

    setLoading(false);
  };

  // Stop lab
  const handleStopLab = async () => {
    if (activeLab?.container) {
      try {
        // Call backend API to stop Docker container
        const response = await fetch('http://localhost:5000/api/stop-lab', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            container: activeLab.container
          })
        });

        const data = await response.json();
        if (data.success) {
          setMessage(t('labStopped'));
        }
      } catch (error) {
        console.error('Error stopping lab:', error);
      }
    }
    
    setActiveLab(null);
    setFlag("");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="ctf-lab-page">
      <NavBar />
      
      {/* XP Gain Animation */}
      {showXPAnimation && <XPGainAnimation xpGain={xpGain} />}
      
      <div className="ctf-lab-container">
        {/* Header */}
        <div className="ctf-header">
          <div className="header-content">
            <div className="header-title">
              <h1>{t('ctfLabArena')}</h1>
              <p>{t('ctfLabSubtitle')}</p>
            </div>
            <div className="user-stats">
              <div className="stat-card">
                <span className="stat-icon">🏆</span>
                <div className="stat-info">
                  <span className="stat-value">{userProgress.points}</span>
                  <span className="stat-label">{t('points')}</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✅</span>
                <div className="stat-info">
                  <span className="stat-value">{userProgress.completed.length}</span>
                  <span className="stat-label">{t('completed')}</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⭐</span>
                <div className="stat-info">
                  <span className="stat-value">{userProgress.rank}</span>
                  <span className="stat-label">{t('rank')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Lab Section */}
        {activeLab && (
          <div className="active-lab-section">
            <div className="active-lab-card">
              <div className="active-lab-header">
                <div className="lab-title-section">
                  <span className="lab-icon-large">{activeLab.icon}</span>
                  <div>
                    <h2>{activeLab.name}</h2>
                    <p>{activeLab.description}</p>
                  </div>
                </div>
                <button className="stop-lab-btn" onClick={handleStopLab}>
                  {t('stopLab')}
                </button>
              </div>

              <div className="lab-info-grid">
                <div className="info-item">
                  <span className="info-label">{t('target')}</span>
                  <a 
                    href={`http://${activeLab.target}:${activeLab.port}`}
                    target="_blank"
                    rel="noreferrer"
                    className="target-link"
                  >
                    {activeLab.target}:{activeLab.port} 🔗
                  </a>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('category')}</span>
                  <span className="info-value">{activeLab.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('difficulty')}</span>
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(activeLab.difficulty) }}
                  >
                    {activeLab.difficulty}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('points')}:</span>
                  <span className="info-value">{activeLab.points} pts</span>
                </div>
              </div>

              <div className="flag-submission">
                <input
                  type="text"
                  placeholder={t('flagPlaceholder')}
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitFlag()}
                  className="flag-input"
                />
                <button 
                  className="submit-flag-btn" 
                  onClick={handleSubmitFlag}
                  disabled={loading}
                >
                  {loading ? t('validating') : t('submitFlag')}
                </button>
              </div>

              {message && (
                <div className={`lab-message ${message.includes('✅') || message.includes('🎉') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        {!activeLab && (
          <>
            <div className="filters-section">
              <div className="filter-group">
                <label>{t('category')}</label>
                <div className="filter-buttons">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat === "all" ? t('allCategories') : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>{t('difficulty')}</label>
                <div className="filter-buttons">
                  {difficulties.map(diff => (
                    <button
                      key={diff}
                      className={`filter-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      {diff === "all" ? t('allLevels') : diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Labs Grid */}
            <div className="labs-grid">
              {filteredLabs.map(lab => (
                <div 
                  key={lab.id} 
                  className={`lab-card ${userProgress.completed.includes(lab.id) ? 'completed' : ''}`}
                >
                  <div className="lab-card-header">
                    <span className="lab-icon">{lab.icon}</span>
                    {userProgress.completed.includes(lab.id) && (
                      <span className="completed-badge">{t('completedBadge')}</span>
                    )}
                  </div>

                  <h3 className="lab-name">{lab.name}</h3>
                  <p className="lab-description">{lab.description}</p>

                  <div className="lab-meta">
                    <span className="lab-category">{lab.category}</span>
                    <span 
                      className="lab-difficulty"
                      style={{ color: getDifficultyColor(lab.difficulty) }}
                    >
                      {lab.difficulty}
                    </span>
                  </div>

                  <div className="lab-tags">
                    {lab.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div className="lab-footer">
                    <div className="lab-stats">
                      <span className="lab-time">⏱️ {lab.estimatedTime}</span>
                      <span className="lab-points">🏆 {lab.points} pts</span>
                    </div>
                    <button 
                      className="start-lab-btn"
                      onClick={() => handleStartLab(lab)}
                      disabled={loading}
                    >
                      {loading ? "⏳" : t('startLab')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredLabs.length === 0 && (
              <div className="no-labs">
                <p>{t('noLabsMatch')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CTFLab;
