/**
 * ═══════════════════════════════════════════════
 * ERROR HANDLER — GESTION CENTRALISÉE DES ERREURS
 * ANTIDOTE MISSION V3
 * ═══════════════════════════════════════════════
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log l'erreur
  logger.error(`Erreur: ${err.message} | Route: ${req.method} ${req.path} | IP: ${req.ip}`);

  // Erreurs Groq API
  if (err.name === 'GroqError' || err.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Service IA temporairement surchargé. Veuillez réessayer dans quelques secondes.',
      code: 'RATE_LIMIT',
      retryAfter: 5
    });
  }

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      code: 'VALIDATION_ERROR',
      details: err.message
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    error: error.message || 'Erreur serveur interne',
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
