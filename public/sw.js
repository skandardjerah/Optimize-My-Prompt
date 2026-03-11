/**
 * OptimizeMyPrompt AI — Service Worker
 *
 * Strategy:
 *  - Static assets (HTML, images): cache-first with network fallback
 *  - /api/* and non-GET requests: network-only (never cache)
 *  - Offline: serve cached index.html for navigation requests
 *
 * To update the cache, bump CACHE_NAME (e.g. promptcraft-v2).
 */

const CACHE_NAME = 'promptcraft-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/FULL_LOGOO_.png',
  '/LOGOO_.png',
];

// ── Install: pre-cache static assets ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

// ── Activate: delete stale caches ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── Fetch: cache-first for static, network-only for API ───────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept: non-GET requests or /api/* (must always hit live server)
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          // Only cache same-origin successful responses
          if (response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: return cached index.html for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // For other assets (images etc.) just fail silently
        });
    })
  );
});
