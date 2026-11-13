import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { InspectorHeader } from '@/features/inspector/InspectorHeader';
import { CompareControls } from '@/features/inspector/CompareControls';
import { ResumePane } from '@/features/inspector/ResumePane';
import { FindingsPane } from '@/features/inspector/FindingsPane';
import type { AuditEntry } from '@/domain/types';

const sampleAudit: AuditEntry = {
  schemaVersion: 1,
  id: 'audit-test-1',
  kind: 'ats_roast',
  createdAt: '2026-11-13T10:00:00Z',
  engineVersion: '5.0.0',
  runKey: '1'.repeat(64),
  targetKey: 'google:l4_swe',
  resume: {
    workspaceId: 'ws-1',
    versionId: 'v-1',
    snapshotHash: 'a'.repeat(64),
    label: 'v1: Distributed Systems',
  },
  jd: {
    origin: 'pasted',
    company: 'Google',
    roleTitle: 'Software Engineer III',
    snapshotHash: 'b'.repeat(64),
  },
  overallScore: 88,
  breakdown: [
    { key: 'must_have', label: 'Must-Have Skills', score: 90, weight: 0.4 },
    { key: 'depth', label: 'Evidence Depth', score: 85, weight: 0.3 },
  ],
  gaps: [
    { id: 'gap-k8s', category: 'skill', label: 'Kubernetes Operator', severity: 2, detail: 'No evidence of writing CRDs' },
  ],
  strengths: ['Strong Go concurrency patterns', 'High test coverage metrics'],
  evidence: [
    { start: 0, end: 15, findingId: 'go-concurrency', kind: 'match' },
    { start: 20, end: 35, findingId: 'k8s', kind: 'weak' },
  ],
  findingsJson: { mockEngineOutput: true },
  delta: {
    previousAuditId: 'prev-audit-0',
    previousScore: 82,
    overallDeltaPts: 6,
    resolvedGapIds: [],
    newGapIds: [],
  },
};

describe('Stage 7: Historical Resume Inspector', () => {
  describe('InspectorHeader', () => {
    it('renders audit metadata, score, delta, and snapshot hash prefixes', () => {
      const html = renderToString(
        <InspectorHeader audit={sampleAudit} onClose={() => {}} />
      );

      expect(html).toContain('Google');
      expect(html).toContain('Software Engineer III');
      expect(html).toContain('88');
      expect(html).toContain('Fit:');
      expect(html).toMatch(/\+6.*%/);
      expect(html).toContain('ats roast');
      expect(html).toContain(sampleAudit.resume.snapshotHash.slice(0, 8));
      expect(html).toContain(sampleAudit.jd.snapshotHash.slice(0, 8));
    });
  });

  describe('CompareControls', () => {
    it('renders single evaluation notice when no past audits exist', () => {
      const html = renderToString(
        <CompareControls
          availableAudits={[]}
          currentCompareId={null}
          onSelectCompare={() => {}}
        />
      );

      expect(html).toContain('Single evaluation on file for this target');
    });

    it('renders comparison select when past audits are available', () => {
      const pastAudit: AuditEntry = {
        ...sampleAudit,
        id: 'audit-test-past',
        overallScore: 82,
        resume: { ...sampleAudit.resume, label: 'v0: Initial' },
      };

      const html = renderToString(
        <CompareControls
          availableAudits={[pastAudit]}
          currentCompareId={null}
          onSelectCompare={() => {}}
        />
      );

      expect(html).toContain('Compare with past audit:');
      expect(html).toContain('v0: Initial');
    });
  });

  describe('ResumePane', () => {
    it('renders segmented text with highlights for matches and weak evidence', () => {
      const resumeText = 'Go Concurrency test and Kubernetes pod scale testing';
      const html = renderToString(
        <ResumePane
          label="Test Resume"
          resumeText={resumeText}
          evidence={sampleAudit.evidence}
          wordDiffs={null}
          selectedFindingId={null}
          onSelectFinding={() => {}}
        />
      );

      expect(html).toContain('Test Resume');
      expect(html).toContain('Go Concurrency');
      expect(html).toContain('Matched Skill');
      expect(html).toContain('Weak Evidence');
    });

    it('renders word diff when comparison mode is active', () => {
      const wordDiffs = [
        { type: 'equal' as const, text: 'Senior ' },
        { type: 'remove' as const, text: 'Python ' },
        { type: 'add' as const, text: 'Go ' },
        { type: 'equal' as const, text: 'Developer' },
      ];

      const html = renderToString(
        <ResumePane
          label="Test Resume"
          resumeText="Senior Go Developer"
          evidence={[]}
          wordDiffs={wordDiffs}
          selectedFindingId={null}
          onSelectFinding={() => {}}
        />
      );

      expect(html).toContain('Resume Word Diff');
      expect(html).toContain('Python');
      expect(html).toContain('Go');
      expect(html).toContain('Developer');
    });
  });

  describe('FindingsPane', () => {
    it('renders breakdown subscores and weights', () => {
      const html = renderToString(
        <FindingsPane
          audit={sampleAudit}
          jdText="Looking for Senior SWE"
          activeTab="breakdown"
          onTabChange={() => {}}
          selectedFindingId={null}
          onSelectFinding={() => {}}
        />
      );

      expect(html).toContain('Must-Have Skills');
      expect(html).toMatch(/90.*\/100/);
      expect(html).toContain('Evidence Depth');
      expect(html).toMatch(/85.*\/100/);
    });

    it('renders gaps with severity badges and action buttons', () => {
      const html = renderToString(
        <FindingsPane
          audit={sampleAudit}
          jdText="Looking for Senior SWE"
          activeTab="gaps"
          onTabChange={() => {}}
          selectedFindingId={null}
          onSelectFinding={() => {}}
        />
      );

      expect(html).toContain('Kubernetes Operator');
      expect(html).toContain('Medium');
      expect(html).toContain('No evidence of writing CRDs');
      expect(html).toContain('Add to Plan');
    });

    it('renders frozen JD snapshot in JD tab', () => {
      const html = renderToString(
        <FindingsPane
          audit={sampleAudit}
          jdText="Exact Google L4 JD text snippet"
          activeTab="jd"
          onTabChange={() => {}}
          selectedFindingId={null}
          onSelectFinding={() => {}}
        />
      );

      expect(html).toContain('Exact Frozen Target JD');
      expect(html).toContain('Exact Google L4 JD text snippet');
    });
  });
});
