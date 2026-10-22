import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Known mojibake character sequences resulting from double-encoded UTF-8 or CP437/Windows-1252 misinterpretation
const MOJIBAKE_PATTERNS = [
  /ΓÇ[öÖ£¥ó]/, // CP437 corrupted em-dash, curly quotes, bullets
  /Γû¬/,       // CP437 corrupted square bullet
  /ΓùÅ/,       // CP437 corrupted circle bullet
  /┬╖/,        // CP437 corrupted middot
  /Ã[©®¢£¥§°±²³µ¶·¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/, // Windows-1252 corrupted UTF-8
  /â€["'™œ]/,  // Windows-1252 corrupted quotes or dashes
  /\u00C3[\u0080-\u00BF]/, // Generic 2-byte double-encoded lead
];

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css']);
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.gemini']);

function collectFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, fileList);
    } else {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.has(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

describe('Stage 1A: Encoding Integrity & Mojibake Prevention', () => {
  const srcFiles = collectFiles(path.resolve(process.cwd(), 'src'));
  const docsFiles = collectFiles(path.resolve(process.cwd(), 'docs'));
  const allFiles = [...srcFiles, ...docsFiles];

  it('verifies src/ contains files and all are UTF-8 without BOM', () => {
    expect(srcFiles.length).toBeGreaterThan(10);

    for (const filePath of allFiles) {
      const buffer = fs.readFileSync(filePath);
      // UTF-8 BOM check: 0xEF, 0xBB, 0xBF
      const hasBOM = buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
      expect(hasBOM, `File has UTF-8 BOM: ${path.relative(process.cwd(), filePath)}`).toBe(false);
    }
  });

  it('scans src/ and docs/ for any mojibake sequences and asserts zero occurrences', () => {
    const violations: { file: string; line: number; text: string; pattern: string }[] = [];

    for (const filePath of allFiles) {
      // Skip this test file itself from self-matching regex literals
      if (filePath.includes('no-mojibake.test.ts')) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((lineText, idx) => {
        for (const pattern of MOJIBAKE_PATTERNS) {
          if (pattern.test(lineText)) {
            violations.push({
              file: path.relative(process.cwd(), filePath),
              line: idx + 1,
              text: lineText.trim().slice(0, 100),
              pattern: pattern.toString(),
            });
            break;
          }
        }
      });
    }

    if (violations.length > 0) {
      const formatted = violations
        .map((v) => `  ${v.file}:${v.line} matched ${v.pattern} -> "${v.text}"`)
        .join('\n');
      expect.fail(`Found ${violations.length} mojibake sequences:\n${formatted}`);
    }

    expect(violations).toHaveLength(0);
  });
});
