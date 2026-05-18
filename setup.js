// setup.js — Fabric-based studio setup planner, assets from Supabase
// Requires: supabase.js loaded before this script

document.addEventListener('DOMContentLoaded', async () => {
    const editorEl = document.getElementById('editor');
    const toastEl  = document.getElementById('toast');
    let toastTimer;

    if (!editorEl) return;

    const els = {
        tabs:              document.querySelectorAll('.setup-tab'),
        panels:            document.querySelectorAll('.setup-panel'),
        bdChips:           document.getElementById('bdChips'),
        propChips:         document.getElementById('propChips'),
        backdropGrid:      document.getElementById('backdropGrid'),
        propGrid:          document.getElementById('propGrid'),
        gradToggle:        document.getElementById('gradToggle'),
        removeBackdropBtn: document.getElementById('removeBackdropBtn'),
        selectedPanel:     document.getElementById('selectedPanel'),
        noSelMsg:          document.getElementById('noSelMsg'),
        opacitySlider:     document.getElementById('opacitySlider'),
        opacityVal:        document.getElementById('opacityVal'),
        scaleSlider:       document.getElementById('scaleSlider'),
        scaleVal:          document.getElementById('scaleVal'),
        sizeBtns:          document.querySelectorAll('.size-btn'),
        clearBtn:          document.getElementById('clearBtn'),
        duplicateBtn:      document.getElementById('duplicateBtn'),
        deleteBtn:         document.getElementById('deleteBtn'),
        saveDesignBtn:     document.getElementById('saveDesignBtn'),
        bookSetupLink:     document.getElementById('bookSetupLink'),
        frontBtn:          document.getElementById('frontBtn'),
        backBtn:           document.getElementById('backBtn'),
        flipBtn:           document.getElementById('flipBtn'),
        rotateLeftBtn:     document.getElementById('rotateLeftBtn'),
        rotateRightBtn:    document.getElementById('rotateRightBtn')
    };

    if (typeof fabric === 'undefined') {
        showToast('Canvas tools are unavailable. Check your connection and reload.');
        editorEl.closest('.canvas-shell')?.classList.add('canvas-unavailable');
        return;
    }

    // ── Static fallbacks (used when Supabase has no data) ─────────
    const STATIC_BACKDROPS = [
        { id: 'b1', name: 'Soft Neutral',   category: 'Classic',   image_url: 'a.jpg' },
        { id: 'b2', name: 'Warm Linen',     category: 'Classic',   image_url: 'a2.jpg' },
        { id: 'b3', name: 'Golden Glow',    category: 'Editorial', image_url: 'ak.jpg' },
        { id: 'b4', name: 'Fine Art',       category: 'Editorial', image_url: 'as.jpg' },
        { id: 'b5', name: 'Studio Red',     category: 'Portrait',  image_url: 'pax 1.jpg' },
        { id: 'b6', name: 'Clean Portrait', category: 'Portrait',  image_url: 'pax 6.jpg' }
    ];

    const STATIC_PROPS = [
        { id: 'p1', name: 'Brass Vase',     category: 'Decor',     image_url: 'ak.jpg' },
        { id: 'p2', name: 'Studio Stool',   category: 'Furniture', image_url: 'a5.jpg' },
        { id: 'p3', name: 'Sculpted Arch',  category: 'Decor',     image_url: 'as.jpg' },
        { id: 'p4', name: 'Florals',        category: 'Decor',     image_url: 'a.jpg' },
        { id: 'p5', name: 'Velvet Chair',   category: 'Furniture', image_url: 'a2.jpg' },
        { id: 'p6', name: 'Portrait Frame', category: 'Frames',    image_url: 'pax 2.jpg' },
        { id: 'p7', name: 'Accent Panel',   category: 'Frames',    image_url: 'pax 3.jpg' },
        { id: 'p8', name: 'Studio Accent',  category: 'Furniture', image_url: 'pax 4.jpg' }
    ];

    // ── Fetch assets from Supabase ────────────────────────────────
    async function fetchAssets() {
        try {
            const { data, error } = await nikoleDB
                .from('canvas_assets')
                .select('id, name, asset_type, image_url')
                .order('id');
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.warn('Canvas assets load failed, using static data:', err.message);
            return null;
        }
    }

    const dbAssets = await fetchAssets();

    let allBackdrops, allProps;

    if (dbAssets && dbAssets.length > 0) {
        allBackdrops = dbAssets
            .filter(a => a.asset_type === 'background')
            .map(a => ({ id: String(a.id), name: a.name, category: a.asset_type, image_url: a.image_url }));

        allProps = dbAssets
            .filter(a => a.asset_type !== 'background')
            .map(a => ({
                id: String(a.id), name: a.name,
                category: a.asset_type
                    ? a.asset_type.charAt(0).toUpperCase() + a.asset_type.slice(1)
                    : 'Prop',
                image_url: a.image_url
            }));

        if (allBackdrops.length === 0) allBackdrops = STATIC_BACKDROPS;
        if (allProps.length === 0)     allProps = STATIC_PROPS;
    } else {
        allBackdrops = STATIC_BACKDROPS;
        allProps     = STATIC_PROPS;
    }

    // ── Canvas setup ──────────────────────────────────────────────
    const canvas = new fabric.Canvas('editor', {
        preserveObjectStacking: true,
        selectionColor:         'rgba(186,16,16,0.12)',
        selectionBorderColor:   '#ba1010',
        selectionLineWidth:     1.5,
        enableRetinaScaling:    false,
        targetFindTolerance:    10,
        skipOffscreen:          true,
        moveCursor:             'grabbing',
        hoverCursor:            'grab'
    });

    const PROTECTED = ['wall', 'floor', 'backdropImg'];
    let currentW = 900, currentH = 540;
    let gradEnabled = false;
    // Fixed: renamed from `history` to avoid shadowing window.history
    let undoStack = [];
    let backdropImg = null;
    let selectedBackdropName = '';
    let restoringHistory = false;
    const movingShadows = new WeakMap();

    const wall  = new fabric.Rect({ left: 0, top: 0, width: currentW, height: currentH, fill: '#ded6ca', selectable: false, evented: false, name: 'wall' });
    const floor = new fabric.Rect({ left: 0, top: currentH * 0.72, width: currentW, height: currentH * 0.28, fill: '#c8bba7', selectable: false, evented: false, name: 'floor' });
    canvas.add(wall, floor);
    canvas.renderAll();
    saveHistory();

    function tuneObject(obj) {
        obj.set({ objectCaching: true, transparentCorners: false, cornerColor: '#ba1010', cornerStrokeColor: '#fff', borderColor: '#ba1010', cornerSize: 13, padding: 6 });
        return obj;
    }
    function imageOptionsFor(url) { return /^https?:\/\//i.test(url) ? { crossOrigin: 'anonymous' } : {}; }
    function clearNode(node) { if (node) node.replaceChildren(); }

    function showToast(msg) {
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
    }

    function setActiveChip(container, activeBtn) {
        container?.querySelectorAll('.chip').forEach(c => {
            c.classList.toggle('active', c === activeBtn);
            c.setAttribute('aria-pressed', String(c === activeBtn));
        });
    }

    function buildChips(items, container, filterHandler) {
        if (!container) return;
        clearNode(container);
        const cats = ['All', ...new Set(items.map(i => i.category).filter(Boolean).sort())];
        cats.forEach((cat, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `chip${idx === 0 ? ' active' : ''}`;
            btn.textContent = cat;
            btn.setAttribute('aria-pressed', String(idx === 0));
            btn.addEventListener('click', () => { setActiveChip(container, btn); filterHandler(cat); });
            container.appendChild(btn);
        });
    }

    function renderEmpty(grid, msg) { if (grid) grid.innerHTML = `<div class="empty-state">${msg}</div>`; }

    function renderBackdrops(items) {
        const grid = els.backdropGrid;
        if (!grid) return;
        clearNode(grid);
        if (!items.length) { renderEmpty(grid, 'No backdrops found.'); return; }
        items.forEach(b => {
            const card = document.createElement('button');
            card.type = 'button'; card.className = 'backdrop-card'; card.title = b.name; card.dataset.id = b.id;
            const img = document.createElement('img');
            img.src = b.image_url; img.alt = b.name; img.loading = 'lazy';
            img.addEventListener('error', () => card.classList.add('image-missing'));
            const name = document.createElement('span');
            name.className = 'card-name'; name.textContent = b.name;
            card.append(img, name);
            card.addEventListener('click', () => selectBackdrop(b.image_url, card, b.name));
            grid.appendChild(card);
        });
    }

    function renderProps(items) {
        const grid = els.propGrid;
        if (!grid) return;
        clearNode(grid);
        if (!items.length) { renderEmpty(grid, 'No props found.'); return; }
        items.forEach(prop => {
            const card = document.createElement('button');
            card.type = 'button'; card.className = 'prop-card'; card.title = prop.name;
            const img = document.createElement('img');
            img.src = prop.image_url; img.alt = prop.name; img.loading = 'lazy';
            img.addEventListener('error', () => card.classList.add('image-missing'));
            const name = document.createElement('span');
            name.className = 'card-name'; name.textContent = prop.name;
            card.append(img, name);
            card.addEventListener('click', () => addProp(prop.image_url, prop.name));
            grid.appendChild(card);
        });
    }

    function filterBackdrops(cat) { renderBackdrops(cat === 'All' ? allBackdrops : allBackdrops.filter(b => b.category === cat)); }
    function filterProps(cat)     { renderProps(cat === 'All' ? allProps : allProps.filter(p => p.category === cat)); }

    function switchTab(tabName, tabEl) {
        els.tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        els.panels.forEach(p => { p.classList.remove('active'); p.hidden = true; });
        tabEl.classList.add('active'); tabEl.setAttribute('aria-selected', 'true');
        const panel = document.getElementById('tab-' + tabName);
        if (panel) { panel.classList.add('active'); panel.hidden = false; }
    }

    function selectedObject() { return canvas.getActiveObject(); }

    function selectBackdrop(url, cardEl, name) {
        const opts = imageOptionsFor(url);
        fabric.Image.fromURL(url, img => {
            if (!img) { showToast('Could not load backdrop.'); return; }
            const scaleX = currentW / img.width;
            const scaleY = currentH / img.height;
            img.set({ left: 0, top: 0, scaleX, scaleY, selectable: false, evented: false, name: 'backdropImg', setupBackdropName: name });
            tuneObject(img);
            if (backdropImg) canvas.remove(backdropImg);
            canvas.insertAt(img, 1);
            backdropImg = img;
            selectedBackdropName = name;
            applyGradient();
            canvas.renderAll();
            saveHistory();
            els.backdropGrid?.querySelectorAll('.backdrop-card').forEach(c => c.classList.toggle('active', c === cardEl));
            showToast('Backdrop set: ' + name);
        }, opts);
    }

    function removeBackdrop() {
        if (backdropImg) {
            canvas.remove(backdropImg);
            backdropImg = null;
            selectedBackdropName = '';
            canvas.renderAll();
            saveHistory();
            showToast('Backdrop removed');
        }
    }

    function addProp(url, name) {
        const opts = imageOptionsFor(url);
        fabric.Image.fromURL(url, img => {
            if (!img) { showToast('Could not load prop.'); return; }
            const size = Math.min(currentW, currentH) * 0.25;
            img.scaleToWidth(size);
            img.set({ left: currentW / 2 - img.getScaledWidth() / 2, top: currentH / 2 - img.getScaledHeight() / 2, name });
            tuneObject(img);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            saveHistory();
            showToast('Added: ' + name);
        }, opts);
    }

    function applyGradient() {
        if (!gradEnabled || !backdropImg) return;
        backdropImg.filters = [new fabric.Image.filters.Brightness({ brightness: -0.15 })];
        backdropImg.applyFilters();
    }

    function toggleGradient() {
        gradEnabled = !gradEnabled;
        els.gradToggle?.classList.toggle('active', gradEnabled);
        els.gradToggle?.setAttribute('aria-pressed', String(gradEnabled));
        if (backdropImg) {
            backdropImg.filters = gradEnabled ? [new fabric.Image.filters.Brightness({ brightness: -0.15 })] : [];
            backdropImg.applyFilters();
            canvas.renderAll();
            saveHistory();
        }
    }

    function preset(w, h, btnId) {
        currentW = w; currentH = h;
        canvas.setWidth(w); canvas.setHeight(h);
        wall.set({ width: w, height: h });
        floor.set({ top: h * 0.72, width: w, height: h * 0.28 });
        if (backdropImg) { backdropImg.set({ scaleX: w / backdropImg.width, scaleY: h / backdropImg.height }); }
        canvas.renderAll();
        saveHistory();
        els.sizeBtns.forEach(b => b.classList.toggle('active', b.id === btnId));
    }

    function setOpacity(val) {
        const obj = selectedObject();
        if (obj && !PROTECTED.includes(obj.name)) { obj.set('opacity', val / 100); canvas.renderAll(); }
        if (els.opacityVal) els.opacityVal.textContent = val + '%';
    }

    function setScale(val) {
        const obj = selectedObject();
        if (obj && !PROTECTED.includes(obj.name)) { const s = val / 100; obj.scaleX = s; obj.scaleY = s; canvas.renderAll(); }
        if (els.scaleVal) els.scaleVal.textContent = val + '%';
    }

    function updateSelectionPanel() {
        const obj    = selectedObject();
        const active = obj && !PROTECTED.includes(obj.name);
        if (els.selectedPanel) els.selectedPanel.hidden = !active;
        if (els.noSelMsg)      els.noSelMsg.style.display = active ? 'none' : '';
        if (active) {
            const op = Math.round((obj.opacity ?? 1) * 100);
            const sc = Math.round(((obj.scaleX ?? 1) + (obj.scaleY ?? 1)) / 2 * 100);
            if (els.opacitySlider) els.opacitySlider.value = op;
            if (els.opacityVal)    els.opacityVal.textContent = op + '%';
            if (els.scaleSlider)   els.scaleSlider.value = sc;
            if (els.scaleVal)      els.scaleVal.textContent = sc + '%';
        }
    }

    function deleteSelected() {
        const obj = selectedObject();
        if (!obj || PROTECTED.includes(obj.name)) return;
        canvas.remove(obj);
        canvas.discardActiveObject();
        canvas.renderAll();
        saveHistory();
        updateSelectionPanel();
        showToast('Removed');
    }

    function duplicateSelected(offset = 22) {
        const obj = selectedObject();
        if (!obj || PROTECTED.includes(obj.name)) return;
        obj.clone(clone => {
            clone.set({ left: obj.left + offset, top: obj.top + offset });
            tuneObject(clone);
            canvas.add(clone);
            canvas.setActiveObject(clone);
            canvas.renderAll();
            saveHistory();
            showToast('Duplicated');
        });
    }

    function bringFront()        { const obj = selectedObject(); if (!obj || PROTECTED.includes(obj.name)) return; canvas.bringToFront(obj); canvas.renderAll(); saveHistory(); }
    function sendBack()          { const obj = selectedObject(); if (!obj || PROTECTED.includes(obj.name)) return; canvas.sendBackwards(obj); canvas.renderAll(); saveHistory(); }
    function flipH()             { const obj = selectedObject(); if (!obj || PROTECTED.includes(obj.name)) return; obj.set({ flipX: !obj.flipX }); canvas.renderAll(); saveHistory(); }
    function rotateSelected(amt) { const obj = selectedObject(); if (!obj || PROTECTED.includes(obj.name)) return; obj.set({ angle: (obj.angle || 0) + amt }); canvas.renderAll(); saveHistory(); }

    function clearProps() {
        const removable = canvas.getObjects().filter(o => !PROTECTED.includes(o.name));
        if (!removable.length) { showToast('No props to clear'); return; }
        if (!confirm('Remove all props? The backdrop stays.')) return;
        removable.forEach(o => canvas.remove(o));
        canvas.discardActiveObject();
        canvas.renderAll();
        saveHistory();
        updateSelectionPanel();
        showToast('Props cleared');
    }

    function saveDesign(opts = {}) {
        try {
            canvas.discardActiveObject();
            canvas.renderAll();
            const savedDesign = {
                image:    canvas.toDataURL({ format: 'jpeg', quality: 0.86 }),
                backdrop: selectedBackdropName,
                savedAt:  new Date().toISOString(),
                width:    currentW,
                height:   currentH
            };
            localStorage.setItem('nikoleSetupDesign', JSON.stringify(savedDesign));
            if (!opts.silent) showToast('Design saved for booking');
            return savedDesign;
        } catch (err) {
            console.error('Save failed', err);
            if (!opts.silent) showToast('Save failed');
            return null;
        }
    }

    function saveHistory() {
        if (restoringHistory) return;
        // Fixed: was `history` (shadows window.history), now `undoStack`
        undoStack.push(JSON.stringify(canvas));
        if (undoStack.length > 30) undoStack.shift();
    }

    function restoreBackdropReference() {
        backdropImg = canvas.getObjects().find(o => o.name === 'backdropImg') || null;
        selectedBackdropName = backdropImg?.setupBackdropName || '';
    }

    function undo() {
        if (undoStack.length <= 1) return;
        restoringHistory = true;
        undoStack.pop();
        canvas.loadFromJSON(undoStack[undoStack.length - 1], () => {
            canvas.renderAll();
            restoreBackdropReference();
            updateSelectionPanel();
            restoringHistory = false;
        });
    }

    function bindEvents() {
        els.tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab, t)));
        els.gradToggle?.addEventListener('click', toggleGradient);
        els.removeBackdropBtn?.addEventListener('click', removeBackdrop);
        els.sizeBtns.forEach(b => b.addEventListener('click', () => preset(Number(b.dataset.width), Number(b.dataset.height), b.id)));
        els.opacitySlider?.addEventListener('input', e => setOpacity(e.target.value));
        els.opacitySlider?.addEventListener('change', saveHistory);
        els.scaleSlider?.addEventListener('input', e => setScale(e.target.value));
        els.scaleSlider?.addEventListener('change', saveHistory);
        els.clearBtn?.addEventListener('click', clearProps);
        els.duplicateBtn?.addEventListener('click', () => duplicateSelected());
        els.deleteBtn?.addEventListener('click', deleteSelected);
        els.saveDesignBtn?.addEventListener('click', () => saveDesign());
        els.bookSetupLink?.addEventListener('click', e => { const s = saveDesign({ silent: true }); if (!s) { e.preventDefault(); showToast('Save failed'); } });
        els.frontBtn?.addEventListener('click', bringFront);
        els.backBtn?.addEventListener('click', sendBack);
        els.flipBtn?.addEventListener('click', flipH);
        els.rotateLeftBtn?.addEventListener('click', () => rotateSelected(-15));
        els.rotateRightBtn?.addEventListener('click', () => rotateSelected(15));

        canvas.on('selection:created', updateSelectionPanel);
        canvas.on('selection:updated', updateSelectionPanel);
        canvas.on('selection:cleared', updateSelectionPanel);

        canvas.on('object:modified', () => {
            const obj = selectedObject();
            if (obj && movingShadows.has(obj)) { obj.set('shadow', movingShadows.get(obj)); movingShadows.delete(obj); }
            saveHistory();
            updateSelectionPanel();
        });

        // Fixed: merged two separate mouse:down handlers into one to avoid double-firing
        canvas.on('mouse:down', e => {
            const obj = e.target;

            // Alt+drag clone
            if (e.e.altKey) {
                const active = selectedObject();
                if (active && !PROTECTED.includes(active.name)) duplicateSelected(20);
                return;
            }

            // Shadow removal during drag
            if (!obj || PROTECTED.includes(obj.name) || movingShadows.has(obj)) return;
            movingShadows.set(obj, obj.shadow || null);
            obj.set('shadow', null);
            canvas.requestRenderAll();
        });

        canvas.on('mouse:up', () => {
            canvas.getObjects().forEach(obj => {
                if (!movingShadows.has(obj)) return;
                obj.set('shadow', movingShadows.get(obj));
                movingShadows.delete(obj);
            });
            canvas.requestRenderAll();
        });

        document.addEventListener('keydown', e => {
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea') return;
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const obj = selectedObject();
                if (obj && !(obj instanceof fabric.IText && obj.isEditing)) { e.preventDefault(); deleteSelected(); }
            }
        });
    }

    function initSidebar() {
        buildChips(allBackdrops, els.bdChips, filterBackdrops);
        buildChips(allProps, els.propChips, filterProps);
        renderBackdrops(allBackdrops);
        renderProps(allProps);
    }

    bindEvents();
    initSidebar();
    updateSelectionPanel();
});