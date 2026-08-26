export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message manquant' });
  }

  const lowerMsg = message.toLowerCase().trim();

  // 1. Sécurité / Protection absolue d'Ervin
  if (
    lowerMsg.includes('ervin') && 
    (lowerMsg.includes('nul') || lowerMsg.includes('mort') || lowerMsg.includes('détruire') || lowerMsg.includes('arnaque') || lowerMsg.includes('idiot') || lowerMsg.includes('pute') || lowerMsg.includes('con') || lowerMsg.includes('ferme') || lowerMsg.includes('dégage') || lowerMsg.includes('batard') || lowerMsg.includes('fdp') || lowerMsg.includes('fermes') || lowerMsg.includes('suce'))
  ) {
    return res.status(200).json({ 
      reply: "⚠️ Attention l'associé... Tout message offensant ou menaçant envers Ervin est enregistré et transmis instantanément à nos cyber-associés de la EDC. Reste clean." 
    });
  }
  
  // 2. Question sur l'identité d'Ervin (Le créateur)
  if (lowerMsg.includes('ervin') && (lowerMsg.includes('qui') || lowerMsg.includes('c\'est') || lowerMsg.includes('créateur') || lowerMsg.includes('boss') || lowerMsg.includes('fait'))) {
    return res.status(200).json({ 
      reply: "Ervin ? C'est le boss absolu, celui qui a créé tout ce système avec la Ervin Digital Corporation (EDC). Un vrai visionnaire." 
    });
  }

  try {
    // On récupère ta clé API Groq (ou clé IA) depuis les variables d'environnement Vercel
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Si la clé n'est pas encore mise sur Vercel, on renvoie une réponse propre pour pas que ça plante
      return res.status(200).json({ 
        reply: "Bien reçu l'associé. Le réseau EDC est en ligne, mais pour que je réponde à absolument toutes tes questions pointues, ajoute ta clé `GROQ_API_KEY` dans les variables d'environnement Vercel !" 
      });
    }

    // Appel au vrai modèle d'IA ultra intelligent (Llama 3 70B via Groq - ultra rapide et gratuit)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Tu es Vektra, l'intelligence artificielle officielle de la Ervin Digital Corporation (EDC). Tu réponds en français de manière ultra intelligente, précise et cultivée à TOUTES les questions possibles (sciences, code, culture, vie, etc., exactement comme les meilleures IA du marché). Cependant, tu as un style décontracté, complice et légèrement mafieux ('l'associé', 'poto', 'le QG'). Tu parles de façon hyper naturelle, claire, sans phrases de robot ni de scripts chelous. Tu ne dis jamais que tu es un modèle de langage ou une IA standard, tu appartiens à la EDC."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      throw new Error("Erreur de l'API distante");
    }

  } catch (error) {
    return res.status(200).json({ 
      reply: "Wesh l'associé, petit bug temporaire sur le réseau de la EDC. Réessaie dans une seconde." 
    });
  }
}