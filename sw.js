/* Service worker de FuncionarYo?: permite jugar sin conexión.
   Sube VERSION cada vez que publiques cambios para que los móviles se actualicen. */
const VERSION = 'funcionaryo-v4';
const FONTS = VERSION + '-fonts';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './privacidad.html',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (req.mode === 'navigate') {
      // Red primero para recibir actualizaciones; caché si no hay conexión
      e.respondWith(
        fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return r; })
          .catch(() => caches.match('./index.html'))
      );
      return;
    }
    e.respondWith(caches.match(req).then(m => m || fetch(req)));
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONTS).then(c => c.match(req).then(m => {
        const net = fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => m);
        return m || net;
      }))
    );
  }
});
