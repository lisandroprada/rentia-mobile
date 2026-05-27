import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function registerWithBackend(sub: PushSubscription) {
  const json = sub.toJSON();
  await apiClient.post('/push/subscribe', {
    endpoint: sub.endpoint,
    keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
  });
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  );

  useEffect(() => {
    if (typeof Notification !== 'undefined') setPermission(Notification.permission);
  }, []);

  const subscribe = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) return false;

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== 'granted') return false;

    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      await registerWithBackend(existing);
      return true;
    }

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
    await registerWithBackend(sub);
    return true;
  };

  return { permission, subscribe };
}
