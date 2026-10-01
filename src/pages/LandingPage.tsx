// ============================================================
// HireFlow — Premium Landing Page v4
// "Hire with evidence, not keywords."
// Enterprise-quality design: strong typography, evidence panels,
// clear information hierarchy, professional charts
// ============================================================
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import {
  ArrowRight, CheckCircle2, Brain, Shield, BarChart3, Users,
  Briefcase, Search, FileText, Target, TrendingUp, AlertTriangle,
  ChevronRight, Zap, Building2, Award
} from "lucide-react";
import { PublicNavbar } from "../components/layout/PublicNavbar";

// ── Mock Evidence Panel (illustrates the product concept) ──
const MOCK_ANALYSIS = {
  candidateName: "Arjun Sharma",
  role: "Senior Backend Engineer",
  company: "Acme Corp",
  eligibility: "ELIGIBLE",
  dimensions: [
    { label: "Mandatory Skill Alignment", status: "STRONG", score: 4, total: 5 },
    { label: "Experience Relevance", status: "STRONG", value: "6 yrs" },
    { label: "Project Evidence", status: "MODERATE", value: "3 projects" },
    { label: "Evidence Confidence", status: "HIGH" },
  ],
  requirements: [
    {
      name: "Java",
      priority: "MANDATORY",
      status: "STRONG",
      evidence: '"Built distributed backend microservices in Java 17 with Spring Boot..."',
      source: "experience",
    },
    {
      name: "Spring Boot",
      priority: "MANDATORY",
      status: "STRONG",
      evidence: '"Spring Boot microservices handling 2M requests/day at TechCorp..."',
      source: "experience",
    },
    {
      name: "Kafka",
      priority: "MANDATORY",
      status: "PARTIAL",
      evidence: null,
      relatedEvidence: "Candidate has RabbitMQ experience (closely related message broker)",
      semanticNote: "Message-broker experience detected via semantic analysis",
      recruiterAction: "Ask about event-driven architecture and compare Kafka vs RabbitMQ",
    },
    {
      name: "Kubernetes",
      priority: "PREFERRED",
      status: "MISSING",
      evidence: null,
      missingNote: "No evidence found. This is absence of evidence — not confirmed absence of skill.",
      recruiterAction: "Inquire during interview: 'Have you deployed to Kubernetes in production?'",
    },
  ],
};

// ── How It Works Steps ──
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Company creates a job",
    desc: "AI structures mandatory vs preferred requirements, detects ambiguity, and generates a quality analysis.",
  },
  {
    step: "02",
    title: "Candidate uploads resume",
    desc: "System extracts structured evidence — not just a list of keywords, but source, context, and confidence per skill.",
  },
  {
    step: "03",
    title: "Evidence-based matching",
    desc: "Each requirement is assessed individually: direct evidence, related skill evidence, or clearly stated as missing.",
  },
  {
    step: "04",
    title: "Recruiter reviews intelligence",
    desc: "Recruiters see what matches, what's uncertain, and what to investigate — with suggested interview questions.",
  },
];

// ── Module Cards ──
const PLATFORM_MODULES = [
  {
    icon: Brain,
    label: "AI",
    title: "Explainable Intelligence",
    desc: "Every match decision exposes its evidence, methodology, and uncertainty. No black-box scoring.",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    icon: FileText,
    label: "Resume",
    title: "Structured Resume Parsing",
    desc: "Extract skills with evidence sources, not just a flat list. Know where each claim comes from.",
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    title: "Hiring Funnel Analytics",
    desc: "Real funnel metrics: Applications → Screened → Assessed → Interviewed → Hired. Time-to-hire per role.",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    icon: Award,
    label: "Assessment",
    title: "Role-Specific Assessments",
    desc: "AI-generated questions mapped to actual job requirements and candidate skill gaps.",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    icon: Target,
    label: "Gaps",
    title: "Skill Gap Intelligence",
    desc: "For each missing skill: why it matters, what evidence is missing, what to ask in the interview, and how to learn it.",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    icon: TrendingUp,
    label: "Market",
    title: "Market Intelligence",
    desc: "Skill demand trends from real job data. Always shows source, date, and sample size.",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
];

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    STRONG: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    PARTIAL: "bg-amber-50 text-amber-700 border border-amber-200",
    MISSING: "bg-red-50 text-red-700 border border-red-200",
    UNCERTAIN: "bg-slate-50 text-slate-600 border border-slate-200",
  };
  return (
    <span className={`inline-block px-[10px] py-[2px] rounded-full text-[11px] font-bold uppercase tracking-wide ${colors[status] ?? colors.UNCERTAIN}`}>
      {status}
    </span>
  );
}

