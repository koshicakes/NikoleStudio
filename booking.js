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
    const phoneInput       = document.querySelector('#phone');
    const phoneError       = document.querySelector('#phone-error');
    const cooldownMessage  = document.querySelector('#bookingCooldownMessage');

    let savedSetupDesign = null;
    let dbPackages = [];
    let bookedSlotsMap = {};
    let cooldownTimer = null;
    const submitDefaultText = submitBtn ? submitBtn.textContent : 'Request Booking';

    const allSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

    
    function minutesToLabel(total) {
        let h = Math.floor(total / 60);
        const m = total % 60;
        const mer = h >= 12 ? 'PM' : 'AM';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return `${h}:${String(m).padStart(2, '0')} ${mer}`;
    }

    
    
    
    function getCustomTimeRange(dateKey, slotLabel) {
        const duration = getCurrentSessionDuration();
        const buffer   = BUFFER_MIN;
        const start    = slotToMinutes(slotLabel);
        const booked   = getBookedSlots(dateKey); 

        
        let latest = start + duration; 
        booked.forEach(b => {
            const bMin = slotToMinutes(b.time);
            if (bMin > start) latest = Math.min(latest, bMin - buffer);
        });
        
        const studioClose = 19 * 60; 
        latest = Math.min(latest, studioClose - duration);

        return { start, end: Math.max(start, latest) };
    }

    
    function slotToMinutes(slot) {
        const [time, meridiem] = slot.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (meridiem === 'PM' && h !== 12) h += 12;
        if (meridiem === 'AM' && h === 12) h = 0;
        return h * 60 + m;
    }

    const SESSION_DURATION_MIN = 60;
    const BUFFER_MIN = 30;

    
    
    function getCurrentSessionDuration() {
        const selOpt = packageSelect ? packageSelect.options[packageSelect.selectedIndex] : null;
        if (selOpt && selOpt.dataset.duration) {
            const d = parseInt(selOpt.dataset.duration, 10);
            if (!isNaN(d) && d > 0) return d;
        }
        return SESSION_DURATION_MIN;
    }

    function isEventPackage() {
        const serviceType = (sessionCategory.value || '').toLowerCase();
        return serviceType.length > 0 && serviceType.includes('event');
    }

    const COOLDOWN_MS = 5 * 60 * 1000;
    const COOLDOWN_KEY = 'nikoleBookingCooldownUntil';

    
    function generateBookingRef() {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const ts   = Date.now().toString(36).slice(-4).toUpperCase();
        const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
        return 'NKL-' + date + '-' + ts + rand;
    }

    
    async function fetchPackages() {
        try {
            const { data, error } = await nikoleDB
                .from('packages')
                .select('package_id, name, price, service_type, is_active, session_duration_min')
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
            const { data, error } = await nikoleDB
                .from('bookings')
                .select('booking_date, booking_time, service_type, session_duration_min')
                .in('status', ['pending', 'confirmed']);
            if (error) throw error;

            bookedSlotsMap = {};
            (data || []).forEach(row => {
                if (!row.booking_date) return;
                const key = row.booking_date.slice(0, 10);
                const isEvent = (row.service_type || '').toLowerCase().includes('event');
                if (isEvent) {
                    bookedSlotsMap[key + '__event'] = true;
                    return;
                }
                if (!bookedSlotsMap[key]) bookedSlotsMap[key] = [];
                if (row.booking_time) bookedSlotsMap[key].push({
                    time: row.booking_time,
                    duration: row.session_duration_min || SESSION_DURATION_MIN
                });
            });

            
            if (typeof window.setNikoleBookedSlots === 'function') {
                window.setNikoleBookedSlots(bookedSlotsMap);
            }
        } catch (err) {
            console.warn('Could not load booked slots:', err.message);
        }
    }

    async function submitBooking(formData) {
        const bookingDate  = formData.get('date');
        const bookingTime  = formData.get('time');
        const serviceType  = formData.get('sessionCategory') || '';
        const isEvent      = serviceType.length > 0 && serviceType.toLowerCase().includes('event');

        
        
        
        const { data: existing, error: checkErr } = await nikoleDB
            .from('bookings')
            .select('booking_time, service_type, status, session_duration_min')
            .eq('booking_date', bookingDate)
            .in('status', ['pending', 'confirmed']);

        if (checkErr) throw new Error('Unable to verify slot availability. Please try again.');

        const dayHasEvent = existing.some(b =>
            (b.service_type || '').toLowerCase().includes('event')
        );
        if (dayHasEvent) {
            throw new Error('This date is fully reserved by an event. Please select another date.');
        }

        if (isEvent && existing.length > 0) {
            throw new Error('This date already has bookings. Events require a completely free day.');
        }

        if (!isEvent) {
            const newDuration = getCurrentSessionDuration();
            const slotMin = slotToMinutes(bookingTime);

            const conflict = existing.some(b => {
                if (!b.booking_time || b.booking_time === 'Whole Day') return false;
                const existingMin = slotToMinutes(b.booking_time);
                const existingDuration = b.session_duration_min || SESSION_DURATION_MIN;
                const existingBlock = existingDuration + BUFFER_MIN;
                const newBlock = newDuration + BUFFER_MIN;

                const startsInside = slotMin >= existingMin && slotMin < existingMin + existingBlock;
                const existingInside = existingMin >= slotMin && existingMin < slotMin + newBlock;
                return startsInside || existingInside;
            });

            if (conflict) {
                throw new Error('This time slot was just taken. Please select another time.');
            }
        }

        

        
        const bookingRef = generateBookingRef();

        
        let canvasDesign = null;
        const rawSetup = formData.get('setupDesignData');
        const rawBackdrop = formData.get('backdrop');
        if (rawSetup) {
            try { JSON.parse(rawSetup); canvasDesign = rawSetup; } catch { canvasDesign = null; }
        }
        if (!canvasDesign && rawBackdrop) {
            canvasDesign = JSON.stringify({ backdrop: rawBackdrop });
        }
        const sessionDurationMin = getCurrentSessionDuration();

        let insertPayload = {
            customer_name       : formData.get('firstName') + ' ' + formData.get('lastName'),
            email               : formData.get('email'),
            contact_number      : normalizeContactNumber(formData.get('phone')),
            service_type        : formData.get('sessionCategory') || null,
            package_id          : formData.get('packageId') || null,
            booking_date        : bookingDate,
            booking_time        : bookingTime,
            canvas_design       : canvasDesign,
            notes               : formData.get('notes') || null,
            policy_agreed       : true,
            status              : 'pending',
            booking_reference   : bookingRef
        };

        
        let { error } = await nikoleDB.from('bookings').insert({
            ...insertPayload,
            session_duration_min: sessionDurationMin
        });

        if (error && (
            error.message?.includes("session_duration_min") ||
            error.message?.includes("schema cache") ||
            error.code === 'PGRST204' ||
            error.code === '42703'
        )) {
            console.warn('session_duration_min column not ready, inserting without it:', error.message);
            ({ error } = await nikoleDB.from('bookings').insert(insertPayload));
        }

        if (error) {
            if (error.code === '23505') {
                throw new Error('This slot was just booked by another client. Please select a different time.');
            }
            throw error;
        }
        
       
        try {
            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: 'service_1ofsddp',
                    template_id: 'template_6spuq1e',
                    user_id: 'yGKpG_4PY58S5ID6x',
                    template_params: {
                        booking_reference: bookingRef,
                        customer_name: formData.get('firstName') + ' ' + formData.get('lastName'),
                        email: formData.get('email'),
                        service_type: formData.get('sessionCategory') || '',
                        booking_date: bookingDate,
                        booking_time: bookingTime,
                        notes: formData.get('notes') || 'None'
                    }
                })
            });
            console.log('Email notification sent');
        } catch (emailErr) {
            console.warn('Email notification failed (booking still saved):', emailErr.message);
        }

        return bookingRef;
    }

    function normalizeContactNumber(value) {
        let digits = String(value || '').replace(/\D/g, '');
        
        if (digits.startsWith('63') && digits.length === 12) {
            digits = '0' + digits.slice(2);
        }
        return digits;
    }

    function getPhoneValidationMessage(value) {
        const digits = normalizeContactNumber(value);
        if (!digits) return 'Contact number is required.';
        if (!digits.startsWith('09')) return 'Contact number must start with 09.';
        if (digits.length < 11) return 'Contact number must contain exactly 11 digits.';
        if (digits.length > 11) return 'Contact number must contain exactly 11 digits.';
        if (!/^09\d{9}$/.test(digits)) return 'Use the valid format 09XXXXXXXXX.';
        return '';
    }

    function validatePhone(showMessage = true) {
        if (!phoneInput) return true;
        const message = getPhoneValidationMessage(phoneInput.value);
        const isValid = !message;
        phoneInput.setCustomValidity(message);
        phoneInput.classList.toggle('is-invalid', !isValid);
        if (phoneError && showMessage) phoneError.textContent = message;
        if (isValid && phoneError) phoneError.textContent = '';
        return isValid;
    }

    function getCooldownUntil() {
        return Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    }

    function formatRemaining(ms) {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    function setCooldownMessage(text, hidden = false) {
        if (!cooldownMessage) return;
        cooldownMessage.textContent = text;
        cooldownMessage.hidden = hidden;
    }

    function updateCooldownState() {
        if (!submitBtn) return false;
        const remaining = getCooldownUntil() - Date.now();
        if (remaining > 0) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Please wait';
            setCooldownMessage(`You can submit another booking after 5 minutes. Time remaining: ${formatRemaining(remaining)}.`);
            return true;
        }
        localStorage.removeItem(COOLDOWN_KEY);
        if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
        submitBtn.disabled = false;
        submitBtn.textContent = submitDefaultText;
        submitBtn.style.background = '';
        setCooldownMessage('', true);
        return false;
    }

    function startCooldown() {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));
        if (cooldownTimer) clearInterval(cooldownTimer);
        updateCooldownState();
        cooldownTimer = setInterval(updateCooldownState, 1000);
    }

    
    function showSuccessModal(bookingRef, summary) {
        const overlay = document.getElementById('bookingSuccessOverlay');
        if (!overlay) return;

        const refEl  = document.getElementById('successRefCode');
        const detEl  = document.getElementById('successDetails');
        const msgLink = document.getElementById('successMessengerLink');

        if (refEl)  refEl.textContent = bookingRef;
        if (detEl)  detEl.innerHTML =
            `<strong>${escHtml(summary.name)}</strong><br>
             ${escHtml(summary.serviceType)} &mdash; ${escHtml(summary.package)}<br>
             ${escHtml(summary.date)} &bull; ${escHtml(summary.time)}`;

        if (msgLink) {
            const preText = encodeURIComponent('Hi! My booking reference code is: ' + bookingRef);
            msgLink.href = 'https://m.me/nikolestudio?text=' + preText;
        }

        overlay.hidden = false;
        overlay.classList.add('is-active');
    }

    function escHtml(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    
    function showFormError(msg) {
        const el = document.querySelector('#formError');
        if (!el) { alert(msg); return; } 
        el.textContent = msg;
        el.hidden = false;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { el.hidden = true; }, 6000);
    }

    
    function renderPackages(serviceType, preferredPackage = '') {
        packageSelect.innerHTML = '<option value="">Choose a package</option>';

        const filtered = dbPackages.filter(p =>
            !serviceType || (p.service_type && p.service_type.toLowerCase() === serviceType.toLowerCase())
        );

        if (filtered.length > 0) {
            filtered.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.package_id;
                opt.dataset.name = p.name;
                if (p.session_duration_min) opt.dataset.duration = p.session_duration_min;
                opt.textContent = p.name + (p.price ? '  —  ₱' + Number(p.price).toLocaleString() : '');
                packageSelect.appendChild(opt);
            });
        } else {
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
                opt.value = '';
                opt.dataset.name = name;
                opt.textContent = name;
                packageSelect.appendChild(opt);
            });
        }

        if (preferredPackage) {
            const matchByName = Array.from(packageSelect.options).find(o => o.dataset.name === preferredPackage);
            if (matchByName) {
                packageSelect.value = matchByName.value;
            } else {
                const opt = document.createElement('option');
                opt.value = '';
                opt.dataset.name = preferredPackage;
                opt.textContent = preferredPackage;
                packageSelect.appendChild(opt);
                packageSelect.value = ' ';
            }
        }

        backdropField.style.display = serviceType === 'Self Portrait Packages' ? 'block' : 'none';
        updateSummary();
    }

    
    const today = new Date(); today.setHours(0,0,0,0);
    let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDate = '';
    let selectedTime = '';

    const pad = v => String(v).padStart(2,'0');
    const toDateKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    
    
    const parseDateKey = k => { const [y,m,d] = k.split('-').map(Number); return new Date(y,m-1,d); };
    const formatLongDate = k => parseDateKey(k).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

    const getBookedSlots = key => bookedSlotsMap[key] || [];
    const isEventBlockedDay = key => !!(bookedSlotsMap[key + '__event']);

    
    
    const getAvailableSlotsForDate = key => {
        if (isEventBlockedDay(key)) return [];
        const booked = getBookedSlots(key); 
        if (!booked.length) return [...allSlots];

        return allSlots.filter(slot => {
            const slotMin = slotToMinutes(slot);
            const slotBlock = SESSION_DURATION_MIN + BUFFER_MIN;
            const tooClose = booked.some(b => {
                const bookedMin = slotToMinutes(b.time);
                const bookedBlock = b.duration + BUFFER_MIN;
                
                return slotMin < bookedMin + bookedBlock && bookedMin < slotMin + slotBlock;
            });
            return !tooClose;
        });
    };

    const getRemainingSlots = key => {
        if (isEventBlockedDay(key)) return [];
        if (isEventPackage()) return [];
        return getAvailableSlotsForDate(key);
    };

    const isFullyBooked = key => isEventBlockedDay(key) || getAvailableSlotsForDate(key).length === 0;

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
        const year  = visibleMonth.getFullYear();
        const month = visibleMonth.getMonth();
        const firstDay    = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month+1, 0).getDate();

        
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
        if (prevMonth) prevMonth.disabled = isCurrentMonth;

        for (let i = 0; i < firstDay; i++) calendarDays.appendChild(document.createElement('span'));

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const key  = toDateKey(date);
            const available = getAvailableSlotsForDate(key);
            const btn  = document.createElement('button');
            btn.type = 'button';
            btn.className = 'calendar-day';
            btn.textContent = String(day);
            btn.dataset.date = key;
            btn.setAttribute('aria-label', `${formatLongDate(key)}, ${available.length} slots`);

            if (key === selectedDate)        btn.classList.add('is-selected');
            if (toDateKey(today) === key)    btn.classList.add('is-today');
            if (available.length > 0 && available.length < allSlots.length) btn.classList.add('is-partial');

            if (date < today || available.length === 0) {
                btn.disabled = true;
                btn.classList.add(available.length === 0 ? 'is-booked' : 'is-muted');
            }

            btn.addEventListener('click', () => {
                selectedDate = key; selectedTime = ''; selectedSlotWindow = '';
                dateInput.value = key; timeInput.value = '';
                renderCalendar(); renderTimeSlots(); updateSummary();
            });
            calendarDays.appendChild(btn);
        }
    };

    
    let selectedSlotWindow = '';

    const renderTimeSlots = () => {
        timeSlots.innerHTML = '';
        if (!selectedDate) {
            selectedDateLabel.textContent = 'Choose a date';
            timeSlots.innerHTML = '<p class="slot-empty">Select an available calendar date to see remaining hours.</p>';
            return;
        }
        selectedDateLabel.textContent = formatLongDate(selectedDate);

        if (isEventPackage()) {
            timeInput.value = 'Whole Day';
            selectedTime = 'Whole Day';
            timeSlots.innerHTML = '<p class="slot-empty" style="border-color:rgba(186,16,16,0.3);background:rgba(186,16,16,0.04);color:var(--maroon-deep);"><strong>Event Package — Whole Day</strong><br>This package reserves the entire day. No specific time slot is needed.</p>';
            updateSummary();
            return;
        }

        const remaining = getRemainingSlots(selectedDate);
        if (!remaining.length) {
            timeSlots.innerHTML = '<p class="slot-empty">This date is fully booked.</p>';
            return;
        }

        
        const slotHeader = document.createElement('p');
        slotHeader.className = 'slot-section-label';
        slotHeader.textContent = 'Available windows — pick one to set your exact time:';
        slotHeader.style.cssText = 'font-size:.75rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#888;margin:0 0 .5rem;';
        timeSlots.appendChild(slotHeader);

        remaining.forEach(slot => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'time-slot';
            btn.textContent = slot;
            if (slot === selectedSlotWindow) btn.classList.add('is-selected');
            btn.addEventListener('click', () => {
                selectedSlotWindow = slot;
                
                selectedTime = slot;
                timeInput.value = slot;
                renderTimeSlots();
                updateSummary();
            });
            timeSlots.appendChild(btn);
        });

        
        if (!selectedSlotWindow) return;

        const { start, end } = getCustomTimeRange(selectedDate, selectedSlotWindow);

        if (start === end) {
            
            selectedTime = minutesToLabel(start);
            timeInput.value = selectedTime;
            updateSummary();
            return;
        }

        const divider = document.createElement('hr');
        divider.style.cssText = 'border:none;border-top:1px solid #eee;margin:.75rem 0;';
        timeSlots.appendChild(divider);

        const pickerLabel = document.createElement('p');
        pickerLabel.style.cssText = 'font-size:.75rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#888;margin:0 0 .4rem;';
        pickerLabel.textContent = 'Set your exact start time:';
        timeSlots.appendChild(pickerLabel);

        const pickerRow = document.createElement('div');
        pickerRow.style.cssText = 'display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;';

        const select = document.createElement('select');
        select.style.cssText = 'padding:.45rem .75rem;border:1.5px solid #d4c5b0;border-radius:8px;font-size:.95rem;font-family:inherit;background:#fff;cursor:pointer;';

        
        for (let m = start; m <= end; m += 15) {
            const opt = document.createElement('option');
            opt.value = minutesToLabel(m);
            opt.textContent = minutesToLabel(m);
            if (opt.value === selectedTime) opt.selected = true;
            select.appendChild(opt);
        }
        
        if (!select.value || select.value !== selectedTime) {
            select.value = minutesToLabel(start);
            selectedTime = select.value;
            timeInput.value = selectedTime;
            updateSummary();
        }

        select.addEventListener('change', () => {
            selectedTime = select.value;
            timeInput.value = selectedTime;
            updateSummary();
        });

        const confirmLabel = document.createElement('span');
        confirmLabel.style.cssText = 'font-size:.85rem;color:#555;';
        confirmLabel.textContent = '← your session starts here';

        pickerRow.appendChild(select);
        pickerRow.appendChild(confirmLabel);
        timeSlots.appendChild(pickerRow);
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
            if (setupDesignCard)    setupDesignCard.hidden = false;
            if (setupDesignData)    setupDesignData.value = JSON.stringify({
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

    
    sessionCategory.addEventListener('change', () => {
        selectedSlotWindow = '';
        selectedTime = '';
        timeInput.value = '';
        renderPackages(sessionCategory.value);
        renderCalendar();
        renderTimeSlots();
        updateSummary();
    });
    packageSelect.addEventListener('change', () => {
        selectedSlotWindow = '';
        selectedTime = '';
        timeInput.value = '';
        updateSummary(); renderCalendar(); renderTimeSlots();
    });
    backdropSelect.addEventListener('change', updateSummary);

    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            phoneInput.value = normalizeContactNumber(phoneInput.value);
            validatePhone(Boolean(phoneInput.value));
        });
        phoneInput.addEventListener('blur', () => validatePhone(true));
    }

    prevMonth.addEventListener('click', () => {
        
        const prevDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        if (prevDate < currentMonthStart) return;
        visibleMonth = prevDate;
        renderCalendar();
    });
    nextMonth.addEventListener('click', () => {
        visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
        renderCalendar();
    });

    
    const successOverlay = document.getElementById('bookingSuccessOverlay');
    if (successOverlay) {
        document.getElementById('successCloseBtn')?.addEventListener('click', () => {
            successOverlay.hidden = true;
            successOverlay.classList.remove('is-active');
        });
        document.getElementById('successCopyBtn')?.addEventListener('click', () => {
            const refEl = document.getElementById('successRefCode');
            if (!refEl) return;
            navigator.clipboard.writeText(refEl.textContent).then(() => {
                const btn = document.getElementById('successCopyBtn');
                const orig = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => { btn.textContent = orig; }, 2000);
            });
        });
    }

    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (updateCooldownState()) return;
        if (!validatePhone(true)) { phoneInput.focus(); return; }
        if (!selectedDate || !selectedTime) {
            showFormError('Please choose an available date and time slot before submitting.'); return;
        }
        if (isEventPackage() && selectedTime !== 'Whole Day') {
            selectedTime = 'Whole Day';
            timeInput.value = 'Whole Day';
        }
        if (!policyCheckbox.checked) {
            showFormError('Please accept the booking policy before submitting.'); return;
        }
        if (!form.checkValidity()) { form.reportValidity(); return; }

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting…';

        try {
            const fd = new FormData(form);
            fd.set('date', selectedDate);
            fd.set('time', selectedTime);
            fd.set('phone', normalizeContactNumber(fd.get('phone')));

            const selOpt = packageSelect.options[packageSelect.selectedIndex];
            fd.set('packageId', selOpt ? selOpt.value : '');

            const bookingRef = await submitBooking(fd);

            
            const summary = {
                name       : (fd.get('firstName') + ' ' + fd.get('lastName')).trim(),
                serviceType: fd.get('sessionCategory') || '',
                package    : (selOpt && selOpt.dataset.name) || packageSelect.value || '',
                date       : formatLongDate(selectedDate),
                time       : selectedTime
            };

            
            submitBtn.textContent = 'Booking Sent!';
            submitBtn.style.background = '#4a7c59';
            form.reset();
            packageSelect.innerHTML = '<option value="">Choose a package</option>';
            sessionCategory.value = '';
            backdropField.style.display = 'none';
            backdropSelect.value = '';
            selectedDate = ''; selectedTime = ''; selectedSlotWindow = ''; dateInput.value = ''; timeInput.value = '';
            updateSummary();
            localStorage.removeItem('nikoleSetupDesign');
            if (setupDesignCard)    setupDesignCard.hidden = true;
            if (setupDesignPreview) setupDesignPreview.src = '';
            savedSetupDesign = null;
            visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            renderCalendar();
            renderTimeSlots();
            await fetchBookedSlots();
            startCooldown();

            
            showSuccessModal(bookingRef, summary);

        } catch (err) {
            showFormError('Booking failed: ' + err.message + ' — Please contact us via Messenger.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Loading…'; }
    if (timeSlots) timeSlots.innerHTML = '<p class="slot-empty">Loading availability…</p>';
    await fetchPackages();
    await fetchBookedSlots();
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitDefaultText; }
    updateCooldownState();
    if (getCooldownUntil() > Date.now()) {
        cooldownTimer = setInterval(updateCooldownState, 1000);
    }

    const selectedService = params.get('service');
    const selectedPackage = params.get('package');
    if (selectedService || selectedPackage) {
        const svc = selectedService || '';
        if (svc) { sessionCategory.value = svc; renderPackages(svc, selectedPackage || ''); }
        else      { renderPackages('', selectedPackage || ''); }
    }

    applySavedSetupDesign();

    
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
