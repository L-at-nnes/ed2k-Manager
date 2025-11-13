// ==UserScript==
// @name         ed2k Manager
// @namespace    Userscript
// @version      1.0.0
// @description  Discretely reveal all ed2k links on a page, show them in a pretty table with checkboxes, select/deselect all, copy selected, dark/light themes.
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

    // === Configuration ===
    const STORAGE_KEY = 'ed2k_revealer_prefs_v1';

    // === Utilities ===
    function savePrefs(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
    function loadPrefs() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; } }

    // keep only button visibility in prefs; theme fixed to ocean
    const prefs = Object.assign({ showButton: true, btnPos: 'bottom-right' }, loadPrefs());

    // regex for ed2k links
    const ED2K_REGEX = /ed2k:\/\/\|file\|([^|]+)\|([0-9]+)\|([a-fA-F0-9]{32})\|/g;

    function decodeFileName(raw) {
        try {
            // some names are URL-encoded
            let s = raw.replace(/\+/g, ' ');
            s = decodeURIComponent(s);
            s = s.replace(/\s+/g, ' ').trim();
            return s;
        } catch (e) { return raw; }
    }

    function findEd2kLinks() {
        const found = new Map(); // key by full link text

        // 1) <a href="ed2k:...">
        document.querySelectorAll('a[href^="ed2k:"]') .forEach(a => {
            const href = a.getAttribute('href');
            const m = href.match(/^ed2k:\/\/\|file\|([^|]+)\|([0-9]+)\|([a-fA-F0-9]{32})\|/);
            if (m) {
                const name = decodeFileName(m[1]);
                found.set(href, { name, link: href, size: m[2], hash: m[3] });
            }
        });

        // 2) plain text nodes containing ed2k links
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            const text = node.nodeValue;
            if (!text || text.indexOf('ed2k://') === -1) continue;
            let m;
            ED2K_REGEX.lastIndex = 0;
            while ((m = ED2K_REGEX.exec(text)) !== null) {
                const full = m[0];
                if (!found.has(full)) {
                    const name = decodeFileName(m[1]);
                    found.set(full, { name, link: full, size: m[2], hash: m[3] });
                }
            }
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

    document.body.appendChild(btn);
    // apply initial prefs
    try { applyButtonPosition(); applyButtonSize(); } catch(e){}

    // modal
    let modal = null;

    function buildModal(items) {
        if (modal) modal.remove();
    modal = document.createElement('div');
    modal.className = 'ed2k-rev-modal';

        const header = document.createElement('div'); header.className = 'ed2k-rev-header';
        const title = document.createElement('div'); title.className = 'ed2k-rev-title'; title.textContent = `ed2k — ${items.length} trouvé(s)`;
        header.appendChild(title);

            const toolbar = document.createElement('div'); toolbar.className = 'ed2k-rev-toolbar';
            
    const search = document.createElement('input'); search.className = 'ed2k-rev-search'; search.placeholder = 'Filtrer par nom (ou /regex/flags) ...';
    const selectAllBtn = document.createElement('button'); selectAllBtn.className = 'ed2k-btn'; selectAllBtn.textContent = 'Tout sélectionner';
    const deselectAllBtn = document.createElement('button'); deselectAllBtn.className = 'ed2k-btn'; deselectAllBtn.textContent = 'Tout déselectionner';
    const copyBtn = document.createElement('button'); copyBtn.className = 'ed2k-btn primary'; copyBtn.textContent = 'Copier sélection';
    const copyAllBtn = document.createElement('button'); copyAllBtn.className = 'ed2k-btn'; copyAllBtn.textContent = 'Copier tout';
    const exportBtn = document.createElement('button'); exportBtn.className = 'ed2k-btn'; exportBtn.textContent = 'Exporter CSV';

    // size filters UI
    const sizeRow = document.createElement('div'); sizeRow.className = 'ed2k-size-row';
    const minInput = document.createElement('input'); minInput.className = 'ed2k-size-input'; minInput.placeholder = 'Min (ex: 10MB)';
    const maxInput = document.createElement('input'); maxInput.className = 'ed2k-size-input'; maxInput.placeholder = 'Max (ex: 2GB)';
    const clearSizeBtn = document.createElement('button'); clearSizeBtn.className = 'ed2k-btn'; clearSizeBtn.textContent = 'Effacer taille';
    sizeRow.appendChild(minInput); sizeRow.appendChild(maxInput); sizeRow.appendChild(clearSizeBtn);

    toolbar.appendChild(search);
    // put size filters next to search
    toolbar.appendChild(sizeRow);
    toolbar.appendChild(selectAllBtn); toolbar.appendChild(deselectAllBtn); toolbar.appendChild(copyBtn); toolbar.appendChild(copyAllBtn); toolbar.appendChild(exportBtn);
        header.appendChild(toolbar);

        const list = document.createElement('div'); list.className = 'ed2k-rev-list';

    const table = document.createElement('table'); table.className = 'ed2k-table';
    const thead = document.createElement('thead'); thead.innerHTML = '<tr><th style="width:36px"><input type="checkbox" id="ed2k-master"></th><th data-col="name">Nom</th><th data-col="size" style="width:120px;text-align:right">Taille</th><th style="width:360px">Lien</th></tr>';
        const tbody = document.createElement('tbody');
        function renderRows(query) {
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
            filtered.sort((a,b)=>{
                if (sortState.col === 'name') return sortState.dir * a.name.localeCompare(b.name);
                if (sortState.col === 'size') return sortState.dir * ( (parseInt(a.size||0,10) || 0) - (parseInt(b.size||0,10) || 0) );
                return 0;
            });
            // update title count dynamically
            try { title.textContent = `ed2k — ${filtered.length} trouvé(s)`; } catch(e){}
            filtered.forEach((it, idx) => {
                const tr = document.createElement('tr');
                const cbTd = document.createElement('td');
                const cb = document.createElement('input'); cb.type = 'checkbox'; cb.dataset.link = it.link; cb.className = 'ed2k-row-cb';
                cbTd.appendChild(cb);
                const nameTd = document.createElement('td'); nameTd.innerHTML = `<div class='ed2k-row-name'>${escapeHtml(it.name)}</div>`;
                const sizeTd = document.createElement('td'); sizeTd.style.textAlign = 'right';
                // show size in MB (fixed) and keep raw bytes in tooltip
                const _bytes_val = parseInt(it.size || 0, 10) || 0;
                const _mb_display = _bytes_val ? ( (_bytes_val / (1024*1024)).toFixed(2) + ' MB') : '';
                sizeTd.innerHTML = `<div style='font-weight:600;color:#cfe8f6' title='${_bytes_val} bytes'>${_mb_display}</div>`;
                const linkTd = document.createElement('td'); linkTd.innerHTML = `<a class='ed2k-link' href='${it.link}' target='_blank' rel='noopener noreferrer'>${shorten(it.link)}</a>`;
                tr.appendChild(cbTd); tr.appendChild(nameTd); tr.appendChild(sizeTd); tr.appendChild(linkTd);
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
        function getVisibleCheckboxes() { return Array.from(modal.querySelectorAll('tbody input.ed2k-row-cb')); }
        function updateMasterCheckbox() {
            const master = modal.querySelector('#ed2k-master');
            const boxes = getVisibleCheckboxes();
            if (!boxes.length) { master.checked = false; master.indeterminate = false; return; }
            const checked = boxes.filter(x => x.checked).length;
            master.checked = checked === boxes.length;
            master.indeterminate = checked > 0 && checked < boxes.length;
        }

        // listeners
        modal.querySelector('#ed2k-master').addEventListener('change', (e) => {
            const v = e.target.checked;
            getVisibleCheckboxes().forEach(cb => cb.checked = v);
        });

        modal.addEventListener('change', (e) => { if (e.target.classList && e.target.classList.contains('ed2k-row-cb')) updateMasterCheckbox(); });

        selectAllBtn.addEventListener('click', () => getVisibleCheckboxes().forEach(cb => cb.checked = true) );
        deselectAllBtn.addEventListener('click', () => getVisibleCheckboxes().forEach(cb => cb.checked = false) );

        copyBtn.addEventListener('click', async () => {
            const boxes = Array.from(modal.querySelectorAll('tbody input.ed2k-row-cb:checked'));
            if (!boxes.length) { flashButton(copyBtn, 'Aucune sélection'); return; }
            const links = boxes.map(b => b.dataset.link).join('\n');
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(links);
                } else if (typeof GM_setClipboard !== 'undefined') {
                    GM_setClipboard(links);
                } else {
                    fallbackCopyTextToClipboard(links);
                }
                flashButton(copyBtn, 'Copié!');
                // close modal after copying selection
                setTimeout(() => { try { modal.remove(); modal = null; } catch(e){} }, 300);
            } catch (err) { flashButton(copyBtn, 'Erreur'); }
        });

        // copy all links (all items, regardless of checkbox)
        copyAllBtn.addEventListener('click', async () => {
            const links = items.map(it => it.link).join('\n');
            if (!links) { flashButton(copyAllBtn, 'Aucun lien'); return; }
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(links);
                } else if (typeof GM_setClipboard !== 'undefined') {
                    GM_setClipboard(links);
                } else {
                    fallbackCopyTextToClipboard(links);
                }
                flashButton(copyAllBtn, 'Copié tout!');
                setTimeout(() => { try { modal.remove(); modal = null; } catch(e){} }, 300);
            } catch (err) { flashButton(copyAllBtn, 'Erreur'); }
        });

        // export CSV
        exportBtn.addEventListener('click', () => {
            try {
                const header = ['name','size','link'];
                const rows = items.map(it => ["\""+String(it.name).replace(/"/g,'""')+"\"", it.size, it.link].join(','));
                const csv = [header.join(','), ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'ed2k-links.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                flashButton(exportBtn, 'Exporté');
            } catch (e) { flashButton(exportBtn, 'Erreur'); }
        });

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

    // sorting state
    let sortState = { col: 'name', dir: 1 };
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
            h.addEventListener('click', () => { if (sortState.col === col) sortState.dir *= -1; else { sortState.col = col; sortState.dir = 1;} renderRows(search.value); });
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

    function fallbackCopyTextToClipboard(text) {
        const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
    }

    function prettySize(bytes) {
        try { bytes = parseInt(bytes, 10); if (isNaN(bytes)) return ''; const units = ['B','KB','MB','GB','TB']; let i=0; while(bytes>=1024 && i<units.length-1){bytes/=1024;i++} return `${bytes.toFixed( (i===0)?0:2 )} ${units[i]}` } catch(e){return ''}
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
            let badge = btn.querySelector('.ed2k-badge');
            if (!badge) {
                badge = document.createElement('div'); badge.className = 'ed2k-badge';
                btn.style.position = btn.style.position || 'fixed';
                btn.appendChild(badge);
            }
            if (!items || items.length === 0) { badge.style.display = 'none'; return; }
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
