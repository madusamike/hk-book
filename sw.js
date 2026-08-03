const CACHE_NAME = 'hk-book-v3';

// 1. 安裝並立即啟用新 Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // 刪除舊快取
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 2. 網路優先策略 (Network First)：先抓網路最新的，失敗才用快取離線開啟
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 如果成功抓到最新網頁，更新快取
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 沒網路時才讀取離線快取
        return caches.match(event.request);
      })
  );
});
