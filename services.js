// services.js — renders grouped package cards, live from Supabase
// Requires: supabase.js loaded before this script

document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('packageSections');
    if (!mount) return;

    // ── Static group definitions (layout/copy) ────────────────────
    // Packages rendered per group are filled by Supabase data.
    // If a group has no DB packages, it falls back to static packages below.
    const groups = [
        {
            id: 'self-portrait', theme: 'red',
            eyebrow: 'Studio / Self-Portrait', title: 'Self Portrait Packages',
            copy: 'Self-directed sessions for solo, couple, and small-group portraits inside the studio.',
            service: 'Studio / Self Portrait',
            staticPackages: [
                ['Anaya','PHP 350','pax 4.jpg',['Good for 1 pax','8 minutes photo shoot','7 minutes photo selection','1 background color','1 pc. photo print (A6 size)','6 unedited photos']],
                ['Mahiwaga','PHP 550','pax 4.jpg',['Good for 2 pax','15 minutes photo shoot','15 minutes photo selection','2 backgrounds','2 pc. photo print (A6 size)','10 unedited photos']],
                ['Puhon','PHP 750','pax 4.jpg',['Good for 3 pax','20 minutes photo shoot','15 minutes photo selection','2 backgrounds','3 pc. photo print (A6 size)','12 unedited photos']],
                ['Palagi','PHP 999','pax 4.jpg',['Good for 1-5 pax','30 minutes photo shoot','15 minutes photo selection','3 backgrounds','4 pc. photo print (A6 size)','20 unedited photos']],
                ['Araw-Araw','PHP 1,599','pax 4.jpg',['Good for 1-5 pax','30 minutes photo shoot','15 minutes photo selection','All backgrounds','6 pc. photo print (A6 size)','All unedited photos']],
                ['Ginugma','PHP 2,399','pax 4.jpg',['Good for 1-5 pax','1 hour photo shoot','20 minutes photo selection','All backgrounds','8 pc. photo print (A6 size)','All unedited photos']]
            ],
            note: 'Add-ons: extra print, extra head, extra pet, extra background, photo grid, additional props, all props, and additional time are available by request.'
        },
        {
            id: 'mini-portrait', theme: 'burnt',
            eyebrow: 'Professional Shoot', title: 'Mini Session Portrait Packages',
            copy: 'Quick professional portrait sessions with edited high-resolution files.',
            service: 'Professional',
            staticPackages: [
                ['Package 1','PHP 1,800','pax 5.jpg',['1 look/outfit','Good for 1 pax','20 edited files in high resolution','30 minutes shoot','Studio location']],
                ['Package 2','PHP 2,750','pax 5.jpg',['2 looks/outfits','Good for 2 pax','40 edited files in high resolution','45 minutes shoot','Studio location']],
                ['Package 3','PHP 4,000','pax 5.jpg',['2 looks/outfits','Good for 3 pax','40 edited files in high resolution','1-2 hours shoot','Studio location']],
                ['Package 4','PHP 6,000','pax 5.jpg',['2 looks/outfits','Good for 4 pax','40 edited files in high resolution','2-3 hours shoot','Studio location']]
            ],
            note: 'Client provides their own outfit and makeup. Travel fee may apply depending on location.'
        },
        {
            id: 'family', theme: 'blue',
            eyebrow: 'Professional Shoot', title: 'Mini Session Family Packages',
            copy: 'Family portraits with framed prints and edited high-resolution files.',
            service: 'Professional',
            staticPackages: [
                ['Package 1','PHP 1,800','pax 6.jpg',['1 background','Good for 1-3 pax','5 edited files in high resolution','1 pc. 8R print with frame','2 pc. wallet size']],
                ['Package 2','PHP 2,200','pax 6.jpg',['1 background','Good for 3-4 pax','5 edited files in high resolution','1 pc. A4 print with frame','1 pc. 8R print','4 pc. wallet size']],
                ['Package 3','PHP 4,000','pax 6.jpg',['1 background','Good for 5-7 pax','8 edited files in high resolution','1 pc. A4 print with frame','1 pc. 8R print','4 pc. wallet size']],
                ['Package 4','PHP 5,500','pax 6.jpg',['1 background','Good for 8-10 pax','8 edited files in high resolution','1 pc. A4 print with frame','1 pc. 8R print','4 pc. wallet size']]
            ],
            note: 'All packages can take up to 15-30 minutes shoot.'
        },
        {
            id: 'pre-birthday', theme: 'cream',
            eyebrow: 'Pre-Birthday Packages', title: 'Peekaboo Sessions',
            copy: 'Playful milestone portraits for celebrants and family memories.',
            service: 'Professional',
            staticPackages: [
                ['Tiny Triumphs','PHP 3,500','pax 1.jpg',['Celebrant only','2 set ups/layout (1 creative and 1 plain background)',"Studio session, depends on baby's mood",'10 edited photos','Online gallery for edited photos']],
                ['Pre-Birthday Mini','PHP 4,500','pax 1.jpg',['Celebrant + family session','2 set ups/layout','With family picture on plain background',"Studio session, depends on baby's mood",'25 edited photos','Online gallery for edited photos']],
                ['Smash & Giggles','PHP 9,000','pax 1.jpg',['Celebrant + family session','4 set ups/layout','With family picture on plain background',"Studio session, depends on baby's mood",'50 edited photos','Online gallery for edited photos']]
            ]
        },
        {
            id: 'maternity', theme: 'cream',
            eyebrow: 'Maternity Packages', title: 'Bump & Bliss Sessions',
            copy: 'Maternity packages for glowing solo, couple, and family portraits.',
            service: 'Professional',
            staticPackages: [
                ['Mommy Glow','PHP 4,000','pax 2.jpg',['Mom session only','2 set ups/layout','Different poses','Studio session','12 edited photos','HMUA not included']],
                ['Little Miracle','PHP 8,000','pax 2.jpg',['Mom + husband session only','2 set ups/layout','Studio session','25 edited photos','HMUA included']],
                ['Baby Bliss Plan','PHP 14,000','pax 2.jpg',['Mom + family session','3 set ups/layout','With family picture on plain background','Studio session','All best photos edited','All raw photos','HMUA included']]
            ]
        },
        {
            id: 'newborn', theme: 'cream',
            eyebrow: 'Newborn Packages', title: 'Snuggle Sessions',
            copy: "Newborn packages for baby's first studio portraits.",
            service: 'Professional',
            staticPackages: [
                ['Little Wonders','PHP 4,000','pax 7.jpg',['Baby session only','2 set ups/layout','Different poses',"Studio session, depends on baby's mood",'10 edited photos','Online gallery for edited photos']],
                ['First Moments','PHP 6,500','pax 7.jpg',['Baby session only','3 set ups/layout','With parents/sibling picture on plain background',"Studio session, depends on baby's mood",'25 edited photos','Online gallery for edited photos']],
                ['Cuddle Time','PHP 10,000','pax 7.jpg',['Baby + family session','4 set ups/layout','With family picture on plain background',"Studio session, depends on baby's mood",'50 edited photos','Online gallery for edited photos']]
            ]
        },
        {
            id: 'event', theme: 'red',
            eyebrow: 'Event Coverage', title: 'Event Photo & Video Packages',
            copy: 'Coverage packages for birthdays, launches, intimate celebrations, and studio events.',
            service: 'Event',
            staticPackages: [
                ['Photo Package 1','PHP 5,000','pax 3.jpg',['For 50 to 70 pax','1 photographer','Full photo coverage only','300 enhanced photos','All files stored in GDrive']],
                ['Photo Package 2','PHP 8,000','pax 3.jpg',['For 75 to 120 pax','2 photographers','Full photo coverage only','550 enhanced photos','All files stored in GDrive']],
                ['Video Package 1','PHP 7,500','pax 3.jpg',['For 50 to 70 pax','1 videographer','Full video coverage only','3-5 minutes output']],
                ['Video Package 2','PHP 12,000','pax 3.jpg',['For 75 to 120 pax','2 videographers','Full video coverage only','6-8 minutes output']],
                ['Photo & Video 1','PHP 12,000','pax 3.jpg',['1 photographer','1 videographer','Full photo coverage','Enhanced photos','2-3 minutes video highlights','All files stored in GDrive']],
                ['Photo & Video 2','PHP 15,000','pax 3.jpg',['2 photographers','1 videographer','Full photo coverage','Enhanced photos','3-4 minutes video highlights','All files stored in GDrive']]
            ],
            note: 'Photo and video coverage lead time is 3-4 weeks after the event. Transportation fee is not included and depends on event location.'
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

    // ── Render ────────────────────────────────────────────────────
    const makeHref = (service, name, pkgId) => {
        const p = new URLSearchParams({ service, package: name });
        if (pkgId) p.set('packageId', pkgId);
        return `booking.html?${p.toString()}`;
    };

    const renderDbPackage = (group, pkg) => `
        <article class="package-card">
            <div class="package-cover">
                <img src="${pkg.cover_image_url || 'https://via.placeholder.com/400?text=' + encodeURIComponent(pkg.name)}"
                     alt="${escapeHtml(pkg.name)} package cover" loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400?text=Photo'">
                <span>${escapeHtml(group.eyebrow)}</span>
            </div>
            <div class="package-card-body">
                <div class="package-card-top">
                    <h3>${escapeHtml(pkg.name)}</h3>
                    <strong>${pkg.price ? '₱' + Number(pkg.price).toLocaleString() : ''}</strong>
                </div>
                <ul>${pkg.pax ? '<li>Good for ' + escapeHtml(pkg.pax) + '</li>' : ''}
                    ${pkg.description ? '<li>' + escapeHtml(pkg.description) + '</li>' : ''}</ul>
                <a href="${makeHref(group.service, pkg.name, pkg.package_id)}" class="package-btn">Book this package</a>
            </div>
        </article>`;

    const renderStaticPackage = (group, item) => {
        const [name, price, image, features] = item;
        return `
        <article class="package-card">
            <div class="package-cover">
                <img src="${image}" alt="${escapeHtml(name)} package cover" loading="lazy">
                <span>${escapeHtml(group.eyebrow)}</span>
            </div>
            <div class="package-card-body">
                <div class="package-card-top">
                    <h3>${escapeHtml(name)}</h3>
                    <strong>${price}</strong>
                </div>
                <ul>${features.map(f => `<li>${f}</li>`).join('')}</ul>
                <a href="${makeHref(group.service, name, '')}" class="package-btn">Book this package</a>
            </div>
        </article>`;
    };

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = String(text || '');
        return d.innerHTML;
    }

    mount.innerHTML = groups.map(group => {
        // Find DB packages for this service group
        const groupDbPkgs = dbPackages.filter(p =>
            p.service_type && p.service_type.toLowerCase() === group.service.toLowerCase()
        );

        const packagesHtml = groupDbPkgs.length > 0
            ? groupDbPkgs.map(p => renderDbPackage(group, p)).join('')
            : group.staticPackages.map(p => renderStaticPackage(group, p)).join('');

        return `
        <section class="package-group package-group-${group.theme}" id="${group.id}">
            <div class="package-group-head">
                <p class="eyebrow">${group.eyebrow}</p>
                <h2>${group.title}</h2>
                <p>${group.copy}</p>
            </div>
            <div class="package-grid">${packagesHtml}</div>
            ${group.note ? `<p class="package-note">${group.note}</p>` : ''}
        </section>`;
    }).join('');
});
