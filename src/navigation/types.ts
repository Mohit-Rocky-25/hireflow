// ============================================================
// HireFlow Navigation System — Type Definitions
// Single source of truth for navigation, breadcrumbs, search, and routing
// ============================================================

import React from 'react';
import type { UserRole } from '../types';

export type NavRole = UserRole | 'all' | 'public';

export type NavStatus = 'stable' | 'new' | 'beta' | 'deprecated';

export interface NavBadge {
  text?: string;
  count?: number;
  variant?: 'primary' | 'success' | 'warning' | 'violet' | 'emerald' | 'amber' | 'slate';
  dynamicCount?: () => number;
}

export interface NavSection {
  id: string;
  label: string;
  description: string;
  roles: NavRole[] | 'all';
  order: number;
  icon: string; // Lucide icon name, e.g. 'FileText'
  badge?: NavBadge | (() => NavBadge | null);
}

export interface NavEntry {
  id: string;
  label: string;
  shortLabel?: string;
  description: string;
  route: string;
  icon: string; // Lucide icon name, e.g. 'Search'
  section: string; // Section ID or 'root'
  roles: NavRole[] | 'all';
  order: number;
  keywords: string[];
  badge?: NavBadge | (() => NavBadge | null);
  status?: NavStatus;
  redirectsFrom?: string[];
  component?: React.ComponentType<any>;
  lazy?: () => Promise<{ default: React.ComponentType<any> } | any>;
  hideFromSidebar?: boolean; // For deep subpages like edit forms or detail views
  parentEntryId?: string; // For deep subpages to highlight parent in nav
  exact?: boolean;
}

export interface NavManifest {
  sections?: NavSection[];
  entries: NavEntry[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrent?: boolean;
}

export interface CommandSearchResult {
  entry: NavEntry;
  sectionLabel: string;
  matchType: 'label' | 'keyword' | 'description' | 'recent';
}
