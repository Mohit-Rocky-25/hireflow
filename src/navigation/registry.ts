// ============================================================
// HireFlow Navigation System — Central Registry Loader
// Uses Vite import.meta.glob for zero-edit extensibility
// ============================================================

import type { UserRole } from '../types';
import type {
  NavManifest,
  NavSection,
  NavEntry,
  BreadcrumbItem,
  CommandSearchResult,
  NavRole,
} from './types';

// Auto-discover all manifest files across the workspace
const manifestModules = import.meta.glob<NavManifest | { default: NavManifest }>(
  '/src/**/*.manifest.{ts,tsx}',
  { eager: true }
);

function collectRegistry(): { sections: NavSection[]; entries: NavEntry[] } {
  const sectionMap = new Map<string, NavSection>();
  const entryMap = new Map<string, NavEntry>();

  for (const path in manifestModules) {
    const raw = manifestModules[path];
    const manifest: NavManifest = (raw as any).default || raw;

    if (manifest.sections) {
      for (const section of manifest.sections) {
        if (!sectionMap.has(section.id)) {
          sectionMap.set(section.id, section);
        } else {
          // Merge / override if necessary
          sectionMap.set(section.id, { ...sectionMap.get(section.id)!, ...section });
        }
      }
    }

    if (manifest.entries) {
      for (const entry of manifest.entries) {
        if (!entryMap.has(entry.id)) {
          entryMap.set(entry.id, entry);
        } else {
          console.warn(`[NavigationRegistry] Duplicate nav entry id: "${entry.id}" found in ${path}`);
          entryMap.set(entry.id, entry);
        }
      }
    }
  }

  const sections = Array.from(sectionMap.values()).sort((a, b) => a.order - b.order);
  const entries = Array.from(entryMap.values()).sort((a, b) => a.order - b.order);

  return { sections, entries };
}

// Cached consolidated registry
let _cachedRegistry: { sections: NavSection[]; entries: NavEntry[] } | null = null;

export function getRegistry() {
  if (!_cachedRegistry) {
    _cachedRegistry = collectRegistry();
  }
  return _cachedRegistry;
}

// Invalidate cache (useful for testing or dynamic HMR)
export function invalidateRegistryCache() {
  _cachedRegistry = null;
}

// Check if a role has access
export function hasRoleAccess(allowedRoles: NavRole[] | 'all', userRole?: UserRole | 'public'): boolean {
  if (allowedRoles === 'all') return true;
  if (!userRole || userRole === 'public') {
    return allowedRoles.includes('public') || allowedRoles.includes('CANDIDATE');
  }
  return allowedRoles.includes(userRole as NavRole);
}

// Get sections visible to a role
export function getSectionsForRole(role?: UserRole | 'public'): NavSection[] {
  const { sections, entries } = getRegistry();
  return sections.filter((section) => {
    if (!hasRoleAccess(section.roles, role)) return false;
    // Section must have at least one visible entry
    const sectionEntries = entries.filter(
      (e) => e.section === section.id && !e.hideFromSidebar && hasRoleAccess(e.roles, role)
    );
    return sectionEntries.length > 0;
  });
}

// Get entries for a specific section and role
export function getEntriesForSection(sectionId: string, role?: UserRole | 'public'): NavEntry[] {
  const { entries } = getRegistry();
  return entries
    .filter((e) => e.section === sectionId && hasRoleAccess(e.roles, role))
    .sort((a, b) => a.order - b.order);
}

// Get all visible sidebar entries for a role (including root entries)
export function getSidebarEntriesForRole(role?: UserRole | 'public'): {
  rootEntries: NavEntry[];
  sections: Array<{ section: NavSection; entries: NavEntry[] }>;
} {
  const { entries } = getRegistry();
  const visibleSections = getSectionsForRole(role);

  const rootEntries = entries.filter(
    (e) => e.section === 'root' && !e.hideFromSidebar && hasRoleAccess(e.roles, role)
  );

  const sections = visibleSections.map((sec) => ({
    section: sec,
    entries: entries.filter(
      (e) => e.section === sec.id && !e.hideFromSidebar && hasRoleAccess(e.roles, role)
    ),
  }));

  return { rootEntries, sections };
}

