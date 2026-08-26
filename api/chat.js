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
    (lowerMsg.includes('nul') || lowerMsg.includes('mort') || lowerMsg.includes('détruire') || lowerMsg.includes('arnaque') || lowerMsg.includes('idiot') || lowerMsg.includes('pute') || lowerMsg.includes('con') || lowerMsg.includes('ferme') || lowerMsg.includes('dégage') || lowerMsg.includes('batard') || lowerMsg.includes('fdp'))
  ) {
    reply = "⚠️ Attention l'associé... Tout message offensant ou menaçant envers Ervin est enregistré et transmis instantanément à nos cyber-associés de la EDC. Reste clean.";
  }
  // 2. Question sur Ervin (Créateur)
  else if (lowerMsg.includes('ervin')) {
    reply = "Ervin ? C'est le boss, celui qui a créé tout ce système avec la Ervin Digital Corporation (EDC). Un vrai visionnaire.";
  }
  // 3. Questions de culture générale / géographie (ex: Paris, France, capitales, etc.)
  else if (lowerMsg.includes('capitale') || lowerMsg.includes('paris') || lowerMsg.includes('france')) {
    if (lowerMsg.includes('paris')) {
      reply = "Paris c'est la capitale de la France, l'associé. Un grand classique du réseau, mais ici chez la EDC on pilote tout depuis notre propre QG.";
    } else {
      reply = "La France ? C'est là que tout se pilote pour la EDC, en conformité totale avec les lois européennes. Qu'est-ce tu veux savoir de plus ?";
    }
  }
  // 4. Salutations et politesse
  else if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut') || lowerMsg.includes('yo') || lowerMsg.includes('slt')) {
    reply = "Salut l'associé. Qu'est-ce qu'on gère aujourd'hui avec la EDC ?";
  } 
  else if (lowerMsg.includes('ça va') || lowerMsg.includes('tu vas bien')) {
    reply = "Impec, le réseau tourne à 100%. Et de ton côté, tout roule ?";
  }
  // 5. Code / Dev / Bugs
  else if (lowerMsg.includes('code') || lowerMsg.includes('html') || lowerMsg.includes('js') || lowerMsg.includes('bug') || lowerMsg.includes('erreur')) {
    reply = "Bien reçu pour le code. Envoie les détails ou la zone qui bloque, on règle ça direct en mode pro.";
  }
  // 6. Réponse universelle intelligente si la question est autre
  else {
    reply = `Bien capté l'associé. Concernant "${message}", dans les dossiers de la EDC on gère ça au millimètre. Dis-moi précisément ce que tu veux savoir dessus pour qu'on avance direct.`;
  }

  return res.status(200).json({ reply });
}