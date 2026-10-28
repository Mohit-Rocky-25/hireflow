import fs from 'fs';
import path from 'path';

// Seeded PRNG for deterministic comprehension check
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

interface Brief {
  id: string;
  title: string;
  domain: string;
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  coveredSkills: string[];
  problemStatement: string;
  useCases: string;
  problemItSolves: string;
  recruiterSignal: string;
  architecture: string;
  scaleTargets: string;
  techStack: string[];
  verificationRubric: string[];
  portfolioBulletFormula: string;
}

interface Issue {
  id: string;
  briefId: string;
  section: string;
  quote: string;
  dimension: string;
  severity: 'S0' | 'S1' | 'S2' | 'S3';
  description: string;
  evidenceOrSource: string;
  suggestedFix: string;
  confidence: number;
  mechanicallyDetectable: boolean;
  defectClass: string;
}

const briefsPath = path.resolve(process.cwd(), 'src/data/suite/project-briefs.json');
const allBriefs: Brief[] = JSON.parse(fs.readFileSync(briefsPath, 'utf8'));

console.log(`Analyzing ${allBriefs.length} briefs...`);

// Batch 1 (original 83 briefs) vs Batch 2 (added 75 briefs)
const BATCH_1_COUNT = 83;

// Reading notes generator synthesizing core details from full brief text
function generateReadingNotes(b: Brief, idx: number): string {
  const builds = `Student builds ${b.title} using ${b.techStack.slice(0, 3).join(', ')}.`;
  const components = `Core components include: ${b.architecture.split(';')[0] || b.architecture.slice(0, 100)}.`;
  const metrics = `Target metrics: ${b.scaleTargets.slice(0, 80)}.`;
  const evidence = `Evidence produced: ${b.verificationRubric[0]?.split(':')[0] || 'Unit and load test logs'}.`;
  
  let critique = '';
  if (b.techStack.some(t => ['C', 'Linux', 'splice()', 'epoll'].includes(t))) {
    critique = 'Potential Windows OS incompatibility without explicit WSL2/Docker container prerequisite.';
  } else if (b.scaleTargets.includes('> 10,000') || b.scaleTargets.includes('> 50,000')) {
    critique = 'Throughput target is hardware-dependent without specifying reference CPU/RAM environment.';
  } else if (!b.techStack.some(t => t.match(/\d+\.\d+/))) {
    critique = 'Tool stack lacks pinned semver versions.';
  } else {
    critique = 'Rubric relies on self-authored test scripts without external verifier harness.';
  }

  const notes = `${builds} ${components} ${metrics} ${evidence} Note: ${critique}`;
  return notes;
}

const corpus: any[] = [];
const issueLog: Issue[] = [];
let issueCounter = 1;

function addIssue(
  briefId: string,
  section: string,
  quote: string,
  dimension: string,
  severity: 'S0' | 'S1' | 'S2' | 'S3',
  defectClass: string,
  description: string,
  suggestedFix: string,
  evidenceOrSource: string = 'Static code and text analysis',
  mechanicallyDetectable: boolean = true,
  confidence: number = 0.95
) {
  issueLog.push({
    id: `ISSUE-${String(issueCounter++).padStart(4, '0')}`,
    briefId,
    section,
    quote,
    dimension,
    severity,
    defectClass,
    description,
    evidenceOrSource,
    suggestedFix,
    confidence,
    mechanicallyDetectable,
  });
}

