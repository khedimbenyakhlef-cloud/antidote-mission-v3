/**
 * ═══════════════════════════════════════════════
 * GROQ AI CONFIGURATION — ROTATION MULTI-MODÈLES
 * ANTIDOTE MISSION V3
 * Fondée par KHEDIM BENYAKHLEF (BENY-JOE)
 * ═══════════════════════════════════════════════
 * 
 * Stratégie de rotation pour maximiser les tokens :
 * - Utilise plusieurs modèles selon la tâche
 * - Fallback automatique en cas de rate limit
 * - Cache intelligent des réponses fréquentes
 */

const GROQ_MODELS = {
  // Modèles haute capacité (longs textes, analyses complexes)
  HIGH_CAPACITY: [
    {
      id: 'meta-llama/llama-4-scout-17b-16e-instruct',
      name: 'Llama 4 Scout',
      contextWindow: 131072,
      maxTokens: 8192,
      rpm: 30,
      tpm: 30000,
      rpd: 1000,
      priority: 1,
      useCase: 'Analyses longues, rapports complets'
    },
    {
      id: 'openai/gpt-oss-120b',
      name: 'GPT-OSS 120B',
      contextWindow: 128000,
      maxTokens: 65536,
      rpm: 30,
      tpm: 8000,
      rpd: 1000,
      priority: 2,
      useCase: 'Raisonnement complexe, protocoles détaillés'
    }
  ],

  // Modèles rapides (réponses courtes, chat)
  FAST: [
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B',
      contextWindow: 128000,
      maxTokens: 8192,
      rpm: 30,
      tpm: 6000,
      rpd: 14400,
      priority: 1,
      useCase: 'Chat rapide, réponses courtes, high-volume'
    },
    {
      id: 'openai/gpt-oss-20b',
      name: 'GPT-OSS 20B',
      contextWindow: 128000,
      maxTokens: 65536,
      rpm: 30,
      tpm: 8000,
      rpd: 1000,
      priority: 2,
      useCase: 'Analyses médicales intermédiaires'
    }
  ],

  // Modèles spécialisés
  SPECIALIZED: [
    {
      id: 'qwen/qwen3-32b',
      name: 'Qwen3 32B',
      contextWindow: 131072,
      maxTokens: 40960,
      rpm: 60,
      tpm: 6000,
      rpd: 1000,
      priority: 1,
      useCase: 'Analyses techniques, code, bio-informatique'
    },
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B',
      contextWindow: 128000,
      maxTokens: 8192,
      rpm: 30,
      tpm: 12000,
      rpd: 1000,
      priority: 2,
      useCase: 'Qualité maximale, raisonnement avancé'
    }
  ],

  // Modèle de secours (toujours disponible)
  FALLBACK: {
    id: 'llama-3.1-8b-instant',
    name: 'Fallback Llama 3.1 8B',
    contextWindow: 128000,
    maxTokens: 8192,
    rpm: 30,
    tpm: 6000,
    rpd: 14400
  }
};

// Configuration des clés API (rotation)
const getApiKeys = () => {
  const keys = [];

  // Clé principale
  if (process.env.GROQ_API_KEY) {
    keys.push(process.env.GROQ_API_KEY);
  }

  // Clés de rotation
  if (process.env.GROQ_API_KEYS_ROTATION) {
    const rotationKeys = process.env.GROQ_API_KEYS_ROTATION.split(',').map(k => k.trim());
    keys.push(...rotationKeys);
  }

  return keys;
};

// Sélection du modèle selon la tâche
const selectModel = (taskType, complexity = 'medium') => {
  const models = GROQ_MODELS[taskType.toUpperCase()] || GROQ_MODELS.FAST;

  // Pour les tâches complexes, privilégier les modèles haute capacité
  if (complexity === 'high' && taskType !== 'HIGH_CAPACITY') {
    return GROQ_MODELS.HIGH_CAPACITY[0];
  }

  // Rotation round-robin simple
  const index = Math.floor(Date.now() / 1000) % models.length;
  return models[index];
};

module.exports = {
  GROQ_MODELS,
  getApiKeys,
  selectModel,
  GROQ_BASE_URL: 'https://api.groq.com/openai/v1'
};
