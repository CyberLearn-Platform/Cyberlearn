import sqlite3
import json
import os
from datetime import datetime

# Chemin de la base de données
DB_FILE = 'backend/cyberforge.db'

# Créer la connexion
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# Créer la table users avec tous les champs nécessaires
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    progress TEXT DEFAULT '{}',
    completed_modules TEXT DEFAULT '[]',
    completed_quizzes TEXT DEFAULT '[]'
)
''')

print("✅ Table 'users' créée avec succès")

# Créer une table pour l'historique des progressions (pour audit)
cursor.execute('''
CREATE TABLE IF NOT EXISTS progress_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    level INTEGER,
    experience INTEGER,
    action TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
)
''')

print("✅ Table 'progress_history' créée avec succès")

# Migrer les données depuis users_db.json
USERS_JSON = 'backend/users_db.json'
if os.path.exists(USERS_JSON):
    with open(USERS_JSON, 'r', encoding='utf-8') as f:
        users_data = json.load(f)
    
    for username, user_data in users_data.items():
        try:
            cursor.execute('''
                INSERT INTO users (username, email, password, created_at, level, experience, is_admin, progress, completed_modules, completed_quizzes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                username,
                user_data.get('email', ''),
                user_data.get('password', ''),
                user_data.get('created_at', datetime.now().isoformat()),
                user_data.get('level', 1),
                user_data.get('experience', 0),
                1 if user_data.get('is_admin', False) else 0,
                json.dumps(user_data.get('progress', {})),
                json.dumps(user_data.get('completed_modules', [])),
                json.dumps(user_data.get('completed_quizzes', []))
            ))
            print(f"✅ Utilisateur '{username}' migré: Level {user_data.get('level', 1)}, XP {user_data.get('experience', 0)}")
        except sqlite3.IntegrityError:
            print(f"⚠️ Utilisateur '{username}' existe déjà, ignoré")

conn.commit()

# Afficher les utilisateurs migrés
cursor.execute('SELECT username, level, experience FROM users')
users = cursor.fetchall()
print(f"\n📊 Total utilisateurs dans la base: {len(users)}")
for user in users:
    print(f"   - {user[0]}: Level {user[1]}, XP {user[2]}")

conn.close()
print("\n✅ Base de données initialisée avec succès!")
print(f"📁 Fichier: {os.path.abspath(DB_FILE)}")
