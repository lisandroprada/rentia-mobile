import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 inset-x-4 z-50 flex items-center justify-between gap-3 bg-[#2e3192] text-white rounded-2xl px-4 py-3 shadow-lg">
      <p className="text-sm font-medium">Nueva versión disponible</p>
      <button
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 bg-white text-[#2e3192] text-sm font-semibold px-3 py-1.5 rounded-xl"
      >
        Actualizar
      </button>
    </div>
  );
}
