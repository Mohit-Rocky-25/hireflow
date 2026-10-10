import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { careers } from '../../careers-core';
import { getAllCompanies, getCompanyLadder } from '../../data/careerLadders';

describe('Careers Platform — Stage 3 Regression & Parity Verification', () => {
  const snapshotPath = path.resolve(process.cwd(), 'docs', 'careers', 'baseline-snapshot.json');
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));

  it('verifies all 56 companies exist in legacy careerLadders export', () => {
    const ladders = getAllCompanies();
    expect(ladders.length).toBe(56);

    const snapshotCompanyIds = snapshot.careerLadders.companies.map((c: any) => c.id.toLowerCase());
    for (const id of snapshotCompanyIds) {
      const found = ladders.find((l) => l.id.toLowerCase() === id);
      expect(found).toBeDefined();
    }
  });

  it('verifies G1 fix: levels now have resolved equivalenceGroup and YoE', () => {
    const googleLadder = getCompanyLadder('google');
    expect(googleLadder).toBeDefined();

    const l3 = googleLadder!.levels.find((l) => l.levelCode === 'L3');
    expect(l3).toBeDefined();
    expect(l3!.equivalenceGroup).toBe('L3_ENTRY');
    expect(l3!.yoeTypicalMin).toBeDefined();
    expect(l3!.yoeTypicalMin).toBeGreaterThanOrEqual(0);
  });

  it('verifies G2 fix: branch catalog contains canonical codes and durations', () => {
    const branches = careers.branches.list();
    expect(branches.length).toBeGreaterThanOrEqual(24);

    const cse = careers.branches.get('CSE');
    expect(cse).toBeDefined();
    expect(cse!.code).toBe('CSE');
    expect(cse!.programLengthYears).toBe(4);
    expect(cse!.defaultTrack).toBe('SWE');
    expect(cse!.family).toBe('software');

    const ece = careers.branches.get('ECE');
    expect(ece).toBeDefined();
    expect(ece!.family).toBe('electronics-embedded');
  });

  it('verifies careers.stats provides accurate unified totals', () => {
    const stats = careers.stats.counts();
    expect(stats.companies).toBe(56);
    expect(stats.levels).toBeGreaterThan(150);
    expect(stats.branches).toBeGreaterThanOrEqual(24);
    expect(stats.roles).toBeGreaterThan(500);
    expect(stats.competencies).toBe(19);
  });

  it('verifies idempotent and deterministic adapter calls', () => {
    const firstCall = getAllCompanies();
    const secondCall = getAllCompanies();
    expect(firstCall.length).toBe(secondCall.length);
    expect(firstCall[0].id).toBe(secondCall[0].id);
    expect(firstCall[0].levels.length).toBe(secondCall[0].levels.length);
  });
});
