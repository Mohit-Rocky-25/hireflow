# Applied Security, Cryptography & Auth Domain Checklist

## 1. Domain Pitfalls & Failure Modes
1. **Hardcoding cryptographic**: Hardcoding cryptographic secrets, private keys, or salt tokens in client-accessible code.
2. **Vulnerabilities to**: Vulnerabilities to timing attacks when verifying HMAC signatures or token comparisons.
3. **Reusing nonces**: Reusing nonces or initialization vectors (IVs) in AES-GCM encryption.
4. **Testing security**: Testing security tools against unauthorized external production endpoints without written scope.
5. **Failing to**: Failing to rotate refresh tokens upon exchange, allowing stolen token replays.

## 2. Authoritative Reference Sources
- RFC 7636 (Proof Key for Code Exchange by OAuth Public Clients)
- NIST Special Publication 800-38D (Recommendation for Block Cipher Modes: GCM)
- OWASP Core Rule Set (CRS) for Web Application Firewalls
- Shamir, Adi (1979), "How to share a secret", Communications of the ACM

## 3. Mandatory Reviewer Correctness Checks
- [ ] **Check 1:** Verify constant-time comparison functions (`crypto.subtle.timingSafeEqual`) on all secret checks.
- [ ] **Check 2:** Assert strict scope-of-lawful-use disclaimers on every security-focused project brief.
- [ ] **Check 3:** Check that PKCE implementations enforce SHA-256 code challenge transformations (S256).
- [ ] **Check 4:** Ensure Merkle tree proof verifiers adhere to canonical leaf sorting to eliminate collision exploits.
