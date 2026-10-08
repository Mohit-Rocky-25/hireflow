import React, { useEffect, useState, useCallback, useRef } from 'react';
import './CinematicLoader.css';

const LOADER_MIN_MS = 3200;

const STATUS_MESSAGES = [
  'Summoning cloud intelligence...',
  'Spinning up 75+ enterprise ATS filters...',
  'Harmonizing career trajectories...',
  'Welcome to HireFlow AI',
];

export interface CinematicLoaderProps {
  onFinish: () => void;
  isAppReady?: boolean;
}

interface TornadoParticle {
  y: number; // Height in funnel: 0 (bottom) to 1 (top)
  angle: number; // Current radial angle in radians
  speed: number; // Upward / downward speed
  rotSpeed: number; // Angular speed
  radiusNoise: number; // Individual variation
  size: number;
  alpha: number;
  colorType: number; // 0: sky blue, 1: cyan, 2: pure cloud white, 3: electric indigo
  prevX?: number;
  prevY?: number;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);
  const [isExiting, setIsExiting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const hasFinishedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

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

  // Interactive mouse tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current.targetX = normX * 25; // max tilt px
      mouseRef.current.targetY = normY * 15;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      
      if (elapsed < 900) setStatusText(STATUS_MESSAGES[0]);
      else if (elapsed < 1800) setStatusText(STATUS_MESSAGES[1]);
      else if (elapsed < 2700) setStatusText(STATUS_MESSAGES[2]);
      else setStatusText(STATUS_MESSAGES[3]);

      let target = 0;
      if (elapsed < 800) target = (elapsed / 800) * 32;
      else if (elapsed < 2300) target = 32 + ((elapsed - 800) / 1500) * 52;
      else if (elapsed < LOADER_MIN_MS) target = 84 + ((elapsed - 2300) / (LOADER_MIN_MS - 2300)) * 16;
      else target = 100;

      setProgress((prev) => {
        if (prev >= 100 || elapsed >= LOADER_MIN_MS + 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + (target - prev) * 0.32);
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Exit trigger
  useEffect(() => {
    if (progress >= 100 && !isExiting) {
      setIsExiting(true);
      setTimeout(() => finish(), 650);
    }
  }, [progress, isExiting, finish]);

  // 3D Tornado Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize 450 vortex particles
    const particleCount = 420;
    const particles: TornadoParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        y: Math.random(),
        angle: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.006,
        rotSpeed: 0.04 + Math.random() * 0.06,
        radiusNoise: 0.8 + Math.random() * 0.4,
        size: 1.2 + Math.random() * 2.8,
        alpha: 0.25 + Math.random() * 0.65,
        colorType: Math.floor(Math.random() * 4),
      });
    }

    const colors = [
      'rgba(2, 132, 199, ',   // Deep Sky Blue
      'rgba(6, 182, 212, ',   // Vibrant Cyan
      'rgba(255, 255, 255, ', // Cloud White
      'rgba(99, 102, 241, ',  // Soft Indigo/Purple
    ];

    let time = 0;

    const render = () => {
      time += 0.02;
      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2 + mouseRef.current.x;
      const topY = height * 0.12 + mouseRef.current.y * 0.5;
      const bottomY = height * 0.88 + mouseRef.current.y * 0.5;
      const funnelHeight = bottomY - topY;

      // Draw Tornado Core Glow
      const coreGrad = ctx.createRadialGradient(
        centerX,
        topY + funnelHeight * 0.45,
        15,
        centerX,
        topY + funnelHeight * 0.45,
        180
      );
      coreGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      coreGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.12)');
      coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, topY + funnelHeight * 0.45, 180, 0, Math.PI * 2);
      ctx.fill();

      // Tornado Profile Radii
      // Funnel tapers from wide at top to narrow near bottom, with natural aerodynamic waist
      const minRadius = 18;
      const maxRadius = 165;

      // Draw continuous swirling ribbons / streamlines (Blender-like wind filaments)
      const ribbonCount = 5;
      for (let r = 0; r < ribbonCount; r++) {
        ctx.beginPath();
        const ribbonOffset = (r / ribbonCount) * Math.PI * 2 + time * 1.8;
        let firstPoint = true;

        for (let step = 0; step <= 40; step++) {
          const t = step / 40; // 0 = bottom, 1 = top
          const curY = bottomY - t * funnelHeight;
          const curR = minRadius + Math.pow(t, 1.35) * (maxRadius - minRadius);
          const angle = ribbonOffset + t * Math.PI * 6.5;

          // 3D projection: tilt funnel slightly towards viewer
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

        ctx.strokeStyle = r % 2 === 0 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Sort and render particles with 3D depth
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle upward in the vortex
        p.y += p.speed;
        if (p.y > 1) {
          p.y = 0;
          p.angle = Math.random() * Math.PI * 2;
        }

        // Funnel physics: particles spin faster near the narrow bottom (conservation of angular momentum)
        const radiusT = Math.pow(p.y, 1.35);
        const currentRadius = (minRadius + radiusT * (maxRadius - minRadius)) * p.radiusNoise;
        const currentRotSpeed = p.rotSpeed * (1.8 - p.y * 0.9);
        p.angle += currentRotSpeed;

        // 3D coordinates
        const x3d = Math.cos(p.angle) * currentRadius;
        const z3d = Math.sin(p.angle) * currentRadius;
        const yPos = bottomY - p.y * funnelHeight;

        // 3D Perspective Projection
        const tiltFactor = 0.32;
        const screenX = centerX + x3d;
        const screenY = yPos + z3d * tiltFactor;

        // Depth perspective scale and lighting (particles in front are brighter and slightly larger)
        const depthNorm = (z3d / maxRadius + 1) / 2; // 0 (back) to 1 (front)
        const effectiveSize = p.size * (0.7 + depthNorm * 0.6);
        const effectiveAlpha = p.alpha * (0.2 + depthNorm * 0.8);

        // Motion trail streak
        if (p.prevX !== undefined && p.prevY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(screenX, screenY);
          ctx.strokeStyle = `${colors[p.colorType]}${effectiveAlpha * 0.8})`;
          ctx.lineWidth = effectiveSize * 0.9;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Particle head glow
        ctx.beginPath();
        ctx.arc(screenX, screenY, effectiveSize, 0, Math.PI * 2);
        ctx.fillStyle = `${colors[p.colorType]}${effectiveAlpha})`;
        ctx.fill();

        p.prevX = screenX;
        p.prevY = screenY;
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
      {/* Daylight Sky Atmosphere Background */}
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
        <button type="button" onClick={finish} className="hf-sky-skip-btn">
          <span>Skip</span>
          <span className="hf-sky-kbd">ESC</span>
        </button>
      </div>

      {/* Center 3D Stage: Sky + Tornado + Branding */}
      <div className="hf-sky-stage">
        {/* 3D Tornado Funnel Wrapper */}
        <div className="hf-tornado-wrapper">
          {/* 3D CSS Outer Vortex Rings */}
          <div className="hf-vortex-rings-3d">
            <div className="hf-vortex-ring ring-crown" />
            <div className="hf-vortex-ring ring-upper" />
            <div className="hf-vortex-ring ring-mid" />
            <div className="hf-vortex-ring ring-throat" />
            <div className="hf-vortex-ring ring-base" />
            <div className="hf-vortex-eye-pulsar" />
          </div>

          {/* Interactive 3D Tornado Canvas */}
          <canvas ref={canvasRef} className="hf-tornado-canvas" />
        </div>

        {/* Brand Reveal: HIREFLOW AI */}
        <div className="hf-brand-emblem-zone">
          <div className="hf-brand-badge-pill">
            <span className="hf-spark-icon">✦</span>
            <span>NEXT-GEN CAREER INTELLIGENCE</span>
          </div>

          <div className="hf-brand-name-group">
            <h1 className="hf-brand-title-text">
              Hire<span className="hf-title-accent">Flow</span>
            </h1>
            <span className="hf-brand-ai-chip">AI</span>
          </div>

          <p className="hf-brand-tagline">
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
