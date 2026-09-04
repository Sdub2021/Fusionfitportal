/* FIT Service Worker — offline shell for Solana dApp / PWA */
const CACHE_NAME = 'fit-v27';
const ASSETS = [
  '/',
  '/index.html',
  '/fit.css',
  '/solana.js',
  '/fit-hands.js',
  '/yoga.js',
  '/taichi.js',
  '/studio.js',
  '/studio-gate.js',
  '/studio-speed.js',
  '/field-audio.js',
  '/waitlist-gate.js',
  '/sw.js',
  '/level-1.html',
  '/level-2.html',
  '/level-3.html',
  '/level-4.html',
  '/level-5.html',
  '/privacy.html',
  '/terms.html',
  '/taichi.html',
  '/practice.html',
  '/stake.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/icons/icon.svg',
  '/icons/pX1Em.png',
  '/icons/smmkn.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        ASSETS.map((url) => cache.add(url).catch(() => null))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const isScript = path.endsWith('.js');
  const isDoc = event.request.mode === 'navigate' || path.endsWith('.html') || path === '/';
  const isStatic = path.endsWith('.png') || path.endsWith('.svg') || path.endsWith('.jpg') || path.endsWith('.css') || path.endsWith('.webp') || path.includes('/icons/');

  if (isScript || isDoc) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request).then((c) => {
          if (c) return c;
          // Navigation fallback: serve the offline shell (homepage) so the
          // app still opens when the network is gone.
          return caches.match('/index.html');
        }))
    );
    return;
  }

  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return res;
      }).catch(() => caches.match('/icons/pX1Em.png')))
    );
  }
});