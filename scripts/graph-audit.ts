// ============================================================
// HireFlow Implication Graph Auditor (Stage 4)
// Audits implication-graph.json for:
// 1. Strict DAG (Cycle detection, self-loops)
// 2. Taxonomy reference integrity (all sources/targets valid in taxonomy)
// 3. Strict edge types ('STRONG' | 'WEAK')
// 4. Rationale quality and metadata
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ImplicationEdge {
  source: string;
  target: string;
  type: 'STRONG' | 'WEAK';
  rationale: string;
  lastReviewed?: string;
}

interface ImplicationGraphFile {
  version: string;
  edges: ImplicationEdge[];
}

interface TaxonomyItem {
  canonical: string;
  aliases: string[];
}

const GRAPH_PATH = path.resolve(__dirname, '../src/data/ats/implication-graph.json');
const TAXONOMY_PATH = path.resolve(__dirname, '../src/data/ats/skills-taxonomy.json');

export function auditGraph(): { passed: boolean; errors: string[]; warnings: string[]; stats: any } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(GRAPH_PATH)) {
    return { passed: false, errors: [`Graph file not found: ${GRAPH_PATH}`], warnings: [], stats: {} };
  }

  const graphData: ImplicationGraphFile = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));
  const taxonomyData: TaxonomyItem[] = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf-8'));

  // Build valid skills set (lowercase canonicals and aliases)
  const validSkills = new Set<string>();
  const canonicalMap = new Map<string, string>();

  for (const item of taxonomyData) {
    const cLower = item.canonical.toLowerCase();
    validSkills.add(cLower);
    canonicalMap.set(cLower, item.canonical);
    for (const a of item.aliases || []) {
      const aLower = a.toLowerCase();
      validSkills.add(aLower);
      canonicalMap.set(aLower, item.canonical);
    }
  }

  const edges = graphData.edges || [];
  const strongEdges: { source: string; target: string; rationale: string }[] = [];
  const weakEdges: { source: string; target: string; rationale: string }[] = [];

  // Check edge validity
  const adjacency = new Map<string, string[]>();
  const seenEdgePairs = new Set<string>();

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const sLower = edge.source.trim().toLowerCase();
    const tLower = edge.target.trim().toLowerCase();

    // 1. Self-loop check
    if (sLower === tLower) {
      errors.push(`Edge #${i}: Self-loop detected on "${edge.source}".`);
    }

    // 2. Taxonomy membership check
    if (!validSkills.has(sLower)) {
      errors.push(`Edge #${i}: Source "${edge.source}" is not found in skills-taxonomy.json.`);
    }
    if (!validSkills.has(tLower)) {
      errors.push(`Edge #${i}: Target "${edge.target}" is not found in skills-taxonomy.json.`);
    }

    // 3. Edge type check
    if (edge.type !== 'STRONG' && edge.type !== 'WEAK') {
      errors.push(`Edge #${i}: Invalid edge type "${edge.type}". Must be "STRONG" or "WEAK".`);
    }

    // 4. Duplicate edge check
    const pairKey = `${sLower}->${tLower}`;
    if (seenEdgePairs.has(pairKey)) {
      errors.push(`Edge #${i}: Duplicate edge detected: "${pairKey}".`);
    }
    seenEdgePairs.add(pairKey);

    // 5. Rationale check
    if (!edge.rationale || edge.rationale.trim().length < 10) {
      warnings.push(`Edge #${i} (${pairKey}): Missing or brief rationale.`);
    }

    if (edge.type === 'STRONG') {
      strongEdges.push({ source: sLower, target: tLower, rationale: edge.rationale });
      const neighbors = adjacency.get(sLower) || [];
      neighbors.push(tLower);
      adjacency.set(sLower, neighbors);
    } else {
      weakEdges.push({ source: sLower, target: tLower, rationale: edge.rationale });
    }
  }

  // 6. Cycle Detection (DFS on STRONG edges)
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfsDetectCycle(node: string, pathTrace: string[]): boolean {
    visited.add(node);
    recStack.add(node);

    const neighbors = adjacency.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfsDetectCycle(neighbor, [...pathTrace, neighbor])) {
          return true;
        }
      } else if (recStack.has(neighbor)) {
        errors.push(`Cycle detected in STRONG implications: ${[...pathTrace, neighbor].join(' -> ')}`);
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const node of adjacency.keys()) {
    if (!visited.has(node)) {
      dfsDetectCycle(node, [node]);
    }
  }

  const stats = {
    totalEdges: edges.length,
    strongEdges: strongEdges.length,
    weakEdges: weakEdges.length,
    uniqueSources: new Set(edges.map((e) => e.source.toLowerCase())).size,
    uniqueTargets: new Set(edges.map((e) => e.target.toLowerCase())).size,
  };

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  console.log('Auditing Implication Graph (DAG & Taxonomy Integrity)...');
  const result = auditGraph();
  console.log(`Stats: Total Edges: ${result.stats.totalEdges} (STRONG: ${result.stats.strongEdges}, WEAK: ${result.stats.weakEdges})`);
  console.log(`Unique Sources: ${result.stats.uniqueSources}, Unique Targets: ${result.stats.uniqueTargets}`);

  if (result.warnings.length > 0) {
    console.warn(`Warnings (${result.warnings.length}):\n${result.warnings.map((w) => ` - ${w}`).join('\n')}`);
  }

  if (!result.passed) {
    console.error(`FAILED with ${result.errors.length} errors:\n${result.errors.map((e) => ` ❌ ${e}`).join('\n')}`);
    process.exit(1);
  } else {
    console.log('✅ Implication Graph Audit PASSED with 0 errors (strict DAG, valid taxonomy references).');
  }
}
