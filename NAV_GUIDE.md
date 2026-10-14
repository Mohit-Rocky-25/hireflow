# HireFlow Navigation System — Developer Guide & Extensibility Reference

This guide explains how to extend, customize, and maintain the HireFlow navigation system.

---

## 1. Architectural Philosophy: Zero Central Edits

The navigation system is **100% data-driven and decentralized**.
Instead of editing a central router, sidebar component, breadcrumbs array, or search index, you define navigation manifests next to your features.

Vite automatically discovers all files matching `src/**/*.manifest.{ts,tsx}` using:
```ts
import.meta.glob<NavManifest | { default: NavManifest }>('/src/**/*.manifest.{ts,tsx}', { eager: true });
```

Adding a new tool, section, or subsection requires creating **ONE manifest file**.
The following are automatically generated from your manifest:
- **Left-Edge Sidebar Navigation**
- **Mobile Drawer Menu**
- **Global Command Palette Search Index** (<kbd>Ctrl</kbd> + <kbd>K</kbd>)
- **Semantic Breadcrumbs Trail**
- **Document Titles & Meta**
- **Section Hub Pages**
- **Canonical URL Redirects**
- **Smart 404 Suggestions**

---

## 2. How to Add a New Tool (Subsection)

To add a new tool or subsection to an existing section (e.g., `tools` or `candidate`), create a manifest file, e.g. `src/features/analytics/aiRecruiter.manifest.ts`:

```typescript
import type { NavManifest } from '@/navigation/types';

export const aiRecruiterManifest: NavManifest = {
  entries: [
    {
      id: 'ai-recruiter-agent',
      label: 'AI Autonomous Recruiter',
      shortLabel: 'AI Recruiter',
      description: 'Autonomous multi-channel candidate sourcing and automated scheduling pipeline',
      route: '/tools/ai-recruiter',
      icon: 'Bot', // Any Lucide React icon name
      section: 'tools', // Target parent section ID
      roles: ['BHR_MANAGER', 'HR_RECRUITER'], // Who sees this
      order: 25, // Relative order within section
      keywords: ['autonomous', 'agent', 'sourcing', 'scheduling', 'recruiter'],
      status: 'new', // 'stable' | 'new' | 'beta' | 'deprecated'
    },
  ],
};

export default aiRecruiterManifest;
```

That's it! Save the file.
- It will immediately appear in the sidebar for Recruiters.
- It is instantly searchable via <kbd>Ctrl</kbd> + <kbd>K</kbd>.
- Breadcrumbs will resolve to `HireFlow > Decision Suite > AI Recruiter`.

---

## 3. How to Add a New Top-Level Section

To introduce a new top-level section with its own subsections, define both `sections` and `entries` in your manifest:

```typescript
import type { NavManifest } from '@/navigation/types';

export const universityPortalManifest: NavManifest = {
  sections: [
    {
      id: 'university-partnerships',
      label: 'Campus Recruitment',
      description: 'TPO coordination, tier-1 placement drives, and coding olympiads',
      icon: 'GraduationCap',
      order: 40,
      roles: ['BHR_MANAGER', 'HR_RECRUITER'],
    },
  ],
  entries: [
    {
      id: 'campus-drives',
      label: 'Live Placement Drives',
      description: 'Monitor ongoing on-campus recruitment batches',
      route: '/company/campus/drives',
      icon: 'Building',
      section: 'university-partnerships',
      roles: ['BHR_MANAGER', 'HR_RECRUITER'],
      order: 10,
      keywords: ['campus', 'college', 'tpo', 'drives', 'freshers'],
    },
  ],
};

export default universityPortalManifest;
```

---

## 4. How to Add a Dataset-Driven Dynamic Badge

Badges can be static strings or dynamic functions that query the state or dataset:

```typescript
import { ALL_OPPORTUNITIES } from '@/features/suite/credentials/catalog';

// Inside your manifest entry:
badge: {
  text: `${ALL_OPPORTUNITIES.length}`,
  variant: 'emerald', // 'primary' | 'emerald' | 'amber' | 'rose' | 'slate'
  dynamicCount: () => ALL_OPPORTUNITIES.length,
}
```

When new items are added to `ALL_OPPORTUNITIES`, the badge in the sidebar updates automatically with zero changes to navigation code.

---

## 5. How to Handle Legacy Route Redirects

When renaming or reorganizing a route, maintain backward compatibility without dead links by using `redirectsFrom`:

```typescript
// Inside your manifest entry:
route: '/tools/credential-engine',
redirectsFrom: [
  '/tools/credentials',
  '/tools/opportunity-engine',
],
```

The system registers these in the canonical redirect table. Any user visiting or bookmarking `/tools/credentials` is automatically redirected to `/tools/credential-engine`.

---

## 6. What the Navigation Validator Checks

Run the automated navigation validator anytime:
```powershell
npm run validate:nav
```
*(The validator is also automatically executed as a gate during `npm run build`.)*

The validator enforces the following rules:
1. **Uniqueness**: Every section ID, entry ID, and route path must be globally unique.
2. **Referential Integrity**: Every entry's `section` must reference a valid section ID defined in a manifest or `'root'`.
3. **Icon Verification**: Every `icon` string must exist in `lucide-react`.
4. **Role Isolation**: Role access definitions must only contain valid platform roles (`BHR_MANAGER`, `HR_RECRUITER`, `INTERVIEWER`, `CANDIDATE`, `PLATFORM_ADMIN`) or `'all'`.
5. **No Broken Links**: Canonical redirects must point to registered, working routes.
6. **Required Metadata**: All entries must provide `id`, `label`, `description`, `route`, `icon`, `section`, `roles`, and `keywords`.

---

## 7. Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Toggle Command Palette Search |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> / <kbd>Cmd</kbd> + <kbd>B</kbd> | Toggle Sidebar Collapse / Icon Rail |
| <kbd>Esc</kbd> | Dismiss Command Palette / Close Mobile Drawer |
| <kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> | Skip to Main Content / Navigate Focus |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Down</kbd> | Navigate Search Suggestions |
| <kbd>Enter</kbd> | Open Selected Result |
