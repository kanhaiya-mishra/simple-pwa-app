self.addEventListener('install', function (event) {
    console.log('[ServiceWorker] Installing ServiceWorker...', event);
})

self.addEventListener('activate', function (event) {
    console.log('[ServiceWorker] Activating ServiceWorker...', event);
})

// self.addEventListener('fetch', function (event) {
//     console.log('[ServiceWorker] Fetching something...');
// })
