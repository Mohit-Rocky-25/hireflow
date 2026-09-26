// ============================================================
// HireFlow — Public Candidate Portal
// • Resume & Portfolio upload (drag-drop)
// • Application status tracker for all listed companies
// • Skill preview from uploaded resume (AI-simulated)
// • Company directory with open roles
// ============================================================
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../store/useStore";
import {
  Sparkles, Upload, FileText, Briefcase, Building2,
  CheckCircle, Clock, XCircle, ArrowRight, Brain,
  Globe, MapPin, Users, ChevronRight, Trash2,
  Eye, Search, Star, ExternalLink, AlertCircle
} from "lucide-react";
import { Button, Badge } from "../../components/ui/Components";

// ── Types ─────────────────────────────────────────────────────────────────────
type StatusKey = "APPLIED" | "SCREENING" | "REVIEW" | "SHORTLISTED" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  APPLIED:     { label: "Applied",     color: "text-text-secondary", bg: "bg-surface-3",    border: "border-border",         icon: Clock },
  SCREENING:   { label: "Screening",   color: "text-info",           bg: "bg-info-bg",      border: "border-info/20",        icon: Brain },
  REVIEW:      { label: "In Review",   color: "text-ai",             bg: "bg-ai-light",     border: "border-ai/20",          icon: Eye },
  SHORTLISTED: { label: "Shortlisted", color: "text-primary",        bg: "bg-primary-light",border: "border-primary/20",     icon: Star },
  INTERVIEW:   { label: "Interview",   color: "text-primary",        bg: "bg-primary-light",border: "border-primary/20",     icon: Users },
  OFFER:       { label: "Offer 🎉",   color: "text-success",         bg: "bg-success-bg",   border: "border-success/20",     icon: CheckCircle },
  HIRED:       { label: "Hired ✅",   color: "text-success",         bg: "bg-success-bg",   border: "border-success/20",     icon: CheckCircle },
  REJECTED:    { label: "Rejected",    color: "text-danger",          bg: "bg-danger-bg",    border: "border-danger/20",      icon: XCircle },
};

