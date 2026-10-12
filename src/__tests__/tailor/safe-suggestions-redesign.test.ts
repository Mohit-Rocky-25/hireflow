import { describe, it, expect } from 'vitest';
import {
  generateTailoredSuggestions,
  detectSectionHeader
} from '../../lib/tailorEngine/engine';
import {
  ALL_ACTION_VERBS,
  EXPANDED_ACTION_VERBS,
  evaluateBulletFormula
} from '../../lib/tailorEngine/actionWordEngine';
import { parseJDOverview } from '../../lib/tailorEngine/parser';

describe('Design Correction: Recruiter-Grade Suggestion Architecture (Rules 1 - 8)', () => {
  const sampleResume = `Mohit Yadav | Bengaluru, India | Cybersecurity Analyst
SUMMARY: Security engineer focusing on web application security, mobile pen-testing, and threat mitigation.

SECURITY PROJECTS & PRACTICAL EXPERIENCE:
- Responsible for maintaining a secure network topology using Cisco Packet Tracer and Wireshark.
- Conducted reverse engineering of Android binaries using JADX and APKTool to analyze hardcoded secrets.
- Performed vulnerability scans across internal endpoints identifying configuration flaws.

TECHNICAL SKILLS:
Languages & Tools: Python, Bash, JADX, APKTool, Wireshark, Nmap, Burp Suite, Linux
Core Competencies: Static Analysis, Vulnerability Assessment, Network Topology`;

  const sampleJD = `Role: Junior Security Engineer
Company: CloudShield
Requirements:
- Deep experience in network topology, routing, and subnetting.
- Hands-on penetration testing and static analysis using JADX or Burp Suite.
- Experience with Docker containerization and Kubernetes orchestration.
- Knowledge of Terraform for infrastructure as code.
- Strong automated testing and incident response.`;

  // T1: Suggestion Partitioning
  it('T1: strictly partitions all suggestions into either SAFE_EDIT or QUESTION', () => {
    const result = generateTailoredSuggestions(sampleResume, sampleJD);
    expect(result.suggestions.length).toBeGreaterThan(0);

    for (const sug of result.suggestions) {
      expect(['SAFE_EDIT', 'QUESTION']).toContain(sug.kind);
      if (sug.kind === 'SAFE_EDIT') {
        expect(['rephrase', 'reorder']).toContain(sug.type);
        expect(sug.proposedText).toBeTruthy();
      } else {
        expect(['skills', 'add_context']).toContain(sug.type);
        // Questions never supply proposed values by default
        expect(sug.proposedText).toBe('');
      }
    }
  });

  // T2: No Bracket Placeholders or Canned Finished Strings
  it('T2: never outputs bracket placeholders [ ] or canned finished-claim strings', () => {
    const result = generateTailoredSuggestions(sampleResume, sampleJD);

    const bannedCannedClaims = [
      'tested across [25] security test cases',
      'verifying zero packet drop',
      'saving [15+] engineering hours',
      'handling [50,000+] requests',
      '[25]',
      '[15+]',
      '[50,000+]'
    ];

    for (const sug of result.suggestions) {
      expect(sug.proposedText).not.toContain('[');
      expect(sug.proposedText).not.toContain(']');

      for (const banned of bannedCannedClaims) {
        expect(sug.proposedText.toLowerCase()).not.toContain(banned.toLowerCase());
        if (sug.question) {
          expect(sug.question.toLowerCase()).not.toContain(banned.toLowerCase());
        }
      }

      // Context chips must be empty to eliminate canned chip insertions
      expect(sug.contextTapChips || []).toHaveLength(0);
    }
  });

  // T3: Questions Have Empty ProposedText & Plain-Language Question
  it('T3: ensures QUESTION items have empty proposedText, plain-language question, and honest consequence copy', () => {
    const result = generateTailoredSuggestions(sampleResume, sampleJD);
    const questions = result.suggestions.filter((s) => s.kind === 'QUESTION');
    expect(questions.length).toBeGreaterThan(0);

    for (const q of questions) {
      expect(q.proposedText).toBe('');
      expect(q.question).toBeDefined();
      expect(q.question!.length).toBeGreaterThan(5);
      expect(q.consequenceText).toBeDefined();
      expect(q.consequenceText!.length).toBeGreaterThan(5);
      if (q.type === 'add_context') {
        expect(q.examplePlaceholder).toContain('Example format');
      } else {
        expect(q.examplePlaceholder).toContain('Where did you use it?');
      }
    }
  });

  // T4: JD Skills Yield Question Not Auto-Added Chips
  it('T4: treats missing JD keywords as QUESTION cards with targetSkill and empty proposedText', () => {
    const result = generateTailoredSuggestions(sampleResume, sampleJD);
    const skillQuestions = result.suggestions.filter((s) => s.type === 'skills');
    expect(skillQuestions.length).toBeGreaterThan(0);

    for (const sq of skillQuestions) {
      expect(sq.kind).toBe('QUESTION');
      expect(sq.proposedText).toBe('');
      expect(sq.targetSkill).toBeDefined();
      expect(sq.question).toContain(sq.targetSkill);
      expect(sq.question).toContain('Have you used it?');
      expect(sq.consequenceText).toContain('interview');
    }
  });

  // T5: Compound Project Section Labels (Bug 8.1)
  it('T5: correctly classifies compound header "SECURITY PROJECTS & PRACTICAL EXPERIENCE" as Projects', () => {
    const section = detectSectionHeader('SECURITY PROJECTS & PRACTICAL EXPERIENCE');
    expect(section).toBe('Projects');

    const academicSection = detectSectionHeader('Academic & Technical Projects');
    expect(academicSection).toBe('Projects');

    const expSection = detectSectionHeader('Professional Experience');
    expect(expSection).toBe('Experience');

    const eduSection = detectSectionHeader('Academic Qualifications');
    expect(eduSection).toBe('Education');
  });

  // T6: Action Verbs Lexicon Expansion (Bug 8.2)
  it('T6: recognizes expanded action verbs (performed, conducted, reversed, patched, etc.) in formula evaluator', () => {
    const verbsToTest = ['performed', 'conducted', 'reversed', 'patched', 'evaluated', 'audited'];

    for (const verb of verbsToTest) {
      expect(EXPANDED_ACTION_VERBS).toContain(verb);
      expect(ALL_ACTION_VERBS).toContain(verb);

      const capitalized = verb.charAt(0).toUpperCase() + verb.slice(1);
      const testBullet = `- ${capitalized} Android binaries using JADX to analyze hardcoded API secrets`;
      const formula = evaluateBulletFormula(testBullet);
      expect(formula.action).toBe(true);
    }
  });

  // T7: Multi-Word JD Skills Extraction & Confidence Warning (Bug 8.3)
  it('T7: multi-word requirements are captured with confidence metadata', () => {
    const parsedJD = parseJDOverview(sampleJD);
    expect(parsedJD.confidenceScore).toBe('high');

    // Sparse JD test (< 3 requirements)
    const sparseJD = `Role: Developer\nCompany: Acme\nRequirements:\n- Python`;
    const parsedSparse = parseJDOverview(sparseJD);
    expect(parsedSparse.confidenceScore).toBe('low');
    expect(parsedSparse.confidenceWarning?.toLowerCase()).toContain('low confidence');
    expect(parsedSparse.confidenceWarning?.toLowerCase()).toContain('paste more of the job description');
  });

  // T8: Honest Score Baseline
  it('T8: projectedScoreAfter matches scoreBefore until user provides verified facts', () => {
    const result = generateTailoredSuggestions(sampleResume, sampleJD);
    expect(result.projectedScoreAfter).toBe(result.scoreBefore);
  });
});
