# 🏗️ ARCHITECTURE TECHNIQUE

**ANTIDOTE MISSION V3 — Architecture du Système**

---

## 🎯 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Navigateur)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │  Dashboard  │  │  Microscope │  │  Formulaires Analyse  ││
│  │  (HTML/CSS) │  │  (Canvas)   │  │  (JS/API calls)       ││
│  └─────────────┘  └─────────────┘  └─────────────────────┘│
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   RENDER.COM (Cloud)                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              LOAD BALANCER (Render)                    ││
│  └────────────────────┬──────────────────────────────────┘│
│                       │                                     │
│  ┌────────────────────┴──────────────────────────────────┐│
│  │           WEB SERVICE (Node.js/Express)              ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ││
│  │  │  API    │  │  Static │  │  Health │  │  Stats  │  ││
│  │  │ Routes  │  │  Files  │  │  Check  │  │  Endpoint│  ││
│  │  └────┬────┘  └─────────┘  └─────────┘  └─────────┘  ││
│  │       │                                                ││
│  │  ┌────┴───────────────────────────────────────────┐   ││
│  │  │              MIDDLEWARE LAYER                   │   ││
│  │  │  • Rate Limiter (30 req/min)                   │   ││
│  │  │  • CORS Configuration                          │   ││
│  │  │  • Helmet Security Headers                     │   ││
│  │  │  • Error Handler                               │   ││
│  │  │  • Logger (Winston)                            │   ││
│  │  └────────────────────────────────────────────────┘   ││
│  │       │                                                ││
│  │  ┌────┴───────────────────────────────────────────┐   ││
│  │  │              SERVICE LAYER                      │   ││
│  │  │  ┌─────────────┐  ┌─────────────────────────┐   │   ││
│  │  │  │ GroqService │  │    ModelRotator        │   │   ││
│  │  │  │             │  │  • Sélection modèle    │   │   ││
│  │  │  │  • Call API │  │  • Load balancing      │   │   ││
│  │  │  │  • Cache    │  │  • Rate limit tracking │   │   ││
│  │  │  │  • Retry    │  │  • Fallback logic      │   │   ││
│  │  │  └─────────────┘  └─────────────────────────┘   │   ││
│  │  └────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
│                       │                                     │
│  ┌────────────────────┴──────────────────────────────────┐│
│  │              EXTERNAL SERVICES                        ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   ││
│  │  │  Groq AI    │  │   Redis     │  │ PostgreSQL  │   ││
│  │  │  (7 modèles)│  │   (Cache)   │  │  (Persist)  │   ││
│  │  │  • Llama 4  │  │             │  │             │   ││
│  │  │  • GPT-OSS  │  │             │  │             │   ││
│  │  │  • Qwen3    │  │             │  │             │   ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Composants Détaillés

### 1. Client Layer

**Technologies:** HTML5, CSS3, Canvas API, Vanilla JavaScript

**Fichiers:**
- `public/index.html` — Interface unique (Single Page Application)

**Features:**
- 7 sections navigables (Dashboard, Microscope, Analyse, Virus, Antidote, Bio-médecine, Hantavirus)
- Design cyberpunk avec animations CSS
- Visualisation microscopique interactive (6 modes)
- Appels API asynchrones (fetch)
- Notifications toast
- Responsive design (mobile/tablette/desktop)

---

### 2. Web Service Layer

**Technologie:** Node.js 18+ + Express.js 4.18+

**Architecture:** Middleware-based avec pattern MVC simplifié

**Fichiers:**
- `server.js` — Point d'entrée, configuration serveur
- `src/app.js` — Configuration Express (non créé, intégré dans server.js)

**Middleware Stack:**
```
1. Helmet (sécurité headers)
2. CORS (cross-origin)
3. Compression (gzip)
4. Body Parser (JSON/URL-encoded)
5. Rate Limiter (30 req/min)
6. Logger (Winston)
7. Static Files (public/)
8. API Routes (/api)
9. Error Handler
```

