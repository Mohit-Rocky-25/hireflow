# HireFlow v4: Known Architectural Limitations

An honest, transparent accounting of system boundaries, heuristics, platform constraints, and operating limitations.

---

## 1. Local-Only Storage & Zero Cloud Sync
- **No User Accounts or Server Database**: HireFlow does not have a backend user database, cloud sync, or multi-device account system. All profiles, scan histories, saved JDs, and feedback remain purely on the candidate's local browser device.
- **Device & Browser Siloing**: Data created in Google Chrome on Desktop will not automatically appear in Safari on iPhone or another machine. Data portability is achieved manually via JSON export/import at `/data`.
- **LocalStorage Capacity Constraints**: Browsers enforce an origin storage quota of approximately 5 MB to 10 MB for `localStorage`. HireFlow enforces strict collection caps (e.g. 60 scans, 40 JDs, 50 roles) to prevent quota exhaustion. When caps are reached, the user must export a backup or delete items.

---

## 2. Deterministic Heuristics & Scoring Boundaries
- **Unvalidated Third-Party ATS Emulation**: HireFlow's scoring algorithms reflect internal deterministic rubrics (weighting quantified metrics, strong action verbs, and keyword alignment). They **do not** predict with certainty what any third-party corporate Applicant Tracking System (such as Workday, Taleo, Greenhouse, or Lever) will decide.
- **Zero Probability Guarantees**: HireFlow never produces "acceptance probability", "callback probability", or claims that "X% of resumes are auto-rejected". All scoring outputs are labeled as internal benchmark estimates.
- **Preset Data Provenance**: The 7 Fresher Role Presets in `role-presets.json` are curated archetypes based on Indian fresher campus hiring patterns; they should be adjusted to specific job descriptions whenever an exact JD is available.

---

## 3. Secure Context & Network Restrictions (P-13)
- **Local Network (LAN) HTTP Limitations**:
  - The W3C Service Worker API and Web Cryptography API (`crypto.subtle`) strictly require a Secure Context (`https://` or `http://localhost`).
  - When testing on a physical smartphone over a local Wi-Fi IP address (e.g. `http://192.168.1.100:5173`), modern mobile browsers automatically disable Service Worker registration and `crypto.subtle`.
  - **Graceful Degradation**: HireFlow handles this without throwing errors by falling back to FNV-1a 64-bit hashing and standard network requests, but offline PWA capabilities will not activate over plain HTTP on LAN.

---

## 4. Parser & Layout Limitations
- **Multi-Column & Complex PDF Layouts**: PDF text extraction is performed via client-side `pdfjs-dist`. Resumes with complex multi-column floating boxes, graphics, or non-standard font encodings may extract with non-linear word order. HireFlow provides a raw text editor and fallback paste mode to verify extracted text.
- **File Upload Limits**: Client-side document parsers enforce maximum upload boundaries (`maxFileUploadMB: 5MB`, `maxPdfPages: 6 pages`) to prevent browser main-thread freezing.
