/**
 * HireFlow Platform Metadata & Data Provenance Constants
 * Single source of truth for platform company counts, audit tiers, and catalog snapshot dates.
 * Follows Rule 1 & Rule 2: No over-marketing, no fabricated counts.
 */

export const ATS_CATALOG_SNAPSHOT_DATE = 'October 2026';

export const PLATFORM_DATA_META = {
  atsCatalogSnapshotDate: ATS_CATALOG_SNAPSHOT_DATE,
  companyCounts: {
    totalPlatformListings: 244,
    fullProfiles: 235, // Profiles with level ladders, roles, and compensation estimate bands
    sourcedProfiles: 107, // Profiles audited against direct public sources
    legacyProfiles: 128, // Representative profiles pending detailed manual audit
    basicListings: 9, // Basic directory records (name, sector, external links only)
  },
  definitions: {
    fullProfile:
      'Detailed company profile containing role taxonomy, level ladders, competency rubrics, and salary estimate ranges.',
    basicListing:
      'Basic directory listing providing employer name, sector, official career link, and ATS family.',
    atsCatalog:
      `ATS provider used by employer based on static platform audit snapshot (${ATS_CATALOG_SNAPSHOT_DATE}).`,
    salaryEstimate:
      'Salary ranges are estimates based on public compensation reports and community disclosures. Actual compensation varies by candidate, campus, and negotiation.',
  },
} as const;

export const ATS_LABEL_TEXT = `ATS used by employer (from static catalogue, as of ${ATS_CATALOG_SNAPSHOT_DATE})`;

export function getCompanyCountsSummary(): string {
  const { fullProfiles, basicListings } = PLATFORM_DATA_META.companyCounts;
  return `${fullProfiles} company profiles & ${basicListings} directory listings`;
}
