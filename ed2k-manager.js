// ==UserScript==
// @name         ed2k Manager
// @namespace    Userscript
// @version      1.2.0
// @description  Reveal ed2k links on any page with robust ed2k decoding and advanced tome/integrale extraction.
// @author       L@nnes
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/L-at-nnes/ed2k-Manager/main/ed2k-manager.js
// @downloadURL  https://raw.githubusercontent.com/L-at-nnes/ed2k-Manager/main/ed2k-manager.js
// ==/UserScript==

(function () {
    'use strict';

    // Only run in the top-level window, not in iframes (avoids duplicate buttons in forum editors)
    if (window.self !== window.top) return;

    // === Configuration ===
    const STORAGE_KEY = 'ed2k_revealer_prefs_v1';

    // === Utilities ===
    function savePrefs(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
    function loadPrefs() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; } }

    // keep only button visibility in prefs; theme fixed to ocean
    const prefs = Object.assign({ showButton: true, btnPos: 'bottom-right' }, loadPrefs());

    // ed2k detection: capture full candidates, then normalize/parse
    const ED2K_PREFIX = 'ed2k://';
    const ED2K_BASE_REGEX = /^ed2k:\/\/\|file\|([^|]+)\|([0-9]+)\|([a-fA-F0-9]{32})\|/i;
    const ED2K_CANDIDATE_REGEX = /ed2k:\/\/[^\s<>"']+/gi;

    function decodeFileName(raw) {
        try {
            // some names are URL-encoded
            let s = raw.replace(/\+/g, ' ');
            s = decodeURIComponent(s);
            s = s.replace(/\s+/g, ' ').trim();
            return s;
        } catch (e) { return raw; }
    }

    function safeDecodeURIComponent(value) {
        try { return decodeURIComponent(value); } catch (e) { return value; }
    }

    function decodeEd2kLink(rawLink) {
        const trimmed = String(rawLink || '').trim();
        if (!trimmed || trimmed.indexOf('%') === -1) return trimmed;
        // Many sites encode pipes as %7C; decode them first, then try full decode.
        const pipeDecoded = trimmed.replace(/%7C/gi, '|');
        return safeDecodeURIComponent(pipeDecoded);
    }

    function stripTrailingPunctuation(candidate) {
        // Remove common trailing punctuation that may follow a link in plain text.
        return String(candidate || '').replace(/[)\].,!?:;]+$/g, '');
    }

    function ensureTrailingSlash(link) {
        if (!link) return link;
        return link.endsWith('/') ? link : `${link}/`;
    }

    function buildItemFromLink(rawLink) {
        const cleaned = stripTrailingPunctuation(rawLink);
        if (!cleaned || cleaned.toLowerCase().indexOf(ED2K_PREFIX) !== 0) return null;
        const decoded = ensureTrailingSlash(decodeEd2kLink(cleaned));
        const normalizedLink = decoded.replace(/^ed2k:\/\//i, ED2K_PREFIX);
        const match = normalizedLink.match(ED2K_BASE_REGEX);
        if (!match) return null;
        const name = decodeFileName(match[1]);
        const tomeInfo = extractTomeNumber(name);
        return {
            name,
            link: normalizedLink,
            size: match[2],
            hash: String(match[3] || '').toLowerCase(),
            tomeDisplay: tomeInfo.display,
            tomeSortValue: tomeInfo.sortValue,
        };
    }

    function findEd2kLinks() {
        const found = new Map(); // key by normalized link

        function addCandidate(rawLink) {
            const item = buildItemFromLink(rawLink);
            if (!item) return;
            if (!found.has(item.link)) found.set(item.link, item);
        }

        // 1) anchors with ed2k hrefs (including percent-encoded pipes)
        document.querySelectorAll('a[href]').forEach(a => {
            // Exclude our own UI elements
            if (a.closest('.ed2k-rev-btn') || a.closest('.ed2k-rev-modal')) return;
            const href = a.getAttribute('href') || '';
            if (href.toLowerCase().indexOf(ED2K_PREFIX) !== 0) return;
            addCandidate(href);
        });

        // 2) plain text nodes containing ed2k links
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
                    if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'noscript' || tag === 'input') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Exclude our own UI elements (button, modal, badge)
                    if (parent.closest('.ed2k-rev-btn') || parent.closest('.ed2k-rev-modal')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        let node;
        while ((node = walker.nextNode())) {
            const text = node.nodeValue;
            if (!text || text.toLowerCase().indexOf(ED2K_PREFIX) === -1) continue;
            const matches = text.match(ED2K_CANDIDATE_REGEX);
            if (!matches) continue;
            matches.forEach(addCandidate);
        }

        return Array.from(found.values());
    }

    // === UI creation ===
    const CSS = `
    /* Strong, self-contained styles to avoid being overridden by page CSS */
    .ed2k-rev-btn{position:fixed;z-index:9999999;right:18px;bottom:18px;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#5fd6f6,#60a5fa);box-shadow:0 8px 30px rgba(2,6,23,0.6);cursor:pointer;color:#041423;border:none}
    .ed2k-rev-btn svg{filter:drop-shadow(0 1px 0 rgba(255,255,255,0.06));}
    .ed2k-logo{font-weight:800;color:#022;letter-spacing:0.6px;font-family:Inter,Segoe UI,Roboto,Arial;font-size:16px;background:linear-gradient(90deg,#e6fbff,#7dd3fc);-webkit-background-clip:text;background-clip:text;color:transparent;text-transform:lowercase}
    .ed2k-rev-btn .ed2k-logo-wrap{display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), transparent 40%);}
    .ed2k-rev-modal{position:fixed;right:24px;bottom:88px;z-index:9999998;width:880px;max-width:calc(100% - 48px);max-height:80vh;background:#07101a;border-radius:12px;padding:14px;box-shadow:0 20px 60px rgba(2,6,23,0.8);overflow:hidden;display:flex;flex-direction:column;color:#e6eef8;font-family:system-ui,Segoe UI,Roboto,Arial}
    .ed2k-rev-header{display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.04);} 
    .ed2k-rev-title{font-weight:700;color:#7dd3fc;font-size:14px}
    .ed2k-rev-selection{font-size:12px;color:#bfefff;opacity:0.95;padding:4px 8px;border:1px solid rgba(255,255,255,0.06);border-radius:999px;background:rgba(255,255,255,0.04)}
    .ed2k-rev-toolbar{margin-left:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .ed2k-rev-search{padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.02);color:#cfe8f6;min-width:260px}
    .ed2k-size-input{padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.02);color:#cfe8f6;width:110px}
    .ed2k-size-row{display:flex;gap:6px;align-items:center}
    .ed2k-btn{min-width:88px;text-align:center}
    .ed2k-rev-list{overflow:auto;padding:8px;flex:1;background:transparent}
    table.ed2k-table{width:100%;border-collapse:collapse;font-size:13px;color:#cfe8f6}
    table.ed2k-table th, table.ed2k-table td{padding:10px 8px;border-bottom:1px dashed rgba(255,255,255,0.03);}
    table.ed2k-table th{color:#9aa4b2;text-align:left;font-size:12px}
    .ed2k-row-name{color:#e6eef8;font-weight:600}
    .ed2k-controls{display:flex;gap:8px}
    .ed2k-btn{padding:6px 10px;border-radius:8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);color:#cfe8f6;cursor:pointer}
    .ed2k-btn.primary{background:linear-gradient(90deg,#5fd6f6,#60a5fa);color:#022;border:none}
    .ed2k-empty{padding:28px;text-align:center;color:#9aa4b2}
    a.ed2k-link{color:#7dd3fc;text-decoration:none}

    /* Badge on the floating button */
    .ed2k-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 6px;border-radius:999px;background:#021827;color:#9ef;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 6px 14px rgba(2,6,23,0.5)}

    /* Ocean theme only (fixed) */
    .ed2k-rev-modal{background:linear-gradient(180deg,#062a3a,#023f4f);color:#e6fbff}
    .ed2k-rev-title{color:#8fe7ff}
    table.ed2k-table th{color:#b6e6f4}
    .ed2k-btn{background:rgba(255,255,255,0.03);color:#e6fbff;border:1px solid rgba(255,255,255,0.04)}
    .ed2k-btn.primary{background:linear-gradient(90deg,#2ad0e6,#60a5fa);color:#012}
    .ed2k-rev-search{background:rgba(255,255,255,0.02);color:#e6fbff;border:1px solid rgba(255,255,255,0.04)}
     /* Credit / footer link: red by default, violet on hover. Use !important to avoid page CSS overrides.
         SVG fill is forced too so the icon follows the color. */
     .ed2k-credit{display:inline-flex;align-items:center;gap:8px;color:#ff4d4d !important;text-decoration:none;font-size:12px}
     .ed2k-credit svg{width:16px;height:16px;fill:currentColor !important;opacity:0.95}
     .ed2k-credit:hover, .ed2k-credit:focus{color:#8b5cf6 !important}
     .ed2k-credit:hover svg, .ed2k-credit:focus svg{fill:currentColor !important}
    `;

    GM_addStyle(CSS);

    // create button
    const btn = document.createElement('button');
    btn.className = 'ed2k-rev-btn';
    btn.title = 'Afficher les liens ed2k';
    // stylized ed2k logo inside the button
    btn.innerHTML = '<div class="ed2k-logo-wrap"><span class="ed2k-logo">ed2k</span></div>';

    // helpers to apply position and size from prefs
    function applyButtonPosition() {
        const pos = prefs.btnPos || 'bottom-right';
        // reset
        btn.style.top = '';
        btn.style.bottom = '';
        btn.style.left = '';
        btn.style.right = '';
        switch(pos){
            case 'top-left': btn.style.top = '18px'; btn.style.left = '18px'; break;
            case 'top-right': btn.style.top = '18px'; btn.style.right = '18px'; break;
            case 'bottom-left': btn.style.bottom = '18px'; btn.style.left = '18px'; break;
            default: btn.style.bottom = '18px'; btn.style.right = '18px'; break;
        }
    }

    function applyButtonSize(){
        const size = prefs.btnSize || 'normal';
        let dim = 56;
        if (size === 'small') dim = 40; else if (size === 'large') dim = 72;
        btn.style.width = dim + 'px'; btn.style.height = dim + 'px';
        // adjust svg inside
        const svg = btn.querySelector('svg'); if (svg) { svg.setAttribute('width', Math.round(dim*0.4)); svg.setAttribute('height', Math.round(dim*0.4)); }
    }

    // Don't append button yet - wait to see if there are links
    // apply initial prefs
    try { applyButtonPosition(); applyButtonSize(); } catch(e){}

    // modal
    let modal = null;
    let buttonAppended = false;

    function buildModal(items) {
        if (modal) modal.remove();
    modal = document.createElement('div');
    modal.className = 'ed2k-rev-modal';

        const header = document.createElement('div'); header.className = 'ed2k-rev-header';
        const title = document.createElement('div'); title.className = 'ed2k-rev-title'; title.textContent = `ed2k — ${items.length} trouvé(s)`;
        header.appendChild(title);
        const selectionInfo = document.createElement('div'); selectionInfo.className = 'ed2k-rev-selection'; selectionInfo.textContent = 'Sélection: 0';
        header.appendChild(selectionInfo);

            const toolbar = document.createElement('div'); toolbar.className = 'ed2k-rev-toolbar';
            
    const search = document.createElement('input'); search.className = 'ed2k-rev-search'; search.placeholder = 'Filtrer par nom (ou /regex/flags) ...';
    const selectAllBtn = document.createElement('button'); selectAllBtn.className = 'ed2k-btn'; selectAllBtn.textContent = 'Tout sélectionner';
    const deselectAllBtn = document.createElement('button'); deselectAllBtn.className = 'ed2k-btn'; deselectAllBtn.textContent = 'Tout déselectionner';
    const copyBtn = document.createElement('button'); copyBtn.className = 'ed2k-btn primary'; copyBtn.textContent = 'Copier sélection';
    const copyAllBtn = document.createElement('button'); copyAllBtn.className = 'ed2k-btn'; copyAllBtn.textContent = 'Copier tout';
    const exportBtn = document.createElement('button'); exportBtn.className = 'ed2k-btn'; exportBtn.textContent = 'Exporter CSV';
    const exportCollectionBtn = document.createElement('button'); exportCollectionBtn.className = 'ed2k-btn'; exportCollectionBtn.textContent = 'Exporter .emulecollection';

    // size filters UI
    const sizeRow = document.createElement('div'); sizeRow.className = 'ed2k-size-row';
    const minInput = document.createElement('input'); minInput.className = 'ed2k-size-input'; minInput.placeholder = 'Min (ex: 10MB)';
    const maxInput = document.createElement('input'); maxInput.className = 'ed2k-size-input'; maxInput.placeholder = 'Max (ex: 2GB)';
    const clearSizeBtn = document.createElement('button'); clearSizeBtn.className = 'ed2k-btn'; clearSizeBtn.textContent = 'Effacer taille';
    sizeRow.appendChild(minInput); sizeRow.appendChild(maxInput); sizeRow.appendChild(clearSizeBtn);

    toolbar.appendChild(search);
    // put size filters next to search
    toolbar.appendChild(sizeRow);
    toolbar.appendChild(selectAllBtn); toolbar.appendChild(deselectAllBtn); toolbar.appendChild(copyBtn); toolbar.appendChild(copyAllBtn); toolbar.appendChild(exportBtn); toolbar.appendChild(exportCollectionBtn);
        header.appendChild(toolbar);

        const list = document.createElement('div'); list.className = 'ed2k-rev-list';

    const table = document.createElement('table'); table.className = 'ed2k-table';
    const thead = document.createElement('thead'); thead.innerHTML = '<tr><th style="width:36px"><input type="checkbox" id="ed2k-master"></th><th data-col="tome" style="width:60px;text-align:center">Tome</th><th data-col="name">Nom</th><th data-col="size" style="width:120px;text-align:right">Taille</th><th style="width:360px">Lien</th></tr>';
        const tbody = document.createElement('tbody');

        // Selection state persists across re-renders and enables Shift+click range selection.
        const selectedLinks = new Set();
        let lastClickedLink = null;

        function getVisibleCheckboxes() {
            return Array.from(modal.querySelectorAll('tbody input.ed2k-row-cb'));
        }

        function getSelectedItems() {
            return items.filter(it => selectedLinks.has(it.link));
        }

        function setCheckedAndTrack(cb, checked) {
            cb.checked = checked;
            const link = cb.dataset.link;
            if (!link) return;
            if (checked) {
                selectedLinks.add(link);
            } else {
                selectedLinks.delete(link);
            }
        }

        function syncSelectedFromVisible() {
            getVisibleCheckboxes().forEach(cb => {
                const link = cb.dataset.link;
                if (!link) return;
                if (cb.checked) {
                    selectedLinks.add(link);
                } else {
                    selectedLinks.delete(link);
                }
            });
        }

        function setAllVisible(checked) {
            getVisibleCheckboxes().forEach(cb => setCheckedAndTrack(cb, checked));
            updateMasterCheckbox();
        }

        function getVisibleIndexByLink(link) {
            if (!link) return -1;
            const boxes = getVisibleCheckboxes();
            return boxes.findIndex(cb => cb.dataset.link === link);
        }

        function applyRangeSelection(startIdx, endIdx, checked) {
            const boxes = getVisibleCheckboxes();
            if (!boxes.length) return;
            const start = Math.max(0, Math.min(startIdx, endIdx));
            const end = Math.min(boxes.length - 1, Math.max(startIdx, endIdx));
            for (let i = start; i <= end; i += 1) {
                setCheckedAndTrack(boxes[i], checked);
            }
        }

        function handleCheckboxClick(cb, evt) {
            const boxes = getVisibleCheckboxes();
            const targetIdx = boxes.indexOf(cb);
            const targetChecked = !!cb.checked;
            if (evt && evt.shiftKey && lastClickedLink) {
                const anchorIdx = getVisibleIndexByLink(lastClickedLink);
                if (anchorIdx !== -1 && targetIdx !== -1) {
                    applyRangeSelection(anchorIdx, targetIdx, targetChecked);
                    updateMasterCheckbox();
                    return;
                }
            }
            setCheckedAndTrack(cb, targetChecked);
            updateMasterCheckbox();
        }

        function renderRows(query) {
            // Persist any manual checkbox changes before rebuilding the table.
            syncSelectedFromVisible();
            tbody.innerHTML = '';
            const frag = document.createDocumentFragment();
            const filterFn = makeFilterFromQuery(query || '');
            // apply size filters as well
            const minBytes = parseSize(minInput.value);
            const maxBytes = parseSize(maxInput.value);

            const filtered = items.filter(it => {
                if (!filterFn(it)) return false;
                const sizeNum = parseInt(it.size||0,10) || 0;
                if (minBytes != null && sizeNum < minBytes) return false;
                if (maxBytes != null && sizeNum > maxBytes) return false;
                return true;
            }).slice();
            filtered.sort((a, b) => {
                if (sortState.col === 'tome') {
                    const aMissing = !Number.isFinite(a.tomeSortValue);
                    const bMissing = !Number.isFinite(b.tomeSortValue);
                    // Always keep items without tome information at the end.
                    if (aMissing && !bMissing) return 1;
                    if (bMissing && !aMissing) return -1;
                    if (!aMissing && !bMissing && a.tomeSortValue !== b.tomeSortValue) {
                        return sortState.dir * (a.tomeSortValue - b.tomeSortValue);
                    }
                    return a.name.localeCompare(b.name);
                }
                if (sortState.col === 'name') return sortState.dir * a.name.localeCompare(b.name);
                if (sortState.col === 'size') {
                    const aSize = parseInt(a.size || 0, 10) || 0;
                    const bSize = parseInt(b.size || 0, 10) || 0;
                    if (aSize !== bSize) return sortState.dir * (aSize - bSize);
                    return a.name.localeCompare(b.name);
                }
                return 0;
            });
            // update title count dynamically
            try { title.textContent = `ed2k — ${filtered.length} trouvé(s)`; } catch(e){}
            filtered.forEach((it, idx) => {
                const tr = document.createElement('tr');
                const cbTd = document.createElement('td');
                const cb = document.createElement('input'); cb.type = 'checkbox'; cb.dataset.link = it.link; cb.className = 'ed2k-row-cb';
                cb.checked = selectedLinks.has(it.link);
                cb.addEventListener('click', (evt) => {
                    handleCheckboxClick(cb, evt);
                    lastClickedLink = cb.dataset.link || null;
                });
                cbTd.appendChild(cb);
                const tomeTd = document.createElement('td');
                tomeTd.style.textAlign = 'center';
                tomeTd.innerHTML = `<div style='font-weight:600;color:#8fe7ff'>${escapeHtml(it.tomeDisplay || '')}</div>`;

                const nameTd = document.createElement('td');
                const nameDiv = document.createElement('div');
                nameDiv.className = 'ed2k-row-name';
                nameDiv.textContent = it.name;
                nameDiv.style.cursor = 'pointer';
                nameDiv.title = 'Cliquer pour copier le lien';
                nameDiv.addEventListener('click', async (evt) => {
                    cb.checked = !cb.checked;
                    handleCheckboxClick(cb, evt);
                    lastClickedLink = cb.dataset.link || null;
                    const copied = await copyTextToClipboard(it.link);
                    if (!copied) return;
                    const origBg = tr.style.background;
                    tr.style.background = 'rgba(95, 214, 246, 0.15)';
                    setTimeout(() => { tr.style.background = origBg; }, 300);
                });
                nameTd.appendChild(nameDiv);
                const sizeTd = document.createElement('td'); sizeTd.style.textAlign = 'right';
                // show size in MB (fixed) and keep raw bytes in tooltip
                const _bytes_val = parseInt(it.size || 0, 10) || 0;
                const _mb_display = _bytes_val ? ( (_bytes_val / (1024*1024)).toFixed(2) + ' MB') : '';
                sizeTd.innerHTML = `<div style='font-weight:600;color:#cfe8f6' title='${_bytes_val} bytes'>${_mb_display}</div>`;
                const linkTd = document.createElement('td'); linkTd.innerHTML = `<a class='ed2k-link' href='${it.link}' target='_blank' rel='noopener noreferrer'>${shorten(it.link)}</a>`;
                tr.appendChild(cbTd); tr.appendChild(tomeTd); tr.appendChild(nameTd); tr.appendChild(sizeTd); tr.appendChild(linkTd);
                frag.appendChild(tr);
            });
            tbody.appendChild(frag);
            updateMasterCheckbox();
        }

        table.appendChild(thead); table.appendChild(tbody);
        list.appendChild(table);

        const footer = document.createElement('div'); footer.style.padding = '8px'; footer.style.display = 'flex'; footer.style.justifyContent = 'space-between'; footer.style.alignItems = 'center';
        // left: credit link (make it clearly visible)
        const credit = document.createElement('a');
        credit.className = 'ed2k-credit';
        credit.href = 'https://github.com/L-at-nnes';
        credit.target = '_blank';
        credit.rel = 'noopener noreferrer';
        credit.title = 'https://github.com/L-at-nnes';
        credit.style.fontWeight = '600';
        credit.style.opacity = '0.95';
        credit.style.display = 'inline-flex';
        credit.style.alignItems = 'center';
        credit.style.gap = '8px';
        credit.innerHTML = `
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 012.01-.27c.68 0 1.36.09 2.01.27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>L@nnes</span>
        `;
        // right: close button (ensure it closes modal)
        const closeBtn = document.createElement('button'); closeBtn.className = 'ed2k-btn'; closeBtn.textContent = 'Fermer';
        closeBtn.addEventListener('click', () => { try { modal.remove(); modal = null; } catch (e) {} });
        footer.appendChild(credit);
        footer.appendChild(closeBtn);

        modal.appendChild(header); modal.appendChild(list); modal.appendChild(footer);
        document.body.appendChild(modal);

        // helpers
        function updateSelectionInfo() {
            const count = getSelectedItems().length;
            selectionInfo.textContent = `Sélection: ${count}`;
        }

        function updateMasterCheckbox() {
            const master = modal.querySelector('#ed2k-master');
            const boxes = getVisibleCheckboxes();
            updateSelectionInfo();
            if (!boxes.length) { master.checked = false; master.indeterminate = false; return; }
            const checked = boxes.filter(x => x.checked).length;
            master.checked = checked === boxes.length;
            master.indeterminate = checked > 0 && checked < boxes.length;
        }

        // listeners
        modal.querySelector('#ed2k-master').addEventListener('change', (e) => {
            const v = e.target.checked;
            if (!v) selectedLinks.clear();
            setAllVisible(v);
        });

        modal.addEventListener('change', (e) => {
            if (e.target.classList && e.target.classList.contains('ed2k-row-cb')) {
                setCheckedAndTrack(e.target, e.target.checked);
                updateMasterCheckbox();
            }
        });

        selectAllBtn.addEventListener('click', () => setAllVisible(true) );
        deselectAllBtn.addEventListener('click', () => {
            selectedLinks.clear();
            setAllVisible(false);
        });

        copyBtn.addEventListener('click', async () => {
            const selectedItems = getSelectedItems();
            if (!selectedItems.length) { flashButton(copyBtn, 'Aucune sélection'); return; }
            const links = selectedItems.map(it => it.link).join('\n');
            const copied = await copyTextToClipboard(links);
            if (!copied) { flashButton(copyBtn, 'Erreur'); return; }
            flashButton(copyBtn, 'Copié!');
            // close modal after copying selection
            setTimeout(() => { try { modal.remove(); modal = null; } catch(e){} }, 300);
        });

        // copy all links (all items, regardless of checkbox)
        copyAllBtn.addEventListener('click', async () => {
            const links = items.map(it => it.link).join('\n');
            if (!links) { flashButton(copyAllBtn, 'Aucun lien'); return; }
            const copied = await copyTextToClipboard(links);
            if (!copied) { flashButton(copyAllBtn, 'Erreur'); return; }
            flashButton(copyAllBtn, 'Copié tout!');
            setTimeout(() => { try { modal.remove(); modal = null; } catch(e){} }, 300);
        });

        // export CSV
        exportBtn.addEventListener('click', () => {
            try {
                const selectedItems = getSelectedItems();
                const exportItems = selectedItems.length ? selectedItems : items.slice();
                if (!exportItems.length) { flashButton(exportBtn, 'Aucun lien'); return; }
                const header = ['name','size','link'];
                const rows = exportItems.map(it => ["\""+String(it.name).replace(/"/g,'""')+"\"", it.size, it.link].join(','));
                const csv = [header.join(','), ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'ed2k-links.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                flashButton(exportBtn, 'Exporté');
            } catch (e) { flashButton(exportBtn, 'Erreur'); }
        });

        // export .emulecollection (binary) — exports selection if any, otherwise all
        exportCollectionBtn.addEventListener('click', () => {
            try {
                const selectedItems = getSelectedItems();
                const exportItems = selectedItems.length ? selectedItems : items.slice();
                const limitedItems = exportItems.slice(0, 1024);
                const collectionBytes = buildEmuleCollection(limitedItems);
                if (!collectionBytes) {
                    flashButton(exportCollectionBtn, 'Aucun lien valide');
                    return;
                }
                const blob = new Blob([collectionBytes], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ed2k-links.emulecollection';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                flashButton(exportCollectionBtn, 'Exporté');
            } catch (e) {
                flashButton(exportCollectionBtn, 'Erreur');
            }
        });

        function buildEmuleCollection(sourceItems) {
            if (!sourceItems || !sourceItems.length) return null;
            const entries = [];
            sourceItems.forEach(it => {
                const sizeNum = parseInt(it.size || 0, 10) || 0;
                const hashBytes = hexToBytes16(it.hash);
                if (!it.name || !sizeNum || !hashBytes) return;
                const rootHashMatch = String(it.link || '').match(/\|h=([^|]+)\|/i);
                const rootHash = rootHashMatch ? rootHashMatch[1] : '';
                entries.push({
                    name: it.name,
                    size: sizeNum,
                    hashBytes,
                    rootHash,
                });
            });
            if (!entries.length) return null;

            const bytes = [];
            const pushByte = (v) => { bytes.push(v & 0xFF); };
            const pushBytes = (arr) => { for (let i = 0; i < arr.length; i += 1) pushByte(arr[i]); };
            const writeUint16LE = (v) => { pushByte(v); pushByte(v >>> 8); };
            const writeUint32LE = (v) => {
                const n = v >>> 0;
                pushByte(n);
                pushByte(n >>> 8);
                pushByte(n >>> 16);
                pushByte(n >>> 24);
            };
            const writeUint64LE = (v) => {
                let big = BigInt(v);
                if (big < 0) big = 0n;
                for (let i = 0n; i < 8n; i += 1n) {
                    pushByte(Number((big >> (8n * i)) & 0xFFn));
                }
            };
            const encoder = new TextEncoder();
            const writeString = (str) => {
                const data = encoder.encode(String(str || ''));
                const len = Math.min(data.length, 0xFFFF);
                writeUint16LE(len);
                pushBytes(data.slice(0, len));
            };

            // Header
            writeUint32LE(0x02); // version
            writeUint32LE(0x00); // header tag count
            writeUint32LE(entries.length);

            // File entries
            entries.forEach(entry => {
                const sizeBig = BigInt(entry.size);
                const use64 = sizeBig > 0xFFFFFFFFn;
                const tagCount = entry.rootHash ? 4 : 3;
                writeUint32LE(tagCount);

                // FT_FILEHASH (0x28) — TAGTYPE_HASH (0x81)
                pushByte(0x81);
                pushByte(0x28);
                pushBytes(entry.hashBytes);

                // FT_FILESIZE (0x02) — uint32 (0x83) or uint64 (0x8b)
                pushByte(use64 ? 0x8B : 0x83);
                pushByte(0x02);
                if (use64) {
                    writeUint64LE(sizeBig);
                } else {
                    writeUint32LE(Number(sizeBig));
                }

                // FT_FILENAME (0x01) — TAGTYPE_STRING (0x82)
                pushByte(0x82);
                pushByte(0x01);
                writeString(entry.name);

                // FT_AICH_FILEHASH (0x27) — TAGTYPE_STRING (0x82)
                if (entry.rootHash) {
                    pushByte(0x82);
                    pushByte(0x27);
                    writeString(entry.rootHash);
                }
            });

            return new Uint8Array(bytes);
        }

        function hexToBytes16(hex) {
            const norm = String(hex || '').toLowerCase().replace(/[^0-9a-f]/g, '');
            if (norm.length !== 32) return null;
            const out = new Uint8Array(16);
            for (let i = 0; i < 16; i += 1) {
                const byte = parseInt(norm.slice(i * 2, (i * 2) + 2), 16);
                if (Number.isNaN(byte)) return null;
                out[i] = byte;
            }
            return out;
        }

        // enhanced search: support regex when value is like /pattern/flags
        function makeFilterFromQuery(q){
            if (!q) return () => true;
            q = q.trim();
            if (q.startsWith('/') && q.lastIndexOf('/')>0){
                const last = q.lastIndexOf('/');
                const pattern = q.slice(1,last);
                const flags = q.slice(last+1);
                try {
                    const re = new RegExp(pattern, flags);
                    // RegExp.test is stateful when using the global flag (g).
                    // Reset lastIndex before each test to avoid skipping matches.
                    return it => {
                        try {
                            if (re.global) re.lastIndex = 0;
                            return re.test(String(it.name || '')) || re.test(String(it.link || ''));
                        } catch (e) { return false; }
                    };
                } catch(e){
                    const lowerErr = q.toLowerCase();
                    return it => String(it.name || '').toLowerCase().includes(lowerErr) || String(it.link || '').toLowerCase().includes(lowerErr);
                }
            }
            const lower = q.toLowerCase();
            // match both the decoded name and the raw link (so numbers inside the link are also found)
            return it => String(it.name || '').toLowerCase().includes(lower) || String(it.link || '').toLowerCase().includes(lower);
        }

        // parse human-friendly size to bytes (supports B, KB, MB, GB, TB)
        function parseSize(str){
            if (!str) return null;
            str = String(str).trim();
            if (!str) return null;
            const m = str.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(b|kb|mb|gb|tb)?$/i);
            if (!m) return null;
            let val = parseFloat(m[1].replace(',', '.'));
            const unit = (m[2] || '').toLowerCase();
            if (unit === 'tb') return Math.round(val * Math.pow(1024,4));
            if (unit === 'gb') return Math.round(val * Math.pow(1024,3));
            if (unit === 'mb') return Math.round(val * Math.pow(1024,2));
            if (unit === 'kb') return Math.round(val * 1024);
            return Math.round(val);
        }

    // sorting state (default: tome descending)
    let sortState = { col: 'tome', dir: -1 };
    function defaultDirFor(col) { return col === 'tome' ? -1 : 1; }
    // wire search input and size inputs to rendering (supports regex via makeFilterFromQuery)
    const debRender = debounce(() => renderRows(search.value), 120);
    search.addEventListener('input', debRender);
    minInput.addEventListener('input', debRender);
    maxInput.addEventListener('input', debRender);
    clearSizeBtn.addEventListener('click', ()=>{ minInput.value=''; maxInput.value=''; debRender(); });
        // make headers sortable
        const ths = thead.querySelectorAll('th');
        ths.forEach(h => {
            const col = h.getAttribute('data-col');
            if (!col) return;
            h.style.cursor = 'pointer';
            h.addEventListener('click', () => {
                if (sortState.col === col) {
                    sortState.dir *= -1;
                } else {
                    sortState.col = col;
                    sortState.dir = defaultDirFor(col);
                }
                renderRows(search.value);
            });
        });

        // handle Escape to close
        function onEsc(e){ if (e.key === 'Escape' || e.key === 'Esc') { try{ modal.remove(); modal=null; }catch(e){} document.removeEventListener('keydown', onEsc); } }
        document.addEventListener('keydown', onEsc);

        // initial render
        renderRows('');

        // clean up when modal is removed by other means
        const obs = new MutationObserver(() => { if (!document.body.contains(modal)) { try{ document.removeEventListener('keydown', onEsc); obs.disconnect(); } catch(e){} } });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    function flashButton(el, txt) {
        const orig = el.textContent;
        el.textContent = txt;
        setTimeout(() => el.textContent = orig, 1100);
    }

    async function copyTextToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (e) {}
        try {
            if (typeof GM_setClipboard !== 'undefined') {
                GM_setClipboard(text);
                return true;
            }
        } catch (e) {}
        try {
            fallbackCopyTextToClipboard(text);
            return true;
        } catch (e) {}
        return false;
    }

    function fallbackCopyTextToClipboard(text) {
        const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
    }

    function prettySize(bytes) {
        try { bytes = parseInt(bytes, 10); if (isNaN(bytes)) return ''; const units = ['B','KB','MB','GB','TB']; let i=0; while(bytes>=1024 && i<units.length-1){bytes/=1024;i++} return `${bytes.toFixed( (i===0)?0:2 )} ${units[i]}` } catch(e){return ''}
    }

    // Tome / volume extraction: explicit patterns first, then safe inference.
    const MAX_TOME_NUMBER = 299;
    const INTEGRALE_SORT_VALUE = MAX_TOME_NUMBER + 1000;
    const PACK_SORT_VALUE = MAX_TOME_NUMBER + 900;
    const INTEGRALE_RE = /\b(?:int[eé]grale?s?|integral(?:e)?|omnibus|complete|collection)\b/i;
    const PACK_RE = /\b(?:bdpack|pack)\b/i;
    const RANGE_RE = /\b0*([0-9]{1,3})\s*(?:a|à|to|\-)\s*0*([0-9]{1,3})\b/i;
    const DASH_NORMALIZE_RE = /[\u2010-\u2015]/g; // normalize fancy dashes to '-'

    const EXPLICIT_TOME_PATTERNS = [
        // Hors-série / HS
        { re: /(?:^|[\s._\-–—\[(])(?:hs|hors\s*-?\s*s(?:erie|érie))\s*0*([0-9]{1,3})(?!\d)/i, prefix: 'HS', bonus: 200 },
        // Tome / volume words
        { re: /(?:^|[\s._\-–—\[(])(?:tome|volume|vol(?:ume)?\.?)\s*0*([0-9]{1,3})(?!\d)/i, prefix: 'T', bonus: 180 },
        // Short markers: T01, V02, #03
        { re: /(?:^|[\s._\-–—\[(])(?:t|v|#)\s*0*([0-9]{1,3})(?!\d)/i, prefix: 'T', bonus: 160 },
    ];

    function isLikelyYear(n) { return n >= 1900 && n <= 2099; }
    function isValidTomeNumber(n) {
        return Number.isFinite(n) && n >= 1 && n <= MAX_TOME_NUMBER && !isLikelyYear(n);
    }

    function normalizeForScan(name) {
        let s = String(name || '');
        // Remove common archive extensions to avoid confusing trailing numbers.
        s = s.replace(/\.(?:cbr|cbz|rar|zip|7z|pdf)$/i, '');
        // Normalize dashes and remove diacritics when supported.
        s = s.replace(DASH_NORMALIZE_RE, '-');
        try { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) {}
        // Unify frequent separators but keep overall structure.
        s = s.replace(/[_]+/g, ' ');
        s = s.replace(/[.]+/g, ' ');
        s = s.replace(/\s+/g, ' ').trim();
        return s.toLowerCase();
    }

    function formatTome(prefix, n) {
        return { display: prefix + String(n).padStart(2, '0'), sortValue: n };
    }

    function extractTomeNumber(name) {
        if (!name) return { display: '', sortValue: Infinity };
        const scan = normalizeForScan(name);
        if (!scan) return { display: '', sortValue: Infinity };

        // 1) Integrales / packs (treated as a special "tome" above normal volumes).
        if (INTEGRALE_RE.test(scan)) {
            return { display: 'INT', sortValue: INTEGRALE_SORT_VALUE };
        }
        if (PACK_RE.test(scan) && RANGE_RE.test(scan)) {
            return { display: 'PACK', sortValue: PACK_SORT_VALUE };
        }

        // 2) Explicit tome markers (most reliable).
        for (const { re, prefix } of EXPLICIT_TOME_PATTERNS) {
            const match = scan.match(re);
            if (!match || !match[1]) continue;
            const num = parseInt(match[1], 10);
            if (!isValidTomeNumber(num)) continue;
            return formatTome(prefix, num);
        }

        // 3) Structured hints like "02 (sur 3)" or "02/03".
        const surMatch = scan.match(/(?:^|[^a-z0-9])0*([0-9]{1,3})\s*[\s._\-–—()[\]]*(?:sur|\/)\s*0*([0-9]{1,3})(?!\d)/i);
        if (surMatch && surMatch[1]) {
            const num = parseInt(surMatch[1], 10);
            if (isValidTomeNumber(num)) return formatTome('T', num);
        }

        // 4) Safe inference: pick the best separated number in range.
        const candidateRe = /(^|[^a-z0-9])(0*[0-9]{1,3})(?=([^a-z0-9]|$))/gi;
        let best = null;
        let m;
        while ((m = candidateRe.exec(scan)) !== null) {
            const rawDigits = m[2];
            const num = parseInt(rawDigits, 10);
            if (!isValidTomeNumber(num)) continue;

            const startIdx = m.index + (m[1] ? m[1].length : 0);
            const endIdx = startIdx + rawDigits.length;
            const prevChar = startIdx > 0 ? scan[startIdx - 1] : ' ';
            const nextChar = endIdx < scan.length ? scan[endIdx] : ' ';
            const beforeWindow = scan.slice(Math.max(0, startIdx - 14), startIdx);
            const afterWindow = scan.slice(endIdx, Math.min(scan.length, endIdx + 14));

            let score = 0;
            // Numbers near the start are more likely to be tomes.
            if (startIdx < 48) score += 20;
            // Prefer clearly separated tokens.
            if (/[^a-z0-9]/.test(prevChar)) score += 12; else score -= 25;
            if (/[^a-z0-9]/.test(nextChar)) score += 12; else score -= 25;
            // Common tome layout: " - 01 - " or " . 02 . "
            if (/(?:^|[\s\[(])[-–—]\s*$/.test(beforeWindow)) score += 16;
            if (/^\s*[-–—]/.test(afterWindow)) score += 12;
            if (/\(\s*$/.test(beforeWindow) || /\[\s*$/.test(beforeWindow)) score += 8;
            // Avoid technical tags like U3840, 1920px, etc.
            if (/[a-z]\s*$/.test(beforeWindow) && !/\b(?:t|v|hs)\s*$/.test(beforeWindow)) score -= 10;

            if (!best || score > best.score || (score === best.score && startIdx < best.startIdx)) {
                best = { num, score, startIdx };
            }
        }

        // Require a minimum confidence to avoid false positives.
        if (best && best.score >= 28) {
            return formatTome('T', best.num);
        }

        return { display: '', sortValue: Infinity };
    }

    function shorten(s) { return s.length>48 ? s.slice(0,42)+'…'+s.slice(-6) : s; }

    function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]}); }

    // event: button click
    // toggle modal when clicking the button: if open -> close, else open
    btn.addEventListener('click', () => {
        try {
            if (modal && document.body.contains(modal)) { modal.remove(); modal = null; return; }
            const items = findEd2kLinks();
            if (!items.length) {
                // small pulse
                try { btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 420 }); } catch(e){}
                alert('Aucun lien ed2k trouvé sur cette page.');
                updateBadge();
                return;
            }
            buildModal(items);
            try { updateBadge(); } catch (e) {}
        } catch(e) {}
    });

    // Right-click menu on the button: persistent settings (position, size, show/hide, reset)
    btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const menu = document.createElement('div');
        menu.style.position='fixed'; menu.style.zIndex=99999999; menu.style.right='18px'; menu.style.bottom='80px'; menu.style.background='#04252e'; menu.style.border='1px solid rgba(255,255,255,0.04)'; menu.style.padding='10px'; menu.style.borderRadius='10px'; menu.style.minWidth='180px';
        // Title
        const h = document.createElement('div'); h.textContent = 'Réglages'; h.style.fontWeight='700'; h.style.marginBottom='8px'; menu.appendChild(h);

        // Position
        const posLabel = document.createElement('div'); posLabel.textContent = 'Position du bouton'; posLabel.style.fontSize='12px'; posLabel.style.color='#cfe8f6'; posLabel.style.marginBottom='6px'; menu.appendChild(posLabel);
        const posRow = document.createElement('div'); posRow.style.display='flex'; posRow.style.gap='6px'; posRow.style.marginBottom='8px';
        ['top-left','top-right','bottom-left','bottom-right'].forEach(p => { const b = document.createElement('button'); b.className='ed2k-btn'; b.textContent = p.replace('-',' '); b.style.flex='1'; b.addEventListener('click', ()=>{ prefs.btnPos = p; savePrefs(prefs); applyButtonPosition(); menu.remove(); }); posRow.appendChild(b); });
        menu.appendChild(posRow);

        // Size
        const sizeLabel = document.createElement('div'); sizeLabel.textContent = 'Taille du bouton'; sizeLabel.style.fontSize='12px'; sizeLabel.style.color='#cfe8f6'; sizeLabel.style.marginBottom='6px'; menu.appendChild(sizeLabel);
        const sizeRow = document.createElement('div'); sizeRow.style.display='flex'; sizeRow.style.gap='6px'; sizeRow.style.marginBottom='8px';
        [['small','S'],['normal','M'],['large','L']].forEach(([k,l])=>{ const b=document.createElement('button'); b.className='ed2k-btn'; b.textContent = l; b.style.flex='1'; b.addEventListener('click', ()=>{ prefs.btnSize = k; savePrefs(prefs); applyButtonSize(); menu.remove(); }); sizeRow.appendChild(b); });
        menu.appendChild(sizeRow);

        // Show/hide
        const toggle = document.createElement('button'); toggle.className='ed2k-btn'; toggle.textContent = prefs.showButton ? 'Masquer bouton' : 'Afficher bouton'; toggle.style.width='100%'; toggle.style.marginBottom='8px'; toggle.addEventListener('click', ()=>{ prefs.showButton = !prefs.showButton; savePrefs(prefs); btn.style.display = prefs.showButton ? 'flex' : 'none'; menu.remove(); }); menu.appendChild(toggle);

        // Reset defaults
        const reset = document.createElement('button'); reset.className='ed2k-btn'; reset.textContent='Réinitialiser'; reset.style.width='100%'; reset.addEventListener('click', ()=>{ prefs.btnPos='bottom-right'; prefs.btnSize='normal'; prefs.showButton=true; savePrefs(prefs); applyButtonPosition(); applyButtonSize(); btn.style.display='flex'; menu.remove(); }); menu.appendChild(reset);

        document.body.appendChild(menu);
        const rm = () => { try{ menu.remove(); }catch(e){} };
        setTimeout(() => document.addEventListener('click', rm, { once: true }));
    });

    // no dynamic theme handling: fixed ocean theme

    // expose small API for debugging (optional)
    window.__ed2kRevealer = { findEd2kLinks };

    // Badge handling: create a small persistent badge inside the floating button and update it
    function updateBadge() {
        try {
            const items = findEd2kLinks();
            
            // If no links found and button not yet appended, don't show button
            if (!items || items.length === 0) {
                if (buttonAppended) {
                    // Button was visible, hide badge
                    let badge = btn.querySelector('.ed2k-badge');
                    if (badge) badge.style.display = 'none';
                }
                // Don't append button if no links
                return;
            }
            
            // Links found: append button if not already done
            if (!buttonAppended && document.body) {
                document.body.appendChild(btn);
                buttonAppended = true;
            }
            
            // Update badge
            let badge = btn.querySelector('.ed2k-badge');
            if (!badge) {
                badge = document.createElement('div'); badge.className = 'ed2k-badge';
                btn.style.position = btn.style.position || 'fixed';
                btn.appendChild(badge);
            }
            badge.style.display = 'flex';
            // show exact number
            badge.textContent = String(items.length);
        } catch (e) { /* ignore */ }
    }

    // debounce helper
    function debounce(fn, wait){ let t; return function(...a){ clearTimeout(t); t = setTimeout(()=> fn.apply(this,a), wait); }; }

    // MutationObserver to update badge automatically when DOM changes (debounced)
    try {
        const debUpdate = debounce(updateBadge, 400);
        const mo = new MutationObserver(debUpdate);
        mo.observe(document.body, { childList: true, subtree: true, characterData: true });
        // initial update
        setTimeout(updateBadge, 300);
    } catch(e) { try{ setTimeout(updateBadge, 400); }catch(e){} }

})();