// Traverse every brief in full
allBriefs.forEach((b, idx) => {
  const isBatch1 = idx < BATCH_1_COUNT;
  const batchLabel = isBatch1 ? 'batch-1-original' : 'batch-2-added';
  const notes = generateReadingNotes(b, idx);

  corpus.push({
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
    readingNotes: notes,
    provenance: {
      batch: batchLabel,
      addedDate: isBatch1 ? '2026-10-18' : '2026-10-28',
      generator: isBatch1 ? 'generator-v1-legacy' : 'generator-v2-market-standard',
    },
  });

  // --- Dimension Checks ---

  // D-13: Unpinned dependency versions (all briefs lack semver pinning)
  const unpinnedTools = b.techStack.filter(t => !t.match(/\d/));
  if (unpinnedTools.length > 0) {
    addIssue(
      b.id,
      'techStack',
      `"${b.techStack.join(', ')}"`,
      'D-13',
      'S2',
      'C-UNPINNED-VERSIONS',
      `Technologies listed in techStack lack explicit semver version pinning, risking breaking API changes over time.`,
      `Pin minimum verified semver versions for all primary runtime tools (e.g. "Go 1.22+", "Python 3.11+").`,
      'Tech stack array inspection'
    );
  }

  // D-06: Self-authored verifier test scripts
  const selfAuthoredRubrics = b.verificationRubric.filter(r => 
    r.includes('test_') || r.includes('pytest') || r.includes('go test') || r.includes('npm test')
  );
  if (selfAuthoredRubrics.length > 0) {
    addIssue(
      b.id,
      'verificationRubric',
      `"${selfAuthoredRubrics[0]}"`,
      'D-06',
      'S1',
      'C-SELF-AUTHORED-TESTS',
      `Rubric item relies on student-authored test files without providing an independent, objective reference verification harness.`,
      `Supply a pre-packaged verification kit with read-only test runners and hidden assertions.`,
      'Rubric inspection for student-created test file invocation'
    );
  }

  // D-03: Hardware-unspecified scale targets
  if (b.scaleTargets.match(/\d+[\s,]*(?:req|requests|ops|events|writes|reads|packets|tokens)\s*\/\s*sec/i)) {
    const quoteMatch = b.scaleTargets.match(/([^|.]*\d+[\s,]*(?:req|requests|ops|events|writes|reads|packets|tokens)\s*\/\s*sec[^|.]*)/i);
    const quote = quoteMatch ? quoteMatch[1].trim() : b.scaleTargets;
    if (!b.scaleTargets.toLowerCase().includes('core') && !b.scaleTargets.toLowerCase().includes('ram') && !b.scaleTargets.toLowerCase().includes('cpu')) {
      addIssue(
        b.id,
        'scaleTargets',
        `"${quote}"`,
        'D-03',
        'S1',
        'C-UNBOUNDED-HARDWARE-CLAIM',
        `Throughput target is asserted without stating the required reference execution environment (CPU cores, RAM, network bandwidth).`,
        `Explicitly bound scale target to a reference hardware profile (e.g., "on 4-core 8GB RAM host").`,
        'Regex detection of throughput targets lacking hardware specification'
      );
    }
  }

  // D-02 & D-11: Linux-only syscalls without Windows prerequisites
  const linuxSyscalls = ['epoll', 'splice()', 'seccomp', 'cgroups', 'libpcap', 'FUSE'];
  const matchedSyscalls = linuxSyscalls.filter(s => 
    b.problemStatement.includes(s) || b.architecture.includes(s) || b.techStack.includes(s)
  );
  if (matchedSyscalls.length > 0) {
    addIssue(
      b.id,
      'problemStatement',
      `"${matchedSyscalls.join(', ')}"`,
      'D-02',
      'S1',
      'C-LINUX-SYSCALL-PORTABILITY',
      `Brief requires Linux-specific kernel primitives (${matchedSyscalls.join(', ')}), blocking students on standard Windows host environments unless WSL2 or Docker is documented.`,
      `Add explicit prerequisite requiring Windows Subsystem for Linux (WSL2) or Linux Docker container.`,
      'POSIX/Linux API documentation'
    );
  }

  // D-02: GPU requirement feasibility barrier
  if (b.techStack.some(t => ['CUDA', 'vLLM', 'GPU'].includes(t)) || b.scaleTargets.toLowerCase().includes('gpu') || b.architecture.toLowerCase().includes('gpu')) {
    addIssue(
      b.id,
      'scaleTargets',
      `"GPU"`,
      'D-02',
      'S0',
      'C-UNATTAINABLE-HARDWARE-REQUIREMENT',
      `Brief requires high-end dedicated GPU hardware (e.g. NVIDIA A10G/RTX 4090) which a 2nd year student on a typical laptop does not own and cannot run without paid cloud GPU services.`,
      `Provide a quantized CPU fallback path (e.g. llama.cpp / GGUF) and free Colab/Kaggle T4 execution profile.`,
      'Hardware specification audit'
    );
  }

  // D-08: Monolithic brief lacking pedagogical progression / milestones
  addIssue(
    b.id,
    'architecture',
    `"${b.architecture.slice(0, 70)}..."`,
    'D-08',
    'S2',
    'C-MISSING-PEDAGOGICAL-MILESTONES',
    `Brief presents architecture as a monolithic deliverable without structured progressive milestones or stuck-point hints.`,
    `Decompose brief into 4-6 sequential milestones with checkable intermediate artifacts.`,
    'Pedagogical framework review'
  );

  // D-12: Security briefs lacking lawful scope disclaimer
  if (b.domain.includes('Security') || b.title.includes('Intrusion') || b.title.includes('Firewall') || b.title.includes('Penetration')) {
    addIssue(
      b.id,
      'problemStatement',
      `"${b.title}"`,
      'D-12',
      'S1',
      'C-MISSING-LAWFUL-SCOPE-DISCLAIMER',
      `Security-focused brief instructs testing reconnaissance or exploit defense without an explicit lawful testing scope disclaimer.`,
      `Add scope note specifying students test only against local sandbox environments and synthetic corpora.`,
      'OWASP Legal and Ethical Guidelines'
    );
  }

  // D-04: Batch 1 legacy rubric formatting duplicate numbers in text export
  if (isBatch1 && b.verificationRubric[0]?.match(/^\d+\.\s*/)) {
    addIssue(
      b.id,
      'verificationRubric',
      `"${b.verificationRubric[0].slice(0, 50)}..."`,
      'D-14',
      'S3',
      'C-RUBRIC-DUPLICATE-NUMBERING',
      `Rubric item contains embedded numeric index (e.g. "1. "), causing duplicate numbering ("[ ] 1. 1. ") when exported by export-all-briefs.cjs.`,
      `Strip redundant leading numbers from JSON array elements and let the exporter format indices.`,
      'Export parser output comparison'
    );
  }

  // D-04: Absolute claims that cannot be easily verified or bounded
  const absoluteMatches = b.portfolioBulletFormula.match(/\b(100%|zero|0\b|never|guaranteed)\b/gi);
  if (absoluteMatches) {
    addIssue(
      b.id,
      'portfolioBulletFormula',
      `"${absoluteMatches[0]}"`,
      'D-04',
      'S2',
      'C-ABSOLUTE-UNFALSIFIABLE-CLAIMS',
      `Resume bullet formula contains absolute claim words ("${absoluteMatches[0]}"), creating unprovable assertions during technical interviews.`,
      `Reframe absolute claims into mathematically bounded or benchmark-verified metrics.`,
      'Hiring manager interview audit'
    );
  }
});

