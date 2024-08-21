const CACHE_NAME = 'mai-money-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/javascripts.js',
  '/img/icon-192x192.png',
  '/img/icon-512x512.png',
  '/manifest.json',
  // Otros archivos que quieras cachear
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return the cached version, or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Si la solicitud falla, devuelve la página de inicio como fallback
        return caches.match('/index.html');
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
