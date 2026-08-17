/* FIT Service Worker — fit-v3 force clear old caches */
const CACHE_NAME = 'fit-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always network first — never serve stale blank pages
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
