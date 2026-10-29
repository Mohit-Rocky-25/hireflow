// ============================================================
// HIREFLOW CANONICAL TRUTH GATE EVALUATOR (STAGE 5)
// One Truth Gate, Quality Rules, Two Readouts (JD Coverage % + Checklist) (P8)
// Zero Math.random, zero Date.now (Hard Rule 2).
// ============================================================

import {
  ResumeDocumentTree,
  Target,
  OwnershipTier,
} from '../types';
import { AppendOnlyFactLedger } from '../ledger';
import { GateIssue, GateResult } from './types';
import { extractMetrics } from '../extractor';
import { isVerbPermittedForTier, lintBulletOpener } from '../composer/verbs';
import { BANNED_BUZZWORDS } from '../composer/summary';
import { CLAIM_STRENGTH_LADDER } from '../../../config/thresholds';

const PLACEHOLDER_REGEX = /\[(?:X%?|metric|number|\.\.\.)\]/i;

export function evaluateResumeTruthGate(
  documentTree: ResumeDocumentTree,
  ledger: AppendOnlyFactLedger,
  target?: Target,
  options: { asOf?: string } = {}
): GateResult {
  const asOf = options.asOf || '2026-10-28';
  const issues: GateIssue[] = [];

  // -----------------------------------------------------------
  // G-06: Mandatory Candidate Identity
  // -----------------------------------------------------------
  if (!documentTree.candidate.fullName || documentTree.candidate.fullName.trim().length === 0) {
    issues.push({
      ruleId: 'G-06',
      severity: 'BLOCKING',
      message: 'Candidate full name is missing.',
      location: { sectionId: 'header' },
      suggestedFix: 'Provide a valid candidate full name before exporting.',
    });
  }

  if (!documentTree.candidate.email || !/\S+@\S+\.\S+/.test(documentTree.candidate.email)) {
    issues.push({
      ruleId: 'G-06',
      severity: 'BLOCKING',
      message: 'Valid contact email is missing.',
      location: { sectionId: 'header' },
      suggestedFix: 'Add a valid contact email in the header.',
    });
  }

  // -----------------------------------------------------------
  // Scan Sections, Entries, and Bullets
  // -----------------------------------------------------------
  for (const section of documentTree.sections) {
    if (!section.visible) continue;

    // G-08: Section title required
    if (!section.title || section.title.trim().length === 0) {
      issues.push({
        ruleId: 'G-08',
        severity: 'BLOCKING',
        message: `Section of type "${section.type}" lacks a title.`,
        location: { sectionId: section.type },
        suggestedFix: 'Assign a clean title to the section.',
      });
    }

    // W-04: Summary buzzwords
    if (section.summaryText) {
      const lower = section.summaryText.toLowerCase();
      for (const word of BANNED_BUZZWORDS) {
        if (lower.includes(word)) {
          issues.push({
            ruleId: 'W-04',
            severity: 'WARNING',
            message: `Hollow buzzword "${word}" detected in professional summary.`,
            location: { sectionId: section.type },
            suggestedFix: 'Replace subjective buzzwords with quantifiable, evidence-backed achievements.',
          });
        }
      }
    }

    for (const entry of section.entries) {
      // G-07: Organization and title required
      if (!entry.title || entry.title.trim().length === 0) {
        issues.push({
          ruleId: 'G-07',
          severity: 'BLOCKING',
          message: 'Entry is missing a role or degree title.',
          location: { sectionId: section.type, entryId: entry.id },
          suggestedFix: 'Provide a specific role or degree title.',
        });
      }

      // W-10: Max 6 bullets per entry
      if (entry.bullets.length > 6) {
        issues.push({
          ruleId: 'W-10',
          severity: 'WARNING',
          message: `Entry "${entry.title}" contains ${entry.bullets.length} bullets (recommended maximum: 6).`,
          location: { sectionId: section.type, entryId: entry.id },
          suggestedFix: 'Prune lower-impact bullets to preserve layout readability.',
        });
      }

      for (let bIdx = 0; bIdx < entry.bullets.length; bIdx++) {
        const bullet = entry.bullets[bIdx];
        const location = { sectionId: section.type, entryId: entry.id, factId: bullet.factId, bulletIndex: bIdx };

        // G-01: Fact exists in ledger and is confirmed
        const fact = ledger.getFact(bullet.factId);
        if (!fact) {
          issues.push({
            ruleId: 'G-01',
            severity: 'BLOCKING',
            message: `Bullet references unregistered factId "${bullet.factId}".`,
            location,
            suggestedFix: 'Ensure every bullet corresponds to an immutable fact in the ledger.',
          });
        } else if (!fact.confirmed) {
          issues.push({
            ruleId: 'G-01',
            severity: 'BLOCKING',
            message: `Unconfirmed fact "${bullet.factId}" rendered on resume document tree.`,
            location,
            suggestedFix: 'Explicitly confirm this fact before rendering.',
          });
        }

        // G-02: Fact ownership tier declared
        if (!fact || fact.ownership === undefined || ![1, 2, 3, 4, 5].includes(fact.ownership)) {
          issues.push({
            ruleId: 'G-02',
            severity: 'BLOCKING',
            message: `Fact "${bullet.factId}" does not have a declared ownership tier (1-5).`,
            location,
            suggestedFix: 'Declare candidate ownership tier (1 Supported, 2 Contributed, 3 Owned, 4 Led, 5 Set Direction).',
          });
        }

        // G-03: Unreplaced metric placeholders
        if (PLACEHOLDER_REGEX.test(bullet.text)) {
          const match = bullet.text.match(PLACEHOLDER_REGEX);
          issues.push({
            ruleId: 'G-03',
            severity: 'BLOCKING',
            message: `Unreplaced metric placeholder "${match?.[0]}" detected in bullet text.`,
            location,
            suggestedFix: 'Replace placeholder with verified historical number or compose without metric.',
          });
        }

        // G-04: Claim strength ladder verification
        const firstWord = bullet.text.trim().split(/\s+/)[0] || '';
        const declaredTier = (fact?.ownership || bullet.ownershipTier) as OwnershipTier;
        if (declaredTier && !isVerbPermittedForTier(firstWord, declaredTier)) {
          issues.push({
            ruleId: 'G-04',
            severity: 'BLOCKING',
            message: `Verb "${firstWord}" exceeds candidate declared ownership tier ${declaredTier}. Violates claim-strength ladder.`,
            location,
            suggestedFix: `Rephrase using a verb permitted for Tier ${declaredTier}.`,
          });
        }

        // G-05: Invented metrics
        const extractedInBullet = extractMetrics(bullet.text);
        if (fact && fact.evidence?.type === 'metric' && fact.evidence.value) {
          const factVal = fact.evidence.value.toLowerCase().replace(/\s+/g, '');
          for (const m of extractedInBullet) {
            const mVal = m.raw.toLowerCase().replace(/\s+/g, '');
            if (!mVal.includes(factVal) && !factVal.includes(mVal)) {
              issues.push({
                ruleId: 'G-05',
                severity: 'BLOCKING',
                message: `Invented metric detected: "${m.raw}" in bullet was not declared in confirmed source evidence "${fact.evidence.value}".`,
                location,
                suggestedFix: 'Remove or correct metric to match candidate confirmed fact.',
              });
            }
          }
        }

        // W-01: Weak openers
        const openerLint = lintBulletOpener(bullet.text);
        if (openerLint.isWeak) {
          issues.push({
            ruleId: 'W-01',
            severity: 'WARNING',
            message: openerLint.warning || `Weak opener "${openerLint.detectedPhrase}" detected.`,
            location,
            suggestedFix: 'Declare candidate ownership tier to compose a precise action statement.',
          });
        }

        // W-03: Missing quantifiable metric
        if (extractedInBullet.length === 0) {
          issues.push({
            ruleId: 'W-03',
            severity: 'WARNING',
            message: `Bullet lacks quantifiable performance evidence or metrics.`,
            location,
            suggestedFix: 'Add verifiable metric (latency, %, throughput, savings) if available.',
          });
        }

        // W-08: Overlength bullet
        if (bullet.text.length > 200) {
          issues.push({
            ruleId: 'W-08',
            severity: 'WARNING',
            message: `Bullet length (${bullet.text.length} chars) exceeds 200-character density guideline.`,
            location,
            suggestedFix: 'Trim redundant modifiers to keep bullet concise.',
          });
        }
      }
    }
  }

  // -----------------------------------------------------------
  // Readout 1: Deterministic JD Coverage Percentage
  // -----------------------------------------------------------
  let jdCoveragePct = 100;
  if (target && target.requirements.length > 0) {
    const renderableFacts = ledger.renderableFacts();
    const candidateSkills = new Set<string>();
    for (const f of renderableFacts) {
      for (const t of f.tech) {
        candidateSkills.add(t.toLowerCase());
      }
    }

    let totalWeight = 0;
    let matchedWeight = 0;

    for (const req of target.requirements) {
      totalWeight += req.weight;
      const isMatched = req.canonicalSkillId
        ? candidateSkills.has(req.canonicalSkillId.toLowerCase())
        : Array.from(candidateSkills).some(cs => req.text.toLowerCase().includes(cs));

      if (isMatched) {
        matchedWeight += req.weight;
      } else if (req.priority === 'MANDATORY') {
        issues.push({
          ruleId: 'W-05',
          severity: 'WARNING',
          message: `Missing mandatory target requirement: "${req.text}".`,
          location: { sectionId: 'skills' },
          suggestedFix: `Highlight existing experience or complete project brief at /tools/build-briefs?query=${encodeURIComponent(req.text)}.`,
        });
      }
    }

    jdCoveragePct = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 100;
  }

  const blockingIssues = issues.filter(i => i.severity === 'BLOCKING');
  const warningIssues = issues.filter(i => i.severity === 'WARNING');

  return {
    passed: blockingIssues.length === 0,
    blockingCount: blockingIssues.length,
    warningCount: warningIssues.length,
    issues,
    jdCoveragePct,
    checklist: {
      blocking: blockingIssues,
      warnings: warningIssues,
    },
    evaluatedAt: `${asOf}T12:00:00.000Z`,
  };
}

