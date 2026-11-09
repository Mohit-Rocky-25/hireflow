import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  Button,
  TextInput,
  Textarea,
  Select,
  FieldShell,
  Card,
  Tile,
  MintPanel,
  ExpertTip,
  StatBlock,
  StatChip,
  StatusChip,
  Tabs,
  ComparisonTable,
  SpecGrid,
  SpecCell,
  Progress,
  Logo,
} from './ui';

describe('HireFloo Spruce: Primitive Component Library Tests (Stage 2)', () => {
  describe('Button Primitive', () => {
    it('renders all variants with proper semantic classes', () => {
      const primaryHtml = renderToString(<Button variant="primary">Primary</Button>);
      expect(primaryHtml).toContain('bg-sp-primary');
      expect(primaryHtml).toContain('text-sp-on-primary');
      expect(primaryHtml).toContain('Primary');

      const secondaryHtml = renderToString(<Button variant="secondary">Secondary</Button>);
      expect(secondaryHtml).toContain('bg-sp-canvas-soft');
      expect(secondaryHtml).toContain('text-sp-primary-text');

      const outlineHtml = renderToString(<Button variant="outline">Outline</Button>);
      expect(outlineHtml).toContain('border-sp-hairline-strong');
      expect(outlineHtml).toContain('text-sp-primary-text');

      const destructiveHtml = renderToString(<Button variant="destructive">Delete</Button>);
      expect(destructiveHtml).toContain('border-sp-error-text');
      expect(destructiveHtml).toContain('text-sp-error-text');
    });

    it('renders loading state with determinate bottom bar and retains label', () => {
      const loadingHtml = renderToString(
        <Button variant="primary" loading>
          Processing
        </Button>
      );
      expect(loadingHtml).toContain('Processing');
      expect(loadingHtml).toContain('bg-sp-mint-200');
      expect(loadingHtml).toContain('disabled=""');
    });
  });

  describe('FieldShell & Form Input Wiring', () => {
    it('wires error state correctly using aria-invalid and aria-describedby', () => {
      const html = renderToString(
        <TextInput
          id="test-input"
          label="Test Label"
          error="This field has an error"
        />
      );
      expect(html).toContain('aria-invalid="true"');
      expect(html).toContain('aria-describedby="test-input-error"');
      expect(html).toContain('id="test-input-error"');
      expect(html).toContain('This field has an error');
      expect(html).toContain('border-sp-error-text');
    });

    it('renders clean input without error when valid', () => {
      const html = renderToString(
        <TextInput
          id="valid-input"
          label="Valid Field"
        />
      );
      expect(html).toContain('aria-invalid="false"');
      expect(html).not.toContain('test-input-error');
      expect(html).toContain('border-sp-field');
    });
  });

  describe('StatusChip Primitive', () => {
    it('always renders both an icon (svg) and text label for all three states', () => {
      const matchedHtml = renderToString(<StatusChip status="matched" />);
      expect(matchedHtml).toContain('<svg');
      expect(matchedHtml).toContain('Matched');
      expect(matchedHtml).toContain('bg-sp-mint-100');
      expect(matchedHtml).toContain('text-sp-primary-text');

      const partialHtml = renderToString(<StatusChip status="partial" />);
      expect(partialHtml).toContain('<svg');
      expect(partialHtml).toContain('Partial');
      expect(partialHtml).toContain('bg-sp-info-bg');
      expect(partialHtml).toContain('text-sp-info-text');

      const missingHtml = renderToString(<StatusChip status="missing" />);
      expect(missingHtml).toContain('<svg');
      expect(missingHtml).toContain('Missing');
      expect(missingHtml).toContain('bg-sp-error-bg');
      expect(missingHtml).toContain('text-sp-error-text');
    });
  });

  describe('Tabs Primitive', () => {
    it('renders accessible tablist with proper role and aria-selected', () => {
      const items = [
        { id: 'tab1', label: 'Overview' },
        { id: 'tab2', label: 'Details', count: 5 },
      ];
      const html = renderToString(<Tabs items={items} activeId="tab1" onChange={() => {}} />);
      expect(html).toContain('role="tablist"');
      expect(html).toContain('role="tab"');
      expect(html).toContain('aria-selected="true"');
      expect(html).toContain('aria-selected="false"');
      expect(html).toContain('border-sp-primary');
      expect(html).toContain('Overview');
      expect(html).toContain('Details');
      expect(html).toContain('5');
    });
  });

  describe('ComparisonTable Primitive', () => {
    it('renders both the desktop table view and mobile stacked cards view', () => {
      const cols = [
        { key: 'role', header: 'Role' },
        { key: 'tier', header: 'Tier' },
      ];
      const data = [{ role: 'Software Engineer', tier: 'Tier 1' }];
      const html = renderToString(
        <ComparisonTable
          columns={cols}
          data={data}
          keyExtractor={(r) => r.role}
        />
      );

      // Desktop table view
      expect(html).toContain('<table');
      expect(html).toContain('Role');
      expect(html).toContain('Tier 1');

      // Mobile stacked cards container
      expect(html).toContain('data-testid="stacked-mobile-cards"');
      expect(html).toContain('divide-sp-hairline');
    });
  });

  describe('Logo Primitive', () => {
    it('renders inline SVG with original chevron and wordmark', () => {
      const html = renderToString(<Logo />);
      expect(html).toContain('<svg');
      expect(html).toContain('var(--sp-forest)');
      expect(html).toContain('var(--sp-lime-hero)');
      expect(html).toContain('Hire');
      expect(html).toContain('Floo');
    });
  });
});
