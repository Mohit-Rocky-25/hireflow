# HireFlow Architecture Reference

## Overview
HireFlow is an enterprise candidate career intelligence and ATS evaluation platform built with React 19, TypeScript, Vite, Tailwind CSS, and Zustand.

## Folder Directory (One Line Per Folder)
- **`src/app/`**: Application shell, top header, sidebar navigation, public navbar, and role-based route guards.
- **`src/pages/`**: Thin route-level page components for public routes, company portals, interviewer workflows, and admin portals.
- **`src/features/ats/`**: Deterministic ATS resume evaluation engine, evidence scorer, format auditor, and benchmark tests.
- **`src/features/career-path/`**: Career trajectory simulator, dream job roadmap generator, and company leveling explorer.
- **`src/features/suite/`**: Candidate Decision Suite tools (Compare JDs, Resume Tailor, Outreach Generator, Project Briefs, Credentials Engine, Profile Drawer).
- **`src/components/`**: Shared reusable UI primitives (PageNav, buttons, modals, badges, cards, charts, icons).
- **`src/data/`**: Central shared data layer containing company databases, role competencies, academic calendars, and knowledge taxonomies.
- **`src/lib/`**: Shared pure libraries, security hashing, file parsers, word counters, and deterministic AI scoring providers.
- **`src/store/`**: Global state management with Zustand, seed datasets, demo fixtures, and local storage persistence.
- **`src/types/`**: Global TypeScript definitions for users, companies, jobs, applications, interviews, and audits.
- **`public/`**: Static production assets, favicons, SVG sprite icons, and HTTP security headers.
- **`scripts/`**: Automation tools for security scanning, credential checks, and synthetic dataset generation.
- **`docs/`**: Production specifications, security reports, and architectural blueprints.

## Shared Data Layer
- All domain datasets live strictly under `src/data/` (or `src/careers-core/data/`).
- Features import from the shared data layer via `@/data/...` — no component maintains private duplicated copies.
- Heavy datasets (>500 KB) are loaded lazily or dynamically streamed to optimize client bundle size.

## Routing System
- Client routing is orchestrated in `src/App.tsx` using `react-router-dom` v7.
- Route protection is enforced through `src/app/ProtectedRoute.tsx`, gating views by role: `BHR_MANAGER`, `HR_RECRUITER`, `INTERVIEWER`, `PLATFORM_ADMIN`.
- Candidate navigation is centralized under `/tools` (Decision Suite) with automatic backwards-compatible redirects for legacy candidate paths.

## How to Add a Feature
1. Create a focused directory under `src/features/<feature-name>/`.
2. Encapsulate business logic, subcomponents, and feature-specific tests within that directory.
3. Expose a route entry page in `src/pages/` (or under `src/features/<feature-name>/`) and register the path in `src/App.tsx`.
4. If reusable cross-feature utilities are required, place them in `src/lib/` or `src/components/`.

## How to Add a Dataset
1. Place the canonical JSON or TypeScript data model in `src/data/<dataset-name>/`.
2. Add corresponding Zod schema validation under `src/data/__tests__/` to guarantee data integrity.
3. Export the typed dataset through a clean entry point in `src/data/index.ts` or directly via `@/data/<dataset-name>`.
