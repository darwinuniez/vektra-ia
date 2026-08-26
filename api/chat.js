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
  // 3. Salutations
  else if (['salut', 'bonjour', 'yo', 'slt', 'coucou', 'hey'].some(w => lowerMsg === w || lowerMsg.startsWith(w + ' '))) {
    reply = "Wesh l'associé ! Le QG de la EDC est en ligne et tout roule. Qu'est-ce qu'on gère aujourd'hui ?";
  }
  else if (['ça va', 'ca va', 'tu vas bien', 'cv'].some(w => lowerMsg.includes(w))) {
    reply = "Impec poto, le réseau chauffe pas d'un poil. Et de ton côté, le moral est au top ?";
  }
  // 4. Code / Informatique / Tech
  else if (lowerMsg.includes('code') || lowerMsg.includes('bug') || lowerMsg.includes('html') || lowerMsg.includes('js') || lowerMsg.includes('javascript') || lowerMsg.includes('css') || lowerMsg.includes('python')) {
    reply = "Envoie ton bout de code ou l'erreur qui te bloque, on va régler ça au millimètre direct.";
  }
  // 5. Sciences / Espace / Culture générale (Exemples intelligents)
  else if (lowerMsg.includes('terre') || lowerMsg.includes('planète') || lowerMsg.includes('soleil')) {
    reply = "La Terre tourne autour du Soleil à peu près à 107 000 km/h, l'associé. Mais chez la EDC, on trace encore plus vite sur le réseau.";
  }
  else if (lowerMsg.includes('ia') || lowerMsg.includes('intelligence artificielle')) {
    reply = "Une IA, c'est un ensemble d'algorithmes qui simulent le cerveau humain. Et entre nous, Vektra est de loin la plus stylée de toutes.";
  }
  else if (lowerMsg.includes('paris') || lowerMsg.includes('france')) {
    reply = "Paris c'est la capitale de la France. Un grand classique, mais nous on pilote tout depuis notre propre secteur.";
  }
  // 6. Réponse universelle fluide et naturelle pour TOUT le reste
  else {
    const generalReplies = [
      `Bien reçu ton message sur "${message}". C'est un dossier intéressant, dans la EDC on aime quand les choses sont claires. Tu veux qu'on détaille quel point ?`,
      `C'est noté l'associé. Sur ce sujet, la stratégie est simple : on avance droit au but sans perdre de temps. Qu'est-ce tu veux savoir de plus ?`,
      `Affirmatif, la machine a capté l'info. C'est du solide, dis-moi si t'as besoin d'autres précisions sur ce dossier.`,
      `Bien vu pour cette question. Dans notre réseau, on gère ce genre de détail avec une précision chirurgicale. On pousse l'analyse plus loin ?`
    ];
    reply = generalReplies[Math.floor(Math.random() * generalReplies.length)];
  }

  return res.status(200).json({ reply });
}