import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle, Brain, Target, Shield } from 'lucide-react';
import { Button, Card, Badge, Input, Textarea } from '../../components/ui/Components';

export function MatchingDemo() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | 'match'>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      setResult('match');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-[24px] h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] rounded-md bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shadow-glow-orange">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[18px] font-bold text-text tracking-[-0.02em]">HireFlow</span>
          </Link>
          <div className="flex items-center gap-[28px]">
            <div className="hidden md:flex items-center gap-[24px]">
              <Link to="/jobs" className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">Browse Jobs</Link>
            </div>
            <div className="flex items-center gap-[10px]">
              <Link to="/login" className="px-[16px] py-[8px] rounded-md text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-all duration-[120ms]">Sign In</Link>
              <Link to="/register">
                <Button variant="header" className="h-[40px] px-[18px] text-[14px]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-[24px] py-[64px] page-enter">
        <div className="text-center mb-[72px] max-w-[800px] mx-auto">
          <div className="inline-flex items-center gap-[10px] px-[16px] py-[8px] bg-ai-light border border-ai/25 rounded-full text-[13px] font-semibold text-ai mb-[28px] shadow-glow-violet">
            <Brain className="w-[14px] h-[14px] stroke-[2px]" />
            Explainable AI Demo
          </div>
          <h1 className="text-[44px] md:text-[56px] font-extrabold text-text mb-[24px] tracking-[-0.04em] leading-[1.05]">
            See how we{' '}
            <span className="gradient-text-violet">match skills</span>
            {' '}to jobs
          </h1>
          <p className="text-[18px] text-text-secondary leading-[28px]">
            Try our interactive demo to see how HireFlow extracts candidate skills and intelligently maps them to company requirements with evidence-based reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[32px]">
          {/* Company Side */}
          <div className="space-y-[20px]">
            <h2 className="text-[22px] font-bold text-text flex items-center gap-[12px] tracking-[-0.01em]">
              <div className="w-[36px] h-[36px] rounded-lg bg-primary-light border border-primary/20 flex items-center justify-center">
                <Target className="w-[18px] h-[18px] text-primary stroke-[1.5px]" />
              </div>
              Company Requirements
            </h2>
            <div className="bg-surface rounded-xl border border-border p-[28px] shadow-xs">
              <div className="flex items-center gap-[10px] mb-[20px]">
                <h3 className="text-[17px] font-bold text-text">Senior Frontend Engineer</h3>
                <Badge variant="primary">3 Requirements</Badge>
              </div>
              <div className="space-y-[12px]">
                <div className="p-[16px] bg-surface-2 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="font-bold text-text text-[14px]">React Performance</span>
                    <Badge variant="primary">Must Have</Badge>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-[20px]">Experience optimizing large-scale React applications, reducing re-renders, and using useMemo/useCallback effectively.</p>
                </div>
                <div className="p-[16px] bg-surface-2 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="font-bold text-text text-[14px]">Design System</span>
                    <Badge variant="warning">Nice to Have</Badge>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-[20px]">Experience building and maintaining component libraries using Tailwind CSS or styled-components.</p>
                </div>
                <div className="p-[16px] bg-surface-2 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="font-bold text-text text-[14px]">TypeScript</span>
                    <Badge variant="primary">Must Have</Badge>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-[20px]">Strong typing skills, generic types, and deep understanding of TS utility types.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Side */}
          <div className="space-y-[20px]">
            <h2 className="text-[22px] font-bold text-text flex items-center gap-[12px] tracking-[-0.01em]">
              <div className="w-[36px] h-[36px] rounded-lg bg-ai-light border border-ai/20 flex items-center justify-center">
                <Shield className="w-[18px] h-[18px] text-ai stroke-[1.5px]" />
              </div>
              Candidate Profile
            </h2>
            <div className="bg-surface rounded-xl border border-border p-[28px] shadow-xs">
              <div className="space-y-[20px]">
                <Input label="Candidate Name" defaultValue="Alex Developer" readOnly />
                <Textarea 
                  label="Resume / Skills Extract" 
                  defaultValue="Senior UI Engineer with 5 years of experience. Built a custom component library using Tailwind CSS. Specialized in React performance tuning and memoization strategies. Strong advocate for strict TypeScript configurations."
                  rows={5}
                  readOnly
                />
                <button
                  className="w-full h-[52px] text-[15px] font-bold text-white rounded-lg bg-gradient-to-r from-ai-dark to-ai shadow-glow-violet hover:scale-[1.01] active:scale-[0.99] transition-all duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-[10px]"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  <Brain className="w-[18px] h-[18px] stroke-[1.5px]" />
                  {analyzing ? 'Analyzing with AI...' : 'Run AI Match Analysis'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-[56px] animate-slide-up">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-ai-dark/20 via-surface to-ai/10 border border-ai/30 shadow-glow-violet p-[40px]">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-ai/5 blur-[80px] pointer-events-none" />
              <div className="flex items-center gap-[20px] mb-[36px]">
                <div className="w-[64px] h-[64px] rounded-2xl bg-gradient-to-br from-ai-dark to-ai flex items-center justify-center shadow-glow-violet shrink-0">
                  <Brain className="w-[30px] h-[30px] text-white stroke-[1.5px]" />
                </div>
                <div>
                  <h2 className="text-[26px] font-bold text-text tracking-[-0.02em]">AI Match Analysis</h2>
                  <div className="flex items-center gap-[12px] mt-[6px]">
                    <p className="text-[15px] text-text-secondary">Match Score:</p>
                    <span className="text-[24px] font-extrabold gradient-text-violet">92%</span>
                    <Badge variant="ai">Strong Fit</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] relative">
                {[
                  { title: 'React Performance', evidence: 'Specialized in React performance tuning and memoization strategies.' },
                  { title: 'Design System', evidence: 'Built a custom component library using Tailwind CSS.' },
                  { title: 'TypeScript', evidence: 'Strong advocate for strict TypeScript configurations.' },
                ].map((item, i) => (
                  <div key={i} className="bg-surface border border-border/60 rounded-xl p-[20px] hover:border-ai/30 transition-colors duration-200">
                    <div className="flex items-center gap-[10px] mb-[12px]">
                      <div className="w-[28px] h-[28px] rounded-full bg-success-bg flex items-center justify-center shrink-0">
                        <CheckCircle className="w-[14px] h-[14px] text-success stroke-[2px]" />
                      </div>
                      <h3 className="text-[14px] font-bold text-text">{item.title}</h3>
                    </div>
                    <p className="text-[13px] text-text-secondary leading-[20px]">
                      <span className="font-semibold text-text">Evidence: </span>
                      &ldquo;{item.evidence}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
