// NoorQuran Service Worker v4
// Hardcoded for: virgotanveer.github.io/noorquran-/

const CACHE_NAME = 'noorquran-v4';
const BASE = '/noorquran-/';

const SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'style.css',
  BASE + 'app.js',
  BASE + 'tajweed.js',
  BASE + 'reader.js',
  BASE + 'manifest.json',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(
        SHELL.map(url => fetch(url).then(r => r.ok ? cache.put(url, r) : null).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // External APIs — network first, cache fallback
  const networkFirstHosts = ['api.alquran.cloud','api.qurancdn.com','everyayah.com','api.anthropic.com','fonts.googleapis.com','fonts.gstatic.com'];
  if (networkFirstHosts.includes(url.hostname)) {
    event.respondWith(networkFirst(req));
    return;
  }

  // App shell — cache first
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    // Navigation fallback — serve index.html for any app route
    if (req.mode === 'navigate') {
      const fallback = await caches.match(BASE + 'index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } });
  }
}
