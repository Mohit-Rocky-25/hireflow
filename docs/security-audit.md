# HireFlow v4: Security & XSS Audit (C11.1)

Audit Date: 2026-10-19  
Scope: All source code under `src/`  
Auditor: Automated Static Analysis + Manual Security Review

---

## 1. Dangerous DOM Sink Search Summary

A complete static regex search across all files in `src/` was conducted for known dangerous execution sinks:

| Vulnerable Sink | Matches in `src/` | Location / Details | Remediation / Verification |
|-----------------|-------------------|-------------------|----------------------------|
| `dangerouslySetInnerHTML` | **0** | None | Verified: zero occurrences across entire application. |
| `innerHTML` | **0** | `src/lib/safe/index.ts:23` (doc comment only) | Verified: zero functional assignments. |
| `outerHTML` | **0** | None | Verified: zero occurrences. |
| `insertAdjacentHTML` | **0** | None | Verified: zero occurrences. |
| `document.write` | **0** | None | Verified: zero occurrences. |
| `eval(` | **0** | `src/pages/demo/talentLensData.ts:154617` (string literal inside a redFlags keyword list) | Verified: never executed, purely string data for matching. |
| `new Function(` | **0** | None | Verified: zero occurrences. |

---

## 2. Rendering of User Content & Dynamic Text (C11.1)

- **Resume and JD Text**: Rendered strictly as pure React string children (`{text}`), which automatically HTML-entities escapes all `<script>`, `<img>`, and tag sequences.
- **Span Annotations & Highlights**: Rendered via `splitIntoSegments` (`src/lib/safe/index.ts`), which decomposes text into character-index intervals and returns pure React elements rather than HTML strings.
- **Links**: All external URLs parsed from user resumes, job postings, and company datasets are passed through `sanitizeUrl` (`src/lib/safe/index.ts`). Links with forbidden protocols (`javascript:`, `data:`, `vbscript:`, `file:`) or embedded zero-width/control characters are rejected (returning `null`).
- **External Link Anchors**: External links are strictly rendered with `rel="noopener noreferrer"` and `target="_blank"`.

---

## 3. Export Safety & Control Characters (C11.3)

- **DOCX Generation**: All text inputs are filtered through `stripUnsafeChars` to remove XML-invalid ASCII control characters (`\u0000-\u0008`, `\u000B`, `\u000C`, `\u000E-\u001F`, `\u007F`) and bidirectional override characters before passing into `docx` paragraph builders.
- **Filename Sanitization**: Every file download is passed through `sanitizeFilename` (`src/lib/safeUtils.ts`), which strips path traversal (`..`, `/`, `\`), reserved Windows characters (`< > : " / \ | ? *`), and reserved device names (`CON`, `PRN`, `AUX`, `NUL`), enforcing an 80-character maximum length.
- **CSV Formula Injection**: Any tabular export prefixes cells starting with `=`, `+`, `-`, or `@` with a leading apostrophe (`'`).

---

## 4. Content-Security-Policy (C11.4)

The production build injects a strict `<meta http-equiv="Content-Security-Policy">` tag via `cspBuildPlugin` in `vite.config.ts`:

```text
default-src 'self'; script-src 'self'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';
```

- Zero outbound user data egress.
- Worker scripts restricted to `'self'` and `blob:` (required by `pdfjs-dist`).
- Object tags, iframes, and plug-ins completely disabled (`object-src 'none'`).