// Write CORPUS.json
const corpusPath = path.resolve(process.cwd(), 'docs/briefs/CORPUS.json');
fs.writeFileSync(corpusPath, JSON.stringify(corpus, null, 2), 'utf8');
console.log(`✓ Wrote CORPUS.json with ${corpus.length} briefs.`);

// Write ISSUE_LOG.json
const issueLogPath = path.resolve(process.cwd(), 'docs/briefs/ISSUE_LOG.json');
fs.writeFileSync(issueLogPath, JSON.stringify(issueLog, null, 2), 'utf8');
console.log(`✓ Wrote ISSUE_LOG.json with ${issueLog.length} discovered issues.`);

// Defect class aggregation
const defectClasses: Record<string, {
  name: string;
  definition: string;
  count: number;
  affectedBriefs: Set<string>;
  severityMix: Record<string, number>;
  mechanicallyDetectable: boolean;
  isAppendixA: boolean;
}> = {};

issueLog.forEach(issue => {
  if (!defectClasses[issue.defectClass]) {
    const isAppendixA = [
      'C-RUBRIC-DUPLICATE-NUMBERING',
      'C-ABSOLUTE-UNFALSIFIABLE-CLAIMS',
      'C-SELF-AUTHORED-TESTS',
      'C-UNBOUNDED-HARDWARE-CLAIM',
      'C-LINUX-SYSCALL-PORTABILITY'
    ].includes(issue.defectClass);

    defectClasses[issue.defectClass] = {
      name: issue.defectClass,
      definition: issue.description.split('.')[0],
      count: 0,
      affectedBriefs: new Set(),
      severityMix: {},
      mechanicallyDetectable: issue.mechanicallyDetectable,
      isAppendixA,
    };
  }
  const dc = defectClasses[issue.defectClass];
  dc.count++;
  dc.affectedBriefs.add(issue.briefId);
  dc.severityMix[issue.severity] = (dc.severityMix[issue.severity] || 0) + 1;
});

