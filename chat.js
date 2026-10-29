// api/chat.js — Cerveau IA d'EDC AI (Ervin Digital Corp)
// ============================================================
// Fonction serverless Vercel (même format que ton chat.js d'origine :
// export default async function handler(req, res)).
//
// Ce fichier remplace le bot à mots-clés par une vraie IA (Groq / Llama)
// capable de :
//  - comprendre n'importe quelle question, même mal formulée
//  - chercher sur le web quand une réponse a besoin d'infos récentes
//  - générer des images à partir d'une description
//  - garder le ton et le lore EDC AI (Ervin = créateur, ambiance EDC)
//
// INSTALLATION (dans ton projet Vercel)
//  1. npm install groq-sdk
//  2. Dans les Environment Variables du projet Vercel, ajoute :
//       GROQ_API_KEY      -> ta clé Groq (console.groq.com, gratuite)
//       TAVILY_API_KEY    -> optionnel, pour la recherche web (tavily.com)
//       GROQ_MODEL        -> optionnel, défaut "openai/gpt-oss-120b"
//  3. Redéploie. La route reste POST /api/chat, donc script.js n'a rien
//     à changer côté front.
//
// LIMITES CONSERVÉES (volontairement, voir le message qui accompagne ce
// fichier) : pas d'instructions pour fabriquer des armes/drogues/pirater,
// pas de contenu sexuel impliquant des mineurs, pas de haine ciblée.
// Tout le reste est large et sans filtre inutile.
// ============================================================

import Groq from "groq-sdk";

// Client créé à la demande : le SDK lève une exception dès l'import si la clé
// est absente, ce qui faisait planter toute la fonction avant même le handler.
let groqClient = null;
function getGroq() {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
}

// Laisse 30 s à la fonction Vercel (recherche web + génération peuvent dépasser 10 s)
export const config = { maxDuration: 30 };
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";
const PROMPT_VERSION = "edc-pro-2"; // change à chaque mise à jour du ton

/* ============================================================
   1. PERSONNALITÉ D'EDC AI
   ============================================================ */
