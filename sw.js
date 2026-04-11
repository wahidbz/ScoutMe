const CACHE_NAME = 'scoutme-cache-v1';
const ASSETS = [
  'index.html',
  'login.html',
  'dashboard.html',
  'css/style.css',
  'js/app.js',
  'js/utils.js',
  'js/i18n.js',
  'js/firebase.js',
  'assets/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});
