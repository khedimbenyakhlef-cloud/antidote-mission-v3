FROM node:18-alpine

# Métadonnées
LABEL maintainer="KHEDIM BENYAKHLEF (BENY-JOE)"
LABEL version="3.0.0"
LABEL description="ANTIDOTE MISSION V3 - Plateforme Bio-Défense & Médecine"

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production && npm cache clean --force

# Copie du code source
COPY . .

# Exposition du port (Render utilise 10000 par défaut)
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrage
CMD ["node", "server.js"]
