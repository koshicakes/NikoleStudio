// booking.js — booking form with live Supabase data
// Requires: supabase.js loaded before this script

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('#booking-form');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const sessionCategory  = document.querySelector('#sessionCategory');
    const packageSelect    = document.querySelector('#package');
    const backdropField    = document.querySelector('#backdrop-field');
    const backdropSelect   = document.querySelector('#backdrop');
    const policyCheckbox   = document.querySelector('#policyAccept');
    const dateInput        = document.querySelector('#date');
    const timeInput        = document.querySelector('#time');
    const calendarMonth    = document.querySelector('#calendarMonth');
    const calendarDays     = document.querySelector('#calendarDays');
    const selectedDateLabel= document.querySelector('#selectedDateLabel');
    const timeSlots        = document.querySelector('#timeSlots');
    const prevMonth        = document.querySelector('#prevMonth');
    const nextMonth        = document.querySelector('#nextMonth');
    const summaryPackage   = document.querySelector('#summary-package');
    const summaryDate      = document.querySelector('#summary-date');
    const summaryTime      = document.querySelector('#summary-time');
    const summaryBackdrop  = document.querySelector('#summary-backdrop');
    const setupDesignData  = document.querySelector('#setupDesignData');
    const setupDesignCard  = document.querySelector('#setupDesignCard');
    const setupDesignPreview = document.querySelector('#setupDesignPreview');
    const summarySetup     = document.querySelector('#summary-setup');
    const submitBtn        = form.querySelector('button[type="submit"]');

    let savedSetupDesign = null;
    let dbPackages = [];       // packages from Supabase
    let bookedSlotsMap = {};   // { 'YYYY-MM-DD': ['9:00 AM', ...] }

    const allSlots = ['9:00 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

    // ── Supabase helpers ──────────────────────────────────────────
    async function fetchPackages() {
        try {
            const { data, error } = await nikoleDB
                .from('packages')
                .select('package_id, name, price, service_type, is_active')
                .eq('is_active', true)
                .order('package_id');
            if (error) throw error;
            dbPackages = data || [];
        } catch (err) {
            console.warn('Could not load packages from Supabase:', err.message);
            dbPackages = [];
        }
    }

    async function fetchBookedSlots() {
        try {
            // Fetch all confirmed/pending bookings to block those slots
            const { data, error } = await nikoleDB
                .from('bookings')
                .select('booking_date, booking_time')
                .in('status', ['pending', 'confirmed']);
            if (error) throw error;

            bookedSlotsMap = {};
            (data || []).forEach(row => {
                if (!row.booking_date) return;
                const key = row.booking_date.slice(0, 10); // 'YYYY-MM-DD'
                if (!bookedSlotsMap[key]) bookedSlotsMap[key] = [];
                if (row.booking_time) bookedSlotsMap[key].push(row.booking_time);
            });

            // Expose globally so dashboard can call window.setNikoleBookedSlots
            window.setNikoleBookedSlots(bookedSlotsMap);
        } catch (err) {
            console.warn('Could not load booked slots:', err.message);
        }
    }

    async function submitBooking(formData) {
        const { error } = await nikoleDB.from('bookings').insert({
            customer_name : formData.get('firstName') + ' ' + formData.get('lastName'),
            email         : formData.get('email'),
            contact_number: formData.get('phone') || null,
            service_type  : formData.get('sessionCategory') || null,
            package_id    : formData.get('packageId') || null,
            booking_date  : formData.get('date'),
            booking_time  : formData.get('time'),
            canvas_design : formData.get('backdrop') || null,
            notes         : formData.get('notes') || null,
            policy_agreed : true,
            status        : 'pending'
        });
        if (error) throw error;
    }

    // ── Package rendering ─────────────────────────────────────────
    function renderPackages(serviceType, preferredPackage = '') {
        packageSelect.innerHTML = '<option value="">Choose a package</option>';

        // Filter from DB packages first; fall back to static list
        const filtered = dbPackages.filter(p =>
            !serviceType || (p.service_type && p.service_type.toLowerCase() === serviceType.toLowerCase())
        );

        if (filtered.length > 0) {
            filtered.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.package_id;
                opt.dataset.name = p.name;
                opt.textContent = p.name + (p.price ? '  —  ₱' + Number(p.price).toLocaleString() : '');
                packageSelect.appendChild(opt);
            });
        } else {
            // Static fallback (same as original)
            const staticOptions = {
                'Peekaboo Sessions': ['Tiny Triumphs','Pre-Birthday Mini','Smash & Giggles'],
                'Bump & Bliss Sessions': ['Mommy Glow','Little Miracle','Baby Bliss Plan'],
                'Event Photo & Video Packages': ['Photo Package 1','Photo Package 2','Video Package 1','Video Package 2','Photo & Video 1','Photo & Video 2'],
                'Self Portrait Packages': ['Anaya','Mahiwaga','Puhon','Palagi','Araw-Araw','Ginugma'],
                'Mini Session Portrait Packages': ['Package 1','Package 2','Package 3','Package 4'],
                'Mini Session Family Packages': ['Package 1','Package 2','Package 3','Package 4'],
                'Snuggle Sessions': ['Little Wonders','First Moments','Cuddle Time']
            };
            (staticOptions[serviceType] || []).forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.dataset.name = name;
                opt.textContent = name;
                packageSelect.appendChild(opt);
            });
        }

        if (preferredPackage) {
            // Try match by name
            const matchByName = Array.from(packageSelect.options).find(o => o.dataset.name === preferredPackage);
            if (matchByName) {
                packageSelect.value = matchByName.value;
            } else {
                const opt = document.createElement('option');
                opt.value = preferredPackage;
                opt.dataset.name = preferredPackage;
                opt.textContent = preferredPackage;
                packageSelect.appendChild(opt);
                packageSelect.value = preferredPackage;
            }
        }

        backdropField.style.display = serviceType === 'Self Portrait Packages' ? 'block' : 'none';
        updateSummary();
    }

    // ── Calendar helpers ──────────────────────────────────────────
    const today = new Date(); today.setHours(0,0,0,0);
    let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDate = '';
    let selectedTime = '';

    const pad = v => String(v).padStart(2,'0');
    const toDateKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const parseDateKey = k => { const [y,m,d] = k.split('-').map(Number); return new Date(y,m-1,d); };
    const formatLongDate = k => parseDateKey(k).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

    const getBookedSlots  = key => bookedSlotsMap[key] || [];
    const getRemainingSlots = key => allSlots.filter(s => !getBookedSlots(key).includes(s));
    const isFullyBooked   = key => getRemainingSlots(key).length === 0;

    window.setNikoleBookedSlots = (map) => {
        bookedSlotsMap = map || {};
        if (selectedDate && isFullyBooked(selectedDate)) {
            selectedDate = ''; selectedTime = '';
            dateInput.value = ''; timeInput.value = '';
        }
        renderCalendar(); renderTimeSlots(); updateSummary();
    };

    const renderCalendar = () => {
        calendarDays.innerHTML = '';
        calendarMonth.textContent = visibleMonth.toLocaleDateString('en-US',{month:'long',year:'numeric'});
        const year = visibleMonth.getFullYear();
        const month = visibleMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month+1, 0).getDate();

        for (let i = 0; i < firstDay; i++) calendarDays.appendChild(document.createElement('span'));

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const key = toDateKey(date);
            const remaining = getRemainingSlots(key);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'calendar-day';
            btn.textContent = String(day);
            btn.dataset.date = key;
            btn.setAttribute('aria-label', `${formatLongDate(key)}, ${remaining.length} slots`);

            if (key === selectedDate)        btn.classList.add('is-selected');
            if (toDateKey(today) === key)    btn.classList.add('is-today');
            if (remaining.length > 0 && remaining.length < allSlots.length) btn.classList.add('is-partial');

            if (date < today || remaining.length === 0) {
                btn.disabled = true;
                btn.classList.add(remaining.length === 0 ? 'is-booked' : 'is-muted');
            }

            btn.addEventListener('click', () => {
                selectedDate = key; selectedTime = '';
                dateInput.value = key; timeInput.value = '';
                renderCalendar(); renderTimeSlots(); updateSummary();
            });
            calendarDays.appendChild(btn);
        }
    };

    const renderTimeSlots = () => {
        timeSlots.innerHTML = '';
        if (!selectedDate) {
            selectedDateLabel.textContent = 'Choose a date';
            timeSlots.innerHTML = '<p class="slot-empty">Select an available calendar date to see remaining hours.</p>';
            return;
        }
        selectedDateLabel.textContent = formatLongDate(selectedDate);
        const remaining = getRemainingSlots(selectedDate);
        if (!remaining.length) {
            timeSlots.innerHTML = '<p class="slot-empty">This date is fully booked.</p>';
            return;
        }
        remaining.forEach(slot => {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'time-slot'; btn.textContent = slot;
            if (slot === selectedTime) btn.classList.add('is-selected');
            btn.addEventListener('click', () => {
                selectedTime = slot; timeInput.value = slot;
                renderTimeSlots(); updateSummary();
            });
            timeSlots.appendChild(btn);
        });
    };

    const updateSummary = () => {
        const selOpt = packageSelect.options[packageSelect.selectedIndex];
        summaryPackage.textContent = (selOpt && selOpt.dataset.name) || packageSelect.value || 'Not selected';
        summaryDate.textContent    = selectedDate ? formatLongDate(selectedDate) : 'Choose a date';
        summaryTime.textContent    = selectedTime || 'Choose a time';
        summaryBackdrop.textContent= backdropSelect.value || 'Open to recommendation';
        if (summarySetup) summarySetup.textContent = savedSetupDesign ? 'Applied to booking' : 'No saved setup';
    };

    const applySavedSetupDesign = () => {
        try {
            const raw = localStorage.getItem('nikoleSetupDesign');
            if (!raw) return;
            const design = JSON.parse(raw);
            if (!design?.image) return;
            savedSetupDesign = design;
            if (setupDesignPreview) setupDesignPreview.src = design.image;
            if (setupDesignCard) setupDesignCard.hidden = false;
            if (setupDesignData) setupDesignData.value = JSON.stringify({
                image: design.image, backdrop: design.backdrop || '',
                savedAt: design.savedAt || '', width: design.width || '', height: design.height || ''
            });
            if (design.backdrop && backdropSelect) {
                const has = Array.from(backdropSelect.options).some(o => o.value === design.backdrop);
                if (!has) {
                    const o = document.createElement('option');
                    o.value = o.textContent = design.backdrop;
                    backdropSelect.appendChild(o);
                }
                backdropSelect.value = design.backdrop;
            }
        } catch (err) { console.warn('Saved setup apply failed', err); }
    };

    // ── Event listeners ───────────────────────────────────────────
    sessionCategory.addEventListener('change', () => renderPackages(sessionCategory.value));
    packageSelect.addEventListener('change', updateSummary);
    backdropSelect.addEventListener('change', updateSummary);
    prevMonth.addEventListener('click', () => {
        visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth()-1, 1);
        renderCalendar();
    });
    nextMonth.addEventListener('click', () => {
        visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth()+1, 1);
        renderCalendar();
    });

    // ── Form submit → Supabase ────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectedDate || !selectedTime) {
            alert('Please choose an available date and time slot before submitting.');
            return;
        }
        if (!policyCheckbox.checked) {
            alert('Please accept the booking policy before submitting.');
            return;
        }
        if (!form.checkValidity()) { form.reportValidity(); return; }

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting…';

        try {
            const fd = new FormData(form);
            fd.set('date', selectedDate);
            fd.set('time', selectedTime);

            // Attach selected package_id
            const selOpt = packageSelect.options[packageSelect.selectedIndex];
            fd.set('packageId', selOpt ? selOpt.value : '');

            await submitBooking(fd);

            // Success — redirect or show message
            submitBtn.textContent = 'Booking Sent!';
            submitBtn.style.background = '#4a7c59';
            form.reset();
            localStorage.removeItem('nikoleSetupDesign');
            selectedDate = ''; selectedTime = '';
            renderCalendar(); renderTimeSlots(); updateSummary();
            await fetchBookedSlots(); // refresh calendar with new booking

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
            }, 5000);

        } catch (err) {
            alert('Booking failed: ' + err.message + '\n\nPlease contact us via Messenger.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // ── Init ──────────────────────────────────────────────────────
    await fetchPackages();
    await fetchBookedSlots();

    const selectedService = params.get('service');
    const selectedPackage = params.get('package');
    if (selectedService || selectedPackage) {
        const svc = selectedService || '';
        if (svc) { sessionCategory.value = svc; renderPackages(svc, selectedPackage || ''); }
        else      { renderPackages('', selectedPackage || ''); }
    }

    applySavedSetupDesign();

    // Auto-select first available date
    let firstAvailable = '';
    for (let i = 0; i < 90; i++) {
        const d = new Date(today); d.setDate(today.getDate() + i);
        const k = toDateKey(d);
        if (!isFullyBooked(k)) { firstAvailable = k; break; }
    }
    if (firstAvailable) {
        selectedDate = firstAvailable;
        dateInput.value = selectedDate;
        const pd = parseDateKey(firstAvailable);
        visibleMonth = new Date(pd.getFullYear(), pd.getMonth(), 1);
    }

    renderCalendar(); renderTimeSlots(); updateSummary();
});