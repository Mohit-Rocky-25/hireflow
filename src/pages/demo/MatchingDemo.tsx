// ============================================================
// HireFlow — TalentLens™ Candidate Intelligence Platform v7
// Step 1: Resume Upload | Step 2: Company Selection (Grid)
// Clicking a company navigates to /demo/company/:companySlug
// ============================================================
import React, { useRef, useCallback, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Brain, CheckCircle, ArrowRight, Building2, Search,
  Upload, FileText, BarChart3, Briefcase, Zap
} from "lucide-react";
import { Button } from "../../components/ui/Components";
import { PublicNavbar } from "../../components/layout/PublicNavbar";
import {
  COMPANIES,
  INDUSTRIES,
  TIERS,
  TREND_COLOR,
  TREND_ICON,
  getCompanySlug,
} from "./talentLensData";
import { useTalentLensStore } from "./useTalentLensStore";
import { parseResumeFile } from "../../features/ats/fileParser";

export function MatchingDemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    resumeText,
    resumeFileName,
    uploadMode,
    companySearch,
    industryFilter,
    tierFilter,
    step,
    setResume,
    setUploadMode,
    setCompanySearch,
    setIndustryFilter,
    setTierFilter,
    setStep,
  } = useTalentLensStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  // Sync step from query param if provided (e.g. ?step=1 or ?step=2)
  useEffect(() => {
    const qStep = searchParams.get("step");
    if (qStep === "1" || qStep === "2") {
      setStep(parseInt(qStep, 10) as 1 | 2);
    }
  }, [searchParams, setStep]);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const res = await parseResumeFile(file);
      if (res.success && res.text) {
        setResume(res.text, res.fileName || file.name);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => setResume((e.target?.result as string) || "", file.name);
        reader.readAsText(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => setResume((e.target?.result as string) || "", file.name);
      reader.readAsText(file);
    }
  }, [setResume]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const filteredCompanies = COMPANIES.filter(c => {
    const q = companySearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.roles.some(r => r.title.toLowerCase().includes(q));
    const matchIndustry = industryFilter === "All" || c.industry.includes(industryFilter);
    const matchTier = tierFilter === "All" || c.tier === tierFilter;
    return matchSearch && matchIndustry && matchTier;
  });

  return (
    <div className="min-h-screen bg-bg">
      <PublicNavbar />
      <div className="max-w-[1400px] mx-auto px-[24px] py-[88px] page-enter">

        {/* Hero */}
        <div className="text-center mb-[48px] max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-[10px] px-[16px] py-[8px] bg-ai-light border border-ai/25 rounded-full text-[13px] font-semibold text-ai mb-[20px]">
            <Brain className="w-[14px] h-[14px]" />
            TalentLens™ · Evidence-First Placement Readiness
          </div>
          <h1 className="text-[40px] md:text-[54px] font-extrabold text-text mb-[14px] tracking-[-0.04em] leading-[1.05]">
            Where do I fit, <span className="gradient-text">and what should I prepare for?</span>
          </h1>
          <p className="text-[16px] text-text-secondary leading-[26px]">
            An evidence-first placement-readiness platform that helps you understand which roles and company paths fit your current profile, identify missing evidence, improve your resume for specific opportunities, and follow a practical preparation plan.
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-0 mb-[40px]">
          {[
            { n: 1, label: "Your Resume" },
            { n: 2, label: "Company & Role" },
            { n: 3, label: "AI Analysis" }
          ].map((s, i) => (
            <div key={s.n} className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  if (s.n === 1 || resumeText.trim()) setStep(s.n as 1 | 2 | 3);
                }}
                className={`flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl font-semibold text-[13px] transition-all ${
                  step === s.n
                    ? "bg-text text-bg shadow-md"
                    : step > s.n || (s.n === 1 && resumeText.trim())
                    ? "bg-success/15 text-success border border-success/30 hover:bg-success/20"
                    : "bg-surface border border-border text-text-secondary"
                }`}
              >
                <span
                  className={`w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-bold ${
                    step === s.n
                      ? "bg-white/20"
                      : step > s.n || (s.n === 1 && resumeText.trim())
                      ? "bg-success/20"
                      : "bg-border"
                  }`}
                >
                  {s.n === 1 && resumeText.trim() && step !== 1 ? "✓" : s.n}
                </span>
                {s.label}
              </button>
              {i < 2 && (
                <div
                  className={`w-[32px] h-[2px] mx-[2px] rounded-full ${
                    step > s.n || (s.n === 1 && resumeText.trim()) ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: RESUME INPUT ── */}
        {step === 1 && (
          <div className="max-w-[800px] mx-auto animate-fade-in">
            <div className="bg-surface border border-border rounded-2xl p-[32px] shadow-md">
              <div className="flex items-center gap-[12px] mb-[24px]">
                <div className="w-[44px] h-[44px] rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center">
                  <FileText className="w-[20px] h-[20px] text-primary" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-text">Upload Your Resume</h2>
                  <p className="text-[13px] text-text-secondary">More detail = deeper, more accurate AI analysis</p>
                </div>
              </div>

              <div className="flex gap-[2px] p-[4px] bg-surface-2 rounded-xl mb-[20px] w-fit">
                {(["paste", "upload"] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setUploadMode(mode)}
                    className={`px-[18px] py-[7px] rounded-[10px] text-[13px] font-semibold transition-all ${
                      uploadMode === mode ? "bg-surface text-text shadow-sm" : "text-text-secondary"
                    }`}
                  >
                    {mode === "paste" ? "✏️ Paste Text" : "📎 Upload File"}
                  </button>
                ))}
              </div>

              {uploadMode === "paste" ? (
                <textarea
                  value={resumeText}
                  onChange={e => setResume(e.target.value)}
                  placeholder={`Paste your complete resume here for the most accurate analysis.

Include:
• Work experience with specific technologies used and scale (million users, requests/day, etc.)
• Project descriptions with tech stack and measurable impact
• Skills section with proficiency levels
• Education (college name matters for bonus scoring)
• Open source contributions or GitHub links

Example:
"Senior Backend Engineer with 4 years experience. Built payment service in Java Spring Boot handling 5M+ transactions/day on AWS. Led team of 6 engineers. Proficient in Kafka, PostgreSQL, Redis, and Kubernetes. Solved 400+ LeetCode problems."`}
                  className="w-full h-[300px] px-[16px] py-[14px] bg-surface-2 border border-border rounded-xl text-[14px] text-text placeholder:text-text-muted font-mono resize-none focus:outline-none focus:border-primary/50 transition-colors leading-[22px]"
                />
              ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-[180px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-[10px] cursor-pointer transition-all ${
                    dragActive
                      ? "border-primary bg-primary-light"
                      : "border-border-strong bg-surface-2 hover:border-primary/40"
                  }`}
                >
                  <Upload className={`w-[36px] h-[36px] ${dragActive ? "text-primary" : "text-text-secondary"}`} />
                  <div className="text-center">
                    <p className="font-semibold text-text">{resumeFileName || "Drop your resume (.txt, .pdf, .docx)"}</p>
                    <p className="text-[12px] text-text-secondary mt-[2px]">Click to browse</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                  />
                </div>
              )}

              {resumeText.trim() && (
                <div className="mt-[14px] p-[12px] bg-success-bg border border-success/20 rounded-xl flex items-center gap-[10px]">
                  <CheckCircle className="w-[15px] h-[15px] text-success flex-shrink-0" />
                  <span className="text-[13px] text-success font-medium">
                    {resumeText.split(/\s+/).length} words loaded — deep AI analysis will begin when you select a role.
                  </span>
                </div>
              )}

              <div className="mt-[24px] flex justify-end">
                <Button
                  variant="header"
                  disabled={!resumeText.trim()}
                  onClick={() => setStep(2)}
                  className="px-[28px] py-[11px] text-[14px] font-bold rounded-xl disabled:opacity-40"
                >
                  Select Company &amp; Role <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: COMPANY SELECTION GRID ── */}
        {step >= 2 && (
          <div className="animate-fade-in">
            {/* Filter Bar */}
            <div className="bg-surface border border-border rounded-2xl p-[18px] mb-[24px] shadow-sm">
              <div className="flex flex-wrap gap-[10px] items-center">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-text-secondary" />
                  <input
                    value={companySearch}
                    onChange={e => setCompanySearch(e.target.value)}
                    placeholder="Search company or role keyword..."
                    className="w-full pl-[36px] pr-[12px] h-[38px] bg-surface-2 border border-border rounded-xl text-[13px] text-text focus:outline-none focus:border-primary/50"
                  />
                </div>
                <select
                  value={industryFilter}
                  onChange={e => setIndustryFilter(e.target.value)}
                  className="h-[38px] px-[12px] bg-surface-2 border border-border rounded-xl text-[13px] text-text focus:outline-none cursor-pointer"
                >
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <select
                  value={tierFilter}
                  onChange={e => setTierFilter(e.target.value)}
                  className="h-[38px] px-[12px] bg-surface-2 border border-border rounded-xl text-[13px] text-text focus:outline-none cursor-pointer"
                >
                  {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-[13px] text-text-secondary ml-auto">
                  {filteredCompanies.length} companies · {filteredCompanies.reduce((a, c) => a + c.roles.length, 0)} roles
                </span>
              </div>
            </div>

            {/* Responsive Companies Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] mb-[64px]">
              {filteredCompanies.map(company => (
                <Link
                  key={company.id}
                  to={`/demo/company/${getCompanySlug(company.name)}`}
                  className="group bg-surface border border-border rounded-2xl p-[20px] transition-all hover:shadow-md hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-[12px]">
                      <div className="flex items-center gap-[10px]">
                        <div
                          className={`w-[42px] h-[42px] rounded-xl bg-gradient-to-br ${company.gradient} flex items-center justify-center text-white font-extrabold text-[14px] flex-shrink-0 shadow-sm`}
                        >
                          {company.logo}
                        </div>
                        <div>
                          <div className="font-bold text-text text-[15px] group-hover:text-primary transition-colors">
                            {company.name}
                          </div>
                          <div className="text-[11px] text-text-secondary">{company.hq}</div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-[8px] py-[2px] rounded-full ${
                          company.tier === "FAANG"
                            ? "bg-ai-light text-ai"
                            : company.tier === "Unicorn"
                            ? "bg-primary-light text-primary"
                            : company.tier === "MNC"
                            ? "bg-info-bg text-info"
                            : company.tier === "Startup"
                            ? "bg-success-bg text-success"
                            : "bg-surface-3 text-text-secondary"
                        }`}
                      >
                        {company.tier}
                      </span>
                    </div>

                    {/* Mini-Stats */}
                    <div className="grid grid-cols-3 gap-[6px] mb-[12px]">
                      <div className="bg-surface-2 rounded-lg p-[8px] text-center border border-border/50">
                        <div className="text-[12px] font-bold text-text">
                          {company.hiring2024.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-text-muted">Hires 2024</div>
                        <div className={`text-[10px] font-bold ${TREND_COLOR[company.trend]}`}>
                          {TREND_ICON[company.trend]}
                        </div>
                      </div>
                      <div className="bg-surface-2 rounded-lg p-[8px] text-center border border-border/50">
                        <div className="text-[12px] font-bold text-text">{company.openRoles}+</div>
                        <div className="text-[10px] text-text-muted">Open Roles</div>
                      </div>
                      <div className="bg-surface-2 rounded-lg p-[8px] text-center border border-border/50">
                        <div className="text-[11px] font-bold text-text">⭐{company.glassdoor}</div>
                        <div className="text-[10px] text-text-muted">Glassdoor</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-text-secondary mb-[14px] font-medium">
                      {company.avgPackage} • {company.industry}
                    </div>
                  </div>

                  {/* Clean "View Roles →" Affordance */}
                  <div className="pt-[12px] border-t border-border flex items-center justify-between text-[12px] font-semibold text-primary">
                    <span className="text-text-secondary text-[11px] font-normal">
                      {company.roles.length} Roles available
                    </span>
                    <span className="inline-flex items-center gap-[4px] group-hover:translate-x-[3px] transition-transform">
                      View Roles <ArrowRight className="w-[14px] h-[14px]" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-[64px] bg-surface border border-border rounded-2xl p-[32px] mb-[64px]">
                <Building2 className="w-[36px] h-[36px] text-text-muted mx-auto mb-[12px]" />
                <h3 className="text-[16px] font-bold text-text mb-[4px]">No companies found</h3>
                <p className="text-[13px] text-text-secondary mb-[16px]">
                  Try adjusting your search query or filter options.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCompanySearch("");
                    setIndustryFilter("All");
                    setTierFilter("All");
                  }}
                  className="px-[16px] py-[8px] rounded-xl bg-surface-2 hover:bg-surface-3 text-text font-medium text-[12px] border border-border transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4-Stat Strip (Preserved as-is) */}
        <div className="mt-[56px] grid grid-cols-2 md:grid-cols-4 gap-[14px] border-t border-border pt-[40px]">
          {[
            { icon: Building2, value: `${COMPANIES.length}`, label: "Companies", sub: "FAANG to Deep Tech" },
            { icon: Briefcase, value: `${COMPANIES.reduce((a, c) => a + c.roles.length, 0)}+`, label: "Specific Roles", sub: "Real 2024-25 requirements" },
            { icon: BarChart3, value: "6-Layer", label: "Analysis Engine", sub: "Anti-gaming AI" },
            { icon: Zap, value: "TalentLens™", label: "Intelligence Platform", sub: "Candidate verification" },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-2xl p-[16px] flex items-center gap-[12px]">
              <div className="w-[40px] h-[40px] rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <div className="text-[18px] font-extrabold text-text">{s.value}</div>
                <div className="text-[12px] font-semibold text-text">{s.label}</div>
                <div className="text-[11px] text-text-muted">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}