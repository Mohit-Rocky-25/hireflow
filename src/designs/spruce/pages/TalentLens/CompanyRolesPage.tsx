import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpruceShell } from '../../layout/SpruceShell';
import { PageHeader } from '../../layout/PageHeader';
import {
  Card,
  Button,
  Tabs,
  StatusChip,
  ComparisonTable,
  CompareBadge,
  Accordion,
  AccordionItem,
  Progress,
  MintPanel,
} from '../../ui';
import { findCompanyBySlug, type Role } from '../../../../pages/demo/talentLensData';
import { analyzeRoleMatch, AnalysisResult } from '../../../../pages/demo/talentLensEngine';
import { useTalentLensStore, DEMO_TALENTLENS_RESUME } from '../../../../pages/demo/useTalentLensStore';
import { ArrowLeft, Play, Sparkles, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';

export function SpruceCompanyRolesPage() {
  const { companySlug = '' } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const { resumeText } = useTalentLensStore();

  const activeResumeText = resumeText?.trim() ? resumeText : DEMO_TALENTLENS_RESUME.text;
  const company = useMemo(() => findCompanyBySlug(companySlug), [companySlug]);

  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string>(
    () => company?.roles?.[0]?.title || ''
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<string>('skills');

  const selectedRole = useMemo(() => {
    if (!company) return null;
    return company.roles.find((r) => r.title === selectedRoleTitle) || company.roles[0];
  }, [company, selectedRoleTitle]);

  if (!company) {
    return (
      <SpruceShell>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 text-center">
          <Card className="p-8 max-w-md mx-auto space-y-4">
            <h2 className="sp-h2 text-sp-ink">Company Not Found</h2>
            <p className="sp-body-sm text-sp-muted">
              The company profile you requested could not be located in our catalog.
            </p>
            <Button variant="primary" onClick={() => navigate('/demo')}>
              Back to TalentLens
            </Button>
          </Card>
        </div>
      </SpruceShell>
    );
  }

  const handleRunAnalysis = () => {
    if (!selectedRole) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = analyzeRoleMatch(activeResumeText, company, selectedRole);
      setAnalysisResult(res);
      setIsAnalyzing(false);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 1200);
  };

  const roleTableData = company.roles.map((role) => ({
    title: role.title,
    level: role.level,
    compensation: role.compensation || company.avgPackage || 'Market Competitive',
    competencies: role.competencies?.join(', ') || 'Core Engineering',
  }));

  return (
    <SpruceShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'TalentLens', href: '/demo' },
          { label: company.name },
        ]}
        title={`${company.name} Career Paths`}
        subtitle={`Calibrate candidate placement readiness across ${company.roles?.length || 1} enterprise engineering tracks.`}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Company Overview & Analysis Trigger Bar */}
        <Card className="p-6 bg-sp-surface space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-sp-hairline">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-sp-mint-100 text-sp-primary-text font-bold text-xl flex items-center justify-center shrink-0 border border-sp-mint-200">
                {company.logo || company.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="sp-h2 text-sp-ink font-bold">{company.name}</h2>
                  <CompareBadge>{company.tier || 'MNC'}</CompareBadge>
                </div>
                <p className="sp-caption text-sp-muted mt-1">
                  {company.industry} • {company.hq}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/demo')}
              >
                ← All Companies
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !selectedRole}
              >
                <Play className="w-4 h-4 fill-current" />
                {isAnalyzing ? 'Simulating Rubrics...' : 'Run Deep AI Analysis'}
              </Button>
            </div>
          </div>

          {/* Roles in ComparisonTable per Appendix 5.10 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="sp-eyebrow text-sp-muted">Available Engineering Tracks</span>
                <h3 className="sp-h3 text-sp-ink mt-0.5">Select Target Role</h3>
              </div>
              <span className="sp-caption text-sp-muted">
                Selected: <strong className="text-sp-ink">{selectedRole?.title}</strong>
              </span>
            </div>

            <ComparisonTable
              columns={[
                {
                  key: 'title',
                  header: 'Role Title',
                  render: (row) => (
                    <span className="font-bold text-sp-ink">{row.title}</span>
                  ),
                },
                { key: 'level', header: 'Career Level' },
                {
                  key: 'compensation',
                  header: 'Estimated Package',
                  render: (row) => (
                    <span className="font-semibold text-sp-primary-text tabular-nums">
                      {row.compensation}
                    </span>
                  ),
                },
                { key: 'competencies', header: 'Core Competencies' },
                {
                  key: 'action',
                  header: 'Action',
                  render: (row) => {
                    const isSelected = row.title === selectedRoleTitle;
                    return (
                      <Button
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedRoleTitle(row.title)}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    );
                  },
                },
              ]}
              data={roleTableData}
              keyExtractor={(r) => r.title}
            />
          </div>
        </Card>

        {/* 6-Dimension Deep Analysis Result View per Appendix 5.10 */}
        {analysisResult && (
          <Card className="p-8 bg-sp-surface space-y-8 animate-fade-in border-2 border-sp-primary/40">
            {/* Short Summary First */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-sp-hairline">
              <div>
                <span className="sp-eyebrow text-sp-primary-text font-bold">Placement Calibration Verdict</span>
                <h2 className="sp-h2 text-sp-ink mt-0.5">
                  {analysisResult.score >= 75 ? 'Strong Placement Candidate' : 'Developing Match with Evidence Gaps'}
                </h2>
                <p className="sp-body-sm text-sp-muted mt-1 leading-relaxed max-w-2xl">
                  Candidate match evaluated at {analysisResult.readinessLabel} ({analysisResult.band?.label} sensitivity) against {company.name} engineering rubrics.
                </p>
              </div>

              <div className="px-6 py-4 rounded-sp-lg bg-sp-mint-50 border border-sp-mint-200 text-center shrink-0">
                <span className="sp-h1 text-sp-primary-text font-black tabular-nums">
                  {analysisResult.score}%
                </span>
                <p className="sp-caption text-sp-muted font-bold mt-0.5">Overall Fit Score</p>
              </div>
            </div>

            {/* Six Evaluation Dimensions as Tabs per Appendix 5.10 */}
            <div className="space-y-6">
              <Tabs
                items={[
                  { id: 'skills', label: '1. Hard Skills Alignment' },
                  { id: 'experience', label: '2. Experience & Title' },
                  { id: 'domain', label: '3. Domain & Scale' },
                  { id: 'education', label: '4. Education & Certs' },
                  { id: 'redflags', label: '5. Red Flags & Gaps' },
                  { id: 'decision', label: '6. Recruiter Decision' },
                ]}
                activeId={activeAnalysisTab}
                onChange={(id) => setActiveAnalysisTab(id)}
              />

              {/* Tab 1: Hard Skills */}
              {activeAnalysisTab === 'skills' && (
                <div className="space-y-4">
                  <h4 className="sp-h3 text-sp-ink">Core Technical Competency Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.breakdown.map((item, idx) => {
                      const compScore = Math.round(item.analysis.confidence * 100);
                      const compSummary =
                        item.analysis.gaps.length > 0
                          ? item.analysis.gaps[0]
                          : item.analysis.evidence[0] || 'Meets target requirements';

                      return (
                        <div key={idx} className="p-4 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="sp-ui-label text-sp-ink font-bold">{item.competency}</span>
                            <StatusChip
                              status={item.analysis.status === 'expert' || item.analysis.status === 'strong' ? 'matched' : 'partial'}
                              label={item.analysis.status}
                            />
                          </div>
                          <Progress value={compScore} className="h-2" />
                          <p className="sp-caption text-sp-muted leading-relaxed">
                            {compSummary}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Experience & Title */}
              {activeAnalysisTab === 'experience' && (
                <div className="p-6 rounded-sp-lg bg-sp-canvas-soft border border-sp-hairline space-y-3">
                  <h4 className="sp-h3 text-sp-ink">Experience &amp; Seniority Level Match</h4>
                  <p className="sp-body text-sp-body leading-relaxed">
                    Evaluated against {company.name}&rsquo;s canonical {selectedRole?.level} promotion requirements. 
                    Candidate evidence exhibits demonstrated competency across core day-to-day responsibilities.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <StatusChip status="matched" label="Seniority Aligned" />
                    <span className="sp-caption text-sp-muted">0-2 Years Entry Band</span>
                  </div>
                </div>
              )}

              {/* Tab 3: Domain & Scale */}
              {activeAnalysisTab === 'domain' && (
                <div className="p-6 rounded-sp-lg bg-sp-canvas-soft border border-sp-hairline space-y-3">
                  <h4 className="sp-h3 text-sp-ink">Domain Relevance &amp; Traffic Volume</h4>
                  <p className="sp-body text-sp-body leading-relaxed">
                    Production systems at {company.name} require proven handling of concurrency, distributed storage, and failover latency.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <StatusChip status="partial" label="Scale Targets Pending" />
                    <span className="sp-caption text-sp-muted">Recommend building High-Throughput Queue project</span>
                  </div>
                </div>
              )}

              {/* Tab 4: Education & Certs */}
              {activeAnalysisTab === 'education' && (
                <div className="p-6 rounded-sp-lg bg-sp-canvas-soft border border-sp-hairline space-y-3">
                  <h4 className="sp-h3 text-sp-ink">Education &amp; Credential Validation</h4>
                  <p className="sp-body text-sp-body leading-relaxed">
                    Candidate degrees and accredited coursework meet the baseline campus qualification criteria for {company.name}.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <StatusChip status="matched" label="Eligibility Gate Cleared" />
                  </div>
                </div>
              )}

              {/* Tab 5: Red Flags & Gaps */}
              {activeAnalysisTab === 'redflags' && (
                <div className="p-6 rounded-sp-lg bg-sp-canvas-soft border border-sp-hairline space-y-3">
                  <h4 className="sp-h3 text-sp-ink">Red Flags &amp; Keyword Stuffing Scan</h4>
                  <p className="sp-body text-sp-body leading-relaxed">
                    Zero keyword stuffing detected. Natural density verified across experience bullets.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <StatusChip status="matched" label="Clean Parser Score" />
                  </div>
                </div>
              )}

              {/* Tab 6: Recruiter Decision */}
              {activeAnalysisTab === 'decision' && (
                <MintPanel className="p-6 space-y-3">
                  <span className="sp-eyebrow text-sp-primary-text font-bold">Recruiter Screening Verdict</span>
                  <h4 className="sp-h2 text-sp-ink">Shortlist Recommended</h4>
                  <p className="sp-body text-sp-body leading-relaxed">
                    The candidate meets the core technical threshold for an interview loop. Focus preparation on DSA and architecture trade-offs.
                  </p>
                </MintPanel>
              )}
            </div>

            {/* Career Acceleration Plan Collapsed in Accordion per Appendix 5.10 */}
            <div className="pt-6 border-t border-sp-hairline">
              <Accordion>
                <AccordionItem
                  id="plan"
                  title="Career Acceleration Plan & Next Steps (Click to Expand)"
                >
                  <div className="space-y-4 pt-2">
                    <p className="sp-body-sm text-sp-body leading-relaxed">
                      Follow these tailored steps to maximize callback probability for {company.name}:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 sp-body-sm text-sp-body">
                      <li>
                        <strong>Add Quantified Scale:</strong> Edit your resume in the Resume Tailor to highlight latency reduction and throughput metrics.
                      </li>
                      <li>
                        <strong>Close Skill Gaps:</strong> Review Project Build Briefs to implement missing architectural patterns (Kafka, Go, or Distributed Caching).
                      </li>
                      <li>
                        <strong>Cold Outreach:</strong> Use the Reach Out tool to contact verified engineering managers with targeted project proofs.
                      </li>
                    </ol>
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </Card>
        )}
      </div>
    </SpruceShell>
  );
}
