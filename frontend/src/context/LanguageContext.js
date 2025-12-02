import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Traductions
const translations = {
  fr: {
    // Navigation
    home: "Accueil",
    leaderboard: "Classement",
    
    // Page d'accueil
    welcomeTitle: "Bienvenue sur CyberForge",
    welcomeSubtitle: "🛡️ Maîtrisez la cybersécurité grâce à un apprentissage gamifié, gagnez de l'XP, déverrouillez des badges et devenez un expert en défense cyber !",
    cyberSecurityModules: "🎯 Modules d'Apprentissage Cybersécurité",
    level: "Niveau",
    xp: "XP",
    streak: "Série",
    levelProgress: "Progression Niveau {level}",
    xpToNextLevel: "{xp} XP jusqu'au niveau suivant",
    unlockPrevious: "Terminez le module précédent pour débloquer",
    courseQuiz: "📚 Cours + 🎯 Quiz",
    achievements: "🏅 Vos Réussites",
    startJourney: "Commencez Votre Parcours Cyber",
    ctaDescription: "Rejoignez des milliers d'apprenants et devenez un expert en cybersécurité. Créez votre compte gratuitement et commencez dès maintenant !",
    secureWith2FA: "Sécurisé avec 2FA",
    trackProgress: "Suivez vos Progrès",
    earnBadges: "Gagnez des Badges",
    
    // Actions rapides
    quickActionsLeaderboard: "🏆 Classement",
    leaderboardDesc: "Voyez votre rang parmi les autres experts cyber",
    cyberLabs: "🔬 Laboratoires Cyber",
    cyberLabsDesc: "Environnements de test pratiques (Bientôt disponible)",
    advancedChallenges: "🎯 Défis Avancés",
    advancedChallengesDesc: "Défis de cybersécurité niveau expert (Bientôt disponible)",
    
    // Modules
    networkBasics: "Sécurité Réseau Fondamentale",
    networkBasicsDesc: "Maîtrisez les bases de la sécurité réseau et les protocoles",
    webSecurity: "Sécurité des Applications Web",
    webSecurityDesc: "Apprenez les vulnérabilités web et comment les prévenir",
    cryptography: "Cryptographie Moderne",
    cryptographyDesc: "Comprenez le chiffrement, le hachage et les signatures numériques",
    incidentResponse: "Réponse aux Incidents",
    incidentResponseDesc: "Gérez les incidents de sécurité et analysez les menaces",
    ethicalHacking: "Hacking Éthique",
    ethicalHackingDesc: "Maîtrisez les techniques de test d'intrusion légales",
    
    // Boutons
    takeCourse: "Suivre le Cours",
    takeQuiz: "Faire le Quiz",
    startQuiz: "Commencer le Quiz",
    backToHome: "Retour à l'Accueil",
    backToDashboard: "Retour au tableau de bord",
    
    // Quiz/Challenge
    difficulty: "Difficulté",
    easy: "FACILE",
    medium: "MOYEN",
    hard: "DIFFICILE",
    submitAnswer: "Soumettre la Réponse",
    submitting: "Soumission...",
    correct: "Correct !",
    incorrect: "Incorrect",
    explanation: "Explication :",
    correctAnswer: "Bonne réponse :",
    levelUp: "Niveau Supérieur ! Vous êtes maintenant niveau {level} !",
    badgeEarned: "Badge Gagné : {badge}",
    moduleCompleted: "Module Terminé ! Excellent travail pour avoir maîtrisé {title} !",
    nextChallenge: "Défi Suivant →",
    
    // Cours
    loadingCourse: "Chargement du cours...",
    courseNotFound: "📚 Cours non trouvé",
    courseLocked: "Ce cours est verrouillé ! Montez de niveau pour y accéder.",
    progress: "Progression",
    completed: "terminées",
    section: "Section",
    of: "sur",
    previousSection: "Section précédente",
    nextSection: "Section suivante",
    finishCourse: "Terminer le cours",
    courseCompleted: "🎉 Cours Terminé !",
    courseCompletedDesc: "Vous avez terminé : {title}",
    courseCompletedReady: "Vous êtes maintenant prêt à tester vos connaissances avec le quiz !",
    courseXpReward: "+{xp} XP pour la completion du cours",
    
    // Classement
    loadingLeaderboard: "Chargement du classement...",
    cyberWarriorsLeaderboard: "🏆 Classement des Guerriers Cyber",
    leaderboardSubtitle: "Voyez votre position parmi les autres défenseurs",
    rank: "Rang",
    player: "Joueur",
    score: "Score",
    you: "Vous",
    noDataYet: "🎯 Aucune donnée pour le moment",
    noDataDesc: "Commencez à compléter les défis pour voir le classement !",
    levelTiers: "Niveaux",
    novice: "1-4: Novice",
    apprentice: "5-9: Apprenti",
    expert: "10-14: Expert",
    master: "15-19: Maître",
    legend: "20+: Légende",
    
    // Authentification
    createAccount: "Créer un Compte",
    joinCyberWarriors: "Rejoignez la communauté des guerriers cyber",
    username: "Nom d'utilisateur",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    enterUsername: "Entrez votre nom d'utilisateur",
    enterEmail: "Entrez votre email",
    enterPassword: "Entrez votre mot de passe",
    confirmPasswordPlaceholder: "Confirmez votre mot de passe",
    passwordRequirements: "8+ caractères, majuscules, minuscules, chiffres et symboles requis",
    usernameRequired: "Nom d'utilisateur requis",
    usernameMinLength: "Au moins 3 caractères requis",
    emailRequired: "Email requis",
    emailInvalid: "Format d'email invalide",
    passwordRequired: "Mot de passe requis",
    passwordMinLength: "Au moins 8 caractères requis",
    passwordComplexity: "Mot de passe trop simple (majuscules, minuscules, chiffres, symboles)",
    confirmPasswordRequired: "Confirmation du mot de passe requise",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    creating: "Création",
    registrationSuccess: "Inscription réussie ! Configuration de la 2FA...",
    registrationError: "Erreur lors de l'inscription",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    signInHere: "Connectez-vous ici",
    
    // 2FA Setup
    setup2FA: "Configuration 2FA",
    secure2FADescription: "Sécurisez votre compte avec l'authentification à deux facteurs",
    downloadAuthApp: "Téléchargez une app d'authentification",
    scanQRCode: "Scannez le QR Code",
    enterVerificationCode: "Entrez le code de vérification",
    cantScanQR: "Impossible de scanner ? Entrez ce code manuellement :",
    copySecret: "Copier le code secret",
    recommendedApps: "Applications recommandées",
    continueToVerification: "Continuer vers la vérification",
    verificationCode: "Code de vérification",
    enter6DigitCode: "Entrez le code à 6 chiffres de votre app",
    backToQR: "Retour au QR Code",
    verifyAndComplete: "Vérifier et Terminer",
    verifying: "Vérification",
    congratulations: "Félicitations !",
    "2faSuccessMessage": "Votre compte est maintenant sécurisé avec la 2FA",
    redirectingToLogin: "Redirection vers la connexion...",
    "generating2FA": "Génération du QR Code 2FA...",
    pleaseWait: "Veuillez patienter",
    qrGenerationError: "Erreur lors de la génération du QR Code",
    qrLoadError: "Erreur de chargement du QR Code",
    tryAgain: "Réessayer",
    invalidCodeLength: "Le code doit contenir 6 chiffres",
    invalidVerificationCode: "Code de vérification invalide",
    "2faSetupSuccess": "Configuration 2FA terminée avec succès !",
    "2faSetupComplete": "Configuration 2FA Terminée",
    accountSecured: "Votre compte est maintenant sécurisé",
    
    // Login
    welcomeBack: "Bon Retour !",
    signInToContinue: "Connectez-vous pour continuer",
    signIn: "Se Connecter",
    signingIn: "Connexion",
    loginError: "Erreur de connexion",
    forgotPassword: "Mot de passe oublié ?",
    dontHaveAccount: "Vous n'avez pas de compte ?",
    createAccountHere: "Créez-en un ici",
    twoFactorVerification: "Vérification 2FA",
    enterAuthenticatorCode: "Entrez le code de votre application d'authentification",
    authenticatorCode: "Code d'authentification",
    backToLogin: "Retour à la connexion",
    verifyAndSignIn: "Vérifier et Se Connecter",
    "2faCodeRequired": "Code 2FA requis",
    "invalid2FACode": "Code 2FA invalide",
    networkError: "Erreur réseau",
    
    // Questions Quiz - Réseau
    "net_001_q": "Que signifie IP dans le contexte des réseaux ?",
    "net_001_o1": "Internet Protocol",
    "net_001_o2": "Internal Process",
    "net_001_o3": "Input Parameter", 
    "net_001_o4": "Information Path",
    "net_001_exp": "IP signifie Internet Protocol, qui est fondamental pour la communication entre les appareils sur les réseaux.",
    
    "net_002_q": "Quel port utilise typiquement HTTPS ?",
    "net_002_o1": "80",
    "net_002_o2": "443",
    "net_002_o3": "8080",
    "net_002_o4": "22",
    "net_002_exp": "HTTPS utilise le port 443 par défaut pour les communications web sécurisées.",
    
    "net_003_q": "Quel est le rôle principal d'un pare-feu (firewall) ?",
    "net_003_o1": "Accélérer le réseau",
    "net_003_o2": "Filtrer le trafic réseau",
    "net_003_o3": "Stocker les mots de passe",
    "net_003_o4": "Chiffrer les données",
    "net_003_exp": "Les pare-feux filtrent le trafic réseau entrant et sortant selon des règles de sécurité.",
    
    "net_004_q": "Que signifie SSH ?",
    "net_004_o1": "Secure Shell",
    "net_004_o2": "System Security Hub",
    "net_004_o3": "Server Setup Helper",
    "net_004_o4": "Safe Socket Handler",
    "net_004_exp": "SSH (Secure Shell) est un protocole sécurisé pour l'accès et l'administration à distance.",
    
    "net_005_q": "Quelle est la différence principale entre TCP et UDP ?",
    "net_005_o1": "TCP est plus rapide",
    "net_005_o2": "UDP garantit la livraison",
    "net_005_o3": "TCP garantit la livraison",
    "net_005_o4": "UDP est plus sécurisé",
    "net_005_exp": "TCP garantit la livraison des données contrairement à UDP qui privilégie la vitesse.",
    
    // Questions Quiz - Web
    "web_001_q": "Que signifie XSS en sécurité web ?",
    "web_001_o1": "Cross-Site Scripting",
    "web_001_o2": "Extra Security System",
    "web_001_o3": "Extended SQL Syntax",
    "web_001_o4": "XML Site Structure",
    "web_001_exp": "XSS (Cross-Site Scripting) est une vulnérabilité où des scripts malveillants sont injectés dans des pages web.",
    
    "web_002_q": "Quelle est la meilleure défense contre l'injection SQL ?",
    "web_002_o1": "Mots de passe plus longs",
    "web_002_o2": "Requêtes préparées",
    "web_002_o3": "HTTPS",
    "web_002_o4": "Pare-feux",
    "web_002_exp": "Les requêtes préparées empêchent l'injection SQL en séparant le code SQL des données.",
    
    "web_003_q": "Que signifie CSRF ?",
    "web_003_o1": "Cross-Site Request Forgery",
    "web_003_o2": "Crypto Security Response Framework",
    "web_003_o3": "Client Side Resource Failure",
    "web_003_o4": "Cross System Resource Finder",
    "web_003_exp": "CSRF permet d'exécuter des actions non autorisées au nom d'un utilisateur authentifié.",
    
    "web_004_q": "Pourquoi HTTPS est-il important ?",
    "web_004_o1": "Il accélère le site",
    "web_004_o2": "Il chiffre les communications",
    "web_004_o3": "Il améliore le SEO",
    "web_004_o4": "Il réduit la bande passante",
    "web_004_exp": "HTTPS chiffre les communications entre le navigateur et le serveur, protégeant les données sensibles.",
    
    // Questions Quiz - Cryptographie
    "crypto_001_q": "Quel est l'objectif principal du hachage ?",
    "crypto_001_o1": "Chiffrer les données",
    "crypto_001_o2": "Vérifier l'intégrité des données",
    "crypto_001_o3": "Accélérer le traitement",
    "crypto_001_o4": "Compresser les fichiers",
    "crypto_001_exp": "Le hachage crée une empreinte unique pour vérifier que les données n'ont pas été altérées.",
    
    "crypto_002_q": "Quelle est la différence entre chiffrement symétrique et asymétrique ?",
    "crypto_002_o1": "Pas de différence",
    "crypto_002_o2": "Symétrique utilise une clé, asymétrique deux",
    "crypto_002_o3": "Asymétrique est plus rapide",
    "crypto_002_o4": "Symétrique est plus sûr",
    "crypto_002_exp": "Le chiffrement symétrique utilise une seule clé, l'asymétrique utilise une paire de clés (publique/privée).",
    
    // Contenu des cours - Réseau
    "course_net_title": "Sécurité Réseau Fondamentale",
    "course_net_desc": "Découvrez les fondements de la sécurité réseau et apprenez à protéger vos infrastructures.",
    "course_net_s1_title": "Introduction aux Réseaux",
    "course_net_s1_p1": "Un réseau informatique est un ensemble d'équipements interconnectés qui partagent des ressources et des informations.",
    "course_net_s1_p2": "La sécurité réseau vise à protéger l'intégrité, la confidentialité et la disponibilité des données transitant sur le réseau.",
    "course_net_s1_p3": "Les menaces réseau peuvent provenir de l'extérieur (attaquants externes) ou de l'intérieur (employés malveillants, erreurs humaines).",
    
    "course_net_s2_title": "Protocoles de Communication",
    "course_net_s2_l1": "TCP/IP : Protocole de transport fiable pour les communications réseau",
    "course_net_s2_l2": "HTTP/HTTPS : Protocoles pour le web, HTTPS étant la version sécurisée",
    "course_net_s2_l3": "SSH : Protocol sécurisé pour l'administration à distance",
    "course_net_s2_l4": "DNS : Système de résolution de noms de domaine",
    "course_net_s2_l5": "DHCP : Attribution automatique d'adresses IP",
    
    "course_net_s3_title": "Exemple de Configuration Firewall",
    "course_net_s3_subtitle": "Règles de base pour un pare-feu iptables :",
    "course_net_s3_code": "# Bloquer tout le trafic entrant par défaut\niptables -P INPUT DROP\n\n# Autoriser les connexions locales\niptables -A INPUT -i lo -j ACCEPT\n\n# Autoriser les connexions SSH\niptables -A INPUT -p tcp --dport 22 -j ACCEPT\n\n# Autoriser HTTP et HTTPS\niptables -A INPUT -p tcp --dport 80 -j ACCEPT\niptables -A INPUT -p tcp --dport 443 -j ACCEPT",
    
    "course_net_s4_title": "Bonnes Pratiques Importantes",
    "course_net_s4_w1": "Toujours utiliser des mots de passe forts et uniques pour chaque équipement réseau",
    "course_net_s4_w2": "Mettre à jour régulièrement les firmwares et logiciels de sécurité",
    "course_net_s4_w3": "Surveiller les logs et configurer des alertes pour détecter les activités suspectes",
    "course_net_s4_w4": "Segmenter le réseau pour limiter la propagation des attaques"
  },
  
  en: {
    // Navigation
    home: "Home",
    leaderboard: "Leaderboard",
    
    // Home page
    welcomeTitle: "Welcome to CyberForge",
    welcomeSubtitle: "🛡️ Master cybersecurity through gamified learning, earn XP, unlock badges and become an elite cyber defender!",
    cyberSecurityModules: "🎯 Cybersecurity Learning Modules",
    level: "Level",
    xp: "XP",
    streak: "Streak",
    levelProgress: "Level {level} Progress",
    xpToNextLevel: "{xp} XP to next level",
    unlockPrevious: "Complete the previous module to unlock",
    courseQuiz: "📚 Course + 🎯 Quiz",
    achievements: "🏅 Your Achievements",
    startJourney: "Start Your Cyber Journey",
    ctaDescription: "Join thousands of learners and become a cybersecurity expert. Create your free account and start learning today!",
    secureWith2FA: "Secured with 2FA",
    trackProgress: "Track Your Progress",
    earnBadges: "Earn Badges",
    
    // Quick actions
    quickActionsLeaderboard: "🏆 Leaderboard",
    leaderboardDesc: "See how you rank against other cyber warriors",
    cyberLabs: "🔬 Cyber Labs",
    cyberLabsDesc: "Hands-on penetration testing environments (Coming Soon)",
    advancedChallenges: "🎯 Advanced Challenges",
    advancedChallengesDesc: "Expert level cybersecurity challenges (Coming Soon)",
    
    // Modules
    networkBasics: "Network Security Fundamentals",
    networkBasicsDesc: "Master the basics of network security and protocols",
    webSecurity: "Web Application Security",
    webSecurityDesc: "Learn about web vulnerabilities and how to prevent them",
    cryptography: "Modern Cryptography",
    cryptographyDesc: "Understand encryption, hashing, and digital signatures",
    incidentResponse: "Incident Response",
    incidentResponseDesc: "Handle security incidents and analyze threats",
    ethicalHacking: "Ethical Hacking",
    ethicalHackingDesc: "Master legal penetration testing techniques",
    
    // Buttons
    takeCourse: "Take Course",
    takeQuiz: "Take Quiz",
    startQuiz: "Start Quiz",
    backToHome: "Back to Home",
    backToDashboard: "Back to Dashboard",
    
    // Quiz/Challenge
    difficulty: "Difficulty",
    easy: "EASY",
    medium: "MEDIUM",
    hard: "HARD",
    submitAnswer: "Submit Answer",
    submitting: "Submitting...",
    correct: "Correct!",
    incorrect: "Incorrect",
    explanation: "Explanation:",
    correctAnswer: "Correct answer:",
    levelUp: "Level Up! You are now level {level}!",
    badgeEarned: "Badge Earned: {badge}",
    moduleCompleted: "Module Completed! Great job mastering {title}!",
    nextChallenge: "Next Challenge →",
    
    // Course
    loadingCourse: "Loading course...",
    courseNotFound: "📚 Course not found", 
    courseLocked: "This course is locked! Level up to access it.",
    progress: "Progress",
    completed: "completed",
    section: "Section",
    of: "of",
    previousSection: "Previous section",
    nextSection: "Next section",
    finishCourse: "Finish course",
    courseCompleted: "🎉 Course Completed!",
    courseCompletedDesc: "You have completed: {title}",
    courseCompletedReady: "You are now ready to test your knowledge with the quiz!",
    courseXpReward: "+{xp} XP for course completion",
    
    // Leaderboard
    loadingLeaderboard: "Loading leaderboard...",
    cyberWarriorsLeaderboard: "🏆 Cyber Warriors Leaderboard",
    leaderboardSubtitle: "See how you stack up against fellow defenders",
    rank: "Rank",
    player: "Player",
    score: "Score",
    you: "You",
    noDataYet: "🎯 No data yet",
    noDataDesc: "Start completing challenges to see the leaderboard!",
    levelTiers: "Level Tiers",
    novice: "1-4: Novice",
    apprentice: "5-9: Apprentice",
    expert: "10-14: Expert",
    master: "15-19: Master",
    legend: "20+: Legend",
    
    // Authentication
    createAccount: "Create Account",
    joinCyberWarriors: "Join the cyber warriors community",
    username: "Username",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    enterUsername: "Enter your username",
    enterEmail: "Enter your email",
    enterPassword: "Enter your password",
    confirmPasswordPlaceholder: "Confirm your password",
    passwordRequirements: "8+ characters, uppercase, lowercase, numbers and symbols required",
    usernameRequired: "Username required",
    usernameMinLength: "At least 3 characters required",
    emailRequired: "Email required",
    emailInvalid: "Invalid email format",
    passwordRequired: "Password required",
    passwordMinLength: "At least 8 characters required",
    passwordComplexity: "Password too simple (uppercase, lowercase, numbers, symbols)",
    confirmPasswordRequired: "Password confirmation required",
    passwordMismatch: "Passwords do not match",
    creating: "Creating",
    registrationSuccess: "Registration successful! Setting up 2FA...",
    registrationError: "Registration error",
    alreadyHaveAccount: "Already have an account?",
    signInHere: "Sign in here",
    
    // 2FA Setup
    setup2FA: "2FA Setup",
    secure2FADescription: "Secure your account with two-factor authentication",
    downloadAuthApp: "Download an authenticator app",
    scanQRCode: "Scan the QR Code",
    enterVerificationCode: "Enter verification code",
    cantScanQR: "Can't scan? Enter this code manually:",
    copySecret: "Copy secret code",
    recommendedApps: "Recommended Apps",
    continueToVerification: "Continue to Verification",
    verificationCode: "Verification Code",
    enter6DigitCode: "Enter the 6-digit code from your app",
    backToQR: "Back to QR Code",
    verifyAndComplete: "Verify and Complete",
    verifying: "Verifying",
    congratulations: "Congratulations!",
    "2faSuccessMessage": "Your account is now secured with 2FA",
    redirectingToLogin: "Redirecting to login...",
    "generating2FA": "Generating 2FA QR Code...",
    pleaseWait: "Please wait",
    qrGenerationError: "QR Code generation error",
    qrLoadError: "QR Code loading error",
    tryAgain: "Try Again",
    invalidCodeLength: "Code must be 6 digits",
    invalidVerificationCode: "Invalid verification code",
    "2faSetupSuccess": "2FA setup completed successfully!",
    "2faSetupComplete": "2FA Setup Complete",
    accountSecured: "Your account is now secured",
    
    // Login
    welcomeBack: "Welcome Back!",
    signInToContinue: "Sign in to continue",
    signIn: "Sign In",
    signingIn: "Signing In",
    loginError: "Login error",
    forgotPassword: "Forgot password?",
    dontHaveAccount: "Don't have an account?",
    createAccountHere: "Create one here",
    twoFactorVerification: "Two-Factor Verification",
    enterAuthenticatorCode: "Enter the code from your authenticator app",
    authenticatorCode: "Authenticator Code",
    backToLogin: "Back to Login",
    verifyAndSignIn: "Verify and Sign In",
    "2faCodeRequired": "2FA code required",
    "invalid2FACode": "Invalid 2FA code",
    networkError: "Network error",
    
    // Quiz Questions - Network
    "net_001_q": "What does IP stand for in networking?",
    "net_001_o1": "Internet Protocol",
    "net_001_o2": "Internal Process",
    "net_001_o3": "Input Parameter",
    "net_001_o4": "Information Path",
    "net_001_exp": "IP stands for Internet Protocol, which is fundamental to how devices communicate on networks.",
    
    "net_002_q": "Which port does HTTPS typically use?",
    "net_002_o1": "80",
    "net_002_o2": "443", 
    "net_002_o3": "8080",
    "net_002_o4": "22",
    "net_002_exp": "HTTPS uses port 443 by default for secure web communications.",
    
    "net_003_q": "What is the main purpose of a firewall?",
    "net_003_o1": "Speed up network",
    "net_003_o2": "Filter network traffic",
    "net_003_o3": "Store passwords",
    "net_003_o4": "Encrypt data",
    "net_003_exp": "Firewalls filter incoming and outgoing network traffic based on security rules.",
    
    "net_004_q": "What does SSH stand for?",
    "net_004_o1": "Secure Shell",
    "net_004_o2": "System Security Hub",
    "net_004_o3": "Server Setup Helper",
    "net_004_o4": "Safe Socket Handler",
    "net_004_exp": "SSH (Secure Shell) is a secure protocol for remote access and administration.",
    
    "net_005_q": "What is the main difference between TCP and UDP?",
    "net_005_o1": "TCP is faster",
    "net_005_o2": "UDP guarantees delivery",
    "net_005_o3": "TCP guarantees delivery",
    "net_005_o4": "UDP is more secure",
    "net_005_exp": "TCP guarantees data delivery unlike UDP which prioritizes speed.",
    
    // Quiz Questions - Web
    "web_001_q": "What does XSS stand for in web security?",
    "web_001_o1": "Cross-Site Scripting",
    "web_001_o2": "Extra Security System",
    "web_001_o3": "Extended SQL Syntax",
    "web_001_o4": "XML Site Structure",
    "web_001_exp": "XSS (Cross-Site Scripting) is a vulnerability where malicious scripts are injected into web pages.",
    
    "web_002_q": "What is the best defense against SQL injection?",
    "web_002_o1": "Longer passwords",
    "web_002_o2": "Parameterized queries",
    "web_002_o3": "HTTPS",
    "web_002_o4": "Firewalls",
    "web_002_exp": "Parameterized queries prevent SQL injection by separating SQL code from data.",
    
    "web_003_q": "What does CSRF stand for?",
    "web_003_o1": "Cross-Site Request Forgery",
    "web_003_o2": "Crypto Security Response Framework",
    "web_003_o3": "Client Side Resource Failure",
    "web_003_o4": "Cross System Resource Finder",
    "web_003_exp": "CSRF allows executing unauthorized actions on behalf of an authenticated user.",
    
    "web_004_q": "Why is HTTPS important?",
    "web_004_o1": "It speeds up the site",
    "web_004_o2": "It encrypts communications",
    "web_004_o3": "It improves SEO",
    "web_004_o4": "It reduces bandwidth",
    "web_004_exp": "HTTPS encrypts communications between the browser and server, protecting sensitive data.",
    
    // Quiz Questions - Cryptography
    "crypto_001_q": "What is the primary purpose of hashing?",
    "crypto_001_o1": "Encrypt data",
    "crypto_001_o2": "Verify data integrity",
    "crypto_001_o3": "Speed up processing",
    "crypto_001_o4": "Compress files",
    "crypto_001_exp": "Hashing creates a unique fingerprint to verify that data hasn't been tampered with.",
    
    "crypto_002_q": "What is the difference between symmetric and asymmetric encryption?",
    "crypto_002_o1": "No difference",
    "crypto_002_o2": "Symmetric uses one key, asymmetric uses two",
    "crypto_002_o3": "Asymmetric is faster",
    "crypto_002_o4": "Symmetric is more secure",
    "crypto_002_exp": "Symmetric encryption uses one key, asymmetric uses a key pair (public/private).",
    
    // Course Content - Network
    "course_net_title": "Network Security Fundamentals",
    "course_net_desc": "Discover the fundamentals of network security and learn to protect your infrastructure.",
    "course_net_s1_title": "Introduction to Networks",
    "course_net_s1_p1": "A computer network is a set of interconnected equipment that shares resources and information.",
    "course_net_s1_p2": "Network security aims to protect the integrity, confidentiality and availability of data transiting on the network.",
    "course_net_s1_p3": "Network threats can come from outside (external attackers) or inside (malicious employees, human errors).",
    
    "course_net_s2_title": "Communication Protocols",
    "course_net_s2_l1": "TCP/IP: Reliable transport protocol for network communications",
    "course_net_s2_l2": "HTTP/HTTPS: Web protocols, HTTPS being the secure version",
    "course_net_s2_l3": "SSH: Secure protocol for remote administration",
    "course_net_s2_l4": "DNS: Domain name resolution system",
    "course_net_s2_l5": "DHCP: Automatic IP address assignment",
    
    "course_net_s3_title": "Firewall Configuration Example",
    "course_net_s3_subtitle": "Basic rules for an iptables firewall:",
    "course_net_s3_code": "# Block all incoming traffic by default\niptables -P INPUT DROP\n\n# Allow local connections\niptables -A INPUT -i lo -j ACCEPT\n\n# Allow SSH connections\niptables -A INPUT -p tcp --dport 22 -j ACCEPT\n\n# Allow HTTP and HTTPS\niptables -A INPUT -p tcp --dport 80 -j ACCEPT\niptables -A INPUT -p tcp --dport 443 -j ACCEPT",
    
    "course_net_s4_title": "Important Best Practices",
    "course_net_s4_w1": "Always use strong and unique passwords for each network equipment",
    "course_net_s4_w2": "Regularly update firmware and security software",
    "course_net_s4_w3": "Monitor logs and configure alerts to detect suspicious activities",
    "course_net_s4_w4": "Segment the network to limit attack propagation"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fr' ? 'en' : 'fr');
  };

  const t = (key, params = {}) => {
    let text = translations[language][key] || key;
    
    // Remplacer les paramètres dans le texte
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};