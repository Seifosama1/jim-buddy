/* ══════════════════════════════════════════
   JIM BUDDY - Service Worker
   Enables offline functionality
══════════════════════════════════════════ */

const CACHE_NAME = 'jim-buddy-v1.0.0';
const urlsToCache = [
  '.',
  'index.html',
  'styles.css',
  'app.js',
  'workouts-data.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install event - cache all necessary files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
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
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              // Don't cache external APIs or dynamic content
              if (!event.request.url.includes('chrome-extension') && 
                  !event.request.url.includes('googleapis') &&
                  !event.request.url.includes('cdn.jsdelivr')) {
                cache.put(event.request, responseToCache);
              }
            });
          
          return response;
        }).catch(() => {
          // Offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
          return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Background sync for data persistence (optional)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

function syncData() {
  // This can be expanded to sync data when back online
  console.log('Background sync triggered');
  return Promise.resolve();
}