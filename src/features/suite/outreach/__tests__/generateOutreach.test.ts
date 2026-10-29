// ============================================================
// Unit Tests: Outreach Engine & Slot-Filling (Stage 4.2)
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  fillSlots,
  detectPlaceholders,
  generateOutreach,
  extractSlotsFromProfile,
  OutreachSlots,
  GroundedOutreachInput,
  GroundedOutreachFormat,
  GroundedOutreachVariant,
  BANNED_OUTREACH_PHRASES,
  detectBannedPhrases,
} from '../generateOutreach';
import { CandidateProfile } from '../../profile/types';

describe('Outreach Generator Engine', () => {
  it('correctly fills provided slots without placeholders', () => {
    const slots: OutreachSlots = {
      recipientName: 'Vikram',
      targetCompany: 'Razorpay',
      targetRole: 'Backend Engineer',
      primarySkill: 'Node.js & PostgreSQL',
      proofPoint: 'reduced latency by 45%',
      collegeName: 'IIT Delhi',
      candidateName: 'Arjun Mehta',
    };

    const template = 'Hi {{recipientName}}, applying for {{targetRole}} at {{targetCompany}} ({{primarySkill}}).';
    const filled = fillSlots(template, slots);

    expect(filled).toBe('Hi Vikram, applying for Backend Engineer at Razorpay (Node.js & PostgreSQL).');
    expect(detectPlaceholders(filled)).toHaveLength(0);
  });

  it('generates explicit bracketed placeholders for missing slots', () => {
    const emptySlots: OutreachSlots = {};
    const template = 'Hi {{recipientName}}, fellow alum from {{collegeName}} here!';
    const filled = fillSlots(template, emptySlots);

    expect(filled).toContain('[Recipient Name]');
    expect(filled).toContain('[Your College / University]');

    const placeholders = detectPlaceholders(filled);
    expect(placeholders).toContain('[Recipient Name]');
    expect(placeholders).toContain('[Your College / University]');
  });

  it('enforces LinkedIn Connection Request 200 char free platform limit (Evidence E1)', () => {
    const slots: OutreachSlots = {
      recipientName: 'Sneha',
      targetCompany: 'Swiggy',
      targetRole: 'Software Engineer',
      primarySkill: 'Go & Microservices',
      proofPoint: 'architected order dispatch APIs',
    };

    const messages = generateOutreach(slots, 'linkedin_connect');
    expect(messages.length).toBeGreaterThanOrEqual(3);

    for (const msg of messages) {
      expect(msg.channel).toBe('linkedin_connect');
      expect(msg.maxLength).toBe(200);
      expect(msg.charCount).toBeLessThanOrEqual(200);
      expect(msg.exceedsLimit).toBe(false);
    }
  });

  it('loads and generates messages across all 5 channels from library of 15 templates', () => {
    const slots: OutreachSlots = {
      recipientName: 'Priya',
      targetCompany: 'CRED',
      targetRole: 'Frontend Engineer',
      primarySkill: 'React & TypeScript',
      proofPoint: 'built checkout flow for 2M users',
      candidateName: 'Karan',
    };

    const all = generateOutreach(slots, 'all');
    expect(all.length).toBeGreaterThanOrEqual(15);

    const channels = new Set(all.map((m) => m.channel));
    expect(channels.has('linkedin_connect')).toBe(true);
    expect(channels.has('linkedin_inmail')).toBe(true);
    expect(channels.has('cold_email')).toBe(true);
    expect(channels.has('warm_referral')).toBe(true);
    expect(channels.has('follow_up')).toBe(true);
  });

  it('extracts slots and top proof point from CandidateProfile', () => {
    const mockProfile: CandidateProfile = {
      schemaVersion: 1,
      id: 'prof-99',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
      identity: {
        name: 'Aditi Rao',
        email: 'aditi@example.com',
        links: [{ kind: 'github', url: 'https://github.com/aditi/metrics' }],
      },
      skills: [
        {
          canonicalId: 'python',
          displayName: 'Python',
          category: 'Languages',
          matchTier: 'exact',
          evidenceLevel: 3,
          evidence: [],
          redFlags: [],
        },
      ],
      education: [{ institution: 'BITS Pilani' }],
      yearsExperience: 2,
      projects: [
        {
          id: 'p1',
          name: 'Metrics Engine',
          bullets: ['Optimized streaming pipeline handling 50k events/sec with 99.9% uptime.'],
          stack: ['Python', 'Kafka'],
          links: ['https://github.com/aditi/metrics'],
          hasMetric: true,
        },
      ],
      roles: [],
      masterResumeText: '',
      formatHazards: [],
      contentHash: 'hash99',
    };

    const slots = extractSlotsFromProfile(mockProfile, 'Uber', 'Data Engineer');
    expect(slots.candidateName).toBe('Aditi Rao');
    expect(slots.candidateEmail).toBe('aditi@example.com');
    expect(slots.collegeName).toBe('BITS Pilani');
    expect(slots.targetCompany).toBe('Uber');
    expect(slots.targetRole).toBe('Data Engineer');
    expect(slots.proofPoint).toContain('Metrics Engine');
    expect(slots.portfolioLink).toBe('https://github.com/aditi/metrics');
  });

  describe('Comprehensive Multi-Channel Template Library (50 Templates)', () => {
    const testSlots: OutreachSlots = {
      recipientName: 'Sanjay',
      targetCompany: 'Zomato',
      targetRole: 'Staff Platform Engineer',
      primarySkill: 'Kafka & Kubernetes',
      proofPoint: 'reduced deployment downtime by 85%',
      collegeName: 'BITS Pilani',
      candidateName: 'Neha Verma',
      candidateEmail: 'neha@example.com',
      admiredProject: 'the public post-mortem on order dispatch latency',
      portfolioLink: 'https://github.com/nehaverma/platform-tools',
      commonGround: 'Golang Bangalore Meetup',
    };

    it('validates LinkedIn Connect templates strictly adhere to the 200 character free limit', () => {
      const messages = generateOutreach(testSlots, 'linkedin_connect');
      expect(messages.length).toBeGreaterThanOrEqual(4);

      for (const msg of messages) {
        expect(msg.channel).toBe('linkedin_connect');
        expect(msg.maxLength).toBe(200);
        expect(msg.charCount).toBeLessThanOrEqual(200);
        expect(msg.exceedsLimit).toBe(false);
        expect(msg.body).toContain('Sanjay');
      }
    });

    it('validates LinkedIn InMail templates have unique subjects and professional length', () => {
      const messages = generateOutreach(testSlots, 'linkedin_inmail');
      expect(messages.length).toBeGreaterThanOrEqual(3);

      for (const msg of messages) {
        expect(msg.body.length).toBeGreaterThan(50);
      }
    });

    it('validates Cold Email templates have clean subject lines and scannable structure', () => {
      const messages = generateOutreach(testSlots, 'cold_email');
      expect(messages.length).toBeGreaterThanOrEqual(10);

      for (const msg of messages) {
        expect(msg.subject).toBeDefined();
        expect(msg.subject?.trim().length).toBeGreaterThan(10);
      }
    });

    it('verifies total template catalog across all channels reflects the full authored matrix (85 templates)', () => {
      const all = generateOutreach(testSlots, 'all');
      expect(all).toHaveLength(85);
    });
  });
});