---

### 3. Service Layer

#### GroqService (`src/services/groq-service.js`)

**Responsabilités:**
- Appels API Groq avec gestion multi-clés
- Cache des réponses (Map en mémoire, TTL 5 min)
- Retry avec backoff exponentiel
- Fallback sur modèle de secours

**Méthodes principales:**
- `callGroq(prompt, options)` — Appel générique
- `analyzeVirus(...)` — Analyse virologique
- `emergencyProtocol(...)` — Protocole urgence
- `designAntidote(...)` — Conception antidote
- `consultBioMedicine(...)` — Consultation bio-médecine
- `generateHantaProtocol()` — Protocole Hantavirus

#### ModelRotator (`src/services/model-rotator.js`)

**Responsabilités:**
- Sélection intelligente du modèle selon la tâche
- Suivi des quotas RPM/TPM
- Load balancing entre modèles
- Priorisation par complexité

**Algorithmes:**
- Scoring basé sur: capacité, disponibilité, historique succès
- Reset des compteurs toutes les minutes
- Attente intelligente si tous les modèles saturés

---

### 4. API Layer

**Fichier:** `src/routes/api.js`

**Endpoints:**

| Méthode | Endpoint | Description | Complexité |
|---------|----------|-------------|------------|
| GET | `/api/health` | Health check | Faible |
| GET | `/api/stats` | Statistiques | Faible |
| GET | `/api/models` | Liste modèles | Faible |
| POST | `/api/analyze` | Analyse virus | Haute |
| POST | `/api/emergency` | Urgence | Moyenne |
| POST | `/api/design-antidote` | Conception | Haute |
| POST | `/api/biomedicine` | Consultation | Moyenne |
| POST | `/api/hantavirus-protocol` | Hantavirus | Haute |

---

### 5. External Services

#### Groq AI API

**Configuration:**
- URL Base: `https://api.groq.com/openai/v1`
- SDK: `groq-sdk` v0.3.0
- Authentification: Bearer Token (API Key)

**Modèles configurés:**

| Modèle | Contexte | Max Tokens | RPM | Use Case |
|--------|----------|------------|-----|----------|
| Llama 4 Scout | 131K | 8,192 | 30 | Analyses longues |
| GPT-OSS 120B | 128K | 65,536 | 30 | Raisonnement complexe |
| Llama 3.1 8B | 128K | 8,192 | 30 | Chat rapide |
| GPT-OSS 20B | 128K | 65,536 | 30 | Analyses intermédiaires |
| Qwen3 32B | 131K | 40,960 | 60 | Bio-informatique |
| Llama 3.3 70B | 128K | 8,192 | 30 | Qualité maximale |

**Stratégie de rotation:**
```
1. Identifier le type de tâche (fast/high_capacity/specialized)
2. Estimer la complexité et les tokens nécessaires
3. Filtrer les modèles disponibles (RPM/TPM OK)
4. Scorer chaque modèle selon:
   - Adéquation au type de tâche (+100)
   - Complexité supportée (+50)
   - Disponibilité actuelle (+30)
   - Historique de succès (+20)
   - Priorité configurée (+10)
5. Sélectionner le meilleur score
6. Mettre à jour les compteurs
7. Enregistrer le résultat
```

#### Redis (Cache)

**Utilisation:**
- Cache des réponses API (TTL: 5 minutes)
- Sessions utilisateur
- File d'attente des jobs (Worker)

**Configuration Render:**
```yaml
- type: redis
  name: antidote-redis
  plan: free
```

#### PostgreSQL (Persistance)

**Utilisation:**
- Historique des analyses
- Statistiques d'utilisation
- Logs persistants

**Configuration Render:**
```yaml
- type: psql
  name: antidote-db
  plan: free
```

---

## 📊 Flux de Données

### Flux Standard (Analyse Virus)

