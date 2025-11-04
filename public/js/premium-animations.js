/**
 * WANDERLUST PREMIUM ANIMATIONS
 * Apple-inspired fluid animations and interactions
 */

(function() {
    'use strict';

    // =====================================================================
    // 1. SCROLL-TRIGGERED ANIMATIONS
    // =====================================================================

    /**
     * Intersection Observer for fade-in animations
     */
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add stagger delay based on index
                    const delay = Math.min(index * 100, 400);
                    setTimeout(() => {
                        entry.target.classList.add('animate-fade-in-up');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all cards
        document.querySelectorAll('.card').forEach((card, index) => {
            card.style.opacity = '0';
            // Add delay class based on position in grid
            card.classList.add(`animate-delay-${(index % 4) + 1}`);
            observer.observe(card);
        });

        // Observe other elements
        document.querySelectorAll('.listing-card, .feature-section, .category-card').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    // =====================================================================
    // 2. GLASSMORPHIC NAVBAR SCROLL EFFECT
    // =====================================================================

    function initNavbarScroll() {
        const header = document.querySelector('.airbnb-header');
        if (!header) return;

        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            lastScroll = window.scrollY;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (lastScroll > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });

                ticking = true;
            }
        });
    }

    // =====================================================================
    // 3. SMOOTH PARALLAX EFFECT
    // =====================================================================

    function initParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-bg');
        if (parallaxElements.length === 0) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    parallaxElements.forEach(el => {
                        const scrolled = window.scrollY;
                        const rate = scrolled * 0.3;
                        el.style.transform = `translate3d(0, ${rate}px, 0)`;
                    });
                    ticking = false;
                });

                ticking = true;
            }
        });
    }

    // =====================================================================
    // 4. CARD HOVER DEPTH EFFECT
    // =====================================================================

    function initCardDepthEffect() {
        const cards = document.querySelectorAll('.card, .listing-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            });

            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                this.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateY(-8px)
                    scale(1.02)
                `;
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            });
        });
    }

    // =====================================================================
    // 5. IMAGE LAZY LOADING WITH BLUR-UP EFFECT
    // =====================================================================

    function initLazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        if (img.dataset.src) {
                            // Create a new image to preload
                            const tempImage = new Image();
                            tempImage.src = img.dataset.src;
                            
                            tempImage.onload = () => {
                                img.src = img.dataset.src;
                                img.classList.add('loaded');
                                img.classList.remove('loading');
                            };
                            
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                img.classList.add('loading');
                imageObserver.observe(img);
            });
        }
    }

    // =====================================================================
    // 6. SMOOTH SCROLL TO SECTION
    // =====================================================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                
                if (href === '#' || href === '#!') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                const headerHeight = document.querySelector('.airbnb-header')?.offsetHeight || 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }

    // =====================================================================
    // 7. BUTTON RIPPLE EFFECT
    // =====================================================================

    function initRippleEffect() {
        const buttons = document.querySelectorAll('.btn, button, .nav-pill');

        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');

                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';

                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            button, .btn, .nav-pill {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    // =====================================================================
    // 8. ENHANCED SEARCH FOCUS EFFECT
    // =====================================================================

    function initSearchEnhancements() {
        const searchInputs = document.querySelectorAll('.search-input, input[type="search"]');

        searchInputs.forEach(input => {
            const parent = input.closest('.nav-center, .search-container, .form-control');
            if (!parent) return;

            input.addEventListener('focus', () => {
                parent.style.transform = 'scale(1.02)';
                parent.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
            });

            input.addEventListener('blur', () => {
                parent.style.transform = 'scale(1)';
                parent.style.boxShadow = '';
            });
        });
    }

    // =====================================================================
    // 9. MODAL ENTRANCE ANIMATIONS
    // =====================================================================

    function initModalAnimations() {
        // Bootstrap modal events
        const modals = document.querySelectorAll('.modal');

        modals.forEach(modal => {
            modal.addEventListener('show.bs.modal', function() {
                const modalContent = this.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.animation = 'fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                }
            });

            modal.addEventListener('hidden.bs.modal', function() {
                const modalContent = this.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.animation = '';
                }
            });
        });
    }

    // =====================================================================
    // 10. PERFORMANCE MONITORING
    // =====================================================================

    function checkPerformance() {
        // Disable intensive animations on low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            document.body.classList.add('reduce-animations');
            
            const style = document.createElement('style');
            style.textContent = `
                .reduce-animations * {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
                
                .reduce-animations .parallax-bg {
                    background-attachment: scroll !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // =====================================================================
    // 11. PRELOAD CRITICAL IMAGES
    // =====================================================================

    function preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('img[data-priority="high"]');
        
        criticalImages.forEach(img => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src || img.dataset.src;
            document.head.appendChild(link);
        });
    }

    // =====================================================================
    // 12. CURSOR FOLLOW EFFECT (Subtle)
    // =====================================================================

    function initCursorEffect() {
        const cards = document.querySelectorAll('.card, .listing-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
            });
        });
    }

    // =====================================================================
    // INITIALIZATION
    // =====================================================================

    function init() {
        // Check if page is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Performance check
        checkPerformance();

        // Initialize all features
        setTimeout(() => {
            initScrollAnimations();
            initNavbarScroll();
            initParallax();
            initCardDepthEffect();
            initLazyLoadImages();
            initSmoothScroll();
            initRippleEffect();
            initSearchEnhancements();
            initModalAnimations();
            preloadCriticalImages();
            initCursorEffect();
        }, 100);

        // Log initialization
        console.log('🎨 Wanderlust Premium Enhancements Loaded');
    }

    // Start initialization
    init();

})();
