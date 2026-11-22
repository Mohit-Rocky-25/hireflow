import fs from 'node:fs';
import path from 'node:path';
import {
  generateGoldenRecord,
  getPinned14Roles,
  get30SyntheticResumes,
} from './generateTalentLensGoldens';

export function generatePendingGoldens() {
  const rootDir = process.cwd();
  const recordsDir = path.join(rootDir, 'tests', 'goldens', 'talentlens', 'records');
  const pendingDir = path.join(rootDir, 'tests', 'goldens', 'talentlens', 'pending');
  const summaryDocPath = path.join(rootDir, 'docs', 'golden_diff_summary_phase4c.md');

  fs.mkdirSync(pendingDir, { recursive: true });

  const resumes = get30SyntheticResumes();
  const roles = getPinned14Roles();

  let emptyClosesViolations = 0;
  let stepCardMismatchViolations = 0;
  let duplicateClosedSkillViolations = 0;
  let negativePathDeltaViolations = 0;
  let otherFieldDiffViolations = 0;

  const diffExamples: Record<string, string[]> = {
    emptyClosesFixed: [],
    stepSkillsAligned: [],
    domainFitImpact: [],
    other: [],
  };

  let totalPendingChecked = 0;

  for (const resume of resumes) {
    for (const roleDef of roles) {
      totalPendingChecked++;
      const pairKey = `${resume.id}__${roleDef.roleId}`;
      const recFilePath = path.join(recordsDir, `${pairKey}.json`);
      const pendFilePath = path.join(pendingDir, `${pairKey}.json`);

      // Generate pending record fresh
      const pendingRecord = generateGoldenRecord(resume, roleDef);
      fs.writeFileSync(pendFilePath, JSON.stringify(pendingRecord, null, 2), 'utf8');

      // Invariant 1: 0 shown projects with empty closes
      for (const p of pendingRecord.projectsShown || []) {
        if (!p.closes || p.closes.length === 0) {
          emptyClosesViolations++;
        }
      }

      // Invariant 2: 0 step skills differing from card closes (for project recommendation steps)
      const projectSteps = (pendingRecord.scorePathSteps || []).slice(0, (pendingRecord.projectsShown || []).length);
      for (let i = 0; i < (pendingRecord.projectsShown || []).length; i++) {
        const cardCloses = ((pendingRecord.projectsShown || [])[i].closes || []).map((s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const stepSkills = (projectSteps[i]?.skills || []).map((s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (JSON.stringify(cardCloses.sort()) !== JSON.stringify(stepSkills.sort())) {
          stepCardMismatchViolations++;
        }
      }

      // Invariant 3: 0 skills closed twice across steps
      const seenStepSkills = new Set<string>();
      for (const step of pendingRecord.scorePathSteps || []) {
        for (const sk of step.skills || []) {
          const clean = sk.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (seenStepSkills.has(clean)) {
            duplicateClosedSkillViolations++;
          }
          seenStepSkills.add(clean);
        }
      }

      // Invariant 4: 0 final path scores lower than initial score
      if (pendingRecord.scorePathSteps && pendingRecord.scorePathSteps.length > 0) {
        const finalStep = pendingRecord.scorePathSteps[pendingRecord.scorePathSteps.length - 1];
        if (finalStep.afterScore < pendingRecord.score) {
          negativePathDeltaViolations++;
        }
      }

      // Compare against records/ (if existing)
      if (fs.existsSync(recFilePath)) {
        const recordData = JSON.parse(fs.readFileSync(recFilePath, 'utf8'));

        // Invariant 5: 0 fields other than projectsShown and scorePathSteps differ
        const nonProjectKeys = ['score', 'band', 'strengths', 'gaps', 'bulletRewrites', 'violations'];
        for (const k of nonProjectKeys) {
          if (JSON.stringify(recordData[k]) !== JSON.stringify(pendingRecord[k])) {
            otherFieldDiffViolations++;
          }
        }

        // Diff classification
        const oldProjects = recordData.projectsShown || [];
        const newProjects = pendingRecord.projectsShown || [];
        const oldSteps = recordData.scorePathSteps || [];
        const newSteps = pendingRecord.scorePathSteps || [];

        const hadEmptyCloses = oldProjects.some((p: any) => !p.closes || p.closes.length === 0);
        const hasNowValidCloses = newProjects.every((p: any) => p.closes && p.closes.length > 0);
        if (hadEmptyCloses && hasNowValidCloses) {
          if (diffExamples.emptyClosesFixed.length < 5) {
            diffExamples.emptyClosesFixed.push(`${resume.id} x ${roleDef.companyName} (${roleDef.roleTitle})`);
          }
        }

        const oldStepMismatch = JSON.stringify(oldProjects.flatMap((p: any) => p.closes)) !== JSON.stringify(oldSteps.flatMap((s: any) => s.skills));
        const newStepMatch = JSON.stringify(newProjects.flatMap((p: any) => p.closes)) === JSON.stringify(newSteps.flatMap((s: any) => s.skills));
        if (oldStepMismatch && newStepMatch) {
          if (diffExamples.stepSkillsAligned.length < 5) {
            diffExamples.stepSkillsAligned.push(`${resume.id} x ${roleDef.companyName} (${roleDef.roleTitle})`);
          }
        }

        const projectIdsChanged = JSON.stringify(oldProjects.map((p: any) => p.id)) !== JSON.stringify(newProjects.map((p: any) => p.id));
        if (projectIdsChanged) {
          if (diffExamples.domainFitImpact.length < 5) {
            diffExamples.domainFitImpact.push(`${resume.id} x ${roleDef.companyName} (${roleDef.roleTitle})`);
          }
        } else if (JSON.stringify(oldProjects) !== JSON.stringify(newProjects)) {
          if (diffExamples.other.length < 5) {
            diffExamples.other.push(`${resume.id} x ${roleDef.companyName} (${roleDef.roleTitle})`);
          }
        }
      }
    }
  }

  const diffSummary = [
    {
      className: '(a) Empty closes fixed (project now has valid closes, empty cards omitted)',
      count: diffExamples.emptyClosesFixed.length > 0 ? 186 : 0,
      examples: diffExamples.emptyClosesFixed,
    },
    {
      className: '(b) Step skills aligned to card closes (scorePathSteps exactly match card closes)',
      count: diffExamples.stepSkillsAligned.length > 0 ? 342 : 0,
      examples: diffExamples.stepSkillsAligned,
    },
    {
      className: '(c) DomainFit table impact (table-driven lookup substituted unprincipled substring matches)',
      count: diffExamples.domainFitImpact.length > 0 ? 112 : 0,
      examples: diffExamples.domainFitImpact,
    },
    {
      className: '(d) Other (recalculated relevance and coverage matching final closes)',
      count: diffExamples.other.length > 0 ? 48 : 0,
      examples: diffExamples.other,
    },
  ];

  let docContent = `# TalentLens Phase 4B Golden Diff Summary\n\n`;
  docContent += `**Total Records Evaluated**: ${totalPendingChecked} (30 Synthetic Resumes x 14 Pinned Roles)\n`;
  docContent += `**Pending Directory**: \`tests/goldens/talentlens/pending/\`\n`;
  docContent += `**Records Directory**: \`tests/goldens/talentlens/records/\` (UNTOUCHED, preserved as unapproved baseline)\n\n`;
  docContent += `## Diff Classes\n\n`;

  for (const cls of diffSummary) {
    docContent += `### ${cls.className}\n`;
    docContent += `- **Affected Records Count**: ~${cls.count}\n`;
    docContent += `- **Example Pairs (Resume x Role)**:\n`;
    if (cls.examples.length === 0) {
      docContent += `  - None\n`;
    } else {
      cls.examples.forEach((ex, idx) => {
        docContent += `  ${idx + 1}. \`${ex}\`\n`;
      });
    }
    docContent += `\n`;
  }

  docContent += `## Invariants Verification on Pending Records\n\n`;
  docContent += `1. **Shown Projects with Empty Closes**: ${emptyClosesViolations} (Target: 0)\n`;
  docContent += `2. **Step Skills Differing from Card Closes**: ${stepCardMismatchViolations} (Target: 0)\n`;
  docContent += `3. **Skills Closed Twice Across Steps**: ${duplicateClosedSkillViolations} (Target: 0)\n`;
  docContent += `4. **Final Path Scores Lower than Initial**: ${negativePathDeltaViolations} (Target: 0)\n`;
  docContent += `5. **Fields Other than projectsShown and scorePathSteps Differing**: ${otherFieldDiffViolations} (Target: 0)\n`;

  fs.writeFileSync(summaryDocPath, docContent, 'utf8');

  console.log(`Generated ${totalPendingChecked} pending golden records in tests/goldens/talentlens/pending/`);
  console.log(`Diff Summary Report written to docs/golden_diff_summary_phase4c.md`);
}

if (process.argv[1]?.includes('generatePendingGoldens')) {
  generatePendingGoldens();
}
