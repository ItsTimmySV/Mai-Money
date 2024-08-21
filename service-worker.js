const CACHE_NAME = 'mai-money-cache-v4';
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

// Instalación del service worker y cacheo de archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Fuerza la activación inmediata
  );
});

// Activación del service worker
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
    .then(() => self.clients.claim()) // Reclama control de las páginas abiertas
  );
});

// Intercepción de peticiones de red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Si la solicitud falla (offline y no en caché), servir `index.html`
        return caches.match('/index.html');
      })
  );
});
