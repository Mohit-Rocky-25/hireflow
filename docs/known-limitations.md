# HireFlow v3 — Known Limitations

To maintain absolute transparency with engineering freshers and developers, this document outlines known operational boundaries and technical limitations of HireFlow v3:

---

## 1. Scanned & Image-Only PDFs (No OCR)
- **Limitation**: HireFlow operates strictly client-side using `pdfjs-dist` to extract vector text streams. It does not package heavy client-side OCR engines (like Tesseract.js).
- **Behavior**: If an uploaded PDF contains only flattened bitmap images without an underlying text layer, the ingestion pipeline safely flags:
  > *"This looks like a scanned image. OCR isn't supported; paste the text or upload a DOCX."*
- **Workaround**: Candidates should export directly from Microsoft Word / Google Docs as a standard PDF or paste their resume text directly.

---

## 2. Highly Complex Graphic / Canva Layouts
- **Limitation**: Resumes featuring 3+ columns, overlapping floating text boxes, circular graphic callouts, or irregular infographic flow may cause text interleaving.
- **Behavior**: The ingestion pipeline detects baseline shifts and assigns a `readingOrderConfidence: "low"`.
- **Workaround**: Candidates are prompted to review the *"What a parser sees"* raw text preview in the ATS Roaster and make manual corrections if needed.

---

## 3. Pure Deterministic Processing (Zero Hallucination)
- **Limitation**: HireFlow deliberately excludes non-deterministic LLM runtime APIs from the core candidate tool path to honor Privacy (P-2) and Truth Gates (P-1).
- **Behavior**: The system will NEVER generate fictional metrics, project deliverables, or dates to boost scores. If an applicant has not provided project impact metrics, the engine can only provide guided questions, not fabricated bullets.

---

## 4. Local-Only Storage Scope
- **Limitation**: All resume variants, tailored profiles, and outreach drafts persist exclusively in the browser's `localStorage` / `sessionStorage`.
- **Behavior**: Clearing browser cache or switching devices will reset saved drafts unless exported as DOCX / TXT.
