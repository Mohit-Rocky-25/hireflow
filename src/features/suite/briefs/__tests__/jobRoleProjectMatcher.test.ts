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

  it('ensures all 3 to 4 recommended project options cover candidate gap skills (no empty gap cards)', () => {
    const inputSkills: JobRoleSkillItem[] = [
      { name: 'Java', status: 'verified' },
      { name: 'Spring Boot', status: 'verified' },
      { name: 'Kafka', status: 'gap', isMandatory: true },
      { name: 'Redis', status: 'gap', isMandatory: false },
      { name: 'Docker', status: 'gap', isMandatory: true },
    ];

    const result = matchJobRoleToProjects({
      skills: inputSkills,
      roleTitle: 'Senior Backend Engineer',
      maxRecommendations: 4,
    });

    expect(result.recommendations.length).toBe(4);

    // Every single recommendation option MUST cover candidate gaps!
    for (const rec of result.recommendations) {
      expect(rec.matchedGapSkills.length).toBeGreaterThan(0);
      expect(rec.pathLabel).toBeDefined();
      expect(rec.pathFocus).toBeDefined();
      expect(rec.coverageRatio).toBeGreaterThan(0);
    }
  });

  it('personalizes project recommendations for different candidate backgrounds with the same gaps', () => {
    const gaps: JobRoleSkillItem[] = [
      { name: 'Kafka', status: 'gap', isMandatory: true },
      { name: 'Redis', status: 'gap', isMandatory: false },
      { name: 'Docker', status: 'gap', isMandatory: true },
    ];

    // Candidate A knows Java / Spring
    const resultJava = matchJobRoleToProjects({
      skills: [
        { name: 'Java', status: 'verified' },
        { name: 'Spring Boot', status: 'verified' },
        ...gaps,
      ],
      roleTitle: 'Backend Engineer',
      maxRecommendations: 4,
    });

    // Candidate B knows Python / FastAPI
    const resultPython = matchJobRoleToProjects({
      skills: [
        { name: 'Python', status: 'verified' },
        { name: 'FastAPI', status: 'verified' },
        ...gaps,
      ],
      roleTitle: 'Backend Engineer',
      maxRecommendations: 4,
    });

    // Both candidates get 4 valid options
    expect(resultJava.recommendations.length).toBe(4);
    expect(resultPython.recommendations.length).toBe(4);

    // Candidate A's top recommendation aligns with Java / Spring
    const javaTop = resultJava.recommendations[0];
    const javaTech = (javaTop.brief.techStack || []).join(' ') + (javaTop.brief.coveredSkills || []).join(' ');
    expect(javaTech.toLowerCase()).toContain('java');

    // Candidate B's top recommendation aligns with Python
    const pythonTop = resultPython.recommendations[0];
    const pythonTech = (pythonTop.brief.techStack || []).join(' ') + (pythonTop.brief.coveredSkills || []).join(' ');
    expect(pythonTech.toLowerCase()).toContain('python');

    // Demonstrates non-repetitive, personalized matching across users
    expect(javaTop.brief.id).not.toBe(pythonTop.brief.id);
  });

  it('gives multiple distinct architectural options when a candidate has a single gap skill', () => {
    const inputSkills: JobRoleSkillItem[] = [
      { name: 'TypeScript', status: 'verified' },
      { name: 'Node.js', status: 'verified' },
      { name: 'Docker', status: 'gap', isMandatory: true },
    ];

    const result = matchJobRoleToProjects({
      skills: inputSkills,
      roleTitle: 'Backend Engineer',
      maxRecommendations: 4,
    });

    expect(result.recommendations.length).toBe(4);

    // All 4 options cover Docker
    for (const rec of result.recommendations) {
      expect(rec.matchedGapSkills).toContain('Docker');
    }

    // All 4 options are distinct briefs
    const uniqueIds = new Set(result.recommendations.map((r) => r.brief.id));
    expect(uniqueIds.size).toBe(4);
  });
});
