/**
 * ANTIDOTE MISSION — Web Service Backend
 * Fondé par KHEDIM BENYAKHLEF dit BENY-JOE
 * Groq AI : rotation automatique entre modèles récents + retry sur erreur
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────────────────────────────────────
//  GROQ CONFIG — rotation + fallback
// ─────────────────────────────────────────────────────────────────────────────
const GROQ_URL  = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_KEY  = process.env.GROQ_API_KEY || '';

// Modèles récents Groq dans l'ordre de préférence (2025-2026)
// En cas d'erreur sur l'un, le suivant est essayé automatiquement
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',       // meilleur rapport qualité/vitesse
  'llama3-70b-8192',               // fallback stable
  'llama-3.1-70b-versatile',       // fallback
  'mixtral-8x7b-32768',            // fallback rapide
  'llama3-8b-8192',                // dernier recours (plus léger)
];

// Index courant — tourne à chaque appel réussi
let modelIndex = 0;

function nextModel() {
  const m = GROQ_MODELS[modelIndex % GROQ_MODELS.length];
  modelIndex = (modelIndex + 1) % GROQ_MODELS.length;
  return m;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM = `Tu es ANTIDOTE MISSION — plateforme futuriste de bio-défense fondée par KHEDIM BENYAKHLEF dit BENY-JOE.

OUVRAGES INTÉGRÉS :
• Livre 1 "L'AutoDestruction des Cellules Cancéreuses" (164 p.) :
  Apoptose, p53, PUMA, Bcl-2, chimiothérapie, immunothérapie, thérapie génique, nanomédecine.
• Livre 2 "Vengense" :
  Torin1 (inhibiteur mTORC1+mTORC2), autophagie létale, exosomes, prions (Kuru), CRISPR, contagion artificielle.

ACTUALITÉS SCIENTIFIQUES 2026 :
• Hantavirus Andes — Épidémie croisière MV Hondius mai 2026 : 11 cas, 3 décès, 147 exposés, 23 nationalités.
  Aucun vaccin approuvé. Univ. Bath UK : vaccin mRNA en développement. Colorado State Univ. : anticorps monoclonaux.
• Technologie mRNA déployable en quelques mois pour tout nouveau virus.
• CRISPR-Cas13 : ciblage direct ARN viral intracellulaire.
• AlphaFold 3 : prédiction de structures protéiques pour conception d'antidotes.

DIRECTIVES :
- Réponds toujours en français, scientifique, professionnel, exhaustif.
- Structure avec sections TITRÉES EN MAJUSCULES.
- Intègre systématiquement méthodes BENY-JOE (Torin1, PUMA, apoptose, nanoparticules).
- Propose protocoles step-by-step avec timeline réaliste.
- Pour chaque pathogène : profil → mécanisme moléculaire → cible → antidote/vaccin → bio-médecine.`;

// ─────────────────────────────────────────────────────────────────────────────
//  callGroq — retry automatique sur tous les modèles
// ─────────────────────────────────────────────────────────────────────────────
async function callGroq(messages, maxTokens = 2048) {
  if (!GROQ_KEY) {
    return '⚠️ GROQ_API_KEY non configurée. Ajoutez-la dans les variables d\'environnement Render (Settings → Environment).';
  }

  const payload = {
    messages: [{ role: 'system', content: SYSTEM }, ...messages],
    max_tokens: maxTokens,
    temperature: 0.7,
    stream: false,
  };

  const tried = [];

  // Essaie chaque modèle une fois dans l'ordre rotatif
  for (let attempt = 0; attempt < GROQ_MODELS.length; attempt++) {
    const model = GROQ_MODELS[(modelIndex + attempt) % GROQ_MODELS.length];
    tried.push(model);

    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ ...payload, model }),
        signal: AbortSignal.timeout(55000), // 55s timeout
      });

      if (res.status === 429) {
        // Rate limit — on passe au modèle suivant immédiatement
        console.warn(`[Groq] Rate limit sur ${model}, rotation…`);
        continue;
      }

      if (res.status === 503 || res.status === 502) {
        console.warn(`[Groq] Modèle ${model} indisponible (${res.status}), rotation…`);
        continue;
      }

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error(`[Groq] Erreur ${res.status} sur ${model}:`, body);
        continue;
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        console.warn(`[Groq] Réponse vide sur ${model}`);
        continue;
      }

      // Succès — on avance l'index rotatif pour la prochaine requête
      modelIndex = (modelIndex + attempt + 1) % GROQ_MODELS.length;
      console.log(`[Groq] ✓ Réponse reçue via ${model}`);
      return text;

    } catch (err) {
      const msg = err.name === 'TimeoutError' ? 'Timeout 55s' : err.message;
      console.warn(`[Groq] Exception sur ${model}: ${msg}`);
      continue;
    }
  }

  return `⚠️ Tous les modèles Groq ont échoué (essayés : ${tried.join(', ')}). Vérifiez votre clé API et votre connexion.`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTES API
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/status
app.get('/api/status', (req, res) => {
  res.json({
    service:   'ANTIDOTE MISSION',
    founder:   'KHEDIM BENYAKHLEF dit BENY-JOE',
    version:   '2.1.0',
    groq:      GROQ_KEY ? 'CONNECTÉ' : 'CLÉ MANQUANTE',
    models:    GROQ_MODELS,
    current:   GROQ_MODELS[modelIndex % GROQ_MODELS.length],
    uptime:    Math.floor(process.uptime()) + 's',
    node:      process.version,
  });
});

// POST /api/analyze
app.post('/api/analyze', async (req, res) => {
  try {
    const { virus = 'Hantavirus Andes', type = 'full', urgency = 'critical', approach = 'all', symptoms = '' } = req.body;
    const prompt = `ANALYSE ${type.toUpperCase()} — Pathogène : ${virus}
Urgence : ${urgency} | Approche : ${approach}
${symptoms ? 'Symptômes / infos complémentaires : ' + symptoms : ''}

Fournis une analyse structurée :
1. PROFIL VIROLOGIQUE COMPLET
2. MÉCANISME D'INFECTION (niveau moléculaire)
3. ÉTAT DE L'ART DES TRAITEMENTS
4. PROPOSITION D'ANTIDOTE / VACCIN (protocole détaillé step-by-step)
5. CONNEXION MÉTHODES BENY-JOE (Torin1, PUMA, apoptose, nanoparticules)
6. BIO-MÉDECINE COMPLÉMENTAIRE NATURELLE
7. TIMELINE RÉALISTE DE DÉVELOPPEMENT`;
    const result = await callGroq([{ role: 'user', content: prompt }]);
    res.json({ success: true, result, model: GROQ_MODELS[(modelIndex - 1 + GROQ_MODELS.length) % GROQ_MODELS.length] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/antidote
app.post('/api/antidote', async (req, res) => {
  try {
    const { target = 'Hantavirus Andes', solutionType = 'vaccine', tech = 'mrna', population = 'adults' } = req.body;
    const prompt = `Conçois un pipeline complet de ${solutionType} (technologie : ${tech}) pour ${target}. Population cible : ${population}.

ÉTAPE 1 — IDENTIFICATION DE LA CIBLE MOLÉCULAIRE
ÉTAPE 2 — DESIGN DE LA MOLÉCULE THÉRAPEUTIQUE
ÉTAPE 3 — FORMULATION ET SYSTÈME DE DELIVERY
ÉTAPE 4 — PROTOCOLE DE TEST (in vitro → animal → humain)
ÉTAPE 5 — PRODUCTION À GRANDE ÉCHELLE
ÉTAPE 6 — PROTOCOLE CLINIQUE PHASE I/II/III
Intègre obligatoirement Torin1, PUMA, nanoparticules (méthodes BENY-JOE).`;
    const result = await callGroq([{ role: 'user', content: prompt }]);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/emergency
app.post('/api/emergency', async (req, res) => {
  try {
    const { virus = 'PATHOGÈNE INCONNU' } = req.body;
    const prompt = `PROTOCOLE D'URGENCE CRITIQUE — ${virus}
1. DIAGNOSTIC RAPIDE : confirmer l'infection (tests, biomarqueurs)
2. TRAITEMENT IMMÉDIAT : actions dans les 24 premières heures
3. ISOLEMENT : protocole de containment
4. SOINS DE SOUTIEN : interventions immédiates
5. THÉRAPIES EXPÉRIMENTALES : last resort
6. RESSOURCES : CDC, OMS, spécialistes à contacter
Réponse en mode URGENCE : clair, actionnable, immédiat.`;
    const result = await callGroq([{ role: 'user', content: prompt }], 1500);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/hantavirus
app.post('/api/hantavirus', async (req, res) => {
  try {
    const prompt = `Génère le protocole COMPLET d'antidote et vaccin pour HANTAVIRUS ANDES (épidémie MV Hondius, mai 2026, 11 cas, 3 morts).

Intègre obligatoirement :
- Méthodes KHEDIM BENYAKHLEF : Torin1/mTOR, PUMA/apoptose, nanoparticules
- Vaccin mRNA (Univ. Bath) : protocole moléculaire ciblant glycoprotéines Gn/Gc
- Anticorps monoclonaux neutralisants (méthode Schountz/Colorado State)
- CRISPR-Cas13 contre ARN viral segmenté (segments S, M, L)
- Bio-médecine naturelle : Quercétine, Zinc, IFN-alpha/beta
- Protocole urgence cas actifs : ECMO, ribavirine, soins intensifs
- Timeline : 6 mois → 18 mois → 3 ans
- Roadmap essais cliniques Phase I / II / III
Inclure séquences cibles Gn/Gc, mécanisme d'action, dosage estimatif.`;
    const result = await callGroq([{ role: 'user', content: prompt }], 2048);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/biomedicine
app.post('/api/biomedicine', async (req, res) => {
  try {
    const { query = '' } = req.body;
    const prompt = `Question bio-médecine : ${query}
Réponds en intégrant les travaux de KHEDIM BENYAKHLEF (apoptose, Torin1, PUMA, autophagie létale) et les avancées scientifiques 2026.`;
    const result = await callGroq([{ role: 'user', content: prompt }], 1500);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/chat — conversation multi-tours
app.post('/api/chat', async (req, res) => {
  try {
    const { history = [] } = req.body;
    // Valide le format : chaque message doit avoir role + content string
    const clean = history
      .filter(m => m && typeof m.role === 'string' && typeof m.content === 'string')
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 4000) }));

    if (clean.length === 0) {
      return res.status(400).json({ success: false, error: 'Historique de chat vide ou invalide.' });
    }

    const result = await callGroq(clean, 1500);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Catch-all SPA (Express 5 syntax)
app.get('/*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║  🧬 ANTIDOTE MISSION — WEB SERVICE DÉMARRÉ           ║
║  Fondé par KHEDIM BENYAKHLEF dit BENY-JOE            ║
║  Port    : ${String(PORT).padEnd(43)}║
║  Groq    : ${(GROQ_KEY ? '✓ CLÉ PRÉSENTE' : '✗ CLÉ MANQUANTE — ajoutez GROQ_API_KEY').padEnd(43)}║
║  Modèle  : ${GROQ_MODELS[0].padEnd(43)}║
║  Node    : ${process.version.padEnd(43)}║
╚══════════════════════════════════════════════════════╝
  `);
});
