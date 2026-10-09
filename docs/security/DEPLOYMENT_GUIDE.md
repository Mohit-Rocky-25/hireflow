# HIREFLOW AI — PRODUCTION DEPLOYMENT & HARDENING GUIDE

## 1. Build Pipeline

To compile the production distribution:
```bash
npm run build
```
This triggers `tsc && vite build`:
- **Source Maps Disabled**: `sourcemap: false` is configured in `vite.config.ts`, ensuring internal TypeScript source code and variable paths are stripped from public release bundles.
- **Pre-Commit Guard**: Automated secret scanning blocks any commits containing hardcoded secrets.
- **Output Artifacts**: Static assets are placed in `dist/`.

---

## 2. HTTP Security Headers

For all production web servers (Cloudflare Pages, Netlify, Nginx, Vercel), ensure the following headers are applied to all routes (defined in `public/_headers`):

| Header | Production Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';` | Prevents XSS, script injection, and unauthorized data egress. |
| `X-Content-Type-Options` | `nosniff` | Disables MIME sniffing. |
| `X-Frame-Options` | `DENY` | Prevents clickjacking in iframes. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Protects path and query parameters from leaking to third parties. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Disables unused browser hardware capabilities. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Enforces TLS / HTTPS across all requests. |

---

## 3. Environment Variable Configuration

| Variable | Environment | Required | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Backend Server / Dev Proxy only | Optional | Server-side Gemini API key. Never prefix with `VITE_`. |
| `GEMINI_MODEL` | Backend Server / Dev Proxy only | Optional | Target Gemini model (e.g. `gemini-2.0-flash`). |
| `PORT` | Local Dev / Preview Server | Optional | Default `5173` (dev) or `4173` (preview). |

> [!CAUTION]
> Never set `VITE_GEMINI_API_KEY` or `VITE_OPENAI_API_KEY`. Any variable with the `VITE_` prefix is baked into the public browser JavaScript bundle!
