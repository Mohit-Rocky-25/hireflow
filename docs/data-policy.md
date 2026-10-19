# HireFlow v3 — Data Provenance & Verification Policy (P-6)

## 1. Core Principles

Under Principle P-6 (**PROVENANCE ON DATA**) and P-1 (**NEVER FABRICATE**), every record across all static datasets in HireFlow carries mandatory metadata fields:

```typescript
export interface ProvenanceMetadata {
  source: string;              // Name of the official organization, provider, or dataset
  sourceUrl: string | null;    // Direct URL to the official source (null if unconfirmed)
  lastVerified: string | null; // ISO 8601 date string (YYYY-MM-DD) or null
  confidence: 'high' | 'medium' | 'low';
  status: 'verified' | 'needs-recheck' | 'unverified';
}
```

If any attribute of a record (fee, eligibility, deadline, salary, role title) is unknown, the field must remain `null` or marked `"unverified"`. Fabricating numbers, dates, or URLs is strictly forbidden.

---

## 2. Freshness Lifecycle

Dates, fees, and eligibility for tech certifications and hackathons fluctuate annually. The system evaluates record freshness dynamically:

- **Fresh (`< 6 months`)**: Verified within the last 180 days. Displayed with a green verified badge.
- **Aging (`6 to 12 months`)**: Verified between 180 and 365 days ago. Flagged with a warning to double-check official documentation.
- **Stale (`> 12 months` or `null`)**: Requires active verification. A notice prompts the user to visit the official URL before relying on the information.

---

## 3. How to Verify a Record

To update an unverified or aging record in the repository:

1. **Locate the Target Dataset**:
   - Credentials: `src/data/credentials/` or `config/credentials.json`
   - Company Leveling: `src/data/career/`
   - Role Taxonomy: `config/roles/`
   - Build Briefs: `src/data/briefs/`

2. **Conduct the Verification**:
   - Visit the official portal (e.g., AWS Training & Certification, Microsoft Learn, official college placement brochures).
   - Confirm current fee, eligibility criteria, and examination formats.

3. **Update the Metadata**:
   - Set `status`: `"verified"`
   - Set `lastVerified`: Current ISO date (e.g., `"2026-10-19"`)
   - Set `sourceUrl`: Direct official URL
   - Set `confidence`: `"high"`

4. **Run Validation**:
   ```powershell
   npm run validate:data
   ```
   Ensure zero schema errors or invalid URL structures are introduced.
