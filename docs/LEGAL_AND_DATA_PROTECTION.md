# HireFlow — Legal Architecture, Data Provenance & Statutory Protection Framework

> **Document Version:** 4.2.0  
> **Effective Date:** November 2026  
> **Status:** Authoritative Legal & Technical Disclosure  
> **Governing Jurisdiction:** Republic of India (with international nominative fair use applicability)

---

## 1. Executive Summary & Purpose

HireFlow is an evidence-first placement-readiness and technical evaluation platform for Indian software engineering candidates. 

This document sets forth the comprehensive **legal architecture, public data sourcing methodology, anti-circumvention compliance, and statutory protections** that govern how HireFlow collects, processes, and displays real-world employer job specifications and candidate evaluations.

HireFlow operates under four non-negotiable architectural axioms:
1. **Zero Fake Jobs (Primary Source Truth):** Flagship employer positions are ingested directly from verified, publicly available Applicant Tracking System (ATS) endpoints (Greenhouse, Lever) published by the employers themselves.
2. **Zero Credentials / Open Access Doctrine:** No private APIs, authentication keys, credentials, paywalls, or access controls are bypassed. The system only accesses unauthenticated, machine-readable feeds that employers place on the open internet to attract job applicants.
3. **100% Zero-Egress Candidate Privacy (Hard Rule R8.2):** Candidate resumes, text, personal identifiable information (PII), and evaluation scores are processed **100% locally within the client browser memory**. No candidate resume is ever transmitted to remote servers, external APIs, or third-party trackers.
4. **Fair Dealing & Employer Attribution:** Every ingested position maintains complete verbatim employer attribution and provides a prominent, direct **"Apply on Official ATS ↗"** link to the employer's official recruitment portal.

---

## 2. Public ATS Ingestion Architecture & Pipeline

### 2.1 The Levels.fyi Strategy: Unauthenticated Public Feeds
Modern tech employers (including CRED, Meesho, Stripe, MongoDB, InMobi, GitLab, Rubrik, Elastic, Coinbase, and Datadog) deploy enterprise Applicant Tracking Systems (ATS) to manage career applications. 

To enable candidate discovery, recruiting platforms maintain public, machine-readable JSON feeds that require **zero API keys, zero authentication tokens, and zero subscription agreements**:
- **Lever Career Endpoints:** `https://api.lever.co/v0/postings/${companySlug}?mode=json`
- **Greenhouse Career Endpoints:** `https://api.greenhouse.io/v1/boards/${companySlug}/jobs`

These endpoints are intentionally made public by employers and their ATS providers to ensure maximum visibility for their open vacancies.

### 2.2 The 72-Hour Automated Ingestion Lifecycle
HireFlow automates data freshness without manual intervention or runtime browser overhead:

```
[Corporate ATS (Greenhouse / Lever)]
               │
               ▼  (Scheduled: 02:00 UTC Every 3 Days via GitHub Actions)
[CI Ingestion Engine: scripts/market/sync-live-jobs.ts]
               │
               ├─► Strict India Geography Filtering (Bengaluru, Hyderabad, Pune, Remote India)
               ├─► Technical Engineering Classification (Software, SRE, Data, Platform, DevOps)
               ├─► Token-Boundary Skill Extraction (src/lib/ats/extractSkills.ts)
               ├─► SHA-256 Tamper-Evident Content Hashing
               │
               ▼
[Code-Split Static JSON Bundles: src/data/market/live-companies/${companyId}.json]
               │
               ▼
[HireFlow Browser Runtime: src/data/market/liveDataLoader.ts]
               │
      (100% Local In-Memory Evaluation — 0ms Latency — Zero Outbound Network Calls)
```

### 2.3 SHA-256 Content Fingerprinting
To prevent claims of fabrication or unauthorized data mutation, every ingested job specification is fingerprinted at build-time using SHA-256:
$$\text{ContentHash} = \text{SHA-256}(\text{JobTitle} \parallel \text{Location} \parallel \text{SanitizedBodyText})$$
This 64-character hexadecimal digest is embedded in each role's metadata, guaranteeing cryptographic provenance and tamper-evident auditability.

---

## 3. Statutory Legal Protections & Indian Law

HireFlow's technical data architecture is specifically designed to comply with Indian statutory law and global fair dealing jurisprudence:

### 3.1 Indian Copyright Act, 1957 — Section 52(1)(a) (Fair Dealing)
Under **Section 52(1)(a) of the Indian Copyright Act, 1957**, the following acts do not constitute an infringement of copyright:
> *"a fair dealing with any work, not being a computer programme, for the purposes of— (i) private or personal use, including research; (ii) criticism or review, whether of that work or of any other work..."*

- **Application to HireFlow:** HireFlow's processing of job descriptions constitutes non-commercial, fair dealing for educational research, career counseling, and skills preparation. 
- The platform does not resell job descriptions; it provides candidates with objective, algorithmic readiness benchmarking against public career criteria.

### 3.2 Trade Marks Act, 1999 — Section 30 (Nominative Fair Use)
Under **Section 30(1) and 30(2)(d) of the Indian Trade Marks Act, 1999**, the use of a registered trademark by a third party does not constitute infringement where:
> *"...the use of the mark is in accordance with honest practices in industrial or commercial matters, is not such as to take unfair advantage of or be detrimental to the distinctive character or repute of the trade mark..."*

