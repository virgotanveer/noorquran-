const CACHE_NAME = 'noorquran-v7';
const BASE = '/noorquran-/';
const SHELL = [
  BASE, BASE+'index.html', BASE+'style.css?v=7',
  BASE+'app.js?v=7', BASE+'tajweed.js?v=7',
  BASE+'manifest.json', BASE+'icons/icon-192.png', BASE+'icons/icon-512.png',
  BASE+'quran-ar.json', BASE+'quran-en.json', BASE+'quran-ur.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(SHELL.map(url =>
        fetch(url).then(r => r.ok ? cache.put(url, r) : null).catch(() => null)
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const netFirst = ['api.alquran.cloud','api.qurancdn.com','api.anthropic.com',
                    'fonts.googleapis.com','fonts.gstatic.com','raw.githubusercontent.com'];
  if (netFirst.includes(url.hostname)) { event.respondWith(netFirst_(req)); return; }
  event.respondWith(cacheFirst_(req));
});

async function cacheFirst_(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) { const c = await caches.open(CACHE_NAME); c.put(req, res.clone()); }
    return res;
  } catch {
    if (req.mode === 'navigate') {
      const fb = await caches.match(BASE + 'index.html');
      if (fb) return fb;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function netFirst_(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) { const c = await caches.open(CACHE_NAME); c.put(req, res.clone()); }
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } });
  }
}
