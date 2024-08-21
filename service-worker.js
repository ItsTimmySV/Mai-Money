const CACHE_NAME = 'mai-money-cache-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/javascripts.js',
  '/img/icon-192x192.png',
  '/img/icon-512x512.png',
  '/manifest.json',
  '/lang/en.json', // Asegúrate de que esta ruta sea correcta
  '/lang/es.json', // Asegúrate de que esta ruta sea correcta
  // Otros archivos que quieras cachear
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Fuerza la activación inmediata
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
    .then(() => self.clients.claim()) // Reclama control de las páginas abiertas
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin && requestUrl.pathname === '/') {
    // Si es la página principal, intenta servir `index.html` desde el caché
    event.respondWith(
      caches.match('/index.html').then(response => {
        return response || fetch(event.request);
      })
    );
  } else {
    // Para todos los demás archivos
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
        .catch(() => {
          // Si la solicitud falla (offline y no en caché), servir `index.html`
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        })
    );
  }
});
