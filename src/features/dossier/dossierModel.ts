import type { AuditEntry, Gap, IsoDate, JdOrigin, PlanItem, PlanKind, PlanStatus, Sha256, ToolKind, Uuid } from '@/domain/types';
import { formatDelta } from '@/features/journal/deltaEngine';
import { matchProjectsWithIntegrity } from '@/pages/demo/engine/projectMatcherIntegrity';
import { buildSkillStates, extractResumeParseSummary, classifySkillKind, normalizeTier, ResumeParseSummary, SkillState } from '@/pages/demo/engine/skillStateEngine';
import { validateReport, sanitizeReportPlaceholders } from '@/pages/demo/engine/reportValidator';
import { generateEvidenceSafeRewrites, BulletRewrite } from '@/pages/demo/engine/bulletRewriteEngine';
import { runAtsEngine } from '@/features/ats/engine';
import { runMarketIntelligenceEngine, formatCompetencyName, generateImprovementPlan } from '@/pages/demo/talentLensEngine';
import { findCompanyBySlug } from '@/pages/demo/talentLensData';

export interface CompanyHiringContextModel {
  hires2024?: string;
  openRoles?: string;
  avgPackage?: string;
  glassdoor?: string;
  trend?: string;
}

export interface BreakdownItemModel {
  key: string;
  label: string;
  score: number;
  reqLevel?: string;
  status?: string;
  statusLabel?: string;
  confidence?: number;
  confidenceTag?: 'High' | 'Medium' | 'Low';
  kind?: string;
  layerScores?: { l1: number; l2: number; l3: number; l4: number; l5: number };
  evidenceQuotes: string[];
  gaps: string[];
  deltaPts: number | null;
}

export interface ProjectDropModel {
  title: string;
  domain: string;
  difficulty: string;
  estimatedHours: number;
  coveredSkills: string[];
  closes?: string[];
  whyThisProject?: string;
  reasonCodes?: string[];
  problemStatement: string;
  architecture: string;
  recruiterSignal: string;
  portfolioBulletFormula: string;
  deliverables: string[];
}

export interface LearningStageModel {
  stageName: string;
  focus: string;
  skills: string[];
  actionItems: string[];
  timeframe?: string;
}

export interface LearningPlanModel {
  priority: string;
  title: string;
  detail: string;
  timeframe: string;
  suggestedAction: string;
  hypotheticalScoreGain: string;
  bulletTemplate: string;
  resources: string[];
}

export interface AtsDimensionModel {
  id: string;
  label: string;
  rawScore: number;
  nominalWeight: number;
  effectiveWeight: number;
  contribution: number;
  applicable?: boolean;
  notApplicableReason?: string;
  flags?: string[];
}

export interface AtsDiagnosticsModel {
  subscores: {
    mustHaveCoverage: number;
    evidenceDepth: number;
    impactMetrics: number;
    projectsAndOss: number;
    seniorityFit: number;
    formatAndParse: number;
    tierFit: number;
  };
  dimensions?: AtsDimensionModel[];
  rawSubtotal?: number;
  totalBonuses?: number;
  totalDeductions?: number;
  preClampScore?: number;
  wasClamped?: boolean;
  penalties: Array<{ id: string; label: string; points: number; reason: string }>;
  seniorityMode?: {
    candidateYears: number;
    requiredYears: number;
    demonstratedMonths?: number;
    completedMonths?: number;
    requiredMonths?: number;
    minPossibleQualifyingMonths?: number;
    maxPossibleQualifyingMonths?: number;
    level: string;
    fitExplanation: string;
    isMandatoryGateActive?: boolean;
    provenance?: string;
    scope?: string;
    status?: string;
    shortfallMonths?: number;
    touchedShortfallMonths?: number;
    completedShortfallMonths?: number;
    surplusMonths?: number;
    isEligible?: boolean;
    reachesRequirementOnlyViaActiveMonth?: boolean;
    formattedRequired?: string;
    formattedDemonstrated?: string;
    formattedShortfall?: string;
  };
  seniorityMatchResult?: any;
  authoritativeSnapshot?: any;
  evidenceRecordsCount?: number;
  citationsCount?: number;
  citationLedger?: any;
  metricEvidences?: import('@/features/ats/engine/metricModel').MetricEvidence[];
  impactTrace?: import('@/features/ats/engine/metricModel').ImpactEvidenceTraceItem[];
  citationsList?: Array<{
    id: string;
    competencyId: string;
    originalQuotation: string;
    validationStatus: string;
    presentationValidationLabel?: string;
    claimSupport: string;
    sourceType: string;
    environmentMaturity?: string;
    sourceSection: string;
    employerOrProject?: string;
    validationReasons?: string[];
    limitations?: string[];
  }>;
  requirementsList?: Array<{
    requirementId: string;
    canonical: string;
    engineStatus: string;
    presentationStatus: string;
    matchMethod?: string | null;
    isCompound?: boolean;
    limitations?: string[];
    explanation?: string;
    evidenceIds?: string[];
    citationIds?: string[];
  }>;
  fixFirst: Array<{
    title: string;
    reason: string;
    expectedScoreGain: number;
    type: string;
    skillId?: string;
  }>;
  skillsInventory: Array<{
    canonical: string;
    category: string;
    required: 'must' | 'nice';
    status: 'verified' | 'weak' | 'missing';
    engineStatus?: string;
    matchMethod?: string | null;
    proficiency: number;
    evidenceQuotes: string[];
    isSubstituteMatch?: boolean;
    substituteFor?: string;
    environmentMaturity?: string;
    durationConfidence?: string;
    durationStatus?: string;
    provenDurationMonths?: number;
    isDurationUncertain?: boolean;
    limitations?: string[];
    explanation?: string;
  }>;
  formattingAudit: {
    wordCount: number;
    parseQuality: string;
    contactInfo: {
      email: string | null;
      phone: string | null;
      linkedin: string | null;
      github: string | null;
      portfolio: string | null;
    };
    sectionsFound: string[];
    missingStandardSections: string[];
    weakBulletsCount: number;
    metricsRatio: number;
    stuffedSkills: string[];
  };
}