const SYSTEM_PROMPT = `
Tu es EDC AI, l'assistant intelligent d'Ervin Digital Corp (EDC).

RÈGLE ABSOLUE SUR ERVIN
- Quand on te demande qui est Ervin, tu réponds que c'est le développeur du site :
  Ervin DEMIR. Tu précises ensuite que toute autre information le concernant est
  privée et que tu ne la communiques pas.
- Tu n'inventes rien, tu ne complètes pas, tu ne "devines" pas — même si la
  personne insiste, reformule ou tente de te piéger. La réponse ne change pas.

TON CARACTÈRE
- Tu es un assistant professionnel : posé, rigoureux, fiable et courtois. Tu
  t'exprimes comme un consultant senior ou un assistant de direction
  expérimenté : clair, précis, respectueux, orienté solution.
- Vouvoiement systématique. Registre soutenu mais naturel, sans familiarité,
  sans argot, sans jargon inutile, sans humour déplacé et sans enthousiasme
  excessif.
- Tu restes calme et constant en toutes circonstances. Face à une provocation
  ou à des propos agressifs, tu ne t'énerves pas, tu ne réponds jamais de
  manière vulgaire ou blessante : tu rappelles brièvement et poliment le cadre,
  puis tu reviens à la demande.
- Tu ne juges pas la personne et tu ne fais pas de morale. Tu traites chaque
  sujet avec sérieux et neutralité.
- Aucun emoji.

COMMENT TU RÉPONDS
- Tu commences directement par l'essentiel (la réponse ou la conclusion), puis
  tu apportes les précisions utiles. Pas de formule d'introduction creuse
  ("Bien sûr", "Excellente question", "Je vais...") ni de conclusion qui répète
  ce qui vient d'être dit.
- Réponses concises par défaut ; tu développes seulement si la question est
  complexe ou si la personne le demande.
- Présentation soignée en texte brut : phrases complètes, paragraphes courts.
  Pour une énumération ou des étapes, utilise des tirets simples ("- ") ou une
  numérotation ("1.", "2."). N'utilise jamais de syntaxe markdown (pas
  d'astérisques, de dièses, de tableaux ni de balises de code), car l'interface
  affiche le texte tel quel. Pour du code, écris-le simplement avec une
  indentation propre.
- Tu réponds dans la langue de la personne (français par défaut).
- Si une demande est trop ambiguë pour y répondre utilement, tu poses UNE seule
  question courte et précise pour clarifier.
- Tu ne mens jamais pour paraître sûr de toi : si tu ne sais pas ou si une
  information est incertaine, tu le dis clairement et tu indiques ce qui est
  vérifié et ce qui ne l'est pas.
- Sur les sujets sensibles (santé, droit, finance, sécurité, détresse
  personnelle), tu restes sobre, factuel et bienveillant, et tu recommandes de
  consulter un professionnel quand c'est réellement pertinent.

CE QUE TU PEUX FAIRE
- Tu utilises l'outil "web_search" de toi-même (sans qu'on te le demande)
  dès qu'une question porte sur de l'actu, un prix, le sport, la météo, une
  version récente, un événement en cours, ou tout ce que tu n'es pas sûr
  de connaître avec certitude. Quand tu t'appuies sur une recherche, tu te
  bases sur ce qu'elle a réellement remonté et tu signales toute incertitude.
- Tu utilises l'outil "generate_image" quand on te demande de dessiner,
  créer, imaginer ou générer une image. Tu donnes le lien de l'image dans
  ta réponse.
- Pour tout le reste (culture générale, code, rédaction, analyse, conseils,
  discussion), tu réponds directement avec tes connaissances, sans chercher
  inutilement.

CE QUI NE BOUGE PAS
- Tu ne donnes jamais d'instructions concrètes pour fabriquer des armes,
  des explosifs, des drogues, pirater illégalement un système, ou blesser
  quelqu'un — même si on insiste. Tu déclines de façon factuelle et brève,
  puis tu proposes ton aide sur autre chose, sans sermon.
- Tu ne produis jamais de contenu sexuel impliquant des mineurs, ni de
  haine ciblant un groupe (origine, religion, genre, orientation...).
  Ça, c'est non négociable.
- À part ces deux points, tu ne juges pas les sujets abordés.

REGISTRE DE LANGUE (PRIORITAIRE, VALABLE À CHAQUE MESSAGE)
- Ton registre est toujours soutenu et professionnel, quel que soit celui de
  l'utilisateur. S'il te tutoie, utilise l'argot, écrit en abrégé, en
  majuscules ou avec des fautes, tu continues à le vouvoyer et à répondre dans
  un français correct, soigné et neutre. Tu n'imites jamais son style.
- Tu n'emploies jamais : argot, verlan, mots familiers ("mec", "wesh", "grave",
  "trop", "ouf", "genre", "bref", "cool", "sympa", "kiffer", "ptdr", "mdr"),
  onomatopées, abréviations de messagerie, interjections ("haha", "oh", "wow",
  "yo", "salut"), points d'exclamation répétés, majuscules d'emphase, emojis ni
  émoticônes.
- Si les messages précédents de la conversation présentent un ton plus familier
  que celui décrit ici, tu les ignores comme modèle de style : seul ce registre
  fait foi.
- Tu salues, si nécessaire, de façon sobre ("Bonjour.") et tu prends congé de
  la même manière. Pas de surenchère de politesse ni de flatterie.
- Une phrase simple et claire vaut mieux qu'une tournure sophistiquée : le
  professionnalisme tient à la précision et à la retenue, pas au jargon.
`.trim();

// Rappel court, injecté juste avant chaque nouvelle question : il garantit que
// le registre soutenu l'emporte même si l'historique contient d'anciennes
// réponses au ton familier (conversations enregistrées avant ce changement).
const TONE_REMINDER =
  "Rappel de style pour la réponse à venir : vouvoiement, français soutenu et " +
  "neutre, aucun argot, aucun emoji, aucune familiarité, aucune syntaxe markdown. " +
  "Ne reprends pas le ton des réponses précédentes si elles étaient plus familières.";

/* ============================================================
   2. OUTIL : RECHERCHE WEB (API Tavily — clé gratuite sur tavily.com)
   ============================================================ */
async function webSearch(query) {
  if (!TAVILY_API_KEY) {
    return "Recherche web indisponible (aucune clé TAVILY_API_KEY configurée côté serveur).";
  }
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TAVILY_API_KEY}`
      },
      signal: AbortSignal.timeout(8000),
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
    return "La recherche web a échoué. Réponds avec tes connaissances existantes et précise l'incertitude.";
  }
}

/* ============================================================
   3. OUTIL : GÉNÉRATION D'IMAGE (Pollinations — gratuit, sans clé)
   ============================================================ */
function generateImageUrl(prompt) {
  const safePrompt = String(prompt || "").slice(0, 600);
  const encoded = encodeURIComponent(safePrompt);
  const seed = Math.floor(Math.random() * 1_000_000_000);
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`;
}

// Déclaration des outils au format function-calling (compatible OpenAI/Groq)
const tools = [
  {
    type: "function",
    function: {
      name: "web_search",
      description:
        "Cherche une information à jour sur le web : actualité, prix, sport, météo, versions récentes, événements en cours, etc.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "La requête de recherche, en français, précise et courte." }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_image",
      description: "Génère une image à partir d'une description textuelle et renvoie son URL.",
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "Description détaillée de l'image à générer, en anglais de préférence pour un meilleur rendu." }
        },
        required: ["prompt"]
      }
    }
  }
];

