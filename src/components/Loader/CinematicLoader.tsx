// ============================================================
// HireFlow — Cinematic Movie-Grade Loader Component
// 3-second anamorphic intro, self-drawing mark, iris reveal
// ============================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './CinematicLoader.css';

export const LOADER_MIN_MS = 3000;
const STATUS_MESSAGES = [
  'Parsing resumes…',
  'Mapping skills to 75 companies…',
  'Calibrating ATS engine…',
  'Workspace ready',
];

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; alpha: number;
}

export interface CinematicLoaderProps {
  onFinish: () => void;
  isAppReady?: boolean;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({
  onFinish,
  isAppReady = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);
  const [isExiting, setIsExiting] = useState(false);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const rafIdRef = useRef<number | null>(null);

  const shouldSkip = useCallback(() => {
    if (typeof window === 'undefined') return false;
    if (window.location.search.includes('loader=1')) return false;
    return !!sessionStorage.getItem('hireflow_intro_seen');
  }, []);

  useEffect(() => {
    if (shouldSkip()) { onFinish(); return; }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [onFinish, shouldSkip]);

  // Subtle Mouse Parallax (desktop only)
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const handleMove = (e: MouseEvent) => {
      setParallax({
        x: (e.clientX / window.innerWidth - 0.5) * 24,
        y: (e.clientY / window.innerHeight - 0.5) * 24,
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Canvas Particle Field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const handleResize = () => { if (canvas) { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; } };
    window.addEventListener('resize', handleResize);

    const colors = ['#22D3EE', '#38BDF8', '#818CF8', '#C084FC', '#FFFFFF'];
    const particles: Particle[] = Array.from({ length: 120 }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = Math.max(w, h) * (0.35 + Math.random() * 0.3);
      return {
        x: w / 2 + Math.cos(a) * r, y: h / 2 + Math.sin(a) * r,
        vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.3,
      };
    });

    let active = true;
    const targetX = w / 2;
    const targetY = h / 2 - 36;

    const render = () => {
      if (!active) return;
      ctx.clearRect(0, 0, w, h);
      const elapsed = Date.now() - startTimeRef.current;
      const pull = elapsed > 300 ? Math.min(1, (elapsed - 300) / 900) : 0;

      for (const p of particles) {
        if (pull > 0) {
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > 8) {
            p.vx += (dx / d) * 0.45 * pull;
            p.vy += (dy / d) * 0.45 * pull;
            p.vx *= 0.94; p.vy *= 0.94;
          } else { p.alpha *= 0.92; }
        }
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (elapsed < 2400) rafIdRef.current = requestAnimationFrame(render);
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
    if (shouldSkip()) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < 700) setStatusText(STATUS_MESSAGES[0]);
      else if (elapsed < 1500) setStatusText(STATUS_MESSAGES[1]);
      else if (elapsed < 2400) setStatusText(STATUS_MESSAGES[2]);
      else setStatusText(STATUS_MESSAGES[3]);

      let target = 0;
      if (elapsed < 600) target = (elapsed / 600) * 35;
      else if (elapsed < 2200) target = 35 + ((elapsed - 600) / 1600) * 52;
      else if (elapsed < LOADER_MIN_MS) target = 87 + ((elapsed - 2200) / (LOADER_MIN_MS - 2200)) * 12;
      else if (isAppReady) target = 100;

      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        const step = (target - prev) * 0.35;
        const next = prev + (Math.abs(step) < 0.2 ? (target > prev ? 0.2 : 0) : step);
        return Math.min(100, next);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isAppReady, shouldSkip]);

  // Trigger Exit and Iris Hand-off
  useEffect(() => {
    if (progress >= 100 && !isExiting) {
      setIsExiting(true);
      setTriggerFlash(true);
      document.body.classList.add('hf-loaded');
      const timer = setTimeout(() => {
        sessionStorage.setItem('hireflow_intro_seen', 'true');
        document.body.style.overflow = '';
        onFinish();
      }, 620);
      return () => clearTimeout(timer);
    }
  }, [progress, isExiting, onFinish]);

  if (shouldSkip()) return null;
  const wordmarkLetters = ['H', 'i', 'r', 'e', 'F', 'l', 'o', 'w'];

  return (
    <>
      <div className={`hf-flash-overlay ${triggerFlash ? 'hf-flash-trigger' : ''}`} />
      <div className={`hf-cinematic-loader ${isExiting ? 'hf-iris-exit' : ''}`}>
        <div className="hf-film-grain" />
        <div className="hf-anamorphic-streak" />
        <canvas ref={canvasRef} className="hf-particle-canvas" />

        <div className="hf-loader-stage" style={{ transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)` }}>
          <div className="hf-logo-aura" />
          <div className="hf-logo-box">
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-label="HireFlow Icon">
              <defs>
                <linearGradient id="hfLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
                <filter id="hfCyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <rect x="6" y="6" width="88" height="88" rx="20" ry="20" fill="url(#hfLogoGrad)" />
              <line x1="32" y1="25" x2="32" y2="75" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" className="hf-draw-stroke" />
              <line x1="68" y1="25" x2="68" y2="75" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" className="hf-draw-stroke" />
              <path d="M 32,50 C 40,38 44,38 50,50 C 56,62 60,62 68,50" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" fill="none" className="hf-draw-stroke" />
              <circle r="3.5" fill="#22D3EE" filter="url(#hfCyanGlow)">
                <animateMotion path="M 32,50 C 40,38 44,38 50,50 C 56,62 60,62 68,50" dur="1.7s" repeatCount="indefinite" />
              </circle>
            </svg>
            <div className="hf-logo-sheen" />
          </div>

          <div className="hf-wordmark-row">
            {wordmarkLetters.map((char, idx) => (
              <span key={idx} className="hf-letter" style={{ animationDelay: `${1.15 + idx * 0.04}s` }}>
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
