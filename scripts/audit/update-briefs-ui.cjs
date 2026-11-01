const fs = require('fs');

// 1. Update bundleBriefs.ts
const bundleBriefsPath = 'src/features/suite/briefs/bundleBriefs.ts';
let bundleBriefsContent = fs.readFileSync(bundleBriefsPath, 'utf8').replace(/\r\n/g, '\n');

const projectBriefTarget = `  portfolioBulletFormula: string;
}`;

const projectBriefReplacement = `  portfolioBulletFormula: string;
  milestones?: Array<{
    stepNumber: number;
    title: string;
    description: string;
    doneWhen: string;
  }>;
  starterDirectory?: string;
}`;

bundleBriefsContent = bundleBriefsContent.replace(projectBriefTarget, projectBriefReplacement);

const getHoursTarget = `export function getBriefHoursRange(brief: ProjectBrief): { min: number; max: number; label: string; assumption: string } {
  const min = Math.max(10, Math.round(brief.estimatedHours * 0.75));
  const max = Math.round(brief.estimatedHours * 1.25);
  const stack = (brief.techStack || []).slice(0, 2).join(' / ');
  const assumption = \`Assumes foundational familiarity with \${stack || 'core technologies'}\`;
  return {
    min,
    max,
    label: \`\${min}–\${max} h (estimate)\`,
    assumption,
  };
}`;

const getHoursReplacement = `export function getBriefHoursRange(brief: ProjectBrief): { min: number; max: number; label: string; assumption: string } {
  const min = Math.max(35, Math.round(brief.estimatedHours * 0.8));
  const max = Math.max(min + 15, Math.round(brief.estimatedHours * 1.25));
  const minWeeks = Math.max(2, Math.round(min / 15));
  const maxWeeks = Math.max(minWeeks + 1, Math.round(max / 15));
  const stack = (brief.techStack || []).slice(0, 2).join(' / ');
  const assumption = \`Realistic student pace (~12–15 h/week). Assumes foundational familiarity with \${stack || 'core technologies'}\`;
  return {
    min,
    max,
    label: \`\${min}–\${max} h (\${minWeeks}–\${maxWeeks} weeks)\`,
    assumption,
  };
}`;

bundleBriefsContent = bundleBriefsContent.replace(getHoursTarget, getHoursReplacement);
fs.writeFileSync(bundleBriefsPath, bundleBriefsContent, 'utf8');
console.log('bundleBriefs.ts updated');

// 2. Update briefHelpers.ts
const helpersPath = 'src/features/suite/briefs/components/briefHelpers.ts';
let helpersContent = fs.readFileSync(helpersPath, 'utf8').replace(/\r\n/g, '\n');

const helpersTarget = `    \`SKILLS COVERED\`,
    \`-\`.repeat(40),
    brief.coveredSkills.join(', '),`;

const helpersReplacement = `    \`SKILLS COVERED\`,
    \`-\`.repeat(40),
    brief.coveredSkills.join(', '),
    ...(brief.starterDirectory ? [
      \`\`,
      \`STARTER DIRECTORY STRUCTURE\`,
      \`-\`.repeat(40),
      brief.starterDirectory,
    ] : []),
    ...(brief.milestones && brief.milestones.length > 0 ? [
      \`\`,
      \`PROJECT MILESTONES & ACCEPTANCE CRITERIA\`,
      \`-\`.repeat(40),
      ...brief.milestones.map(
        (m, i) => \`Milestone \${m.stepNumber || i + 1}: \${m.title}\\nDescription: \${m.description || '—'}\\nDone when  : \${m.doneWhen}\\n\`
      ),
    ] : []),`;

helpersContent = helpersContent.replace(helpersTarget, helpersReplacement);
fs.writeFileSync(helpersPath, helpersContent, 'utf8');
console.log('briefHelpers.ts updated');

// 3. Update BriefDetailModal.tsx
const modalPath = 'src/features/suite/briefs/components/BriefDetailModal.tsx';
let modalContent = fs.readFileSync(modalPath, 'utf8').replace(/\r\n/g, '\n');

// Add FolderTree icon import if not present
if (!modalContent.includes('FolderTree')) {
  modalContent = modalContent.replace(
    "  CheckCircle2,\n} from 'lucide-react';",
    "  CheckCircle2,\n  FolderTree,\n} from 'lucide-react';"
  );
}

const modalTarget = `          {/* Tech Stack */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <Terminal className="w-3.5 h-3.5 text-silver" /> Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {brief.techStack.map((tech, i) => (
                <span key={i} className={\`text-xs font-bold px-2.5 py-1 rounded border \${dc.bg} \${dc.text} \${dc.border}\`}>
                  {tech}
                </span>
              ))}
            </div>
          </section>`;

const modalReplacement = `          {/* Tech Stack */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <Terminal className="w-3.5 h-3.5 text-silver" /> Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {brief.techStack.map((tech, i) => (
                <span key={i} className={\`text-xs font-bold px-2.5 py-1 rounded border \${dc.bg} \${dc.text} \${dc.border}\`}>
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Starter Directory Structure */}
          {brief.starterDirectory && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                <FolderTree className="w-3.5 h-3.5 text-volt" /> Starter Directory Structure
              </h3>
              <pre className="p-4 rounded bg-black border border-charcoal font-mono text-xs text-silver overflow-x-auto leading-relaxed select-all">
                {brief.starterDirectory}
              </pre>
            </section>
          )}

          {/* Project Milestones */}
          {brief.milestones && brief.milestones.length > 0 && (
            <section className="space-y-2.5">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-volt" /> Project Milestones & Verification Criteria
              </h3>
              <div className="space-y-2">
                {brief.milestones.map((m, i) => (
                  <div key={i} className="bg-black p-3.5 rounded border border-charcoal space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-volt">
                        Milestone {m.stepNumber || i + 1}: {m.title}
                      </span>
                    </div>
                    {m.description && <p className="text-silver leading-relaxed">{m.description}</p>}
                    <div className="flex items-start gap-1.5 text-[11px] text-emerald-400 font-mono pt-0.5">
                      <span className="font-bold text-emerald-300 shrink-0">Done when:</span>
                      <span>{m.doneWhen}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}`;

modalContent = modalContent.replace(modalTarget, modalReplacement);
fs.writeFileSync(modalPath, modalContent, 'utf8');
console.log('BriefDetailModal.tsx updated');

