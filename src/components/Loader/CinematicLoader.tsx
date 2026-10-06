// ============================================================
// HireFlow — Celestial Falling Stars Intro Loader
// Pure black cosmic sky, falling stars cascade, iris reveal
// ============================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './CinematicLoader.css';

export const LOADER_MIN_MS = 2900;
const STATUS_MESSAGES = [
  'Traversing stellar talent database…',
  'Mapping skills to 75 enterprise constellations…',
  'Calibrating neural ATS engine…',
  'Cosmic workspace ready',
];

interface TwinkleStar {
  x: number; y: number; size: number;
  alpha: number; baseAlpha: number; speed: number;
  color: string;
}

interface FallingStar {
  x: number; y: number; length: number;
  speed: number; angle: number; thickness: number;
  color: string;
}

export interface CinematicLoaderProps {
  onFinish: () => void;
  isAppReady?: boolean;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);
  const [isExiting, setIsExiting] = useState(false);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const rafIdRef = useRef<number | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFinishedRef = useRef(false);
  const hasTriggeredExitRef = useRef(false);

  const finish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.add('hf-loaded');
    }
    onFinish();
  }, [onFinish]);

  // Viewport scroll safety & exit timer cleanup
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  // Hard safety watchdog — guarantees hand-off
  useEffect(() => {
    const watchdog = setTimeout(() => {
      finish();
    }, LOADER_MIN_MS + 800);
    return () => clearTimeout(watchdog);
  }, [finish]);

  // Keyboard shortcut to skip intro
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') finish();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [finish]);

  // Subtle Mouse Parallax
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const handleMove = (e: MouseEvent) => {
      setParallax({
        x: (e.clientX / window.innerWidth - 0.5) * 18,
        y: (e.clientY / window.innerHeight - 0.5) * 18,
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Canvas Falling Stars & Twinkling Cosmos Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const handleResize = () => {
      if (canvas) { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    };
    window.addEventListener('resize', handleResize);

    const starColors = ['#FFFFFF', '#38BDF8', '#818CF8', '#22D3EE', '#E0F2FE'];
    const meteorColors = ['#38BDF8', '#22D3EE', '#818CF8', '#A78BFA', '#FFFFFF'];

    // 140 Ambient Twinkling Cosmic Stars
    const twinkleStars: TwinkleStar[] = Array.from({ length: 140 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.7 + 0.2,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.04 + 0.015,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // 22 Cascading Falling Stars (Streaming down diagonally across the black sky)
    const createFallingStar = (initY = false): FallingStar => ({
      x: Math.random() * (w + 400) - 100,
      y: initY ? Math.random() * h : -Math.random() * 250 - 20,
      length: Math.random() * 110 + 60,
      speed: Math.random() * 9 + 8,
      angle: Math.PI * (0.62 + Math.random() * 0.1), // ~115° to 130° downward diagonal
      thickness: Math.random() * 1.8 + 1.2,
      color: meteorColors[Math.floor(Math.random() * meteorColors.length)],
    });

    const fallingStars: FallingStar[] = Array.from({ length: 22 }, () => createFallingStar(true));

    let active = true;
    let angleTick = 0;

    const render = () => {
      if (!active) return;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      angleTick += 0.05;

      // 1. Render Twinkling Stars
      for (const s of twinkleStars) {
        s.alpha = s.baseAlpha + Math.sin(angleTick * s.speed * 10) * 0.3;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render Falling Stars with Luminous Comet Trails
      for (let i = 0; i < fallingStars.length; i++) {
        const m = fallingStars[i];
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.2, m.color);
        grad.addColorStop(1, 'transparent');

        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing Starburst Head
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thickness * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Move falling star
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;

        // Respawn when off screen
        if (m.y > h + 150 || m.x < -150 || m.x > w + 200) {
          fallingStars[i] = createFallingStar(false);
        }
      }

      ctx.globalAlpha = 1;
      rafIdRef.current = requestAnimationFrame(render);
    };

    rafIdRef.current = requestAnimationFrame(render);
    return () => {
      active = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Progress Simulation & Status Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < 700) setStatusText(STATUS_MESSAGES[0]);
      else if (elapsed < 1500) setStatusText(STATUS_MESSAGES[1]);
      else if (elapsed < 2300) setStatusText(STATUS_MESSAGES[2]);
      else setStatusText(STATUS_MESSAGES[3]);

      let target = 0;
      if (elapsed < 600) target = (elapsed / 600) * 35;
      else if (elapsed < 2000) target = 35 + ((elapsed - 600) / 1400) * 52;
      else if (elapsed < LOADER_MIN_MS) target = 87 + ((elapsed - 2000) / (LOADER_MIN_MS - 2000)) * 13;
      else target = 100;

      setProgress((prev) => {
        if (prev >= 100 || elapsed >= LOADER_MIN_MS + 100) {
          clearInterval(interval);
          return 100;
        }
        const step = (target - prev) * 0.4;
        const next = prev + (Math.abs(step) < 0.25 ? (target > prev ? 0.25 : 0) : step);
        return Math.min(100, next);
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Safe Exit Trigger
  useEffect(() => {
    if (progress >= 100 && !hasTriggeredExitRef.current) {
      hasTriggeredExitRef.current = true;
      setIsExiting(true);
      setTriggerFlash(true);
      if (typeof document !== 'undefined') {
        document.body.classList.add('hf-loaded');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
      exitTimerRef.current = setTimeout(() => {
        finish();
      }, 520);
    }
  }, [progress, finish]);

  const wordmarkLetters = ['H', 'i', 'r', 'e', 'F', 'l', 'o', 'w'];

  return (
    <>
      <div className={`hf-flash-overlay ${triggerFlash ? 'hf-flash-trigger' : ''}`} />
      <div className={`hf-cinematic-loader ${isExiting ? 'hf-iris-exit' : ''}`}>
        <canvas ref={canvasRef} className="hf-particle-canvas" />

        {/* Skip button for immediate entry */}
        <button
          type="button"
          onClick={finish}
          className="hf-skip-btn"
          aria-label="Skip animation"
        >
          Skip ✕
        </button>

        <div className="hf-loader-stage" style={{ transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)` }}>
          <div className="hf-logo-aura" />
          <div className="hf-logo-box">
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-label="HireFlow Icon">
              <defs>
                <linearGradient id="hfLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <filter id="hfCyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <rect x="6" y="6" width="88" height="88" rx="22" ry="22" fill="url(#hfLogoGrad)" />
              <line x1="32" y1="25" x2="32" y2="75" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" className="hf-draw-stroke" />
              <line x1="68" y1="25" x2="68" y2="75" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" className="hf-draw-stroke" />
              <path d="M 32,50 C 40,38 44,38 50,50 C 56,62 60,62 68,50" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" fill="none" className="hf-draw-stroke" />
              <circle r="4" fill="#FFFFFF" filter="url(#hfCyanGlow)">
                <animateMotion path="M 32,50 C 40,38 44,38 50,50 C 56,62 60,62 68,50" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </svg>
            <div className="hf-logo-sheen" />
          </div>

          <div className="hf-wordmark-row">
            {wordmarkLetters.map((char, idx) => (
              <span key={idx} className="hf-letter" style={{ animationDelay: `${0.85 + idx * 0.04}s` }}>
                {char}
              </span>
            ))}
            <span className="hf-ai-text">AI</span>
          </div>

          <div className="hf-tagline">INTELLIGENT TALENT MATCHING</div>

          <div className="hf-progress-wrapper">
            <div className="hf-progress-bar-track">
              <div className="hf-progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }}>
                <div className="hf-progress-head" />
              </div>
            </div>
            <div className="hf-progress-meta">
              <span className="hf-status-ticker">{statusText}</span>
              <span className="hf-percent-counter">{Math.min(100, Math.floor(progress))}%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
