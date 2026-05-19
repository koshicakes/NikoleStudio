// carousel.js

document.addEventListener('DOMContentLoaded', () => {

    // ── TESTIMONIALS CAROUSEL (.carousel-container) ──────────────
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        const cards = document.querySelectorAll('.testimonial-card');
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.querySelector('.carousel-container .carousel-arrow.prev');
        const nextBtn = document.querySelector('.carousel-container .carousel-arrow.next');
        let currentSlide = 0;
        const totalSlides = cards.length;
        let autoplayInterval = null;

        const updateCarousel = () => {
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
            cards.forEach((card, i) => card.classList.toggle('active', i === currentSlide));
            indicators.forEach((ind, i) => ind.classList.toggle('active', i === currentSlide));
        };

        const nextSlide = () => { currentSlide = (currentSlide + 1) % totalSlides; updateCarousel(); };
        const prevSlide = () => { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; updateCarousel(); };

        indicators.forEach((ind, i) => ind.addEventListener('click', () => { currentSlide = i; updateCarousel(); }));
        nextBtn?.addEventListener('click', nextSlide);
        prevBtn?.addEventListener('click', prevSlide);

        autoplayInterval = setInterval(nextSlide, 5000);
        const section = document.querySelector('.testimonials-carousel');
        section?.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
        section?.addEventListener('mouseleave', () => { autoplayInterval = setInterval(nextSlide, 5000); });

        updateCarousel();
    }

    // ── REVIEW PAGES CAROUSEL (.carousel-track) ──────────────────
    const track = document.querySelector('.carousel-track');
    const pages = Array.from(document.querySelectorAll('.carousel-page'));
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn2 = document.querySelector('.carousel-nav .carousel-arrow.prev, .carousel-controls .carousel-arrow.prev');
    const nextBtn2 = document.querySelector('.carousel-nav .carousel-arrow.next, .carousel-controls .carousel-arrow.next');

    if (track && pages.length) {
        const allReviewItems = [];
        pages.forEach(page => page.querySelectorAll('.review-item').forEach(item => allReviewItems.push(item.cloneNode(true))));
        track.innerHTML = '';

        let currentPage = 0;
        let totalPages = 0;
        let itemsPerPage = 3;

        function getItemsPerPage() { return window.innerWidth <= 600 ? 1 : 3; }

        function buildPages() {
            track.innerHTML = '';
            itemsPerPage = getItemsPerPage();
            totalPages = Math.ceil(allReviewItems.length / itemsPerPage);
            for (let i = 0; i < totalPages; i++) {
                const page = document.createElement('div');
                page.className = 'carousel-page';
                allReviewItems.slice(i * itemsPerPage, i * itemsPerPage + itemsPerPage)
                    .forEach(item => page.appendChild(item.cloneNode(true)));
                track.appendChild(page);
            }
            buildDots();
            currentPage = Math.min(currentPage, totalPages - 1);
            goToPage(currentPage);
        }

        function buildDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('button');
                dot.className = 'dot' + (i === currentPage ? ' active' : '');
                dot.setAttribute('data-page', i);
                dot.addEventListener('click', () => goToPage(i));
                dotsContainer.appendChild(dot);
            }
        }

        function goToPage(index) {
            if (index < 0 || index >= totalPages) return;
            currentPage = index;
            track.style.transform = `translateX(${-currentPage * 100}%)`;
            document.querySelectorAll('.carousel-dots .dot').forEach((d, i) => d.classList.toggle('active', i === currentPage));
            if (prevBtn2) prevBtn2.disabled = currentPage === 0;
            if (nextBtn2) nextBtn2.disabled = currentPage === totalPages - 1;
        }

        prevBtn2?.addEventListener('click', () => { if (currentPage > 0) goToPage(currentPage - 1); });
        nextBtn2?.addEventListener('click', () => { if (currentPage < totalPages - 1) goToPage(currentPage + 1); });

        buildPages();
        window.addEventListener('resize', () => {
            clearTimeout(window._carouselResizeTimer);
            window._carouselResizeTimer = setTimeout(buildPages, 150);
        });
    }
});