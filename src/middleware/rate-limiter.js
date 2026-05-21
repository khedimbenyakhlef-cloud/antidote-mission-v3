/**
 * ═══════════════════════════════════════════════
 * RATE LIMITER — PROTECTION CONTRE L'ABUS
 * ANTIDOTE MISSION V3
 * ═══════════════════════════════════════════════
 */

const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX) || 30,
  message: {
    success: false,
    error: 'Trop de requêtes. Limite: 30 requêtes/minute.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

const emergencyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10, // Moins de requêtes pour les urgences (plus coûteuses)
  message: {
    success: false,
    error: 'Limite d'urgence atteinte. Veuillez patienter.',
    code: 'EMERGENCY_RATE_LIMIT'
  }
});

module.exports = {
  apiLimiter,
  emergencyLimiter
};
