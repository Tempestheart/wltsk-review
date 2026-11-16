// 每次更新文件后把版本号 +1，否则手机可能一直用旧缓存
const CACHE = 'review-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './questions1.json',
  './questions2.json',
  './questions3.json',
  './questions4.json',
  './ai_cache1.json',
  './ai_cache2.json',
  './ai_cache3.json',
  './ai_cache4.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(url => c.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // 同源 GET 请求顺手缓存，方便之后离线
        if (resp.ok && new URL(e.request.url).origin === location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});