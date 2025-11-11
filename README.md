# ed2k Manager — README (français)

Objectif
--------
ed2k Manager est un userscript qui détecte les liens ed2k sur une page et les présente dans une petite interface pour les sélectionner, copier ou exporter.

Pour les débutants — installation (5 minutes)
---------------------------------------------
1. Installer l'extension Tampermonkey pour votre navigateur :
   - Chrome/Edge : ouvrir le Chrome Web Store et installer Tampermonkey.
   - Firefox : installer Tampermonkey depuis les modules complémentaires Firefox.
2. Ouvrir Tampermonkey → cliquer sur « + » ou « Add a new script ».
3. Ouvrir le fichier `ed2k-manager.js` avec un éditeur de texte (ou depuis ce dépôt) et copier tout son contenu.
4. Coller ce contenu dans l'éditeur de script Tampermonkey, sauvegarder (Ctrl+S).
5. Rechargez la page que vous souhaitez inspecter : un petit bouton "ed2k" apparaît en bas à droite.

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



