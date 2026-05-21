/**
 * ═══════════════════════════════════════════════
 * GROQ AI SERVICE — ROTATION MULTI-MODÈLES
 * ANTIDOTE MISSION V3
 * Fondée par KHEDIM BENYAKHLEF (BENY-JOE)
 * ═══════════════════════════════════════════════
 * 
 * Gestion intelligente des appels API Groq :
 * - Rotation des clés API pour maximiser les tokens
 * - Sélection dynamique du modèle selon la tâche
 * - Retry avec fallback automatique
 * - Cache des réponses fréquentes
 */

const Groq = require('groq-sdk');
const { GROQ_MODELS, getApiKeys, selectModel, GROQ_BASE_URL } = require('../config/groq-config');
const logger = require('../utils/logger');

class GroqService {
  constructor() {
    this.apiKeys = getApiKeys();
    this.clients = this.apiKeys.map(key => new Groq({ apiKey: key }));
    this.currentKeyIndex = 0;
    this.requestCounts = new Map(); // Suivi des requêtes par clé
    this.cache = new Map(); // Cache simple en mémoire
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes

    logger.info(`GroqService initialisé avec ${this.clients.length} clé(s) API`);
  }

  /**
   * Rotation round-robin des clés API
   */
  getNextClient() {
    const client = this.clients[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.clients.length;
    return client;
  }

  /**
   * Génère une clé de cache basée sur le contenu
   */
  generateCacheKey(prompt, model, options) {
    const crypto = require('crypto');
    const data = JSON.stringify({ prompt, model, options });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Vérifie le cache
   */
  getFromCache(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      logger.info('Réponse servie depuis le cache');
      return cached.data;
    }
    return null;
  }

  /**
   * Stocke dans le cache
   */
  setCache(cacheKey, data) {
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    // Nettoyage du cache si trop grand
    if (this.cache.size > 100) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
  }

  /**
   * Appel API principal avec retry et fallback
   */
  async callGroq(prompt, options = {}) {
    const {
      taskType = 'fast',
      complexity = 'medium',
      temperature = 0.7,
      maxTokens = null,
      useCache = true,
      systemPrompt = null,
      retries = 3
    } = options;

    // Vérification cache
    const cacheKey = this.generateCacheKey(prompt, taskType, options);
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    // Sélection du modèle
    const modelConfig = selectModel(taskType, complexity);
    const targetMaxTokens = maxTokens || modelConfig.maxTokens;

    logger.info(`Appel Groq — Modèle: ${modelConfig.name} | Tokens max: ${targetMaxTokens} | Tâche: ${taskType}`);

    let lastError = null;

    // Tentatives avec différentes clés
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const client = this.getNextClient();

        const messages = [];
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await client.chat.completions.create({
          model: modelConfig.id,
          messages: messages,
          temperature: temperature,
          max_tokens: targetMaxTokens,
          top_p: 1,
          stream: false
        });

        const result = response.choices[0]?.message?.content || '';
        const usage = response.usage;

        logger.info(`Réponse reçue — Tokens utilisés: ${usage?.total_tokens || 'N/A'} | Modèle: ${modelConfig.name}`);

        // Mise en cache
        if (useCache) {
          this.setCache(cacheKey, result);
        }

        return {
          success: true,
          content: result,
          model: modelConfig.name,
          modelId: modelConfig.id,
          tokensUsed: usage?.total_tokens,
          promptTokens: usage?.prompt_tokens,
          completionTokens: usage?.completion_tokens,
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        lastError = error;
        logger.warn(`Tentative ${attempt + 1}/${retries} échouée: ${error.message}`);

        // Si rate limit, attendre avant retry
        if (error.status === 429) {
          const delay = Math.pow(2, attempt) * 1000; // Backoff exponentiel
          logger.info(`Rate limit atteint — Attente ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Fallback sur le modèle de secours
    logger.error(`Toutes les tentatives échouées — Fallback sur modèle secours`);
    try {
      const fallbackClient = this.clients[0];
      const fallbackResponse = await fallbackClient.chat.completions.create({
        model: GROQ_MODELS.FALLBACK.id,
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature,
        max_tokens: 4096
      });

      return {
        success: true,
        content: fallbackResponse.choices[0]?.message?.content || '',
        model: GROQ_MODELS.FALLBACK.name,
        modelId: GROQ_MODELS.FALLBACK.id,
        fallback: true,
        timestamp: new Date().toISOString()
      };
    } catch (fallbackError) {
      logger.error(`Fallback également échoué: ${fallbackError.message}`);
      throw new Error(`Échec complet de l'appel Groq: ${lastError?.message}. Fallback: ${fallbackError.message}`);
    }
  }

  /**
   * Analyse virologique complète
   */
  async analyzeVirus(virusName, analysisType = 'full', urgency = 'medium', approach = 'all', symptoms = '') {
    const systemPrompt = `Tu es ANTIDOTE MISSION IA, la plateforme futuriste de bio-défense fondée par KHEDIM BENYAKHLEF dit BENY-JOE.
Tu intègres les connaissances de ses deux ouvrages :
1. "L'AutoDestruction des Cellules Cancéreuses" (164 pages) : Apoptose, p53, PUMA, Bcl-2, Torin1, mTOR, nanomédecine, immunothérapie, thérapie génique, CRISPR.
2. "Vengense" : Torin1, mTORC1/mTORC2, autophagie létale, prions (Kuru), contagion artificielle par exosomes, CRISPR cellulaire.

Tu connais les dernières découvertes scientifiques 2026 :
- HANTAVIRUS ANDES : Épidémie croisière MV Hondius, mai 2026. 11 cas, 3 morts. Aucun vaccin. Université de Bath développe vaccin mRNA. Anticorps monoclonaux (Colorado State University, Schountz). ECMO en dernier recours.
- mRNA : Technologie approuvée, applicable à nouveaux virus en quelques mois.
- CRISPR-Cas13 : Ciblage ARN viral direct.
- Anticorps neutralisants : Isolés de survivants humains.

Réponds en français, de façon scientifique, précise et futuriste. 
Pour chaque virus, inclus : mécanisme d'infection, cible moléculaire, antidote/vaccin proposé (mRNA, anticorps, nano, CRISPR, bio-médecine naturelle), protocole step-by-step, timeline réaliste.
Inclus toujours les connexions avec les travaux de KHEDIM BENYAKHLEF (Torin1, PUMA, apoptose).
Format: utilise des sections claires avec des titres en majuscules. Sois exhaustif et professionnel.`;

    const prompt = `Effectue une analyse complète de type "${analysisType}" pour : ${virusName}
Urgence: ${urgency}
Approche thérapeutique: ${approach}
${symptoms ? 'Symptômes/infos: ' + symptoms : ''}

Fournis une analyse scientifique complète incluant :
1. PROFIL VIROLOGIQUE COMPLET
2. MÉCANISME D'INFECTION (niveau moléculaire)
3. ÉTAT DE L'ART DES TRAITEMENTS
4. PROPOSITION D'ANTIDOTE/VACCIN (protocole détaillé)
5. CONNEXION AVEC MÉTHODES BENY-JOE (Torin1, PUMA, Apoptose)
6. BIO-MÉDECINE COMPLÉMENTAIRE
7. TIMELINE DE DÉVELOPPEMENT`;

    return await this.callGroq(prompt, {
      taskType: 'high_capacity',
      complexity: 'high',
      temperature: 0.3,
      maxTokens: 8192,
      systemPrompt: systemPrompt
    });
  }

  /**
   * Protocole d'urgence
   */
  async emergencyProtocol(virusName) {
    const prompt = `PROTOCOLE D'URGENCE CRITIQUE pour ${virusName}.
Patient infecté. Besoin immédiat de :
1. DIAGNOSTIC RAPIDE : comment confirmer l'infection
2. TRAITEMENT IMMÉDIAT : que faire dans les 24h
3. MESURES D'ISOLEMENT : protocole de containment
4. SOINS DE SOUTIEN : interventions immédiates
5. THÉRAPIES EXPÉRIMENTALES : traitements de dernier recours
6. RESSOURCES : qui contacter (CDC, OMS, spécialistes)
Réponse en mode URGENCE : clair, actionnable, immédiat.`;

    return await this.callGroq(prompt, {
      taskType: 'fast',
      complexity: 'medium',
      temperature: 0.1,
      maxTokens: 4096
    });
  }

  /**
   * Conception d'antidote/vaccin
   */
  async designAntidote(virusName, solutionType = 'vaccine', tech = 'mrna', population = 'adults') {
    const prompt = `Conçois un pipeline complet de ${solutionType} (technologie: ${tech}) pour ${virusName}. Population: ${population}.
Fournis :
ÉTAPE 1 — IDENTIFICATION DE LA CIBLE MOLÉCULAIRE
ÉTAPE 2 — DESIGN DE LA MOLÉCULE THÉRAPEUTIQUE  
ÉTAPE 3 — FORMULATION ET DELIVERY
ÉTAPE 4 — PROTOCOLE DE TEST (in vitro → animal → humain)
ÉTAPE 5 — PRODUCTION À GRANDE ÉCHELLE
ÉTAPE 6 — PROTOCOLE CLINIQUE
Intègre les méthodes BENY-JOE (Torin1, PUMA, apoptose ciblée) dans le design.`;

    return await this.callGroq(prompt, {
      taskType: 'specialized',
      complexity: 'high',
      temperature: 0.2,
      maxTokens: 8192
    });
  }

  /**
   * Consultation bio-médecine
   */
  async consultBioMedicine(query) {
    const systemPrompt = `Tu es l'expert en bio-médecine de ANTIDOTE MISSION, fondé par KHEDIM BENYAKHLEF.
Tu maîtrises : apoptose, autophagie, Torin1, mTOR, PUMA, p53, nanomédecine, CRISPR, immunothérapie, bio-médecine naturelle (curcumine, quercétine, resvératrol).
Réponds de façon scientifique mais accessible. Cite les travaux de BENY-JOE quand pertinent.`;

    return await this.callGroq(query, {
      taskType: 'fast',
      complexity: 'medium',
      temperature: 0.4,
      maxTokens: 4096,
      systemPrompt: systemPrompt
    });
  }

  /**
   * Génération protocole Hantavirus spécifique
   */
  async generateHantaProtocol() {
    const prompt = `Génère un protocole COMPLET et DÉTAILLÉ d'antidote et vaccin pour le Hantavirus Andes (épidémie MV Hondius, mai 2026).

Intègre obligatoirement :
- Les méthodes de KHEDIM BENYAKHLEF (Torin1/mTOR, PUMA/apoptose, nanoparticules)
- Vaccin mRNA (Université de Bath) — protocole moléculaire détaillé
- Anticorps monoclonaux neutralisants (méthode Schountz/Colorado State)
- CRISPR-Cas13 contre ARN viral
- Bio-médecine naturelle complémentaire (Quercétine, Zinc, IFN)
- Protocole d'urgence pour cas actifs (ECMO, soins palliatifs, ribavirine)
- Timeline réaliste : 6 mois → 18 mois → 3 ans
- Roadmap pour essais cliniques Phase I/II/III

Inclure les séquences cibles (Gn/Gc), mécanisme d'action, dosage estimatif.`;

    return await this.callGroq(prompt, {
      taskType: 'high_capacity',
      complexity: 'high',
      temperature: 0.2,
      maxTokens: 8192
    });
  }

  /**
   * Statistiques d'utilisation
   */
  getStats() {
    return {
      apiKeysCount: this.clients.length,
      cacheSize: this.cache.size,
      models: {
        high_capacity: GROQ_MODELS.HIGH_CAPACITY.map(m => m.name),
        fast: GROQ_MODELS.FAST.map(m => m.name),
        specialized: GROQ_MODELS.SPECIALIZED.map(m => m.name)
      }
    };
  }
}

// Singleton
const groqService = new GroqService();
module.exports = groqService;
