// Service worker minimal : pré-cache l'app-shell pour l'installabilité + un
// chargement rapide. Stratégie cache-first sur les GET same-origin, réseau
// pour le reste (notamment les appels API cross-origin vers vineye-api).
const CACHE = 'vineye-shell-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/manifest.json'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return; // laisse passer les requêtes API cross-origin / non-GET
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});