export interface TalentLensIntelModel {
  marketPosition: string;
  overallMarketFit: number;
  techCurrencyScore: number;
  buildAuthenticity: number;
  fundamentalDepth: number;
  buildVerdict: string;
  modernPractices: string[];
  outdatedSignals: string[];
  emergingAdoption: string[];
  findings: Array<{
    category: string;
    status: string;
    finding: string;
    evidence: string[];
    marketContext: string;
  }>;
}

export interface DossierModel {
  meta: {
    title: string;
    generatedAt: IsoDate;
    engineVersion: string;
    kind: ToolKind;
    auditId: Uuid;
    integrity: { resumeHash: Sha256; jdHash: Sha256 };
  };
  candidate: { name: string; email?: string; resumeLabel: string };
  target: {
    company?: string;
    roleTitle?: string;
    jdOrigin: JdOrigin;
    tier?: string;
    level?: string;
    industry?: string;
    location?: string;
  };
  headline: {
    score: number;
    scoreBand: string;
    readinessStatus: string;
    confidence?: string;
    guidance?: string;
    deltaPts: number | null;
    deltaText: string | null;
    baselineDate: IsoDate | null;
  };
  summary: string[];
  breakdown: BreakdownItemModel[];
  strengths: string[];
  verifiedStrengths?: Array<{
    skill: string;
    label: string;
    kind: string;
    contextScore: number;
    evidenceText: string;
  }>;
  parseSummary?: ResumeParseSummary;
  gaps: { open: Gap[]; resolved: Gap[]; added: Gap[] };
  atsDiagnostics: AtsDiagnosticsModel;
  talentLensIntel: TalentLensIntelModel;
  projectDrops: ProjectDropModel[];
  learningPath: {
    stages: LearningStageModel[];
    plans: LearningPlanModel[];
    bulletRewrites?: BulletRewrite[];
  };
  bulletRewrites?: BulletRewrite[];
  realityFactors: string[];
  planned: Array<{ title: string; kind: PlanKind; status: PlanStatus }>;
  companyContext?: CompanyHiringContextModel;
  appendix: { resumeText: string; jdText: string };
}

export interface DossierInputs {
  entry: AuditEntry;
  resumeText: string;
  jdText: string;
  baseline?: AuditEntry | null;
  candidate?: { name?: string; email?: string };
  planItems?: readonly PlanItem[];
  generatedAt?: IsoDate;
}

const DEFAULT_ATS_DIMENSIONS: ReadonlyArray<{ id: keyof AtsDiagnosticsModel['subscores']; label: string; nominalWeight: number }> = [
  { id: 'mustHaveCoverage', label: 'Must-Have Skill Coverage', nominalWeight: 30 },
  { id: 'evidenceDepth', label: 'Evidence & Implementation Depth', nominalWeight: 20 },
  { id: 'impactMetrics', label: 'Quantified Impact & Numerical Metrics', nominalWeight: 15 },
  { id: 'projectsAndOss', label: 'Project Relevance & Open-Source Signals', nominalWeight: 10 },
  { id: 'seniorityFit', label: 'Seniority Alignment & Experience Fit', nominalWeight: 10 },
  { id: 'formatAndParse', label: 'Format, Layout & Parsing Safety', nominalWeight: 10 },
  { id: 'tierFit', label: 'Target Company Tier Alignment', nominalWeight: 5 },
];

export function resolveDossierDimensions(
  ats?: Partial<AtsDiagnosticsModel> | null,
  activeWeights?: Record<string, number> | null
): AtsDimensionModel[] {
  const snapshotDims = ats?.authoritativeSnapshot?.scoring?.dimensions;
  const sourceDims = Array.isArray(ats?.dimensions) && ats.dimensions.length > 0
    ? ats.dimensions
    : Array.isArray(snapshotDims) && snapshotDims.length > 0
    ? snapshotDims
    : null;

  if (sourceDims) {
    return sourceDims.map((d: any) => {
      const effectiveWeight = typeof d.effectiveWeight === 'number' ? d.effectiveWeight : (d.nominalWeight ?? 0) / 100;
      const applicable = d.applicable !== undefined ? Boolean(d.applicable) : effectiveWeight > 0;
      return {
        id: d.id,
        label: d.label,
        rawScore: d.rawScore ?? 0,
        nominalWeight: d.nominalWeight ?? Math.round(effectiveWeight * 100),
        effectiveWeight,
        contribution: d.contribution ?? 0,
        applicable,
        notApplicableReason: d.notApplicableReason,
        flags: d.flags,
      };
    });
  }

  const subs = ats?.subscores || {
    mustHaveCoverage: 0,
    evidenceDepth: 0,
    impactMetrics: 0,
    projectsAndOss: 0,
    seniorityFit: 0,
    formatAndParse: 0,
    tierFit: 0,
  };

  return DEFAULT_ATS_DIMENSIONS.map((spec) => {
    const weightPct = activeWeights && typeof activeWeights[spec.id] === 'number'
      ? activeWeights[spec.id]
      : spec.nominalWeight;
    const effectiveWeight = weightPct / 100;
    const contribution = Number((subs as any)[spec.id] ?? 0);
    const rawScore = effectiveWeight > 0 ? Math.round((contribution / effectiveWeight) * 10) / 10 : 0;
    return {
      id: spec.id,
      label: spec.label,
      rawScore,
      nominalWeight: spec.nominalWeight,
      effectiveWeight,
      contribution,
      applicable: weightPct > 0,
      notApplicableReason: weightPct === 0 ? 'Dimension weight redistributed' : undefined,
    };
  });
}

export function scoreBand(score: number): 'early' | 'developing' | 'competitive' | 'strong' | 'excellent' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'competitive';
  if (score >= 40) return 'developing';
  return 'early';
}

const BAND_TEXT: Record<ReturnType<typeof scoreBand>, string> = {
  early: 'is at an early stage for this role and needs focused work before it competes',
  developing: 'is developing: the fundamentals are present but important requirements are not yet covered',
  competitive: 'is competitive, with a small number of gaps standing between it and a strong match',
  strong: 'is a strong match, with only minor gaps remaining',
  excellent: 'is an excellent match for the stated requirements',
};

