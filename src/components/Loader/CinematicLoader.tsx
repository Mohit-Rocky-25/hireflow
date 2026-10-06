// ============================================================
// HireFlow — World-Class Celestial Hyperspace Intro Loader
// Pure black cosmic void (#000000), 3D warp starfield, falling
// stars cascade, quantum reactor emblem & sci-fi telemetry HUD
// ============================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './CinematicLoader.css';

const TOTAL_LOADER_MS = 2950;

const PHASES = [
  { threshold: 0, text: 'INITIALIZING DEEP-SPACE TALENT SINGULARITY…', label: 'PHASE 01' },
  { threshold: 28, text: 'TRAVERSING 75,000+ ENTERPRISE CONSTELLATIONS…', label: 'PHASE 02' },
  { threshold: 62, text: 'CALIBRATING REAL-TIME QUANTUM ATS MATRICES…', label: 'PHASE 03' },
  { threshold: 88, text: 'ORBITAL MATCHING READY // ENGAGING HYPERDRIVE…', label: 'PHASE 04' },
];

interface Star3D {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  baseSize: number;
  color: string;
  twinklePhase: number;
  twinkleSpeed: number;
  hasFlare: boolean;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  thickness: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export interface CinematicLoaderProps {
  onFinish: () => void;
  isAppReady?: boolean;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(PHASES[0]);
  const [isExiting, setIsExiting] = useState(false);
  const [isSupernova, setIsSupernova] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const rafIdRef = useRef<number | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFinishedRef = useRef(false);
  const hasTriggeredExitRef = useRef(false);

  // Safe finish callback
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

  // Hard safety watchdog — guarantees app entry even on low-end devices
  useEffect(() => {
    const watchdog = setTimeout(() => {
      finish();
    }, TOTAL_LOADER_MS + 900);
    return () => clearTimeout(watchdog);
  }, [finish]);

  // Keyboard shortcut: Escape or Space skips immediately
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [finish]);

