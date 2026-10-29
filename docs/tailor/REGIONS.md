# HireFlow Regional Profiles & Localization

## Overview

Resume expectations vary significantly by geographical market and hiring culture. HireFlow parameterizes these expectations in `RegionProfile` rather than using hardcoded conditional branches in UI or layout code.

---

## Supported Regional Profiles

### 1. `us` (United States Standard)
- **Paper Geometry**: Letter ($612.0 \times 792.0$ pt).
- **Spelling Profile**: American English (`en-US` — *optimized*, *analyzed*, *color*).
- **Photo / Headshot**: Strictly disallowed (anti-bias compliance).
- **Date of Birth**: Strictly disallowed.
- **Academic Score Scale**: GPA ($4.0$ scale).
- **Declaration / Signature**: Not used.

### 2. `india-campus` (Indian Tier-1/2 Engineering Campus Placement)
- **Paper Geometry**: A4 ($595.28 \times 841.89$ pt).
- **Spelling Profile**: Commonwealth English (`en-IN` / `en-GB` — *optimised*, *analysed*, *colour*).
- **Photo / Headshot**: Default off (enabled only if required by specific campus cell).
- **Academic Score Scale**: CGPA ($10.0$ scale) or Percentage aggregate.
- **Batch Eligibility**: Batch year strictly matched against graduating class (e.g. Batch 2026).
- **Section Ordering**: **Education** front-loaded at the top per campus recruitment protocols (`R5`).

### 3. `india-private` (Indian Experienced Tech Market)
- **Paper Geometry**: A4 ($595.28 \times 841.89$ pt).
- **Spelling Profile**: Commonwealth English (`en-IN` / `en-GB`).
- **Section Ordering**: **Experience** first, followed by **Projects** and **Skills**.
- **Currency Format**: Preserves Indian numbering format (₹, L, Cr) via metric extractor.

### 4. `uk` (United Kingdom Standard)
- **Paper Geometry**: A4 ($595.28 \times 841.89$ pt).
- **Spelling Profile**: British English (`en-GB` — *optimised*, *programme*, *centre*).
- **Academic Score Scale**: Honours classifications (First Class, 2:1, 2:2).
- **Photo / Headshot**: Disallowed.

### 5. `gulf` (Middle East / GCC)
- **Paper Geometry**: A4 ($595.28 \times 841.89$ pt).
- **Spelling Profile**: American / International English.
- **Photo / Nationality**: Configurable per regional enterprise portal requirements.

### 6. `eu` (European Union Standard)
- **Paper Geometry**: A4 ($595.28 \times 841.89$ pt).
- **Spelling Profile**: British / International English.
- **Languages**: Emphasizes multilingual proficiencies.
