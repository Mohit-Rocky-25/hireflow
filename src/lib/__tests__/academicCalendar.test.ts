// ============================================================
// Academic Calendar & Graduation Year Engine — Unit Test Suite
// Asserts verification table, edge dates, program durations, snapping
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  calculateYearOfStudy,
  getAcademicYearStart,
  getGraduationYearOptions,
  getProgramLength,
  snapToNearestGradYear,
} from '../academicCalendar';

describe('Academic Calendar & Graduation Year Engine', () => {
  const TODAY_OCTOBER = new Date('2026-10-07T10:00:00Z');

  describe('Program Duration Mapping', () => {
    it('correctly maps program lengths for various degrees', () => {
      expect(getProgramLength('B.Tech CSE')).toBe(4);
      expect(getProgramLength('B.E Electronics')).toBe(4);
      expect(getProgramLength('BCA')).toBe(3);
      expect(getProgramLength('B.Sc Data Science')).toBe(3);
      expect(getProgramLength('BBA Business Analytics')).toBe(3);
      expect(getProgramLength('Dual Degree (B.Tech + M.Tech)')).toBe(5);
      expect(getProgramLength('Integrated M.Tech')).toBe(5);
      expect(getProgramLength('B.Arch')).toBe(5);
      expect(getProgramLength('M.Tech')).toBe(2);
      expect(getProgramLength('MCA')).toBe(2);
      expect(getProgramLength('MBA')).toBe(2);
      expect(getProgramLength('M.Sc CS')).toBe(2);
    });
  });

  describe('Academic Year Start (S)', () => {
    it('returns current year if month is July or later (July to Dec)', () => {
      expect(getAcademicYearStart(new Date('2026-07-01T00:00:00Z'))).toBe(2026);
      expect(getAcademicYearStart(new Date('2026-10-07T00:00:00Z'))).toBe(2026);
      expect(getAcademicYearStart(new Date('2026-12-31T00:00:00Z'))).toBe(2026);
    });

    it('returns previous year if month is before July (Jan to June)', () => {
      expect(getAcademicYearStart(new Date('2027-01-15T00:00:00Z'))).toBe(2026);
      expect(getAcademicYearStart(new Date('2027-05-30T00:00:00Z'))).toBe(2026);
      expect(getAcademicYearStart(new Date('2027-06-30T00:00:00Z'))).toBe(2026);
    });
  });

  describe('Mandatory Verification Table (B.Tech 4-Year, today = 2026-10-07)', () => {
    // Expected table from specification:
    // 2026 -> Graduated
    // 2027 -> 4th (Final)
    // 2028 -> 3rd
    // 2029 -> 2nd
    // 2030 -> 1st
    it('calculates 2026 as Graduated', () => {
      const res = calculateYearOfStudy(2026, 'B.Tech', TODAY_OCTOBER);
      expect(res.status).toBe('graduated');
      expect(res.label).toBe('Graduated');
      expect(res.yearOfStudy).toBeGreaterThan(4);
    });

    it('calculates 2027 as 4th Year (Final Year)', () => {
      const res = calculateYearOfStudy(2027, 'B.Tech', TODAY_OCTOBER);
      expect(res.status).toBe('final');
      expect(res.label).toBe('Final Year');
      expect(res.yearOfStudy).toBe(4);
    });

    it('calculates 2028 as 3rd Year', () => {
      const res = calculateYearOfStudy(2028, 'B.Tech', TODAY_OCTOBER);
      expect(res.status).toBe('enrolled');
      expect(res.label).toBe('3rd Year');
      expect(res.yearOfStudy).toBe(3);
    });

    it('calculates 2029 as 2nd Year', () => {
      const res = calculateYearOfStudy(2029, 'B.Tech', TODAY_OCTOBER);
      expect(res.status).toBe('enrolled');
      expect(res.label).toBe('2nd Year');
      expect(res.yearOfStudy).toBe(2);
    });

    it('calculates 2030 as 1st Year', () => {
      const res = calculateYearOfStudy(2030, 'B.Tech', TODAY_OCTOBER);
      expect(res.status).toBe('enrolled');
      expect(res.label).toBe('1st Year');
      expect(res.yearOfStudy).toBe(1);
    });

    it('calculates 2031 as Incoming / Pre-college', () => {
      const res = calculateYearOfStudy(2031, 'B.Tech', TODAY_OCTOBER);
      expect(res.status).toBe('incoming');
      expect(res.label).toBe('Incoming / Pre-college');
      expect(res.yearOfStudy).toBeLessThan(1);
    });
  });

  describe('Edge Case: Mid-Year Transition Dates (January & June)', () => {
    it('in January 2027, 2027 grads are still in Final Year (academic year started July 2026)', () => {
      const jan2027 = new Date('2027-01-20T00:00:00Z');
      const res = calculateYearOfStudy(2027, 'B.Tech', jan2027);
      expect(res.status).toBe('final');
      expect(res.yearOfStudy).toBe(4);
    });

    it('in June 2027, 2027 grads are at end of Final Year before July semester reset', () => {
      const june2027 = new Date('2027-06-15T00:00:00Z');
      const res = calculateYearOfStudy(2027, 'B.Tech', june2027);
      expect(res.status).toBe('final');
      expect(res.yearOfStudy).toBe(4);
    });

    it('in July 2027, 2027 grads become Graduated and 2028 grads become Final Year', () => {
      const july2027 = new Date('2027-07-02T00:00:00Z');
      const grad2027 = calculateYearOfStudy(2027, 'B.Tech', july2027);
      expect(grad2027.status).toBe('graduated');

      const grad2028 = calculateYearOfStudy(2028, 'B.Tech', july2027);
      expect(grad2028.status).toBe('final');
      expect(grad2028.yearOfStudy).toBe(4);
    });
  });

  describe('Edge Case: 5-Year Dual Degree Programs', () => {
    it('computes 5-year progression correctly for Integrated M.Tech', () => {
      // S = 2026. S + 1 = 2027.
      // yearOfStudy = 5 - (gradYear - 2027)
      expect(calculateYearOfStudy(2027, 'Dual Degree', TODAY_OCTOBER).yearOfStudy).toBe(5);
      expect(calculateYearOfStudy(2027, 'Dual Degree', TODAY_OCTOBER).status).toBe('final');

      expect(calculateYearOfStudy(2028, 'Dual Degree', TODAY_OCTOBER).yearOfStudy).toBe(4);
      expect(calculateYearOfStudy(2028, 'Dual Degree', TODAY_OCTOBER).label).toBe('4th Year');

      expect(calculateYearOfStudy(2031, 'Dual Degree', TODAY_OCTOBER).yearOfStudy).toBe(1);
      expect(calculateYearOfStudy(2031, 'Dual Degree', TODAY_OCTOBER).label).toBe('1st Year');
    });
  });

  describe('Edge Case: 2-Year Postgraduate Programs (M.Tech / MCA / MBA)', () => {
    it('computes 2-year progression correctly', () => {
      // S = 2026. S + 1 = 2027.
      // yearOfStudy = 2 - (gradYear - 2027)
      const finalRes = calculateYearOfStudy(2027, 'M.Tech', TODAY_OCTOBER);
      expect(finalRes.yearOfStudy).toBe(2);
      expect(finalRes.status).toBe('final');

      const firstYear = calculateYearOfStudy(2028, 'M.Tech', TODAY_OCTOBER);
      expect(firstYear.yearOfStudy).toBe(1);
      expect(firstYear.label).toBe('1st Year');

      const gradRes = calculateYearOfStudy(2026, 'M.Tech', TODAY_OCTOBER);
      expect(gradRes.status).toBe('graduated');
    });
  });

  describe('Dynamic Options Generation & Snapping', () => {
    it('generates options dynamically with accurate derived labels', () => {
      const options = getGraduationYearOptions('B.Tech', TODAY_OCTOBER);
      expect(options.length).toBeGreaterThanOrEqual(5);

      const opt2029 = options.find((o) => o.gradYear === 2029);
      expect(opt2029?.label).toContain('2029 (2nd Year)');

      const opt2027 = options.find((o) => o.gradYear === 2027);
      expect(opt2027?.label).toContain('Final Year');
    });

    it('snaps out-of-range gradYear to nearest valid option when switching degree', () => {
      // Switching from 5-year Dual Degree (graduating 2031) to 2-year M.Tech (max grad 2029)
      const snapped = snapToNearestGradYear(2031, 'M.Tech', TODAY_OCTOBER);
      expect(snapped).toBeLessThanOrEqual(2029);
    });
  });
});
