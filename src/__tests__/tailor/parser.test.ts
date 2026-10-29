// ============================================================
// HIREFLOW UNIT TESTS — RESUME & JOB PARSER
// Verifies entity extraction, CGPA/GPA recovery, and requirements segmentation
// ============================================================

import { describe, it, expect } from 'vitest';
import { parseResumeRawText, extractContactInfo } from '../../lib/tailor/parser/resumeParser';
import { parseJobDescription } from '../../lib/tailor/parser/jobParser';
import { DEMO_FRESHER_RESUME, DEMO_SOFTWARE_ENGINEER_JD } from '../../lib/tailor/store/fixtures';

describe('Resume Parser & Structure Recovery', () => {
  it('extracts contact information accurately', () => {
    const contact = extractContactInfo(DEMO_FRESHER_RESUME);
    expect(contact.email).toBe('fictional.candidate@example.org');
    expect(contact.phone).toBe('+91 9876543210');
    expect(contact.linkedin).toBe('linkedin.com/in/fictional-candidate');
    expect(contact.github).toBe('github.com/fictional-candidate');
    expect(contact.location).toBe('Bengaluru, India');
  });

  it('recovers education with degree, institution, and CGPA score', () => {
    const profile = parseResumeRawText(DEMO_FRESHER_RESUME, 'test_resume.pdf');
    expect(profile.fullName).toBe('FICTIONAL CANDIDATE A');
    expect(profile.education.length).toBeGreaterThan(0);

    const edu = profile.education[0];
    expect(edu.degree).toContain('B.Tech');
    expect(edu.institution).toContain('Vellore Institute of Technology');
    expect(edu.scoreType).toBe('CGPA');
    expect(edu.scoreValue).toBe('8.85/10');
  });

  it('recovers experience, projects, and categorizes technical skills', () => {
    const profile = parseResumeRawText(DEMO_FRESHER_RESUME, 'test_resume.pdf');
    expect(profile.experience.length).toBeGreaterThan(0);
    expect(profile.experience[0].company).toContain('NextGen Cloud Solutions');
    expect(profile.projects.length).toBeGreaterThan(0);
    expect(profile.projects[0].title).toContain('CareAlert');

    const allSkills = Object.values(profile.skills).flat();
    expect(allSkills).toContain('TypeScript');
    expect(allSkills).toContain('React');
    expect(allSkills).toContain('Docker');
    expect(allSkills).toContain('Python');
  });

  it('correctly classifies candidate archetype as student_fresher', () => {
    const profile = parseResumeRawText(DEMO_FRESHER_RESUME, 'test_resume.pdf');
    expect(profile.archetype).toBe('student_fresher');
  });
});

describe('Job Description Intelligence Parser', () => {
  it('segments job into title, company, and seniority', () => {
    const job = parseJobDescription(DEMO_SOFTWARE_ENGINEER_JD);
    expect(job.title).toContain('Software Engineer');
    expect(job.company).toBe('Razorpay');
    expect(job.seniority).toBe('mid');
  });

  it('categorizes requirements into Mandatory vs Preferred', () => {
    const job = parseJobDescription(DEMO_SOFTWARE_ENGINEER_JD);
    expect(job.requirements.length).toBeGreaterThan(0);

    const mandatory = job.requirements.filter(r => r.priority === 'MANDATORY');
    const preferred = job.requirements.filter(r => r.priority === 'PREFERRED');

    expect(mandatory.length).toBeGreaterThan(0);
    expect(preferred.length).toBeGreaterThan(0);
  });
});
