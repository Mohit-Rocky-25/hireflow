import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SpruceShell } from '../../layout/SpruceShell';
import { PageHeader } from '../../layout/PageHeader';
import {
  Card,
  Button,
  Tile,
  ComparisonTable,
  StatusChip,
  MintPanel,
} from '../../ui';
import { Compass, Building2, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';
import { useProfile } from '../../../../features/suite/profile/ProfileContext';
import { getCandidateTierStatus } from '../../../../features/suite/integration/trajectory';

const TIER_CALIBRATION_DATA = [
  { tier: 'Tier 1 Product & HFT', companies: 'Google, Uber, Tower Research, Graviton', ctcRange: '₹35 - ₹65 LPA', experience: '0 - 2 Yrs', hiringBar: 'DSA Hard + Concurrency' },
  { tier: 'Tier 2 High-Growth Unicorns', companies: 'Razorpay, Swiggy, Cred, Flipkart', ctcRange: '₹18 - ₹32 LPA', experience: '0 - 2 Yrs', hiringBar: 'Production Projects + System Basics' },
  { tier: 'Tier 3 IT Services & MNCs', companies: 'TCS Digital, Infosys SP, Cognizant, Wipro', ctcRange: '₹7 - ₹12 LPA', experience: '0 - 1 Yrs', hiringBar: 'Aptitude + Core OOP Concepts' },
  { tier: 'Tier 4 IT Mass Hiring', companies: 'TCS Ninja, Infosys Ninja, Wipro Elite', ctcRange: '₹3.6 - ₹5 LPA', experience: '0 Yrs', hiringBar: 'Basic Coding + Communication' },
];

export function SpruceCareerPathHubPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const tierStatus = getCandidateTierStatus(profile);

  return (
    <SpruceShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: 'Career Trajectory' },
        ]}
        title="Career Trajectory & Growth Ladders"
        subtitle="Plan your career trajectory across Indian tech companies: real eligibility gates, fresher CTC in INR, and step-by-step promotion roadmaps."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Candidate Positioning Card if profile exists */}
        {tierStatus && (
          <MintPanel className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="sp-eyebrow text-sp-primary-text font-bold">Market Tier Positioning</span>
                <h3 className="sp-h2 text-sp-ink mt-0.5">
                  Calibrated for {tierStatus.currentTier || 'Campus Entry'}
                </h3>
                <p className="sp-body-sm text-sp-muted mt-1">
                  Based on your verified skills, projects, and educational credentials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/tools/career-path/dream-job-roadmap')}
                >
                  Simulate Promotion Jump →
                </Button>
              </div>
            </div>
          </MintPanel>
        )}

        {/* 2 Hub Sub-Pages as Tiles */}
        <div className="space-y-4">
          <h2 className="sp-h1 text-sp-ink">Career Planning Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="p-8 bg-sp-surface hover:border-sp-primary-text transition-colors cursor-pointer space-y-4"
              onClick={() => navigate('/tools/career-path/dream-job-roadmap')}
            >
              <div className="w-12 h-12 rounded-full bg-sp-mint-100 text-sp-primary-text flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>

              <div>
                <span className="sp-eyebrow text-sp-muted">Tool 1 • Student &amp; Fresher Focus</span>
                <h3 className="sp-h2 text-sp-ink mt-1">Dream Job Roadmap</h3>
                <p className="sp-body text-sp-body mt-2 leading-relaxed">
                  Step-by-step career pathway simulator. Enter your degree, target company, and current tier to generate a month-by-month study and application calendar.
                </p>
              </div>

              <div className="pt-4 border-t border-sp-hairline flex items-center justify-between">
                <span className="sp-caption text-sp-primary-text font-bold">
                  Includes Stepping Stone Roles
                </span>
                <Button variant="outline" size="sm">
                  Launch Roadmap →
                </Button>
              </div>
            </Card>

            <Card
              className="p-8 bg-sp-surface hover:border-sp-primary-text transition-colors cursor-pointer space-y-4"
              onClick={() => navigate('/tools/career-path/company-levels')}
            >
              <div className="w-12 h-12 rounded-full bg-sp-mint-100 text-sp-primary-text flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>

              <div>
                <span className="sp-eyebrow text-sp-muted">Tool 2 • Levels &amp; Compensation</span>
                <h3 className="sp-h2 text-sp-ink mt-1">Company Levels &amp; Compensation</h3>
                <p className="sp-body text-sp-body mt-2 leading-relaxed">
                  Canonical career ladder matrix across top India tech employers. Compare L3 to L7 titles, median tenure, base pay, and stock bonuses in INR.
                </p>
              </div>

              <div className="pt-4 border-t border-sp-hairline flex items-center justify-between">
                <span className="sp-caption text-sp-primary-text font-bold">
                  Strict India Office Ladders
                </span>
                <Button variant="outline" size="sm">
                  Explore Levels →
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Tier-Calibration ComparisonTable per Appendix 5.6 */}
        <div className="space-y-4">
          <div>
            <h2 className="sp-h1 text-sp-ink">India Tech Market Tier Benchmarks</h2>
            <p className="sp-body-sm text-sp-muted mt-1">
              Verified starting packages and evaluation criteria across enterprise hiring tiers.
            </p>
          </div>

          <Card className="p-6 bg-sp-surface">
            <ComparisonTable
              columns={[
                { key: 'tier', header: 'Market Tier' },
                { key: 'companies', header: 'Representative Employers' },
                {
                  key: 'ctcRange',
                  header: 'Fresher CTC (INR)',
                  render: (row) => (
                    <span className="font-semibold text-sp-primary-text tabular-nums">
                      {row.ctcRange}
                    </span>
                  ),
                },
                { key: 'experience', header: 'Typical Tenure' },
                { key: 'hiringBar', header: 'Interview Focus Bar' },
              ]}
              data={TIER_CALIBRATION_DATA}
              keyExtractor={(r) => r.tier}
            />
          </Card>
        </div>
      </div>
    </SpruceShell>
  );
}
