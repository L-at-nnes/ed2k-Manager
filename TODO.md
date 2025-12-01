# TO-DO List - ed2k Manager

## Phase 0: UI overhaul
- [ ] **Completely rebuild the UI** for better structure and UX
- [ ] **"Open in a new tab" button** so the userscript can run inside a dedicated tab with more room
  - Standalone page layout
  - Transfer of every detected link to the new tab
  - Optional two-way synchronization if required

---

## Phase 1: Tab system

### 1.1 Main tab (detected links)
- [ ] List every ed2k link detected on the current page
- [ ] **Visible red marker** on links that already exist in history
  - Clear badge or icon (e.g., red pill or download icon)
  - Immediate visual cue
- [ ] Keep every current feature (selection, sorting, filters)

### 1.2 History tab
- [ ] **Persistent, reliable storage** (localStorage + IndexedDB fallback)
  - Survives script updates
  - Survives browser cache clearing
  - Automatically migrates to future schema versions
- [ ] **Display every copied link** with metadata:
  - Copy date and time
  - File name
  - Size
  - MD4 hash
  - Source URL (origin page)
- [ ] **History tab capabilities**
  - [ ] Copy one or more links from history
  - [ ] Filter by name / size / date
  - [ ] Sort by date, name, or size (asc/desc)
  - [ ] Search with **regex support** (same as the main tab)
  - [ ] Multi-select with checkboxes
  - [ ] Clear the entire history (with confirmation)
  - [ ] Delete individual entries
  - [ ] Export history (CSV, JSON)
- [ ] **Visible counter** such as "History: 1 247 links" at the top of the tab

---

## Phase 2: Real-time statistics

- [ ] **Statistics bar at the bottom of the main tab**
  - Total number of links found
  - Number of links filtered / displayed
  - Number of selected links
  - **Total size of selected links** (e.g., "3 selected files — 4.2 GB")
  - **Total size of all displayed links**
  - **No per-file-type breakdown** (too noisy)
- [ ] Live updates when filters or selections change
- [ ] Subtle but visible design

---

## Phase 3: Duplicate detection

- [ ] **Automatic detection** of links with the same MD4 hash
- [ ] **Visual "Duplicate" badge** or icon
- [ ] **Filtering options**
  - Hide duplicates (keep the first occurrence only)
  - Show every duplicate
  - Visually group duplicates
- [ ] Counter such as "X duplicates detected"

---

## Phase 4: eMule collection export

- [ ] **"Export .emulecollection" button**
  - Generate an `.emulecollection` file (native eMule/aMule XML format)
  - Double-clicking the file should import it in the client
- [ ] **History tab option** to export the entire history as `.emulecollection`
- [ ] Include metadata (AICH hash when available)

---

## Phase 5: Keyboard shortcuts

- [ ] Implement shortcuts:
  - `Ctrl+A`: Select all
  - `Ctrl+D`: Deselect all
  - `Ctrl+C`: Copy selection
  - `Ctrl+F`: Focus the search bar
  - `Escape`: Close the modal (already implemented)
  - `Ctrl+H`: Switch to the History tab
  - `Ctrl+Shift+Delete`: Clear history (with confirmation)
- [ ] **Shortcut reference**
  - Help page reachable via `?` or a dedicated Help button
  - Full list of shortcuts with descriptions
  - Displayed as an overlay or within a dedicated tab

---

## Phase 6: Advanced range selection

- [ ] **Shift + click**: select a range of files (from the previous click to the current click)
- [ ] **Ctrl + click**: toggle individual selection without affecting others
- [ ] Behavior identical to Windows/macOS file explorers
- [ ] Visual cue while hovering within a range selection

---

## Phase 7: Enriched copy (discrete options)

- [ ] **Discrete context menu** or inline options on the "Copy" button
  - Copy links only (current default)
  - Copy with names: `File name.mkv\ned2k://...`
  - Copy file names only
  - Copy MD4 hashes only
- [ ] Remember the user preference

---

## Phase 8: Search by MD4 hash

- [ ] **Dedicated search field** for MD4 hashes (32 hexadecimal characters)
- [ ] Auto-detect when the input is a hash
- [ ] Exact search inside the list
- [ ] Alert when the hash is not found

---

## Phase 9: View modes

