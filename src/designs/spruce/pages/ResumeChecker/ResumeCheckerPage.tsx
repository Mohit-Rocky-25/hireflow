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
    activeTab,
    setActiveTab,
    handleFileUpload,
    handleClearResume,
    handleClearJob,
    executeAnalysis,
  } = useAtsRoasterController();

  const [inputTab, setInputTab] = useState<'paste' | 'upload'>('paste');

  const reportTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'skills', label: 'Skills & Gaps', count: engineResult?.skillResults?.length },
    { id: 'audit', label: 'Format Audit' },
    { id: 'learning_path', label: 'Actionability Plan' },
  ];

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
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatBlock
                        figure={`${engineResult.score}%`}
                        label="Overall ATS Score"
                        isScore
                        withArrowMotif
                        className="py-3 px-5"
                      />
                    </div>
                  </div>

                  {/* 6 Invariant Sub-scores SpecGrid */}
                  <div className="pt-6">
                    <SpecGrid columns={3}>
                      <SpecCell
                        label="Must-Have Coverage"
                        value={`${engineResult.subscores.mustHaveCoverage} / 30`}
                        hint={engineResult.mustHavesMet ? `${engineResult.mustHavesMet} Met` : 'Requirements met'}
                      />
                      <SpecCell
                        label="Evidence Depth"
                        value={`${engineResult.subscores.evidenceDepth} / 20`}
                        hint="Project and bullet depth"
                      />
                      <SpecCell
                        label="Impact Metrics"
                        value={`${engineResult.subscores.impactMetrics} / 15`}
                        hint="Quantified business scale"
                      />
                      <SpecCell
                        label="Projects & OSS"
                        value={`${engineResult.subscores.projectsAndOss} / 10`}
                        hint="Code & system scope"
                      />
                      <SpecCell
                        label="Seniority Fit"
                        value={`${engineResult.subscores.seniorityFit} / 10`}
                        hint={engineResult.seniorityFit?.level || 'Title & years match'}
                      />
                      <SpecCell
                        label="Format & Parse"
                        value={`${engineResult.subscores.formatAndParse} / 10`}
                        hint={engineResult.parseQuality || 'Clean parser stream'}
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
                            <span className="font-bold">−{pen.points}pts:</span>
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
                      {engineResult.skillResults?.map((skill: any, idx: number) => {
                        const statusVariant = skill.found && skill.status === 'verified'
                          ? 'matched'
                          : skill.status === 'related' || skill.status === 'partial'
                          ? 'partial'
                          : 'missing';

                        return (
                          <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                            <div>
                              <span className="sp-ui-label text-sp-ink">{skill.canonical || skill.name}</span>
                              <span className="sp-caption text-sp-muted ml-2">
                                ({skill.required === 'must' ? 'Must-Have' : 'Nice-to-Have'})
                              </span>
                            </div>
                            <StatusChip status={statusVariant} />
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

                    {/* Verbatim Quote Highlight */}
                    <div className="border-l-2 border-sp-primary pl-4 py-1 italic sp-body-sm text-sp-body">
                      &ldquo;ATS filters parse digital text directly. Ensure all verified technologies are linked to active production bullets.&rdquo;
                    </div>

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
                                label={`+${fix.expectedScoreGain} pts`}
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
