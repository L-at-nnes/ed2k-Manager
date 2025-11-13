# ed2k Manager — README (français)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/L-at-nnes/ed2k-Manager)
[![Auto-update](https://img.shields.io/badge/auto--update-enabled-brightgreen.svg)](https://github.com/L-at-nnes/ed2k-Manager/blob/main/ed2k-manager.js)

Objectif
--------
ed2k Manager est un userscript qui détecte les liens ed2k sur une page et les présente dans une petite interface pour les sélectionner, copier ou exporter.

🚀 Mises à jour automatiques
-----------------------------
Le script se met à jour automatiquement via Tampermonkey dès qu'une nouvelle version est publiée sur GitHub. Aucune action manuelle nécessaire !

📋 Feuille de route
-------------------
Consultez la [TODO list](TODO.md) pour voir les fonctionnalités à venir et l'avancement du développement.

Pour les débutants — installation (5 minutes)
---------------------------------------------

### Méthode 1 : Installation directe (recommandée)
1. Installer l'extension Tampermonkey pour votre navigateur :
   - [Chrome/Edge](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) : Chrome Web Store
   - [Firefox](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/) : Modules complémentaires Firefox
2. Cliquer sur ce lien : **[Installer ed2k Manager](https://raw.githubusercontent.com/L-at-nnes/ed2k-Manager/main/ed2k-manager.js)**
3. Tampermonkey détecte automatiquement le script → cliquer sur « Installer »
4. Rechargez la page que vous souhaitez inspecter : un petit bouton "ed2k" apparaît en bas à droite.

### Méthode 2 : Installation manuelle
1. Installer Tampermonkey (voir méthode 1)
2. Ouvrir Tampermonkey → cliquer sur « + » ou « Add a new script »
3. Copier le contenu de [`ed2k-manager.js`](https://raw.githubusercontent.com/L-at-nnes/ed2k-Manager/main/ed2k-manager.js)
4. Coller dans l'éditeur de script Tampermonkey, sauvegarder (Ctrl+S)
5. Rechargez la page : le bouton "ed2k" apparaît en bas à droite

✅ **Les mises à jour se feront automatiquement** : Tampermonkey vérifie régulièrement les nouvelles versions sur GitHub.

Utilisation simple
------------------
- Ouvrir une page contenant des liens ed2k.
- Cliquer sur le bouton "ed2k" : la fenêtre s'ouvre et liste les liens.
- Chercher : tapez du texte ou une regex (ex : `/S01E02/i`) dans la barre de recherche.
- Filtrer par taille : utiliser les champs Min / Max (ex : `10MB`, `2GB`).
- Sélectionner : cocher les fichiers souhaités ou cliquer sur « Tout sélectionner ».
- Copier : « Copier sélection » copie les liens cochés dans le presse-papiers. « Copier tout » copie tous les liens trouvés.
- Export : « Exporter CSV » télécharge un fichier `ed2k-links.csv` (colonnes : name,size,link).
- Fermer : recliquer sur le bouton, cliquer sur « Fermer » ou presser `Esc`.

Remarques pratiques
-------------------
- Le badge sur le bouton affiche le nombre exact de liens détectés.
- Le nom des fichiers est décodé automatiquement (URL-decoded) quand c'est possible.
- Les tailles sont stockées en octets ; affichées en MB (2 décimales). Le tooltip montre les octets bruts.
- Le menu contextuel (clic droit sur le bouton) permet de changer position/taille du bouton et de réinitialiser les réglages.

Dépannage rapide
----------------
- Si vous ne voyez pas le bouton : vérifiez que le script est activé dans Tampermonkey et que la page a été rechargée.
- Si la copie ne fonctionne pas : essayez un rafraîchissement, certains sites ou navigateurs restreignent l'accès au presse-papiers.

Contribuer
----------
Tout le monde peut contribuer : suggestions, rapports de bugs, améliorations ou corrections.
Tout le code est documenté en anglais pour faciliter la compréhension et la contribution des développeurs (commentaires et docstrings en anglais). N'hésitez pas à ouvrir une issue ou une pull request.

-------------------------



