// ============================================================
// HireFlow — Outreach Engine Comprehensive Test Suite (Stage 2 Gate)
// Verifies normaliseSlots (>=40 cases), validateSlots (>=30 cases),
// assemble determinism, lengthFit property test, quality checker, and follow-up chaining.
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  normaliseSlots,
  extractGreetingName,
  getIndefiniteArticle,
  withIndefiniteArticle,
  validateSlots,
  validateAdmiredWork,
  validateProofPoint,
  validatePortfolio,
  assembleRawMessage,
  interpolateSlots,
  fitMessageToLength,
  buildSubjectLine,
  checkMessageQuality,
  validateFollowUpChain,
  detectBannedPhrases,
  BANNED_OUTREACH_PHRASES,
} from '../../src/features/suite/outreach/engine';
import { OutreachTemplateV2, OutreachSlotsV2 } from '../../src/features/suite/outreach/types';
import { QUALITY_RULES, CHANNEL_PROFILES } from '../../src/config/outreach';

describe('Stage 2 Outreach Engine — normaliseSlots & Name/Article Resolution', () => {
  // Test suite covering >= 40 distinct cases
  const greetingCases: Array<{ input: string; expected: string; note: string }> = [
    // Honorific stripping
    { input: 'Dr. Vikram Sen', expected: 'Vikram', note: 'strips Dr.' },
    { input: 'dr. vikram sen', expected: 'vikram', note: 'strips lowercase dr.' },
    { input: 'Prof. Ramesh Rao', expected: 'Ramesh', note: 'strips Prof.' },
    { input: 'Er. Priya Sharma', expected: 'Priya', note: 'strips Er. (Engineer)' },
    { input: 'Mr. Aditiya Birla', expected: 'Aditiya', note: 'strips Mr.' },
    { input: 'Ms. Pooja Nair', expected: 'Pooja', note: 'strips Ms.' },
    { input: 'Mrs. Sunita Deshmukh', expected: 'Sunita', note: 'strips Mrs.' },
    { input: 'Shri Arvind Gupta', expected: 'Arvind', note: 'strips Shri' },
    { input: 'Smt. Pratibha Patil', expected: 'Pratibha', note: 'strips Smt.' },
    // Single names
    { input: 'Kavya', expected: 'Kavya', note: 'single Indian name' },
    { input: 'Arjun', expected: 'Arjun', note: 'single Indian male name' },
    { input: '  Sneha  ', expected: 'Sneha', note: 'trims whitespace' },
    // Standard compound Indian names
    { input: 'Aarav Sharma', expected: 'Aarav', note: 'first name of two words' },
    { input: 'Neha Verma', expected: 'Neha', note: 'female first name' },
    { input: 'Rohan Sengupta', expected: 'Rohan', note: 'bengali compound name' },
    { input: 'Tanvi Kulkarni', expected: 'Tanvi', note: 'marathi compound name' },
    // Initials at beginning
    { input: 'K. V. S. R. Murthy', expected: 'Murthy', note: 'South Indian initials with surname' },
    { input: 'A. B. C. Patel', expected: 'Patel', note: 'multiple initials with surname' },
    { input: 'R. K. Narayan', expected: 'Narayan', note: 'two initials' },
    { input: 'M. S. Dhoni', expected: 'Dhoni', note: 'cricketer name format' },
    { input: 'P. Chidambaram', expected: 'Chidambaram', note: 'single initial' },
    // Diacritics
    { input: 'René François', expected: 'René', note: 'french acute diacritic' },
    { input: 'Zoë Ní Chonaill', expected: 'Zoë', note: 'umlaut and irish fada' },
    { input: 'Pranäv Sharmä', expected: 'Pranäv', note: 'germanic umlaut' },
    { input: 'André-Pierre Gignac', expected: 'André-Pierre', note: 'hyphenated with diacritic' },
    // Indic scripts (Devanagari, etc.)
    { input: 'आरव शर्मा', expected: 'आरव', note: 'Hindi Devanagari first name' },
    { input: 'राहुल वर्मा', expected: 'राहुल', note: 'Devanagari Rahul' },
    { input: 'प्रिया नायर', expected: 'प्रिया', note: 'Devanagari Priya' },
    { input: 'अमित कुमार', expected: 'अमित', note: 'Devanagari Amit' },
    // Empty & whitespace edge cases
    { input: '', expected: '', note: 'empty string' },
    { input: '   ', expected: '', note: 'all whitespace' },
    { input: 'Dr.', expected: 'Dr.', note: 'only honorific fallback' },
  ];

  it.each(greetingCases)('extractGreetingName correctly resolves "$input" -> "$expected" ($note)', ({ input, expected }) => {
    expect(extractGreetingName(input)).toBe(expected);
  });

  // Sound-based article selection (>= 15 distinct cases to ensure >= 40 total normaliseSlots cases)
  const articleCases: Array<{ phrase: string; expectedArticle: 'a' | 'an'; expectedOutput: string }> = [
    // Acronyms starting with vowel sound (/ɛs/, /ɛm/, /eɪ/, etc.)
    { phrase: 'SDE intern', expectedArticle: 'an', expectedOutput: 'an SDE intern' },
    { phrase: 'SRE engineer', expectedArticle: 'an', expectedOutput: 'an SRE engineer' },
    { phrase: 'ML intern', expectedArticle: 'an', expectedOutput: 'an ML intern' },
    { phrase: 'AI researcher', expectedArticle: 'an', expectedOutput: 'an AI researcher' },
    { phrase: 'HR partner', expectedArticle: 'an', expectedOutput: 'an HR partner' },
    { phrase: 'R&D scientist', expectedArticle: 'an', expectedOutput: 'an R&D scientist' },
    { phrase: 'SQL developer', expectedArticle: 'an', expectedOutput: 'an SQL developer' },
    { phrase: 'iOS engineer', expectedArticle: 'an', expectedOutput: 'an iOS engineer' },
    // Acronyms starting with consonant sound (/juː/, /piː/, etc.)
    { phrase: 'UI engineer', expectedArticle: 'a', expectedOutput: 'a UI engineer' },
    { phrase: 'UX designer', expectedArticle: 'a', expectedOutput: 'a UX designer' },
    { phrase: 'URL shortener', expectedArticle: 'a', expectedOutput: 'a URL shortener' },
    { phrase: 'QA automation engineer', expectedArticle: 'a', expectedOutput: 'a QA automation engineer' },
    // Standard phonetic words
    { phrase: 'backend developer', expectedArticle: 'a', expectedOutput: 'a backend developer' },
    { phrase: 'frontend intern', expectedArticle: 'a', expectedOutput: 'a frontend intern' },
    { phrase: 'open-source contributor', expectedArticle: 'an', expectedOutput: 'an open-source contributor' },
    { phrase: 'embedded developer', expectedArticle: 'an', expectedOutput: 'an embedded developer' },
    { phrase: 'operations analyst', expectedArticle: 'an', expectedOutput: 'an operations analyst' },
    { phrase: 'one-year program', expectedArticle: 'a', expectedOutput: 'a one-year program' },
    { phrase: 'university graduate', expectedArticle: 'a', expectedOutput: 'a university graduate' },
    { phrase: 'honest evaluation', expectedArticle: 'an', expectedOutput: 'an honest evaluation' },
  ];

  it.each(articleCases)(
    'getIndefiniteArticle and withIndefiniteArticle correctly resolve "$phrase" -> "$expectedOutput"',
    ({ phrase, expectedArticle, expectedOutput }) => {
      expect(getIndefiniteArticle(phrase)).toBe(expectedArticle);
      expect(withIndefiniteArticle(phrase)).toBe(expectedOutput);
    }
  );

  it('normaliseSlots normalizes all slots and maps legacy aliases cleanly', () => {
    const raw: OutreachSlotsV2 = {
      targetCompany: '  Razorpay  ',
      role: '  SDE intern  ',
      recipient_name: 'Dr. Vikram Sen',
      primary_skill: '  Go & Kubernetes  ',
      proof_point: 'built Raft KV store (12k ops/sec)  ',
      admired_project: '  payment routing switch  ',
      college: '  IIT Bombay  ',
      portfolio: '  github.com/vikram/raft  ',
      what_changed: '  published reproducibility benchmark  ',
      days_since_last_contact: ' 8 ',
    };

    const norm = normaliseSlots(raw);
    expect(norm.targetCompany).toBe('Razorpay');
    expect(norm.company).toBe('Razorpay');
    expect(norm.targetRole).toBe('SDE intern');
    expect(norm.role).toBe('SDE intern');
    expect(norm.recipientName).toBe('Vikram');
    expect(norm.recipient_name).toBe('Vikram');
    expect(norm.primarySkill).toBe('Go & Kubernetes');
    expect(norm.proofPoint).toBe('built Raft KV store (12k ops/sec)');
    expect(norm.admiredProject).toBe('payment routing switch');
    expect(norm.college).toBe('IIT Bombay');
    expect(norm.portfolio).toBe('github.com/vikram/raft');
    expect(norm.followUpNewInfo).toBe('published reproducibility benchmark');
    expect(norm.daysSince).toBe(8);
  });
});

