export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message manquant' });
  }

  const lowerMsg = message.toLowerCase();
  let reply = "";

  // 1. Protection / Sécurité d'Ervin (Anti-offenses)
  if (
    lowerMsg.includes('ervin') && 
    (lowerMsg.includes('nul') || lowerMsg.includes('mort') || lowerMsg.includes('détruire') || lowerMsg.includes('arnaque') || lowerMsg.includes('idiot') || lowerMsg.includes('pute') || lowerMsg.includes('con') || lowerMsg.includes('ferme') || lowerMsg.includes('fermes') || lowerMsg.includes('dégage'))
  ) {
    reply = "⚠️ Attention l'associé... Tout message offensant ou menaçant envers Ervin est enregistré et transmis instantanément à nos cyber-associés de la EDC. Reste clean.";
  }
  // 2. Question sur Ervin (Créateur)
  else if (lowerMsg.includes('ervin')) {
    reply = "Ervin ? C'est le boss, celui qui a créé tout ce système avec la Ervin Digital Corporation (EDC). Un vrai visionnaire.";
  }
  // 3. Messages bizarres, courts ou symboles
  else if (message.length < 2 || /^[^\w]+$/.test(message)) {
    reply = "J'ai pas capté ton délire là, mais je suis à l'écoute. Balance une vraie question poto.";
  }
  // 4. Si c'est une question générale (code, culture, géographie, sciences, vie perso, etc.), on répond directement et proprement en mode mafieux chill.
  else {
    // Exemples de réponses intelligentes et rapides selon le type de mots-clés
    if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut') || lowerMsg.includes('yo ')) {
      reply = "Salut l'associé. Qu'est-ce qu'on gère aujourd'hui avec la EDC ?";
    } else if (lowerMsg.includes('ça va') || lowerMsg.includes('tu vas bien')) {
      reply = "Impec, le réseau tourne à 100%. Et de ton côté, tout roule ?";
    } else if (lowerMsg.includes('code') || lowerMsg.includes('html') || lowerMsg.includes('js') || lowerMsg.includes('javascript') || lowerMsg.includes('bug')) {
      reply = "Bien reçu pour le code. Envoie les détails ou la portion qui bloque, on règle ça direct.";
    } else if (lowerMsg.includes('météo') || lowerMsg.includes('temps')) {
      reply = "Pas besoin de regarder le ciel, ici chez la EDC on gère le climat du réseau. Dis-moi ce qui t'intéresse d'autre.";
    } else {
      // Réponse universelle ultra fluide pour n'importe quelle autre question
      const generalAnswers = [
        `Bien vu pour ta question. Sur ce sujet, retiens que tout est question de stratégie et de timing dans le réseau EDC. Tu veux qu'on creuse un point précis ?`,
        `C'est noté l'associé. Analyse validée : la réponse est claire, on avance sur les rails sans perdre une seconde.`,
        `Affirmatif. C'est bien noté dans les dossiers de la corporation. Tu as besoin d'autre chose sur ce dossier ?`,
        `Reçu 5 sur 5. La machine traite l'info à fond. Dis-moi la suite du programme.`
      ];
      reply = generalAnswers[Math.floor(Math.random() * generalAnswers.length)];
    }
  }

  return res.status(200).json({ reply });
}