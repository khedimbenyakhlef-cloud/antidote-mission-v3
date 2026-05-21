/**
 * ═══════════════════════════════════════════════
 * API ROUTES — ENDPOINTS PRINCIPAUX
 * ANTIDOTE MISSION V3
 * ═══════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const groqService = require('../services/groq-service');
const modelRotator = require('../services/model-rotator');
const logger = require('../utils/logger');

// Middleware de validation
const validateAnalysis = (req, res, next) => {
  const { virusName } = req.body;
  if (!virusName || virusName.trim().length < 2) {
    return res.status(400).json({ 
      error: 'Nom du virus requis (min 2 caractères)',
      code: 'INVALID_INPUT'
    });
  }
  next();
};

/**
 * @route   POST /api/analyze
 * @desc    Analyse virologique complète
 * @access  Public
 */
router.post('/analyze', validateAnalysis, async (req, res) => {
  try {
    const { 
      virusName, 
      analysisType = 'full', 
      urgency = 'medium',
      approach = 'all',
      symptoms = ''
    } = req.body;

    logger.info(`Analyse demandée: ${virusName} | Type: ${analysisType} | Urgence: ${urgency}`);

    const result = await groqService.analyzeVirus(virusName, analysisType, urgency, approach, symptoms);

    res.json({
      success: true,
      data: result,
      requestId: req.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Erreur analyse: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'ANALYSIS_ERROR'
    });
  }
});

/**
 * @route   POST /api/emergency
 * @desc    Protocole d'urgence
 * @access  Public
 */
router.post('/emergency', validateAnalysis, async (req, res) => {
  try {
    const { virusName } = req.body;

    logger.warn(`🚨 PROTOCOLE D'URGENCE demandé pour: ${virusName}`);

    const result = await groqService.emergencyProtocol(virusName);

    res.json({
      success: true,
      data: result,
      emergency: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Erreur urgence: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'EMERGENCY_ERROR'
    });
  }
});

/**
 * @route   POST /api/design-antidote
 * @desc    Conception d'antidote/vaccin
 * @access  Public
 */
router.post('/design-antidote', validateAnalysis, async (req, res) => {
  try {
    const { 
      virusName, 
      solutionType = 'vaccine',
      tech = 'mrna',
      population = 'adults'
    } = req.body;

    logger.info(`Conception antidote: ${virusName} | Type: ${solutionType} | Tech: ${tech}`);

    const result = await groqService.designAntidote(virusName, solutionType, tech, population);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Erreur conception: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'DESIGN_ERROR'
    });
  }
});

/**
 * @route   POST /api/biomedicine
 * @desc    Consultation bio-médecine
 * @access  Public
 */
router.post('/biomedicine', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 5) {
      return res.status(400).json({
        error: 'Question requise (min 5 caractères)',
        code: 'INVALID_QUERY'
      });
    }

    logger.info(`Consultation bio-médecine: ${query.substring(0, 50)}...`);

    const result = await groqService.consultBioMedicine(query);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Erreur consultation: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'CONSULT_ERROR'
    });
  }
});

/**
 * @route   POST /api/hantavirus-protocol
 * @desc    Protocole Hantavirus Andes spécifique
 * @access  Public
 */
router.post('/hantavirus-protocol', async (req, res) => {
  try {
    logger.info('Génération protocole Hantavirus Andes demandée');

    const result = await groqService.generateHantaProtocol();

    res.json({
      success: true,
      data: result,
      virus: 'Hantavirus Andes',
      outbreak: 'MV Hondius — Mai 2026',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Erreur Hantavirus: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'HANTA_ERROR'
    });
  }
});

/**
 * @route   GET /api/stats
 * @desc    Statistiques du service
 * @access  Public
 */
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      groq: groqService.getStats(),
      rotator: modelRotator.getStats(),
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route   GET /api/models
 * @desc    Liste des modèles disponibles
 * @access  Public
 */
router.get('/models', (req, res) => {
  const { GROQ_MODELS } = require('../config/groq-config');

  res.json({
    success: true,
    data: {
      high_capacity: GROQ_MODELS.HIGH_CAPACITY,
      fast: GROQ_MODELS.FAST,
      specialized: GROQ_MODELS.SPECIALIZED,
      fallback: GROQ_MODELS.FALLBACK
    }
  });
});

/**
 * @route   GET /api/health
 * @desc    Health check détaillé
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ANTIDOTE MISSION V3',
    version: '3.0.0',
    author: 'KHEDIM BENYAKHLEF (BENY-JOE)',
    ai_engine: 'Groq AI — Rotation Multi-Modèles',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
