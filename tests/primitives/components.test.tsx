import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  Button,
  Field,
  Tabs,
  Modal,
  ScoreMeter,
  Badge,
  Card,
  StatCard,
  Input,
  Select,
  Textarea,
  FileDropzone,
  Breadcrumb,
} from '../../src/components/ui/Components';

describe('R-TEST-1: Design System Primitives Unit & A11y Suite', () => {
  describe('Button Primitive', () => {
    it('renders all variants with proper semantic token classes', () => {
      const primaryHtml = renderToString(<Button variant="primary">Scan Resume</Button>);
      expect(primaryHtml).toContain('bg-accent');
      expect(primaryHtml).toContain('text-text-on-accent');
      expect(primaryHtml).toContain('Scan Resume');

      const secondaryHtml = renderToString(<Button variant="secondary">Cancel</Button>);
      expect(secondaryHtml).toContain('bg-surface-2');
      expect(secondaryHtml).toContain('text-text-primary');

      const ghostHtml = renderToString(<Button variant="ghost">Details</Button>);
      expect(ghostHtml).toContain('bg-transparent');

      const dangerHtml = renderToString(<Button variant="danger">Reset All</Button>);
      expect(dangerHtml).toContain('bg-danger-bg');
      expect(dangerHtml).toContain('text-danger-text');
    });

    it('renders loading state with aria-busy="true" and disabled attribute', () => {
      const loadingHtml = renderToString(
        <Button variant="primary" loading>
          Evaluating
        </Button>
      );
      expect(loadingHtml).toContain('aria-busy="true"');
      expect(loadingHtml).toContain('disabled');
      expect(loadingHtml).toContain('Loading...');
    });

    it('renders disabled state with disabled attribute and reduced opacity class', () => {
      const disabledHtml = renderToString(
        <Button variant="secondary" disabled>
          Locked Action
        </Button>
      );
      expect(disabledHtml).toContain('disabled');
      expect(disabledHtml).toContain('disabled:opacity-40');
    });
  });

  describe('Field & Input Primitives', () => {
    it('wires label, hint, and error with aria-describedby and role="alert"', () => {
      const html = renderToString(
        <Field label="Candidate Email" hint="Your primary email address" error="Please enter a valid email" id="test-email">
          {({ id, 'aria-describedby': describedBy, 'aria-invalid': invalid }) => (
            <input id={id} aria-describedby={describedBy} aria-invalid={invalid} />
          )}
        </Field>
      );

      expect(html).toContain('for="test-email"');
      expect(html).toContain('Candidate Email');
      expect(html).toContain('id="test-email-hint"');
      expect(html).toContain('id="test-email-error"');
      expect(html).toContain('aria-describedby="test-email-hint test-email-error"');
      expect(html).toContain('role="alert"');
      expect(html).toContain('Please enter a valid email');
    });

    it('renders standalone Input with 16px minimum mobile font token (text-base sm:text-sm)', () => {
      const html = renderToString(<Input placeholder="Enter target company..." />);
      expect(html).toContain('text-base sm:text-sm');
      expect(html).toContain('bg-surface-1');
      expect(html).toContain('border-border-default');
    });
  });

  describe('Tabs Primitive', () => {
    it('renders tablist semantics and aria-selected states', () => {
      const tabs = [
        { id: 'summary', label: 'Executive Summary', badge: 3 },
        { id: 'gaps', label: 'Missing Skills', badge: 1 },
      ];
      const html = renderToString(<Tabs tabs={tabs} activeId="summary" onChange={() => {}} />);

      expect(html).toContain('role="tablist"');
      expect(html).toContain('role="tab"');
      expect(html).toContain('aria-selected="true"');
      expect(html).toContain('Executive Summary');
      expect(html).toContain('aria-selected="false"');
      expect(html).toContain('Missing Skills');
    });
  });

  describe('Modal Primitive', () => {
    it('returns null when open is false', () => {
      const html = renderToString(
        <Modal open={false} onClose={() => {}} title="Score Breakdown">
          Modal Body
        </Modal>
      );
      expect(html).toBe('');
    });

    it('renders role="dialog", aria-modal="true", and overlay scrim when open is true', () => {
      const html = renderToString(
        <Modal open={true} onClose={() => {}} title="Score Breakdown">
          Modal Body
        </Modal>
      );
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('bg-overlay-scrim');
      expect(html).toContain('Score Breakdown');
      expect(html).toContain('Modal Body');
    });
  });

  describe('ScoreMeter Primitive', () => {
    it('renders progressbar role with aria-valuenow and accessible text alternative', () => {
      const html = renderToString(<ScoreMeter score={85} max={100} label="Match Score" />);

      expect(html).toContain('role="progressbar"');
      expect(html).toContain('aria-valuenow="85"');
      expect(html).toContain('aria-valuemin="0"');
      expect(html).toContain('aria-valuemax="100"');
      expect(html).toContain('aria-label="Match Score: 85 of 100"');
      expect(html).toContain('85');
      expect(html).toContain('100');
    });
  });

  describe('Card & StatCard Primitives', () => {
    it('renders StatCard with high-emphasis metric typography', () => {
      const html = renderToString(
        <StatCard label="ATS Readiness" value="92%" sublabel="Top 8% of candidate pool" />
      );
      expect(html).toContain('text-role-metric-hero');
      expect(html).toContain('ATS Readiness');
      expect(html).toContain('92%');
      expect(html).toContain('Top 8% of candidate pool');
    });
  });
});
