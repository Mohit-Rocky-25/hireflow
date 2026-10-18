import { describe, it, expect } from 'vitest';
import {
  bundleBriefsForGaps,
  ProjectBrief,
  getBriefHoursRange,
} from '../../src/features/suite/briefs/bundleBriefs';

describe('R7.7: Project Briefs Greedy Set-Cover Bundler', () => {
  const mockBriefs: ProjectBrief[] = [
    {
      id: 'brief-react-easy',
      title: 'React Dashboard',
      domain: 'Full-Stack Web',
      estimatedHours: 20,
      difficulty: 'beginner',
      coveredSkills: ['React', 'JavaScript'],
      problemStatement: 'Problem 1 statement with sufficient technical depth.',
      useCases: 'Use cases',
      problemItSolves: 'Solves UI latency',
      recruiterSignal: 'Demonstrates React components',
      architecture: 'Client SPA',
      scaleTargets: '100 DAU',
      techStack: ['React', 'JavaScript'],
      verificationRubric: ['Rubric 1'],
      portfolioBulletFormula: 'Built React dashboard',
    },
    {
      id: 'brief-react-hard',
      title: 'Distributed React Micro-Frontend',
      domain: 'Full-Stack Web',
      estimatedHours: 20,
      difficulty: 'advanced',
      coveredSkills: ['React', 'JavaScript'],
      problemStatement: 'Problem 2 statement with sufficient technical depth.',
      useCases: 'Use cases',
      problemItSolves: 'Solves MFE coordination',
      recruiterSignal: 'Demonstrates distributed microfrontends',
      architecture: 'Module federation',
      scaleTargets: '10k DAU',
      techStack: ['React', 'TypeScript'],
      verificationRubric: ['Rubric 2'],
      portfolioBulletFormula: 'Built MFE architecture',
    },
    {
      id: 'brief-node-redis',
      title: 'Node Redis Ingestion Queue',
      domain: 'Distributed Systems',
      estimatedHours: 30,
      difficulty: 'intermediate',
      coveredSkills: ['Node.js', 'Redis'],
      problemStatement: 'Problem 3 statement with sufficient technical depth.',
      useCases: 'Use cases',
      problemItSolves: 'Solves queue backlog',
      recruiterSignal: 'Demonstrates streaming queues',
      architecture: 'Event worker',
      scaleTargets: '10k QPS',
      techStack: ['Node.js', 'Redis'],
      verificationRubric: ['Rubric 3'],
      portfolioBulletFormula: 'Built Redis queue',
    },
    {
      id: 'brief-fullstack-combo',
      title: 'Fullstack Monolith',
      domain: 'Full-Stack Web',
      estimatedHours: 40,
      difficulty: 'intermediate',
      coveredSkills: ['React', 'Node.js', 'PostgreSQL'],
      problemStatement: 'Problem 4 statement with sufficient technical depth.',
      useCases: 'Use cases',
      problemItSolves: 'Solves fullstack coordination',
      recruiterSignal: 'Demonstrates multi-tier CRUD',
      architecture: 'Client-server',
      scaleTargets: '1k DAU',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      verificationRubric: ['Rubric 4'],
      portfolioBulletFormula: 'Built fullstack app',
    },
  ];

  it('handles empty input gracefully without claiming 100% gap coverage', () => {
    const result = bundleBriefsForGaps([], mockBriefs);
    expect(result.recommendedBriefs.length).toBeGreaterThan(0);
    expect(result.coveredSkills).toEqual([]);
    expect(result.uncoveredSkills).toEqual([]);
    expect(result.coveragePercentage).toBe(0); // Honest: no gaps requested = 0% coverage claim
  });

  it('selects briefs that maximize coverage of target gaps', () => {
    const result = bundleBriefsForGaps(['Node.js', 'Redis'], mockBriefs);
    expect(result.recommendedBriefs.some((b) => b.id === 'brief-node-redis')).toBe(true);
    expect(result.coveredSkills).toContain('Node.js');
    expect(result.coveredSkills).toContain('Redis');
    expect(result.uncoveredSkills).toEqual([]);
    expect(result.coveragePercentage).toBe(100);
  });

  it('breaks ties using lower difficulty (beginner < intermediate < advanced) when hours and coverage match', () => {
    // Both brief-react-easy and brief-react-hard cover ['React'], both 20 hours
    // Lower difficulty (beginner) must win over advanced
    const result = bundleBriefsForGaps(['React'], mockBriefs);
    expect(result.recommendedBriefs[0].id).toBe('brief-react-easy');
    expect(result.recommendedBriefs[0].difficulty).toBe('beginner');
  });

  it('respects maxBriefs cap and leaves remaining skills in uncoveredSkills', () => {
    const result = bundleBriefsForGaps(['React', 'Node.js', 'Redis', 'Python', 'Go', 'Docker'], mockBriefs, 1);
    expect(result.recommendedBriefs.length).toBe(1);
    expect(result.uncoveredSkills.length).toBeGreaterThan(0);
    expect(result.coveragePercentage).toBeLessThan(100);
  });

  it('derives estimated hours range as +/- 25% with explicit assumption (R7.5)', () => {
    const range = getBriefHoursRange(mockBriefs[0]);
    // 20 hours * 0.75 = 15, 20 hours * 1.25 = 25
    expect(range.min).toBe(15);
    expect(range.max).toBe(25);
    expect(range.label).toContain('15–25 h (estimate)');
    expect(range.assumption).toContain('Assumes foundational familiarity with React / JavaScript');
  });
});
