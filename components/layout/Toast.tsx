import React, { useEffect, useRef, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from '../icons';
import { cn } from '../../lib/utils';

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

const ToastIcon = ({ type }: { type: ToastType }) => {
  const iconClass = "w-5 h-5 flex-shrink-0";
  switch (type) {
    case 'success':
      return <CheckCircleIcon className={iconClass} />;
    case 'error':
      return <XCircleIcon className={iconClass} />;
    case 'info':
      return <SparklesIcon className={iconClass} />;
  }
};

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

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-[var(--success)]/95 border-[var(--success)]/40 text-white';
      case 'error':
        return 'bg-[var(--error)]/95 border-[var(--error)]/40 text-white';
      case 'info':
        return 'bg-[var(--surface)]/95 border-[var(--border-card)] text-[var(--text-primary)] backdrop-blur-xl';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] w-full max-w-sm px-4 space-y-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto",
            "px-4 py-3 rounded-xl shadow-elevated border",
            "animate-slide-in-right",
            getToastStyles(toast.type)
          )}
          style={{
            animationDelay: `${index * 50}ms`
          }}
          role="status"
        >
          <div className="flex items-center gap-3">
            <ToastIcon type={toast.type} />
            <p className="text-[14px] font-semibold flex-1 leading-snug">
              {toast.message}
            </p>
            {/* Auto-dismiss progress indicator */}
            <div className="flex-shrink-0 relative w-5 h-5">
              <svg className="absolute inset-0 -rotate-90">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  className="opacity-20"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 8}`}
                  strokeDashoffset="0"
                  className="transition-all duration-[3500ms] linear"
                  style={{
                    strokeDashoffset: `${2 * Math.PI * 8}`,
                    transitionProperty: 'stroke-dashoffset'
                  }}
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

