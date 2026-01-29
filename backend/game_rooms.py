"""
Gestion des salles de jeu multijoueur pour CyberGame
"""
import random
import string
from datetime import datetime

class GameRoom:
    """Représente une salle de jeu entre deux joueurs"""
    
    def __init__(self, room_code, creator_sid, creator_name):
        self.room_code = room_code
        self.creator_sid = creator_sid
        self.creator_name = creator_name
        self.opponent_sid = None
        self.opponent_name = None
        self.created_at = datetime.now()
        self.game_started = False
        self.current_turn = None  # SID du joueur dont c'est le tour
        self.game_state = {
            'creator': {
                'health': 100,
                'maxHealth': 100,
                'level': 1,
                'mana': 50,
                'ready': False
            },
            'opponent': {
                'health': 100,
                'maxHealth': 100,
                'level': 1,
                'mana': 50,
                'ready': False
            }
        }
        
    def is_full(self):
        """Vérifie si la salle est complète"""
        return self.opponent_sid is not None
    
    def add_opponent(self, sid, name):
        """Ajoute un adversaire à la salle"""
        if not self.is_full():
            self.opponent_sid = sid
            self.opponent_name = name
            return True
        return False
    
    def get_player_role(self, sid):
        """Retourne le rôle du joueur (creator ou opponent)"""
        if sid == self.creator_sid:
            return 'creator'
        elif sid == self.opponent_sid:
            return 'opponent'
        return None
    
    def get_opponent_sid(self, sid):
        """Retourne le SID de l'adversaire"""
        if sid == self.creator_sid:
            return self.opponent_sid
        elif sid == self.opponent_sid:
            return self.creator_sid
        return None
    
    def start_game(self):
        """Démarre la partie"""
        if self.is_full():
            self.game_started = True
            # Le créateur commence
            self.current_turn = self.creator_sid
            return True
        return False
    
    def switch_turn(self):
        """Change de tour"""
        if self.current_turn == self.creator_sid:
            self.current_turn = self.opponent_sid
        else:
            self.current_turn = self.creator_sid
    
    def is_player_turn(self, sid):
        """Vérifie si c'est le tour du joueur"""
        return self.current_turn == sid
    
    def update_player_state(self, sid, state_update):
        """Met à jour l'état d'un joueur"""
        role = self.get_player_role(sid)
        if role:
            self.game_state[role].update(state_update)
    
    def get_player_state(self, sid):
        """Récupère l'état d'un joueur"""
        role = self.get_player_role(sid)
        if role:
            return self.game_state[role]
        return None
    
    def to_dict(self):
        """Convertit la salle en dictionnaire"""
        return {
            'room_code': self.room_code,
            'creator': {
                'name': self.creator_name,
                'sid': self.creator_sid
            },
            'opponent': {
                'name': self.opponent_name,
                'sid': self.opponent_sid
            } if self.opponent_sid else None,
            'game_started': self.game_started,
            'is_full': self.is_full(),
            'current_turn': self.current_turn,
            'game_state': self.game_state
        }


class GameRoomManager:
    """Gestionnaire de toutes les salles de jeu"""
    
    def __init__(self):
        self.rooms = {}  # room_code -> GameRoom
        self.player_rooms = {}  # sid -> room_code
    
    def generate_room_code(self):
        """Génère un code de salle unique de 6 caractères"""
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if code not in self.rooms:
                return code
    
    def create_room(self, creator_sid, creator_name):
        """Crée une nouvelle salle"""
        room_code = self.generate_room_code()
        room = GameRoom(room_code, creator_sid, creator_name)
        self.rooms[room_code] = room
        self.player_rooms[creator_sid] = room_code
        return room
    
    def join_room(self, room_code, player_sid, player_name):
        """Rejoint une salle existante"""
        room = self.rooms.get(room_code)
        if room and not room.is_full():
            if room.add_opponent(player_sid, player_name):
                self.player_rooms[player_sid] = room_code
                return room
        return None
    
    def get_room(self, room_code):
        """Récupère une salle par son code"""
        return self.rooms.get(room_code)
    
    def get_player_room(self, player_sid):
        """Récupère la salle d'un joueur"""
        room_code = self.player_rooms.get(player_sid)
        if room_code:
            return self.rooms.get(room_code)
        return None
    
    def leave_room(self, player_sid):
        """Un joueur quitte sa salle"""
        room_code = self.player_rooms.get(player_sid)
        if room_code:
            room = self.rooms.get(room_code)
            if room:
                # Si le créateur quitte, supprimer la salle
                if player_sid == room.creator_sid:
                    opponent_sid = room.opponent_sid
                    del self.rooms[room_code]
                    del self.player_rooms[player_sid]
                    if opponent_sid and opponent_sid in self.player_rooms:
                        del self.player_rooms[opponent_sid]
                    return opponent_sid
                # Si l'adversaire quitte
                elif player_sid == room.opponent_sid:
                    room.opponent_sid = None
                    room.opponent_name = None
                    room.game_started = False
                    del self.player_rooms[player_sid]
                    return room.creator_sid
        return None
    
    def delete_room(self, room_code):
        """Supprime une salle"""
        room = self.rooms.get(room_code)
        if room:
            if room.creator_sid in self.player_rooms:
                del self.player_rooms[room.creator_sid]
            if room.opponent_sid and room.opponent_sid in self.player_rooms:
                del self.player_rooms[room.opponent_sid]
            del self.rooms[room_code]
    
    def cleanup_empty_rooms(self):
        """Nettoie les salles vides ou anciennes"""
        to_delete = []
        for room_code, room in self.rooms.items():
            # Supprimer les salles vides de plus de 10 minutes
            if not room.is_full():
                age = (datetime.now() - room.created_at).total_seconds()
                if age > 600:  # 10 minutes
                    to_delete.append(room_code)
        
        for room_code in to_delete:
            self.delete_room(room_code)


# Instance globale du gestionnaire
room_manager = GameRoomManager()