export function LandingPage() {
  const { isAuthenticated, currentUser } = useStore();

  const dashboardLink = () => {
    if (!currentUser) return "/login";
    const map: Record<string, string> = {
      PLATFORM_ADMIN: "/admin/dashboard",
      BHR_MANAGER: "/company/dashboard",
      HR_RECRUITER: "/company/dashboard",
      INTERVIEWER: "/interviewer/dashboard",
      CANDIDATE: "/candidate/dashboard",
    };
    return map[currentUser.role] ?? "/login";
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="pt-[120px] pb-[80px] px-[32px] max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[64px] items-center">
          <div>
            {/* Label */}
            <div className="inline-flex items-center gap-[8px] px-[12px] py-[6px] bg-primary-light border border-primary/20 rounded-full text-[13px] font-semibold text-primary mb-[32px]">
              <Brain className="w-[14px] h-[14px]" />
              AI-Powered Recruitment Intelligence
            </div>

            <h1 className="text-[52px] font-extrabold text-text tracking-[-0.03em] leading-[1.1] mb-[24px]">
              Hire with evidence,<br />
              <span className="text-primary">not keywords.</span>
            </h1>

            <p className="text-[18px] text-text-secondary leading-[1.7] mb-[40px] max-w-[520px]">
              AI-powered talent intelligence that helps hiring teams understand candidates, 
              identify skill gaps, automate assessment, and make faster evidence-based hiring decisions.
            </p>

            <div className="flex flex-wrap gap-[16px]">
              {isAuthenticated ? (
                <Link to={dashboardLink()}>
                  <button className="h-[48px] px-[28px] bg-primary text-white text-[15px] font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center gap-[8px] shadow-glow-orange">
                    Go to Dashboard <ArrowRight className="w-[18px] h-[18px]" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <button className="h-[48px] px-[28px] bg-primary text-white text-[15px] font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center gap-[8px] shadow-glow-orange">
                      Build Your Hiring Pipeline <ArrowRight className="w-[18px] h-[18px]" />
                    </button>
                  </Link>
                  <Link to="/demo">
                    <button className="h-[48px] px-[28px] border border-border text-text text-[15px] font-bold rounded-xl hover:bg-surface-2 transition-all flex items-center gap-[8px]">
                      <Search className="w-[16px] h-[16px]" /> Analyze Your Profile
                    </button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-[24px] mt-[40px] pt-[32px] border-t border-border">
              {[
                "Evidence-backed decisions",
                "Explainable AI",
                "No black-box scores",
              ].map(item => (
                <div key={item} className="flex items-center gap-[8px] text-[13px] text-text-muted font-medium">
                  <CheckCircle2 className="w-[14px] h-[14px] text-success flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Hero: Mini Evidence Panel */}
          <div className="bg-surface border border-border rounded-2xl shadow-md overflow-hidden">
            <div className="px-[24px] py-[16px] border-b border-border bg-surface-2/60 flex items-center justify-between">
              <div>
                <p className="text-[13px] text-text-muted font-medium">Candidate Intelligence</p>
                <h3 className="text-[15px] font-bold text-text">{MOCK_ANALYSIS.candidateName} → {MOCK_ANALYSIS.role}</h3>
              </div>
              <span className="px-[10px] py-[4px] bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full uppercase">
                {MOCK_ANALYSIS.eligibility}
              </span>
            </div>

            <div className="p-[24px] space-y-[16px]">
              {MOCK_ANALYSIS.requirements.map(req => (
                <div key={req.name} className="border border-border rounded-xl p-[16px] bg-surface space-y-[8px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[14px] font-bold text-text">{req.name}</span>
                      <span className="ml-[8px] text-[11px] font-semibold text-text-muted uppercase">{req.priority}</span>
                    </div>
                    <StatusPill status={req.status} />
                  </div>

                  {req.evidence && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-[12px] py-[8px]">
                      <p className="text-[12px] text-text-muted font-semibold mb-[2px]">EVIDENCE · {req.source}</p>
                      <p className="text-[12px] text-text-secondary italic">{req.evidence}</p>
                    </div>
                  )}

                  {req.relatedEvidence && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-[12px] py-[8px]">
                      <p className="text-[12px] text-amber-700 font-semibold mb-[2px]">RELATED · Semantic Match</p>
                      <p className="text-[12px] text-text-secondary">{req.relatedEvidence}</p>
                      {req.semanticNote && <p className="text-[11px] text-text-muted mt-[2px]">{req.semanticNote}</p>}
                    </div>
                  )}

                  {req.missingNote && (
                    <div className="bg-surface-2 border border-border rounded-lg px-[12px] py-[8px]">
                      <p className="text-[12px] text-text-muted">{req.missingNote}</p>
                    </div>
                  )}

                  {req.recruiterAction && (
                    <p className="text-[11px] text-primary font-semibold flex items-center gap-[4px]">
                      <ChevronRight className="w-[12px] h-[12px]" /> {req.recruiterAction}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="px-[24px] py-[12px] border-t border-border bg-surface-2/40 text-center">
              <p className="text-[11px] text-text-muted font-medium">
                🔍 DEMO DATA · Evidence engine v1.0 · Knowledge base v1.0
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section className="py-[80px] px-[32px] bg-surface-2/30 border-y border-border">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
            <div className="flex gap-[16px]">
              <div className="w-[40px] h-[40px] bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-[18px] h-[18px] text-red-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-text mb-[6px]">Unexplained "AI says 83%" scores</h3>
                <p className="text-[14px] text-text-secondary">Percentage without evidence is noise. Recruiters need to know <em>why</em> a candidate matches.</p>
              </div>
            </div>
            <div className="flex gap-[16px]">
              <div className="w-[40px] h-[40px] bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-[18px] h-[18px] text-red-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-text mb-[6px]">Keyword matching that misses context</h3>
                <p className="text-[14px] text-text-secondary">A candidate with RabbitMQ experience fails a Kafka search. Semantic relationships are ignored.</p>
              </div>
            </div>
            <div className="flex gap-[16px]">
              <div className="w-[40px] h-[40px] bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-[18px] h-[18px] text-red-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-text mb-[6px]">Missing evidence vs confirmed absence</h3>
                <p className="text-[14px] text-text-secondary">"No evidence found" and "candidate doesn't know this" are different statements. Most systems confuse them.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-[80px] px-[32px] max-w-[1280px] mx-auto">
        <div className="text-center mb-[56px]">
          <h2 className="text-[36px] font-bold text-text tracking-tight mb-[12px]">How it works</h2>
          <p className="text-[16px] text-text-secondary max-w-[560px] mx-auto">Four stages from job creation to interview preparation — fully transparent at every step.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="relative">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-[28px] left-[calc(100%)] w-full h-[1px] bg-border z-0" style={{ width: '24px', left: 'calc(100% + 0px)' }} />
              )}
              <div className="bg-surface border border-border rounded-2xl p-[24px] h-full">
                <div className="w-[48px] h-[48px] bg-primary-light border border-primary/20 rounded-xl flex items-center justify-center mb-[16px]">
                  <span className="text-[16px] font-black text-primary">{step.step}</span>
                </div>
                <h3 className="text-[15px] font-bold text-text mb-[8px]">{step.title}</h3>
                <p className="text-[13px] text-text-secondary leading-[1.6]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORM MODULES ── */}
      <section className="py-[80px] px-[32px] bg-surface-2/30 border-y border-border">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-[56px]">
            <h2 className="text-[36px] font-bold text-text tracking-tight mb-[12px]">Platform modules</h2>
            <p className="text-[16px] text-text-secondary max-w-[560px] mx-auto">Every module is built around evidence and explainability. No decorative AI features.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {PLATFORM_MODULES.map((mod, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-[28px] hover:shadow-md hover:border-primary/30 transition-all">
                <div className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[11px] font-bold border mb-[20px] ${mod.color}`}>
                  <mod.icon className="w-[12px] h-[12px]" />
                  {mod.label}
                </div>
                <h3 className="text-[16px] font-bold text-text mb-[8px]">{mod.title}</h3>
                <p className="text-[14px] text-text-secondary leading-[1.6]">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-[100px] px-[32px] max-w-[1280px] mx-auto">
        <div className="bg-surface border border-border rounded-3xl p-[64px] flex flex-col md:flex-row gap-[48px] items-center">
          <div className="flex-1">
            <h2 className="text-[36px] font-bold text-text tracking-tight mb-[16px]">Ready to hire with evidence?</h2>
            <p className="text-[16px] text-text-secondary max-w-[480px]">
              Join companies that have moved from keyword guessing to evidence-backed hiring decisions.
            </p>
          </div>
          <div className="flex flex-col gap-[16px] shrink-0">
            <Link to="/register">
              <button className="w-full h-[52px] px-[32px] bg-primary text-white text-[15px] font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center gap-[8px] shadow-glow-orange justify-center">
                <Building2 className="w-[18px] h-[18px]" /> Build Your Hiring Pipeline
              </button>
            </Link>
            <Link to="/demo">
              <button className="w-full h-[52px] px-[32px] border border-border text-text text-[15px] font-bold rounded-xl hover:bg-surface-2 transition-all flex items-center gap-[8px] justify-center">
                <Search className="w-[18px] h-[18px]" /> Analyze Your Profile
              </button>
            </Link>
            <Link to="/login">
              <button className="w-full h-[52px] px-[32px] text-text-secondary text-[14px] font-medium hover:text-text transition-colors">
                Sign in to existing account →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-[32px] px-[32px]">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[28px] h-[28px] bg-primary rounded-md flex items-center justify-center">
              <Brain className="w-[14px] h-[14px] text-white" />
            </div>
            <span className="text-[15px] font-bold text-text">HireFlow AI</span>
            <span className="text-[13px] text-text-muted">Recruitment Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-[32px] text-[13px] text-text-muted">
            <Link to="/demo" className="hover:text-text transition-colors">AI Demo</Link>
            <Link to="/jobs" className="hover:text-text transition-colors">Browse Jobs</Link>
            <Link to="/login" className="hover:text-text transition-colors">Sign In</Link>
          </div>
          <p className="text-[12px] text-text-muted">© 2026 HireFlow. Demo environment — fictional data only.</p>
        </div>
      </footer>
    </div>
  );
}
