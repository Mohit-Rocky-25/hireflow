// ============================================================
// Pathways Architecture — Editorial Assumptions Register
// Governed by Constitution Part B (B5) & Spec C4
// Every assumption begins in "draft" status until reviewed.
// ============================================================

import type { AssumptionRecord } from '../schema/types';

export const EDITORIAL_ASSUMPTIONS: Record<string, AssumptionRecord> = {
  'A-PLAN-APT-WEEKS': {
    id: 'A-PLAN-APT-WEEKS',
    kind: 'editorial',
    rationale: 'Typical engineering undergraduate preparation time for cognitive/aptitude rounds (quantitative, logical, verbal) spans 4 to 8 weeks.',
    status: 'draft',
    reviewerCategory: 'tpo',
    reviewedAt: null
  },
  'A-PLAN-DSA-WEEKS': {
    id: 'A-PLAN-DSA-WEEKS',
    kind: 'editorial',
    rationale: 'Core Data Structures & Algorithms preparation (arrays, trees, graphs, dynamic programming) spans 8 to 16 weeks for standard campus drives.',
    status: 'draft',
    reviewerCategory: 'recruiter',
    reviewedAt: null
  },
  'A-PLAN-CORE-CS-WEEKS': {
    id: 'A-PLAN-CORE-CS-WEEKS',
    kind: 'editorial',
    rationale: 'Core computer science fundamentals (OS, DBMS, Networks, OOP) review requires 3 to 6 weeks for technical interviews.',
    status: 'draft',
    reviewerCategory: 'fresh-grad',
    reviewedAt: null
  },
  'A-PLAN-SYS-DESIGN-WEEKS': {
    id: 'A-PLAN-SYS-DESIGN-WEEKS',
    kind: 'editorial',
    rationale: 'High-level system design fundamentals for product/GCC roles require 4 to 8 weeks of study for final year students.',
    status: 'draft',
    reviewerCategory: 'recruiter',
    reviewedAt: null
  },
  'A-PLAN-BACKLOG-CLEAR-WEEKS': {
    id: 'A-PLAN-BACKLOG-CLEAR-WEEKS',
    kind: 'editorial',
    rationale: 'University backlog supplementary exams typically occur within a 4 to 12 week cycle from semester results.',
    status: 'draft',
    reviewerCategory: 'tpo',
    reviewedAt: null
  },
  'A-OFFER-BOND-ALERT': {
    id: 'A-OFFER-BOND-ALERT',
    kind: 'editorial',
    rationale: 'A service bond exceeding 30% of first-year fixed take-home cash represents significant financial lock-in for fresh graduates.',
    status: 'draft',
    reviewerCategory: 'legal',
    reviewedAt: null
  }
};
