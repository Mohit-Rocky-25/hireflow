// ============================================================
// HireFlow — Enhanced AI Matching Demo
// Scenarios: Strong Match, Partial Match (with suggestions), Full Rejection
// ============================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, Brain, Target, Shield, CheckCircle, XCircle,
  AlertTriangle, Lightbulb, ArrowRight, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { Badge, Input, Textarea, Button } from "../../components/ui/Components";

// ─── Demo Scenarios ───────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    id: "strong",
    label: "Strong Match",
    color: "text-success",
    bgColor: "from-success/15 to-success/5",
    borderColor: "border-success/30",
    glowClass: "shadow-[0_0_24px_rgba(52,211,153,0.30)]",
    candidateName: "Alex Developer",
    candidateSkills:
      "Senior UI Engineer with 5 years of experience. Built a custom component library using Tailwind CSS. Specialized in React performance tuning and memoization strategies. Strong advocate for strict TypeScript configurations with generics and utility types.",
    score: 92,
    verdict: "Strong Fit",
    verdictBadge: "success" as const,
    rejectionReason: null,
    suggestions: [],
    skillBreakdown: [
      { skill: "React Performance", status: "pass", evidence: "Specialized in React performance tuning and memoization strategies.", weight: 40 },
      { skill: "Design System", status: "pass", evidence: "Built a custom component library using Tailwind CSS.", weight: 20 },
      { skill: "TypeScript", status: "pass", evidence: "Strong advocate for strict TypeScript with generics and utility types.", weight: 40 },
    ],
  },
  {
    id: "partial",
    label: "Partial Match",
    color: "text-warning",
    bgColor: "from-warning/15 to-warning/5",
    borderColor: "border-warning/30",
    glowClass: "shadow-[0_0_24px_rgba(252,211,77,0.30)]",
    candidateName: "Sam Frontend",
    candidateSkills:
      "Frontend developer with 2 years of React experience. Mostly worked on small startup projects. Basic JavaScript knowledge. Limited TypeScript experience — used only for simple type annotations.",
    score: 54,
    verdict: "Partial Fit",
    verdictBadge: "warning" as const,
    rejectionReason: "Candidate lacks required depth in React performance optimization and has only basic TypeScript knowledge — not sufficient for a senior-level role.",
    suggestions: [
      "Complete an advanced React course focused on useMemo, useCallback, and rendering optimization.",
      "Build a production-scale TypeScript project using generics, conditional types, and mapped types.",
      "Contribute to or build a reusable component library to demonstrate design system experience.",
      "Apply for a mid-level Frontend Engineer role to build the required experience first.",
    ],
    skillBreakdown: [
      { skill: "React Performance", status: "partial", evidence: "2 years React experience on small projects — no mention of performance tuning.", weight: 40 },
      { skill: "Design System", status: "pass", evidence: "Frontend work suggests UI component experience.", weight: 20 },
      { skill: "TypeScript", status: "fail", evidence: "Only basic type annotations — generics and utility types not demonstrated.", weight: 40 },
    ],
  },
  {
    id: "rejected",
    label: "Rejected",
    color: "text-danger",
    bgColor: "from-danger/15 to-danger/5",
    borderColor: "border-danger/30",
    glowClass: "shadow-[0_0_24px_rgba(248,113,113,0.30)]",
    candidateName: "Jordan Designer",
    candidateSkills:
      "Graphic designer with Figma and Adobe XD expertise. Created marketing assets and social media graphics. No programming experience. Familiar with HTML basics.",
    score: 12,
    verdict: "Not a Fit",
    verdictBadge: "danger" as const,
    rejectionReason: "Candidate has no programming experience and lacks all mandatory technical requirements for this engineering role — a graphic design background does not align with the job needs.",
    suggestions: [
      "This role requires software engineering skills. Consider applying for UI/UX Designer or Product Designer positions instead.",
      "If interested in frontend engineering, start with a structured JavaScript + React bootcamp (6-12 months).",
      "Explore HireFlow\u2019s design-focused job listings which may better match your Figma and visual design background.",
      "Consider a UX Engineer transition path: master HTML/CSS first, then JavaScript, then frameworks.",
    ],
    skillBreakdown: [
      { skill: "React Performance", status: "fail", evidence: "No programming experience mentioned. HTML basics only.", weight: 40 },
      { skill: "Design System", status: "partial", evidence: "Figma design experience is adjacent but not the same as building coded component libraries.", weight: 20 },
      { skill: "TypeScript", status: "fail", evidence: "No TypeScript or JavaScript engineering experience found.", weight: 40 },
    ],
  },
];

const REQUIREMENTS = [
  { skill: "React Performance", level: "Must Have", desc: "Experience optimizing large-scale React applications, reducing re-renders, using useMemo/useCallback." },
  { skill: "Design System", level: "Nice to Have", desc: "Experience building and maintaining component libraries using Tailwind CSS or styled-components." },
  { skill: "TypeScript", level: "Must Have", desc: "Strong typing skills, generic types, and deep understanding of TS utility types." },
];

