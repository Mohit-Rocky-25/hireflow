import { describe, expect, it } from 'vitest';
import { findSlopInTexts, humanizeEnum } from '@/lib/ui/copy';

describe('humanizeEnum', () => {
  it('turns shouty enums into readable labels', () => {
    expect(humanizeEnum('LINKEDIN_CONNECT')).toBe('LinkedIn connect');
    expect(humanizeEnum('COLD_EMAIL')).toBe('Cold email');
    expect(humanizeEnum('in_progress')).toBe('In progress');
    expect(humanizeEnum('ats_roast')).toBe('ATS roast');
    expect(humanizeEnum('build_brief')).toBe('Build brief');
    expect(humanizeEnum('addressed_pending_rescan')).toBe('Addressed pending rescan');
    expect(humanizeEnum('  ')).toBe('');
  });
});

describe('findSlopInTexts', () => {
  it('flags every problem visible in the current Candidate Hub screenshot', () => {
    const seen = ['LINKEDIN_CONNECT', 'COLD_EMAIL', '\u2014', 'Tamper-evident scans logged', 'Immutable event ledger of all scans',
      'Execution velocity', 'Peak benchmark', 'Candidate', 'demo-candidate-mohit@example.com'];
    const kinds = new Set(findSlopInTexts(seen).map((f) => f.kind));
    expect(kinds).toEqual(new Set(['raw_enum', 'bare_placeholder', 'banned_phrase', 'placeholder_identity']));
  });
  it('flags em dashes inside copy but not a hyphen or normal text', () => {
    expect(findSlopInTexts(['Scanned today \u2014 64 of 100']).map((f) => f.kind)).toEqual(['em_dash']);
    expect(findSlopInTexts(['Scanned today, 64 of 100', 'Cold email', 'LinkedIn connect', 'Candidate Hub', '64'])).toEqual([]);
  });
  it('ignores empty strings and does not flag ordinary acronyms', () => {
    expect(findSlopInTexts(['', '  ', 'ATS', 'JD', 'GSoC'])).toEqual([]);
  });
});

