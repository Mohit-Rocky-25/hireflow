// ============================================================
// HireFlow — Candidate Intelligence Page
// Evidence-based candidate-vs-job analysis for recruiters
// Per spec: show evidence, separate eligibility/relevance/confidence,
// never fabricate, distinguish "no evidence" from "not skilled"
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  Brain, CheckCircle2, XCircle, AlertTriangle, HelpCircle,
  ChevronDown, ChevronUp, ArrowLeft, RefreshCw, Users,
  MessageSquare, Target, Shield, TrendingUp, Eye, Clock,
  Briefcase, Award, Star, ChevronRight, Sparkles, Bookmark, Building2
} from 'lucide-react';
import { analyzeCandidate } from '../../ai/matching';
import type { CandidateMatch, RequirementAssessment } from '../../types';
import { useProfile } from '../../features/suite/profile/ProfileContext';
import { QuickSummaryCard } from '../../features/suite/components/QuickSummaryCard';
import { buildQuickSummary } from '../../features/suite/engine/quickSummary';
import { SimulationFacts } from '../../features/suite/engine/simulateFix';
import { DEMO_TALENTLENS_RESUME } from '../demo/useTalentLensStore';

// ── Status Components ──
function EligibilityBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    ELIGIBLE: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "ELIGIBLE" },
    CONDITIONAL: { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "CONDITIONAL" },
    INELIGIBLE: { cls: "bg-red-50 text-red-700 border-red-200", label: "INELIGIBLE" },
    UNCERTAIN: { cls: "bg-slate-50 text-slate-600 border-slate-200", label: "UNCERTAIN" },
  };
  const { cls, label } = map[status] ?? map.UNCERTAIN;
  return (
    <span className={`px-[12px] py-[4px] rounded-full text-[12px] font-bold border uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

function MatchStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'STRONG': return <CheckCircle2 className="w-[18px] h-[18px] text-emerald-600 flex-shrink-0" />;
    case 'PARTIAL': return <AlertTriangle className="w-[18px] h-[18px] text-amber-500 flex-shrink-0" />;
    case 'INFERRED': return <TrendingUp className="w-[18px] h-[18px] text-blue-500 flex-shrink-0" />;
    case 'MISSING': return <XCircle className="w-[18px] h-[18px] text-red-500 flex-shrink-0" />;
    case 'UNCERTAIN': return <HelpCircle className="w-[18px] h-[18px] text-slate-400 flex-shrink-0" />;
    default: return <HelpCircle className="w-[18px] h-[18px] text-slate-400 flex-shrink-0" />;
  }
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    STRONG: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
    INFERRED: "bg-sky-50 text-sky-700 border-sky-200",
    MISSING: "bg-red-50 text-red-700 border-red-200",
    UNCERTAIN: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span className={`px-[8px] py-[2px] rounded-full text-[11px] font-bold border uppercase ${map[status] ?? map.UNCERTAIN}`}>
      {status}
    </span>
  );
}

function DimensionBadge({ label, value }: { label: string; value: string }) {
  const colorMap: Record<string, string> = {
    STRONG: "text-emerald-700",
    MODERATE: "text-amber-700",
    WEAK: "text-red-600",
    HIGH: "text-emerald-700",
    MEDIUM: "text-amber-700",
    LOW: "text-red-600",
    ELIGIBLE: "text-emerald-700",
    CONDITIONAL: "text-amber-700",
    INELIGIBLE: "text-red-600",
    INSUFFICIENT: "text-red-600",
    UNCLEAR: "text-slate-500",
    NONE: "text-slate-500",
  };
  return (
    <div className="bg-surface border border-border rounded-xl p-[16px]">
      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-[4px]">{label}</p>
      <p className={`text-[18px] font-extrabold ${colorMap[value] ?? 'text-text'}`}>{value}</p>
    </div>
  );
}

// ── Requirement Card ──
function RequirementCard({ assessment }: { assessment: RequirementAssessment }) {
  const [expanded, setExpanded] = useState(false);
  const priorityColors: Record<string, string> = {
    MANDATORY: "bg-red-50 text-red-700 border-red-200",
    PREFERRED: "bg-blue-50 text-blue-700 border-blue-200",
    OPTIONAL: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      assessment.status === 'STRONG' ? 'border-emerald-200 bg-emerald-50/30' :
      assessment.status === 'PARTIAL' || assessment.status === 'INFERRED' ? 'border-amber-200 bg-amber-50/20' :
      assessment.status === 'MISSING' ? 'border-red-200 bg-red-50/20' :
      'border-border bg-surface'
    }`}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-[20px] py-[16px] text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-[12px]">
          <MatchStatusIcon status={assessment.status} />
          <div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[15px] font-bold text-text">{assessment.requirementName}</span>
              <span className={`px-[8px] py-[1px] rounded-full text-[10px] font-bold border uppercase ${priorityColors[assessment.requirementPriority]}`}>
                {assessment.requirementPriority}
              </span>
            </div>
            {assessment.evidenceText && !expanded && (
              <p className="text-[12px] text-text-muted mt-[2px] truncate max-w-[400px]">{assessment.evidenceText}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-[12px]">
          <StatusPill status={assessment.status} />
          {assessment.confidence > 0 && (
            <span className="text-[12px] font-bold text-text-muted">{Math.round(assessment.confidence * 100)}% conf.</span>
          )}
          {expanded ? <ChevronUp className="w-[16px] h-[16px] text-text-muted" /> : <ChevronDown className="w-[16px] h-[16px] text-text-muted" />}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-[20px] pb-[20px] space-y-[12px] border-t border-current/10">
          {assessment.evidenceText && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-[12px] mt-[12px]">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-[4px]">
                EVIDENCE · {assessment.evidenceSource ?? 'profile'}
              </p>
              <p className="text-[13px] text-text-secondary italic">{assessment.evidenceText}</p>
            </div>
          )}

          {assessment.relatedEvidence && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-[12px]">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-[4px]">
                RELATED EVIDENCE · Semantic Match
              </p>
              <p className="text-[13px] text-text-secondary">{assessment.relatedEvidence}</p>
              {assessment.semanticRelationship && (
                <p className="text-[12px] text-text-muted mt-[4px] italic">↳ {assessment.semanticRelationship}</p>
              )}
            </div>
          )}

          {assessment.missingEvidenceExplanation && (
            <div className="bg-surface-2 border border-border rounded-lg p-[12px]">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-[4px]">
                EVIDENCE STATUS
              </p>
              <p className="text-[13px] text-text-secondary">{assessment.missingEvidenceExplanation}</p>
            </div>
          )}

          {assessment.recruiterAction && (
            <div className="bg-primary-light border border-primary/20 rounded-lg p-[12px]">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-[4px]">
                RECRUITER ACTION
              </p>
              <p className="text-[13px] text-text">{assessment.recruiterAction}</p>
            </div>
          )}

          {assessment.suggestedInterviewQuestion && (
            <div className="bg-surface-2 border border-border rounded-lg p-[12px]">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-[4px]">
                <MessageSquare className="w-[11px] h-[11px] inline mr-[4px]" />
                SUGGESTED INTERVIEW QUESTION
              </p>
              <p className="text-[13px] text-text italic">"{assessment.suggestedInterviewQuestion}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──
export function TalentLens() {
  const navigate = useNavigate();
  const { profile: suiteProfile, saveFromResumeText, openDrawer } = useProfile();
  const { users, candidateProfiles, applications, jobs, createMatch, candidateMatches } = useStore();
  const candidateId = "user-cand-1"; // Standalone demo
  const currentCompanyId = "comp-alpha-tech"; // Standalone demo

  const [match, setMatch] = useState<CandidateMatch | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showFullTalentLensReport, setShowFullTalentLensReport] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'gaps' | 'interview'>('overview');
  const [error, setError] = useState<string | null>(null);

  const candidate = users.find(u => u.id === candidateId);
  const profile = candidateProfiles.find(p => p.userId === candidateId);
  const companyJobs = jobs.filter(j => j.companyId === currentCompanyId && j.status === 'published');
  const candidateApps = applications.filter(a => a.candidateId === candidateId && a.companyId === currentCompanyId);

  // Auto-select job from application if only one
  useEffect(() => {
    if (candidateApps.length === 1) {
      setSelectedJobId(candidateApps[0].jobId);
    }
  }, [candidateApps]);

  // Check for cached match
  useEffect(() => {
    if (!selectedJobId || !candidateId) return;
    const app = candidateApps.find(a => a.jobId === selectedJobId);
    if (!app) return;
    const cached = candidateMatches.find(m =>
      m.candidateId === candidateId && m.jobId === selectedJobId
    );
    if (cached) setMatch(cached);
  }, [selectedJobId, candidateId]);

  const runAnalysis = async () => {
    if (!profile || !selectedJobId) return;
    setAnalyzing(true);
    setError(null);
    try {
      const job = jobs.find(j => j.id === selectedJobId);
      if (!job) throw new Error('Job not found');
      const app = candidateApps.find(a => a.jobId === selectedJobId);
      if (!app) throw new Error('No application found for this job');

      // Use the evidence-based matching engine
      const result = analyzeCandidate(profile, job, candidateId!, app.id);
      createMatch(result);
      setMatch(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const talentLensSummary = match ? buildQuickSummary({
    skillResults: match.requirementAssessments.map(ra => {
      const quote = ra.evidenceText || '';
      const evidenceQuote = quote ? [{
        quote,
        section: ra.evidenceSource || 'experience',
        charStart: 0,
        charEnd: quote.length,
        hasMetric: false,
        evidenceTier: ra.status === 'STRONG' ? 0.85 : 0.5,
      }] : [];

      return {
        skillId: ra.requirementId,
        canonical: ra.requirementName,
        category: 'general',
        required: (ra.requirementPriority === 'MANDATORY' ? 'must' : 'nice') as 'must' | 'nice',
        weight: ra.requirementPriority === 'MANDATORY' ? 4 : 2,
        found: ra.status !== 'MISSING',
        status: ra.status === 'STRONG' ? ('verified' as const) : ra.status === 'PARTIAL' || ra.status === 'INFERRED' ? ('weak' as const) : ('missing' as const),
        proficiency: ra.status === 'STRONG' ? 3 : ra.status === 'PARTIAL' ? 2 : 0,
        evidence: evidenceQuote,
        evidenceQuotes: evidenceQuote,
      };
    }),
    baseScore: match.overallScore,
    wordCount: 300,
  }, suiteProfile) : null;

  if (!candidate) {
    return (
      <div className="p-[32px] text-center">
        <p className="text-text-secondary">Candidate not found.</p>
        <Link to="/" className="mt-[16px] text-primary hover:underline">← Go back to Home</Link>
      </div>
    );
  }

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-12 px-8 relative">
      
      {/* Absolute Top-Left Back Button */}
      <div className="absolute top-8 left-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-black text-text hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" /> Back to Home
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        <div className="text-center max-w-3xl mx-auto mb-12 mt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ai/10 text-ai font-bold text-sm rounded-full mb-6">
            <Sparkles className="w-4 h-4" /> B2B Engine Demo
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4">
            Talent<span className="text-transparent bg-clip-text bg-gradient-to-r from-ai to-primary">Lens</span> Simulator
          </h1>
          <p className="text-secondary text-lg">
            Experience our proprietary B2B matching engine. See how it deeply analyzes semantic context instead of just keyword matching.
          </p>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-[16px]">
          <div className="flex items-center gap-[16px]">
            <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-primary-light to-primary/20 flex items-center justify-center text-primary text-[20px] font-black">
              {candidate.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <h1 className="text-[24px] font-bold text-text tracking-tight">{candidate.displayName}</h1>
              <p className="text-[14px] text-text-secondary">{profile?.headline ?? 'Candidate'}</p>
            </div>
          </div>

        <div className="flex items-center gap-[12px]">
          {/* Job selector */}
          <select
            value={selectedJobId}
            onChange={e => { setSelectedJobId(e.target.value); setMatch(null); }}
            className="h-[40px] px-[12px] border border-border rounded-lg text-[14px] font-medium bg-surface focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">Select job to analyze against…</option>
            {companyJobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <button
            onClick={runAnalysis}
            disabled={!selectedJobId || !profile || analyzing}
            className="h-[40px] px-[20px] bg-primary text-white text-[14px] font-bold rounded-lg hover:bg-primary-hover transition-all flex items-center gap-[8px] disabled:opacity-40 shadow-glow-orange"
          >
            {analyzing ? <RefreshCw className="w-[16px] h-[16px] animate-spin" /> : <Brain className="w-[16px] h-[16px]" />}
            {analyzing ? 'Analyzing…' : match ? 'Re-Analyze' : 'Analyze'}
          </button>

          <Link
            to="/tools/company-compare"
            className="h-[40px] px-[14px] border border-border rounded-lg text-[13px] font-semibold bg-surface hover:bg-surface-2 flex items-center gap-1.5 text-text-secondary hover:text-text transition-colors"
          >
            <Building2 className="w-4 h-4 text-primary" />
            Compare Companies
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-[16px] text-[14px] text-red-700">
          <AlertTriangle className="w-[16px] h-[16px] inline mr-[8px]" />
          {error}
        </div>
      )}

      {!selectedJobId && (
        <div className="bg-surface-2/50 border border-border rounded-2xl p-[64px] text-center">
          <Brain className="w-[48px] h-[48px] text-primary/30 mx-auto mb-[16px]" />
          <h3 className="text-[16px] font-bold text-text mb-[8px]">Select a job to run intelligence analysis</h3>
          <p className="text-[14px] text-text-secondary">Choose from the dropdown above to see evidence-based candidate assessment against that role's requirements.</p>
        </div>
      )}

      {selectedJobId && !match && !analyzing && (
        <div className="bg-surface-2/50 border border-border rounded-2xl p-[64px] text-center">
          <Target className="w-[48px] h-[48px] text-primary/30 mx-auto mb-[16px]" />
          <h3 className="text-[16px] font-bold text-text mb-[8px]">Ready to analyze against "{selectedJob?.title}"</h3>
          <p className="text-[14px] text-text-secondary mb-[24px]">The engine will assess each job requirement individually with evidence from the candidate's profile.</p>
          <button onClick={runAnalysis} className="h-[44px] px-[28px] bg-primary text-white text-[14px] font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center gap-[8px] mx-auto shadow-glow-orange">
            <Brain className="w-[16px] h-[16px]" /> Run Evidence Analysis
          </button>
        </div>
      )}

      {analyzing && (
        <div className="bg-surface border border-border rounded-2xl p-[48px] text-center">
          <RefreshCw className="w-[32px] h-[32px] text-primary mx-auto mb-[16px] animate-spin" />
          <h3 className="text-[15px] font-bold text-text">Analyzing candidate against job requirements…</h3>
          <p className="text-[13px] text-text-muted mt-[4px]">Extracting evidence · Resolving skills · Assessing requirements</p>
        </div>
      )}

      {match && (
        <div className="space-y-6">
          {talentLensSummary && (
            <QuickSummaryCard
              summary={talentLensSummary}
              score={match.overallScore}
              isFullReportVisible={showFullTalentLensReport}
              onToggleFullReport={() => setShowFullTalentLensReport((prev) => !prev)}
            />
          )}

          {showFullTalentLensReport && (
            <>
              {/* Score Overview */}
          <div className="bg-surface border border-border rounded-2xl p-[24px]">
            <div className="flex items-start justify-between mb-[24px]">
              <div>
                <div className="flex items-center gap-[12px] mb-[4px]">
                  <h2 className="text-[18px] font-bold text-text">Intelligence Report</h2>
                  <EligibilityBadge status={match.eligibility} />
                  <button
                    type="button"
                    onClick={() => {
                      saveFromResumeText(profile?.resumeRawText || DEMO_TALENTLENS_RESUME.text);
                      openDrawer();
                    }}
                    className="ml-2 px-3 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-bold rounded-lg text-primary transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Save to my profile
                  </button>
                </div>
                <p className="text-[14px] text-text-secondary">{match.explanation}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Overall Score</p>
                <p className="text-[36px] font-black text-text">{match.overallScore}<span className="text-[16px] text-text-muted">/100</span></p>
                <p className="text-[11px] text-text-muted">Backed by {match.scoreComponents?.length ?? 0} components</p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] mb-[24px]">
              <DimensionBadge label="Required Skill Alignment" value={match.requiredSkillAlignment} />
              <DimensionBadge label="Experience Relevance" value={match.experienceRelevance} />
              <DimensionBadge label="Project Evidence" value={match.projectRelevance} />
              <DimensionBadge label="Evidence Confidence" value={match.evidenceConfidence} />
            </div>

            {/* Score Components (transparent calculation) */}
            {match.scoreComponents && match.scoreComponents.length > 0 && (
              <div className="border-t border-border pt-[20px]">
                <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-[12px]">Score Calculation (Transparent)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[8px]">
                  {match.scoreComponents.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between bg-surface-2/50 rounded-lg px-[12px] py-[8px]">
                      <div>
                        <p className="text-[13px] font-semibold text-text">{comp.dimension}</p>
                        <p className="text-[11px] text-text-muted">{comp.explanation}</p>
                      </div>
                      <div className="text-right ml-[12px] shrink-0">
                        <p className="text-[15px] font-bold text-text">{comp.score}</p>
                        <p className="text-[10px] text-text-muted">×{comp.weight} wt</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted mt-[8px]">
                  AI: {match.modelProvider} {match.modelVersion} · Knowledge: {match.knowledgeVersion} · Analyzed: {new Date(match.analyzedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
            {[
              { label: 'Strong Matches', count: match.strongMatches.length, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              { label: 'Partial Matches', count: match.partialMatches.length, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
              { label: 'Missing Evidence', count: match.missingRequirements.length, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
              { label: 'Uncertain / Verify', count: match.uncertainRequirements.length, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
            ].map((item, i) => (
              <div key={i} className={`border rounded-xl p-[20px] ${item.bg}`}>
                <p className={`text-[32px] font-black ${item.color}`}>{item.count}</p>
                <p className={`text-[13px] font-semibold ${item.color}`}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* Evidence Summary */}
          {match.evidenceSummary && (
            <div className="bg-surface border border-border rounded-xl p-[16px] text-[14px] text-text-secondary">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-[4px]">Evidence Summary</p>
              {match.evidenceSummary}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-[4px] border-b border-border">
            {[
              { key: 'overview', label: 'Recruiter Recommendations' },
              { key: 'requirements', label: `All Requirements (${match.requirementAssessments.length})` },
              { key: 'gaps', label: `Skill Gaps (${match.skillGaps.length})` },
              { key: 'interview', label: 'Interview Questions' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-[16px] py-[12px] text-[14px] font-bold transition-all border-b-2 ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'overview' && (
              <div className="space-y-[16px]">
                {match.recruiterRecommendations.map((rec, i) => (
                  <div key={i} className="flex gap-[12px] bg-surface border border-border rounded-xl p-[16px]">
                    <ChevronRight className="w-[16px] h-[16px] text-primary mt-[2px] flex-shrink-0" />
                    <p className="text-[14px] text-text">{rec}</p>
                  </div>
                ))}
                {match.recruiterRecommendations.length === 0 && (
                  <div className="text-center py-[48px] text-text-muted text-[14px]">No specific recommendations — strong candidate profile.</div>
                )}
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-[12px]">
                <div className="flex gap-[8px] mb-[16px]">
                  {['STRONG', 'PARTIAL', 'UNCERTAIN', 'MISSING'].map(status => (
                    <span key={status} className={`px-[10px] py-[3px] rounded-full text-[11px] font-bold border uppercase ${
                      status === 'STRONG' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      status === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      status === 'MISSING' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {match.requirementAssessments.filter(r => r.status === status).length} {status}
                    </span>
                  ))}
                </div>
                {match.requirementAssessments.map(assessment => (
                  <RequirementCard key={assessment.requirementId} assessment={assessment} />
                ))}
              </div>
            )}

            {activeTab === 'gaps' && (
              <div className="space-y-[16px]">
                {match.skillGaps.length === 0 ? (
                  <div className="text-center py-[48px] bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <CheckCircle2 className="w-[40px] h-[40px] text-emerald-600 mx-auto mb-[12px]" />
                    <h3 className="text-[15px] font-bold text-emerald-700">No significant skill gaps found</h3>
                    <p className="text-[13px] text-emerald-600 mt-[4px]">Candidate shows evidence for all mandatory requirements.</p>
                  </div>
                ) : (
                  match.skillGaps.map((gap, i) => (
                    <div key={i} className="bg-surface border border-border rounded-2xl p-[24px] space-y-[16px]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-[16px] font-bold text-text">{gap.skillName}</h3>
                          <span className={`text-[11px] font-bold uppercase ${gap.jobPriority === 'MANDATORY' ? 'text-red-700' : 'text-amber-700'}`}>
                            {gap.jobPriority} requirement
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                        <div className="bg-surface-2 rounded-xl p-[12px]">
                          <p className="text-[11px] font-bold text-text-muted uppercase mb-[4px]">Why it matters</p>
                          <p className="text-[13px] text-text-secondary">{gap.whyItMatters}</p>
                        </div>
                        <div className="bg-surface-2 rounded-xl p-[12px]">
                          <p className="text-[11px] font-bold text-text-muted uppercase mb-[4px]">Evidence status</p>
                          <p className="text-[13px] text-text-secondary">{gap.whatEvidenceIsMissing}</p>
                        </div>
                        {gap.relatedExperience && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-[12px]">
                            <p className="text-[11px] font-bold text-amber-700 uppercase mb-[4px]">Related experience</p>
                            <p className="text-[13px] text-text-secondary">{gap.relatedExperience}</p>
                          </div>
                        )}
                        {gap.suggestedProject && (
                          <div className="bg-primary-light border border-primary/20 rounded-xl p-[12px]">
                            <p className="text-[11px] font-bold text-primary uppercase mb-[4px]">Portfolio suggestion</p>
                            <p className="text-[13px] text-text-secondary">{gap.suggestedProject}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-surface-2 border border-border rounded-xl p-[12px]">
                        <p className="text-[11px] font-bold text-text-muted uppercase mb-[4px]">
                          <MessageSquare className="w-[11px] h-[11px] inline mr-[4px]" />
                          Interview question
                        </p>
                        <p className="text-[13px] text-text italic">"{gap.suggestedInterviewQuestion}"</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'interview' && (
              <div className="space-y-[16px]">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-[16px] text-[14px] text-amber-800">
                  <AlertTriangle className="w-[14px] h-[14px] inline mr-[8px]" />
                  These questions are generated based on gaps in the candidate's evidence profile. They are suggestions — recruiters should adapt them based on the actual conversation.
                </div>
                {match.requirementAssessments
                  .filter(r => r.suggestedInterviewQuestion)
                  .map((req, i) => (
                    <div key={i} className="bg-surface border border-border rounded-xl p-[20px]">
                      <div className="flex items-center gap-[8px] mb-[12px]">
                        <StatusPill status={req.status} />
                        <span className="text-[14px] font-bold text-text">{req.requirementName}</span>
                      </div>
                      <p className="text-[14px] text-text italic border-l-2 border-primary pl-[12px]">
                        "{req.suggestedInterviewQuestion}"
                      </p>
                      {req.recruiterAction && (
                        <p className="text-[12px] text-text-muted mt-[8px]">Rationale: {req.recruiterAction}</p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* AI Metadata Footer */}
          <div className="bg-surface-2/40 border border-border rounded-xl p-[16px] text-center">
            <p className="text-[11px] text-text-muted">
              Analysis by {match.modelProvider} v{match.modelVersion} · Knowledge Base v{match.knowledgeVersion} · Rules v{match.rulesVersion}
              {' · '}<span className="font-bold">Human review required before any hiring decision.</span>
              {match.inputHash && ` · Hash: ${match.inputHash}`}
            </p>
          </div>
            </>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
