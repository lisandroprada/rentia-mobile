import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.pathname === '/api/v1/crm/cases',
  new StaleWhileRevalidate({
    cacheName: 'crm-cases',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 3600 })],
  }),
);

registerRoute(
  ({ url }) => url.pathname === '/whatsapp-inbox/conversations',
  new StaleWhileRevalidate({
    cacheName: 'wa-conversations',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 300 })],
  }),
);

registerRoute(
  ({ url }) => /^\/(api\/v1|whatsapp-inbox|push)\//.test(url.pathname),
  new NetworkOnly(),
);

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json() as { title: string; body: string; data?: Record<string, string> };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'wa-message',
      renotify: true,
      data: data.data,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        if (clients.length > 0) return clients[0].focus();
        return self.clients.openWindow('/');
      }),
  );
});