const STATUS_META = {
  pass: { icon: CheckCircle, color: "text-success", bg: "bg-success-bg border-success/20", label: "Met" },
  partial: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning-bg border-warning/20", label: "Partial" },
  fail: { icon: XCircle, color: "text-danger", bg: "bg-danger-bg border-danger/20", label: "Not Met" },
};

export function MatchingDemo() {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | typeof SCENARIOS[0]>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setResult(null);
    setShowSuggestions(false);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(selectedScenario);
    }, 2200);
  };

  const scoreColor = result
    ? result.score >= 75
      ? "from-success to-emerald-400"
      : result.score >= 40
      ? "from-warning to-yellow-400"
      : "from-danger to-rose-400"
    : "from-ai-dark to-ai";

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
              <Link to="/jobs" className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors">Browse Jobs</Link>
              <Link to="/portal" className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors">Candidate Portal</Link>
            </div>
            <div className="flex items-center gap-[10px]">
              <Link to="/login" className="px-[16px] py-[8px] rounded-md text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-all">Sign In</Link>
              <Link to="/register">
                <Button variant="header" className="h-[40px] px-[18px] text-[14px]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-[24px] py-[64px] page-enter">
        {/* Hero */}
        <div className="text-center mb-[64px] max-w-[780px] mx-auto">
          <div className="inline-flex items-center gap-[10px] px-[16px] py-[8px] bg-ai-light border border-ai/25 rounded-full text-[13px] font-semibold text-ai mb-[28px] shadow-glow-violet">
            <Brain className="w-[14px] h-[14px] stroke-[2px]" />
            Explainable AI Matching — 3 Live Scenarios
          </div>
          <h1 className="text-[44px] md:text-[56px] font-extrabold text-text mb-[20px] tracking-[-0.04em] leading-[1.05]">
            See exactly how AI{" "}
            <span className="gradient-text-violet">evaluates candidates</span>
          </h1>
          <p className="text-[17px] text-text-secondary leading-[28px]">
            Choose a scenario — Strong Match, Partial Fit, or Rejected — and watch our AI engine explain every decision with evidence and actionable improvement suggestions.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="flex flex-col sm:flex-row gap-[10px] justify-center mb-[48px]">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedScenario(s); setResult(null); setShowSuggestions(false); }}
              className={`flex-1 max-w-[200px] mx-auto sm:mx-0 h-[48px] px-[20px] text-[14px] font-bold rounded-xl border-2 transition-all duration-[150ms] ${
                selectedScenario.id === s.id
                  ? `${s.color} ${s.borderColor} bg-gradient-to-br ${s.bgColor}`
                  : "text-text-secondary border-border hover:border-border-strong hover:bg-surface-2"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[28px]">
          {/* Left: Requirements */}
          <div className="space-y-[18px]">
            <h2 className="text-[20px] font-bold text-text flex items-center gap-[10px] tracking-[-0.01em]">
              <div className="w-[34px] h-[34px] rounded-lg bg-primary-light border border-primary/20 flex items-center justify-center">
                <Target className="w-[16px] h-[16px] text-primary stroke-[1.5px]" />
              </div>
              Job Requirements — Senior Frontend Engineer
            </h2>
            <div className="bg-surface rounded-xl border border-border p-[24px] shadow-xs space-y-[10px]">
              {REQUIREMENTS.map((r, i) => (
                <div key={i} className="p-[14px] bg-surface-2 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-[6px]">
                    <span className="font-bold text-text text-[14px]">{r.skill}</span>
                    <Badge variant={r.level === "Must Have" ? "primary" : "warning"}>{r.level}</Badge>
                  </div>
                  <p className="text-[12px] text-text-secondary leading-[18px]">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Candidate Input */}
          <div className="space-y-[18px]">
            <h2 className="text-[20px] font-bold text-text flex items-center gap-[10px] tracking-[-0.01em]">
              <div className="w-[34px] h-[34px] rounded-lg bg-ai-light border border-ai/20 flex items-center justify-center">
                <Shield className="w-[16px] h-[16px] text-ai stroke-[1.5px]" />
              </div>
              Candidate Profile
            </h2>
            <div className="bg-surface rounded-xl border border-border p-[24px] shadow-xs space-y-[18px]">
              <Input label="Candidate Name" value={selectedScenario.candidateName} readOnly />
              <Textarea
                label="Resume / Skills Extract"
                value={selectedScenario.candidateSkills}
                rows={5}
                readOnly
              />
              <button
                className="w-full h-[52px] text-[15px] font-bold text-white rounded-xl bg-gradient-to-r from-ai-dark to-ai shadow-glow-violet hover:scale-[1.01] active:scale-[0.99] transition-all duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-[10px]"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <><RefreshCw className="w-[16px] h-[16px] animate-spin" /> Analyzing with AI...</>
                ) : (
                  <><Brain className="w-[16px] h-[16px] stroke-[1.5px]" /> Run AI Match Analysis</>
                )}
              </button>
              {/* Scenario hint */}
              <p className="text-[12px] text-text-muted text-center">
                Scenario: <span className={`font-semibold ${selectedScenario.color}`}>{selectedScenario.label}</span> — switch above to explore different outcomes
              </p>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        {result && (
          <div className="mt-[48px] animate-slide-up space-y-[20px]">

            {/* Score Card */}
            <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${result.bgColor} border ${result.borderColor} ${result.glowClass} p-[36px]`}>
              <div className="absolute top-0 right-0 w-[280px] h-[280px] rounded-full bg-current opacity-5 blur-[80px] pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[20px]">
                {/* Score ring */}
                <div className="relative w-[88px] h-[88px] shrink-0">
                  <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
                    <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                    <circle
                      cx="44" cy="44" r="36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - result.score / 100)}`}
                      strokeLinecap="round"
                      className={result.color}
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`text-[22px] font-extrabold ${result.color} leading-none`}>{result.score}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-[12px] mb-[8px] flex-wrap">
                    <h2 className="text-[24px] font-bold text-text tracking-[-0.02em]">AI Match Analysis</h2>
                    <Badge variant={result.verdictBadge}>{result.verdict}</Badge>
                  </div>
                  {result.rejectionReason && (
                    <p className="text-[14px] text-text-secondary leading-[22px] max-w-[540px]">
                      <span className="font-semibold text-text">Reason: </span>
                      {result.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="bg-surface rounded-2xl border border-border p-[28px] shadow-xs">
              <h3 className="text-[16px] font-bold text-text mb-[16px] tracking-[-0.01em]">Skill-by-Skill Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
                {result.skillBreakdown.map((item, i) => {
                  const meta = STATUS_META[item.status as keyof typeof STATUS_META];
                  const Icon = meta.icon;
                  return (
                    <div key={i} className={`rounded-xl border p-[18px] ${meta.bg}`}>
                      <div className="flex items-center justify-between mb-[10px]">
                        <div className="flex items-center gap-[8px]">
                          <Icon className={`w-[15px] h-[15px] ${meta.color} stroke-[2px]`} />
                          <h4 className="text-[13px] font-bold text-text">{item.skill}</h4>
                        </div>
                        <span className={`text-[11px] font-bold ${meta.color}`}>{meta.label}</span>
                      </div>
                      <p className="text-[12px] text-text-secondary leading-[18px]">
                        <span className="font-semibold text-text">Evidence: </span>
                        &ldquo;{item.evidence}&rdquo;
                      </p>
                      <div className="mt-[10px]">
                        <div className="flex items-center justify-between text-[11px] text-text-muted mb-[4px]">
                          <span>Weight: {item.weight}%</span>
                        </div>
                        <div className="h-[4px] rounded-full bg-surface-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.status === "pass" ? "bg-success" : item.status === "partial" ? "bg-warning" : "bg-danger"}`}
                            style={{ width: item.status === "pass" ? "100%" : item.status === "partial" ? "45%" : "10%" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions Panel (only for non-perfect matches) */}
            {result.suggestions.length > 0 && (
              <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="w-full flex items-center justify-between px-[28px] py-[20px] hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[36px] h-[36px] rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center">
                      <Lightbulb className="w-[18px] h-[18px] text-primary stroke-[1.5px]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-bold text-text">AI Improvement Suggestions</p>
                      <p className="text-[12px] text-text-secondary">{result.suggestions.length} personalised recommendations to improve your match</p>
                    </div>
                  </div>
                  {showSuggestions
                    ? <ChevronUp className="w-5 h-5 text-text-muted shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
                  }
                </button>
                {showSuggestions && (
                  <div className="px-[28px] pb-[24px] border-t border-border space-y-[10px] pt-[20px] animate-slide-up">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-[14px] p-[16px] bg-surface-2 rounded-xl border border-border">
                        <div className="w-[26px] h-[26px] rounded-full bg-primary-light border border-primary/20 flex items-center justify-center shrink-0 mt-[1px]">
                          <span className="text-[11px] font-bold text-primary">{i + 1}</span>
                        </div>
                        <p className="text-[13px] text-text-secondary leading-[20px]">{s}</p>
                      </div>
                    ))}
                    <div className="pt-[8px] flex gap-[12px]">
                      <Link to="/jobs" className="flex-1">
                        <button className="w-full h-[44px] text-[13px] font-bold text-white rounded-xl bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.01] transition-all flex items-center justify-center gap-[8px]">
                          Browse Matching Jobs <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link to="/portal" className="flex-1">
                        <button className="w-full h-[44px] text-[13px] font-semibold text-text-secondary rounded-xl border border-border-strong hover:border-border-accent hover:text-text hover:bg-surface-2 transition-all">
                          Upload Your Resume
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
