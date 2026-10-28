import fs from 'fs';
import path from 'path';

// Seeded PRNG (Linear Congruential Generator / Mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 20261028;
const rand = mulberry32(SEED);

const briefsPath = path.resolve(process.cwd(), 'src/data/suite/project-briefs.json');
const allBriefs: any[] = JSON.parse(fs.readFileSync(briefsPath, 'utf8'));

console.log(`Loaded ${allBriefs.length} briefs for Stage 0 analysis.`);

// Provenance identification:
// The first 83 briefs belong to batch "batch-1-original" (dated 2026-10-18)
// The remaining 75 briefs belong to batch "batch-2-added" (dated 2026-10-28)
const batch1Count = 83;

// Build CORPUS.json
// Schema for corpus item: id, title, domain, difficulty, hours, stack, every section as parsed fields, readingNotes
const corpus = allBriefs.map((b, idx) => {
  const isOriginal = idx < batch1Count;
  const batchLabel = isOriginal ? 'batch-1-original' : 'batch-2-added';
  return {
    index: idx + 1,
    id: b.id,
    title: b.title,
    domain: b.domain,
    difficulty: b.difficulty,
    estimatedHours: b.estimatedHours,
    techStack: b.techStack,
    coveredSkills: b.coveredSkills,
    problemStatement: b.problemStatement,
    useCases: b.useCases,
    problemItSolves: b.problemItSolves,
    recruiterSignal: b.recruiterSignal,
    architecture: b.architecture,
    scaleTargets: b.scaleTargets,
    verificationRubric: b.verificationRubric,
    portfolioBulletFormula: b.portfolioBulletFormula,
    provenance: {
      batch: batchLabel,
      addedDate: isOriginal ? '2026-10-18' : '2026-10-28',
      generator: isOriginal ? 'generator-v1-legacy' : 'generator-v2-market-standard',
    },
  };
});

fs.writeFileSync(
  path.resolve(process.cwd(), 'docs/briefs/CORPUS.json'),
  JSON.stringify(corpus, null, 2),
  'utf8'
);
console.log(`Saved docs/briefs/CORPUS.json with ${corpus.length} briefs.`);

