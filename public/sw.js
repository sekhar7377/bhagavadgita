/*
 * Offline support for the carved wall.
 * - Pages: network first (always the latest), falling back to the cached
 *   copy, then to a small offline page.
 * - Built scripts/styles (hashed, never change) and carvings, paintings and
 *   fonts: cache first, filled as the visitor reads, so every scene already
 *   seen keeps working with no connection or with the server down.
 * Bump VERSION to drop old caches after a deploy that changes cached files
 * in place (hashed assets don't need it).
 */
const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const scope = new URL(self.registration.scope).pathname;
const OFFLINE = `${scope}offline.html`;
const SHELL = [
  scope,
  `${scope}hastinapura/`,
  `${scope}sabha/`,
  `${scope}vana/`,
  `${scope}kurukshetra/`,
  `${scope}svarga/`,
  OFFLINE,
  `${scope}favicon.svg`,
  `${scope}relief/plaster.webp`,
  `${scope}relief/noise.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== PAGES && key !== ASSETS)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Keep the asset cache from growing without bound (carvings are large).
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(scope))
    return;
  // Range requests (video) go straight to the network.
  if (request.headers.has("range")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(PAGES).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached =
            (await caches.match(request, { ignoreSearch: true })) ||
            (await caches.match(request.url.replace(/index\.html$/, "")));
          return cached || caches.match(OFFLINE);
        }),
    );
    return;
  }

  const cacheable =
    /\/(assets|relief|art|social)\//.test(url.pathname) ||
    /\.(woff2?|svg|webp|png|jpg)$/.test(url.pathname);
  if (!cacheable) return;
  // Hashed build files never change: cache first. Carvings and paintings
  // keep their names when they are redone, so serve the cached copy at once
  // and refresh it in the background (stale-while-revalidate).
  const hashed = /\/assets\//.test(url.pathname);
  event.respondWith(
    caches.open(ASSETS).then(async (cache) => {
      const cached = await cache.match(request);
      const refresh = fetch(request)
        .then((response) => {
          if (response.ok && response.status === 200)
            cache.put(request, response.clone()).then(() => trim(ASSETS, 400));
          return response;
        })
        .catch(() => cached);
      if (cached) {
        if (!hashed) event.waitUntil(refresh.then(() => undefined));
        return cached;
      }
      return refresh;
    }),
  );
});
