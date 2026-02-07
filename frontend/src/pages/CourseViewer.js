import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useExperienceSystem } from "../utils/experienceSystem";
import "../styles/Course.css";

function CourseViewer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { markLessonCompleted } = useExperienceSystem();
  const [module, setModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/module/${moduleId}`);
      
      if (response.ok) {
        const data = await response.json();
        setModule(data);
      } else {
        setError("Module non trouvé");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du module:", error);
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const nextLesson = () => {
    if (module && currentLesson < module.lessons.length - 1) {
      // Marquer la leçon actuelle comme complétée
      const lessonId = `${moduleId}_lesson_${currentLesson + 1}`;
      markLessonCompleted(lessonId);
      console.log(`✅ Leçon ${currentLesson + 1} marquée comme complétée:`, lessonId);
      
      setCurrentLesson(currentLesson + 1);
    }
  };

  const prevLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const goToQuiz = () => {
    // Marquer la dernière leçon comme complétée avant d'aller au quiz
    const lessonId = `${moduleId}_lesson_${currentLesson + 1}`;
    markLessonCompleted(lessonId);
    console.log(`✅ Dernière leçon marquée comme complétée:`, lessonId);
    
    navigate(`/challenge/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="course-page">
        <NavBar />
        <div className="course-loading">Chargement du cours...</div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="course-page">
        <NavBar />
        <div className="course-error">
          <h2>Erreur</h2>
          <p>{error || "Module non trouvé"}</p>
          <button onClick={() => navigate("/")} className="back-btn">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const lesson = module.lessons[currentLesson];

  return (
    <div className="course-page">
      <NavBar />
      
      <div className="course-container">
        <div className="course-header">
          <div className="course-info">
            <span className="course-icon">{module.icon}</span>
            <div>
              <h1>{module.title}</h1>
              <p>{module.description}</p>
              <div className="course-meta">
                <span className="difficulty">{module.difficulty}</span>
                <span className="duration">{module.duration}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="course-content">
          <div className="lesson-nav">
            <h3>Leçons</h3>
            <div className="lessons-list">
              {module.lessons.map((les, index) => (
                <button
                  key={index}
                  className={`lesson-item ${index === currentLesson ? 'active' : ''}`}
                  onClick={() => setCurrentLesson(index)}
                >
                  <span className="lesson-number">{index + 1}</span>
                  <span className="lesson-title">{les.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lesson-content">
            <div className="lesson-header">
              <h2>{lesson.title}</h2>
              <div className="lesson-progress">
                Leçon {currentLesson + 1} sur {module.lessons.length}
              </div>
            </div>

            <div className="lesson-body">
              <div className="markdown-content">
                {lesson.content.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index}>{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index}>{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index}>{line.substring(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index}>{line.substring(2)}</li>;
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={index}><strong>{line.slice(2, -2)}</strong></p>;
                  } else if (line.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index}>{line}</p>;
                  }
                })}
              </div>
            </div>

            <div className="lesson-controls">
              <button 
                onClick={prevLesson} 
                disabled={currentLesson === 0}
                className="control-btn prev-btn"
              >
                ← Précédent
              </button>
              
              <div className="lesson-indicator">
                {currentLesson + 1} / {module.lessons.length}
              </div>
              
              {currentLesson < module.lessons.length - 1 ? (
                <button 
                  onClick={nextLesson}
                  className="control-btn next-btn"
                >
                  Suivant →
                </button>
              ) : (
                <button 
                  onClick={goToQuiz}
                  className="control-btn quiz-btn"
                >
                  Passer au Quiz 🎯
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseViewer;