/**
 * WANDERLUST APPLE-STYLE SCROLLYTELLING SYSTEM
 * Cinematic, scroll-driven animations using GSAP ScrollTrigger
 */

(function() {
    'use strict';

    // =====================================================================
    // GSAP & ScrollTrigger Setup
    // =====================================================================

    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.warn('⚠️ GSAP not loaded. Please include GSAP and ScrollTrigger.');
        return;
    }

    // Register ScrollTrigger plugin
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // =====================================================================
    // 1. HERO SCROLL-SEQUENCE ANIMATION
    // =====================================================================

    function initHeroScrollSequence() {
        const canvas = document.querySelector('#hero-canvas');
        if (!canvas) return;

        const context = canvas.getContext('2d');
        
        // Configure canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Image sequence configuration
        const frameCount = 150; // Number of frames in your sequence
        const images = [];
        const imageSeq = { frame: 0 };

        // Preload images
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            // Update this path to match your image sequence naming
            img.src = `/images/hero-sequence/frame-${String(i).padStart(4, '0')}.jpg`;
            images.push(img);
        }

        // Render function
        function render() {
            const frameIndex = Math.min(
                Math.floor(imageSeq.frame),
                frameCount - 1
            );
            
            if (images[frameIndex]) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
            }
        }

        // Initial render
        images[0].onload = render;

        // GSAP ScrollTrigger animation
        gsap.to(imageSeq, {
            frame: frameCount - 1,
            snap: 'frame',
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero-scroll-container',
                start: 'top top',
                end: '+=300%',
                scrub: 0.5,
                pin: true,
                anticipatePin: 1,
                onUpdate: render
            }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        });

        console.log('✨ Hero scroll sequence initialized');
    }

    // =====================================================================
    // 2. FEATURE REVEAL ANIMATIONS
    // =====================================================================

    function initFeatureReveal() {
        const features = gsap.utils.toArray('.feature-item');
        if (features.length === 0) return;

        features.forEach((feature, index) => {
            const content = feature.querySelector('.feature-content');
            const image = feature.querySelector('.feature-image');

            // Create timeline for each feature
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: feature,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1,
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1
                }
            });

            // Fade in
            tl.from(content, {
                opacity: 0,
                y: 50,
                scale: 0.95,
                duration: 0.5
            });

            // Hold
            tl.to(content, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5
            });

            // Fade out
            tl.to(content, {
                opacity: 0,
                y: -50,
                scale: 0.95,
                duration: 0.5
            });

            // Background image zoom
            if (image) {
                tl.to(image, {
                    scale: 1.1,
                    duration: 1.5
                }, 0);
            }
        });

        console.log(`✨ ${features.length} feature reveals initialized`);
    }

    // =====================================================================
    // 3. PARALLAX SCROLL EFFECTS
    // =====================================================================

    function initParallaxEffects() {
        const parallaxElements = gsap.utils.toArray('[data-parallax]');
        if (parallaxElements.length === 0) return;

        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            
            gsap.to(element, {
                y: () => window.innerHeight * parseFloat(speed),
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

        console.log(`✨ ${parallaxElements.length} parallax elements initialized`);
    }

    // =====================================================================
    // 4. DESTINATION SHOWCASE ANIMATION
    // =====================================================================

    function initDestinationShowcase() {
        const showcase = document.querySelector('.destination-showcase');
        if (!showcase) return;

        const destinations = gsap.utils.toArray('.destination-card');

        // Horizontal scroll
        if (destinations.length > 0) {
            const totalWidth = destinations.reduce((acc, card) => {
                return acc + card.offsetWidth;
            }, 0);

            gsap.to(destinations, {
                xPercent: -100 * (destinations.length - 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: showcase,
                    pin: true,
                    scrub: 1,
                    snap: 1 / (destinations.length - 1),
                    end: () => `+=${totalWidth}`
                }
            });
        }

        console.log('✨ Destination showcase initialized');
    }

    // =====================================================================
    // 5. LIQUID GLASS INTERACTION EFFECTS
    // =====================================================================

    function initLiquidGlassInteractions() {
        // Mouse-follow highlight
        const glassElements = document.querySelectorAll('.glass-interactive');

        glassElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Update CSS custom properties for highlight position
                element.style.setProperty('--mouse-x', `${x}px`);
                element.style.setProperty('--mouse-y', `${y}px`);

                // Update ::after pseudo-element position
                const highlight = element.querySelector('::after');
                if (element.querySelector('::after')) {
                    gsap.to(element, {
                        '--highlight-x': x,
                        '--highlight-y': y,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
        });

        // Liquid refraction effect
        const refractionElements = document.querySelectorAll('.liquid-refraction');

        refractionElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                gsap.to(element, {
                    scale: 1.02,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });

            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    scale: 1,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });
        });

        console.log('✨ Liquid glass interactions initialized');
    }

    // =====================================================================
    // 6. SMOOTH PAGE TRANSITIONS
    // =====================================================================

    function initPageTransitions() {
        // Intercept link clicks for smooth transitions
        const links = document.querySelectorAll('a:not([target="_blank"])');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip external links and anchors
                if (!href || href.startsWith('#') || href.startsWith('http')) {
                    return;
                }

                e.preventDefault();

                // Fade out animation
                gsap.to('body', {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        window.location.href = href;
                    }
                });
            });
        });

        // Fade in on page load
        gsap.from('body', {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut'
        });

        console.log('✨ Page transitions initialized');
    }

    // =====================================================================
    // 7. LISTING CARDS STAGGER ANIMATION
    // =====================================================================

    function initListingCardsAnimation() {
        const cards = gsap.utils.toArray('.card, .listing-card');
        if (cards.length === 0) return;

        gsap.from(cards, {
            opacity: 0,
            y: 60,
            scale: 0.95,
            duration: 0.8,
            stagger: {
                amount: 0.6,
                from: 'start',
                ease: 'power2.out'
            },
            scrollTrigger: {
                trigger: cards[0],
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            ease: 'power3.out'
        });

        console.log(`✨ ${cards.length} listing cards animated`);
    }

    // =====================================================================
    // 8. TEXT REVEAL ANIMATIONS
    // =====================================================================

    function initTextReveal() {
        const headings = gsap.utils.toArray('h1, h2, h3');

        headings.forEach(heading => {
            // Split text into words
            const words = heading.textContent.split(' ');
            heading.innerHTML = words.map(word => 
                `<span class="word" style="display: inline-block; overflow: hidden;">
                    <span style="display: inline-block;">${word}</span>
                </span>`
            ).join(' ');

            const wordSpans = heading.querySelectorAll('.word > span');

            gsap.from(wordSpans, {
                y: 100,
                opacity: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: heading,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                }
            });
        });

        console.log('✨ Text reveal animations initialized');
    }

    // =====================================================================
    // 9. SEARCH MODULE FLOAT ANIMATION
    // =====================================================================

    function initSearchFloatAnimation() {
        const searchModule = document.querySelector('.liquid-glass-search');
        if (!searchModule) return;

        // Gentle floating animation
        gsap.to(searchModule, {
            y: -10,
            duration: 3,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });

        // Subtle rotation on hover
        searchModule.addEventListener('mouseenter', () => {
            gsap.to(searchModule, {
                rotationZ: 0.5,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        searchModule.addEventListener('mouseleave', () => {
            gsap.to(searchModule, {
                rotationZ: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        console.log('✨ Search float animation initialized');
    }

    // =====================================================================
    // 10. SCROLL PROGRESS INDICATOR
    // =====================================================================

    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #FF385C, #E31C5F, #0071E3);
            z-index: 10000;
            transform-origin: left;
            border-radius: 0 3px 3px 0;
        `;
        document.body.appendChild(progressBar);

        gsap.to(progressBar, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3
            }
        });

        console.log('✨ Scroll progress indicator initialized');
    }

    // =====================================================================
    // 11. AURORA BORDER ANIMATION
    // =====================================================================

    function initAuroraBorders() {
        const elements = document.querySelectorAll('.liquid-glass-search, .liquid-glass-card');

        elements.forEach(element => {
            // Rotate aurora gradient on scroll
            gsap.to(element, {
                '--aurora-rotation': 360,
                duration: 10,
                repeat: -1,
                ease: 'none'
            });
        });
    }

    // =====================================================================
    // 12. MAGNETIC BUTTONS
    // =====================================================================

    function initMagneticButtons() {
        const buttons = document.querySelectorAll('.liquid-glass-btn');

        buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(button, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            button.addEventListener('mouseleave', () => {
                gsap.to(button, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });

        console.log(`✨ ${buttons.length} magnetic buttons initialized`);
    }

    // =====================================================================
    // INITIALIZATION
    // =====================================================================

    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('🎬 Initializing Apple-style Scrollytelling...');

        // Initialize all animations with a slight delay for better UX
        setTimeout(() => {
            initHeroScrollSequence();
            initFeatureReveal();
            initParallaxEffects();
            initDestinationShowcase();
            initLiquidGlassInteractions();
            initPageTransitions();
            initListingCardsAnimation();
            initTextReveal();
            initSearchFloatAnimation();
            initScrollProgress();
            initAuroraBorders();
            initMagneticButtons();

            console.log('✅ Scrollytelling system ready!');
        }, 100);
    }

    // Start initialization
    init();

})();
