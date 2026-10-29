# Reach Out — Limitations, Assumptions & Unverified Areas

## 1. Overview
In accordance with HireFlow's engineering integrity rules (Hard Rule H6 and Honesty Rule H7), this document registers all design assumptions, dataset limitations, cross-domain transfers, and unverified platform quirks within Reach Out.

---

## 2. Cross-Domain Dataset Transfers

### 2.1 B2B Sales Data vs Student-to-Recruiter Job Applications
- **Assumption**: The 50–100 word cold email sweet spot (Hunter 34M dataset, Boomerang 5.3M dataset) and under-100-word InMail recommendation (LinkedIn Talent Solutions 3.4M dataset) are assumed to transfer to job-seeking engineering students contacting tech leads.
- **Risk / Reality**: In B2B sales outbound, the recipient is being pitched a product or software license. In job-seeker outreach, the recipient is evaluating an engineering candidate. While extreme brevity is proven to prevent immediate inbox dismissal, technical hiring managers occasionally prefer 1–2 extra sentences explaining how a specific project architecture was structured.
- **Mitigation in HireFlow**: Reach Out provides 2–4 variants for each proof block, ranging from ultra-terse (1-line metric + repo link) to architectural summary (2 lines describing tradeoffs).
- **Review Date (`verifyBy`)**: 2027-01-15.

---

## 3. Platform Invariants & Unverified Quirks

### 3.1 LinkedIn Connection Note Free Tier Monthly Quota
- **Verified Fact**: Free LinkedIn accounts are strictly capped at 200 characters per connection note.
- **Unverified Variable**: LinkedIn dynamically experiments with monthly free note quotas per user based on account age, region, and network activity (ranging between 3 and 10 notes per month, often changing without official developer changelog announcements).
- **Engine Handling**: Reach Out enforces the strict 200-character ceiling on text length and displays an advisory notice in the UI reminding candidates to preserve their scarce monthly notes for high-priority targets.
- **Review Date (`verifyBy`)**: 2026-12-01.

### 3.2 LinkedIn In-App Word Counter Discrepancy
- **Known Quirk**: The official LinkedIn desktop and mobile clients calculate character length using standard UTF-16 code units. If a candidate uses an emoji or multi-byte special character, LinkedIn deducts 2 characters from the remaining budget.
- **Engine Handling**: Quality rule `Q-WRN-EMOJI` explicitly warns candidates against using emojis in professional direct mail, preserving full character budgets for text.

### 3.3 Email Spam Filters & Deliverability
- **Limitation**: Client-side outreach tools cannot measure domain reputation, SPF/DKIM/DMARC alignment, or IP warm-up status of the sender's personal email account.
- **Mitigation**: Quality checker eliminates known spam trigger words (*"guarantee"*, *"act now"*, *"urgent"*, excessive exclamation marks) and ensures text-to-link ratios remain healthy.

---

## 4. Top 10 Highest-Risk Remaining Items & Roadmap

1. **Recruiter Platform Fatigue**: High-volume recruiters at top Tier-1 Indian firms receive hundreds of messages weekly; even perfectly calibrated outreach has response rates capped by sheer volume.
2. **Dynamic Platform Note Quota Changes**: LinkedIn may alter or further restrict free connection note quotas without notice.
3. **Indic Script Character Weight**: Hindi/Devanagari names take 3 bytes in UTF-8 but 1 character count in JavaScript; verified safe in `normaliseSlots.ts` but requires continuous test coverage.
4. **Alumni Database Integration**: Candidate must manually verify whether a recipient attended their college; no automated verification is possible without network calls.
5. **Campus Placement Cell Policies**: Certain Indian engineering institutes have strict rules penalizing students who reach out off-campus before on-campus placement drives conclude.
6. **Mobile Keyboard Copy/Paste Quirks**: Android and iOS webviews sometimes strip leading/trailing spaces during clipboard operations.
7. **Email Client HTML Rendering**: Rendered plain-text emails may format differently across Outlook for Windows and Apple Mail.
8. **InMail Credit Refund Rules**: LinkedIn refunds InMail credits only if a recipient replies within 90 days; candidates must track this manually.
9. **Follow-Up Fatigue**: Even with 5+ days spacing and new evidence, sending more than 2 follow-ups damages candidate goodwill.
10. **A/B Testing Feedback Void**: Because HireFlow operates with zero runtime network egress and zero tracking telemetry, aggregate response-rate optimization across the user base cannot be automatically collected.
