// Service worker mínimo, solo para que el navegador ofrezca "Instalar app".
// A propósito NO cachea nada de /api/ ni el HTML, para evitar que alguien
// vea datos viejos del sitio o del panel de administración.
const CACHE = "sansley-static-v1";

self.addEventListener("install", (evento) => {
    self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches.keys().then((nombres) =>
            Promise.all(
                nombres
                    .filter((nombre) => nombre !== CACHE)
                    .map((nombre) => caches.delete(nombre))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
    const url = new URL(evento.request.url);

    // Solo actuamos sobre peticiones GET de nuestro propio dominio
    if (evento.request.method !== "GET" || url.origin !== self.location.origin) {
        return;
    }

    // Nunca cachear la API ni las páginas HTML: siempre deben venir frescas
    if (url.pathname.startsWith("/api/") || evento.request.mode === "navigate") {
        return;
    }

    // Archivos estáticos generados por Vite (JS, CSS, imágenes con hash):
    // se sirven de la caché primero, y se actualizan en segundo plano
    evento.respondWith(
        caches.open(CACHE).then((cache) =>
            cache.match(evento.request).then((respuestaCache) => {
                const descarga = fetch(evento.request)
                    .then((respuestaRed) => {
                        cache.put(evento.request, respuestaRed.clone());
                        return respuestaRed;
                    })
                    .catch(() => respuestaCache);
                return respuestaCache || descarga;
            })
        )
    );
});
