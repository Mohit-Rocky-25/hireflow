import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function getAllTsxFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllTsxFiles(fullPath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe('HireFloo Spruce: Codebase Linter & Architectural Isolation', () => {
  const spruceDir = path.resolve(__dirname);
  const tsxFiles = getAllTsxFiles(spruceDir);

  const bannedDesign1Classes = [
    'bg-volt',
    'text-volt',
    'border-volt',
    'bg-near-black',
    'border-charcoal',
    'text-silver',
    'text-pale-yellow',
    'border-olive-border',
  ];

  it('scans all Spruce TSX files and enforces zero hex colors and zero Design 1 classes', () => {
    // If no .tsx files yet in stage 1, test passes cleanly
    if (tsxFiles.length === 0) {
      expect(true).toBe(true);
      return;
    }

    const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;

    const violations: { file: string; line: number; reason: string }[] = [];

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((lineText, idx) => {
        const lineNum = idx + 1;

        // Skip comments
        const trimmed = lineText.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          return;
        }

        // Check for hex colors
        if (hexRegex.test(lineText)) {
          violations.push({
            file: path.relative(spruceDir, file),
            line: lineNum,
            reason: `Hex color detected: ${lineText.trim()}`,
          });
        }

        // Check for Design 1 classes
        for (const cls of bannedDesign1Classes) {
          if (lineText.includes(cls)) {
            violations.push({
              file: path.relative(spruceDir, file),
              line: lineNum,
              reason: `Banned Design 1 class "${cls}" detected: ${lineText.trim()}`,
            });
          }
        }

        // Check for forbidden cross-design imports
        if (
          lineText.includes("from '../design/'") ||
          lineText.includes("from '@/design/'") ||
          lineText.includes("from '../components/ui/Components'") ||
          lineText.includes("from '../../components/ui/Components'")
        ) {
          violations.push({
            file: path.relative(spruceDir, file),
            line: lineNum,
            reason: `Cross-design import detected: ${lineText.trim()}`,
          });
        }
      });
    }

    expect(
      violations,
      `Found ${violations.length} lint violations in Spruce components:\n${violations
        .map((v) => `  ${v.file}:${v.line} — ${v.reason}`)
        .join('\n')}`
    ).toEqual([]);
  });
});
