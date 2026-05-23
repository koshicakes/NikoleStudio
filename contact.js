// contact.js - submits contact and review forms to Supabase
// Requires: Supabase CDN and supabase.js loaded before this script

// ADD THIS HELPER (only addition)
const withTimeout = (promise, ms) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
]);

let gContactCaptchaToken = null;
let gReviewCaptchaToken = null;

function onContactCaptcha(token) { gContactCaptchaToken = token; }
function onReviewCaptcha(token) { gReviewCaptchaToken = token; }
function onContactCaptchaExpired() { gContactCaptchaToken = null; }
function onReviewCaptchaExpired() { gReviewCaptchaToken = null; }

document.addEventListener('DOMContentLoaded', () => {
    if (typeof hcaptcha !== 'undefined') {
        hcaptcha.render('contact-captcha', {
            callback: onContactCaptcha,
            'expired-callback': onContactCaptchaExpired
        });
        hcaptcha.render('review-captcha', {
            callback: onReviewCaptcha,
            'expired-callback': onReviewCaptchaExpired
        });
    }

    const form = document.getElementById('contact-form');
    const btn = form?.querySelector('button[type="submit"]');

    if (form && btn) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Sending...';

            try {
                const name = document.getElementById('contact-name')?.value.trim();
                const email = document.getElementById('contact-email')?.value.trim();
                const phone = document.getElementById('contact-phone')?.value.trim() || null;
                const subject = document.getElementById('contact-subject')?.value || null;
                const message = document.getElementById('contact-message')?.value.trim();

                const hCaptchaToken = gContactCaptchaToken;

                if (!hCaptchaToken) {
                    alert('Please complete the CAPTCHA verification.');
                    btn.disabled = false;
                    btn.textContent = originalText;
                    return;
                }

                // WRAPPED WITH TIMEOUT
                const { error } = await withTimeout(
                    nikoleDB.functions.invoke('submit-contact', {
                        body: { name, email, phone, subject, message, hCaptchaToken }
                    }),
                    10000
                );
                if (error) throw error;

                btn.textContent = 'Message Sent!';
                btn.style.background = '#4a7c59';
                form.reset();
                gContactCaptchaToken = null;

                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 5000);
            } catch (err) {
                console.error('Contact form error:', err);
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

            try {
                const reviewCaptchaToken = gReviewCaptchaToken;

                if (!reviewCaptchaToken) {
                    alert('Please complete the CAPTCHA verification.');
                    reviewBtn.disabled = false;
                    reviewBtn.textContent = originalText;
                    return;
                }

                const formData = new FormData(reviewForm);

                // WRAPPED WITH TIMEOUT
                const { data, error } = await withTimeout(
                    nikoleDB.rpc('submit_review', {
                        p_review_key: formData.get('review_key')?.trim(),
                        p_customer_name: formData.get('customer_name')?.trim(),
                        p_email: formData.get('email')?.trim().toLowerCase(),
                        p_service_type: formData.get('service_type'),
                        p_rating: Number(formData.get('rating')),
                        p_message: formData.get('message')?.trim()
                    }),
                    10000
                );

                if (error) throw error;
                if (!data?.success) throw new Error(data?.error || 'Unable to submit review');

                reviewBtn.textContent = 'Review Submitted!';
                reviewBtn.style.background = '#4a7c59';
                reviewForm.reset();
                gReviewCaptchaToken = null;

                setTimeout(() => {
                    reviewBtn.disabled = false;
                    reviewBtn.textContent = originalText;
                    reviewBtn.style.background = '';
                }, 6000);
            } catch (err) {
                console.error('Review form error:', err);
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