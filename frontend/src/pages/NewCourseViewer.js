import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useLanguage } from "../context/LanguageContext";
import "./NewCourse.css";

function NewCourseViewer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [module, setModule] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000/api/module/${moduleId}`);
      
      if (response.ok) {
        const data = await response.json();
        // Diviser le contenu en 4 pages
        const pages = createPages(data);
        setModule({ ...data, pages });
        setProgress(25); // Première page = 25%
      } else {
        setError("Module non trouvé");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const createPages = (moduleData) => {
    const content = moduleData.lessons[0].content;
    const sections = content.split(/(?=## )/);
    
    return [
      {
        title: t('introduction'),
        content: sections[0] + (sections[1] || ""),
        icon: "📚"
      },
      {
        title: t('fundamentalConcepts'), 
        content: sections[2] || sections[1] || "Contenu des concepts...",
        icon: "🧠"
      },
      {
        title: t('advancedTechniques'),
        content: sections[3] || "Techniques et méthodes avancées...",
        icon: "⚡"
      },
      {
        title: t('practiceSummary'),
        content: sections[4] || `
# ${t('practiceSummary')}

Ce module vous a permis d'apprendre :

- Les concepts de base
- Les techniques essentielles
- Les bonnes pratiques
- Les applications pratiques

Vous êtes maintenant prêt pour le quiz !
        `,
        icon: "🎯"
      }
    ];
  };

  const nextPage = () => {
    if (currentPage < 3) {
      setCurrentPage(currentPage + 1);
      setProgress((currentPage + 2) * 25);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setProgress((currentPage) * 25);
    }
  };

  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
    setProgress((pageIndex + 1) * 25);
  };

  const goToQuiz = () => {
    navigate(`/challenge/${moduleId}`);
  };

  const formatContent = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="content-h1">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="content-h2">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="content-h3">{line.substring(4)}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="content-li">{line.substring(2)}</li>;
      } else if (line.includes('**') && line.includes('**')) {
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={index} className="content-p" dangerouslySetInnerHTML={{__html: boldText}} />;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else if (line.trim()) {
        return <p key={index} className="content-p">{line}</p>;
      }
      return null;
    });
  };

  if (loading) {
    return (
      <div className="new-course-page">
        <NavBar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('loadingCourse')}</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="new-course-page">
        <NavBar />
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>{t('error')}</h2>
          <p>{error || t('moduleNotFound')}</p>
          <button onClick={() => navigate("/")} className="back-home-btn">
            🏠 {t('backToHome')}
          </button>
        </div>
      </div>
    );
  }

  const currentPageData = module.pages[currentPage];

  return (
    <div className="new-course-page">
      <NavBar />
      
      <div className="course-layout">
        {/* Header avec informations du module */}
        <header className="course-header">
          <div className="course-title-section">
            <span className="module-icon">{module.icon}</span>
            <div className="title-info">
              <h1>{module.title}</h1>
              <p className="module-description">{module.description}</p>
              <div className="module-badges">
                <span className="difficulty-badge">{module.difficulty}</span>
                <span className="duration-badge">{module.duration}</span>
              </div>
            </div>
          </div>
          
          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-text">{progress}% {t('completedProgress')}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </header>

        {/* Navigation des pages */}
        <div className="page-navigation">
          {module.pages.map((page, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`page-nav-btn ${index === currentPage ? 'active' : ''} ${index < currentPage ? 'completed' : ''}`}
            >
              <span className="page-icon">{page.icon}</span>
              <span className="page-title">{page.title}</span>
              {index < currentPage && <span className="completed-check">✓</span>}
            </button>
          ))}
        </div>

        {/* Contenu de la page */}
        <main className="page-content">
          <div className="content-header">
            <div className="page-info">
              <span className="current-page-icon">{currentPageData.icon}</span>
              <h2>{currentPageData.title}</h2>
            </div>
            <div className="page-counter">
              {t('page')} {currentPage + 1} / 4
            </div>
          </div>

          <div className="content-body">
            <div className="markdown-content">
              {formatContent(currentPageData.content)}
            </div>
          </div>

          <footer className="content-footer">
            <div className="navigation-controls">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 0}
                className="nav-btn prev-btn"
              >
                <span className="nav-icon">←</span>
                <span>{t('previous')}</span>
              </button>
              
              <div className="page-dots">
                {[0, 1, 2, 3].map(pageIndex => (
                  <button
                    key={pageIndex}
                    onClick={() => goToPage(pageIndex)}
                    className={`page-dot ${pageIndex === currentPage ? 'active' : ''} ${pageIndex < currentPage ? 'completed' : ''}`}
                  />
                ))}
              </div>
              
              {currentPage < 3 ? (
                <button 
                  onClick={nextPage}
                  className="nav-btn next-btn"
                >
                  <span>{t('next')}</span>
                  <span className="nav-icon">→</span>
                </button>
              ) : (
                <button 
                  onClick={goToQuiz}
                  className="nav-btn quiz-btn"
                >
                  <span>{t('quiz')}</span>
                  <span className="nav-icon">🎯</span>
                </button>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default NewCourseViewer;