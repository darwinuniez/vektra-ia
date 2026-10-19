EDC AI — ERVIN DIGITAL CORP
===========================

CONTENU DU DOSSIER (à déposer tel quel à la racine du projet Vercel)
- index.html, style.css, script.js
    -> le site (front-end complet)
- logo-edc-mark.png
    -> logo EDC (noir, inversé automatiquement en blanc en thème sombre) :
       logo "EDC AI" (le "AI" est du texte), avatar de l'IA, lien EDC
- favicon.ico, favicon-32.png, favicon-192.png, favicon-512.png,
  apple-touch-icon.png, site.webmanifest
    -> favicon / icônes d'application
- api/chat.js
    -> le cerveau IA (route automatique POST /api/chat sur Vercel)
- package.json
    -> dépendance groq-sdk

CHANGER LE LOGO PLUS TARD
Remplacez logo-edc-mark.png (PNG transparent, lettres noires) en gardant le nom.
Les favicons (favicon.ico, favicon-*.png, apple-touch-icon.png) sont à remplacer
séparément.

INSTALLATION RAPIDE (Vercel)
1. Déposer le contenu de ce dossier dans le projet (ou glisser-déposer le dossier).
2. Variables d'environnement du projet Vercel :
     GROQ_API_KEY    (obligatoire — console.groq.com)
     TAVILY_API_KEY  (optionnel — recherche web, tavily.com)
     GROQ_MODEL      (optionnel — défaut : openai/gpt-oss-120b)
3. Déployer.

À RENSEIGNER
- Lien Discord : dans index.html, balise <a id="discord-link" href="#">.
