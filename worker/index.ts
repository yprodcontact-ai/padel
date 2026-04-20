export {};
// Configuration pour ne pas polluer la console Dev
const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis & { __WB_DISABLE_DEV_LOGS: boolean };
sw.__WB_DISABLE_DEV_LOGS = true;

// Web Push Events
sw.addEventListener('push', (event: PushEvent) => {
  const data = JSON.parse(event.data?.text() || '{}');
  
  event.waitUntil(
    sw.registration.showNotification(data.title || "Nouvelle notification", {
      body: data.message || "",
      icon: '/icons/icon-192x192.png',
      data: {
          url: data.url || '/'
      }
    })
  );
});

// Notification Click Event
sw.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // Option 1 : Déjà ouvert et correspondance exacte
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Option 2 : Rediriger le premier onglet disponible
      if (clientList.length > 0) {
          const client = clientList[0];
          if ('navigate' in client) {
              client.navigate(urlToOpen);
          }
          return client.focus();
      }
      
      // Option 3 : Aucune fenêtre, ouvrir une nouvelle
      if (sw.clients.openWindow) {
        return sw.clients.openWindow(urlToOpen);
      }
    })
  );
});
