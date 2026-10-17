const CACHE_NAME = 'miley-notes-pwa-v1.01';

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'notes_data.js',
  'manifest.json',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'images/illustrations/miley_brand_logo.png',
  'images/illustrations/miley_mascot.png',
  'images/illustrations/sticker_book.png',
  'images/illustrations/sticker_star.png',
  'images/illustrations/sticker_pencil.png',
  'images/illustrations/tab_all.png',
  'images/illustrations/tab_science.png',
  'images/illustrations/tab_math.png',
  'images/illustrations/tab_chinese.png',
  'images/illustrations/tab_social.png',
  'images/illustrations/tab_english.png',
  'images/social/asia_monsoon_climate_map.png',
  'images/social/japan_monsoon_currents_map.png',
  'images/social/japan_cherry_blossom_front_map.png'
];

// 安裝 Service Worker 並預載核心資產
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('PWA cache warning:', err)))
      .then(() => self.skipWaiting())
  );
});

// 啟用 Service Worker 並清除過期舊版快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 網路優先策略 (Network-First)：保證永遠讀取最新內容，離線時自動回退快取
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
      })
  );
});
