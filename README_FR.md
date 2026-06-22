# ed2k Manager - README (Français)

> Need the English version? Read [README.md](README.md) for the complete translation.

[![Version](https://img.shields.io/badge/version-1.4.1-blue.svg)](https://github.com/L-at-nnes/ed2k-Manager)
[![Mise à jour auto](https://img.shields.io/badge/mise--a--jour-automatique-brightgreen.svg)](https://github.com/L-at-nnes/ed2k-Manager/blob/main/ed2k-manager.js)

## Aperçu
ed2k Manager est un userscript léger pour Tampermonkey ou Violentmonkey. Il inspecte chaque page web, détecte automatiquement les liens `ed2k://` (y compris les liens percent-encodés comme `ed2k://%7Cfile%7C...`) et les affiche dans un panneau flottant. L'extraction des tomes est maintenant bien plus solide : elle reconnaît les marqueurs explicites (`T01`, `Tome 39`, `HS2`), les formats implicites (`- 01 -`, `.02.`, `02 (sur 3)`), ainsi que les éditions spéciales comme les intégrales et certains packs. Vous pouvez ensuite rechercher, filtrer par taille, sélectionner des fichiers, copier les liens ou exporter les résultats pour une utilisation ultérieure. Tout fonctionne dans le navigateur et toutes les préférences sont stockées en local.

## Fonctionnalités principales
- Détection robuste des liens ed2k de la page, y compris les liens percent-encodés, avec badge affichant le nombre de correspondances.
- Extraction avancée du tome/volume/chapitre avec une colonne dédiée et un tri par défaut qui met les tomes les plus élevés en haut tout en gardant les tomes inconnus à la fin.
- L'extraction gère les marqueurs explicites (incluant Tome 0, Chapitre 0, HS, volumes numérotés), les numérotations implicites, et des éditions spéciales comme les intégrales (`INT`) et certains packs (`PACK`).
- Clic sur le nom d'un fichier pour cocher/décocher la ligne et copier immédiatement son lien.
- Fenêtre modale claire avec sélection multiple, sélection par plage (**Shift+clic**), recherche regex et filtres Min/Max acceptant des valeurs lisibles (`10MB`, `2GB`, etc.).
- Import de listes de hash depuis un fichier externe (`.csv`, `.json`, `.txt`, etc.) pour comparer avec la page, afficher le nombre de hash connus/nouveaux et cocher les nouveaux en un clic.
- Switch de mémoire pour les hash importés : mode `session` (par défaut) pour conserver tant que le navigateur reste ouvert, ou mode `persistante` pour conserver après redémarrage.
- Import de gros fichiers optimisé avec parsing en arrière-plan pour charger plus facilement des listes de 10k hash et plus.
- Barre d'actions simplifiée et plus claire : menu `Sélectionner` pour les actions de sélection, boutons directs `Copier` + `Tout copier`, et menu `Exporter` pour CSV et `.emulecollection`.
- Compteur de sélection en direct dans l'en-tête pour voir immédiatement combien de liens sont cochés.
- Boutons de copie pour la sélection ou pour la liste complète, ainsi qu'un export CSV (`name,size,link`) et `.emulecollection` (les exports utilisent la sélection si elle existe, sinon toute la liste).
- Décodage automatique des noms de fichiers percent-encodés ; les caractères `+` sont préservés tels quels (caractère littéral, pas un espace), plus affichage lisible des tailles (les octets exacts sont indiqués dans le tooltip).
- Menu contextuel (clic droit sur le bouton lanceur) pour déplacer ou redimensionner le bouton et réinitialiser les paramètres par défaut.
- Code entièrement documenté en anglais pour faciliter les contributions.

## Prérequis
- Navigateur avec Tampermonkey (ou tout gestionnaire d'userscripts compatible).
- Accès Internet lors de la première installation afin de télécharger `ed2k-manager.js` depuis GitHub.

## Installation (environ 5 minutes)
### Méthode 1 - Installation directe (recommandée)
1. Installez l'extension Tampermonkey :
   - [Brave/Edge](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/)
2. Cliquez sur **[Installer ed2k Manager](https://raw.githubusercontent.com/L-at-nnes/ed2k-Manager/main/ed2k-manager.js)**.
3. Tampermonkey ouvre la boîte de dialogue d'installation : validez avec **Install**.
4. Rechargez une page contenant des liens ed2k. Un petit bouton "ed2k" s'affiche en bas à droite.

### Méthode 2 - Installation manuelle
1. Installez Tampermonkey si ce n'est pas déjà fait.
2. Dans le tableau de bord Tampermonkey, cliquez sur **+** / **Add a new script**.
3. Copiez l'intégralité de [`ed2k-manager.js`](https://raw.githubusercontent.com/L-at-nnes/ed2k-Manager/main/ed2k-manager.js).
4. Collez le script dans l'éditeur Tampermonkey puis sauvegardez (Ctrl+S).
5. Rechargez la page cible : le bouton "ed2k" est prêt.

Tampermonkey vérifie automatiquement les nouvelles versions sur GitHub. Aucune réinstallation n'est nécessaire.

## Utilisation
1. Ouvrez une page contenant des liens ed2k puis cliquez sur le bouton flottant "ed2k".
2. Parcourez la liste des liens détectés dans la fenêtre modale. Le badge indique le nombre total, l'en-tête affiche combien sont sélectionnés, et la colonne Tome sert de tri par défaut.
3. Tapez un mot ou une regex (ex : `/S01E02/i`) dans la barre de recherche. Utilisez les champs **Min/Max** pour filtrer par taille.
4. Utilisez **Sélectionner** (menu déroulant) pour les actions de masse (tout sélectionner / tout désélectionner).
5. Choisissez le mode **Mémoire: session/persistante** selon votre besoin (temporaire pendant la session navigateur ou conservé après redémarrage).
6. Si vous avez un inventaire de hash déjà possédés, cliquez sur **Charger hash** puis chargez votre fichier (`.csv`, `.json`, `.txt`, etc.). Le panneau affiche le nombre de hash connus/nouveaux et marque chaque ligne.
7. Cliquez sur **Nouveaux** pour cocher uniquement les liens dont le hash n'est pas présent dans le fichier importé.
8. Cochez des lignes individuellement, utilisez **Shift+clic** pour une sélection par plage, ou cliquez directement sur un nom de fichier pour cocher/décocher et copier ce lien.
9. Utilisez **Copier** pour la sélection courante et **Tout copier** pour copier toute la liste.
10. Ouvrez **Exporter** (menu déroulant) pour exporter en CSV (`ed2k-links.csv`) ou en `.emulecollection` (sélection si présente, sinon toute la liste).
11. Fermez la fenêtre avec **Fermer**, la touche **Esc** ou en recliquant sur le bouton.

## Mises à jour automatiques
Le script est distribué via GitHub. Tampermonkey compare régulièrement votre copie locale à la version officielle et l'actualise automatiquement. Tant que l'userscript est actif, vous recevez les correctifs et améliorations sans intervention manuelle.

## Dépannage
- **Le bouton n'apparaît pas :** assurez-vous que le script est activé dans Tampermonkey puis rechargez la page (un Ctrl+F5 peut aider).
- **La copie vers le presse-papier échoue :** rafraîchissez l'onglet ; certains navigateurs bloquent l'accès presse-papier avant la première interaction.
- **Le fichier importé affiche `0 hash` :** vérifiez qu'il contient bien des hash ED2K (32 caractères hexadécimaux). Le parseur extrait automatiquement tous les hash détectables dans le contenu brut.
- **L'interface rame avec beaucoup de liens :** consultez la section TODO-LIST à la fin de ce README pour les améliorations prévues.

## Feuille de route et communauté
La feuille de route est résumée dans la section TODO-LIST à la fin de ce README. N'hésitez pas à ouvrir une issue pour proposer une idée ou signaler un bug.

## Contribuer
Les pull requests sont bienvenues : corrections, nouvelles fonctionnalités, documentation ou traductions. Les commentaires et docstrings restent en anglais pour faciliter la revue. Si vous modifiez l'interface, ajoutez de courtes explications ou captures d'écran.

---
Bonne chasse aux liens ed2k et merci de faire vivre l'écosystème !
