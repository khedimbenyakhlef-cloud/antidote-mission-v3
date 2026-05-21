# 🚀 DÉPLOIEMENT WEB SERVICE SUR RENDER

**ANTIDOTE MISSION V3 — KHEDIM BENYAKHLEF (BENY-JOE)**

---

## ⚠️ IMPORTANT : Web Service (Pas Blueprint)

Ce guide utilise la méthode **Web Service manuel** sur Render, sans Blueprint.

---

## 📋 ÉTAPE 1 : Préparer les Fichiers en Local

### 1.1 Créer le dossier du projet

```bash
# Sur votre ordinateur
cd C:\Users\VotreNom\Documents
mkdir antidote-mission-v3
cd antidote-mission-v3
```

### 1.2 Extraire le ZIP téléchargé

1. Téléchargez : **[antidote-mission-v3.zip](sandbox:///mnt/agents/output/antidote-mission-v3.zip)**
2. Extrayez tout le contenu dans le dossier
3. Vérifiez la structure (20 fichiers)

### 1.3 Initialiser Git (OBLIGATOIRE pour Render)

```bash
# Ouvrir CMD ou PowerShell dans le dossier
cd C:\Users\VotreNom\Documents\antidote-mission-v3

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "ANTIDOTE MISSION V3 - Initial commit"
```

---

## 📋 ÉTAPE 2 : Créer un Repository GitHub

### 2.1 Sur GitHub.com

1. Connectez-vous à [github.com](https://github.com)
2. Cliquez sur **"+"** → **"New repository"**
3. **Repository name** : `antidote-mission-v3`
4. **Description** : `Plateforme Bio-Defense & Medecine - Groq AI`
5. **Visibility** : Public (ou Private)
6. **Ne cochez PAS** "Add a README"
7. Cliquez **"Create repository"**

### 2.2 Connecter le repo local a GitHub

```bash
# Dans CMD/PowerShell (dossier antidote-mission-v3)
git remote add origin https://github.com/VOTRE_USERNAME/antidote-mission-v3.git
git branch -M main
git push -u origin main
```

---

## 📋 ÉTAPE 3 : Créer le Web Service sur Render

### 3.1 Connexion a Render

1. Allez sur [dashboard.render.com](https://dashboard.render.com)
2. Connectez-vous (compte gratuit)
3. Cliquez sur **"New +"** → **"Web Service"**

### 3.2 Connecter le Repository GitHub

1. Cliquez sur **"Connect account"** (si premiere fois)
2. Autorisez Render a acceder a vos repos GitHub
3. Selectionnez **`antidote-mission-v3`**
4. Cliquez **"Connect"**

### 3.3 Configuration du Web Service

| Champ | Valeur |
|-------|--------|
| **Name** | `antidote-mission-v3` |
| **Region** | `Frankfurt (EU Central)` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | `Starter` ($7/mois) |

> ⚠️ **IMPORTANT :** Selectionnez **Starter** pour eviter le "sleep" apres 15 minutes. Le plan Free est trop lent.

### 3.4 Configuration Avancee

Cliquez sur **"Advanced"** :

**Health Check Path :** `/health`

**Auto-Deploy :** ✅ Cochez "Yes, auto-deploy"

---

## 📋 ÉTAPE 4 : Variables d'Environnement (CRITIQUE)

### 4.1 Ajouter les variables

Dans **"Environment Variables"**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `GROQ_API_KEY` | `gsk_votre_cle_api` |
| `GROQ_API_KEYS_ROTATION` | `gsk_key2,gsk_key3` (optionnel) |
| `CORS_ORIGIN` | `*` |
| `RATE_LIMIT_MAX` | `30` |
| `LOG_LEVEL` | `info` |

### 4.2 Obtenir la Cle API Groq

1. Allez sur [console.groq.com](https://console.groq.com)
2. Creez un compte
3. Allez dans **"API Keys"**
4. Cliquez **"Create API Key"**
5. Nommez-la : `antidote-mission-v3`
6. **Copiez la cle** (format : `gsk_xxxxxxxxxxxxxxxx`)
7. Collez-la dans Render

---

## 📋 ÉTAPE 5 : Deployer !

1. Scrollez en bas du formulaire
2. Cliquez **"Create Web Service"**
3. Attendez que le statut passe a **"Live"** (vert)
4. Vous verrez dans les logs :

```
ANTIDOTE MISSION V3 — SERVEUR ACTIF
Port: 10000
Moteur IA: Groq AI — Rotation Multi-Modeles
```

---

## 📋 ÉTAPE 6 : Verifier

**URL de votre application :**
```
https://antidote-mission-v3.onrender.com
```

**Tests :**
- Page d'accueil : `https://antidote-mission-v3.onrender.com/`
- Health Check : `https://antidote-mission-v3.onrender.com/api/health`
- Stats API : `https://antidote-mission-v3.onrender.com/api/stats`

---

## 🛠️ DEPANNAGE

### "Build Failed"
```bash
rm -rf node_modules package-lock.json
npm install
npm start
# Corrigez, puis : git push
```

### "Application Error" (502)
- Verifiez les logs : Dashboard → Logs
- Verifiez que `server.js` ecoute sur `PORT`

### API Groq ne repond pas
- Verifiez `GROQ_API_KEY` dans Environment Variables
- Verifiez sur console.groq.com que la cle est active

---

## 💰 Couts Render

| Plan | Prix | Avantages |
|------|------|-----------|
| **Free** | $0 | Sleep apres 15min — Trop lent |
| **Starter** | $7/mois | **RECOMMANDE** — Jamais de sleep |
| **Standard** | $25/mois | 2GB RAM |

---

**🎉 Votre ANTIDOTE MISSION V3 est en ligne sur Render !**
