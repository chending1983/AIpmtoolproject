/**
 * Component Loader - Jingtuo Alumina Website
 * 统一的组件加载器，用于动态加载和注入Header、Footer等公共组件
 * 
 * @version 2.0.0
 * @author Jingtuo Alumina Team
 */

(function() {
    'use strict';

    // 组件加载器配置
    const CONFIG = {
        componentsPath: './components/',
        cacheEnabled: true,
        cacheDuration: 5 * 60 * 1000, // 5分钟缓存
        retryAttempts: 3,
        retryDelay: 1000
    };

    // 组件缓存
    const componentCache = new Map();

    // 检测是否在文件协议下运行
    const isFileProtocol = window.location.protocol === 'file:';

    /**
     * 组件加载器类
     */
    class ComponentLoader {
        constructor() {
            this.loadedComponents = new Map();
            this.init();
        }

        /**
         * 初始化加载器
         */
        init() {
            // 监听DOMContentLoaded事件
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.loadAllComponents());
            } else {
                this.loadAllComponents();
            }
        }

        /**
         * 加载所有标记的组件
         */
        async loadAllComponents() {
            const containers = document.querySelectorAll('[data-component]');
            
            for (const container of containers) {
                const componentName = container.dataset.component;
                if (componentName) {
                    try {
                        await this.loadComponent(componentName, container);
                    } catch (error) {
                        console.error(`Failed to load component "${componentName}":`, error);
                        // 如果是文件协议，尝试使用内联组件
                        if (isFileProtocol) {
                            this.loadInlineComponent(componentName, container);
                        }
                    }
                }
            }

            // 触发所有组件加载完成事件
            this.emit('componentsLoaded', {
                count: this.loadedComponents.size
            });
        }

        /**
         * 加载单个组件
         * @param {string} name - 组件名称
         * @param {HTMLElement} container - 组件容器
         * @returns {Promise<HTMLElement>}
         */
        async loadComponent(name, container) {
            // 检查缓存
            const cached = this.getFromCache(name);
            if (cached) {
                return this.injectComponent(cached, container, name);
            }

            // 构建组件URL
            const componentUrl = this.getComponentUrl(name);
            
            // 加载组件HTML
            const html = await this.fetchComponent(componentUrl, CONFIG.retryAttempts);
            
            // 缓存组件
            this.setCache(name, html);
            
            // 注入组件
            return this.injectComponent(html, container, name);
        }

        /**
         * 加载内联组件（用于文件协议）
         * @param {string} name - 组件名称
         * @param {HTMLElement} container - 组件容器
         */
        loadInlineComponent(name, container) {
            console.log(`Loading inline component: ${name}`);
            
            if (name === 'header') {
                this.injectHeaderInline(container);
            } else if (name === 'footer') {
                this.injectFooterInline(container);
            }
        }

        /**
         * 直接注入Header组件（内联模式）
         * @param {HTMLElement} container - 组件容器
         */
        injectHeaderInline(container) {
            const nav = container.dataset.activeNav || '';
            const lang = container.dataset.lang || 'zh';
            
            const headerHTML = `
                <a href="#main-content" class="skip-link">跳转到主要内容</a>
                <header class="header header-enhanced" role="banner" id="main-header">
                    <div class="container">
                        <div class="header-inner">
                            <a href="./index.html" class="logo logo-enhanced" aria-label="山东晶拓新材料科技有限公司首页">
                                <img src="./images/logo.svg" alt="山东晶拓新材料科技有限公司 Logo" width="200" height="60" loading="eager">
                            </a>
                            <button class="mobile-menu-toggle" aria-label="切换导航菜单" aria-expanded="false" aria-controls="main-nav" id="mobile-menu-btn">
                                <span class="hamburger"></span>
                                <span class="hamburger"></span>
                                <span class="hamburger"></span>
                            </button>
                            <nav class="main-nav" id="main-nav" role="navigation" aria-label="主导航">
                                <ul class="nav-list nav-list-enhanced">
                                    <li class="nav-item" data-nav="home">
                                        <a href="./index.html" class="nav-link nav-link-enhanced ${nav === 'home' ? 'active' : ''}" data-i18n="nav.home">首页</a>
                                    </li>
                                    <li class="nav-item" data-nav="about">
                                        <a href="./about.html" class="nav-link nav-link-enhanced ${nav === 'about' ? 'active' : ''}" data-i18n="nav.about">关于我们</a>
                                    </li>
                                    <li class="nav-item dropdown dropdown-enhanced" data-nav="products">
                                        <a href="./products.html" class="nav-link nav-link-enhanced ${nav === 'products' ? 'active' : ''}" data-i18n="nav.products">产品中心</a>
                                        <ul class="dropdown-menu dropdown-menu-enhanced">
                                            <li><a href="./products/pseudoboehmite.html" data-i18n="products.pseudoboehmite.name">拟薄水铝石</a></li>
                                            <li><a href="./products/microcrystalline-alumina.html" data-i18n="products.microcrystallineAlumina.name">微晶氧化铝</a></li>
                                            <li><a href="./products/alumina-carrier.html" data-i18n="products.aluminaCarrier.name">氧化铝载体</a></li>
                                            <li><a href="./products/alumina-microspheres.html" data-i18n="products.aluminaMicrospheres.name">氧化铝微球</a></li>
                                        </ul>
                                    </li>
                                    <li class="nav-item" data-nav="applications">
                                        <a href="./applications.html" class="nav-link nav-link-enhanced ${nav === 'applications' ? 'active' : ''}" data-i18n="nav.applications">应用领域</a>
                                    </li>
                                    <li class="nav-item" data-nav="news">
                                        <a href="./news.html" class="nav-link nav-link-enhanced ${nav === 'news' ? 'active' : ''}" data-i18n="nav.news">新闻动态</a>
                                    </li>
                                    <li class="nav-item" data-nav="contact">
                                        <a href="./contact.html" class="nav-link nav-link-enhanced ${nav === 'contact' ? 'active' : ''}" data-i18n="nav.contact">联系我们</a>
                                    </li>
                                </ul>
                            </nav>
                            <div class="language-switcher lang-switcher-enhanced" role="group" aria-label="语言选择">
                                <button class="lang-btn lang-btn-enhanced ${lang === 'en' ? 'active' : ''}" data-lang="en" aria-label="English">EN</button>
                                <button class="lang-btn lang-btn-enhanced ${lang === 'zh' ? 'active' : ''}" data-lang="zh" aria-label="中文">中文</button>
                                <button class="lang-btn lang-btn-enhanced ${lang === 'es' ? 'active' : ''}" data-lang="es" aria-label="Español">ES</button>
                            </div>
                        </div>
                    </div>
                </header>
            `;
            
            container.innerHTML = headerHTML;
            container.dataset.componentLoaded = 'true';
            container.classList.add('component-header-loaded');
            
            this.loadedComponents.set('header', {
                container,
                name: 'header',
                instance: null
            });
            
            this.emit('componentLoaded', { name: 'header', container });
            
            // 初始化Header交互
            this.initHeaderInteractions(container);
        }

        /**
         * 直接注入Footer组件（内联模式）
         * @param {HTMLElement} container - 组件容器
         */
        injectFooterInline(container) {
            const showSocial = container.dataset.showSocial !== 'false';
            const currentYear = new Date().getFullYear();
            
            const footerHTML = `
                <footer class="footer footer-enhanced" role="contentinfo" id="main-footer">
                    <div class="container">
                        <div class="footer-grid footer-grid-enhanced">
                            <div class="footer-section footer-section-enhanced">
                                <h3 data-i18n="footer.company">公司介绍</h3>
                                <ul>
                                    <li><a href="./about.html" data-i18n="footer.about">关于我们</a></li>
                                    <li><a href="./history.html" data-i18n="footer.history">发展历程</a></li>
                                    <li><a href="./certifications.html" data-i18n="footer.certifications">资质认证</a></li>
                                    <li><a href="./facilities.html" data-i18n="footer.facilities">生产设施</a></li>
                                </ul>
                            </div>
                            <div class="footer-section footer-section-enhanced">
                                <h3 data-i18n="footer.products">产品中心</h3>
                                <ul>
                                    <li><a href="./products/pseudoboehmite.html" data-i18n="products.pseudoboehmite.name">拟薄水铝石</a></li>
                                    <li><a href="./products/microcrystalline-alumina.html" data-i18n="products.microcrystallineAlumina.name">微晶氧化铝</a></li>
                                    <li><a href="./products/alumina-carrier.html" data-i18n="products.aluminaCarrier.name">氧化铝载体</a></li>
                                    <li><a href="./products/alumina-microspheres.html" data-i18n="products.aluminaMicrospheres.name">氧化铝微球</a></li>
                                </ul>
                            </div>
                            <div class="footer-section footer-section-enhanced">
                                <h3 data-i18n="footer.resources">资源中心</h3>
                                <ul>
                                    <li><a href="./news.html" data-i18n="footer.news">新闻动态</a></li>
                                    <li><a href="./technical-articles.html" data-i18n="footer.articles">技术文章</a></li>
                                    <li><a href="./downloads.html" data-i18n="footer.downloads">资料下载</a></li>
                                    <li><a href="./faq.html" data-i18n="footer.faq">常见问题</a></li>
                                </ul>
                            </div>
                            <div class="footer-section footer-section-enhanced footer-contact">
                                <h3 data-i18n="footer.contact">联系我们</h3>
                                <address class="footer-address">
                                    <p class="footer-location">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        <span>中国山东省</span>
                                    </p>
                                    <p class="footer-email">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                        <a href="mailto:info@jingtuomaterials.com">info@jingtuomaterials.com</a>
                                    </p>
                                    <p class="footer-phone">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                        <a href="tel:+8612345678900">+86 123 4567 8900</a>
                                    </p>
                                </address>
                                ${showSocial ? `
                                <div class="social-links social-links-enhanced" data-social-section>
                                    <a href="https://linkedin.com/company/jingtuo-alumina" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" class="social-link">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                            <rect x="2" y="9" width="4" height="12"></rect>
                                            <circle cx="4" cy="4" r="2"></circle>
                                        </svg>
                                    </a>
                                    <a href="https://twitter.com/jingtuoalumina" aria-label="Twitter" target="_blank" rel="noopener noreferrer" class="social-link">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                        </svg>
                                    </a>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="footer-divider"></div>
                        <div class="footer-bottom footer-bottom-enhanced">
                            <p class="footer-copyright">
                                &copy; <span id="current-year">${currentYear}</span> 
                                <span data-i18n="footer.companyName">山东晶拓新材料科技有限公司</span>. 
                                <span data-i18n="footer.rights">版权所有。</span>
                            </p>
                            <div class="footer-legal footer-legal-enhanced">
                                <a href="./privacy-policy.html" data-i18n="footer.privacy">隐私政策</a>
                                <span class="footer-separator">|</span>
                                <a href="./terms-of-service.html" data-i18n="footer.terms">服务条款</a>
                                <span class="footer-separator">|</span>
                                <a href="./sitemap.html" data-i18n="footer.sitemap">网站地图</a>
                            </div>
                        </div>
                    </div>
                </footer>
            `;
            
            container.innerHTML = footerHTML;
            container.dataset.componentLoaded = 'true';
            container.classList.add('component-footer-loaded');
            
            this.loadedComponents.set('footer', {
                container,
                name: 'footer',
                instance: null
            });
            
            this.emit('componentLoaded', { name: 'footer', container });
        }

        /**
         * 初始化Header交互
         * @param {HTMLElement} container - Header容器
         */
        initHeaderInteractions(container) {
            // 移动端菜单切换
            const mobileBtn = container.querySelector('#mobile-menu-btn');
            const mainNav = container.querySelector('#main-nav');
            
            if (mobileBtn && mainNav) {
                mobileBtn.addEventListener('click', () => {
                    const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
                    mobileBtn.setAttribute('aria-expanded', !isExpanded);
                    mainNav.classList.toggle('mobile-open');
                });
            }
            
            // Header滚动效果
            const header = container.querySelector('#main-header');
            if (header) {
                let lastScroll = 0;
                const scrollThreshold = 50;
                
                window.addEventListener('scroll', function() {
                    const currentScroll = window.pageYOffset;
                    
                    if (currentScroll > scrollThreshold) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    
                    lastScroll = currentScroll;
                }, { passive: true });
            }
            
            // 语言切换
            const langBtns = container.querySelectorAll('.lang-btn');
            langBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const lang = btn.dataset.lang;
                    
                    // 更新按钮状态
                    langBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // 触发语言切换事件
                    this.emit('languageChange', { language: lang });
                    
                    // 存储语言偏好
                    localStorage.setItem('preferred-language', lang);
                });
            });
            
            // 恢复语言偏好
            const savedLang = localStorage.getItem('preferred-language');
            if (savedLang) {
                const btn = container.querySelector(`[data-lang="${savedLang}"]`);
                if (btn && !btn.classList.contains('active')) {
                    btn.click();
                }
            }
        }

        /**
         * 获取组件URL
         * @param {string} name - 组件名称
         * @returns {string}
         */
        getComponentUrl(name) {
            // 处理不同层级的路径
            const pathDepth = this.getPathDepth();
            const basePath = pathDepth > 0 
                ? '../'.repeat(pathDepth) + 'components/'
                : './components/';
            
            return `${basePath}${name}.html`;
        }

        /**
         * 获取当前页面的路径深度
         * @returns {number}
         */
        getPathDepth() {
            const path = window.location.pathname;
            
            // 文件协议下的路径处理
            if (isFileProtocol) {
                const parts = path.split('/').filter(p => p && !p.endsWith('.html'));
                // 如果在products目录下，深度为1
                if (path.includes('/products/')) return 1;
                return 0;
            }
            
            const parts = path.split('/').filter(p => p && !p.endsWith('.html'));
            
            // 排除域名部分
            const relevantParts = parts.filter(p => 
                !p.includes('.') || p === 'jingtuo-website'
            );
            
            // 如果在products目录下，深度为1
            if (path.includes('/products/')) return 1;
            
            return 0;
        }

        /**
         * 获取缓存的组件
         * @param {string} name - 组件名称
         * @returns {string|null}
         */
        getFromCache(name) {
            if (!CONFIG.cacheEnabled) return null;
            
            const cached = componentCache.get(name);
            if (!cached) return null;
            
            // 检查缓存是否过期
            if (Date.now() - cached.timestamp > CONFIG.cacheDuration) {
                componentCache.delete(name);
                return null;
            }
            
            return cached.html;
        }

        /**
         * 设置组件缓存
         * @param {string} name - 组件名称
         * @param {string} html - 组件HTML
         */
        setCache(name, html) {
            if (!CONFIG.cacheEnabled) return;
            
            componentCache.set(name, {
                html,
                timestamp: Date.now()
            });
        }

        /**
         * 获取组件缓存
         * @returns {Map}
         */
        static getCache() {
            return componentCache;
        }

        /**
         * 清除组件缓存
         */
        static clearCache() {
            componentCache.clear();
        }

        /**
         * 获取组件缓存
         * @param {string} url - 组件URL
         * @param {number} retries - 重试次数
         * @returns {Promise<string>}
         */
        async fetchComponent(url, retries = CONFIG.retryAttempts) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'text/html'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.text();
            } catch (error) {
                if (retries > 0) {
                    await this.delay(CONFIG.retryDelay);
                    return this.fetchComponent(url, retries - 1);
                }
                throw error;
            }
        }

        /**
         * 延迟函数
         * @param {number} ms - 毫秒数
         * @returns {Promise<void>}
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        /**
         * 注入组件到容器
         * @param {string} html - 组件HTML
         * @param {HTMLElement} container - 目标容器
         * @param {string} name - 组件名称
         * @returns {HTMLElement}
         */
        injectComponent(html, container, name) {
            // 创建临时容器解析HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            // 提取template内容
            const template = tempDiv.querySelector('template');
            if (template) {
                const content = template.content.cloneNode(true);
                container.appendChild(content);
            } else {
                // 如果没有template，直接插入HTML
                container.innerHTML = html;
            }

            // 执行组件脚本
            this.executeScripts(tempDiv, container);

            // 标记为已加载
            container.dataset.componentLoaded = 'true';
            container.classList.add(`component-${name}-loaded`);

            // 存储引用
            this.loadedComponents.set(name, {
                container,
                name,
                instance: null
            });

            // 初始化组件类
            this.initializeComponent(name, container);

            // 触发组件加载完成事件
            this.emit('componentLoaded', { name, container });

            return container;
        }

        /**
         * 执行组件中的脚本
         * @param {HTMLElement} source - 源元素
         * @param {HTMLElement} target - 目标容器
         */
        executeScripts(source, target) {
            const scripts = source.querySelectorAll('script');
            
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                
                // 复制属性
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                
                // 设置代码
                newScript.textContent = script.textContent;
                
                // 插入到目标容器
                target.appendChild(newScript);
            });
        }

        /**
         * 初始化组件类
         * @param {string} name - 组件名称
         * @param {HTMLElement} container - 组件容器
         */
        initializeComponent(name, container) {
            const className = this.getComponentClassName(name);
            
            if (window[className]) {
                try {
                    const instance = new window[className](container);
                    
                    // 更新存储的引用
                    const componentData = this.loadedComponents.get(name);
                    if (componentData) {
                        componentData.instance = instance;
                    }
                    
                    // 存储实例到容器以便外部访问
                    container.componentInstance = instance;
                } catch (error) {
                    console.error(`Failed to initialize ${className}:`, error);
                }
            }
        }

        /**
         * 获取组件类名
         * @param {string} name - 组件名称
         * @returns {string}
         */
        getComponentClassName(name) {
            // 将kebab-case转换为PascalCase
            return name.split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join('') + 'Component';
        }

        /**
         * 获取已加载的组件实例
         * @param {string} name - 组件名称
         * @returns {Object|null}
         */
        getComponent(name) {
            const component = this.loadedComponents.get(name);
            return component ? component.instance : null;
        }

        /**
         * 获取所有已加载的组件
         * @returns {Map}
         */
        getAllComponents() {
            return this.loadedComponents;
        }

        /**
         * 重新加载组件
         * @param {string} name - 组件名称
         */
        async reloadComponent(name) {
            const component = this.loadedComponents.get(name);
            if (component) {
                // 清除缓存
                componentCache.delete(name);
                
                // 清空容器
                component.container.innerHTML = '';
                
                // 重新加载
                await this.loadComponent(name, component.container);
            }
        }

        /**
         * 事件发射器
         * @param {string} eventName - 事件名称
         * @param {Object} data - 事件数据
         */
        emit(eventName, data) {
            const event = new CustomEvent(`componentLoader:${eventName}`, {
                detail: data,
                bubbles: true
            });
            document.dispatchEvent(event);
        }

        /**
         * 监听事件
         * @param {string} eventName - 事件名称
         * @param {Function} callback - 回调函数
         */
        on(eventName, callback) {
            document.addEventListener(`componentLoader:${eventName}`, (e) => {
                callback(e.detail);
            });
        }
    }

    // 创建全局实例
    window.componentLoader = new ComponentLoader();

    // 提供全局API
    window.JTComponents = {
        /**
         * 加载组件
         * @param {string} name - 组件名称
         * @param {HTMLElement|string} container - 容器元素或选择器
         * @returns {Promise<HTMLElement>}
         */
        load: async (name, container) => {
            const el = typeof container === 'string' 
                ? document.querySelector(container) 
                : container;
            
            if (!el) {
                throw new Error(`Container not found: ${container}`);
            }
            
            return window.componentLoader.loadComponent(name, el);
        },

        /**
         * 获取组件实例
         * @param {string} name - 组件名称
         * @returns {Object|null}
         */
        get: (name) => {
            return window.componentLoader.getComponent(name);
        },

        /**
         * 重新加载组件
         * @param {string} name - 组件名称
         */
        reload: async (name) => {
            return window.componentLoader.reloadComponent(name);
        },

        /**
         * 清除缓存
         */
        clearCache: () => {
            ComponentLoader.clearCache();
        },

        /**
         * 监听事件
         * @param {string} eventName - 事件名称
         * @param {Function} callback - 回调函数
         */
        on: (eventName, callback) => {
            window.componentLoader.on(eventName, callback);
        },

        /**
         * 配置加载器
         * @param {Object} options - 配置选项
         */
        config: (options) => {
            Object.assign(CONFIG, options);
        }
    };

    // 监听Header组件事件
    document.addEventListener('header:navClick', (e) => {
        console.log('Navigation clicked:', e.detail);
    });

    document.addEventListener('header:languageChange', (e) => {
        console.log('Language changed:', e.detail);
        
        // 存储语言偏好
        localStorage.setItem('preferred-language', e.detail.language);
        
        // 可以在这里触发全局语言切换
        document.dispatchEvent(new CustomEvent('global:languageChange', {
            detail: e.detail
        }));
    });

    // 监听Footer组件事件
    document.addEventListener('footer:linkClick', (e) => {
        console.log('Footer link clicked:', e.detail);
    });

    document.addEventListener('footer:socialClick', (e) => {
        console.log('Social link clicked:', e.detail);
    });

    // 监听所有组件加载完成
    document.addEventListener('componentLoader:componentsLoaded', (e) => {
        console.log('All components loaded:', e.detail);
        
        // 触发页面就绪事件
        document.dispatchEvent(new CustomEvent('page:ready'));
    });

})();

/**
 * 使用示例：
 * 
 * HTML中标记组件容器：
 * <div id="header-container" data-component="header" data-active-nav="about" data-lang="zh"></div>
 * <div id="footer-container" data-component="footer" data-show-social="true"></div>
 * 
 * JavaScript API：
 * // 获取Header组件实例
 * const header = JTComponents.get('header');
 * header.setLanguage('en');
 * header.setActiveNavigation('products');
 * 
 * // 监听事件
 * JTComponents.on('componentsLoaded', (data) => {
 *   console.log(`${data.count} components loaded`);
 * });
 * 
 * // 重新加载组件
 * JTComponents.reload('header');
 */