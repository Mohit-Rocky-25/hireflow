# HireFlow v4: Architectural & Implementation Decisions

Record of decisions made autonomously during the v4 feature expansion.

---

## Decision Log

### DEC-001: Storage Adapter Architecture (Stage 1 / X1.1)
- **Context**: Need a typed storage adapter supporting localStorage, quota exceeded handling, corrupt JSON quarantine, and fallback to in-memory store when storage is blocked.
- **Decision**: Implement `src/lib/storage/` with key prefix `hireflow:v4:`. Stores will use an adapter layer wrapping localStorage. If `setItem` throws `QuotaExceededError`, emit a non-blocking user event/notification and do not crash. If JSON parsing fails, quarantine the raw string under `hireflow:v4:_corrupt:<store>` and initialize with store default.
- **Alternatives Considered**: Direct raw `localStorage` calls (risks unhandled crashes and no migration), IndexedDB (async overhead and complexity for small candidate tool states).
- **Reason**: Synchronous Zustand integration requires predictable, resilient storage with clear fallback semantics.

### DEC-002: Secure-Context Fallbacks (Stage 1 / X1.3, P-13)
- **Context**: Testing on mobile devices over LAN via plain `http://` lacks `crypto.subtle` and `crypto.randomUUID`.
- **Decision**: 
  - `createId()`: Check `crypto.randomUUID`. If unavailable, use `crypto.getRandomValues`. If that is also unavailable, fall back to timestamp + high-entropy counter.
  - `hashText()`: Check `crypto.subtle.digest`. If unavailable, use 64-bit FNV-1a hex. Always prefix hashes with algorithm identifier (e.g., `sha256:` or `fnv1a:`) so values from different algorithms are never compared directly.
- **Alternatives Considered**: Require HTTPS or throw an error.
- **Reason**: P-13 strictly requires graceful degradation on LAN HTTP.

### DEC-003: CSP Strategy (Stage 2 / C11.4)
- **Context**: Content-Security-Policy meta tag must be applied in production build without breaking Vite HMR in local dev.
- **Decision**: Implement a lightweight Vite plugin that uses `transformIndexHtml` with `apply: 'build'` to inject the `<meta http-equiv="Content-Security-Policy" content="...">` tag exclusively into production HTML.
- **Reason**: Keeps developer velocity high while guaranteeing strict production defense against XSS.

### DEC-004: Preservation of Dead Links (Scope Rule P-6)
- **Context**: Existing links like "Compare with another company" and "Have an offer? Decode it" lead to unbuilt or removed multi-tenant / offer comparison pages.
- **Decision**: Leave the link triggers intact and do not remove them. Document them in the final report as candidate-side out-of-scope preserved items.
- **Reason**: P-6 strictly forbids restoring recruiter/offer-decoder code while demanding existing UI buttons be left untouched.
