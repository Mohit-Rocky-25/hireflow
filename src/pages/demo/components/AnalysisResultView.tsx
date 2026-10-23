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
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
      : roleFitStatus === 'Developing fit'
      ? 'bg-sky-50 text-sky-800 border-sky-300'
      : roleFitStatus === 'Potential fit with evidence gaps'
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-rose-50 text-rose-800 border-rose-300';

  return (
    <div className="max-w-[960px] mx-auto animate-fade-in">
      {/* 1. Placement Readiness Quick Summary Card */}
      <div className="bg-surface border border-border rounded-2xl p-[28px] mb-[20px] shadow-sm space-y-6">
        {/* Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                Placement Readiness Assessment (Simulation)
              </span>
              <span>•</span>
              <span className="text-[12px] font-semibold text-text">
                {company.name} ({company.tier})
              </span>
            </div>
            <h2 className="text-[20px] font-extrabold text-text">
              Targeting: {selectedRole.title} ({selectedRole.level})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <HonestyExplainerModal tool="talentlens" />
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider ${roleFitStyles}`}
            >
              {roleFitStatus}
            </span>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-primary">{result.score}%</span>
              <div className="text-[10px] text-text-muted">Grounded Fit</div>
            </div>
          </div>
        </div>

        {/* Grounded Role-Fit Explanation */}
        <p className="text-[14px] text-text-secondary leading-relaxed">
          Based on evidence found in your resume text, your profile currently demonstrates a{' '}
          <strong className="text-text">{roleFitStatus.toLowerCase()}</strong> for{' '}
          <strong className="text-text">{selectedRole.title}</strong> at{' '}
          <strong className="text-text">{company.name}</strong>. {selectedRole.desc}
        </p>

        {/* How this was calculated collapsible */}
        {(() => {
          const calcDetails: CalculationDetails = {
            effectiveScore: result.score,
            scoreMin: Math.max(0, result.score - 5),
            scoreMax: Math.min(100, result.score + 5),
            band: roleFitStatus,
            activePillars: result.breakdown.map((b) => ({
              name: b.competency.toUpperCase(),
              weightPercent: Math.round(100 / (result.breakdown.length || 1)),
              earnedScore: Math.round(b.analysis.confidence),
              statusNote: b.analysis.status,
            })),
            excludedPillars: [],
            engineVersion: '2.4.0 (Integrity Release)',
            taxonomyVersion: '1.2.0',
            lastReviewedDate: 'October 2026',
          };
          return <CalculationBreakdownCollapsible details={calcDetails} />;
        })()}

        {/* Anti-gaming notice if detected */}
        {result.breakdown.some((b) => b.analysis.antiGamingFlag) && (
          <div className="p-3 bg-warning-bg border border-warning/30 rounded-xl text-[12px] text-warning flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
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
          <div className="bg-surface-2 p-3.5 rounded-xl border border-border">
            <div className="text-[10px] font-bold uppercase text-text-muted mb-1">
              Best-Fit Roles
            </div>
            <div className="text-[13px] font-bold text-text">{selectedRole.title}</div>
            <div className="text-[11px] text-text-secondary mt-0.5">{roleFitStatus}</div>
          </div>

          <div className="bg-surface-2 p-3.5 rounded-xl border border-border">
            <div className="text-[10px] font-bold uppercase text-emerald-700 mb-1">
              Strongest Evidence
            </div>
            <div className="text-[13px] font-bold text-emerald-800 truncate">
              {provenComps.length > 0
                ? provenComps.map((p) => p.competency.toUpperCase()).slice(0, 3).join(', ')
                : partialComps.length > 0
                ? partialComps.map((p) => p.competency.toUpperCase()).slice(0, 3).join(', ') +
                  ' (Partial)'
                : 'Foundational'}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              {provenComps.length > 0
                ? `${provenComps.length} demonstrated areas`
                : partialComps.length > 0
                ? `${partialComps.length} partial evidence areas`
                : '0 demonstrated areas'}
            </div>
          </div>

          <div className="bg-surface-2 p-3.5 rounded-xl border border-border">
            <div className="text-[10px] font-bold uppercase text-amber-700 mb-1">
              Partial Competencies
            </div>
            <div className="text-[13px] font-bold text-amber-800 truncate">
              {partialComps.map((p) => p.competency.toUpperCase()).slice(0, 3).join(', ') ||
                'None'}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              {partialComps.length} need deeper metrics
            </div>
          </div>

          <div className="bg-surface-2 p-3.5 rounded-xl border border-border">
            <div className="text-[10px] font-bold uppercase text-rose-700 mb-1">
              Missing Competencies
            </div>
            <div className="text-[13px] font-bold text-rose-800 truncate">
              {missingComps.map((m) => m.competency.toUpperCase()).slice(0, 3).join(', ') ||
                'Zero missing'}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              {missingComps.length} critical gaps
            </div>
          </div>

          <div className="bg-surface-2 p-3.5 rounded-xl border border-border">
            <div className="text-[10px] font-bold uppercase text-text-muted mb-1">
              Best-Fit Company Groups
            </div>
            <div className="text-[13px] font-bold text-text">{company.tier} Tier</div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              {company.industry} focus
            </div>
          </div>

          <div className="bg-surface-2 p-3.5 rounded-xl border border-border">
            <div className="text-[10px] font-bold uppercase text-text-muted mb-1">
              Main Risk Factor
            </div>
            <div className="text-[13px] font-bold text-text truncate">
              {missingComps.length > 0
                ? `Missing ${missingComps[0].competency.toUpperCase()}`
                : 'Scale metrics required'}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">Top screening filter</div>
          </div>

          <div className="bg-surface-2 p-3.5 rounded-xl border border-border sm:col-span-2">
            <div className="text-[10px] font-bold uppercase text-text-muted mb-1">
              Three Next Actions
            </div>
            <div className="text-[12px] text-text space-y-1">
              <div>1. {result.plans[0]?.title || 'Quantify project impact metrics'}</div>
              <div>2. {result.plans[1]?.title || 'Deploy demo project with modern stack'}</div>
            </div>
          </div>
        </div>

        {/* Competency Pill Status Badges */}
        <div className="pt-2 flex justify-center gap-2 flex-wrap">
          {result.breakdown.map((b) => {
            const cfg = STATUS_CONFIG[b.analysis.status] || STATUS_CONFIG.absent;
            return (
              <span
                key={b.competency}
                className={`text-[11px] font-bold px-[10px] py-[4px] rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border} flex items-center gap-[4px]`}
              >
                {b.analysis.antiGamingFlag && <AlertTriangle className="w-[9px] h-[9px]" />}
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
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-text flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" /> Evaluate in ATS Resume Roaster
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              Test job-specific fit with full 7-dimension scoring and safe bullet rewrites for this
              exact position.
            </div>
          </div>

          <Link
            to={`/tools/resume-checker?company=${company.id}&role=${encodeURIComponent(
              selectedRole.title
            )}`}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            Open ATS Roaster <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stored Company Benchmark Provenance Box */}
        <div className="text-[11px] text-text-muted bg-surface-2 p-3 rounded-xl border border-border flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-bold text-text">Benchmark Source:</span> HireFlow Curated
            Benchmark Index 2024-2025 • <span className="font-bold text-text">Version:</span> v1.2.0
            • <span className="font-bold text-text">Confidence:</span> High
          </div>
          <div>Directional diagnostic benchmark. Not an automated hiring decision.</div>
        </div>
      </div>

      {/* 6-Layer analysis legend */}
      <div className="bg-surface border border-border rounded-2xl p-[16px] mb-[20px] shadow-sm">
        <div className="flex flex-wrap gap-[8px] items-center">
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wide mr-[4px]">
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
              className="text-[10px] font-semibold px-[8px] py-[3px] rounded-full bg-primary-light border border-primary/20 text-primary"
            >
              {layer}
            </span>
          ))}
          <span className="text-[11px] text-text-muted ml-auto">
            Score is weighted — not just keyword count
          </span>
        </div>
      </div>

      {/* Company context */}
      <div className="bg-surface border border-border rounded-2xl p-[20px] mb-[20px] shadow-sm">
        <h3 className="font-bold text-text text-[15px] mb-[14px] flex items-center gap-[8px]">
          <Building2 className="w-[15px] h-[15px] text-primary" /> Company Hiring Context —{' '}
          {company.name}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
          {[
            {
              label: 'Hires 2024',
              value: company.hiring2024 != null ? company.hiring2024.toLocaleString() : '—',
              sub: `${TREND_ICON[company.trend]} from ${
                company.hiring2023 != null ? company.hiring2023.toLocaleString() : '—'
              } (2023)`,
              subColor: TREND_COLOR[company.trend],
            },
            {
              label: 'Open Roles',
              value: `${company.openRoles}+`,
              sub: company.industry,
            },
            {
              label: 'Avg Package',
              value: company.avgPackage,
              sub: company.tier,
            },
            {
              label: 'Glassdoor',
              value: `⭐ ${company.glassdoor}`,
              sub: 'Employee Rating',
            },
          ].map(({ label, value, sub, subColor }) => (
            <div key={label} className="bg-surface-2 rounded-xl p-[12px] text-center">
              <div className="text-[10px] text-text-muted mb-[2px]">{label}</div>
              <div className="text-[17px] font-bold text-text">{value}</div>
              <div className={`text-[11px] mt-[1px] ${subColor || 'text-text-secondary'}`}>
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep skill breakdown */}
      <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[20px] shadow-sm">
        <h3 className="font-bold text-text text-[15px] mb-[18px] flex items-center gap-[8px]">
          <Target className="w-[15px] h-[15px] text-primary" /> 6-Layer Competency Intelligence
          Report
        </h3>
        <div className="space-y-[14px]">
          {result.breakdown.map((b) => {
            const cfg = STATUS_CONFIG[b.analysis.status] || STATUS_CONFIG.absent;
            return (
              <div
                key={b.competency}
                className={`p-[16px] rounded-xl border ${cfg.bg} ${cfg.border}`}
              >
                <div className="flex items-center justify-between mb-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <span className={`text-[14px] font-extrabold uppercase ${cfg.color}`}>
                      {b.competency}
                    </span>
                    <span className="text-[10px] bg-surface/60 text-text-secondary px-[7px] py-[2px] rounded-full font-medium">
                      Required: {b.reqLevel}
                    </span>
                    {b.analysis.antiGamingFlag && (
                      <span className="text-[10px] bg-warning-bg text-warning px-[7px] py-[2px] rounded-full font-bold border border-warning/20">
                        ⚠ Gaming Detected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <span className={`text-[12px] font-bold ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-[11px] text-text-muted">
                      ({b.analysis.confidence}% confidence)
                    </span>
                  </div>
                </div>

                {/* 5-layer score bars */}
                <div className="grid grid-cols-5 gap-[4px] mb-[10px]">
                  {[
                    { label: 'L1 Keywords', val: b.analysis.layerScores.l1 },
                    { label: 'L2 Context', val: b.analysis.layerScores.l2 },
                    { label: 'L3 Depth', val: b.analysis.layerScores.l3 },
                    { label: 'L4 Impact', val: b.analysis.layerScores.l4 },
                    { label: 'L5 Auth', val: b.analysis.layerScores.l5 },
                  ].map((layer) => (
                    <div key={layer.label} className="text-center">
                      <div className="h-[4px] bg-surface-3 rounded-full mb-[3px]">
                        <div
                          className={`h-full rounded-full ${
                            layer.val > 60
                              ? 'bg-success'
                              : layer.val > 30
                              ? 'bg-warning'
                              : 'bg-danger'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, layer.val))}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-text-muted">{layer.label}</div>
                    </div>
                  ))}
                </div>

                {/* Context sentences */}
                {b.analysis.contextSentences.length > 0 && (
                  <div className="mb-[8px] p-[10px] bg-surface/60 rounded-lg border border-border/50">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-[4px]">
                      Verified context sentences:
                    </div>
                    {b.analysis.contextSentences.slice(0, 2).map((s, i) => (
                      <p
                        key={i}
                        className="text-[11px] text-text-secondary italic leading-[16px]"
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
      <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[28px] shadow-sm">
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="w-full flex items-center justify-between mb-[2px] cursor-pointer"
        >
          <h3 className="font-bold text-text text-[15px] flex items-center gap-[8px]">
            <Lightbulb className="w-[15px] h-[15px] text-warning" /> TalentLens™ Career Acceleration
            Plan ({result.plans.length} actions)
          </h3>
          {showSuggestions ? (
            <ChevronUp className="w-[15px] h-[15px] text-text-secondary" />
          ) : (
            <ChevronDown className="w-[15px] h-[15px] text-text-secondary" />
          )}
        </button>
        {showSuggestions && (
          <div className="mt-[16px] space-y-[14px]">
            {result.plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl border p-[16px] ${
                  plan.priority === 'critical'
                    ? 'bg-danger-bg border-danger/25'
                    : plan.priority === 'high'
                    ? 'bg-warning-bg border-warning/25'
                    : 'bg-surface-2 border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <span
                      className={`text-[10px] font-black uppercase px-[8px] py-[2px] rounded-full tracking-wide ${
                        plan.priority === 'critical'
                          ? 'bg-danger text-white'
                          : plan.priority === 'high'
                          ? 'bg-warning text-bg'
                          : 'bg-primary-light text-primary border border-primary/20'
                      }`}
                    >
                      {plan.priority}
                    </span>
                    <h4 className="font-bold text-text text-[13px]">{plan.title}</h4>
                  </div>
                  <span className="text-[10px] text-text-muted whitespace-nowrap ml-[8px] bg-surface px-[7px] py-[2px] rounded-full">
                    {plan.timeframe}
                  </span>
                </div>
                <p className="text-[12px] text-text-secondary leading-[19px] mb-[10px]">
                  {plan.detail}
                </p>
                <div className="space-y-[3px]">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-[4px]">
                    Curated resources:
                  </div>
                  {plan.resources.map((r, ri) => (
                    <div key={ri} className="flex items-start gap-[6px]">
                      <span className="text-primary font-bold text-[11px] flex-shrink-0 mt-[1px]">
                        {ri + 1}.
                      </span>
                      <p className="text-[11px] text-text-secondary leading-[16px]">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Intelligence Report */}
      <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[28px] shadow-sm">
        <div className="flex items-start justify-between mb-[18px]">
          <div>
            <h3 className="font-bold text-text text-[15px] mb-[4px] flex items-center gap-[8px]">
              <Terminal className="w-[15px] h-[15px] text-primary" /> Market Intelligence &amp;
              Build Verification Report
            </h3>
            <p className="text-[12px] text-text-secondary">
              Deep research engine — cross-references your actual build usage against 2024-25 market
              standards.
            </p>
          </div>
          <div
            className={`px-[12px] py-[6px] rounded-xl text-[11px] font-black uppercase tracking-wide flex-shrink-0 ml-[12px] ${
              result.marketIntel.marketPosition === 'Industry Leader'
                ? 'bg-success/15 text-success border border-success/25'
                : result.marketIntel.marketPosition === 'Market Current'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : result.marketIntel.marketPosition === 'Needs Modernization'
                ? 'bg-warning/10 text-warning border border-warning/20'
                : 'bg-danger/10 text-danger border border-danger/20'
            }`}
          >
            {result.marketIntel.marketPosition}
          </div>
        </div>

        {/* 4 metric scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] mb-[18px]">
          {[
            {
              label: 'Overall Market Fit',
              val: result.marketIntel.overallMarketFit,
              sub: 'vs 2024-25 benchmark',
              color:
                result.marketIntel.overallMarketFit >= 70
                  ? 'text-success'
                  : result.marketIntel.overallMarketFit >= 45
                  ? 'text-warning'
                  : 'text-danger',
            },
            {
              label: 'Tech Currency',
              val: result.marketIntel.techCurrencyScore,
              sub: 'Modern vs outdated stack',
              color:
                result.marketIntel.techCurrencyScore >= 70
                  ? 'text-success'
                  : result.marketIntel.techCurrencyScore >= 45
                  ? 'text-warning'
                  : 'text-danger',
            },
            {
              label: 'Build Authenticity',
              val: result.marketIntel.buildAuthenticity,
              sub: 'Deployment, tests, monitoring',
              color:
                result.marketIntel.buildAuthenticity >= 60
                  ? 'text-success'
                  : result.marketIntel.buildAuthenticity >= 40
                  ? 'text-warning'
                  : 'text-danger',
            },
            {
              label: 'Fundamental Depth',
              val: result.marketIntel.fundamentalDepth,
              sub: 'Production patterns used',
              color:
                result.marketIntel.fundamentalDepth >= 60
                  ? 'text-success'
                  : result.marketIntel.fundamentalDepth >= 35
                  ? 'text-warning'
                  : 'text-danger',
            },
          ].map((m) => (
            <div key={m.label} className="bg-surface-2 rounded-xl p-[12px] text-center">
              <div className={`text-[28px] font-extrabold ${m.color}`}>
                {m.val}
                <span className="text-[14px] opacity-50">%</span>
              </div>
              <div className="text-[11px] font-bold text-text mt-[2px]">{m.label}</div>
              <div className="text-[10px] text-text-muted">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className="p-[14px] bg-surface-2 rounded-xl border border-border mb-[18px]">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-[4px]">
            Build Research Verdict
          </div>
          <p className="text-[13px] text-text leading-[20px]">
            {result.marketIntel.buildVerdict}
          </p>
        </div>

        {/* Per-competency findings */}
        <div className="space-y-[10px] mb-[16px]">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
            Per-Competency Market Research
          </div>
          {result.marketIntel.findings.map((f, i) => (
            <div
              key={i}
              className={`rounded-xl border p-[13px] ${
                f.status === 'cutting-edge'
                  ? 'bg-success/5 border-success/20'
                  : f.status === 'current'
                  ? 'bg-primary/5 border-primary/15'
                  : f.status === 'dated'
                  ? 'bg-warning/5 border-warning/20'
                  : 'bg-danger/5 border-danger/20'
              }`}
            >
              <div className="flex items-center gap-[8px] mb-[6px]">
                <span className="text-[14px]">{f.icon}</span>
                <span className="text-[12px] font-black uppercase tracking-wide text-text">
                  {f.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-[7px] py-[2px] rounded-full ml-auto ${
                    f.status === 'cutting-edge'
                      ? 'bg-success/15 text-success'
                      : f.status === 'current'
                      ? 'bg-primary/10 text-primary'
                      : f.status === 'dated'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-danger/10 text-danger'
                  }`}
                >
                  {f.status.replace('-', ' ')}
                </span>
              </div>
              <p className="text-[12px] text-text-secondary leading-[18px] mb-[6px]">
                {f.finding}
              </p>
              {f.evidence.length > 0 && (
                <div className="flex flex-wrap gap-[4px]">
                  {f.evidence.map((ev, ei) => (
                    <span
                      key={ei}
                      className="text-[10px] font-medium px-[7px] py-[2px] rounded-full bg-surface border border-border text-text-muted"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-[6px] text-[10px] text-text-muted italic">
                {f.marketContext}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3 Action Buttons */}
      <div className="flex flex-wrap gap-[12px] justify-center pt-[10px] pb-[32px]">
        <button
          type="button"
          onClick={onBackToRoles}
          className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-xl bg-primary text-white font-semibold text-[13px] hover:bg-primary-hover transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Roles
        </button>
        <button
          type="button"
          onClick={onChangeCompany}
          className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-xl border border-border text-text hover:bg-surface-2 font-medium text-[13px] transition-all cursor-pointer"
        >
          <Building2 className="w-4 h-4 text-text-secondary" /> Change Company
        </button>
        <button
          type="button"
          onClick={onNewResume}
          className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-xl border border-border text-text-secondary hover:text-text hover:bg-surface-2 font-medium text-[13px] transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> New Resume
        </button>
      </div>
    </div>
  );
}
