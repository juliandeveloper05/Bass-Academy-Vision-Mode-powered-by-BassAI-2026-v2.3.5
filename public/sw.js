/**
 * Bass Academy - Service Worker
 * Version 1.0.0
 * 
 * Caching Strategy:
 * - Cache First: Static assets (JS, CSS, fonts, icons)
 * - Network First: HTML pages (for quick updates)
 * - Stale While Revalidate: Images and media
 */

const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `bass-academy-${CACHE_VERSION}`;
const RUNTIME_CACHE = `bass-academy-runtime-${CACHE_VERSION}`;

// Assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/vite.svg',
  '/images/artists/patitucci.png',
  '/images/artists/wooten.png',
  '/images/artists/flea.png',
  '/images/artists/jaco.png',
];

// Icon sizes to precache
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
ICON_SIZES.forEach(size => {
  PRECACHE_ASSETS.push(`/icons/icon-${size}x${size}.png`);
});

/**
 * Install Event - Precache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [SW] Precaching critical assets...');
        return cache.addAll(PRECACHE_ASSETS.map(url => {
          return new Request(url, { cache: 'reload' });
        })).catch(err => {
          console.warn('⚠️ [SW] Precache partial failure:', err);
          // Continue even if some assets fail
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('✅ [SW] Precaching complete');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('⚡ [SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old version caches
              return cacheName.startsWith('bass-academy-') && cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('🗑️ [SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ [SW] Activation complete');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event - Handle requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests (except Google Fonts)
  if (!url.origin.includes(self.location.origin) && 
      !url.origin.includes('fonts.googleapis.com') && 
      !url.origin.includes('fonts.gstatic.com')) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip browser extension requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // Choose caching strategy based on request type
  if (request.destination === 'document' || request.mode === 'navigate') {
    // HTML: Network First with offline fallback
    event.respondWith(networkFirstWithFallback(request));
  } else if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com')
  ) {
    // CSS, JS, Fonts: Cache First
    event.respondWith(cacheFirst(request));
  } else if (request.destination === 'image') {
    // Images: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Default: Network First
    event.respondWith(networkFirst(request));
  }
});

/**
 * Cache First Strategy
 * Best for: Static assets that rarely change (JS, CSS, fonts)
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('⚠️ [SW] Cache First failed:', request.url);
    return new Response('Network error', { 
      status: 408, 
      statusText: 'Network error' 
    });
  }
}

/**
 * Network First Strategy
 * Best for: Dynamic content that changes frequently
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    console.warn('⚠️ [SW] Network First failed:', request.url);
    return new Response('Network error', { 
      status: 408, 
      statusText: 'Network error' 
    });
  }
}

/**
 * Network First with Offline Fallback
 * Best for: HTML pages
 */
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page as fallback
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    return new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

/**
 * Stale While Revalidate Strategy
 * Best for: Images and assets that can be slightly outdated
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(RUNTIME_CACHE);
        cache.then(c => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  // Return cached version immediately if available
  return cachedResponse || fetchPromise;
}

/**
 * Message Handler - Communication with main app
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 [SW] Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ [SW] Clearing all caches...');
    caches.keys().then(names => {
      Promise.all(names.map(name => caches.delete(name)));
    });
  }
});

/**
 * Push Notification Handler (Future implementation)
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Time to practice!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'practice', title: '🎸 Start Practice' },
      { action: 'dismiss', title: 'Later' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Bass Academy', options)
  );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'practice') {
    event.waitUntil(
      clients.openWindow('/?action=practice')
    );
  }
});

console.log('🎸 [SW] Bass Academy Service Worker loaded');
