/**
 * ═══════════════════════════════════════════════
 * MODEL ROTATOR — GESTION INTELLIGENTE DES TOKENS
 * ANTIDOTE MISSION V3
 * ═══════════════════════════════════════════════
 * 
 * Maximise l'utilisation des tokens Groq via :
 * - Rotation automatique selon les limites RPM/TPM
 * - Load balancing entre modèles
 * - Monitoring des quotas en temps réel
 */

const { GROQ_MODELS } = require('../config/groq-config');
const logger = require('../utils/logger');

class ModelRotator {
  constructor() {
    this.usageTracker = new Map();
    this.modelQueue = [];
    this.initializeQueue();

    // Reset des compteurs toutes les minutes
    setInterval(() => this.resetCounters(), 60000);
  }

  initializeQueue() {
    // Créer une file prioritaire de tous les modèles disponibles
    const allModels = [
      ...GROQ_MODELS.HIGH_CAPACITY,
      ...GROQ_MODELS.FAST,
      ...GROQ_MODELS.SPECIALIZED
    ];

    this.modelQueue = allModels.map(model => ({
      ...model,
      currentRPM: 0,
      currentTPM: 0,
      lastUsed: null,
      successCount: 0,
      errorCount: 0
    }));

    logger.info(`ModelRotator initialisé avec ${this.modelQueue.length} modèles`);
  }

  resetCounters() {
    this.modelQueue.forEach(model => {
      model.currentRPM = 0;
      model.currentTPM = 0;
    });
    logger.debug('Compteurs RPM/TPM réinitialisés');
  }

  /**
   * Sélectionne le meilleur modèle disponible selon la tâche
   */
  selectModel(taskType, estimatedTokens = 1000, complexity = 'medium') {
    const now = Date.now();

    // Filtrer les modèles disponibles (pas en rate limit)
    const availableModels = this.modelQueue.filter(model => {
      const rpmOk = model.currentRPM < model.rpm;
      const tpmOk = model.currentTPM + estimatedTokens < model.tpm;
      return rpmOk && tpmOk;
    });

    if (availableModels.length === 0) {
      logger.warn('Aucun modèle disponible — Attente forcée');
      return null;
    }

    // Score chaque modèle
    const scoredModels = availableModels.map(model => {
      let score = 0;

      // Priorité selon le type de tâche
      if (taskType === 'high_capacity' && model.contextWindow >= 128000) score += 100;
      if (taskType === 'fast' && model.maxTokens <= 8192) score += 50;
      if (taskType === 'specialized') score += 75;

      // Complexité
      if (complexity === 'high' && model.maxTokens >= 8192) score += 50;

      // Disponibilité (moins utilisé = meilleur)
      score += (1 - model.currentRPM / model.rpm) * 30;
      score += (1 - model.currentTPM / model.tpm) * 20;

      // Historique de succès
      const totalCalls = model.successCount + model.errorCount;
      if (totalCalls > 0) {
        score += (model.successCount / totalCalls) * 20;
      }

      // Priorité configurée
      score += (4 - model.priority) * 10;

      return { model, score };
    });

    // Trier par score décroissant
    scoredModels.sort((a, b) => b.score - a.score);

    const selected = scoredModels[0].model;

    // Mettre à jour les compteurs
    selected.currentRPM++;
    selected.currentTPM += estimatedTokens;
    selected.lastUsed = now;

    logger.info(`Modèle sélectionné: ${selected.name} (score: ${scoredModels[0].score.toFixed(1)})`);

    return selected;
  }

  /**
   * Met à jour les statistiques après un appel
   */
  recordResult(modelId, success, tokensUsed = 0) {
    const model = this.modelQueue.find(m => m.id === modelId);
    if (model) {
      if (success) {
        model.successCount++;
      } else {
        model.errorCount++;
      }
      model.currentTPM += tokensUsed;
    }
  }

  /**
   * Obtient les statistiques actuelles
   */
  getStats() {
    return {
      totalModels: this.modelQueue.length,
      availableModels: this.modelQueue.filter(m => m.currentRPM < m.rpm).length,
      models: this.modelQueue.map(m => ({
        name: m.name,
        rpm: `${m.currentRPM}/${m.rpm}`,
        tpm: `${m.currentTPM}/${m.tpm}`,
        successRate: m.successCount + m.errorCount > 0 
          ? ((m.successCount / (m.successCount + m.errorCount)) * 100).toFixed(1) + '%'
          : 'N/A',
        lastUsed: m.lastUsed ? new Date(m.lastUsed).toISOString() : 'Jamais'
      }))
    };
  }

  /**
   * Attend qu'un modèle soit disponible
   */
  async waitForAvailableModel(timeoutMs = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const model = this.selectModel('fast', 1000);
      if (model) return model;

      logger.info('Attente de disponibilité d'un modèle...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Timeout: Aucun modèle disponible après 30s');
  }
}

const modelRotator = new ModelRotator();
module.exports = modelRotator;
