/* Only public offline assets are cached. Never cache authenticated pages or API responses. */
const CACHE = 'serpa-pwa-26.0.0';
const OFFLINE = '/pwa/offline.html';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([OFFLINE, '/pwa/icon-192.png'])));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('serpa-pwa-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (new URL(request.url).pathname === '/pwa/icon-192.png') { event.respondWith(fetch(request).catch(async () => (await caches.match(request)) || Response.error())); return; }
  if (new URL(request.url).pathname.startsWith('/api/') || request.method !== 'GET' || new URL(request.url).origin !== self.location.origin || request.mode !== 'navigate') return;
  event.respondWith(fetch(request).catch(async () => (await caches.match(OFFLINE)) || Response.error()));
});

self.addEventListener('push', event => {
 let data = {}; try { data = event.data?.json() || {}; } catch {}
 event.waitUntil(self.registration.showNotification('SERPA Operations HUB', {body: typeof data.body === 'string' ? data.body : 'Tienes un nuevo aviso.', icon:'/pwa/icon-192.png', data:{url:'/tasks'}}));
});
self.addEventListener('notificationclick', event => {
 event.notification.close();
 event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){if(new URL(client.url).origin===self.location.origin){await client.navigate('/tasks');return client.focus();}}return self.clients.openWindow('/tasks');})());
});
