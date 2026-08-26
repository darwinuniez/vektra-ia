const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { message } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé GEMINI_API_KEY manquante sur Vercel' });

  const data = JSON.stringify({
    contents: [{ parts: [{ text: message || 'Salut' }] }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: '/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const request = https.request(options, (response) => {
    let body = '';
    response.on('data', (chunk) => body += chunk);
    response.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (parsed.error) return res.status(500).json({ error: parsed.error.message });
        const reply = parsed.candidates?.[0]?.content?.parts?.[0]?.text || 'Pas de réponse.';
        res.status(200).json({ reply });
      } catch (e) {
        res.status(500).json({ error: 'Erreur lecture réponse API Google' });
      }
    });
  });

  request.on('error', (err) => res.status(500).json({ error: err.message }));
  request.write(data);
  request.end();
};
