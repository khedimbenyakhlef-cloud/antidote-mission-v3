# 🚀 GUIDE DE DÉPLOIEMENT SUR RENDER

**ANTIDOTE MISSION V3 — KHEDIM BENYAKHLEF (BENY-JOE)**

---

## 📋 Prérequis

- Compte [Render](https://render.com) (gratuit ou payant)
- Compte [Groq](https://console.groq.com) avec clé API
- Repository GitHub avec le code du projet
- Node.js 18+ installé localement (pour tests)

---

## 🎯 Méthode 1: Déploiement via Blueprint (RECOMMANDÉ)

### Étape 1: Préparer le Repository

```bash
# Initialiser Git
git init
git add .
git commit -m "Initial commit - ANTIDOTE MISSION V3"

# Créer repository sur GitHub et pousser
git remote add origin https://github.com/votre-username/antidote-mission-v3.git
git branch -M main
git push -u origin main
```

### Étape 2: Configurer Render Blueprint

1. Connectez-vous à [Render Dashboard](https://dashboard.render.com)
2. Cliquez sur **"Blueprints"** → **"New Blueprint Instance"**
3. Sélectionnez votre repository GitHub
4. Render détecte automatiquement le fichier `render.yaml`
5. Cliquez sur **"Apply"**

### Étape 3: Configuration des Variables d'Environnement

Render va créer automatiquement :
- ✅ Web Service `antidote-mission-v3`
- ✅ Worker `antidote-worker`
- ✅ Redis `antidote-redis`
- ✅ PostgreSQL `antidote-db`

**AJOUTER MANUELLEMENT les clés API Groq :**

1. Allez dans **Settings** du Web Service
2. Section **Environment Variables**
3. Ajoutez :
   - `GROQ_API_KEY` = `gsk_votre_cle_principale`
   - `GROQ_API_KEYS_ROTATION` = `gsk_key1,gsk_key2,gsk_key3` (optionnel)

### Étape 4: Vérifier le Déploiement

```bash
# Health check
curl https://votre-app.onrender.com/api/health

# Réponse attendue :
{
  "status": "OK",
  "service": "ANTIDOTE MISSION V3",
  "version": "3.0.0",
  "ai_engine": "Groq AI — Rotation Multi-Modèles"
}
```

---

## 🎯 Méthode 2: Déploiement Manuel Web Service

### Étape 1: Créer le Web Service

1. Dashboard Render → **"New +"** → **"Web Service"**
2. Connecter le repository GitHub
3. Configurer :
   - **Name:** `antidote-mission-v3`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Starter` (ou `Free` pour test)

### Étape 2: Variables d'Environnement

Ajoutez dans l'onglet **Environment** :

```
NODE_ENV=production
PORT=10000
GROQ_API_KEY=gsk_votre_cle_api_groq
GROQ_API_KEYS_ROTATION=gsk_key1,gsk_key2,gsk_key3
CORS_ORIGIN=*
RATE_LIMIT_MAX=30
LOG_LEVEL=info
```

### Étape 3: Health Check Path

Dans **Settings** → **Health Check Path** :
```
/health
```

### Étape 4: Auto-Deploy

Activez **Auto-Deploy** pour les mises à jour automatiques lors des push Git.

---

## 🔐 Configuration des Clés API Groq

### Obtenir une Clé API

1. Créez un compte sur [console.groq.com](https://console.groq.com)
2. Allez dans **API Keys**
3. Cliquez **"Create API Key"**
4. Copiez la clé (format: `gsk_...`)

### Rotation Multi-Clés (OPTIONNEL mais RECOMMANDÉ)

Pour maximiser les tokens, créez plusieurs comptes Groq :
- Compte principal : clé 1
- Compte secondaire : clé 2  
- Compte tertiaire : clé 3

Dans `GROQ_API_KEYS_ROTATION` :
```
gsk_key1_compte_principal,gsk_key2_compte_2,gsk_key3_compte_3
```

Le système alterne automatiquement entre les clés pour éviter les rate limits.

---

## 📊 Monitoring sur Render

### Logs en Temps Réel

Dashboard → Web Service → **Logs**

Vous verrez :
```
═══════════════════════════════════════════════
  ANTIDOTE MISSION V3 — SERVEUR ACTIF
  Port: 10000
  Environnement: production
  Fondée par: KHEDIM BENYAKHLEF (BENY-JOE)
  Moteur IA: Groq AI — Rotation Multi-Modèles
═══════════════════════════════════════════════
```

### Métriques

- **CPU/Memory:** Dashboard → Metrics
- **Requests:** Nombre de requêtes/minute
- **Latency:** Temps de réponse moyen

---

## 🔄 Mises à Jour

### Méthode Automatique (Git)

```bash
# Modifier le code
git add .
git commit -m "Update: nouvelle fonctionnalité"
git push origin main

# Render déploie automatiquement !
```

### Méthode Manuelle

Dashboard → Web Service → **Manual Deploy** → **Deploy Latest Commit**

---

## 🛠️ Dépannage

### Problème: "Build Failed"

**Cause:** Dépendances manquantes
**Solution:**
```bash
# Local
rm -rf node_modules package-lock.json
npm install
npm start

# Puis commit et push
```

### Problème: "Application Error" (502)

**Cause:** Le serveur ne démarre pas
**Solution:**
1. Vérifier `server.js` (doit écouter sur `PORT`)
2. Vérifier les logs : Dashboard → Logs
3. Vérifier `package.json` → `start` script

### Problème: "Rate Limit Exceeded" (429)

**Cause:** Trop de requêtes API Groq
**Solution:**
1. Ajouter plus de clés dans `GROQ_API_KEYS_ROTATION`
2. Augmenter `RATE_LIMIT_MAX` (avec prudence)
3. Vérifier le cache fonctionne

### Problème: CORS Error

**Cause:** Origine non autorisée
**Solution:**
```
CORS_ORIGIN=https://votre-frontend.com
# ou
CORS_ORIGIN=*
```

---

## 🌐 URL de Production

Après déploiement, votre application sera accessible à :

```
https://antidote-mission-v3.onrender.com
```

**Endpoints importants :**
- `https://antidote-mission-v3.onrender.com/` → Interface utilisateur
- `https://antidote-mission-v3.onrender.com/api/health` → Health check
- `https://antidote-mission-v3.onrender.com/api/stats` → Statistiques

---

## 💡 Conseils d'Optimisation

### 1. Plan Starter vs Free

| Feature | Free | Starter |
|---------|------|---------|
| CPU | 0.1 | 0.5 |
| RAM | 512 MB | 1 GB |
| Disk | 1 GB | 2 GB |
| Sleep | Après 15min inactif | Jamais |
| Custom Domain | ❌ | ✅ |

**Recommandation:** Starter pour production (pas de "cold start")

### 2. Cache Redis

Le Blueprint inclut Redis gratuit pour :
- Cache des réponses API
- File d'attente des jobs
- Sessions utilisateur

### 3. Base de Données PostgreSQL

Incluse dans le Blueprint pour :
- Historique des analyses
- Statistiques d'utilisation
- Logs persistants

---

## 📞 Support

**En cas de problème :**
1. Vérifier les logs Render
2. Tester l'API localement : `npm start`
3. Vérifier les variables d'environnement
4. Contacter Render Support ou consulter [docs.render.com](https://docs.render.com)

---

**ANTIDOTE MISSION V3 — Déployé avec succès sur Render 🚀**
*Fondée par KHEDIM BENYAKHLEF (BENY-JOE)*
