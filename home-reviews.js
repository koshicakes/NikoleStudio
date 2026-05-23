document.addEventListener('DOMContentLoaded', async () => {
    const reviewsContainer = document.getElementById('publishedReviews');
    const summaryEl = document.getElementById('reviewsSummary');
    if (!reviewsContainer || !window.nikoleDB) return;

    const stars = rating => {
        const value = Number(rating || 0);
        return Array.from({ length: 5 }, (_, index) => index < value ? '&#9733;' : '&#9734;').join('');
    };
    const initials = name => (name || 'NS')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('');
    const escapeHtml = text => {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    };
    const formatDate = value => value
        ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';

    try {
        const [{ data: reviews, error: reviewsError }, { data: summary, error: summaryError }] = await Promise.all([
            nikoleDB.from('published_reviews').select('customer_name, service_type, rating, message, review_date').order('review_date', { ascending: false }).limit(6),
            nikoleDB.from('review_rating_summary').select('average_rating, total_reviews').single()
        ]);

        if (reviewsError) throw reviewsError;
        if (summaryError) throw summaryError;

        if (summaryEl && summary) {
            const average = Number(summary.average_rating || 0).toFixed(1);
            summaryEl.textContent = average + '/5 average from ' + Number(summary.total_reviews || 0) + ' published reviews';
        }

        if (!reviews || reviews.length === 0) {
            reviewsContainer.innerHTML = '<div class="testimonial-card-item"><div class="card-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p class="card-quote">Published reviews will appear here after completed customers submit feedback.</p></div>';
            return;
        }

        reviewsContainer.innerHTML = reviews.map(review => (
            '<div class="testimonial-card-item">' +
                '<div class="card-stars">' + stars(review.rating) + '</div>' +
                '<p class="card-quote">' + escapeHtml(review.message) + '</p>' +
                '<div class="card-reviewer">' +
                    '<div class="reviewer-avatar" aria-hidden="true">' + escapeHtml(initials(review.customer_name)) + '</div>' +
                    '<div class="reviewer-info">' +
                        '<strong>' + escapeHtml(review.customer_name) + '</strong>' +
                        '<span>' + escapeHtml(review.service_type || 'Completed session') + ' - ' + formatDate(review.review_date) + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>'
        )).join('');
    } catch (err) {
        console.warn('Could not load published reviews:', err.message);
        reviewsContainer.innerHTML = '<div class="testimonial-card-item"><div class="card-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p class="card-quote">Reviews are temporarily unavailable.</p></div>';
    }
});
