const VERSION = "v1";
const CACHE_NAME = `cattube-${VERSION}`;

const APP_STATIC_RESOURCES = [
    "/",
    "/index.html",
    "/static/style.css",
    "/static/script.js",
    "/static/events.js",
    "/static/queueelement.js",
    "/static/android-launchericon--512-512.png",
];

self.addEventListener("install", e => {
    e.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES);
        })(),
    );
})

self.addEventListener("activate", e => {
    e.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                    return undefined;
                }),
            );
            await clients.claim();
        })(),
    );
})

self.addEventListener("fetch", e => {
    if (event.request.mode === "navigate") {
        event.respondWith(caches.match("/"));
        return;
    }

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request.url);
            if (cachedResponse) {
                return cachedResponse;
            }
            return new Response(null, { status: 404 });
        })(),
    );
})
