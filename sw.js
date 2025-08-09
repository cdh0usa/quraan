const CACHE_NAME = 'quran-app-v2';
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

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('App shell cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached version if available
      if (cachedResponse) {
        // For API requests, try to update cache in background
        if (event.request.url.includes('api.') || event.request.url.includes('.json')) {
          fetch(event.request).then(response => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
          }).catch(() => {
            // Network failed, but we have cached version
          });
        }
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(event.request).then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Add to cache
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Network failed and no cache available
        if (event.request.destination === 'document') {
          return caches.match('/offline.html') || new Response('الموقع غير متاح حالياً', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/html; charset=utf-8'
            })
          });
        }
      });
    })
  );
});

// Prayer notifications
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PRAYER_NOTIFICATION') {
    const options = {
      body: `حان الآن وقت صلاة ${event.data.prayer}`,
      icon: '/imges/logo.avif',
      badge: '/imges/logo.avif',
      tag: 'prayer-time',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        prayer: event.data.prayer,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: 'فتح التطبيق'
        },
        {
          action: 'dismiss',
          title: 'إغلاق'
        }
      ]
    };

    self.registration.showNotification('حان وقت الصلاة', options);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // If a window is already open, focus it
        for (let client of clientList) {
          if (client.url === self.registration.scope && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification (already done above)
    console.log('Prayer notification dismissed');
  } else {
    // Default action (click on notification body)
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (let client of clientList) {
          if (client.url === self.registration.scope && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
  }
});

// Handle background sync (for offline functionality)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      console.log('Background sync triggered')
    );
  }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/imges/logo.avif',
      badge: '/imges/logo.avif',
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});