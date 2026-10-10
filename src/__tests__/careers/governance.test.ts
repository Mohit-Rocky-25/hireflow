import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Careers Platform Governance & "One Door" Import Enforcement', () => {
  it('verifies src/careers-core/ contains no UI imports in its pure data and api layers', () => {
    const coreDir = path.resolve(process.cwd(), 'src', 'careers-core');
    const pureDirs = ['api', 'data', 'derive', 'registry', 'schema'];

    for (const sub of pureDirs) {
      const fullPath = path.join(coreDir, sub);
      if (!fs.existsSync(fullPath)) continue;

      const files = fs.readdirSync(fullPath).filter((f) => f.endsWith('.ts'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(fullPath, file), 'utf-8');
        expect(content).not.toMatch(/from\s+['"]react['"]/);
        expect(content).not.toMatch(/from\s+['"]react-dom['"]/);
        expect(content).not.toMatch(/from\s+['"]lucide-react['"]/);
      }
    }
  });

  it('verifies public API exports the required standard surface', async () => {
    const { careers } = await import('../../careers-core');

    expect(careers.manifest).toBeTypeOf('function');
    expect(careers.companies).toBeDefined();
    expect(careers.companies.list).toBeTypeOf('function');
    expect(careers.companies.get).toBeTypeOf('function');
    expect(careers.companies.search).toBeTypeOf('function');
    expect(careers.companies.bySegment).toBeTypeOf('function');

    expect(careers.levels).toBeDefined();
    expect(careers.levels.forCompany).toBeTypeOf('function');
    expect(careers.levels.equivalence).toBeTypeOf('function');
    expect(careers.levels.matrix).toBeTypeOf('function');

    expect(careers.roles).toBeDefined();
    expect(careers.roles.query).toBeTypeOf('function');
    expect(careers.roles.get).toBeTypeOf('function');
    expect(careers.roles.forCompany).toBeTypeOf('function');

    expect(careers.programs).toBeDefined();
    expect(careers.programs.query).toBeTypeOf('function');
    expect(careers.programs.get).toBeTypeOf('function');
    expect(careers.programs.forCompany).toBeTypeOf('function');
    expect(careers.programs.forBranch).toBeTypeOf('function');

    expect(careers.eligibility).toBeDefined();
    expect(careers.eligibility.check).toBeTypeOf('function');
    expect(careers.eligibility.matrixFor).toBeTypeOf('function');

    expect(careers.trajectories).toBeDefined();
    expect(careers.trajectories.forProgram).toBeTypeOf('function');
    expect(careers.trajectories.forLevel).toBeTypeOf('function');
    expect(careers.trajectories.compare).toBeTypeOf('function');

    expect(careers.competencies).toBeDefined();
    expect(careers.competencies.forRole).toBeTypeOf('function');
    expect(careers.competencies.all).toBeTypeOf('function');

    expect(careers.keywords).toBeDefined();
    expect(careers.keywords.forRole).toBeTypeOf('function');

    expect(careers.branches).toBeDefined();
    expect(careers.branches.list).toBeTypeOf('function');
    expect(careers.branches.get).toBeTypeOf('function');
    expect(careers.branches.families).toBeTypeOf('function');

    expect(careers.stats).toBeDefined();
    expect(careers.stats.counts).toBeTypeOf('function');
    expect(careers.stats.coverage).toBeTypeOf('function');

    expect(careers.meta).toBeDefined();
    expect(careers.meta.forEntity).toBeTypeOf('function');

    expect(careers.search).toBeTypeOf('function');
    expect(careers.ext).toBeDefined();
    expect(careers.ext.register).toBeTypeOf('function');
    expect(careers.ext.get).toBeTypeOf('function');
    expect(careers.ext.set).toBeTypeOf('function');
  });
});
