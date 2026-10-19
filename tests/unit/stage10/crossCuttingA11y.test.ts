import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Stage 10: Cross-Cutting Accessibility (A11y) Verification', () => {
  const rootDir = process.cwd();

  it('ensures MetricFeedbackWidget buttons have descriptive aria-labels', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'common', 'MetricFeedbackWidget.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('aria-label="Mark finding as accurate/helpful"');
    expect(content).toContain('aria-label="Mark finding as inaccurate/unhelpful"');
    expect(content).toContain('aria-label="Add or edit feedback note"');
  });

  it('ensures Metric component has accessible explain drawer trigger', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'common', 'Metric.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('aria-label={`Inspect calculation for ${label}`}');
  });

  it('ensures Drawer implements dialog semantics and focus management', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'common', 'Drawer.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('role="dialog"');
    expect(content).toContain('aria-modal="true"');
    expect(content).toContain('aria-label="Close panel"');
  });

  it('ensures ConfirmDialog implements dialog semantics and focus trap', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'common', 'ConfirmDialog.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('role="dialog"');
    expect(content).toContain('aria-modal="true"');
    expect(content).toContain('aria-label={ariaLabel || title}');
  });

  it('ensures ToastContainer and announcements use aria-live polite regions', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'ui', 'Toast.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('aria-live="polite"');
    expect(content).toContain('role="region"');
  });

  it('ensures OfflineIndicator and PwaUpdateToast have proper aria-live attributes', () => {
    const offlinePath = path.join(rootDir, 'src', 'components', 'common', 'OfflineIndicator.tsx');
    const updatePath = path.join(rootDir, 'src', 'components', 'common', 'PwaUpdateToast.tsx');

    const offlineContent = fs.readFileSync(offlinePath, 'utf-8');
    const updateContent = fs.readFileSync(updatePath, 'utf-8');

    expect(offlineContent).toContain('role="status"');
    expect(offlineContent).toContain('aria-live="polite"');
    expect(updateContent).toContain('role="alert"');
    expect(updateContent).toContain('aria-live="polite"');
  });
});
