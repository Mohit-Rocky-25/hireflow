// ============================================================
// HireFlow v2 — Premium Loading / Splash Screen
// Shown on initial app load with animated logo + text
// ============================================================
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onFinish, minDuration = 2200 }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'text' | 'exit'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 400);
    const t2 = setTimeout(() => setPhase('exit'), minDuration - 400);
    const t3 = setTimeout(onFinish, minDuration);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-bg flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px] animate-pulse-glow" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-[600px] px-[24px] text-center">
        {/* Logo */}
        <div
          className={`w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-primary to-primary-active shadow-glow-orange flex items-center justify-center transition-all duration-700 ease-out ${phase === 'logo' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}
          style={{ transitionDelay: '0ms' }}
        >
          <Sparkles className="w-[36px] h-[36px] text-white stroke-[1.5px]" />
        </div>

        {/* Brand name / Heading */}
        <h1
          className={`mt-[32px] text-[36px] font-bold text-text tracking-[-0.03em] transition-all duration-700 ease-out ${phase !== 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[8px]'}`}
          style={{ transitionDelay: '150ms' }}
        >
          AI-Powered Hiring Platform
        </h1>

        {/* Tagline / Paragraph */}
        <p
          className={`mt-[16px] text-[18px] text-text-secondary leading-[28px] transition-all duration-700 ease-out ${phase !== 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[8px]'}`}
          style={{ transitionDelay: '300ms' }}
        >
          Companies define what they need. Candidates provide their qualifications. The platform analyzes the relationship between the two.
        </p>
      </div>
    </div>
  );
}
