// gallery.js — one card per category (folder view), loads from Supabase
// Requires: supabase.js loaded before this script

document.addEventListener('DOMContentLoaded', async () => {
    const galleryGrid   = document.getElementById('gallery-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let currentFilter = 'all';
    let categoryMap   = {}; // { 'Peekaboo Sessions': { cover, count }, ... }
    let dbLoaded      = false;

    // ── Category display metadata ─────────────────────────────────
    const CATEGORY_META = {
        'Self Portrait Packages':         { label: 'Self Portrait' },
        'Mini Session Portrait Packages': { label: 'Mini Portrait' },
        'Mini Session Family Packages':   { label: 'Family' },
        'Peekaboo Sessions':              { label: 'Peekaboo Sessions' },
        'Bump & Bliss Sessions':          { label: 'Bump & Bliss' },
        'Snuggle Sessions':               { label: 'Snuggle Sessions' },
        'Event Photo & Video Packages':   { label: 'Events' }
    };

    // Static fallback covers (one per category, if DB fails)
    const STATIC_COVERS = {
        'Self Portrait Packages':         'ak.jpg',
        'Mini Session Portrait Packages': 'a.jpg',
        'Mini Session Family Packages':   'a2.jpg',
        'Peekaboo Sessions':              'a2.jpg',
        'Bump & Bliss Sessions':          'as.jpg',
        'Snuggle Sessions':               'a5.jpg',
        'Event Photo & Video Packages':   'as.jpg'
    };

    // ── Fetch from Supabase ───────────────────────────────────────
    async function fetchGallery() {
        try {
            const { data, error } = await nikoleDB
                .from('gallery')
                .select('id, image_url, category')
                .order('id', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.warn('Gallery load failed, using static fallback:', err.message);
            return null;
        }
    }

    // ── Build category map: first photo = cover, track count ──────
    function buildCategoryMap(items) {
        const map = {};
        items.forEach(item => {
            const cat = item.category;
            if (!cat) return;
            if (!map[cat]) {
                map[cat] = { cover: item.image_url, count: 1 };
            } else {
                map[cat].count++;
            }
        });
        return map;
    }

    // ── Render one folder card per category ───────────────────────
    function renderFolders(map, filter) {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';

        const entries = Object.entries(map);
        const filtered = filter === 'all'
            ? entries
            : entries.filter(([key]) => key === filter);

        if (filtered.length === 0) {
            galleryGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:#9a7a7a;">
                    No photos in this category yet.
                </div>`;
            return;
        }

        galleryGrid.innerHTML = filtered.map(([cat, info]) => {
            const label = CATEGORY_META[cat]?.label || cat;
            return `
                <article class="gallery-card gallery-item gallery-folder"
                         data-category="${escapeHtml(cat)}"
                         role="button" tabindex="0"
                         aria-label="Open ${escapeHtml(label)} gallery">
                    <img src="${info.cover || 'https://via.placeholder.com/400?text=Photo'}"
                         alt="${escapeHtml(label)}"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/400?text=Photo'">
                    <span class="gallery-card__overlay"></span>
                    <div class="gallery-card__label">
                        <h4>${escapeHtml(label)}</h4>
                        <p style="font-size:0.75rem;opacity:0.8;margin-top:4px;">
                            ${info.count} ${info.count === 1 ? 'photo' : 'photos'}
                        </p>
                    </div>
                </article>`;
        }).join('');

        bindClicks();
    }

    // ── Static fallback folders ───────────────────────────────────
    function renderStaticFolders(filter) {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';

        const entries = Object.entries(CATEGORY_META);
        const filtered = filter === 'all'
            ? entries
            : entries.filter(([key]) => key === filter);

        if (filtered.length === 0) {
            galleryGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:#9a7a7a;">
                    No photos in this category.
                </div>`;
            return;
        }

        galleryGrid.innerHTML = filtered.map(([cat, meta]) => `
            <article class="gallery-card gallery-item gallery-folder"
                     data-category="${escapeHtml(cat)}"
                     role="button" tabindex="0"
                     aria-label="Open ${escapeHtml(meta.label)} gallery">
                <img src="${STATIC_COVERS[cat] || 'https://via.placeholder.com/400?text=Photo'}"
                     alt="${escapeHtml(meta.label)}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400?text=Photo'">
                <span class="gallery-card__overlay"></span>
                <div class="gallery-card__label">
                    <h4>${escapeHtml(meta.label)}</h4>
                </div>
            </article>
        `).join('');

        bindClicks();
    }

    function bindClicks() {
        galleryGrid.querySelectorAll('.gallery-folder').forEach(card => {
            const go = () => {
                const cat = card.dataset.category;
                if (cat) window.location.href = `gallery-category.html?category=${encodeURIComponent(cat)}`;
            };
            card.addEventListener('click', go);
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(); });
        });
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = String(text || '');
        return d.innerHTML;
    }

    // ── Filter buttons ────────────────────────────────────────────
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            dbLoaded
                ? renderFolders(categoryMap, currentFilter)
                : renderStaticFolders(currentFilter);
        });
    });

    // ── Init ──────────────────────────────────────────────────────
    const dbItems = await fetchGallery();

    if (dbItems && dbItems.length > 0) {
        dbLoaded    = true;
        categoryMap = buildCategoryMap(dbItems);
        renderFolders(categoryMap, 'all');
    } else if (dbItems && dbItems.length === 0) {
        dbLoaded    = true;
        categoryMap = {};
        galleryGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:#9a7a7a;">
                No photos added yet. Check back soon.
            </div>`;
    } else {
        dbLoaded = false;
        renderStaticFolders('all');
    }
});