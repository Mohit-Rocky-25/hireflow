import React, { useState, useMemo } from 'react';
import { SpruceShell } from '../../layout/SpruceShell';
import { PageHeader } from '../../layout/PageHeader';
import {
  Card,
  Button,
  Tabs,
  StatusChip,
  FieldShell,
  TextInput,
  Textarea,
  Accordion,
} from '../../ui';
import {
  OutreachTemplateV2,
  OutreachSlotsV2,
} from '../../../../features/suite/outreach/types';
import { fitMessageToLength } from '../../../../features/suite/outreach/engine/lengthFit';
import { runQualityChecker } from '../../../../features/suite/outreach/engine/qualityChecker';
import templatesRaw from '../../../../data/suite/outreach/templates.json';
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Download,
} from 'lucide-react';

const ALL_TEMPLATES = templatesRaw as OutreachTemplateV2[];

const DEFAULT_SLOTS: OutreachSlotsV2 = {
  targetCompany: 'Razorpay',
  targetRole: 'Backend Engineering Intern',
  recipientName: 'Rahul Deshmukh',
  primarySkill: 'Go & PostgreSQL',
  admiredProject: 'the settlement reconciliation engine and public post-mortem',
  proofPoint: 'built Go distributed job queue handling 6,500 jobs/sec in reproducible benchmark',
  proofShort: 'built Go job queue (6.5k jobs/s)',
  college: 'National Institute of Technology Karnataka, Surathkal',
  portfolio: 'github.com/aarav-demo/pgqueue',
  followUpNewInfo: 'published reproducibility benchmarks and test harness',
  daysSince: 7,
  your_name: 'Aarav Menon',
  your_email: 'aarav.menon@example.com',
};

const CHANNELS = [
  { id: 'all', label: 'All Channels' },
  { id: 'linkedin_connect', label: 'LinkedIn Connect' },
  { id: 'linkedin_inmail', label: 'InMail' },
  { id: 'cold_email', label: 'Cold Email' },
  { id: 'warm_referral', label: 'Warm Referral' },
  { id: 'follow_up', label: 'Follow-Up' },
];

