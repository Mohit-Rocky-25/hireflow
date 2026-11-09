import React, { useEffect, useState, useCallback, useRef } from 'react';
import './CinematicLoader.css';

const TOTAL_LOADER_DURATION_MS = 1750;

export interface CinematicLoaderProps {
  onFinish: () => void;
  isAppReady?: boolean;
}

interface BoltPoint {
  x: number;
  y: number;
}

interface LightningBranch {
  points: BoltPoint[];
  width: number;
  color: string;
}

interface ActiveBolt {
  trunk: BoltPoint[];
  branches: LightningBranch[];
  width: number;
  color: string;
  frames: number[];
  frameIdx: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface MicroArc {
  points: BoltPoint[];
  life: number;
  maxLife: number;
  color: string;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isEnergized, setIsEnergized] = useState(false);
  const [screenFlash, setScreenFlash] = useState(0);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const emblemRef = useRef<HTMLDivElement | null>(null);
  const hasFinishedRef = useRef(false);

  const finish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsExiting(true);

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem('hf_seen_cinematic', 'true');
      } catch {}
    }

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.add('hf-loaded');
    }

    setTimeout(() => {
      onFinish();
    }, 380);
  }, [onFinish]);

  // Session guard — instant skip if already seen
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (window.sessionStorage.getItem('hf_seen_cinematic') === 'true') {
          finish();
        }
      } catch {}
    }
  }, [finish]);

  // Lock scroll
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
    };
  }, []);

  // Keyboard shortcut: ESC to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finish]);

  // Main timeline & progress engine
  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / TOTAL_LOADER_DURATION_MS) * 100);
      setProgress(pct);

      if (pct >= 24 && !isEnergized) {
        setIsEnergized(true);
      }

      if (pct >= 100) {
        clearInterval(interval);
        finish();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [finish, isEnergized]);

  // High-Voltage Lightning & Electrostatic Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const handleResize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener('resize', handleResize);

    const activeBolts: ActiveBolt[] = [];
    const sparks: Spark[] = [];
    const microArcs: MicroArc[] = [];
    let shakeIntensity = 0;

    // Helper: generate natural fractal lightning path
    const createFractalPath = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      disp: number,
      minDisp: number = 6 * dpr
    ): BoltPoint[] => {
      const pts: BoltPoint[] = [];

      const subdivide = (ax: number, ay: number, bx: number, by: number, d: number) => {
        if (d < minDisp) {
          pts.push({ x: bx, y: by });
          return;
        }
        const dx = bx - ax;
        const dy = by - ay;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const offset = (Math.random() - 0.5) * d * 0.9;
        const mx = (ax + bx) / 2 + nx * offset;
        const my = (ay + by) / 2 + ny * offset;

        subdivide(ax, ay, mx, my, d * 0.53);
        subdivide(mx, my, bx, by, d * 0.53);
      };

      pts.push({ x: x1, y: y1 });
      subdivide(x1, y1, x2, y2, disp);
      return pts;
    };

    // Trigger thunder strike hitting the monogram
    const triggerThunderStrike = (intensity: number = 1.0) => {
      const emblemEl = emblemRef.current;
      const rect = emblemEl ? emblemEl.getBoundingClientRect() : null;

      const targetX = rect ? (rect.left + rect.width / 2) * dpr : width / 2;
      const targetY = rect ? (rect.top + rect.height * 0.3) * dpr : height * 0.45;

      const originX = width / 2 + (Math.random() - 0.5) * width * 0.3;
      const originY = -20;

      // Main trunk
      const trunk = createFractalPath(originX, originY, targetX, targetY, width * 0.14 * intensity);

      // Branching forks
      const branches: LightningBranch[] = [];
      const numBranches = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numBranches; i++) {
        const rootIdx = Math.floor(trunk.length * (0.3 + i * 0.22));
        const root = trunk[rootIdx];
        if (root) {
          const angle = Math.atan2(targetY - originY, targetX - originX) + (Math.random() - 0.5) * 1.0;
          const dist = (Math.random() * 0.25 + 0.15) * Math.hypot(targetX - originX, targetY - originY);
          const bx = root.x + Math.cos(angle) * dist;
          const by = root.y + Math.sin(angle) * dist;

          const branchPath = createFractalPath(root.x, root.y, bx, by, width * 0.05 * intensity);
          branches.push({
            points: branchPath,
            width: Math.max(1.5 * dpr, 2.5 * dpr * intensity * 0.6),
            color: Math.random() > 0.4 ? '#00F0FF' : '#F5FF00',
          });
        }
      }

      // Stroboscopic lightning flicker pattern
      activeBolts.push({
        trunk,
        branches,
        width: Math.max(2.5 * dpr, 5 * dpr * intensity),
        color: '#F5FF00',
        frames: [1.0, 0.4, 0.95, 0.5, 0.75, 0.25, 0.1, 0.0],
        frameIdx: 0,
      });

      // Screen flash & camera shake
      setScreenFlash(Math.min(0.7, 0.45 * intensity));
      setTimeout(() => setScreenFlash(0), 90);
      shakeIntensity = 6 * intensity;

      // Radial impact sparks
      const sparkCount = Math.floor(18 * intensity);
      for (let s = 0; s < sparkCount; s++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (Math.random() * 8 + 3) * intensity * dpr;
        sparks.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 2 * dpr,
          life: 0,
          maxLife: 22 + Math.random() * 12,
          size: (Math.random() * 2.5 + 1.2) * dpr,
          color: Math.random() > 0.4 ? '#F5FF00' : '#00F0FF',
        });
      }
    };

    // Orchestrated strikes:
    // Strike 1: Catastrophic strike at 260ms that awakens the monogram
    const t1 = setTimeout(() => triggerThunderStrike(1.3), 260);
    // Strike 2: Secondary surge at 680ms
    const t2 = setTimeout(() => triggerThunderStrike(0.9), 680);
    // Strike 3: Power singularity burst at 1150ms
    const t3 = setTimeout(() => triggerThunderStrike(1.5), 1150);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Handle screen shake
      if (shakeIntensity > 0.1) {
        setShakeOffset({
          x: (Math.random() - 0.5) * shakeIntensity,
          y: (Math.random() - 0.5) * shakeIntensity,
        });
        shakeIntensity *= 0.8;
      } else {
        setShakeOffset({ x: 0, y: 0 });
      }

      // Draw active lightning bolts (Additive glow)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let b = activeBolts.length - 1; b >= 0; b--) {
        const bolt = activeBolts[b];
        const alpha = bolt.frames[bolt.frameIdx] ?? 0;
        bolt.frameIdx++;

        if (bolt.frameIdx >= bolt.frames.length || alpha <= 0) {
          activeBolts.splice(b, 1);
          continue;
        }

        const drawPath = (pts: BoltPoint[], w: number, color: string, a: number) => {
          if (pts.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let p = 1; p < pts.length; p++) {
            ctx.lineTo(pts[p].x, pts[p].y);
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = w;
          ctx.globalAlpha = a;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'bevel';
          ctx.stroke();
        };

        // Pass 1: Ionized atmospheric halo
        drawPath(bolt.trunk, bolt.width * 3.5, '#00F0FF', alpha * 0.25);
        // Pass 2: Neon volt plasma channel
        drawPath(bolt.trunk, bolt.width, '#F5FF00', alpha * 0.85);
        // Pass 3: White-hot core filament
        drawPath(bolt.trunk, Math.max(1.2 * dpr, bolt.width * 0.3), '#FFFFFF', alpha * 1.0);

        // Branching forks
        for (const branch of bolt.branches) {
          drawPath(branch.points, branch.width * 2, '#00F0FF', alpha * 0.2);
          drawPath(branch.points, branch.width, branch.color, alpha * 0.7);
          drawPath(branch.points, Math.max(1 * dpr, branch.width * 0.25), '#FFFFFF', alpha * 0.9);
        }
      }

      // Draw kinetic sparks
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.life++;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.22 * dpr; // subtle gravity
        sp.vx *= 0.93; // air drag
        sp.vy *= 0.93;

        if (sp.life >= sp.maxLife) {
          sparks.splice(s, 1);
          continue;
        }

        const sparkAlpha = 1 - sp.life / sp.maxLife;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sparkAlpha;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = sparkAlpha;
        ctx.fill();
      }

      // Ambient electro-sparkles around monogram when energized
      if (isEnergized && Math.random() > 0.6) {
        const emblemEl = emblemRef.current;
        if (emblemEl) {
          const rect = emblemEl.getBoundingClientRect();
          const mx = (rect.left + Math.random() * rect.width) * dpr;
          const my = (rect.top + Math.random() * rect.height) * dpr;
          sparks.push({
            x: mx,
            y: my,
            vx: (Math.random() - 0.5) * 2 * dpr,
            vy: (Math.random() - 0.5) * 2 * dpr,
            life: 0,
            maxLife: 14 + Math.random() * 8,
            size: (Math.random() * 1.5 + 0.8) * dpr,
            color: Math.random() > 0.5 ? '#F5FF00' : '#00F0FF',
          });
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isEnergized]);

  return (
    <div className={`hf-thunder-loader ${isExiting ? 'hf-thunder-exit' : ''}`}>
      {/* Cinematic Vignette Backdrop & Radial Energy Field */}
      <div className="hf-thunder-backdrop" />
      <div 
        className="hf-thunder-flash" 
        style={{ opacity: screenFlash }} 
      />

      {/* Top Bar: Skip Button */}
      <div className="hf-thunder-top-bar">
        <button 
          type="button" 
          onClick={finish} 
          className="hf-thunder-skip-btn" 
          aria-label="Skip intro animation"
        >
          <span>Skip</span>
          <span className="hf-thunder-kbd">ESC</span>
        </button>
      </div>

      {/* High-Voltage Lightning Canvas */}
      <canvas ref={canvasRef} className="hf-thunder-canvas" />

      {/* Center Stage */}
      <div 
        className="hf-thunder-stage"
        style={{
          transform: `translate3d(${shakeOffset.x}px, ${shakeOffset.y}px, 0)`,
        }}
      >
        
        {/* ============================================================
            HIREFLOW BESPOKE "HF" MONOGRAM EMBLEM
            Combines Letter H (Hire) + Letter F (Flow) with Lightning Core
            ============================================================ */}
        <div 
          ref={emblemRef}
          className={`hf-monogram-container ${isEnergized ? 'hf-monogram-energized' : ''}`}
        >
          {/* Subtle Ambient Plasma Halo */}
          <div className="hf-monogram-glow-ring" />
          <div className="hf-monogram-shockwave" />

          {/* Precision SVG Monogram: Interlocking H + F */}
          <svg 
            className="hf-monogram-svg" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-label="HireFlow HF Monogram"
          >
            <defs>
              <linearGradient id="hfNeonGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#F5FF00" />
                <stop offset="85%" stopColor="#00F0FF" />
              </linearGradient>

              <linearGradient id="hfChassisGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E202B" />
                <stop offset="100%" stopColor="#0A0B10" />
              </linearGradient>

              <filter id="hfPlasmaBloom" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Backplate Shadow Frame */}
            <rect 
              x="12" y="10" width="76" height="80" rx="22" 
              fill="url(#hfChassisGrad)" 
              stroke="rgba(245, 255, 0, 0.25)" 
              strokeWidth="1.5"
              className="hf-svg-backplate"
            />

            {/* Combined H + F Monogram Geometry:
                - Left Stem (x: 26 to 40, y: 22 to 78): Full height pillar (shared by H and F)
                - Top Arm (x: 40 to 74, y: 22 to 34): Top horizontal stroke of F with 45° cyber-bevel
                - Middle Crossbar (x: 40 to 66, y: 46 to 58): Crossbar of H and middle stroke of F
                - Right Stem (x: 60 to 74, y: 46 to 78): Right pillar of H descending to baseline
            */}
            
            {/* Mathematically Harmonized Single-Path "HF" Monogram */}
            <path 
              d="M24 22 H76 V34 H38 V48 H76 V78 H62 V60 H38 V78 H24 Z" 
              fill="url(#hfNeonGrad)" 
              className="hf-glyph-path"
            />

            {/* Glowing High-Voltage Core Filament Along Centerlines */}
            <path 
              d="M31 22 V78 M38 28 H70 M38 54 H69 M69 54 V78" 
              stroke="#FFFFFF" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="hf-filament-laser"
            />

            {/* Central Electric Energy Node */}
            <circle cx="50" cy="54" r="3" fill="#00F0FF" className="hf-filament-node" />
          </svg>
        </div>

        {/* Brand Name Lockup */}
        <div className="hf-brand-wrap">
          <h1 className="hf-brand-title">
            HIRE<span className="text-volt">FLOW</span>
          </h1>
          <div className="hf-brand-tagline">
            <span className="hf-tagline-bolt">⚡</span>
            <span>HIGH-VOLTAGE ATS & CAREER INTELLIGENCE</span>
          </div>
        </div>

        {/* Minimal High-Tech Neon Power Line */}
        <div className="hf-meter-wrap">
          <div className="hf-meter-track">
            <div 
              className="hf-meter-fill" 
              style={{ width: `${Math.min(100, progress)}%` }}
            >
              <div className="hf-meter-laser-head" />
            </div>
          </div>
          <div className="hf-meter-meta">
            <span className="hf-meta-status">
              {progress < 25 && 'GATHERING ATMOSPHERIC CHARGE...'}
              {progress >= 25 && progress < 65 && 'THUNDER STRIKE: ENERGIZING HF CORE...'}
              {progress >= 65 && progress < 90 && 'SYNCHRONIZING TAXONOMY TRUTH GATES...'}
              {progress >= 90 && 'HIREFLOW CORE READY — ENGAGING'}
            </span>
            <span className="hf-meta-pct">{Math.floor(progress)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
