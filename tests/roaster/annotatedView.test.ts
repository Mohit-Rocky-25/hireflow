import { describe, it, expect } from 'vitest';
import { generateResumeAnnotations } from '../../src/features/ats/lib/annotateResume';

describe('D16: ATS Resume Roaster Annotated View (D16.1 - D16.4)', () => {
  it('annotates weak action verbs with red highlights and replacement suggestions', () => {
    const text = 'Helped build the web frontend and assisted senior engineers.';
    const annotations = generateResumeAnnotations(text);

    const weakVerbs = annotations.filter((a) => a.severity === 'red');
    expect(weakVerbs.length).toBe(2);
    expect(weakVerbs[0].text.toLowerCase()).toBe('helped');
    expect(weakVerbs[0].suggestedRewrite).toBeTruthy();
    expect(weakVerbs[1].text.toLowerCase()).toBe('assisted');
  });

  it('flags passive voice and run-on bullets with amber highlights', () => {
    const longBullet =
      'Was responsible for designing, implementing, configuring, maintaining, debugging, refactoring, deploying, testing, monitoring, benchmarking, documenting, optimizing, presenting, coordinating, evaluating, reviewing, and releasing the enterprise core financial payments ledger across thirty distributed server regions without any single outage.';
    const annotations = generateResumeAnnotations(longBullet);

    const amberSpans = annotations.filter((a) => a.severity === 'amber');
    expect(amberSpans.length).toBeGreaterThan(0);
    expect(amberSpans.some((a) => a.type === 'run_on_bullet')).toBe(true);
    expect(amberSpans.some((a) => a.type === 'passive_voice')).toBe(true);
  });

  it('highlights strong verbs, quantified metrics, and target skills in green', () => {
    const text = 'Architected distributed pipeline in Python, reducing p99 latency by 45% for 100k daily users.';
    const annotations = generateResumeAnnotations(text, ['Python', 'PostgreSQL']);

    const greenSpans = annotations.filter((a) => a.severity === 'green');
    expect(greenSpans.length).toBeGreaterThanOrEqual(3);

    const strongVerb = greenSpans.find((a) => a.type === 'strong_verb');
    expect(strongVerb?.text.toLowerCase()).toBe('architected');

    const metric = greenSpans.find((a) => a.type === 'quant_metric');
    expect(metric?.text).toContain('45%');

    const matchedSkill = greenSpans.find((a) => a.type === 'matched_skill');
    expect(matchedSkill?.text.toLowerCase()).toBe('python');
  });
});
