# 🧬 ANTIDOTE MISSION V3

**Plateforme Futuriste de Bio-Défense & Médecine — Propulsée par Groq AI**

*Fondée par **KHEDIM BENYAKHLEF** (BENY-JOE)*

---

## 🚀 Vue d'ensemble

ANTIDOTE MISSION V3 est une plateforme web avancée de bio-défense et de médecine moléculaire, déployée en tant que service web sur **Render**. Elle intègre :

- 🔬 **Analyse virologique complète** via IA Groq avec rotation multi-modèles
- 💉 **Conception d'antidotes et vaccins** (mRNA, anticorps monoclonaux, nanomédecine, CRISPR)
- 🧬 **Bio-médecine avancée** basée sur les travaux de KHEDIM BENYAKHLEF
- 🔭 **Visualisation microscopique animée** (Canvas HTML5)
- 🦠 **Base de données virale** avec statuts de recherche
- ⚠️ **Surveillance d'épidémies** en temps réel (Hantavirus Andes 2026)

---

## 🏗️ Architecture

```
antidote-mission-v3/
├── server.js              # Point d'entrée Express
├── package.json           # Dépendances Node.js
├── render.yaml            # Blueprint Render (IaC)
├── Dockerfile             # Conteneurisation optionnelle
├── .env.example           # Variables d'environnement
├── public/                # Frontend statique
│   └── index.html         # Interface utilisateur complète
├── src/
│   ├── config/
│   │   └── groq-config.js     # Configuration modèles Groq
│   ├── services/
│   │   ├── groq-service.js    # Service API Groq principal
│   │   └── model-rotator.js   # Rotation intelligente des modèles
│   ├── routes/
│   │   └── api.js             # Endpoints API REST
│   ├── middleware/
│   │   ├── error-handler.js   # Gestion centralisée erreurs
│   │   └── rate-limiter.js   # Protection rate limiting
│   └── utils/
│       └── logger.js          # Logs professionnels (Winston)
└── docs/                  # Documentation complète
```

---

## 🔑 Fonctionnalités Clés

### 1. Rotation Multi-Modèles Groq AI
- **7 modèles** configurés avec priorités différentes
- **Sélection intelligente** selon la complexité de la tâche
- **Fallback automatique** en cas de rate limit
- **Cache des réponses** pour optimiser les tokens

### 2. Maximisation des Tokens
| Modèle | Contexte | Max Tokens | RPM | TPM |
|--------|----------|------------|-----|-----|
| Llama 4 Scout | 131K | 8,192 | 30 | 30K |
| GPT-OSS 120B | 128K | 65,536 | 30 | 8K |
| Llama 3.1 8B | 128K | 8,192 | 30 | 6K |
| Qwen3 32B | 131K | 40,960 | 60 | 6K |
| Llama 3.3 70B | 128K | 8,192 | 30 | 12K |

### 3. Endpoints API
- `POST /api/analyze` — Analyse virologique complète
- `POST /api/emergency` — Protocole d'urgence
- `POST /api/design-antidote` — Conception d'antidote/vaccin
- `POST /api/biomedicine` — Consultation bio-médecine
- `POST /api/hantavirus-protocol` — Protocole Hantavirus spécifique
- `GET /api/stats` — Statistiques d'utilisation
- `GET /api/models` — Liste des modèles disponibles
- `GET /api/health` — Health check

---

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/khedim-benyakhlef/antidote-mission-v3.git
cd antidote-mission-v3

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API Groq

# Démarrer en mode développement
npm run dev

# Démarrer en production
npm start
```

---

## 🌐 Déploiement sur Render

### Méthode 1: Blueprint (Recommandé)
1. Connecter votre repo GitHub à Render
2. Render détecte automatiquement `render.yaml`
3. Déploiement automatique avec Redis + PostgreSQL

### Méthode 2: Manuel
1. Créer un **Web Service** sur Render
2. Sélectionner le repository
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Ajouter les variables d'environnement :
   - `GROQ_API_KEY` = votre_clé_api
   - `GROQ_API_KEYS_ROTATION` = clé1,clé2,clé3 (optionnel)
   - `NODE_ENV` = production

---

## 🔐 Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `GROQ_API_KEY` | Clé API principale Groq | ✅ |
| `GROQ_API_KEYS_ROTATION` | Clés multiples (séparées par virgule) | ❌ |
| `NODE_ENV` | Environnement (production/development) | ✅ |
| `PORT` | Port du serveur (défaut: 10000) | ❌ |
| `CORS_ORIGIN` | Origines CORS autorisées | ❌ |
| `RATE_LIMIT_MAX` | Requêtes max/minute (défaut: 30) | ❌ |
| `LOG_LEVEL` | Niveau de logs (info/debug/error) | ❌ |

---

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Vérification de l'API
curl https://votre-app.onrender.com/api/health
```

---

## 📚 Références Scientifiques Intégrées

### Ouvrages de KHEDIM BENYAKHLEF (BENY-JOE)
1. **"L'AutoDestruction des Cellules Cancéreuses"** (164 pages, Foxit PDF 2025)
   - Apoptose, p53, PUMA, Bcl-2
   - Torin1, mTORC1/mTORC2
   - Nanomédecine, immunothérapie, thérapie génique

2. **"Vengense — Autodestruction Cellulaire Science & Fiction"**
   - Torin1 et autophagie létale
   - Prions (Kuru), contagion artificielle
   - Exosomes, CRISPR cellulaire

---

## 🦠 Focus: Hantavirus Andes (Épidémie 2026)

**Contexte:** Épidémie active sur la croisière MV Hondius, mai 2026
- 11 cas confirmés, 3 décès
- 147 personnes exposées, 23 nationalités
- Aucun vaccin approuvé

**Propositions IA:**
- Vaccin mRNA (Université de Bath)
- Anticorps monoclonaux (Colorado State University)
- CRISPR-Cas13 contre ARN viral
- Bio-médecine: Quercétine + Zinc

---

## 📄 Licence

MIT License — Copyright (c) 2026 KHEDIM BENYAKHLEF

---

## 🤝 Contact

**Fondateur:** KHEDIM BENYAKHLEF (BENY-JOE)
**Plateforme:** ANTIDOTE MISSION V3
**Moteur IA:** Groq AI — Rotation Multi-Modèles
**Déploiement:** Render.com Web Service

---

*"Pourquoi tuer une cellule peut sauver un organisme"* — KHEDIM BENYAKHLEF