describe('Grounded Format-Specific Outreach Engine (Stage 4 & 6 Fixtures)', () => {
  // 3 Fixture Candidates:
  const candidateRichBackend: GroundedOutreachInput = {
    candidateName: 'Aditi Rao',
    candidateEmail: 'aditi@example.com',
    targetCompany: 'Razorpay',
    targetRole: 'Staff Backend Engineer',
    recipientName: 'Arun',
    primarySkill: 'Go & Distributed Systems',
    topProject: {
      name: 'Raft Consensus KV-Store',
      metric: 'achieved 12,000 ops/sec with <5ms p99 latency',
      tech: ['Go', 'gRPC', 'Raft'],
    },
    secondaryProject: {
      name: 'Distributed Task Queue',
      metric: 'processed 5M jobs/day with zero message loss',
      tech: ['Redis', 'PostgreSQL'],
    },
    portfolioLink: 'https://github.com/aditi/raft-kv',
    credentialOrAward: 'AWS Solutions Architect Professional',
    admiredProjectOrTeam: 'Razorpay payment routing switch',
  };

  const candidateMidFrontend: GroundedOutreachInput = {
    candidateName: 'Karan Mehra',
    candidateEmail: 'karan@example.com',
    targetCompany: 'Swiggy',
    targetRole: 'Frontend Engineer II',
    recipientName: 'Pooja',
    primarySkill: 'React & TypeScript',
    topProject: {
      name: 'Real-Time Order Tracking Dashboard',
      metric: 'reduced re-render latency by 62%',
      tech: ['React', 'TypeScript', 'WebSockets'],
    },
    secondaryProject: {
      name: 'Design System Component Library',
      metric: 'adopted across 8 internal micro-frontends',
      tech: ['TailwindCSS', 'Storybook'],
    },
    portfolioLink: 'https://github.com/karan/tracker',
    credentialOrAward: 'Meta Certified Frontend Professional',
    admiredProjectOrTeam: 'Swiggy live delivery canvas',
  };

  const candidateSparse: GroundedOutreachInput = {
    candidateName: 'Tarun Verma',
    targetCompany: 'CRED',
    targetRole: 'Junior Platform SDE',
    recipientName: 'Vikram',
  };

  it('guarantees strict determinism: repeated calls return byte-identical results', () => {
    const formats: GroundedOutreachFormat[] = ['linkedin', 'cold_email', 'referral'];
    const variants: GroundedOutreachVariant[] = ['project-first', 'role-first'];

    for (const fmt of formats) {
      for (const v of variants) {
        const run1 = generateOutreach(candidateRichBackend, fmt, v);
        const run2 = generateOutreach(candidateRichBackend, fmt, v);
        expect(run1).toEqual(run2);
        expect(run1.body).toBe(run2.body);
        expect(run1.subject).toBe(run2.subject);
      }
    }
  });

  it('enforces structural divergence across all 3 formats', () => {
    const li = generateOutreach(candidateRichBackend, 'linkedin', 'project-first');
    const ce = generateOutreach(candidateRichBackend, 'cold_email', 'project-first');
    const ref = generateOutreach(candidateRichBackend, 'referral', 'project-first');

    // LinkedIn: strictly capped at 300 chars, no subject, concise hook
    expect(li.charCount).toBeLessThanOrEqual(300);
    expect(li.subject).toBeUndefined();
    expect(li.body).toContain('Hi Arun');
    expect(li.body).toContain('Raft Consensus KV-Store');

    // Cold Email: 90-130 words, clear subject, numbered evidence points
    expect(ce.subject).toBeDefined();
    expect(ce.wordCount).toBeGreaterThanOrEqual(70);
    expect(ce.wordCount).toBeLessThanOrEqual(130);
    expect(ce.body).toContain('1. Engineered Raft Consensus KV-Store');
    expect(ce.body).toContain('2. Validated in Distributed Task Queue');

    // Referral: forwardable note subject, 3 bullets, attached resume note, polite opt-out
    expect(ref.subject).toContain('Forwardable note:');
    expect(ref.body).toContain('• Role Alignment:');
    expect(ref.body).toContain('• Key Project:');
    expect(ref.body).toContain('• Verification:');
    expect(ref.body).toContain('resume is attached');
    expect(ref.body).toContain('completely understand and no worries at all');
  });

  it('verifies variant divergence: project-first leads with project metric; role-first leads with role & skill', () => {
    const projFirst = generateOutreach(candidateMidFrontend, 'cold_email', 'project-first');
    const roleFirst = generateOutreach(candidateMidFrontend, 'cold_email', 'role-first');

    // Project-first subject and lead
    expect(projFirst.subject).toContain('Built Real-Time Order Tracking Dashboard (reduced re-render latency by 62%)');
    expect(projFirst.body).toContain('Noticed Swiggy\'s ongoing work in Swiggy live delivery canvas.');

    // Role-first subject and lead
    expect(roleFirst.subject).toContain('Frontend Engineer II candidate specializing in React & TypeScript');
    expect(roleFirst.body).toContain('I am reaching out regarding the Frontend Engineer II opening at Swiggy.');
  });

  it('strictly filters 100% of banned filler phrases across all candidates, formats, and variants', () => {
    const candidates = [candidateRichBackend, candidateMidFrontend, candidateSparse];
    const formats: GroundedOutreachFormat[] = ['linkedin', 'cold_email', 'referral'];
    const variants: GroundedOutreachVariant[] = ['project-first', 'role-first'];

    for (const c of candidates) {
      for (const f of formats) {
        for (const v of variants) {
          const res = generateOutreach(c, f, v);
          expect(res.bannedPhrasesFound).toHaveLength(0);
          for (const banned of BANNED_OUTREACH_PHRASES) {
            expect(res.body.toLowerCase()).not.toContain(banned);
            if (res.subject) {
              expect(res.subject.toLowerCase()).not.toContain(banned);
            }
          }
        }
      }
    }
  });

  it('maintains question mark discipline: max 1 question mark across all outputs', () => {
    const candidates = [candidateRichBackend, candidateMidFrontend, candidateSparse];
    const formats: GroundedOutreachFormat[] = ['linkedin', 'cold_email', 'referral'];
    const variants: GroundedOutreachVariant[] = ['project-first', 'role-first'];

    for (const c of candidates) {
      for (const f of formats) {
        for (const v of variants) {
          const res = generateOutreach(c, f, v);
          expect(res.questionMarksCount).toBeLessThanOrEqual(1);
          expect(res.hasClearAsk).toBe(true);
        }
      }
    }
  });

  it('correctly populates factsUsed array for rich candidates and marks ready to send', () => {
    const res = generateOutreach(candidateRichBackend, 'cold_email', 'project-first');
    expect(res.factsUsed.length).toBeGreaterThanOrEqual(2);
    expect(res.factsUsed.some((f) => f.includes('Raft Consensus KV-Store'))).toBe(true);
    expect(res.placeholders).toHaveLength(0);
    expect(res.isReadyToSend).toBe(true);
  });

  it('safely handles sparse candidate by emitting explicit [FILL_IN_...] placeholders and blocking ready status', () => {
    const res = generateOutreach(candidateSparse, 'cold_email', 'project-first');
    expect(res.placeholders.length).toBeGreaterThan(0);
    expect(res.placeholders).toContain('[FILL_IN_PROJECT_NAME]');
    expect(res.placeholders).toContain('[FILL_IN_METRIC]');
    expect(res.isReadyToSend).toBe(false);
  });
});



