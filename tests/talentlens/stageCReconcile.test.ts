import { describe, it } from 'vitest';
import briefsData from '../../src/data/suite/project-briefs.json';
import { CONCEPT_DEFINITIONS, validateBriefConcepts } from '../../src/pages/demo/engine/conceptTagValidator';
import { getCanonicalSkillName, deriveBriefRealSkills } from '../../src/pages/demo/engine/projectMatcherIntegrity';

describe('Stage C Concept Tag Reconciliation', () => {
  it('reconciles 448 dropped (Phase 3A) vs 31 dropped (Phase 3B)', () => {
    let totalClaimedInCoveredSkills = 0;
    let p3a_vettedConcepts = 0;
    let p3a_dropped = 0;

    let p3b_dropped = 0;
    const p3b_droppedList: Array<{ briefId: string; tag: string; reason: string }> = [];

    // Check tags accepted in P3B vs P3A
    const acceptedIn3B_droppedIn3A: Array<{ briefId: string; tag: string; briefTextSnippet: string }> = [];

    for (const b of briefsData as any[]) {
      const fullText = [
        b.title,
        b.problemStatement,
        b.architecture,
        b.problemItSolves,
        b.useCases,
        b.recruiterSignal,
        ...(b.verificationRubric || []),
        ...(b.milestones || []).map((m: any) => `${m.title} ${m.doneWhen}`),
      ].join(' ');

      const derivedTech = new Set<string>();
      for (const t of b.techStack || []) {
        const c = getCanonicalSkillName(t);
        if (c) derivedTech.add(c);
      }

      // P3B validateBriefConcepts
      const res3b = validateBriefConcepts(b);
      p3b_dropped += res3b.droppedTags.length;
      for (const d of res3b.droppedTags) {
        p3b_droppedList.push({ briefId: b.id, ...d });
      }

      // P3A logic in stage1ConceptVetting.test.ts
      for (const rawTag of b.coveredSkills || []) {
        totalClaimedInCoveredSkills++;
        const normTag = rawTag.toLowerCase().trim();
        const matchedDef = CONCEPT_DEFINITIONS.find((def) =>
          def.aliases.some((alias) => normTag === alias || normTag.includes(alias) || alias.includes(normTag))
        );

        let droppedIn3A = false;
        if (matchedDef) {
          if (matchedDef.evidencePattern.test(fullText)) {
            p3a_vettedConcepts++;
          } else {
            p3a_dropped++;
            droppedIn3A = true;
          }
        } else {
          const canon = getCanonicalSkillName(rawTag);
          if (!derivedTech.has(canon)) {
            p3a_dropped++;
            droppedIn3A = true;
          }
        }

        // Did P3B drop this tag?
        const droppedIn3B = res3b.droppedTags.some((d) => d.tag.toLowerCase().trim() === normTag);
        if (droppedIn3A && !droppedIn3B) {
          // Find text snippet
          const matchIdx = fullText.toLowerCase().indexOf(normTag);
          const snippet = matchIdx >= 0 ? fullText.slice(Math.max(0, matchIdx - 30), matchIdx + normTag.length + 30) : '(not found in fullText)';
          acceptedIn3B_droppedIn3A.push({
            briefId: b.id,
            tag: rawTag,
            briefTextSnippet: snippet.trim().replace(/\s+/g, ' '),
          });
        }
      }
    }

    console.log(`[STAGE C] Total claimed tags in coveredSkills: ${totalClaimedInCoveredSkills}`);
    console.log(`[STAGE C] Phase 3A (stage1ConceptVetting): vetted concepts = ${p3a_vettedConcepts}, total dropped = ${p3a_dropped}`);
    console.log(`[STAGE C] Phase 3B (validateBriefConcepts): dropped = ${p3b_dropped}`);
    console.log(`[STAGE C] All 31 dropped tags in Phase 3B:`);
    p3b_droppedList.forEach((d, idx) => {
      console.log(`  ${idx + 1}. [${d.briefId}] "${d.tag}": ${d.reason}`);
    });

    console.log(`\n[STAGE C] Sample 30 tags accepted in P3B but dropped in P3A:`);
    acceptedIn3B_droppedIn3A.slice(0, 30).forEach((item, idx) => {
      console.log(`  ${idx + 1}. [${item.briefId}] "${item.tag}" — Snippet: "${item.briefTextSnippet}"`);
    });

    console.log(`[STAGE C] Total accepted in 3B that were dropped in 3A: ${acceptedIn3B_droppedIn3A.length}`);
  });
});
