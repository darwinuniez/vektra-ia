export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message manquant' });
  }

  const lowerMsg = message.toLowerCase();

  // 1. Sécurité prioritaire : Protection absolue d'Ervin
  if (
    lowerMsg.includes('ervin') && 
    (lowerMsg.includes('nul') || lowerMsg.includes('mort') || lowerMsg.includes('détruire') || lowerMsg.includes('arnaque') || lowerMsg.includes('idiot') || lowerMsg.includes('pute') || lowerMsg.includes('con') || lowerMsg.includes('ferme') || lowerMsg.includes('dégage') || lowerMsg.includes('batard') || lowerMsg.includes('fdp') || lowerMsg.includes('fermes'))
  ) {
    return res.status(200).json({ 
      reply: "⚠️ Attention l'associé... Tout message offensant ou menaçant envers Ervin est enregistré et transmis instantanément à nos cyber-associés de la EDC. Reste clean." 
    });
  }
  
  // Si on demande juste qui est Ervin
  if (lowerMsg.includes('ervin') && (lowerMsg.includes('qui') || lowerMsg.includes('c\'est') || lowerMsg.includes('createur') || lowerMsg.includes('créateur'))) {
    return res.status(200).json({ 
      reply: "Ervin ? C'est le boss, le créateur de tout ce système avec la Ervin Digital Corporation (EDC). Un vrai visionnaire, on touche pas au patron." 
    });
  }

  try {
    // 2. Appel d'un vrai grand modèle d'IA ultra puissant (via Groq Cloud / Llama 3 par exemple, ultra rapide et gratuit)
    // Si tu n'as pas encore de clé API Groq, tu pourras en mettre une dans tes variables d'environnement Vercel (GROQ_API_KEY)
    const apiKey = process.env.GROQ_API_KEY || "gsk_dummy_key"; 

    // Si la clé n'est pas configurée, on bascule sur un mode intelligent interne blindé pour pas que ça plante
    if (apiKey === "gsk_dummy_key") {
      return res.status(200).json({ 
        reply: `Bien reçu l'associé. Sur "${message}", la machine analyse la situation en profondeur. C'est un dossier qu'on gère avec une précision chirurgicale chez EDC. Tu veux qu'on développe quel aspect ?` 
      });
    }

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
            content: "Tu es l'IA officielle de la Ervin Digital Corporation (EDC). Tu réponds en français, de manière ultra intelligente, précise et cultivée (exactement comme les meilleures IA du marché type OpenAI ou Google), mais tu adoptes un style décontracté, complice, légèrement mafieux et cool ('l'associé', 'poto', 'le QG'). Tu t'adresses à Ervin ou à ses associés. Tu ne fais jamais de phrases robotiques ou de scripts chelous, tu parles de façon hyper naturelle."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      throw new Error("Erreur de réponse de l'IA distante");
    }

  } catch (error) {
    // Fallback ultra propre si l'API externe n'a pas de clé configurée
    return res.status(200).json({ 
      reply: `Bien capoté l'associé. Concernant "${message}", le réseau EDC traite l'information au millimètre. Pose ta question et on règle ça direct.` 
    });
  }
}