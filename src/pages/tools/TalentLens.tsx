// ============================================================
// HireFlow — Candidate Intelligence Page
// Evidence-based candidate-vs-job analysis for recruiters
// Per spec: show evidence, separate eligibility/relevance/confidence,
// never fabricate, distinguish "no evidence" from "not skilled"
// ============================================================
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  Brain, CheckCircle2, XCircle, AlertTriangle, HelpCircle,
  ChevronDown, ChevronUp, ArrowLeft, RefreshCw, Users,
  MessageSquare, Target, Shield, TrendingUp, Eye, Clock,
  Award, Star, ChevronRight, Sparkles, Bookmark
} from 'lucide-react';
import { analyzeCandidate } from '../../lib/ai/matching';
import type { CandidateMatch, RequirementAssessment } from '../../types';
import { useProfile } from '../../features/suite/profile/ProfileContext';
import { QuickSummaryCard } from '../../features/suite/components/QuickSummaryCard';
import { buildQuickSummary } from '../../features/suite/engine/quickSummary';
import { SimulationFacts } from '../../features/suite/engine/simulateFix';
import { DEMO_TALENTLENS_RESUME } from '../demo/useTalentLensStore';
import { HonestyExplainerModal } from '../../components/common/HonestyExplainerModal';
import { DataProvenanceModal } from '../../components/common/DataProvenanceModal';
import { RealityFactorsPanel } from '../../components/common/RealityFactorsPanel';
import { JobRoleProjectBridge } from '../../features/suite/briefs/components/JobRoleProjectBridge';
import { ResumePreviewModal } from '../../components/common/ResumePreviewModal';
import { WhyThisScoreDrawer, StaleVersionBanner } from '../../components/scoring';
import { PublicNavbar } from '../../components/common/PublicNavbar';
import { ReportErrorModal } from '../../components/common/ReportErrorModal';

// ── Status Components ──

function MatchStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'STRONG': return <CheckCircle2 className="w-4 h-4 text-volt flex-shrink-0" />;
    case 'PARTIAL': return <AlertTriangle className="w-4 h-4 text-pale-yellow flex-shrink-0" />;
    case 'INFERRED': return <TrendingUp className="w-4 h-4 text-volt flex-shrink-0" />;
    case 'MISSING': return <XCircle className="w-4 h-4 text-danger flex-shrink-0" />;
    case 'UNCERTAIN': return <HelpCircle className="w-4 h-4 text-silver flex-shrink-0" />;
    default: return <HelpCircle className="w-4 h-4 text-silver flex-shrink-0" />;
  }
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    STRONG: "bg-black text-volt border-volt",
    PARTIAL: "bg-black text-pale-yellow border-pale-yellow/50",
    INFERRED: "bg-black text-volt border-volt/40",
    MISSING: "bg-black text-danger border-danger/50",
    UNCERTAIN: "bg-black text-silver border-charcoal",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border uppercase ${map[status] ?? map.UNCERTAIN}`}>
      {status}
    </span>
  );
}

function DimensionBadge({ label, value }: { label: string; value: string }) {
  const colorMap: Record<string, string> = {
    STRONG: "text-volt",
    MODERATE: "text-pale-yellow",
    WEAK: "text-danger",
    HIGH: "text-volt",
    MEDIUM: "text-pale-yellow",
    LOW: "text-danger",
    ELIGIBLE: "text-volt",
    CONDITIONAL: "text-pale-yellow",
    INELIGIBLE: "text-danger",
    INSUFFICIENT: "text-danger",
    UNCLEAR: "text-silver",
    NONE: "text-silver",
  };
  return (
    <div className="bg-[#141414] border border-charcoal rounded-lg p-4">
      <p className="text-[10px] font-mono font-bold text-silver uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-bold font-mono ${colorMap[value] ?? 'text-white'}`}>{value}</p>
    </div>
  );
}

