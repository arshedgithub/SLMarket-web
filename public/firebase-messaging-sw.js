// Handles FCM push only when the tab is closed/backgrounded. Foreground
// in-app toasts are driven separately by the live Firestore listener
// (see lib/messaging/client.ts) so the same event never fires twice.
//
// Everything below is wrapped in try/catch: if importScripts fails (e.g. an
// ad-blocker/privacy extension blocking the gstatic firebase-messaging
// script — a common false positive on tracker block lists) the service
// worker still installs successfully as a no-op instead of crashing with
// "ServiceWorker script evaluation failed". Background push just won't
// fire in that case; in-app messaging is unaffected either way.
try {
  importScripts(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
  );

  // Public web config values — safe to expose, passed via the registration
  // query string since this static file can't read NEXT_PUBLIC_* at build time.
  const params = new URLSearchParams(self.location.search);

  firebase.initializeApp({
    apiKey: params.get("apiKey"),
    authDomain: params.get("authDomain"),
    projectId: params.get("projectId"),
    storageBucket: params.get("storageBucket"),
    messagingSenderId: params.get("messagingSenderId"),
    appId: params.get("appId"),
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? "New notification";
    const body = payload.notification?.body ?? "";
    const link = payload.data?.link ?? "/messages";

    self.registration.showNotification(title, {
      body,
      icon: "/logo.png",
      data: { link },
    });
  });
} catch (err) {
  console.warn("[firebase-messaging-sw] background push unavailable:", err);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link ?? "/messages";
  event.waitUntil(self.clients.openWindow(link));
});
