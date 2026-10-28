# FinTech, Payments & High-Integrity Systems Domain Checklist

## 1. Domain Pitfalls & Failure Modes
1. **Using IEEE-754**: Using IEEE-754 binary floating point (`float64`, `double`) for monetary currency values.
2. **Single-column balance**: Single-column balance updates (`balance += 100`) without immutable double-entry journal balance invariants.
3. **Missing day-count**: Missing day-count convention definitions (Actual/365 vs 30/360) in interest accrual calculations.
4. **Unbalanced clearing**: Unbalanced clearing batches failing zero-sum multilateral netting tests.
5. **Payment webhooks**: Payment webhooks processed without cryptographic HMAC signature and timestamp replay validation.

## 2. Authoritative Reference Sources
- ISO 20022 Financial Services Universal Financial Industry Message Scheme
- Martin Fowler, Accounting Patterns (Double-Entry Bookkeeping)
- Stripe Engineering Documentation (Designing Robust Payment Webhooks & Idempotency)
- National Payments Corporation of India (NPCI) UPI Procedural Guidelines

## 3. Mandatory Reviewer Correctness Checks
- [ ] **Check 1:** Assert 100% adherence to arbitrary-precision fixed-point decimal types (zero floats in accounting paths).
- [ ] **Check 2:** Verify database constraints enforce `SUM(debits) - SUM(credits) = 0` on every ledger transaction.
- [ ] **Check 3:** Check that financial reconciliation engines handle partial refunds, disputes, and fee discrepancies.
- [ ] **Check 4:** Ensure sliding window fraud detection algorithms specify maximum evaluation latency (< 15ms).
