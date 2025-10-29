// Service Worker for PWA functionality - Android Optimized
const CACHE_NAME = 'school-ideas-v2';
const RUNTIME_CACHE = 'school-ideas-runtime-v2';

// Essential files to cache on install
const urlsToCache = [
  '/',
  '/index.html',
];

// Cache size limits for mobile devices
const MAX_CACHE_SIZE = 50; // Maximum number of items in runtime cache
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        // Don't fail if some URLs can't be cached
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('Some URLs failed to cache:', err);
          return Promise.resolve();
        });
      })
      .catch((err) => {
        console.error('Cache opening failed:', err);
        return Promise.resolve();
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately (must be inside waitUntil)
      self.clients.claim(),
    ])
  );
});

// Helper function to limit cache size for Android performance
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const keysToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Network-first strategy for API calls, Cache-first for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful API responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
              trimCache(RUNTIME_CACHE, MAX_CACHE_SIZE);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache on network failure
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          // Refresh cache in background for stale content
          fetch(request).then((freshResponse) => {
            if (freshResponse && freshResponse.status === 200) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, freshResponse);
              });
            }
          }).catch(() => {
            // Network error - cached version is fine
          });
          return response;
        }

        // No cache - fetch from network
        return fetch(request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched resource
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
                trimCache(RUNTIME_CACHE, MAX_CACHE_SIZE);
              })
              .catch((err) => {
                console.warn('Failed to cache response:', err);
              });

            return response;
          })
          .catch((err) => {
            console.warn('Fetch failed:', err);
            // Return a fallback or just rethrow
            throw err;
          });
      })
      .catch((err) => {
        console.warn('Cache match failed:', err);
        // Fallback to network
        return fetch(request);
      })
  );
});

// Handle background sync (for offline functionality)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ideas') {
    event.waitUntil(syncIdeas());
  }
});

async function syncIdeas() {
  // Implement your sync logic here
  console.log('Syncing ideas...');
}

// Handle push notifications - Android optimized
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    // Android-specific notification options
    requireInteraction: false,
    tag: 'school-ideas-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification('School Ideas', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Periodic background sync for Android
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-ideas') {
    event.waitUntil(syncIdeas());
  }
});