// Match an exact or parameterized pathname to an entry
export function getEntryByPath(pathname: string): NavEntry | undefined {
  const { entries } = getRegistry();

  // 1. Direct exact match
  const exact = entries.find((e) => e.route === pathname);
  if (exact) return exact;

  // 2. Dynamic route match (e.g. /company/jobs/:id matches /company/jobs/123)
  for (const entry of entries) {
    if (entry.route.includes(':')) {
      const regexPattern = '^' + entry.route.replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$';
      if (new RegExp(regexPattern).test(pathname)) {
        return entry;
      }
    }
  }

  // 3. Fallback prefix match for nested views
  const prefixMatches = entries
    .filter((e) => e.route !== '/' && pathname.startsWith(e.route))
    .sort((a, b) => b.route.length - a.route.length);

  return prefixMatches[0];
}

// Get entry by ID
export function getEntryById(id: string): NavEntry | undefined {
  const { entries } = getRegistry();
  return entries.find((e) => e.id === id);
}

// Generate breadcrumbs from route
export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const entry = getEntryByPath(pathname);
  if (!entry) {
    return [{ label: 'HireFlow', path: '/' }, { label: 'Page', isCurrent: true }];
  }

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'HireFlow', path: '/' }];
  const { sections } = getRegistry();
  const parentSection = sections.find((s) => s.id === entry.section);

  if (parentSection && parentSection.id !== 'root') {
    breadcrumbs.push({
      label: parentSection.label,
    });
  }

  // If this entry is a deep subpage with parentEntryId
  if (entry.parentEntryId) {
    const parent = getEntryById(entry.parentEntryId);
    if (parent) {
      breadcrumbs.push({
        label: parent.shortLabel || parent.label,
        path: parent.route,
      });
    }
  }

  breadcrumbs.push({
    label: entry.shortLabel || entry.label,
    path: entry.route,
    isCurrent: true,
  });

  return breadcrumbs;
}

// Build consolidated redirects map
export function getRedirectsMap(): Record<string, string> {
  const { entries } = getRegistry();
  const map: Record<string, string> = {};

  for (const entry of entries) {
    if (entry.redirectsFrom) {
      for (const oldPath of entry.redirectsFrom) {
        map[oldPath] = entry.route;
      }
    }
  }

  // Known platform aliases
  map['/tools/tracker'] = '/candidate/applications';
  map['/jobs/:id'] = '/candidate/jobs/:id';

  return map;
}

// Command palette search
export function searchNavigation(query: string, role?: UserRole): CommandSearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const { entries, sections } = getRegistry();
  const results: CommandSearchResult[] = [];

  for (const entry of entries) {
    if (!hasRoleAccess(entry.roles, role)) continue;

    const section = sections.find((s) => s.id === entry.section);
    const sectionLabel = section ? section.label : 'General';

    if (entry.label.toLowerCase().includes(q)) {
      results.push({ entry, sectionLabel, matchType: 'label' });
    } else if (entry.keywords.some((kw) => kw.toLowerCase().includes(q))) {
      results.push({ entry, sectionLabel, matchType: 'keyword' });
    } else if (entry.description.toLowerCase().includes(q)) {
      results.push({ entry, sectionLabel, matchType: 'description' });
    }
  }

  return results.slice(0, 10);
}

// 404 page suggestions
export function getSuggestionsFor404(pathname: string, role?: UserRole): NavEntry[] {
  const cleanPath = pathname.replace(/^\/|\/$/g, '').toLowerCase();
  const tokens = cleanPath.split(/[/_-]/).filter(Boolean);
  const { entries } = getRegistry();

  const scored = entries
    .filter((e) => !e.hideFromSidebar && hasRoleAccess(e.roles, role))
    .map((e) => {
      let score = 0;
      const routeTokens = e.route.toLowerCase().split(/[/_-]/).filter(Boolean);
      for (const t of tokens) {
        if (routeTokens.includes(t)) score += 3;
        if (e.label.toLowerCase().includes(t)) score += 2;
        if (e.keywords.some((kw) => kw.toLowerCase().includes(t))) score += 1;
      }
      return { entry: e, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length >= 3) {
    return scored.slice(0, 4).map((s) => s.entry);
  }

  // Fallback defaults if no match
  const defaults = entries
    .filter((e) => !e.hideFromSidebar && hasRoleAccess(e.roles, role))
    .slice(0, 4);

  return defaults;
}
