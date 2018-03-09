var CACHE_NAME = 'neverending-sum-v1';
var urlsToCache = [
    './',
    'style.css',
    'index.html',
    'vue.js',
    'game.js',
    'ops.js',
    'maths.js',
    'about.html'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
