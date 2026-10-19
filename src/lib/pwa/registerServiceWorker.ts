import { useEffect, useState, useCallback } from 'react';

let swRegistration: ServiceWorkerRegistration | null = null;
let updateCallback: (() => void) | null = null;

export function registerServiceWorker(onUpdate?: () => void): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  // Gracefully degrade over plain HTTP or insecure context (P-13)
  if (!window.isSecureContext) {
    console.info('[HireFlow PWA] Insecure context detected; service worker skipped.');
    return;
  }

  // Only register service worker in production to avoid intercepting dev HMR
  if (!import.meta.env.PROD) {
    return;
  }

  if (onUpdate) {
    updateCallback = onUpdate;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        swRegistration = reg;

        // If an updated worker is already waiting, trigger update immediately
        if (reg.waiting) {
          if (updateCallback) updateCallback();
          window.dispatchEvent(new CustomEvent('hireflow:sw-update'));
          return;
        }

        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (updateCallback) updateCallback();
              window.dispatchEvent(new CustomEvent('hireflow:sw-update'));
            }
          });
        });
      })
      .catch((err) => {
        console.warn('[HireFlow PWA] Service worker registration error:', err);
      });
  });
}

export function applyServiceWorkerUpdate(): void {
  if (typeof window === 'undefined' || !navigator.serviceWorker) return;

  if (swRegistration && swRegistration.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('hireflow:sw-update', handleUpdate);
    return () => {
      window.removeEventListener('hireflow:sw-update', handleUpdate);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    applyServiceWorkerUpdate();
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return { updateAvailable, applyUpdate, dismissUpdate };
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