  // Mouse interaction & 3D tilt tracking
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      setMousePos({ x: e.clientX, y: e.clientY });
      setTilt({ rx: -dy * 14, ry: dx * 14 });
    };
    const handleMouseLeave = () => {
      setMousePos(null);
      setTilt({ rx: 0, ry: 0 });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // ============================================================
  // Canvas Celestial Engine: 3D Warp Starfield, Meteors & Nebula
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

    const starPalettes = ['#FFFFFF', '#00F2FE', '#A5F3FC', '#C084FC', '#FDE68A', '#F472B6'];
    const meteorPalettes = ['#00F2FE', '#38BDF8', '#818CF8', '#A855F7', '#FF007F', '#FFFFFF'];

    // 1. 320 3D Warp Stars
    const NUM_STARS = Math.min(320, Math.floor((w * h) / 3800));
    const stars: Star3D[] = Array.from({ length: NUM_STARS }, () => ({
      x: (Math.random() - 0.5) * 2400,
      y: (Math.random() - 0.5) * 2400,
      z: Math.random() * 1100 + 50,
      prevZ: 1000,
      baseSize: Math.random() * 1.8 + 0.8,
      color: starPalettes[Math.floor(Math.random() * starPalettes.length)],
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.05 + 0.02,
      hasFlare: Math.random() < 0.12, // 12% have celestial diffraction cross
    }));

    // 2. Cascading Meteors (Falling Stars)
    const createMeteor = (initialY = false): Meteor => ({
      x: Math.random() * (w + 500) - 150,
      y: initialY ? Math.random() * h : -Math.random() * 300 - 40,
      length: Math.random() * 130 + 75,
      speed: Math.random() * 11 + 9,
      angle: Math.PI * (0.64 + (Math.random() - 0.5) * 0.08), // ~115° to 125° downward diagonal
      thickness: Math.random() * 2 + 1.2,
      color: meteorPalettes[Math.floor(Math.random() * meteorPalettes.length)],
    });

    const meteors: Meteor[] = Array.from({ length: 24 }, () => createMeteor(true));
    const sparks: Spark[] = [];

    let active = true;
    let tick = 0;

    const render = () => {
      if (!active) return;
      tick++;

      // Pure deep space black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const elapsed = Date.now() - startTimeRef.current;
      const progressFraction = Math.min(1, elapsed / TOTAL_LOADER_MS);

      // Warp speed acceleration factor near climax
      const warpFactor = progressFraction > 0.88 ? Math.pow((progressFraction - 0.88) / 0.12, 2.5) * 28 : 0;
      const starSpeed = 1.3 + warpFactor;

      // ------------------------------------------------------------
      // A. Volumetric Deep-Space Nebula Dust
      // ------------------------------------------------------------
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Cyan nebula (top-left drifting)
      const grad1 = ctx.createRadialGradient(cx * 0.4 + Math.sin(tick * 0.01) * 30, cy * 0.4, 20, cx * 0.4, cy * 0.4, 380);
      grad1.addColorStop(0, 'rgba(0, 242, 254, 0.07)');
      grad1.addColorStop(0.5, 'rgba(14, 165, 233, 0.03)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      // Cosmic Violet nebula (bottom-right)
      const grad2 = ctx.createRadialGradient(cx * 1.5 + Math.cos(tick * 0.012) * 40, cy * 1.4, 20, cx * 1.5, cy * 1.4, 420);
      grad2.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
      grad2.addColorStop(0.6, 'rgba(236, 72, 153, 0.025)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();

      // ------------------------------------------------------------
      // B. 3D Warp Starfield Rendering
      // ------------------------------------------------------------
      const fov = 420;
      const projectedStars: { px: number; py: number; star: Star3D }[] = [];

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.prevZ = s.z;
        s.z -= starSpeed;

        if (s.z <= 10) {
          s.z = 1100;
          s.prevZ = 1100;
          s.x = (Math.random() - 0.5) * 2400;
          s.y = (Math.random() - 0.5) * 2400;
        }

        const sx = cx + (s.x / s.z) * fov;
        const sy = cy + (s.y / s.z) * fov;

        // Skip stars outside screen
        if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) continue;

        projectedStars.push({ px: sx, py: sy, star: s });

        const depthRatio = 1 - s.z / 1100;
        const radius = Math.max(0.6, s.baseSize * depthRatio * 1.6);
        const twinkle = 0.4 + 0.6 * Math.sin(tick * s.twinkleSpeed + s.twinklePhase);
        const alpha = Math.max(0.15, Math.min(1, depthRatio * twinkle));

        // In Warp mode, draw streaks
        if (warpFactor > 1.5) {
          const prevSx = cx + (s.x / s.prevZ) * fov;
          const prevSy = cy + (s.y / s.prevZ) * fov;

          ctx.save();
          ctx.strokeStyle = s.color;
          ctx.lineWidth = radius * 1.2;
          ctx.lineCap = 'round';
          ctx.globalAlpha = Math.min(1, alpha * 1.2);
          ctx.beginPath();
          ctx.moveTo(prevSx, prevSy);
          ctx.lineTo(sx, sy);
          ctx.stroke();
          ctx.restore();
        } else {
          // Normal star dot
          ctx.save();
          ctx.fillStyle = s.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Diffraction cross flare on prominent stars
          if (s.hasFlare && alpha > 0.65) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 0.7;
            ctx.globalAlpha = alpha * 0.5;
            const flareLen = radius * 3.8;
            ctx.beginPath();
            ctx.moveTo(sx - flareLen, sy);
            ctx.lineTo(sx + flareLen, sy);
            ctx.moveTo(sx, sy - flareLen);
            ctx.lineTo(sx, sy + flareLen);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ------------------------------------------------------------
      // C. Interactive Constellation Lines around Mouse
      // ------------------------------------------------------------
      if (mousePos && warpFactor < 1.0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.22)';
        ctx.lineWidth = 0.75;
        const nearbyStars = projectedStars.filter((p) => {
          const d = Math.hypot(p.px - mousePos.x, p.py - mousePos.y);
          return d < 125;
        });

        for (let i = 0; i < nearbyStars.length; i++) {
          const p1 = nearbyStars[i];
          // Connect to mouse
          const dM = Math.hypot(p1.px - mousePos.x, p1.py - mousePos.y);
          ctx.globalAlpha = (1 - dM / 125) * 0.45;
          ctx.beginPath();
          ctx.moveTo(mousePos.x, mousePos.y);
          ctx.lineTo(p1.px, p1.py);
          ctx.stroke();

          // Connect adjacent stars
          for (let j = i + 1; j < nearbyStars.length; j++) {
            const p2 = nearbyStars[j];
            const dS = Math.hypot(p1.px - p2.px, p1.py - p2.py);
            if (dS < 85) {
              ctx.globalAlpha = (1 - dS / 85) * 0.35;
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // ------------------------------------------------------------
      // D. Cascading Falling Stars (Meteors) & Spark Trails
      // ------------------------------------------------------------
      for (let i = 0; i < meteors.length; i++) {
        const m = meteors[i];
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        // Meteor plasma gradient
        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.2, m.color);
        grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
        grad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.thickness;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing nucleus head
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thickness * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Starlight head halo
        ctx.fillStyle = m.color;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thickness * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Emit spark particles
        if (Math.random() < 0.35) {
          sparks.push({
            x: m.x,
            y: m.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 1.8 + 0.5,
            alpha: 0.9,
            size: Math.random() * 1.6 + 0.8,
            color: m.color,
          });
        }

        // Advance meteor
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;

        // Respawn if offscreen
        if (m.y > h + 180 || m.x < -180 || m.x > w + 240) {
          meteors[i] = createMeteor(false);
        }
      }

      // ------------------------------------------------------------
      // E. Render Trailing Stardust Sparks
      // ------------------------------------------------------------
      for (let sIdx = sparks.length - 1; sIdx >= 0; sIdx--) {
        const sp = sparks[sIdx];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= 0.038;

        if (sp.alpha <= 0) {
          sparks.splice(sIdx, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafIdRef.current = requestAnimationFrame(render);
    };

    rafIdRef.current = requestAnimationFrame(render);
    return () => {
      active = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePos]);

  // ============================================================
  // Progress Simulation & Futuristic Phase Updates
  // ============================================================
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;

      // Realistic non-linear easing for progress simulation
      let target = 0;
      if (elapsed < 600) {
        target = (elapsed / 600) * 30;
      } else if (elapsed < 1800) {
        target = 30 + ((elapsed - 600) / 1200) * 55;
      } else if (elapsed < TOTAL_LOADER_MS) {
        target = 85 + ((elapsed - 1800) / (TOTAL_LOADER_MS - 1800)) * 15;
      } else {
        target = 100;
      }

      setProgress((prev) => {
        if (prev >= 100 || elapsed >= TOTAL_LOADER_MS) {
          clearInterval(interval);
          return 100;
        }
        const delta = (target - prev) * 0.35;
        const next = prev + (Math.abs(delta) < 0.2 ? (target > prev ? 0.2 : 0) : delta);
        return Math.min(100, next);
      });

      // Update Phase Text
      for (let i = PHASES.length - 1; i >= 0; i--) {
        if (target >= PHASES[i].threshold) {
          setCurrentPhase(PHASES[i]);
          break;
        }
      }
    }, 28);

    return () => clearInterval(interval);
  }, []);

  // Safe Exit Hand-off
  useEffect(() => {
    if (progress >= 100 && !hasTriggeredExitRef.current) {
      hasTriggeredExitRef.current = true;
      setIsSupernova(true);
      setIsExiting(true);

      if (typeof document !== 'undefined') {
        document.body.classList.add('hf-loaded');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }

      exitTimerRef.current = setTimeout(() => {
        finish();
      }, 540);
    }
  }, [progress, finish]);

  const wordmarkLetters = ['H', 'i', 'r', 'e', 'F', 'l', 'o', 'w'];

  return (
    <>
      {/* Supernova Flash Transition */}
      <div className={`hf-supernova-flash ${isSupernova ? 'hf-flash-active' : ''}`} />

      {/* Main Fullscreen Loader */}
      <div className={`hf-cinematic-loader ${isExiting ? 'hf-hyperspace-exit' : ''}`}>
        {/* Deep Space Cosmic Canvas */}
        <canvas ref={canvasRef} className="hf-particle-canvas" />

        {/* Top-Left Telemetry */}
        <div className="hf-hud-telemetry hf-hud-top-left">
          <span className="hf-hud-dot" />
          <span>[ SYS.CORE: ONLINE ] // SECTOR: 0x9F_TALENT</span>
        </div>

        {/* Top-Right Luminous Skip Button */}
        <button
          type="button"
          onClick={finish}
          className="hf-skip-btn"
          aria-label="Skip intro animation"
        >
          <span>ENTER WORKSPACE ➔</span>
          <span className="hf-skip-kbd">ESC</span>
        </button>

        {/* Bottom-Left Telemetry */}
        <div className="hf-hud-telemetry hf-hud-bottom-left">
          <span>TALENT NODES: 75,000+ // LATENCY: 0.12ms</span>
        </div>

        {/* Bottom-Right Telemetry */}
        <div className="hf-hud-telemetry hf-hud-bottom-right">
          <span>QUANTUM ATS CORE v2.5 // SYNCHRONIZED</span>
        </div>

        {/* Central Stage */}
        <div
          className="hf-loader-stage"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          }}
        >
          {/* ============================================================
              QUANTUM CELESTIAL REACTOR LOGO
              ============================================================ */}
          <div className="hf-reactor-container">
            {/* Gravitational Shockwaves */}
            <div className="hf-shockwave" />
            <div className="hf-shockwave hf-shockwave-2" />

            {/* Orbiting Gyroscope Rings */}
            <div className="hf-orbit-ring-outer">
              <div className="hf-orbit-node-1" />
              <div className="hf-orbit-node-2" />
            </div>
            <div className="hf-orbit-ring-inner" />

            {/* Radiant Nebula Glow */}
            <div className="hf-reactor-glow" />

            {/* Central Emblem Housing */}
            <div className="hf-logo-prism">
              <svg viewBox="0 0 100 100" className="w-full h-full p-2" aria-label="HireFlow Emblem">
                <defs>
                  {/* Cosmic Hologram Gradient */}
                  <linearGradient id="hfPrismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F2FE" />
                    <stop offset="45%" stopColor="#6366F1" />
                    <stop offset="80%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#FF007F" />
                  </linearGradient>

                  {/* Intense Starlight Glow Filter */}
                  <filter id="hfLaserBloom" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur1" />
                      <feMergeNode in="blur2" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Left Pillar */}
                <line
                  x1="30"
                  y1="22"
                  x2="30"
                  y2="78"
                  stroke="url(#hfPrismGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="hf-laser-path"
                  filter="url(#hfLaserBloom)"
                />

                {/* Right Pillar */}
                <line
                  x1="70"
                  y1="22"
                  x2="70"
                  y2="78"
                  stroke="url(#hfPrismGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="hf-laser-path"
                  filter="url(#hfLaserBloom)"
                />

                {/* Flow Wave Path */}
                <path
                  id="hfSineFlow"
                  d="M 30,50 C 40,36 44,36 50,50 C 56,64 60,64 70,50"
                  stroke="#FFFFFF"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                  className="hf-laser-path"
                  filter="url(#hfLaserBloom)"
                />

                {/* Traveling Photon Node */}
                <circle r="4.5" fill="#00F2FE" filter="url(#hfLaserBloom)">
                  <animateMotion
                    path="M 30,50 C 40,36 44,36 50,50 C 56,64 60,64 70,50"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>

              {/* Specular Shimmer Sweep */}
              <div className="hf-prism-specular" />
            </div>
          </div>

          {/* ============================================================
              WORDMARK & KINETIC TYPOGRAPHY
              ============================================================ */}
          <div className="hf-wordmark-row">
            {wordmarkLetters.map((char, idx) => (
              <span
                key={idx}
                className="hf-letter"
                style={{ animationDelay: `${0.75 + idx * 0.045}s` }}
              >
                {char}
              </span>
            ))}
            <span className="hf-ai-badge">AI</span>
          </div>

          {/* Sci-Fi Subtitle Tagline */}
          <div className="hf-tagline-container">
            <span className="hf-tagline-bracket">[</span>
            <span className="hf-tagline-text">NEURAL TALENT ARCHITECTURE // ORBITAL ATS ENGINE</span>
            <span className="hf-tagline-bracket">]</span>
          </div>

          {/* ============================================================
              DUAL-FREQUENCY ENERGY GAUGE (PROGRESS HUD)
              ============================================================ */}
          <div className="hf-progress-hud">
            {/* Energy Conduit Bar */}
            <div className="hf-conduit-track">
              <div
                className="hf-conduit-fill"
                style={{ width: `${Math.min(100, progress)}%` }}
              >
                <div className="hf-conduit-laser-head" />
              </div>
            </div>

            {/* Telemetry Status Bar */}
            <div className="hf-telemetry-meta">
              <div className="hf-status-ticker">
                <span className="hf-freq-bars">
                  <span className="hf-freq-bar" />
                  <span className="hf-freq-bar" />
                  <span className="hf-freq-bar" />
                  <span className="hf-freq-bar" />
                </span>
                <span className="hf-status-label">{currentPhase.label}:</span>
                <span>{currentPhase.text}</span>
              </div>
              <span className="hf-percent-value">
                {Math.min(100, Math.floor(progress))}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
