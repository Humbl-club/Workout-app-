import React, { useEffect, useRef, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

export interface ToastEventDetail {
  type: ToastType;
  message: string;
}

const TOAST_EVENT = 'rebld:toast';

export function notify(detail: ToastEventDetail) {
  const event = new CustomEvent<ToastEventDetail>(TOAST_EVENT, { detail });
  window.dispatchEvent(event);
}

interface ToastItem extends ToastEventDetail { id: number }

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ToastEventDetail>;
      const id = ++idRef.current;
      const toast: ToastItem = { id, ...ce.detail };
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3500);
    };
    window.addEventListener(TOAST_EVENT, handler as EventListener);
    return () => window.removeEventListener(TOAST_EVENT, handler as EventListener);
  }, []);

  const color = (t: ToastType) => {
    switch (t) {
      case 'success': return 'bg-green-600/90 border-green-400/40';
      case 'error': return 'bg-red-600/90 border-red-400/40';
      default: return 'bg-stone-700/90 border-stone-500/40';
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-3 text-sm font-semibold text-white border rounded-xl shadow-lg ${color(t.type)} animate-fade-in`}
          role="status"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

