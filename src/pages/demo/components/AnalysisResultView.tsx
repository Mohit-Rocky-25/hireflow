import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Company, Role, AnalysisResult } from '../talentLensData';
import { STATUS_CONFIG, TREND_COLOR, TREND_ICON } from '../talentLensData';
import { HonestyExplainerModal } from '../../../components/common/HonestyExplainerModal';
import { DataProvenanceModal } from '../../../components/common/DataProvenanceModal';
import { CalculationBreakdownCollapsible, CalculationDetails } from '../../../components/common/CalculationBreakdownCollapsible';
import { RealityFactorsPanel } from '../../../components/common/RealityFactorsPanel';
import { CompanyLogo } from '../../../components/common/CompanyLogo';
import { WhyThisScoreDrawer, StaleVersionBanner } from '../../../components/scoring';
import { useTalentLensStore, DEMO_TALENTLENS_RESUME } from '../useTalentLensStore';

export interface AnalysisResultViewProps {
  result: AnalysisResult;
  selectedRole: Role;
  company: Company;
  onBackToRoles: () => void;
  onChangeCompany: () => void;
  onNewResume: () => void;
}

export function AnalysisResultView({
  result,
  selectedRole,
  company,
  onBackToRoles,
  onChangeCompany,
  onNewResume,
}: AnalysisResultViewProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isWhyScoreOpen, setIsWhyScoreOpen] = useState(false);

  const missingComps = result.breakdown.filter((b) => b.analysis.status === 'absent');
  const provenComps = result.breakdown.filter(
    (b) => b.analysis.status === 'expert' || b.analysis.status === 'strong'
  );
  const partialComps = result.breakdown.filter((b) => b.analysis.status === 'working');

  const isInvalid = result.isValidResume === false;

  const roleFitStatus = isInvalid
    ? 'Unscoreable — Non-Resume Document'
    : result.score >= 75 && missingComps.length === 0
    ? 'Strong fit'
    : (result.score >= 50 && missingComps.length <= 1) ||
      (missingComps.length === 0 && partialComps.length > 0)
    ? 'Developing fit'
    : missingComps.length > 0
    ? 'Potential fit with evidence gaps'
    : partialComps.length > 0
    ? 'Developing fit'
    : 'Low current fit';

  const roleFitStyles = isInvalid
    ? 'bg-black text-danger border-danger'
    : roleFitStatus === 'Strong fit'
    ? 'bg-black text-volt border-volt'
    : roleFitStatus === 'Developing fit'
    ? 'bg-black text-pale-yellow border-pale-yellow/50'
    : roleFitStatus === 'Potential fit with evidence gaps'
    ? 'bg-black text-pale-yellow border-pale-yellow/40'
    : 'bg-black text-danger border-danger/50';

  return (
    <div className="max-w-[960px] mx-auto animate-fade-in text-white">
      {/* Stale Version Notification (Task 5.4) */}
      <StaleVersionBanner
        storedSpecVersion={result.trace?.specVersion}
        storedFingerprint={result.trace?.specFingerprint}
        className="mb-4"
      />

      {/* Level 1 Gatekeeper Card: Shown when submitted text is not a resume */}
      {isInvalid && (
        <div className="bg-[#141414] border-2 border-danger/70 rounded-xl p-6 sm:p-8 mb-6 shadow-2xl animate-fade-in text-left">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-charcoal">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-black border border-danger rounded-lg text-danger flex-shrink-0 font-mono text-2xl font-bold flex items-center justify-center w-12 h-12">
                [!]
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-black text-danger text-[11px] font-mono font-bold uppercase tracking-wider border border-danger/40 mb-2">
                  Level 1 Gatekeeper: Non-Resume Input Detected
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  Document Not Recognized as a Resume
                </h2>
                <p className="text-sm text-silver mt-1.5 leading-relaxed max-w-2xl">
                  TalentLens evaluated your submitted text and halted scoring. The input lacks the fundamental structural anatomy of an engineering resume (missing Experience, Technical Skills, Education, or Projects).
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 bg-black p-3.5 rounded border border-danger/40">
              <span className="text-3xl sm:text-4xl font-black font-mono text-danger">0%</span>
              <div className="text-[10px] font-mono uppercase text-silver">Refused to Score</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-black border border-charcoal rounded-lg">
              <div className="text-[11px] font-mono uppercase text-silver mb-1">Standard Sections</div>
              <div className="text-base font-bold text-danger">0 / 4 Detected</div>
              <div className="text-xs text-silver mt-1">Requires: Experience, Skills, Education, or Projects</div>
            </div>
            <div className="p-4 bg-black border border-charcoal rounded-lg">
              <div className="text-[11px] font-mono uppercase text-silver mb-1">Technical Vocabulary</div>
              <div className="text-base font-bold text-danger">0 Verified Signals</div>
              <div className="text-xs text-silver mt-1">No recognized programming languages or frameworks found</div>
            </div>
            <div className="p-4 bg-black border border-charcoal rounded-lg">
              <div className="text-[11px] font-mono uppercase text-silver mb-1">Integrity Policy</div>
              <div className="text-base font-bold text-danger">Zero Arbitrary Scoring</div>
              <div className="text-xs text-silver mt-1">Will not generate false ratings for random text</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-black border border-charcoal rounded-lg">
            <div className="text-xs font-bold font-mono text-white uppercase tracking-wider mb-2">
              Diagnosis & Rejection Reason:
            </div>
            <div className="text-xs text-silver font-mono leading-relaxed">
              {result.invalidReason || 'The submitted text does not contain recognizable resume structure or career history.'}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 items-center justify-between pt-6 border-t border-charcoal">
            <div className="text-xs text-silver font-mono">
              Calibrate {company.name} — {selectedRole.title} with a verified engineering resume:
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  useTalentLensStore.getState().setResume(DEMO_TALENTLENS_RESUME.text, DEMO_TALENTLENS_RESUME.fileName);
                  window.location.reload();
                }}
                className="px-5 py-2.5 rounded bg-volt !text-black font-bold text-xs uppercase tracking-[1px] hover:bg-[#1a1a1a] hover:!text-volt border border-volt transition-all cursor-pointer font-mono shadow-sm"
              >
                Load Sample Engineering Resume
              </button>
              <button
                type="button"
                onClick={onBackToRoles}
                className="px-4 py-2.5 rounded bg-black text-white hover:text-volt border border-charcoal hover:border-volt text-xs font-mono uppercase tracking-[1px] transition-colors cursor-pointer"
              >
                Back to Roles
              </button>
              <button
                type="button"
                onClick={onNewResume}
                className="px-4 py-2.5 rounded bg-black text-silver hover:text-white border border-charcoal hover:border-silver text-xs font-mono uppercase tracking-[1px] transition-colors cursor-pointer"
              >
                Paste Real Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Placement Readiness Quick Summary Card */}
      <div className="bg-[#141414] border border-charcoal rounded-xl p-6 sm:p-8 mb-6 space-y-6">
        {/* Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-charcoal">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-volt font-bold bg-volt/10 px-3 py-1 rounded-full border border-volt/30">
                Placement Readiness Assessment
              </span>
              <span className="text-silver/60">•</span>
              <span className="text-sm font-semibold text-white">
                {company.name} <span className="text-silver text-xs">({company.tier})</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Targeting: <span className="text-volt">{selectedRole.title}</span> <span className="text-silver text-base sm:text-lg font-normal">({selectedRole.level})</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {!isInvalid && (
              <button
                type="button"
                onClick={() => setIsWhyScoreOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-volt py-2 px-3.5 rounded-lg border border-volt/40 bg-black hover:bg-volt/10 transition-colors cursor-pointer"
              >
                <span className="text-xs font-black text-volt">?</span>
                <span>Why this score</span>
              </button>
            )}
            <HonestyExplainerModal tool="talentlens" />
            <DataProvenanceModal triggerButtonText="Sourcing & Legal" />
            <span
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${roleFitStyles}`}
            >
              {result.readinessLabel || roleFitStatus}
            </span>
            <div className="text-right">
              {isInvalid ? (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-danger">UNSCOREABLE</span>
                  <div className="text-xs uppercase text-silver mt-1">
                    Non-Resume Input Refused
                  </div>
                </>
              ) : (
                <>
                  <span className="text-4xl sm:text-5xl font-black text-volt">{result.score}%</span>
                  <div className="text-xs uppercase tracking-wider text-silver mt-1 font-semibold">
                    {result.band ? `Band: ${result.band.low}–${result.band.high}% (${result.band.label})` : 'Market Readiness Estimate'}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Grounded Role-Fit Explanation */}
        {isInvalid ? (
          <div className="p-5 rounded-xl bg-black border-2 border-danger/60 text-sm space-y-3">
            <div className="flex items-center gap-2 text-danger font-bold uppercase tracking-wider text-sm">
              <span className="text-danger font-bold">[!]</span>
              <span>Document Rejected by Authenticity Engine</span>
            </div>
            <p className="text-white text-base leading-relaxed">
              {result.invalidReason || 'The submitted text does not appear to be an authentic resume or CV. It lacks recognized section structure (Experience, Education, Skills) and career milestones. TalentLens strictly refuses to compute speculative scores or placement predictions on non-resume text.'}
            </p>
            {result.invalidIssues && result.invalidIssues.length > 0 && (
              <div className="bg-near-black p-4 rounded-lg border border-charcoal space-y-2">
                <div className="text-silver text-xs font-bold uppercase tracking-wider">Detection Diagnostics:</div>
                {result.invalidIssues.map((issue, idx) => (
                  <div key={idx} className="text-silver text-sm flex items-start gap-2">
                    <span className="text-danger font-bold">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={onNewResume}
                className="px-4 py-2 rounded bg-volt text-black font-bold text-xs hover:bg-volt/90 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Upload Real Resume →
              </button>
              <span className="text-xs text-silver">
                Upload a genuine PDF or DOCX containing your work history, technical projects, and educational qualifications.
              </span>
            </div>
          </div>
        ) : (
          <p className="text-base sm:text-lg text-silver/90 leading-relaxed font-normal">
            Based on evidence found in your resume text, your profile currently demonstrates a{' '}
            <strong className="text-volt font-bold">{(result.readinessLabel || roleFitStatus).toLowerCase()}</strong> readiness for{' '}
            <strong className="text-white font-bold">{selectedRole.title}</strong> at{' '}
            <strong className="text-white font-bold">{company.name}</strong>. {selectedRole.desc}
          </p>
        )}

        {/* How this was calculated collapsible */}
        {(() => {
          const calcDetails: CalculationDetails = {
            effectiveScore: result.score,
            scoreMin: result.band?.low ?? Math.max(0, result.score - 5),
            scoreMax: result.band?.high ?? Math.min(100, result.score + 5),
            band: result.readinessLabel || roleFitStatus,
            activePillars: result.trace?.pillars
              ? result.trace.pillars
                  .filter((p) => p.applicable)
                  .map((p) => ({
                    name: p.label,
                    weightPercent: Math.round(p.effectiveWeight * 100),
                    earnedScore: p.rawScore,
                    statusNote: p.flags.join(', ') || 'Applicable',
                  }))
              : result.breakdown.map((b) => ({
                  name: b.competency.toUpperCase(),
                  weightPercent: Math.round(100 / (result.breakdown.length || 1)),
                  earnedScore: Math.round(b.analysis.confidence),
                  statusNote: b.analysis.status,
                })),
            excludedPillars: result.trace?.pillars
              ? result.trace.pillars
                  .filter((p) => !p.applicable)
                  .map((p) => ({
                    name: p.label,
                    reason: p.notApplicableReason || 'Not applicable for candidate context',
                  }))
              : [],
            engineVersion: result.trace?.engineVersion || '4.0.0',
            taxonomyVersion: '2026.1',
            lastReviewedDate: 'October 2026',
          };
          return <CalculationBreakdownCollapsible details={calcDetails} />;
        })()}

        {/* Anti-gaming notice if detected */}
        {result.breakdown.some((b) => b.analysis.antiGamingFlag) && (
          <div className="p-4 bg-black border border-pale-yellow/40 rounded-xl text-sm text-pale-yellow flex items-center gap-3">
            <span className="text-base font-bold text-pale-yellow">[!]</span>
            <span>
              TalentLens™ detected keyword stuffing in{' '}
              {result.breakdown.filter((b) => b.analysis.antiGamingFlag).length} competency area(s).
              Skills must be supported with project bullets.
            </span>
          </div>
        )}

        {/* Reality Factors (Stage 3D, Unscored) */}
        <RealityFactorsPanel className="my-4" />

        {/* 8-Facet Quick Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-black p-4 sm:p-5 rounded-xl border border-charcoal">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Best-Fit Roles
            </div>
            <div className="text-base font-bold text-white">{selectedRole.title}</div>
            <div className="text-xs sm:text-sm text-silver mt-1">{roleFitStatus}</div>
          </div>

          <div className="bg-black p-4 sm:p-5 rounded-xl border border-charcoal">
            <div className="text-xs font-bold uppercase tracking-wider text-volt mb-1.5">
              Strongest Evidence
            </div>
            <div className="text-base font-bold text-volt truncate">
              {provenComps.length > 0
                ? provenComps.map((p) => p.competency.toUpperCase()).slice(0, 3).join(', ')
                : partialComps.length > 0
                ? partialComps.map((p) => p.competency.toUpperCase()).slice(0, 3).join(', ') +
                  ' (Partial)'
                : 'Foundational'}
            </div>
            <div className="text-xs sm:text-sm text-silver mt-1">
              {provenComps.length > 0
                ? `${provenComps.length} demonstrated areas`
                : partialComps.length > 0
                ? `${partialComps.length} partial evidence areas`
                : '0 demonstrated areas'}
            </div>
          </div>

          <div className="bg-black p-4 sm:p-5 rounded-xl border border-charcoal">
            <div className="text-xs font-bold uppercase tracking-wider text-pale-yellow mb-1.5">
              Partial Competencies
            </div>
            <div className="text-base font-bold text-pale-yellow truncate">
              {partialComps.map((p) => p.competency.toUpperCase()).slice(0, 3).join(', ') ||
                'None'}
            </div>
            <div className="text-xs sm:text-sm text-silver mt-1">
              {partialComps.length} need deeper metrics
            </div>
          </div>

          <div className="bg-black p-4 sm:p-5 rounded-xl border border-charcoal">
            <div className="text-xs font-bold uppercase tracking-wider text-danger mb-1.5">
              Missing Competencies
            </div>
            <div className="text-base font-bold text-danger truncate">
              {missingComps.map((m) => m.competency.toUpperCase()).slice(0, 3).join(', ') ||
                'Zero missing'}
            </div>
            <div className="text-xs sm:text-sm text-silver mt-1">
              {missingComps.length} critical gaps
            </div>
          </div>

          <div className="bg-black p-4 sm:p-5 rounded-xl border border-charcoal">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Best-Fit Company Groups
            </div>
            <div className="text-base font-bold text-white">{company.tier} Tier</div>
            <div className="text-xs sm:text-sm text-silver mt-1">
              {company.industry} focus
            </div>
          </div>

          <div className="bg-black p-4 sm:p-5 rounded-xl border border-charcoal">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Main Risk Factor
            </div>
            <div className="text-base font-bold text-white truncate">
              {missingComps.length > 0
                ? `Missing ${missingComps[0].competency.toUpperCase()}`
                : 'Scale metrics required'}
            </div>
            <div className="text-xs sm:text-sm text-silver mt-1">Top screening filter</div>
          </div>

          <div className="bg-black p-4 sm:p-5 rounded-xl border border-charcoal sm:col-span-2">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Three Next Actions
            </div>
            <div className="text-sm text-silver space-y-1.5">
              <div>1. {result.plans[0]?.title || 'Quantify project impact metrics'}</div>
              <div>2. {result.plans[1]?.title || 'Deploy demo project with modern stack'}</div>
            </div>
          </div>
        </div>

        {/* Competency Pill Status Badges */}
        <div className="pt-2 flex justify-center gap-2.5 flex-wrap">
          {result.breakdown.map((b) => {
            const isExpertOrStrong = b.analysis.status === 'expert' || b.analysis.status === 'strong';
            const isWorking = b.analysis.status === 'working';
            return (
              <span
                key={b.competency}
                className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                  isExpertOrStrong
                    ? 'border-volt text-volt bg-black'
                    : isWorking
                    ? 'border-pale-yellow/40 text-pale-yellow bg-black'
                    : 'border-danger/40 text-danger bg-black'
                }`}
              >
                {b.analysis.antiGamingFlag && <span className="text-xs font-bold text-pale-yellow">[!]</span>}
                {b.analysis.status === 'expert'
                  ? '✓✓'
                  : b.analysis.status === 'strong'
                  ? '✓'
                  : b.analysis.status === 'working'
                  ? '~'
                  : '✗'}{' '}
                {b.competency.toUpperCase()}
              </span>
            );
          })}
        </div>

        {/* Cross-Section Connection CTA */}
        <div className="p-4 rounded-lg bg-black border border-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
              <span className="text-volt font-mono font-bold text-sm">⚡</span> Evaluate in ATS Resume Roaster
            </div>
            <div className="text-xs text-silver mt-0.5">
              Test job-specific fit with full 7-dimension scoring and safe bullet rewrites for this
              exact position.
            </div>
          </div>

          <Link
            to={`/tools/resume-checker?company=${company.id}&role=${encodeURIComponent(
              selectedRole.title
            )}`}
            className="group px-4 py-2 bg-volt !text-black text-xs font-bold rounded hover:bg-[#1a1a1a] hover:!text-volt border border-volt transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs font-mono uppercase tracking-wider"
          >
            <span className="!text-black group-hover:!text-volt font-black">Open ATS Roaster</span>
            <span className="font-bold text-sm !text-black group-hover:!text-volt">→</span>
          </Link>
        </div>

        {/* Stored Company Benchmark Provenance Box */}
        <div className="text-xs font-mono text-silver bg-black p-3 rounded border border-charcoal flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-bold text-white">Benchmark Source:</span> HireFlo Curated
            Benchmark Index 2024-2025 • <span className="font-bold text-white">Version:</span> v1.2.0
            • <span className="font-bold text-white">Confidence:</span> High
          </div>
          <div className="text-[11px] text-silver/60">Directional diagnostic benchmark. Not an automated hiring decision.</div>
        </div>
      </div>
        {/* 6-Layer analysis legend */}
      <div className="bg-[#141414] border border-charcoal rounded-xl p-4 sm:p-5 mb-5">
        <div className="flex flex-wrap gap-2.5 items-center">
          <span className="text-xs sm:text-sm font-bold text-neutral-300 uppercase tracking-wide mr-1">
            TalentLens™ 6-Layer Analysis:
          </span>
          {[
            'L1 Keywords',
            'L2 Context',
            'L3 Production Depth',
            'L4 Quantified Impact',
            'L5 Cognitive Screening',
            'L6 Progression',
          ].map((layer, i) => (
            <span
              key={i}
              className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-md bg-black border border-charcoal text-volt"
            >
              {layer}
            </span>
          ))}
          <span className="text-xs sm:text-sm text-neutral-400 ml-auto font-medium">
            Weighted calculation — anti-gaming enabled
          </span>
        </div>
      </div>

      {/* Company context */}
      <div className="bg-[#141414] border border-charcoal rounded-xl p-5 sm:p-6 mb-5">
        <h3 className="font-bold text-white text-base sm:text-lg mb-4 flex items-center gap-2.5 uppercase tracking-wide">
          <CompanyLogo company={company} size="xs" showBorder={false} interactive={false} />
          <span>Company Hiring Context — {company.name}</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Hires 2024',
              value: company.hiring2024 != null ? company.hiring2024.toLocaleString() : '—',
              sub: `${TREND_ICON[company.trend]} from ${
                company.hiring2023 != null ? company.hiring2023.toLocaleString() : '—'
              } (2023)`,
              subColor: company.trend === 'up' ? 'text-volt' : company.trend === 'down' ? 'text-danger' : 'text-pale-yellow',
            },
            {
              label: 'Open Roles',
              value: `${company.openRoles}+`,
              sub: company.industry,
              subColor: 'text-neutral-400',
            },
            {
              label: 'Avg Package',
              value: company.avgPackage,
              sub: company.tier,
              subColor: 'text-neutral-400',
            },
            {
              label: 'Glassdoor',
              value: `⭐ ${company.glassdoor}`,
              sub: 'Employee Rating',
              subColor: 'text-neutral-400',
            },
          ].map(({ label, value, sub, subColor }) => (
            <div key={label} className="bg-black border border-charcoal rounded-xl p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">{label}</div>
              <div className="text-2xl sm:text-3xl font-black text-white">{value}</div>
              <div className={`text-xs sm:text-sm font-semibold mt-1 ${subColor || 'text-neutral-400'}`}>
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep skill breakdown */}
      <div className="bg-[#141414] border border-charcoal rounded-xl p-5 sm:p-6 mb-5">
        <h3 className="font-bold text-white text-base sm:text-lg mb-4 flex items-center gap-2 uppercase tracking-wide">
          <span className="text-volt font-bold text-base">◎</span> 6-Layer Competency Intelligence Report
        </h3>
        <div className="space-y-4">
          {result.breakdown.map((b) => {
            const isExpertOrStrong = b.analysis.status === 'expert' || b.analysis.status === 'strong';
            const isWorking = b.analysis.status === 'working';
            const statusLabel =
              b.analysis.status === 'expert'
                ? 'Expert'
                : b.analysis.status === 'strong'
                ? 'Strong'
                : b.analysis.status === 'working'
                ? 'Partial'
                : 'Not Found';

            return (
              <div
                key={b.competency}
                className="p-4 sm:p-5 rounded-xl border border-charcoal bg-black"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-sm sm:text-base font-bold uppercase tracking-wide ${
                      isExpertOrStrong ? 'text-volt' : isWorking ? 'text-pale-yellow' : 'text-danger'
                    }`}>
                      {b.competency}
                    </span>
                    <span className="text-xs font-semibold bg-[#141414] border border-charcoal text-neutral-300 px-2.5 py-0.5 rounded">
                      Required: {b.reqLevel}
                    </span>
                    {b.analysis.antiGamingFlag && (
                      <span className="text-xs bg-black text-pale-yellow px-2.5 py-0.5 rounded font-bold border border-pale-yellow/40 flex items-center gap-1">
                        [!] Gaming Detected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-sm font-bold ${
                      isExpertOrStrong ? 'text-volt' : isWorking ? 'text-pale-yellow' : 'text-danger'
                    }`}>{statusLabel}</span>
                    <span className="text-xs font-medium text-neutral-400">
                      ({b.analysis.confidence}% confidence)
                    </span>
                  </div>
                </div>

                {/* 5-layer score bars */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[
                    { label: 'L1 Keywords', val: b.analysis.layerScores.l1 },
                    { label: 'L2 Context', val: b.analysis.layerScores.l2 },
                    { label: 'L3 Depth', val: b.analysis.layerScores.l3 },
                    { label: 'L4 Impact', val: b.analysis.layerScores.l4 },
                    { label: 'L5 Auth', val: b.analysis.layerScores.l5 },
                  ].map((layer) => (
                    <div key={layer.label} className="text-center">
                      <div className="h-2 bg-[#1c1c1c] rounded-full mb-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            layer.val > 60
                              ? 'bg-volt'
                              : layer.val > 30
                              ? 'bg-pale-yellow'
                              : 'bg-danger'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, layer.val))}%` }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-neutral-300">{layer.label}</div>
                    </div>
                  ))}
                </div>

                {/* Context sentences */}
                {b.analysis.contextSentences.length > 0 && (
                  <div className="p-3 bg-[#141414] rounded-lg border border-charcoal">
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1">
                      Verified context sentences:
                    </div>
                    {b.analysis.contextSentences.slice(0, 2).map((s, i) => (
                      <p
                        key={i}
                        className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic"
                      >
                        &ldquo;{s.length > 120 ? s.substring(0, 120) + '...' : s}&rdquo;
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement Plan */}
      <div className="bg-[#141414] border border-charcoal rounded-xl p-5 sm:p-6 mb-6">
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="w-full flex items-center justify-between cursor-pointer"
        >
          <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2 uppercase tracking-wide">
            <span className="text-pale-yellow font-bold text-base">★</span> TalentLens™ Career Acceleration Plan ({result.plans.length} actions)
          </h3>
          {showSuggestions ? (
            <span className="text-neutral-400 text-sm">▲</span>
          ) : (
            <span className="text-neutral-400 text-sm">▼</span>
          )}
        </button>
        {showSuggestions && (
          <div className="mt-4 space-y-4">
            {result.plans.map((plan, i) => (
              <div
                key={i}
                className="rounded-xl border border-charcoal bg-black p-4 sm:p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded tracking-wide border ${
                        plan.priority === 'critical'
                          ? 'bg-black text-danger border-danger/40'
                          : plan.priority === 'high'
                          ? 'bg-black text-pale-yellow border-pale-yellow/40'
                          : 'bg-black text-volt border-volt'
                      }`}
                    >
                      {plan.priority}
                    </span>
                    <h4 className="font-bold text-white text-sm sm:text-base">{plan.title}</h4>
                  </div>
                  <span className="text-xs font-semibold text-neutral-300 whitespace-nowrap ml-2 bg-[#141414] border border-charcoal px-2.5 py-1 rounded">
                    {plan.timeframe}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed mb-3">
                  {plan.detail}
                </p>
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1">
                    Curated resources:
                  </div>
                  {plan.resources.map((r, ri) => (
                    <div key={ri} className="flex items-start gap-2">
                      <span className="text-volt font-bold text-sm flex-shrink-0">
                        {ri + 1}.
                      </span>
                      <p className="text-sm text-neutral-300 leading-normal">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Intelligence Report */}
      <div className="bg-[#141414] border border-charcoal rounded-xl p-5 sm:p-6 mb-7">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg mb-1 flex items-center gap-2 uppercase tracking-wide">
              <span className="text-volt font-bold text-base">&gt;_</span> Market Intelligence &amp; Build Verification Report
            </h3>
            <p className="text-sm text-neutral-300">
              Deep research engine — cross-references your actual build usage against 2024-25 market standards.
            </p>
          </div>
          <div
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide flex-shrink-0 bg-black border border-volt text-volt self-start"
          >
            {result.marketIntel.marketPosition}
          </div>
        </div>

        {/* 4 metric scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: 'Overall Market Fit',
              val: result.marketIntel.overallMarketFit,
              sub: 'vs 2024-25 benchmark',
            },
            {
              label: 'Tech Currency',
              val: result.marketIntel.techCurrencyScore,
              sub: 'Modern vs outdated stack',
            },
            {
              label: 'Build Authenticity',
              val: result.marketIntel.buildAuthenticity,
              sub: 'Deployment, tests, monitoring',
            },
            {
              label: 'Fundamental Depth',
              val: result.marketIntel.fundamentalDepth,
              sub: 'Production patterns used',
            },
          ].map((m) => (
            <div key={m.label} className="bg-black border border-charcoal rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-white">
                {m.val}
                <span className="text-sm text-neutral-400 font-normal">%</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 mt-1">{m.label}</div>
              <div className="text-xs text-neutral-400 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className="p-4 bg-black rounded-xl border border-charcoal mb-5">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
            Build Research Verdict
          </div>
          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-medium">
            {result.marketIntel.buildVerdict}
          </p>
        </div>

        {/* Per-competency findings */}
        <div className="space-y-3 mb-5">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
            Per-Competency Market Research
          </div>
          {result.marketIntel.findings.map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-charcoal bg-black p-4"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-base">{f.icon}</span>
                <span className="text-sm font-bold uppercase tracking-wide text-white">
                  {f.category}
                </span>
                <span
                  className="text-xs uppercase font-bold px-2.5 py-1 rounded border border-charcoal bg-[#141414] text-neutral-300 ml-auto"
                >
                  {f.status.replace('-', ' ')}
                </span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed mb-2">
                {f.finding}
              </p>
              {f.evidence.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {f.evidence.map((ev, ei) => (
                    <span
                      key={ei}
                      className="text-xs font-medium px-2 py-0.5 rounded bg-[#141414] border border-charcoal text-neutral-300"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-neutral-400 italic">
                {f.marketContext}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3 Action Buttons */}
      <div className="flex flex-wrap gap-3.5 justify-center pt-2 pb-8">
        <button
          type="button"
          onClick={onBackToRoles}
          className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-volt !text-black font-bold text-sm hover:bg-[#1a1a1a] hover:!text-volt border border-volt transition-all shadow-sm cursor-pointer uppercase tracking-wider"
        >
          <span className="font-bold text-base !text-black group-hover:!text-volt">←</span>
          <span className="!text-black group-hover:!text-volt font-black">Back to Roles</span>
        </button>
        <button
          type="button"
          onClick={onChangeCompany}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-charcoal bg-black text-white hover:text-volt hover:border-volt text-sm font-semibold transition-all cursor-pointer uppercase tracking-wider"
        >
          <span>Change Company</span>
        </button>
        <button
          type="button"
          onClick={onNewResume}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-charcoal bg-black text-neutral-300 hover:text-white hover:border-neutral-300 text-sm font-semibold transition-all cursor-pointer uppercase tracking-wider"
        >
          <span className="text-sm font-bold">↺</span> New Resume
        </button>
      </div>

      {/* Sourcing & Legal Shield Footer */}
      <div className="mb-6 p-4 rounded-lg bg-[#0e0e0e] border border-charcoal/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-silver">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-volt flex-shrink-0" />
          <span>
            <strong>Deterministic Evaluation:</strong> Evaluated against public career criteria for {company.name} ({selectedRole.title}). Indian Copyright Act §52 & Nominative Fair Use.
          </span>
        </div>
        <DataProvenanceModal
          triggerButtonText="Data Sources & Legal Shield"
          triggerButtonClassName="px-3 py-1.5 bg-black border border-charcoal hover:border-volt rounded text-xs font-semibold uppercase tracking-[1px] text-volt hover:text-white transition-colors cursor-pointer"
        />
      </div>

      <WhyThisScoreDrawer
        isOpen={isWhyScoreOpen}
        onClose={() => setIsWhyScoreOpen(false)}
        trace={result.trace}
        toolName="TalentLens"
      />
    </div>
  );
}
