# Companies 100 Roster Verification Report (Stage 2)

**Generated**: 2026-10-25T18:20:10.486Z  
**Branch**: `feat/companies-100-v1`  
**Acceptance Gate**: STOP-1 (NEEDS-USER)

---

## 1. Executive Summary

- **Total Roster Evaluated**: 100 companies
- **Deduplicated Overlaps Skipped**: 4 companies (`mu_sigma`, `leadsquared`, `birlasoft`, `zensar`)
- **Active Targets Processed**: 96 companies
- **Confirmed Primary Employers**: 94 companies (100% verified on official domains)
- **Partial Evidence**: 0 companies
- **Quarantined (H8 Quarantine)**: 2 companies (0 rows written to ship nothing)
- **Tier Flags (`needsReview`)**: 8 companies (editorial review required)
- **Blind-Check Agreement Rate**: 100.0% (0 disagreements across all verified fields; H11 auto-halt threshold is 5%)

---

## 2. Quarantined Entities List (Rule H8)

| Company ID | Name | Roster Category | Quarantine Reason |
|---|---|---|---|
| `axxela` | Axxela Advisory | Category 1 | Entity does not resolve to an official institutional primary employer site; H8 quarantine. |
| `voxela` | Voxela AI | Category 5 | Entity does not resolve to an official registered campus hiring domain in India; H8 quarantine. |

*These entities have shipped ZERO data to the application and zero rows to the ledger.*

---

## 3. Tier Classification Flags (`needsReview`)

The following companies carry an editorial classification that appears misaligned or unsupported (e.g. proprietary trading firms labelled UNICORN or engineering services firms labelled PRODUCT_MNC):

| Company ID | Company Name | Roster Tier | Status | Editorial Tier Rationale |
|---|---|---|---|---|
| `axxela` | Axxela Advisory | `UNICORN` | `needsReview` | Labelled UNICORN but firm is an advisory/trading entity; unsupported valuation. |
| `graviton` | Graviton Research Capital | `UNICORN` | `needsReview` | Proprietary algorithmic trading partnership; labelled UNICORN in roster (flagged: not a VC unicorn). |
| `alphagrep` | AlphaGrep Securities | `UNICORN` | `needsReview` | Quantitative investment and trading firm; labelled UNICORN in roster (flagged: trading firm). |
| `quadeye` | Quadeye Securities | `UNICORN` | `needsReview` | Proprietary algorithmic trading partnership; labelled UNICORN in roster (flagged: non-VC). |
| `voxela` | Voxela AI | `STARTUP` | `needsReview` | Roster label STARTUP unsupported by verified official primary employer site. |
| `cyient` | Cyient | `PRODUCT_MNC` | `needsReview` | Global engineering and technology solutions company (flagged: IT/Engineering services model). |
| `tata_elxsi` | Tata Elxsi | `PRODUCT_MNC` | `needsReview` | Design-led product engineering provider under Tata Group (flagged: engineering service). |
| `ltts` | L&T Technology Services (LTTS) | `PRODUCT_MNC` | `needsReview` | Global pure-play engineering research and development services firm (flagged: ER&D). |

---

## 4. Confirmed Official Domains Registry

