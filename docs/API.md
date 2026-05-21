# 📡 DOCUMENTATION API

**ANTIDOTE MISSION V3 — Endpoints REST**

---

## Base URL

```
Production: https://votre-app.onrender.com/api
Local: http://localhost:10000/api
```

---

## 🔐 Authentification

Aucune authentification requise pour les endpoints publics.
Rate limiting : 30 requêtes/minute par IP.

---

## Endpoints

### 1. Health Check

```http
GET /api/health
```

**Réponse :**
```json
{
  "status": "OK",
  "service": "ANTIDOTE MISSION V3",
  "version": "3.0.0",
  "author": "KHEDIM BENYAKHLEF (BENY-JOE)",
  "ai_engine": "Groq AI — Rotation Multi-Modèles",
  "timestamp": "2026-05-21T10:44:00.000Z",
  "uptime": 3600
}
```

---

### 2. Analyse Virologique

```http
POST /api/analyze
Content-Type: application/json
```

**Body :**
```json
{
  "virusName": "Hantavirus Andes",
  "analysisType": "full",
  "urgency": "critical",
  "approach": "all",
  "symptoms": "Fièvre, toux, détresse respiratoire"
}
```

**Paramètres :**
| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `virusName` | string | ✅ | Nom du virus/pathogène |
| `analysisType` | string | ❌ | `full`, `antidote`, `vaccine`, `treatment`, `biomedicine`, `mechanism` |
| `urgency` | string | ❌ | `critical`, `high`, `medium`, `low` |
| `approach` | string | ❌ | `all`, `mrna`, `antibody`, `nano`, `gene`, `natural`, `torin` |
| `symptoms` | string | ❌ | Symptômes observés |

**Réponse :**
```json
{
  "success": true,
  "data": {
    "content": "ANALYSE COMPLÈTE HANTAVIRUS ANDES...",
    "model": "Llama 4 Scout",
    "modelId": "meta-llama/llama-4-scout-17b-16e-instruct",
    "tokensUsed": 2456,
    "promptTokens": 892,
    "completionTokens": 1564,
    "timestamp": "2026-05-21T10:44:00.000Z"
  },
  "requestId": "req_123456",
  "timestamp": "2026-05-21T10:44:00.000Z"
}
```

---

### 3. Protocole d'Urgence

```http
POST /api/emergency
Content-Type: application/json
```

**Body :**
```json
{
  "virusName": "Hantavirus Andes"
}
```

**Réponse :** Même format que `/api/analyze` avec champ `emergency: true`

---

### 4. Conception d'Antidote

```http
POST /api/design-antidote
Content-Type: application/json
```

**Body :**
```json
{
  "virusName": "Hantavirus Andes",
  "solutionType": "vaccine",
  "tech": "mrna",
  "population": "adults"
}
```

**Paramètres :**
| Champ | Type | Requis | Options |
|-------|------|--------|---------|
| `virusName` | string | ✅ | - |
| `solutionType` | string | ❌ | `vaccine`, `antidote`, `immunotherapy`, `gene_therapy`, `nano_medicine` |
| `tech` | string | ❌ | `mrna`, `viral_vector`, `protein_subunit`, `crispr`, `nanoparticle`, `antibody` |
| `population` | string | ❌ | `adults`, `all`, `immunocompromised`, `children` |

---

### 5. Consultation Bio-Médecine

```http
POST /api/biomedicine
Content-Type: application/json
```

**Body :**
```json
{
  "query": "Comment fonctionne Torin1 sur mTORC1 et mTORC2 ?"
}
```

---

### 6. Protocole Hantavirus

```http
POST /api/hantavirus-protocol
Content-Type: application/json
```

**Body :** Vide `{}`

**Réponse :** Protocole complet spécifique Hantavirus Andes 2026

---

### 7. Statistiques

```http
GET /api/stats
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "groq": {
      "apiKeysCount": 3,
      "cacheSize": 12,
      "models": {
        "high_capacity": ["Llama 4 Scout", "GPT-OSS 120B"],
        "fast": ["Llama 3.1 8B", "GPT-OSS 20B"],
        "specialized": ["Qwen3 32B", "Llama 3.3 70B"]
      }
    },
    "rotator": {
      "totalModels": 6,
      "availableModels": 5,
      "models": [
        {
          "name": "Llama 4 Scout",
          "rpm": "12/30",
          "tpm": "8400/30000",
          "successRate": "98.5%"
        }
      ]
    }
  }
}
```

---

### 8. Liste des Modèles

```http
GET /api/models
```

**Réponse :** Liste complète des modèles Groq configurés avec leurs spécifications

---

## 🔄 Codes d'Erreur

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_INPUT` | 400 | Paramètres manquants ou invalides |
| `VALIDATION_ERROR` | 400 | Erreur de validation des données |
| `RATE_LIMIT` | 429 | Trop de requêtes API Groq |
| `RATE_LIMIT_EXCEEDED` | 429 | Limite de requêtes/minute atteinte |
| `ANALYSIS_ERROR` | 500 | Erreur lors de l'analyse |
| `EMERGENCY_ERROR` | 500 | Erreur protocole urgence |
| `DESIGN_ERROR` | 500 | Erreur conception antidote |
| `CONSULT_ERROR` | 500 | Erreur consultation |
| `HANTA_ERROR` | 500 | Erreur protocole Hantavirus |
| `INTERNAL_ERROR` | 500 | Erreur serveur interne |

---

## 📊 Rate Limiting

- **Limite:** 30 requêtes/minute par IP
- **Fenêtre:** 1 minute
- **Headers:**
  - `X-RateLimit-Limit: 30`
  - `X-RateLimit-Remaining: 28`
  - `X-RateLimit-Reset: 1621526400`

---

## 🧪 Exemples cURL

### Analyse simple
```bash
curl -X POST https://votre-app.onrender.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"virusName": "SARS-CoV-2", "analysisType": "full"}'
```

### Urgence
```bash
curl -X POST https://votre-app.onrender.com/api/emergency \
  -H "Content-Type: application/json" \
  -d '{"virusName": "Ebola"}'
```

### Conception vaccin
```bash
curl -X POST https://votre-app.onrender.com/api/design-antidote \
  -H "Content-Type: application/json" \
  -d '{
    "virusName": "Hantavirus Andes",
    "solutionType": "vaccine",
    "tech": "mrna",
    "population": "adults"
  }'
```

---

**Documentation API v3.0.0 — ANTIDOTE MISSION**
*KHEDIM BENYAKHLEF (BENY-JOE)*
