import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('HireFlow Stage 8 Catalog Coherence & Acyclicity Validation', () => {
  const root = process.cwd();
  const dagPath = path.join(root, 'docs/briefs/DEPENDENCY_GRAPH.json');
  const healthPath = path.join(root, 'docs/briefs/CATALOG_HEALTH.md');

  it('validates DEPENDENCY_GRAPH.json exists and asserts isAcyclic === true', () => {
    expect(fs.existsSync(dagPath)).toBe(true);
    const dag = JSON.parse(fs.readFileSync(dagPath, 'utf8'));
    expect(dag.isAcyclic).toBe(true);
    expect(Object.keys(dag.graph).length).toBe(158);
  });

  it('validates graph acyclicity algorithmically via DFS cycle detection', () => {
    const dag = JSON.parse(fs.readFileSync(dagPath, 'utf8'));
    const graph: Record<string, string[]> = dag.graph;

    const visited = new Set<string>();
    const recStack = new Set<string>();

    function dfs(node: string): boolean {
      visited.add(node);
      recStack.add(node);

      for (const neighbor of graph[node] || []) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      recStack.delete(node);
      return false;
    }

    let cycleFound = false;
    for (const node of Object.keys(graph)) {
      if (!visited.has(node)) {
        if (dfs(node)) {
          cycleFound = true;
          break;
        }
      }
    }

    expect(cycleFound).toBe(false);
  });

  it('validates CATALOG_HEALTH.md exists and contains real data sections', () => {
    expect(fs.existsSync(healthPath)).toBe(true);
    const content = fs.readFileSync(healthPath, 'utf8');
    expect(content).toContain('Difficulty Ladder');
    expect(content).toContain('Overlap Analysis');
    expect(content).toContain('Skill Taxonomy Coverage');
    expect(content).toContain('Dependency Graph');
  });
});
