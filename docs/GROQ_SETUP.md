# 🔑 CONFIGURATION GROQ AI

**ANTIDOTE MISSION V3 — Guide d'intégration Groq**

---

## 📝 Création du Compte Groq

### Étape 1: Inscription

1. Visitez [console.groq.com](https://console.groq.com)
2. Cliquez sur **"Sign Up"**
3. Créez un compte avec email ou GitHub/Google
4. Vérifiez votre email

### Étape 2: Génération de la Clé API

1. Connectez-vous à la console
2. Allez dans **"API Keys"** (menu latéral)
3. Cliquez **"Create API Key"**
4. Nommez votre clé : `antidote-mission-v3`
5. Copiez la clé (format : `gsk_xxxxxxxxxxxxxxxx`)
6. **IMPORTANT:** La clé n'est affichée qu'une fois !

### Étape 3: Configuration dans Render

1. Dashboard Render → Votre Web Service
2. Onglet **"Environment"**
3. Cliquez **"Add Environment Variable"**
4. Nom : `GROQ_API_KEY`
5. Valeur : `gsk_votre_cle_api`
6. Cliquez **"Save Changes"**

---

## 🔄 Rotation Multi-Clés (OPTIONNEL mais RECOMMANDÉ)

### Pourquoi la Rotation ?

- **Maximiser les tokens:** Chaque compte a ses propres limites RPM/TPM
- **Éviter les rate limits:** Distribution de charge entre comptes
- **Haute disponibilité:** Fallback automatique si un compte est saturé

### Création de Comptes Multiples

**Compte Principal (Propriétaire):**
```
Email: khedim.benyakhlef@gmail.com
Clé: GROQ_API_KEY = gsk_principal
```

**Compte 2 (Collaborateur):**
```
Email: antidote.mission2@gmail.com
Clé: gsk_key2
```

**Compte 3 (Collaborateur):**
```
Email: antidote.mission3@gmail.com
Clé: gsk_key3
```

### Configuration des Clés de Rotation

Dans Render Environment Variables :
```
GROQ_API_KEY = gsk_principal
GROQ_API_KEYS_ROTATION = gsk_key2,gsk_key3
```

**Le système alterne automatiquement entre les clés !**

---

## 📊 Limites des Modèles Groq (2026)

### Modèles Haute Capacité

| Modèle | Contexte | Max Tokens | RPM | TPM | RPD | Priorité |
|--------|----------|------------|-----|-----|-----|----------|
| **Llama 4 Scout** | 131,072 | 8,192 | 30 | 30,000 | 1,000 | 1 |
| **GPT-OSS 120B** | 128,000 | 65,536 | 30 | 8,000 | 1,000 | 2 |

**Use Case:** Analyses longues, rapports complets, protocoles détaillés

### Modèles Rapides

| Modèle | Contexte | Max Tokens | RPM | TPM | RPD | Priorité |
|--------|----------|------------|-----|-----|-----|----------|
| **Llama 3.1 8B** | 128,000 | 8,192 | 30 | 6,000 | 14,400 | 1 |
| **GPT-OSS 20B** | 128,000 | 65,536 | 30 | 8,000 | 1,000 | 2 |

**Use Case:** Chat rapide, réponses courtes, high-volume

### Modèles Spécialisés

| Modèle | Contexte | Max Tokens | RPM | TPM | RPD | Priorité |
|--------|----------|------------|-----|-----|-----|----------|
| **Qwen3 32B** | 131,072 | 40,960 | 60 | 6,000 | 1,000 | 1 |
| **Llama 3.3 70B** | 128,000 | 8,192 | 30 | 12,000 | 1,000 | 2 |

**Use Case:** Analyses techniques, code, bio-informatique

### Modèle de Secours

| Modèle | Contexte | Max Tokens | RPM | TPM | RPD |
|--------|----------|------------|-----|-----|-----|
| **Llama 3.1 8B** | 128,000 | 8,192 | 30 | 6,000 | 14,400 |

**Use Case:** Fallback quand tous les autres modèles sont saturés

---

## 🎯 Sélection Automatique du Modèle

### Logique de Sélection

```javascript
// Pseudo-code de l'algorithme
function selectModel(taskType, complexity) {

  // 1. Déterminer la catégorie de modèles
  const models = getModelsByTaskType(taskType);

  // 2. Filtrer les modèles disponibles (pas en rate limit)
  const available = models.filter(m => 
    m.currentRPM < m.rpm && 
    m.currentTPM + estimatedTokens < m.tpm
  );

  // 3. Scorer chaque modèle
  const scored = available.map(m => ({
    model: m,
    score: 
      (taskMatch ? 100 : 0) +           // Adéquation tâche
      (complexityMatch ? 50 : 0) +      // Complexité supportée
      (1 - m.currentRPM/m.rpm) * 30 +   // Disponibilité RPM
      (1 - m.currentTPM/m.tpm) * 20 +   // Disponibilité TPM
      (m.successRate * 20) +            // Historique succès
      ((4 - m.priority) * 10)            // Priorité configurée
  }));

  // 4. Sélectionner le meilleur score
  return scored.sort((a, b) => b.score - a.score)[0].model;
}
```

### Exemples de Sélection

**Analyse Hantavirus (complexe, longue):**
```
Input: taskType="high_capacity", complexity="high"
→ Sélectionné: Llama 4 Scout (score: 210.5)
→ Fallback: GPT-OSS 120B (score: 185.2)
```

**Consultation rapide (courte):**
```
Input: taskType="fast", complexity="low"
→ Sélectionné: Llama 3.1 8B (score: 175.8)
→ Fallback: GPT-OSS 20B (score: 142.3)
```

**Bio-informatique (technique):**
```
Input: taskType="specialized", complexity="medium"
→ Sélectionné: Qwen3 32B (score: 195.4)
→ Fallback: Llama 3.3 70B (score: 168.7)
```

---

## 📈 Monitoring des Quotas

### Dashboard Groq

1. Connectez-vous à [console.groq.com](https://console.groq.com)
2. Allez dans **"Usage"**
3. Visualisez :
   - Tokens utilisés (total)
   - Requêtes par minute (RPM)
   - Tokens par minute (TPM)
   - Coût estimé

### Alertes Recommandées

Configurez des alertes quand :
- RPM > 80% de la limite
- TPM > 80% de la limite
- Erreurs 429 > 5% des requêtes

### API de Statistiques (Interne)

```bash
curl https://votre-app.onrender.com/api/stats
```

Réponse :
```json
{
  "groq": {
    "apiKeysCount": 3,
    "cacheSize": 12
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
```

---

## 🔧 Optimisation des Tokens

### Stratégies de Réduction

1. **Prompts optimisés:**
   ```
   Mauvais: "Explique-moi tout sur le Hantavirus Andes en détail"
   Bon: "Analyse Hantavirus Andes: mécanisme, cibles moléculaires, antidotes"
   ```

2. **System prompts efficaces:**
   - Définir le rôle clairement
   - Spécifier le format de sortie
   - Limiter la longueur si possible

3. **Cache intelligent:**
   - Questions fréquentes → cache 5 min
   - Analyses identiques → retour immédiat
   - Réduction de ~40% des appels API

### Exemple d'Économie

**Sans optimisation:**
```
Requêtes: 1000/jour
Tokens moyens: 4000/requête
Coût estimé: ~$50/mois
```

**Avec optimisation:**
```
Requêtes: 600/jour (cache 40%)
Tokens moyens: 3000/requête (prompts courts)
Coût estimé: ~$20/mois
Économie: 60%
```

---

## 🚨 Dépannage Groq

### Erreur 429 (Rate Limit)

**Symptômes:**
```
Error: 429 Too Many Requests
```

**Solutions:**
1. Ajouter plus de clés API (rotation)
2. Augmenter le délai entre requêtes
3. Vérifier les limites du plan Groq
4. Passer au plan payant Groq si nécessaire

### Erreur 401 (Unauthorized)

**Symptômes:**
```
Error: 401 Invalid API Key
```

**Solutions:**
1. Vérifier la clé dans les variables d'environnement
2. Régénérer la clé sur console.groq.com
3. Vérifier le format (doit commencer par `gsk_`)

### Erreur 500 (Internal Server Error)

**Symptômes:**
```
Error: 500 Internal Server Error
```

**Solutions:**
1. Vérifier les logs Render
2. Redémarrer le service
3. Contacter le support Groq

### Réponses Vides ou Incomplètes

**Symptômes:**
```
Réponse: "" ou tronquée
```

**Solutions:**
1. Augmenter `max_tokens` dans la configuration
2. Vérifier la longueur du prompt
3. Sélectionner un modèle avec plus de tokens (GPT-OSS 120B)

---

## 💡 Bonnes Pratiques

### 1. Sécurité des Clés

- ❌ Ne JAMAIS committer les clés dans le code
- ✅ Utiliser les variables d'environnement Render
- ✅ Rotater les clés régulièrement (tous les 3 mois)
- ✅ Limiter les permissions si possible

### 2. Gestion des Coûts

- Surveiller l'usage sur console.groq.com
- Configurer des alertes de budget
- Utiliser le cache pour réduire les appels
- Privilégier les modèles rapides pour les tâches simples

### 3. Performance

- Préférer les modèles avec haut RPM pour le traffic élevé
- Utiliser le cache pour les questions récurrentes
- Implémenter un backoff exponentiel en cas d'erreur
- Monitorer les temps de réponse

---

## 📞 Support Groq

- **Documentation:** [console.groq.com/docs](https://console.groq.com/docs)
- **Status:** [status.groq.com](https://status.groq.com)
- **Community:** [Discord Groq](https://discord.gg/groq)
- **Email:** support@groq.com

---

**Configuration Groq v3.0.0 — ANTIDOTE MISSION**
*KHEDIM BENYAKHLEF (BENY-JOE)*
