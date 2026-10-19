/**
 * HireFlow v4: Outreach Follow-Up Generator & Subject Line Analyzer (D21)
 * Deterministic follow-up templates (Day 3, Day 7 value-add, Post-Interview Thank You)
 * and lexical subject line effectiveness analyzer.
 */

export interface FollowUpTemplate {
  id: 'day3_nudge' | 'day7_value_add' | 'post_interview_thank_you';
  title: string;
  recommendedTiming: string;
  subject: string;
  body: string;
  tips: string[];
}

export interface OutreachSlotsInput {
  candidateName: string;
  recipientName?: string;
  targetCompany: string;
  targetRole: string;
  primarySkill?: string;
  projectOrPrLink?: string;
  interviewTopicDiscussed?: string;
}

export function generateFollowUpTemplates(slots: OutreachSlotsInput): FollowUpTemplate[] {
  const recipient = slots.recipientName ? `Hi ${slots.recipientName}` : 'Hi';
  const candidate = slots.candidateName || '[My Name]';
  const company = slots.targetCompany || '[Company]';
  const role = slots.targetRole || '[Role]';
  const skill = slots.primarySkill || 'backend engineering';
  const link = slots.projectOrPrLink || 'github.com/[my-repo]';
  const topic = slots.interviewTopicDiscussed || 'distributed system scaling and database indexing';

  return [
    {
      id: 'day3_nudge',
      title: 'Day 3: Quick Contextual Nudge',
      recommendedTiming: '3 business days after initial outreach if no response',
      subject: `Following up: ${candidate} – ${role} interest at ${company}`,
      body: `${recipient},

Following up briefly on my earlier note regarding the ${role} opening at ${company}.

I know you have a busy inbox, so keeping this concise: I recently built an open-source project in ${skill} and would love 5 minutes to see if my background matches what your engineering team is currently looking for.

Would you be open to a brief conversation this week?

Best regards,
${candidate}`,
      tips: [
        'Keep under 75 words.',
        'Never sound accusatory or frustrated about delays.',
        'Send Tuesday through Thursday between 9:30 AM and 11:30 AM.',
      ],
    },
    {
      id: 'day7_value_add',
      title: 'Day 7: Value-Add Project Proof',
      recommendedTiming: '7 days after first outreach; provides new technical evidence',
      subject: `Thought you might find this interesting: ${skill} project for ${company}`,
      body: `${recipient},

Hope you are having a productive week.

Since reaching out last week about the ${role} position, I put together a working prototype solving a common ${company} engineering challenge:
👉 ${link}

It implements ${skill} with verified performance benchmarks and zero third-party bloat. Even if hiring is on pause, I would love to hear any technical thoughts your team might have.

Best regards,
${candidate}`,
      tips: [
        'Sharing an active link or PR changes the dynamic from asking for a favor to showing proof.',
        'Shows genuine curiosity about their specific engineering challenges.',
      ],
    },
    {
      id: 'post_interview_thank_you',
      title: 'Post-Interview: Grounded Thank-You Note',
      recommendedTiming: 'Within 24 hours of technical or behavioral interview round',
      subject: `Thank you – ${role} interview with ${company}`,
      body: `${recipient},

Thank you for taking the time to speak with me today about the ${role} opportunity at ${company}.

I especially enjoyed our conversation about ${topic}. Your perspective reinforced my enthusiasm for the engineering culture at ${company}.

I have attached a quick note on the question we discussed regarding system fault tolerance. Please let me know if any additional details would be helpful as you evaluate candidates.

Best regards,
${candidate}`,
      tips: [
        'Always reference a specific talking point from the interview.',
        'Do not ask for timeline or result immediately; keep the tone grounded and professional.',
      ],
    },
  ];
}

// -------------------------------------------------------------
// Subject Line Analyzer
// -------------------------------------------------------------

