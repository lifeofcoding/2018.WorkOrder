// TODO:

'use strict';

const CACHE_NAME = "1.00";
let cacheFiles = [
    '/public/views/index.ejs',
    '/public/views/header.ejs',
    '/public/views/footer.ejs',
    '/public/css/foundation.min..css',
    '/public/css/overrides.css',
    '/public/javascripts/main.js',
    '/public/favicons/favicon.ico',
    '/public/favicons/android-chrome-192x192.png'
];

self.addEventListener('install', (event) => {
     event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
               return cache.addAll(cacheFiles);
          })
     );
});

self.addEventListener('activate', (event) => {
     event.waitUntil(
          caches.keys().then(keys => {
               return Promise.all(
                    keys
                         .filter((key) => {
                              return !key.startsWith(CACHE_NAME);
                    })
                    .map((key) => {
                         return caches.delete(key);
                    })
               );
          })
     );
});

self.addEventListener('fetch', (event) => {
     event.respondWith(
          caches.match(event.request).then((res) => {
               if (res) {
                    return res;
               }
               let requestClone = event.request.clone();
               fetch(requestClone).then((res) => {
                    if (!res) {
                         return res;
                    }
                    let responseClone = res.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                         cache.put(event.request, responseClone);
                         return res;
                    });
               })
          })
     );
});