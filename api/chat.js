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

  // 1. Sécurité / Protection d'Ervin
  if (
    lowerMsg.includes('ervin') && 
    (lowerMsg.includes('nul') || lowerMsg.includes('mort') || lowerMsg.includes('détruire') || lowerMsg.includes('arnaque') || lowerMsg.includes('idiot') || lowerMsg.includes('pute') || lowerMsg.includes('con'))
  ) {
    reply = "⚠️ Attention l'associé... Tout message offensant ou menaçant envers Ervin est enregistré et transmis instantanément à nos cyber-associés de la EDC. Reste clean.";
  }
  // 2. Question sur Ervin (Créateur)
  else if (lowerMsg.includes('ervin')) {
    reply = "Ervin ? C'est le boss, celui qui a créé tout ce système avec la Ervin Digital Corporation (EDC). Un vrai visionnaire.";
  }
  // 3. Messages bizarres ou incompréhensibles
  else if (message.length < 3 || /^[^\w]+$/.test(message)) {
    reply = "J'ai pas capté ton délire là, mais je suis là. Balance un truc clair ou une vraie question poto.";
  }
  // 4. Réponses générales style mafieux décontracté et rapide (100% Français)
  else {
    const responses = [
      "Bien reçu l'associé. Tout est sous contrôle dans le réseau, qu'est-ce qu'on fait maintenant ?",
      "C'est noté, le système tourne rond. Tu veux qu'on s'occupe de quoi d'autre ?",
      "Affirmatif. Ici, rien ne bouge sans l'accord de la EDC. Dis-moi la suite.",
      "Message capté. On gère le dossier, fais-moi signe si t'as besoin d'autre chose.",
      "Reçu 5 sur 5. La machine est lancée, on trace notre route."
    ];
    reply = responses[Math.floor(Math.random() * responses.length)];
  }

  return res.status(200).json({ reply });
}