/**
 * Main JavaScript Module
 * Handles UI interactions, animations, and general functionality
 */

class JingtuoApp {
    constructor() {
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.setupHeaderScroll();
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupDropdowns();
        this.setupAnimations();
        this.setupLazyLoading();
        this.setupCurrentYear();
        this.setupFormValidation();
        this.setupPerformanceOptimizations();
    }
    
    /**
     * Setup header scroll behavior
     */
    setupHeaderScroll() {
        const header = document.querySelector('.header');
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateHeader = () => {
            const currentScrollY = window.scrollY;
            
            // Add/remove scrolled class
            if (currentScrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide/show header on scroll (optional)
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
        
        // Add transition for smooth header hide/show
        header.style.transition = 'transform 0.3s ease-in-out';
    }
    
    /**
     * Setup mobile menu toggle
     */
    setupMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (!menuToggle || !mainNav) return;
        
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mainNav.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? '' : 'hidden';
        });
        
        // Close menu when clicking on a link
        const navLinks = mainNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Handle dropdowns on mobile
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('.nav-link');
            
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 767) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        });
    }
    
    /**
     * Setup smooth scroll for anchor links
     */
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    /**
     * Setup dropdown menus
     */
    setupDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('.nav-link');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (!link || !menu) return;
            
            // Handle keyboard navigation
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
                
                if (e.key === 'Escape') {
                    dropdown.classList.remove('active');
                    link.focus();
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        });
    }
    
    /**
     * Setup scroll animations
     */
    setupAnimations() {
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: show all elements
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                el.classList.add('animated');
            });
            return;
        }
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll(
            '.product-card, .application-card, .feature-item, .stat-item'
        );
        
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });
        
        // Add animated class styles
        const style = document.createElement('style');
        style.textContent = `
            .animated {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        // Check if native lazy loading is supported
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            return;
        }
        
        // Fallback: Use IntersectionObserver for lazy loading
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    /**
     * Setup current year in footer
     */
    setupCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    /**
     * Setup form validation
     */
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                let isValid = true;
                const requiredFields = form.querySelectorAll('[required]');
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                        
                        // Add error message
                        let errorMsg = field.parentNode.querySelector('.error-message');
                        if (!errorMsg) {
                            errorMsg = document.createElement('span');
                            errorMsg.className = 'error-message';
                            errorMsg.style.color = 'var(--error-color)';
                            errorMsg.style.fontSize = 'var(--text-sm)';
                            errorMsg.style.marginTop = 'var(--space-xs)';
                            field.parentNode.appendChild(errorMsg);
                        }
                        errorMsg.textContent = 'This field is required';
                    } else {
                        field.classList.remove('error');
                        const errorMsg = field.parentNode.querySelector('.error-message');
                        if (errorMsg) {
                            errorMsg.remove();
                        }
                    }
                });
                
                // Email validation
                const emailFields = form.querySelectorAll('input[type="email"]');
                emailFields.forEach(field => {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (field.value && !emailPattern.test(field.value)) {
                        isValid = false;
                        field.classList.add('error');
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                }
            });
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    if (input.hasAttribute('required') && !input.value.trim()) {
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });
                
                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        input.classList.remove('error');
                        const errorMsg = input.parentNode.querySelector('.error-message');
                        if (errorMsg) {
                            errorMsg.remove();
                        }
                    }
                });
            });
        });
    }
    
    /**
     * Setup performance optimizations
     */
    setupPerformanceOptimizations() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Optimize third-party scripts
        this.optimizeThirdPartyScripts();
        
        // Setup service worker (if supported)
        this.setupServiceWorker();
    }
    
    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        const criticalResources = [
            { href: 'css/main.css', as: 'style' },
            { href: 'js/main.js', as: 'script' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            
            if (resource.as === 'script') {
                link.setAttribute('crossorigin', 'anonymous');
            }
            
            document.head.appendChild(link);
        });
    }
    
    /**
     * Optimize third-party scripts loading
     */
    optimizeThirdPartyScripts() {
        // Defer non-critical scripts
        const deferredScripts = document.querySelectorAll('script[data-defer]');
        
        deferredScripts.forEach(script => {
            script.setAttribute('defer', '');
            script.removeAttribute('data-defer');
        });
        
        // Lazy load non-critical scripts
        const lazyScripts = document.querySelectorAll('script[data-lazy]');
        
        if ('IntersectionObserver' in window) {
            const scriptObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const script = entry.target;
                        const src = script.getAttribute('data-lazy');
                        
                        if (src) {
                            const newScript = document.createElement('script');
                            newScript.src = src;
                            newScript.async = true;
                            document.body.appendChild(newScript);
                        }
                        
                        scriptObserver.unobserve(script);
                    }
                });
            });
            
            lazyScripts.forEach(script => {
                scriptObserver.observe(script);
            });
        }
    }
    
    /**
     * Setup service worker for caching
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
    
    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Utility: Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.jingtuoApp = new JingtuoApp();
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause non-essential operations
        document.body.classList.add('page-hidden');
    } else {
        // Page is visible, resume operations
        document.body.classList.remove('page-hidden');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JingtuoApp;
}