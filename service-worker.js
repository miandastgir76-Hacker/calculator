/* ==========================================================================
   Personal Shield Premium Calculator — Service Worker
   Provides offline support via a cache-first strategy for static assets
   and a network-first strategy for API calls (with a graceful offline
   fallback message for calculation requests made while offline).
   ========================================================================== */

const CACHE_VERSION = "personal-shield-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const PRECACHE_URLS = [
  "/",
  "/static/css/style.css",
  "/static/js/script.js",
  "/manifest.json",
  "/static/icons/icon-72.png",
  "/static/icons/icon-96.png",
  "/static/icons/icon-128.png",
  "/static/icons/icon-144.png",
  "/static/icons/icon-152.png",
  "/static/icons/icon-192.png",
  "/static/icons/icon-384.png",
  "/static/icons/icon-512.png",
  "/static/icons/icon-maskable-512.png",
  "/static/icons/apple-touch-icon.png",
];

/* ---------------------------------------------------------------------
   Install: pre-cache the app shell
   --------------------------------------------------------------------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ---------------------------------------------------------------------
   Activate: clean up old cache versions
   --------------------------------------------------------------------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("personal-shield-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------------------------------------------------------------------
   Fetch strategy:
   - Navigation / static assets: cache-first, falling back to network,
     then falling back to the cached app shell for offline navigation.
   - API requests (/api/*): network-first, since premium data must be
     fresh; if offline, calculation requests fail gracefully and the
     frontend surfaces a toast notification.
   --------------------------------------------------------------------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return; // Let POST (calculate/export) hit network directly

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: "You appear to be offline. Please reconnect and try again." }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        )
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && request.url.startsWith(self.location.origin)) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          return undefined;
        });
    })
  );
});