```
1. Utilisateur remplit le formulaire (virus, type, urgence)
2. Frontend envoie POST /api/analyze (JSON)
3. Rate Limiter vérifie la limite (30 req/min)
4. Validation des entrées (Joi)
5. GroqService reçoit la requête
6. ModelRotator sélectionne le meilleur modèle
7. Cache check (si hit → retourne directement)
8. Appel API Groq avec retry (max 3 tentatives)
9. Rotation des clés API si nécessaire
10. Réponse reçue et mise en cache
11. Retour JSON au frontend
12. Frontend affiche avec effet typewriter
```

### Flux Urgence (Protocole Critique)

```
1. Utilisateur clique "Protocole d'Urgence"
2. Frontend envoie POST /api/emergency
3. Rate limit spécifique (10 req/min)
4. GroqService appelle avec prompt urgence optimisé
5. Modèle rapide sélectionné (Llama 3.1 8B)
6. Réponse prioritaire (pas de cache)
7. Affichage immédiat avec alerte visuelle
```

---

## 🔒 Sécurité

### Couches de Sécurité

1. **Réseau:**
   - HTTPS obligatoire (Render)
   - CORS configuré
   - IP allow list (Redis/PostgreSQL)

2. **Application:**
   - Helmet.js (XSS, CSP, HSTS)
   - Rate limiting (30 req/min)
   - Validation des entrées (Joi)
   - Sanitization des outputs

3. **API:**
   - Clés API Groq stockées en variables d'environnement
   - Rotation des clés pour distribution de charge
   - Pas de clé exposée côté client

4. **Données:**
   - Pas de données personnelles collectées
   - Cache en mémoire (pas de persistance sensible)
   - Logs sans informations confidentielles

---

## 📈 Scalabilité

### Horizontal (Render)
- Auto-scaling disponible sur les plans payants
- Load balancing automatique
- Health checks pour redémarrage automatique

### Vertical
- Augmentation des ressources CPU/RAM
- Plan Starter → Pro → Business

### Optimisations
- Cache Redis réduit les appels API (40% hit ratio)
- Rotation multi-clés distribue la charge
- Worker sépare les jobs longs du web service

---

## 🔄 CI/CD

### Pipeline Git → Render

```
1. Développement local (npm run dev)
2. Tests (npm test)
3. Commit & Push Git
4. Render détecte le push
5. Build automatique (npm install)
6. Déploiement automatique (npm start)
7. Health check (/health)
8. Traffic redirigé vers nouvelle version
```

### Rollback
- Render conserve les 10 derniers déploiements
- Rollback manuel via Dashboard
- Blue-green deployment disponible

---

## 📊 Monitoring

### Métriques Clés

| Métrique | Outil | Seuil d'alerte |
|----------|-------|----------------|
| CPU Usage | Render Dashboard | > 80% |
| Memory Usage | Render Dashboard | > 90% |
| Response Time | Render Dashboard | > 5s |
| Error Rate | Winston Logs | > 5% |
| API Quota | Groq Console | > 80% |

### Logs

**Format:** JSON (Winston)
```json
{
  "timestamp": "2026-05-21T10:44:00.000Z",
  "level": "info",
  "message": "POST /api/analyze - 200",
  "service": "antidote-mission-v3",
  "model": "Llama 4 Scout",
  "tokensUsed": 2456
}
```

**Destinations:**
- Console (Render Logs)
- Fichier (optionnel avec volume persistant)
- External (LogDNA, Papertrail)

---

## 🎯 Performance Targets

| Métrique | Target | Actuel |
|----------|--------|--------|
| Temps réponse API | < 5s | ~3s |
| Uptime | 99.9% | 99.9% |
| Cache hit ratio | > 30% | ~40% |
| Error rate | < 1% | < 0.5% |
| Concurrent users | 100 | 50+ |

---

**Architecture v3.0.0 — ANTIDOTE MISSION**
*KHEDIM BENYAKHLEF (BENY-JOE)*
