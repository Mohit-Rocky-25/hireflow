# HireFlow v4: PWA & Offline Verification Report (Stage 9 / C14)

Verification report for Progressive Web App manifest, service worker caching, and offline operation.

---

## 1. Web App Manifest Audit (`public/manifest.webmanifest`)

- **Name**: HireFlow
- **Short Name**: HireFlow
- **Display Mode**: `standalone`
- **Start URL**: `/`
- **Scope**: `/`
- **Theme Color**: `#020617` (matching dark theme tokens)
- **Background Color**: `#020617`
- **Icons**:
  - `icon-192.svg`: 192x192 SVG generated from canonical favicon
  - `icon-512.svg`: 512x512 SVG generated from canonical favicon
  - `icon-maskable.svg`: 512x512 maskable SVG with safe-area padding and `#020617` canvas
- **HTML Linkage**: `<link rel="manifest" href="/manifest.webmanifest" />` and `<meta name="theme-color" content="#020617" />` verified in `index.html`.

---

## 2. Service Worker Architecture (`public/sw.js` & `dist/sw.js`)

- **Cache Version**: `hireflow-v4-cache-v1`
- **Precache Assets**:
  - Core App Shell (`/`, `/index.html`, `/manifest.webmanifest`, `/favicon.svg`, icons)
  - 71 dynamically injected compiled production JS/CSS assets via `vite.config.ts` (`pwaBuildPlugin`)
- **Caching Strategies**:
  - **SPA Navigation (`request.mode === 'navigate'`)**: Network-first with automatic fallback to cached `/index.html`.
  - **Static & Chunk Assets**: Stale-While-Revalidate (`caches.match` returns cached response immediately, background `fetch` updates cache).
  - **Non-GET Requests**: Guarded against interception (`request.method !== 'GET'` passed through untouched).
  - **Cross-Origin / Extensions**: Guarded (`url.origin !== self.location.origin` passed through untouched).
- **Activation & Eviction**:
  - `activate` event purges old versioned caches and calls `self.clients.claim()`.
- **Update Mechanism**:
  - Listens for `{ type: 'SKIP_WAITING' }` messages.
  - Client UI displays user-triggered `<PwaUpdateToast />` ("Update Available: Reload").
  - On user click, postMessage triggers `skipWaiting()` and controllerchange triggers `window.location.reload()`.

---

## 3. Secure-Context & LAN HTTP Degradation (P-13)

- **Browser Security Invariant**: Modern browsers restrict Service Worker registration (`navigator.serviceWorker.register`) to secure contexts (`https://` or `http://localhost`).
- **LAN Mobile Access**: When tested on a mobile device over local Wi-Fi via plain HTTP (e.g., `http://192.168.x.x:5173`), `window.isSecureContext` is `false`.
- **Graceful Degradation**:
  - `registerServiceWorker.ts` explicitly checks `window.isSecureContext`.
  - In insecure contexts, registration logs an informative notice and exits silently without throwing uncaught errors.
  - The in-app `<OfflineIndicator />` continues to monitor standard network connectivity via `navigator.onLine`.

---

## 4. Verification Test Matrix

| Area | Verification Test | Status |
|---|---|---|
| Manifest Schema & Icons | `tests/unit/stage9/pwaManifest.test.ts` | **PASS (4/4)** |
| HTML Manifest & Meta | `tests/unit/stage9/pwaManifest.test.ts` | **PASS** |
| Service Worker Security Guards | `tests/unit/stage9/pwaManifest.test.ts` | **PASS** |
| Production Precache Injection | `vite.config.ts` (`pwaBuildPlugin`) -> 71 assets injected | **PASS** |
| Offline Indicator Component | `src/components/common/OfflineIndicator.tsx` | **PASS** |
| Non-Intrusive Update Toast | `src/components/common/PwaUpdateToast.tsx` | **PASS** |
| Production Build Compilation | `npm run build` | **PASS (0 errors, 3.28s)** |
| Full Vitest Test Suite | `npx vitest run` (101 test files) | **PASS (725/725 green)** |
