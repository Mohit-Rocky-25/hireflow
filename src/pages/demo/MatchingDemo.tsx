// ============================================================
// HireFlow — TalentLens™ Candidate Intelligence Platform v7
// Step 1: Resume Upload | Step 2: Company Selection (Grid)
// Clicking a company navigates to /demo/company/:companySlug
// Token-driven, flat, high-contrast dark system
// ============================================================
import React, { useRef, useCallback, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Brain, CheckCircle, ArrowRight, Building2, Search,
  Upload, FileText, BarChart3, Briefcase, Zap, Sparkles, X
} from "lucide-react";
import { PublicNavbar } from "../../components/common/PublicNavbar";
import {
  COMPANIES,
  INDUSTRIES,
  TIERS,
  TREND_COLOR,
  TREND_ICON,
  getCompanySlug,
} from "./talentLensData";
import { useTalentLensStore, setCompaniesResolver } from "./useTalentLensStore";
import { useProfileStore } from "../../store/profileStore";
import { toast } from "../../components/ui/Toast";
import { parseResumeFile } from "../../features/ats/fileParser";
import { searchCompanies, deduplicateCompanies } from "../../lib/companySearchEngine";
import { getMarketSummary } from "../../data/market";
import { CompanyLogo } from "../../components/common/CompanyLogo";

setCompaniesResolver(() => COMPANIES);