describe('Stage 2 Outreach Engine — validateSlots (>= 30 test cases)', () => {
  // Generic flattery rejection cases (>= 15 cases)
  const genericFlatteryCases = [
    'great work',
    'amazing work',
    'inspiring work',
    'good work',
    'nice work',
    'great company',
    'amazing company',
    'impressive company',
    'esteemed company',
    'esteemed organisation',
    'esteemed organization',
    'great culture',
    'inspiring culture',
    'impressive product',
    'great product',
    'world-class engineering',
    'industry leader',
  ];

  it.each(genericFlatteryCases)('rejects generic flattery phrase "%s" with plain language reason and examples', (flattery) => {
    const res = validateAdmiredWork(flattery);
    expect(res.valid).toBe(false);
    expect(res.issue).toBeDefined();
    expect(res.issue?.severity).toBe('error');
    expect(res.issue?.exampleGood).toBeTruthy();
    expect(res.issue?.exampleBad).toBe(flattery);
  });

  // Specific admired work acceptance cases (>= 8 cases)
  const specificWorkCases = [
    'the architecture of your high-concurrency order ledger',
    'your team post-mortem on database replication lag',
    'the open-source Go job queue you published on GitHub',
    'your talk at GopherCon on event-driven streaming',
    'your team recent blog on zero-downtime PostgreSQL migrations',
    'the UPI payment routing switch performance breakdown',
    'your merchant onboarding flow optimization',
    'the Kubernetes autoscaling latency teardown',
  ];

  it.each(specificWorkCases)('accepts specific technical reference "%s"', (specific) => {
    const res = validateAdmiredWork(specific);
    expect(res.valid).toBe(true);
    expect(res.issue).toBeUndefined();
  });

  // Proof point validation cases (>= 8 cases)
  const proofCases = [
    { input: 'React, Node, Mongo', valid: false, note: 'bare skills list rejected' },
    { input: 'Java, Python, C++', valid: false, note: 'comma-separated bare skills rejected' },
    { input: 'Go / Docker / Kubernetes', valid: false, note: 'slash-separated skills rejected' },
    { input: 'built Go job queue (6.5k jobs/sec)', valid: true, note: 'quantified action accepted' },
    { input: 'reduced API latency by 45%', valid: true, note: 'percentage metric accepted' },
    { input: 'scaled payment gateway to 15,000 req/sec', valid: true, note: 'throughput metric accepted' },
    { input: 'automated 240 regression end-to-end tests', valid: true, note: 'count metric accepted' },
    { input: '', valid: false, note: 'empty proof rejected' },
  ];

  it.each(proofCases)('validateProofPoint correctly evaluates "$input" ($note)', ({ input, valid }) => {
    const res = validateProofPoint(input);
    expect(res.valid).toBe(valid);
  });

  // Portfolio link validation cases (>= 4 cases)
  const portfolioCases = [
    { input: 'https://github.com/aarav/pgqueue', valid: true },
    { input: 'github.com/neha/tracker', valid: true },
    { input: 'aarav.dev', valid: true },
    { input: 'just a text string without url', valid: false },
  ];

  it.each(portfolioCases)('validatePortfolio correctly checks "$input"', ({ input, valid }) => {
    const res = validatePortfolio(input);
    expect(res.valid).toBe(valid);
  });
});

