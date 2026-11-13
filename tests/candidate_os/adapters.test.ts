import { describe, it, expect } from 'vitest';
import { atsToAuditInput } from '@/features/ats/journalAdapter';
import { talentlensToAuditInput } from '@/features/talentlens/journalAdapter';
import { runAtsEngine } from '@/lib/ats';
import { analyzeRoleMatch } from '@/pages/demo/talentLensEngine';

describe('Stage 5: Journal Adapters', () => {
  const sampleResume = `Jane Doe
jane@example.com | 555-1234
Summary: Full stack developer with React, TypeScript, Node.js, and PostgreSQL experience.
Experience:
Software Engineer at Acme Corp (2022-2024)
- Built real-time dashboard using React and TypeScript serving 10,000 daily users.
- Optimized PostgreSQL queries reducing latency by 40%.
Projects:
Task Manager: Developed with React, Node.js and Docker.`;

  const sampleJd = `Role: Full Stack Engineer
Company: GlobalTech
Requirements:
- Must have 2+ years of React and TypeScript.
- Strong proficiency in Node.js and PostgreSQL.
- Experience with Docker is nice to have.`;

  it('maps ATS engine result to RecordAuditInput with valid breakdown and gaps', () => {
    const atsResult = runAtsEngine(sampleResume, sampleJd);
    expect(atsResult.success).toBe(true);

    const auditInput = atsToAuditInput({
      result: atsResult.result,
      resumeText: sampleResume,
      jdText: sampleJd,
      source: 'paste',
      targetCompany: 'GlobalTech',
      targetRole: 'Full Stack Engineer',
    });

    expect(auditInput.kind).toBe('ats_roast');
    expect(auditInput.overallScore).toBeGreaterThanOrEqual(0);
    expect(auditInput.overallScore).toBeLessThanOrEqual(100);
    expect(auditInput.breakdown.length).toBeGreaterThan(0);
    expect(auditInput.jd.company).toBe('GlobalTech');
    expect(auditInput.jd.roleTitle).toBe('Full Stack Engineer');
  });

  it('maps TalentLens engine result to RecordAuditInput with valid breakdown and gaps', () => {
    const company = { id: 'c-acme', name: 'Acme Corp', tier: 'Top Product', industry: 'Software' };
    const role = {
      title: 'Full Stack Engineer',
      level: 'Mid',
      desc: 'Looking for Full Stack Engineer with React and Node experience.',
      competencies: ['React', 'Node.js', 'PostgreSQL'],
      reqLevel: { React: 'strong', 'Node.js': 'working', PostgreSQL: 'working' },
    };

    const tlResult = analyzeRoleMatch(sampleResume, company, role);
    const auditInput = talentlensToAuditInput({
      result: tlResult,
      resumeText: sampleResume,
      jdText: role.desc,
      company,
      role,
    });

    expect(auditInput.kind).toBe('talentlens');
    expect(auditInput.overallScore).toBeGreaterThanOrEqual(0);
    expect(auditInput.overallScore).toBeLessThanOrEqual(100);
    expect(auditInput.breakdown.length).toBe(3);
    expect(auditInput.jd.company).toBe('Acme Corp');
    expect(auditInput.jd.roleTitle).toBe('Full Stack Engineer');
  });
});
