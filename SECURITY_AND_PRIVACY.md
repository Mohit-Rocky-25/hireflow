# SECURITY AND PRIVACY SPECIFICATION — HIREFLOW AI RESUME TAILORING SAAS

## 1. Candidate Data Protection Principles
Resumes contain sensitive personally identifiable information (PII) including full names, physical addresses, personal email addresses, phone numbers, and complete career histories.

HireFlow operates on a **Privacy-First Architecture**:
1. **Zero External Data Leakage**: In default local operation, no candidate data leaves the browser environment.
2. **Deterministic Processing by Default**: Core extraction, matching, truth-checking, and file compilation execute locally via WebAssembly, regex, and local NLP graphs.
3. **No Resumes Used for Model Training**: Candidate documents are never used to train public LLM models or populate shared corpora without explicit, informed consent.
4. **Immediate Data Erasure**: Users have a single-click "Wipe All Stored Data" action that purges local stores, cached parsed files, and audit logs.

---

## 2. Document Processing Security
- **Untrusted Input Handling**: Uploaded PDF, DOCX, and TXT files are treated as untrusted binary streams.
- **Magic Byte Validation**: Files are checked for valid header signatures (`%PDF-`, `PK\x03\x04` for DOCX) prior to parsing.
- **Garbage & Binary Injection Guard**: If non-printable or corrupt control characters exceed 15%, parsing aborts safely.
- **Timeout Protection**: Document parsers are bounded by strict timeouts (5000ms max) to prevent ReDoS or infinite loop attacks during PDF stream decompression.
- **Size Bounds**: Enforces strict 5MB upload ceilings.

---

## 3. Secret & Credential Safety
- **No Client-Side Secrets**: All server-side API keys (e.g. Gemini, OpenAI) must reside on the backend server and never be prefixed with `VITE_` or exposed in frontend client bundles.
- **Pre-commit Automated Scanning**: Every git commit executes automated credential scanning for high-entropy tokens and API keys.