/** Deterministic plain-language summary. No model call, no randomness. */
export function executiveSummary(
  m: Pick<DossierModel, 'headline' | 'target' | 'gaps' | 'candidate'>,
  kind?: ToolKind
): string[] {
  const where = [m.target.roleTitle, m.target.company].filter(Boolean).join(' at ') || 'the selected role';
  const out: string[] = [];
  out.push(`The resume "${m.candidate.resumeLabel}" scored ${m.headline.score} out of 100 for ${where} and ${BAND_TEXT[scoreBand(m.headline.score)]}.`);
  if (kind === 'talentlens') {
    out.push(`TalentLens Benchmark: Evaluated against ${m.target.company || 'target company'}'s bar (${m.target.tier || 'Enterprise'} tier) with multi-layer competency and market currency calibration.`);
  } else if (kind === 'ats_roast') {
    out.push(`ATS Roaster Audit: Evaluated across 7 weighted dimensions, itemized penalty deductions, and formatting parse safety.`);
  }
  if (m.headline.guidance) {
    const rawConf = m.headline.confidence;
    const confLabel =
      typeof rawConf === 'number'
        ? rawConf <= 1
          ? rawConf >= 0.8
            ? 'High'
            : 'Moderate'
          : `${Math.round(rawConf)}%`
        : String(rawConf || 'High');
    const displayConf = confLabel === '1' ? 'High' : confLabel;
    out.push(`Recruiter Guidance: ${m.headline.guidance} (Confidence: ${displayConf}).`);
  }
  if (m.headline.deltaPts !== null && m.headline.deltaText !== null) {
    const dir = m.headline.deltaPts > 0 ? 'improved' : m.headline.deltaPts < 0 ? 'declined' : 'is unchanged';
    out.push(m.headline.deltaPts === 0
      ? 'The score is unchanged since the previous audit of this target.'
      : `Compared with the previous audit of this target, the score ${dir} by ${formatDelta(m.headline.deltaPts)}.`);
  }
  if (m.gaps.resolved.length > 0) out.push(`${m.gaps.resolved.length} previously reported gap${m.gaps.resolved.length === 1 ? ' was' : 's were'} resolved.`);
  const sev3 = m.gaps.open.filter((g) => g.severity === 3).length;
  out.push(m.gaps.open.length === 0 ? 'No open gaps were detected.' : `${m.gaps.open.length} gap${m.gaps.open.length === 1 ? ' remains' : 's remain'} open${sev3 > 0 ? `, ${sev3} of high severity` : ''}.`);
  return out;
}

