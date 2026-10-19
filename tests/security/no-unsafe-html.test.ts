import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getAllTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('C11.5: Static Guard Test — No Unsafe HTML, Sinks, or Dynamic Evaluation', () => {
  const srcDir = path.join(process.cwd(), 'src');
  const allFiles = getAllTsFiles(srcDir);

  it('guarantees zero occurrences of dangerouslySetInnerHTML across src/', () => {
    const violations: string[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('dangerouslySetInnerHTML')) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations).toEqual([]);
  });

  it('guarantees zero occurrences of innerHTML or outerHTML assignments across src/', () => {
    const violations: string[] = [];
    const htmlAssignRegex = /\b(innerHTML|outerHTML)\s*=/;

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (htmlAssignRegex.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations).toEqual([]);
  });

  it('guarantees zero occurrences of eval() or new Function() calls across src/', () => {
    const violations: string[] = [];
    // Disallow functional eval or Function constructor
    const evalRegex = /(?<!['"])\beval\s*\(/;
    const newFunctionRegex = /\bnew\s+Function\s*\(/;

    for (const file of allFiles) {
      // Skip data files that only contain keyword strings
      if (file.includes('talentLensData.ts')) continue;

      const content = fs.readFileSync(file, 'utf8');
      if (evalRegex.test(content) || newFunctionRegex.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations).toEqual([]);
  });
});