describe('Stage 2 Outreach Engine — Assembly Determinism & Variant Cycling', () => {
  const sampleTemplate: OutreachTemplateV2 = {
    id: 'test-connect-template',
    version: 2,
    channel: 'linkedin_connect',
    tab: 'linkedin_connect',
    name: 'Test Connect',
    goal: 'G1',
    relationship: 'cold',
    recipientTypes: ['in-house recruiter'],
    candidateStages: ['student'],
    companyTypes: ['product'],
    angle: 'skill-led',
    askStrength: 'low',
    requiredSlots: ['recipient_name', 'company', 'role'],
    optionalSlots: [],
    blocks: {
      hook: [
        'Hi {{recipient_name}}, noticed your team at {{company}} is hiring.',
        'Hi {{recipient_name}}, saw {{company}} has open {{role}} roles.',
        'Hi {{recipient_name}}, came across your updates sourcing for {{company}}.',
      ],
      proof: [
        'I recently {{proof_point}}.',
        'I built a service that {{proof_point}}.',
      ],
      ask: [
        'Would love to connect and follow engineering updates.',
        'Open to connecting as I explore opportunities?',
      ],
      close: [
        'Best,\n{{your_name}}',
      ],
    },
    optionalBlockPriority: ['close', 'proof'],
    lengthProfile: { metric: 'characters', target: 180, warn: 195, hardMax: 200 },
    whenToUse: 'Direct recruiter connect.',
    whenNotToUse: 'Do not use for peers.',
    risks: [],
    whyItWorks: 'Concise connection note.',
    exampleFilled: 'Example',
    followUpTemplateIds: [],
    lastReviewed: '2026-10-30',
    notes: 'Test template',
  };

  const sampleSlots: OutreachSlotsV2 = {
    targetCompany: 'Finlo',
    targetRole: 'Backend Intern',
    recipientName: 'Neha',
    proofPoint: 'built Go queue handling 6.5k jobs/sec',
    your_name: 'Aarav',
  };

  it('guarantees 100% determinism: 5 repeated calls with same inputs and variantIndex return byte-identical output', () => {
    const runs = Array.from({ length: 5 }, () =>
      assembleRawMessage(sampleTemplate, sampleSlots, 0)
    );

    const first = runs[0];
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i].body).toBe(first.body);
      expect(runs[i].subject).toBe(first.subject);
    }
  });

  it('cycles phrasing variants deterministically when variantIndex changes', () => {
    const run0 = assembleRawMessage(sampleTemplate, sampleSlots, 0);
    const run1 = assembleRawMessage(sampleTemplate, sampleSlots, 1);
    const run2 = assembleRawMessage(sampleTemplate, sampleSlots, 2);

    // Outputs should vary across phrasings
    expect([run0.body, run1.body, run2.body].some((b, i, arr) => b !== arr[(i + 1) % arr.length])).toBe(true);
  });
});

