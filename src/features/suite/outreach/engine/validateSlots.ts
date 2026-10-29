// ============================================================
// HireFlow — Outreach Engine: Slot Validation
// Validates slot inputs against specificity & honest outreach standards
// ============================================================

import { OutreachSlotsV2, ValidationIssue } from '../types';

export const GENERIC_FLATTERY_LIST = [
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
  'nice product',
  'world class team',
  'world-class engineering',
  'industry leader',
  'innovative work',
  'market leader',
  'awesome tech',
];

const KNOWN_TECH_TERMS = new Set([
  'api', 'rest', 'graphql', 'grpc', 'kafka', 'redis', 'postgres', 'postgresql', 'mysql',
  'mongodb', 'cassandra', 'docker', 'kubernetes', 'k8s', 'aws', 'gcp', 'azure', 'go',
  'golang', 'python', 'java', 'rust', 'c++', 'typescript', 'javascript', 'react', 'next.js',
  'vue', 'node.js', 'express', 'spring', 'django', 'fastapi', 'microservices', 'distributed',
  'concurrency', 'latency', 'throughput', 'sharding', 'replication', 'cache', 'caching',
  'indexing', 'etl', 'pipeline', 'queue', 'broker', 'pubsub', 'raft', 'consensus',
  'gateway', 'switch', 'checkout', 'payments', 'auth', 'oauth', 'jwt', 'ci/cd', 'terraform'
]);

/**
 * Validates whether an admired project / work reference has genuine substance.
 * Rule: must be >= 3 meaningful words OR contain a recognized technical term / proper noun,
 * and must not match the generic flattery blacklist.
 */
export function validateAdmiredWork(value: string): { valid: boolean; issue?: ValidationIssue } {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      valid: false,
      issue: {
        slot: 'admiredProject',
        severity: 'error',
        message: 'Please provide a specific engineering project, feature, or post you noticed.',
        exampleGood: 'the technical post-mortem on your Redis replication lag',
        exampleBad: 'your great work',
      },
    };
  }

  const lower = trimmed.toLowerCase();

  // Check generic flattery
  for (const phrase of GENERIC_FLATTERY_LIST) {
    if (lower === phrase || lower === `your ${phrase}` || lower === `the ${phrase}`) {
      return {
        valid: false,
        issue: {
          slot: 'admiredProject',
          severity: 'error',
          message: 'Generic praise sounds hollow to engineers and recruiters. Cite a concrete feature, article, or tool instead.',
          exampleGood: 'your team\'s open-source payment webhook gateway',
          exampleBad: trimmed,
        },
      };
    }
  }

  // Tokenize
  const words = trimmed.split(/\s+/).filter(Boolean);
  const meaningfulWords = words.filter((w) => w.length > 2 && !['and', 'the', 'for', 'with', 'your'].includes(w.toLowerCase()));

  // Check for technical terms
  const hasTechTerm = words.some((w) => KNOWN_TECH_TERMS.has(w.toLowerCase().replace(/[^a-z0-9]/g, '')));

  if (meaningfulWords.length < 3 && !hasTechTerm) {
    return {
      valid: false,
      issue: {
        slot: 'admiredProject',
        severity: 'error',
        message: 'Specific reference is too short. Include at least 3 descriptive words or a concrete technical keyword.',
        exampleGood: 'the architecture of your high-concurrency order ledger',
        exampleBad: trimmed,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates that proofPoint is a concrete quantified result, not a bare skills list.
 */
export function validateProofPoint(value: string): { valid: boolean; issue?: ValidationIssue } {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      valid: false,
      issue: {
        slot: 'proofPoint',
        severity: 'error',
        message: 'A proof point is required. Include an achievement, metric, or verifiable project link.',
        exampleGood: 'built Go job queue handling 6,500 jobs/sec in benchmark',
        exampleBad: 'React, Node, Mongo',
      },
    };
  }

  // Bare comma-separated list of 2-5 words without verbs or numbers
  const commaSeparated = trimmed.split(/[,&/|]/).map((s) => s.trim()).filter(Boolean);
  const hasVerbOrMetric = /\b(built|engineered|scaled|reduced|optimized|deployed|migrated|automated|designed|published|achieved|\d+[%xkm]|\b\d+\b)/i.test(trimmed);

  if (commaSeparated.length >= 2 && !hasVerbOrMetric) {
    return {
      valid: false,
      issue: {
        slot: 'proofPoint',
        severity: 'error',
        message: 'Avoid listing bare skills without evidence. Describe what you built or quantified with those tools.',
        exampleGood: 'deployed Redis caching layer reducing API response time by 35%',
        exampleBad: trimmed,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates that portfolio looks like a legitimate URL or handle.
 */
export function validatePortfolio(value: string): { valid: boolean; issue?: ValidationIssue } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: true }; // optional slot

  const isUrlLike = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed) ||
    trimmed.startsWith('github.com/') ||
    trimmed.startsWith('gitlab.com/');

  if (!isUrlLike) {
    return {
      valid: false,
      issue: {
        slot: 'portfolio',
        severity: 'warning',
        message: 'Portfolio should be a valid web link or GitHub repository URL.',
        exampleGood: 'github.com/myname/project-demo',
        exampleBad: trimmed,
      },
    };
  }

  return { valid: true };
}

/**
 * Comprehensive validation of all slots for an outreach message.
 */
export function validateSlots(
  slots: OutreachSlotsV2,
  requiredSlots: string[] = ['targetCompany', 'targetRole', 'recipientName']
): { valid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  // Check required slots
  const slotMap: Record<string, string | undefined> = {
    targetCompany: slots.targetCompany,
    company: slots.targetCompany,
    targetRole: slots.targetRole,
    role: slots.targetRole,
    recipientName: slots.recipientName,
    recipient_name: slots.recipientName,
    primarySkill: slots.primarySkill,
    primary_skill: slots.primarySkill,
    proofPoint: slots.proofPoint,
    proof_point: slots.proofPoint,
    admiredProject: slots.admiredProject,
    admired_project: slots.admiredProject,
    followUpNewInfo: slots.followUpNewInfo,
  };

  for (const req of requiredSlots) {
    const val = slotMap[req];
    if (!val || !val.trim()) {
      issues.push({
        slot: req,
        severity: 'error',
        message: `Required input "${req}" is missing.`,
      });
    }
  }

  // Admired work check
  if (slots.admiredProject) {
    const res = validateAdmiredWork(slots.admiredProject);
    if (!res.valid && res.issue) {
      issues.push(res.issue);
    }
  }

  // Proof point check
  if (slots.proofPoint) {
    const res = validateProofPoint(slots.proofPoint);
    if (!res.valid && res.issue) {
      issues.push(res.issue);
    }
  }

  // Portfolio check
  if (slots.portfolio) {
    const res = validatePortfolio(slots.portfolio);
    if (!res.valid && res.issue) {
      issues.push(res.issue);
    }
  }

  const hasBlockingError = issues.some((i) => i.severity === 'error');

  return {
    valid: !hasBlockingError,
    issues,
  };
}
