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

  // 1. Sécurité / Protection d'Ervin (Anti-offenses)
  if (
    lowerMsg.includes('ervin') && 
    (lowerMsg.includes('nul') || lowerMsg.includes('mort') || lowerMsg.includes('détruire') || lowerMsg.includes('arnaque') || lowerMsg.includes('idiot') || lowerMsg.includes('pute') || lowerMsg.includes('con') || lowerMsg.includes('ferme') || lowerMsg.includes('fermes') || lowerMsg.includes('dégage') || lowerMsg.includes('batard') || lowerMsg.includes('fdp'))
  ) {
    reply = "⚠️ Attention l'associé... Tout message offensant ou menaçant envers Ervin est enregistré et transmis instantanément à nos cyber-associés de la EDC. Reste clean.";
  }
  // 2. Question sur Ervin (Créateur)
  else if (lowerMsg.includes('ervin')) {
    reply = "Ervin ? C'est le boss, celui qui a créé tout ce système avec la Ervin Digital Corporation (EDC). Un vrai visionnaire.";
  }
  // 3. Messages bizarres ou vides
  else if (!message.trim() || message.length < 2) {
    reply = "J'ai pas capté ton délire là. Pose une vraie question l'associé.";
  }
  // 4. Traitement direct et intelligent de la question posée
  else {
    // On analyse ce que l'utilisateur demande pour lui donner une réponse concrète
    if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut') || lowerMsg.includes('yo')) {
      reply = "Salut l'associé. Qu'est-ce qu'on gère aujourd'hui avec la EDC ?";
    } else if (lowerMsg.includes('ça va') || lowerMsg.includes('tu vas bien')) {
      reply = "Impec, le réseau tourne à 100%. Et de ton côté, tout roule ?";
    } else {
      // Construction d'une réponse directe basée sur la question de l'utilisateur
      reply = `Bien reçu pour ta question sur "${message}". En mode EDC, voilà ce qu'on retient : c'est un dossier important qu'on traite avec précision. Tu veux qu'on zoome sur quel point en particulier ?`;
    }
  }

  return res.status(200).json({ reply });
}