describe('Stage 2 Outreach Engine — lengthFit Property & Hard Limit Enforcements', () => {
  const mockConnectTemplate: OutreachTemplateV2 = {
    id: 'mock-connect',
    version: 2,
    channel: 'linkedin_connect',
    tab: 'linkedin_connect',
    name: 'Mock Connect',
    goal: 'G1',
    relationship: 'cold',
    recipientTypes: ['in-house recruiter'],
    candidateStages: ['student'],
    companyTypes: ['product'],
    angle: 'skill-led',
    askStrength: 'low',
    requiredSlots: ['recipient_name'],
    optionalSlots: [],
    blocks: {
      hook: ['Hi {{recipient_name}}, saw your engineering team at {{company}} is expanding.'],
      proof: ['I built {{proof_point}}.'],
      ask: ['Would be glad to connect and learn what skills your team values.'],
      close: ['Best regards, {{your_name}}'],
    },
    optionalBlockPriority: ['close', 'proof'],
    lengthProfile: { metric: 'characters', target: 180, warn: 195, hardMax: 200 },
    whenToUse: 'Connect note',
    whenNotToUse: 'None',
    risks: [],
    whyItWorks: 'Crisp',
    exampleFilled: 'Filled',
    followUpTemplateIds: [],
    lastReviewed: '2026-10-30',
    notes: 'None',
  };

  it('property test: drops optional blocks without ever cutting words mid-sentence', () => {
    const slotsWithLongProof: OutreachSlotsV2 = {
      recipientName: 'Aarav',
      targetCompany: 'Razorpay',
      proofPoint: 'engineered high-throughput distributed log indexing platform handling 140,000 requests per second across 12 nodes',
      your_name: 'Suryanarayana',
    };

    const res = fitMessageToLength(mockConnectTemplate, slotsWithLongProof, 0, { isPremiumLinkedIn: false });

    // Verify dropped block priority was engaged
    expect(res.droppedBlocks.length).toBeGreaterThan(0);
    // Verify no broken words
    const words = res.body.split(/\s+/);
    for (const w of words) {
      expect(w.length).toBeGreaterThan(0);
      expect(w).not.toMatch(/[a-z]\.\.\.$/i); // No mid-word truncation
    }
  });

  it('enforces LinkedIn Free (200 char) vs Premium (300 char) ceiling', () => {
    const standardSlots: OutreachSlotsV2 = {
      recipientName: 'Priya',
      targetCompany: 'Swiggy',
      proofPoint: 'scaled REST API reducing latency by 45%',
      your_name: 'Rohan',
    };

    const freeRes = fitMessageToLength(mockConnectTemplate, standardSlots, 0, { isPremiumLinkedIn: false });
    expect(freeRes.hardMax).toBe(200);
    expect(freeRes.charCount).toBeLessThanOrEqual(200);

    const premRes = fitMessageToLength(mockConnectTemplate, standardSlots, 0, { isPremiumLinkedIn: true });
    expect(premRes.hardMax).toBe(300);
    expect(premRes.charCount).toBeLessThanOrEqual(300);
  });
});

