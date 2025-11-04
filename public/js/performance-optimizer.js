/**
 * WANDERLUST PERFORMANCE OPTIMIZER
 * Client-side performance enhancements for smooth, fast experience
 */

(function() {
    'use strict';

    // ===================================================================
    // 1. LAZY LOADING IMAGES - Load images only when visible
    // ===================================================================
    const lazyLoadImages = () => {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px' // Start loading 50px before image enters viewport
        });
        
        images.forEach(img => imageObserver.observe(img));
    };

    // ===================================================================
    // 2. DEBOUNCED SCROLL HANDLER - Reduce scroll event overhead
    // ===================================================================
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // ===================================================================
    // 3. SMOOTH SCROLL PERFORMANCE
    // ===================================================================
    const optimizeScrolling = () => {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // Your scroll-based animations here
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    };

    // ===================================================================
    // 4. PRELOAD CRITICAL RESOURCES
    // ===================================================================
    const preloadCriticalResources = () => {
        // Preload fonts
        const fonts = [
            '/fonts/inter-var.woff2'
        ];
        
        fonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            link.href = font;
            document.head.appendChild(link);
        });
    };

    // ===================================================================
    // 5. PREFETCH NEXT PAGE - Predict user navigation
    // ===================================================================
    const prefetchNextPage = () => {
        const links = document.querySelectorAll('a[href^="/listings"], a[href^="/experiences"]');
        
        const linkObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = entry.target;
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = link.href;
                    document.head.appendChild(prefetchLink);
                    linkObserver.unobserve(link);
                }
            });
        });
        
        links.forEach(link => linkObserver.observe(link));
    };

    // ===================================================================
    // 6. MINIMIZE REFLOWS & REPAINTS
    // ===================================================================
    const batchDOMUpdates = () => {
        // Use DocumentFragment for multiple DOM insertions
        window.batchInsert = (parent, elements) => {
            const fragment = document.createDocumentFragment();
            elements.forEach(el => fragment.appendChild(el));
            parent.appendChild(fragment);
        };
    };

    // ===================================================================
    // 7. REDUCE ANIMATION JANKING
    // ===================================================================
    const optimizeAnimations = () => {
        // Use will-change carefully
        const animatedElements = document.querySelectorAll('.micro-lift, .liquid-glass-card');
        
        animatedElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.willChange = 'transform';
            }, { once: false });
            
            el.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    el.style.willChange = 'auto';
                }, 300);
            }, { once: false });
        });
    };

    // ===================================================================
    // 8. THROTTLE RESIZE EVENTS
    // ===================================================================
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const optimizeResize = () => {
        window.addEventListener('resize', throttle(() => {
            // Handle resize operations
        }, 250), { passive: true });
    };

    // ===================================================================
    // 9. SERVICE WORKER FOR CACHING (Progressive Web App)
    // ===================================================================
    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('✅ Service Worker registered'))
                .catch(err => console.log('❌ Service Worker registration failed:', err));
        }
    };

    // ===================================================================
    // 10. REDUCE MAIN THREAD WORK - Use Web Workers for heavy tasks
    // ===================================================================
    const offloadToWorker = (task) => {
        if (window.Worker) {
            const worker = new Worker('/js/workers/task-worker.js');
            worker.postMessage(task);
            worker.onmessage = (e) => {
                // Handle worker response
                worker.terminate();
            };
        }
    };

    // ===================================================================
    // INITIALIZE ALL OPTIMIZATIONS
    // ===================================================================
    const init = () => {
        // Run on DOMContentLoaded for faster initial load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                lazyLoadImages();
                optimizeScrolling();
                optimizeAnimations();
                optimizeResize();
                batchDOMUpdates();
            });
        } else {
            lazyLoadImages();
            optimizeScrolling();
            optimizeAnimations();
            optimizeResize();
            batchDOMUpdates();
        }

        // Run after page load
        window.addEventListener('load', () => {
            preloadCriticalResources();
            prefetchNextPage();
            // registerServiceWorker(); // Uncomment when service worker is ready
        }, { passive: true });
    };

    // Start optimization
    init();

    // ===================================================================
    // EXPOSE UTILITIES GLOBALLY
    // ===================================================================
    window.WanderlustPerf = {
        debounce,
        throttle,
        batchInsert: window.batchInsert,
        offloadToWorker
    };

})();
