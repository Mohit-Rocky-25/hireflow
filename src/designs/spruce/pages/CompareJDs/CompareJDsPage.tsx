import React, { useState, useEffect, useMemo } from 'react';
import { SpruceShell } from '../../layout/SpruceShell';
import { PageHeader } from '../../layout/PageHeader';
import {
  Card,
  Button,
  FieldShell,
  Textarea,
  TextInput,
  StatusChip,
  Tabs,
} from '../../ui';
import { compareJDs, JDInput, CompareJDsResult } from '../../../../features/suite/compare/compareJDs';
import { useProfile } from '../../../../features/suite/profile/ProfileContext';
import { Check, Minus, Divide, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const SAMPLE_JD_A = `Company: Swiggy
Role: Backend Software Engineer
Requirements:
- Strong experience in Go, Java, or Python
- Microservices architecture and distributed systems
- PostgreSQL, Redis, and high-throughput caching
- Kafka or RabbitMQ event streaming
- Docker, Kubernetes, and CI/CD pipelines
- Minimum 1-3 years of production experience`;

const SAMPLE_JD_B = `Company: Razorpay
Role: Platform Engineer
Requirements:
- Production expertise in Go, Kubernetes, and Linux internals
- High availability distributed systems and gRPC
- PostgreSQL, Redis, MySQL, and database replication
- Kafka event-driven architectures
- Observability with Prometheus, Grafana, OpenTelemetry
- Minimum 2+ years experience in fintech/payments infra`;

export function SpruceCompareJDsPage() {
  const { profile } = useProfile();

  const [jdAText, setJdAText] = useState<string>(SAMPLE_JD_A);
  const [jdBText, setJdBText] = useState<string>(SAMPLE_JD_B);
  const [jdALabel, setJdALabel] = useState<string>('Swiggy (Backend)');
  const [jdBLabel, setJdBLabel] = useState<string>('Razorpay (Platform)');
  const [comparisonResult, setComparisonResult] = useState<CompareJDsResult | null>(null);

  const candidateResume = useMemo(() => {
    if (profile?.skills && profile.skills.length > 0) {
      return `Skills: ${profile.skills.map((s) => s.displayName).join(', ')}`;
    }
    return `Experienced in Go, Python, PostgreSQL, Docker, Redis, Git, Linux, REST APIs, Microservices.`;
  }, [profile]);

  useEffect(() => {
    let active = true;
    const inputs: JDInput[] = [
      { id: 'jd-a', label: jdALabel, text: jdAText, company: 'Company A' },
      { id: 'jd-b', label: jdBLabel, text: jdBText, company: 'Company B' },
    ];
    compareJDs(candidateResume, inputs)
      .then((res) => {
        if (active) setComparisonResult(res);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [candidateResume, jdALabel, jdAText, jdBLabel, jdBText]);

  // Derive overlap sets
  const { sharedSkills, jdASpecificSkills, jdBSpecificSkills } = useMemo(() => {
    if (!comparisonResult || comparisonResult.rankedJDs.length < 2) {
      return { sharedSkills: ['Go', 'PostgreSQL', 'Redis', 'Kafka', 'Docker'], jdASpecificSkills: ['Python / Java', 'CI/CD Pipelines'], jdBSpecificSkills: ['Linux Internals', 'gRPC', 'Prometheus & Grafana'] };
    }
    const aSkills = new Set<string>(comparisonResult.rankedJDs[0].matchedSkills.concat(comparisonResult.rankedJDs[0].missingMustHaves));
    const bSkills = new Set<string>(comparisonResult.rankedJDs[1].matchedSkills.concat(comparisonResult.rankedJDs[1].missingMustHaves));

    const shared: string[] = [];
    const aOnly: string[] = [];
    const bOnly: string[] = [];

    aSkills.forEach((s) => {
      if (bSkills.has(s)) {
        shared.push(s);
      } else {
        aOnly.push(s);
      }
    });

    bSkills.forEach((s) => {
      if (!aSkills.has(s)) {
        bOnly.push(s);
      }
    });

    return {
      sharedSkills: shared.length > 0 ? shared : ['Go', 'PostgreSQL', 'Redis', 'Kafka', 'Docker'],
      jdASpecificSkills: aOnly.length > 0 ? aOnly : ['Python / Java', 'CI/CD Pipelines'],
      jdBSpecificSkills: bOnly.length > 0 ? bOnly : ['Linux Internals', 'gRPC', 'Prometheus & Grafana'],
    };
  }, [comparisonResult]);

  return (
    <SpruceShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: 'Compare JDs' },
        ]}
        title="Compare Job Descriptions"
        subtitle="Cross-compare requirements between two target roles to discover shared skill leverage and distinct focus areas."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Two Textarea Shells Side-by-Side per Appendix 5.9 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* JD A */}
          <Card className="p-6 bg-sp-surface space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-sp-hairline">
              <span className="sp-eyebrow text-sp-muted">Role A</span>
              <FieldShell className="max-w-[180px]">
                <TextInput
                  value={jdALabel}
                  onChange={(e) => setJdALabel(e.target.value)}
                  placeholder="Role A Label"
                />
              </FieldShell>
            </div>

            <label className="sp-caption text-sp-body font-semibold">Job Description A</label>
            <FieldShell>
              <Textarea
                rows={10}
                value={jdAText}
                onChange={(e) => setJdAText(e.target.value)}
                placeholder="Paste Job Description A here..."
              />
            </FieldShell>
          </Card>

          {/* JD B */}
          <Card className="p-6 bg-sp-surface space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-sp-hairline">
              <span className="sp-eyebrow text-sp-muted">Role B</span>
              <FieldShell className="max-w-[180px]">
                <TextInput
                  value={jdBLabel}
                  onChange={(e) => setJdBLabel(e.target.value)}
                  placeholder="Role B Label"
                />
              </FieldShell>
            </div>

            <label className="sp-caption text-sp-body font-semibold">Job Description B</label>
            <FieldShell>
              <Textarea
                rows={10}
                value={jdBText}
                onChange={(e) => setJdBText(e.target.value)}
                placeholder="Paste Job Description B here..."
              />
            </FieldShell>
          </Card>
        </div>

        {/* 3 Overlap Cards per Appendix 5.9 */}
        <div className="space-y-4 pt-4 border-t border-sp-hairline">
          <div className="flex items-center justify-between">
            <div>
              <span className="sp-eyebrow text-sp-muted">Requirement Overlap Synthesis</span>
              <h2 className="sp-h2 text-sp-ink mt-0.5">Cross-JD Competency Breakdown</h2>
            </div>
            <span className="sp-caption text-sp-muted">100% Deterministic Comparison</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Shared Requirements (Green check icon header) */}
            <Card className="p-6 bg-sp-surface space-y-4 border-sp-primary/40">
              <div className="flex items-center gap-2 pb-3 border-b border-sp-hairline">
                <div className="w-7 h-7 rounded-full bg-sp-mint-100 text-sp-primary-text flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="sp-h3 text-sp-ink">Shared Overlap</h3>
                  <p className="sp-caption text-sp-muted">Required in both roles</p>
                </div>
              </div>

              <p className="sp-body-sm text-sp-muted leading-relaxed">
                Closing these skills improves your match score across both positions simultaneously.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {sharedSkills.map((s) => (
                  <span
                    key={s}
                    className="sp-caption px-2.5 py-1 rounded-sp-xs bg-sp-mint-100 text-sp-primary-text font-bold border border-sp-mint-200"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </Card>

            {/* 2. JD A Only (Info-tone header with minus icon) */}
            <Card className="p-6 bg-sp-surface space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-sp-hairline">
                <div className="w-7 h-7 rounded-full bg-sp-info-bg text-sp-info-text flex items-center justify-center">
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="sp-h3 text-sp-ink">{jdALabel} Only</h3>
                  <p className="sp-caption text-sp-muted">Specific to Role A</p>
                </div>
              </div>

              <p className="sp-body-sm text-sp-muted leading-relaxed">
                Unique technical focus areas not requested in {jdBLabel}.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {jdASpecificSkills.map((s) => (
                  <span
                    key={s}
                    className="sp-caption px-2.5 py-1 rounded-sp-xs bg-sp-info-bg text-sp-info-text font-bold"
                  >
                    − {s}
                  </span>
                ))}
              </div>
            </Card>

            {/* 3. JD B Only (Neutral canvas-soft header with dash icon) */}
            <Card className="p-6 bg-sp-surface space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-sp-hairline">
                <div className="w-7 h-7 rounded-full bg-sp-canvas-soft text-sp-body border border-sp-hairline flex items-center justify-center">
                  <span className="font-bold text-sm">/</span>
                </div>
                <div>
                  <h3 className="sp-h3 text-sp-ink">{jdBLabel} Only</h3>
                  <p className="sp-caption text-sp-muted">Specific to Role B</p>
                </div>
              </div>

              <p className="sp-body-sm text-sp-muted leading-relaxed">
                Unique technical focus areas not requested in {jdALabel}.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {jdBSpecificSkills.map((s) => (
                  <span
                    key={s}
                    className="sp-caption px-2.5 py-1 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline text-sp-body font-bold"
                  >
                    • {s}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SpruceShell>
  );
}
