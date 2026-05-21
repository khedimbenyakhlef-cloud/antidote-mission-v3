const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/error-handler');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 10000;

// Sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.groq.com"],
      imgSrc: ["'self'", "data:", "blob:"],
    }
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requêtes par minute
  message: { error: 'Trop de requêtes. Veuillez réessayer dans une minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logs
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes API
app.use('/api', apiRoutes);

// Fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Route racine → index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check pour Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'ANTIDOTE MISSION V3',
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
});

// Gestion des erreurs
app.use(errorHandler);

// Démarrage
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`═══════════════════════════════════════════════`);
  logger.info(`  ANTIDOTE MISSION V3 — SERVEUR ACTIF`);
  logger.info(`  Port: ${PORT}`);
  logger.info(`  Environnement: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`  Fondée par: KHEDIM BENYAKHLEF (BENY-JOE)`);
  logger.info(`  Moteur IA: Groq AI — Rotation Multi-Modèles`);
  logger.info(`═══════════════════════════════════════════════`);
});

module.exports = app;
