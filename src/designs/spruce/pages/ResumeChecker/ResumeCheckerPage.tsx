import React, { useState } from 'react';
import { SpruceShell } from '../../layout/SpruceShell';
import { PageHeader } from '../../layout/PageHeader';
import {
  Card,
  Button,
  FieldShell,
  Textarea,
  Select,
  StatBlock,
  StatChip,
  StatusChip,
  Tabs,
  SpecGrid,
  SpecCell,
  Progress,
  ExpertTip,
  ComparisonTable,
} from '../../ui';
import { useAtsRoasterController, STAGED_MESSAGES } from '../../../../features/ats/hooks/useAtsRoasterController';
import { TargetTier, ExperienceLevel } from '../../../../features/ats/components/AtsInputSection';
import { ExportDossierButton } from '../../../../features/dossier/ExportDossierButton';
import { buildFallbackAuditEntry, buildQuickRoastProjection } from '../../../../pages/tools/ResumeChecker';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';

export function SpruceResumeCheckerPage() {
  const {
    resumeText,
    setResumeText,
    jobText,
    setJobText,
    resumeFileName,
    jobFileName,
    targetTier,
    setTargetTier,
    experienceLevel,
    setExperienceLevel,
    fileError,
    isScanning,
    stagedStageIndex,
    engineResult,
    latestSnapshot,
    latestAuditEntry,
    detectedTargetCompany,
    detectedRoleTitle,
    jobRoleBridgeSkills,
    activeTab,
    setActiveTab,
    handleFileUpload,
    handleClearResume,
    handleClearJob,
    executeAnalysis,
  } = useAtsRoasterController();

  const effectiveAudit = React.useMemo(() => {
    if (!engineResult) return null;
    if (latestAuditEntry) return latestAuditEntry;
    return buildFallbackAuditEntry({
      engineResult,
      quickRoast: buildQuickRoastProjection(engineResult),
      effectiveSnapshot: latestSnapshot,
      quickSummary: null,
      detectedTargetCompany,
      detectedRoleTitle,
      resumeFileName,
      jobRoleBridgeSkills,
    });
  }, [
    engineResult,
    latestAuditEntry,
    latestSnapshot,
    detectedTargetCompany,
    detectedRoleTitle,
    resumeFileName,
    jobRoleBridgeSkills,
  ]);

  const [inputTab, setInputTab] = useState<'paste' | 'upload'>('paste');

  const reportTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'skills', label: 'Skills & Gaps', count: engineResult?.skillResults?.length },
    { id: 'audit', label: 'Format Audit' },
    { id: 'learning_path', label: 'Actionability Plan' },
  ];

  const dimensionDisplay = React.useMemo(() => {
    const sub = engineResult?.subscores;
    if (!engineResult || !sub) return null;

    if (engineResult.trace?.pillars && engineResult.trace.pillars.length > 0) {
      const byId = Object.fromEntries(
        engineResult.trace.pillars.map((p) => [
          p.id,
          {
            weight: Math.round(p.effectiveWeight * 100),
            applicable: p.applicable && Math.round(p.effectiveWeight * 100) > 0,
            contribution: p.contribution,
            reason: p.notApplicableReason,
          },
        ])
      );
      return byId;
    }

    const w = engineResult.activeWeights;
    return {
      mustHaveCoverage: {
        weight: w?.mustHaveCoverage ?? 30,
        applicable: (w?.mustHaveCoverage ?? 30) > 0,
        contribution: sub.mustHaveCoverage,
      },
      evidenceDepth: {
        weight: w?.evidenceDepth ?? 20,
        applicable: (w?.evidenceDepth ?? 20) > 0,
        contribution: sub.evidenceDepth,
      },
      impactMetrics: {
        weight: w?.impactMetrics ?? 15,
        applicable: (w?.impactMetrics ?? 15) > 0,
        contribution: sub.impactMetrics,
      },
      projectsAndOss: {
        weight: w?.projectsAndOss ?? 10,
        applicable: (w?.projectsAndOss ?? 10) > 0,
        contribution: sub.projectsAndOss,
      },
      seniorityFit: {
        weight: w?.seniorityFit ?? 10,
        applicable: (w?.seniorityFit ?? 10) > 0,
        contribution: sub.seniorityFit,
      },
      formatAndParse: {
        weight: w?.formatAndParse ?? 10,
        applicable: (w?.formatAndParse ?? 10) > 0,
        contribution: sub.formatAndParse,
      },
      tierFit: {
        weight: w?.tierFit ?? 5,
        applicable: (w?.tierFit ?? 5) > 0,
        contribution: sub.tierFit,
      },
    } as Record<string, { weight: number; applicable: boolean; contribution: number; reason?: string }>;
  }, [engineResult]);

  const formatDimSpec = (id: string, fallbackScore: number) => {
    const dim = dimensionDisplay?.[id];
    if (!dim || !dim.applicable || dim.weight <= 0) {
      return 'N/A (Redistributed)';
    }
    return `${dim.contribution ?? fallbackScore} / ${dim.weight}`;
  };

  return (
    <SpruceShell>
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/tools' }, { label: 'ATS Resume Roaster' }]}
        title="ATS Resume Roaster"
        subtitle="Simulate enterprise ATS filters with deterministic subscores, verbatim citations, and calibrated placement rubrics."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Scanner Inputs (5 cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-sp-hairline">
                <h3 className="sp-h3 text-sp-ink">Resume & Target JD</h3>
                <Tabs
                  items={[
                    { id: 'paste', label: 'Paste Text' },
                    { id: 'upload', label: 'Upload PDF' },
                  ]}
                  activeId={inputTab}
                  onChange={(id) => setInputTab(id as any)}
                />
              </div>

              {fileError && (
                <div className="p-3.5 rounded-sp-xs bg-sp-error-bg text-sp-error-text sp-caption font-medium border border-sp-error-text/30 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{fileError}</span>
                </div>
              )}

              {inputTab === 'paste' ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="sp-caption text-sp-body font-medium">Candidate Resume Text</label>
                      {resumeText && (
                        <button
                          type="button"
                          onClick={handleClearResume}
                          className="sp-micro text-sp-muted hover:text-sp-error-text cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <Textarea
                      placeholder="Paste your raw text or Markdown resume content here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="min-h-[140px] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="sp-caption text-sp-body font-medium">Target Job Description</label>
                      {jobText && (
                        <button
                          type="button"
                          onClick={handleClearJob}
                          className="sp-micro text-sp-muted hover:text-sp-error-text cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <Textarea
                      placeholder="Paste target job description and requirements here..."
                      value={jobText}
                      onChange={(e) => setJobText(e.target.value)}
                      className="min-h-[140px] text-xs font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-sp-hairline-strong rounded-sp-lg p-6 text-center hover:border-sp-primary-text transition-colors">
                    <Upload className="w-8 h-8 text-sp-primary-text mx-auto mb-2" />
                    <p className="sp-body-sm font-semibold text-sp-ink">Drop your PDF or DOCX file here</p>
                    <p className="sp-caption text-sp-muted mt-1">Single or double column PDF, text DOCX</p>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'resume')}
                      className="hidden"
                      id="sp-resume-file"
                    />
                    <label
                      htmlFor="sp-resume-file"
                      className="mt-4 inline-block sp-ui-label text-xs uppercase cursor-pointer px-4 py-2 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline text-sp-ink hover:bg-sp-mint-50"
                    >
                      Browse Files
                    </label>
                  </div>
                  {resumeFileName && (
                    <div className="flex items-center justify-between p-3 rounded-sp-xs bg-sp-mint-50 border border-sp-hairline">
                      <span className="sp-caption font-semibold text-sp-ink truncate">{resumeFileName}</span>
                      <button onClick={handleClearResume} className="text-sp-muted hover:text-sp-error-text">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Simplified Calibration Selects */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Select
                  label="Target Market Tier"
                  value={targetTier}
                  onChange={(e) => setTargetTier(e.target.value as TargetTier)}
                  options={[
                    { value: 'Auto', label: 'Auto (From JD)' },
                    { value: 'Top Product', label: 'Top Product' },
                    { value: 'Startup / Unicorn', label: 'Startup / Unicorn' },
                    { value: 'Service / MNC', label: 'Service / MNC' },
                  ]}
                />
                <Select
                  label="Experience Level"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  options={[
                    { value: 'Auto', label: 'Auto (From Resume)' },
                    { value: 'Fresher', label: 'Fresher (0 yrs)' },
                    { value: '1-3 yrs', label: 'Junior (1-3 yrs)' },
                    { value: '3-6 yrs', label: 'Mid-Senior (3-6 yrs)' },
                    { value: '6+ yrs', label: 'Staff+ (6+ yrs)' },
                  ]}
                />
              </div>

              {/* Scan Button & Determinate Progress */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={!resumeText || !jobText || isScanning}
                  onClick={() => executeAnalysis()}
                >
                  <span>{isScanning ? 'Scanning Profile...' : 'Scan & Roast Resume'}</span>
                  {!isScanning && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>

                {isScanning && (
                  <div className="mt-4 space-y-2">
                    <Progress value={((stagedStageIndex + 1) / STAGED_MESSAGES.length) * 100} />
                    <p className="sp-caption text-sp-muted text-center font-medium animate-pulse">
                      {STAGED_MESSAGES[stagedStageIndex]}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ── Right Column: Roaster Findings & Report (7 cols) ── */}
          <div className="lg:col-span-7 space-y-6">
            {!engineResult ? (
              <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
                <div className="w-16 h-16 rounded-full bg-sp-mint-50 text-sp-primary-text flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="sp-h3 text-sp-ink">No Analysis Loaded Yet</h3>
                <p className="sp-body-sm text-sp-muted max-w-md mt-2">
                  Paste your resume and target job description on the left, then click &ldquo;Scan &amp; Roast Resume&rdquo; to simulate enterprise recruiter filters.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* 1. Score Summary Header */}
                <Card className="p-6 bg-sp-surface">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-sp-hairline">
                    <div>
                      <span className="sp-eyebrow text-sp-muted">Calibration Verdict</span>
                      <h2 className="sp-h2 text-sp-ink mt-0.5">{engineResult.band} Candidate Match</h2>
                      <p className="sp-caption text-sp-muted mt-1">
                        Calibrated for {targetTier} • {experienceLevel} • Best fit: {engineResult.bestFitTier}
                        {engineResult.applicationGuidance && (
                          <>
                            {' '}• Guidance: <strong className="text-sp-ink">{engineResult.applicationGuidance}</strong>
                          </>
                        )}
                      </p>
                      {((engineResult.domainCapability && engineResult.domainCapability.tier !== 'supported') ||
                        (engineResult.jdState && engineResult.jdState !== 'supported_technical')) && (
                        <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-300 rounded px-2.5 py-1.5">
                          <strong>{engineResult.domainCapability?.label} ({engineResult.domainCapability?.tier}):</strong>{' '}
                          {engineResult.jdState === 'preferred_only' && engineResult.quickRoast?.oneLineVerdict
                            ? `${engineResult.quickRoast.oneLineVerdict} (${engineResult.domainCapability?.reason || ''})`
                            : (engineResult.domainCapability?.reason || engineResult.quickRoast?.oneLineVerdict)}
                          {engineResult.jobAnalysis?.unresolvedRequirements && engineResult.jobAnalysis.unresolvedRequirements.length > 0 && (
                            <span className="block mt-1">
                              Unresolved JD clause(s): {engineResult.jobAnalysis.unresolvedRequirements.map((u) => u.rawText).join('; ')}
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {effectiveAudit && (
                        <ExportDossierButton
                          audit={effectiveAudit}
                          resumeText={resumeText}
                          jdText={jobText}
                          highlighted={true}
                          label="Download ATS Roast Report"
                        />
                      )}
                      <StatBlock
                        figure={`${engineResult.score}%`}
                        label="Overall ATS Score"
                        isScore
                        withArrowMotif
                        className="py-3 px-5"
                      />
                    </div>
                  </div>

                  {/* 7 Authoritative Sub-scores SpecGrid */}
                  <div className="pt-6">
                    <SpecGrid columns={3}>
                      <SpecCell
                        label="Must-Have Coverage"
                        value={formatDimSpec('mustHaveCoverage', engineResult.subscores.mustHaveCoverage)}
                        hint={engineResult.mustHavesMet ? `${engineResult.mustHavesMet} Met` : 'Requirements met'}
                      />
                      <SpecCell
                        label="Evidence Depth"
                        value={formatDimSpec('evidenceDepth', engineResult.subscores.evidenceDepth)}
                        hint="Project and bullet depth"
                      />
                      <SpecCell
                        label="Impact Metrics"
                        value={formatDimSpec('impactMetrics', engineResult.subscores.impactMetrics)}
                        hint="Quantified business scale"
                      />
                      <SpecCell
                        label="Projects & OSS"
                        value={formatDimSpec('projectsAndOss', engineResult.subscores.projectsAndOss)}
                        hint="Code & system scope"
                      />
                      <SpecCell
                        label="Seniority Fit"
                        value={formatDimSpec('seniorityFit', engineResult.subscores.seniorityFit)}
                        hint={
                          dimensionDisplay?.seniorityFit && !dimensionDisplay.seniorityFit.applicable
                            ? 'Weight redistributed'
                            : engineResult.seniorityFit?.level || 'Title & years match'
                        }
                      />
                      <SpecCell
                        label="Format & Parse"
                        value={formatDimSpec('formatAndParse', engineResult.subscores.formatAndParse)}
                        hint={engineResult.parseQuality || 'Clean parser stream'}
                      />
                      <SpecCell
                        label="Tier Fit"
                        value={formatDimSpec('tierFit', engineResult.subscores.tierFit)}
                        hint={engineResult.bestFitTier || 'Calibrated bar'}
                      />
                    </SpecGrid>
                  </div>
                </Card>

                {/* 2. Harsh Truth Bullets in ExpertTip Panel */}
                <ExpertTip label="Harsh Truth Recruiter Intelligence">
                  <p className="text-sp-on-lime font-bold text-base mt-1">{engineResult.headline}</p>
                  <p className="text-sp-on-lime text-sm mt-1 leading-relaxed">{engineResult.oneParagraphSummary}</p>
                  {engineResult.penalties && engineResult.penalties.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-sp-on-lime/20 space-y-1.5">
                      <span className="sp-eyebrow text-sp-on-lime font-bold">Deductions Applied:</span>
                      <ul className="space-y-1">
                        {engineResult.penalties.map((pen) => (
                          <li key={pen.id} className="text-xs text-sp-on-lime/90 flex items-start gap-1.5">
                            <span className="font-bold">
                              {pen.points > 0 ? `-${pen.points}` : `${pen.points}`} pts:
                            </span>
                            <span>{pen.reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </ExpertTip>

                {/* 3. Report Navigation Tabs */}
                <Tabs
                  items={reportTabs}
                  activeId={activeTab}
                  onChange={(id) => setActiveTab(id as any)}
                />

                {/* 4. Tab Content: Skills & Gaps */}
                {activeTab === 'skills' && (
                  <Card className="p-6 space-y-4">
                    <h3 className="sp-h3 text-sp-ink mb-2">Requirement Skills Match</h3>
                    <div className="divide-y divide-sp-hairline">
                      {engineResult.skillResults?.map((skill, idx) => {
                        const matchStatus = skill.matchResult?.status as string | undefined;
                        const statusVariant: 'matched' | 'partial' | 'missing' =
                          skill.status === 'verified' || matchStatus === 'SATISFIED'
                            ? 'matched'
                            : skill.status === 'weak' ||
                              matchStatus === 'PARTIALLY_SATISFIED' ||
                              matchStatus === 'RELATED_BUT_NOT_EQUIVALENT'
                            ? 'partial'
                            : 'missing';

                        const statusLabel =
                          matchStatus === 'CONTRADICTED'
                            ? 'Contradicted'
                            : matchStatus === 'AMBIGUOUS'
                            ? 'Ambiguous'
                            : matchStatus === 'RELATED_BUT_NOT_EQUIVALENT'
                            ? 'Non-Equivalent'
                            : matchStatus === 'NOT_DEMONSTRATED' || skill.status === 'missing'
                            ? 'Missing'
                            : matchStatus === 'PARTIALLY_SATISFIED' || skill.status === 'weak'
                            ? 'Partial / Weak'
                            : 'Verified';

                        const verbatimQuote = skill.evidence?.[0]?.quote;

                        return (
                          <div key={skill.skillId || idx} className="py-3.5 flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div>
                                <span className="sp-ui-label text-sp-ink">{skill.canonical || skill.skillId}</span>
                                {skill.isSubstituteMatch && skill.satisfiedByCanonical && (
                                  <span className="sp-caption text-sp-primary-text ml-1.5 font-medium">
                                    (satisfied via {skill.satisfiedByCanonical})
                                  </span>
                                )}
                                <span className="sp-caption text-sp-muted ml-2">
                                  ({skill.required === 'must' ? 'Must-Have' : 'Nice-to-Have'})
                                </span>
                              </div>
                              {skill.matchResult?.explanation && (
                                <p className="sp-caption text-sp-muted">
                                  {skill.matchResult.explanation}
                                </p>
                              )}
                              {verbatimQuote && (
                                <p className="sp-caption text-sp-muted italic">
                                  &ldquo;{verbatimQuote}&rdquo;
                                </p>
                              )}
                            </div>
                            <StatusChip status={statusVariant} label={statusLabel} />
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* 5. Tab Content: Overview / Verbatim Quotes */}
                {activeTab === 'overview' && (
                  <Card className="p-6 space-y-6">
                    <div>
                      <h3 className="sp-h3 text-sp-ink">Verified Matching Strengths</h3>
                      <p className="sp-body-sm text-sp-muted mt-1">
                        Signals and proof points detected directly in your resume text.
                      </p>
                    </div>

                    {/* Verbatim Quote Highlight grounded in extracted resume evidence */}
                    {(() => {
                      const topVerified = engineResult.skillResults?.find(
                        (s) => s.status === 'verified' && s.evidence?.[0]?.quote
                      );
                      const quote = topVerified?.evidence?.[0]?.quote;
                      return (
                        <div className="border-l-2 border-sp-primary pl-4 py-1 italic sp-body-sm text-sp-body">
                          {quote
                            ? <>&ldquo;{quote}&rdquo; ({topVerified?.canonical || topVerified?.skillId})</>
                            : 'No verified verbatim skill quote extracted from experience or projects.'}
                        </div>
                      );
                    })()}

                    {/* Quick Summary of Gaps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <StatChip
                        figure={engineResult.skillResults?.filter((s: any) => s.found).length || 0}
                        label="Demonstrated Skills"
                      />
                      <StatChip
                        figure={engineResult.skillResults?.filter((s: any) => !s.found).length || 0}
                        label="Missing Skill Gaps"
                      />
                    </div>
                  </Card>
                )}

                {/* 6. Tab Content: Format Audit Table */}
                {activeTab === 'audit' && (
                  <Card className="p-6">
                    <h3 className="sp-h3 text-sp-ink mb-4">Format & Parser Audit</h3>
                    <ComparisonTable
                      columns={[
                        { key: 'check', header: 'Compliance Check' },
                        { key: 'severity', header: 'Severity' },
                        {
                          key: 'status',
                          header: 'Result',
                          render: (row: any) => (
                            <StatusChip status={row.pass ? 'matched' : 'missing'} label={row.pass ? 'Pass' : 'Warning'} />
                          ),
                        },
                      ]}
                      data={[
                        { check: 'Single-Column Text Stream', severity: 'High', pass: engineResult.parseQuality !== 'Poor' },
                        { check: 'Standard Section Headers', severity: 'Critical', pass: (engineResult.audit?.missingStandardSections?.length ?? 0) === 0 },
                        { check: 'Quantified Metrics in Bullets', severity: 'High', pass: (engineResult.subscores.evidenceDepth ?? 0) >= 10 },
                        { check: 'Zero Keyword Stuffing Detected', severity: 'Medium', pass: (engineResult.audit?.stuffedSkills?.length ?? 0) === 0 },
                      ]}
                      keyExtractor={(r) => r.check}
                    />
                  </Card>
                )}

                {/* 7. Tab Content: Actionability Plan */}
                {activeTab === 'learning_path' && (
                  <Card className="p-6 space-y-4">
                    <h3 className="sp-h3 text-sp-ink">Recommended Priority Fixes</h3>
                    <div className="space-y-3">
                      {engineResult.fixFirst && engineResult.fixFirst.length > 0 ? (
                        engineResult.fixFirst.map((fix, idx) => (
                          <div key={idx} className="p-4 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline">
                            <div className="flex items-center justify-between">
                              <span className="sp-ui-label text-sp-ink">{idx + 1}. {fix.title}</span>
                              <StatusChip
                                status={fix.type === 'missing_must_have' ? 'missing' : 'partial'}
                                label={
                                  fix.expectedScoreGain > 0
                                    ? `~+${fix.expectedScoreGain} pts (sim)`
                                    : 'Qualitative Priority'
                                }
                              />
                            </div>
                            <p className="sp-body-sm text-sp-muted mt-1.5 leading-relaxed">
                              {fix.reason}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline">
                          <span className="sp-ui-label text-sp-ink">No critical red flags identified</span>
                          <p className="sp-body-sm text-sp-muted mt-1.5">
                            Your resume passed all core deterministic heuristic gates for this tier.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SpruceShell>
  );
}
