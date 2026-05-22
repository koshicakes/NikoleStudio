// ==================== CONFIG ====================
        // Default Supabase credentials - users can override in the UI
        const DEFAULT_SUPABASE_URL = '';
        const DEFAULT_SUPABASE_KEY = '';

        // ==================== GLOBAL STATE ====================
        let supabaseClient = null;
        let currentUser = null;
        let userRole = 'admin'; // admin, staff
        let currentTab = 'booking';
        let currentStatusFilter = 'all';
        let galleryCategoryFilter = 'all';
        let assetTypeFilter = 'all';
        let dataStore = { booking: [], gallery: [], packages: [],contacts: [], reviews: [], canvas_asset: [] };
        let editingId = null;
        let currentPage = 1;
        const itemsPerPage = 10;

        // ==================== TABLE SCHEMAS ====================
const tableSchemas = {
    booking: {
        title: 'Photo Session',
        table: 'bookings',
        fields: [
            { name: 'customer_name', label: 'Customer Name', type: 'text', required: true },
            { name: 'contact_number', label: 'Contact Number', type: 'tel', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'e.g. ana@email.com' },

            {
                name: 'service_type',
                label: 'Session Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'Peekaboo Sessions', label: 'Peekaboo Sessions' },
                    { value: 'Bump & Bliss Sessions', label: 'Bump & Bliss Sessions' },
                    { value: 'Event Photo & Video Packages', label: 'Event Photo & Video Packages' },
                    { value: 'Self Portrait Packages', label: 'Self Portrait Packages' },
                    { value: 'Mini Session Portrait Packages', label: 'Mini Session Portrait Packages' },
                    { value: 'Mini Session Family Packages', label: 'Mini Session Family Packages' },
                    { value: 'Snuggle Sessions', label: 'Snuggle Sessions' }
                ]
            },

            {
                name: 'package_id',
                label: 'Package',
                type: 'select',
                required: true,
                options: []
            },

            { name: 'booking_date', label: 'Booking Date', type: 'date', required: true },

            {
                name: 'booking_time',
                label: 'Booking Time',
                type: 'text',
                required: true,
                placeholder: 'e.g. 10:30 AM or Whole Day'
            },

            {
                name: 'status',
                label: 'Booking Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' }
                ]
            },

            { name: 'canvas_design', label: 'Canvas Design', type: 'textarea', required: false },
            { name: 'notes', label: 'Notes', type: 'textarea', required: false }
        ]
    },

    gallery: {
        title: 'Gallery Photo',
        table: 'gallery',
        fields: [
            {
                name: 'category',
                label: 'Session Category',
                type: 'select',
                required: true,
                options: [
                    { value: 'Peekaboo Sessions', label: 'Peekaboo Sessions' },
                    { value: 'Bump & Bliss Sessions', label: 'Bump & Bliss Sessions' },
                    { value: 'Event Photo & Video Packages', label: 'Event Photo & Video Packages' },
                    { value: 'Self Portrait Packages', label: 'Self Portrait Packages' },
                    { value: 'Mini Session Portrait Packages', label: 'Mini Session Portrait Packages' },
                    { value: 'Mini Session Family Packages', label: 'Mini Session Family Packages' },
                    { value: 'Snuggle Sessions', label: 'Snuggle Sessions' }
                ]
            },

            {
                name: 'image_url',
                label: 'Gallery Image',
                type: 'file',
                required: true,
                accept: 'image/*'
            },

            {
                name: 'description',
                label: 'Description',
                type: 'textarea',
                required: false
            }
        ]
    },

    packages: {
        title: 'Studio Package',
        table: 'packages',
        fields: [
            {
                name: 'service_type',
                label: 'Session Type',
                type: 'select',
                required: false,
                options: [
                    { value: 'Peekaboo Sessions', label: 'Peekaboo Sessions' },
                    { value: 'Bump & Bliss Sessions', label: 'Bump & Bliss Sessions' },
                    { value: 'Event Photo & Video Packages', label: 'Event Photo & Video Packages' },
                    { value: 'Self Portrait Packages', label: 'Self Portrait Packages' },
                    { value: 'Mini Session Portrait Packages', label: 'Mini Session Portrait Packages' },
                    { value: 'Mini Session Family Packages', label: 'Mini Session Family Packages' },
                    { value: 'Snuggle Sessions', label: 'Snuggle Sessions' }
                ]
            },

            { name: 'name', label: 'Package Name', type: 'text', required: true },

            { name: 'pax', label: 'Pax', type: 'text', required: false },

            {
                name: 'session_duration_min',
                label: 'Session Duration (minutes)',
                type: 'number',
                required: false,
                step: '1',
                placeholder: 'e.g. 60'
            },

            {
                name: 'price',
                label: 'Price',
                type: 'number',
                required: false,
                step: '0.01'
            },

            {
                name: 'description',
                label: 'Description',
                type: 'textarea',
                required: true
            },

            {
                name: 'cover_image_url',
                label: 'Cover Image',
                type: 'file',
                required: false,
                accept: 'image/*'
            },

            {
                name: 'is_active',
                label: 'Active Status',
                type: 'select',
                required: false,
                options: [
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                ]
            }
        ]
    },

    canvas_asset: {
        title: 'Canvas Asset',
        table: 'canvas_assets',
        fields: [
            {
                name: 'asset_type',
                label: 'Asset Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'background', label: 'Background' },
                    { value: 'chair', label: 'Chair' },
                    { value: 'lamp', label: 'Lamp' },
                    { value: 'table', label: 'Table' },
                    { value: 'frame', label: 'Frame' },
                    { value: 'decor', label: 'Decor' }
                ]
            },

            {
                name: 'name',
                label: 'Asset Name',
                type: 'text',
                required: true
            },

            {
                name: 'image_url',
                label: 'Asset Image',
                type: 'file',
                required: true,
                accept: 'image/*'
            }
        ]
    },

    reviews: {
        title: 'Customer Review',
        table: 'reviews',
        fields: [
            { name: 'review_key', label: 'Reference Code', type: 'text', required: true, placeholder: 'NKL-YYYYMMDD-XXXXXXXXX' },
            { name: 'customer_name', label: 'Customer Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'service_type', label: 'Service Type', type: 'text', required: false },
            { name: 'rating', label: 'Rating (1-5)', type: 'number', required: true, step: '1' },
            { name: 'message', label: 'Review Message', type: 'textarea', required: true },
            {
                name: 'status',
                label: 'Moderation Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'published', label: 'Published' },
                    { value: 'rejected', label: 'Rejected' }
                ]
            }
        ]
    },

    contacts: {
        title: 'Contact Message',
        table: 'contacts',
        fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone', type: 'text', required: false },
            { name: 'subject', label: 'Subject', type: 'text', required: false },
            { name: 'message', label: 'Message', type: 'textarea', required: true },
            {
                name: 'status',
                label: 'Status',
                type: 'select',
                required: false,
                options: [
                    { value: 'new', label: 'New' },
                    { value: 'read', label: 'Read' },
                    { value: 'replied', label: 'Replied' },
                    { value: 'archived', label: 'Archived' }
                ]
            }
        ]
    }
};
        // ==================== INIT ====================
        document.addEventListener('DOMContentLoaded', () => {
            // Load saved credentials
            const savedUrl = localStorage.getItem('sb_url') || DEFAULT_SUPABASE_URL;
            const savedKey = localStorage.getItem('sb_key') || DEFAULT_SUPABASE_KEY;
            if (savedUrl) document.getElementById('sbUrl').value = savedUrl;
            if (savedKey) document.getElementById('sbKey').value = savedKey;

            // Check for password recovery link before normal session check
            if (savedUrl && savedKey && window.location.hash.includes('type=recovery')) {
                checkForPasswordRecovery();
            } else if (savedUrl && savedKey) {
                checkExistingSession();
            }

            // Enter key support for login form
            document.getElementById('loginPassword').addEventListener('keydown', e => {
                if (e.key === 'Enter') signIn();
            });
            document.getElementById('loginEmail').addEventListener('keydown', e => {
                if (e.key === 'Enter') signIn();
            });

            document.getElementById('forgotEmail').addEventListener('keydown', e => {
                if (e.key === 'Enter') resetPassword();
            });
            document.getElementById('recoveryPassword').addEventListener('keydown', e => {
                if (e.key === 'Enter') updatePassword();
            });
        });

      // ==================== SUPABASE INIT ====================
