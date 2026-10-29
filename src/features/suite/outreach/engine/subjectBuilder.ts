// ============================================================
// HireFlow — Outreach Engine: Subject Line Builder
// Creates 3-8 word, high-specificity subject lines without emoji or ALL CAPS
// ============================================================

import { countWords } from './lengthFit';

export interface SubjectLineOptions {
  role: string;
  candidateName?: string;
  primarySkill?: string;
  concreteProof?: string;
  company?: string;
  context?: 'role-first' | 'project-first' | 'follow-up' | 'referral';
}

/**
 * Strips emojis and punctuation artifacts from subject text.
 */
export function sanitizeSubjectText(text: string): string {
  // Strip emojis
  const noEmoji = text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ''
  );
  // Replace double spaces
  return noEmoji.replace(/\s+/g, ' ').trim();
}

/**
 * Builds a clean, scannable subject line compliant with outreach standards.
 * Enforces 3-8 words, specific, zero emojis, zero ALL CAPS.
 */
export function buildSubjectLine(opts: SubjectLineOptions): string {
  const role = opts.role.trim() || 'Backend Engineer';
  const skill = opts.primarySkill?.trim();
  const proof = opts.concreteProof?.trim();
  const company = opts.company?.trim();

  let subject = '';

  if (opts.context === 'follow-up') {
    subject = `Following up: ${role} opening`;
  } else if (opts.context === 'referral') {
    subject = `Note regarding ${role} role at ${company || 'your team'}`;
  } else if (opts.context === 'project-first' && proof) {
    // Project-led: e.g. "Go job queue (6.5k/s) — Backend role"
    subject = `${role} candidate — ${proof.slice(0, 30)}`;
  } else if (skill) {
    // Skill-led: e.g. "Backend Intern, Go and PostgreSQL"
    subject = `${role}, ${skill}`;
  } else {
    subject = `${role} inquiry — portfolio and projects`;
  }

  subject = sanitizeSubjectText(subject);

  // Guarantee word count bounds: 3 to 8 words
  const words = subject.split(/\s+/).filter(Boolean);
  if (words.length > 8) {
    subject = words.slice(0, 8).join(' ');
  } else if (words.length < 3) {
    subject = `${role} applicant inquiry note`;
  }

  // Ensure no ALL CAPS words (except short acronyms <= 3 letters like Go, AWS, API, SDE)
  const tokens = subject.split(' ').map((w) => {
    if (w.length > 3 && w === w.toUpperCase() && !w.includes('.')) {
      return w.charAt(0) + w.slice(1).toLowerCase();
    }
    return w;
  });

  return tokens.join(' ');
}
