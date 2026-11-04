import React, { useEffect, useState, useCallback, useRef } from 'react';
import './CinematicLoader.css';

const TOTAL_LOADER_DURATION_MS = 1700;

const STATUS_STAGES = [
  { at: 0, text: 'STRIKE 1: INITIALIZING HIGH-VOLTAGE ATS PIPELINE...' },
  { at: 35, text: 'STRIKE 2: CALIBRATING DETERMINISTIC TRUTH GATE...' },
  { at: 70, text: 'STRIKE 3: SYNCHRONIZING VERIFIED ROLE TAXONOMIES...' },
  { at: 92, text: 'ONLINE: HIREFLOO AI READY — ENGAGING SYSTEM' },
];

export interface CinematicLoaderProps {
  onFinish: () => void;
  isAppReady?: boolean;
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

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface BoltPoint {
  x: number;
  y: number;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_STAGES[0].text);
  const [isExiting, setIsExiting] = useState(false);
  const [flashIntensity, setFlashIntensity] = useState(0);
  const [isCharged, setIsCharged] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  // Session check — skip if already seen
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (window.sessionStorage.getItem('hf_seen_cinematic') === 'true') {
          finish();
        }
      } catch {}
    }
  }, [finish]);

  // Body scroll lock
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

  // Progress counter and timeline
  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / TOTAL_LOADER_DURATION_MS) * 100);
      setProgress(pct);

      for (let i = STATUS_STAGES.length - 1; i >= 0; i--) {
        if (pct >= STATUS_STAGES[i].at) {
          setStatusText(STATUS_STAGES[i].text);
          break;
        }
      }

      if (pct >= 85 && !isCharged) {
        setIsCharged(true);
      }

      if (pct >= 100) {
        clearInterval(interval);
        finish();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [finish, isCharged]);

  // High-Tech Thunder Canvas Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const sparks: Spark[] = [];
    const shockwaves: Shockwave[] = [];
    let activeBolts: { points: BoltPoint[]; color: string; width: number; life: number }[] = [];
    let lastBoltTime = 0;

    // Helper: generate fractal branching lightning path
    const generateBolt = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      displacement: number,
      minDisp: number = 6
    ): BoltPoint[] => {
      const points: BoltPoint[] = [];

      const subdivide = (ax: number, ay: number, bx: number, by: number, disp: number) => {
        if (disp < minDisp) {
          points.push({ x: bx, y: by });
          return;
        }
        const midX = (ax + bx) / 2 + (Math.random() - 0.5) * disp;
        const midY = (ay + by) / 2 + (Math.random() - 0.5) * disp;

        subdivide(ax, ay, midX, midY, disp * 0.55);
        subdivide(midX, midY, bx, by, disp * 0.55);
      };

      points.push({ x: x1, y: y1 });
      subdivide(x1, y1, x2, y2, displacement);
      return points;
    };

    // Trigger a thunder strike towards the center emblem
    const triggerStrike = (intensity: number = 1) => {
      const centerX = width / 2;
      const centerY = height / 2 - 20;

      // Random starting point along the periphery (top or sides)
      const fromTop = Math.random() > 0.3;
      let startX: number, startY: number;

      if (fromTop) {
        startX = Math.random() * width;
        startY = -20;
      } else {
        startX = Math.random() > 0.5 ? -20 : width + 20;
        startY = Math.random() * (height * 0.6);
      }

      // Main bolt
      const mainPath = generateBolt(startX, startY, centerX, centerY, width * 0.28, 5);
      activeBolts.push({
        points: mainPath,
        color: '#F5FF00',
        width: 3.5 * intensity,
        life: 7,
      });

      // Branching fork
      if (Math.random() > 0.2) {
        const forkIndex = Math.floor(mainPath.length * (0.35 + Math.random() * 0.3));
        const forkOrigin = mainPath[forkIndex];
        if (forkOrigin) {
          const forkTargetX = forkOrigin.x + (Math.random() - 0.5) * (width * 0.4);
          const forkTargetY = forkOrigin.y + (Math.random() * 0.4 + 0.1) * height;
          const branchPath = generateBolt(forkOrigin.x, forkOrigin.y, forkTargetX, forkTargetY, width * 0.15, 6);
          activeBolts.push({
            points: branchPath,
            color: '#00F0FF',
            width: 1.8 * intensity,
            life: 6,
          });
        }
      }

      // Center impact sparks (efficient budget: 12-18 sparks max)
      const sparkCount = Math.floor(12 * intensity);
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 5 + 3) * intensity;
        sparks.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 18 + Math.random() * 10,
          size: Math.random() * 2.5 + 1.2,
          color: Math.random() > 0.4 ? '#F5FF00' : '#00F0FF',
        });
      }

      // Impact shockwave ring
      shockwaves.push({
        x: centerX,
        y: centerY,
        radius: 10,
        maxRadius: Math.min(width, height) * 0.32,
        alpha: 0.9,
        color: intensity > 1.2 ? '#FFFFFF' : '#F5FF00',
      });

      // Screen flash
      setFlashIntensity(Math.min(1, 0.4 * intensity));
      setTimeout(() => setFlashIntensity(0), 75);
    };

    // Initial strike immediately
    triggerStrike(1.2);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const now = Date.now();

      // Periodic thunder strikes
      if (now - lastBoltTime > 180 + Math.random() * 220) {
        lastBoltTime = now;
        triggerStrike(0.9 + Math.random() * 0.6);
      }

      // Draw shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.12 + 2;
        sw.alpha *= 0.88;

        if (sw.alpha < 0.02 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha * 0.7;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Draw lightning bolts (Multi-pass glow)
      for (let b = activeBolts.length - 1; b >= 0; b--) {
        const bolt = activeBolts[b];
        bolt.life--;

        if (bolt.life <= 0 || bolt.points.length < 2) {
          activeBolts.splice(b, 1);
          continue;
        }

        const opacity = bolt.life / 7;

        // Pass 1: Neon outer energy glow
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
        for (let p = 1; p < bolt.points.length; p++) {
          ctx.lineTo(bolt.points[p].x, bolt.points[p].y);
        }
        ctx.strokeStyle = bolt.color;
        ctx.lineWidth = bolt.width * 3.5;
        ctx.globalAlpha = opacity * 0.35;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'miter';
        ctx.stroke();
        ctx.restore();

        // Pass 2: Main electric channel
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
        for (let p = 1; p < bolt.points.length; p++) {
          ctx.lineTo(bolt.points[p].x, bolt.points[p].y);
        }
        ctx.strokeStyle = bolt.color;
        ctx.lineWidth = bolt.width;
        ctx.globalAlpha = opacity * 0.85;
        ctx.stroke();
        ctx.restore();

        // Pass 3: Blinding pure white core
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
        for (let p = 1; p < bolt.points.length; p++) {
          ctx.lineTo(bolt.points[p].x, bolt.points[p].y);
        }
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(1, bolt.width * 0.4);
        ctx.globalAlpha = opacity;
        ctx.stroke();
        ctx.restore();
      }

      // Draw kinetic sparks
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.life++;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.94;
        sp.vy *= 0.94;

        if (sp.life >= sp.maxLife) {
          sparks.splice(s, 1);
          continue;
        }

        const sparkAlpha = 1 - sp.life / sp.maxLife;
        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sparkAlpha;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`hf-thunder-loader ${isExiting ? 'hf-thunder-exit' : ''}`}>
      {/* Background Ambience & Cyber Grid */}
      <div className="hf-thunder-backdrop" />
      <div className="hf-cyber-grid" />
      <div 
        className="hf-thunder-flash" 
        style={{ opacity: flashIntensity }} 
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

      {/* Canvas for Lightning Bolts & Particle Arcs */}
      <canvas ref={canvasRef} className="hf-thunder-canvas" />

      {/* Center Stage: Emblem & Brand Title */}
      <div className="hf-thunder-stage">
        
        {/* Core Electric Emblem */}
        <div className={`hf-emblem-container ${isCharged ? 'hf-emblem-supercharged' : ''}`}>
          <div className="hf-emblem-pulse-ring" />
          <div className="hf-emblem-pulse-ring ring-outer" />
          <div className="hf-emblem-box">
            <span className="hf-emblem-glyph">H</span>
            <div className="hf-emblem-arc-glow" />
          </div>
        </div>

        {/* High-Tech Brand Lockup */}
        <div className="hf-brand-title-wrap">
          <h1 className="hf-brand-title">
            HIRE<span className="text-volt">FLOO</span>
          </h1>
          <div className="hf-brand-badge">
            <span className="hf-badge-bolt">⚡</span>
            <span>HIGH-VOLTAGE ATS & CAREER INTELLIGENCE</span>
          </div>
        </div>

        {/* Console Telemetry & Neon Meter */}
        <div className="hf-console-wrap">
          <div className="hf-console-bar-track">
            <div 
              className="hf-console-bar-fill" 
              style={{ width: `${Math.min(100, progress)}%` }}
            >
              <div className="hf-console-bar-head" />
            </div>
          </div>

          <div className="hf-console-telemetry">
            <div className="hf-telemetry-left">
              <span className="hf-telemetry-beacon" />
              <span className="hf-telemetry-text">{statusText}</span>
            </div>
            <span className="hf-telemetry-percent">{Math.floor(progress)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
