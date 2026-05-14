// testimonials-carousel.js – Run on pages with .testimonials-carousel

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel-container');
    if (!carousel) return;

    const cards = document.querySelectorAll('.testimonial-card');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');
    let currentSlide = 0;
    const totalSlides = cards.length;
    let autoplayInterval = null;

    const updateCarousel = () => {
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        cards.forEach((card, index) => card.classList.toggle('active', index === currentSlide));
        indicators.forEach((indicator, index) => indicator.classList.toggle('active', index === currentSlide));
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    };

    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    };

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });

    nextBtn?.addEventListener('click', nextSlide);
    prevBtn?.addEventListener('click', prevSlide);

    autoplayInterval = setInterval(nextSlide, 5000);

    const carouselSection = document.querySelector('.testimonials-carousel');
    carouselSection?.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    carouselSection?.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(nextSlide, 5000);
    });

    updateCarousel();
});

document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const pages = Array.from(document.querySelectorAll('.carousel-page'));
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!track || !pages.length) return;

    const allReviewItems = [];
    pages.forEach(page => {
        const items = page.querySelectorAll('.review-item');
        items.forEach(item => allReviewItems.push(item.cloneNode(true)));
    });
    track.innerHTML = '';

    let currentPage = 0;
    let totalPages = 0;
    let itemsPerPage = 3;

    function getItemsPerPage() {
        return window.innerWidth <= 600 ? 1 : 3;
    }

    function buildPages() {
        track.innerHTML = '';
        itemsPerPage = getItemsPerPage();
        totalPages = Math.ceil(allReviewItems.length / itemsPerPage);

        for (let i = 0; i < totalPages; i++) {
            const page = document.createElement('div');
            page.className = 'carousel-page';
            const start = i * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = allReviewItems.slice(start, end);
            pageItems.forEach(item => page.appendChild(item.cloneNode(true)));
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
        const offset = -currentPage * 100;
        track.style.transform = `translateX(${offset}%)`;

        const allDots = document.querySelectorAll('.carousel-dots .dot');
        allDots.forEach(d => d.classList.remove('active'));
        if (allDots[currentPage]) allDots[currentPage].classList.add('active');

        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
        if (currentPage > 0) goToPage(currentPage - 1);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages - 1) goToPage(currentPage + 1);
    });

    buildPages();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            buildPages();
        }, 150);
    });
});