# ed2k Manager - README (English)

> Need the French version? Read [README_FR.md](README_FR.md) for the complete translation.

[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](https://github.com/L-at-nnes/ed2k-Manager)
[![Auto-update](https://img.shields.io/badge/auto--update-enabled-brightgreen.svg)](https://github.com/L-at-nnes/ed2k-Manager/blob/main/ed2k-manager.js)

## Overview
ed2k Manager is a lightweight userscript for Tampermonkey or Violentmonkey that scans any web page for `ed2k://` links and presents them in a floating control panel. Detection is robust (including percent-encoded ed2k links), and tome extraction is now much more capable: it recognizes explicit markers (`T01`, `Tome 39`, `HS2`, `Chapitre 12.5`), implicit layouts (`- 01 -`, `.02.`, `02 (sur 3)`), and special editions like integrales and range packs (`Tomes 1 a 5`, `T01-T05`). From there you can search, filter by size, select items, copy the exact list of links, or export the results for later use. The script runs entirely inside the browser, stores preferences and (in Persistante mode) the imported hash list through Tampermonkey's own storage (shared across every site, never the page's own `localStorage`), and keeps itself up to date.

## Features at a Glance
- Robust detection of ed2k links on the active page, including percent-encoded links such as `ed2k://%7Cfile%7C...`, links pasted into a `<textarea>`/text `<input>`, links inside an open shadow DOM (web components, recursively), and links split across an inline tag (e.g. `ed2k://|file|<b>Name</b>|123|hash|/`); a badge shows the total number of matches.
- Advanced tome/volume/chapter extraction with a dedicated column and a default sort that brings the highest tome to the top while keeping unknown tomes at the end.
- Tome extraction handles explicit markers (including Volume 0, Chapter 0, HS, numbered volumes), implicit numbering patterns, and special editions like integrales (`INT`) and range packs (`PACK`).
- Click on a file name to toggle its checkbox and copy its ed2k link immediately.
- Batch rename with three modes — plain text, regex (`/pattern/flags`, `$1`/`$2` capture groups) and template (`{name}`, `{ext}`, `{tome}`, `{n}` sequential counter, all supporting zero-padding like `{n:03}`) — with a live before/after preview so you see exactly what will change before applying it to the selection or the filtered list, plus one-click undo.
- Clean modal interface with bulk selection, Shift+click range selection, regex search, and min/max size filters that accept human friendly values (`10MB`, `2GB`, etc.).
- Import hash lists from external files (`.csv`, `.json`, `.txt`, etc., UTF-8 or UTF-16) to compare against the current page, display known/new counts, and select only new links in one click. Select several files at once and they're merged into a single list; `Exporter liste de hash` backs up the current list as a sorted, one-hash-per-line `.txt` file.
- A **Session / Persistante** switch controls how the imported hash list is kept, defaulting to `Session`: it holds the list in memory only for this window (nothing written to disk, gone on reload). Switch to `Persistante` to save it through Tampermonkey storage instead, shared across every site; your choice is remembered for next time. Switching modes never deletes anything by itself — only the explicit `Effacer comparaison` button does (with a confirmation), and only for the currently active mode.
- `Nouveaux seulement` filter toggle hides links already in the imported hash list, and `Dédupliquer (hash)` collapses links that point to the same file (identical hash) down to the first one found.
- Large import handling is optimized with background parsing so files containing 10k+ hashes remain smooth to load.
- Cleaner top toolbar with clear priorities: `Sélectionner` dropdown for bulk selection helpers, direct `Copier` + `Tout copier (N)` buttons (the count and both actions follow your current filter/search), and an `Exporter` dropdown for CSV and `.emulecollection`.
- The results table is paginated (1,000 rows at a time by default, adjustable via the compact page-size field next to `Réduire`/`Fermer`) so pages with 10,000+ links stay smooth to search, filter and sort; `Copier tout`/exports still cover every filtered match across all pages, while `Sélectionner` bulk actions apply to the current page (use Shift+click or navigate page by page for a range spanning more than one page).
- Optional **chunked copy**: pick `Paquets de 200 / 500 / 2000` next to `Copier tout` and each click copies the next batch (`Copier paquet 2/5`), so you can stay under eMule's ~500-line log limit and verify each batch before launching the next; the batch size is remembered, and the cursor resets when the filtered list changes.
- Optional **`Fermer après Copier tout`** checkbox (off by default, remembered): closes the window once `Copier tout` succeeds (after the last batch when chunked copy is on).
- Zone picker (`⌖`) also supports a **drag selection**: hold the left mouse button and drag a rectangle over the page to pick every ed2k link it touches, even when they all sit in the same HTML block with no structure separating them.
- Search by name (plain text or `/regex/flags`), or prefix your query with `hash:` to search by ed2k hash instead.
- A live selection counter in the header so you always see how many links are checked.
- Copy helpers for the checked links or for the currently filtered list, plus exports to CSV (`name,size,link`, UTF-8 with BOM, safe against spreadsheet formula injection) and `.emulecollection` (exports use the selection when it exists, otherwise the filtered list; you're warned before anything over 1024 links gets truncated).
- Automatic decoding of encoded filenames (with a Latin-1 fallback for the rare non-UTF-8 name) and readable size displays in B/KB/MB/GB/TB, with exact bytes in the tooltip; size filters accept `10MB`, `2GB`, `10Mo`, `1.5GiB`, etc.
- Context menu (right click the launcher button) to reposition or resize the button and reset preferences; Tampermonkey menu commands let you reopen the panel or toggle the button's visibility even when it's hidden.
- Fully documented codebase in English so outside contributors can understand the logic quickly.

## Requirements
- A browser with Tampermonkey (recommended) or any compatible userscript manager installed.
- Internet access the first time you install the script so Tampermonkey can fetch `ed2k-manager.js` from GitHub.

## Installation (about 5 minutes)
### Method 1 - Direct install (recommended)
1. Install the Tampermonkey extension for your browser:
   - [Brave/Edge](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
2. Click **[Install ed2k Manager](https://raw.githubusercontent.com/L-at-nnes/ed2k-Manager/main/ed2k-manager.js)**.
3. Tampermonkey opens an install dialog; press **Install**.
4. Reload any page that contains ed2k links. A small "ed2k" button appears in the lower right corner.

### Method 2 - Manual install
1. Install Tampermonkey if you have not already done so.
2. Open the Tampermonkey dashboard and click **+** / **Add a new script**.
3. Copy the full contents of [`ed2k-manager.js`](https://raw.githubusercontent.com/L-at-nnes/ed2k-Manager/main/ed2k-manager.js).
4. Paste the code into the Tampermonkey editor and save (Ctrl+S).
5. Reload any target page; the "ed2k" launcher button becomes available.

Tampermonkey automatically checks GitHub for new releases, so you do not need to reinstall after future updates.

## Using ed2k Manager
1. Browse to a page that lists ed2k links and click the floating "ed2k" button.
2. Review the list of detected links in the modal window. The badge reflects the total number of links, the header shows how many are selected, and the Tome column is used by default for sorting.
3. Type text or a regex such as `/S01E02/i` in the search bar to narrow the list. Use **Min/Max** inputs to filter by size.
4. Use **Sélectionner** (dropdown) for bulk actions such as select all / deselect all.
5. If you keep an inventory file of existing hashes, click **Charger hash** and load your file (`.csv`, `.json`, `.txt`, etc.). The panel shows known/new counts and marks each row as already owned or new. The switch defaults to **Session** (memory only, gone on reload); flip it to **Persistante** to save via Tampermonkey instead (available on every site). Only **Effacer comparaison** ever deletes it, and only for the active mode.
6. Click **Nouveaux** to check only links whose hash is not present in the imported file.
7. Select individual rows manually, use **Shift+click** to select a range, or click directly on a file name to toggle selection and copy that single link.
8. Use **Copier** for the current selection and **Tout copier (N)** for every link currently shown by your filter/search.
9. Open **Exporter** (dropdown) to export as `ed2k-links.csv` or `.emulecollection` (exports use the selection when it exists, otherwise the filtered list).
10. Close the window by clicking **Fermer**, pressing **Esc**, or toggling the launcher button again — copying links no longer closes the window (unless you enable `Fermer après Copier tout`), so you can keep working with your selection afterward.
11. To grab only part of a page, click the `⌖` zone picker: hover and use the mouse wheel to widen/narrow the detected zone then click, or hold the left button and drag a rectangle around exactly the links you want.

## Automatic Updates
The script is served directly from GitHub. Tampermonkey checks the canonical URL on a schedule and replaces the local copy whenever a new version is published. As long as the userscript is enabled, you will silently receive the latest UI tweaks and bug fixes.

## Troubleshooting
- **Button does not show:** Confirm the script is enabled in Tampermonkey and reload the page. Some sites require a hard refresh (Ctrl+F5). If you previously hid the button, use the Tampermonkey menu command **Afficher/masquer le bouton** (or **Ouvrir ed2k Manager**) from the extension's icon menu to bring it back.
- **Clipboard copy fails:** Refresh the tab; a few browsers restrict clipboard access until the page gains focus after installing a script.
- **Imported file shows `0 hash`:** Ensure the file really contains ED2K-style hashes (32 hexadecimal characters). The parser scans raw content (UTF-8 or UTF-16) and extracts every matching hash token.
- **Session/Persistante switch is locked/disabled:** Tampermonkey's `GM_setValue`/`GM_getValue` are unavailable in your userscript manager, so `Persistante` mode can't work; hash comparison still works normally in `Session` mode.

## Roadmap and Community
Planned next step: an FR/EN language toggle. Feel free to open an issue to discuss ideas or report bugs, and every suggestion helps shape the next milestone.

## Contributing
Pull requests are welcome for bug fixes, enhancements, documentation, or translation improvements. The code comments and docstrings are written in English. If you add UI strings, please keep them easy to translate, and include screenshots or short clips when proposing interface changes.

---
Happy collecting, and thank you for helping the ed2k ecosystem stay organized!