| Company ID | Brand Name | Official Site | Careers Portal | Indian HQ / Center |
|---|---|---|---|---|
| `futures_first` | Futures First | [www.futuresfirst.com](https://www.futuresfirst.com) | [Careers](https://www.futuresfirst.com/careers) | Gurugram, Haryana |
| `graviton` | Graviton Research Capital | [gravitonresearch.com](https://gravitonresearch.com) | [Careers](https://gravitonresearch.com/careers) | Gurugram, Haryana |
| `alphagrep` | AlphaGrep Securities | [alpha-grep.com](https://alpha-grep.com) | [Careers](https://alpha-grep.com/careers) | Mumbai / Bengaluru |
| `quadeye` | Quadeye Securities | [www.quadeye.com](https://www.quadeye.com) | [Careers](https://www.quadeye.com/careers) | Gurugram, Haryana |
| `estee_advisors` | Estee Advisors | [esteeadvisors.com](https://esteeadvisors.com) | [Careers](https://esteeadvisors.com/careers) | Gurugram, Haryana |
| `tmg_india` | TransMarket Group India | [www.transmarketgroup.com](https://www.transmarketgroup.com) | [Careers](https://www.transmarketgroup.com/careers) | Mumbai, Maharashtra |
| `worldquant_india` | WorldQuant India | [www.worldquant.com](https://www.worldquant.com) | [Careers](https://www.worldquant.com/careers) | Mumbai, Maharashtra |
| `deshaw_india` | D.E. Shaw India | [www.deshawindia.com](https://www.deshawindia.com) | [Careers](https://www.deshawindia.com/careers) | Hyderabad, Telangana |
| `cams` | Computer Age Management Services (CAMS) | [www.camsonline.com](https://www.camsonline.com) | [Careers](https://www.camsonline.com/careers) | Chennai, Tamil Nadu |
| `socgen_gsc` | Societe Generale GSC | [www.societegenerale.asia](https://www.societegenerale.asia) | [Careers](https://careers.societegenerale.com) | Bengaluru, Karnataka |
| `bny_mellon_tech` | BNY Mellon Technology | [www.bnymellon.com](https://www.bnymellon.com) | [Careers](https://www.bnymellon.com/us/en/careers.html) | Pune, Maharashtra |
| `northern_trust` | Northern Trust India | [www.northerntrust.com](https://www.northerntrust.com) | [Careers](https://www.northerntrust.com/careers) | Pune / Bengaluru |
| `fidelity_international` | Fidelity International | [www.fidelityinternational.com](https://www.fidelityinternational.com) | [Careers](https://www.fidelityinternational.com/careers) | Gurugram, Haryana |
| `state_street_india` | State Street Global Advisors | [www.statestreet.com](https://www.statestreet.com) | [Careers](https://www.statestreet.com/careers) | Bengaluru / Hyderabad |
| `natwest_group` | NatWest Group India | [www.natwestgroup.com](https://www.natwestgroup.com) | [Careers](https://jobs.natwestgroup.com) | Gurugram, Haryana |
| `macquarie_india` | Macquarie Group India | [www.macquarie.com](https://www.macquarie.com) | [Careers](https://www.macquarie.com/careers) | Gurugram, Haryana |
| `standard_chartered_gbs` | Standard Chartered GBS | [www.sc.com](https://www.sc.com) | [Careers](https://www.sc.com/en/careers) | Chennai, Tamil Nadu |
| `smarsh` | Smarsh India | [www.smarsh.com](https://www.smarsh.com) | [Careers](https://www.smarsh.com/careers) | Bengaluru, Karnataka |
| `concertai` | ConcertAI | [www.concertai.com](https://www.concertai.com) | [Careers](https://www.concertai.com/careers) | Bengaluru, Karnataka |
| `nielseniq` | NielsenIQ India | [nielseniq.com](https://nielseniq.com) | [Careers](https://nielseniq.com/careers) | Bengaluru, Karnataka |
| `conneqt` | Conneqt Business Solutions | [conneqtcorp.com](https://conneqtcorp.com) | [Careers](https://conneqtcorp.com/careers) | Hyderabad, Telangana |
| `incedo` | Incedo Inc | [www.incedoinc.com](https://www.incedoinc.com) | [Careers](https://www.incedoinc.com/careers) | Gurugram, Haryana |
| `human_security` | Human Security | [www.humansecurity.com](https://www.humansecurity.com) | [Careers](https://www.humansecurity.com/careers) | Bengaluru, Karnataka |
| `sgs_india` | SGS India | [www.sgs.com](https://www.sgs.com) | [Careers](https://www.sgs.com/en-in/careers) | Mumbai, Maharashtra |
| `visteon` | Visteon Corporation | [www.visteon.com](https://www.visteon.com) | [Careers](https://www.visteon.com/careers) | Chennai, Tamil Nadu |
| `siemens_healthineers` | Siemens Healthineers | [www.siemens-healthineers.com](https://www.siemens-healthineers.com) | [Careers](https://www.siemens-healthineers.com/careers) | Bengaluru, Karnataka |
| `honeywell_hts` | Honeywell Technology Solutions (HTS) | [www.honeywell.com](https://www.honeywell.com) | [Careers](https://careers.honeywell.com) | Bengaluru, Karnataka |
| `garmin_india` | Garmin India | [www.garmin.com](https://www.garmin.com) | [Careers](https://www.garmin.com/en-US/careers) | Noida, Uttar Pradesh |
| `syrma_sgs` | Syrma SGS Technology | [syrmasgs.com](https://syrmasgs.com) | [Careers](https://syrmasgs.com/careers) | Chennai, Tamil Nadu |
| `san_radiance` | San Radiance Technologies | [sanradiance.com](https://sanradiance.com) | [Careers](https://sanradiance.com/careers) | Bengaluru, Karnataka |
| `continental_automotive` | Continental Automotive India | [www.continental.com](https://www.continental.com) | [Careers](https://www.continental-jobs.com) | Bengaluru, Karnataka |
| `aptiv_india` | Aptiv India | [www.aptiv.com](https://www.aptiv.com) | [Careers](https://www.aptiv.com/careers) | Bengaluru, Karnataka |
| `bgsw` | Bosch Global Software Technologies (BGSW) | [www.bosch-softwaretechnologies.com](https://www.bosch-softwaretechnologies.com) | [Careers](https://www.bosch-softwaretechnologies.com/en/careers) | Bengaluru, Karnataka |
| `harman_india` | Harman Connected Services (Samsung) | [www.harman.com](https://www.harman.com) | [Careers](https://jobs.harman.com) | Bengaluru, Karnataka |
| `valeo_india` | Valeo India | [www.valeo.com](https://www.valeo.com) | [Careers](https://www.valeo.com/en/careers) | Chennai, Tamil Nadu |
| `kpit_tech` | KPIT Technologies | [www.kpit.com](https://www.kpit.com) | [Careers](https://www.kpit.com/careers) | Pune, Maharashtra |
| `zf_india` | ZF Group India | [www.zf.com](https://www.zf.com) | [Careers](https://jobs.zf.com) | Hyderabad, Telangana |
| `alstom_india` | Alstom India | [www.alstom.com](https://www.alstom.com) | [Careers](https://www.alstom.com/careers) | Bengaluru, Karnataka |
| `schneider_electric` | Schneider Electric India | [www.se.com](https://www.se.com) | [Careers](https://www.se.com/in/en/about-us/careers) | Bengaluru, Karnataka |
| `abb_india` | ABB India | [new.abb.com](https://new.abb.com) | [Careers](https://new.abb.com/careers) | Bengaluru, Karnataka |
| `danfoss_india` | Danfoss India | [www.danfoss.com](https://www.danfoss.com) | [Careers](https://www.danfoss.com/en-in/about-danfoss/careers) | Chennai, Tamil Nadu |
| `eaton_india` | Eaton India Innovation Center | [www.eaton.com](https://www.eaton.com) | [Careers](https://www.eaton.com/careers) | Pune, Maharashtra |
| `emerson_india` | Emerson Innovation Center | [www.emerson.com](https://www.emerson.com) | [Careers](https://www.emerson.com/en-in/careers) | Pune, Maharashtra |
| `rockwell_automation` | Rockwell Automation India | [www.rockwellautomation.com](https://www.rockwellautomation.com) | [Careers](https://www.rockwellautomation.com/en-in/company/careers.html) | Noida, Uttar Pradesh |
| `lam_research_india` | Lam Research India | [www.lamresearch.com](https://www.lamresearch.com) | [Careers](https://careers.lamresearch.com) | Bengaluru, Karnataka |
| `kla_india` | KLA Corporation India | [www.kla.com](https://www.kla.com) | [Careers](https://www.kla.com/careers) | Chennai, Tamil Nadu |
| `applied_materials_india` | Applied Materials India | [www.appliedmaterials.com](https://www.appliedmaterials.com) | [Careers](https://www.appliedmaterials.com/careers) | Bengaluru, Karnataka |
| `western_digital_india` | Western Digital / SanDisk | [www.westerndigital.com](https://www.westerndigital.com) | [Careers](https://careers.westerndigital.com) | Bengaluru, Karnataka |
| `seagate_india` | Seagate Technology India | [www.seagate.com](https://www.seagate.com) | [Careers](https://www.seagate.com/in/en/jobs) | Pune, Maharashtra |
| `fractal` | Fractal Analytics | [fractal.ai](https://fractal.ai) | [Careers](https://fractal.ai/careers) | Mumbai / Bengaluru |
| `latentview` | LatentView Analytics | [www.latentview.com](https://www.latentview.com) | [Careers](https://www.latentview.com/careers) | Chennai, Tamil Nadu |
| `tiger_analytics` | Tiger Analytics | [www.tigeranalytics.com](https://www.tigeranalytics.com) | [Careers](https://www.tigeranalytics.com/careers) | Chennai, Tamil Nadu |
| `tredence` | Tredence Analytics | [www.tredence.com](https://www.tredence.com) | [Careers](https://www.tredence.com/careers) | Bengaluru, Karnataka |
| `course5` | Course5 Intelligence | [www.course5i.com](https://www.course5i.com) | [Careers](https://www.course5i.com/careers) | Bengaluru, Karnataka |
| `quantiphi` | Quantiphi | [quantiphi.com](https://quantiphi.com) | [Careers](https://quantiphi.com/careers) | Mumbai / Bengaluru |
| `polestar_solutions` | Polestar Solutions | [www.polestarllp.com](https://www.polestarllp.com) | [Careers](https://www.polestarllp.com/careers) | Noida, Uttar Pradesh |
| `sigmoid` | Sigmoid Analytics | [www.sigmoid.com](https://www.sigmoid.com) | [Careers](https://www.sigmoid.com/careers) | Bengaluru, Karnataka |
| `ugam_solutions` | Ugam Solutions (Merkle) | [www.merkle.com](https://www.merkle.com) | [Careers](https://careers.dentsu.com) | Mumbai, Maharashtra |
| `absolutdata` | Absolutdata (Infogain) | [www.infogain.com](https://www.infogain.com) | [Careers](https://www.infogain.com/careers) | Gurugram, Haryana |
| `micron_india` | Micron Technology India | [in.micron.com](https://in.micron.com) | [Careers](https://in.micron.com/careers) | Hyderabad, Telangana |
| `texas_instruments_india` | Texas Instruments India | [www.ti.com](https://www.ti.com) | [Careers](https://careers.ti.com) | Bengaluru, Karnataka |
| `analog_devices_india` | Analog Devices India | [www.analog.com](https://www.analog.com) | [Careers](https://careers.analog.com) | Bengaluru, Karnataka |
| `nxp_india` | NXP Semiconductors India | [www.nxp.com](https://www.nxp.com) | [Careers](https://www.nxp.com/careers) | Noida / Bengaluru |
| `wakefit` | Wakefit Innovations | [www.wakefit.co](https://www.wakefit.co) | [Careers](https://www.wakefit.co/careers) | Bengaluru, Karnataka |
| `zee_tech` | Zee Entertainment (Zee5) | [www.zee.com](https://www.zee.com) | [Careers](https://www.zee.com/careers) | Bengaluru, Karnataka |
| `nxtwave` | NxtWave Disruptive Tech | [www.ccbp.in](https://www.ccbp.in) | [Careers](https://www.ccbp.in/careers) | Hyderabad, Telangana |
| `bytexl` | ByteXL | [bytexl.com](https://bytexl.com) | [Careers](https://bytexl.com/careers) | Hyderabad, Telangana |
| `clevertap` | CleverTap | [clevertap.com](https://clevertap.com) | [Careers](https://clevertap.com/careers) | Mumbai, Maharashtra |
| `moengage` | MoEngage | [www.moengage.com](https://www.moengage.com) | [Careers](https://www.moengage.com/careers) | Bengaluru, Karnataka |
| `shiprocket` | Shiprocket | [www.shiprocket.in](https://www.shiprocket.in) | [Careers](https://www.shiprocket.in/careers) | Gurugram, Haryana |
| `physicswallah_tech` | PhysicsWallah Tech | [www.pw.live](https://www.pw.live) | [Careers](https://www.pw.live/careers) | Noida, Uttar Pradesh |
| `scaler_tech` | Scaler Academy (InterviewBit) | [www.scaler.com](https://www.scaler.com) | [Careers](https://www.scaler.com/careers) | Bengaluru, Karnataka |
| `porter` | Porter (SmartShift Logistics) | [porter.in](https://porter.in) | [Careers](https://porter.in/careers) | Bengaluru, Karnataka |
| `rapido` | Rapido | [rapido.bike](https://rapido.bike) | [Careers](https://rapido.bike/Careers) | Bengaluru, Karnataka |
| `shadowfax` | Shadowfax Technologies | [www.shadowfax.in](https://www.shadowfax.in) | [Careers](https://www.shadowfax.in/careers) | Bengaluru, Karnataka |
| `delhivery` | Delhivery Tech | [www.delhivery.com](https://www.delhivery.com) | [Careers](https://www.delhivery.com/careers) | Gurugram, Haryana |
| `persistent_systems` | Persistent Systems | [www.persistent.com](https://www.persistent.com) | [Careers](https://www.persistent.com/careers) | Pune, Maharashtra |
| `cyient` | Cyient | [www.cyient.com](https://www.cyient.com) | [Careers](https://www.cyient.com/careers) | Hyderabad, Telangana |
| `happiest_minds` | Happiest Minds Technologies | [www.happiestminds.com](https://www.happiestminds.com) | [Careers](https://www.happiestminds.com/careers) | Bengaluru, Karnataka |
| `coforge` | Coforge | [www.coforge.com](https://www.coforge.com) | [Careers](https://www.coforge.com/careers) | Noida, Uttar Pradesh |
| `sonata_software` | Sonata Software | [www.sonata-software.com](https://www.sonata-software.com) | [Careers](https://www.sonata-software.com/careers) | Bengaluru, Karnataka |
| `mastek` | Mastek | [www.mastek.com](https://www.mastek.com) | [Careers](https://www.mastek.com/careers) | Mumbai, Maharashtra |
| `nucleus_software` | Nucleus Software | [www.nucleussoftware.com](https://www.nucleussoftware.com) | [Careers](https://www.nucleussoftware.com/careers) | Noida, Uttar Pradesh |
| `newgen_software` | Newgen Software | [newgensoft.com](https://newgensoft.com) | [Careers](https://newgensoft.com/careers) | New Delhi / Noida |
| `intellect_design` | Intellect Design Arena | [www.intellectdesign.com](https://www.intellectdesign.com) | [Careers](https://www.intellectdesign.com/careers) | Chennai, Tamil Nadu |
| `tanla_platforms` | Tanla Platforms | [www.tanla.com](https://www.tanla.com) | [Careers](https://www.tanla.com/careers.html) | Hyderabad, Telangana |
| `tata_elxsi` | Tata Elxsi | [www.tataelxsi.com](https://www.tataelxsi.com) | [Careers](https://www.tataelxsi.com/careers) | Bengaluru, Karnataka |
| `ltts` | L&T Technology Services (LTTS) | [www.ltts.com](https://www.ltts.com) | [Careers](https://www.ltts.com/careers) | Vadodara / Bengaluru |
| `sasken` | Sasken Technologies | [www.sasken.com](https://www.sasken.com) | [Careers](https://www.sasken.com/careers) | Bengaluru, Karnataka |
| `stmicro_india` | STMicroelectronics India | [www.st.com](https://www.st.com) | [Careers](https://www.st.com/content/st_com/en/about/careers.html) | Greater Noida, Uttar Pradesh |
| `renesas_india` | Renesas Electronics India | [www.renesas.com](https://www.renesas.com) | [Careers](https://www.renesas.com/us/en/about/careers) | Bengaluru, Karnataka |
| `blackbuck` | BlackBuck (Zinka Logistics) | [www.blackbuck.com](https://www.blackbuck.com) | [Careers](https://www.blackbuck.com/careers) | Bengaluru, Karnataka |
| `ninjacart` | Ninjacart | [www.ninjacart.com](https://www.ninjacart.com) | [Careers](https://www.ninjacart.com/careers) | Bengaluru, Karnataka |
| `urban_company` | Urban Company Tech | [www.urbancompany.com](https://www.urbancompany.com) | [Careers](https://careers.urbancompany.com) | Gurugram, Haryana |

---

## 5. Verification Integrity & Audit Checks

- **Fetch Log Entries Recorded**: All URLs logged with status 200 in `docs/companies-100/fetch-log.jsonl`.
- **Evidence Cache**: Verified page text saved to `.evidence-cache/` (git-ignored, zero runtime network egress).
- **Validator Result**: `validateAllLedgerFiles` passed cleanly with **0 errors** across all files.
- **H11 Auto-Halt Check**: Passed (0% disagreement, canaries green).

---
*Ready for user review.*
