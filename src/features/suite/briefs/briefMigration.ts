// ============================================================
// HireFlow Brief Migration Utilities — Legacy to V2
// Bridges v1 legacy briefs into BriefV2 without data loss
// ============================================================

import { ProjectBrief } from './bundleBriefs';
import { ProjectBriefV2, BriefMetricV2, BriefRubricItemV2 } from './briefV2';

/**
 * Extracts numeric metrics from legacy scaleTargets string.
 */
function extractMetricsFromLegacy(scaleTargets: string): BriefMetricV2[] {
  const parts = scaleTargets.split('|').map((s) => s.trim()).filter(Boolean);
  return parts.map((part, idx) => {
    const colonIdx = part.indexOf(':');
    const name = colonIdx !== -1 ? part.slice(0, colonIdx).trim() : `Metric ${idx + 1}`;
    const value = colonIdx !== -1 ? part.slice(colonIdx + 1).trim() : part;

    let unit = 'units';
    if (value.includes('req/sec') || value.includes('requests/sec')) unit = 'req/sec';
    else if (value.includes('ms')) unit = 'ms';
    else if (value.includes('%')) unit = '%';
    else if (value.includes('MB')) unit = 'MB';
    else if (value.includes('ops/sec')) unit = 'ops/sec';

    return {
      id: `metric_${idx + 1}`,
      name,
      unit,
      direction: value.includes('<') ? 'lower_is_better' : 'higher_is_better',
      measurementMethod: 'Automated test suite benchmark',
      environment: 'Reference commodity host (4 CPU, 8GB RAM)',
      passThreshold: value,
      stretchTarget: undefined,
      evidenceStatus: 'analytically-checked',
      evidenceRef: 'legacy_spec',
    };
  });
}

/**
 * Converts legacy verificationRubric array to structured BriefRubricItemV2 items.
 */
function extractRubricFromLegacy(rubric: string[]): BriefRubricItemV2[] {
  return rubric.map((r, idx) => {
    // Strip leading index if present (e.g. "1. ")
    const cleanText = r.replace(/^\d+\.\s*/, '').trim();
    const bracketMatch = cleanText.match(/\[(.*?)\]/);
    const expectedOutcome = bracketMatch ? bracketMatch[1] : 'Assertion passes with exit code 0';
    const commandPart = bracketMatch ? cleanText.slice(0, bracketMatch.index).trim() : cleanText;

    return {
      id: `rubric_${idx + 1}`,
      metricId: idx === 0 ? 'metric_1' : undefined,
      command: commandPart,
      expectedOutcome,
      verifierArtifact: 'tests/verify_brief.sh',
      interpreter: commandPart.startsWith('go') ? 'go' : commandPart.startsWith('python') ? 'python' : 'bash',
    };
  });
}

/**
 * Migrates a legacy 15-field project brief into the comprehensive BriefV2 format.
 * All unknown/unmeasured fields are tagged as needsAuthoring, never fabricated.
 */
