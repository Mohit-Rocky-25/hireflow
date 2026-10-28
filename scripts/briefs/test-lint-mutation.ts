// ============================================================
// Mutation Test for Brief Linter (Stage 2)
// Injects synthetic defects into clean brief copies and asserts >= 95% detection
// ============================================================

import { LINT_RULES, lintBriefs } from './lint';

// Synthetic clean brief template
const cleanBaseBrief = {
  id: 'brief-clean-base',
  title: 'Clean Reference Base Project',
  domain: 'Computer Science Fundamentals',
  estimatedHours: 20,
  difficulty: 'intermediate',
  coveredSkills: ['Go', 'Networking'],
  techStack: ['Go 1.22', 'PostgreSQL 16'],
  problemStatement: 'A clean reference problem statement explaining socket operations.',
  useCases: 'Reference usage for testing.',
  problemItSolves: 'Demonstrates clean architecture without defects.',
  recruiterSignal: 'Benchmark reports and verifiable test suite.',
  architecture: 'Client connects to server; server dispatches worker thread; writes response.',
  scaleTargets: 'Throughput: > 2,000 requests/sec on 4-core CPU | Latency: < 5ms',
  verificationRubric: [
    'Run bin/verify_test [Exits with code 0 and all assertions passing]',
  ],
  portfolioBulletFormula: 'Engineered high-performance server in Go achieving [THROUGHPUT] req/sec with tail latency under [LATENCY].',
};

// Mutation injectors for each defect class
const mutationInjectors: Record<string, (b: any) => void> = {
  'C-UNPINNED-VERSIONS': (b) => {
    b.techStack = ['Go', 'PostgreSQL', 'Redis']; // strips semver numbers
  },
  'C-SELF-AUTHORED-TESTS': (b) => {
    b.verificationRubric = ['Run pytest tests/test_math.py [All tests pass]'];
  },
  'C-RUBRIC-DUPLICATE-NUMBERING': (b) => {
    b.verificationRubric = ['1. 1. Run server [Server boots]'];
  },
  'C-UNBOUNDED-HARDWARE-CLAIM': (b) => {
    b.scaleTargets = 'Throughput: > 15,000 requests/sec | Latency: < 2ms'; // removes CPU/RAM reference
  },
  'C-LINUX-SYSCALL-PORTABILITY': (b) => {
    b.problemStatement = 'Implements event multiplexing using epoll and splice() system calls.';
  },
  'C-UNATTAINABLE-HARDWARE-REQUIREMENT': (b) => {
    b.techStack.push('CUDA');
    b.scaleTargets += ' on dedicated NVIDIA A10G GPU';
  },
  'C-MISSING-LAWFUL-SCOPE-DISCLAIMER': (b) => {
    b.domain = 'Applied Security & Cryptography';
    b.title = 'Intrusion Detection System';
    b.problemStatement = 'Sniffs raw packets and tests network penetration without disclaimers.';
  },
  'C-ABSOLUTE-UNFALSIFIABLE-CLAIMS': (b) => {
    b.portfolioBulletFormula = 'Guaranteed 100% zero downtime and bug-free execution across all nodes.';
  },
  'C-UNSTRUCTURED-RUBRIC-OUTCOME': (b) => {
    b.verificationRubric = ['Run bin/check_health without any bracketed outcome'];
  },
};

console.log('--- RUNNING LINTER MUTATION TESTING SUITE ---');

let totalClasses = 0;
let passedClasses = 0;
const results: Record<string, { trials: number; detected: number; rate: number }> = {};

const TRIALS_PER_CLASS = 20;

for (const [defectClass, injector] of Object.entries(mutationInjectors)) {
  totalClasses++;
  let detectedCount = 0;

  for (let trial = 0; trial < TRIALS_PER_CLASS; trial++) {
    // Clone clean brief
    const mutated = JSON.parse(JSON.stringify(cleanBaseBrief));
    mutated.id = `brief-mutated-${defectClass}-${trial}`;
    // Inject mutation
    injector(mutated);

    // Run linter
    const findings = lintBriefs([mutated]);
    const caught = findings.some((f) => f.defectClass === defectClass);
    if (caught) {
      detectedCount++;
    }
  }

  const rate = (detectedCount / TRIALS_PER_CLASS) * 100;
  results[defectClass] = { trials: TRIALS_PER_CLASS, detected: detectedCount, rate };

  if (rate >= 95) {
    passedClasses++;
    console.log(`✅ [PASS] ${defectClass}: ${rate.toFixed(1)}% detection rate (${detectedCount}/${TRIALS_PER_CLASS})`);
  } else {
    console.error(`❌ [FAIL] ${defectClass}: ${rate.toFixed(1)}% detection rate (${detectedCount}/${TRIALS_PER_CLASS})`);
  }
}

console.log(`\nMutation Test Summary: ${passedClasses}/${totalClasses} classes passed >= 95% threshold.`);
if (passedClasses !== totalClasses) {
  process.exit(1);
}
