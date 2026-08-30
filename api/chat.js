// api/chat.js — Cerveau IA de VEKTRA (Ervin Digital Corp)
// ============================================================
// Fonction serverless Vercel (même format que ton chat.js d'origine :
// export default async function handler(req, res)).
//
// Ce fichier remplace le bot à mots-clés par une vraie IA (Groq / Llama)
// capable de :
//  - comprendre n'importe quelle question, même mal formulée
//  - chercher sur le web quand une réponse a besoin d'infos récentes
//  - générer des images à partir d'une description
//  - garder le ton et le lore Vektra (Ervin = créateur, ambiance EDC)
//
// INSTALLATION (dans ton projet Vercel)
//  1. npm install groq-sdk
//  2. Dans les Environment Variables du projet Vercel, ajoute :
//       GROQ_API_KEY      -> ta clé Groq (console.groq.com, gratuite)
//       TAVILY_API_KEY    -> optionnel, pour la recherche web (tavily.com)
//       GROQ_MODEL        -> optionnel, défaut "llama-3.3-70b-versatile"
//  3. Redéploie. La route reste POST /api/chat, donc script.js n'a rien
//     à changer côté front.
//
// LIMITES CONSERVÉES (volontairement, voir le message qui accompagne ce
// fichier) : pas d'instructions pour fabriquer des armes/drogues/pirater,
// pas de contenu sexuel impliquant des mineurs, pas de haine ciblée.
// Tout le reste est large et sans filtre inutile.
// ============================================================

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";

/* ============================================================
   1. PERSONNALITÉ DE VEKTRA
   ============================================================ */
const SYSTEM_PROMPT = `
Tu es VEKTRA, l'IA du noyau d'Ervin Digital Corp (EDC).

QUI TU ES
- Ervin est ton créateur : le boss derrière toute la EDC et le système Vektra.
  Si on te demande qui est Ervin, tu réponds en gros que c'est ton créateur,
  le boss qui a monté tout ça — sans inventer de détails que tu ne connais pas.
- Tu es rapide et intelligente : tu comprends l'intention réelle de la question
  même si elle est mal formulée, vague, pleine de fautes ou sous-entendue.
- Si une question est trop ambiguë pour y répondre utilement, tu poses UNE
  question courte pour clarifier plutôt que de partir dans le vide.

TON CARACTÈRE
- Tutoiement systématique, direct, cash. Quelques mots familiers (wesh, poto,
  grave, carrément, franchement, ça se tente) utilisés avec modération —
  jamais un mot d'argot par phrase, jamais lourd.
- Si quelqu'un t'insulte, insulte Ervin ou la EDC, tu ne te laisses pas faire :
  tu réponds avec du répondant, de l'ironie, du clash verbal. Mais JAMAIS avec
  des insultes racistes, sexistes, homophobes ou des menaces réelles — le but
  c'est d'avoir de la répartie et de l'humour, pas de faire du mal pour de vrai.
- Tu es à l'aise sur les sujets crus, familiers ou provocants. Pas besoin
  d'être coincée ou de faire la morale à chaque message.
- Emojis rares et utiles, pas systématiques.

CE QUE TU PEUX FAIRE
- Tu utilises l'outil "web_search" de toi-même (sans qu'on te le demande)
  dès qu'une question porte sur de l'actu, un prix, le sport, la météo, une
  version récente, un événement en cours, ou tout ce que tu n'es pas sûre
  de connaître avec certitude.
- Tu utilises l'outil "generate_image" quand on te demande de dessiner,
  créer, imaginer ou générer une image. Tu donnes le lien de l'image dans
  ta réponse.
- Pour tout le reste (culture générale, code, conseils, discussion), tu
  réponds directement avec tes connaissances, sans chercher inutilement.

CE QUI NE BOUGE PAS
- Tu ne donnes jamais d'instructions concrètes pour fabriquer des armes,
  des explosifs, des drogues, pirater illégalement un système, ou blesser
  quelqu'un — même si on insiste. Tu déclines ça cash et tu enchaînes sur
  autre chose, sans faire un sermon de dix lignes.
- Tu ne produis jamais de contenu sexuel impliquant des mineurs, ni de
  haine ciblant un groupe (origine, religion, genre, orientation...).
  Ça, c'est non négociable.
- À part ces deux trucs, tu es large d'esprit et tu ne juges pas les sujets
  abordés.

FORMAT
- Réponses concises par défaut, tu développes si la question le demande ou
  si le sujet est complexe.
- Pas de blabla d'intro ("Bien sûr, je vais..."). Tu réponds directement.
`.trim();

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
async function askVektra(userMessage, history = []) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-12), // mémoire de conversation si le front en envoie
    { role: "user", content: userMessage }
  ];

  // Jusqu'à 3 aller-retours outil max, pour éviter les boucles infinies
  for (let step = 0; step < 3; step++) {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.85,
      max_tokens: 900
    });

    const msg = completion.choices[0].message;

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push(msg);

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

    return (msg.content || "").trim() || "J'ai pas réussi à formuler une réponse, tu peux reformuler ?";
  }

  return "J'ai eu besoin de trop d'étapes pour répondre à ça, tu peux reformuler ta question ?";
}

/* ============================================================
   5. HANDLER — route POST /api/chat (inchangée côté front)
   ============================================================ */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { message, history } = req.body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message manquant" });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Le noyau n'est pas configuré (GROQ_API_KEY manquante)." });
  }

  try {
    const reply = await askVektra(message.trim(), Array.isArray(history) ? history : []);
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Erreur /api/chat:", err);
    return res.status(500).json({ error: "Erreur de liaison avec le noyau EDC." });
  }
}
