import React, { useEffect, useState, useCallback, useRef } from 'react';
import './CinematicLoader.css';

const LOADER_MIN_MS = 1800;

const STATUS_MESSAGES = [
  'Vortex engine initializing...',
  'Extracting ATS heuristics from the cloud...',
  'Synchronizing career trajectory maps...',
  'Welcome to HireFlo AI',
];

export interface CinematicLoaderProps {
  onFinish: () => void;
  isAppReady?: boolean;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

interface TornadoParticle {
  y: number; // Height in funnel: 0 (bottom) to 1 (top)
  angle: number; // Current radial angle in radians
  speed: number; // Upward / downward speed
  rotSpeed: number; // Angular speed
  radiusNoise: number;
  size: number;
  alpha: number;
  colorType: number; // 0: sky blue, 1: cyan, 2: pure cloud white, 3: electric indigo
  prevX?: number;
  prevY?: number;
}

interface ImpactSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);
  const [isExiting, setIsExiting] = useState(false);
  const [screenShake, setScreenShake] = useState(0); // 0: none, 1, 2, 3

  // Word drop stages:
  // 0: in vortex, 1: falling, 2: landed & locked
  const [hireStage, setHireStage] = useState<'vortex' | 'falling' | 'landed'>('vortex');
  const [flowStage, setFlowStage] = useState<'vortex' | 'falling' | 'landed'>('vortex');
  const [aiStage, setAiStage] = useState<'vortex' | 'falling' | 'landed'>('vortex');
  const [grandLockup, setGrandLockup] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const hasFinishedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const shockwavesRef = useRef<ShockwaveRing[]>([]);
  const sparksRef = useRef<ImpactSpark[]>([]);

  const finish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
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
    onFinish();
  }, [onFinish]);

  // If already seen in this session, skip immediately
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (window.sessionStorage.getItem('hf_seen_cinematic') === 'true') {
          finish();
        }
      } catch {}
    }
  }, [finish]);

  // Lock body scroll during cinematic intro
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

  // Hard safety watchdog
  useEffect(() => {
    const watchdog = setTimeout(() => {
      finish();
    }, LOADER_MIN_MS + 900);
    return () => clearTimeout(watchdog);
  }, [finish]);

  // Keyboard shortcut to skip
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

  // Mouse tilt parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current.targetX = normX * 24;
      mouseRef.current.targetY = normY * 14;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Spawn visual shockwave and spark burst
  const triggerImpactVFX = useCallback((xRatio: number, yRatio: number, color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const px = canvas.width * xRatio;
    const py = canvas.height * yRatio;

    // Add dual shockwave rings
    shockwavesRef.current.push({
      x: px,
      y: py,
      radius: 6,
      maxRadius: 110,
      alpha: 0.95,
      color,
      lineWidth: 3.5,
    });
    shockwavesRef.current.push({
      x: px,
      y: py,
      radius: 2,
      maxRadius: 75,
      alpha: 0.8,
      color: '#FFFFFF',
      lineWidth: 2,
    });

    // Add radiant sparks
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      sparksRef.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2, // slight upward ejection
        alpha: 1,
        size: 1.5 + Math.random() * 2.8,
        color: Math.random() > 0.4 ? color : '#FFFFFF',
      });
    }
  }, []);

  // Choreographed Timeline & Progress State Machine
  useEffect(() => {
    let hireFallingTriggered = false;
    let hireLandedTriggered = false;
    let flowFallingTriggered = false;
    let flowLandedTriggered = false;
    let aiFallingTriggered = false;
    let aiLandedTriggered = false;
    let lockupTriggered = false;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;

      // 1. Stage transitions for "HIRE"
      if (elapsed >= 800 && !hireFallingTriggered) {
        hireFallingTriggered = true;
        setHireStage('falling');
      }
      if (elapsed >= 1100 && !hireLandedTriggered) {
        hireLandedTriggered = true;
        setHireStage('landed');
        setScreenShake(1);
        triggerImpactVFX(0.38, 0.82, 'rgba(2, 132, 199, 1)');
        setTimeout(() => setScreenShake(0), 280);
      }

      // 2. Stage transitions for "FLOW"
      if (elapsed >= 1550 && !flowFallingTriggered) {
        flowFallingTriggered = true;
        setFlowStage('falling');
      }
      if (elapsed >= 1850 && !flowLandedTriggered) {
        flowLandedTriggered = true;
        setFlowStage('landed');
        setScreenShake(2);
        triggerImpactVFX(0.52, 0.82, 'rgba(6, 182, 212, 1)');
        setTimeout(() => setScreenShake(0), 280);
      }

      // 3. Stage transitions for "AI"
      if (elapsed >= 2250 && !aiFallingTriggered) {
        aiFallingTriggered = true;
        setAiStage('falling');
      }
      if (elapsed >= 2500 && !aiLandedTriggered) {
        aiLandedTriggered = true;
        setAiStage('landed');
        setScreenShake(3);
        triggerImpactVFX(0.66, 0.82, 'rgba(99, 102, 241, 1)');
        setTimeout(() => setScreenShake(0), 280);
      }

      // 4. Grand lockup & metallic shimmer
      if (elapsed >= 2750 && !lockupTriggered) {
        lockupTriggered = true;
        setGrandLockup(true);
      }

      // Status text sync
      if (elapsed < 900) setStatusText(STATUS_MESSAGES[0]);
      else if (elapsed < 1700) setStatusText(STATUS_MESSAGES[1]);
      else if (elapsed < 2400) setStatusText(STATUS_MESSAGES[2]);
      else setStatusText(STATUS_MESSAGES[3]);

      // Smooth progress curve
      let targetProgress = 0;
      if (elapsed < 800) targetProgress = (elapsed / 800) * 30;
      else if (elapsed < 1600) targetProgress = 30 + ((elapsed - 800) / 800) * 30;
      else if (elapsed < 2500) targetProgress = 60 + ((elapsed - 1600) / 900) * 28;
      else if (elapsed < LOADER_MIN_MS) targetProgress = 88 + ((elapsed - 2500) / (LOADER_MIN_MS - 2500)) * 12;
      else targetProgress = 100;

      setProgress((prev) => {
        if (prev >= 100 || elapsed >= LOADER_MIN_MS + 80) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + (targetProgress - prev) * 0.35);
      });
    }, 25);

    return () => clearInterval(interval);
  }, [triggerImpactVFX]);

  // Exit trigger
  useEffect(() => {
    if (progress >= 100 && !isExiting) {
      setIsExiting(true);
      setTimeout(() => finish(), 650);
    }
  }, [progress, isExiting, finish]);

  // 3D Tornado Canvas Engine with Dynamic Lighting & VFX
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 520);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 440);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize 480 3D vortex particles
    const particleCount = 480;
    const particles: TornadoParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        y: Math.random(),
        angle: Math.random() * Math.PI * 2,
        speed: 0.0035 + Math.random() * 0.007,
        rotSpeed: 0.045 + Math.random() * 0.065,
        radiusNoise: 0.78 + Math.random() * 0.44,
        size: 1.2 + Math.random() * 2.9,
        alpha: 0.28 + Math.random() * 0.68,
        colorType: Math.floor(Math.random() * 4),
      });
    }

    const colors = [
      'rgba(2, 132, 199, ',   // Deep Sky Blue
      'rgba(6, 182, 212, ',   // Vibrant Cyan
      'rgba(255, 255, 255, ', // Cloud White
      'rgba(99, 102, 241, ',  // Electric Indigo
    ];

    let time = 0;

    const render = () => {
      time += 0.025;
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2 + mouseRef.current.x;
      const topY = height * 0.08 + mouseRef.current.y * 0.4;
      const bottomY = height * 0.78 + mouseRef.current.y * 0.4;
      const funnelHeight = bottomY - topY;

      // 1. Draw Tornado Core Volumetric Glow
      const coreGrad = ctx.createRadialGradient(
        centerX,
        topY + funnelHeight * 0.42,
        15,
        centerX,
        topY + funnelHeight * 0.42,
        200
      );
      coreGrad.addColorStop(0, 'rgba(56, 189, 248, 0.32)');
      coreGrad.addColorStop(0.45, 'rgba(186, 230, 253, 0.16)');
      coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, topY + funnelHeight * 0.42, 200, 0, Math.PI * 2);
      ctx.fill();

      // 2. Swirling 3D Wind Filaments / Helical Ribbons
      const minRadius = 16;
      const maxRadius = 175;
      const ribbonCount = 6;

      for (let r = 0; r < ribbonCount; r++) {
        ctx.beginPath();
        const ribbonOffset = (r / ribbonCount) * Math.PI * 2 + time * 1.9;
        let firstPoint = true;

        for (let step = 0; step <= 45; step++) {
          const t = step / 45; // 0 = bottom, 1 = top
          const curY = bottomY - t * funnelHeight;
          const curR = minRadius + Math.pow(t, 1.32) * (maxRadius - minRadius);
          const angle = ribbonOffset + t * Math.PI * 7.2;

          const px3D = Math.cos(angle) * curR;
          const pz3D = Math.sin(angle) * curR;
          const tiltFactor = 0.28;
          const scrX = centerX + px3D;
          const scrY = curY + pz3D * tiltFactor;

          if (firstPoint) {
            ctx.moveTo(scrX, scrY);
            firstPoint = false;
          } else {
            ctx.lineTo(scrX, scrY);
          }
        }

        const alphaRibbon = r % 2 === 0 ? 0.35 : 0.22;
        ctx.strokeStyle = r % 3 === 0 
          ? `rgba(6, 182, 212, ${alphaRibbon})` 
          : r % 3 === 1 
          ? `rgba(255, 255, 255, ${alphaRibbon * 1.3})`
          : `rgba(99, 102, 241, ${alphaRibbon})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // 3. Electric Lightning Filaments (VFX Pro spark arcs inside funnel)
      if (Math.random() < 0.28) {
        const boltSteps = 6;
        let boltX = centerX + (Math.random() - 0.5) * 40;
        let boltY = topY + funnelHeight * (0.2 + Math.random() * 0.35);

        ctx.beginPath();
        ctx.moveTo(boltX, boltY);
        for (let b = 0; b < boltSteps; b++) {
          boltX += (Math.random() - 0.5) * 26;
          boltY += 14 + Math.random() * 12;
          ctx.lineTo(boltX, boltY);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // 4. Render 3D Tornado Particles with Angular Velocity & Depth Occlusion
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.speed;
        if (p.y > 1) {
          p.y = 0;
          p.angle = Math.random() * Math.PI * 2;
        }

        const radiusT = Math.pow(p.y, 1.32);
        const currentRadius = (minRadius + radiusT * (maxRadius - minRadius)) * p.radiusNoise;
        const currentRotSpeed = p.rotSpeed * (1.85 - p.y * 0.95);
        p.angle += currentRotSpeed;

        const x3d = Math.cos(p.angle) * currentRadius;
        const z3d = Math.sin(p.angle) * currentRadius;
        const yPos = bottomY - p.y * funnelHeight;

        const tiltFactor = 0.32;
        const screenX = centerX + x3d;
        const screenY = yPos + z3d * tiltFactor;

        const depthNorm = (z3d / maxRadius + 1) / 2; // 0 (back) to 1 (front)
        const effectiveSize = p.size * (0.65 + depthNorm * 0.7);
        const effectiveAlpha = p.alpha * (0.25 + depthNorm * 0.75);

        // Motion trail streak
        if (p.prevX !== undefined && p.prevY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(screenX, screenY);
          ctx.strokeStyle = `${colors[p.colorType]}${effectiveAlpha * 0.85})`;
          ctx.lineWidth = effectiveSize * 0.85;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Particle head
        ctx.beginPath();
        ctx.arc(screenX, screenY, effectiveSize, 0, Math.PI * 2);
        ctx.fillStyle = `${colors[p.colorType]}${effectiveAlpha})`;
        ctx.fill();

        p.prevX = screenX;
        p.prevY = screenY;
      }

      // 5. Render Shockwave Impact Rings
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        sw.radius += 3.8;
        sw.alpha *= 0.94;

        if (sw.radius >= sw.maxRadius || sw.alpha <= 0.02) {
          shockwavesRef.current.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = sw.lineWidth;
        ctx.stroke();
        ctx.restore();
      }

      // 6. Render Impact Sparks
      for (let k = sparksRef.current.length - 1; k >= 0; k--) {
        const sp = sparksRef.current[k];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.22; // gravity
        sp.alpha *= 0.93;

        if (sp.alpha <= 0.03) {
          sparksRef.current.splice(k, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
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
    <div className={`hf-sky-loader ${isExiting ? 'hf-sky-exit' : ''}`}>
      {/* Daylight Sky Atmosphere Backdrop */}
      <div className="hf-sky-backdrop">
        <div className="hf-sun-radiance" />
        <div className="hf-light-beam" />
        <div className="hf-cloud-layer hf-cloud-1" />
        <div className="hf-cloud-layer hf-cloud-2" />
        <div className="hf-cloud-layer hf-cloud-3" />
        <div className="hf-wind-wisps" />
      </div>

      {/* Top Controls: Skip Button */}
      <div className="hf-sky-top-bar">
        <button type="button" onClick={finish} className="hf-sky-skip-btn" aria-label="Skip intro animation">
          <span>Skip</span>
          <span className="hf-sky-kbd">ESC</span>
        </button>
      </div>

      {/* Main 3D Choreography Stage */}
      <div className={`hf-sky-stage ${screenShake > 0 ? `hf-shake-active-${screenShake}` : ''}`}>
        
        {/* 3D Cyclone Funnel Arena */}
        <div className="hf-tornado-wrapper">
          {/* 3D Kinetic Vortex Gyro Rings */}
          <div className="hf-vortex-rings-3d">
            <div className="hf-vortex-ring ring-crown" />
            <div className="hf-vortex-ring ring-upper" />
            <div className="hf-vortex-ring ring-mid" />
            <div className="hf-vortex-ring ring-throat" />
            <div className="hf-vortex-ring ring-base" />
            <div className="hf-vortex-eye-pulsar" />
          </div>

          {/* 3D Orbiting Word Tokens Swirling inside the Funnel */}
          <div className="hf-funnel-word-stream">
            {hireStage === 'vortex' && (
              <div className="hf-cyclone-word token-hire">
                <span className="hf-vortex-letter-glow">HIRE</span>
                <div className="hf-word-vortex-tail" />
              </div>
            )}
            {flowStage === 'vortex' && (
              <div className="hf-cyclone-word token-flow">
                <span className="hf-vortex-letter-glow">FLOW</span>
                <div className="hf-word-vortex-tail" />
              </div>
            )}
            {aiStage === 'vortex' && (
              <div className="hf-cyclone-word token-ai">
                <span className="hf-vortex-letter-glow">AI</span>
                <div className="hf-word-vortex-tail tail-ai" />
              </div>
            )}
          </div>

          {/* High-Performance 3D Tornado Canvas */}
          <canvas ref={canvasRef} className="hf-tornado-canvas" />
        </div>

        {/* 3D Word Landing Ground Zone */}
        <div className="hf-brand-emblem-zone">
          <div className={`hf-brand-badge-pill ${grandLockup ? 'hf-badge-ignited' : ''}`}>
            <span className="hf-spark-icon">✦</span>
            <span>NEXT-GEN CAREER INTELLIGENCE</span>
          </div>

          {/* Word Landing Runway: Words Fall from Tornado One After Another */}
          <div className="hf-brand-name-group">
            
            {/* WORD 1: HIRE */}
            <div className={`hf-word-capsule slot-hire ${hireStage}`}>
              <span className="hf-brand-title-text hf-text-hire">Hire</span>
              {hireStage === 'landed' && <div className="hf-word-impact-flare" />}
            </div>

            {/* WORD 2: FLOW */}
            <div className={`hf-word-capsule slot-flow ${flowStage}`}>
              <span className="hf-brand-title-text hf-title-accent">Flow</span>
              {flowStage === 'landed' && <div className="hf-word-impact-flare flare-cyan" />}
            </div>

            {/* WORD 3: AI CHIP */}
            <div className={`hf-word-capsule slot-ai ${aiStage}`}>
              <span className="hf-brand-ai-chip">AI</span>
              {aiStage === 'landed' && <div className="hf-word-impact-flare flare-indigo" />}
            </div>

          </div>

          {/* Grand Shimmer Sweep across the Unified Brand Lockup */}
          {grandLockup && <div className="hf-grand-sheen-sweep" />}

          <p className={`hf-brand-tagline ${grandLockup ? 'hf-tagline-visible' : ''}`}>
            Empowering modern candidates with real-time enterprise ATS simulation
          </p>
        </div>

        {/* Floating Glassmorphic Progress Console */}
        <div className="hf-sky-console">
          <div className="hf-console-bar-track">
            <div 
              className="hf-console-bar-fill" 
              style={{ width: `${Math.min(100, progress)}%` }}
            >
              <div className="hf-console-shimmer" />
            </div>
          </div>

          <div className="hf-console-meta">
            <div className="hf-status-indicator">
              <span className="hf-status-dot" />
              <span className="hf-status-text">{statusText}</span>
            </div>
            <span className="hf-percent-counter">{Math.floor(progress)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
