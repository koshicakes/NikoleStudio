// services.js — lightweight package cards + sliding side preview panel
// Requires: supabase.js loaded before this script

document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('packageSections');
    if (!mount) return;

    // ── Static group definitions ──────────────────────────────────
    const groups = [
        {
            id: 'self-portrait', theme: 'red',
            eyebrow: 'Studio / Self-Portrait', title: 'Self Portrait Packages',
            copy: 'Self-directed sessions for solo, couple, and small-group portraits inside the studio.',
            service: 'Studio / Self Portrait',
            matchServices: ['Self Portrait Packages', 'Studio / Self Portrait'],
            sampleImage: 'sample-self-portrait.jpg',
            fallbackImage: 'pax 4.jpg',
            staticPackages: [
                {
                    name: 'Anaya', price: 'PHP 350',
                    description: 'A quiet solo session — just you, one backdrop, and a handful of timeless prints.',
                    features: ['Good for 1 pax','8 min photo shoot','7 min photo selection','1 background color','1 pc. photo print (A6 size)','6 unedited photos'],
                    bestFor: 'Solo individuals wanting a quick, clean portrait.',
                    mood: 'Just you. One backdrop. Eight quiet minutes.',
                    crop: 'center', overlayTone: 'warm-light'
                },
                {
                    name: 'Mahiwaga', price: 'PHP 550',
                    description: 'A mystical duo session — two people, two moods, two backgrounds to explore.',
                    features: ['Good for 2 pax','15 min photo shoot','15 min photo selection','2 backgrounds','2 pc. photo print (A6 size)','10 unedited photos'],
                    bestFor: 'Couples or best friends wanting a shared memory.',
                    mood: 'Two people. Two backdrops. One memory.',
                    crop: 'center', overlayTone: 'warm-mid'
                },
                {
                    name: 'Puhon', price: 'PHP 750',
                    description: 'For the trio that belongs together — more time, more backdrops, more to remember.',
                    features: ['Good for 3 pax','20 min photo shoot','15 min photo selection','2 backgrounds','3 pc. photo print (A6 size)','12 unedited photos'],
                    bestFor: 'Three friends or small groups capturing a shared moment.',
                    mood: 'The three of you. More time. More to keep.',
                    crop: 'top', overlayTone: 'warm-mid'
                },
                {
                    name: 'Palagi', price: 'PHP 999',
                    description: 'For those who keep coming back — a generous session with room to explore every look.',
                    features: ['Good for 1–5 pax','30 min photo shoot','15 min photo selection','3 backgrounds','4 pc. photo print (A6 size)','20 unedited photos'],
                    bestFor: 'Groups up to 5 who want variety and flexibility.',
                    mood: 'Three backdrops. Thirty minutes. Every look.',
                    crop: 'center', overlayTone: 'neutral'
                },
                {
                    name: 'Araw-Araw', price: 'PHP 1,599',
                    description: 'An every-day kind of beauty — all backdrops, all the unedited frames, every story told.',
                    features: ['Good for 1–5 pax','30 min photo shoot','15 min photo selection','All backgrounds','6 pc. photo print (A6 size)','All unedited photos'],
                    bestFor: 'Groups wanting the full studio experience with all backgrounds.',
                    mood: 'All backgrounds. Every frame. Nothing left out.',
                    crop: 'bottom', overlayTone: 'rich'
                },
                {
                    name: 'Ginugma', price: 'PHP 2,399',
                    description: 'For those who are loved deeply — a full-hour session, all backdrops, every precious frame.',
                    features: ['Good for 1–5 pax','1 hour photo shoot','20 min photo selection','All backgrounds','8 pc. photo print (A6 size)','All unedited photos'],
                    bestFor: 'Clients wanting the most generous time and deliverables.',
                    mood: 'A full hour. Every backdrop. Every precious frame.',
                    crop: 'bottom', overlayTone: 'deep'
                }
            ],
            note: 'Add-ons available: extra print, extra head, extra pet, extra background, photo grid, additional props, all props, and additional time.'
        },
        {
            id: 'mini-portrait', theme: 'burnt',
            eyebrow: 'Professional Shoot', title: 'Mini Session Portrait Packages',
            copy: 'Quick professional portrait sessions with edited high-resolution files.',
            service: 'Professional',
            matchServices: ['Mini Session Portrait Packages'],
            sampleImage: 'sample-mini-portrait.jpg',
            fallbackImage: 'pax 5.jpg',
            staticPackages: [
                {
                    name: 'Package 1', price: 'PHP 1,800',
                    description: 'A focused solo session — one look, one story, twenty polished frames to keep.',
                    features: ['1 look/outfit','Good for 1 pax','20 edited files in high resolution','30 min shoot','Studio location'],
                    bestFor: 'Solo clients needing clean, edited professional portraits.',
                    mood: 'One look. Thirty minutes. Twenty edited frames.',
                    crop: 'center', overlayTone: 'warm-light'
                },
                {
                    name: 'Package 2', price: 'PHP 2,750',
                    description: 'Two looks, two people — a richer session with more variety and more frames to choose from.',
                    features: ['2 looks/outfits','Good for 2 pax','40 edited files in high resolution','45 min shoot','Studio location'],
                    bestFor: 'Pairs or individuals wanting outfit variety.',
                    mood: 'Two outfits. Two people. Forty edited frames.',
                    crop: 'center', overlayTone: 'warm-mid'
                },
                {
                    name: 'Package 3', price: 'PHP 4,000',
                    description: 'A small group portrait session with ample time to capture every dynamic beautifully.',
                    features: ['2 looks/outfits','Good for 3 pax','40 edited files in high resolution','1–2 hour shoot','Studio location'],
                    bestFor: 'Small groups of three wanting curated, edited portraits.',
                    mood: 'Three faces. Two hours. Every angle covered.',
                    crop: 'top', overlayTone: 'neutral'
                },
                {
                    name: 'Package 4', price: 'PHP 6,000',
                    description: 'A generous multi-person session with time and space for every face in the frame.',
                    features: ['2 looks/outfits','Good for 4 pax','40 edited files in high resolution','2–3 hour shoot','Studio location'],
                    bestFor: 'Groups of four needing thorough professional coverage.',
                    mood: 'Four people. Three hours. Nothing missed.',
                    crop: 'bottom', overlayTone: 'rich'
                }
            ],
            note: 'Client provides their own outfit and makeup. Travel fee may apply depending on location.'
        },
        {
            id: 'family', theme: 'blue',
            eyebrow: 'Professional Shoot', title: 'Mini Session Family Packages',
            copy: 'Family portraits with framed prints and edited high-resolution files.',
            service: 'Professional',
            matchServices: ['Mini Session Family Packages'],
            sampleImage: 'sample-family.jpg',
            fallbackImage: 'pax 6.jpg',
            staticPackages: [
                {
                    name: 'Package 1', price: 'PHP 1,800',
                    description: 'A gentle start for small families — intimate, warm, and beautifully framed.',
                    features: ['1 background','Good for 1–3 pax','5 edited files in high resolution','1 pc. 8R print with frame','2 pc. wallet size'],
                    bestFor: 'Small families or couples wanting a framed keepsake.',
                    mood: 'Soft light. A small family. One frame to hang forever.',
                    crop: 'center', overlayTone: 'warm-light'
                },
                {
                    name: 'Package 2', price: 'PHP 2,200',
                    description: 'Room for a few more smiles — a slightly larger family with prints to match every wall.',
                    features: ['1 background','Good for 3–4 pax','5 edited files in high resolution','1 pc. A4 print with frame','1 pc. 8R print','4 pc. wallet size'],
                    bestFor: 'Families of 3–4 wanting both a large and wallet-size print.',
                    mood: 'Four of you. Prints for every wall in the house.',
                    crop: 'center', overlayTone: 'warm-mid'
                },
                {
                    name: 'Package 3', price: 'PHP 4,000',
                    description: 'For the family that fills a room — more people, more edited frames, more to hang on the wall.',
                    features: ['1 background','Good for 5–7 pax','8 edited files in high resolution','1 pc. A4 print with frame','1 pc. 8R print','4 pc. wallet size'],
                    bestFor: 'Medium families of 5–7 wanting a full portrait set.',
                    mood: 'Seven people. Eight edited frames. One beautiful day.',
                    crop: 'top', overlayTone: 'neutral'
                },
                {
                    name: 'Package 4', price: 'PHP 5,500',
                    description: 'For the big family that shows up fully — everyone in the frame, every moment preserved.',
                    features: ['1 background','Good for 8–10 pax','8 edited files in high resolution','1 pc. A4 print with frame','1 pc. 8R print','4 pc. wallet size'],
                    bestFor: 'Large families of 8–10 wanting complete group coverage.',
                    mood: 'The whole family. All ten of you. Nothing left out.',
                    crop: 'bottom', overlayTone: 'rich'
                }
            ],
            note: 'All packages can take up to 15–30 minutes of shooting time.'
        },
        {
            id: 'pre-birthday', theme: 'cream',
            eyebrow: 'Pre-Birthday Packages', title: 'Peekaboo Sessions',
            copy: 'Playful milestone portraits for celebrants and family memories.',
            service: 'Professional',
            matchServices: ['Peekaboo Sessions'],
            sampleImage: 'sample-pre-birthday.jpg',
            fallbackImage: 'pax 1.jpg',
            staticPackages: [
                {
                    name: 'Tiny Triumphs', price: 'PHP 3,500',
                    description: 'A gentle solo session celebrating your little one\'s biggest milestone — pure joy, beautifully lit.',
                    features: ['Celebrant only','2 set ups / layout (1 creative + 1 plain background)',"Studio session, depends on baby's mood",'10 edited photos','Online gallery for edited photos'],
                    bestFor: 'Celebrants wanting a simple, elegant birthday portrait.',
                    mood: 'Just the celebrant. Two setups. Ten memories.',
                    crop: 'center', overlayTone: 'warm-light'
                },
                {
                    name: 'Pre-Birthday Mini', price: 'PHP 4,500',
                    description: 'Baby and the whole family in one session — milestone portraits with a group memory included.',
                    features: ['Celebrant + family session','2 set ups/layout','Family picture on plain background',"Studio session, depends on baby's mood",'25 edited photos','Online gallery for edited photos'],
                    bestFor: 'Families wanting both solo and group shots in one visit.',
                    mood: 'Baby and family. Two setups. Twenty-five frames.',
                    crop: 'top', overlayTone: 'warm-mid'
                },
                {
                    name: 'Smash & Giggles', price: 'PHP 9,000',
                    description: 'The full birthday experience — four beautiful setups, family portraits, and every giggle on record.',
                    features: ['Celebrant + family session','4 set ups/layout','Family picture on plain background',"Studio session, depends on baby's mood",'50 edited photos','Online gallery for edited photos'],
                    bestFor: 'Families wanting the most elaborate and complete birthday coverage.',
                    mood: 'Cake. Confetti. Four setups. Every giggle captured.',
                    crop: 'bottom', overlayTone: 'rich'
                }
            ]
        },
        {
            id: 'maternity', theme: 'cream',
            eyebrow: 'Maternity Packages', title: 'Bump & Bliss Sessions',
            copy: 'Maternity packages for glowing solo, couple, and family portraits.',
            service: 'Professional',
            matchServices: ['Bump & Bliss Sessions'],
            sampleImage: 'sample-maternity.jpg',
            fallbackImage: 'pax 2.jpg',
            staticPackages: [
                {
                    name: 'Mommy Glow', price: 'PHP 4,000',
                    description: 'A radiant solo session — just you, your bump, and the soft studio light that makes you glow.',
                    features: ['Mom session only','2 set ups/layout','Different poses','Studio session','12 edited photos','HMUA not included'],
                    bestFor: 'Expecting moms wanting a solo maternity portrait session.',
                    mood: 'Just you and your bump. Soft light. Twelve glowing frames.',
                    crop: 'center', overlayTone: 'warm-light'
                },
                {
                    name: 'Little Miracle', price: 'PHP 8,000',
                    description: 'A love story told before the birth — you and your partner, glowing together.',
                    features: ['Mom + husband session only','2 set ups/layout','Studio session','25 edited photos','HMUA included'],
                    bestFor: 'Couples wanting a professional maternity session with HMUA.',
                    mood: 'You and your partner. HMUA included. Twenty-five frames.',
                    crop: 'top', overlayTone: 'warm-mid'
                },
                {
                    name: 'Baby Bliss Plan', price: 'PHP 14,000',
                    description: 'The whole family, the full glow — three setups, every raw file, and hair and makeup done right.',
                    features: ['Mom + family session','3 set ups/layout','Family picture on plain background','Studio session','All best photos edited','All raw photos','HMUA included'],
                    bestFor: 'Families wanting the most complete maternity experience.',
                    mood: 'The whole family. Three setups. Every raw file yours.',
                    crop: 'bottom', overlayTone: 'deep'
                }
            ]
        },
        {
            id: 'newborn', theme: 'cream',
            eyebrow: 'Newborn Packages', title: 'Snuggle Sessions',
            copy: "Newborn packages for baby's first studio portraits.",
            service: 'Professional',
            matchServices: ['Snuggle Sessions'],
            sampleImage: 'sample-newborn.jpg',
            fallbackImage: 'pax 7.jpg',
            staticPackages: [
                {
                    name: 'Little Wonders', price: 'PHP 4,000',
                    description: "Baby's first studio visit — two tender setups captured at their own gentle pace.",
                    features: ['Baby session only','2 set ups/layout','Different poses',"Studio session, depends on baby's mood",'10 edited photos','Online gallery for edited photos'],
                    bestFor: "Parents wanting a simple, beautiful newborn portrait session.",
                    mood: "Baby's first shoot. Two gentle setups. Ten edited frames.",
                    crop: 'center', overlayTone: 'warm-light'
                },
                {
                    name: 'First Moments', price: 'PHP 6,500',
                    description: "Three setups, more edited frames, and a family picture — because the whole family is new too.",
                    features: ['Baby session only','3 set ups/layout','With parents/sibling picture on plain background',"Studio session, depends on baby's mood",'25 edited photos','Online gallery for edited photos'],
                    bestFor: "Families wanting baby-only shots plus a group family portrait.",
                    mood: "Baby, parents, siblings. Three setups. Twenty-five frames.",
                    crop: 'top', overlayTone: 'warm-mid'
                },
                {
                    name: 'Cuddle Time', price: 'PHP 10,000',
                    description: "The most complete welcome — four setups, fifty edited frames, every first moment with the whole family.",
                    features: ['Baby + family session','4 set ups/layout','Family picture on plain background',"Studio session, depends on baby's mood",'50 edited photos','Online gallery for edited photos'],
                    bestFor: "Families wanting the fullest newborn coverage available.",
                    mood: "Four setups. Fifty edited frames. The whole family, together.",
                    crop: 'bottom', overlayTone: 'rich'
                }
            ]
        },
        {
            id: 'event', theme: 'red',
            eyebrow: 'Event Coverage', title: 'Event Photo & Video Packages',
            copy: 'Coverage packages for birthdays, launches, intimate celebrations, and studio events.',
            service: 'Event',
            matchServices: ['Event Photo & Video Packages', 'Event'],
            sampleImage: 'sample-event.jpg',
            fallbackImage: 'pax 3.jpg',
            staticPackages: [
                {
                    name: 'Photo Package 1', price: 'PHP 5,000',
                    description: 'A dedicated photographer covering your intimate event from start to finish.',
                    features: ['For 50–70 pax','1 photographer','Full photo coverage only','300 enhanced photos','All files stored in GDrive'],
                    bestFor: 'Intimate events of 50–70 guests needing photo coverage only.',
                    mood: 'One photographer. Up to 70 guests. 300 enhanced photos.',
                    crop: 'center', overlayTone: 'warm-light'
                },
                {
                    name: 'Photo Package 2', price: 'PHP 8,000',
                    description: 'Two photographers ensure every angle of your larger event is captured completely.',
                    features: ['For 75–120 pax','2 photographers','Full photo coverage only','550 enhanced photos','All files stored in GDrive'],
                    bestFor: 'Larger events of 75–120 guests needing thorough photo coverage.',
                    mood: 'Two photographers. 120 guests. Every angle covered.',
                    crop: 'top', overlayTone: 'warm-mid'
                },
                {
                    name: 'Video Package 1', price: 'PHP 7,500',
                    description: 'A cinematic highlight reel of your event — story-driven, beautifully edited.',
                    features: ['For 50–70 pax','1 videographer','Full video coverage only','3–5 min output'],
                    bestFor: 'Intimate events wanting a polished video highlight film.',
                    mood: 'Your event. One videographer. A 5-minute film to keep.',
                    crop: 'center', overlayTone: 'neutral'
                },
                {
                    name: 'Video Package 2', price: 'PHP 12,000',
                    description: 'Two videographers capture every angle of your larger event in a longer, richer film.',
                    features: ['For 75–120 pax','2 videographers','Full video coverage only','6–8 min output'],
                    bestFor: 'Larger events needing extended video coverage from multiple angles.',
                    mood: 'Two videographers. An 8-minute film. Nothing missed.',
                    crop: 'top', overlayTone: 'warm-mid'
                },
                {
                    name: 'Photo & Video 1', price: 'PHP 12,000',
                    description: 'Photo and video together — every moment captured in stills and motion, all in one package.',
                    features: ['1 photographer','1 videographer','Full photo coverage','Enhanced photos','2–3 min video highlights','All files stored in GDrive'],
                    bestFor: 'Events wanting both photography and videography in one booking.',
                    mood: 'Stills and motion. Every moment, two ways.',
                    crop: 'bottom', overlayTone: 'rich'
                },
                {
                    name: 'Photo & Video 2', price: 'PHP 15,000',
                    description: 'The complete event coverage — two photographers, a videographer, and a longer highlight film.',
                    features: ['2 photographers','1 videographer','Full photo coverage','Enhanced photos','3–4 min video highlights','All files stored in GDrive'],
                    bestFor: 'Larger events needing the most complete photo and video coverage.',
                    mood: 'Three creatives. Your entire event. Nothing left behind.',
                    crop: 'bottom', overlayTone: 'deep'
                }
            ],
            note: 'Photo and video lead time is 3–4 weeks after the event. Transportation fee is not included and depends on event location.'
        }
    ];

    // ── Fetch packages from Supabase ──────────────────────────────
    let dbPackages = [];
    try {
        const { data, error } = await nikoleDB
            .from('packages')
            .select('package_id, name, price, description, service_type, cover_image_url, pax, is_active')
            .eq('is_active', true)
            .order('package_id');
        if (error) throw error;
        dbPackages = data || [];
    } catch (err) {
        console.warn('Packages load failed, using static data:', err.message);
    }

    // ── Helpers ───────────────────────────────────────────────────
    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = String(text || '');
        return d.innerHTML;
    }

    const fallbackCover = (name, size = 400) =>
        `https://placehold.co/${size}x${Math.round(size * 0.75)}/e8e2db/7a1c2a?text=${encodeURIComponent(name || 'Photo')}`;

    function resolvePackageCover(pkg) {
        const raw = String(pkg.cover_image_url || pkg.image_url || pkg.coverImageUrl || '').trim();
        if (!raw) return fallbackCover(pkg.name);
        if (/^(https?:|data:|blob:)/i.test(raw) || /^[\w .-]+\.(jpe?g|png|gif|webp|svg)$/i.test(raw)) return raw;
        if (window.nikoleDB && raw.includes('/')) {
            const { data } = window.nikoleDB.storage.from('studio-images').getPublicUrl(raw.replace(/^\/+/, ''));
            if (data?.publicUrl) return data.publicUrl;
        }
        return raw;
    }

    const makeBookingHref = (service, name, pkgId) => {
        const p = new URLSearchParams({ service, package: name });
        if (pkgId) p.set('packageId', pkgId);
        return `booking.html?${p.toString()}`;
    };

    // ── Render lightweight cards ──────────────────────────────────
    // Cards show: name, mood line, short description, pax badge, price, "View Package" button.
    const renderCard = (group, pkg, panelData) => {
        const dataAttr   = encodeURIComponent(JSON.stringify(panelData));
        const paxFeature = (panelData.features || []).find(f => /pax|good for/i.test(f));
        const paxText    = paxFeature ? paxFeature.replace(/^good for\s*/i, '') : '';
        const moodLine   = panelData.mood ? `<p class="pkg-lite-mood">${escapeHtml(panelData.mood)}</p>` : '';
        const paxBadge   = paxText ? `<span class="pkg-lite-pax">${escapeHtml(paxText)}</span>` : '';
        return `
        <article class="pkg-lite-card" data-panel="${dataAttr}" tabindex="0" role="button" aria-label="View ${escapeHtml(pkg.name)} package details">
            <div class="pkg-lite-top">
                <p class="pkg-lite-eyebrow">${escapeHtml(group.eyebrow)}</p>
                <h3 class="pkg-lite-name">${escapeHtml(pkg.name)}</h3>
                ${moodLine}
                <p class="pkg-lite-desc">${escapeHtml(panelData.description || pkg.description || '')}</p>
            </div>
            <div class="pkg-lite-bottom">
                <span class="pkg-lite-price">${escapeHtml(pkg.price || (pkg.price ? '₱' + Number(pkg.price).toLocaleString() : ''))}</span>
                <div class="pkg-lite-bottom-right">${paxBadge}<button class="pkg-lite-view-btn" type="button">View Package</button></div>
            </div>
        </article>`;
    };

    // ── Build panel data objects ──────────────────────────────────
    const buildStaticPanelData = (group, pkg) => ({
        name:        pkg.name,
        price:       pkg.price,
        image:       group.sampleImage || group.fallbackImage || '',
        thumbnails:  [],
        eyebrow:     group.eyebrow,
        description: pkg.description,
        features:    pkg.features || [],
        bestFor:     pkg.bestFor  || '',
        note:        group.note   || '',
        bookingHref: makeBookingHref(group.title, pkg.name, ''),
        crop:        pkg.crop        || 'center',
        overlayTone: pkg.overlayTone || 'neutral',
        mood:        pkg.mood        || ''
    });

    const buildDbPanelData = (group, pkg, groupCover) => ({
        name:        pkg.name,
        price:       pkg.price ? '₱' + Number(pkg.price).toLocaleString() : '',
        image:       groupCover || resolvePackageCover(pkg),
        thumbnails:  [],
        eyebrow:     group.eyebrow,
        description: pkg.description || '',
        features:    pkg.pax ? ['Good for ' + pkg.pax] : [],
        bestFor:     '',
        note:        group.note || '',
        bookingHref: makeBookingHref(group.title, pkg.name, pkg.package_id)
    });

    // ── Mount HTML ────────────────────────────────────────────────
    mount.innerHTML = groups.map(group => {
        const matchServices = (group.matchServices || [group.service, group.title]).map(s => s.toLowerCase());
        const groupDbPkgs   = dbPackages.filter(p =>
            p.service_type && matchServices.includes(p.service_type.toLowerCase())
        );
        const groupCover = groupDbPkgs.length > 0
            ? resolvePackageCover(groupDbPkgs.find(p => p.cover_image_url) || groupDbPkgs[0])
            : null;

        const cardsHtml = groupDbPkgs.length > 0
            ? groupDbPkgs.map(p => renderCard(group, { name: p.name, price: p.price ? '₱' + Number(p.price).toLocaleString() : '', description: p.description || '' }, buildDbPanelData(group, p, groupCover))).join('')
            : group.staticPackages.map(p => renderCard(group, p, buildStaticPanelData(group, p))).join('');

        return `
        <section class="package-group package-group-${group.theme}" id="${group.id}">
            <div class="package-group-head">
                <p class="eyebrow">${group.eyebrow}</p>
                <h2>${group.title}</h2>
                <p>${group.copy}</p>
            </div>
            <div class="pkg-lite-grid">${cardsHtml}</div>
            ${group.note ? `<p class="package-note">${group.note}</p>` : ''}
        </section>`;
    }).join('');

    // ── Panel logic ───────────────────────────────────────────────
    const panel     = document.getElementById('pkgPanel');
    const scrim     = document.getElementById('pkgScrim');
    const closeBtn  = document.getElementById('pkgPanelClose');

    const heroImg        = document.getElementById('pkgPanelHeroImg');
    const eyebrowBadge   = document.getElementById('pkgPanelEyebrow');
    const thumbsWrap     = document.getElementById('pkgPanelThumbs');
    const titleEl        = document.getElementById('pkgPanelTitle');
    const priceEl        = document.getElementById('pkgPanelPrice');
    const descEl         = document.getElementById('pkgPanelDescription');
    const inclusionsEl   = document.getElementById('pkgPanelInclusions');
    const inclusionsWrap = document.getElementById('pkgPanelInclusionsWrap');
    const bestForEl      = document.getElementById('pkgPanelBestFor');
    const bestForWrap    = document.getElementById('pkgPanelBestForWrap');
    const noteEl         = document.getElementById('pkgPanelNote');
    const bookBtn        = document.getElementById('pkgPanelBookBtn');

    let lastFocused = null;

    function openPanel(data) {
        // Populate hero image
        heroImg.src = data.image || '';
        heroImg.alt = data.name + ' preview';
        eyebrowBadge.textContent = data.eyebrow || '';

        // ── Crop variation ────────────────────────────────────────
        // Maps the package's `crop` value to CSS object-position
        const cropMap = { top: '50% 20%', center: '50% 50%', bottom: '50% 78%' };
        heroImg.style.objectPosition = cropMap[data.crop] || '50% 50%';

        // ── Overlay tone ──────────────────────────────────────────
        // Each tone shifts the mood of the same base photo via CSS class
        const overlay = panel.querySelector('.pkg-panel-hero-overlay');
        if (overlay) {
            overlay.className = 'pkg-panel-hero-overlay';                    // reset
            if (data.overlayTone) overlay.classList.add('overlay-' + data.overlayTone);
        }

        // ── Mood line ─────────────────────────────────────────────
        let moodEl = panel.querySelector('.pkg-panel-mood');
        if (data.mood) {
            if (!moodEl) {
                moodEl = document.createElement('p');
                moodEl.className = 'pkg-panel-mood';
                const heroWrap = panel.querySelector('.pkg-panel-hero');
                if (heroWrap) heroWrap.appendChild(moodEl);
            }
            moodEl.textContent = data.mood;
            moodEl.hidden = false;
        } else if (moodEl) {
            moodEl.hidden = true;
        }

        // Thumbnails
        thumbsWrap.innerHTML = '';
        if (data.thumbnails && data.thumbnails.length > 0) {
            thumbsWrap.hidden = false;
            data.thumbnails.forEach((src, i) => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = data.name + ' thumbnail ' + (i + 1);
                img.loading = 'lazy';
                img.className = 'pkg-panel-thumb';
                if (i === 0) img.classList.add('is-active');
                img.addEventListener('click', () => {
                    heroImg.src = src;
                    thumbsWrap.querySelectorAll('.pkg-panel-thumb').forEach(t => t.classList.remove('is-active'));
                    img.classList.add('is-active');
                });
                thumbsWrap.appendChild(img);
            });
        } else {
            thumbsWrap.hidden = true;
        }

        // Text content
        titleEl.textContent  = data.name  || '';
        priceEl.textContent  = data.price || '';
        descEl.textContent   = data.description || '';

        // Inclusions
        if (data.features && data.features.length > 0) {
            inclusionsEl.innerHTML = data.features.map(f => `<li>${escapeHtml(f)}</li>`).join('');
            inclusionsWrap.hidden = false;
        } else {
            inclusionsWrap.hidden = true;
        }

        // Best for
        if (data.bestFor) {
            bestForEl.textContent = data.bestFor;
            bestForWrap.hidden = false;
        } else {
            bestForWrap.hidden = true;
        }

        // Note
        if (data.note) {
            noteEl.textContent = data.note;
            noteEl.hidden = false;
        } else {
            noteEl.hidden = true;
        }

        // Booking link — attach href and wire confirmation state
        bookBtn.href = data.bookingHref || 'booking.html';

        // Remove any previous listener by replacing the node clone
        const freshBtn = bookBtn.cloneNode(true);
        freshBtn.href = data.bookingHref || 'booking.html';
        bookBtn.replaceWith(freshBtn);

        freshBtn.addEventListener('click', e => {
            if (freshBtn.classList.contains('is-confirming')) return; // already going
            e.preventDefault();
            freshBtn.classList.add('is-confirming');
            freshBtn.textContent = 'Taking you to booking…';
            setTimeout(() => {
                window.location.href = freshBtn.href;
            }, 820);
        });

        // Keep module-level reference in sync so closePanel / re-opens work
        // (we re-query by id since we replaced the DOM node)
        // Nothing else references bookBtn after openPanel, so this is safe.

        // Show panel
        lastFocused = document.activeElement;
        panel.hidden = false;
        // Force reflow for transition
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                panel.classList.add('is-open');
                scrim.classList.add('is-visible');
                document.body.classList.add('pkg-panel-active');
                closeBtn.focus();
            });
        });
    }

    function closePanel() {
        panel.classList.remove('is-open');
        scrim.classList.remove('is-visible');
        document.body.classList.remove('pkg-panel-active');
        panel.addEventListener('transitionend', () => {
            panel.hidden = true;
        }, { once: true });
        if (lastFocused) lastFocused.focus();
    }

    // ── Event delegation on cards ────────────────────────────────
    mount.addEventListener('click', e => {
        const card = e.target.closest('.pkg-lite-card');
        if (!card) return;
        try {
            const data = JSON.parse(decodeURIComponent(card.dataset.panel));
            openPanel(data);
        } catch (err) {
            console.warn('Could not parse panel data', err);
        }
    });

    mount.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.pkg-lite-card');
        if (!card) return;
        e.preventDefault();
        try {
            const data = JSON.parse(decodeURIComponent(card.dataset.panel));
            openPanel(data);
        } catch (err) {
            console.warn('Could not parse panel data', err);
        }
    });

    closeBtn.addEventListener('click', closePanel);
    scrim.addEventListener('click', closePanel);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
    });
});