import React, { useEffect, useState, useCallback, useRef } from 'react';
import './CinematicLoader.css';

const TOTAL_LOADER_DURATION_MS = 1850;

const DIAGNOSTIC_STAGES = [
  { at: 0, text: 'SYS.INIT: CHARGING ATMOSPHERIC ION ACCUMULATOR...' },
  { at: 28, text: 'STRIKE 1: INJECTING 1.21 GW INTO ATS PARSING ENGINE...' },
  { at: 62, text: 'STRIKE 2: CALIBRATING 100K+ TRUTH GATES & SKILL LADDERS...' },
  { at: 88, text: 'STRIKE 3: SYNCHRONIZING REAL-TIME CAREER TOPOLOGY...' },
  { at: 96, text: 'SINGULARITY ACHIEVED: HIREFLOO AI CORE FULLY ONLINE' },
];

export interface CinematicLoaderProps {
  onFinish: () => void;
  isAppReady?: boolean;
}

interface BoltPoint {
  x: number;
  y: number;
}

interface ForkBranch {
  points: BoltPoint[];
  width: number;
  color: string;
}

interface LightningBolt {
  trunk: BoltPoint[];
  branches: ForkBranch[];
  width: number;
  color: string;
  frames: number[];
  frameIdx: number;
  isMajor: boolean;
}