- [ ] **Table view** (current layout) with every column
- [ ] **Compact list view**
  - One row per file
  - Layout: checkbox | name | size | actions
  - More rows visible on screen
- [ ] **Grid view**
  - Cards with icons by file type
  - Visual summary (name, size, type)
  - Selection by clicking the card
- [ ] Toggle button between modes (clear icons)
- [ ] Remember the preferred mode

---

## Phase 10: Additional themes

- [ ] Currently only the "Ocean" theme is available
- [ ] **Add new themes**
  - [ ] Dark Pure (matte black)
  - [ ] Light (white)
  - [ ] Solarized Dark
  - [ ] Solarized Light
  - [ ] Matrix (green on black)
  - [ ] Nord
  - [ ] Dracula
- [ ] **Theme picker in the context menu** (right-click on the button)
- [ ] Persist the selected theme

---

## Phase 11: Search highlighting

- [ ] **Highlight matching terms** (yellow or configurable color) inside results
- [ ] Highlight:
  - File name
  - Link (when the search targets the link)
- [ ] Regex support
- [ ] Automatically disable highlighting when the search is empty

---

## Phase 12: External API integration

- [ ] **"Search on FileDonkey" button** (or other ed2k catalogs)
  - Opens a new tab with the search results
  - Pass file name or hash
- [ ] **"Check availability" button**
  - Call an API to confirm if the file is still available
  - Display the number of sources when available
- [ ] **Integrate other ed2k databases**
  - Fetch additional metadata
  - Validate reputation (avoid fake files)
  - Suggest similar files
- [ ] Discreet icon buttons next to each link
- [ ] Handle API failures (timeout, downtime)

---

## Phase 13: Technical improvements

- [ ] Performance optimizations for large lists (> 1,000 links)
- [ ] Table virtualization if needed
- [ ] Cross-browser compatibility tests (Chrome, Firefox, Edge)
- [ ] Data migrations between versions (storage versioning system)
- [ ] Robust error handling
- [ ] Debug logs (toggle via setting)

---

## Phase 14: Documentation

- [ ] Update README.md with every new feature
- [ ] Screenshots for each mode/tab
- [ ] Full user guide
- [ ] FAQ
- [ ] Detailed changelog

---

## Feature summary

| # | Feature | Status | Priority |
|---|---------|--------|----------|
| 0 | UI redesign + new tab button | Todo | Critical |
| 1 | Complete history with dedicated tab | Todo | Critical |
| 2 | Real-time statistics | Todo | High |
| 3 | Duplicate detection | Todo | High |
| 5 | .emulecollection export | Todo | Medium |
| 6 | Keyboard shortcuts + guide | Todo | Medium |
| 7 | Range selection (Shift+click) | Todo | Critical |
| 8 | Enriched copy (discreet) | Todo | Low |
| 9 | MD4 hash search | Todo | Low |
| 11 | View modes (table/list/grid) | Todo | Medium |
| 13 | Additional themes | Todo | High |
| 14 | Search highlighting | Todo | High |
| 20 | External API integration | Todo | Medium |

---

## Recommended implementation order

1. **Phase 0**: UI redesign + new-tab button (foundation)
2. **Phase 1**: Tab system + History (core feature)
3. **Phase 7**: Range selection (critical UX)
4. **Phase 2**: Real-time statistics
5. **Phase 3**: Duplicate detection
6. **Phase 10**: Additional themes
7. **Phase 11**: Search highlighting
8. **Phase 5**: Keyboard shortcuts + guide
9. **Phase 9**: View modes
10. **Phase 4**: .emulecollection export
11. **Phase 6**: Enriched copy
12. **Phase 8**: MD4 hash search
13. **Phase 12**: External API integration
14. **Phase 13**: Technical optimizations
15. **Phase 14**: Full documentation

---

## Important notes

- **Persistent storage**: use `localStorage` first, fall back to `IndexedDB` for large datasets
- **Storage versioning**: store key `ed2k_storage_version` to handle migrations
- **Compatibility**: test on Chrome, Firefox, Edge (Tampermonkey / Violentmonkey / Greasemonkey)
- **Performance**: virtualize the table when > 500-1,000 rows
- **UX**: every action must provide clear visual feedback
- **Preferences**: persist all user settings (theme, view, shortcuts, etc.)

---

**Last updated**: 13 November 2025  
**Target version**: 2.0.0
