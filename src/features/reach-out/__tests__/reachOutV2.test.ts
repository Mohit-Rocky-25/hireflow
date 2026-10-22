// ============================================================
// Vitest Test Suite: Reach Out v2 (Stage 5 Compliance)
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  ALL_REACH_OUT_TEMPLATES,
  SCENARIO_GROUPS,
  getTemplateById,
  checkRecipientCompatibility,
} from '../data';
import {
  renderReachOutMessage,
  polishGrammar,
  validateProofPointMetrics,
} from '../engine/slotResolver';
import { BANNED_PHRASES, MUTED_CHANNEL_PALETTES, LINKEDIN_CONNECT_LIMITS } from '../engine/config';
import { ReachOutSlots } from '../types';

describe('Stage 5: Reach Out v2 Comprehensive Test Suite', () => {
  // ── 1. Catalog Count & Group Counts ────────────────────────
  it('has exactly 50 templates with unique IDs and exact group counts (4,4,4,3,5,5,4,4,4,5,4,4)', () => {
    expect(ALL_REACH_OUT_TEMPLATES).toHaveLength(50);

    const ids = ALL_REACH_OUT_TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(50);

    const expectedGroupCounts: Record<string, number> = {
      'first-touch-recruiters': 4,
      'first-touch-engineers': 4,
      'alumni-mutual-warm': 4,
      'follow-ups': 3,
      'startup-founder-direct': 5,
      'campus-fresher-programs': 5,
      'open-source-portfolio': 4,
      'events-community': 4,
      'referral-engine': 4,
      'interview-lifecycle': 5,
      'informational-chats': 4,
      're-engagement-replies': 4,
    };

    expect(SCENARIO_GROUPS).toHaveLength(12);

    for (const group of SCENARIO_GROUPS) {
      const templatesInGroup = ALL_REACH_OUT_TEMPLATES.filter((t) => t.group === group.id);
      expect(
        templatesInGroup.length,
        `Group ${group.id} count mismatch`
      ).toBe(expectedGroupCounts[group.id]);
      expect(group.count).toBe(expectedGroupCounts[group.id]);
    }
  });

  // ── 2. Schema Completeness ─────────────────────────────────
  it('ensures every template has all required schema fields populated and no empty altOpeners/subjects where required', () => {
    for (const t of ALL_REACH_OUT_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.group).toBeTruthy();
      expect(t.channel).toBeTruthy();
      expect(t.recipientTypes.length).toBeGreaterThan(0);
      expect(t.intent).toBeTruthy();
      expect(t.openingMove).toBeTruthy();
      expect(t.askType).toBeTruthy();
      expect(t.toneNote).toBeTruthy();
      expect(t.body).toBeTruthy();
      expect(t.whenToUse).toBeTruthy();
      expect(t.whenNotToUse).toBeTruthy();
      expect(t.sendWindowNote).toBeTruthy();
      expect(t.followUpNote).toBeTruthy();
      expect(t.riskNotes.length).toBeGreaterThan(0);
      expect(t.experienceFit.length).toBeGreaterThan(0);
      expect(t.roleFamilies).toBeTruthy();

      // Alt openers: 2-3 required
      expect(
        t.altOpeners.length,
        `Template ${t.id} must have 2-3 altOpeners`
      ).toBeGreaterThanOrEqual(2);

      // Subjects: required for emails and inmails
      if (t.channel === 'cold_email' || t.channel === 'linkedin_inmail') {
        expect(
          t.subjects && t.subjects.length >= 2,
          `Template ${t.id} (${t.channel}) must have at least 2 subjects`
        ).toBe(true);
      }
    }
  });

  // ── 3. Rendering Invariants across Input Profiles ──────────
  it('renders every template cleanly with (a) empty inputs, (b) typical inputs, and (c) worst-case long names without crashing, undefined, or stray {{ }}', () => {
    const emptySlots: ReachOutSlots = {};

    const typicalSlots: ReachOutSlots = {
      company: 'Razorpay',
      role: 'Backend Engineer',
      recipient_name: 'Priya Sharma',
      recipient_type: 'Recruiter',
      primary_skill: 'Node.js & PostgreSQL',
      proof_point: 'scaled payment APIs reducing latency by 45%',
      college: 'BITS Pilani',
      admired_project: 'UPI payment switch',
      portfolio: 'https://github.com/myname/portfolio',
      your_name: 'Arjun Mehta',
      your_email: 'arjun@example.com',
      batch_year: '2026',
      job_id: 'ENG-2026-908',
      days_since_last_contact: 6,
      availability_date: 'October 30',
      notice_period: 'Immediate',
      location_preference: 'Bengaluru',
      talk_topic: 'distributed event streaming',
      event_name: 'GopherCon India',
      interviewer_topic: 'idempotency keys and database sharding',
      specific_observation: 'checkout latency spike on 3G networks',
      what_changed: 'built and benchmarked an open-source task queue in Go',
      source_trigger: 'LinkedIn update',
      referrer_relationship: 'former project lead',
      pr_link: 'https://github.com/target/repo/pull/42',
    };

    const longSlots: ReachOutSlots = {
      company: 'International Business Infrastructure Corporation Private Limited',
      role: 'Senior Associate Distributed Cloud Platform Engineering Specialist',
      recipient_name: 'Dr. Christopher Subramaniam Ramachandran Venkatesh',
      recipient_type: 'Hiring Manager',
      primary_skill: 'Distributed Asynchronous Microservices & Kubernetes Orchestration Architecture',
      proof_point: 'refactored distributed transactional data consistency reducing tail P99 latency by 54.2% across 2,500,000 production transactions',
      college: 'National Institute of Technology Karnataka Surathkal',
      admired_project: 'Enterprise Multi-Region Geographically Replicated Event Mesh',
      portfolio: 'https://github.com/christopher-subramaniam-engineering/high-throughput-distributed-framework',
      your_name: 'Venkatasubramanian Ramakrishnan Sundaramurthy',
      your_email: 'venkatasubramanian.ramakrishnan.sundaramurthy@engineering.college.ac.in',
      batch_year: '2027',
      job_id: 'REQ-BLR-DIST-SYS-ENG-2026-009842',
      days_since_last_contact: 14,
      availability_date: 'November 15, 2026',
      notice_period: '30 Days Negotiable',
      location_preference: 'Bengaluru / Hyderabad / Remote',
      talk_topic: 'Fault Tolerant Distributed Ledger Architecture and Raft Consensus Protocol',
      event_name: 'International Conference on Distributed Computing and Networking 2026',
      interviewer_topic: 'optimistic concurrency control vs two-phase commit in geo-partitioned clusters',
      specific_observation: 'intermittent TCP connection resets during secondary replica failover',
      what_changed: 'completed multi-region active-active database replication benchmarking suite with 99.99% availability',
      source_trigger: 'Tech Leaders Podcast Episode 45',
      referrer_relationship: 'senior technical mentor and open-source co-maintainer',
      pr_link: 'https://github.com/target-corporation/enterprise-core-platform/pull/9842',
    };

    for (const t of ALL_REACH_OUT_TEMPLATES) {
      // (a) Empty inputs
      const resEmpty = renderReachOutMessage(t, emptySlots);
      expect(resEmpty.body).not.toContain('undefined');
      expect(resEmpty.body).not.toContain('null');
      expect(resEmpty.body).not.toMatch(/\{\{[a-zA-Z0-9_-]+\}\}/);
      expect(resEmpty.body).not.toMatch(/[ \t]{2,}/); // No double spaces

      // (b) Typical inputs
      const resTypical = renderReachOutMessage(t, typicalSlots);
      expect(resTypical.body).not.toContain('undefined');
      expect(resTypical.body).not.toMatch(/\{\{[a-zA-Z0-9_-]+\}\}/);
      expect(resTypical.body).not.toMatch(/\ba\s+[aeiouAEIOU]/); // No "a Engineer" grammar errors

      if (t.channel === 'linkedin_connect') {
        expect(
          resTypical.charCount,
          `Template ${t.id} exceeded 300 char LinkedIn limit with typical slots`
        ).toBeLessThanOrEqual(300);
      }

      // (c) Worst-case long inputs
      const resLong = renderReachOutMessage(t, longSlots);
      expect(resLong.body).not.toContain('undefined');
      expect(resLong.body).not.toMatch(/\{\{[a-zA-Z0-9_-]+\}\}/);
    }
  });

  // ── 4. Shingle-based 4-gram Jaccard Similarity (< 0.30) ────
  it('guarantees word 4-gram Jaccard similarity between any two template bodies is strictly below 0.30', () => {
    function get4GramShingles(text: string): Set<string> {
      // Clean tokens, lowercase, remove punctuation
      const words = text
        .toLowerCase()
        .replace(/\{\{[^}]+\}\}/g, 'SLOT')
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);

      const shingles = new Set<string>();
      for (let i = 0; i <= words.length - 4; i++) {
        shingles.add(`${words[i]} ${words[i + 1]} ${words[i + 2]} ${words[i + 3]}`);
      }
      return shingles;
    }

    function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
      if (setA.size === 0 || setB.size === 0) return 0;
      let intersection = 0;
      for (const item of setA) {
        if (setB.has(item)) intersection++;
      }
      const union = setA.size + setB.size - intersection;
      return union === 0 ? 0 : intersection / union;
    }

    const templateShingles = ALL_REACH_OUT_TEMPLATES.map((t) => ({
      id: t.id,
      shingles: get4GramShingles(t.body),
    }));

    const maxSimilarityViolation: { idA: string; idB: string; score: number }[] = [];

    for (let i = 0; i < templateShingles.length; i++) {
      for (let j = i + 1; j < templateShingles.length; j++) {
        const itemA = templateShingles[i];
        const itemB = templateShingles[j];
        const sim = jaccardSimilarity(itemA.shingles, itemB.shingles);
        if (sim >= 0.30) {
          maxSimilarityViolation.push({ idA: itemA.id, idB: itemB.id, score: sim });
        }
      }
    }

    if (maxSimilarityViolation.length > 0) {
      const details = maxSimilarityViolation
        .map((v) => `  ${v.idA} <-> ${v.idB}: ${(v.score * 100).toFixed(1)}%`)
        .join('\n');
      expect.fail(`Found template pairs with Jaccard similarity >= 0.30:\n${details}`);
    }

    expect(maxSimilarityViolation).toHaveLength(0);
  });

  // ── 5. Banned Phrases and Em Dash Test ──────────────────────
  it('asserts zero occurrences of banned phrases or em dashes in bodies, subjects, and altOpeners', () => {
    for (const t of ALL_REACH_OUT_TEMPLATES) {
      const allTexts = [t.body, ...(t.subjects || []), ...t.altOpeners];

      for (const str of allTexts) {
        // No em dashes
        expect(str, `Template ${t.id} contains em dash`).not.toMatch(/[—\u2014]/);

        // No emojis
        expect(str, `Template ${t.id} contains emoji`).not.toMatch(
          /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/
        );

        // No banned phrases
        const lower = str.toLowerCase();
        for (const banned of BANNED_PHRASES) {
          expect(lower, `Template ${t.id} contains banned phrase "${banned}"`).not.toContain(banned);
        }
      }
    }
  });

  // ── 6. Proof-Point Rules & Frequency ────────────────────────
  it('ensures proof point is used at most once per template, and at least 20 templates work without a proof point', () => {
    let withoutProofPointCount = 0;

    for (const t of ALL_REACH_OUT_TEMPLATES) {
      const matches = t.body.match(/\{\{proof_point\}\}/g) || [];
      expect(
        matches.length,
        `Template ${t.id} uses proof_point more than once (${matches.length})`
      ).toBeLessThanOrEqual(1);

      if (matches.length === 0) {
        withoutProofPointCount++;
      }
    }

    expect(
      withoutProofPointCount,
      `Expected at least 20 templates to work without a proof point, got ${withoutProofPointCount}`
    ).toBeGreaterThanOrEqual(20);
  });

  // ── 7. Compatibility Matrix & Safety Constraints ───────────
  it('enforces recipient compatibility matrix and gates referral asks against strangers', () => {
    // 1. Alumni template incompatible with Recruiter
    const alumniTemplate = getTemplateById('alumni-common-ground')!;
    const alumniCheck = checkRecipientCompatibility(alumniTemplate, 'Recruiter');
    expect(alumniCheck.isCompatible).toBe(false);
    expect(alumniCheck.reason).toContain('Alumnus');

    // 2. Referral templates require alumnus, mutual connection, or referrer
    const referralAskTemplate = getTemplateById('job-id-referral-ask-forwardable-fit')!;
    const recruiterReferralCheck = checkRecipientCompatibility(referralAskTemplate, 'Recruiter');
    expect(recruiterReferralCheck.isCompatible).toBe(false);

    // 3. Founder template incompatible with Campus Recruiter
    const founderTemplate = getTemplateById('founder-cold-email-product-obs')!;
    const campusCheck = checkRecipientCompatibility(founderTemplate, 'Campus Recruiter');
    expect(campusCheck.isCompatible).toBe(false);
  });

  // ── 8. Color Token WCAG AA Contrast Audit ──────────────────
  it('validates WCAG AA contrast ratio (>= 4.5:1) for all muted channel palette tokens', () => {
    function hexToRgb(hex: string): [number, number, number] {
      const cleaned = hex.replace('#', '');
      const num = parseInt(cleaned, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    function getLuminance([r, g, b]: [number, number, number]): number {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
      const lum1 = getLuminance(rgb1);
      const lum2 = getLuminance(rgb2);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      return (brightest + 0.05) / (darkest + 0.05);
    }

    const darkBgRgb: [number, number, number] = [20, 20, 20]; // #141414 surface-1

    for (const [channelKey, palette] of Object.entries(MUTED_CHANNEL_PALETTES)) {
      const textRgb = hexToRgb(palette.text);
      const contrast = getContrastRatio(textRgb, darkBgRgb);
      expect(
        contrast,
        `Channel ${channelKey} text color ${palette.text} failed WCAG AA (ratio: ${contrast.toFixed(2)}:1)`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  // ── 9. Proof-Point Metric Validation Function ──────────────
  it('warns when proof point has no numbers or metrics, passes when numbers exist', () => {
    const invalidProof = validateProofPointMetrics('worked hard on writing features and improving code');
    expect(invalidProof.isValid).toBe(false);
    expect(invalidProof.hasNumber).toBe(false);
    expect(invalidProof.warning).toBeDefined();

    const validProof = validateProofPointMetrics('scaled Redis cache cluster reducing latency by 45%');
    expect(validProof.isValid).toBe(true);
    expect(validProof.hasNumber).toBe(true);
  });
});
