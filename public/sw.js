// ============================================================
// HireFlow v4 Production Service Worker (PWA)
// Client-side, privacy-first offline caching
// ============================================================

const CACHE_VERSION = 'hireflow-v4-cache-v1';
const STATIC_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Precached app shell assets
// Build plugin will dynamically inject compiled JS/CSS chunk paths here
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-maskable.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('hireflow-v4-') && name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept non-GET requests (P-3: zero interception of external actions)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Only handle same-origin requests; never intercept cross-origin or chrome-extension URLs
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTML navigation requests (SPA routing):
  // Network first; fall back to cached /index.html when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/index.html');
        if (cached) return cached;
        const rootCached = await caches.match('/');
        if (rootCached) return rootCached;
        return new Response('HireFlow Offline: App shell is loading.', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }

  // Static assets (scripts, styles, images, fonts):
  // Stale-While-Revalidate: return cache immediately if available, update cache in background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
