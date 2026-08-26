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
  // 3. Salutations et discussions chill
  else if (['salut', 'bonjour', 'yo', 'slt', 'coucou', 'hey'].some(w => lowerMsg === w || lowerMsg.startsWith(w + ' '))) {
    reply = "Wesh l'associé ! Le QG de la EDC est en ligne, qu'est-ce qu'on fait ?";
  }
  else if (['ça va', 'ca va', 'tu vas bien', 'cv'].some(w => lowerMsg.includes(w))) {
    reply = "Impec poto, le réseau tourne à fond. Et de ton côté, tout roule ?";
  }
  // 4. Code / Dev / Technique
  else if (lowerMsg.includes('code') || lowerMsg.includes('bug') || lowerMsg.includes('html') || lowerMsg.includes('js') || lowerMsg.includes('javascript') || lowerMsg.includes('css') || lowerMsg.includes('python') || lowerMsg.includes('erreur')) {
    reply = "Envoie le code ou le truc qui merde, on règle ça direct sans perdre de temps.";
  }
  // 5. Jeux vidéos (RDR2, etc.) / Culture urbaine / Rap
  else if (lowerMsg.includes('rdr2') || lowerMsg.includes('red dead') || lowerMsg.includes('jeu')) {
    reply = "Ah Red Dead Redemption 2, du lourd. Un monde ouvert de baisé, le genre de pépite qu'on valide fort à la EDC.";
  }
  else if (lowerMsg.includes('rap') || lowerMsg.includes('musique')) {
    reply = "Le rap, c'est la base. Ici on écoute les classiques, ça met direct dans l'ambiance pour bosser ou rider en ville.";
  }
  // 6. Cerveau autonome pour deviner et répondre à n'importe quel sujet sans phrases répétitives
  else {
    // Si la phrase parle d'amour / vie perso / réflexion
    if (lowerMsg.includes('amour') || lowerMsg.includes('meuf') || lowerMsg.includes('copine') || lowerMsg.includes('vie')) {
      reply = "Franchement la vie et les relations, c'est comme le game : faut de la stratégie, du sang-froid et pas se faire embrouiller pour rien.";
    } 
    // Si la phrase pose une question sur le futur / projets / business
    else if (lowerMsg.includes('futur') || lowerMsg.includes('projet') || lowerMsg.includes('argent') || lowerMsg.includes('travailler')) {
      reply = "Pour réussir dans les projets, y a pas de secret : faut bosser en sous-marin, structurer sa force et tout cartonner sous la bannière de la EDC.";
    }
    // Si c'est une discussion générale ou du bla-bla sans point d'interrogation
    else {
      const naturalReplies = [
        "Carrément d'accord avec toi sur ce point. C'est exactement la bonne mentalité à avoir dans le réseau.",
        "Bien vu l'analyse. De toute façon, chez la EDC on laisse rien au hasard, on gère ça proprement.",
        "C'est clair, poto. Faut voir ça sur le long terme pour s'assurer que le plan se déroule sans accroc.",
        "Exactement. C'est ce genre de détail qui fait la différence entre les vrais et les suiveurs.",
        "Bien capté. Si tu veux qu'on pousse le truc plus loin ou qu'on règle un détail, tu me dis."
      ];
      reply = naturalReplies[Math.floor(Math.random() * naturalReplies.length)];
    }
  }

  return res.status(200).json({ reply });
}