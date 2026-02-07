import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [modules, setModules] = useState([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  
  // États pour le formulaire de module
  const [moduleForm, setModuleForm] = useState({
    id: '',
    title: '',
    description: '',
    icon: '📚',
    difficulty: 'Débutant',
    duration: '30 min',
    lessons: []
  });

  // États pour le formulaire de quiz
  const [quizForm, setQuizForm] = useState({
    id: '',
    questions: []
  });

  const [currentLesson, setCurrentLesson] = useState({
    id: 1,
    title: '',
    content: '',
    introduction: '',
    fundamentals: '',
    advanced: '',
    practice: ''
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    id: 1,
    question: '',
    type: 'text', // 'text' ou 'multiple_choice'
    answer: '',
    choices: ['', '', '', ''], // Pour les QCM
    explanation: ''
  });

  const [quizzes, setQuizzes] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    
    fetchStats();
    fetchModules();
    fetchQuizzes();
    fetchUsers();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const error = await response.json();
        console.error('Admin stats error:', error);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/modules');
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/quests');
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quests || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('🔍 [ADMIN] Récupération des utilisateurs...');
      console.log('🔑 [ADMIN] Token:', token ? 'Présent' : 'Absent');
      
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 [ADMIN] Réponse status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [ADMIN] Données reçues:', data);
        console.log('👥 [ADMIN] Nombre d\'utilisateurs:', data.users?.length || 0);
        setUsers(data.users || []);
      } else {
        const error = await response.json();
        console.error('❌ [ADMIN] Erreur réponse:', error);
      }
    } catch (error) {
      console.error('❌ [ADMIN] Erreur fetch:', error);
    }
  };

  const handleCreateModule = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // 1. Créer le module
      const moduleResponse = await fetch('http://localhost:5000/api/admin/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(moduleForm)
      });

      if (moduleResponse.ok) {
        // 2. Créer automatiquement un quiz vide associé
        const quizData = {
          id: moduleForm.id, // Même ID que le module
          title: moduleForm.title,
          icon: moduleForm.icon,
          difficulty: moduleForm.difficulty,
          questions: [] // Quiz vide, à remplir plus tard
        };
        
        const quizResponse = await fetch('http://localhost:5000/api/admin/quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(quizData)
        });

        if (quizResponse.ok) {
          // Recharger les quiz AVANT d'afficher le message
          await fetchQuizzes();
          alert('✅ Module et quiz créés avec succès ! Vous pouvez maintenant ajouter des questions au quiz en cliquant sur le bouton "🎯 Quiz".');
        } else {
          alert('✅ Module créé avec succès ! ⚠️ Attention: Le quiz n\'a pas pu être créé automatiquement.');
        }
        
        setShowModuleForm(false);
        setModuleForm({
          id: '',
          title: '',
          description: '',
          icon: '📚',
          difficulty: 'Débutant',
          duration: '30 min',
          lessons: []
        });
        fetchModules();
        fetchStats();
      } else {
        const error = await moduleResponse.json();
        alert('❌ Erreur: ' + error.error);
      }
    } catch (error) {
      console.error('Error creating module:', error);
      alert('❌ Erreur de connexion');
    }
  };

  const handleUpdateModule = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/admin/modules/${moduleForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(moduleForm)
      });

      if (response.ok) {
        alert('✅ Module mis à jour avec succès !');
        setShowModuleForm(false);
        setEditingModule(null);
        fetchModules();
      } else {
        const error = await response.json();
        alert('❌ Erreur: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating module:', error);
      alert('❌ Erreur de connexion');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/admin/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Module supprimé avec succès !');
        fetchModules();
        fetchStats();
      } else {
        const error = await response.json();
        alert('❌ Erreur: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('❌ Erreur de connexion');
    }
  };

  const handleCreateQuiz = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizForm)
      });

      if (response.ok) {
        alert('✅ Quiz créé avec succès !');
        setShowQuizForm(false);
        setQuizForm({ id: '', questions: [] });
        fetchQuizzes(); // Recharger la liste des quiz
        fetchStats();
      } else {
        const error = await response.json();
        alert('❌ Erreur: ' + error.error);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('❌ Erreur de connexion');
    }
  };

  const addLesson = () => {
    if (currentLesson.title) {
      // Construire le contenu à partir des sections
      let fullContent = '';
      
      if (currentLesson.introduction) {
        fullContent += `## 📖 Introduction\n\n${currentLesson.introduction}\n\n`;
      }
      
      if (currentLesson.fundamentals) {
        fullContent += `## 🧠 Concepts fondamentaux\n\n${currentLesson.fundamentals}\n\n`;
      }
      
      if (currentLesson.advanced) {
        fullContent += `## ⚡ Techniques avancées\n\n${currentLesson.advanced}\n\n`;
      }
      
      if (currentLesson.practice) {
        fullContent += `## 🎯 Pratique & Résumé\n\n${currentLesson.practice}\n\n`;
      }
      
      const lessonToAdd = {
        id: moduleForm.lessons.length + 1,
        title: currentLesson.title,
        content: fullContent.trim()
      };
      
      setModuleForm({
        ...moduleForm,
        lessons: [...moduleForm.lessons, lessonToAdd]
      });
      
      setCurrentLesson({ 
        id: moduleForm.lessons.length + 2, 
        title: '', 
        content: '',
        introduction: '',
        fundamentals: '',
        advanced: '',
        practice: ''
      });
    } else {
      alert('⚠️ Veuillez remplir au moins le titre de la leçon !');
    }
  };

  const removeLesson = (index) => {
    setModuleForm({
      ...moduleForm,
      lessons: moduleForm.lessons.filter((_, i) => i !== index)
    });
  };

  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.answer) {
      // Préparer la question en fonction du type
      const questionToAdd = {
        id: quizForm.questions.length + 1,
        question: currentQuestion.question,
        type: currentQuestion.type,
        answer: currentQuestion.answer,
        explanation: currentQuestion.explanation
      };
      
      // N'ajouter choices que si c'est un QCM
      if (currentQuestion.type === 'multiple_choice') {
        questionToAdd.choices = currentQuestion.choices.filter(c => c !== '');
      }
      
      setQuizForm({
        ...quizForm,
        questions: [...quizForm.questions, questionToAdd]
      });
      
      setCurrentQuestion({ 
        id: quizForm.questions.length + 2, 
        question: '', 
        type: 'text',
        answer: '', 
        choices: ['', '', '', ''],
        explanation: '' 
      });
    }
  };

  const updateChoice = (index, value) => {
    const newChoices = [...currentQuestion.choices];
    newChoices[index] = value;
    setCurrentQuestion({ ...currentQuestion, choices: newChoices });
  };

  const removeQuestion = (index) => {
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.filter((_, i) => i !== index)
    });
  };

  const editModule = (module) => {
    setModuleForm({
      ...module,
      lessons: module.lessons || []
    });
    setCurrentLesson({ id: (module.lessons || []).length + 1, title: '', content: '', introduction: '', fundamentals: '', advanced: '', practice: '' });
    setEditingModule(module.id);
    setShowModuleForm(true);
  };

  const editQuiz = (quiz) => {
    setQuizForm({
      id: quiz.id,
      questions: quiz.questions || []
    });
    setEditingQuestionIndex(null); // Reset editing state
    setShowQuizForm(true);
  };

  const startEditingQuestion = (index) => {
    console.log('🔧 [EDIT] Édition de la question', index);
    const questionToEdit = quizForm.questions[index];
    console.log('🔧 [EDIT] Question à éditer:', questionToEdit);
    
    setCurrentQuestion({
      id: questionToEdit.id || index + 1,
      question: questionToEdit.question,
      type: questionToEdit.type || 'text',
      answer: questionToEdit.answer,
      choices: questionToEdit.choices || ['', '', '', ''],
      explanation: questionToEdit.explanation || ''
    });
    setEditingQuestionIndex(index);
    
    console.log('🔧 [EDIT] Mode édition activé pour l\'index:', index);
    
    // Scroll vers le formulaire
    setTimeout(() => {
      const formElement = document.querySelector('.add-question-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const updateEditedQuestion = () => {
    if (editingQuestionIndex === null) return;
    
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[editingQuestionIndex] = {
      ...currentQuestion
    };
    
    setQuizForm({
      ...quizForm,
      questions: updatedQuestions
    });
    
    // Reset form
    setCurrentQuestion({
      id: quizForm.questions.length + 1,
      question: '',
      type: 'text',
      answer: '',
      choices: ['', '', '', ''],
      explanation: ''
    });
    setEditingQuestionIndex(null);
    alert('✅ Question modifiée avec succès !');
  };

  const cancelEditingQuestion = () => {
    setCurrentQuestion({
      id: quizForm.questions.length + 1,
      question: '',
      type: 'text',
      answer: '',
      choices: ['', '', '', ''],
      explanation: ''
    });
    setEditingQuestionIndex(null);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Quiz supprimé avec succès !');
        fetchQuizzes();
        fetchStats();
      } else {
        const error = await response.json();
        alert('❌ Erreur: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('❌ Erreur de connexion');
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Utilisateur supprimé avec succès !');
        fetchUsers();
        fetchStats();
      } else {
        const error = await response.json();
        alert('❌ Erreur: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Erreur de connexion');
    }
  };

  return (
    <div className="admin-dashboard">
      <NavBar />
      
      <div className="admin-container">
        <div className="admin-header">
          <h1>🔧 Tableau de Bord Administrateur</h1>
          <p className="admin-welcome">Bienvenue, {user?.username}</p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{stats.total_users}</h3>
                <p>Utilisateurs</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <h3>{stats.total_modules}</h3>
                <p>Modules</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <h3>{stats.total_quizzes}</h3>
                <p>Quiz</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔗</div>
              <div className="stat-info">
                <h3>{stats.active_sessions}</h3>
                <p>Sessions actives</p>
              </div>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Vue d'ensemble
          </button>
          <button 
            className={`tab-btn ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => setActiveTab('modules')}
          >
            📚 Modules
          </button>
          <button 
            className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            🎯 Quiz
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Utilisateurs
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>📈 Statistiques Générales</h2>
              <p>Gérez votre plateforme d'apprentissage en cybersécurité</p>
              <div className="quick-actions">
                <button className="action-btn" onClick={() => { 
                  setActiveTab('modules'); 
                  setShowModuleForm(true); 
                  setCurrentLesson({ id: 1, title: '', content: '', introduction: '', fundamentals: '', advanced: '', practice: '' });
                  setModuleForm({
                    id: '',
                    title: '',
                    description: '',
                    icon: '📚',
                    difficulty: 'Débutant',
                    duration: '30 min',
                    lessons: []
                  });
                }}>
                  ➕ Créer un Module
                </button>
                <button className="action-btn" onClick={() => { setActiveTab('quizzes'); setShowQuizForm(true); }}>
                  ➕ Créer un Quiz
                </button>
              </div>
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="modules-section">
              <div className="section-header">
                <h2>📚 Gestion des Modules</h2>
                <button className="create-btn" onClick={() => {
                  setShowModuleForm(true);
                  setCurrentLesson({ id: 1, title: '', content: '', introduction: '', fundamentals: '', advanced: '', practice: '' });
                  setModuleForm({
                    id: '',
                    title: '',
                    description: '',
                    icon: '📚',
                    difficulty: 'Débutant',
                    duration: '30 min',
                    lessons: []
                  });
                }}>
                  ➕ Nouveau Module
                </button>
              </div>

              {showModuleForm && (
                <div className="form-modal">
                  <div className="form-content">
                    <div className="form-header">
                      <h3>{editingModule ? '✏️ Modifier le Module' : '➕ Créer un Nouveau Module'}</h3>
                      <button className="close-btn" onClick={() => { 
                        setShowModuleForm(false); 
                        setEditingModule(null);
                        setCurrentLesson({ id: 1, title: '', content: '', introduction: '', fundamentals: '', advanced: '', practice: '' });
                      }}>✕</button>
                    </div>

                    <div className="form-body">
                      <div className="form-group">
                        <label>ID du Module *</label>
                        <input
                          type="text"
                          value={moduleForm.id}
                          onChange={(e) => setModuleForm({...moduleForm, id: e.target.value})}
                          placeholder="ex: web_security"
                          disabled={editingModule}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Titre *</label>
                          <input
                            type="text"
                            value={moduleForm.title}
                            onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
                            placeholder="Sécurité Web"
                          />
                        </div>
                        <div className="form-group">
                          <label>Icône</label>
                          <input
                            type="text"
                            value={moduleForm.icon}
                            onChange={(e) => setModuleForm({...moduleForm, icon: e.target.value})}
                            placeholder="🌐"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Description *</label>
                        <textarea
                          value={moduleForm.description}
                          onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                          placeholder="Description du module"
                          rows="3"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Difficulté</label>
                          <select
                            value={moduleForm.difficulty}
                            onChange={(e) => setModuleForm({...moduleForm, difficulty: e.target.value})}
                          >
                            <option>Débutant</option>
                            <option>Intermédiaire</option>
                            <option>Avancé</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Durée</label>
                          <input
                            type="text"
                            value={moduleForm.duration}
                            onChange={(e) => setModuleForm({...moduleForm, duration: e.target.value})}
                            placeholder="30 min"
                          />
                        </div>
                      </div>

                      <div className="lessons-section">
                        <h4>📖 Leçons du Module</h4>
                        
                        {moduleForm.lessons.map((lesson, index) => (
                          <div key={index} className="lesson-item">
                            <div className="lesson-header">
                              <span className="lesson-title">📄 {lesson.title}</span>
                              <button className="delete-btn" onClick={() => removeLesson(index)}>🗑️</button>
                            </div>
                            <p className="lesson-preview">{lesson.content.substring(0, 100)}...</p>
                          </div>
                        ))}

                        <div className="add-lesson-form">
                          <h5>✏️ Créer une Nouvelle Leçon</h5>
                          
                          <div className="lesson-title-input">
                            <label>📝 Titre de la leçon *</label>
                            <input
                              type="text"
                              value={currentLesson.title}
                              onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
                              placeholder="Ex: Introduction à la sécurité web"
                              className="title-input"
                            />
                          </div>

                          <div className="lesson-sections-container">
                            {/* Section Introduction */}
                            <div className="lesson-section-card">
                              <div className="section-header-card">
                                <span className="section-icon">📖</span>
                                <h6>Introduction</h6>
                                <span className="section-badge">Optionnel</span>
                              </div>
                              <textarea
                                value={currentLesson.introduction}
                                onChange={(e) => setCurrentLesson({...currentLesson, introduction: e.target.value})}
                                placeholder="Présentez le sujet de la leçon, son contexte et ses objectifs..."
                                rows="4"
                                className="section-textarea"
                              />
                            </div>

                            {/* Section Concepts fondamentaux */}
                            <div className="lesson-section-card">
                              <div className="section-header-card">
                                <span className="section-icon">🧠</span>
                                <h6>Concepts fondamentaux</h6>
                                <span className="section-badge">Optionnel</span>
                              </div>
                              <textarea
                                value={currentLesson.fundamentals}
                                onChange={(e) => setCurrentLesson({...currentLesson, fundamentals: e.target.value})}
                                placeholder="Expliquez les concepts de base, définitions et principes clés..."
                                rows="4"
                                className="section-textarea"
                              />
                            </div>

                            {/* Section Techniques avancées */}
                            <div className="lesson-section-card">
                              <div className="section-header-card">
                                <span className="section-icon">⚡</span>
                                <h6>Techniques avancées</h6>
                                <span className="section-badge">Optionnel</span>
                              </div>
                              <textarea
                                value={currentLesson.advanced}
                                onChange={(e) => setCurrentLesson({...currentLesson, advanced: e.target.value})}
                                placeholder="Détaillez les techniques avancées, exemples pratiques et cas d'usage..."
                                rows="4"
                                className="section-textarea"
                              />
                            </div>

                            {/* Section Pratique & Résumé */}
                            <div className="lesson-section-card">
                              <div className="section-header-card">
                                <span className="section-icon">🎯</span>
                                <h6>Pratique & Résumé</h6>
                                <span className="section-badge">Optionnel</span>
                              </div>
                              <textarea
                                value={currentLesson.practice}
                                onChange={(e) => setCurrentLesson({...currentLesson, practice: e.target.value})}
                                placeholder="Résumez les points clés et proposez des exercices pratiques..."
                                rows="4"
                                className="section-textarea"
                              />
                            </div>
                          </div>

                          <div className="lesson-help-text">
                            💡 <strong>Astuce :</strong> Remplissez uniquement les sections nécessaires. Vous pouvez laisser certaines sections vides.
                          </div>
                          
                          <button className="add-btn" onClick={addLesson}>
                            ✅ Ajouter cette Leçon au Module
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="form-footer">
                      <button className="cancel-btn" onClick={() => { 
                        setShowModuleForm(false); 
                        setEditingModule(null);
                        setCurrentLesson({ id: 1, title: '', content: '', introduction: '', fundamentals: '', advanced: '', practice: '' });
                      }}>
                        Annuler
                      </button>
                      <button className="submit-btn" onClick={editingModule ? handleUpdateModule : handleCreateModule}>
                        {editingModule ? '💾 Mettre à jour' : '✅ Créer le Module'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="modules-list">
                {modules.map((module) => (
                  <div key={module.id} className="module-card">
                    <div className="module-header">
                      <span className="module-icon">{module.icon}</span>
                      <h3>{module.title}</h3>
                    </div>
                    <p className="module-desc">{module.description}</p>
                    <div className="module-meta">
                      <span className="badge">{module.difficulty}</span>
                      <span className="badge">{module.duration}</span>
                    </div>
                    <div className="module-actions">
                      <button className="edit-btn" onClick={() => editModule(module)}>✏️ Modifier</button>
                      <button 
                        className="quiz-btn" 
                        onClick={() => {
                          // Chercher le quiz correspondant au module
                          const correspondingQuiz = quizzes.find(q => q.id === module.id);
                          if (correspondingQuiz) {
                            // Quiz existe, l'éditer
                            editQuiz(correspondingQuiz);
                            setActiveTab('quizzes');
                          } else {
                            // Quiz n'existe pas, ouvrir le formulaire pré-rempli
                            setQuizForm({
                              id: module.id,
                              title: module.title,
                              icon: module.icon,
                              difficulty: module.difficulty,
                              questions: []
                            });
                            setActiveTab('quizzes');
                            setShowQuizForm(true);
                          }
                        }}
                        title="Éditer le quiz de ce module"
                      >
                        🎯 Quiz
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteModule(module.id)}>🗑️ Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="quizzes-section">
              <div className="section-header">
                <h2>🎯 Gestion des Quiz</h2>
                <button className="create-btn" onClick={() => setShowQuizForm(true)}>
                  ➕ Nouveau Quiz
                </button>
              </div>

              {/* Liste des quiz existants */}
              {quizzes.length > 0 ? (
                <div className="modules-list">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="module-card">
                      <div className="module-header">
                        <span className="module-icon">{quiz.icon || '🎯'}</span>
                        <h3>{quiz.title}</h3>
                      </div>
                      <div className="module-meta">
                        <span className="badge">{quiz.difficulty || 'Standard'}</span>
                        <span className="badge">{quiz.questions?.length || 0} questions</span>
                      </div>
                      <div className="module-actions">
                        <button className="edit-btn" onClick={() => editQuiz(quiz)}>✏️ Modifier</button>
                        <button className="delete-btn" onClick={() => handleDeleteQuiz(quiz.id)}>🗑️ Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>📝 Aucun quiz disponible. Créez-en un !</p>
                </div>
              )}

              {showQuizForm && (
                <div className="form-modal">
                  <div className="form-content">
                    <div className="form-header">
                      <h3>➕ Créer un Nouveau Quiz</h3>
                      <button className="close-btn" onClick={() => setShowQuizForm(false)}>✕</button>
                    </div>

                    <div className="form-body">
                      <div className="form-group">
                        <label>ID du Quiz *</label>
                        <input
                          type="text"
                          value={quizForm.id}
                          onChange={(e) => setQuizForm({...quizForm, id: e.target.value})}
                          placeholder="ex: web_security"
                        />
                      </div>

                      <div className="questions-section">
                        <h4>❓ Questions du Quiz</h4>
                        
                        {quizForm.questions.map((question, index) => (
                          <div key={index} className="question-item">
                            <div className="question-header">
                              <span className="question-number">Q{index + 1}</span>
                              <span className="question-text">{question.question}</span>
                              <div className="question-actions">
                                <button className="edit-btn" onClick={() => startEditingQuestion(index)}>✏️ Modifier</button>
                                <button className="delete-btn" onClick={() => removeQuestion(index)}>🗑️</button>
                              </div>
                            </div>
                            <p className="answer-preview">✅ Réponse: {question.answer}</p>
                          </div>
                        ))}

                        <div className="add-question-form">
                          <h5>{editingQuestionIndex !== null ? `✏️ Modifier la Question ${editingQuestionIndex + 1}` : '➕ Ajouter une Question'}</h5>
                          {editingQuestionIndex !== null && (
                            <p style={{color: '#ff9800', marginBottom: '10px'}}>
                              Mode édition - Modifiez les champs ci-dessous
                            </p>
                          )}
                          
                          {/* Type de question */}
                          <div className="form-group">
                            <label>Type de question</label>
                            <select
                              value={currentQuestion.type}
                              onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value})}
                            >
                              <option value="text">✏️ Texte libre (réponse à écrire)</option>
                              <option value="multiple_choice">☑️ QCM (choix multiples)</option>
                            </select>
                          </div>

                          {/* Question */}
                          <input
                            type="text"
                            value={currentQuestion.question}
                            onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                            placeholder="Question"
                          />

                          {/* Si type texte libre */}
                          {currentQuestion.type === 'text' && (
                            <input
                              type="text"
                              value={currentQuestion.answer}
                              onChange={(e) => setCurrentQuestion({...currentQuestion, answer: e.target.value})}
                              placeholder="Réponse correcte (utilisez | pour plusieurs réponses acceptées)"
                            />
                          )}

                          {/* Si type QCM */}
                          {currentQuestion.type === 'multiple_choice' && (
                            <div className="choices-container">
                              <label>Choix de réponses (cochez la bonne réponse) :</label>
                              {currentQuestion.choices.map((choice, index) => (
                                <div key={index} className="choice-input">
                                  <input
                                    type="radio"
                                    name="correct_answer"
                                    checked={currentQuestion.answer === choice && choice !== ''}
                                    onChange={() => setCurrentQuestion({...currentQuestion, answer: choice})}
                                  />
                                  <input
                                    type="text"
                                    value={choice}
                                    onChange={(e) => updateChoice(index, e.target.value)}
                                    placeholder={`Choix ${index + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Explication */}
                          <textarea
                            value={currentQuestion.explanation}
                            onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                            placeholder="Explication de la réponse"
                            rows="3"
                          />
                          {editingQuestionIndex !== null ? (
                            <div style={{display: 'flex', gap: '10px'}}>
                              <button className="add-btn" onClick={updateEditedQuestion}>✅ Enregistrer les Modifications</button>
                              <button className="delete-btn" onClick={cancelEditingQuestion}>❌ Annuler</button>
                            </div>
                          ) : (
                            <button className="add-btn" onClick={addQuestion}>➕ Ajouter la Question</button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-footer">
                      <button className="cancel-btn" onClick={() => setShowQuizForm(false)}>
                        Annuler
                      </button>
                      <button className="submit-btn" onClick={handleCreateQuiz}>
                        ✅ Créer le Quiz
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h2>👥 Gestion des Utilisateurs</h2>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                  <span className="badge" style={{fontSize: '1rem', padding: '0.5rem 1rem'}}>
                    {users.length} utilisateur{users.length > 1 ? 's' : ''}
                  </span>
                  <button className="create-btn" onClick={fetchUsers} style={{fontSize: '0.9rem'}}>
                    🔄 Rafraîchir
                  </button>
                </div>
              </div>

              {users.length > 0 ? (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>👤 Utilisateur</th>
                        <th>📧 Email</th>
                        <th>⭐ Niveau</th>
                        <th>🎯 XP</th>
                        <th>📚 Modules</th>
                        <th>🎓 Quiz</th>
                        <th>🔧 Rôle</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.username}>
                          <td className="user-name">{u.username}</td>
                          <td>{u.email || 'N/A'}</td>
                          <td className="user-level">
                            <span className="level-badge">Niv. {u.level || 1}</span>
                          </td>
                          <td className="user-xp">{u.xp || 0} XP</td>
                          <td className="user-progress">
                            {u.completed_modules?.length || 0}
                          </td>
                          <td className="user-progress">
                            {u.completed_quizzes?.length || 0}
                          </td>
                          <td>
                            {u.is_admin ? (
                              <span className="admin-badge">👑 Admin</span>
                            ) : (
                              <span className="user-badge">👤 Utilisateur</span>
                            )}
                          </td>
                          <td>
                            {u.username !== user?.username && !u.is_admin && (
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeleteUser(u.username)}
                              >
                                🗑️ Supprimer
                              </button>
                            )}
                            {u.username === user?.username && (
                              <span className="current-user">Vous</span>
                            )}
                            {u.is_admin && u.username !== user?.username && (
                              <span className="protected-user">Protégé</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>👥 Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
