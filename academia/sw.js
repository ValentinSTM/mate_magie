// Academia Bufniței: funcționează și fără internet după prima deschidere
const CACHE = 'academia-v2';
const FILES = ['./', 'index.html', 'manifest.json', 'manifest-da.json', 'icon.svg', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('academia-') && x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
// rețea întâi (ca să primești versiunile noi), cache dacă nu e internet
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
