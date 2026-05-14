// contact.js — submits contact form to Supabase
// Requires: supabase.js loaded before this script

document.addEventListener('DOMContentLoaded', () => {
    const form   = document.getElementById('contact-form');
    const btn    = form?.querySelector('button[type="submit"]');
    if (!form || !btn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending…';

        const name    = document.getElementById('contact-name')?.value.trim();
        const email   = document.getElementById('contact-email')?.value.trim();
        const phone   = document.getElementById('contact-phone')?.value.trim() || null;
        const subject = document.getElementById('contact-subject')?.value || null;
        const message = document.getElementById('contact-message')?.value.trim();

        try {
            const { error } = await nikoleDB.from('contacts').insert({
                name, email, phone, subject, message,
                created_at: new Date().toISOString()
            });
            if (error) throw error;

            btn.textContent = 'Message Sent!';
            btn.style.background = '#4a7c59';
            form.reset();

            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
                btn.style.background = '';
            }, 5000);

        } catch (err) {
            alert('Message could not be sent: ' + err.message + '\n\nPlease reach us via Messenger instead.');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
});
