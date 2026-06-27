// NoorQuran Service Worker v5
// Self-hosted Quran data — works with VPN
const CACHE_NAME = 'noorquran-v5';
const BASE = '/noorquran-/';

const SHELL = [
  BASE, BASE+'index.html', BASE+'style.css', BASE+'app.js',
  BASE+'tajweed.js', BASE+'reader.js', BASE+'manifest.json',
  BASE+'icons/icon-192.png', BASE+'icons/icon-512.png',
  BASE+'quran-ar.json',
  BASE+'quran-en.json',
  BASE+'quran-ur.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(SHELL.map(url =>
        fetch(url).then(r => r.ok ? cache.put(url, r) : null).catch(()=>null)
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // External APIs — network first, cache fallback
  const netFirst = ['api.alquran.cloud','api.qurancdn.com','api.anthropic.com',
                    'fonts.googleapis.com','fonts.gstatic.com'];
  if (netFirst.includes(url.hostname)) {
    event.respondWith(networkFirst(req)); return;
  }

  // GitHub raw (quran data + audio) — network first so we get latest
  if (url.hostname === 'raw.githubusercontent.com') {
    event.respondWith(networkFirst(req)); return;
  }

  // App shell and self-hosted data — cache first
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
    if (req.mode === 'navigate') {
      const fb = await caches.match(BASE+'index.html');
      if (fb) return fb;
    }
    return new Response('Offline', {status:503});
  }
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) { const c = await caches.open(CACHE_NAME); c.put(req,res.clone()); }
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response('{"error":"offline"}',{headers:{'Content-Type':'application/json'}});
  }
}
