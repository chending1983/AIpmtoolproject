/**
 * Service Worker
 * Provides caching and offline functionality
 */

const CACHE_NAME = 'jingtuo-website-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/reset.css',
    '/css/variables.css',
    '/css/main.css',
    '/css/responsive.css',
    '/js/i18n.js',
    '/js/main.js',
    '/js/content-manager.js',
    '/lang/en.json',
    '/lang/zh.json',
    '/lang/es.json',
    '/content/products.json',
    '/images/logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('Error caching static assets:', error);
            })
    );
    
    // Skip waiting to activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all clients
    self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }
    
    // Strategy based on file type
    if (isStaticAsset(request)) {
        // Cache-first strategy for static assets
        event.respondWith(cacheFirstStrategy(request));
    } else if (isAPIRequest(request)) {
        // Network-first strategy for API requests
        event.respondWith(networkFirstStrategy(request));
    } else {
        // Stale-while-revalidate for HTML pages
        event.respondWith(staleWhileRevalidateStrategy(request));
    }
});

/**
 * Check if request is for static asset
 */
function isStaticAsset(request) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2'];
    return staticExtensions.some(ext => request.url.endsWith(ext));
}

/**
 * Check if request is for API
 */
function isAPIRequest(request) {
    return request.url.includes('/api/') || request.url.includes('/content/');
}

/**
 * Cache-first strategy
 */
async function cacheFirstStrategy(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Return cached response and update cache in background
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone());
                }
            })
            .catch(() => {
                // Network failed, but we have cached response
            });
        
        return cachedResponse;
    }
    
    // Not in cache, fetch from network
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Network failed and not in cache
        console.error('Network request failed:', error);
        return new Response('Network error', { status: 408 });
    }
}

/**
 * Network-first strategy
 */
async function networkFirstStrategy(request) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Not in cache either
        console.error('Network and cache both failed:', error);
        return new Response('Network error', { status: 408 });
    }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch from network in background
    const networkFetch = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch((error) => {
            console.error('Network fetch failed:', error);
            return null;
        });
    
    // Return cached response immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Wait for network response if not in cache
    const networkResponse = await networkFetch;
    if (networkResponse) {
        return networkResponse;
    }
    
    // Both failed
    return new Response('Network error', { status: 408 });
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncFormSubmissions());
    }
});

/**
 * Sync form submissions when back online
 */
async function syncFormSubmissions() {
    // Get queued form submissions from IndexedDB
    // This is a placeholder - implement with actual IndexedDB logic
    console.log('Syncing form submissions...');
}

// Push notification support (optional)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/images/icon-192x192.png',
            badge: '/images/badge-72x72.png',
            data: data.url
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.notification.data) {
        event.waitUntil(
            clients.openWindow(event.notification.data)
        );
    }
});