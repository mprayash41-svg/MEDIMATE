const CACHE_NAME = 'health-guardian-v1';

// List every file exactly as it appears in your Acode sidebar
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './add.html',
  './contacts.html',
  './doctor.html',
  './history.html',
  './login.html',
  './settings.html',
  './vibration.html',
  './style.css',
  './script.js',
  './manifest.json',
  './alarm.mp3'
];

// 1. Install: Save everything to the phone's storage
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('HealthGuardian: Caching Assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Force the new service worker to become active immediately
});

// 2. Activate: Delete old caches when you update the version
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('HealthGuardian: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all pages immediately
});

// 3. Fetch: The "Reliability" Engine
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached file if found, otherwise go to the internet
      return response || fetch(event.request).catch(() => {
        // If both fail (offline and not in cache), show index.html as a fallback
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});