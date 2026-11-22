// Academia s-a mutat la /academia/ — acest service worker se dezinstalează singur.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.registration.unregister()));
