// NoorQuran Service Worker — PWA offline support
const CACHE_NAME = 'noorquran-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// Files to cache immediately on install (app shell)
const SHELL_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Nastaliq+Urdu:wght@400;600&family=Inter:wght@400;500;600&display=swap',
];

// ─── INSTALL — cache the app shell ───────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can; don't fail install if a resource is missing
      return Promise.allSettled(
        SHELL_ASSETS.map(url => cache.add(url).catch(() => null))
      );
    }).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE — clean up old caches ──────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH — serve from cache, fall back to network ──────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for Quran API calls, then cache the response
  if (url.hostname === 'api.alquran.cloud') {
    event.respondWith(networkFirstWithCache(event.request));
    return;
  }

  // For Google Fonts, use cache-first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // For everything else (app shell), use cache-first with network fallback
  event.respondWith(cacheFirst(event.request));
});

// Cache first — great for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('<div style="padding:2rem;text-align:center;font-family:sans-serif">You are offline. Previously loaded surahs are still available.</div>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Network first — great for API data (fresh when online, cached when offline)
async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'offline', data: null }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
