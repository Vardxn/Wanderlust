/**
 * TRENDING FEATURES INTERACTIONS
 * Kinetic typography, micro-interactions, and dynamic effects
 */

(function() {
    'use strict';

    // =====================================================================
    // 1. KINETIC TYPOGRAPHY ANIMATIONS
    // =====================================================================

    function initKineticTypography() {
        const headings = document.querySelectorAll('.expressive-heading, .kinetic-text');
        
        headings.forEach(heading => {
            const text = heading.textContent;
            const words = text.split(' ');
            
            heading.innerHTML = words.map((word, index) => 
                `<span class="kinetic-word" style="animation-delay: ${index * 0.1}s">${word}</span>`
            ).join(' ');
        });

        // Letter-by-letter animation
        const letterElements = document.querySelectorAll('[data-letter-animate]');
        
        letterElements.forEach(element => {
            const text = element.textContent;
            element.innerHTML = text.split('').map((letter, index) => 
                `<span class="letter" style="animation-delay: ${index * 0.03}s">${letter === ' ' ? '&nbsp;' : letter}</span>`
            ).join('');
        });
    }

    // =====================================================================
    // 2. TEXT PARALLAX EFFECT
    // =====================================================================

    function initTextParallax() {
        const layers = document.querySelectorAll('[class*="text-layer-"]');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            layers.forEach(layer => {
                const speed = layer.className.includes('layer-1') ? 0.5 : 
                             layer.className.includes('layer-2') ? 1 : 1.5;
                
                layer.style.transform = `translateY(${scrolled * speed * 0.1}px)`;
            });
        });
    }

    // =====================================================================
    // 3. DISTORTED TEXT HOVER
    // =====================================================================

    function initDistortedText() {
        const distortedElements = document.querySelectorAll('.distorted-text');
        
        distortedElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const centerX = rect.width / 2;
                const skew = ((x - centerX) / centerX) * 10;
                
                element.style.transform = `scaleY(1.1) skewX(${skew}deg)`;
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scaleY(1) skewX(0deg)';
            });
        });
    }

    // =====================================================================
    // 4. GRAIN OVERLAY ANIMATION
    // =====================================================================

    function initGrainAnimation() {
        const grainElements = document.querySelectorAll('.grain-overlay');
        
        grainElements.forEach(element => {
            let x = 0;
            let y = 0;
            
            setInterval(() => {
                x = Math.random() * 100;
                y = Math.random() * 100;
                
                if (element.querySelector('::before')) {
                    element.style.setProperty('--grain-x', `${x}%`);
                    element.style.setProperty('--grain-y', `${y}%`);
                }
            }, 100);
        });
    }

    // =====================================================================
    // 5. MICRO-INTERACTIONS: WISHLIST HEART
    // =====================================================================

    function initWishlistHearts() {
        const hearts = document.querySelectorAll('.favorite-btn, .micro-heart');
        
        hearts.forEach(heart => {
            heart.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                this.classList.add('micro-wiggle');
                
                // Change icon
                const icon = this.querySelector('i');
                if (icon) {
                    if (icon.classList.contains('far')) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        this.style.color = '#FF385C';
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        this.style.color = '';
                    }
                }
                
                setTimeout(() => {
                    this.classList.remove('micro-wiggle');
                }, 400);
            });
        });
    }

    // =====================================================================
    // 6. MICRO-INTERACTIONS: BOOKING CONFIRMATION
    // =====================================================================

    function initBookingConfirmation() {
        const bookingButtons = document.querySelectorAll('[data-booking-btn]');
        
        bookingButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.classList.add('micro-press');
                
                setTimeout(() => {
                    this.classList.remove('micro-press');
                    showToastNotification('Booking confirmed! ✓');
                }, 200);
            });
        });
    }

    // =====================================================================
    // 7. TOAST NOTIFICATION SYSTEM
    // =====================================================================

    function showToastNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `micro-toast liquid-glass ${type === 'success' ? 'success' : 'error'}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 20px 24px;
            border-radius: 12px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        `;
        
        const icon = type === 'success' ? 
            '<i class="fas fa-check-circle" style="color: #00C896; font-size: 1.5rem;"></i>' :
            '<i class="fas fa-exclamation-circle" style="color: #FF385C; font-size: 1.5rem;"></i>';
        
        toast.innerHTML = `${icon}<span>${message}</span>`;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // =====================================================================
    // 8. CUSTOM LOADING ANIMATION
    // =====================================================================

    function showCustomLoader() {
        const loader = document.createElement('div');
        loader.className = 'custom-loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;
        
        loader.innerHTML = `
            <div class="micro-logo-loader" style="font-size: 4rem; color: #FF385C;">
                <i class="fas fa-mountain"></i>
            </div>
        `;
        
        document.body.appendChild(loader);
        
        return {
            hide: () => {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.3s ease';
                setTimeout(() => loader.remove(), 300);
            }
        };
    }

    // =====================================================================
    // 9. BUTTON RIPPLE EFFECT
    // =====================================================================

    function initRippleEffects() {
        const rippleButtons = document.querySelectorAll('.liquid-glass-btn, .brutalist-button, .micro-ripple');
        
        rippleButtons.forEach(button => {
            if (!button.classList.contains('micro-ripple')) {
                button.classList.add('micro-ripple');
            }
        });
    }

    // =====================================================================
    // 10. BENTO GRID HOVER EFFECTS
    // =====================================================================

    function initBentoGridEffects() {
        const bentoItems = document.querySelectorAll('.bento-item');
        
        bentoItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.zIndex = '10';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.zIndex = '1';
            });
            
            // 3D tilt effect
            item.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;
                
                this.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateY(-4px)
                `;
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // =====================================================================
    // 11. FORM INPUT MICRO-INTERACTIONS
    // =====================================================================

    function initFormMicroInteractions() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Focus glow
            input.addEventListener('focus', function() {
                this.parentElement?.classList.add('micro-glow');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement?.classList.remove('micro-glow');
            });
            
            // Success checkmark
            input.addEventListener('change', function() {
                if (this.value && this.checkValidity()) {
                    let checkmark = this.parentElement?.querySelector('.micro-checkmark');
                    
                    if (!checkmark) {
                        checkmark = document.createElement('i');
                        checkmark.className = 'fas fa-check-circle micro-checkmark';
                        checkmark.style.cssText = `
                            position: absolute;
                            right: 12px;
                            top: 50%;
                            transform: translateY(-50%);
                            color: #00C896;
                            font-size: 1.2rem;
                        `;
                        this.parentElement?.style.position = 'relative';
                        this.parentElement?.appendChild(checkmark);
                    }
                    
                    setTimeout(() => {
                        checkmark?.classList.add('active');
                    }, 100);
                }
            });
        });
    }

    // =====================================================================
    // 12. SCROLL-TRIGGERED ANIMATIONS FOR BENTO ITEMS
    // =====================================================================

    function initBentoScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('micro-fade-in-up');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.bento-item').forEach(item => {
            item.style.opacity = '0';
            observer.observe(item);
        });
    }

    // =====================================================================
    // 13. BRUTALIST BUTTON INTERACTIONS
    // =====================================================================

    function initBrutalistButtons() {
        const brutalistBtns = document.querySelectorAll('.brutalist-button');
        
        brutalistBtns.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.animation = 'scalePop 0.3s ease-in-out';
            });
            
            btn.addEventListener('animationend', function() {
                this.style.animation = '';
            });
        });
    }

    // =====================================================================
    // 14. ERROR SHAKE ANIMATION
    // =====================================================================

    window.showErrorShake = function(element) {
        element.classList.add('micro-shake');
        setTimeout(() => {
            element.classList.remove('micro-shake');
        }, 500);
        
        showToastNotification('Please check your input', 'error');
    };

    // =====================================================================
    // 15. SEARCH BAR ENHANCEMENT
    // =====================================================================

    function initSearchBarEnhancement() {
        const searchInputs = document.querySelectorAll('[id*="search"], .search-input');
        
        searchInputs.forEach(input => {
            input.addEventListener('focus', function() {
                const parent = this.closest('.liquid-glass-search, .search-container, .nav-center');
                if (parent) {
                    parent.classList.add('micro-scale-pop');
                    setTimeout(() => {
                        parent.classList.remove('micro-scale-pop');
                    }, 300);
                }
            });
        });
    }

    // =====================================================================
    // 16. CARD HOVER LIFT ENHANCEMENT
    // =====================================================================

    function initCardLiftEnhancement() {
        const cards = document.querySelectorAll('.card, .listing-card, .liquid-glass-card');
        
        cards.forEach(card => {
            if (!card.classList.contains('micro-lift')) {
                card.classList.add('micro-lift');
            }
        });
    }

    // =====================================================================
    // 17. ADD TO CART/WISHLIST ANIMATION
    // =====================================================================

    window.addToWishlistAnimation = function(button) {
        button.classList.add('micro-wiggle');
        
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
        
        setTimeout(() => {
            button.classList.remove('micro-wiggle');
        }, 400);
        
        showToastNotification('Added to wishlist! 💖', 'success');
    };

    // =====================================================================
    // 18. PROGRESSIVE IMAGE LOADING
    // =====================================================================

    function initProgressiveImageLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const loader = document.createElement('div');
                    loader.className = 'micro-loading';
                    loader.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 40px;
                        height: 40px;
                        border: 3px solid rgba(255, 56, 92, 0.3);
                        border-top-color: #FF385C;
                        border-radius: 50%;
                    `;
                    
                    img.parentElement?.appendChild(loader);
                    
                    const tempImg = new Image();
                    tempImg.src = img.dataset.src;
                    
                    tempImg.onload = () => {
                        img.src = img.dataset.src;
                        img.classList.add('micro-fade-in-up');
                        loader.remove();
                    };
                    
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // =====================================================================
    // INITIALIZATION
    // =====================================================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('🎨 Initializing Trending Features...');

        setTimeout(() => {
            initKineticTypography();
            initTextParallax();
            initDistortedText();
            initGrainAnimation();
            initWishlistHearts();
            initBookingConfirmation();
            initRippleEffects();
            initBentoGridEffects();
            initFormMicroInteractions();
            initBentoScrollAnimations();
            initBrutalistButtons();
            initSearchBarEnhancement();
            initCardLiftEnhancement();
            initProgressiveImageLoading();

            console.log('✅ Trending Features Loaded!');
        }, 150);
    }

    // Expose global functions
    window.showToastNotification = showToastNotification;
    window.showCustomLoader = showCustomLoader;

    init();

})();
