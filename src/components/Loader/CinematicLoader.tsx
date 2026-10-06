// ============================================================
// HireFlow — Cinematic Neural Talent Network Intro Loader
// Bespoke movement animation: Neural talent mesh, synaptic pulses,
// central talent gravitational flow, and authentic branding.
// NO falling stars — strictly neural talent network & flow waves.
// ============================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './CinematicLoader.css';

const LOADER_MIN_MS = 2900;

const STATUS_MESSAGES = [
  'Initializing neural talent architecture…',
  'Mapping candidate skills to 75,000+ constellations…',
  'Calibrating real-time ATS intelligence…',
  'Workspace ready',
];

interface TalentNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  pulsePhase: number;
}

interface SignalPulse {
  sourceIdx: number;
  targetIdx: number;
  progress: number;
  speed: number;
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
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

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
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
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
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [finish]);

  // Mouse Parallax & Cursor tracking
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const handleMove = (e: MouseEvent) => {
      setParallax({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleLeave = () => {
      mousePosRef.current = null;
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseleave', handleLeave);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  // ============================================================
  // Canvas Engine: Neural Talent Mesh & Fluid Synapse Waves
  // NO falling stars — strictly intelligent talent network movement
  // ============================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const handleResize = () => {
      if (canvas) {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#22D3EE', '#38BDF8', '#818CF8', '#A78BFA', '#FFFFFF'];

    // 95 Talent Entity Nodes distributed across the screen
    const NUM_NODES = Math.min(100, Math.floor((w * h) / 9500) + 40);
    const nodes: TalentNode[] = Array.from({ length: NUM_NODES }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.max(w, h) * 0.45 + 50;
      return {
        x: w / 2 + Math.cos(angle) * dist,
        y: h / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 1.1,
        vy: (Math.random() - 0.5) * 1.1,
        radius: Math.random() * 1.8 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.35,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    // Active Synaptic Signal Pulses travelling between nodes
    const pulses: SignalPulse[] = [];
    const spawnPulse = () => {
      if (nodes.length < 2 || pulses.length >= 14) return;
      const s = Math.floor(Math.random() * nodes.length);
      // Find nearest neighbor to send pulse
      let nearestIdx = -1;
      let minD = 120;
      for (let j = 0; j < nodes.length; j++) {
        if (j === s) continue;
        const d = Math.hypot(nodes[s].x - nodes[j].x, nodes[s].y - nodes[j].y);
        if (d < minD) {
          minD = d;
          nearestIdx = j;
        }
      }
      if (nearestIdx !== -1) {
        pulses.push({
          sourceIdx: s,
          targetIdx: nearestIdx,
          progress: 0,
          speed: Math.random() * 0.04 + 0.02,
        });
      }
    };

    let active = true;
    let waveTick = 0;
    const targetX = w / 2;
    const targetY = h / 2 - 36;

    const render = () => {
      if (!active) return;
      ctx.clearRect(0, 0, w, h);
      waveTick += 0.02;

      const elapsed = Date.now() - startTimeRef.current;
      // Gentle gravitational talent pull after 400ms
      const pull = elapsed > 400 ? Math.min(1, (elapsed - 400) / 1400) : 0;

      // ------------------------------------------------------------
      // 1. Fluid Background Harmonic Waves (HireFlow Signature Flow)
      // ------------------------------------------------------------
      ctx.save();
      ctx.lineWidth = 1.5;

      // Primary cyan wave
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.06)';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 15) {
        const y = h * 0.52 + Math.sin(x * 0.004 + waveTick) * 32 + Math.cos(x * 0.008 + waveTick * 0.8) * 16;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary violet wave
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.05)';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 15) {
        const y = h * 0.48 + Math.sin(x * 0.005 - waveTick * 0.7) * 28 + Math.sin(x * 0.01 + waveTick * 0.5) * 14;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // ------------------------------------------------------------
      // 2. Update and Draw Nodes
      // ------------------------------------------------------------
      const mouse = mousePosRef.current;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Central gravitational talent convergence
        if (pull > 0) {
          const dx = targetX - n.x;
          const dy = targetY - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 18) {
            n.vx += (dx / dist) * 0.38 * pull;
            n.vy += (dy / dist) * 0.38 * pull;
            n.vx *= 0.95;
            n.vy *= 0.95;
          } else {
            // Re-spawn node at outer radius once converged
            const a = Math.random() * Math.PI * 2;
            const r = Math.max(w, h) * (0.35 + Math.random() * 0.25);
            n.x = targetX + Math.cos(a) * r;
            n.y = targetY + Math.sin(a) * r;
            n.vx = (Math.random() - 0.5) * 1.2;
            n.vy = (Math.random() - 0.5) * 1.2;
          }
        }

        // Mouse gentle displacement
        if (mouse) {
          const mdx = n.x - mouse.x;
          const mdy = n.y - mouse.y;
          const mDist = Math.hypot(mdx, mdy);
          if (mDist < 110 && mDist > 0) {
            const force = (1 - mDist / 110) * 0.8;
            n.vx += (mdx / mDist) * force;
            n.vy += (mdy / mDist) * force;
          }
        }

        n.x += n.vx;
        n.y += n.vy;

        // Boundary wrap
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;

        // Draw node
        const pulse = Math.sin(waveTick * 2 + n.pulsePhase) * 0.2 + 0.8;
        ctx.fillStyle = n.color;
        ctx.globalAlpha = Math.max(0.15, Math.min(0.9, n.alpha * pulse));
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ------------------------------------------------------------
      // 3. Synaptic Neural Connections
      // ------------------------------------------------------------
      ctx.lineWidth = 0.85;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 105) {
            const lineAlpha = (1 - dist / 105) * 0.22;
            ctx.strokeStyle = '#38BDF8';
            ctx.globalAlpha = lineAlpha;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // ------------------------------------------------------------
      // 4. Active Synaptic Signal Pulses (Talent Matches)
      // ------------------------------------------------------------
      if (Math.random() < 0.25) spawnPulse();

      for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
        const p = pulses[pIdx];
        p.progress += p.speed;

        if (p.progress >= 1 || p.sourceIdx >= nodes.length || p.targetIdx >= nodes.length) {
          pulses.splice(pIdx, 1);
          continue;
        }

        const sNode = nodes[p.sourceIdx];
        const tNode = nodes[p.targetIdx];
        const px = sNode.x + (tNode.x - sNode.x) * p.progress;
        const py = sNode.y + (tNode.y - sNode.y) * p.progress;

        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22D3EE';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
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

  // Deterministic Progress Simulation & Status Ticker
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
      {/* Flash overlay during transition */}
      <div className={`hf-flash-overlay ${triggerFlash ? 'hf-flash-trigger' : ''}`} />

      {/* Main Fullscreen Cinematic Loader */}
      <div className={`hf-cinematic-loader ${isExiting ? 'hf-iris-exit' : ''}`}>
        <div className="hf-film-grain" />
        <div className="hf-anamorphic-streak" />

        {/* Neural Talent Network Canvas */}
        <canvas ref={canvasRef} className="hf-particle-canvas" />

        {/* Clean Skip Button */}
        <button
          type="button"
          onClick={finish}
          className="hf-skip-btn"
          aria-label="Skip animation"
        >
          <span>Skip ✕</span>
          <span className="hf-skip-kbd">ESC</span>
        </button>

        {/* Stage Container */}
        <div
          className="hf-loader-stage"
          style={{ transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)` }}
        >
          {/* Authentic HireFlow Brand Logo */}
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
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect x="6" y="6" width="88" height="88" rx="20" ry="20" fill="url(#hfLogoGrad)" />
              <line
                x1="32"
                y1="25"
                x2="32"
                y2="75"
                stroke="#FFFFFF"
                strokeWidth="8"
                strokeLinecap="round"
                className="hf-draw-stroke"
              />
              <line
                x1="68"
                y1="25"
                x2="68"
                y2="75"
                stroke="#FFFFFF"
                strokeWidth="8"
                strokeLinecap="round"
                className="hf-draw-stroke"
              />
              <path
                d="M 32,50 C 40,38 44,38 50,50 C 56,62 60,62 68,50"
                stroke="#FFFFFF"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                className="hf-draw-stroke"
              />
              <circle r="3.5" fill="#22D3EE" filter="url(#hfCyanGlow)">
                <animateMotion
                  path="M 32,50 C 40,38 44,38 50,50 C 56,62 60,62 68,50"
                  dur="1.7s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <div className="hf-logo-sheen" />
          </div>

          {/* Wordmark: "HireFlow AI" — NO rectangle box around AI */}
          <div className="hf-wordmark-row">
            {wordmarkLetters.map((char, idx) => (
              <span
                key={idx}
                className="hf-letter"
                style={{ animationDelay: `${0.95 + idx * 0.04}s` }}
              >
                {char}
              </span>
            ))}
            <span className="hf-ai-text">AI</span>
          </div>

          {/* Clean Subtitle Tagline */}
          <div className="hf-tagline">INTELLIGENT TALENT MATCHING</div>

          {/* Progress Bar & Telemetry */}
          <div className="hf-progress-wrapper">
            <div className="hf-progress-bar-track">
              <div
                className="hf-progress-bar-fill"
                style={{ width: `${Math.min(100, progress)}%` }}
              >
                <div className="hf-progress-head" />
              </div>
            </div>
            <div className="hf-progress-meta">
              <span className="hf-status-ticker">{statusText}</span>
              <span className="hf-percent-counter">
                {Math.min(100, Math.floor(progress))}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
