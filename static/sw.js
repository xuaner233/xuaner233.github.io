self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await caches.delete('main-precache-then-runtime');
    await self.registration.unregister();
    await self.clients.claim();
  })());
});