- **Application to HireFlow:** All employer trademarks, wordmarks, and logos referenced on HireFlow (e.g., Google, Microsoft, Stripe, CRED, Meesho, Infosys, TCS) are the exclusive property of their respective owners.
- HireFlow uses these marks **strictly for nominative identification** — specifically to designate to job-seekers which company published the opening.
- HireFlow makes no claim of affiliation, partnership, sponsorship, or certification by any of these entities.

### 3.3 Information Technology Act, 2000 — Section 43 & Section 66 (Anti-Hacking Compliance)
Section 43 and Section 66 of the IT Act penalize unauthorized computer access, data extraction without owner consent, and denial-of-service disruptions.
- **Full Compliance:** HireFlow's automated sync queries **only** unauthenticated, public URLs exposed on port 443 with standard HTTP GET requests.
- HireFlow never bypasses firewalls, defeats authentication screens, cracks passwords, intercepts private networks, or circumvents access control mechanisms.
- Requests are rate-limited and executed off-peak (02:00 UTC) every 72 hours, generating fewer than 25 total HTTP requests across the entire catalog per run, imposing zero computational strain on host infrastructure.

### 3.4 Digital Personal Data Protection (DPDP) Act, 2023 & Zero-Egress Privacy
The **Digital Personal Data Protection Act, 2023** regulates the collection, storage, and processing of digital personal data.
- **Architectural Immunity:** HireFlow is engineered under **Hard Rule R8.2 (Zero-Egress Architecture)**.
- Candidate resumes uploaded to TalentLens or ATS Roaster are parsed using client-side JavaScript (`pdfjs-dist` / in-browser tokenizer).
- **No candidate personal data (names, emails, phone numbers, past work history, evaluation scores) is transmitted to HireFlow's servers or any cloud database.**
- Because HireFlow neither collects nor stores candidate PII, no personal data processing, profiling, or unauthorized data sharing occurs under the DPDP Act.

---

## 4. International Jurisprudence & Web Scraping Precedent

### 4.1 *hiQ Labs, Inc. v. LinkedIn Corp.* (9th Cir. 2019, aff'd 2022)
In the landmark case *hiQ Labs, Inc. v. LinkedIn Corp.* (31 F.4th 1180, 9th Cir. 2022), the United States Court of Appeals for the Ninth Circuit ruled that:
> **Automated scraping of publicly available data on the internet that is not protected by an authentication gate (such as a password or paywall) does not constitute unauthorized access under the Computer Fraud and Abuse Act (CFAA).**

The court held that data freely accessible to anyone on the public web is fundamentally open, and accessing it does not breach statutory computer fraud prohibitions.

### 4.2 Application to Greenhouse and Lever Feeds
The public ATS feeds consumed by HireFlow (`api.lever.co/v0/postings/...` and `api.greenhouse.io/v1/boards/...`) are:
1. Publicly accessible without any login credentials or user accounts.
2. Specifically designed by software vendors to syndicate job postings to search engines and candidate job boards.
3. In full compliance with CFAA safe harbors and international web access standards.

---

## 5. Employer Direct-Apply & Non-Commercial Safe Harbor

HireFlow acts as a conduit that **directs qualified candidates back to the employer's official career application process**:
1. **Direct Application Button:** Every live role card renders a prominent, non-obfuscated `Apply on Official ATS ↗` link directing candidates directly to `jobs.lever.co/${slug}/...` or `boards.greenhouse.io/${slug}/...`.
2. **Original Text Integrity:** Responsibilities, minimum qualifications, and job titles are preserved verbatim from the employer's posting without editorial distortion.
3. **No Intermediary Fees:** HireFlow charges zero placement fees, referral cuts, or commissions from either employers or candidates.

---

## 6. Notice, Review & Takedown Mechanism

HireFlow is committed to constructive collaboration with employers and recruiters. 

If you are an authorized representative of an employer featured on HireFlow and wish to:
- Update or clarify recruitment eligibility criteria or interview stages;
- Refresh your corporate engineering profile; or
- Request the removal or restriction of a specific posting from our index:

Please contact our compliance office:
- **Designated Compliance Email:** `compliance@hireflo.app`
- **Notice Handling Protocol:** Acknowledgement within **24 hours**; verification and resolution within **48 hours**.

---

## 7. Statutory & Compliance Verification Checklist

| Dimension | Verification Status | Applicable Statutory Authority |
| :--- | :---: | :--- |
| **Public ATS Accessibility** | ✅ Pass | Open HTTP GET on unauthenticated JSON feeds (No API keys or auth bypass) |
| **Anti-Hacking Compliance** | ✅ Pass | Section 43 & 66, Information Technology Act, 2000 |
| **Nominative Fair Use** | ✅ Pass | Section 30, Indian Trade Marks Act, 1999 |
| **Educational Fair Dealing** | ✅ Pass | Section 52(1)(a), Indian Copyright Act, 1957 |
| **Candidate Privacy Isolation** | ✅ Pass | Zero-Egress browser memory evaluation (DPDP Act, 2023) |
| **Content Provenance** | ✅ Pass | SHA-256 cryptographic content fingerprinting |
| **Automated Freshness** | ✅ Pass | 72-Hour GitHub Actions CI Pipeline (`sync-market-data.yml`) |
| **Direct Application Safe Harbor** | ✅ Pass | Verbatim attribution & direct outbound ATS links |
