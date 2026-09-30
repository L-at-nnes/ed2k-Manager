# ed2k Manager - README (Français)

> Need the English version? Read [README.md](README.md) for the complete translation.

[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](https://github.com/L-at-nnes/ed2k-Manager)
[![Mise a jour auto](https://img.shields.io/badge/mise--a--jour-automatique-brightgreen.svg)](https://github.com/L-at-nnes/ed2k-Manager/blob/main/ed2k-manager.js)

## Apercu
ed2k Manager est un userscript leger pour Tampermonkey ou Violentmonkey. Il inspecte chaque page web, detecte automatiquement les liens `ed2k://` (y compris les liens percent-encodes comme `ed2k://%7Cfile%7C...`) et les affiche dans un panneau flottant. L'extraction des tomes est maintenant bien plus solide : elle reconnait les marqueurs explicites (`T01`, `Tome 39`, `HS2`, `Chapitre 12.5`), les formats implicites (`- 01 -`, `.02.`, `02 (sur 3)`), ainsi que les editions speciales comme les integrales et les packs de tomes (`Tomes 1 a 5`, `T01-T05`). Vous pouvez ensuite rechercher, filtrer par taille, selectionner des fichiers, copier les liens ou exporter les resultats pour une utilisation ulterieure. Tout fonctionne dans le navigateur ; les preferences et (en mode Persistante) la liste de hash importee sont stockees via Tampermonkey (partagees entre tous les sites, jamais dans le `localStorage` de la page).

## Fonctionnalites principales
- Detection robuste des liens ed2k de la page, y compris les liens percent-encodes, les liens colles dans un `<textarea>`/`<input>` texte, les liens dans un shadow DOM ouvert (web components, recursivement), et les liens coupes par une balise inline (ex : `ed2k://|file|<b>Nom</b>|123|hash|/`) ; un badge affiche le nombre total de correspondances.
- Extraction avancee du tome/volume/chapitre avec une colonne dediee et un tri par defaut qui met les tomes les plus eleves en haut tout en gardant les tomes inconnus a la fin.
- L'extraction gere les marqueurs explicites (incluant Tome 0, Chapitre 0, HS, volumes numerotes), les numerotations implicites, et des editions speciales comme les integrales (`INT`) et certains packs (`PACK`).
- Clic sur le nom d'un fichier pour cocher/decocher la ligne et copier immediatement son lien.
- Renommage par lot avec trois modes -- texte simple, regex (`/motif/flags`, groupes captures `$1`/`$2`) et gabarit (`{name}`, `{ext}`, `{tome}`, `{n}` compteur sequentiel, tous avec zero-remplissage type `{n:03}`) -- avec un apercu avant/apres en direct pour voir exactement ce qui va changer avant de l'appliquer a la selection ou a la liste filtree, plus une annulation en un clic.
- Fenetre modale claire avec selection multiple, selection par plage (**Shift+clic**), recherche regex et filtres Min/Max acceptant des valeurs lisibles (`10MB`, `2GB`, etc.).
- Import de listes de hash depuis un fichier externe (`.csv`, `.json`, `.txt`, etc., UTF-8 ou UTF-16) pour comparer avec la page, afficher le nombre de hash connus/nouveaux et cocher les nouveaux en un clic. Plusieurs fichiers peuvent etre selectionnes en une fois et sont fusionnes en une seule liste ; `Exporter liste de hash` sauvegarde la liste courante en `.txt` (un hash par ligne, trie).
- Un switch **Session / Persistante** controle la conservation de la liste de hash importee, sur `Session` par defaut : elle reste en memoire pour cette fenetre uniquement (rien sur le disque, perdue au rechargement). Basculez sur `Persistante` pour la sauvegarder via Tampermonkey a la place, partagee entre tous les sites ; votre choix est memorise pour la prochaine fois. Changer de mode ne supprime jamais rien par lui-meme -- seul le bouton explicite `Effacer comparaison` le fait (apres confirmation), et uniquement pour le mode actif.
- Le filtre `Nouveaux seulement` masque les liens deja presents dans la liste de hash importee, et `Dedupliquer (hash)` ne garde que la premiere occurrence de chaque hash (fichier linke plusieurs fois sur la page).
- Import de gros fichiers optimisé avec parsing en arrière-plan pour charger plus facilement des listes de 10k hash et plus.
- Barre d'actions simplifiée et plus claire : menu `Selectionner` pour les actions de selection, boutons directs `Copier` + `Tout copier (N)` (le compteur et les deux actions suivent votre recherche/filtre en cours), et menu `Exporter` pour CSV et `.emulecollection`.
- Le tableau de resultats est pagine (1000 lignes a la fois par defaut, ajustable via le champ compact a cote de `Reduire`/`Fermer`) pour que les pages avec 10 000+ liens restent fluides a rechercher, filtrer et trier ; `Copier tout`/les exports couvrent toujours tous les liens filtres sur toutes les pages, tandis que les actions de `Selectionner` s'appliquent a la page courante (Shift+clic ou navigation page par page pour une plage plus large).
- Recherche par nom (texte simple ou `/regex/flags`), ou prefixez avec `hash:` pour rechercher par hash ed2k.
- Compteur de selection en direct dans l'entete pour voir immediatement combien de liens sont coches.
- Boutons de copie pour la selection ou pour la liste filtree, ainsi qu'un export CSV (`name,size,link`, UTF-8 avec BOM, protege contre l'injection de formule dans un tableur) et `.emulecollection` (les exports utilisent la selection si elle existe, sinon la liste filtree ; un avertissement s'affiche avant toute troncature au-dela de 1024 liens).
- Decodage automatique des noms de fichiers (avec repli Latin-1 pour les rares noms non-UTF-8) et affichage lisible des tailles en B/Ko/Mo/Go/To (les octets exacts restent dans le tooltip) ; les filtres de taille acceptent `10MB`, `2GB`, `10Mo`, `1.5GiB`, etc.
- Menu contextuel (clic droit sur le bouton lanceur) pour deplacer ou redimensionner le bouton et reinitialiser les parametres par defaut ; des commandes de menu Tampermonkey permettent de rouvrir le panneau ou de basculer la visibilite du bouton meme quand il est masque.
- Code entierement documente en anglais pour faciliter les contributions.

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
4. Utilisez **Selectionner** (menu deroulant) pour les actions de masse (tout selectionner / tout deselectionner).
5. Si vous avez un inventaire de hash deja possedes, cliquez sur **Charger hash** puis chargez votre fichier (`.csv`, `.json`, `.txt`, etc.). Le panneau affiche le nombre de hash connus/nouveaux et marque chaque ligne. Le switch est par defaut sur **Session** (memoire uniquement, perdue au rechargement) ; basculez sur **Persistante** pour sauvegarder via Tampermonkey (disponible sur tous les sites). Seul **Effacer comparaison** la supprime, et uniquement pour le mode actif.
6. Cliquez sur **Nouveaux** pour cocher uniquement les liens dont le hash n'est pas present dans le fichier importe.
7. Cochez des lignes individuellement, utilisez **Shift+clic** pour une selection par plage, ou cliquez directement sur un nom de fichier pour cocher/decocher et copier ce lien.
8. Utilisez **Copier** pour la selection courante et **Tout copier (N)** pour copier tous les liens actuellement affiches par votre filtre/recherche.
9. Ouvrez **Exporter** (menu deroulant) pour exporter en CSV (`ed2k-links.csv`) ou en `.emulecollection` (selection si presente, sinon la liste filtree).
10. Fermez la fenetre avec **Fermer**, la touche **Esc** ou en recliquant sur le bouton — copier des liens ne ferme plus automatiquement la fenetre, vous pouvez donc continuer a travailler sur votre selection ensuite.

## Mises à jour automatiques
Le script est distribué via GitHub. Tampermonkey compare régulièrement votre copie locale à la version officielle et l'actualise automatiquement. Tant que l'userscript est actif, vous recevez les correctifs et améliorations sans intervention manuelle.

## Depannage
- **Le bouton n'apparait pas :** assurez-vous que le script est active dans Tampermonkey puis rechargez la page (un Ctrl+F5 peut aider). Si vous l'avez masque, utilisez la commande de menu Tampermonkey **Afficher/masquer le bouton** (ou **Ouvrir ed2k Manager**) depuis l'icone de l'extension pour le faire revenir.
- **La copie vers le presse papier echoue :** rafraichissez l'onglet ; certains navigateurs bloquent l'acces presse papier avant la premiere interaction.
- **Le fichier importe affiche `0 hash` :** verifiez qu'il contient bien des hash ED2K (32 caracteres hexadecimaux). Le parseur extrait automatiquement tous les hash detectables dans le contenu brut (UTF-8 ou UTF-16).
- **Le switch Session/Persistante est verrouille/desactive :** `GM_setValue`/`GM_getValue` de Tampermonkey ne sont pas disponibles dans votre gestionnaire d'userscripts, donc le mode `Persistante` ne peut pas fonctionner ; la comparaison de hash reste utilisable normalement en mode `Session`.

## Feuille de route et communaute
Prochaine etape envisagee : un bouton de bascule FR/EN. N'hesitez pas a ouvrir une issue pour proposer une idee ou signaler un bug.

## Contribuer
Les pull requests sont bienvenues : corrections, nouvelles fonctionnalités, documentation ou traductions. Les commentaires et docstrings restent en anglais pour faciliter la revue. Si vous modifiez l'interface, ajoutez de courtes explications ou captures d'écran.

---
Bonne chasse aux liens ed2k et merci de faire vivre l'écosystème !
