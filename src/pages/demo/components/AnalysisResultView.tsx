import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  Zap,
  ArrowRight,
  ArrowLeft,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import type { Company, Role, AnalysisResult } from '../talentLensData';
import { STATUS_CONFIG, TREND_COLOR, TREND_ICON } from '../talentLensData';
import { HonestyExplainerModal } from '../../../components/common/HonestyExplainerModal';
import { CalculationBreakdownCollapsible, CalculationDetails } from '../../../components/common/CalculationBreakdownCollapsible';
import { RealityFactorsPanel } from '../../../components/common/RealityFactorsPanel';
import { EligibilityCard } from '../../../components/common/EligibilityCard';
import { CompanyLogo } from '../../../components/common/CompanyLogo';
import { WhyThisScoreDrawer, StaleVersionBanner } from '../../../components/scoring';
import { HelpCircle } from 'lucide-react';

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

  const roleFitStatus =
    result.score >= 75 && missingComps.length === 0
      ? 'Strong fit'
      : (result.score >= 50 && missingComps.length <= 1) ||
        (missingComps.length === 0 && partialComps.length > 0)
      ? 'Developing fit'
      : missingComps.length > 0
      ? 'Potential fit with evidence gaps'
      : partialComps.length > 0
      ? 'Developing fit'
      : 'Low current fit';

  const roleFitStyles =
    roleFitStatus === 'Strong fit'
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

      {/* 1. Placement Readiness Quick Summary Card */}
      <div className="bg-[#141414] border border-charcoal rounded-lg p-6 mb-5 space-y-6">
        {/* Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-charcoal">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-wider text-silver">
                Placement Readiness Assessment (Simulation)
              </span>
              <span className="text-silver">•</span>
              <span className="text-xs font-mono text-white">
                {company.name} ({company.tier})
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Targeting: {selectedRole.title} ({selectedRole.level})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsWhyScoreOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-volt py-1.5 px-3 rounded border border-volt/40 bg-black hover:bg-volt/10 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-volt" />
              <span>Why this score</span>
            </button>
            <HonestyExplainerModal tool="talentlens" />
            <span
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider border ${roleFitStyles}`}
            >
              {result.readinessLabel || roleFitStatus}
            </span>
            <div className="text-right">
              <span className="text-3xl font-black font-mono text-white">{result.score}%</span>
              <div className="text-[10px] font-mono uppercase text-silver">
                {result.band ? `Band: ${result.band.low}–${result.band.high}% (${result.band.label})` : 'Market Readiness Estimate'}
              </div>
            </div>
          </div>
        </div>

        {/* Grounded Role-Fit Explanation */}
        <p className="text-sm text-silver leading-relaxed">
          Based on evidence found in your resume text, your profile currently demonstrates a{' '}
          <strong className="text-white font-semibold">{(result.readinessLabel || roleFitStatus).toLowerCase()}</strong> readiness for{' '}
          <strong className="text-white font-semibold">{selectedRole.title}</strong> at{' '}
          <strong className="text-white font-semibold">{company.name}</strong>. {selectedRole.desc}
        </p>

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
          <div className="p-3 bg-black border border-pale-yellow/40 rounded text-xs text-pale-yellow flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-pale-yellow" />
            <span>
              TalentLens™ detected keyword stuffing in{' '}
              {result.breakdown.filter((b) => b.analysis.antiGamingFlag).length} competency area(s).
              Skills must be supported with project bullets.
            </span>
          </div>
        )}

        {/* Reality Factors (Stage 3D, Unscored) */}
        <RealityFactorsPanel className="my-4" />

        {/* Eligibility Card (Stage 4, Advisory) */}
        <EligibilityCard targetCompanyId={company.id} className="my-4" />

        {/* 8-Facet Quick Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-black p-3.5 rounded border border-charcoal">
            <div className="text-[10px] font-mono font-bold uppercase text-silver mb-1">
              Best-Fit Roles
            </div>
            <div className="text-xs font-bold text-white">{selectedRole.title}</div>
            <div className="text-[11px] text-silver mt-0.5">{roleFitStatus}</div>
          </div>

          <div className="bg-black p-3.5 rounded border border-charcoal">
            <div className="text-[10px] font-mono font-bold uppercase text-volt mb-1">
              Strongest Evidence
            </div>
            <div className="text-xs font-bold text-volt truncate font-mono">
              {provenComps.length > 0
                ? provenComps.map((p) => p.competency.toUpperCase()).slice(0, 3).join(', ')
                : partialComps.length > 0
                ? partialComps.map((p) => p.competency.toUpperCase()).slice(0, 3).join(', ') +
                  ' (Partial)'
                : 'Foundational'}
            </div>
            <div className="text-[11px] text-silver mt-0.5">
              {provenComps.length > 0
                ? `${provenComps.length} demonstrated areas`
                : partialComps.length > 0
                ? `${partialComps.length} partial evidence areas`
                : '0 demonstrated areas'}
            </div>
          </div>

          <div className="bg-black p-3.5 rounded border border-charcoal">
            <div className="text-[10px] font-mono font-bold uppercase text-pale-yellow mb-1">
              Partial Competencies
            </div>
            <div className="text-xs font-bold text-pale-yellow truncate font-mono">
              {partialComps.map((p) => p.competency.toUpperCase()).slice(0, 3).join(', ') ||
                'None'}
            </div>
            <div className="text-[11px] text-silver mt-0.5">
              {partialComps.length} need deeper metrics
            </div>
          </div>

          <div className="bg-black p-3.5 rounded border border-charcoal">
            <div className="text-[10px] font-mono font-bold uppercase text-danger mb-1">
              Missing Competencies
            </div>
            <div className="text-xs font-bold text-danger truncate font-mono">
              {missingComps.map((m) => m.competency.toUpperCase()).slice(0, 3).join(', ') ||
                'Zero missing'}
            </div>
            <div className="text-[11px] text-silver mt-0.5">
              {missingComps.length} critical gaps
            </div>
          </div>

          <div className="bg-black p-3.5 rounded border border-charcoal">
            <div className="text-[10px] font-mono font-bold uppercase text-silver mb-1">
              Best-Fit Company Groups
            </div>
            <div className="text-xs font-bold text-white">{company.tier} Tier</div>
            <div className="text-[11px] text-silver mt-0.5">
              {company.industry} focus
            </div>
          </div>

          <div className="bg-black p-3.5 rounded border border-charcoal">
            <div className="text-[10px] font-mono font-bold uppercase text-silver mb-1">
              Main Risk Factor
            </div>
            <div className="text-xs font-bold text-white truncate">
              {missingComps.length > 0
                ? `Missing ${missingComps[0].competency.toUpperCase()}`
                : 'Scale metrics required'}
            </div>
            <div className="text-[11px] text-silver mt-0.5">Top screening filter</div>
          </div>

          <div className="bg-black p-3.5 rounded border border-charcoal sm:col-span-2">
            <div className="text-[10px] font-mono font-bold uppercase text-silver mb-1">
              Three Next Actions
            </div>
            <div className="text-xs text-silver space-y-1">
              <div>1. {result.plans[0]?.title || 'Quantify project impact metrics'}</div>
              <div>2. {result.plans[1]?.title || 'Deploy demo project with modern stack'}</div>
            </div>
          </div>
        </div>

        {/* Competency Pill Status Badges */}
        <div className="pt-2 flex justify-center gap-2 flex-wrap">
          {result.breakdown.map((b) => {
            const isExpertOrStrong = b.analysis.status === 'expert' || b.analysis.status === 'strong';
            const isWorking = b.analysis.status === 'working';
            return (
              <span
                key={b.competency}
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                  isExpertOrStrong
                    ? 'border-volt text-volt bg-black'
                    : isWorking
                    ? 'border-pale-yellow/40 text-pale-yellow bg-black'
                    : 'border-danger/40 text-danger bg-black'
                }`}
              >
                {b.analysis.antiGamingFlag && <AlertTriangle className="w-3 h-3 text-pale-yellow" />}
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
              <Zap className="w-4 h-4 text-volt" /> Evaluate in ATS Resume Roaster
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
            <ArrowRight className="w-3.5 h-3.5 !text-black group-hover:!text-volt" />
          </Link>
        </div>

        {/* Stored Company Benchmark Provenance Box */}
        <div className="text-xs font-mono text-silver bg-black p-3 rounded border border-charcoal flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-bold text-white">Benchmark Source:</span> HireFlow Curated
            Benchmark Index 2024-2025 • <span className="font-bold text-white">Version:</span> v1.2.0
            • <span className="font-bold text-white">Confidence:</span> High
          </div>
          <div className="text-[11px] text-silver/60">Directional diagnostic benchmark. Not an automated hiring decision.</div>
        </div>
      </div>

      {/* 6-Layer analysis legend */}
      <div className="bg-[#141414] border border-charcoal rounded-lg p-4 mb-5">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold text-silver uppercase tracking-wide mr-1">
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
              className="text-xs font-mono px-2 py-0.5 rounded bg-black border border-charcoal text-volt"
            >
              {layer}
            </span>
          ))}
          <span className="text-xs font-mono text-silver ml-auto">
            Weighted calculation — anti-gaming enabled
          </span>
        </div>
      </div>

      {/* Company context */}
      <div className="bg-[#141414] border border-charcoal rounded-lg p-5 mb-5">
        <h3 className="font-bold text-white text-sm mb-3.5 flex items-center gap-2.5 font-mono uppercase tracking-wider">
          <CompanyLogo company={company} size="xs" showBorder={false} interactive={false} />
          <span>Company Hiring Context — {company.name}</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
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
              subColor: 'text-silver',
            },
            {
              label: 'Avg Package',
              value: company.avgPackage,
              sub: company.tier,
              subColor: 'text-silver',
            },
            {
              label: 'Glassdoor',
              value: `⭐ ${company.glassdoor}`,
              sub: 'Employee Rating',
              subColor: 'text-silver',
            },
          ].map(({ label, value, sub, subColor }) => (
            <div key={label} className="bg-black border border-charcoal rounded p-3 text-center">
              <div className="text-[10px] font-mono text-silver uppercase mb-0.5">{label}</div>
              <div className="text-lg font-bold font-mono text-white">{value}</div>
              <div className={`text-xs mt-0.5 font-mono ${subColor || 'text-silver'}`}>
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep skill breakdown */}
      <div className="bg-[#141414] border border-charcoal rounded-lg p-6 mb-5">
        <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
          <Target className="w-4 h-4 text-volt" /> 6-Layer Competency Intelligence Report
        </h3>
        <div className="space-y-3.5">
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
                className="p-4 rounded-lg border border-charcoal bg-black"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold uppercase ${
                      isExpertOrStrong ? 'text-volt' : isWorking ? 'text-pale-yellow' : 'text-danger'
                    }`}>
                      {b.competency}
                    </span>
                    <span className="text-[10px] font-mono bg-[#141414] border border-charcoal text-silver px-2 py-0.5 rounded">
                      Required: {b.reqLevel}
                    </span>
                    {b.analysis.antiGamingFlag && (
                      <span className="text-[10px] font-mono bg-black text-pale-yellow px-2 py-0.5 rounded font-bold border border-pale-yellow/40 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Gaming Detected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold ${
                      isExpertOrStrong ? 'text-volt' : isWorking ? 'text-pale-yellow' : 'text-danger'
                    }`}>{statusLabel}</span>
                    <span className="text-xs font-mono text-silver">
                      ({b.analysis.confidence}% confidence)
                    </span>
                  </div>
                </div>

                {/* 5-layer score bars */}
                <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                  {[
                    { label: 'L1 Keywords', val: b.analysis.layerScores.l1 },
                    { label: 'L2 Context', val: b.analysis.layerScores.l2 },
                    { label: 'L3 Depth', val: b.analysis.layerScores.l3 },
                    { label: 'L4 Impact', val: b.analysis.layerScores.l4 },
                    { label: 'L5 Auth', val: b.analysis.layerScores.l5 },
                  ].map((layer) => (
                    <div key={layer.label} className="text-center">
                      <div className="h-1 bg-[#141414] rounded-full mb-1 overflow-hidden">
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
                      <div className="text-[9px] font-mono text-silver">{layer.label}</div>
                    </div>
                  ))}
                </div>

                {/* Context sentences */}
                {b.analysis.contextSentences.length > 0 && (
                  <div className="p-2.5 bg-[#141414] rounded border border-charcoal">
                    <div className="text-[10px] font-mono font-bold text-silver uppercase tracking-wide mb-1">
                      Verified context sentences:
                    </div>
                    {b.analysis.contextSentences.slice(0, 2).map((s, i) => (
                      <p
                        key={i}
                        className="text-xs text-silver leading-relaxed italic"
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
      <div className="bg-[#141414] border border-charcoal rounded-lg p-6 mb-6">
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="w-full flex items-center justify-between cursor-pointer"
        >
          <h3 className="font-bold text-white text-sm flex items-center gap-2 font-mono uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-pale-yellow" /> TalentLens™ Career Acceleration Plan ({result.plans.length} actions)
          </h3>
          {showSuggestions ? (
            <ChevronUp className="w-4 h-4 text-silver" />
          ) : (
            <ChevronDown className="w-4 h-4 text-silver" />
          )}
        </button>
        {showSuggestions && (
          <div className="mt-4 space-y-3.5">
            {result.plans.map((plan, i) => (
              <div
                key={i}
                className="rounded-lg border border-charcoal bg-black p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded tracking-wide border ${
                        plan.priority === 'critical'
                          ? 'bg-black text-danger border-danger/40'
                          : plan.priority === 'high'
                          ? 'bg-black text-pale-yellow border-pale-yellow/40'
                          : 'bg-black text-volt border-volt'
                      }`}
                    >
                      {plan.priority}
                    </span>
                    <h4 className="font-bold text-white text-xs">{plan.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-silver whitespace-nowrap ml-2 bg-[#141414] border border-charcoal px-2 py-0.5 rounded">
                    {plan.timeframe}
                  </span>
                </div>
                <p className="text-xs text-silver leading-relaxed mb-2.5">
                  {plan.detail}
                </p>
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-silver uppercase tracking-wide mb-1">
                    Curated resources:
                  </div>
                  {plan.resources.map((r, ri) => (
                    <div key={ri} className="flex items-start gap-1.5">
                      <span className="text-volt font-mono text-xs flex-shrink-0">
                        {ri + 1}.
                      </span>
                      <p className="text-xs text-silver leading-normal">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Intelligence Report */}
      <div className="bg-[#141414] border border-charcoal rounded-lg p-6 mb-7">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-volt" /> Market Intelligence &amp; Build Verification Report
            </h3>
            <p className="text-xs text-silver">
              Deep research engine — cross-references your actual build usage against 2024-25 market
              standards.
            </p>
          </div>
          <div
            className="px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wide flex-shrink-0 ml-3 bg-black border border-charcoal text-volt"
          >
            {result.marketIntel.marketPosition}
          </div>
        </div>

        {/* 4 metric scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
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
            <div key={m.label} className="bg-black border border-charcoal rounded p-3 text-center">
              <div className="text-2xl font-bold font-mono text-white">
                {m.val}
                <span className="text-xs text-silver font-normal">%</span>
              </div>
              <div className="text-xs font-mono uppercase text-silver mt-1">{m.label}</div>
              <div className="text-[10px] text-silver/60">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className="p-3.5 bg-black rounded border border-charcoal mb-4">
          <div className="text-[10px] font-mono font-bold text-silver uppercase tracking-wide mb-1">
            Build Research Verdict
          </div>
          <p className="text-xs text-white leading-relaxed">
            {result.marketIntel.buildVerdict}
          </p>
        </div>

        {/* Per-competency findings */}
        <div className="space-y-2.5 mb-4">
          <div className="text-xs font-mono font-bold text-silver uppercase tracking-wide">
            Per-Competency Market Research
          </div>
          {result.marketIntel.findings.map((f, i) => (
            <div
              key={i}
              className="rounded border border-charcoal bg-black p-3.5"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">{f.icon}</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wide text-white">
                  {f.category}
                </span>
                <span
                  className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border border-charcoal bg-[#141414] text-silver ml-auto"
                >
                  {f.status.replace('-', ' ')}
                </span>
              </div>
              <p className="text-xs text-silver leading-relaxed mb-1.5">
                {f.finding}
              </p>
              {f.evidence.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {f.evidence.map((ev, ei) => (
                    <span
                      key={ei}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#141414] border border-charcoal text-silver"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-1.5 text-[10px] text-silver/60 italic font-mono">
                {f.marketContext}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3 Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center pt-2 pb-8">
        <button
          type="button"
          onClick={onBackToRoles}
          className="group flex items-center gap-2 px-5 py-2.5 rounded bg-volt !text-black font-bold text-xs hover:bg-[#1a1a1a] hover:!text-volt border border-volt transition-all shadow-sm cursor-pointer font-mono uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 !text-black group-hover:!text-volt" />
          <span className="!text-black group-hover:!text-volt font-black">Back to Roles</span>
        </button>
        <button
          type="button"
          onClick={onChangeCompany}
          className="flex items-center gap-2 px-5 py-2.5 rounded border border-charcoal bg-black text-white hover:text-volt hover:border-volt text-xs transition-all cursor-pointer font-mono uppercase tracking-wider"
        >
          <Building2 className="w-4 h-4 text-silver" /> Change Company
        </button>
        <button
          type="button"
          onClick={onNewResume}
          className="flex items-center gap-2 px-5 py-2.5 rounded border border-charcoal bg-black text-silver hover:text-white hover:border-silver text-xs transition-all cursor-pointer font-mono uppercase tracking-wider"
        >
          <RefreshCw className="w-4 h-4" /> New Resume
        </button>
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
