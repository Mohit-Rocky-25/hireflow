# Companies 100 Roster Deduplication Report (Task 2.1)

**Date**: 2026-10-25  
**Branch**: `feat/companies-100-v1`  
**Policy**: Rule W7 & Stage 2 Specification: *Default is skip for overlaps; never modify legacy entries.*

---

## 1. Executive Summary

- **Total Roster Candidates**: 100 companies (across 6 categories: 10, 15, 25, 15, 15, 20)
- **Existing Legacy Companies Audited**: 141 companies (~1,450 active roles) in `RAW_COMPANIES`
- **Exact Overlaps Found**: 4 companies
- **Action Taken**: **SKIP** all 4 overlaps. Legacy entries remain untouched.
- **Net Net Roster for Verification**: **96 unique new employers**

---

## 2. Identified Overlaps & Action Ledger

| Company ID | Roster Name | Category | Existing Legacy Entry | Action | Rationale |
|---|---|---|---|---|---|
| `mu_sigma` | Mu Sigma | Category 4: Analytics & AI | `id: "mu_sigma"`, `tier: "IT Services"` | **SKIP** | Already present in `RAW_COMPANIES`. Legacy roles preserved. |
| `leadsquared` | LeadSquared | Category 5: High-Growth Tech | `id: "leadsquared"`, `tier: "Startup"` | **SKIP** | Already present in `RAW_COMPANIES`. Legacy roles preserved. |
| `birlasoft` | Birlasoft | Category 6: IT Consulting | `id: "birlasoft"`, `tier: "IT Services"` | **SKIP** | Already present in `RAW_COMPANIES`. Legacy roles preserved. |
| `zensar` | Zensar Technologies | Category 6: IT Consulting | `id: "zensar"`, `tier: "IT Services"` | **SKIP** | Already present in `RAW_COMPANIES`. Legacy roles preserved. |

---

## 3. Net Verification Target per Category

| Category Index | Category Name | Roster Input Count | Overlaps Skipped | Net Verification Target |
|---|---|---|---|---|
| Category 1 | Proprietary Trading, Quant & Financial Markets | 10 | 0 | 10 |
| Category 2 | Global Capability Centers (GCCs) & Banking Tech | 15 | 0 | 15 |
| Category 3 | Core Engineering, Embedded Systems, IoT & Automotive | 25 | 0 | 25 |
| Category 4 | Analytics, AI & Enterprise Data Platforms | 15 | 1 (`mu_sigma`) | 14 |
| Category 5 | High-Growth Indian Tech, D2C & EdTech | 15 | 1 (`leadsquared`) | 14 |
| Category 6 | Mid-Market IT Consulting, Digital Engineering & SaaS | 20 | 2 (`birlasoft`, `zensar`) | 18 |
| **TOTAL** | | **100** | **4** | **96** |

---

## 4. Verification Execution Plan

The remaining 96 employers are partitioned into **10 manageable batches of 9-10 companies each**:
- **Batch 1**: Category 1 (Companies 1–10: Tower Research, Graviton, NK Securities, Alphagrep, Quadeye, WorldQuant, DE Shaw, Jane Street India, IMC Trading, Optiver India)
- **Batch 2**: Category 2 (Companies 11–20: JP Morgan GCC, Goldman Sachs India, Morgan Stanley India, Wells Fargo India, Barclays Global Service Centre, BNY Mellon Technology, UBS Business Solutions, Fidelity Investments India, Standard Chartered GBS, Deutsche Bank CIB Tech)
- **Batch 3**: Category 2 & 3 (Companies 21–30: State Street, NatWest, Societe Generale GSC, Citi GCC, Northern Trust, Texas Instruments, Qualcomm India, NXP Semiconductors, MediaTek India, Synopsys India)
- **Batch 4**: Category 3 (Companies 31–40: Cadence Design Systems, Intel India, AMD India, Applied Materials, Western Digital, Micron Technology India, Bosch Global Software, Continental Automotive, Aptiv India, Mercedes-Benz R&D)
- **Batch 5**: Category 3 (Companies 41–50: Stellantis India, ZF Group India, Eaton India, Cummins India, Honeywell Technology, Schneider Electric R&D, ABB India, Siemens Technology India, L&T Technology Services, Tata Elxsi)
- **Batch 6**: Category 3 & 4 (Companies 51–60: KPIT Technologies, Cyient, Quest Global, Expleo India, Sasken Technologies, Fractal Analytics, Tiger Analytics, LatentView Analytics, Tredence Analytics, Course5 Intelligence)
- **Batch 7**: Category 4 & 5 (Companies 61–70: Absolutdata/Infogain, Ugam Solutions, Quantiphi, Polestar Solutions, Sigmoid Analytics, InMobi, Glance, Dailyhunt/VerSe, Postman, Hasura)
- **Batch 8**: Category 5 (Companies 71–80: BrowserStack, Chargebee, Innovaccer, Darwinbox, CleverTap, Icertis, Uniphore, Druva, Yellow.ai, Gupshup)
- **Batch 9**: Category 6 (Companies 81–90: Sonata Software, Coforge, Persistent Systems, KPIT Technologies, Hexaware, Mphasis, Mindtree/LTIMindtree, Cyient, Birlasoft [skip], Zensar [skip], Happiest Minds, Newgen Software)
- **Batch 10**: Category 6 (Companies 91–100: Nucleus Software, Intellect Design Arena, Sonata, Datamatics, Kellton Tech, Saksoft, Cigniti Technologies, ITC Infotech, Larsen & Toubro Infotech, Tata Technologies)

*Each company will be processed strictly ONE AT A TIME with fetch logging, text caching, and ledger generation.*