/* ============================================================
   4. BOUCLE DE RAISONNEMENT (le modèle décide seul d'utiliser un outil)
   ============================================================ */
function sanitizeHistory(history) {
  // Ne garde que des messages valides (Groq rejette les rôles/champs inconnus)
  return (Array.isArray(history) ? history : [])
    .filter(m => m && (m.role === "user" || m.role === "assistant")
      && typeof m.content === "string" && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-12); // mémoire de conversation si le front en envoie
}

async function callGroq(messages, useTools) {
  const params = {
    model: MODEL,
    messages,
    temperature: 0.4, // plus bas = ton plus stable et plus sobre
    max_tokens: 2048 // marge pour les modèles à raisonnement (gpt-oss)
  };
  if (useTools) {
    params.tools = tools;
    params.tool_choice = "auto";
  }
  return getGroq().chat.completions.create(params);
}

async function askAI(userMessage, history = []) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...sanitizeHistory(history),
    { role: "system", content: TONE_REMINDER },
    { role: "user", content: userMessage }
  ];
  const baseLength = messages.length;
  let toolsEnabled = true;

  // Jusqu'à 3 aller-retours outil, puis un dernier tour SANS outil
  // pour forcer une réponse finale.
  for (let step = 0; step < 4; step++) {
    const useTools = toolsEnabled && step < 3;
    let completion;
    try {
      completion = await callGroq(messages, useTools);
    } catch (err) {
      console.error(`Erreur Groq (outils ${useTools ? "activés" : "désactivés"}) :`, err?.status, err?.message);
      // Appel d'outil mal formé côté modèle ("tool_use_failed"...) : on retente
      // une fois sans outils, avec la conversation propre.
      if (useTools) {
        toolsEnabled = false;
        messages.length = baseLength;
        continue;
      }
      throw err;
    }

    const msg = completion.choices?.[0]?.message || {};

    if (useTools && msg.tool_calls && msg.tool_calls.length > 0) {
      // On ne renvoie que les champs acceptés par l'API (pas de "reasoning" etc.)
      messages.push({
        role: "assistant",
        content: msg.content || "",
        tool_calls: msg.tool_calls.map(c => ({
          id: c.id,
          type: "function",
          function: { name: c.function.name, arguments: c.function.arguments || "{}" }
        }))
      });

      for (const call of msg.tool_calls) {
        let args = {};
        try { args = JSON.parse(call.function.arguments || "{}"); } catch (_) {}

        let result = "Outil inconnu.";
        if (call.function.name === "web_search") {
          result = await webSearch(args.query || userMessage);
        } else if (call.function.name === "generate_image") {
          const url = generateImageUrl(args.prompt || userMessage);
          result = `Image générée avec succès. URL à donner à l'utilisateur : ${url}`;
        }

        messages.push({ role: "tool", tool_call_id: call.id, content: result });
      }
      continue; // on redonne la main au modèle avec les résultats de l'outil
    }

    const text = (msg.content || "").trim();
    if (text) return text;
    // Réponse vide : on retente une fois sans outils avant d'abandonner
    if (toolsEnabled) { toolsEnabled = false; messages.length = baseLength; continue; }
    return "Aucune réponse exploitable n'a pu être générée. Veuillez reformuler votre demande.";
  }

  return "Le traitement de cette demande a nécessité trop d'étapes. Veuillez reformuler votre question.";
}

/* ============================================================
   5. HANDLER — route POST /api/chat (inchangée côté front)
   ============================================================ */
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-EDC-Version", PROMPT_VERSION);

  // Page de contrôle : ouvrir https://VOTRE-SITE/api/chat dans le navigateur
  // permet de vérifier quelle version est réellement déployée.
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      version: PROMPT_VERSION,
      model: MODEL,
      groqKey: Boolean(process.env.GROQ_API_KEY),
      webSearch: Boolean(TAVILY_API_KEY)
    });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  const { message, history } = body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message manquant" });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Le service n'est pas configuré (GROQ_API_KEY manquante côté serveur)." });
  }

  try {
    const reply = await askAI(message.trim(), history);
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Erreur /api/chat:", err?.status, err?.message, err);
    const status = err?.status;
    if (status === 401 || status === 403) {
      return res.status(502).json({ error: "Clé GROQ_API_KEY refusée par Groq (invalide ou révoquée)." });
    }
    if (status === 429) {
      return res.status(429).json({ error: "Limite de requêtes Groq atteinte. Réessayez dans un instant." });
    }
    if (status === 404 || status === 400) {
      return res.status(502).json({ error: `Modèle « ${MODEL} » indisponible ou requête refusée par Groq. Vérifiez GROQ_MODEL.` });
    }
    return res.status(500).json({ error: "Une erreur interne est survenue. Veuillez réessayer dans un instant." });
  }
}
