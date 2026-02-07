import sqlite3
import json
from datetime import datetime
import os

DB_FILE = os.path.join(os.path.dirname(__file__), 'cyberforge.db')

def get_db_connection():
    """Créer une connexion à la base de données"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Pour accéder aux colonnes par nom
    return conn

def get_user_by_username(username):
    """Récupérer un utilisateur par son nom"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return dict(user)
    return None

def get_all_users():
    """Récupérer tous les utilisateurs"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    conn.close()
    
    return [dict(user) for user in users]

def create_user(username, email, password, is_admin=False):
    """Créer un nouvel utilisateur"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    user_id = f"user_{username}"
    
    try:
        cursor.execute('''
            INSERT INTO users (username, email, password, created_at, level, experience, is_admin, progress, completed_modules, completed_quizzes)
            VALUES (?, ?, ?, ?, 1, 0, ?, '{}', '[]', '[]')
        ''', (username, email, password, datetime.now().isoformat(), 1 if is_admin else 0))
        
        conn.commit()
        print(f"✅ [DB] Utilisateur '{username}' créé")
        return True
    except sqlite3.IntegrityError as e:
        print(f"❌ [DB] Erreur création utilisateur: {e}")
        return False
    finally:
        conn.close()

def update_user_progress(username, experience=None, level=None, progress=None, completed_modules=None, completed_quizzes=None):
    """Mettre à jour la progression d'un utilisateur"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Récupérer les données actuelles
    cursor.execute('SELECT level, experience FROM users WHERE username = ?', (username,))
    current = cursor.fetchone()
    
    if not current:
        conn.close()
        return False
    
    old_level = current['level']
    old_exp = current['experience']
    
    # Construire la requête de mise à jour
    updates = []
    params = []
    
    if experience is not None:
        updates.append('experience = ?')
        params.append(experience)
    
    if level is not None:
        updates.append('level = ?')
        params.append(level)
    
    if progress is not None:
        updates.append('progress = ?')
        params.append(json.dumps(progress))
    
    if completed_modules is not None:
        updates.append('completed_modules = ?')
        params.append(json.dumps(completed_modules))
    
    if completed_quizzes is not None:
        updates.append('completed_quizzes = ?')
        params.append(json.dumps(completed_quizzes))
    
    if updates:
        params.append(username)
        query = f"UPDATE users SET {', '.join(updates)} WHERE username = ?"
        cursor.execute(query, params)
        
        # Ajouter à l'historique
        cursor.execute('''
            INSERT INTO progress_history (username, level, experience, action, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (username, level or old_level, experience or old_exp, 'progress_update', datetime.now().isoformat()))
        
        conn.commit()
        print(f"✅ [DB] Progression de '{username}' mise à jour: Level {level or old_level}, XP {experience or old_exp}")
    
    conn.close()
    return True

def get_leaderboard(limit=50):
    """Récupérer le classement des joueurs"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT username, level, experience 
        FROM users 
        WHERE is_admin = 0 
        ORDER BY experience DESC, level DESC 
        LIMIT ?
    ''', (limit,))
    
    users = cursor.fetchall()
    conn.close()
    
    leaderboard = []
    for user in users:
        leaderboard.append({
            'username': user['username'],
            'level': user['level'],
            'xp': user['experience'],
            'score': user['experience']
        })
    
    return leaderboard
