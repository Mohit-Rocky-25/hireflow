import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('C12: Mobile & Tablet Responsiveness Audit (C12.1 - C12.5)', () => {
  const rootDir = path.resolve(__dirname, '../../../');

  it('ensures index.html defines mobile-friendly viewport meta tag', () => {
    const indexPath = path.join(rootDir, 'index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf8');

    expect(indexHtml).toContain('<meta name="viewport"');
    expect(indexHtml).toContain('width=device-width');
    expect(indexHtml).toContain('initial-scale=1.0');
  });

  it('verifies Drawer component implements mobile bottom-sheet ergonomics', () => {
    const drawerPath = path.join(rootDir, 'src/components/common/Drawer.tsx');
    const drawerCode = fs.readFileSync(drawerPath, 'utf8');

    // Mobile bottom sheet classes for screens < 640px
    expect(drawerCode).toContain('max-sm:mt-auto');
    expect(drawerCode).toContain('max-sm:max-h-[85vh]');
    expect(drawerCode).toContain('max-sm:rounded-t-2xl');
  });

  it('verifies data tables in key tools feature horizontal scroll wrappers (overflow-x-auto)', () => {
    const methodologyPath = path.join(rootDir, 'src/pages/methodology/MethodologyPage.tsx');
    const methodologyCode = fs.readFileSync(methodologyPath, 'utf8');
    expect(methodologyCode).toContain('overflow-x-auto');

    const jdLibraryPath = path.join(rootDir, 'src/pages/jd-library/SavedJdLibraryPage.tsx');
    const jdLibraryCode = fs.readFileSync(jdLibraryPath, 'utf8');
    expect(jdLibraryCode).toContain('overflow-x-auto');

    const historyPath = path.join(rootDir, 'src/pages/history/ScanHistoryPage.tsx');
    const historyCode = fs.readFileSync(historyPath, 'utf8');
    expect(historyCode).toContain('overflow-x-auto');
  });

  it('verifies Tailor My Resume includes mobile tab switcher (Editor vs Paper Canvas)', () => {
    const tailorPagePath = path.join(rootDir, 'src/features/suite/tailor/TailorResumePage.tsx');
    const tailorCode = fs.readFileSync(tailorPagePath, 'utf8');

    expect(tailorCode).toContain('mobileTab');
    expect(tailorCode).toContain('lg:hidden');
    expect(tailorCode).toContain('Paper Canvas');
  });
});
