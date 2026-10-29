# HireFlow Multi-Format Export & Round-Trip Verification Architecture

## Overview

The export system converts a verified `ResumeDocumentTree` and `LayoutDocument` into 5 standard industry formats while guaranteeing round-trip textual parity.

---

## 1. Supported Formats

| Format | Renderer | Engine / Library | Features |
|---|---|---|---|
| **PDF** | `renderLayoutToPdfBytes` | `pdf-lib` (pure vector) | Exact point coordinates, embedded standard fonts, Unicode transliteration, zero character stripping to spaces. |
| **DOCX** | `renderTreeToDocxBytes` | `docx` (native binary) | Real Microsoft Word XML, standard margins (0.5" top/bottom, 0.55" left/right), bullet hierarchy. |
| **TXT** | `renderLayoutToPlainText` | Pure TS | Clean line-ordered plain text optimized for legacy ATS regex parsers. |
| **MD** | `renderTreeToMarkdown` | Pure TS | GitHub-flavored markdown with clean header and list syntax. |
| **JSON** | `exportResumeToJson` | Pure TS | Complete JSON document tree and fact ledger snapshot for backup and migration. |

---

## 2. Filename Sanitization Standard

Every exported file is named deterministically using the following canonical rule:
```text
<SanitizedCandidateName>_Resume[_<SanitizedTargetRole>].<ext>
```
- Non-alphanumeric characters replaced with underscores.
- Accented Latin characters normalized via Unicode NFKD (`Chloé Lefèvre` $\to$ `Chloe_Lefevre`).
- Multiple consecutive underscores collapsed.
- Leading and trailing underscores stripped.

---

## 3. Round-Trip Verification (`P6`)

Before an export is certified clean, the file buffer is read back using HireFlow's text extractor (`extractFromFile`) and evaluated:

1. **Candidate Identity Recovery**: Full name and email address must be fully present in extracted text.
2. **Metric Preservation ($\ge 98\%$)**: Every number, percentage, currency, or unit present in the original document tree must be recovered. Zero metric dropping.
3. **Skill Token Recovery ($\ge 98\%$)**: All declared technical skills must be parsed back cleanly.
4. **Overall Recovery Rate**: Evaluated as a weighted composite:
   $$\text{Recovery} = 0.4 \times \text{Metrics} + 0.3 \times \text{Bullets} + 0.2 \times \text{Skills} + 0.1 \times \text{Identity}$$
   Must equal or exceed $98.0\%$ to pass verification.
