# 🌐 Guide Multijoueur en Réseau Local

## 📋 Votre Configuration Réseau

**Adresse IP du PC Serveur** : `192.168.1.65`

---

## 🖥️ PC SERVEUR (Votre PC Actuel)

### Étape 1 : Vérifier que les serveurs sont lancés

Les serveurs devraient déjà être en cours d'exécution :

- ✅ **Backend Flask** : http://192.168.1.65:5000
- ✅ **Frontend React** : http://localhost:3000

### Étape 2 : Ouvrir le pare-feu Windows

**IMPORTANT** : Vous devez autoriser les connexions entrantes sur les ports 5000 et 3000.

#### Méthode Rapide (Ligne de commande) :

Ouvrez PowerShell **en tant qu'Administrateur** et exécutez :

```powershell
# Autoriser le port 5000 (Backend)
New-NetFirewallRule -DisplayName "CyberForge Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow

# Autoriser le port 3000 (Frontend)
New-NetFirewallRule -DisplayName "CyberForge Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

#### Méthode Manuelle (Interface graphique) :

1. Ouvrez **Panneau de configuration** → **Pare-feu Windows Defender**
2. Cliquez sur **Paramètres avancés**
3. Sélectionnez **Règles de trafic entrant** → **Nouvelle règle**
4. Type : **Port** → **TCP** → **Port spécifique : 5000**
5. Action : **Autoriser la connexion**
6. Répétez pour le port **3000**

### Étape 3 : Tester localement

Sur votre PC serveur, ouvrez :
- http://192.168.1.65:3000/cybergame

Si cela fonctionne, vous êtes prêt !

---

## 💻 PC CLIENT (L'autre PC sur le réseau)

### Étape 1 : Vérifier la connexion réseau

Les deux PC doivent être sur le **même réseau WiFi/LAN**.

### Étape 2 : Tester la connexion au serveur

Ouvrez un navigateur et testez :
- http://192.168.1.65:5000

Vous devriez voir :
```json
{
  "message": "CyberForge Backend is Running!",
  "status": "success",
  "version": "1.0.0"
}
```

### Étape 3 : Accéder au jeu

Ouvrez dans votre navigateur :
- **http://192.168.1.65:3000/cybergame**

---

## 🎮 JOUER UNE PARTIE EN LIGNE

### Scénario : PC Serveur VS PC Client

#### Sur le PC SERVEUR (192.168.1.65) :
1. Ouvrez http://192.168.1.65:3000/cybergame
2. Cliquez sur **"Mode En Ligne"** 🌐
3. Cliquez sur **"Créer une Salle"**
4. Entrez votre pseudo (ex: "Joueur1")
5. Cliquez sur **"🎮 Créer la Salle"**
6. **Notez le CODE** qui s'affiche (ex: **XYZ789**)
7. Partagez ce code avec l'autre joueur

#### Sur le PC CLIENT (autre PC) :
1. Ouvrez http://192.168.1.65:3000/cybergame
2. Cliquez sur **"Mode En Ligne"** 🌐
3. Cliquez sur **"Rejoindre une Salle"**
4. Entrez votre pseudo (ex: "Joueur2")
5. Entrez le **CODE** reçu (XYZ789)
6. Cliquez sur **"🔗 Rejoindre la Salle"**

#### Démarrer la partie :
1. Sur le **PC SERVEUR**, vous verrez "Joueur2" apparaître
2. Cliquez sur **"⚔️ Commencer la Partie"**
3. Le combat commence !
4. **Jouez à tour de rôle** :
   - Joueur 1 répond à une question → attaque
   - Tour passe à Joueur 2 automatiquement
   - Joueur 2 répond → attaque
   - Et ainsi de suite jusqu'à la victoire !

---

## 🔧 DÉPANNAGE

### Problème : Le PC Client ne peut pas se connecter

#### 1. Vérifier le pare-feu
```powershell
# Sur le PC Serveur, vérifier les règles
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*CyberForge*"}
```

#### 2. Vérifier que les serveurs sont actifs
```powershell
# Sur le PC Serveur
netstat -an | findstr "5000"
netstat -an | findstr "3000"
```

Vous devriez voir :
```
TCP    0.0.0.0:5000          0.0.0.0:0              LISTENING
TCP    0.0.0.0:3000          0.0.0.0:0              LISTENING
```

#### 3. Tester la connexion réseau
```powershell
# Sur le PC Client
ping 192.168.1.65
```

Si le ping échoue, vérifiez :
- Les deux PC sont sur le même WiFi
- Le pare-feu n'bloque pas les pings

#### 4. Vérifier l'IP du serveur
```powershell
# Sur le PC Serveur
ipconfig | findstr /i "IPv4"
```

Si l'IP a changé, mettez à jour :
- `frontend/.env` : `REACT_APP_API_URL=http://NOUVELLE_IP:5000`
- Redémarrez le frontend

### Problème : WebSocket ne se connecte pas

Ouvrez la console développeur (F12) du navigateur et cherchez :
```
✅ Connected to WebSocket server
```

Si vous voyez des erreurs CORS, vérifiez que le backend a bien `cors_allowed_origins="*"`.

### Problème : L'IP du serveur change souvent

**Solution** : Attribuer une IP fixe à votre PC

1. Ouvrez **Paramètres** → **Réseau et Internet**
2. Cliquez sur votre connexion WiFi/Ethernet
3. **Propriétés**
4. **Modifier** les paramètres IP
5. Sélectionnez **Manuel** et configurez :
   - IP : `192.168.1.65`
   - Masque : `255.255.255.0`
   - Passerelle : `192.168.1.1` (votre routeur)
   - DNS : `8.8.8.8`

---

## 📊 RÉCAPITULATIF DES URLS

| Service | PC Serveur | PC Client |
|---------|-----------|-----------|
| **Backend** | http://127.0.0.1:5000 | http://192.168.1.65:5000 |
| **Frontend** | http://localhost:3000 | http://192.168.1.65:3000 |
| **CyberGame** | http://localhost:3000/cybergame | http://192.168.1.65:3000/cybergame |

---

## 🎉 CONSEILS DE JEU

1. **Communication** : Utilisez Discord/WhatsApp pour parler pendant le jeu
2. **Écrans séparés** : Chaque joueur ne voit que ses propres questions
3. **Fair-play** : Ne trichez pas en regardant l'écran de l'adversaire ! 😄
4. **Codes uniques** : Chaque salle a un code unique, partagez-le en privé

---

## 🔒 SÉCURITÉ

⚠️ **Important** : Cette configuration (`CORS *`) accepte toutes les connexions.

Pour une utilisation en réseau local uniquement, c'est acceptable.

**NE PAS** exposer ce serveur sur Internet sans :
- Authentification renforcée
- HTTPS avec certificats SSL
- Configuration CORS restrictive
- Pare-feu correctement configuré

---

## 🆘 BESOIN D'AIDE ?

Si vous rencontrez des problèmes :
1. Vérifiez que les deux PC sont sur le même réseau
2. Vérifiez le pare-feu Windows
3. Testez les URLs dans le navigateur
4. Vérifiez la console développeur (F12)
5. Redémarrez les serveurs si nécessaire

---

**Bon jeu ! 🎮🚀**