export function MatchingDemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeResume } = useProfileStore();

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

  // Auto-populate active profile resume if talentLens store is currently empty
  useEffect(() => {
    if (!resumeText.trim() && activeResume?.ledger?.rawText) {
      setResume(activeResume.ledger.rawText, activeResume.label);
    }
  }, [activeResume, resumeText, setResume]);

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

  // Clean and deduplicate company catalog to merge multi-entry companies and eliminate React key collisions
  const cleanCompanies = React.useMemo(() => deduplicateCompanies(COMPANIES), []);

  // Intelligent typo-tolerant, case-insensitive multi-field search engine
  const searchResult = React.useMemo(() => {
    return searchCompanies(cleanCompanies, companySearch, {
      industryFilter,
      tierFilter,
    });
  }, [cleanCompanies, companySearch, industryFilter, tierFilter]);

  const filteredCompanies = searchResult.results;
  const scoredResults = searchResult.scoredResults;

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicNavbar />
      <div className="max-w-[1400px] mx-auto px-6 py-24 page-enter">

        {/* Hero */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-near-black border border-charcoal rounded text-xs font-semibold text-silver uppercase tracking-[1.4px] mb-4">
            <Brain className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
            <span>TalentLens™ · Evidence-First Placement Readiness</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-3.5 tracking-tight leading-[1.08]">
            Where do I fit, <span className="block text-volt">and what should I prepare for?</span>
          </h1>
          <p className="text-[15px] sm:text-[16px] text-silver leading-relaxed font-normal">
            An evidence-first placement-readiness platform that helps you understand which roles and company paths fit your current profile, identify missing evidence, improve your resume for specific opportunities, and follow a practical preparation plan.
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
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
                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold uppercase tracking-[1px] transition-colors cursor-pointer ${
                  step === s.n
                    ? "bg-near-black text-volt border border-volt shadow-level-4 font-bold"
                    : step > s.n || (s.n === 1 && resumeText.trim())
                    ? "bg-black text-white border border-charcoal hover:border-volt"
                    : "bg-black text-silver border border-charcoal"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-black ${
                    step === s.n
                      ? "bg-volt !text-black"
                      : "bg-near-black text-silver"
                  }`}
                >
                  {s.n === 1 && resumeText.trim() && step !== 1 ? "✓" : s.n}
                </span>
                {s.label}
              </button>
              {i < 2 && (
                <div
                  className={`w-8 h-[1px] mx-2 ${
                    step > s.n || (s.n === 1 && resumeText.trim()) ? "bg-volt" : "bg-charcoal"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: RESUME INPUT ── */}
        {step === 1 && (
          <div className="max-w-[800px] mx-auto animate-fade-in">
            <div className="bg-near-black border border-charcoal rounded-lg p-8 shadow-level-1">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal">
                <div className="w-10 h-10 rounded bg-black border border-charcoal flex items-center justify-center text-volt">
                  <FileText className="w-5 h-5 stroke-[1.5px]" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-white uppercase tracking-tight">Upload Your Resume</h2>
                  <p className="text-xs text-silver">More detail = deeper, more accurate AI analysis</p>
                </div>
              </div>

              {/* Active Profile Banner if resume exists in profileStore */}
              {activeResume && activeResume.ledger?.rawText && (
                <div className="mb-5 p-4 rounded bg-black border border-charcoal flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-near-black border border-charcoal flex items-center justify-center text-volt flex-shrink-0">
                      <Sparkles className="w-4 h-4 stroke-[1.5px]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white flex items-center gap-2 uppercase tracking-[1px]">
                        Active Profile: <span className="text-volt">{activeResume.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-near-black text-volt font-mono font-semibold border border-volt/60">
                          {activeResume.ledger.rawText.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                      <div className="text-[11px] text-silver mt-0.5">
                        Your saved resume from candidate profile is connected and ready for placement matching.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResume(activeResume.ledger.rawText, activeResume.label);
                      toast('success', `Loaded "${activeResume.label}" from your profile.`);
                    }}
                    className="px-3 py-1.5 rounded bg-forest text-white text-xs font-bold uppercase tracking-[1px] hover:bg-[#3a3a3a] border border-[#141414] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5 stroke-[1.5px]" />
                    {resumeText === activeResume.ledger.rawText ? 'Profile Active' : 'Load Profile'}
                  </button>
                </div>
              )}

              <div className="flex gap-1 p-1 bg-black rounded border border-charcoal mb-5 w-fit">
                {(["paste", "upload"] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setUploadMode(mode)}
                    className={`px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-[1px] transition-colors cursor-pointer ${
                      uploadMode === mode ? "bg-near-black text-volt border border-volt shadow-level-4 font-bold" : "text-silver hover:text-white"
                    }`}
                  >
                    {mode === "paste" ? "Paste Text" : "Upload File"}
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
• Open source contributions or GitHub links`}
                  className="w-full h-[300px] p-4 bg-black border border-charcoal rounded text-[13.5px] text-white placeholder:text-silver font-mono resize-none focus:outline-none focus:border-volt transition-colors leading-relaxed selection:bg-volt selection:text-black"
                />
              ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-[180px] border border-dashed rounded flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-colors ${
                    dragActive
                      ? "border-volt bg-black"
                      : "border-charcoal bg-black hover:border-volt"
                  }`}
                >
                  <Upload className={`w-8 h-8 stroke-[1.5px] ${dragActive ? "text-volt" : "text-silver"}`} />
                  <div className="text-center">
                    <p className="font-bold text-white uppercase tracking-tight">{resumeFileName || "Drop your resume (.txt, .pdf, .docx)"}</p>
                    <p className="text-xs text-silver mt-0.5">Click to browse from your computer</p>
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
                <div className="mt-4 p-3 bg-black border border-volt/60 rounded flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-volt flex-shrink-0 stroke-[1.5px]" />
                  <span className="text-xs text-volt font-semibold uppercase tracking-[1px]">
                    {resumeText.split(/\s+/).length} words loaded — deep AI analysis will begin when you select a role.
                  </span>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={!resumeText.trim()}
                  onClick={() => setStep(2)}
                  className="group px-6 py-2.5 text-xs font-bold uppercase tracking-[1.4px] rounded bg-volt !text-black border border-volt hover:bg-[#1d1d1d] hover:!text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer shadow-level-1"
                >
                  <span className="!text-black group-hover:!text-white font-black">Select Company &amp; Role</span>
                  <ArrowRight className="w-4 h-4 stroke-[2px] !text-black group-hover:!text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: COMPANY SELECTION GRID ── */}
        {step >= 2 && (
          <div className="animate-fade-in">
            {/* Filter Bar with Intelligent Search */}
            <div className="bg-near-black border border-charcoal rounded-lg p-4 mb-6 shadow-level-1">
              <div className="flex flex-wrap gap-2.5 items-center">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver stroke-[1.5px]" />
                  <input
                    value={companySearch}
                    onChange={e => setCompanySearch(e.target.value)}
                    placeholder="Search company (case & typo-tolerant: barclays, googl, TCS...)"
                    className="w-full pl-9 pr-9 h-10 bg-black border border-charcoal rounded text-xs text-white placeholder:text-silver focus:outline-none focus:border-volt transition-colors"
                  />
                  {companySearch && (
                    <button
                      type="button"
                      onClick={() => setCompanySearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-silver hover:text-white transition-colors"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5 stroke-[1.5px]" />
                    </button>
                  )}
                </div>
                <select
                  value={industryFilter}
                  onChange={e => setIndustryFilter(e.target.value)}
                  className="h-10 px-3 bg-black border border-charcoal rounded text-xs text-white focus:outline-none focus:border-volt cursor-pointer uppercase font-semibold"
                >
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <select
                  value={tierFilter}
                  onChange={e => setTierFilter(e.target.value)}
                  className="h-10 px-3 bg-black border border-charcoal rounded text-xs text-white focus:outline-none focus:border-volt cursor-pointer uppercase font-semibold"
                >
                  {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {(() => {
                  const summary = getMarketSummary();
                  return (
                    <span className="text-xs text-silver ml-auto font-mono uppercase tracking-[1px]">
                      {summary.totalProfiles} employer profiles
                    </span>
                  );
                })()}
              </div>

              {/* Typo Correction Banner ("Did you mean?") */}
              {searchResult.didYouMean && searchResult.isFuzzyMatch && (
                <div className="mt-3 pt-3 border-t border-charcoal flex items-center justify-between flex-wrap gap-2 bg-black -mx-4 -mb-4 p-3 px-4 rounded-b-lg">
                  <div className="flex items-center gap-2 text-xs text-white">
                    <Sparkles className="w-4 h-4 text-volt shrink-0 stroke-[1.5px]" />
                    <span>
                      Showing results for <strong className="text-volt font-bold">{searchResult.didYouMean}</strong> (auto-corrected from &lsquo;{companySearch}&rsquo;)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompanySearch(searchResult.didYouMean!)}
                    className="text-xs font-bold text-volt hover:underline px-2.5 py-1 rounded bg-near-black border border-volt/60 transition-colors uppercase tracking-[1px]"
                  >
                    Exact match &lsquo;{searchResult.didYouMean}&rsquo;
                  </button>
                </div>
              )}

              {/* Similar Company Word Searches */}
              {companySearch.trim() && searchResult.suggestedCompanies.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-charcoal flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-silver font-semibold uppercase tracking-[1px] flex items-center gap-1 text-[11px]">
                    <Building2 className="w-3.5 h-3.5 stroke-[1.5px]" /> Similar companies:
                  </span>
                  {searchResult.suggestedCompanies.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setCompanySearch(name)}
                      className="px-2.5 py-1 rounded bg-black hover:bg-hover-gray text-white text-[11px] font-semibold border border-charcoal hover:border-volt transition-colors uppercase tracking-[1px]"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Responsive Companies Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
              {filteredCompanies.map((company, idx) => {
                const matchInfo = scoredResults.find(m => m.company.id === company.id);

                const skillCounts: Record<string, number> = {};
                (company.roles || []).forEach(r => {
                  (r.competencies || []).forEach((c: string) => {
                    skillCounts[c] = (skillCounts[c] || 0) + 1;
                  });
                });
                const topSkills = Object.keys(skillCounts)
                  .sort((a, b) => skillCounts[b] - skillCounts[a])
                  .slice(0, 3);

                const lowerResume = (resumeText || '').toLowerCase();
                const matchedCount = topSkills.filter(s => lowerResume.includes(s)).length;
                const missingSkills = topSkills.filter(s => !lowerResume.includes(s));
                const fitLevel = !resumeText.trim()
                  ? 'Ready to Scan'
                  : matchedCount >= 2
                  ? 'Strong Fit'
                  : matchedCount === 1
                  ? 'Moderate Fit'
                  : 'Growth Opportunity';
                const biggestGap = !resumeText.trim()
                  ? null
                  : missingSkills[0] || null;

                return (
                  <Link
                    key={`${company.id}-${company.name}-${idx}`}
                    to={`/demo/company/${getCompanySlug(company.name)}`}
                    className="group bg-near-black border border-charcoal rounded-lg p-5 transition-colors hover:border-volt/60 hover:shadow-level-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-volt flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <CompanyLogo company={company} size="md" />
                          <div>
                            <div className="font-bold text-white text-[15px] group-hover:text-volt transition-colors uppercase tracking-tight">
                              {company.name}
                            </div>
                            <div className="text-[11px] text-silver font-mono">{company.hq}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[1px] px-2 py-0.5 rounded bg-black text-silver border border-charcoal">
                          {company.tier}
                        </span>
                      </div>

                      {/* Mini-Stats */}
                      <div className="grid grid-cols-3 gap-1.5 mb-3">
                        <div className="bg-black rounded p-2 text-center border border-charcoal">
                          <div className="text-xs font-bold text-white font-mono">
                            {company.hiring2024 != null ? company.hiring2024.toLocaleString() : '—'}
                          </div>
                          <div className="text-[10px] text-silver uppercase tracking-[0.5px]">Hires 2024</div>
                          <div className="text-[10px] font-bold text-volt">
                            {TREND_ICON[company.trend]}
                          </div>
                        </div>
                        <div className="bg-black rounded p-2 text-center border border-charcoal">
                          <div className="text-xs font-bold text-white font-mono">{company.openRoles}+</div>
                          <div className="text-[10px] text-silver uppercase tracking-[0.5px]">Open Roles</div>
                        </div>
                        <div className="bg-black rounded p-2 text-center border border-charcoal">
                          <div className="text-xs font-bold text-white font-mono">★ {company.glassdoor || '4.2'}</div>
                          <div className="text-[10px] text-silver uppercase tracking-[0.5px]">Rating</div>
                        </div>
                      </div>

                      <div className="text-[11px] text-silver mb-3 font-mono">
                        {company.avgPackage} • {company.industry}
                      </div>

                      {/* Quick Summary per Result */}
                      <div className="mb-3 p-2.5 bg-black border border-charcoal rounded text-[11px] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-silver font-bold uppercase tracking-[1px] text-[10px]">Top Skills:</span>
                          <span className="font-semibold text-white uppercase truncate max-w-[170px]">
                            {topSkills.join(', ') || 'General Engineering'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-silver font-bold uppercase tracking-[1px] text-[10px]">Fit Level:</span>
                          <span className={`font-bold uppercase tracking-[1px] text-[10px] ${
                            fitLevel === 'Strong Fit'
                              ? 'text-volt'
                              : fitLevel === 'Moderate Fit'
                              ? 'text-pale-yellow'
                              : 'text-silver'
                          }`}>
                            {fitLevel}
                          </span>
                        </div>
                        {biggestGap && (
                          <div className="flex items-center justify-between pt-1 border-t border-charcoal">
                            <span className="text-silver font-bold uppercase tracking-[1px] text-[10px]">Key Gap:</span>
                            <span className="font-bold text-danger uppercase tracking-[1px] text-[10px]">
                              {biggestGap}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Match Context Badge */}
                      {matchInfo && matchInfo.matchedField === 'role' && (
                        <div className="mb-3 text-[11px] text-volt bg-black px-2 py-0.5 rounded inline-flex items-center gap-1 border border-charcoal">
                          <span className="text-silver uppercase tracking-[1px] text-[10px]">Matched Role:</span> <span className="font-semibold">{matchInfo.matchedTerm}</span>
                        </div>
                      )}
                      {matchInfo && matchInfo.matchedField === 'skill' && (
                        <div className="mb-3 text-[11px] text-volt bg-black px-2 py-0.5 rounded inline-flex items-center gap-1 border border-charcoal">
                          <span className="text-silver uppercase tracking-[1px] text-[10px]">Skill:</span> <span className="font-semibold uppercase">{matchInfo.matchedTerm}</span>
                        </div>
                      )}
                    </div>

                    {/* View Roles Affordance */}
                    <div className="pt-3 border-t border-charcoal flex items-center justify-between text-xs font-semibold text-white group-hover:text-volt transition-colors">
                      <span className="text-silver text-[11px] font-mono">
                        {company.roles.length} Roles available
                      </span>
                      <span className="inline-flex items-center gap-1 uppercase tracking-[1px] font-bold text-[11px]">
                        View Roles <ArrowRight className="w-3.5 h-3.5 stroke-[1.5px]" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-16 bg-near-black border border-charcoal rounded-lg p-8 mb-16">
                <Building2 className="w-10 h-10 text-silver mx-auto mb-3 stroke-[1.5px]" />
                <h3 className="text-[18px] font-bold text-white mb-2 uppercase tracking-tight">
                  No companies found for &ldquo;{companySearch}&rdquo;
                </h3>
                <p className="text-xs text-silver mb-5 max-w-md mx-auto">
                  We couldn&rsquo;t find an exact or close match. Try searching for top tech employers below:
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto mb-6">
                  {['Barclays', 'Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Uber', 'Atlassian', 'Adobe', 'Freshworks', 'Flipkart', 'Goldman Sachs'].map(topCompany => (
                    <button
                      key={topCompany}
                      type="button"
                      onClick={() => {
                        setCompanySearch(topCompany);
                        setIndustryFilter('All');
                        setTierFilter('All');
                      }}
                      className="px-3 py-1 rounded bg-black hover:bg-hover-gray text-white text-xs font-semibold uppercase tracking-[1px] border border-charcoal hover:border-volt transition-colors cursor-pointer"
                    >
                      {topCompany}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCompanySearch("");
                    setIndustryFilter("All");
                    setTierFilter("All");
                  }}
                  className="px-5 py-2 rounded bg-black hover:bg-hover-gray border border-charcoal text-white font-bold text-xs uppercase tracking-[1.4px] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4-Stat Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3.5 border-t border-charcoal pt-10">
          {[
            { icon: Building2, value: `${COMPANIES.length}+`, label: "Employers & Recruiters", sub: "FAANG, Unicorns & Cybersecurity" },
            { icon: Briefcase, value: `${COMPANIES.reduce((a, c) => a + c.roles.length, 0)}+`, label: "Calibrated Roles", sub: "10+ roles per company verified" },
            { icon: BarChart3, value: "6-Layer", label: "Analysis Engine", sub: "Anti-gaming AI" },
            { icon: Zap, value: "TalentLens™", label: "Intelligence Platform", sub: "Candidate verification" },
          ].map(s => (
            <div key={s.label} className="bg-near-black border border-charcoal rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-black border border-charcoal flex items-center justify-center text-volt flex-shrink-0">
                <s.icon className="w-4 h-4 stroke-[1.5px]" />
              </div>
              <div>
                <div className="text-[18px] font-bold font-mono text-white">{s.value}</div>
                <div className="text-xs font-semibold text-white uppercase tracking-[1px]">{s.label}</div>
                <div className="text-[11px] text-silver">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}