# TO-DO List — ed2k Manager

## 🎨 Phase 0 : Refonte de l'interface utilisateur (UI)
- [ ] **Refaire complètement l'UI** pour une meilleure organisation et UX
- [ ] **Bouton "Ouvrir dans un nouvel onglet"** : permet d'ouvrir l'userscript dans un onglet dédié pour avoir plus d'espace
  - Conception de la page standalone
  - Transfert de tous les liens détectés vers le nouvel onglet
  - Synchronisation bidirectionnelle si besoin

---

## 📋 Phase 1 : Système d'onglets

### 1.1 Onglet principal (Liens détectés)
- [ ] Liste des liens ed2k trouvés sur la page actuelle
- [ ] **Marqueur rouge visible** sur les liens déjà présents dans l'historique
  - Badge ou icône claire (ex: pastille rouge, icône téléchargement)
  - Indication visuelle immédiate
- [ ] Toutes les fonctionnalités actuelles (sélection, tri, filtres)

### 1.2 Onglet Historique
- [ ] **Stockage persistant et fiable** (localStorage + fallback IndexedDB)
  - Structure qui résiste aux mises à jour du script
  - Survit au vidage du cache navigateur
  - Compatible avec les futures versions (migration automatique)
- [ ] **Affichage de tous les liens copiés** avec métadonnées :
  - Date et heure de copie
  - Nom du fichier
  - Taille
  - Hash MD4
  - URL source (page d'origine)
- [ ] **Fonctionnalités de l'onglet historique** :
  - [ ] Recopier un ou plusieurs liens de l'historique
  - [ ] Filtrer par nom/taille/date
  - [ ] Tri par date, nom, taille (ascendant/descendant)
  - [ ] Recherche avec **support regex** (comme onglet principal)
  - [ ] Sélection multiple (checkboxes)
  - [ ] Effacer l'historique complet (avec confirmation)
  - [ ] Effacer des liens individuels
  - [ ] Export de l'historique (CSV, JSON)
- [ ] **Compteur visible** : "Historique : 1 247 liens" (en haut de l'onglet)

---

## 📊 Phase 2 : Statistiques en temps réel

- [ ] **Barre de statistiques en bas de la page** (onglet principal)
  - Nombre total de liens trouvés
  - Nombre de liens filtrés/affichés
  - Nombre de liens sélectionnés
  - **Taille totale des liens sélectionnés** (ex: "3 fichiers sélectionnés — 4.2 GB")
  - **Taille totale de tous les liens affichés**
  - ⚠️ **PAS de répartition par type de fichier** (trop détaillé)
- [ ] Mise à jour dynamique lors des sélections/filtres
- [ ] Design discret mais visible

---

## 🔍 Phase 3 : Détection de doublons

- [ ] **Détection automatique** des liens avec le même hash MD4
- [ ] **Marqueur visuel "Doublon"** (badge ou icône)
- [ ] **Option de filtrage** :
  - Masquer les doublons (garder seulement le premier)
  - Afficher tous les doublons
  - Regrouper visuellement les doublons
- [ ] Compteur : "X doublons détectés"

---

## 💾 Phase 4 : Export eMule Collection

- [ ] **Bouton "Exporter .emulecollection"**
  - Génère un fichier `.emulecollection` (format XML natif eMule/aMule)
  - Double-clic sur le fichier = import automatique dans le client
- [ ] **Option dans l'onglet Historique** : exporter tout l'historique en .emulecollection
- [ ] Inclusion des métadonnées (hash AICH si disponible)

---

## ⌨️ Phase 5 : Raccourcis clavier

- [ ] Implémentation des raccourcis :
  - `Ctrl+A` : Tout sélectionner
  - `Ctrl+D` : Tout désélectionner
  - `Ctrl+C` : Copier la sélection
  - `Ctrl+F` : Focus sur la barre de recherche
  - `Escape` : Fermer le modal (déjà implémenté)
  - `Ctrl+H` : Basculer vers l'onglet Historique
  - `Ctrl+Shift+Delete` : Effacer l'historique (avec confirmation)
- [ ] **Guide clair des raccourcis** :
  - Page d'aide accessible via `?` ou bouton "Aide"
  - Liste complète des raccourcis avec descriptions
  - Affichage en overlay ou dans un onglet dédié

---

## 📋 Phase 6 : Sélection avancée par plage

- [ ] **Shift + clic** : Sélectionner une plage de fichiers (du dernier clic au clic actuel)
- [ ] **Ctrl + clic** : Sélection individuelle (ajouter/retirer sans affecter les autres)
- [ ] Comportement identique à l'explorateur Windows/macOS
- [ ] Indication visuelle lors de la sélection par plage (survol)

---

## 📝 Phase 7 : Copie enrichie (options discrètes)

- [ ] **Menu contextuel discret** ou options dans le bouton "Copier"
  - Copier seulement les liens (défaut actuel)
  - Copier avec noms : `Nom du fichier.mkv\ned2k://...`
  - Copier seulement les noms de fichiers
  - Copier seulement les hashes MD4
- [ ] Sauvegarde de la préférence de l'utilisateur

---

## 🔎 Phase 8 : Recherche par hash MD4

- [ ] **Champ de recherche spécial** pour hash MD4 (32 caractères hexadécimaux)
- [ ] Détection automatique si l'entrée est un hash
- [ ] Recherche exacte dans la liste
- [ ] Message si hash non trouvé

---

## 🖼️ Phase 9 : Modes de vue

- [ ] **Vue Tableau** (actuelle) : tableau complet avec toutes les colonnes
- [ ] **Vue Liste compacte** :
  - Une ligne par fichier
  - Affichage : checkbox | nom | taille | actions
  - Plus de lignes visibles à l'écran
- [ ] **Vue Grille** :
  - Cartes avec icônes selon le type de fichier
  - Aperçu visuel (nom, taille, type)
  - Sélection par clic sur la carte
- [ ] Bouton de bascule entre les modes (icônes claires)
- [ ] Sauvegarde de la préférence

---

## 🎨 Phase 10 : Thèmes supplémentaires

- [ ] Actuellement : thème "Ocean" fixe
- [ ] **Nouveaux thèmes à ajouter** :
  - [ ] Dark Pure (noir mat)
  - [ ] Light (clair/blanc)
  - [ ] Solarized Dark
  - [ ] Solarized Light
  - [ ] Matrix (vert sur noir)
  - [ ] Nord
  - [ ] Dracula
- [ ] **Sélection dans le menu contextuel** (clic droit sur le bouton)
- [ ] Sauvegarde persistante du thème choisi

---

## 🔦 Phase 11 : Highlighting de la recherche

- [ ] **Surligner en jaune** (ou couleur configurable) les termes recherchés dans les résultats
- [ ] Highlighting dans :
  - Nom du fichier
  - Lien (si recherche dans le lien)
- [ ] Support du highlighting avec regex
- [ ] Désactivation automatique si recherche vide

---

## 🌐 Phase 12 : Intégration API externe

- [ ] **Bouton "Rechercher sur FileDonkey"** (ou autre base de données ed2k)
  - Ouvre la recherche du fichier dans un nouvel onglet
  - Passage du nom du fichier ou du hash
- [ ] **Bouton "Vérifier disponibilité"**
  - API pour vérifier si le fichier est encore disponible sur le réseau
  - Affichage du nombre de sources si disponible
- [ ] **Intégration avec bases de données ed2k** :
  - Recherche de métadonnées supplémentaires
  - Vérification de la réputation (éviter les fakes)
  - Suggestions de fichiers similaires
- [ ] Boutons discrets (icônes) à côté de chaque lien
- [ ] Gestion des erreurs API (timeout, indisponibilité)

---

## 🔧 Phase 13 : Améliorations techniques

- [ ] Optimisation des performances pour grandes listes (> 1000 liens)
- [ ] Virtualisation du tableau si nécessaire
- [ ] Tests de compatibilité multi-navigateurs (Chrome, Firefox, Edge)
- [ ] Migration de données entre versions (système de versioning du storage)
- [ ] Gestion d'erreurs robuste
- [ ] Logs de debug (activables via paramètre)

---

## 📚 Phase 14 : Documentation

- [ ] Mettre à jour le README.md avec toutes les nouvelles fonctionnalités
- [ ] Capturas d'écran de chaque mode/onglet
- [ ] Guide d'utilisation complet
- [ ] FAQ (questions fréquentes)
- [ ] Changelog détaillé

---

## ✅ Récapitulatif des fonctionnalités demandées

| # | Fonctionnalité | Statut | Priorité |
|---|----------------|--------|----------|
| 0 | Refonte UI + Bouton nouvel onglet | ⏳ À faire | 🔴 Critique |
| 1 | Historique complet avec onglet dédié | ⏳ À faire | 🔴 Critique |
| 2 | Statistiques en temps réel | ⏳ À faire | 🟠 Haute |
| 3 | Détection de doublons | ⏳ À faire | 🟠 Haute |
| 5 | Export .emulecollection | ⏳ À faire | 🟡 Moyenne |
| 6 | Raccourcis clavier + Guide | ⏳ À faire | 🟡 Moyenne |
| 7 | Sélection par plage (Shift+clic) | ⏳ À faire | 🔴 Critique |
| 8 | Copie enrichie (discret) | ⏳ À faire | 🟢 Basse |
| 9 | Recherche par hash MD4 | ⏳ À faire | 🟢 Basse |
| 11 | Modes de vue (tableau/liste/grille) | ⏳ À faire | 🟡 Moyenne |
| 13 | Thèmes supplémentaires | ⏳ À faire | 🟠 Haute |
| 14 | Highlighting recherche | ⏳ À faire | 🟠 Haute |
| 20 | Intégration API externe | ⏳ À faire | 🟡 Moyenne |

---

## 🚀 Ordre d'implémentation recommandé

1. **Phase 0** : Refonte UI + bouton nouvel onglet (fondation)
2. **Phase 1** : Système d'onglets + Historique (fonctionnalité principale)
3. **Phase 7** : Sélection par plage (UX critique)
4. **Phase 2** : Statistiques en temps réel
5. **Phase 3** : Détection de doublons
6. **Phase 10** : Thèmes supplémentaires
7. **Phase 11** : Highlighting recherche
8. **Phase 5** : Raccourcis clavier + Guide
9. **Phase 9** : Modes de vue
10. **Phase 4** : Export .emulecollection
11. **Phase 6** : Copie enrichie
12. **Phase 8** : Recherche par hash MD4
13. **Phase 12** : Intégration API externe
14. **Phase 13** : Optimisations techniques
15. **Phase 14** : Documentation complète

---

## 📝 Notes importantes

- **Stockage persistant** : Utiliser `localStorage` en priorité, avec fallback sur `IndexedDB` pour gros volumes
- **Versioning du storage** : Clé `ed2k_storage_version` pour gérer les migrations entre versions
- **Compatibilité** : Tester sur Chrome, Firefox, Edge (Tampermonkey/Violentmonkey/Greasemonkey)
- **Performance** : Virtualiser le tableau si > 500-1000 lignes
- **UX** : Toutes les actions doivent avoir un feedback visuel clair
- **Sauvegarde** : Toutes les préférences utilisateur doivent être sauvegardées (thème, vue, raccourcis, etc.)

---

**Dernière mise à jour** : 13 novembre 2025  
**Version cible** : 2.0.0
