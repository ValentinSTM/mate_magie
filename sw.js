// Mate-Magie: merge și fără internet (mod avion) după prima deschidere
const CACHE = 'mate-magie-v12';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('mate-magie-') && x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
const fromCache = req => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html').then(x => x || caches.match('./')) : undefined));
// rețea întâi (ca să vină versiunile noi), dar: fără internet, internet lent (>4 s)
// sau Wi-Fi de avion/hotel care cere logare → se folosește copia salvată pe telefon
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(new Promise(resolve => {
    let done = false;
    const fallback = () => { if (!done) { done = true; resolve(fromCache(req).then(r => r || fetch(req))); } };
    const timer = setTimeout(fallback, 4000);
    fetch(req).then(r => {
      if (r && r.ok && !r.redirected && r.type === 'basic') {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        clearTimeout(timer);
        if (!done) { done = true; resolve(r); }
      } else if (r && !r.redirected && r.status === 404) { clearTimeout(timer); if (!done) { done = true; resolve(r); } }
      else { clearTimeout(timer); fallback(); }
    }).catch(() => { clearTimeout(timer); fallback(); });
  }));
});
