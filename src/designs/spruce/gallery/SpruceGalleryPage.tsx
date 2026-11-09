import React, { useState } from 'react';
import {
  Button,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Toggle,
  Card,
  Tile,
  MintPanel,
  MediaFrame,
  ExpertTip,
  StatBlock,
  StatChip,
  Eyebrow,
  EditorialBadge,
  AwardRibbon,
  CompareBadge,
  StatusChip,
  Tabs,
  CategoryRail,
  Accordion,
  AccordionItem,
  ComparisonTable,
  SpecGrid,
  SpecCell,
  Progress,
  HeroBand,
  Breadcrumb,
  Logo,
} from '../ui';
import { SpruceIllustrations } from '../illustrations';
import { useTheme } from '../theme';
import { Sun, Moon, LayoutGrid } from 'lucide-react';

export function SpruceGalleryPage() {
  const { mode, resolvedTheme, setMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('apps');
  const [toggleState, setToggleState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(true);

  const sampleColumns = [
    { key: 'role', header: 'Role Title' },
    { key: 'tier', header: 'Market Tier' },
    { key: 'ctc', header: 'Median CTC', isNumeric: true },
    { key: 'status', header: 'Status', render: (row: any) => <StatusChip status={row.status} /> },
  ];

  const sampleRows = [
    { role: 'Senior Distributed Systems Engineer', tier: 'Tier 1 Prime', ctc: '₹48,00,000', status: 'matched' as const },
    { role: 'Backend Platform Engineer', tier: 'Tier 2 Growth', ctc: '₹28,50,000', status: 'partial' as const },
    { role: 'DevSecOps & Cloud Architect', tier: 'Tier 1 Enterprise', ctc: '₹42,00,000', status: 'missing' as const },
  ];

  return (
    <div className="min-h-screen bg-sp-canvas text-sp-ink transition-colors pb-24">
      {/* Dev Header */}
      <header className="sticky top-0 z-40 bg-sp-surface border-b border-sp-hairline px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="sp-micro bg-sp-mint-100 text-sp-primary-text px-2 py-0.5 rounded-sp-sm font-mono font-bold">
            PRIMITIVE GALLERY (DEV ONLY)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="sp-caption text-sp-muted">Theme: {resolvedTheme}</span>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 mr-1.5" /> : <Moon className="w-4 h-4 mr-1.5" />}
            Toggle Theme
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Section: Typography & Badges */}
        <section className="space-y-4">
          <Eyebrow>Typography & Badges</Eyebrow>
          <div className="p-6 bg-sp-surface border border-sp-hairline-strong rounded-sp-lg space-y-6">
            <h1 className="sp-display-xl text-sp-ink">Display XL (52px / 44px / 34px)</h1>
            <h2 className="sp-display-lg text-sp-ink">Display LG (40px / 34px / 30px)</h2>
            <h3 className="sp-h1 text-sp-ink">Section Headline H1 (36px / 32px / 28px)</h3>
            <h4 className="sp-h2 text-sp-ink">Sub-section H2 (28px / 26px / 24px)</h4>
            <h5 className="sp-h3 text-sp-ink">Card Title H3 (20px)</h5>
            <p className="sp-body-lg text-sp-body">
              Body LG: A saturated spruce-green band drops to a calm canvas where dense tables do the real work.
            </p>
            <p className="sp-body text-sp-body">
              Body MD: Running copy, specification labels, and detailed career guidance descriptions.
            </p>
            <p className="sp-body-sm text-sp-muted">
              Body SM: Dense copy, table cells, disclosures, and character counts.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-sp-hairline">
              <StatusChip status="matched" label="Verified Match" />
              <StatusChip status="partial" label="Partial Evidence" />
              <StatusChip status="missing" label="Missing Skill" />
              <CompareBadge>Benchmark 94%</CompareBadge>
              <AwardRibbon label="Start Here" />
            </div>
          </div>
        </section>

        {/* Section: Buttons */}
        <section className="space-y-4">
          <Eyebrow>Buttons (All Variants & States)</Eyebrow>
          <div className="p-6 bg-sp-surface border border-sp-hairline-strong rounded-sp-lg flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline Action</Button>
            <Button variant="ghost">Ghost Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" loading>
              Loading Action
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </section>

        {/* Section: Form Controls */}
        <section className="space-y-4">
          <Eyebrow>Form Controls & Field Shells</Eyebrow>
          <div className="p-6 bg-sp-surface border border-sp-hairline-strong rounded-sp-lg grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput label="Target Role Title" placeholder="e.g. Staff Distributed Systems Engineer" />
            <TextInput
              label="Experience Level"
              defaultValue="Invalid Input"
              error="Experience must be a positive integer matching years."
            />
            <Select
              label="Market Tier Calibration"
              options={[
                { value: 'tier1', label: 'Tier 1 Prime Tech (₹35L - ₹65L)' },
                { value: 'tier2', label: 'Tier 2 High Growth (₹22L - ₹38L)' },
                { value: 'tier3', label: 'Tier 3 Enterprise & IT (₹10L - ₹20L)' },
              ]}
            />
            <div className="flex flex-col gap-4 justify-center">
              <Checkbox
                label="Include Remote Global Opportunities"
                sublabel="Calculates parity against SF & London benchmarks"
                checked={checkboxState}
                onChange={() => setCheckboxState(!checkboxState)}
              />
              <Toggle
                label="Strict Truth-Gate Verification"
                checked={toggleState}
                onChange={setToggleState}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Paste Resume Text"
                placeholder="Paste your raw text or Markdown resume content here..."
              />
            </div>
          </div>
        </section>

        {/* Section: Cards & Tiles */}
        <section className="space-y-4">
          <Eyebrow>Cards & Category Tiles</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Tile
              illustration={<SpruceIllustrations.resumeSheet />}
              title="ATS Resume Roaster"
              description="Calibrated scoring with zero hallucinated metrics or inflated percentages."
            />
            <Tile
              illustration={<SpruceIllustrations.target />}
              title="TalentLens Matcher"
              description="Multi-factor positioning across Tier 1, 2, and 3 enterprise roles."
              selected
            />
            <Tile
              illustration={<SpruceIllustrations.compass />}
              title="Career Trajectory"
              description="Predictive promotion and CTC growth models over a 10-year span."
            />
          </div>
        </section>

        {/* Section: Panels & Stat Blocks */}
        <section className="space-y-4">
          <Eyebrow>Stat Blocks & Mint Panels</Eyebrow>
          <MintPanel className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <StatBlock figure="86" label="Overall ATS Score" isScore withArrowMotif />
              <StatChip figure="147" label="Verified Roles" />
              <StatChip figure="100%" label="Zero-Egress Deterministic" />
              <StatChip figure="₹42L" label="Median Target CTC" />
            </div>

            <ExpertTip label="Harsh Truth Recruiter Insight">
              Recruiters spend an average of 6 seconds on initial screen. Your resume lists 14 technologies
              in the header with only 3 demonstrated in actual production projects.
            </ExpertTip>
          </MintPanel>
        </section>

        {/* Section: Comparison Table */}
        <section className="space-y-4">
          <Eyebrow>Comparison Table (Responsive Stacked on Mobile)</Eyebrow>
          <ComparisonTable
            columns={sampleColumns}
            data={sampleRows}
            keyExtractor={(r) => r.role}
          />
        </section>

        {/* Section: Spec Grid */}
        <section className="space-y-4">
          <Eyebrow>Spec Grid</Eyebrow>
          <div className="p-6 bg-sp-surface border border-sp-hairline rounded-sp-lg">
            <SpecGrid columns={4}>
              <SpecCell label="Direct Must-Have Match" value="92.4%" hint="8 of 9 skills present" />
              <SpecCell label="Evidence Density" value="High" hint="Metrics backed by git proof" />
              <SpecCell label="Seniority Calibration" value="Staff / L6" hint="10+ years verified" />
              <SpecCell label="Format Safety" value="100%" hint="Single column text safe" />
            </SpecGrid>
          </div>
        </section>
      </div>
    </div>
  );
}