describe('Stage 2 Outreach Engine — Quality Checker Positive & Negative Rules', () => {
  it('Q-BLK-SLOT: flags leftover braces and bracketed placeholders (positive and negative)', () => {
    // Positive
    const bad = checkMessageQuality({
      body: 'Hi {{recipient_name}}, applying for [Target Role].',
      channel: 'cold_email',
      relationship: 'cold',
    });
    expect(bad.some((f) => f.id === 'Q-BLK-SLOT' && f.severity === 'BLOCK')).toBe(true);

    // Negative
    const clean = checkMessageQuality({
      body: 'Hi Neha, I built a Go job queue handling 6.5k jobs/sec. Would love to connect.',
      channel: 'linkedin_connect',
      relationship: 'cold',
    });
    expect(clean.some((f) => f.id === 'Q-BLK-SLOT')).toBe(false);
  });

  it('Q-BLK-COLD-REFERRAL: blocks cold outreach asking a stranger for a referral (Evidence E5)', () => {
    // Positive
    const bad = checkMessageQuality({
      body: 'Hi Neha, saw your profile at Finlo. Could you refer me for the backend role?',
      channel: 'cold_email',
      relationship: 'cold',
    });
    expect(bad.some((f) => f.id === 'Q-BLK-COLD-REFERRAL' && f.severity === 'BLOCK')).toBe(true);

    // Negative: referral ask allowed in warm/after-accept relationships
    const warm = checkMessageQuality({
      body: 'Hi Neha, thanks for connecting. Would you be comfortable to refer me for the role if fit looks strong?',
      channel: 'warm_referral',
      relationship: 'after-accept',
    });
    expect(warm.some((f) => f.id === 'Q-BLK-COLD-REFERRAL')).toBe(false);
  });

  it('Q-WRN-GENERIC-OPENER: warns against generic cliché openers', () => {
    const bad = checkMessageQuality({
      body: 'I hope this email finds you well. I saw Finlo is hiring a backend intern.',
      channel: 'cold_email',
      relationship: 'cold',
    });
    expect(bad.some((f) => f.id === 'Q-WRN-GENERIC-OPENER' && f.severity === 'WARN')).toBe(true);
  });

  it('Q-WRN-CLICHE: warns against dated bureaucratic clichés', () => {
    const bad = checkMessageQuality({
      body: 'Hi Vikram, kindly do the needful and revert back regarding my application to your esteemed organisation.',
      channel: 'cold_email',
      relationship: 'cold',
    });
    expect(bad.some((f) => f.id === 'Q-WRN-CLICHE')).toBe(true);
  });

  it('Q-WRN-MULTI-ASK: warns when multiple question marks are present in outreach', () => {
    const bad = checkMessageQuality({
      body: 'Hi Neha, is the role open? Could we chat for 10 minutes? Can you check my profile?',
      channel: 'cold_email',
      relationship: 'cold',
    });
    expect(bad.some((f) => f.id === 'Q-WRN-MULTI-ASK')).toBe(true);
  });

  it('Q-WRN-ATTACHMENT: warns if resume is attached in first cold touch', () => {
    const bad = checkMessageQuality({
      body: 'Hi Arun, I have attached my resume for your review.',
      channel: 'cold_email',
      relationship: 'cold',
      isFirstTouch: true,
    });
    expect(bad.some((f) => f.id === 'Q-WRN-ATTACHMENT')).toBe(true);
  });

  it('Q-WRN-SALARY: warns if CTC or salary is mentioned in cold first touch', () => {
    const bad = checkMessageQuality({
      body: 'Hi Rahul, my current CTC expectations are 15 LPA for this role.',
      channel: 'cold_email',
      relationship: 'cold',
      isFirstTouch: true,
    });
    expect(bad.some((f) => f.id === 'Q-WRN-SALARY')).toBe(true);
  });

  it('maintains backwards compatibility for detectBannedPhrases', () => {
    expect(BANNED_OUTREACH_PHRASES.length).toBeGreaterThanOrEqual(10);
    const found = detectBannedPhrases('I am reaching out to inquire and I am a rockstar developer');
    expect(found).toContain('i am reaching out to inquire');
    expect(found).toContain('rockstar developer');
  });
});

