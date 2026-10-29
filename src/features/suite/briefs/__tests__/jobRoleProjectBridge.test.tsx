import { describe, it, expect } from 'vitest';
import React from 'react';
import { JobRoleProjectBridge } from '../components/JobRoleProjectBridge';
import { matchJobRoleToProjects, JobRoleSkillItem } from '../engine/jobRoleProjectMatcher';

describe('JobRoleProjectBridge Component & Matcher Integration', () => {
  it('exports JobRoleProjectBridge as a valid React component function', () => {
    expect(JobRoleProjectBridge).toBeDefined();
    expect(typeof JobRoleProjectBridge).toBe('function');
  });

  it('renders a valid React element tree with proper props', () => {
    const skills: JobRoleSkillItem[] = [
      { name: 'Python', status: 'verified', isMandatory: true },
      { name: 'Docker', status: 'verified', isMandatory: false },
      { name: 'Apache Kafka', status: 'gap', isMandatory: true },
      { name: 'Redis', status: 'gap', isMandatory: false },
    ];

    const element = React.createElement(JobRoleProjectBridge, {
      skills,
      roleTitle: 'Distributed Systems Engineer',
    });

    expect(element).toBeDefined();
    expect(element.props.skills).toBe(skills);
    expect(element.props.roleTitle).toBe('Distributed Systems Engineer');
  });

  it('returns valid match recommendations for real role skills', () => {
    const skills: JobRoleSkillItem[] = [
      { name: 'Python', status: 'verified', isMandatory: true },
      { name: 'Docker', status: 'verified', isMandatory: false },
      { name: 'Apache Kafka', status: 'gap', isMandatory: true },
      { name: 'Redis', status: 'gap', isMandatory: false },
    ];

    const result = matchJobRoleToProjects({
      skills,
      roleTitle: 'Distributed Systems Engineer',
      maxRecommendations: 4,
    });

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0].brief.title).toBeTruthy();
    expect(result.recommendations[0].brief.domain).toBeTruthy();
    expect(result.recommendations[0].matchedGapSkills.length).toBeGreaterThan(0);
  });
});
