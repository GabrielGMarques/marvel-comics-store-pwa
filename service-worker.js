const dataCacheName = 'marvelCommicsStore-v18';
const cacheName = 'marvelCommicsStore-final-v18';

const filesToCache = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/scripts/service.js',
    '/scripts/libs/crypto-js/crypto-js.js',
    '/styles/main.css',
    '/assets/icon/captain-america-shield.png',
    '/assets/icon/001.png',
    '/assets/icon/002.png',
    '/assets/icon/003.png',
    '/assets/icon/004.png',
    '/assets/icon/005.png',
    '/assets/icon/006.png',
    '/assets/icon/007.png',
    '/assets/icon/008.png',
    '/assets/icon/000.png',
    '/assets/icon/010.png',
    '/assets/icon/011.png',
    '/assets/icon/012.png',
    '/assets/Roboto/Roboto-Thin.ttf',
    '/assets/Roboto/Roboto-Regular.ttf',
    '/assets/Roboto/Roboto-Light.ttf',
    '/assets/webfonts/fa-brands-400.eot',
    '/assets/webfonts/fa-brands-400.svg',
    '/assets/webfonts/fa-brands-400.ttf',
    '/assets/webfonts/fa-brands-400.woff',
    '/assets/webfonts/fa-brands-400.woff2',
    '/assets/webfonts/fa-regular-400.eot',
    '/assets/webfonts/fa-regular-400.svg',
    '/assets/webfonts/fa-regular-400.ttf',
    '/assets/webfonts/fa-regular-400.woff',
    '/assets/webfonts/fa-regular-400.woff2',
    '/assets/webfonts/fa-solid-900.eot',
    '/assets/webfonts/fa-solid-900.svg',
    '/assets/webfonts/fa-solid-900.ttf',
    '/assets/webfonts/fa-solid-900.woff',
    '/assets/webfonts/fa-solid-900.woff2',
    '/assets/fontawesome-styles/fontawesome-all.css'
];

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );

    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    console.log('[Service Worker] Fetch', event.request.url);
    event.respondWith(
        caches.open(dataCacheName).then(function (cache) {

            const networkFetch = fetch(event.request);

            event.waitUntil(networkFetch.then(response => {
                if (event.request.url.includes('marvel')) {
                    cache.delete(event.request.url);
                    cache.put(event.request.url, response.clone());
                }
            }));

            return cache.match(event.request).then(response => response || networkFetch);
        })
    );
});

self.addEventListener('push', function (event) {
        console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
    let icon = Math.floor(Math.random() * Math.floor(8));
    let iconBadge = Math.floor(Math.random() * Math.floor(2));
    
    const title = '＼(^o^)／';
    const options = {
        body: 'Hey apple!',
        icon: `/assets/icon/00${icon}.png`,
        badge: `/assets/icon/01${iconBadge}.png`
    };

    event.waitUntil(self.registration.showNotification(title, options));
});