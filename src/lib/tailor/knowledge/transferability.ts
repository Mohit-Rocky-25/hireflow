// ============================================================
// HIREFLOW TRANSFERABILITY & KNOWLEDGE GRAPH ENGINE
// Directed skill relationships for defensible transferable matching
// ============================================================

export interface TransferabilityEdge {
  fromSkillId: string;
  toSkillId: string;
  weight: number; // 0.0 to 1.0 (e.g. 0.85 = high transferability)
  relationshipType: 'framework_parity' | 'cloud_parity' | 'language_family' | 'superset' | 'paradigm_parity';
  rationale: string;
}

export const TRANSFERABILITY_GRAPH: TransferabilityEdge[] = [
  // Container & DevOps
  {
    fromSkillId: 'docker',
    toSkillId: 'kubernetes',
    weight: 0.75,
    relationshipType: 'superset',
    rationale: 'Deep containerization foundation directly accelerates Kubernetes pod and cluster operations.'
  },
  {
    fromSkillId: 'kubernetes',
    toSkillId: 'docker',
    weight: 0.95,
    relationshipType: 'framework_parity',
    rationale: 'Kubernetes orchestration relies natively on Docker/OCI container runtime standards.'
  },

  // Frontend Frameworks
  {
    fromSkillId: 'react',
    toSkillId: 'nextjs',
    weight: 0.90,
    relationshipType: 'superset',
    rationale: 'Next.js is the official production framework built directly on top of React architecture.'
  },
  {
    fromSkillId: 'react',
    toSkillId: 'vuejs',
    weight: 0.70,
    relationshipType: 'paradigm_parity',
    rationale: 'Both share reactive state, component lifecycles, and Virtual DOM mental models.'
  },
  {
    fromSkillId: 'typescript',
    toSkillId: 'javascript',
    weight: 1.0,
    relationshipType: 'superset',
    rationale: 'TypeScript is a strict syntactic superset of JavaScript.'
  },
  {
    fromSkillId: 'javascript',
    toSkillId: 'typescript',
    weight: 0.80,
    relationshipType: 'language_family',
    rationale: 'Core JavaScript mastery is the prerequisite foundation for TypeScript type safety.'
  },

  // Cloud Platforms
  {
    fromSkillId: 'aws',
    toSkillId: 'gcp',
    weight: 0.80,
    relationshipType: 'cloud_parity',
    rationale: 'Core cloud primitives (compute, object storage, managed DBs, IAM) map 1:1 across AWS and GCP.'
  },
  {
    fromSkillId: 'gcp',
    toSkillId: 'aws',
    weight: 0.80,
    relationshipType: 'cloud_parity',
    rationale: 'Enterprise cloud architecture concepts transfer directly between GCP and AWS.'
  },
  {
    fromSkillId: 'aws',
    toSkillId: 'azure',
    weight: 0.80,
    relationshipType: 'cloud_parity',
    rationale: 'Both are enterprise cloud platforms with analogous infrastructure, IAM, and virtual networking.'
  },

  // Databases
  {
    fromSkillId: 'postgresql',
    toSkillId: 'mysql',
    weight: 0.85,
    relationshipType: 'framework_parity',
    rationale: 'Both are ANSI-SQL ACID-compliant relational database engines with similar indexing and schema patterns.'
  },
  {
    fromSkillId: 'mysql',
    toSkillId: 'postgresql',
    weight: 0.85,
    relationshipType: 'framework_parity',
    rationale: 'Standard relational querying, table normalization, and foreign keys transfer directly.'
  },

  // AI & ML
  {
    fromSkillId: 'pytorch',
    toSkillId: 'tensorflow',
    weight: 0.80,
    relationshipType: 'framework_parity',
    rationale: 'Deep neural network topologies, gradient backpropagation, and tensor tensor operations map directly.'
  },
  {
    fromSkillId: 'tensorflow',
    toSkillId: 'pytorch',
    weight: 0.80,
    relationshipType: 'framework_parity',
    rationale: 'Tensor manipulation, GPU execution, and model checkpointing transfer directly.'
  },

  // Testing
  {
    fromSkillId: 'jest',
    toSkillId: 'unit_testing',
    weight: 1.0,
    relationshipType: 'superset',
    rationale: 'Jest experience represents comprehensive unit and integration testing execution.'
  },
  {
    fromSkillId: 'vitest',
    toSkillId: 'unit_testing',
    weight: 1.0,
    relationshipType: 'superset',
    rationale: 'Vitest represents modern JavaScript test automation.'
  }
];

/**
 * Checks if a candidate's skill transferably satisfies a required skill
 */
export function findTransferableMatch(candidateSkillId: string, requiredSkillId: string): TransferabilityEdge | undefined {
  if (candidateSkillId === requiredSkillId) return undefined;
  return TRANSFERABILITY_GRAPH.find(
    edge => edge.fromSkillId === candidateSkillId && edge.toSkillId === requiredSkillId
  );
}
