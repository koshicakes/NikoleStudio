// contact.js - submits contact and review forms to Supabase
// Requires: Supabase CDN and supabase.js loaded before this script

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const btn = form?.querySelector('button[type="submit"]');

    if (form && btn) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Sending...';

            const name = document.getElementById('contact-name')?.value.trim();
            const email = document.getElementById('contact-email')?.value.trim();
            const phone = document.getElementById('contact-phone')?.value.trim() || null;
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
    }

    const reviewForm = document.getElementById('review-form');
    const reviewBtn = reviewForm?.querySelector('button[type="submit"]');

    if (reviewForm && reviewBtn) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!reviewForm.checkValidity()) { reviewForm.reportValidity(); return; }

            const originalText = reviewBtn.textContent;
            reviewBtn.disabled = true;
            reviewBtn.textContent = 'Checking booking...';

            const formData = new FormData(reviewForm);

            try {
                const { data, error } = await nikoleDB.rpc('submit_review', {
                    p_review_key: formData.get('review_key')?.trim(),
                    p_customer_name: formData.get('customer_name')?.trim(),
                    p_email: formData.get('email')?.trim().toLowerCase(),
                    p_service_type: formData.get('service_type'),
                    p_rating: Number(formData.get('rating')),
                    p_message: formData.get('message')?.trim()
                });

                if (error) throw error;
                if (!data?.success) throw new Error(data?.error || 'Unable to submit review');

                reviewBtn.textContent = 'Review Submitted!';
                reviewBtn.style.background = '#4a7c59';
                reviewForm.reset();

                setTimeout(() => {
                    reviewBtn.disabled = false;
                    reviewBtn.textContent = originalText;
                    reviewBtn.style.background = '';
                }, 6000);
            } catch (err) {
                alert('Review could not be submitted: ' + err.message);
                reviewBtn.disabled = false;
                reviewBtn.textContent = originalText;
            }
        });
    }

    if (window.location.hash === '#send-review') {
        setTimeout(() => {
            document.getElementById('send-review')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    }
});