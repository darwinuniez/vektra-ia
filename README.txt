EDC AI — ERVIN DIGITAL CORP
===========================

CONTENU DU DOSSIER (à déposer tel quel à la racine du projet Vercel)
- index.html, style.css, script.js
    -> le site (front-end complet)
- logo-edc-ai-dark.png / logo-edc-ai-light.png
    -> logo EDC AI (variantes thème sombre / thème clair) : intro, accueil, barre latérale
- logo-edc-full.png / logo-edc-mark.png
    -> logo EDC simple (noir, inversé automatiquement en blanc en thème sombre) :
       bouton "Créé par" (renvoie vers le hub) et avatar de l'IA dans les messages
- favicon.ico, favicon-32.png, favicon-192.png, favicon-512.png,
  apple-touch-icon.png, site.webmanifest
    -> favicon / icônes d'application
- api/chat.js
    -> le cerveau IA (route automatique POST /api/chat sur Vercel)
- package.json
    -> dépendance groq-sdk

CHANGER LES LOGOS PLUS TARD
Remplacez simplement les fichiers PNG (fond transparent) en gardant les mêmes noms.
Le logo EDC AI existe en deux versions : _dark (pour fond sombre) et _light.

INSTALLATION RAPIDE (Vercel)
1. Déposer le contenu de ce dossier dans le projet (ou glisser-déposer le dossier).
2. Variables d'environnement du projet Vercel :
     GROQ_API_KEY    (obligatoire — console.groq.com)
     TAVILY_API_KEY  (optionnel — recherche web, tavily.com)
     GROQ_MODEL      (optionnel — défaut : openai/gpt-oss-120b)
3. Déployer.

À RENSEIGNER
- Lien Discord : dans index.html, balise <a id="discord-link" href="#">.
