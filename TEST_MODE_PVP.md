# 🧪 TEST COMPLET DU MODE PvP EN TEMPS RÉEL

## ✅ AVANT DE COMMENCER

### 1. Redémarrez le BACKEND
```powershell
# Fermez l'ancien backend (Ctrl+C)
cd backend
python app.py
```
**IMPORTANT** : Le serveur DOIT être redémarré pour les nouvelles modifications !

### 2. Rechargez les DEUX navigateurs
- Appuyez sur **Ctrl+F5** dans Nav1 et Nav2
- Cela force le rechargement du cache

---

## 🎮 SCÉNARIO DE TEST

### Étape 1 : Création et Connexion
1. **Nav1** : Créez une salle avec le pseudo "Alice"
2. **Nav2** : Rejoignez avec le code et le pseudo "Bob"
3. ✅ **Vérifiez** : Les deux joueurs se voient dans le lobby

### Étape 2 : Lancement de la Partie
1. **Nav1** : Cliquez sur "⚔️ Commencer la Partie"
2. ✅ **Vérifiez Nav1** : Vous voyez "Alice VS Bob" (pas "Gardien IA")
3. ✅ **Vérifiez Nav2** : Vous voyez "Bob VS Alice"
4. ✅ **Vérifiez** : Alice voit "✨ C'est votre tour !"
5. ✅ **Vérifiez** : Bob voit "⏳ Tour de Alice..."

### Étape 3 : Test d'Attaque (Alice attaque)
1. **Nav1 (Alice)** : Répondez correctement à une question
2. ✅ **Vérifiez Nav1** : 
   - Alice inflige des dégâts
   - La santé de Bob diminue
3. ✅ **Vérifiez Nav2** :
   - Bob reçoit des dégâts EN TEMPS RÉEL
   - La santé de Bob diminue du MÊME montant
   - La santé d'Alice s'affiche correctement

### Étape 4 : Test d'Attaque (Bob attaque)
1. **Nav2 (Bob)** : C'est maintenant votre tour
2. **Nav2 (Bob)** : Répondez correctement à une question
3. ✅ **Vérifiez Nav2** :
   - Bob inflige des dégâts
   - La santé d'Alice diminue
4. ✅ **Vérifiez Nav1** :
   - Alice reçoit des dégâts EN TEMPS RÉEL
   - La santé d'Alice diminue du MÊME montant
   - La santé de Bob s'affiche correctement

### Étape 5 : Vérification de Synchronisation
- ✅ **Nav1 affiche** : Alice X/100 | Bob Y/100
- ✅ **Nav2 affiche** : Bob Y/100 | Alice X/100
- ✅ **Les valeurs sont INVERSÉES mais IDENTIQUES**

### Étape 6 : Test de Victoire/Défaite
1. Continuez à jouer jusqu'à ce qu'un joueur arrive à 0 PV
2. ✅ **Le gagnant voit** : Animation de victoire + "Victoire !"
3. ✅ **Le perdant voit** : Animation de défaite + "Défaite !"
4. ✅ **Les deux** : Retour automatique à l'accueil après 4 secondes

### Étape 7 : Test de Déconnexion
1. Créez une nouvelle partie
2. Un joueur quitte pendant la partie (ferme l'onglet)
3. ✅ **L'autre joueur voit** : "⚠️ Votre adversaire a quitté la partie !"
4. ✅ **Redirection** : Retour à l'accueil après 2 secondes

---

## 🔍 DIAGNOSTIC EN CAS DE PROBLÈME

### Ouvrez la Console (F12) dans les DEUX navigateurs

#### Quand Alice attaque, vous devriez voir :

**Console Nav1 (Alice)** :
```
📤 SENDING ATTACK: { damage: XX, playerHealth: YY }
✅ ATTACK CONFIRMED: { victim_new_health: ZZ, your_health: YY }
👾 Enemy health confirmed: ZZ
```

**Console Nav2 (Bob)** :
```
🔥 OPPONENT ATTACK RECEIVED: { damage: XX, attacker_health: YY, your_new_health: ZZ }
🛡️ Updating player health from 100 to ZZ
👾 Updating enemy health to YY
```

**Console Backend** :
```
[PLAYER_ANSWER] Attacker: <sid>, Damage: XX, Correct: True
[HEALTH_UPDATE] Victim health: 100 -> ZZ
[EMIT] Sending opponent_attack to <sid>
[EMIT] Sending attack_confirmed to <sid>
[TURN] Turn changed to <sid>
```

---

## ❌ PROBLÈMES COURANTS

### Problème 1 : "Les PV ne sont pas synchronisés"
**Solution** : Redémarrez le backend (les modifications du serveur nécessitent un redémarrage)

### Problème 2 : "Rien ne se passe quand j'attaque"
**Vérifiez** :
- La console montre-t-elle `📤 SENDING ATTACK` ?
- Le backend est-il bien démarré ?
- Y a-t-il des erreurs en rouge dans la console ?

### Problème 3 : "Je vois encore 'Gardien IA'"
**Solution** : Rechargez la page avec Ctrl+F5 (pas juste F5)

### Problème 4 : "L'adversaire ne reçoit rien"
**Vérifiez** :
- Le backend montre-t-il `[EMIT] Sending opponent_attack` ?
- Les deux joueurs sont-ils sur le même serveur ?

---

## 📊 RÉSULTATS ATTENDUS

| Action | Nav1 (Alice) | Nav2 (Bob) |
|--------|--------------|------------|
| Départ | Alice: 100 PV | Bob: 100 PV |
| Alice attaque (15 dégâts) | Alice: 100 PV, Bob: 85 PV | Bob: 85 PV, Alice: 100 PV |
| Bob attaque (12 dégâts) | Alice: 88 PV, Bob: 85 PV | Bob: 85 PV, Alice: 88 PV |

✅ **Les valeurs DOIVENT être identiques mais inversées !**

---

## 🎯 CHECKLIST FINALE

- [ ] Backend redémarré
- [ ] Navigateurs rechargés (Ctrl+F5)
- [ ] Affichage "Alice VS Bob" (pas "Gardien IA")
- [ ] Les attaques se synchronisent en temps réel
- [ ] Les PV sont identiques sur les deux navigateurs
- [ ] Le système de tours fonctionne
- [ ] La victoire/défaite s'affiche correctement
- [ ] La déconnexion redirige vers l'accueil

---

## 🆘 SI TOUT ÉCHOUE

Copiez-collez les messages de la console backend et frontend, et je vous aiderai à diagnostiquer !
