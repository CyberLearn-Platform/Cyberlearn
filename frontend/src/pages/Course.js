import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import NavBar from "../components/NavBar";
import "./Course.css";

function Course() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [courseContent, setCourseContent] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courseReward, setCourseReward] = useState(null);

  useEffect(() => {
    fetchCourseContent();
  }, [moduleId]);

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/course/${moduleId}`, {
        headers: {
          'Accept-Language': language
        }
      });
      
      if (response.status === 403) {
        alert(t('courseLocked'));
        navigate("/");
        return;
      }
      
      const data = await response.json();
      setCourseContent(data);
    } catch (error) {
      console.error("Erreur lors du chargement du cours:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSection = () => {
    if (currentSection < courseContent.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setCompleted(true);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const startQuiz = () => {
    // Marquer le cours comme terminé et gagner de l'XP
    markCourseCompleted();
    navigate(`/challenge/${moduleId}`);
  };

  const markCourseCompleted = async () => {
    try {
      // Appel API pour marquer le cours comme terminé et gagner de l'XP
      const response = await fetch("http://localhost:5000/api/complete-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          module_id: moduleId
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCourseReward(result);
        console.log(`Cours terminé ! +${result.xp_gained} XP`);
        
        // Affichage notification niveau up si applicable
        if (result.level_up) {
          console.log(`Niveau supérieur atteint ! Niveau ${result.new_level}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la completion du cours:", error);
    }
  };

  if (loading) {
    return (
      <div className="course-page">
        <NavBar />
        <div className="loading-container">
          <div className="modern-loader"></div>
          <p>{t('loadingCourse')}</p>
        </div>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="course-page">
        <NavBar />
        <div className="error-container">
          <h2>{t('courseNotFound')}</h2>
          <button onClick={() => navigate("/")} className="btn-primary">
            {t('backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  const currentSectionData = courseContent.sections[currentSection];

  return (
    <div className="course-page">
      <NavBar />
      
      <div className="course-container">
        {/* En-tête du cours */}
        <div className="course-header">
          <button onClick={() => navigate("/")} className="back-btn">
            ← {t('backToDashboard')}
          </button>
          <div className="course-info">
            <h1>{courseContent.title}</h1>
            <p>{courseContent.description}</p>
            <div className="progress-indicator">
              <span>
                {t('section')} {currentSection + 1} {t('of')} {courseContent.sections?.length || 0}
              </span>
              <div className="course-progress-bar">
                <div 
                  className="course-progress-fill"
                  style={{ width: `${courseContent.sections ? ((currentSection + 1) / courseContent.sections.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu de la section */}
        {!completed ? (
          <div className="section-card">
            <div className="section-header">
              <h2>{currentSectionData.title}</h2>
              <span className="section-type">{currentSectionData.type}</span>
            </div>

            <div className="section-content">
              {currentSectionData.type === 'text' && (
                <div className="text-content">
                  {currentSectionData.content?.map((text, index) => (
                    <p key={index}>{text}</p>
                  ))}
                </div>
              )}

              {currentSectionData.type === 'list' && (
                <div className="list-content">
                  <ul>
                    {currentSectionData.content?.map((text, index) => (
                      <li key={index}>{text}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentSectionData.type === 'code' && (
                <div className="code-content">
                  <h3>{currentSectionData.subtitle}</h3>
                  <pre><code>{currentSectionData.content}</code></pre>
                </div>
              )}

              {currentSectionData.type === 'warning' && (
                <div className="warning-content">
                  <div className="warning-box">
                    <h3>⚠️ Important</h3>
                    {currentSectionData.content?.map((text, index) => (
                      <p key={index}>{text}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="section-navigation">
              <button 
                onClick={prevSection} 
                disabled={currentSection === 0}
                className={`nav-btn prev-btn ${currentSection === 0 ? 'disabled' : ''}`}
              >
                <span className="btn-icon">←</span>
                <span className="btn-text">{t('previousSection')}</span>
              </button>
              
              <div className="section-dots">
                {courseContent.sections?.map((_, index) => (
                  <span 
                    key={index}
                    className={`dot ${index === currentSection ? 'active' : ''} ${index < currentSection ? 'completed' : ''}`}
                    onClick={() => setCurrentSection(index)}
                    title={`${t('section')} ${index + 1}`}
                  ></span>
                ))}
              </div>

              <button 
                onClick={nextSection} 
                className="nav-btn next-btn primary"
              >
                <span className="btn-text">
                  {currentSection === (courseContent.sections?.length || 1) - 1 ? 
                    t('finishCourse') : t('nextSection')
                  }
                </span>
                <span className="btn-icon">
                  {currentSection === (courseContent.sections?.length || 1) - 1 ? '✓' : '→'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Écran de completion */
          <div className="completion-card">
            <div className="completion-content">
              <div className="completion-icon">🎓</div>
              <h2>{t('courseCompleted')}</h2>
              <p className="completion-title">
                {t('courseCompletedDesc', { title: courseContent.title })}
              </p>
              <div className="completion-reward">
                <span className="reward-icon">⭐</span>
                <span className="reward-text">
                  {t('courseXpReward', { xp: courseReward?.xp_gained || 25 })}
                </span>
              </div>
              
              {/* Notification de niveau up */}
              {courseReward?.level_up && (
                <div className="level-up-reward">
                  <span className="level-icon">🎖️</span>
                  <span className="level-text">
                    {t('levelUp', { level: courseReward.new_level })}
                  </span>
                </div>
              )}
              <p className="completion-desc">{t('courseCompletedReady')}</p>
              
              <div className="completion-actions">
                <button onClick={startQuiz} className="quiz-btn primary">
                  <span className="btn-icon">🎯</span>
                  <span className="btn-text">{t('startQuiz')}</span>
                  <span className="btn-arrow">→</span>
                </button>
                <button onClick={() => navigate("/")} className="home-btn secondary">
                  <span className="btn-icon">🏠</span>
                  <span className="btn-text">{t('backToHome')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Course;