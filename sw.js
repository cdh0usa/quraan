const CACHE_NAME = 'quran-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/quran.html',
  '/tafseer.html',
  '/hadis.html',
  '/azkar.html',
  '/css/master.css',
  '/css/framework.css',
  '/css/normalize.css',
  '/css/all.min.css',
  '/main.js',
  '/quran.js',
  '/tafseer.js',
  '/hadis.js',
  '/azkar.js',
  '/imges/logo.avif',
  '/imges/landing.avif',
  '/imges/photo.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// إشعارات الصلاة
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PRAYER_NOTIFICATION') {
    self.registration.showNotification('حان وقت الصلاة', {
      body: `حان الآن وقت صلاة ${event.data.prayer}`,
      icon: '/imges/logo.avif',
      badge: '/imges/logo.avif',
      tag: 'prayer-time',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'فتح التطبيق'
        }
      ]
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});