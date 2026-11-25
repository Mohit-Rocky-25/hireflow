// ============================================================
// HireFlow Production Service Worker (PWA)
// Client-side, privacy-first offline caching for static assets only
// ============================================================

const CACHE_VERSION = '__HIREFLOW_SW_CACHE_VERSION__';
const STATIC_CACHE = CACHE_VERSION + '-shell';
const RUNTIME_CACHE = CACHE_VERSION + '-runtime';

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

const STATIC_ASSET_EXTENSIONS = ['.js', '.css', '.woff2', '.svg', '.png', '.ico', '.webmanifest'];

function isStaticAssetPath(pathname) {
  if (!pathname) return false;
  if (pathname.startsWith('/assets/')) return true;
  return STATIC_ASSET_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

function isSensitivePath(pathname) {
  if (!pathname) return false;
  return (
    pathname === '/api' ||
    pathname.startsWith('/api/') ||
    pathname === '/auth' ||
    pathname.startsWith('/auth/')
  );
}

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
          .filter((name) => name.startsWith('hireflow-') && name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data.type === 'CLEAR_USER_CACHES') {
    const deletion = caches.delete(RUNTIME_CACHE);
    if (typeof event.waitUntil === 'function') {
      event.waitUntil(deletion);
    }
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept non-GET requests (P-3: zero interception of external actions)
  if (request.method !== 'GET') {
    return;
  }

  // Never intercept or cache authenticated or cookie-credentialed requests
  if (request.credentials === 'include') {
    return;
  }
  if (request.headers && typeof request.headers.has === 'function' && request.headers.has('authorization')) {
    return;
  }

  const url = new URL(request.url);

  // Only handle same-origin requests; never intercept cross-origin or chrome-extension URLs
  if (url.origin !== self.location.origin) {
    return;
  }

  // Never cache or intercept API or auth routes
  if (isSensitivePath(url.pathname)) {
    return;
  }

  // HTML navigation requests (SPA routing):
  // Network first; fall back to cached /index.html when offline; never stored in RUNTIME_CACHE
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

  // Restrict RUNTIME_CACHE strictly to static build assets; never cache dynamic HTML/API/user data
  if (!isStaticAssetPath(url.pathname)) {
    return;
  }

  // Static assets (scripts, styles, images, fonts):
  // Stale-While-Revalidate: return cache immediately if available, update cache in background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const cacheControl = (networkResponse.headers && networkResponse.headers.get('cache-control') || '').toLowerCase();
            const contentType = (networkResponse.headers && networkResponse.headers.get('content-type') || '').toLowerCase();
            const hasSetCookie = Boolean(
              networkResponse.headers &&
                typeof networkResponse.headers.has === 'function' &&
                networkResponse.headers.has('set-cookie')
            );
            const varyHeader = ((networkResponse.headers && networkResponse.headers.get('vary')) || '').toLowerCase();
            const variesSensitive = varyHeader
              .split(',')
              .some((part) => {
                const token = part.trim();
                return token === '*' || token === 'cookie' || token === 'authorization';
              });
            const isPrivateOrNoStore = cacheControl.includes('no-store') || cacheControl.includes('private');
            const isHtml = contentType.includes('text/html');
            if (!isPrivateOrNoStore && !isHtml && !hasSetCookie && !variesSensitive) {
              const responseToCache = networkResponse.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
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
