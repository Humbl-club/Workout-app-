import React, { useState, useEffect } from 'react';
import { TrophyIcon } from './icons';

interface PRNotificationProps {
  message: string | null;
  onDismiss: () => void;
}

const PRNotification: React.FC<PRNotificationProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow time for fade out before full dismissal
        setTimeout(onDismiss, 500);
      }, 5000); // Show for 5 seconds

      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}
      `}
    >
      {message && (
        <div className="flex items-center gap-3 bg-stone-800/70 backdrop-blur-lg border border-yellow-500/50 rounded-full p-3 shadow-2xl">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <TrophyIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-sm font-semibold text-yellow-300 pr-2">{message}</p>
        </div>
      )}
    </div>
  );
};

export default PRNotification;
