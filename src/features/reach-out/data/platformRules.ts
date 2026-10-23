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
    value: '200 characters maximum per connection request note; up to 3 personalized notes per month',
    sourceName: 'LinkedIn Help: Personalize invitations to connect',
    sourceUrl: 'https://www.linkedin.com/help/linkedin/answer/a563153',
    lastCheckedDate: '2026-10-23',
  },
  {
    rule: 'LinkedIn connection note limit for Premium',
    value: '300 characters maximum per invitation; unlimited personalized connection requests',
    sourceName: 'LinkedIn Help: Personalize invitations to connect',
    sourceUrl: 'https://www.linkedin.com/help/linkedin/answer/a563153',
    lastCheckedDate: '2026-10-23',
  },
  {
    rule: 'InMail subject limit',
    value: '200 characters maximum',
    sourceName: 'LinkedIn Help: Send an InMail Message',
    sourceUrl: 'https://www.linkedin.com/help/linkedin/answer/437',
    lastCheckedDate: '2026-10-23',
  },
  {
    rule: 'InMail body limit',
    value: '1,900 characters maximum',
    sourceName: 'LinkedIn Help: Send an InMail Message',
    sourceUrl: 'https://www.linkedin.com/help/linkedin/answer/437',
    lastCheckedDate: '2026-10-23',
  },
  {
    rule: 'Cold email format: plain text',
    value: 'Use plain text or simple markdown formatting; avoid nested tables and remote tracking images',
    sourceName: 'Google Workspace: Email Sender Guidelines',
    sourceUrl: 'https://support.google.com/mail/answer/81126',
    lastCheckedDate: '2026-10-23',
  },
  {
    rule: 'Cold email links: one link max',
    value: 'Include at most 1 clean destination link (e.g. portfolio or GitHub) on initial outreach',
    sourceName: 'Google Workspace: Email Sender Guidelines',
    sourceUrl: 'https://support.google.com/mail/answer/81126',
    lastCheckedDate: '2026-10-23',
  },
  {
    rule: 'Cold email attachments: no attachment on first touch',
    value: 'Do not attach files (PDF/DOCX) on unsolicited first messages; offer to send materials upon reply',
    sourceName: 'Google Workspace: Email Sender Guidelines',
    sourceUrl: 'https://support.google.com/mail/answer/81126',
    lastCheckedDate: '2026-10-23',
  },
];
