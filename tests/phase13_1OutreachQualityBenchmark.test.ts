// ============================================================
// HireFlow — Phase 13.1 Outreach Content Quality Benchmark
// Deterministic 20-scenario evaluation across channels, intents,
// candidate stages, evidence provenance, and weak vs improved pairs.
// ============================================================

import { describe, it, expect } from 'vitest';
import templatesRaw from '../src/data/suite/outreach/templates.json';
import type { OutreachSlotsV2, OutreachTemplateV2 } from '../src/features/suite/outreach/types';
import { EMPTY_OUTREACH_SLOTS } from '../src/features/suite/outreach/types';
import { fitMessageToLength } from '../src/features/suite/outreach/engine/lengthFit';
import {
  evaluateFinalComposerText,
  resolveTemplatesForPurpose,
  scoreMessageQualityRubric,
  selectRelevantProofAndSkills,
  type CandidateEvidenceOption,
} from '../src/features/suite/outreach/engine/contextIntelligence';

const ALL_TEMPLATES = templatesRaw as OutreachTemplateV2[];

function makeSlots(overrides: Partial<OutreachSlotsV2>): OutreachSlotsV2 {
  return {
    ...EMPTY_OUTREACH_SLOTS,
    your_name: 'Riya Kulkarni',
    your_email: 'riya@example.com',
    recipientName: 'Kiran Mehta',
    targetCompany: 'Acme Systems',
    targetRole: 'Backend Engineer',
    primarySkill: 'Go, PostgreSQL',
    proofPoint: 'built Go worker queue handling 4,500 jobs/sec in local test',
    proofShort: 'Go worker queue (4.5k jobs/sec)',
    portfolio: 'github.com/riya-dev',
    ...overrides,
  };
}

