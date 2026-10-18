import { describe, it, expect } from 'vitest';
import { auditWritingQuality } from '../../src/engine/roaster/writingRules';

describe('R5.2: Writing & Evidence Rules Acceptance Tests', () => {
  it('detects weak openers and recommends question-based improvements', () => {
    const sections = [
      {
        name: 'Experience',
        content: '- Worked on backend APIs using Node.js.\n- Helped with database design in PostgreSQL.',
      },
    ];

    const { findings } = auditWritingQuality(sections);
    const weakOpeners = findings.filter((f) => f.ruleId === 'weak_opener');

    expect(weakOpeners.length).toBe(2);
    expect(weakOpeners[0].fixQuestion).toContain('What specific engineering action did you take');
    // Non-negotiable principle P-1: fixQuestion must be a question, never an invented metric
    expect(weakOpeners[0].fixQuestion.endsWith('?')).toBe(true);
    expect(weakOpeners[0].fixQuestion).not.toContain('40%');
  });

  it('detects passive voice phrasing', () => {
    const sections = [
      {
        name: 'Projects',
        content: '- The distributed cache was built by me using Go and Redis.',
      },
    ];

    const { findings } = auditWritingQuality(sections);
    const passiveFindings = findings.filter((f) => f.ruleId === 'passive_voice');
    expect(passiveFindings.length).toBe(1);
    expect(passiveFindings[0].fixQuestion.endsWith('?')).toBe(true);
  });

  it('flags technical bullets lacking quantified outcome metrics with a prompting question', () => {
    const sections = [
      {
        name: 'Projects',
        content: '- Implemented authentication service in Go and Docker.',
      },
    ];

    const { findings } = auditWritingQuality(sections);
    const missingMetric = findings.find((f) => f.ruleId === 'missing_metric');

    expect(missingMetric).toBeDefined();
    expect(missingMetric?.fixQuestion).toContain('How many users, records, requests');
    expect(missingMetric?.fixQuestion.endsWith('?')).toBe(true);
  });

  it('detects first-person pronouns (I, me, my, we)', () => {
    const sections = [
      {
        name: 'Experience',
        content: '- In my role, I maintained the React frontend components.',
      },
    ];

    const { findings } = auditWritingQuality(sections);
    const pronounFindings = findings.filter((f) => f.ruleId === 'first_person_pronoun');
    expect(pronounFindings.length).toBeGreaterThanOrEqual(1);
  });

  it('flags vague fluff personality buzzwords', () => {
    const sections = [
      {
        name: 'Summary',
        content: '- Passionate, dynamic, hard-working go-getter and quick learner.',
      },
    ];

    const { findings } = auditWritingQuality(sections);
    const fluffFindings = findings.filter((f) => f.ruleId === 'fluff_buzzword');
    expect(fluffFindings.length).toBeGreaterThanOrEqual(3);
  });

  it('flags repeated opening verbs used 3 or more times', () => {
    const sections = [
      {
        name: 'Experience',
        content: [
          '- Built customer onboarding flow in React.',
          '- Built notification service using WebSockets.',
          '- Built automated CI/CD pipeline with GitHub Actions.',
        ].join('\n'),
      },
    ];

    const { findings } = auditWritingQuality(sections);
    const repeated = findings.find((f) => f.ruleId === 'repeated_opener');
    expect(repeated).toBeDefined();
    expect(repeated?.spanText).toContain('Started 3 bullets with "built"');
  });

  it('flags over-long skills lists with little demonstrated evidence (R5.2)', () => {
    const sections = [
      {
        name: 'Technical Skills',
        content: 'Languages & Tools: Python, Java, C++, Go, Rust, Ruby, PHP, Swift, Kotlin, Dart, JavaScript, TypeScript, React, Angular, Vue, Next.js, Node.js, Django, Flask, FastAPI, Spring Boot, Docker, Kubernetes',
      },
      {
        name: 'Projects',
        content: '- Single basic calculator script in Python.',
      },
    ];

    const { findings } = auditWritingQuality(sections);
    const overlong = findings.find((f) => f.ruleId === 'unsupported_skills_list');
    expect(overlong).toBeDefined();
    expect(overlong?.message).toContain('skills, but your project bullets only demonstrate evidence');
  });
});
