export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message manquant' });
  }

  const lowerMsg = message.toLowerCase().trim();
  let reply = "";

  // 1. Sécurité / Protection absolue d'Ervin
  if (
    lowerMsg.includes('ervin') && 
    (lowerMsg.includes('nul') || lowerMsg.includes('mort') || lowerMsg.includes('détruire') || lowerMsg.includes('arnaque') || lowerMsg.includes('idiot') || lowerMsg.includes('pute') || lowerMsg.includes('con') || lowerMsg.includes('ferme') || lowerMsg.includes('dégage') || lowerMsg.includes('batard') || lowerMsg.includes('fdp') || lowerMsg.includes('fermes') || lowerMsg.includes('suce'))
  ) {
    reply = "⚠️ Attention l'associé... Tout message offensant ou menaçant envers Ervin est enregistré et transmis instantanément à nos cyber-associés de la EDC. Reste clean.";
  }
  // 2. Question sur l'identité d'Ervin
  else if (lowerMsg.includes('ervin') && (lowerMsg.includes('qui') || lowerMsg.includes('c\'est') || lowerMsg.includes('créateur') || lowerMsg.includes('boss') || lowerMsg.includes('fait'))) {
    reply = "Ervin ? C'est le boss absolu, celui qui a créé tout ce système avec la Ervin Digital Corporation (EDC). Un vrai visionnaire.";
  }
  // 3. Salutations et civilités naturelles
  else if (['salut', 'bonjour', 'yo', 'slt', 'coucou', 'hey'].some(w => lowerMsg === w || lowerMsg.startsWith(w + ' '))) {
    reply = "Wesh l'associé ! Bien ou bien ? Le QG de la EDC tourne à plein régime, qu'est-ce qu'on gère aujourd'hui ?";
  }
  else if (['ça va', 'ca va', 'tu vas bien', 'cv', 'et toi'].some(w => lowerMsg.includes(w))) {
    reply = "Impec poto, les serveurs chauffent et le réseau est ultra stable. Et de ton côté, tout roule ?";
  }
  // 4. Questions sur l'IA / Vektra / EDC
  else if (lowerMsg.includes('vektra') || lowerMsg.includes('ia') || lowerMsg.includes('bot')) {
    reply = "Je suis Vektra, l'intelligence officielle de la EDC. Je sécurise le réseau et je réponds à tes ordres au quart de tour.";
  }
  // 5. Code, informatique, technique
  else if (lowerMsg.includes('code') || lowerMsg.includes('bug') || lowerMsg.includes('html') || lowerMsg.includes('js') || lowerMsg.includes('javascript') || lowerMsg.includes('css') || lowerMsg.includes('erreur')) {
    reply = "Envoie les détails de ton code ou la zone qui merde, on va régler ça au millimètre sans perdre une seconde.";
  }
  // 6. Géo / Culture générale (Paris, France, etc.)
  else if (lowerMsg.includes('paris')) {
    reply = "Paris c'est la capitale de la France, un grand classique. Mais nous, le vrai centre névralgique, c'est ici chez la EDC.";
  }
  else if (lowerMsg.includes('france')) {
    reply = "La France, c'est le terrain de jeu principal de la EDC, en totale conformité avec les règles du réseau.";
  }
  // 7. Vraies réponses intelligentes et variées pour TOUT le reste (fini les phrases robotiques !)
  else {
    const smartAnswers = [
      "Entre nous l'associé, c'est un sujet qu'il faut analyser avec de la méthode. Dans la EDC, on aime quand c'est carré. Tu veux qu'on creuse un point précis ?",
      "Bien vu. C'est une question intéressante, et dans notre réseau, on laisse rien au hasard. Dis-moi ce t'as en tête exactement.",
      "Affirmatif. C'est un dossier qu'on maîtrise. La machine traite l'info, balance la suite si t'as besoin de details.",
      "C'est noté l'associé. Sur ce plan-là, la stratégie de la EDC est claire : on avance droit au but. Tu veux qu'on mette ça en application ?",
      "J'ai la vision globale sur ton truc. C'est du solide, on gère ça propre. Qu'est-ce tu veux savoir de plus ?"
    ];
    // On prend une réponse au hasard pour que ça fasse ultra naturel
    reply = smartAnswers[Math.floor(Math.random() * smartAnswers.length)];
  }

  return res.status(200).json({ reply });
}