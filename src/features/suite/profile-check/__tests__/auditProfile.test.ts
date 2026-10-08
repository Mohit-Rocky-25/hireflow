import { describe, it, expect } from 'vitest';
import {
  auditLinkedIn,
  auditGitHub,
  auditPublicProfiles,
  type LinkedInAuditInput,
  type GitHubAuditInput,
} from '../auditProfile';

describe('auditLinkedIn', () => {
  it('penalizes generic terms like "Aspiring" or "Student"', () => {
    const input: LinkedInAuditInput = {
      headline: 'Aspiring Software Engineer seeking opportunities',
      about: 'I am a student looking for jobs.',
      experience: 'Did some web development.',
      skills: 'JavaScript, HTML',
    };
    const res = auditLinkedIn(input);
    expect(res.headlineStatus).toBe('generic');
    expect(res.headlineScore).toBeLessThanOrEqual(5);
    expect(res.headlineCritique).toContain('Generic title detected');
    expect(res.actionItems.length).toBeGreaterThan(0);
  });

  it('awards full points for high-signal role, tech stack, and metric headline', () => {
    const input: LinkedInAuditInput = {
      headline: 'Software Engineer | React, TypeScript, Node.js | Scaled systems to 100k users',
      about: 'Full-stack engineer with 3+ years experience. Built microservices serving 50k requests/sec across AWS. Core stack: Go, TypeScript, PostgreSQL. Reach out at dev@example.com',
      experience: '- Architected distributed ingestion pipeline, reducing processing latency by 45%.\n- Led migration of 12 microservices with zero downtime.\n- Mentored 4 engineers and improved CI/CD pipeline.',
      skills: 'TypeScript, React, Node.js, Go, PostgreSQL, Docker, Kubernetes, AWS, Redis, GraphQL',
    };
    const res = auditLinkedIn(input);
    expect(res.headlineStatus).toBe('good');
    expect(res.headlineScore).toBe(25);
    expect(res.aboutElements.hasHook).toBe(true);
    expect(res.aboutElements.hasProofPoints).toBe(true);
    expect(res.aboutElements.hasTechStack).toBe(true);
    expect(res.aboutElements.hasCallToAction).toBe(true);
    expect(res.aboutScore).toBe(25);
    expect(res.experienceScore).toBe(25);
    expect(res.skillsScore).toBe(25);
    expect(res.score).toBe(100);
  });

  it('handles empty inputs deterministically with low score and helpful action items', () => {
    const res = auditLinkedIn({
      headline: '',
      about: '',
      experience: '',
      skills: '',
    });
    expect(res.headlineScore).toBe(0);
    expect(res.aboutScore).toBe(0);
    expect(res.score).toBeLessThan(30);
    expect(res.actionItems).toContain('Add a structured LinkedIn headline: Role | Stack | Key Achievement.');
  });
});

describe('auditGitHub', () => {
  it('evaluates repo hygiene checks: demo link, diagram, setup instructions, badges', () => {
    const input: GitHubAuditInput = {
      username: 'mohit',
      hasProfileReadme: true,
      commitVelocity: 'weekly',
      pinnedRepos: [
        {
          name: 'hireflow-engine',
          hasDemoLink: true,
          hasArchitectureDiagram: true,
          hasSetupInstructions: true,
          hasTechStackBadges: true,
        },
        {
          name: 'talent-roaster',
          hasDemoLink: false,
          hasArchitectureDiagram: false,
          hasSetupInstructions: true,
          hasTechStackBadges: false,
        },
      ],
    };
    const res = auditGitHub(input);
    expect(res.readmeSignals.length).toBe(2);
    expect(res.readmeSignals[0].score).toBe(100);
    expect(res.readmeSignals[1].missingChecks).toContain('Live demo link / deployed URL');
    expect(res.readmeSignals[1].missingChecks).toContain('Architecture diagram / system schema');
    expect(res.commitVelocityScore).toBe(25);
    expect(res.profileReadmeScore).toBe(30);
    expect(res.actionItems.length).toBeGreaterThan(0);
  });

  it('penalizes inactive velocity and missing profile readme', () => {
    const input: GitHubAuditInput = {
      username: 'inactive-dev',
      hasProfileReadme: false,
      commitVelocity: 'inactive',
      pinnedRepos: [],
    };
    const res = auditGitHub(input);
    expect(res.pinnedReposScore).toBe(5);
    expect(res.commitVelocityScore).toBe(5);
    expect(res.profileReadmeScore).toBe(5);
    expect(res.score).toBe(15);
    expect(res.actionItems).toContain('Pin 2 to 4 of your best engineering repositories on your GitHub profile.');
  });
});

describe('auditPublicProfiles', () => {
  it('computes combined 50/50 overall score and assigns proper grade and checklist', () => {
    const li: LinkedInAuditInput = {
      headline: 'Full Stack Engineer | React, Node.js | Shipped products',
      about: 'Building web apps. Reach out at me@dev.io',
      experience: '- Built app with 1k users',
      skills: 'React, Node, TypeScript, SQL',
    };
    const gh: GitHubAuditInput = {
      username: 'testdev',
      hasProfileReadme: true,
      commitVelocity: 'daily',
      pinnedRepos: [
        {
          name: 'app-one',
          hasDemoLink: true,
          hasArchitectureDiagram: true,
          hasSetupInstructions: true,
          hasTechStackBadges: true,
        },
      ],
    };

    const combined = auditPublicProfiles(li, gh);
    expect(combined.overallScore).toBeGreaterThanOrEqual(60);
    expect(['A', 'B', 'C', 'D']).toContain(combined.grade);
    expect(combined.checklist.length).toBe(7);
    expect(combined.checklist.some((c) => c.category === 'LinkedIn')).toBe(true);
    expect(combined.checklist.some((c) => c.category === 'GitHub')).toBe(true);
  });
});
