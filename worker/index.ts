export {};
// Configuration pour ne pas polluer la console Dev
const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis & { __WB_DISABLE_DEV_LOGS: boolean };
sw.__WB_DISABLE_DEV_LOGS = true;

// Web Push Events
sw.addEventListener('push', (event: PushEvent) => {
  let payload: { title?: string; message?: string; url?: string } = {};
  
  try {
    if (event.data) {
      const text = event.data.text();
      // Tenter d'analyser comme du JSON si le format y ressemble
      if (text.trim().startsWith('{')) {
        payload = JSON.parse(text);
      } else {
        payload = { title: "Notification", message: text };
      }
    }
  } catch (error) {
    console.error("Erreur lors du traitement des données push:", error);
    payload = { title: "Nouvelle notification", message: "Vous avez reçu une notification sur WizzPadel." };
  }

  const title = payload.title || "Nouvelle notification";
  const body = payload.message || "";
  const url = payload.url || "/";
  
  event.waitUntil(
    sw.registration.showNotification(title, {
      body: body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: {
          url: url
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
