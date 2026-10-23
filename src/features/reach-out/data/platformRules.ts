// ============================================================
// Reach Out - Platform Rules Configuration
// Strict metadata tracking platform character limits and delivery guidelines.
// Note: sourceUrl and lastCheckedDate are set to null until manually verified
// against official documentation pages. No URLs or dates are guessed.
// ============================================================

export interface PlatformRule {
  rule: string;
  value: string;
  sourceName: string;
  sourceUrl: string | null;
  lastCheckedDate: string | null;
}

export const PLATFORM_RULES: PlatformRule[] = [
  {
    rule: 'LinkedIn connection note limit for free accounts',
    value: '300 characters maximum per connection request note; monthly note invitation quotas apply',
    sourceName: 'LinkedIn Official Help Center',
    sourceUrl: null,
    lastCheckedDate: null,
  },
  {
    rule: 'LinkedIn connection note limit for Premium',
    value: '300 characters maximum per invitation; expanded monthly invitation volume',
    sourceName: 'LinkedIn Official Help Center',
    sourceUrl: null,
    lastCheckedDate: null,
  },
  {
    rule: 'InMail subject limit',
    value: '200 characters maximum',
    sourceName: 'LinkedIn Official Help Center',
    sourceUrl: null,
    lastCheckedDate: null,
  },
  {
    rule: 'InMail body limit',
    value: '1,900 characters maximum',
    sourceName: 'LinkedIn Official Help Center',
    sourceUrl: null,
    lastCheckedDate: null,
  },
  {
    rule: 'Cold email format: plain text',
    value: 'Use plain text or simple markdown formatting; avoid nested tables and remote tracking images',
    sourceName: 'Email Delivery Best Practices',
    sourceUrl: null,
    lastCheckedDate: null,
  },
  {
    rule: 'Cold email links: one link max',
    value: 'Include at most 1 clean destination link (e.g. portfolio or GitHub) on initial outreach',
    sourceName: 'Email Delivery Best Practices',
    sourceUrl: null,
    lastCheckedDate: null,
  },
  {
    rule: 'Cold email attachments: no attachment on first touch',
    value: 'Do not attach files (PDF/DOCX) on unsolicited first messages; offer to send materials upon reply',
    sourceName: 'Email Delivery Best Practices',
    sourceUrl: null,
    lastCheckedDate: null,
  },
];