export function SpruceReachOutPage() {
  const [activeChannel, setActiveChannel] = useState<string>('linkedin_connect');
  const [isPremiumLinkedIn, setIsPremiumLinkedIn] = useState<boolean>(true);
  const [slots, setSlots] = useState<OutreachSlotsV2>(DEFAULT_SLOTS);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    ALL_TEMPLATES.find((t) => t.channel === 'linkedin_connect')?.id || ALL_TEMPLATES[0].id
  );
  const [variantIndex, setVariantIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSlotChange = (field: keyof OutreachSlotsV2, value: string) => {
    setSlots((prev) => ({ ...prev, [field]: value }));
  };

  const channelTemplates = useMemo(() => {
    if (activeChannel === 'all') return ALL_TEMPLATES;
    return ALL_TEMPLATES.filter((t) => t.channel === activeChannel);
  }, [activeChannel]);

  const selectedTemplate = useMemo(() => {
    return ALL_TEMPLATES.find((t) => t.id === selectedTemplateId) || channelTemplates[0] || ALL_TEMPLATES[0];
  }, [selectedTemplateId, channelTemplates]);

  const fitResult = useMemo(() => {
    return fitMessageToLength(selectedTemplate, slots, variantIndex, { isPremiumLinkedIn });
  }, [selectedTemplate, slots, isPremiumLinkedIn, variantIndex]);

  const charLimit = selectedTemplate.channel === 'linkedin_connect' ? (isPremiumLinkedIn ? 300 : 200) : fitResult.targetMax;

  const qualityFindings = useMemo(() => {
    return runQualityChecker({
      body: fitResult.body,
      channel: selectedTemplate.channel,
      relationship: selectedTemplate.relationship,
      maxLength: charLimit,
      proofPoint: slots.proofPoint,
      admiredProject: slots.admiredProject,
    });
  }, [selectedTemplate, slots, fitResult.body, charLimit]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fitResult.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isWithinLimit = fitResult.status === 'optimal' || fitResult.status === 'warning';

  return (
    <SpruceShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: 'Reach Out' },
        ]}
        title="Direct Outreach & Message Studio"
        subtitle="Calibrated cold outreach notes tailored for technical recruiters, engineering managers, and alumni referrals."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Channel Selection Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sp-hairline">
          <Tabs
            items={CHANNELS}
            activeId={activeChannel}
            onChange={(id) => {
              setActiveChannel(id);
              const firstInChannel = ALL_TEMPLATES.find((t) => id === 'all' || t.channel === id);
              if (firstInChannel) {
                setSelectedTemplateId(firstInChannel.id);
                setVariantIndex(0);
              }
            }}
          />

          {activeChannel === 'linkedin_connect' && (
            <div className="flex items-center gap-2">
              <span className="sp-caption text-sp-muted">Account Tier:</span>
              <button
                type="button"
                onClick={() => setIsPremiumLinkedIn(false)}
                className={`px-2.5 py-1 rounded-sp-xs sp-caption font-bold border transition-colors cursor-pointer ${
                  !isPremiumLinkedIn
                    ? 'bg-sp-primary text-sp-on-primary border-sp-primary'
                    : 'bg-sp-canvas-soft text-sp-ink border-sp-hairline'
                }`}
              >
                Free (200 Chars)
              </button>
              <button
                type="button"
                onClick={() => setIsPremiumLinkedIn(true)}
                className={`px-2.5 py-1 rounded-sp-xs sp-caption font-bold border transition-colors cursor-pointer ${
                  isPremiumLinkedIn
                    ? 'bg-sp-primary text-sp-on-primary border-sp-primary'
                    : 'bg-sp-canvas-soft text-sp-ink border-sp-hairline'
                }`}
              >
                Premium (300 Chars)
              </button>
            </div>
          )}
        </div>

        {/* 2-Column Grid: Left Inputs | Right Live Output Dock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Slots (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 bg-sp-surface space-y-5">
              <div className="pb-3 border-b border-sp-hairline">
                <span className="sp-eyebrow text-sp-muted">Recruiter & Project Details</span>
                <h3 className="sp-h3 text-sp-ink mt-0.5">Customise Message Slots</h3>
              </div>

              {/* 2-Column Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="sp-caption text-sp-body font-semibold">Recipient Name</label>
                  <FieldShell>
                    <TextInput
                      value={slots.recipientName}
                      onChange={(e) => handleSlotChange('recipientName', e.target.value)}
                      placeholder="e.g. Rahul Deshmukh"
                    />
                  </FieldShell>
                </div>

                <div className="space-y-1.5">
                  <label className="sp-caption text-sp-body font-semibold">Target Company</label>
                  <FieldShell>
                    <TextInput
                      value={slots.targetCompany}
                      onChange={(e) => handleSlotChange('targetCompany', e.target.value)}
                      placeholder="e.g. Razorpay"
                    />
                  </FieldShell>
                </div>

                <div className="space-y-1.5">
                  <label className="sp-caption text-sp-body font-semibold">Target Role</label>
                  <FieldShell>
                    <TextInput
                      value={slots.targetRole}
                      onChange={(e) => handleSlotChange('targetRole', e.target.value)}
                      placeholder="e.g. Backend Intern"
                    />
                  </FieldShell>
                </div>

                <div className="space-y-1.5">
                  <label className="sp-caption text-sp-body font-semibold">Primary Tech / Skill</label>
                  <FieldShell>
                    <TextInput
                      value={slots.primarySkill}
                      onChange={(e) => handleSlotChange('primarySkill', e.target.value)}
                      placeholder="e.g. Go & PostgreSQL"
                    />
                  </FieldShell>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="sp-caption text-sp-body font-semibold">Admired Public Work / Feature</label>
                <FieldShell>
                  <TextInput
                    value={slots.admiredProject}
                    onChange={(e) => handleSlotChange('admiredProject', e.target.value)}
                    placeholder="e.g. the settlement reconciliation engine architecture"
                  />
                </FieldShell>
              </div>

              <div className="space-y-1.5">
                <label className="sp-caption text-sp-body font-semibold">Proof Point / Quantified Metric</label>
                <FieldShell>
                  <Textarea
                    rows={2}
                    value={slots.proofPoint}
                    onChange={(e) => handleSlotChange('proofPoint', e.target.value)}
                    placeholder="e.g. built Go distributed job queue handling 6,500 jobs/sec in benchmark"
                  />
                </FieldShell>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="sp-caption text-sp-body font-semibold">Your Name</label>
                  <FieldShell>
                    <TextInput
                      value={slots.your_name}
                      onChange={(e) => handleSlotChange('your_name', e.target.value)}
                    />
                  </FieldShell>
                </div>
                <div className="space-y-1.5">
                  <label className="sp-caption text-sp-body font-semibold">Portfolio / GitHub Link</label>
                  <FieldShell>
                    <TextInput
                      value={slots.portfolio}
                      onChange={(e) => handleSlotChange('portfolio', e.target.value)}
                      placeholder="e.g. github.com/user/project"
                    />
                  </FieldShell>
                </div>
              </div>
            </Card>

            {/* Template Selector Accordion */}
            <Card className="p-6 bg-sp-surface space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sp-hairline">
                <span className="sp-eyebrow text-sp-muted">Available Archetypes</span>
                <span className="sp-caption text-sp-muted font-bold">
                  {channelTemplates.length} Templates
                </span>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {channelTemplates.map((template) => {
                  const isSelected = template.id === selectedTemplateId;
                  return (
                    <div
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        setVariantIndex(0);
                      }}
                      className={`p-3.5 rounded-sp-xs border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-2 border-sp-primary bg-sp-mint-50'
                          : 'border-sp-hairline hover:bg-sp-mint-50/50 bg-sp-surface'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="sp-ui-label text-sp-ink font-bold truncate">
                          {template.name}
                        </p>
                        <p className="sp-caption text-sp-muted mt-0.5 line-clamp-1">
                          {template.whenToUse}
                        </p>
                      </div>
                      <StatusChip
                        status={isSelected ? 'matched' : 'partial'}
                        label={template.goal}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column: Live Output Box & Fit Counter (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <Card className="p-6 bg-sp-surface space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sp-hairline">
                <div>
                  <span className="sp-eyebrow text-sp-muted">Live Output Canvas</span>
                  <h3 className="sp-h3 text-sp-ink mt-0.5">{selectedTemplate.name}</h3>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVariantIndex((v) => (v + 1) % 3)}
                  title="Cycle between deterministic phrasing variants"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Variant #{variantIndex + 1}
                </Button>
              </div>

              {/* Output Box per Appendix 5.3 */}
              <div className="relative bg-sp-canvas-soft border border-sp-hairline rounded-sp-lg p-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="absolute top-3 right-3 shadow-sp-3"
                  aria-label="Copy message text to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-sp-primary-text" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>

                <p className="sp-mono text-sp-ink text-sm leading-relaxed whitespace-pre-wrap pr-16 font-mono">
                  {fitResult.body}
                </p>
              </div>

              {/* Counter with StatusChip */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="sp-mono font-bold text-sp-ink">
                    {fitResult.charCount}
                  </span>
                  <span className="sp-caption text-sp-muted">
                    / {charLimit} chars
                  </span>
                </div>

                <StatusChip
                  status={isWithinLimit ? 'matched' : 'missing'}
                  label={isWithinLimit ? 'Within Safe Limits' : `+${fitResult.charCount - charLimit} Over Limit`}
                />
              </div>

              {/* Quality & Etiquette Checklist */}
              <div className="pt-4 border-t border-sp-hairline space-y-2.5">
                <span className="sp-caption text-sp-body font-bold">Message Quality Protocol</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-sp-body">
                    <ShieldCheck className="w-4 h-4 text-sp-primary-text shrink-0" />
                    <span>Zero spammy buzzwords or ungrounded claims</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-sp-body">
                    <ShieldCheck className="w-4 h-4 text-sp-primary-text shrink-0" />
                    <span>Grounded proof points &amp; verifiable public context</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-sp-body">
                    <ShieldCheck className="w-4 h-4 text-sp-primary-text shrink-0" />
                    <span>Respectful, no-pressure closing request</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SpruceShell>
  );
}