function initSupabase(silent = false) {
    if (supabaseClient) return true;
    const url = document.getElementById('sbUrl').value.trim() || localStorage.getItem('sb_url');
    const key = document.getElementById('sbKey').value.trim() || localStorage.getItem('sb_key');

    if (!url || !key) {
        if (!silent) showToast('Please enter your Supabase URL and Anon Key below first', 'error');
        return false;
    }

    try {
        // THE FIX: We must use window.supabase when using the CDN script tag
        supabaseClient = window.supabase.createClient(url, key);
        
        localStorage.setItem('sb_url', url);
            localStorage.setItem('sb_key', key);
        return true;
    } catch (err) {
        if (!silent) showToast('Failed to initialize: ' + err.message, 'error');
        return false;
    }
}
        // ==================== AUTH FUNCTIONS ====================
        async function checkExistingSession() {
            if (!initSupabase(true)) return;

            try {
                const { data: { session }, error } = await supabaseClient.auth.getSession();
                if (session) {
                    await handleAuthSuccess(session.user);
                }
            } catch (err) {
                // Session check failed silently on load
            }
        }

        async function signIn() {
            const btn = document.getElementById('signInBtn');
            let email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                showToast('Please enter username/email and password', 'error');
                return;
            }

            // If input has no @, treat as staff username
            if (!email.includes('@')) {
                email = 'staff-' + email.toLowerCase() + '@nikole.local';
            }

            if (!initSupabase()) return;

            btn.disabled = true;
            btn.innerHTML = '<div class="loading-spinner"></div> Signing in...';

            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                await handleAuthSuccess(data.user);
            } catch (err) {
                showToast(err.message, 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Sign In to Dashboard';
            }
        }



        async function signOut() {
            if (!supabaseClient) return;
            await supabaseClient.auth.signOut();
            currentUser = null;
            userRole = 'admin';
            document.getElementById('authOverlay').classList.remove('hidden');
            document.getElementById('appContainer').classList.remove('visible');
            showToast('Signed out successfully', 'info');
        }

        async function resetPassword() {
            const btn = document.getElementById('resetBtn');
            const email = document.getElementById('forgotEmail').value.trim();

            if (!email) {
                showToast('Please enter your email', 'error');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast('Please enter a valid email address', 'error');
                document.getElementById('forgotEmail').focus();
                return;
            }

            if (!initSupabase()) return;

            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<div class="loading-spinner"></div> Sending...';

            try {
                const cleanRedirect = window.location.origin + window.location.pathname;
                const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: cleanRedirect
                });
                if (error) throw error;
                showToast('Password reset link sent! Check your inbox (and spam folder).', 'success');
                document.getElementById('forgotEmail').value = '';
                setTimeout(() => switchAuthTab('login'), 1500);
            } catch (err) {
                let msg = err.message || 'Failed to send reset link';
                if (msg.includes('redirect') || msg.includes('url')) {
                    msg = 'Redirect URL not allowed. In Supabase Dashboard, go to Authentication → URL Configuration and add: ' + window.location.origin;
                } else if (msg.includes('rate limit') || msg.includes('request')) {
                    msg = 'Too many requests. Please wait a minute and try again.';
                }
                showToast(msg, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        }

        async function handleAuthSuccess(user) {
            currentUser = user;

            // Get user role from metadata or profiles table
            userRole = user.user_metadata?.role || 'admin';

            // Try to get role from profiles table if not in metadata
            try {
                const { data: profile } = await supabaseClient
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile?.role) userRole = profile.role;
            } catch (e) {
                // profiles table might not exist, use metadata
            }

            // Update UI — prefer username for staff, full_name for others
            const displayName = user.user_metadata?.full_name || user.user_metadata?.username || user.email.split('@')[0];
            document.getElementById('userName').textContent = displayName;
            document.getElementById('userRole').textContent = userRole;
            document.getElementById('userAvatar').textContent = (user.user_metadata?.username || user.user_metadata?.full_name || user.email)[0].toUpperCase();

            // Show/hide admin-only elements
            updateRoleBasedUI();

            // Show app
            document.getElementById('authOverlay').classList.add('hidden');
            document.getElementById('appContainer').classList.add('visible');

            showToast('Welcome back, ' + (user.user_metadata?.full_name || 'Admin'), 'success');

            // Load data
            await loadAllData();
            setupRealtime();
            setupAuthListener();
            restoreSidebarState();
        }

        function updateRoleBasedUI() {
            const isAdmin = userRole === 'admin';
            const isStaff = userRole === 'staff';

            // Show settings nav for admin only
            document.getElementById('settingsNav').style.display = isAdmin ? 'flex' : 'none';

            // Hide add buttons for staff (staff cannot insert packages/gallery/assets)
            const addButtons = ['addGalleryBtn', 'addPackageBtn', 'addAssetBtn'];
            addButtons.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) btn.style.display = isAdmin ? 'inline-flex' : 'none';
            });

            // Update role badge style
            const roleEl = document.getElementById('userRole');
            roleEl.className = 'role role-' + userRole;
        }

        function setupAuthListener() {
            supabaseClient.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT') {
                    location.reload();
                } else if (event === 'USER_UPDATED' && session) {
                    currentUser = session.user;
                }
            });
        }

        // ==================== UI HELPERS ====================
        function switchAuthTab(tab) {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

            if (tab === 'login') {
                document.getElementById('loginTab').classList.add('active');
                document.getElementById('loginForm').classList.add('active');
            } else if (tab === 'register') {
                document.getElementById('registerTab').classList.add('active');
                document.getElementById('registerForm').classList.add('active');
            } else if (tab === 'forgot') {
                document.getElementById('forgotForm').classList.add('active');
            } else if (tab === 'recovery') {
                document.getElementById('recoveryForm').classList.add('active');
            }
        }

        function showForgotPassword() {
            document.getElementById('loginPassword').value = '';
            switchAuthTab('forgot');
        }

        function togglePassword(fieldId) {
            const field = document.getElementById(fieldId);
            const btn = field.nextElementSibling;
            const icon = btn.querySelector('i');

            if (field.type === 'password') {
                field.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                field.type = 'password';
                icon.className = 'fas fa-eye';
            }
        }

