// ============================================================
// Pathways UI Component & Architecture Test Suite
// Verifies Wireframes C13, Microcopy C14, Zero Math E6, and Feature Routing
// ============================================================

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { FEATURES, PATHWAYS_NAME } from '../../src/config';
import { checkUiMath } from '../../scripts/pathways/check-ui-math.mjs';

describe('Pathways UI Layer & Wireframes Verification (Stage S10)', () => {
  const rootDir = process.cwd();

  const pathwaysPages = [
    'src/pathways/pages/PathwaysRadarPage.tsx',
    'src/pathways/pages/ProgramDetailPage.tsx',
    'src/pathways/pages/ActionPlanPage.tsx',
    'src/pathways/pages/OfferEvaluatorPage.tsx',
    'src/pathways/pages/AboutDataPage.tsx'
  ];

  const pathwaysComponents = [
    'src/pathways/components/ProfileBudgetBar.tsx',
    'src/pathways/components/EvidenceChip.tsx',
    'src/pathways/components/NonAffiliationFooter.tsx',
    'src/pathways/components/FeedbackModal.tsx'
  ];

  it('verifies all 5 Pathways pages exist and are well-formed', () => {
    for (const relPath of pathwaysPages) {
      const fullPath = path.join(rootDir, relPath);
      expect(fs.existsSync(fullPath), `Missing page: ${relPath}`).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content.length).toBeGreaterThan(100);
      expect(content).toContain('export const');
      expect(content).toContain('NonAffiliationFooter');
    }
  });

  it('verifies all 4 reusable Pathways components exist', () => {
    for (const relPath of pathwaysComponents) {
      const fullPath = path.join(rootDir, relPath);
      expect(fs.existsSync(fullPath), `Missing component: ${relPath}`).toBe(true);
    }
  });

  it('strictly enforces Rule E6: zero component math in UI layer', () => {
    const mathCheck = checkUiMath();
    expect(mathCheck.ok, `Found math violations: ${JSON.stringify(mathCheck.violations)}`).toBe(true);
    expect(mathCheck.violations.length).toBe(0);
  });

  it('verifies NonAffiliationFooter contains statutory governance disclaimer', () => {
    const footerPath = path.join(rootDir, 'src/pathways/components/NonAffiliationFooter.tsx');
    const content = fs.readFileSync(footerPath, 'utf8');
    expect(content).toContain('Inclusion does not imply sponsorship, endorsement, or formal affiliation');
    expect(content).toContain('Stays in your browser. Never uploaded.');
  });

  it('verifies OfferEvaluatorPage contains exact C7/C14 service bond disclaimer', () => {
    const offerPagePath = path.join(rootDir, 'src/pathways/pages/OfferEvaluatorPage.tsx');
    const content = fs.readFileSync(offerPagePath, 'utf8');
    expect(content).toContain(
      'Courts in India have treated reasonable service bonds as enforceable. Whether yours is reasonable is a legal question. This tool shows the money at stake, not legal advice.'
    );
  });

  it('verifies ActionPlanPage enforces draft assumptions warning banner', () => {
    const planPagePath = path.join(rootDir, 'src/pathways/pages/ActionPlanPage.tsx');
    const content = fs.readFileSync(planPagePath, 'utf8');
    expect(content).toContain('Draft Assumptions In Use');
    expect(content).toContain('Task timelines are editorial draft estimates');
  });

  it('verifies App.tsx routes and feature flag gating', () => {
    const appPath = path.join(rootDir, 'src/App.tsx');
    const content = fs.readFileSync(appPath, 'utf8');
    expect(content).toContain('FEATURES.PATHWAYS_ENABLED');
    expect(content).toContain('/tools/pathways');
    expect(content).toContain('/tools/pathways/program/:id');
    expect(content).toContain('/tools/pathways/plan');
    expect(content).toContain('/tools/pathways/offers');
    expect(content).toContain('/tools/pathways/about-data');
  });

  it('verifies ToolsHubPage includes Pathways fresher intel card', () => {
    const toolsHubPath = path.join(rootDir, 'src/pages/tools/ToolsHubPage.tsx');
    const content = fs.readFileSync(toolsHubPath, 'utf8');
    expect(content).toContain('FEATURES.PATHWAYS_ENABLED');
    expect(content).toContain('/tools/pathways');
    expect(content).toContain('Fresher Radar');
  });

  it('verifies feature flag configuration', () => {
    expect(FEATURES.PATHWAYS_ENABLED).toBe(true);
    expect(PATHWAYS_NAME).toBe('Pathways');
  });
});
