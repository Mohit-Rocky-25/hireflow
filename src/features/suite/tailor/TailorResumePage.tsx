// ============================================================
// Suite UI — Tailor My Resume (/tools/tailor)
// Decision Group: "How do I present myself better?"
// Reorder, Rephrase, and Add Context suggestions with side-by-side diffs,
// strict truthCheck non-fabrication guarantee, and ResumeVersion saving.
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  Edit3,
  Copy,
  Download,
  Bookmark,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Building2,
  Layers,
  ChevronDown,
  Check,
  CheckCheck,
} from 'lucide-react';
import { tailorResume, TailorResult, TailorSuggestion, SuggestionType } from './tailorResume';
import { useProfile } from '../profile/ProfileContext';
import { SuiteStorage } from '../profile/storage';
import { ResumeVersion } from '../profile/types';
import { COMPANIES } from '../../../pages/demo/talentLensData';

const DEFAULT_RESUME = `Arjun Mehta | arjun@example.com | Full Stack Developer
SUMMARY: Software engineer with 3 years building web platforms using React, Node.js, TypeScript, and PostgreSQL.

EXPERIENCE:
Full Stack Engineer | CloudTech Solutions | 2022 - Present
- Responsible for developing modular React and TypeScript frontends serving 60,000 active users.
- Built Node.js and Express REST microservices with PostgreSQL database backends.
- Worked on optimizing database query indexes reducing latency by 45%.
- Helped with writing automated tests using Jest and Cypress.

PROJECTS:
Task Orchestrator | github.com/arjun/task-orch
- Implemented asynchronous task queue in TypeScript with Redis cache.
- Built dashboard for monitoring background workers.

SKILLS:
React, TypeScript, JavaScript, Node.js, Express, PostgreSQL, Redis, Jest, Git`;

const DEFAULT_JD = `Role: Senior Backend Engineer
Company: Razorpay
Requirements:
- Deep expertise in PostgreSQL database architecture and high-throughput query optimization.
- Production experience engineering RESTful microservices in Node.js and TypeScript.
- Strong automated unit testing and test coverage using Jest.
- Experience with Redis caching and distributed task queues is a strong plus.`;

