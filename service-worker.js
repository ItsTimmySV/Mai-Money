self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/index.html',
        '/styles.css',
        '/javascripts.js',
        '/img/icon-192x192.png',
        '/img/icon-512x512.png',
        // Agrega aquí los demás archivos que quieres cachear
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
