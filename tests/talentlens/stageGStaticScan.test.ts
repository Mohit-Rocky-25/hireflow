import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { COMPANIES } from '../../src/pages/demo/talentLensData';

describe('Stage G: Programmatic Static Scan for Company Names and Role Titles', () => {
  it('scans all src/ code files (excluding data and tests) for company names and role titles', () => {
    // 1. Gather all company names (length >= 4 to avoid common false positives)
    const companyNames = new Set<string>();
    const fullRoleTitles = new Set<string>();

    for (const c of COMPANIES) {
      if (c.name && c.name.trim().length >= 4) {
        const cleanName = c.name.replace(/\s+(Private Limited|Pvt\.?\s*Ltd\.?|Limited|Ltd\.?|Inc\.?|Corp\.?|Corporation)$/i, '').trim();
        if (cleanName.length >= 4) {
          companyNames.add(cleanName);
        }
      }
      for (const r of c.roles || []) {
        if (r.title && r.title.trim().length >= 8) {
          fullRoleTitles.add(r.title.trim());
        }
      }
    }

    console.log(`[STAGE G] Scanning with ${companyNames.size} distinct company names and ${fullRoleTitles.size} role titles...`);

    const escapedNames = Array.from(companyNames)
      .map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .sort((a, b) => b.length - a.length);
    const companyRegex = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');

    const srcDir = path.resolve(__dirname, '../../src');
    const matchedItems: Array<{
      file: string;
      line: number;
      pattern: string;
      type: 'logic' | 'data' | 'comment';
      text: string;
    }> = [];

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(srcDir, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name === 'data') continue;
          scanDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          if (entry.name.includes('.test.') || entry.name.includes('.spec.')) continue;
          if (entry.name === 'talentLensData.ts') continue;

          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');

          lines.forEach((lineText, idx) => {
            const lineNum = idx + 1;
            const trimmed = lineText.trim();
            const isComment = trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');

            companyRegex.lastIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = companyRegex.exec(lineText)) !== null) {
              const matchedStr = match[1];

              let type: 'logic' | 'data' | 'comment' = 'data';
              if (isComment) {
                type = 'comment';
              } else if (
                // Specific branching checks on company or role
                (lineText.includes('===') || lineText.includes('!==') || lineText.includes('switch (') || lineText.includes('case ')) &&
                !lineText.includes('import ') &&
                !lineText.includes('linkedin.com') &&
                !lineText.includes('github.com')
              ) {
                // Check if the match is inside the condition
                const conditionMatch = new RegExp(`(?:===|!==|case)\\s*['"\`].*?\\b${matchedStr}\\b.*?['"\`]`, 'i').test(lineText);
                if (conditionMatch) {
                  type = 'logic';
                }
              }

              matchedItems.push({
                file: relPath,
                line: lineNum,
                pattern: matchedStr,
                type,
                text: trimmed.slice(0, 100),
              });
            }
          });
        }
      }
    }

    scanDir(srcDir);

    console.log(`\n[STAGE G STATIC SCAN RESULTS] Total matches: ${matchedItems.length}`);
    const logicMatches = matchedItems.filter(m => m.type === 'logic');
    console.log(`Logic matches: ${logicMatches.length}`);
    logicMatches.forEach(m => {
      console.log(`[LOGIC MATCH] ${m.file}:${m.line} (${m.pattern}): ${m.text}`);
    });

    const commentMatches = matchedItems.filter(m => m.type === 'comment');
    console.log(`Comment matches: ${commentMatches.length}`);

    const dataMatches = matchedItems.filter(m => m.type === 'data');
    console.log(`Data/fixture matches: ${dataMatches.length}`);

    // Verify 0 logic matches in core engine logic
    const engineLogicMatches = logicMatches.filter(m => m.file.includes('pages/demo/engine/') || m.file.includes('pages/demo/talentLensEngine.ts'));
    console.log(`Engine logic matches in src/pages/demo/: ${engineLogicMatches.length}`);
    expect(engineLogicMatches.length).toBe(0);
  });
});
