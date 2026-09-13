VEKTRA — ERVIN DIGITAL CORP
============================

CONTENU
- index.html, style.css, script.js, logo.png
  -> le site (front-end complet). Ces 4 fichiers doivent rester
     dans le même dossier, à la racine du projet.

- api/chat.js
  -> le cerveau IA, au format attendu par Vercel (dossier /api à la
     racine = route automatique POST /api/chat). C'est la version
     active si le site est déployé sur Vercel.

- server-express-alternative.js
  -> une version alternative du même cerveau IA, au format Express
     classique (app.listen...), utile seulement si le site est un
     jour hébergé ailleurs que sur Vercel (VPS, Render, etc.) sans
     passer par les fonctions serverless. Renommer en server.js et
     installer "express" + "dotenv" en plus de "groq-sdk" pour
     l'utiliser. Ne pas utiliser en même temps que api/chat.js.

INSTALLATION RAPIDE (Vercel)
1. npm install groq-sdk
2. Variables d'environnement du projet Vercel :
     GROQ_API_KEY    (obligatoire — console.groq.com)
     TAVILY_API_KEY  (optionnel — recherche web, tavily.com)
     GROQ_MODEL      (optionnel — défaut: openai/gpt-oss-120b)
3. Déployer.
