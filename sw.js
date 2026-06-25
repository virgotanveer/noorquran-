// NoorQuran Service Worker v3 — GitHub Pages compatible
// Fixes: correct scope detection, proper cache keys, PWA launch

const CACHE_VERSION = 'noorquran-v3';

// Detect base path at SW registration time (works for any GitHub Pages repo name)
const SW_BASE = self.location.pathname.replace(/sw\.js$/, '');

const SHELL_FILES = [
  'index.html',
  'style.css',
  'app.js',
  'tajweed.js',
  'reader.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

// Build absolute URLs relative to SW location
const SHELL_URLS = SHELL_FILES.map(f => SW_BASE + f);
// Also cache the bare directory path (what Chrome requests when launching PWA)
SHELL_URLS.push(SW_BASE);
SHELL_URLS.push(SW_BASE + 'index.html');

// ─── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      Promise.allSettled(SHELL_URLS.map(url =>
        fetch(url).then(res => {
          if (res.ok) return cache.put(url, res);
        }).catch(() => null)
      ))
    ).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE — wipe old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET
  if (req.method !== 'GET') return;

  // Quran API + audio — network first, cache fallback
  if (url.hostname === 'api.alquran.cloud' ||
      url.hostname === 'api.qurancdn.com'  ||
      url.hostname === 'everyayah.com'     ||
      url.hostname === 'api.anthropic.com') {
    event.respondWith(networkFirst(req));
    return;
  }

  // Google Fonts — cache first (they rarely change)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(req));
    return;
  }

  // App shell — cache first with network fallback
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req, { ignoreSearch: false });
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.status === 200 && res.type !== 'opaque') {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    // For navigation requests, serve index.html from cache
    if (req.mode === 'navigate') {
      const fallback = await caches.match(SW_BASE + 'index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline — please check your connection.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.status === 200) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
