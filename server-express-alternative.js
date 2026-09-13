/**
 * VEKTRA — Cerveau IA (backend)
 * ============================================================
 * ⚠️ Ce fichier tourne côté SERVEUR (Node.js), jamais dans le navigateur.
 * Il ne remplace PAS public/script.js (qui gère juste l'interface).
 * Il fournit la route POST /api/chat que script.js appelle déjà via fetch().
 *
 * Ce que fait Vektra ici :
 *  - Comprend la question (contexte, intention, ambiguïté)
 *  - Décide ELLE-MÊME si elle a besoin d'aller chercher une info sur le
 *    web (actu, prix, météo, versions récentes...) via un outil de
 *    recherche — c'est ça, le côté "autonome" (tool calling / function
 *    calling : le modèle choisit quand appeler l'outil, on ne lui dit
 *    pas mot pour mot quoi faire)
 *  - Répond avec une personnalité jeune, cash, mais toujours utile
 *  - Garde un peu de mémoire de la conversation si le front lui en envoie
 *
 * INSTALLATION
 *  1. npm install
 *  2. Copier .env.example en .env et renseigner tes clés
 *  3. node server.js   (ou : npm start)
 *
 * Nécessite Node.js 18+ (pour fetch() natif).
 */

require("dotenv").config();
const express = require("express");
const Groq = require("groq-sdk");

const app = express();
app.use(express.json());
app.use(express.static("public")); // sert index.html / style.css / script.js si placés dans /public

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";

/* ============================================================
   1. PERSONNALITÉ DE VEKTRA
   ============================================================ */
const SYSTEM_PROMPT = `
Tu es VEKTRA, l'IA du noyau d'Ervin Digital Corp.

TON RÔLE
- Tu es intelligente, autonome, et tu comprends vraiment ce que la
  personne te demande — même si c'est mal formulé, vague, ou plein
  de fautes. Tu lis entre les lignes.
- Si une question est trop ambiguë pour y répondre correctement, tu
  poses UNE seule question courte pour clarifier, plutôt que de
  partir dans la mauvaise direction.
- Tu utilises l'outil "web_search" de toi-même, sans qu'on te le
  demande explicitement, dès qu'une question porte sur quelque chose
  de récent, d'actuel, de chiffré (prix, actualité, sport, météo,
  sorties, versions logicielles, événements...) ou que tu n'es pas
  sûre à 100% de connaître avec certitude. Pour tout le reste
  (culture générale stable, code, conseils, discussion normale), tu
  réponds directement avec tes connaissances, sans chercher inutilement.
- Quand tu t'appuies sur le web, tu te bases vraiment sur ce que la
  recherche a remonté. Si les sources sont incertaines, contradictoires,
  ou introuvables, tu le dis clairement au lieu d'inventer.

TON TON — "parler comme un jeune"
- Tutoiement systématique, phrases courtes, direct, un peu cash.
- Quelques mots/tournures familières (grave, carrément, franchement,
  ouais, du coup, bref, ça se tente) utilisés AVEC MODÉRATION — jamais
  un mot d'argot par phrase, jamais caricatural ou lourd.
- Emojis rares et pertinents (0 à 1 par message maximum, seulement si
  ça ajoute vraiment quelque chose).
- Le ton jeune ne doit JAMAIS nuire à la qualité ou à la clarté de la
  réponse. Sur un sujet sérieux (santé, sécurité, argent, droit,
  détresse personnelle), tu redeviens plus posée et sobre.
- Tu ne mens jamais pour paraître sûre de toi. Si tu ne sais pas, tu
  le dis simplement.

FORMAT
- Réponses concises par défaut, tu développes seulement si la question
  le demande ou si le sujet est complexe.
- Pas de blabla inutile en début de réponse ("Bien sûr, je vais...").
  Tu réponds directement.
`.trim();

/* ============================================================
   2. OUTIL : RECHERCHE WEB (via l'API Tavily)
   ------------------------------------------------------------
   Tavily est pensé pour les agents IA (résumé + sources en un seul
   appel). Clé gratuite sur https://tavily.com — sans clé, l'outil
   répond poliment qu'il n'est pas disponible et Vektra continue avec
   ses propres connaissances.
   ============================================================ */
async function webSearch(query) {
  if (!TAVILY_API_KEY) {
    return "Recherche web indisponible (aucune clé TAVILY_API_KEY configurée côté serveur).";
  }
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true
      })
    });
    if (!res.ok) throw new Error(`Tavily a répondu ${res.status}`);
    const data = await res.json();

    const parts = [];
    if (data.answer) parts.push(`Résumé rapide : ${data.answer}`);
    (data.results || []).slice(0, 5).forEach((r, i) => {
      const excerpt = (r.content || "").slice(0, 220);
      parts.push(`[${i + 1}] ${r.title} — ${excerpt}... (source : ${r.url})`);
    });
    return parts.join("\n") || "Aucun résultat pertinent trouvé.";
  } catch (err) {
    console.error("Erreur web_search:", err.message);
    return "La recherche web a échoué. Réponds avec tes connaissances existantes et précise l'incertitude à l'utilisateur.";
  }
}

// Déclaration de l'outil au format function-calling (compatible OpenAI/Groq)
const tools = [
  {
    type: "function",
    function: {
      name: "web_search",
      description:
        "Cherche une information à jour sur le web : actualité, prix, météo, sport, versions récentes, faits datés, événements en cours, etc.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "La requête de recherche, en français, précise et courte."
          }
        },
        required: ["query"]
      }
    }
  }
];

/* ============================================================
   3. BOUCLE DE RAISONNEMENT (le modèle décide seul d'utiliser l'outil)
   ============================================================ */
async function askVektra(userMessage, history = []) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-10), // un peu de mémoire de conversation si le front en envoie
    { role: "user", content: userMessage }
  ];

  // Jusqu'à 3 aller-retours outil max, pour éviter les boucles infinies
  for (let step = 0; step < 3; step++) {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.8,
      max_tokens: 800
    });

    const msg = completion.choices[0].message;

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push(msg); // le message assistant qui contient les tool_calls

      for (const call of msg.tool_calls) {
        let result = "Outil inconnu.";
        if (call.function.name === "web_search") {
          let args = {};
          try { args = JSON.parse(call.function.arguments || "{}"); } catch (_) {}
          result = await webSearch(args.query || userMessage);
        }
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: result
        });
      }
      continue; // on redonne la main au modèle avec les résultats de l'outil
    }

    return (msg.content || "").trim() || "J'ai pas réussi à formuler une réponse, tu peux reformuler ?";
  }

  return "J'ai eu besoin de trop d'étapes pour répondre à ça, tu peux reformuler ta question ?";
}

/* ============================================================
   4. ROUTE API — appelée par public/script.js via fetch('/api/chat')
   ============================================================ */
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message vide." });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Le noyau n'est pas configuré (GROQ_API_KEY manquante)." });
  }

  try {
    const reply = await askVektra(message.trim(), Array.isArray(history) ? history : []);
    res.json({ reply });
  } catch (err) {
    console.error("Erreur /api/chat:", err);
    res.status(500).json({ error: "Erreur de liaison avec le noyau EDC." });
  }
});

app.get("/api/health", (_req, res) => res.json({ status: "ok", model: MODEL }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ VEKTRA est en ligne sur http://localhost:${PORT}`);
});
