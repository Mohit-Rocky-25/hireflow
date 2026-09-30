// ============================================================
// HireFlow — Minimalist Professional Loading Screen
// Clean, elegant entry that matches the app's professional feel
// ============================================================
import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';

interface LoadingScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onFinish, minDuration = 1800 }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'content' | 'exit'>('enter');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('content'), 100);
    const t2 = setTimeout(() => setPhase('exit'), minDuration - 400);
    const t3 = setTimeout(onFinish, minDuration);

    // Smooth progress bar simulation
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 15;
      });
    }, minDuration / 15);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearInterval(interval);
    };
  }, [onFinish, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg transition-all duration-500 ease-in-out ${phase === 'exit' ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'}`}
    >
      <div className="relative z-10 flex flex-col items-center text-center">
        
        {/* Animated Icon */}
        <div 
          className="w-[64px] h-[64px] rounded-2xl bg-surface border border-border shadow-sm flex items-center justify-center mb-[24px]"
          style={{
            opacity: phase === 'enter' ? 0 : 1,
            transform: phase === 'enter' ? 'scale(0.9) translateY(10px)' : 'scale(1) translateY(0)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Target className="w-[32px] h-[32px] text-primary" strokeWidth={2.5} />
        </div>

        {/* Brand */}
        <h1 
          className="text-[32px] font-extrabold text-text tracking-[-0.03em] mb-[8px]"
          style={{
            opacity: phase === 'enter' ? 0 : 1,
            transform: phase === 'enter' ? 'translateY(10px)' : 'translateY(0)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
          }}
        >
          HireFlow <span className="text-primary">AI</span>
        </h1>
        
        <p 
          className="text-[14px] text-text-secondary font-medium tracking-[0.05em] uppercase mb-[40px]"
          style={{
            opacity: phase === 'enter' ? 0 : 1,
            transform: phase === 'enter' ? 'translateY(10px)' : 'translateY(0)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
          Intelligent Talent Matching
        </p>

        {/* Clean Progress Line */}
        <div 
          className="w-[200px]"
          style={{
            opacity: phase === 'enter' ? 0 : 1,
            transition: 'opacity 0.6s ease 0.3s'
          }}
        >
          <div className="h-[2px] w-full bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-[12px]">
            <span className="text-[12px] text-text-muted font-medium">Loading workspace</span>
            <span className="text-[12px] font-semibold text-primary">{Math.min(100, Math.floor(progress))}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
