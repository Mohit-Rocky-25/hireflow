// ============================================================
// HireFlow Navigation System — Automated Integrity Validator
// Checks schema rules, duplicate IDs, missing parents, broken routes,
// role-access conflicts, and icon validity.
// ============================================================

import { candidateToolsManifest } from '../src/navigation/manifests/candidateTools.manifest';
import { candidatePortalManifest } from '../src/navigation/manifests/candidatePortal.manifest';
import { companyManifest } from '../src/navigation/manifests/company.manifest';
import { interviewerManifest } from '../src/navigation/manifests/interviewer.manifest';
import { adminManifest } from '../src/navigation/manifests/admin.manifest';
import { publicManifest } from '../src/navigation/manifests/public.manifest';
import { isValidIcon } from '../src/navigation/icons';
import type { NavManifest, NavSection, NavEntry } from '../src/navigation/types';

export interface ValidationIssue {
  type: 'ERROR' | 'WARNING';
  category: string;
  message: string;
  itemId?: string;
}

export function validateNavigationRegistry(manifests: NavManifest[] = [
  candidateToolsManifest,
  candidatePortalManifest,
  companyManifest,
  interviewerManifest,
  adminManifest,
  publicManifest,
]): { isValid: boolean; issues: ValidationIssue[]; stats: { sections: number; entries: number } } {
  const issues: ValidationIssue[] = [];

  const sections: NavSection[] = [];
  const entries: NavEntry[] = [];
  const sectionIds = new Set<string>();
  const entryIds = new Set<string>();
  const routeMap = new Map<string, string>(); // route -> entryId

  // 1. Collect all sections
  for (const m of manifests) {
    if (m.sections) {
      for (const s of m.sections) {
        if (sectionIds.has(s.id)) {
          issues.push({
            type: 'ERROR',
            category: 'DUPLICATE_SECTION_ID',
            message: `Duplicate section ID detected: "${s.id}"`,
            itemId: s.id,
          });
        }
        sectionIds.add(s.id);
        sections.push(s);

        if (!s.label || s.label.trim().length === 0) {
          issues.push({
            type: 'ERROR',
            category: 'MISSING_LABEL',
            message: `Section "${s.id}" is missing a valid label`,
            itemId: s.id,
          });
        }

        if (!s.icon || !isValidIcon(s.icon)) {
          issues.push({
            type: 'ERROR',
            category: 'INVALID_ICON',
            message: `Section "${s.id}" references an unrecognized icon: "${s.icon}"`,
            itemId: s.id,
          });
        }
      }
    }
  }

  // 2. Collect and validate entries
  for (const m of manifests) {
    for (const e of m.entries) {
      // Check duplicate ID
      if (entryIds.has(e.id)) {
        issues.push({
          type: 'ERROR',
          category: 'DUPLICATE_ENTRY_ID',
          message: `Duplicate entry ID detected: "${e.id}"`,
          itemId: e.id,
        });
      }
      entryIds.add(e.id);
      entries.push(e);

      // Check duplicate Route
      if (routeMap.has(e.route)) {
        issues.push({
          type: 'ERROR',
          category: 'DUPLICATE_ROUTE',
          message: `Duplicate route detected: "${e.route}" used by both "${routeMap.get(e.route)}" and "${e.id}"`,
          itemId: e.id,
        });
      } else {
        routeMap.set(e.route, e.id);
      }

      // Check valid route format
      if (!e.route || !e.route.startsWith('/')) {
        issues.push({
          type: 'ERROR',
          category: 'INVALID_ROUTE',
          message: `Entry "${e.id}" has an invalid route (must start with '/'): "${e.route}"`,
          itemId: e.id,
        });
      }

      // Check missing label
      if (!e.label || e.label.trim().length === 0) {
        issues.push({
          type: 'ERROR',
          category: 'MISSING_LABEL',
          message: `Entry "${e.id}" is missing a valid label`,
          itemId: e.id,
        });
      }

      // Check valid icon
      if (!e.icon || !isValidIcon(e.icon)) {
        issues.push({
          type: 'ERROR',
          category: 'INVALID_ICON',
          message: `Entry "${e.id}" references an unrecognized Lucide icon: "${e.icon}"`,
          itemId: e.id,
        });
      }

      // Check valid parent section
      if (e.section !== 'root' && !sectionIds.has(e.section)) {
        issues.push({
          type: 'ERROR',
          category: 'MISSING_PARENT_SECTION',
          message: `Entry "${e.id}" references non-existent parent section "${e.section}"`,
          itemId: e.id,
        });
      }

      // Check keywords
      if (!e.keywords || e.keywords.length === 0) {
        issues.push({
          type: 'WARNING',
          category: 'MISSING_KEYWORDS',
          message: `Entry "${e.id}" has no search keywords defined`,
          itemId: e.id,
        });
      }

      // Check parentEntryId if present
      if (e.parentEntryId && !entryIds.has(e.parentEntryId)) {
        // Will check in second pass
      }
    }
  }

  // 3. Second pass for parentEntryId links
  for (const e of entries) {
    if (e.parentEntryId && !entryIds.has(e.parentEntryId)) {
      issues.push({
        type: 'ERROR',
        category: 'MISSING_PARENT_ENTRY',
        message: `Entry "${e.id}" references non-existent parent entry "${e.parentEntryId}"`,
        itemId: e.id,
      });
    }
  }

  // 4. Role access conflict checks
  for (const e of entries) {
    if (e.section !== 'root') {
      const section = sections.find((s) => s.id === e.section);
      if (section && section.roles !== 'all' && e.roles !== 'all') {
        const hasOverlap = e.roles.some((r) => section.roles.includes(r));
        if (!hasOverlap) {
          issues.push({
            type: 'ERROR',
            category: 'ROLE_ACCESS_CONFLICT',
            message: `Entry "${e.id}" roles [${e.roles.join(', ')}] have no overlap with parent section "${section.id}" roles [${section.roles.join(', ')}]`,
            itemId: e.id,
          });
        }
      }
    }
  }

  const errors = issues.filter((i) => i.type === 'ERROR');

  return {
    isValid: errors.length === 0,
    issues,
    stats: {
      sections: sections.length,
      entries: entries.length,
    },
  };
}

// Standalone execution entrypoint
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  console.log('====================================================');
  console.log('HIREFLOW AI — EXTENSIBLE NAVIGATION VALIDATOR');
  console.log('====================================================\n');

  const result = validateNavigationRegistry();

  console.log(`Sections verified: ${result.stats.sections}`);
  console.log(`Entries verified:  ${result.stats.entries}`);
  console.log(`Total issues:      ${result.issues.length}`);

  if (result.issues.length > 0) {
    console.log('\n--- ISSUES FOUND ---');
    for (const issue of result.issues) {
      const prefix = issue.type === 'ERROR' ? '❌ [ERROR]' : '⚠️  [WARN]';
      console.log(`${prefix} ${issue.category}: ${issue.message}`);
    }
  }

  if (!result.isValid) {
    console.error('\n❌ Navigation validation FAILED with critical errors.');
    process.exit(1);
  } else {
    console.log('\n✓ Navigation validation PASSED cleanly with 0 errors.');
    process.exit(0);
  }
}
