import { useEffect, useState } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export default function PushNotificationsSetup() {
  const { permission, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (permission === 'granted') {
      subscribe().catch(() => null);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (dismissed || permission !== 'default') return null;
  if (!('Notification' in window) || !('PushManager' in window)) return null;

  return (
    <div className="fixed bottom-20 inset-x-4 z-40 flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg">
      <p className="text-sm text-gray-700 font-medium">¿Recibir avisos de mensajes?</p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => subscribe().catch(() => null)}
          className="bg-[#2e3192] text-white text-sm font-semibold px-3 py-1.5 rounded-xl"
        >
          Sí
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 text-sm px-2 py-1.5"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
