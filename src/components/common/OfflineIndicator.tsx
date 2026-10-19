import React from 'react';
import { useOnlineStatus } from '../../lib/pwa/registerServiceWorker';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full backdrop-blur-md flex items-center gap-2 shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span className="text-xs font-medium text-amber-200">
        Offline Mode — All tools work locally
      </span>
    </div>
  );
};