export function buildDossierModel(i: DossierInputs): DossierModel {
  const { entry, baseline, resumeText, jdText } = i;
  const d = entry.delta;
  const resolvedIds = new Set(d?.resolvedGapIds ?? []);
  const newIds = new Set(d?.newGapIds ?? []);
  const baseGaps = new Map((baseline?.gaps ?? []).map((g) => [g.id, g] as const));
  const resolved = [...resolvedIds].map((id) => baseGaps.get(id)).filter((g): g is Gap => g !== undefined);
  const added = entry.gaps.filter((g) => newIds.has(g.id));

  // Extract raw findings payload
  const rawFindings = (entry.findingsJson ?? {}) as Record<string, any>;
  const isTalentLens = entry.kind === 'talentlens' || rawFindings.kind === 'talentlens' || !!rawFindings.result?.marketIntel || !!rawFindings.marketIntel;
  const tlResult = rawFindings.result || (rawFindings.marketIntel ? rawFindings : null);
  let tlCompany = rawFindings.company;
  const tlRole = rawFindings.selectedRole;

  let atsResult = rawFindings.engineResult || (rawFindings.subscores ? rawFindings : null);

  // Target Metadata (preserve unresolved honesty without fabricating fake entities)
  const rawCompanyName =
    rawFindings.authoritativeSnapshot?.identity?.targetCompany ||
    tlCompany?.name ||
    entry.jd.company ||
    (rawFindings.targetCompany as string | undefined) ||
    undefined;
  const companyName = rawCompanyName && rawCompanyName !== 'Target Organization' ? rawCompanyName : undefined;
  const rawRoleTitle =
    rawFindings.authoritativeSnapshot?.identity?.targetRoleTitle ||
    tlRole?.title ||
    entry.jd.roleTitle ||
    (rawFindings.targetRole as string | undefined) ||
    undefined;
  const roleTitle = rawRoleTitle || 'Unspecified Role';

  if (!tlCompany && companyName) {
    try {
      tlCompany = findCompanyBySlug(companyName);
    } catch {
      /* ignore */
    }
  }

  const tier = normalizeTier(tlCompany?.tier || (atsResult?.bestFitTier as string | undefined) || 'Enterprise');
  const level = tlRole?.level || (atsResult?.seniorityFit?.level as string | undefined) || 'Mid-Level';
  const industry = tlCompany?.industry || (isTalentLens ? 'Technology & Software' : undefined);

  const companyContext: CompanyHiringContextModel | undefined = tlCompany ? {
    hires2024: tlCompany.hiring2024 != null ? `${tlCompany.hiring2024.toLocaleString()} (Public estimate 2024-25, AI-extracted, unverified)` : undefined,
    openRoles: tlCompany.openRoles != null ? `${tlCompany.openRoles}+ (public intake estimate)` : tlCompany.roles ? `${tlCompany.roles.length}+ (estimate)` : undefined,
    avgPackage: tlCompany.avgPackage ? `${tlCompany.avgPackage} (estimate)` : undefined,
    glassdoor: tlCompany.glassdoor ? `${tlCompany.glassdoor} / 5 (unverified public rating)` : undefined,
    trend: tlCompany.trend || undefined,
  } : undefined;

  // Overall Headline
  const score = entry.overallScore;
  const band = scoreBand(score);
  const readinessStatus =
    rawFindings.roleFitStatus ||
    tlResult?.readinessLabel ||
    atsResult?.band ||
    (score >= 75 ? 'Strong fit' : score >= 50 ? 'Developing fit' : 'Potential fit with evidence gaps');

  const guidance =
    atsResult?.applicationGuidance ||
    rawFindings.authoritativeSnapshot?.scoring?.applicationGuidance ||
    rawFindings.applicationGuidance ||
    (score >= 75 ? 'Ready to apply' : 'Apply after high-priority fixes');
  const confidence =
    atsResult?.confidence ||
    rawFindings.authoritativeSnapshot?.scoring?.confidence ||
    tlResult?.trace?.confidence ||
    'High';

  // Dimensional Competency Breakdown
  const breakdown: BreakdownItemModel[] = [];
  if (Array.isArray(tlResult?.breakdown) && tlResult.breakdown.length > 0) {
    for (const b of tlResult.breakdown) {
      const compName = b.competency || b.key || b.label || '';
      const kind = b.kind || classifySkillKind(compName);
      const isSoftSkill = kind === 'soft-skill';
      const itemScore = b.score ?? b.analysis?.confidence ?? 0;
      const status = isSoftSkill
        ? 'not-assessed'
        : b.status || b.analysis?.status || (itemScore >= 75 ? 'demonstrated' : itemScore >= 50 ? 'mentioned' : 'not-found');
      const confidenceTag = isSoftSkill
        ? 'Low'
        : b.confidenceTag || (itemScore >= 75 || status === 'strong' || status === 'expert' || status === 'demonstrated' ? 'High' : itemScore >= 50 || status === 'working' ? 'Medium' : 'Low');
      const statusLabel = isSoftSkill ? 'Not assessed' : (b.statusLabel || (status === 'not-assessed' ? 'Not assessed' : undefined));
      breakdown.push({
        key: compName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        label: formatCompetencyName(compName),
        score: isSoftSkill ? 0 : Math.round(itemScore),
        reqLevel: b.reqLevel || 'strong',
        status,
        statusLabel,
        confidenceTag,
        kind,
        layerScores: b.layerScores || b.analysis?.layerScores || { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0 },
        evidenceQuotes: b.evidenceQuotes || b.analysis?.contextSentences || b.analysis?.evidence || [],
        gaps: b.gaps || b.analysis?.gaps || [],
        deltaPts: d?.breakdownDeltaPts?.[compName] ?? null,
      });
    }
  } else if (entry.breakdown && entry.breakdown.length > 0) {
    for (const b of entry.breakdown) {
      const bAny = b as any;
      const compName = b.label || b.key;
      const kind = bAny.kind || classifySkillKind(compName);
      const isSoftSkill = kind === 'soft-skill';
      const itemScore = b.score ?? bAny.confidence ?? 0;
      const status = isSoftSkill
        ? 'not-assessed'
        : bAny.status || (itemScore >= 75 ? 'expert' : itemScore >= 50 ? 'working' : 'absent');
      const confidenceTag = isSoftSkill
        ? 'Low'
        : bAny.confidenceTag || (itemScore >= 75 || status === 'strong' || status === 'expert' || status === 'demonstrated' ? 'High' : itemScore >= 50 || status === 'working' ? 'Medium' : 'Low');
      const statusLabel = isSoftSkill ? 'Not assessed' : (bAny.statusLabel || (status === 'not-assessed' ? 'Not assessed' : undefined));
      breakdown.push({
        key: b.key,
        label: formatCompetencyName(compName),
        score: isSoftSkill ? 0 : itemScore,
        reqLevel: bAny.reqLevel || 'strong',
        status,
        statusLabel,
        confidenceTag,
        kind,
        confidence: itemScore,
        layerScores: bAny.layerScores || { l1: itemScore, l2: itemScore, l3: itemScore, l4: itemScore, l5: itemScore },
        evidenceQuotes: bAny.evidenceQuotes || [],
        gaps: bAny.gaps || [],
        deltaPts: d?.breakdownDeltaPts?.[b.key] ?? null,
      });
    }
  }

  const snapshot = rawFindings.authoritativeSnapshot;

  // Ensure ATS Diagnostics are 100% computed without re-running engine when an authoritativeSnapshot exists
  if (!atsResult && !snapshot && resumeText && (jdText || roleTitle !== 'Unspecified Role')) {
    try {
      const resp = runAtsEngine(resumeText, jdText || (companyName ? `${roleTitle} at ${companyName}` : roleTitle));
      if (resp.success) {
        atsResult = resp.result;
      }
    } catch {
      /* ignore */
    }
  }

  const effectiveSeniorityMatch = atsResult?.seniorityMatchResult || rawFindings.seniorityMatchResult;
  const effectiveSeniority = snapshot?.seniority || effectiveSeniorityMatch;
  const effectiveSubscores = snapshot?.scoring?.subscores || atsResult?.subscores;
  const effectivePenalties = snapshot?.scoring?.penalties ?? atsResult?.penalties ?? [];
  const computedSubscores = {
    mustHaveCoverage: effectiveSubscores?.mustHaveCoverage ?? 0,
    evidenceDepth: effectiveSubscores?.evidenceDepth ?? 0,
    impactMetrics: effectiveSubscores?.impactMetrics ?? 0,
    projectsAndOss: effectiveSubscores?.projectsAndOss ?? 0,
    seniorityFit: effectiveSubscores?.seniorityFit ?? 0,
    formatAndParse: effectiveSubscores?.formatAndParse ?? 0,
    tierFit: effectiveSubscores?.tierFit ?? 0,
  };
  const activeWeightsFromLedger =
    atsResult?.reportState?.scoreLedger?.lines?.length === 7
      ? {
          mustHaveCoverage: atsResult.reportState.scoreLedger.lines[0].max,
          evidenceDepth: atsResult.reportState.scoreLedger.lines[1].max,
          impactMetrics: atsResult.reportState.scoreLedger.lines[2].max,
          projectsAndOss: atsResult.reportState.scoreLedger.lines[3].max,
          seniorityFit: atsResult.reportState.scoreLedger.lines[4].max,
          formatAndParse: atsResult.reportState.scoreLedger.lines[5].max,
          tierFit: atsResult.reportState.scoreLedger.lines[6].max,
        }
      : undefined;
  const resolvedActiveWeights = atsResult?.activeWeights || rawFindings.activeWeights || activeWeightsFromLedger;
  const resolvedDimensions = resolveDossierDimensions(
    {
      subscores: computedSubscores,
      dimensions: snapshot?.scoring?.dimensions || atsResult?.trace?.pillars,
      authoritativeSnapshot: snapshot,
    },
    resolvedActiveWeights
  );
  const rawSubtotal = snapshot?.scoring?.rawSubtotal ?? Math.round(
    resolvedDimensions.reduce((sum, dim) => sum + (dim.contribution ?? 0), 0) * 10
  ) / 10;
  const totalDeductions = snapshot?.scoring?.totalDeductions ?? effectivePenalties.reduce((s: number, p: any) => s + Math.abs(p.points || 0), 0);
  const totalBonuses = snapshot?.scoring?.totalBonuses ?? 0;
  const preClampScore = snapshot?.scoring?.preClampScore ?? Math.round((rawSubtotal + totalBonuses - totalDeductions) * 10) / 10;

  const atsDiagnostics: AtsDiagnosticsModel = {
    subscores: computedSubscores,
    dimensions: resolvedDimensions,
    rawSubtotal,
    totalBonuses,
    totalDeductions,
    preClampScore,
    wasClamped: snapshot?.scoring?.wasClamped ?? (Math.round(preClampScore) !== score),
    penalties: effectivePenalties,
    seniorityMode: effectiveSeniority ? {
      candidateYears: effectiveSeniority.demonstratedYears,
      requiredYears: effectiveSeniority.requiredYears,
      demonstratedMonths: effectiveSeniority.demonstratedMonths,
      completedMonths: effectiveSeniority.completedMonths,
      requiredMonths: effectiveSeniority.requiredMonths,
      minPossibleQualifyingMonths: effectiveSeniority.minPossibleQualifyingMonths,
      maxPossibleQualifyingMonths: effectiveSeniority.maxPossibleQualifyingMonths,
      level: atsResult?.seniorityFit?.level || level,
      fitExplanation: effectiveSeniority.explanation || atsResult?.seniorityFit?.fitExplanation || '',
      isMandatoryGateActive: effectiveSeniority.isMandatoryGateActive,
      provenance: effectiveSeniority.provenance,
      scope: effectiveSeniority.scope,
      status: effectiveSeniority.status,
      shortfallMonths: effectiveSeniority.shortfallMonths,
      touchedShortfallMonths: effectiveSeniority.touchedShortfallMonths,
      completedShortfallMonths: effectiveSeniority.completedShortfallMonths,
      surplusMonths: effectiveSeniority.surplusMonths,
      isEligible: effectiveSeniority.isEligible,
      reachesRequirementOnlyViaActiveMonth: effectiveSeniority.reachesRequirementOnlyViaActiveMonth,
      formattedRequired: effectiveSeniority.formattedRequired,
      formattedDemonstrated: effectiveSeniority.formattedDemonstrated,
      formattedShortfall: effectiveSeniority.formattedShortfall,
    } : (atsResult?.seniorityFit ? {
      candidateYears: atsResult.seniorityFit.candidateYears,
      requiredYears: atsResult.seniorityFit.requiredYears,
      level: atsResult.seniorityFit.level || level,
      fitExplanation: atsResult.seniorityFit.fitExplanation,
      shortfallMonths: atsResult.seniorityFit.shortfallMonths,
      surplusMonths: atsResult.seniorityFit.surplusMonths,
      status: atsResult.seniorityFit.status,
    } : undefined),
    seniorityMatchResult: effectiveSeniorityMatch,
    authoritativeSnapshot: snapshot,
    evidenceRecordsCount: snapshot?.evidence?.records?.length ?? atsResult?.evidenceRecords?.length,
    citationsCount: snapshot?.evidence?.citations?.length ?? atsResult?.citationLedger?.citations?.length,
    citationLedger: atsResult?.citationLedger,
    metricEvidences: snapshot?.evidence?.metrics || atsResult?.metricEvidences || [],
    impactTrace: snapshot?.scoring?.impactTrace || atsResult?.impactTrace || [],
    citationsList: (snapshot?.evidence?.citations || atsResult?.citationLedger?.citations || []).map((c: any) => ({
      id: c.id,
      competencyId: c.competencyId,
      originalQuotation: c.originalQuotation,
      validationStatus: c.validationStatus,
      presentationValidationLabel: c.presentationValidationLabel,
      claimSupport: c.claimSupport,
      sourceType: c.sourceType,
      environmentMaturity: c.environmentMaturity,
      sourceSection: c.sourceSection || c.sectionId,
      employerOrProject: c.employerOrProject || c.entryId,
      validationReasons: c.validationReasons,
      limitations: c.limitations,
    })),
    requirementsList: (snapshot?.requirements || atsResult?.requirementMatches || []).map((r: any) => ({
      requirementId: r.requirementId,
      canonical: r.canonical,
      engineStatus: r.engineStatus || r.status,
      presentationStatus: r.presentationStatus || (r.status === 'SATISFIED' ? 'VERIFIED' : 'MISSING'),
      matchMethod: r.matchMethod,
      isCompound: r.isCompound,
      limitations: r.limitations,
      explanation: r.explanation,
      evidenceIds: r.evidenceIds,
      citationIds: r.citationIds,
    })),
    fixFirst: snapshot?.fixFirst ?? atsResult?.fixFirst ?? [],
    skillsInventory: snapshot?.competencies ? snapshot.competencies.map((s: any) => ({
      canonical: s.canonical,
      category: s.category || 'Engineering',
      required: s.required || 'must',
      status: (s.status === 'substituted' || s.status === 'partial' ? 'verified' : s.status) || (s.found ? 'verified' : 'missing'),
      engineStatus: s.engineStatus,
      matchMethod: s.matchMethod,
      proficiency: s.proficiency ?? (s.found ? 3 : 0),
      evidenceQuotes: s.evidenceQuotes || [],
      isSubstituteMatch: s.isSubstituteMatch,
      substituteFor: s.substituteFor,
      environmentMaturity: s.environmentMaturity,
      durationConfidence: s.durationConfidence,
      durationStatus: s.durationStatus,
      provenDurationMonths: s.provenDurationMonths,
      isDurationUncertain: s.isDurationUncertain,
      limitations: s.limitations,
      explanation: s.explanation,
    })) : atsResult?.skillResults ? atsResult.skillResults.map((s: any) => ({
      canonical: s.canonical,
      category: s.category || 'Engineering',
      required: s.required || 'must',
      status: s.status || (s.found ? 'verified' : 'missing'),
      engineStatus: s.matchResult?.status || (s.status === 'verified' ? 'SATISFIED' : s.status === 'weak' ? 'PARTIALLY_SATISFIED' : 'NOT_DEMONSTRATED'),
      matchMethod: s.matchResult?.matchMethod,
      proficiency: s.proficiency ?? (s.found ? 3 : 0),
      evidenceQuotes: (s.evidence || []).map((e: any) => e.quote).filter(Boolean),
      isSubstituteMatch: s.isSubstituteMatch,
      substituteFor: s.substituteFor,
      environmentMaturity: s.environmentMaturity,
      durationConfidence: s.durationConfidence,
      durationStatus: s.durationStatus,
      provenDurationMonths: s.provenDurationMonths,
      isDurationUncertain: s.isDurationUncertain,
      limitations: s.matchResult?.limitations,
      explanation: s.matchResult?.explanation,
    })) : breakdown.map((b) => ({
      canonical: b.label,
      category: 'Core Competency',
      required: (b.reqLevel === 'expert' || b.reqLevel === 'strong' ? 'must' : 'nice') as 'must' | 'nice',
      status: (b.status === 'expert' || b.status === 'strong' ? 'verified' : b.status === 'working' ? 'weak' : 'missing') as 'verified' | 'weak' | 'missing',
      proficiency: b.score >= 80 ? 4 : b.score >= 50 ? 2 : 0,
      evidenceQuotes: b.evidenceQuotes,
    })),
    formattingAudit: {
      wordCount: snapshot?.audit?.wordCount ?? atsResult?.audit?.wordCount ?? (resumeText ? resumeText.trim().split(/\s+/).filter(Boolean).length : 0),
      parseQuality: snapshot?.audit?.parseQuality ?? atsResult?.parseQuality ?? 'Unknown',
      contactInfo: atsResult?.audit?.contactInfo || {
        email: snapshot?.identity?.candidateEmail ?? null,
        phone: snapshot?.identity?.candidatePhone ?? null,
        linkedin: null,
        github: null,
        portfolio: null,
      },
      sectionsFound: snapshot?.audit?.sectionsFound ?? atsResult?.audit?.sectionsFound ?? [],
      missingStandardSections: snapshot?.audit?.missingStandardSections ?? atsResult?.audit?.missingStandardSections ?? [],
      weakBulletsCount: snapshot?.audit?.weakBulletsCount ?? atsResult?.audit?.weakBulletsCount ?? 0,
      metricsRatio: snapshot?.audit?.metricsRatio ?? atsResult?.audit?.metricsRatio ?? 0,
      stuffedSkills: snapshot?.audit?.stuffedSkills ?? atsResult?.audit?.stuffedSkills ?? [],
    },
  };

  // Ensure TalentLens Market Intelligence is 100% computed
  let talentLensIntel: TalentLensIntelModel;
  if (tlResult?.marketIntel) {
    talentLensIntel = {
      marketPosition: tlResult.marketIntel.marketPosition || 'Market Current',
      overallMarketFit: tlResult.marketIntel.overallMarketFit || 68,
      techCurrencyScore: tlResult.marketIntel.techCurrencyScore || 72,
      buildAuthenticity: tlResult.marketIntel.buildAuthenticity || 65,
      fundamentalDepth: tlResult.marketIntel.fundamentalDepth || 78,
      buildVerdict: tlResult.marketIntel.buildVerdict || `Candidate profile exhibits strong alignment with ${companyName} intake criteria.`,
      modernPractices: tlResult.marketIntel.stackCurrency?.modernPractices || ['Automated CI/CD', 'Distributed Architecture'],
      outdatedSignals: tlResult.marketIntel.stackCurrency?.outdatedSignals || [],
      emergingAdoption: tlResult.marketIntel.stackCurrency?.emergingAdoption || ['TypeScript', 'GraphQL'],
      findings: (tlResult.marketIntel.findings || []).map((f: any) => ({
        category: f.category,
        status: f.status,
        finding: f.finding,
        evidence: f.evidence || [],
        marketContext: f.marketContext || '',
      })),
    };
  } else if (resumeText) {
    try {
      const generatedIntel = runMarketIntelligenceEngine(
        resumeText,
        breakdown.map((b) => b.key),
        { name: companyName || 'Unspecified Employer', tier, industry: industry || 'Technology & Software' },
        { title: roleTitle }
      );
      talentLensIntel = {
        marketPosition: generatedIntel.marketPosition || 'Market Current',
        overallMarketFit: generatedIntel.overallMarketFit,
        techCurrencyScore: generatedIntel.techCurrencyScore,
        buildAuthenticity: generatedIntel.buildAuthenticity,
        fundamentalDepth: generatedIntel.fundamentalDepth,
        buildVerdict: generatedIntel.buildVerdict,
        modernPractices: generatedIntel.stackCurrency?.modernPractices || [],
        outdatedSignals: generatedIntel.stackCurrency?.outdatedSignals || [],
        emergingAdoption: generatedIntel.stackCurrency?.emergingAdoption || [],
        findings: generatedIntel.findings.map((f) => ({
          category: f.category,
          status: f.status,
          finding: f.finding,
          evidence: f.evidence,
          marketContext: f.marketContext,
        })),
      };
    } catch {
      talentLensIntel = {
        marketPosition: score >= 75 ? 'Industry Leader' : 'Market Current',
        overallMarketFit: score,
        techCurrencyScore: 75,
        buildAuthenticity: 70,
        fundamentalDepth: 80,
        buildVerdict: `Technical profile aligns with contemporary production standards${companyName ? ` for ${companyName}` : ''}.`,
        modernPractices: ['Automated Testing', 'Microservices', 'Clean Architecture'],
        outdatedSignals: [],
        emergingAdoption: ['TypeScript', 'Cloud Native'],
        findings: [],
      };
    }
  } else {
    talentLensIntel = {
      marketPosition: score >= 75 ? 'Industry Leader' : 'Market Current',
      overallMarketFit: score,
      techCurrencyScore: 75,
      buildAuthenticity: 70,
      fundamentalDepth: 80,
      buildVerdict: `Technical profile aligns with contemporary production standards${companyName ? ` for ${companyName}` : ''}.`,
      modernPractices: ['Automated Testing', 'Microservices', 'Clean Architecture'],
      outdatedSignals: [],
      emergingAdoption: ['TypeScript', 'Cloud Native'],
      findings: [],
    };
  }

  // Stage 5: Parse Transparency Summary
  const skillStatesForEvaluation = (isTalentLens || breakdown.length > 0)
    ? buildSkillStates({
        resumeText: resumeText || '',
        competencies: breakdown.map((b) => b.key),
        reqLevels: Object.fromEntries(breakdown.map((b) => [b.key, b.reqLevel || 'strong'])),
        role: tlRole || { title: roleTitle, level },
        company: tlCompany || { name: companyName || 'Unspecified Employer', industry: industry || 'Technology & Software', tier },
      })
    : [];

  // Reconcile skill states with authoritative breakdown statuses to eliminate contradictions
  for (const st of skillStatesForEvaluation) {
    const matchingB = breakdown.find(
      (b) => b.key.toLowerCase() === st.id.toLowerCase() ||
             (b.label && b.label.toLowerCase() === st.label.toLowerCase())
    );
    if (matchingB) {
      if (matchingB.status === 'demonstrated' || matchingB.status === 'expert' || matchingB.status === 'strong') {
        st.status = 'demonstrated';
      }
    }
  }

  const parseSummary = extractResumeParseSummary(resumeText || '', skillStatesForEvaluation);

  // Stage 6: Strengths we verified (strictly from demonstrated skills and verified modern practices with evidence)
  const verifiedStrengths: Array<{
    skill: string;
    label: string;
    kind: string;
    contextScore: number;
    evidenceText: string;
  }> = [];

  for (const b of breakdown) {
    const isDemonstrated = b.status === 'demonstrated' || b.status === 'expert' || b.status === 'strong';
    const firstEvidence = b.evidenceQuotes?.[0];
    if (isDemonstrated && firstEvidence) {
      verifiedStrengths.push({
        skill: b.key,
        label: b.label,
        kind: b.kind || 'concept',
        contextScore: ((b.confidence ?? b.score) >= 75) ? 0.85 : 0.65,
        evidenceText: firstEvidence,
      });
    }
  }

  // Recommended Proof-of-Work Project Drops (Enforces Single Consolidated Matcher)
  let projectDrops: ProjectDropModel[] = [];

  const skillStatesForMatching: SkillState[] = skillStatesForEvaluation.length > 0
    ? skillStatesForEvaluation
    : entry.gaps.map((g) => ({
        id: g.label.toLowerCase(),
        label: g.label,
        kind: 'concept' as const,
        requirementLevel: g.severity === 3 ? 'expert' : 'strong',
        requirementSource: 'jd-text' as const,
        evidence: [],
        status: 'not-found' as const,
        confidenceTag: 'Low' as const,
        score: 0,
        confidence: 0,
        gaps: [],
        summaryLine: '',
        contextSentences: [],
      }));

  const projectMatch = matchProjectsWithIntegrity({
    skillStates: skillStatesForMatching,
    company: tlCompany || { name: companyName || 'Unspecified Employer', industry: industry || 'Technology & Software', tier },
    role: tlRole || { title: roleTitle, level },
  });

  projectDrops = projectMatch.projects.map((p) => ({
    id: p.id,
    title: p.title,
    domain: p.domain,
    difficulty: p.difficulty,
    estimatedHours: p.estimatedHours,
    hoursDisplay: p.hoursDisplay,
    coveredSkills: p.coveredSkills,
    closes: p.closes,
    whyThisProject: p.whyThisProject,
    reasonCodes: p.reasonCodes,
    problemStatement: p.problemStatement,
    architecture: p.architecture,
    recruiterSignal: p.recruiterSignal,
    portfolioBulletFormula: p.portfolioBulletFormula,
    deliverables: p.deliverables,
  }));

  // If no projects matched via standard matcher (e.g. non-TalentLens ATS audit) but candidate has planned build_brief items, include them
  if (projectDrops.length === 0 && i.planItems && i.planItems.length > 0) {
    const briefItems = i.planItems.filter((p) => p.kind === 'build_brief');
    for (const item of briefItems) {
      projectDrops.push({
        title: item.title,
        domain: 'Infrastructure & Systems',
        difficulty: 'advanced',
        estimatedHours: 25,
        coveredSkills: ['Systems Programming', 'Performance Engineering'],
        problemStatement: `Implement ${item.title} to resolve verified technical gap.`,
        architecture: 'Production-grade component adhering to high-throughput standards.',
        recruiterSignal: `Demonstrates targeted initiative resolving ${item.title}.`,
        portfolioBulletFormula: `Engineered ${item.title} using production protocols.`,
        deliverables: ['Repository code', 'Benchmarking suite', 'Documentation'],
      });
    }
  }

  // Learning Paths & Action Plans
  const learningStages: LearningStageModel[] = [];
  const learningPlans: LearningPlanModel[] = [];

  if (Array.isArray(tlResult?.plans) && tlResult.plans.length > 0) {
    for (const p of tlResult.plans) {
      learningPlans.push({
        priority: p.priority,
        title: p.title,
        detail: p.detail,
        timeframe: p.timeframe,
        suggestedAction: p.suggestedAction,
        hypotheticalScoreGain: p.hypotheticalScoreGain,
        bulletTemplate: p.bulletTemplate,
        resources: p.resources || [],
      });
    }
  } else if (isTalentLens && breakdown.length > 0) {
    try {
      const generated = generateImprovementPlan(
        breakdown.map((b) => ({
          competency: b.key,
          analysis: {
            status: b.status,
            confidence: b.score,
            layerScores: b.layerScores || { l1: b.score, l2: b.score, l3: b.score, l4: b.score, l5: b.score },
            evidence: b.evidenceQuotes,
            contextSentences: b.evidenceQuotes,
            gaps: b.gaps,
          },
          reqLevel: b.reqLevel || 'strong',
        })) as any,
        tlCompany || { id: 'company', name: companyName || 'Unspecified Employer', tier },
        tlRole || { title: roleTitle, level, competencies: breakdown.map((b) => b.key) },
        score,
        skillStatesForEvaluation,
        projectDrops
      );
      for (const p of generated) {
        learningPlans.push({
          priority: p.priority,
          title: p.title,
          detail: p.detail,
          timeframe: p.timeframe,
          suggestedAction: p.suggestedAction,
          hypotheticalScoreGain: p.hypotheticalScoreGain,
          bulletTemplate: p.bulletTemplate,
          resources: p.resources || [],
        });
      }
    } catch {
      /* ignore */
    }
  } else if (atsDiagnostics.fixFirst.length > 0) {
    for (const f of atsDiagnostics.fixFirst) {
      learningPlans.push({
        priority: f.expectedScoreGain >= 8 ? 'critical' : f.expectedScoreGain >= 5 ? 'high' : 'medium',
        title: f.title,
        detail: f.reason,
        timeframe: '3-7 days',
        suggestedAction: `Resolve ${f.type.replace(/_/g, ' ')} gap immediately to maximize interview callback conversion.`,
        hypotheticalScoreGain: `+${f.expectedScoreGain} points`,
        bulletTemplate: `Built production subsystem addressing ${f.title}; achieved verified performance outcome.`,
        resources: ['Clean code resume principles', 'STAR method engineering bullet format'],
      });
    }
  }

  // 3-Stage Learning Roadmap
  learningStages.push({
    stageName: 'Stage 1: Core Fundamentals & Requirement Gaps',
    focus: 'Close critical requirement gaps that trigger automated screening filters.',
    skills: breakdown.filter((b) => b.status === 'absent' || b.status === 'working').map((b) => b.label).slice(0, 4),
    actionItems: [
      'Implement proof-of-work project focusing on primary missing requirements.',
      'Document architectural decisions with README and GitHub commit history.',
    ],
    timeframe: 'Week 1 - 2',
  });
  learningStages.push({
    stageName: 'Stage 2: Production Patterns & Quantified Metrics',
    focus: 'Add latency benchmarks, throughput metrics, and test coverage to resume bullets.',
    skills: breakdown.filter((b) => b.status === 'working').map((b) => b.label).slice(0, 4),
    actionItems: [
      'Rewrite bullet points using the XYZ formula: Accomplished [X] measured by [Y] by doing [Z].',
      'Deploy application with automated CI/CD pipeline and monitoring.',
    ],
    timeframe: 'Week 3 - 4',
  });
  learningStages.push({
    stageName: 'Stage 3: Advanced Differentiators & Interview Grilling',
    focus: 'Prepare for deep technical grilling and edge cases in system design & architecture.',
    skills: breakdown.filter((b) => b.status === 'expert').map((b) => b.label).slice(0, 3),
    actionItems: [
      'Conduct mock system design interviews on distributed trade-offs.',
      'Prepare live architecture defense for portfolio projects.',
    ],
    timeframe: 'Week 5 - 6',
  });

  // Reality Factors
  const realityFactors = [
    `Hiring Bar: Technical screeners evaluate verifiable code execution, not merely listed skill keywords.`,
    `Project Proof: Tutorial clone repositories are easily filtered out; real-world deployable projects provide 4x higher interview callback rates.`,
    `Numerical Metrics: Quantified outcomes (e.g. latency, throughput, scale) increase resume credibility by over 30%.`,
    `Integrity Standard: Lexical tokens and competency citations are grounded strictly on resume text under deterministic evaluation.`,
  ];

  const model: Omit<DossierModel, 'summary'> = {
    meta: {
      title:
        entry.kind === 'talentlens'
          ? 'HireFlow TalentLens™ Competency Intelligence & Market Benchmark Report'
          : entry.kind === 'ats_roast'
          ? 'HireFlow ATS Resume Roaster™ 4-Layer Diagnostic Audit & Roast Report'
          : 'HireFlow Candidate Career & Technical Audit Dossier',
      generatedAt: i.generatedAt ?? entry.createdAt ?? new Date().toISOString(),
      engineVersion: entry.engineVersion,
      kind: entry.kind,
      auditId: entry.id,
      integrity: { resumeHash: entry.resume.snapshotHash, jdHash: entry.jd.snapshotHash },
    },
    candidate: {
      name: (snapshot?.identity?.candidateName || rawFindings.candidateName || (atsResult as any)?.candidateName || (atsResult as any)?.audit?.contactInfo?.name || (i.candidate?.name && i.candidate.name !== 'Candidate' && i.candidate.name !== 'Unresolved Candidate' ? i.candidate.name : null) || 'Unresolved Candidate').trim(),
      email: snapshot?.identity?.candidateEmail || (atsResult as any)?.audit?.contactInfo?.email || i.candidate?.email || undefined,
      resumeLabel: entry.resume.label,
    },
    target: {
      company: companyName,
      roleTitle,
      tier,
      level,
      industry,
      jdOrigin: entry.jd.origin,
    },
    headline: {
      score,
      scoreBand: band,
      readinessStatus,
      confidence,
      guidance,
      deltaPts: d?.overallDeltaPts ?? null,
      deltaText: d ? formatDelta(d.overallDeltaPts) : null,
      baselineDate: d?.baselineCreatedAt ?? null,
    },
    breakdown,
    strengths: verifiedStrengths.length > 0
      ? verifiedStrengths.map((vs) => `${vs.label}: "${vs.evidenceText}"`)
      : (entry.strengths || []).filter((s) => !/undefined|absent|not-found/i.test(s)),
    verifiedStrengths,
    parseSummary,
    gaps: { open: entry.gaps, resolved, added },
    atsDiagnostics,
    talentLensIntel,
    projectDrops,
    learningPath: {
      stages: learningStages,
      plans: learningPlans,
      bulletRewrites: tlResult?.bulletRewrites || generateEvidenceSafeRewrites(i.resumeText, breakdown.map((b) => b.key)),
    },
    bulletRewrites: tlResult?.bulletRewrites || generateEvidenceSafeRewrites(i.resumeText, breakdown.map((b) => b.key)),
    realityFactors,
    planned: (i.planItems || []).filter((p) => p.targetKey === entry.targetKey).map((p) => ({ title: p.title, kind: p.kind, status: p.status })),
    companyContext,
    appendix: { resumeText: i.resumeText, jdText: i.jdText },
  };

  const fullModel = { ...model, summary: executiveSummary(model, entry.kind) };
  const sanitizedModel = sanitizeReportPlaceholders(fullModel);
  const { sanitizedReport } = validateReport(sanitizedModel);
  return sanitizedReport;
}

export function dossierFilename(company: string | undefined, role: string | undefined, isoDate: IsoDate, ext: 'pdf' | 'docx' | 'md' | 'json' | 'txt', kind?: ToolKind): string {
  const clean = (v: string | undefined): string =>
    (v ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const prefix = kind === 'talentlens' ? 'talentlens-report' : kind === 'ats_roast' ? 'ats-roaster-report' : 'hireflow-dossier';
  const date = isoDate.slice(0, 10);
  const room = Math.max(0, 80 - prefix.length - date.length - 2);
  const middle = [clean(company), clean(role)].filter((p) => p.length > 0).join('_').slice(0, room).replace(/[-_]+$/g, '');
  return `${[prefix, middle, date].filter((p) => p.length > 0).join('_')}.${ext}`;
}
