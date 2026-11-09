import React, { useEffect, useState } from 'react';

export interface LoaderProps {
  onFinish: () => void;
  isAppReady?: boolean;
}

export function Loader({ onFinish, isAppReady = true }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const minDuration = 600;
    const maxDuration = 2000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let pct = Math.min(100, (elapsed / maxDuration) * 100);

      // If app is ready, accelerate smoothly after minDuration
      if (isAppReady && elapsed >= minDuration) {
        pct = Math.max(pct, Math.min(100, ((elapsed - minDuration) / 400) * 100 + 50));
      }

      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(onFinish, 250);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isAppReady, onFinish]);

  const getStatusText = (pct: number) => {
    if (pct < 30) return 'Initializing HireFloo career intelligence engine...';
    if (pct < 70) return 'Synchronizing role benchmarks & taxonomy gates...';
    if (pct < 95) return 'Calibrating deterministic placement models...';
    return 'HireFloo Core Ready';
  };

  return (
    <div
      role="status"
      aria-label="Loading application"
      className={`fixed inset-0 z-[999999] bg-sp-canvas flex flex-col items-center justify-center p-6 select-none transition-opacity duration-250 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6 max-w-xs w-full text-center">
        {/* 56px Spruce Logo Mark with animated lime chevron */}
        <div className="w-14 h-14 rounded-sp-xs bg-sp-forest flex items-center justify-center shadow-sp-3 transition-transform duration-400 ease-out">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <path
              d="M8 7L17 14L8 21H13L21 14L13 7H8Z"
              fill="var(--sp-lime-hero)"
              className="transition-transform duration-400"
            />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="sp-h3 flex items-center gap-1 font-bold">
          <span className="text-sp-ink">Hire</span>
          <span className="text-sp-primary-text">Floo</span>
        </div>

        {/* 4px Determinate Progress Bar */}
        <div className="w-full max-w-[320px] flex flex-col gap-2">
          <div className="w-full h-1 rounded-full bg-sp-mint-200 overflow-hidden">
            <div
              className="h-full bg-sp-primary transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="sp-caption text-sp-muted font-medium">
            {getStatusText(progress)}
          </span>
        </div>
      </div>
    </div>
  );
}
