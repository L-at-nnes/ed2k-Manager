# ed2k Manager - README (English)

> Need the French version? Read [README_FR.md](README_FR.md) for the complete translation.

[![Version](https://img.shields.io/badge/version-1.2.1-blue.svg)](https://github.com/L-at-nnes/ed2k-Manager)
[![Auto-update](https://img.shields.io/badge/auto--update-enabled-brightgreen.svg)](https://github.com/L-at-nnes/ed2k-Manager/blob/main/ed2k-manager.js)

## Overview
ed2k Manager is a lightweight userscript for Tampermonkey or Violentmonkey that scans any web page for `ed2k://` links and presents them in a floating control panel. Detection is robust (including percent-encoded ed2k links), and tome extraction is now much more capable: it recognizes explicit markers (`T01`, `Tome 39`, `HS2`), implicit layouts (`- 01 -`, `.02.`, `02 (sur 3)`), and special editions like integrales and packs. From there you can search, filter by size, select items, copy the exact list of links, or export the results for later use. The script runs entirely inside the browser, stores preferences locally, and keeps itself up to date.

## Features at a Glance
- Robust detection of ed2k links on the active page, including percent-encoded links such as `ed2k://%7Cfile%7C...`, with a badge that shows the number of matches.
- Advanced tome extraction with a dedicated column and a default sort that brings the highest tome to the top while keeping unknown tomes at the end.
- Tome extraction handles explicit markers, implicit numbering patterns, and special editions like integrales (`INT`) and range packs (`PACK`).
- Click on a file name to toggle its checkbox and copy its ed2k link immediately.
- Clean modal interface with bulk selection, Shift+click range selection, regex search, and min/max size filters that accept human friendly values (`10MB`, `2GB`, etc.).
- A live selection counter in the header so you always see how many links are checked.
- Copy helpers for the checked links or for the whole list, plus exports to CSV (`name,size,link`) and `.emulecollection` (exports use the selection when it exists, otherwise the full list).
- Automatic decoding of encoded filenames along with readable size displays (bytes are shown in the tooltip for accuracy).
- Context menu (right click the launcher button) to reposition or resize the button and reset preferences.
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
4. Select individual rows, use **Shift+click** to select a range, or click **Select all**. You can also click directly on a file name to toggle selection and copy that single link.
5. Choose **Copy selection** to send the selected links to the clipboard, **Copy all** for every link, **Export CSV** to download `ed2k-links.csv`, or **Export .emulecollection**. Both exports use the selection when it exists, otherwise they export the full list.
6. Close the window by clicking **Close**, pressing **Esc**, or toggling the launcher button again.

## Automatic Updates
The script is served directly from GitHub. Tampermonkey checks the canonical URL on a schedule and replaces the local copy whenever a new version is published. As long as the userscript is enabled, you will silently receive the latest UI tweaks and bug fixes.

## Troubleshooting
- **Button does not show:** Confirm the script is enabled in Tampermonkey and reload the page. Some sites require a hard refresh (Ctrl+F5).
- **Clipboard copy fails:** Refresh the tab; a few browsers restrict clipboard access until the page gains focus after installing a script.
- **Layout issues on very long lists:** See the TODO-LIST section at the end of this README for planned performance and UI improvements.

## Roadmap and Community
The roadmap is summarized in the TODO-LIST section at the end of this README. Feel free to open an issue to discuss ideas or report bugs, and every suggestion helps shape the next milestone.

## Contributing
Pull requests are welcome for bug fixes, enhancements, documentation, or translation improvements. The code comments and docstrings are written in English. If you add UI strings, please keep them easy to translate, and include screenshots or short clips when proposing interface changes.

---
Happy collecting, and thank you for helping the ed2k ecosystem stay organized!
