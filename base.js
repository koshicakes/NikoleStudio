
document.addEventListener('DOMContentLoaded', () => {
  
    document.querySelectorAll('.messenger-float').forEach((element) => element.remove());

    if (!document.querySelector('.studio-messenger-float')) {
        const messenger = document.createElement('a');
        messenger.href = 'https://m.me/nikolestudio';
        messenger.target = '_blank';
        messenger.rel = 'noopener';
        messenger.className = 'studio-messenger-float';
        messenger.setAttribute('aria-label', 'Message Nikole Studio on Messenger');
        messenger.innerHTML = '<span aria-hidden="true">M</span>';
        document.body.appendChild(messenger);
    }

    const footerText = document.querySelector('.page-footer p');
    if (footerText && !footerText.querySelector('.privacy-footer-link')) {
        footerText.insertAdjacentHTML('beforeend', ' <span class="footer-separator">|</span> <a class="privacy-footer-link" href="privacy.html">Privacy Policy</a>');
    }

   
    const nav = document.querySelector('nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const revealScrollY = 12;

    const closeNav = () => {
        if (nav && navToggle && document.body.classList.contains('nav-open')) {
            nav.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
            updateNavState();
        }
    };

    const updateNavState = () => {
        if (!nav) return;

        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const isVisible = currentScroll > revealScrollY || nav.classList.contains('nav-open');

        nav.classList.toggle('nav-visible', isVisible);
        nav.classList.toggle('nav-scrolled', isVisible);
        nav.classList.toggle('nav-hidden', !isVisible);
    };

    if (navToggle && nav && navLinks) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            nav.classList.toggle('nav-open');
            document.body.classList.toggle('nav-open');
            updateNavState();
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                closeNav();
            });
        });
    }

    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });

  
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');

    if (lightbox && lightboxImage && lightboxClose) {

        document.querySelectorAll('.collage-item').forEach((item) => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img) {
                    lightboxImage.src = img.src;
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }


    const collageItems = document.querySelectorAll('.collage-item');
    if (collageItems.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 180);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px'
        });

        collageItems.forEach((item) => observer.observe(item));
    }
});
