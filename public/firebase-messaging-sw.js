// This file exists solely to unregister a stale Firebase service worker
// that was registered by a previous project on this origin (localhost:3000).
// Once the old service worker is removed, this file can be safely deleted.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.registration.unregister().then(() => {
    self.clients.matchAll({ type: 'window' }).then(clients => {
      clients.forEach(client => client.navigate(client.url));
    });
  });
});