// ── Simulated extracted skills from a resume ──────────────────────────────────
const SIMULATED_SKILLS = ["React", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL", "REST APIs", "GraphQL", "System Design", "Git", "Agile/Scrum"];

// ── Pipeline Steps ────────────────────────────────────────────────────────────
const PIPELINE_STEPS: StatusKey[] = ["APPLIED", "SCREENING", "REVIEW", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED"];

function getStepIndex(status: StatusKey) {
  if (status === "REJECTED") return -1;
  return PIPELINE_STEPS.indexOf(status);
}

// ══════════════════════════════════════════════════════════════════════════════
export function CandidatePortal() {
  const { jobs, companies } = useStore();

  // ── Upload state ─────────────────────────────────────────────────────────
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioSaved, setPortfolioSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Status tracker state ─────────────────────────────────────────────────
  const [trackerEmail, setTrackerEmail] = useState("");
  const [trackerSubmitted, setTrackerSubmitted] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "status" | "companies">("upload");

  // ── Simulated application statuses (demo data) ────────────────────────────
  const demoStatuses: { company: string; role: string; status: StatusKey; date: string; companyId: string }[] = [
    { company: "Alpha Technologies", role: "Senior Frontend Engineer", status: "INTERVIEW", date: "2026-09-20", companyId: "comp-alpha-tech" },
    { company: "Beta Solutions", role: "Data Engineer", status: "SCREENING", date: "2026-09-22", companyId: "comp-beta-solutions" },
    { company: "Google India", role: "Software Engineer III", status: "REJECTED", date: "2026-09-10", companyId: "" },
    { company: "Microsoft APAC", role: "Frontend Developer", status: "SHORTLISTED", date: "2026-09-18", companyId: "" },
    { company: "Amazon AWS", role: "Cloud Solutions Engineer", status: "APPLIED", date: "2026-09-24", companyId: "" },
    { company: "Flipkart", role: "UI Engineer", status: "OFFER", date: "2026-09-15", companyId: "" },
  ];

  const publishedJobs = jobs.filter(j => j.status === "published");
  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.industry.toLowerCase().includes(companySearch.toLowerCase())
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFile = (name: string) => {
    setResumeFile(name);
    setParsing(true);
    setExtractedSkills([]);
    setTimeout(() => {
      setParsing(false);
      setExtractedSkills(SIMULATED_SKILLS);
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f.name);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f.name);
  };

  const handlePortfolioSave = () => {
    if (portfolioUrl.trim()) setPortfolioSaved(true);
  };

  const handleTrackerSubmit = () => {
    if (trackerEmail.trim()) setTrackerSubmitted(true);
  };

  const TABS = [
    { id: "upload" as const, label: "Resume & Portfolio", icon: Upload },
    { id: "status" as const, label: "Application Status", icon: Briefcase },
    { id: "companies" as const, label: "Company Directory", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Navbar ── */}
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-[24px] h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] rounded-md bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shadow-glow-orange">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[18px] font-bold text-text tracking-[-0.02em]">HireFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-[24px]">
            <Link to="/jobs" className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors">Browse Jobs</Link>
            <Link to="/demo" className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors">AI Demo</Link>
          </div>
          <div className="flex items-center gap-[10px]">
            <Link to="/login" className="px-[16px] py-[8px] rounded-md text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-all">Sign In</Link>
            <Link to="/register">
              <Button variant="header" className="h-[40px] px-[18px] text-[14px]">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-mesh border-b border-border py-[64px] px-[24px] relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-[-30%] right-[8%] w-[400px] h-[400px] rounded-full bg-ai-dark/6 blur-[100px]" />
        </div>
        <div className="max-w-[760px] mx-auto text-center relative z-10 page-enter">
          <div className="inline-flex items-center gap-[8px] px-[14px] py-[6px] rounded-full bg-primary-light border border-primary/20 text-[12px] font-semibold text-primary mb-[24px]">
            <Users className="w-[12px] h-[12px]" /> Candidate Portal
          </div>
          <h1 className="text-[42px] sm:text-[52px] font-extrabold text-text mb-[16px] tracking-[-0.04em] leading-[1.05]">
            Your career,{" "}
            <span className="gradient-text">one place</span>
          </h1>
          <p className="text-[17px] text-text-secondary leading-[28px] mb-[36px]">
            Upload your resume and portfolio, track your application status across all listed companies including top MNCs — no account needed to check your status.
          </p>
          <div className="flex flex-col sm:flex-row gap-[10px] justify-center">
            <button onClick={() => setActiveTab("upload")} className="h-[48px] px-[28px] text-[15px] font-bold text-white rounded-xl bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.02] transition-all flex items-center justify-center gap-[8px]">
              <Upload className="w-[16px] h-[16px]" /> Upload Resume
            </button>
            <button onClick={() => setActiveTab("status")} className="h-[48px] px-[28px] text-[15px] font-semibold text-text-secondary rounded-xl border border-border-strong hover:border-border-accent hover:text-text hover:bg-surface-2 transition-all flex items-center justify-center gap-[8px]">
              <Briefcase className="w-[16px] h-[16px]" /> Track Status
            </button>
          </div>
        </div>
      </section>

      {/* ── Tab Nav ── */}
      <div className="bg-surface border-b border-border sticky top-[68px] z-30">
        <div className="max-w-[1100px] mx-auto px-[24px]">
          <div className="flex gap-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-[8px] px-[20px] py-[16px] text-[14px] font-semibold border-b-2 transition-all duration-[150ms] ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-text-secondary hover:text-text hover:border-border-strong"
                  }`}
                >
                  <Icon className="w-[16px] h-[16px]" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[1100px] mx-auto px-[24px] py-[48px]">

        {/* ════════════════════ TAB 1: UPLOAD ════════════════════ */}
        {activeTab === "upload" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-[28px] page-enter">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-[24px]">
              <div>
                <h2 className="text-[22px] font-bold text-text mb-[6px] tracking-[-0.01em]">Upload Your Resume</h2>
                <p className="text-[14px] text-text-secondary">AI will extract your skills and qualifications automatically to improve match accuracy.</p>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-[48px] text-center cursor-pointer transition-all duration-[200ms] ${
                  dragActive
                    ? "border-primary bg-primary-light/30 scale-[1.01]"
                    : resumeFile
                    ? "border-success/40 bg-success-bg/30"
                    : "border-border hover:border-border-accent hover:bg-surface-2/40"
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleInput} className="hidden" />
                {resumeFile ? (
                  <div className="flex flex-col items-center gap-[12px]">
                    <div className="w-[56px] h-[56px] rounded-2xl bg-success-bg border border-success/20 flex items-center justify-center">
                      <FileText className="w-[26px] h-[26px] text-success stroke-[1.5px]" />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-text">{resumeFile}</p>
                      <p className="text-[13px] text-text-secondary mt-[4px] flex items-center justify-center gap-[6px]">
                        <CheckCircle className="w-[13px] h-[13px] text-success" />
                        {parsing ? "AI is extracting skills..." : "Parsed & ready for matching"}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setResumeFile(null); setExtractedSkills([]); }}
                      className="flex items-center gap-[6px] text-[13px] text-danger hover:underline"
                    >
                      <Trash2 className="w-[13px] h-[13px]" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-[16px]">
                    <div className="w-[56px] h-[56px] rounded-2xl bg-primary-light border border-primary/20 flex items-center justify-center">
                      <Upload className="w-[26px] h-[26px] text-primary stroke-[1.5px]" />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-text">Drop your resume here</p>
                      <p className="text-[13px] text-text-secondary mt-[4px]">or click to browse — PDF, DOCX, TXT (max 10MB)</p>
                    </div>
                    <div className="inline-flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-[13px] font-bold shadow-glow-orange">
                      <Brain className="w-[14px] h-[14px]" /> Upload & AI Parse
                    </div>
                  </div>
                )}
                {parsing && (
                  <div className="absolute inset-0 rounded-2xl bg-bg/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex items-center gap-[12px] text-ai font-semibold">
                      <Brain className="w-[20px] h-[20px] animate-pulse" />
                      <span>AI extracting your skills...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Portfolio URL */}
              <div className="bg-surface rounded-xl border border-border p-[24px] shadow-xs">
                <h3 className="text-[15px] font-bold text-text mb-[14px] flex items-center gap-[8px]">
                  <Globe className="w-[16px] h-[16px] text-primary" />
                  Portfolio / GitHub / LinkedIn
                </h3>
                <div className="flex gap-[10px]">
                  <input
                    type="url"
                    placeholder="https://github.com/yourprofile or https://portfolio.dev"
                    value={portfolioUrl}
                    onChange={e => { setPortfolioUrl(e.target.value); setPortfolioSaved(false); }}
                    className="flex-1 h-[44px] px-[14px] rounded-lg bg-surface-2 border border-border text-[14px] text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted transition-all"
                  />
                  <button
                    onClick={handlePortfolioSave}
                    className="h-[44px] px-[18px] text-[14px] font-bold text-white rounded-lg bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.02] transition-all"
                  >
                    {portfolioSaved ? "✓ Saved" : "Save"}
                  </button>
                </div>
                {portfolioSaved && (
                  <p className="text-[12px] text-success mt-[8px] flex items-center gap-[6px]">
                    <CheckCircle className="w-[12px] h-[12px]" /> Portfolio link saved — visible to recruiters who view your profile.
                  </p>
                )}
              </div>

              {/* CTA to register */}
              <div className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl border border-primary/20 p-[24px]">
                <h3 className="text-[15px] font-bold text-text mb-[8px]">Get full tracking — Create a free account</h3>
                <p className="text-[13px] text-text-secondary mb-[16px] leading-[20px]">
                  Create a free candidate account to see your AI match score for every job, receive interview invitations, and track applications in real-time.
                </p>
                <Link to="/register">
                  <button className="inline-flex items-center gap-[8px] h-[40px] px-[20px] text-[13px] font-bold text-white rounded-lg bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.01] transition-all">
                    Create Free Account <ArrowRight className="w-[14px] h-[14px]" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column — Extracted Skills */}
            <div className="lg:col-span-2 space-y-[24px]">
              <div>
                <h2 className="text-[22px] font-bold text-text mb-[6px] tracking-[-0.01em]">AI Skill Preview</h2>
                <p className="text-[14px] text-text-secondary">Skills auto-detected from your resume.</p>
              </div>

              <div className="bg-surface rounded-xl border border-border p-[24px] shadow-xs min-h-[240px]">
                {extractedSkills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[180px] text-center">
                    <div className="w-[48px] h-[48px] rounded-xl bg-ai-light border border-ai/20 flex items-center justify-center mb-[12px]">
                      <Brain className="w-[22px] h-[22px] text-ai" />
                    </div>
                    <p className="text-[14px] font-semibold text-text-secondary">Upload your resume</p>
                    <p className="text-[12px] text-text-muted mt-[4px]">AI will extract and display your skills here</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-[8px] mb-[16px]">
                      <div className="w-[28px] h-[28px] rounded-lg bg-ai-light border border-ai/20 flex items-center justify-center">
                        <Brain className="w-[14px] h-[14px] text-ai" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-text">Skills Extracted</p>
                        <p className="text-[11px] text-text-muted">{extractedSkills.length} competencies detected</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-[8px]">
                      {extractedSkills.map((skill, i) => (
                        <span key={i} className="px-[10px] py-[5px] bg-ai-light border border-ai/20 text-ai text-[12px] font-semibold rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Quick links */}
              <div className="bg-surface rounded-xl border border-border p-[20px] shadow-xs space-y-[8px]">
                <p className="text-[12px] font-bold text-text-muted uppercase tracking-[0.06em] mb-[12px]">Quick Actions</p>
                <Link to="/jobs" className="flex items-center justify-between p-[12px] rounded-lg hover:bg-surface-2 transition-colors group">
                  <span className="text-[14px] font-medium text-text-secondary group-hover:text-text">Browse all open jobs</span>
                  <ChevronRight className="w-[15px] h-[15px] text-text-muted group-hover:text-primary" />
                </Link>
                <Link to="/demo" className="flex items-center justify-between p-[12px] rounded-lg hover:bg-surface-2 transition-colors group">
                  <span className="text-[14px] font-medium text-text-secondary group-hover:text-text">Test AI match score</span>
                  <ChevronRight className="w-[15px] h-[15px] text-text-muted group-hover:text-primary" />
                </Link>
                <button onClick={() => setActiveTab("status")} className="w-full flex items-center justify-between p-[12px] rounded-lg hover:bg-surface-2 transition-colors group">
                  <span className="text-[14px] font-medium text-text-secondary group-hover:text-text">Track my applications</span>
                  <ChevronRight className="w-[15px] h-[15px] text-text-muted group-hover:text-primary" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 2: STATUS TRACKER ════════════════════ */}
        {activeTab === "status" && (
          <div className="space-y-[32px] page-enter">
            <div>
              <h2 className="text-[22px] font-bold text-text mb-[6px] tracking-[-0.01em]">Application Status Tracker</h2>
              <p className="text-[14px] text-text-secondary">Track your applications across all HireFlow-listed companies and top MNCs.</p>
            </div>

            {/* Email lookup */}
            {!trackerSubmitted ? (
              <div className="max-w-[560px] bg-surface rounded-2xl border border-border p-[32px] shadow-xs">
                <div className="flex items-center gap-[12px] mb-[24px]">
                  <div className="w-[40px] h-[40px] rounded-xl bg-ai-light border border-ai/20 flex items-center justify-center">
                    <Search className="w-[18px] h-[18px] text-ai" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-text">Look up your applications</p>
                    <p className="text-[12px] text-text-secondary">Enter the email you applied with</p>
                  </div>
                </div>
                <div className="flex gap-[10px]">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={trackerEmail}
                    onChange={e => setTrackerEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleTrackerSubmit()}
                    className="flex-1 h-[48px] px-[14px] rounded-xl bg-surface-2 border border-border text-[14px] text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted"
                  />
                  <button
                    onClick={handleTrackerSubmit}
                    className="h-[48px] px-[24px] text-[14px] font-bold text-white rounded-xl bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.02] transition-all"
                  >
                    Track
                  </button>
                </div>
                <p className="text-[12px] text-text-muted mt-[12px] flex items-center gap-[6px]">
                  <AlertCircle className="w-[12px] h-[12px]" />
                  Demo mode: any email will show sample application data
                </p>
              </div>
            ) : (
              <div className="space-y-[20px]">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] text-text-secondary">
                    Showing applications for <span className="font-bold text-text">{trackerEmail}</span>
                  </p>
                  <button
                    onClick={() => { setTrackerSubmitted(false); setTrackerEmail(""); }}
                    className="text-[13px] text-primary hover:underline font-medium"
                  >
                    Change email
                  </button>
                </div>

                {demoStatuses.map((app, i) => {
                  const cfg = STATUS_CONFIG[app.status];
                  const Icon = cfg.icon;
                  const stepIdx = getStepIndex(app.status);
                  const isRejected = app.status === "REJECTED";

                  return (
                    <div key={i} className="bg-surface rounded-2xl border border-border p-[24px] shadow-xs hover:shadow-md hover:border-border-strong transition-all">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-[12px] mb-[20px]">
                        <div>
                          <h3 className="text-[17px] font-bold text-text tracking-[-0.01em]">{app.role}</h3>
                          <p className="text-[13px] text-text-secondary flex items-center gap-[6px] mt-[4px]">
                            <Building2 className="w-[13px] h-[13px] text-text-muted" />
                            {app.company}
                            <span className="text-border-strong">·</span>
                            <Clock className="w-[11px] h-[11px] text-text-muted" />
                            Applied {new Date(app.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-[6px] px-[12px] py-[5px] rounded-full text-[12px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border} shrink-0`}>
                          <Icon className="w-[12px] h-[12px] stroke-[2px]" />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Pipeline bar */}
                      {!isRejected ? (
                        <div className="overflow-x-auto">
                          <div className="flex items-center min-w-[480px]">
                            {PIPELINE_STEPS.map((step, si) => {
                              const passed = si <= stepIdx;
                              const active = si === stepIdx;
                              return (
                                <div key={step} className="flex items-center flex-1 last:flex-none">
                                  <div className="flex flex-col items-center gap-[6px]">
                                    <div className={`w-[28px] h-[28px] rounded-full border-2 flex items-center justify-center transition-all ${
                                      active
                                        ? "border-primary bg-primary shadow-glow-orange"
                                        : passed
                                        ? "border-success bg-success-bg"
                                        : "border-border bg-surface-2"
                                    }`}>
                                      {passed && !active
                                        ? <CheckCircle className="w-[13px] h-[13px] text-success stroke-[2px]" />
                                        : active
                                        ? <div className="w-[8px] h-[8px] rounded-full bg-white" />
                                        : <div className="w-[8px] h-[8px] rounded-full bg-border" />
                                      }
                                    </div>
                                    <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? "text-primary" : passed ? "text-success" : "text-text-muted"}`}>
                                      {STATUS_CONFIG[step]?.label || step}
                                    </span>
                                  </div>
                                  {si < PIPELINE_STEPS.length - 1 && (
                                    <div className={`flex-1 h-[2px] mx-[4px] rounded transition-all ${si < stepIdx ? "bg-success" : "bg-border"}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-[12px] p-[16px] bg-danger-bg border border-danger/20 rounded-xl">
                          <XCircle className="w-[16px] h-[16px] text-danger shrink-0 mt-[1px]" />
                          <div>
                            <p className="text-[13px] font-bold text-danger">Application not progressed</p>
                            <p className="text-[12px] text-text-secondary mt-[2px]">
                              Your profile did not meet the minimum requirements for this role at this time. Consider strengthening your resume or applying to similar openings.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex gap-[12px] pt-[8px]">
                  <Link to="/jobs" className="flex-1 sm:flex-none">
                    <button className="w-full sm:w-auto h-[44px] px-[24px] text-[13px] font-bold text-white rounded-xl bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.01] transition-all flex items-center justify-center gap-[8px]">
                      Browse More Roles <ArrowRight className="w-[14px] h-[14px]" />
                    </button>
                  </Link>
                  <Link to="/demo" className="flex-1 sm:flex-none">
                    <button className="w-full sm:w-auto h-[44px] px-[24px] text-[13px] font-semibold text-text-secondary rounded-xl border border-border-strong hover:border-border-accent hover:text-text hover:bg-surface-2 transition-all flex items-center justify-center gap-[8px]">
                      <Brain className="w-[14px] h-[14px]" /> Check AI Match
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════ TAB 3: COMPANY DIRECTORY ════════════════════ */}
        {activeTab === "companies" && (
          <div className="space-y-[28px] page-enter">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[16px]">
              <div>
                <h2 className="text-[22px] font-bold text-text mb-[6px] tracking-[-0.01em]">Company Directory</h2>
                <p className="text-[14px] text-text-secondary">{companies.length} companies actively hiring on HireFlow</p>
              </div>
              <div className="relative max-w-[320px] w-full">
                <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-text-muted" />
                <input
                  type="text"
                  placeholder="Search companies or industry..."
                  value={companySearch}
                  onChange={e => setCompanySearch(e.target.value)}
                  className="w-full h-[44px] pl-[42px] pr-[14px] rounded-xl bg-surface border border-border text-[14px] text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted"
                />
              </div>
            </div>

            {/* MNC Showcase */}
            <div className="bg-gradient-to-br from-ai-dark/15 to-ai/5 border border-ai/20 rounded-2xl p-[28px]">
              <div className="flex items-center gap-[10px] mb-[20px]">
                <Star className="w-[18px] h-[18px] text-ai" />
                <h3 className="text-[15px] font-bold text-text">Top MNCs Hiring via HireFlow</h3>
                <Badge variant="ai">Featured</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-[12px]">
                {["Google", "Microsoft", "Amazon", "Flipkart", "Infosys", "TCS"].map(name => (
                  <div key={name} className="bg-surface/70 border border-border rounded-xl p-[14px] text-center hover:border-ai/30 hover:bg-surface transition-all cursor-pointer">
                    <div className="w-[36px] h-[36px] rounded-lg bg-ai-light border border-ai/20 flex items-center justify-center mx-auto mb-[8px]">
                      <Building2 className="w-[16px] h-[16px] text-ai" />
                    </div>
                    <p className="text-[12px] font-bold text-text">{name}</p>
                    <p className="text-[10px] text-text-muted mt-[2px]">2-6 openings</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Listed Companies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
              {filteredCompanies.map(company => {
                const companyJobs = publishedJobs.filter(j => j.companyId === company.id);
                return (
                  <div key={company.id} className="bg-surface rounded-xl border border-border p-[24px] shadow-xs hover:border-border-strong hover:shadow-md hover:-translate-y-[2px] transition-all duration-200">
                    <div className="flex items-start gap-[14px]">
                      <div className="w-[48px] h-[48px] rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-[22px] h-[22px] text-primary stroke-[1.5px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[16px] font-bold text-text truncate">{company.name}</h3>
                        <div className="flex flex-wrap gap-[12px] mt-[4px] text-[12px] text-text-secondary">
                          <span className="flex items-center gap-[4px]"><MapPin className="w-[11px] h-[11px]" />{company.location}</span>
                          <span className="flex items-center gap-[4px]"><Users className="w-[11px] h-[11px]" />{company.size} employees</span>
                        </div>
                        <p className="text-[12px] text-text-muted mt-[8px] line-clamp-2 leading-[18px]">{company.description}</p>
                        <div className="flex items-center gap-[10px] mt-[14px]">
                          <span className={`text-[12px] font-bold ${companyJobs.length > 0 ? "text-success" : "text-text-muted"}`}>
                            {companyJobs.length} open role{companyJobs.length !== 1 ? "s" : ""}
                          </span>
                          {company.website && (
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[12px] text-text-muted hover:text-primary flex items-center gap-[3px] transition-colors">
                              <ExternalLink className="w-[11px] h-[11px]" /> Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    {companyJobs.length > 0 && (
                      <div className="mt-[16px] pt-[16px] border-t border-border space-y-[6px]">
                        {companyJobs.slice(0, 2).map(job => (
                          <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center justify-between p-[10px] rounded-lg hover:bg-surface-2 transition-colors group">
                            <span className="text-[13px] font-medium text-text-secondary group-hover:text-text truncate">{job.title}</span>
                            <ChevronRight className="w-[14px] h-[14px] text-text-muted group-hover:text-primary shrink-0" />
                          </Link>
                        ))}
                        {companyJobs.length > 2 && (
                          <Link to="/jobs" className="block text-center text-[12px] text-primary hover:underline font-medium pt-[4px]">
                            +{companyJobs.length - 2} more roles →
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredCompanies.length === 0 && (
                <div className="col-span-2 bg-surface rounded-xl border border-border p-[48px] text-center">
                  <Building2 className="w-[40px] h-[40px] text-text-muted mx-auto mb-[12px] opacity-40" />
                  <p className="text-[15px] font-semibold text-text-secondary">No companies found</p>
                  <p className="text-[13px] text-text-muted mt-[4px]">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