interface SurfaceArc {
  points: BoltPoint[];
  life: number;
  maxLife: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
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
  width: number;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(DIAGNOSTIC_STAGES[0].text);
  const [isExiting, setIsExiting] = useState(false);
  const [isSupercharged, setIsSupercharged] = useState(false);
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const chassisRef = useRef<HTMLDivElement | null>(null);
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
    }, 420);
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

  // Lock body scroll during animation
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

  // Keyboard accessibility: ESC to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finish]);

  // Main progress and timeline progression
  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / TOTAL_LOADER_DURATION_MS) * 100);
      setProgress(pct);

      for (let i = DIAGNOSTIC_STAGES.length - 1; i >= 0; i--) {
        if (pct >= DIAGNOSTIC_STAGES[i].at) {
          setStatusText(DIAGNOSTIC_STAGES[i].text);
          break;
        }
      }

      if (pct >= 85 && !isSupercharged) {
        setIsSupercharged(true);
      }

      if (pct >= 100) {
        clearInterval(interval);
        finish();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [finish, isSupercharged]);

  // AAA Creative-Grade Thunder & Lightning Canvas Engine
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

    const sparks: Spark[] = [];
    const shockwaves: Shockwave[] = [];
    const activeBolts: LightningBolt[] = [];
    const surfaceArcs: SurfaceArc[] = [];

    let flashAlpha = 0;
    let flashOrigin = { x: width / 2, y: height / 2 };
    let shakeStrength = 0;

    // Accurate pin target coordinate resolution on reactor chassis
    const getChassisTarget = (pin: 'tl' | 'tr' | 'bl' | 'br' | 'center' = 'center'): BoltPoint => {
      if (chassisRef.current) {
        const r = chassisRef.current.getBoundingClientRect();
        if (pin === 'tl') return { x: (r.left + 8) * dpr, y: (r.top + 8) * dpr };
        if (pin === 'tr') return { x: (r.right - 8) * dpr, y: (r.top + 8) * dpr };
        if (pin === 'bl') return { x: (r.left + 8) * dpr, y: (r.bottom - 8) * dpr };
        if (pin === 'br') return { x: (r.right - 8) * dpr, y: (r.bottom - 8) * dpr };
        return { x: (r.left + r.width / 2) * dpr, y: (r.top + r.height / 2) * dpr };
      }
      return { x: width / 2, y: height * 0.42 };
    };

    // Recursive normal-displacement fractal generator for realistic lightning
    const generateFractalPath = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      displacement: number,
      minDisp: number = 6 * dpr
    ): BoltPoint[] => {
      const points: BoltPoint[] = [];

      const subdivide = (ax: number, ay: number, bx: number, by: number, disp: number) => {
        if (disp < minDisp) {
          points.push({ x: bx, y: by });
          return;
        }

        const dx = bx - ax;
        const dy = by - ay;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const offset = (Math.random() - 0.5) * disp * 0.95;
        const midX = (ax + bx) / 2 + nx * offset;
        const midY = (ay + by) / 2 + ny * offset;

        subdivide(ax, ay, midX, midY, disp * 0.52);
        subdivide(midX, midY, bx, by, disp * 0.52);
      };

      points.push({ x: x1, y: y1 });
      subdivide(x1, y1, x2, y2, displacement);
      return points;
    };

    // Trigger thunder strike with authentic return stroke harmonics
    const spawnStrike = (
      originX: number,
      originY: number,
      targetX: number,
      targetY: number,
      intensity: number = 1.0,
      isMajor: boolean = true
    ) => {
      const trunkPoints = generateFractalPath(
        originX,
        originY,
        targetX,
        targetY,
        width * 0.18 * intensity,
        6 * dpr
      );

      // Generate branching forks
      const branches: ForkBranch[] = [];
      const numBranches = Math.floor(Math.random() * 3) + 1;

      for (let b = 0; b < numBranches; b++) {
        const branchIdx = Math.floor(trunkPoints.length * (0.28 + (b * 0.22) + Math.random() * 0.12));
        const rootPoint = trunkPoints[branchIdx];
        if (rootPoint) {
          const heading = Math.atan2(targetY - originY, targetX - originX);
          const branchAngle = heading + (Math.random() > 0.5 ? 1 : -1) * (0.45 + Math.random() * 0.4);
          const branchDist = (Math.random() * 0.35 + 0.18) * Math.hypot(targetX - originX, targetY - originY);
          const branchTargetX = rootPoint.x + Math.cos(branchAngle) * branchDist;
          const branchTargetY = rootPoint.y + Math.sin(branchAngle) * branchDist;

          const branchPath = generateFractalPath(
            rootPoint.x,
            rootPoint.y,
            branchTargetX,
            branchTargetY,
            width * 0.07 * intensity,
            7 * dpr
          );

          branches.push({
            points: branchPath,
            width: Math.max(1.2 * dpr, 2.2 * dpr * intensity * 0.6),
            color: Math.random() > 0.35 ? '#00F0FF' : '#F5FF00',
          });
        }
      }

      // Natural return stroke flicker harmonics
      const flickerPattern = isMajor
        ? [1.0, 0.45, 0.95, 0.6, 0.8, 0.3, 0.12, 0.0]
        : [0.9, 0.4, 0.7, 0.2, 0.0];

      activeBolts.push({
        trunk: trunkPoints,
        branches,
        width: Math.max(2.5 * dpr, 4.5 * dpr * intensity),
        color: '#F5FF00',
        frames: flickerPattern,
        frameIdx: 0,
        isMajor,
      });

      // Impact effects
      if (isMajor) {
        flashAlpha = Math.min(0.85, 0.45 * intensity);
        flashOrigin = { x: targetX, y: targetY };
        shakeStrength = 8 * intensity;

        // Shockwave rings
        shockwaves.push({
          x: targetX,
          y: targetY,
          radius: 12 * dpr,
          maxRadius: Math.min(width, height) * 0.36 * intensity,
          alpha: 0.95,
          color: intensity > 1.1 ? '#FFFFFF' : '#F5FF00',
          width: 2.5 * dpr,
        });

        // Kinetic spark shower
        const sparkCount = Math.floor(16 * intensity);
        for (let i = 0; i < sparkCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (Math.random() * 9 + 4) * intensity * dpr;
          sparks.push({
            x: targetX,
            y: targetY,
            prevX: targetX,
            prevY: targetY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 20 + Math.random() * 12,
            size: (Math.random() * 2.8 + 1.2) * dpr,
            color: Math.random() > 0.4 ? '#F5FF00' : '#00F0FF',
          });
        }

        // Spawn surface Tesla arcs crawling across chassis perimeter
        if (chassisRef.current) {
          const r = chassisRef.current.getBoundingClientRect();
          const left = r.left * dpr;
          const top = r.top * dpr;
          const w = r.width * dpr;
          const h = r.height * dpr;
          for (let a = 0; a < 3; a++) {
            const t1 = Math.random();
            const t2 = Math.min(1, t1 + 0.25 + Math.random() * 0.2);
            const edge = Math.floor(Math.random() * 4);
            let p1: BoltPoint, p2: BoltPoint;
            if (edge === 0) {
              p1 = { x: left + t1 * w, y: top };
              p2 = { x: left + t2 * w, y: top };
            } else if (edge === 1) {
              p1 = { x: left + w, y: top + t1 * h };
              p2 = { x: left + w, y: top + t2 * h };
            } else if (edge === 2) {
              p1 = { x: left + (1 - t1) * w, y: top + h };
              p2 = { x: left + (1 - t2) * w, y: top + h };
            } else {
              p1 = { x: left, y: top + (1 - t1) * h };
              p2 = { x: left, y: top + (1 - t2) * h };
            }
            const arcPath = generateFractalPath(p1.x, p1.y, p2.x, p2.y, 8 * dpr, 3 * dpr);
            surfaceArcs.push({
              points: arcPath,
              life: 0,
              maxLife: 4 + Math.floor(Math.random() * 3),
              color: Math.random() > 0.5 ? '#00F0FF' : '#FFFFFF',
            });
          }
        }
      }
    };

    // Orchestrated Cinematic Timeline with Precision Pin Targeting
    const strikeSchedule = [
      { delay: 200, fromX: 0.15, fromY: -0.05, pin: 'tl' as const, intensity: 1.1, major: true },
      { delay: 560, fromX: 0.88, fromY: -0.05, pin: 'tr' as const, intensity: 1.25, major: true },
      { delay: 720, fromX: -0.05, fromY: 0.25, pin: 'tl' as const, intensity: 0.95, major: true },
      { delay: 960, fromX: 1.05, fromY: 0.35, pin: 'br' as const, intensity: 1.0, major: true },
      { delay: 1220, fromX: 0.5, fromY: -0.05, pin: 'center' as const, intensity: 1.5, major: true },
      { delay: 1420, fromX: 0.1, fromY: -0.05, pin: 'bl' as const, intensity: 0.85, major: false },
      { delay: 1600, fromX: 0.5, fromY: -0.05, pin: 'center' as const, intensity: 1.7, major: true },
    ];

    const timeouts = strikeSchedule.map(s => {
      return setTimeout(() => {
        const target = getChassisTarget(s.pin);
        const sx = s.fromX * width;
        const sy = s.fromY * height;
        spawnStrike(sx, sy, target.x, target.y, s.intensity, s.major);
      }, s.delay);
    });

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 - 24 * dpr;

      // Handle screen shake
      if (shakeStrength > 0.1) {
        const sx = (Math.random() - 0.5) * shakeStrength;
        const sy = (Math.random() - 0.5) * shakeStrength;
        setScreenShake({ x: sx, y: sy });
        shakeStrength *= 0.78;
      } else {
        setScreenShake({ x: 0, y: 0 });
      }

      // Draw Atmospheric Sheet Flash (volumetric glow around strike point)
      if (flashAlpha > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createRadialGradient(
          flashOrigin.x,
          flashOrigin.y,
          30 * dpr,
          flashOrigin.x,
          flashOrigin.y,
          Math.max(width, height) * 0.75
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha * 0.65})`);
        grad.addColorStop(0.35, `rgba(245, 255, 0, ${flashAlpha * 0.35})`);
        grad.addColorStop(0.7, `rgba(0, 240, 255, ${flashAlpha * 0.12})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        flashAlpha *= 0.74;
      }

      // Draw Shockwaves (Additive Blending)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.14 + 3 * dpr;
        sw.alpha *= 0.86;

        if (sw.alpha < 0.015 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha * 0.85;
        ctx.lineWidth = sw.width;
        ctx.stroke();

        // Secondary subtle inner echo ring
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = '#00F0FF';
        ctx.globalAlpha = sw.alpha * 0.4;
        ctx.lineWidth = sw.width * 0.5;
        ctx.stroke();
      }
      ctx.restore();

      // Draw Lightning Bolts with 3 Composite Luminous Passes
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let b = activeBolts.length - 1; b >= 0; b--) {
        const bolt = activeBolts[b];
        const intensity = bolt.frames[bolt.frameIdx] ?? 0;
        bolt.frameIdx++;

        if (bolt.frameIdx >= bolt.frames.length || intensity <= 0) {
          activeBolts.splice(b, 1);
          continue;
        }

        // Draw helper for a path
        const renderPath = (pts: BoltPoint[], strokeW: number, strokeColor: string, alpha: number) => {
          if (pts.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let p = 1; p < pts.length; p++) {
            ctx.lineTo(pts[p].x, pts[p].y);
          }
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeW;
          ctx.globalAlpha = alpha;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'bevel';
          ctx.stroke();
        };

        // Render main trunk in 3 passes
        // Pass 1: Broad electric ionization corona
        renderPath(bolt.trunk, bolt.width * 3.8, '#00F0FF', intensity * 0.3);
        // Pass 2: Intense neon volt plasma channel
        renderPath(bolt.trunk, bolt.width, '#F5FF00', intensity * 0.85);
        // Pass 3: Blinding pure white core filament
        renderPath(bolt.trunk, Math.max(1.2 * dpr, bolt.width * 0.35), '#FFFFFF', intensity * 1.0);

        // Render branching forks
        for (const branch of bolt.branches) {
          renderPath(branch.points, branch.width * 2.2, '#00F0FF', intensity * 0.25);
          renderPath(branch.points, branch.width, branch.color, intensity * 0.7);
          renderPath(branch.points, Math.max(1 * dpr, branch.width * 0.3), '#FFFFFF', intensity * 0.9);
        }
      }

      // Draw Surface Tesla Arcs (jittering along emblem perimeter)
      for (let a = surfaceArcs.length - 1; a >= 0; a--) {
        const arc = surfaceArcs[a];
        arc.life++;
        if (arc.life >= arc.maxLife || arc.points.length < 2) {
          surfaceArcs.splice(a, 1);
          continue;
        }

        const arcAlpha = 1 - arc.life / arc.maxLife;
        ctx.beginPath();
        ctx.moveTo(arc.points[0].x, arc.points[0].y);
        for (let p = 1; p < arc.points.length; p++) {
          ctx.lineTo(arc.points[p].x, arc.points[p].y);
        }
        ctx.strokeStyle = arc.color;
        ctx.lineWidth = 1.6 * dpr;
        ctx.globalAlpha = arcAlpha * 0.9;
        ctx.stroke();
      }
      ctx.restore();

      // Draw Kinetic Motion-Blurred Sparks & Embers
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.life++;
        sp.prevX = sp.x;
        sp.prevY = sp.y;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.25 * dpr; // subtle gravity
        sp.vx *= 0.94; // air resistance
        sp.vy *= 0.94;

        if (sp.life >= sp.maxLife) {
          sparks.splice(s, 1);
          continue;
        }

        const alpha = 1 - sp.life / sp.maxLife;
        ctx.beginPath();
        ctx.moveTo(sp.prevX, sp.prevY);
        ctx.lineTo(sp.x, sp.y);
        ctx.strokeStyle = sp.color;
        ctx.lineWidth = sp.size;
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Bright spark tip
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
      ctx.restore();

      // Ambient electro-particles near the core
      if (Math.random() > 0.65) {
        const rad = (Math.random() * 50 + 20) * dpr;
        const ang = Math.random() * Math.PI * 2;
        sparks.push({
          x: cx + Math.cos(ang) * rad,
          y: cy + Math.sin(ang) * rad,
          prevX: cx + Math.cos(ang) * rad,
          prevY: cy + Math.sin(ang) * rad,
          vx: (Math.random() - 0.5) * 2 * dpr,
          vy: (Math.random() - 0.5) * 2 * dpr,
          life: 0,
          maxLife: 14 + Math.random() * 8,
          size: (Math.random() * 1.5 + 0.8) * dpr,
          color: Math.random() > 0.5 ? '#F5FF00' : '#00F0FF',
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      timeouts.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <div className={`hf-thunder-loader ${isExiting ? 'hf-thunder-exit' : ''}`}>
      {/* Background Ambience, Precision Radar Rings & Vignette */}
      <div className="hf-thunder-backdrop" />
      <div className="hf-cyber-grid" />
      <div className="hf-radar-rings" />
      
      {/* Corner Precision Reticles */}
      <div className="hf-corner-cross top-left">+</div>
      <div className="hf-corner-cross top-right">+</div>
      <div className="hf-corner-cross bottom-left">+</div>
      <div className="hf-corner-cross bottom-right">+</div>

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

      {/* High-Precision Lightning Canvas */}
      <canvas ref={canvasRef} className="hf-thunder-canvas" />

      {/* Center Stage: Reactor Core & Brand Identity */}
      <div 
        ref={stageRef}
        className="hf-thunder-stage"
        style={{
          transform: `translate3d(${screenShake.x}px, ${screenShake.y}px, 0)`,
        }}
      >
        
        {/* Futuristic Cybernetic Reactor Core */}
        <div className={`hf-reactor-assembly ${isSupercharged ? 'hf-reactor-supercharged' : ''}`}>
          
          {/* Rotating Outer Gyro HUD Ring with Tick Marks */}
          <div className="hf-hud-gyro-outer">
            <span className="hf-gyro-tick tick-0">0°</span>
            <span className="hf-gyro-tick tick-90">90°</span>
            <span className="hf-gyro-tick tick-180">180°</span>
            <span className="hf-gyro-tick tick-270">270°</span>
          </div>

          {/* Counter-Rotating Inner Reticle */}
          <div className="hf-hud-reticle-inner" />

          {/* Pulse Expansion Rings */}
          <div className="hf-reactor-pulse-ring ring-1" />
          <div className="hf-reactor-pulse-ring ring-2" />

          {/* Metallic Chamber Body */}
          <div ref={chassisRef} className="hf-reactor-chassis">
            {/* 4 Corner Electrode Pins */}
            <div className="hf-electrode-pin pin-tl" />
            <div className="hf-electrode-pin pin-tr" />
            <div className="hf-electrode-pin pin-bl" />
            <div className="hf-electrode-pin pin-br" />

            {/* Precision Laser-Etched "H" Vector Emblem */}
            <svg 
              className="hf-reactor-svg-glyph" 
              viewBox="0 0 48 48" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-label="HireFloo Core Symbol"
            >
              {/* Outer Guide Channel */}
              <path 
                d="M12 8V40M36 8V40M12 24H36" 
                stroke="#F5FF00" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="hf-svg-base-path"
              />
              {/* Glowing High-Voltage Inner Core */}
              <path 
                d="M12 8V40M36 8V40M12 24H36" 
                stroke="#FFFFFF" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="hf-svg-core-filament"
              />
              {/* Central Power Node Dot */}
              <circle cx="24" cy="24" r="3.2" fill="#00F0FF" className="hf-svg-core-node" />
            </svg>

            {/* High-voltage internal shimmer */}
            <div className="hf-chassis-internal-shimmer" />
          </div>
        </div>

        {/* High-Tech Brand Lockup */}
        <div className="hf-brand-title-wrap">
          <h1 className="hf-brand-title">
            HIRE<span className="text-volt">FLOO</span>
          </h1>
          <div className="hf-brand-badge">
            <span className="hf-badge-spark">⚡</span>
            <span>HIGH-VOLTAGE ATS & CAREER INTELLIGENCE</span>
            <span className="hf-badge-version">v4.2</span>
          </div>
        </div>

        {/* Console Telemetry & Segmented Power Bar */}
        <div className="hf-console-wrap">
          <div className="hf-console-bar-track">
            <div 
              className="hf-console-bar-fill" 
              style={{ width: `${Math.min(100, progress)}%` }}
            >
              <div className="hf-console-bar-head" />
            </div>
            {/* Calibration tick marks */}
            <div className="hf-bar-ticks">
              <span className="hf-bar-tick" style={{ left: '25%' }} />
              <span className="hf-bar-tick" style={{ left: '50%' }} />
              <span className="hf-bar-tick" style={{ left: '75%' }} />
            </div>
          </div>

          <div className="hf-console-telemetry">
            <div className="hf-telemetry-left">
              <span className="hf-telemetry-beacon" />
              <span className="hf-telemetry-text">{statusText}</span>
            </div>
            <div className="hf-telemetry-right">
              <span className="hf-telemetry-rate">144.8 MHz</span>
              <span className="hf-telemetry-percent">{Math.floor(progress)}%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
