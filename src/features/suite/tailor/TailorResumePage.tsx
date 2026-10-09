// ============================================================
// Suite UI — Tailor My Resume (/tools/tailor)
// Decision Group: "How do I present myself better?"
// Reorder, Rephrase, and Add Context suggestions with side-by-side diffs,
// strict truthCheck non-fabrication guarantee, and ResumeVersion saving.
// ============================================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TailorHeader } from './components/TailorHeader';
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
  AlertCircle,
} from 'lucide-react';
import { tailorResume, TailorResult, TailorSuggestion, SuggestionType } from './tailorResume';
import { useProfile } from '../profile/ProfileContext';
import { SuiteStorage } from '../profile/storage';
import { ResumeVersion } from '../profile/types';
import { COMPANIES } from '../../../pages/demo/talentLensData';
import { InputBox } from './components/InputBox';
import { QuickLoadSelect } from './components/QuickLoadSelect';
import { MatchPanel } from './components/MatchPanel';
import { calculateResumeQuality } from '../../../lib/tailorEngine/strength';

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

  // Header scroll detection for compact title
  const [h1Visible, setH1Visible] = useState(true);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!h1Ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setH1Visible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(h1Ref.current);
    return () => observer.disconnect();
  }, []);

  // Inputs
  const [resumeText, setResumeText] = useState(() => profile?.masterResumeText || DEFAULT_RESUME);
  const [jdText, setJdText] = useState(DEFAULT_JD);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Results
  const [result, setResult] = useState<TailorResult | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);

  // Suggestion actions: suggestionId -> 'accepted' | 'rejected' | 'edited'
  const [suggestionStatus, setSuggestionStatus] = useState<Record<string, 'pending' | 'accepted' | 'rejected' | 'edited'>>({});
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
        const res = tailorResume(resumeText, jdText, new Set<string>());
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

  // Quality calculations for Resume Quality summary (average strength, metrics, repeated verbs)
  const beforeQuality = useMemo(() => calculateResumeQuality(resumeText, jdText), [resumeText, jdText]);
  const afterQuality = useMemo(() => calculateResumeQuality(liveTailoredResume, jdText), [liveTailoredResume, jdText]);

  return (
    <div className="min-h-screen bg-bg text-text pb-16">
      {/* Unified 64px Header */}
      <TailorHeader h1Visible={h1Visible} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Hero Section */}
        <div className="mb-8 max-w-3xl">
          <h1
            ref={h1Ref}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight flex items-center gap-3"
          >
            <Sparkles className="w-8 h-8 text-primary shrink-0" />
            Tailor My Resume
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-3 leading-relaxed font-medium">
            Match your resume to one job. Every change is yours to accept, and nothing is invented.
          </p>
        </div>

        {/* Two-Column Input Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Base Resume */}
          <InputBox
            stepNumber={1}
            label="Your resume"
            icon={<FileText className="w-5 h-5 text-primary" />}
            text={resumeText}
            setText={setResumeText}
            placeholder="Paste your base resume text here..."
            extraHeader={
              profile ? (
                <button
                  type="button"
                  onClick={() => setResumeText(profile.masterResumeText)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Reset from Profile
                </button>
              ) : null
            }
          />

          {/* Right: Target JD */}
          <InputBox
            stepNumber={2}
            label="Target job"
            icon={<Building2 className="w-5 h-5 text-primary" />}
            text={jdText}
            setText={setJdText}
            placeholder="Paste target job description here..."
            isJD
            extraHeader={
              <QuickLoadSelect
                selectedCompanyId={selectedCompanyId}
                onSelect={handleQuickLoadCompany}
              />
            }
          />
        </div>
        
        {/* Tailor Resume Action Button (52px minimum, bold, states with reason) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
          <div className="text-xs text-text-muted">
            {(!resumeText.trim() || !jdText.trim()) ? (
              <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                <AlertCircle className="w-4 h-4" />
                Paste your resume and target job description to begin tailoring.
              </span>
            ) : (
              <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Ready to analyze and tailor against requirements.
              </span>
            )}
          </div>

          <button
            onClick={handleRunTailor}
            disabled={isTailoring || !resumeText.trim() || !jdText.trim()}
            className="h-[52px] min-h-[52px] px-8 rounded-xl bg-primary text-white text-base font-bold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-2.5 focus-visible:ring-4 focus-visible:ring-primary/20 outline-none"
          >
            {isTailoring ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            <span>{isTailoring ? 'Analyzing Alignment...' : 'Tailor Resume'}</span>
          </button>
        </div>

                {/* RESULTS SECTION */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Match Panel with Gauges, Chips & Quality Summary */}
            <MatchPanel
              result={result}
              beforeQuality={beforeQuality}
              afterQuality={afterQuality}
            />

            {/* Filter Tabs & Bulk Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-3">
              <div className="flex gap-2">
                {(['all', 'highlight', 'reorder', 'rephrase', 'add_context'] as const).map((t) => (
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

              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold text-text-muted">
                  {Object.values(suggestionStatus).filter(s => s === 'accepted').length} accepted, {Object.values(suggestionStatus).filter(s => s === 'rejected').length} rejected, {Object.values(suggestionStatus).filter(s => s === 'pending').length} pending
                </div>
                <button
                  onClick={() => {
                    const allAcc: Record<string, 'accepted'|'pending'|'rejected'|'edited'> = {};
                    result.suggestions.forEach((s) => (allAcc[s.id] = 'accepted'));
                    setSuggestionStatus(allAcc);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-bold text-emerald-400 transition-colors cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  onClick={() => {
                    const allRej: Record<string, 'accepted'|'pending'|'rejected'|'edited'> = {};
                    result.suggestions.forEach((s) => (allRej[s.id] = 'rejected'));
                    setSuggestionStatus(allRej);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-400 transition-colors cursor-pointer"
                >
                  Reject All
                </button>
              </div>
            </div>

            {/* Gap Cards */}
            {result.gaps.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Missing Skills (Gaps)
                </h4>
                {result.gaps.map((gap, i) => (
                  <div key={i} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-text-secondary">
                    {gap}
                  </div>
                ))}
              </div>
            )}

            {/* Side-by-Side Diff Cards */}
            <div className="space-y-4">
              {filteredSuggestions.map((sug) => {
                const status = suggestionStatus[sug.id] || 'pending';
                const isEditing = activeEditingId === sug.id;
                const currentText = editedTexts[sug.id] || sug.proposedText;

                return (
                  <div
                    key={sug.id}
                    className={`p-5 rounded-2xl bg-surface border transition-all ${
                      status === 'accepted' || status === 'edited'
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
                              : sug.type === 'highlight'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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
                        {status === 'pending' && (
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            Pending Review
                          </span>
                        )}
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
                    
                    <p className="text-sm font-semibold mb-3">{sug.rationale}</p>

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
                        <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1 flex justify-between items-center">
                          <span>{isEditing ? 'Editing...' : 'Tailored'}</span>
                          {!isEditing && (
                             <button onClick={() => setActiveEditingId(sug.id)} className="text-primary hover:underline">Edit</button>
                          )}
                        </div>
                        {isEditing ? (
                          <div>
                            <textarea
                              className="w-full h-24 bg-bg border border-primary/50 rounded-lg p-2 text-xs font-mono text-text focus:outline-none"
                              defaultValue={currentText}
                              id={`edit-${sug.id}`}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setActiveEditingId(null)}
                                className="px-3 py-1 rounded-md text-xs font-bold text-text-muted hover:text-text transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  const val = (document.getElementById(`edit-${sug.id}`) as HTMLTextAreaElement).value;
                                  handleSaveEdit(sug.id, val);
                                }}
                                className="px-3 py-1 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                              >
                                Save & Verify
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-text leading-relaxed font-mono">
                            {currentText}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Row */}
                    {!isEditing && (
                      <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          {sug.truthCheck.passed ? (
                            <span className="text-[10px] text-emerald-400/80 flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3 h-3" /> TruthCheck Passed
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold">
                              <XCircle className="w-3 h-3" /> {sug.truthCheck.reason}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(sug.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              status === 'rejected'
                                ? 'bg-surface-3 text-text-muted cursor-default'
                                : 'bg-surface-2 hover:bg-rose-500/10 hover:text-rose-400 text-text-secondary border border-border'
                            }`}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAccept(sug.id)}
                            disabled={!sug.truthCheck.passed}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                              status === 'accepted'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                                : !sug.truthCheck.passed
                                ? 'bg-surface-2 text-text-muted opacity-50 cursor-not-allowed border border-border'
                                : 'bg-primary text-white hover:bg-primary/90 border border-primary'
                            }`}
                          >
                            {status === 'accepted' ? <Check className="w-3.5 h-3.5" /> : null}
                            {status === 'accepted' ? 'Accepted' : 'Accept'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Live Tailored Resume Preview */}
            <div className="bg-surface border border-border rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-extrabold mb-4">Live Tailored Preview</h3>
              <div className="bg-surface-2 p-4 rounded-xl border border-border">
                 <pre className="text-xs font-mono text-text whitespace-pre-wrap">{liveTailoredResume}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}