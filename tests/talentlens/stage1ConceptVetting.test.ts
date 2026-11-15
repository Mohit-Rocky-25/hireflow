import { describe, it, expect } from 'vitest';
import briefsData from '../../src/data/suite/project-briefs.json';
import { getCanonicalSkillName } from '../../src/pages/demo/engine/projectMatcherIntegrity';

interface ConceptDefinition {
  canonicalId: string;
  label: string;
  aliases: string[];
  evidencePattern: RegExp;
}

const CONCEPT_DEFINITIONS: ConceptDefinition[] = [
  {
    canonicalId: 'systemdesign',
    label: 'System Design',
    aliases: ['system design', 'systemdesign', 'architecture', 'scalability', 'high-scale backend'],
    evidencePattern: /\b(system design|architecture|scalab(ility|le)?|throughput|latency|load balanc(ing|er)?|sharding|partitioning|high availability|failover|capacity planning)\b/i,
  },
  {
    canonicalId: 'distributed_systems',
    label: 'Distributed Systems',
    aliases: ['distributed systems', 'distributed', 'consensus', 'raft', 'replication'],
    evidencePattern: /\b(distributed|consensus|raft|paxos|replication|quorum|fault toleran(ce|t)?|cluster|gossip|eventual consistency|split brain|two-phase commit|2pc|saga)\b/i,
  },
  {
    canonicalId: 'concurrency',
    label: 'Concurrency',
    aliases: ['concurrency', 'multithreading', 'goroutines', 'asyncio'],
    evidencePattern: /\b(concurr(ent|ency)?|goroutine|channel|threads?|locks?|mutex|atomic|race condition|deadlock|parallel(ism)?|asyncio|worker pool|thread pool)\b/i,
  },
  {
    canonicalId: 'microservices',
    label: 'Microservices',
    aliases: ['microservices', 'microservice', 'grpc', 'api gateway', 'event-driven'],
    evidencePattern: /\b(microservice|grpc|api gateway|service mesh|event-driven|event driven|message broker|kafka|rabbitmq|choreography|orchestration)\b/i,
  },
  {
    canonicalId: 'security',
    label: 'Security',
    aliases: ['security', 'cryptography', 'auth', 'oauth', 'jwt'],
    evidencePattern: /\b(secur(ity|e)?|oauth2?|jwt|cryptograph(ic|y)?|aes|rsa|cipher|token|auth|rbac|tls|ssl|keystore|kms|mtls|hmac)\b/i,
  },
  {
    canonicalId: 'dsa',
    label: 'DSA',
    aliases: ['dsa', 'algorithms', 'data structures', 'algorithm'],
    evidencePattern: /\b(dsa|algorithm|data structures?|b-tree|lsm|graph|tree|heap|bloom filter|trie|o\(log n\)|o\(1\)|o\(n\)|dynamic programming|binary search)\b/i,
  },
  {
    canonicalId: 'databases',
    label: 'Databases & ACID',
    aliases: ['databases', 'database', 'acid', 'sql', 'relational database'],
    evidencePattern: /\b(acid|wal|write-ahead|transactions?|isolation levels?|indexes?|indexing|buffer pool|mvcc|query optimiz(ation|er)|relational)\b/i,
  },
  {
    canonicalId: 'ci_cd',
    label: 'CI/CD & DevOps',
    aliases: ['ci/cd', 'devops', 'docker', 'kubernetes', 'terraform'],
    evidencePattern: /\b(ci\/cd|pipeline|github actions|dockerfile|helm|terraform|continuous integration|continuous deployment|canary)\b/i,
  },
  {
    canonicalId: 'testing',
    label: 'Testing & Benchmarking',
    aliases: ['testing', 'benchmarking', 'unit tests', 'integration tests'],
    evidencePattern: /\b(benchmark|benchmarking|unit test|integration test|load test(ing)?|e2e|stress test|locust|k6|profil(ing|er)|fuzz(ing)?)\b/i,
  },
  {
    canonicalId: 'rest_api',
    label: 'REST APIs',
    aliases: ['rest', 'rest api', 'api design'],
    evidencePattern: /\b(rest(ful)? api|rest endpoint|openapi|swagger|http handler|json api|request validation)\b/i,
  },
];

describe('Stage 1 Vetted Concept Tag Coverage', () => {
  it('programmatically migrates 164 briefs into derived tech and validated concept tags', () => {
    let totalBriefs = 0;
    let totalDerivedTech = 0;
    let totalVettedConcepts = 0;
    let totalDroppedTags = 0;
    const droppedDetails: Array<{ briefId: string; tag: string; reason: string }> = [];

    for (const brief of briefsData as any[]) {
      totalBriefs++;
      const fullText = [
        brief.title,
        brief.problemStatement,
        brief.architecture,
        brief.problemItSolves,
        brief.useCases,
        brief.recruiterSignal,
        ...(brief.verificationRubric || []),
        ...(brief.milestones || []).map((m: any) => `${m.title} ${m.doneWhen}`),
      ].join(' ');

      // 1. Derived Tech Skills
      const derivedTech = new Set<string>();
      for (const t of brief.techStack || []) {
        const c = getCanonicalSkillName(t);
        if (c) derivedTech.add(c);
      }
      totalDerivedTech += derivedTech.size;

      // 2. Vetted Concept Tags
      const vettedConcepts = new Set<string>();
      for (const rawTag of brief.coveredSkills || []) {
        const normTag = rawTag.toLowerCase().trim();
        // Check if this raw tag matches a known concept
        const matchedDef = CONCEPT_DEFINITIONS.find((def) =>
          def.aliases.some((alias) => normTag === alias || normTag.includes(alias) || alias.includes(normTag))
        );

        if (matchedDef) {
          if (matchedDef.evidencePattern.test(fullText)) {
            vettedConcepts.add(matchedDef.label);
            totalVettedConcepts++;
          } else {
            totalDroppedTags++;
            droppedDetails.push({
              briefId: brief.id,
              tag: rawTag,
              reason: `Concept "${matchedDef.label}" claimed but lacks required keyword evidence in brief text`,
            });
          }
        } else {
          // If not a concept, check if it was a tech skill that is absent from techStack
          const canon = getCanonicalSkillName(rawTag);
          if (!derivedTech.has(canon)) {
            totalDroppedTags++;
            droppedDetails.push({
              briefId: brief.id,
              tag: rawTag,
              reason: `Tech/tool "${rawTag}" claimed in coveredSkills but absent from techStack`,
            });
          }
        }
      }
    }

    console.log(`[STAGE 1] Briefs processed: ${totalBriefs}`);
    console.log(`[STAGE 1] Total derived tech skills: ${totalDerivedTech}`);
    console.log(`[STAGE 1] Total vetted concepts: ${totalVettedConcepts}`);
    console.log(`[STAGE 1] Total dropped/ambiguous tags: ${totalDroppedTags}`);
    console.log(`[STAGE 1] Sample dropped tags:`, droppedDetails.slice(0, 5));

    expect(totalBriefs).toBe(164);
    expect(totalVettedConcepts).toBeGreaterThan(100);
    expect(totalDroppedTags).toBeGreaterThan(0);
  });
});