describe('Phase 13.1 — Outreach Content Quality Benchmark & Intelligence Refinement', () => {
  it('separates Channel from Intent cleanly while resolving follow-up and referral templates', () => {
    const emailFollowUps = resolveTemplatesForPurpose(
      ALL_TEMPLATES,
      'cold_email',
      'conversation_follow_up'
    );
    expect(emailFollowUps.length).toBeGreaterThan(0);
    expect(emailFollowUps.some((t) => t.goal === 'G6')).toBe(true);

    const emailReferrals = resolveTemplatesForPurpose(ALL_TEMPLATES, 'cold_email', 'warm_referral');
    expect(emailReferrals.length).toBeGreaterThan(0);
    expect(emailReferrals.some((t) => t.goal === 'G2')).toBe(true);
  });

  it('selects relevant proof points by target role and trims long skill inventories to <= 3', () => {
    const candidate: CandidateEvidenceOption = {
      id: 'tailor:multi',
      kind: 'tailor',
      label: 'Tailor Draft: Backend',
      sourceSummary: 'Tailor Session + Candidate-Attested Project',
      provenance: 'candidate_attested',
      provenanceLabel: 'Candidate-Attested',
      primarySkill: 'React, CSS, HTML, Go, PostgreSQL, Redis, Docker',
      projectOptions: [
        {
          id: 'p-ui',
          title: 'Portfolio Landing Page',
          proofText: 'built responsive CSS portfolio site',
          shortText: 'Portfolio Landing Page',
          tech: 'React, CSS',
          provenance: 'candidate_attested',
        },
        {
          id: 'p-go',
          title: 'Distributed Task Queue',
          proofText: 'built Go and PostgreSQL worker queue processing 4,500 jobs/sec',
          shortText: 'Distributed Task Queue (4.5k jobs/sec)',
          tech: 'Go, PostgreSQL',
          provenance: 'candidate_attested',
        },
      ],
    };

    const selection = selectRelevantProofAndSkills(candidate, 'Backend Go Engineer', 'PostgreSQL queue');
    expect(selection.selectedProjects[0].id).toBe('p-go');
    expect(selection.proofPoint).toContain('4,500 jobs/sec');
    expect(selection.primarySkill.split(',').map((s) => s.trim()).length).toBeLessThanOrEqual(3);
    expect(selection.weakEvidence).toBe(false);
  });

  it('flags weak evidence honestly instead of fabricating proof', () => {
    const weakCandidate: CandidateEvidenceOption = {
      id: 'profile:empty',
      kind: 'profile',
      label: 'Empty Profile',
      sourceSummary: 'Minimal Profile',
      provenance: 'unconfirmed',
      provenanceLabel: 'Unconfirmed',
      projectOptions: [],
    };
    const selection = selectRelevantProofAndSkills(weakCandidate, 'Software Engineer');
    expect(selection.weakEvidence).toBe(true);
    expect(selection.proofPoint).toBe('');
  });

  it('runs 20-scenario deterministic benchmark and verifies improved messages score higher than weak baselines', () => {
    const scenarios = [
      { id: 'S01', tpl: 'recruiter-direct-note', purpose: 'recruiter_outreach' as const, rel: 'cold' as const, slots: makeSlots({}) },
      { id: 'S02', tpl: 'cold-email-scannable-pitch', purpose: 'recruiter_outreach' as const, rel: 'cold' as const, slots: makeSlots({ targetRole: 'Frontend Engineer', primarySkill: 'React, TypeScript', proofPoint: 'cut dashboard render latency by 45%' }) },
      { id: 'S03', tpl: 'cold-email-solutions-problem-solving', purpose: 'hiring_manager' as const, rel: 'cold' as const, slots: makeSlots({ admiredProject: 'distributed ledger ingestion' }) },
      { id: 'S04', tpl: 'peer-engineer-tech-convo', purpose: 'cold_intro' as const, rel: 'cold' as const, slots: makeSlots({ admiredProject: 'live order-tracking canvas' }) },
      { id: 'S05', tpl: 'mutual-connection-referral', purpose: 'warm_referral' as const, rel: 'warm' as const, slots: makeSlots({}) },
      { id: 'S06', tpl: 'referral-recommendation-team-lead', purpose: 'warm_referral' as const, rel: 'warm' as const, slots: makeSlots({}) },
      { id: 'S07', tpl: 'post-accept-recruiter-availability', purpose: 'recruiter_outreach' as const, rel: 'after-accept' as const, slots: makeSlots({}) },
      { id: 'S08', tpl: 'alumni-advice', purpose: 'alumni_networking' as const, rel: 'alumni' as const, slots: makeSlots({ college: 'NIT Pune' }) },
      { id: 'S09', tpl: 'gentle-follow-up', purpose: 'conversation_follow_up' as const, rel: 'previous-contact' as const, slots: makeSlots({ followUpNewInfo: 'shipped a benchmark suite cutting p95 latency by 30%', daysSinceLastContact: 7 }) },
      { id: 'S10', tpl: 'post-application-follow-up', purpose: 'post_application' as const, rel: 'cold' as const, slots: makeSlots({ followUpNewInfo: 'published open-source Go connection pool benchmark', daysSinceLastContact: 6 }) },
      { id: 'S11', tpl: 'hiring-manager-work-share', purpose: 'hiring_manager' as const, rel: 'cold' as const, slots: makeSlots({ admiredProject: 'payment idempotency service' }) },
      { id: 'S12', tpl: 'founder-early-team-note', purpose: 'cold_intro' as const, rel: 'cold' as const, slots: makeSlots({ targetRole: 'Founding Engineer', admiredProject: 'developer telemetry SDK' }) },
      { id: 'S13', tpl: 'alumni-warm-referral-ask', purpose: 'warm_referral' as const, rel: 'alumni' as const, slots: makeSlots({ college: 'BITS Pilani' }) },
      { id: 'S14', tpl: 'event-hackathon-follow-up', purpose: 'event_follow_up' as const, rel: 'previous-contact' as const, slots: makeSlots({ admiredProject: 'AI latency talk at GoConf' }) },
      { id: 'S15', tpl: 'post-coffee-chat-thank-you', purpose: 'thank_you' as const, rel: 'previous-contact' as const, slots: makeSlots({ admiredProject: 'database sharding discussion' }) },
      { id: 'S16', tpl: 'inmail-senior-engineer-coffee', purpose: 'alumni_networking' as const, rel: 'cold' as const, slots: makeSlots({ admiredProject: 'zero-downtime Postgres migration' }) },
      { id: 'S17', tpl: 'mid-career-platform-pitch', purpose: 'hiring_manager' as const, rel: 'cold' as const, slots: makeSlots({ targetRole: 'Staff Platform Engineer', primarySkill: 'Kubernetes, Go, Terraform', proofPoint: 'led multi-region failover reducing RTO from 40m to 4m' }) },
      { id: 'S18', tpl: 'career-switcher-bridge-note', purpose: 'recruiter_outreach' as const, rel: 'cold' as const, slots: makeSlots({ targetRole: 'Data Analyst', primarySkill: 'SQL, Python', proofPoint: 'built automated revenue reconciliation pipeline saving 12 hrs/week' }) },
      { id: 'S19', tpl: 'internship-return-follow-up', purpose: 'conversation_follow_up' as const, rel: 'previous-contact' as const, slots: makeSlots({ targetRole: 'Backend Intern', followUpNewInfo: 'completed distributed cache capstone with 99.4% cache hit ratio', daysSinceLastContact: 8 }) },
      { id: 'S20', tpl: 'portfolio-link-follow-up', purpose: 'conversation_follow_up' as const, rel: 'previous-contact' as const, slots: makeSlots({ followUpNewInfo: 'added live OpenAPI benchmark playground at github.com/riya-dev', daysSinceLastContact: 7 }) },
    ];

    expect(scenarios).toHaveLength(20);

    const results = scenarios.map((sc) => {
      const template = ALL_TEMPLATES.find((t) => t.id === sc.tpl) || ALL_TEMPLATES[0];
      const fit = fitMessageToLength(template, sc.slots, 0, { isPremiumLinkedIn: false });
      const evaluation = evaluateFinalComposerText({
        body: fit.body,
        subject: fit.subject,
        channel: template.channel,
        relationship: sc.rel,
        isPremiumLinkedIn: false,
        slots: sc.slots,
        requiredSlots: template.requiredSlots || [],
      });
      const rubric = scoreMessageQualityRubric({
        body: fit.body,
        subject: fit.subject,
        channel: template.channel,
        relationship: sc.rel,
        purpose: sc.purpose,
        slots: sc.slots,
        evaluation,
        provenance: 'candidate_attested',
      });
      return { id: sc.id, tpl: template.id, canCopyOrExport: evaluation.canCopyOrExport, rubric };
    });

    for (const r of results) {
      expect(r.rubric.factualIntegrity).toBeGreaterThanOrEqual(4);
      expect(r.rubric.naturalHumanLanguage).toBeGreaterThanOrEqual(4);
      expect(r.rubric.overallScore).toBeGreaterThanOrEqual(3.8);
    }

    // Weak vs Improved comparison: cliche + unverified hiring assumption scores strictly lower
    const weakBody =
      'Hi Kiran, I hope this email finds you well! Saw Acme Systems is actively recruiting for Backend Engineer roles. Please find attached my resume.';
    const weakEval = evaluateFinalComposerText({
      body: weakBody,
      subject: 'Job application',
      channel: 'cold_email',
      relationship: 'cold',
      isPremiumLinkedIn: false,
      slots: makeSlots({ proofPoint: '', proofShort: '' }),
      requiredSlots: ['targetCompany', 'recipientName'],
    });
    const weakRubric = scoreMessageQualityRubric({
      body: weakBody,
      subject: 'Job application',
      channel: 'cold_email',
      relationship: 'cold',
      purpose: 'recruiter_outreach',
      slots: makeSlots({ proofPoint: '', proofShort: '' }),
      evaluation: weakEval,
      provenance: 'unconfirmed',
    });

    expect(weakRubric.overallScore).toBeLessThan(results[1].rubric.overallScore);
    expect(weakRubric.factualIntegrity).toBeLessThanOrEqual(3);
  });
});
