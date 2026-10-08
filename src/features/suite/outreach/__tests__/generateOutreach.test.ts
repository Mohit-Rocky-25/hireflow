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

  it('enforces LinkedIn Connection Request 300 char limit', () => {
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
      expect(msg.maxLength).toBe(300);
      expect(msg.charCount).toBeLessThanOrEqual(300);
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
    expect(all.length).toBe(15);

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
});
