# ed2k Manager - README (Francais)

> Need the English version? Read [README.md](README.md) for the complete translation.

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/L-at-nnes/ed2k-Manager)
[![Mise a jour auto](https://img.shields.io/badge/mise--a--jour-automatique-brightgreen.svg)](https://github.com/L-at-nnes/ed2k-Manager/blob/main/ed2k-manager.js)

## Apercu
ed2k Manager est un userscript leger pour Tampermonkey ou Violentmonkey. Il inspecte chaque page web, detecte automatiquement les liens `ed2k://` (y compris les liens percent-encodes comme `ed2k://%7Cfile%7C...`) et les affiche dans un panneau flottant. L'extraction des tomes est maintenant bien plus solide : elle reconnait les marqueurs explicites (`T01`, `Tome 39`, `HS2`), les formats implicites (`- 01 -`, `.02.`, `02 (sur 3)`), ainsi que les editions speciales comme les integrales et certains packs. Vous pouvez ensuite rechercher, filtrer par taille, selectionner des fichiers, copier les liens ou exporter les resultats pour une utilisation ulterieure. Tout fonctionne dans le navigateur et toutes les preferences sont stockees en local.

## Fonctionnalites principales
- Detection robuste des liens ed2k de la page, y compris les liens percent-encodes, avec badge affichant le nombre de correspondances.
- Extraction avancee du tome/volume avec une colonne dediee et un tri par defaut qui met les tomes les plus eleves en haut tout en gardant les tomes inconnus a la fin.
- L'extraction gere les marqueurs explicites, les numerotations implicites, et des editions speciales comme les integrales (`INT`) et certains packs (`PACK`).
- Clic sur le nom d'un fichier pour cocher/decocher la ligne et copier immediatement son lien.
- Fenetre modale claire avec selection multiple, selection par plage (**Shift+clic**), recherche regex et filtres Min/Max acceptant des valeurs lisibles (`10MB`, `2GB`, etc.).
- Compteur de selection en direct dans l'entete pour voir immediatement combien de liens sont coches.
- Boutons de copie pour la selection ou pour la liste complete, ainsi qu'un export CSV (`name,size,link`) et `.emulecollection` (les exports utilisent la selection si elle existe, sinon toute la liste).
- Decodage automatique des noms de fichiers plus affichage lisible des tailles (les octets exacts sont indiques dans le tooltip).
- Menu contextuel (clic droit sur le bouton lanceur) pour deplacer ou redimensionner le bouton et reinitialiser les parametres par defaut.
- Code entierement documente en anglais pour faciliter les contributions.

## Prerequis
- Navigateur avec Tampermonkey (ou tout gestionnaire d'userscripts compatible).
- Acces Internet lors de la premiere installation afin de telecharger `ed2k-manager.js` depuis GitHub.

## Installation (environ 5 minutes)
### Methode 1 - Installation directe (recommandee)
1. Installez l'extension Tampermonkey :
   - [Brave/Edge](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/)
2. Cliquez sur **[Installer ed2k Manager](https://raw.githubusercontent.com/L-at-nnes/ed2k-Manager/main/ed2k-manager.js)**.
3. Tampermonkey ouvre la boite de dialogue d'installation : validez avec **Install**.
4. Rechargez une page contenant des liens ed2k. Un petit bouton "ed2k" s'affiche en bas a droite.

### Methode 2 - Installation manuelle
1. Installez Tampermonkey si ce n'est pas deja fait.
2. Dans le tableau de bord Tampermonkey, cliquez sur **+** / **Add a new script**.
3. Copiez l'integralite de [`ed2k-manager.js`](https://raw.githubusercontent.com/L-at-nnes/ed2k-Manager/main/ed2k-manager.js).
4. Collez le script dans l'editeur Tampermonkey puis sauvegardez (Ctrl+S).
5. Rechargez la page cible : le bouton "ed2k" est pret.

Tampermonkey verifie automatiquement les nouvelles versions sur GitHub. Aucune reinstallation n'est necessaire.

## Utilisation
1. Ouvrez une page contenant des liens ed2k puis cliquez sur le bouton flottant "ed2k".
2. Parcourez la liste des liens detectes dans la fenetre modale. Le badge indique le nombre total, l'entete affiche combien sont selectionnes, et la colonne Tome sert de tri par defaut.
3. Tapez un mot ou une regex (ex : `/S01E02/i`) dans la barre de recherche. Utilisez les champs **Min/Max** pour filtrer par taille.
4. Cochez des lignes individuellement, utilisez **Shift+clic** pour une selection par plage, ou utilisez **Tout selectionner**. Vous pouvez aussi cliquer directement sur un nom de fichier pour cocher/decocher et copier ce lien.
5. Cliquez sur **Copier la selection**, **Tout copier**, **Exporter CSV** (pour `ed2k-links.csv`) ou **Exporter .emulecollection**. Les deux exports utilisent la selection si elle existe, sinon toute la liste.
6. Fermez la fenetre avec **Fermer**, la touche **Esc** ou en recliquant sur le bouton.

## Mises a jour automatiques
Le script est distribue via GitHub. Tampermonkey compare regulierement votre copie locale a la version officielle et l'actualise automatiquement. Tant que l'userscript est actif, vous recevez les correctifs et ameliorations sans intervention manuelle.

## Depannage
- **Le bouton n'apparait pas :** assurez-vous que le script est active dans Tampermonkey puis rechargez la page (un Ctrl+F5 peut aider).
- **La copie vers le presse papier echoue :** rafraichissez l'onglet ; certains navigateurs bloquent l'acces presse papier avant la premiere interaction.
- **L'interface rame avec beaucoup de liens :** consultez la section TODO-LIST a la fin de ce README pour les ameliorations prevues.

## Feuille de route et communaute
La feuille de route est resumee dans la section TODO-LIST a la fin de ce README. N'hesitez pas a ouvrir une issue pour proposer une idee ou signaler un bug.

## Contribuer
Les pull requests sont bienvenues : corrections, nouvelles fonctionnalites, documentation ou traductions. Les commentaires et docstrings restent en anglais pour faciliter la revue. Si vous modifiez l'interface, ajoutez de courtes explications ou captures d'ecran.

---
Bonne chasse aux liens ed2k et merci de faire vivre l'ecosysteme !