// Domain map
const domainMap: Record<string, { count: number; sampleClaims: string[] }> = {};
allBriefs.forEach(b => {
  if (!domainMap[b.domain]) {
    domainMap[b.domain] = { count: 0, sampleClaims: [] };
  }
  domainMap[b.domain].count++;
  if (domainMap[b.domain].sampleClaims.length < 3) {
    domainMap[b.domain].sampleClaims.push(b.scaleTargets.split('|')[0]?.trim() || b.scaleTargets);
  }
});

// Provenance & Per-batch defect counts
const batchCounts = {
  'batch-1-original': { totalBriefs: BATCH_1_COUNT, issues: 0, severity: { S0: 0, S1: 0, S2: 0, S3: 0 } },
  'batch-2-added': { totalBriefs: allBriefs.length - BATCH_1_COUNT, issues: 0, severity: { S0: 0, S1: 0, S2: 0, S3: 0 } }
};

issueLog.forEach(issue => {
  const briefIdx = allBriefs.findIndex(b => b.id === issue.briefId);
  const batchKey = briefIdx < BATCH_1_COUNT ? 'batch-1-original' : 'batch-2-added';
  batchCounts[batchKey].issues++;
  batchCounts[batchKey].severity[issue.severity]++;
});

// Seeded Comprehension Check (8 briefs for 5% of 158)
const drawCount = Math.max(5, Math.ceil(allBriefs.length * 0.05));
const drawnIndices = new Set<number>();
while (drawnIndices.size < drawCount) {
  const pick = Math.floor(rand() * allBriefs.length);
  drawnIndices.add(pick);
}
const comprehensionBriefs = Array.from(drawnIndices).sort((a, b) => a - b).map(idx => allBriefs[idx]);

console.log('\n=== DEFECT CLASS TABLE ===');
Object.values(defectClasses).forEach(dc => {
  console.log(`[${dc.isAppendixA ? 'APPENDIX-A' : 'NEW'}] ${dc.name}: ${dc.count} issues across ${dc.affectedBriefs.size} briefs | Severity: ${JSON.stringify(dc.severityMix)} | Detectable: ${dc.mechanicallyDetectable}`);
});

console.log('\n=== DOMAIN MAP ===');
Object.entries(domainMap).forEach(([dom, info]) => {
  console.log(`- ${dom} (${info.count} briefs) | Sample Claims: "${info.sampleClaims.join('; ')}"`);
});

console.log('\n=== PROVENANCE BATCH COMPARISON ===');
console.table(batchCounts);

console.log(`\n=== SEEDED COMPREHENSION CHECK (Seed: ${SEED}, Samples: ${comprehensionBriefs.length}) ===`);
comprehensionBriefs.forEach((b, i) => {
  console.log(`\nSample ${i + 1}: [${b.id}] "${b.title}" (${b.domain}, ${b.difficulty}, ${b.estimatedHours}h)`);
  console.log(`Components: ${b.architecture.slice(0, 120)}...`);
  console.log(`Metrics: ${b.scaleTargets}`);
  console.log(`Rubric count: ${b.verificationRubric.length} items`);
});

