const CACHE = 'tabkhet-alyom-v20';
const CORE = ['./','./index.html','./styles.css','./data.js','./source_recipes.js','./recipe_updates.js','./legacy_seed_catalog_v1.js','./app.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(async cache => {
    for (const path of CORE) {
      const response = await fetch(path, {cache:'reload'});
      if (!response.ok) throw new Error(`Failed to cache ${path}: ${response.status}`);
      await cache.put(path, response);
    }
  }));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, {cache:'no-store'});
      if (response.ok) await caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));
      return response;
    } catch (_) {
      const cached=await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode==='navigate') return caches.match('./index.html');
      return Response.error();
    }
  })());
});
