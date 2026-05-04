const CACHE = 'roughie-v8';

// Only cache static assets — never cache the main HTML page
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
  '/rtgroup.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go straight to network for Firebase, Google APIs, OneSignal
  if (url.hostname.includes('firebasejs') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('firebaseio') ||
      url.hostname.includes('onesignal') ||
      url.hostname.includes('gstatic')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // For the main HTML page — always network first, never cached
  if (url.pathname === '/' ||
      url.pathname === '/index.html' ||
      url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // For static assets (icons etc) — cache first, network fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
