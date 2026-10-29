import { describe, it, expect } from 'vitest';
import { matchJobRoleToProjects, JobRoleSkillItem } from '../engine/jobRoleProjectMatcher';

describe('Job Role Skill Blueprint & Project Brief Matcher Engine', () => {
  it('correctly partitions verified vs gap skills and identifies matching briefs', () => {
    const inputSkills: JobRoleSkillItem[] = [
      { name: 'Python', status: 'verified', isMandatory: true },
      { name: 'Docker', status: 'verified', isMandatory: false },
      { name: 'Apache Kafka', status: 'gap', isMandatory: true },
      { name: 'Redis', status: 'gap', isMandatory: false },
      { name: 'PostgreSQL', status: 'gap', isMandatory: true },
    ];

    const result = matchJobRoleToProjects({
      skills: inputSkills,
      roleTitle: 'Senior Backend Engineer',
      maxRecommendations: 3,
    });

    expect(result.totalRequired).toBe(5);
    expect(result.verifiedCount).toBe(2);
    expect(result.gapCount).toBe(3);
    expect(result.verifiedSkills).toEqual(['Python', 'Docker']);
    expect(result.gapSkills).toEqual(['Apache Kafka', 'Redis', 'PostgreSQL']);

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeLessThanOrEqual(3);

    // Assert that top recommendation covers at least one of the gaps
    const firstRec = result.recommendations[0];
    expect(firstRec.matchedGapSkills.length).toBeGreaterThan(0);
    expect(firstRec.hoursRange.min).toBeGreaterThan(0);
    expect(firstRec.interviewProofPoint.length).toBeGreaterThan(10);
  });

  it('runs greedy set-cover to maximize unique gap closure across recommendations', () => {
    const inputSkills: JobRoleSkillItem[] = [
      { name: 'GraphQL', status: 'gap', isMandatory: true },
      { name: 'WebSockets', status: 'gap', isMandatory: true },
      { name: 'React', status: 'verified', isMandatory: true },
    ];

    const result = matchJobRoleToProjects({
      skills: inputSkills,
      roleTitle: 'Full-Stack Developer',
      maxRecommendations: 4,
    });

    expect(result.gapSkills).toContain('GraphQL');
    expect(result.gapSkills).toContain('WebSockets');

    // All distinct gaps should be covered across chosen recommendations
    const coveredAcrossRecs = new Set(result.recommendations.flatMap((r) => r.matchedGapSkills));
    expect(coveredAcrossRecs.has('GraphQL')).toBe(true);
    expect(coveredAcrossRecs.has('WebSockets')).toBe(true);
  });

  it('handles zero gap profile gracefully by providing role-aligned capstones', () => {
    const inputSkills: JobRoleSkillItem[] = [
      { name: 'Go', status: 'verified', isMandatory: true },
      { name: 'Kubernetes', status: 'verified', isMandatory: true },
      { name: 'Docker', status: 'verified', isMandatory: true },
    ];

    const result = matchJobRoleToProjects({
      skills: inputSkills,
      roleTitle: 'Cloud Infrastructure Engineer',
      maxRecommendations: 2,
    });

    expect(result.gapCount).toBe(0);
    expect(result.verifiedCount).toBe(3);
    expect(result.allGapSkillsCovered).toBe(true);
    expect(result.recommendations.length).toBe(2);
    // Even with 0 gaps, top capstones are suggested
    expect(result.recommendations[0].brief.title.length).toBeGreaterThan(5);
  });
});

