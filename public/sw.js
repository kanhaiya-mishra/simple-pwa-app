importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const CACHE_STATIC_NAME = 'static-v';
const CACHE_DYNAMIC_NAME = 'dynamic';
const STATIC_FILES = [
    '/',
    '/offline.html',
    '/index.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/idb.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css'
];

const MAX_ITEMS_IN_CACHE = 10;

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then((cache) => {
                console.log('[Service Worker] PreCaching app shell ....');
                cache.addAll(STATIC_FILES);
            })
    );
});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(cacheNames.map((key => {
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[Service Worker] Deleting old cache', key);
                        return caches.delete(key);
                    }
                })));
            })
    )
    return self.clients.claim();
});

//Dynamic caching strategy

// cache-first-then-network
self.addEventListener('fetch', function (event) {

    let url = "https://simple-pwa-app-d5c53-default-rtdb.firebaseio.com/posts"
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(fetch(event.request)
            .then((res) => {
                let clonedRes = res.clone();
                clearAllData('posts')
                    .then(() => {
                        clonedRes.json()
                            .then((data) => {
                                for (let key in data) {
                                    writeData('posts', data[key]);
                                }
                            })
                    })
                return res;
            }))
    } else if (isInArray(event.request.url, STATIC_FILES)) {
        // Return from cache directly for static files
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request)
                        .then((res) => {
                            return caches.open(CACHE_DYNAMIC_NAME)
                                .then((cache) => {
                                    cache.put(event.request.url, res.clone());
                                    trimCache(CACHE_DYNAMIC_NAME, MAX_ITEMS_IN_CACHE)
                                    return res;
                                })
                        })
                        .catch((error) => {
                            return caches.open(CACHE_STATIC_NAME)
                                .then((cache) => {
                                    // return offline html for help page only
                                    // we dont want to return it for failed js, css, html files
                                    // as we are not caching offline.html file, just doing this for it
                                    if (event.request.headers.get('accept').includes('text/html')) {
                                        return cache.match('/offline.html');
                                    }
                                })
                        });
                })
        );
    }

});

// Util functions

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}

// Limit items in cache
function trimCache(cacheName, maxItems) {
    caches.open(cacheName)
        .then((cache) => {
            return cache.keys();
        })
        .then((keys) => {
            if (keys.length > maxItems) {
                cache.delete(keys[0])
                    .then(() => trimCache(cacheName, maxItems));
            }
        })
}

// cache-only
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.match(event.request)
//     );
// });

// network-only
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request)
//     );
// });

// network-first-then-cache
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request)
//             .then(response => response)
//             .catch((err) => {
//                 return caches.match(event.request);
//             })
//     );
// });