// ── Requirement Card ──
function RequirementCard({ assessment }: { assessment: RequirementAssessment }) {
  const [expanded, setExpanded] = useState(false);
  const priorityColors: Record<string, string> = {
    MANDATORY: "bg-black text-danger border-danger/40",
    PREFERRED: "bg-black text-volt border-volt/40",
    OPTIONAL: "bg-black text-silver border-charcoal",
  };

  return (
    <div className="border border-charcoal bg-[#141414] rounded-lg overflow-hidden transition-all">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <MatchStatusIcon status={assessment.status} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-mono">{assessment.requirementName}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${priorityColors[assessment.requirementPriority]}`}>
                {assessment.requirementPriority}
              </span>
            </div>
            {assessment.evidenceText && !expanded && (
              <p className="text-xs text-silver mt-0.5 truncate max-w-[400px]">{assessment.evidenceText}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={assessment.status} />
          {assessment.confidence > 0 && (
            <span className="text-xs font-mono text-silver">{Math.round(assessment.confidence * 100)}% conf.</span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-silver" /> : <ChevronDown className="w-4 h-4 text-silver" />}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-charcoal">
          {assessment.evidenceText && (
            <div className="bg-black border border-charcoal rounded p-3 mt-3">
              <p className="text-[10px] font-mono font-bold text-silver uppercase tracking-wider mb-1">
                EVIDENCE · {assessment.evidenceSource ?? 'profile'}
              </p>
              <p className="text-xs text-silver italic leading-relaxed">{assessment.evidenceText}</p>
            </div>
          )}

          {assessment.relatedEvidence && (
            <div className="bg-black border border-charcoal rounded p-3">
              <p className="text-[10px] font-mono font-bold text-pale-yellow uppercase tracking-wider mb-1">
                RELATED EVIDENCE · Semantic Match
              </p>
              <p className="text-xs text-silver leading-relaxed">{assessment.relatedEvidence}</p>
              {assessment.semanticRelationship && (
                <p className="text-xs font-mono text-silver/60 mt-1 italic">↳ {assessment.semanticRelationship}</p>
              )}
            </div>
          )}

          {assessment.missingEvidenceExplanation && (
            <div className="bg-black border border-charcoal rounded p-3">
              <p className="text-[10px] font-mono font-bold text-silver uppercase tracking-wider mb-1">
                EVIDENCE STATUS
              </p>
              <p className="text-xs text-silver leading-relaxed">{assessment.missingEvidenceExplanation}</p>
            </div>
          )}

          {assessment.recruiterAction && (
            <div className="bg-black border border-charcoal rounded p-3">
              <p className="text-[10px] font-mono font-bold text-volt uppercase tracking-wider mb-1">
                RECRUITER ACTION
              </p>
              <p className="text-xs text-white leading-relaxed">{assessment.recruiterAction}</p>
            </div>
          )}

          {assessment.suggestedInterviewQuestion && (
            <div className="bg-black border border-charcoal rounded p-3">
              <p className="text-[10px] font-mono font-bold text-silver uppercase tracking-wider mb-1">
                <MessageSquare className="w-3 h-3 inline mr-1 text-volt" />
                SUGGESTED INTERVIEW QUESTION
              </p>
              <p className="text-xs text-white italic leading-relaxed">"{assessment.suggestedInterviewQuestion}"</p>
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
  const [isWhyScoreOpen, setIsWhyScoreOpen] = useState(false);

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
        evidenceTier: ra.status === 'STRONG' ? 0.85 : 0.5, // spec-exempt: legacy view replaced in Stage 4
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
      <div className="min-h-screen bg-black text-white p-8 text-center font-sans">
        <p className="text-silver">Candidate not found.</p>
        <Link to="/" className="mt-4 inline-block text-volt font-mono text-xs hover:underline">← Go back to Home</Link>
      </div>
    );
  }

  
  const jobRoleBridgeSkills = useMemo(() => {
    if (!match?.requirementAssessments) return [];
    return match.requirementAssessments.map((ra) => ({
      name: ra.requirementName,
      isMandatory: ra.requirementPriority === 'MANDATORY',
      status: ra.status === 'STRONG' ? ('verified' as const) : ('gap' as const),
    }));
  }, [match?.requirementAssessments]);

  
  const activeResumeText = useMemo(() => {
    return profile?.resumeRawText || DEMO_TALENTLENS_RESUME.text;
  }, [profile?.resumeRawText]);

  const activeResumeFileName = useMemo(() => {
    return profile?.headline ? `${candidate?.displayName || 'Candidate'} - Resume` : DEMO_TALENTLENS_RESUME.fileName;
  }, [profile?.headline, candidate?.displayName]);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 md:px-8 relative font-sans">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        <div className="text-center max-w-3xl mx-auto mb-12 mt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] border border-charcoal rounded text-xs font-mono uppercase tracking-wider text-volt mb-4">
            <Sparkles className="w-3.5 h-3.5 text-volt" /> B2B Engine Demo
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3">
            Talent<span className="text-volt">Lens</span> Simulator
          </h1>
          <p className="text-silver text-sm max-w-2xl mx-auto leading-relaxed">
            Experience our proprietary B2B matching engine. See how it deeply analyzes semantic context instead of just keyword matching.
          </p>
          <div className="mt-4 flex items-center justify-center">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-volt/10 hover:bg-volt/20 text-volt border border-volt/30 text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Browse All 216+ Companies &amp; 1,570+ Roles in TalentLens™ Catalog →</span>
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-black border border-charcoal flex items-center justify-center text-volt text-base font-mono font-bold">
              {candidate.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-white tracking-tight">{candidate.displayName}</h1>
              <p className="text-xs font-mono text-silver">{profile?.headline ?? 'Candidate'}</p>
            </div>
          </div>

        <div className="flex items-center gap-3 flex-wrap">
          <HonestyExplainerModal tool="talentlens" />
          <DataProvenanceModal triggerButtonText="Data Sources & Legal Shield" />
          <ResumePreviewModal
            resumeText={activeResumeText}
            fileName={activeResumeFileName}
            triggerButtonText="Preview Candidate Resume"
          />
          {/* Job selector */}
          <select
            value={selectedJobId}
            onChange={e => { setSelectedJobId(e.target.value); setMatch(null); }}
            className="h-10 px-3 border border-charcoal rounded text-xs font-mono bg-black text-white focus:border-volt outline-none"
          >
            <option value="">Select job to analyze against…</option>
            {companyJobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <button
            onClick={runAnalysis}
            disabled={!selectedJobId || !profile || analyzing}
            className="group h-10 px-5 bg-volt !text-black text-xs font-bold font-mono uppercase tracking-wider rounded hover:bg-[#1a1a1a] hover:!text-volt border border-volt transition-all flex items-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            {analyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin !text-black group-hover:!text-volt" />
            ) : (
              <Brain className="w-4 h-4 !text-black group-hover:!text-volt" />
            )}
            <span className="!text-black group-hover:!text-volt font-black">
              {analyzing ? 'Analyzing…' : match ? 'Re-Analyze' : 'Analyze'}
            </span>
          </button>

          <Link
            to="/tools/jd-compare"
            className="h-10 px-3.5 border border-charcoal rounded text-xs font-mono bg-black text-white hover:text-volt hover:border-volt flex items-center gap-1.5 transition-colors"
          >
            <span className="text-volt font-mono font-bold text-[13px]">⇄</span>
            Compare Companies
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-black border border-danger/40 rounded p-4 text-xs text-danger font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
          {error}
        </div>
      )}

      {!selectedJobId && (
        <div className="bg-[#141414] border border-charcoal rounded-lg p-16 text-center">
          <Brain className="w-10 h-10 text-silver mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-2">Select a job to run intelligence analysis</h3>
          <p className="text-xs text-silver max-w-md mx-auto leading-relaxed">Choose from the dropdown above to see evidence-based candidate assessment against that role's requirements.</p>
        </div>
      )}

      {selectedJobId && !match && !analyzing && (
        <div className="bg-[#141414] border border-charcoal rounded-lg p-16 text-center">
          <Target className="w-10 h-10 text-volt mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-2">Ready to analyze against "{selectedJob?.title}"</h3>
          <p className="text-xs text-silver max-w-md mx-auto leading-relaxed mb-6">The engine will assess each job requirement individually with evidence from the candidate's profile.</p>
          <button onClick={runAnalysis} className="group h-10 px-6 bg-volt !text-black text-xs font-bold font-mono uppercase tracking-wider rounded hover:bg-[#1a1a1a] hover:!text-volt border border-volt transition-all flex items-center gap-2 mx-auto cursor-pointer">
            <Brain className="w-4 h-4 !text-black group-hover:!text-volt" />
            <span className="!text-black group-hover:!text-volt font-black">Run Evidence Analysis</span>
          </button>
        </div>
      )}

      {analyzing && (
        <div className="bg-[#141414] border border-charcoal rounded-lg p-12 text-center">
          <RefreshCw className="w-8 h-8 text-volt mx-auto mb-4 animate-spin" />
          <h3 className="text-base font-bold text-white">Analyzing candidate against job requirements…</h3>
          <p className="text-xs font-mono text-silver mt-1">Extracting evidence · Resolving skills · Assessing requirements</p>
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
              {/* Evaluated Resume Content Preview Banner */}
              <ResumePreviewModal
                resumeText={activeResumeText}
                fileName={activeResumeFileName}
                showSnippetBanner={true}
              />

              {/* Stale Version Notification (Task 5.4) */}
              <StaleVersionBanner
                storedSpecVersion={(match as any).specVersion}
                storedFingerprint={(match as any).specFingerprint}
                className="mb-4"
              />

              {/* Score Overview */}
          <div className="bg-[#141414] border border-charcoal rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <h2 className="text-lg font-bold text-white">Intelligence Report</h2>
                  <button
                    type="button"
                    onClick={() => setIsWhyScoreOpen(true)}
                    className="ml-2 px-2.5 py-1 bg-black hover:border-volt border border-volt/40 text-xs font-mono uppercase rounded text-volt hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-volt" /> Why this score
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      saveFromResumeText(profile?.resumeRawText || DEMO_TALENTLENS_RESUME.text);
                      openDrawer();
                    }}
                    className="ml-2 px-2.5 py-1 bg-black hover:border-volt border border-charcoal text-xs font-mono uppercase rounded text-silver hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-volt" /> Save to profile
                  </button>
                </div>
                <p className="text-xs text-silver leading-relaxed">{match.explanation}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono font-bold text-silver uppercase tracking-wider">Market Readiness Estimate</p>
                <p className="text-4xl font-black font-mono text-white">{(match as any).trace?.compositeDisplay ?? match.overallScore}<span className="text-sm font-normal text-silver">/100</span></p>
                <p className="text-[10px] font-mono text-volt">
                  {(match as any).band ? `Band: ${(match as any).band.low}–${(match as any).band.high}% (${(match as any).band.label})` : 'Simulation Estimate'}
                </p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <DimensionBadge label="Required Skill Alignment" value={match.requiredSkillAlignment} />
              <DimensionBadge label="Experience Relevance" value={match.experienceRelevance} />
              <DimensionBadge label="Project Evidence" value={match.projectRelevance} />
              <DimensionBadge label="Evidence Confidence" value={match.evidenceConfidence} />
            </div>

            {/* Score Components (transparent calculation) */}
            {match.scoreComponents && match.scoreComponents.length > 0 && (
              <div className="border-t border-charcoal pt-5">
                <p className="text-xs font-mono font-bold text-silver uppercase tracking-wider mb-3">Score Calculation (Transparent)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {match.scoreComponents.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between bg-black border border-charcoal rounded px-3 py-2">
                      <div>
                        <p className="text-xs font-mono font-semibold text-white">{comp.dimension}</p>
                        <p className="text-[11px] text-silver">{comp.explanation}</p>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <p className="text-sm font-mono font-bold text-white">{comp.score}</p>
                        <p className="text-[10px] font-mono text-silver">×{comp.weight} wt</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-mono text-silver/60 mt-2">
                  AI: {match.modelProvider} {match.modelVersion} · Knowledge: {match.knowledgeVersion} · Analyzed: {new Date(match.analyzedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Strong Matches', count: match.strongMatches.length, color: 'text-volt' },
              { label: 'Partial Matches', count: match.partialMatches.length, color: 'text-pale-yellow' },
              { label: 'Missing Evidence', count: match.missingRequirements.length, color: 'text-danger' },
              { label: 'Uncertain / Verify', count: match.uncertainRequirements.length, color: 'text-silver' },
            ].map((item, i) => (
              <div key={i} className="border border-charcoal bg-[#141414] rounded-lg p-5 text-center">
                <p className={`text-3xl font-black font-mono ${item.color}`}>{item.count}</p>
                <p className="text-xs font-mono uppercase text-silver mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Evidence Summary */}
          {match.evidenceSummary && (
            <div className="bg-[#141414] border border-charcoal rounded-lg p-4 text-xs text-silver leading-relaxed">
              <p className="text-[10px] font-mono font-bold text-silver uppercase tracking-wider mb-1">Evidence Summary</p>
              {match.evidenceSummary}
            </div>
          )}

          {/* Reality Factors (Stage 3D, Unscored) */}
          <RealityFactorsPanel className="my-6" />

          {/* Target Role Skills & Project Brief Bridge */}
          <JobRoleProjectBridge
            skills={jobRoleBridgeSkills}
            roleTitle={selectedJob?.title || 'Target Job Role'}
            className="my-6"
          />

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-charcoal">
            {[
              { key: 'overview', label: 'Recruiter Recommendations' },
              { key: 'requirements', label: `All Requirements (${match.requirementAssessments.length})` },
              { key: 'gaps', label: `Skill Gaps (${match.skillGaps.length})` },
              { key: 'interview', label: 'Interview Questions' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-3 text-xs font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-volt text-volt font-bold'
                    : 'border-transparent text-silver hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {match.recruiterRecommendations.map((rec, i) => (
                  <div key={i} className="flex gap-3 bg-[#141414] border border-charcoal rounded-lg p-4">
                    <ChevronRight className="w-4 h-4 text-volt mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-silver leading-relaxed">{rec}</p>
                  </div>
                ))}
                {match.recruiterRecommendations.length === 0 && (
                  <div className="text-center py-12 text-silver text-xs font-mono">No specific recommendations — strong candidate profile.</div>
                )}
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-3">
                <div className="flex gap-2 mb-4">
                  {['STRONG', 'PARTIAL', 'UNCERTAIN', 'MISSING'].map(status => (
                    <span key={status} className="px-2.5 py-1 rounded text-[11px] font-mono font-bold border border-charcoal bg-black text-silver uppercase">
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
              <div className="space-y-4">
                {match.skillGaps.length === 0 ? (
                  <div className="text-center py-12 bg-[#141414] border border-charcoal rounded-lg">
                    <CheckCircle2 className="w-8 h-8 text-volt mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white font-mono uppercase">No significant skill gaps found</h3>
                    <p className="text-xs text-silver mt-1">Candidate shows evidence for all mandatory requirements.</p>
                  </div>
                ) : (
                  match.skillGaps.map((gap, i) => (
                    <div key={i} className="bg-[#141414] border border-charcoal rounded-lg p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white font-mono">{gap.skillName}</h3>
                          <span className={`text-[10px] font-mono font-bold uppercase ${gap.jobPriority === 'MANDATORY' ? 'text-danger' : 'text-pale-yellow'}`}>
                            {gap.jobPriority} requirement
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-black border border-charcoal rounded p-3">
                          <p className="text-[10px] font-mono font-bold text-silver uppercase mb-1">Why it matters</p>
                          <p className="text-xs text-silver leading-relaxed">{gap.whyItMatters}</p>
                        </div>
                        <div className="bg-black border border-charcoal rounded p-3">
                          <p className="text-[10px] font-mono font-bold text-silver uppercase mb-1">Evidence status</p>
                          <p className="text-xs text-silver leading-relaxed">{gap.whatEvidenceIsMissing}</p>
                        </div>
                        {gap.relatedExperience && (
                          <div className="bg-black border border-charcoal rounded p-3">
                            <p className="text-[10px] font-mono font-bold text-pale-yellow uppercase mb-1">Related experience</p>
                            <p className="text-xs text-silver leading-relaxed">{gap.relatedExperience}</p>
                          </div>
                        )}
                        {gap.suggestedProject && (
                          <div className="bg-black border border-charcoal rounded p-3">
                            <p className="text-[10px] font-mono font-bold text-volt uppercase mb-1">Portfolio suggestion</p>
                            <p className="text-xs text-white leading-relaxed">{gap.suggestedProject}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-black border border-charcoal rounded p-3">
                        <p className="text-[10px] font-mono font-bold text-silver uppercase mb-1">
                          <MessageSquare className="w-3 h-3 inline mr-1 text-volt" />
                          Interview question
                        </p>
                        <p className="text-xs text-white italic">"{gap.suggestedInterviewQuestion}"</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'interview' && (
              <div className="space-y-4">
                <div className="bg-black border border-pale-yellow/40 rounded p-4 text-xs text-pale-yellow flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-pale-yellow shrink-0" />
                  These questions are generated based on gaps in the candidate's evidence profile. They are suggestions — recruiters should adapt them based on the actual conversation.
                </div>
                {match.requirementAssessments
                  .filter(r => r.suggestedInterviewQuestion)
                  .map((req, i) => (
                    <div key={i} className="bg-[#141414] border border-charcoal rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <StatusPill status={req.status} />
                        <span className="text-xs font-mono font-bold text-white">{req.requirementName}</span>
                      </div>
                      <p className="text-xs text-white italic border-l-2 border-volt pl-3 leading-relaxed">
                        "{req.suggestedInterviewQuestion}"
                      </p>
                      {req.recruiterAction && (
                        <p className="text-[11px] font-mono text-silver mt-2">Rationale: {req.recruiterAction}</p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* AI Metadata Footer */}
          <div className="bg-[#141414] border border-charcoal rounded-lg p-4 text-center">
            <p className="text-[10px] font-mono text-silver">
              Analysis by {match.modelProvider} v{match.modelVersion} · Knowledge Base v{match.knowledgeVersion} · Rules v{match.rulesVersion}
              {' · '}<span className="font-bold text-white">Human review required before any hiring decision.</span>
              {match.inputHash && ` · Hash: ${match.inputHash}`}
            </p>
          </div>

          {/* Affirmative Trademark & Affiliation Disclaimer Footer */}
          <footer className="mt-6 pt-4 border-t border-charcoal text-center text-xs text-silver space-y-2 pb-6">
            <p className="max-w-2xl mx-auto leading-relaxed text-zinc-400">
              HireFlo is not affiliated with or endorsed by any company named. Names are used only to identify employers; trademarks belong to their owners.
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px]">
              <ReportErrorModal
                entityId={selectedJobId || currentCompanyId || 'talentlens-eval'}
                entityType="company"
              />
            </div>
          </footer>
            </>
          )}
        </div>
      )}

      {match && (
        <WhyThisScoreDrawer
          isOpen={isWhyScoreOpen}
          onClose={() => setIsWhyScoreOpen(false)}
          trace={(match as any).trace}
          toolName="TalentLens"
        />
      )}
      </div>
    </div>
  );
}