const dbTableMap = {
    booking: 'bookings',
    gallery: 'gallery',
    packages: 'packages',
    contacts: 'contacts',
    reviews: 'reviews',
    canvas_asset: 'canvas_assets'
};  

        function showProfile() {
            const display = currentUser.user_metadata?.username || currentUser.user_metadata?.full_name || currentUser.email;
            showToast('Profile: ' + display + ' (' + userRole + ')', 'info');
        }

        // ==================== ADD STAFF PANEL ====================
        function openStaffPanel() {
            if (userRole !== 'admin') {
                showToast('Only admin can create staff accounts', 'error');
                return;
            }
            // Clear form
            ['staffUsername', 'staffFullName', 'staffPassword', 'staffConfirmPassword'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            document.getElementById('staffPanelOverlay').classList.add('open');
            document.getElementById('staffPanel').classList.add('open');
            setTimeout(() => document.getElementById('staffUsername')?.focus(), 350);
        }

        function closeStaffPanel() {
            document.getElementById('staffPanelOverlay').classList.remove('open');
            document.getElementById('staffPanel').classList.remove('open');
        }

        async function createStaffAccount() {
            const isAdmin = userRole === 'admin';
            if (!isAdmin) {
                showToast('Only admin can create staff accounts', 'error');
                return;
            }

            const username = document.getElementById('staffUsername').value.trim().toLowerCase();
            const fullName = document.getElementById('staffFullName').value.trim();
            const password = document.getElementById('staffPassword').value;
            const confirm = document.getElementById('staffConfirmPassword').value;
            const btn = document.getElementById('createStaffBtn');

            if (!username || !password) {
                showToast('Username and password are required', 'error');
                return;
            }
            if (password !== confirm) {
                showToast('Passwords do not match', 'error');
                return;
            }
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            if (!/^[a-z0-9_]+$/.test(username)) {
                showToast('Username can only contain lowercase letters, numbers, and underscores', 'error');
                return;
            }

            const email = 'staff-' + username + '@nikole.local';
            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<div class="loading-spinner"></div> Creating...';

            try {
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: fullName || username,
                            role: 'staff',
                            username: username
                        }
                    }
                });

                if (error) throw error;

                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    showToast('A user with this username already exists', 'error');
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                    return;
                }

                showToast('Staff account "' + username + '" created successfully', 'success');
                document.getElementById('staffUsername').value = '';
                document.getElementById('staffFullName').value = '';
                document.getElementById('staffPassword').value = '';
                document.getElementById('staffConfirmPassword').value = '';
                closeStaffPanel();
                loadTeamMembers();
            } catch (err) {
                let msg = err.message || 'Failed to create staff account';
                if (msg.includes('already registered')) {
                    msg = 'Username already taken. Choose a different one.';
                }
                showToast(msg, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        }

        async function loadTeamMembers() {
            if (!supabaseClient || userRole !== 'admin') return;
            try {
                const { data: users, error } = await supabaseClient
                    .from('profiles')
                    .select('id, full_name, role, username, email')
                    .order('role', { ascending: false });
                if (error) throw error;

                const container = document.getElementById('teamMembersList');
                if (!users || users.length === 0) {
                    container.innerHTML = '<div class="settings-row"><div><div class="settings-label">No team members found</div></div></div>';
                    return;
                }

                container.innerHTML = users.map(u => {
                    const roleClass = 'role-' + (u.role || 'staff');
                    const display = u.username || u.full_name || (u.email ? u.email.split('@')[0] : 'User');
                    const tag = '<span class="role-badge ' + roleClass + '" style="margin-left:0.5rem;">' + (u.role || 'staff') + '</span>';
                    return '<div class="settings-row"><div><div class="settings-label">' + escapeHtml(display) + tag + '</div><div class="settings-desc">' + (u.email ? escapeHtml(u.email) : '') + '</div></div></div>';
                }).join('');
            } catch (err) {
                document.getElementById('teamMembersList').innerHTML = '<div class="settings-row"><div><div class="settings-label">Team list unavailable</div><div class="settings-desc">Ensure the profiles table exists in Supabase</div></div></div>';
            }
        }

        async function checkForPasswordRecovery() {
            if (!initSupabase(true)) return;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById('recoveryForm').classList.add('active');
        }

        async function updatePassword() {
            const btn = document.getElementById('updatePasswordBtn');
            const password = document.getElementById('recoveryPassword').value;
            const confirm = document.getElementById('recoveryConfirm').value;

            if (!password || password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            if (password !== confirm) {
                showToast('Passwords do not match', 'error');
                return;
            }

            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<div class="loading-spinner"></div> Updating...';

            try {
                const { data, error } = await supabaseClient.auth.updateUser({ password: password });
                if (error) throw error;
                showToast('Password updated successfully! Please sign in.', 'success');
                window.history.replaceState(null, null, window.location.pathname + window.location.search);
                document.getElementById('recoveryPassword').value = '';
                document.getElementById('recoveryConfirm').value = '';
                switchAuthTab('login');
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        }

        // ==================== DATA FUNCTIONS ====================
        async function loadAllData() {
            await Promise.all([
                loadData('booking'),
                loadData('gallery'),
                loadData('packages'),
                loadData('reviews'),
                loadData('canvas_asset')
            ]);
        }

        async function loadData(table) {
            if (!supabaseClient) return;
            try {
                const tableName = dbTableMap[table];
                const pkCol = table === 'packages' ? 'package_id' : 'id';
                const { data, error } = await supabaseClient
                    .from(tableName)
                    .select('*')
                    .order(pkCol, { ascending: false });

                if (error) throw error;
                dataStore[table] = data || [];
                renderTable(table);
                if (table === 'booking') updateBookingStats();
                if (table === 'gallery') document.getElementById('galleryCount').textContent = dataStore.gallery.length;
                if (table === 'reviews') document.getElementById('reviewsCount').textContent = dataStore.reviews.length;
                if (table === 'packages') {
                    const packageField = tableSchemas.booking.fields.find(f => f.name === 'package_id');
                    if (packageField) {
                        packageField.options = dataStore.packages.map(p => ({
                            value: p.package_id.toString(),
                            label: p.name + ' (₱' + p.price + ')'
                        }));
                    }
                }
                if (table === 'contacts') {
                    document.getElementById('contactsCount').textContent = dataStore.contacts.length;
                }
            } catch (err) {
                showToast('Failed to load ' + table + ': ' + err.message, 'error');
            }
        }

        function setupRealtime() {
            const tables = ['booking', 'gallery', 'packages', 'reviews', 'canvas_asset', 'contacts'];
            tables.forEach(table => {
                const tableName = dbTableMap[table];
                supabaseClient
                    .channel(table + '_changes')
                    .on('postgres_changes', { event: '*', schema: 'public', table: tableName },
                        (payload) => { handleRealtimeChange(table, payload); })
                    .subscribe();
            });
        }

        function handleRealtimeChange(table, payload) {
            if (payload.eventType === 'INSERT') {
                dataStore[table].unshift(payload.new);
                showToast('New ' + table.slice(0, -1) + ' added', 'info');
            } else if (payload.eventType === 'UPDATE') {
                const pkCol = table === 'packages' ? 'package_id' : 'id';
                const pkVal = payload.new[pkCol];
                const idx = dataStore[table].findIndex(item => (item[pkCol] || item.id) === pkVal);
                if (idx !== -1) dataStore[table][idx] = payload.new;
                showToast(table.slice(0, -1) + ' updated', 'info');
            } else if (payload.eventType === 'DELETE') {
                const delPkCol = table === 'packages' ? 'package_id' : 'id';
                dataStore[table] = dataStore[table].filter(item => (item[delPkCol] || item.id) !== payload.old[delPkCol]);
                showToast(table.slice(0, -1) + ' deleted', 'info');
            }
            if (table === 'booking') updateBookingStats();
            if (table === 'gallery') document.getElementById('galleryCount').textContent = dataStore.gallery.length;
            if (table === 'reviews') document.getElementById('reviewsCount').textContent = dataStore.reviews.length;
            if (table === 'contacts') document.getElementById('contactsCount').textContent = dataStore.contacts.length;
             renderTable(table);
        }

        function updateBookingStats() {
            const bookings = dataStore.booking;
            const pending   = bookings.filter(b => b.status === 'pending').length;
            const confirmed = bookings.filter(b => b.status === 'confirmed').length;
            const completed = bookings.filter(b => b.status === 'completed').length;
            const cancelled = bookings.filter(b => b.status === 'cancelled').length;
            const total     = bookings.length;

            document.getElementById('pendingCount').textContent   = pending;
            document.getElementById('completedCount').textContent = completed;
            document.getElementById('cancelledCount').textContent = cancelled;
            document.getElementById('totalCount').textContent     = total;

            document.getElementById('badgeAll').textContent       = total;
            document.getElementById('badgePending').textContent   = pending;
            document.getElementById('badgeCompleted').textContent = completed;
            document.getElementById('badgeCancelled').textContent = cancelled;

            // Update confirmed badge if element exists
            const badgeConfirmed = document.getElementById('badgeConfirmed');
            if (badgeConfirmed) badgeConfirmed.textContent = confirmed;
            const confirmedCount = document.getElementById('confirmedCount');
            if (confirmedCount) confirmedCount.textContent = confirmed;
        }

        // ==================== RENDER FUNCTIONS ====================
        function renderTable(table) {
            if (table === 'booking') renderBookings();
            else if (table === 'gallery') renderGallery();
            else if (table === 'packages') renderPackages();
            else if (table === 'reviews') renderReviews();
            else if (table === 'canvas_asset') renderAssets();
            else if (table === 'contacts') renderContacts();
        }

        function renderBookings() {
            const tbody = document.getElementById('bookingTableBody');
            let bookings = [...dataStore.booking];
            const isAdmin = userRole === 'admin';

            if (currentStatusFilter !== 'all') {
                bookings = bookings.filter(b => b.status === currentStatusFilter);
            }

            const search = document.getElementById('bookingSearch')?.value.toLowerCase() || '';
            if (search) {
                bookings = bookings.filter(b =>
                    (b.customer_name && b.customer_name.toLowerCase().includes(search)) ||
                    (b.email && b.email.toLowerCase().includes(search)) ||
                    (b.contact_number && b.contact_number.includes(search)) ||
                    (b.service_type && b.service_type.toLowerCase().includes(search)) ||
                    (b.canvas_design && b.canvas_design.toLowerCase().includes(search)) ||
                    // FIX: also searchable by booking reference code
                    (b.booking_reference && b.booking_reference.toLowerCase().includes(search))
                );
            }

            const total = bookings.length;
            const totalPages = Math.ceil(total / itemsPerPage) || 1;
            const start = (currentPage - 1) * itemsPerPage;
            const end = Math.min(start + itemsPerPage, total);
            const pageItems = bookings.slice(start, end);

            document.getElementById('showingStart').textContent = total > 0 ? start + 1 : 0;
            document.getElementById('showingEnd').textContent = end;
            document.getElementById('showingTotal').textContent = total;
            renderPagination(totalPages);

            if (pageItems.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><i class="fas fa-calendar-alt"></i><h3>No sessions found</h3><p>' + (search ? 'Try adjusting your search' : 'Book your first photo session') + '</p></div></td></tr>';
                return;
            }

            tbody.innerHTML = pageItems.map(booking => {
                const pkg = dataStore.packages.find(p => (p.package_id || p.id) == booking.package_id);
                const statusClass = 'status-' + (booking.status || 'pending');
                const date = (() => {
                    if (!booking.booking_date) return '-';
                    const [y, m, d] = booking.booking_date.slice(0, 10).split('-').map(Number);
                    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                })();
                const isStale = booking.status === 'pending' && booking.created_at &&
                    (Date.now() - new Date(booking.created_at).getTime()) > 86400000;
                const staleBadge = isStale ? '<span title="Pending over 24h" style="margin-left:5px;background:#fff3cd;color:#856404;border:1px solid #ffc107;border-radius:4px;font-size:0.68rem;font-weight:700;padding:1px 5px;">&#9888; 24h+</span>' : '';
                const sessionTypeIcon = {
                    'Peekaboo Sessions': 'fa-birthday-cake',
                    'Bump & Bliss Sessions': 'fa-baby',
                    'Event Photo & Video Packages': 'fa-champagne-glasses',
                    'Self Portrait Packages': 'fa-user',
                    'Mini Session Portrait Packages': 'fa-camera',
                    'Mini Session Family Packages': 'fa-users',
                    'Snuggle Sessions': 'fa-baby-carriage'
                };
                const icon = sessionTypeIcon[booking.service_type] || 'fa-camera';
                const actions = isAdmin ?
                    '<div class="action-btns"><button class="btn-action" onclick="editItem(\'booking\', ' + booking.id + ')" title="Edit Session"><i class="fas fa-edit"></i></button><select class="status-select" onchange="updateBookingStatus(' + booking.id + ', this.value)" title="Change Status"><option value="pending"' + (booking.status==='pending'?' selected':'') + '>Pending</option><option value="confirmed"' + (booking.status==='confirmed'?' selected':'') + '>Confirm</option><option value="completed"' + (booking.status==='completed'?' selected':'') + '>Complete</option><option value="cancelled"' + (booking.status==='cancelled'?' selected':'') + '>Cancel</option></select><button class="btn-action delete" onclick="deleteItem(\'booking\', ' + booking.id + ')" title="Delete"><i class="fas fa-trash"></i></button></div>' :
                    '<span style="color:var(--text-muted);font-size:0.75rem;">View only</span>';
                const timeDisplay = booking.booking_time ? escapeHtml(booking.booking_time) : '-';
                return '<tr class="fade-in"><td><span style="font-family:var(--font-display); font-weight:600;">#' + booking.id + '</span></td><td><div style="display:flex;align-items:center;gap:0.75rem;"><div style="width:36px;height:36px;border-radius:50%;background:var(--accent-glow);display:flex;align-items:center;justify-content:center;color:var(--accent);"><i class="fas ' + icon + '"></i></div><div><strong>' + escapeHtml(booking.customer_name || '-') + '</strong><div style="font-size:0.75rem;color:var(--text-muted);text-transform:capitalize;">' + (booking.service_type || 'Session') + '</div></div></div></td><td>' + escapeHtml(booking.email || '-') + '<br><span style="font-size:0.75rem;color:var(--text-muted);">' + (booking.contact_number || '-') + '</span></td><td>' + date + '</td><td><span style="font-size:0.875rem;font-weight:500;color:var(--text-primary);">' + timeDisplay + '</span></td><td><span class="badge badge-gold">' + (pkg ? escapeHtml(pkg.name) : 'Custom') + '</span></td><td><span class="status-badge ' + statusClass + '"><span class="status-dot"></span> ' + (booking.status === 'pending' ? 'Upcoming' : booking.status === 'completed' ? 'Completed' : booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled') + '</span>' + staleBadge + '</td>' +
                (booking.booking_reference ? '<td><div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:0.82rem;background:var(--accent-glow);padding:5px 10px;border-radius:6px;color:var(--accent);font-weight:700;border:1px solid rgba(122,28,42,0.12);">' + booking.booking_reference + '</span><button class="btn-action" onclick="copyToClipboard(\'' + booking.booking_reference + '\')" title="Copy Code" style="width:28px;height:28px;"><i class="fas fa-copy"></i></button></div></td>' : '<td><span style="color:var(--text-muted);font-size:0.75rem;">—</span></td>') +
                '<td>' + actions + '</td></tr>';
            }).join('');
        }

        function renderGallery() {
            const grid = document.getElementById('galleryGrid');
            let items = [...dataStore.gallery];
            const isAdmin = userRole === 'admin';

            const search = document.getElementById('gallerySearch')?.value.toLowerCase() || '';
            if (search) {
                items = items.filter(item =>
                    (item.description && item.description.toLowerCase().includes(search)) ||
                    (item.category && item.category.toLowerCase().includes(search))
                );
            }

            if (galleryCategoryFilter !== 'all') {
                items = items.filter(item => item.category === galleryCategoryFilter);
            }

            if (items.length === 0) {
                grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><i class="fas fa-images"></i><h3>No photos found</h3><p>' + (search ? 'Try adjusting your search' : 'Add your first gallery photo') + '</p></div>';
                return;
            }

            grid.innerHTML = items.map(item => {
                const overlay = isAdmin ?
                    '<div class="gallery-item-overlay"><button class="btn-action" onclick="editItem(\'gallery\', ' + item.id + ')" title="Edit Photo"><i class="fas fa-edit"></i></button><button class="btn-action delete" onclick="deleteItem(\'gallery\', ' + item.id + ')" title="Remove Photo"><i class="fas fa-trash"></i></button></div>' : '';
                return '<div class="gallery-item fade-in"><img src="' + (item.image_url || 'https://via.placeholder.com/400?text=No+Image') + '" alt="' + escapeHtml(item.description || '') + '" onerror="this.src=\'https://via.placeholder.com/400?text=Error\'">' + overlay + '<div class="gallery-item-info"><h4>' + (item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Uncategorized') + '</h4><p>' + escapeHtml(item.description || '') + '</p></div></div>';
            }).join('');
        }

        function renderPackages() {
            const tbody = document.getElementById('packageTableBody');
            let items = [...dataStore.packages];
            const isAdmin = userRole === 'admin';
            const search = document.getElementById('packageSearch')?.value.toLowerCase() || '';
            if (search) {
                items = items.filter(item =>
                    (item.name && item.name.toLowerCase().includes(search)) ||
                    (item.description && item.description.toLowerCase().includes(search))
                );
            }
            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><i class="fas fa-gem"></i><h3>No packages found</h3><p>' + (search ? 'Try adjusting your search' : 'Create your first session package') + '</p></div></td></tr>';
                return;
            }
            tbody.innerHTML = items.map(pkg => {
                const pkVal = pkg.package_id || pkg.id;
                const actions = isAdmin ?
                    '<div class="action-btns"><button class="btn-action" onclick="editItem(\'packages\', ' + pkVal + ')" title="Edit Package"><i class="fas fa-edit"></i></button><button class="btn-action delete" onclick="deleteItem(\'packages\', ' + pkVal + ')" title="Delete Package"><i class="fas fa-trash"></i></button></div>' :
                    '<span style="color:var(--text-muted);font-size:0.75rem;">View only</span>';
                return '<tr class="fade-in"><td><strong style="font-family:var(--font-display); font-size:1rem;">' + escapeHtml(pkg.name || '-') + '</strong><div style="font-size:0.75rem;color:var(--text-muted);text-transform:capitalize;">' + (pkg.service_type || '') + '</div></td><td class="truncate">' + escapeHtml(pkg.description || '-') + '</td><td><span class="badge badge-gold" style="font-size:0.9rem;">₱' + (pkg.price || 0) + '</span></td><td>' + (pkg.pax ? pkg.pax + ' pax' : '-') + '</td><td><img src="' + (pkg.cover_image_url || 'https://via.placeholder.com/56?text=No+Img') + '" style="width:48px;height:48px;object-fit:cover;border-radius:8px;" onerror="this.src=\'https://via.placeholder.com/56?text=?\'" alt=""></td><td><span class="badge ' + (pkg.is_active ? 'badge-green' : 'badge-gold') + '">' + (pkg.is_active ? 'Active' : 'Archived') + '</span></td><td>' + actions + '</td></tr>';
            }).join('');
        }

        function renderReviews() {
            const tbody = document.getElementById('reviewTableBody');
            if (!tbody) return;

            let items = [...dataStore.reviews];
            const isAdmin = userRole === 'admin';
            const search = document.getElementById('reviewSearch')?.value.toLowerCase() || '';

            if (search) {
                items = items.filter(item =>
                    (item.customer_name && item.customer_name.toLowerCase().includes(search)) ||
                    (item.email && item.email.toLowerCase().includes(search)) ||
                    (item.service_type && item.service_type.toLowerCase().includes(search)) ||
                    (item.message && item.message.toLowerCase().includes(search)) ||
                    (item.review_key && item.review_key.toLowerCase().includes(search))
                );
            }

            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><i class="fas fa-star"></i><h3>No reviews found</h3><p>' + (search ? 'Try adjusting your search' : 'Verified customer reviews will appear here') + '</p></div></td></tr>';
                return;
            }

            tbody.innerHTML = items.map(review => {
                const statusClass = 'status-' + (review.status || 'pending');
                const date = review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
                const stars = Array.from({ length: 5 }, (_, index) => index < Number(review.rating || 0) ? '&#9733;' : '&#9734;').join('');
                const actions = isAdmin ?
                    '<div class="action-btns"><button class="btn-action" onclick="updateReviewStatus(' + review.id + ', \'published\')" title="Publish Review"><i class="fas fa-check"></i></button><button class="btn-action" onclick="updateReviewStatus(' + review.id + ', \'rejected\')" title="Reject Review"><i class="fas fa-ban"></i></button><button class="btn-action delete" onclick="deleteItem(\'reviews\', ' + review.id + ')" title="Delete Review"><i class="fas fa-trash"></i></button></div>' :
                    '<span style="color:var(--text-muted);font-size:0.75rem;">View only</span>';

                return '<tr class="fade-in contact-row-clickable" onclick="openReviewMessage(' + review.id + ')"><td>' + (review.review_key 
                    ? '<div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:0.82rem;background:var(--accent-glow);padding:5px 10px;border-radius:6px;color:var(--accent);font-weight:700;border:1px solid rgba(122,28,42,0.12);">' + escapeHtml(review.review_key) + '</span><button class="btn-action" onclick="event.stopPropagation();copyToClipboard(\'' + (review.review_key || '') + '\')" title="Copy Code" style="width:28px;height:28px;"><i class="fas fa-copy"></i></button></div>' 
                    : '<span style="color:var(--text-muted);font-size:0.75rem;">—</span>') + '</td>' + '<td><strong>' + escapeHtml(review.customer_name || '-') + '</strong><br><span style="font-size:0.75rem;color:var(--text-muted);">' + escapeHtml(review.email || '-') + '</span></td><td>' + escapeHtml(review.service_type || '-') + '</td><td><span class="badge badge-gold">' + stars + ' ' + Number(review.rating || 0) + '/5</span></td><td class="truncate">' + escapeHtml(review.message || '-') + '</td><td><span class="status-badge ' + statusClass + '"><span class="status-dot"></span> ' + escapeHtml(review.status || 'pending') + '</span></td><td>' + date + '</td><td onclick="event.stopPropagation();">' + actions + '</td></tr>';
            }).join('');
        }

        function renderAssets() {
            const tbody = document.getElementById('assetTableBody');
            let items = [...dataStore.canvas_asset];
            const isAdmin = userRole === 'admin';
            const search = document.getElementById('assetSearch')?.value.toLowerCase() || '';
            if (search) {
                items = items.filter(item =>
                    (item.name && item.name.toLowerCase().includes(search)) ||
                    (item.category && item.category.toLowerCase().includes(search))
                );
            }
            if (assetTypeFilter !== 'all') {
                items = items.filter(item => item.asset_type === assetTypeFilter);
            }
            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-paint-brush"></i><h3>No assets found</h3><p>' + (search ? 'Try adjusting your search' : 'Upload your first design asset') + '</p></div></td></tr>';
                return;
            }
            tbody.innerHTML = items.map(asset => {
                const typeIcons = {
                    background: 'fa-image', overlay: 'fa-adjust', frame: 'fa-border-all',
                    sticker: 'fa-sticky-note', text: 'fa-font', watermark: 'fa-copyright', logo: 'fa-camera'
                };
                const icon = typeIcons[asset.asset_type] || 'fa-file';
                const actions = isAdmin ?
                    '<div class="action-btns"><button class="btn-action" onclick="editItem(\'canvas_asset\', ' + asset.id + ')" title="Edit Asset"><i class="fas fa-edit"></i></button><button class="btn-action delete" onclick="deleteItem(\'canvas_asset\', ' + asset.id + ')" title="Delete Asset"><i class="fas fa-trash"></i></button></div>' :
                    '<span style="color:var(--text-muted);font-size:0.75rem;">View only</span>';
                return '<tr class="fade-in"><td><img src="' + (asset.image_url || 'https://via.placeholder.com/56') + '" class="thumbnail" onerror="this.src=\'https://via.placeholder.com/56?text=?\'" alt=""></td><td><strong>' + escapeHtml(asset.name || '-') + '</strong></td><td><span class="badge badge-purple"><i class="fas ' + icon + '" style="margin-right:4px;"></i>' + (asset.asset_type ? asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1) : '-') + '</span></td><td>' + (asset.created_at ? new Date(asset.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-') + '</td><td>' + actions + '</td></tr>';
            }).join('');
        }

        function renderPagination(totalPages) {
            const container = document.getElementById('paginationButtons');
            let html = '';
            html += '<button class="page-btn" onclick="changePage(' + (currentPage - 1) + ')" ' + (currentPage === 1 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i></button>';
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    html += '<button class="page-btn ' + (i === currentPage ? 'active' : '') + '" onclick="changePage(' + i + ')">' + i + '</button>';
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                    html += '<span style="color:var(--text-muted);padding:0 0.5rem;">...</span>';
                }
            }
            html += '<button class="page-btn" onclick="changePage(' + (currentPage + 1) + ')" ' + (currentPage === totalPages ? 'disabled' : '') + '><i class="fas fa-chevron-right"></i></button>';
            container.innerHTML = html;
        }

        function changePage(page) {
            currentPage = page;
            renderBookings();
        }

        // ==================== FILTER FUNCTIONS ====================
        function filterByStatus(status, evt) {
            currentStatusFilter = status;
            currentPage = 1;
            document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
            evt.target.closest('.filter-tab').classList.add('active');
            renderBookings();
        }

        function filterGalleryCategory(cat) {
            galleryCategoryFilter = cat;
            renderGallery();
        }

        function filterAssetType(type) {
            assetTypeFilter = type;
            renderAssets();
        }

        function filterBookings() { currentPage = 1; renderBookings(); }
        function filterGallery() { renderGallery(); }
        function filterPackages() { renderPackages(); }
        function filterReviews() { renderReviews(); }
        function filterAssets() { renderAssets(); }

        function renderContacts() {
    const tbody = document.getElementById('contactTableBody');
    if (!tbody) return;

    let items = [...dataStore.contacts];
    const isAdmin = userRole === 'admin';
    const isStaff = userRole === 'staff';

    const search = document.getElementById('contactSearch')?.value.toLowerCase() || '';
    if (search) {
        items = items.filter(c =>
            (c.name && c.name.toLowerCase().includes(search)) ||
            (c.email && c.email.toLowerCase().includes(search)) ||
            (c.subject && c.subject.toLowerCase().includes(search)) ||
            (c.message && c.message.toLowerCase().includes(search))
        );
    }

    // Update stats
    const total = dataStore.contacts.length;
    const unread = dataStore.contacts.filter(c => !c.status || c.status === 'new').length;
    document.getElementById('contactTotal').textContent = total;
    document.getElementById('contactNew').textContent = unread;
    document.getElementById('contactsCount').textContent = total;

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><i class="fas fa-inbox"></i><h3>No messages</h3><p>' + (search ? 'Try adjusting your search' : 'Contact form submissions will appear here') + '</p></div></td></tr>';
        return;
    }

    tbody.innerHTML = items.map(c => {
        const date = c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
        const status = c.status || 'new';
        const statusClass = status === 'new' ? 'status-pending' : status === 'replied' ? 'status-completed' : status === 'archived' ? 'status-rejected' : 'status-confirmed';
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

        const actions = isAdmin || isStaff ?
            '<div class="action-btns">' +
            '<button class="btn-action" onclick="updateContactStatus(' + c.id + ', \'read\')" title="Mark Read"><i class="fas fa-envelope-open"></i></button>' +
            '<button class="btn-action" onclick="updateContactStatus(' + c.id + ', \'replied\')" title="Mark Replied"><i class="fas fa-reply"></i></button>' +
            '<button class="btn-action" onclick="updateContactStatus(' + c.id + ', \'archived\')" title="Archive"><i class="fas fa-archive"></i></button>' +
            '<button class="btn-action delete" onclick="deleteItem(\'contacts\', ' + c.id + ')" title="Delete"><i class="fas fa-trash"></i></button>' +
            '</div>' :
            '<span style="color:var(--text-muted);font-size:0.75rem;">View only</span>';

        return '<tr class="fade-in contact-row-clickable" onclick="openContactMessage(' + c.id + ')"><td style="white-space:nowrap;font-size:0.8rem;color:var(--text-muted);">' + date + '</td>' +
            '<td><strong>' + escapeHtml(c.name || '-') + '</strong></td>' +
            '<td><a href="mailto:' + escapeHtml(c.email || '') + '" onclick="event.stopPropagation();" style="color:var(--accent);text-decoration:none;">' + escapeHtml(c.email || '-') + '</a></td>' +
            '<td>' + escapeHtml(c.phone || '-') + '</td>' +
            '<td><span class="badge badge-gold">' + escapeHtml(c.subject || 'General') + '</span></td>' +
            '<td style="max-width:280px;"><div style="max-height:60px;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(c.message || '-') + '</div></td>' +
            '<td><span class="status-badge ' + statusClass + '"><span class="status-dot"></span> ' + statusLabel + '</span></td>' +
            '<td onclick="event.stopPropagation();">' + actions + '</td></tr>';
    }).join('');
}

        function filterContacts() { renderContacts(); }

        async function updateContactStatus(id, status) {
            const isAdmin = userRole === 'admin';
            const isStaff = userRole === 'staff';
            if (!isAdmin && !isStaff) {
                showToast('You do not have permission to update contacts', 'error');
                return;
            }
            try {
                const { error } = await supabaseClient.from('contacts').update({ status }).eq('id', id);
                if (error) throw error;
                showToast('Message marked as ' + status, 'success');
                await loadData('contacts');
            } catch (err) {
                showToast('Update failed: ' + err.message, 'error');
            }
        }

        // ==================== TAB SWITCHING ====================
        function switchTab(tab, evt) {
            // Block staff from accessing settings
            if (tab === 'settings' && userRole !== 'admin') {
                showToast('Settings are restricted to admin users', 'error');
                return;
            }
            currentTab = tab;
            if (tab === 'settings') loadTeamMembers();
            document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
            document.getElementById('view-' + tab).style.display = 'block';
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            evt.currentTarget.classList.add('active');
            if (dataStore[tab] && dataStore[tab].length === 0) loadData(tab);
        }

        // ==================== MODAL FUNCTIONS ====================
        function openModal(table, id) {
            const isAdmin = userRole === 'admin';
            const isStaff = userRole === 'staff';

            if (!isAdmin && !isStaff) {
                showToast('You do not have permission to make changes', 'error');
                return;
            }

            // Staff can only edit bookings, reviews, contacts — not packages/gallery/assets
            if (isStaff && ['packages', 'gallery', 'canvas_asset'].includes(table)) {
                showToast('Only admin can modify packages, gallery, or design assets', 'error');
                return;
            }

            editingId = id;
            currentTab = table;
            const schema = tableSchemas[table];
            const isEdit = id !== null;
            document.getElementById('modalTitle').textContent = (isEdit ? 'Edit ' : 'Add ') + schema.title;
            let html = '';
            const pkCol = table === 'packages' ? 'package_id' : 'id';
            let item = isEdit ? dataStore[table].find(i => (i[pkCol] || i.id) === id) : null;

            schema.fields.forEach(field => {
                const value = item ? item[field.name] : '';
                html += '<div class="form-group">';
                html += '<label>' + field.label + (field.required ? ' *' : '') + '</label>';

                if (field.type === 'select') {
                    html += '<select id="field_' + field.name + '" ' + (field.required ? 'required' : '') + '>';
                    html += '<option value="">Select ' + field.label + '</option>';
                    field.options.forEach(opt => {
                        const optValue = typeof opt === 'object' ? opt.value : opt;
                        const optLabel = typeof opt === 'object' ? opt.label : opt;
                        const selected = value == optValue ? 'selected' : '';
                        html += '<option value="' + optValue + '" ' + selected + '>' + optLabel + '</option>';
                    });
                    html += '</select>';
                } else if (field.type === 'textarea') {
                    html += '<textarea id="field_' + field.name + '" ' + (field.required ? 'required' : '') + ' placeholder="' + (field.placeholder || '') + '">' + (value || '') + '</textarea>';
                } else if (field.type === 'file') {
                    html += '<input type="file" id="field_' + field.name + '" accept="' + (field.accept || '') + '" ' + (isEdit ? '' : 'required') + ' onchange="previewImage(this, \'preview_' + field.name + '\')">';
                    html += '<img id="preview_' + field.name + '" class="image-preview' + (value ? ' visible' : '') + '" src="' + (value || '') + '">';
                } else if (field.type === 'datetime-local') {
                    const formatted = value ? new Date(value).toISOString().slice(0, 16) : '';
                    html += '<input type="datetime-local" id="field_' + field.name + '" value="' + formatted + '" ' + (field.required ? 'required' : '') + '>';
                } else {
                    html += '<input type="' + field.type + '" id="field_' + field.name + '" value="' + (value || '') + '" ' + (field.required ? 'required' : '') + (field.step ? ' step="' + field.step + '"' : '') + (field.placeholder ? ' placeholder="' + field.placeholder + '"' : '') + '>';
                }
                html += '</div>';
            });

            document.getElementById('modalBody').innerHTML = html;
            document.getElementById('modalOverlay').classList.add('active');
        }

        function previewImage(input, previewId) {
            const preview = document.getElementById(previewId);
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.classList.add('visible');
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        function closeModal(e) {
            if (e && e.target !== document.getElementById('modalOverlay')) return;
            document.getElementById('modalOverlay').classList.remove('active');
            editingId = null;
        }

        function closeModalDirect() {
            document.getElementById('modalOverlay').classList.remove('active');
            editingId = null;
        }

        // ==================== SAVE / DELETE ====================
        async function saveItem() {
            const isAdmin = userRole === 'admin';
            const isStaff = userRole === 'staff';

            // Staff cannot create or edit packages, gallery, or assets
            if (isStaff && ['packages', 'gallery', 'canvas_asset'].includes(currentTab)) {
                showToast('Only admin can modify packages, gallery, or design assets', 'error');
                return;
            }

            const schema = tableSchemas[currentTab];
            const data = {};
            const saveBtn = document.getElementById('modalSaveBtn');
            const originalBtnHtml = saveBtn.innerHTML;

            // ── Validate all fields before doing anything ──────────
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            for (const field of schema.fields) {
                const el = document.getElementById('field_' + field.name);
                if (!el) continue;

                // Required check
                if (field.required && field.type !== 'file' && !el.value.trim()) {
                    showToast(field.label + ' is required', 'error');
                    el.focus();
                    return;
                }

                // Email format check
                if (field.type === 'email' && el.value.trim() && !emailRegex.test(el.value.trim())) {
                    showToast('Please enter a valid email address', 'error');
                    el.focus();
                    el.style.borderColor = 'var(--danger)';
                    el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
                    return;
                }

                // Required file check (new record only)
                if (field.type === 'file' && field.required && !editingId && (!el.files || !el.files[0])) {
                    showToast(field.label + ' is required', 'error');
                    return;
                }
            }

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<div class="loading-spinner"></div> Saving...';

            try {
                for (const field of schema.fields) {
                    const el = document.getElementById('field_' + field.name);
                    if (!el) continue;

                    if (field.type === 'file') {
                        if (el.files && el.files.length > 0 && el.files[0]) {
                            saveBtn.innerHTML = '<div class="loading-spinner"></div> Uploading image...';
                            try {
                                const uploadedUrl = await uploadFile(el.files[0], dbTableMap[currentTab]);
                                if (uploadedUrl) {
                                    data[field.name] = uploadedUrl;
                                } else {
                                    throw new Error('Image upload failed - no URL returned');
                                }
                            } catch (uploadErr) {
                                throw new Error('Image upload failed: ' + uploadErr.message);
                            }
                            saveBtn.innerHTML = '<div class="loading-spinner"></div> Saving...';
                        } else if (editingId) {
                            const pkCol = currentTab === 'packages' ? 'package_id' : 'id';
                            const existing = dataStore[currentTab].find(i => (i[pkCol] || i.id) === editingId);
                            if (existing && existing[field.name]) {
                                data[field.name] = existing[field.name];
                            }
                        }
                    } else if (field.type === 'number') {
                        data[field.name] = el.value ? parseFloat(el.value) : null;
                    } else if (field.type === 'select' && ['is_featured','is_active','includes_prints','includes_album','policy_agreed'].includes(field.name)) {
                        data[field.name] = el.value === 'true';
                    } else {
                        data[field.name] = el.value || null;
                    }
                }

                const dbTable = dbTableMap[currentTab];
                const pkCol = currentTab === 'packages' ? 'package_id' : 'id';

                if (editingId) {
                    const { data: result, error } = await supabaseClient.from(dbTable).update(data).eq(pkCol, editingId).select();
                    if (error) throw error;
                    showToast(schema.title + ' updated successfully', 'success');
                } else {
                    const { data: result, error } = await supabaseClient.from(dbTable).insert(data).select();
                    if (error) throw error;
                    showToast(schema.title + ' created successfully', 'success');
                }

                closeModalDirect();
                await loadData(currentTab);
            } catch (err) {
                console.error('Save error:', err);
                showToast('Error: ' + (err.message || 'Failed to save. Check console for details.'), 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalBtnHtml;
            }
        }

        async function uploadFile(file, folderName) {
            if (!file || file.size === 0) {
                throw new Error('No file selected or file is empty');
            }

            const fileExt = file.name.split('.').pop().toLowerCase();
            const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
            if (!allowedExts.includes(fileExt)) {
                throw new Error('Invalid file type. Allowed: ' + allowedExts.join(', '));
            }

            const fileName = Math.random().toString(36).substring(2) + '_' + Date.now() + '.' + fileExt;
            const filePath = folderName + '/' + fileName;

            const uploadPromise = supabaseClient.storage
                .from('studio-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Upload timed out after 30 seconds. Check your connection and bucket permissions.')), 30000);
            });

            const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

            if (uploadError) {
                console.error('Upload error details:', uploadError);
                throw new Error(uploadError.message || 'Upload failed');
            }

            const { data } = supabaseClient.storage.from('studio-images').getPublicUrl(filePath);
            if (!data || !data.publicUrl) {
                throw new Error('Failed to get public URL for uploaded file');
            }
            return data.publicUrl;
        }

        async function editItem(table, id) {
            openModal(table, id);
        }

        async function deleteItem(table, id) {
            const isAdmin = userRole === 'admin';

            if (!isAdmin) {
                showToast('Only admin can delete records', 'error');
                return;
            }

            const pkCol = table === 'packages' ? 'package_id' : 'id';
            const item = dataStore[table].find(i => (i[pkCol] || i.id) === id);
            const name = item ? (item.customer_name || item.name || item.title || 'this item') : 'this item';
            if (!confirm('Are you sure you want to remove "' + name + '"? This action cannot be undone.')) return;
            try {
                const { error } = await supabaseClient.from(dbTableMap[table]).delete().eq(pkCol, id);
                if (error) throw error;
                showToast('Removed successfully', 'success');
                await loadData(table);
            } catch (err) {
                showToast('Remove failed: ' + err.message, 'error');
            }
        }

        // ==================== BOOKING STATUS UPDATE ====================
        async function updateBookingStatus(id, status) {
            const isAdmin = userRole === 'admin';
            const isStaff = userRole === 'staff';
            if (!isAdmin && !isStaff) {
                showToast('You do not have permission to update bookings', 'error');
                return;
            }
            try {
                let updateData = { status };

                // Auto-generate reference code if missing (for legacy bookings)
                const booking = dataStore.booking.find(b => b.id === id);
                if (booking && !booking.booking_reference) {
                    updateData.booking_reference = generateBookingReference();
                }

                const { error } = await supabaseClient
                    .from('bookings')
                    .update(updateData)
                    .eq('id', id);
                if (error) throw error;
                showToast('Status updated to ' + status, 'success');

                // Send confirmation email when admin confirms or completes a session
                if (status === 'confirmed' || status === 'completed') {
                    await sendBookingConfirmationEmail(id, status);
                }

                await loadData('booking');
            } catch (err) {
                showToast('Update failed: ' + err.message, 'error');
            }
        }

        // ── SECURITY: Generate HMAC-SHA256 signature using Web Crypto API ──
        // The WEBHOOK_SECRET is fetched from Supabase Secrets at runtime
        // and never exposed in client-side code.
        async function generateHmacSignature(payload, secret) {
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(secret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );
            const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
            return Array.from(new Uint8Array(signature))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        // Send confirmation email via Supabase Edge Function (with HMAC signature)
        async function sendBookingConfirmationEmail(bookingId, status) {
            try {
                const booking = dataStore.booking.find(b => b.id === bookingId);
                if (!booking || !booking.email) {
                    console.warn('No email found for booking', bookingId);
                    return;
                }

                const pkg = dataStore.packages.find(p => (p.package_id || p.id) == booking.package_id);
                const packageName = pkg ? pkg.name : 'Custom Package';

                // Build the payload
                const payload = {
                    to: booking.email,
                    customerName: booking.customer_name,
                    bookingRef: booking.booking_reference || ('NKL-' + booking.id),
                    bookingDate: booking.booking_date,
                    bookingTime: booking.booking_time || '',
                    serviceType: booking.service_type || 'Photo Session',
                    packageName: packageName,
                    status: status,
                    studioName: 'Nikole Studio',
                    bookingReference: booking.booking_reference || null
                };
                const payloadJson = JSON.stringify(payload);

                // ── SECURITY: Fetch webhook secret from Supabase Secrets via Edge Function ──
                // We use a separate Edge Function to get the secret so it's never in client code
                let signature = '';
                try {
                    const { data: secretData, error: secretErr } = await supabaseClient.functions.invoke('get-webhook-secret', {
                        body: {}
                    });
                    if (!secretErr && secretData?.secret) {
                        signature = await generateHmacSignature(payloadJson, secretData.secret);
                    }
                } catch (secretErr) {
                    console.warn('Could not fetch webhook secret, proceeding without signature:', secretErr);
                }

                // Send the signed request
                const headers = signature ? { 'x-webhook-signature': signature } : {};
                const { data, error } = await supabaseClient.functions.invoke('send-booking-email', {
                    body: payload,
                    headers: headers
                });

                if (error) {
                    console.warn('Email send failed:', error);
                    showToast('Booking ' + status + ' but email failed to send', 'warning');
                } else {
                    showToast('Confirmation email sent to ' + booking.email, 'success');
                }
            } catch (err) {
                console.warn('Email function error:', err);
                showToast('Booking ' + status + ' but email could not be sent', 'warning');
            }
        }

        async function updateReviewStatus(id, status) {
            const isAdmin = userRole === 'admin';
            const isStaff = userRole === 'staff';
            if (!isAdmin && !isStaff) {
                showToast('You do not have permission to moderate reviews', 'error');
                return;
            }

            try {
                const { error } = await supabaseClient
                    .from('reviews')
                    .update({ status })
                    .eq('id', id);
                if (error) throw error;
                showToast('Review marked as ' + status, 'success');
                await loadData('reviews');
            } catch (err) {
                showToast('Review update failed: ' + err.message, 'error');
            }
        }

        // ==================== EXPORT ====================
        function exportSessions() {
            const bookings = dataStore.booking;
            if (bookings.length === 0) {
                showToast('No sessions to export', 'error');
                return;
            }
            let csv = 'ID,Customer Name,Email,Contact Number,Booking Date,Service Type,Package,Status,Policy Agreed,Notes\n';
            bookings.forEach(b => {
                const pkg = dataStore.packages.find(p => (p.package_id || p.id) == b.package_id);
                csv += [b.id, b.customer_name, b.email, b.contact_number, b.booking_date, b.service_type, pkg ? pkg.name : '', b.status, b.policy_agreed, b.notes].map(v => '"' + (v !== null && v !== undefined ? String(v) : '').replace(/"/g, '""') + '"').join(',') + '\n';
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nikole-studio-sessions-' + new Date().toISOString().slice(0, 10) + '.csv';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Sessions exported to CSV', 'success');
        }

        // ==================== SETTINGS ====================
        function toggleSetting(el) {
            el.classList.toggle('active');
        }

        function showDbModal() {
            showToast('Database settings can be changed in the connection form', 'info');
        }

        // ==================== UTILITIES ====================
        function showToast(message, type) {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = 'toast ' + type;
            const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
            toast.innerHTML = '<i class="fas fa-' + icon + ' toast-icon"></i><div class="toast-content"><div class="toast-title">' + (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info') + '</div><div class="toast-message">' + message + '</div></div>';
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Reference code copied to clipboard', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

function generateBookingReference() {
    const date = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const seg = () => Array.from({length: 9}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `NKL-${date}-${seg()}`;
}

        // ==================== CONTACT MESSAGE MODAL ====================
        let currentContactId = null;
        let currentContactEmail = null;
        let currentContactSubject = null;

        function openContactMessage(id) {
            const c = dataStore.contacts.find(x => x.id === id);
            if (!c) return;
            const isAdmin = userRole === 'admin';
            const isStaff = userRole === 'staff';
            const date = c.created_at ? new Date(c.created_at).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
            const status = c.status || 'new';

            currentContactId = id;
            currentContactEmail = c.email || '';
            currentContactSubject = c.subject || 'General Inquiry';

            document.getElementById('cmSubject').textContent = currentContactSubject;
            document.getElementById('cmName').textContent = c.name || '-';
            document.getElementById('cmEmail').innerHTML = c.email ? '<a href="mailto:' + escapeHtml(c.email) + '" onclick="event.stopPropagation();">' + escapeHtml(c.email) + '</a>' : '-';
            document.getElementById('cmPhone').textContent = c.phone || '-';
            document.getElementById('cmDate').textContent = date;
            document.getElementById('cmStatus').textContent = status.charAt(0).toUpperCase() + status.slice(1);
            document.getElementById('cmBody').textContent = c.message || '';
            document.getElementById('cmReplyTo').textContent = c.name || c.email || 'sender';
            document.getElementById('cmReplyText').value = '';

            const showActions = isAdmin || isStaff;
            document.getElementById('cmMarkRead').style.display = showActions ? '' : 'none';
            document.getElementById('cmMarkReplied').style.display = showActions ? '' : 'none';

            document.getElementById('contactModalOverlay').classList.add('open');
            document.getElementById('contactModal').classList.add('open');

            if ((isAdmin || isStaff) && (!status || status === 'new')) {
                updateContactStatus(id, 'read');
            }
        }

        function closeContactModal() {
            document.getElementById('contactModalOverlay').classList.remove('open');
            document.getElementById('contactModal').classList.remove('open');
            currentContactId = null;
        }

        async function cmAction(status) {
            if (!currentContactId) return;
            await updateContactStatus(currentContactId, status);
            document.getElementById('cmStatus').textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }

        function sendContactReply() {
            const replyText = document.getElementById('cmReplyText').value.trim();
            if (!replyText) { showToast('Please write a reply first', 'error'); return; }
            if (!currentContactEmail) { showToast('No email address to reply to', 'error'); return; }

            const subject = encodeURIComponent('Re: ' + currentContactSubject);
            const body = encodeURIComponent(replyText + '\n\n---\nNikole Studio\nhello@nikolestudio.ph');
            window.location.href = 'mailto:' + encodeURIComponent(currentContactEmail) + '?subject=' + subject + '&body=' + body;

            cmAction('replied');
            showToast('Email client opened — reply ready to send', 'success');
        }

        // ==================== REVIEW MESSAGE MODAL ====================
        let currentReviewId = null;

        function openReviewMessage(id) {
            const r = dataStore.reviews.find(x => x.id === id);
            if (!r) return;
            const isAdmin = userRole === 'admin';
            const isStaff = userRole === 'staff';
            const date = r.created_at ? new Date(r.created_at).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
            const stars = Array.from({ length: 5 }, (_, i) => i < Number(r.rating || 0) ? '★' : '☆').join('');
            const status = r.status || 'pending';

            currentReviewId = id;

            document.getElementById('rmService').textContent = r.service_type || '-';
            document.getElementById('rmName').textContent = r.customer_name || '-';
            document.getElementById('rmEmail').textContent = r.email || '-';
            document.getElementById('rmRef').textContent = r.review_key || '-';
            document.getElementById('rmRating').textContent = stars + '  ' + Number(r.rating || 0) + '/5';
            document.getElementById('rmDate').textContent = date;
            document.getElementById('rmStatus').textContent = status.charAt(0).toUpperCase() + status.slice(1);
            document.getElementById('rmBody').textContent = r.message || '';

            const publishBtn = document.getElementById('rmPublish');
            const rejectBtn = document.getElementById('rmReject');
            if (publishBtn) publishBtn.style.display = (isAdmin || isStaff) ? '' : 'none';
            if (rejectBtn) rejectBtn.style.display = (isAdmin || isStaff) ? '' : 'none';

            document.getElementById('reviewModalOverlay').classList.add('open');
            document.getElementById('reviewModal').classList.add('open');
        }

        function closeReviewModal() {
            document.getElementById('reviewModalOverlay').classList.remove('open');
            document.getElementById('reviewModal').classList.remove('open');
            currentReviewId = null;
        }

        async function rmAction(status) {
            if (!currentReviewId) return;
            await updateReviewStatus(currentReviewId, status);
            document.getElementById('rmStatus').textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }

function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
        }

        function toggleSidebarCollapse() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
            const toggleBtn = document.getElementById('sidebarToggle');
            if (toggleBtn) {
                toggleBtn.title = isCollapsed ? 'Expand menu' : 'Collapse menu';
            }
        }

        function restoreSidebarState() {
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (isCollapsed) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.add('collapsed');
                    const toggleBtn = document.getElementById('sidebarToggle');
                    if (toggleBtn) toggleBtn.title = 'Expand menu';
                }
            }
        }

    async function sendBookingConfirmationEmail(bookingId, status) {
    try {
        const booking = dataStore.booking.find(b => b.id === bookingId);
        if (!booking || !booking.email) {
            console.warn('No email found for booking', bookingId);
            return;
        }

        const pkg = dataStore.packages.find(p => (p.package_id || p.id) == booking.package_id);

        // Call your own Vercel API (same domain)
        const res = await fetch('/api/send_email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: booking.email,
                customerName: booking.customer_name,
                bookingRef: booking.booking_reference || ('NKL-' + booking.id),
                bookingDate: booking.booking_date,
                bookingTime: booking.booking_time || '',
                serviceType: booking.service_type || 'Photo Session',
                packageName: pkg ? pkg.name : 'Custom Package'
            })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error);

        showToast('Confirmation email sent to ' + booking.email, 'success');
    } catch (err) {
        console.warn('Email failed:', err);
        showToast('Booking confirmed but email failed: ' + err.message, 'warning');
    }
}