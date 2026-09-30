// ============================================================
// HireFlow v3 — Premium Cinematic Loading / Splash Screen
// Full-screen black with animated logo, text, and loading bar
// ============================================================
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onFinish, minDuration = 2800 }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'content' | 'bar' | 'exit'>('enter');
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('content'), 200);
    const t2 = setTimeout(() => setPhase('bar'), 600);
    const t3 = setTimeout(() => setBarWidth(100), 650);
    const t4 = setTimeout(() => setPhase('exit'), minDuration - 400);
    const t5 = setTimeout(onFinish, minDuration);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [onFinish, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${phase === 'exit' ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'}`}
      style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #0D0D1A 50%, #0A0A0A 100%)' }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[700px] h-[700px] rounded-full"
          style={{
            top: '50%', left: '50%',
            transform: 'translate(-50%, -60%)',
            background: 'radial-gradient(ellipse, rgba(14,165,233,0.12) 0%, transparent 70%)',
            animation: 'pulse-glow 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            top: '60%', left: '55%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)',
            animation: 'pulse-glow 5s ease-in-out infinite 1s',
          }}
        />
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-[32px]">

        {/* Logo mark */}
        <div
          className="relative mb-[28px]"
          style={{
            opacity: phase === 'enter' ? 0 : 1,
            transform: phase === 'enter' ? 'translateY(20px) scale(0.9)' : 'translateY(0) scale(1)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Outer ring */}
          <div
            className="absolute inset-[-12px] rounded-3xl border border-white/10"
            style={{ animation: phase !== 'enter' ? 'spin 8s linear infinite' : 'none' }}
          />
          <div
            className="w-[80px] h-[80px] rounded-2xl flex items-center justify-center shadow-[0_0_60px_rgba(14,165,233,0.4)]"
            style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 60%, #8B5CF6 100%)' }}
          >
            {/* HF monogram */}
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path d="M8 8 L8 36 M8 22 L22 22 M22 8 L22 36" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M28 8 L28 22 L40 22 M28 8 L40 8" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <div
          style={{
            opacity: phase === 'enter' ? 0 : 1,
            transform: phase === 'enter' ? 'translateY(16px)' : 'translateY(0)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
          }}
        >
          <h1
            className="text-[42px] font-extrabold tracking-[-0.05em] leading-none mb-[10px]"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.75) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            HireFlow
          </h1>
          <p className="text-[15px] font-medium tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
            AI-Powered Hiring Platform
          </p>
        </div>

        {/* Tag line */}
        <p
          className="mt-[20px] text-[14px] leading-[22px] max-w-[380px]"
          style={{
            color: 'rgba(255,255,255,0.4)',
            opacity: phase !== 'enter' ? 1 : 0,
            transform: phase !== 'enter' ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.30s',
          }}
        >
          Match the right talent to the right role — instantly.
        </p>

        {/* Loading bar */}
        <div
          className="mt-[40px] w-[280px]"
          style={{
            opacity: phase === 'enter' ? 0 : 1,
            transition: 'opacity 0.5s ease 0.5s',
          }}
        >
          <div
            className="h-[3px] rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${barWidth}%`,
                background: 'linear-gradient(90deg, #0EA5E9, #8B5CF6)',
                transition: `width ${minDuration - 1000}ms cubic-bezier(0.1, 0.7, 0.1, 1)`,
                boxShadow: '0 0 12px rgba(14,165,233,0.6)',
              }}
            />
          </div>
          <div className="flex justify-between mt-[10px]">
            <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>Initializing workspace</span>
            <span className="text-[11px] font-medium" style={{ color: 'rgba(14,165,233,0.6)' }}>
              {barWidth >= 100 ? '100%' : `${Math.round(barWidth * 0.85)}%`}
            </span>
          </div>
        </div>

        {/* Bottom badges */}
        <div
          className="mt-[48px] flex items-center gap-[24px]"
          style={{
            opacity: phase !== 'enter' ? 0.4 : 0,
            transition: 'opacity 1s ease 0.6s',
          }}
        >
          {['100+ Companies', 'AI Matching', 'Real-Time'].map(label => (
            <div key={label} className="flex items-center gap-[6px]">
              <div className="w-[5px] h-[5px] rounded-full" style={{ background: '#0EA5E9' }} />
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
