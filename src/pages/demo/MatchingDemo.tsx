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
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-[24px] h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-[12px]">
            <div className="w-[40px] h-[40px] rounded-md bg-primary flex items-center justify-center shadow-xs">
              <Sparkles className="w-[20px] h-[20px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[20px] font-bold text-text tracking-[-0.01em]">HireFlow</span>
          </Link>
          <div className="flex items-center gap-[32px]">
            <div className="hidden md:flex items-center gap-[24px]">
              <Link to="/jobs" className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">
                Browse Jobs
              </Link>
            </div>
            <div className="flex items-center gap-[12px]">
              <Link to="/login" className="px-[20px] py-[10px] rounded-md text-[15px] font-medium text-text hover:bg-surface-2 active:bg-black transition-all duration-[120ms]">
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="primary" className="h-[44px] px-[20px] text-[15px]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-[24px] py-[64px] page-enter">
        <div className="text-center mb-[64px] max-w-[800px] mx-auto">
          <div className="inline-flex items-center gap-[10px] px-[16px] py-[8px] bg-ai-light border border-ai/20 rounded-full text-[13px] font-semibold text-ai mb-[24px]">
            <Brain className="w-[16px] h-[16px] stroke-[1.5px]" />
            Explainable AI Demo
          </div>
          <h1 className="text-[40px] md:text-[48px] font-bold text-text mb-[24px] tracking-[-0.02em] leading-[1.1]">
            See how we match skills to jobs
          </h1>
          <p className="text-[18px] text-text-secondary leading-[28px]">
            Try our interactive demo to see how HireFlow extracts candidate skills and intelligently maps them to company requirements with evidence-based reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[48px]">
          {/* Company Side */}
          <div className="space-y-[24px]">
            <h2 className="text-[24px] font-bold text-text mb-[16px] flex items-center gap-[12px]">
              <Target className="w-[24px] h-[24px] text-primary" />
              Company Requirements
            </h2>
            <Card className="p-[32px]">
              <h3 className="text-[18px] font-semibold text-text mb-[16px]">Senior Frontend Engineer</h3>
              <div className="space-y-[16px]">
                <div className="p-[16px] bg-surface-2 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="font-semibold text-text">React Performance</span>
                    <Badge variant="primary">Must Have</Badge>
                  </div>
                  <p className="text-[14px] text-text-secondary">Experience optimizing large-scale React applications, reducing re-renders, and using useMemo/useCallback effectively.</p>
                </div>
                <div className="p-[16px] bg-surface-2 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="font-semibold text-text">Design System</span>
                    <Badge variant="warning">Nice to Have</Badge>
                  </div>
                  <p className="text-[14px] text-text-secondary">Experience building and maintaining component libraries using Tailwind CSS or styled-components.</p>
                </div>
                <div className="p-[16px] bg-surface-2 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="font-semibold text-text">TypeScript</span>
                    <Badge variant="primary">Must Have</Badge>
                  </div>
                  <p className="text-[14px] text-text-secondary">Strong typing skills, generic types, and deep understanding of TS utility types.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Candidate Side */}
          <div className="space-y-[24px]">
            <h2 className="text-[24px] font-bold text-text mb-[16px] flex items-center gap-[12px]">
              <Shield className="w-[24px] h-[24px] text-primary" />
              Candidate Profile
            </h2>
            <Card className="p-[32px]">
              <div className="space-y-[24px]">
                <Input label="Candidate Name" defaultValue="Alex Developer" readOnly />
                <Textarea 
                  label="Candidate Resume/Skills Extract" 
                  defaultValue="Senior UI Engineer with 5 years of experience. Built a custom component library using Tailwind CSS. Specialized in React performance tuning and memoization strategies. Strong advocate for strict TypeScript configurations."
                  rows={5}
                  readOnly
                />
                <Button variant="primary" className="w-full h-[56px] text-[16px]" onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? 'Analyzing with AI...' : 'Run AI Match Analysis'}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-[64px] animate-slide-up">
            <Card className="border-ai/30 bg-gradient-to-br from-surface to-ai-light p-[40px]">
              <div className="flex items-center gap-[16px] mb-[32px]">
                <div className="w-[64px] h-[64px] rounded-2xl bg-ai border border-ai/20 flex items-center justify-center">
                  <Brain className="w-[32px] h-[32px] text-white" />
                </div>
                <div>
                  <h2 className="text-[28px] font-bold text-text">AI Match Analysis</h2>
                  <p className="text-[16px] text-text-secondary">Match Score: <span className="text-ai font-bold">92%</span> (Strong Fit)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
                <div className="bg-surface border border-border rounded-xl p-[24px]">
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <CheckCircle className="w-[20px] h-[20px] text-success" />
                    <h3 className="text-[16px] font-bold text-text">React Performance</h3>
                  </div>
                  <p className="text-[14px] text-text-secondary">
                    <span className="font-semibold text-text">Evidence:</span> "Specialized in React performance tuning and memoization strategies."
                  </p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-[24px]">
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <CheckCircle className="w-[20px] h-[20px] text-success" />
                    <h3 className="text-[16px] font-bold text-text">Design System</h3>
                  </div>
                  <p className="text-[14px] text-text-secondary">
                    <span className="font-semibold text-text">Evidence:</span> "Built a custom component library using Tailwind CSS."
                  </p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-[24px]">
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <CheckCircle className="w-[20px] h-[20px] text-success" />
                    <h3 className="text-[16px] font-bold text-text">TypeScript</h3>
                  </div>
                  <p className="text-[14px] text-text-secondary">
                    <span className="font-semibold text-text">Evidence:</span> "Strong advocate for strict TypeScript configurations."
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
