/**
 * Content Management System (CMS) Module
 * Provides dynamic content loading and management capabilities
 */

class ContentManager {
    constructor() {
        this.contentCache = new Map();
        this.basePath = '/content/';
        this.init();
    }

    /**
     * Initialize the content manager
     */
    init() {
        this.setupContentLoader();
        this.setupDynamicContent();
    }

    /**
     * Load content from JSON file
     */
    async loadContent(contentType, language = 'en') {
        const cacheKey = `${contentType}_${language}`;
        
        // Check cache first
        if (this.contentCache.has(cacheKey)) {
            return this.contentCache.get(cacheKey);
        }

        try {
            const response = await fetch(`${this.basePath}${contentType}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load content: ${contentType}`);
            }
            
            const content = await response.json();
            
            // Cache the content
            this.contentCache.set(cacheKey, content);
            
            return content;
        } catch (error) {
            console.error('Error loading content:', error);
            return null;
        }
    }

    /**
     * Get localized content
     */
    getLocalizedContent(content, language, key) {
        if (!content || !key) return null;
        
        const keys = key.split('.');
        let value = content;
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                // Check if this is a localized object
                if (value[language] !== undefined) {
                    value = value[language];
                } else if (value[k] !== undefined) {
                    value = value[k];
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
        
        return value;
    }

    /**
     * Render product cards dynamically
     */
    async renderProducts(container, language = 'en') {
        const products = await this.loadContent('products', language);
        if (!products || !products.products) return;

        const containerElement = document.querySelector(container);
        if (!containerElement) return;

        containerElement.innerHTML = products.products.map(product => `
            <article class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.images.main}" alt="${this.getLocalizedContent(product, language, 'name')}" loading="lazy" decoding="async">
                </div>
                <div class="product-content">
                    <h3 class="product-name">${this.getLocalizedContent(product, language, 'name')}</h3>
                    <p class="product-description">${this.getLocalizedContent(product, language, 'shortDescription')}</p>
                    <a href="/products/${product.slug}.html" class="product-link">Learn More →</a>
                </div>
            </article>
        `).join('');
    }

    /**
     * Render product details
     */
    async renderProductDetails(productId, container, language = 'en') {
        const products = await this.loadContent('products', language);
        if (!products || !products.products) return;

        const product = products.products.find(p => p.id === productId);
        if (!product) return;

        const containerElement = document.querySelector(container);
        if (!containerElement) return;

        containerElement.innerHTML = `
            <div class="product-detail">
                <div class="product-gallery">
                    <img src="${product.images.main}" alt="${this.getLocalizedContent(product, language, 'name')}" class="main-image">
                    <div class="gallery-thumbnails">
                        ${product.images.gallery.map(img => `
                            <img src="${img}" alt="" loading="lazy">
                        `).join('')}
                    </div>
                </div>
                <div class="product-info">
                    <h1>${this.getLocalizedContent(product, language, 'name')}</h1>
                    <p class="product-full-description">${this.getLocalizedContent(product, language, 'fullDescription')}</p>
                    
                    <div class="product-specifications">
                        <h3>Specifications</h3>
                        <div class="specs-grid">
                            ${Object.entries(product.specifications.chemicalComposition).map(([key, value]) => `
                                <div class="spec-item">
                                    <span class="spec-label">${key}:</span>
                                    <span class="spec-value">${value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="product-applications">
                        <h3>Applications</h3>
                        <ul>
                            ${product.applications.map(app => `<li>${app}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="product-certifications">
                        <h3>Certifications</h3>
                        <div class="cert-badges">
                            ${product.certifications.map(cert => `
                                <span class="cert-badge">${cert}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="product-cta">
                        <a href="/request-quote.html?product=${product.id}" class="btn btn-primary">Request Quote</a>
                        <a href="/contact.html" class="btn btn-secondary">Contact Us</a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup content loader for dynamic content areas
     */
    setupContentLoader() {
        // Load content for elements with data-content attribute
        const contentElements = document.querySelectorAll('[data-content]');
        
        contentElements.forEach(element => {
            const contentType = element.getAttribute('data-content');
            const contentKey = element.getAttribute('data-content-key');
            const language = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
            
            this.loadAndRenderContent(element, contentType, contentKey, language);
        });
    }

    /**
     * Load and render content to element
     */
    async loadAndRenderContent(element, contentType, contentKey, language) {
        const content = await this.loadContent(contentType, language);
        if (!content) return;

        const value = this.getLocalizedContent(content, language, contentKey);
        if (value) {
            element.innerHTML = value;
        }
    }

    /**
     * Setup dynamic content updates
     */
    setupDynamicContent() {
        // Listen for language changes
        window.addEventListener('languageChanged', (e) => {
            const newLanguage = e.detail.language;
            this.refreshDynamicContent(newLanguage);
        });
    }

    /**
     * Refresh dynamic content when language changes
     */
    async refreshDynamicContent(language) {
        // Clear cache for old language
        this.contentCache.clear();
        
        // Reload all dynamic content
        const contentElements = document.querySelectorAll('[data-content]');
        
        for (const element of contentElements) {
            const contentType = element.getAttribute('data-content');
            const contentKey = element.getAttribute('data-content-key');
            
            await this.loadAndRenderContent(element, contentType, contentKey, language);
        }
        
        // Refresh product grids if they exist
        const productGrids = document.querySelectorAll('[data-products-grid]');
        for (const grid of productGrids) {
            await this.renderProducts(`[data-products-grid="${grid.getAttribute('data-products-grid')}"]`, language);
        }
    }

    /**
     * Update meta tags for SEO
     */
    updateMetaTags(product, language) {
        if (!product.seo) return;

        // Update title
        if (product.seo.title) {
            document.title = product.seo.title;
        }

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && product.seo.description) {
            metaDescription.setAttribute('content', product.seo.description);
        }

        // Update meta keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && product.seo.keywords) {
            metaKeywords.setAttribute('content', product.seo.keywords);
        }

        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        
        if (ogTitle && product.seo.title) {
            ogTitle.setAttribute('content', product.seo.title);
        }
        if (ogDescription && product.seo.description) {
            ogDescription.setAttribute('content', product.seo.description);
        }
    }

    /**
     * Clear content cache
     */
    clearCache() {
        this.contentCache.clear();
    }

    /**
     * Preload content for better performance
     */
    async preloadContent(contentTypes, language = 'en') {
        const preloadPromises = contentTypes.map(type => 
            this.loadContent(type, language)
        );
        
        await Promise.all(preloadPromises);
    }

    /**
     * Get content statistics
     */
    getCacheStats() {
        return {
            size: this.contentCache.size,
            keys: Array.from(this.contentCache.keys())
        };
    }
}

// Initialize content manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contentManager = new ContentManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentManager;
}