import React, { useState, useEffect } from 'react';

/**
 * Fallback loader - only shows if user already dismissed splash
 * but returns to app and data needs to reload.
 * Uses brand colors: white + coral (#E07A5F)
 */
export default function FullScreenLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundColor: '#0E0E0F' }}
    >
      {/* Logo */}
      <div
        className="mb-8"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex items-center justify-center">
          <span className="text-[48px] font-black tracking-tight text-white">RE</span>
          <span className="text-[48px] font-black tracking-tight" style={{ color: '#E07A5F' }}>BLD</span>
        </div>
      </div>

      {/* Spinner */}
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 300ms ease-out 200ms',
        }}
      >
        <div className="relative w-9 h-9">
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid rgba(255,255,255,0.08)' }}
          />
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              stroke="#E07A5F"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="50 100"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
