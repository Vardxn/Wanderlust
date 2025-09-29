// Enhanced Airbnb Navbar Components
class NavbarManager {
    constructor() {
        this.navbar = document.querySelector('.airbnb-header');
        this.mobileToggle = document.getElementById('mobileToggle');
        this.mobileNavMenu = document.getElementById('mobileNavMenu');
        this.compactSearch = document.getElementById('compactSearchBar');
        this.expandedSearch = document.getElementById('expandedSearchBar');
        this.compactTrigger = document.getElementById('compactSearchTrigger');
        this.userMenuBtn = document.getElementById('userMenuBtn');
        this.userDropdown = document.getElementById('userDropdown');
        this.navPills = document.querySelectorAll('.nav-pill');
        this.searchForm = document.getElementById('searchForm');
        this.isSearchExpanded = false;
        this.isMobileMenuOpen = false;
        this.init();
    }

    init() {
        this.setupMobileNavigation();
        this.setupSearchBar();
        this.setupUserMenu();
        this.setupNavigationTabs();
        this.setupScrollEffects();
        this.setupKeyboardNavigation();
        this.setupClickOutside();
        this.setupSearchFormHandling();
        console.log('Navbar Manager initialized');
    }

    setupMobileNavigation() {
        if (!this.mobileToggle || !this.mobileNavMenu) return;

        this.mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileNav();
        });

        // Close mobile nav on link click
        this.mobileNavMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileNav();
            });
        });
    }

    toggleMobileNav() {
        const togglerIcon = this.mobileToggle.querySelector('.navbar-toggler-icon');
        
        if (this.isMobileMenuOpen) {
            this.closeMobileNav();
        } else {
            this.openMobileNav();
        }

        // Animate hamburger icon
        togglerIcon?.classList.toggle('active');
    }

    openMobileNav() {
        if (!this.mobileNavMenu) return;
        
        this.mobileNavMenu.style.display = 'block';
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        this.isMobileMenuOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeMobileNav() {
        if (!this.mobileNavMenu) return;
        
        this.mobileNavMenu.style.display = 'none';
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        this.isMobileMenuOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove hamburger animation
        const togglerIcon = this.mobileToggle.querySelector('.navbar-toggler-icon');
        togglerIcon?.classList.remove('active');
    }

    setupSearchBar() {
        if (!this.compactTrigger) return;

        this.compactTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.expandSearch();
        });

        // Setup search field interactions
        const searchFields = this.expandedSearch?.querySelectorAll('.search-field');
        searchFields?.forEach(field => {
            const input = field.querySelector('.search-field-input');
            
            field.addEventListener('click', () => {
                input?.focus();
                this.setActiveSearchField(field);
            });

            input?.addEventListener('focus', () => {
                this.setActiveSearchField(field);
            });

            input?.addEventListener('blur', () => {
                this.clearActiveSearchField(field);
            });

            // Add placeholder animations
            input?.addEventListener('input', (e) => {
                this.handleSearchInput(field, e.target.value);
            });
        });
    }

    expandSearch() {
        if (this.isSearchExpanded) return;

        this.compactSearch.style.display = 'none';
        this.expandedSearch.style.display = 'block';
        this.isSearchExpanded = true;

        // Focus first input
        const firstInput = this.expandedSearch.querySelector('.search-field-input');
        setTimeout(() => firstInput?.focus(), 100);

        // Add backdrop
        this.addSearchBackdrop();
    }

    collapseSearch() {
        if (!this.isSearchExpanded) return;

        this.expandedSearch.style.display = 'none';
        this.compactSearch.style.display = 'block';
        this.isSearchExpanded = false;

        // Remove backdrop
        this.removeSearchBackdrop();
        
        // Clear active fields
        this.expandedSearch?.querySelectorAll('.search-field').forEach(field => {
            this.clearActiveSearchField(field);
        });
    }

    addSearchBackdrop() {
        const backdrop = document.createElement('div');
        backdrop.className = 'search-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 5;
            animation: fadeIn 0.2s ease-out;
        `;
        
        backdrop.addEventListener('click', () => {
            this.collapseSearch();
        });
        
        document.body.appendChild(backdrop);
    }

    removeSearchBackdrop() {
        const backdrop = document.querySelector('.search-backdrop');
        if (backdrop) {
            backdrop.style.animation = 'fadeOut 0.2s ease-out';
            setTimeout(() => backdrop.remove(), 200);
        }
    }

    setActiveSearchField(field) {
        // Clear other active fields
        this.expandedSearch?.querySelectorAll('.search-field').forEach(f => {
            f.classList.remove('focused');
        });
        
        // Set current field as active
        field.classList.add('focused');
    }

    clearActiveSearchField(field) {
        setTimeout(() => {
            if (!field.querySelector('.search-field-input:focus')) {
                field.classList.remove('focused');
            }
        }, 100);
    }

    handleSearchInput(field, value) {
        const label = field.querySelector('.search-field-label');
        if (value) {
            label?.style.setProperty('opacity', '0.7');
        } else {
            label?.style.setProperty('opacity', '1');
        }
    }

    setupSearchFormHandling() {
        if (!this.searchForm) return;

        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });
    }

    performSearch() {
        const formData = new FormData(this.searchForm);
        const searchParams = {
            location: formData.get('location') || '',
            checkin: formData.get('checkin') || '',
            checkout: formData.get('checkout') || '',
            guests: formData.get('guests') || ''
        };

        console.log('Performing search with:', searchParams);

        // Add loading state
        const submitBtn = this.searchForm.querySelector('.search-submit-btn');
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div style="width:16px;height:16px;border:2px solid #fff;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>';
        submitBtn.disabled = true;

        // Simulate search
        setTimeout(() => {
            // Redirect to listings with search params
            const params = new URLSearchParams();
            Object.keys(searchParams).forEach(key => {
                if (searchParams[key]) {
                    params.append(key, searchParams[key]);
                }
            });
            
            const searchUrl = params.toString() ? `/listings?${params.toString()}` : '/listings';
            window.location.href = searchUrl;
            
            // Reset button
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        }, 1000);
    }

    setupUserMenu() {
        if (!this.userMenuBtn) return;

        this.userMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleUserMenu();
        });
    }

    toggleUserMenu() {
        const isOpen = this.userDropdown?.classList.contains('show');
        
        if (isOpen) {
            this.closeUserMenu();
        } else {
            this.openUserMenu();
        }
    }

    openUserMenu() {
        this.userDropdown?.classList.add('show');
        this.userMenuBtn.setAttribute('aria-expanded', 'true');
        
        // Focus first menu item
        const firstItem = this.userDropdown?.querySelector('.dropdown-item');
        setTimeout(() => firstItem?.focus(), 100);
    }

    closeUserMenu() {
        this.userDropdown?.classList.remove('show');
        this.userMenuBtn.setAttribute('aria-expanded', 'false');
    }

    setupNavigationTabs() {
        this.navPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(pill);
            });

            pill.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchTab(pill);
                }
            });
        });
    }

    switchTab(activePill) {
        // Remove active state from all pills
        this.navPills.forEach(pill => {
            pill.classList.remove('active');
            pill.setAttribute('aria-selected', 'false');
        });

        // Add active state to clicked pill
        activePill.classList.add('active');
        activePill.setAttribute('aria-selected', 'true');

        // Handle tab content switching
        const tabType = activePill.dataset.tab;
        if (tabType === 'experiences') {
            window.location.href = '/experiences';
        } else {
            window.location.href = '/listings';
        }
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down - hide navbar
                this.navbar?.classList.add('navbar-hidden');
                this.navbar?.classList.remove('navbar-visible');
            } else {
                // Scrolling up - show navbar
                this.navbar?.classList.remove('navbar-hidden');
                this.navbar?.classList.add('navbar-visible');
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(handleScroll);
                ticking = true;
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key closes dropdowns and search
            if (e.key === 'Escape') {
                this.closeUserMenu();
                this.collapseSearch();
                this.closeMobileNav();
            }

            // Tab navigation
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    handleTabNavigation(e) {
        // Add logic for keyboard navigation through menu items
        const focusableElements = this.navbar?.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    setupClickOutside() {
        document.addEventListener('click', (e) => {
            // Close user menu if clicked outside
            if (!this.userMenuBtn?.contains(e.target) && !this.userDropdown?.contains(e.target)) {
                this.closeUserMenu();
            }

            // Close search if clicked outside
            if (!this.expandedSearch?.contains(e.target) && !this.compactTrigger?.contains(e.target)) {
                this.collapseSearch();
            }

            // Close mobile menu if clicked outside
            if (!this.mobileToggle?.contains(e.target) && !this.mobileNavMenu?.contains(e.target)) {
                this.closeMobileNav();
            }
        });
    }

    // Public API methods
    showNavbar() {
        this.navbar?.classList.remove('navbar-hidden');
        this.navbar?.classList.add('navbar-visible');
    }

    hideNavbar() {
        this.navbar?.classList.add('navbar-hidden');
        this.navbar?.classList.remove('navbar-visible');
    }

    setActiveTab(tabName) {
        const targetPill = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetPill) {
            this.switchTab(targetPill);
        }
    }

    updateSearchPlaceholder(location, dates, guests) {
        const labels = this.compactSearch?.querySelectorAll('.search-label');
        if (labels && labels.length >= 3) {
            labels[0].textContent = location || 'Anywhere';
            labels[1].textContent = dates || 'Any week';
            labels[2].textContent = guests || 'Add guests';
        }
    }
}

// Keep existing carousel functionality
class CategoryCarousel {
    constructor() {
        this.track = document.getElementById('categoryTrack');
        this.prevBtn = document.querySelector('.category-prev');
        this.nextBtn = document.querySelector('.category-next');
        this.scrollAmount = 400;
        this.currentScroll = 0;

        this.init();
    }

    init() {
        if (!this.track) return;

        // Add event listeners
        this.prevBtn?.addEventListener('click', () => this.scrollPrev());
        this.nextBtn?.addEventListener('click', () => this.scrollNext());

        // Update button states
        this.updateButtons();

        // Handle category selection
        this.setupCategorySelection();

        // Handle window resize
        window.addEventListener('resize', () => this.updateButtons());

        // Mouse wheel horizontal scrolling
        this.track.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                this.track.scrollLeft += e.deltaX;
                this.currentScroll = this.track.scrollLeft;
                this.updateButtons();
            }
        });
    }

    scrollPrev() {
        this.currentScroll = Math.max(0, this.currentScroll - this.scrollAmount);
        this.animateScroll();
    }

    scrollNext() {
        const maxScroll = this.track.scrollWidth - this.track.clientWidth;
        this.currentScroll = Math.min(maxScroll, this.currentScroll + this.scrollAmount);
        this.animateScroll();
    }

    animateScroll() {
        this.track.scrollTo({
            left: this.currentScroll,
            behavior: 'smooth'
        });
        
        setTimeout(() => this.updateButtons(), 300);
    }

    updateButtons() {
        if (!this.prevBtn || !this.nextBtn) return;

        const { scrollLeft, scrollWidth, clientWidth } = this.track;
        const maxScroll = scrollWidth - clientWidth;

        this.prevBtn.style.opacity = scrollLeft <= 0 ? '0.3' : '1';
        this.prevBtn.style.pointerEvents = scrollLeft <= 0 ? 'none' : 'auto';
        
        this.nextBtn.style.opacity = scrollLeft >= maxScroll - 1 ? '0.3' : '1';
        this.nextBtn.style.pointerEvents = scrollLeft >= maxScroll - 1 ? 'none' : 'auto';
    }

    setupCategorySelection() {
        const categories = this.track?.querySelectorAll('.category-item');
        
        categories?.forEach(category => {
            category.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active from all categories
                categories.forEach(cat => cat.classList.remove('active'));
                
                // Add active to clicked category
                category.classList.add('active');
                
                // Filter listings
                const categoryType = category.dataset.category;
                this.filterListings(categoryType);
            });
        });
    }

    filterListings(category) {
        console.log(`Filtering listings by category: ${category}`);
        // Add actual filtering logic here
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navbarManager = new NavbarManager();
    window.categoryCarousel = new CategoryCarousel();
    console.log('Airbnb components initialized');
});

// Export for external use
if (typeof window !== 'undefined') {
    window.AirbnbComponents = {
        NavbarManager,
        CategoryCarousel
    };
}