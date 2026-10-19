import { describe, it, expect } from 'vitest';
import { generateExamCalendarIcs } from '../../src/features/suite/credentials/calendarGenerator';
import { checkExamEligibility } from '../../src/features/suite/credentials/eligibilityChecker';

describe('D18: Credential Opportunity Engine Calendar & Eligibility (D18.1 - D18.5)', () => {
  describe('iCalendar (.ics) Generator', () => {
    it('generates compliant RFC 5545 calendar file with registration, exam, and milestone reminders', () => {
      const ics = generateExamCalendarIcs({
        examName: 'GATE 2027',
        examDate: '2027-02-14',
        registrationDeadline: '2026-10-12',
        admitCardDate: '2027-01-05',
        description: 'GATE Computer Science & Information Technology',
      });

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('GATE 2027 Examination');
      expect(ics).toContain('DTSTART;VALUE=DATE:20270214');
      expect(ics).toContain('Registration Deadline: GATE 2027');
      expect(ics).toContain('30-Day Sprint: GATE 2027');
      expect(ics).toContain('7-Day Final Review: GATE 2027');
      expect(ics).toContain('END:VCALENDAR');
    });
  });

  describe('Eligibility Checker', () => {
    it('verifies GATE eligibility for 3rd and final year engineering students', () => {
      const res = checkExamEligibility('gate', {
        degree: 'B.Tech',
        branch: 'Computer Science',
        graduationYear: 2027,
      });

      expect(res.eligible).toBe(true);
      expect(res.status).toBe('eligible');
      expect(res.reason).toContain('Eligible for GATE');
    });

    it('enforces ISRO ICRB strict degree and CGPA cutoffs (>= 6.84)', () => {
      const lowCgpa = checkExamEligibility('isro-icrb', {
        degree: 'B.Tech',
        branch: 'ECE',
        cgpaOrPercentage: 6.2,
      });
      expect(lowCgpa.eligible).toBe(false);
      expect(lowCgpa.status).toBe('ineligible');
      expect(lowCgpa.reason).toContain('below ISRO strict cutoff');

      const passing = checkExamEligibility('isro-icrb', {
        degree: 'B.Tech',
        branch: 'ECE',
        cgpaOrPercentage: 8.4,
      });
      expect(passing.eligible).toBe(true);
      expect(passing.status).toBe('eligible');
    });

    it('confirms open eligibility for industry cloud certs (AWS SAA)', () => {
      const res = checkExamEligibility('aws-saa', {});
      expect(res.eligible).toBe(true);
      expect(res.status).toBe('eligible');
    });
  });
});
