const CACHE_NAME = 'saman-bazargani-v210';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './manifest-default.webmanifest', './manifest-forest.webmanifest', './manifest-plum.webmanifest', './manifest-wine.webmanifest', './manifest-slate.webmanifest', './manifest-brown.webmanifest', './vendor/supabase-js-2.105.4.js', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-192.png', './icons/icon-maskable-512.png', './icons/icon-180.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => { const req = event.request; if (req.method !== 'GET') return; const url = new URL(req.url); if (url.origin !== self.location.origin) return; if (req.mode === 'navigate') { event.respondWith(fetch(req).then(res => { const copy=res.clone(); caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy)); return res; }).catch(() => caches.match('./index.html'))); return; } if (url.searchParams.has('__saman_update_check')) { event.respondWith(fetch(req)); return; } event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => { if(res.ok) { const copy=res.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(req,copy)); } return res; }))); });
// v210: دریافت Push واقعی (حتی وقتی برنامه بسته است) و نمایش اعلان گوشی.
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { try { data = { body: event.data && event.data.text() }; } catch (_) { data = {}; } }
  const title = (data && data.title) || 'یادآوری سامان';
  const options = {
    body: (data && data.body) || '',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    dir: 'rtl',
    lang: 'fa',
    tag: (data && data.tag) || 'saman-fund',
    renotify: false,
    data: { url: (data && data.url) || './' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
// v210: با زدن روی اعلان گوشی، برنامه باز/فوکوس می‌شود.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of list) { if ('focus' in client) { try { await client.focus(); return; } catch (e) {} } }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