export interface SubjectLineAnalysis {
  subject: string;
  score: number; // 0 - 100
  charCount: number;
  wordCount: number;
  rating: 'Excellent' | 'Good' | 'Needs Improvement' | 'Spam Risk';
  issues: string[];
  positives: string[];
  recommendations: string[];
}

const SPAM_TRIGGERS = [
  'urgent',
  'opportunity',
  'please hire',
  'hire me',
  'job seeker',
  'desperate',
  'call me',
  'free',
  '100%',
  'guaranteed',
  'unemployed',
  'request',
];

export function analyzeSubjectLine(
  subject: string,
  targetCompany?: string,
  targetRole?: string
): SubjectLineAnalysis {
  const trimmed = subject.trim();
  const charCount = trimmed.length;
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let score = 100;
  const issues: string[] = [];
  const positives: string[] = [];
  const recommendations: string[] = [];

  // 1. Length checks (Ideal: 30-50 chars)
  if (charCount === 0) {
    return {
      subject: '',
      score: 0,
      charCount: 0,
      wordCount: 0,
      rating: 'Needs Improvement',
      issues: ['Subject line cannot be empty.'],
      positives: [],
      recommendations: ['Enter a clear, personalized subject line.'],
    };
  }

  if (charCount < 20) {
    score -= 25;
    issues.push(`Too short (${charCount} chars). May look like spam or an accidental email.`);
    recommendations.push('Add your target role or primary engineering specialty.');
  } else if (charCount >= 28 && charCount <= 52) {
    positives.push(`Ideal mobile length (${charCount} chars). Fits cleanly in mobile notification previews without truncation.`);
  } else if (charCount > 60) {
    score -= 20;
    issues.push(`Too long (${charCount} chars). Over 60% of recruiters read email on mobile; the tail end will be truncated.`);
    recommendations.push('Trim filler words to stay under 50 characters.');
  }

  // 2. Personalization tokens
  const lower = trimmed.toLowerCase();
  const hasCompany = targetCompany ? lower.includes(targetCompany.toLowerCase()) : false;
  const hasRole = targetRole ? lower.includes(targetRole.toLowerCase()) : false;

  if (hasCompany && hasRole) {
    score += 10;
    positives.push('Includes both target company and role title.');
  } else if (hasCompany || hasRole) {
    positives.push('Personalized with target company or role keyword.');
  } else {
    score -= 15;
    issues.push('Missing explicit company or role keywords.');
    recommendations.push('Include the target company or specific role (e.g. "Backend SDE").');
  }

  // 3. Spam triggers
  for (const trigger of SPAM_TRIGGERS) {
    if (new RegExp(`\\b${trigger}\\b`, 'i').test(trimmed)) {
      score -= 30;
      issues.push(`Contains spam trigger phrase: "${trigger}". Many corporate filters route this to Junk.`);
      recommendations.push(`Remove "${trigger}" in favor of direct technical facts.`);
    }
  }

  // 4. Excessive punctuation / Caps
  if (/!{1,}/.test(trimmed)) {
    score -= 20;
    issues.push('Avoid exclamation marks (!) in cold professional outreach.');
  }

  const allCapsWords = words.filter((w) => w.length > 2 && w === w.toUpperCase() && !/^[A-Z]{2,4}$/.test(w));
  if (allCapsWords.length > 1) {
    score -= 25;
    issues.push('Excessive ALL-CAPS words trigger corporate anti-phishing algorithms.');
  }

  const finalScore = Math.max(0, Math.min(100, score));
  let rating: SubjectLineAnalysis['rating'] = 'Good';
  if (finalScore >= 85) rating = 'Excellent';
  else if (finalScore >= 65) rating = 'Good';
  else if (finalScore >= 40) rating = 'Needs Improvement';
  else rating = 'Spam Risk';

  return {
    subject: trimmed,
    score: finalScore,
    charCount,
    wordCount,
    rating,
    issues,
    positives,
    recommendations,
  };
}
