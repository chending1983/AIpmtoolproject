/**
 * Internationalization (i18n) Module
 * Handles language switching and content translation
 */

class I18n {
    constructor() {
        this.currentLang = this.getStoredLanguage() || this.getBrowserLanguage() || 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'zh', 'es'];
        this.fallbackLanguage = 'en';
        
        this.init();
    }
    
    /**
     * Initialize the i18n system
     */
    async init() {
        await this.loadTranslations(this.currentLang);
        this.updatePageLanguage();
        this.setupEventListeners();
        this.updateLanguageSwitcher();
        this.updateHtmlLangAttribute();
    }
    
    /**
     * Get stored language preference from localStorage
     */
    getStoredLanguage() {
        try {
            return localStorage.getItem('jingtuo-language');
        } catch (e) {
            console.warn('localStorage not available');
            return null;
        }
    }
    
    /**
     * Store language preference to localStorage
     */
    storeLanguage(lang) {
        try {
            localStorage.setItem('jingtuo-language', lang);
        } catch (e) {
            console.warn('localStorage not available');
        }
    }
    
    /**
     * Get browser language preference
     */
    getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        
        if (this.supportedLanguages.includes(langCode)) {
            return langCode;
        }
        
        return null;
    }
    
    /**
     * Load translations for a specific language
     */
    async loadTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}`);
            }
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English if translation file fails to load
            if (lang !== this.fallbackLanguage) {
                await this.loadTranslations(this.fallbackLanguage);
            }
        }
    }
    
    /**
     * Get translation by key (supports nested keys like 'nav.home')
     */
    t(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        
        return value || key;
    }
    
    /**
     * Update all translatable elements on the page
     */
    updatePageLanguage() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (translation !== key) {
                // Check if element is an input or textarea
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.getAttribute('placeholder')) {
                        element.setAttribute('placeholder', translation);
                    } else {
                        element.value = translation;
                    }
                } else if (element.tagName === 'META') {
                    // Update meta tags
                    element.setAttribute('content', translation);
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Update document title
        if (this.translations.meta && this.translations.meta.title) {
            document.title = this.translations.meta.title;
        }
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && this.translations.meta && this.translations.meta.description) {
            metaDescription.setAttribute('content', this.translations.meta.description);
        }
        
        // Update meta keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && this.translations.meta && this.translations.meta.keywords) {
            metaKeywords.setAttribute('content', this.translations.meta.keywords);
        }
        
        // Update Open Graph meta tags
        this.updateOpenGraphMeta();
        
        // Update Twitter Card meta tags
        this.updateTwitterCardMeta();
    }
    
    /**
     * Update Open Graph meta tags
     */
    updateOpenGraphMeta() {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        
        if (ogTitle && this.translations.og && this.translations.og.title) {
            ogTitle.setAttribute('content', this.translations.og.title);
        }
        
        if (ogDescription && this.translations.og && this.translations.og.description) {
            ogDescription.setAttribute('content', this.translations.og.description);
        }
    }
    
    /**
     * Update Twitter Card meta tags
     */
    updateTwitterCardMeta() {
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        
        if (twitterTitle && this.translations.twitter && this.translations.twitter.title) {
            twitterTitle.setAttribute('content', this.translations.twitter.title);
        }
        
        if (twitterDescription && this.translations.twitter && this.translations.twitter.description) {
            twitterDescription.setAttribute('content', this.translations.twitter.description);
        }
    }
    
    /**
     * Update HTML lang attribute
     */
    updateHtmlLangAttribute() {
        document.documentElement.lang = this.currentLang;
        
        // Update hreflang links
        this.updateHreflangLinks();
    }
    
    /**
     * Update hreflang links
     */
    updateHreflangLinks() {
        const hreflangLinks = document.querySelectorAll('link[rel="alternate"]');
        const currentPath = window.location.pathname;
        
        hreflangLinks.forEach(link => {
            const lang = link.getAttribute('hreflang');
            if (lang && lang !== 'x-default') {
                const baseUrl = window.location.origin;
                if (lang === 'en') {
                    link.setAttribute('href', `${baseUrl}${currentPath}`);
                } else {
                    link.setAttribute('href', `${baseUrl}/${lang}${currentPath}`);
                }
            }
        });
    }
    
    /**
     * Switch to a different language
     */
    async switchLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Language ${lang} is not supported`);
            return;
        }
        
        if (lang === this.currentLang) {
            return;
        }
        
        this.currentLang = lang;
        this.storeLanguage(lang);
        
        await this.loadTranslations(lang);
        this.updatePageLanguage();
        this.updateLanguageSwitcher();
        this.updateHtmlLangAttribute();
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang }
        }));
        
        // Update URL if needed (for SEO)
        this.updateUrlForLanguage(lang);
    }
    
    /**
     * Update URL for language (for SEO purposes)
     */
    updateUrlForLanguage(lang) {
        const currentUrl = new URL(window.location.href);
        const pathParts = currentUrl.pathname.split('/').filter(Boolean);
        
        // Remove existing language prefix
        if (this.supportedLanguages.includes(pathParts[0])) {
            pathParts.shift();
        }
        
        // Add new language prefix if not English
        if (lang !== 'en') {
            pathParts.unshift(lang);
        }
        
        const newPath = '/' + pathParts.join('/');
        
        // Use history API to update URL without page reload
        window.history.pushState({ lang }, '', newPath + currentUrl.search);
    }
    
    /**
     * Update language switcher UI
     */
    updateLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            if (lang === this.currentLang) {
                btn.classList.add('active');
                btn.setAttribute('aria-current', 'true');
            } else {
                btn.classList.remove('active');
                btn.removeAttribute('aria-current');
            }
        });
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Language switcher buttons
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                this.switchLanguage(lang);
            });
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.lang) {
                this.switchLanguage(e.state.lang);
            }
        });
    }
    
    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLang;
    }
    
    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

// Initialize i18n when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}