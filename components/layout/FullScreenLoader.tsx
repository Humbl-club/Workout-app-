import React from 'react';
import { LogoIcon } from '../icons';

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-stone-950 flex flex-col items-center justify-center z-50">
      <div className="absolute inset-0 bg-radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(160,140,220,0.2),rgba(255,255,255,0))"></div>
      <LogoIcon className="text-7xl text-stone-300" isLoading={true} />
      <p className="mt-4 text-stone-400 font-semibold">Loading your experience...</p>
    </div>
  );
}