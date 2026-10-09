/* Service worker: la app abre y funciona sin señal. Los datos viven en IndexedDB,
   este archivo solo guarda la "cáscara" (HTML, estilos y código). */
var VERSION = 'finanzas-8312c9d972';
var ARCHIVOS = ["./", "index.html", "estilos.css", "motor.js", "datos.js", "voz.js", "ia.js", "app.js", "manifest.webmanifest", "icono.svg", "icono-180.png", "icono-192.png", "icono-512.png"];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION && k.indexOf('finanzas-') === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  // respaldo, cotizaciones y modelos de IA van directo a la red
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (r) {
      return r || fetch(e.request).then(function (resp) {
        if (resp && resp.ok) { var copia = resp.clone(); caches.open(VERSION).then(function (c) { c.put(e.request, copia); }); }
        return resp;
      });
    }).catch(function () { return caches.match('index.html'); })
  );
});
