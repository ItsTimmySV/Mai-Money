self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v2').then(cache => {
      return cache.addAll([
        '/index.html',
        '/styles.css',
        '/javascripts.js',
        '/img/icon-192x192.png',
        '/img/icon-512x512.png',
        '/manifest.json',
        // Otros archivos que quieras cachear
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