export function TailorResumePage() {
  const { profile, openDrawer } = useProfile();

  // Inputs
  const [resumeText, setResumeText] = useState(() => profile?.masterResumeText || DEFAULT_RESUME);
  const [jdText, setJdText] = useState(DEFAULT_JD);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Results
  const [result, setResult] = useState<TailorResult | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);

  // Suggestion actions: suggestionId -> 'accepted' | 'rejected' | 'edited'
  const [suggestionStatus, setSuggestionStatus] = useState<Record<string, 'accepted' | 'rejected' | 'edited'>>({});
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // Filter
  const [typeFilter, setTypeFilter] = useState<'all' | SuggestionType>('all');

  // Copy/save feedback
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // If profile becomes available and user hasn't typed custom resume, populate
  useEffect(() => {
    if (profile?.masterResumeText && resumeText === DEFAULT_RESUME) {
      setResumeText(profile.masterResumeText);
    }
  }, [profile, resumeText]);

  // Handle Quick Load JD from dataset
  const handleQuickLoadCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const company = COMPANIES.find((c) => c.id === companyId);
    if (!company) return;
    const role = company.roles[0];
    const generatedJD = `Role: ${role.title} (${role.level})
Company: ${company.name}
About: ${role.desc}
Requirements:
- Strong experience with ${role.competencies.join(', ')}.
- Demonstrated mastery in production engineering and clean testing practices.
- Typical round focus: ${company.tier} hiring standard (${company.avgPackage}).`;
    setJdText(generatedJD);
  };

  const handleRunTailor = () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    setIsTailoring(true);
    setTimeout(() => {
      try {
        const res = tailorResume(resumeText, jdText, profile);
        setResult(res);

        // Default all rephrase and add_context to 'accepted' initially
        const initialStatus: Record<string, 'accepted' | 'rejected' | 'edited'> = {};
        res.suggestions.forEach((s) => {
          initialStatus[s.id] = 'accepted';
        });
        setSuggestionStatus(initialStatus);
      } catch (err) {
        console.error(err);
      } finally {
        setIsTailoring(false);
      }
    }, 200);
  };

  // Build live tailored preview based on accepted suggestions
  const liveTailoredResume = useMemo(() => {
    if (!result) return resumeText;
    let text = resumeText;
    result.suggestions.forEach((s) => {
      const status = suggestionStatus[s.id];
      if (status === 'accepted') {
        text = text.replace(s.originalText, s.proposedText);
      } else if (status === 'edited' && editedTexts[s.id]) {
        text = text.replace(s.originalText, editedTexts[s.id]);
      }
    });
    return text;
  }, [result, resumeText, suggestionStatus, editedTexts]);

  const acceptedCount = useMemo(() => {
    return Object.values(suggestionStatus).filter((s) => s === 'accepted' || s === 'edited').length;
  }, [suggestionStatus]);

  const filteredSuggestions = useMemo(() => {
    if (!result) return [];
    if (typeFilter === 'all') return result.suggestions;
    return result.suggestions.filter((s) => s.type === typeFilter);
  }, [result, typeFilter]);

  const handleAccept = (id: string) => {
    setSuggestionStatus((prev) => ({ ...prev, [id]: 'accepted' }));
    if (activeEditingId === id) setActiveEditingId(null);
  };

  const handleReject = (id: string) => {
    setSuggestionStatus((prev) => ({ ...prev, [id]: 'rejected' }));
    if (activeEditingId === id) setActiveEditingId(null);
  };

  const handleSaveEdit = (id: string, text: string) => {
    setEditedTexts((prev) => ({ ...prev, [id]: text }));
    setSuggestionStatus((prev) => ({ ...prev, [id]: 'edited' }));
    setActiveEditingId(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(liveTailoredResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([liveTailoredResume], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailored-resume-${result?.targetRoleTitle?.toLowerCase().replace(/\s+/g, '-') || 'tailored'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToProfile = () => {
    if (!result) return;
    const existing = SuiteStorage.loadResumeVersions().data || [];
    const newVersion: ResumeVersion = {
      id: `ver-${Date.now()}`,
      label: `Tailored for ${result.targetRoleTitle}`,
      jdHash: String(jdText.length),
      createdAt: new Date().toISOString(),
      acceptedChanges: result.suggestions
        .filter((s) => suggestionStatus[s.id] === 'accepted' || suggestionStatus[s.id] === 'edited')
        .map((s) => ({
          id: s.id,
          type: s.type === 'reorder' ? 'reorder_bullets' : 'action_verb_swap',
          description: s.rationale,
          originalSpan: s.originalText,
          replacementSpan: editedTexts[s.id] || s.proposedText,
        })),
      scoreBefore: result.scoreBefore,
      scoreAfter: result.projectedScoreAfter,
      tailoredText: liveTailoredResume,
    };

    SuiteStorage.saveResumeVersions([newVersion, ...existing]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-16">
      {/* Top Banner */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/tools/career-path"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text font-semibold px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Tools Hub
            </Link>
            <span className="text-border">/</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Group B: Present
            </span>
            <span className="text-sm font-bold text-text">Tailor My Resume</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              TruthCheck™ Non-Fabrication
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-primary" />
            Tailor My Resume
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Deterministic bullet-level alignment for your target job description. Reorders high-impact bullets, aligns technical terminology, and injects bracketed metric placeholders — with zero hallucinations.
          </p>
        </div>

        {/* Two-Column Input Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left: Base Resume */}
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  Your Base Resume
                </label>
                {profile && (
                  <button
                    onClick={() => setResumeText(profile.masterResumeText)}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Reset from Profile
                  </button>
                )}
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your base resume text here..."
                className="w-full h-64 bg-surface-2 border border-border rounded-xl p-3 text-xs text-text font-mono leading-relaxed placeholder:text-text-muted focus:outline-none focus:border-primary"
              />
            </div>
            <div className="text-[11px] text-text-muted mt-2">
              {resumeText.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>

          {/* Right: Target JD */}
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <label className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" />
                  Target Job Description
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted">Quick Load:</span>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => handleQuickLoadCompany(e.target.value)}
                    className="bg-surface-2 border border-border rounded-lg px-2 py-1 text-xs text-text focus:outline-none focus:border-primary"
                  >
                    <option value="">Select target company...</option>
                    {COMPANIES.slice(0, 15).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.roles[0]?.title})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste target job description..."
                className="w-full h-64 bg-surface-2 border border-border rounded-xl p-3 text-xs text-text font-mono leading-relaxed placeholder:text-text-muted focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-text-muted">
                {jdText.split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                onClick={handleRunTailor}
                disabled={isTailoring || !resumeText.trim() || !jdText.trim()}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
              >
                {isTailoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {isTailoring ? 'Analyzing...' : 'Tailor Resume'}
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Score & Summary Banner */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    ATS Alignment Simulation for {result.targetRoleTitle}
                  </div>
                  <h3 className="text-xl font-extrabold text-text">
                    Projected Match: {result.projectedScoreAfter}% (Base: {result.scoreBefore}%)
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    {result.suggestions.length} suggestions generated ({acceptedCount} accepted).
                    All changes pass strict TruthCheck verification.
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="p-3 rounded-xl bg-surface-2 border border-border text-center min-w-[100px]">
                    <div className="text-lg font-extrabold text-text">{result.scoreBefore}%</div>
                    <div className="text-[10px] text-text-muted uppercase font-bold">Before</div>
                  </div>
                  <div className="text-primary font-extrabold text-lg">→</div>
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center min-w-[100px]">
                    <div className="text-lg font-extrabold text-primary">{result.projectedScoreAfter}%</div>
                    <div className="text-[10px] text-primary uppercase font-bold">Projected</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Bulk Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-3">
              <div className="flex gap-2">
                {(['all', 'reorder', 'rephrase', 'add_context'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                      typeFilter === t
                        ? 'bg-primary text-white'
                        : 'bg-surface hover:bg-surface-2 text-text-secondary border border-border'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const allAcc: Record<string, 'accepted'> = {};
                    result.suggestions.forEach((s) => (allAcc[s.id] = 'accepted'));
                    setSuggestionStatus(allAcc);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text transition-colors cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>

            {/* Side-by-Side Diff Cards */}
            <div className="space-y-4">
              {filteredSuggestions.map((sug) => {
                const status = suggestionStatus[sug.id] || 'accepted';
                const isEditing = activeEditingId === sug.id;
                const currentText = editedTexts[sug.id] || sug.proposedText;

                return (
                  <div
                    key={sug.id}
                    className={`p-5 rounded-2xl bg-surface border transition-all ${
                      status === 'accepted'
                        ? 'border-emerald-500/30 shadow-xs'
                        : status === 'rejected'
                        ? 'border-border/50 opacity-60'
                        : 'border-primary/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            sug.type === 'reorder'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : sug.type === 'rephrase'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {sug.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold text-text-muted">
                          Section: {sug.section}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center gap-1.5">
                        {status === 'accepted' && (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Accepted
                          </span>
                        )}
                        {status === 'rejected' && (
                          <span className="text-xs font-bold text-text-muted flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                        {status === 'edited' && (
                          <span className="text-xs font-bold text-primary flex items-center gap-1">
                            <Edit3 className="w-3.5 h-3.5" /> Customized
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Side-by-side Diffs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      {/* Left: Original */}
                      <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
                        <div className="text-[10px] text-text-muted font-bold uppercase mb-1">
                          Original Text
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed font-mono">
                          {sug.originalText}
                        </p>
                      </div>

                      {/* Right: Proposed / Edited */}
                      <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">
                          Proposed Tailoring
                        </div>
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              defaultValue={currentText}
                              id={`edit-input-${sug.id}`}
                              className="w-full h-20 bg-surface border border-primary rounded-lg p-2 text-xs text-text font-mono focus:outline-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setActiveEditingId(null)}
                                className="px-2.5 py-1 text-xs text-text-muted hover:text-text"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  const el = document.getElementById(
                                    `edit-input-${sug.id}`
                                  ) as HTMLTextAreaElement;
                                  if (el) handleSaveEdit(sug.id, el.value);
                                }}
                                className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold"
                              >
                                Save Custom
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-text leading-relaxed font-mono font-semibold">
                            {currentText}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rationale & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <p className="text-xs text-text-secondary">
                        <span className="font-bold text-text">Why this helps:</span> {sug.rationale}
                      </p>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAccept(sug.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-surface-2 hover:bg-surface-3 text-text-secondary border border-border'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(sug.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            status === 'rejected'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-surface-2 hover:bg-surface-3 text-text-secondary border border-border'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => setActiveEditingId(sug.id)}
                          className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assembled Tailored Resume & Export Toolbar */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-text">Assembled Tailored Resume</h3>
                  <p className="text-xs text-text-secondary">
                    Live document preview with all accepted changes applied. Fill in any bracketed placeholders before sending.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Plain Text'}
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .md
                  </button>
                  <button
                    onClick={handleSaveToProfile}
                    className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    {savedSuccess ? <CheckCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {savedSuccess ? 'Saved to Profile!' : 'Save Version to Profile'}
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={liveTailoredResume}
                className="w-full h-80 bg-surface-2 border border-border rounded-xl p-4 text-xs font-mono text-text leading-relaxed focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