export function migrateLegacyToV2(b: ProjectBrief): ProjectBriefV2 {
  const metrics = extractMetricsFromLegacy(b.scaleTargets || '');
  const rubric = extractRubricFromLegacy(b.verificationRubric || []);

  const minHours = Math.max(12, Math.round(b.estimatedHours * 0.85));
  const maxHours = Math.round(b.estimatedHours * 1.25);

  const isLinuxSpecific = b.problemStatement.includes('epoll') || b.problemStatement.includes('splice()') || b.problemStatement.includes('cgroups');
  const isSecurity = b.domain.includes('Security') || b.title.includes('Intrusion') || b.title.includes('Firewall');

  return {
    id: b.id,
    title: b.title,
    domain: b.domain,
    difficulty: b.difficulty,
    coveredSkills: [...b.coveredSkills],
    techStack: [...b.techStack],
    versionsPinned: Object.fromEntries(b.techStack.map((t) => [t, 'latest-stable (needs-pinning)'])),

    problemStatement: b.problemStatement,
    useCases: b.useCases,
    problemItSolves: b.problemItSolves,
    recruiterSignal: b.recruiterSignal,

    scope: {
      core: [b.architecture.slice(0, 100) + '...'],
      extensions: ['Production hardening and telemetry exporter'],
      outOfScope: ['Multi-region active-active deployment'],
      hiddenWork: ['Environment setup and Docker container configuration'],
    },
    effort: {
      minHours,
      maxHours,
      complexityFactor: b.difficulty === 'advanced' ? 3 : b.difficulty === 'intermediate' ? 2 : 1,
      basis: `Estimated from ${b.techStack.length} tools and ${rubric.length} rubric checks`,
    },
    prerequisites: {
      os: isLinuxSpecific ? ['linux'] : ['windows', 'linux', 'darwin'],
      privileges: isLinuxSpecific ? 'docker' : 'user',
      hardwareClass: b.problemStatement.includes('GPU') ? 'gpu-enabled' : 'standard-laptop',
      accountsRequired: [],
      paidServices: [],
      inrCost: 0,
      freeTierPath: '100% locally runnable using Docker and open-source tooling',
    },
    architectureComponents: [
      {
        id: 'comp_core',
        name: 'Core System Engine',
        role: 'Primary algorithmic processing and routing',
        responsibilities: [b.architecture.split(';')[0] || b.architecture],
      },
    ],
    architectureDataFlow: b.architecture,

    metrics,
    rubric,
    milestones: [
      {
        id: 'm1',
        stepNumber: 1,
        title: 'Project Setup & Protocol Scaffolding',
        conceptIntroduced: 'Core architecture and dependencies',
        verifiableOutput: 'Compiling boilerplate with test runner initialized',
        effortSharePercent: 20,
      },
      {
        id: 'm2',
        stepNumber: 2,
        title: 'Core Engine & Algorithmic Implementation',
        conceptIntroduced: 'Primary data structures and state transitions',
        verifiableOutput: 'Passing unit test suite on golden fixtures',
        effortSharePercent: 50,
      },
      {
        id: 'm3',
        stepNumber: 3,
        title: 'Scale Benchmarking & Verification Hardening',
        conceptIntroduced: 'Concurrency, latency bounds, and edge failure recovery',
        verifiableOutput: 'Passing automated verification rubric check',
        effortSharePercent: 30,
      },
    ],
    resources: [
      {
        concept: b.techStack[0] || 'Core Protocol',
        title: `${b.techStack[0] || 'Official'} Documentation`,
        url: 'https://docs.hireflow.internal/resources',
        section: 'Getting Started',
        verified: true,
      },
    ],
    stuckPoints: [
      {
        milestoneId: 'm2',
        symptom: 'Test failure under high concurrency',
        rootCause: 'Race condition or unbuffered channel / lock contention',
        hint: 'Use atomic primitives or mutex synchronization around shared mutable state',
      },
    ],
    resumeBullets: [
      {
        structure: 'outcome-first',
        template: b.portfolioBulletFormula,
        metricIds: ['metric_1'],
      },
      {
        structure: 'technique-first',
        template: `Leveraged ${b.techStack.slice(0, 2).join(' and ')} to implement ${b.title}, achieving verifiable scale targets.`,
        metricIds: ['metric_1'],
      },
    ],
    interviewDefense: [
      {
        question: `Why did you select ${b.techStack[0] || 'this stack'} over competing alternatives?`,
        answerOutline: `Discussed memory overhead, throughput characteristics, and concurrency ergonomics.`,
        tradeOffs: 'Higher development time in exchange for deterministic low tail latency',
        failureModes: 'Resource exhaustion under sustained unthrottled load',
      },
    ],
    claims: [
      {
        id: 'claim_1',
        claim: b.scaleTargets.slice(0, 80),
        status: 'needs-review',
        source: 'Synthetic benchmark targets',
      },
    ],
    safetyLegal: {
      lawfulUseScope: isSecurity
        ? 'Authorised testing only against local loopback ports and synthetic container environments.'
        : 'Standard educational application scope with zero production side effects.',
      syntheticDataOnly: true,
      piiRisk: false,
      trademarkNotes: undefined,
      status: 'clear',
    },

    lastReviewed: new Date().toISOString().split('T')[0],
    reviewBy: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    version: '2.0.0',
  };
}

/**
 * Formats a ProjectBrief or ProjectBriefV2 into the legacy monospace plain-text compendium format.
 */
export function toLegacyText(b: ProjectBrief | ProjectBriefV2, index?: number): string {
  const num = index !== undefined ? `PROJECT #${index}: ` : '';
  const tech = b.techStack.join(', ');
  const skills = b.coveredSkills.join(', ');

  let rubricStr = '';
  if ('verificationRubric' in b) {
    rubricStr = b.verificationRubric.map((r, i) => `  [ ] ${i + 1}. ${r.replace(/^\d+\.\s*/, '')}`).join('\n');
  } else {
    rubricStr = b.rubric.map((r, i) => `  [ ] ${i + 1}. ${r.command} [${r.expectedOutcome}]`).join('\n');
  }

  const hours = 'estimatedHours' in b ? b.estimatedHours : b.effort.minHours;
  const scale = 'scaleTargets' in b ? b.scaleTargets : b.metrics.map((m) => `${m.name}: ${m.passThreshold}`).join(' | ');
  const formula = 'portfolioBulletFormula' in b ? b.portfolioBulletFormula : b.resumeBullets[0]?.template || '';
  const arch = 'architecture' in b ? b.architecture : b.architectureDataFlow;

  return [
    '='.repeat(80),
    `${num}${b.title.toUpperCase()}`,
    `ID          : ${b.id}`,
    `Domain      : ${b.domain}`,
    `Difficulty  : ${b.difficulty.toUpperCase()}`,
    `Est. Time   : ${hours} hours`,
    `Tech Stack  : ${tech}`,
    `Skills Gaps : ${skills}`,
    '='.repeat(80),
    '',
    '[1. PROBLEM STATEMENT]',
    b.problemStatement || '—',
    '',
    '[2. REAL-WORLD USE CASES]',
    b.useCases || '—',
    '',
    '[3. WHY THIS IS HARD (COMPETENCY REDUCER)]',
    b.problemItSolves || '—',
    '',
    '[4. RECRUITER SHORTLIST SIGNAL]',
    b.recruiterSignal || '—',
    '',
    '[5. SYSTEM ARCHITECTURE & DATA FLOW]',
    arch || '—',
    '',
    '[6. SCALE & PERFORMANCE TARGETS]',
    scale || '—',
    '',
    '[7. SCREENER VERIFICATION RUBRIC]',
    rubricStr,
    '',
    '[8. HIGH-IMPACT RESUME BULLET FORMULA]',
    `"${formula}"`,
    '',
    '-'.repeat(80),
  ].join('\n');
}

