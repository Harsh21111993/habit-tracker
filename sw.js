// ============================================================
// WWWW x MAN's Habit Tracker - Service Worker
// ============================================================
// Caches all app assets so the tracker works fully offline after
// the first load. This is what makes it a "PWA" - installable on
// iOS home screen and usable with no internet.
//
// Strategy:
//   - On install: pre-cache the shell (index.html, manifest, icons)
//   - On fetch: try cache first, fall back to network, then offline page
//   - On activate: clean up old caches
// ============================================================

const CACHE_VERSION = 'wwww-mans-tracker-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// The "app shell" - the minimal set of files needed to show the app.
// We cache these on install so the app works offline immediately.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './logo.svg',
  './ios-splash/apple-touch-icon.png',
  './ios-splash/apple-touch-icon-180.png',
  './ios-splash/apple-touch-icon-120.png',
  './ios-splash/apple-touch-icon-152.png',
  './ios-splash/apple-touch-icon-167.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // Cache shell files - use addAll but tolerate failures for
      // individual files (some may not exist on all builds)
      return Promise.allSettled(
        APP_SHELL.map((url) => cache.add(url))
      );
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Skip cross-origin requests (e.g., Google Fonts)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // For navigation requests (loading index.html), use network-first
  // so users get the latest version when online, but fall back to cache.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Cache the latest index.html
          const resClone = res.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('./index.html', resClone));
          return res;
        })
        .catch(() => {
          // Offline - serve from cache
          return caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  // For other requests (JS, CSS, fonts, images), use cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Update cache in background (stale-while-revalidate)
        fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const resClone = res.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, resClone));
            }
          })
          .catch(() => {});
        return cached;
      }
      // Not in cache - try network, then cache fallback
      return fetch(req)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          const resClone = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req));
    })
  );
});

// Allow the page to trigger immediate update (skipWaiting)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================================
// PUSH event handler - receives pushes from the Netlify function
// and shows a notification even when the page/tab is closed.
// This is the heart of the server-side Web Push system.
// ============================================================

self.addEventListener('push', (event) => {
  let payload;
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'WWWW x MAN\'s reminder', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'WWWW x MAN\'s Tracker';
  const options = {
    body: payload.body || '',
    icon: payload.icon || './favicon.svg',
    badge: payload.badge || './favicon.svg',
    tag: payload.tag || 'wwww-mans-reminder',
    data: payload.data || { url: './' },
    requireInteraction: payload.requireInteraction || false,
    silent: payload.silent || false,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ============================================================
// notificationclick - open the tracker when the user taps the
// notification. Focuses an existing window if open, otherwise
// opens a new one.
// ============================================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './';
  const targetUrlStr = typeof targetUrl === 'string' ? targetUrl : './';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Look for a client that's already showing our app
      for (const client of clientList) {
        if (client.url && client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }
      // No existing window - open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrlStr);
      }
      return null;
    })
  );
});