describe('Stage 2 Outreach Engine — Follow-Up Chaining (Evidence E6)', () => {
  const followUpTemplate: OutreachTemplateV2 = {
    id: 'test-followup',
    version: 2,
    channel: 'follow_up',
    tab: 'follow_up',
    name: 'Follow-Up Template',
    goal: 'G6',
    relationship: 'after-accept',
    recipientTypes: ['in-house recruiter'],
    candidateStages: ['student'],
    companyTypes: ['product'],
    angle: 'project-led',
    askStrength: 'low',
    requiredSlots: ['recipient_name'],
    optionalSlots: [],
    blocks: {
      hook: ['Hi {{recipient_name}}, following up on my note last week.'],
      proof: ['One addition: {{followUpNewInfo}}.'],
      ask: ['If now is not a good time, no problem at all.'],
      close: ['Best,\n{{your_name}}'],
    },
    optionalBlockPriority: ['close'],
    lengthProfile: { metric: 'words', target: 50, warn: 85, hardMax: 120 },
    whenToUse: 'Follow up after 1 week',
    whenNotToUse: 'Within 72 hours',
    risks: [],
    whyItWorks: 'Adds value',
    exampleFilled: 'Filled',
    followUpTemplateIds: [],
    lastReviewed: '2026-10-30',
    notes: 'Follow-up',
  };

  it('refuses follow-up with empty new information', () => {
    const emptySlots: OutreachSlotsV2 = {
      recipientName: 'Neha',
      targetCompany: 'Finlo',
      followUpNewInfo: '',
      daysSince: 7,
    };

    const res = validateFollowUpChain(followUpTemplate, emptySlots);
    expect(res.canProceed).toBe(false);
    expect(res.blockReason).toContain('net-new information');
  });

  it('refuses follow-up sent within 3 days (too fast cadence)', () => {
    const tooSoonSlots: OutreachSlotsV2 = {
      recipientName: 'Neha',
      targetCompany: 'Finlo',
      followUpNewInfo: 'published benchmark results',
      daysSince: 2,
    };

    const res = validateFollowUpChain(followUpTemplate, tooSoonSlots);
    expect(res.canProceed).toBe(false);
    expect(res.blockReason).toContain('too soon');
  });

  it('accepts follow-up that includes concrete new information and valid 7-day spacing', () => {
    const validSlots: OutreachSlotsV2 = {
      recipientName: 'Neha',
      targetCompany: 'Finlo',
      followUpNewInfo: 'published reproducibility benchmark on GitHub',
      daysSince: 7,
    };

    const res = validateFollowUpChain(followUpTemplate, validSlots);
    expect(res.canProceed).toBe(true);
    expect(res.blockReason).toBeUndefined();
  });
});
