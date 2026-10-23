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
      className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 bg-near-black border border-charcoal rounded-full flex items-center gap-2 shadow-level-3 select-none"
    >
      <WifiOff className="w-3.5 h-3.5 text-pale-yellow stroke-[1.5px]" />
      <span className="text-xs font-semibold uppercase tracking-[1.2px] text-pale-yellow">
        Offline Mode — All tools work locally
      </span>
    </div>
  );
};
