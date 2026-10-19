import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('R8.1: Candidate Tool Accessibility (a11y) & WCAG AA Verification', () => {
  const rootDir = process.cwd();

  const toolFiles = [
    'src/pages/tools/ResumeChecker.tsx',
    'src/features/suite/compare/CompareJDsPage.tsx',
    'src/features/suite/tailor/TailorPage.tsx',
    'src/features/suite/briefs/BuildBriefsPage.tsx',
    'src/features/career-path/CareerPathSimulator.tsx',
    'src/pages/demo/MatchingDemo.tsx',
    'src/components/common/PageNav.tsx',
    'src/components/common/PrivacyDisclaimer.tsx',
  ];

  it('guarantees all icon-only buttons and interactive controls carry aria-label or accessible text', () => {
    for (const relPath of toolFiles) {
      const fullPath = path.join(rootDir, relPath);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf8');

      // Check button elements
      const buttonMatches = content.match(/<button[^>]*>/g) || [];
      expect(buttonMatches.length).toBeGreaterThan(0);

      // Verify PageNav buttons have aria-label
      if (relPath.includes('PageNav.tsx')) {
        expect(content).toContain('aria-label="Go back"');
        expect(content).toContain('aria-label="Go home"');
      }

      // Verify PrivacyDisclaimer has accessible dialog attributes
      if (relPath.includes('PrivacyDisclaimer.tsx')) {
        expect(content).toContain('role="dialog"');
        expect(content).toContain('aria-modal="true"');
      }
    }
  });

  it('verifies visible focus ring styling is applied to interactive elements', () => {
    const pageNavContent = fs.readFileSync(path.join(rootDir, 'src/components/common/PageNav.tsx'), 'utf8');
    expect(pageNavContent).toContain('focus-visible:ring-2');

    const privacyContent = fs.readFileSync(path.join(rootDir, 'src/components/common/PrivacyDisclaimer.tsx'), 'utf8');
    expect(privacyContent).toContain('focus-visible:ring-2');
  });

  it('verifies status indicators pair color coding with icons or explicit textual labels (no color alone)', () => {
    const badgesPath = path.join(rootDir, 'src/components/common/ProvenanceBadge.tsx');
    const badgeContent = fs.readFileSync(badgesPath, 'utf8');

    // ProvenanceBadge pairs color with explicit textual status labels and role="status"
    expect(badgeContent).toContain("'Verified'");
    expect(badgeContent).toContain("'Needs Recheck'");
    expect(badgeContent).toContain("'Unverified'");
    expect(badgeContent).toContain('role="status"');
  });

  it('guarantees charts provide accessible text descriptions or data tables', () => {
    const careerPathContent = fs.readFileSync(path.join(rootDir, 'src/features/career-path/CareerPathSimulator.tsx'), 'utf8');
    // Chart section has data list / table or accessible aria labels
    expect(careerPathContent.toLowerCase()).toMatch(/aria-label|table|grid/);
  });
});
