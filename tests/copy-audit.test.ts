import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { BANNED_COPY_PHRASES } from '../src/config/wordlists';

function getFilesRecursively(dir: string, extensions: string[]): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        files.push(...getFilesRecursively(fullPath, extensions));
      }
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('R2.1: Copy Audit & Deceptive Phrase Detection', () => {
  it('guarantees no banned copy phrases appear in UI components or candidate tools', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const files = getFilesRecursively(srcDir, ['.tsx', '.ts']);

    const violations: { file: string; phrase: string; line: number }[] = [];

    for (const file of files) {
      // Exclude config definition and tests themselves
      if (
        file.endsWith('wordlists.ts') ||
        file.endsWith('copy-audit.test.ts') ||
        file.includes('__tests__')
      ) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      for (const phrase of BANNED_COPY_PHRASES) {
        lines.forEach((lineText, idx) => {
          if (lineText.toLowerCase().includes(phrase.toLowerCase())) {
            violations.push({
              file: path.relative(srcDir, file),
              phrase,
              line: idx + 1,
            });
          }
        });
      }
    }

    if (violations.length > 0) {
      console.error('Banned copy violations found:', violations);
    }
    expect(violations).toEqual([]);
  });
});
