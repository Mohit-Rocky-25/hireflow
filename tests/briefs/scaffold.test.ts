import { describe, it, expect, beforeEach } from 'vitest';
import { generateProjectScaffoldZip } from '../../src/features/suite/briefs/scaffoldGenerator';
import { useBriefProgressStore } from '../../src/store/briefProgressStore';
import { useProfileStore } from '../../src/store/profileStore';
import { ProjectBrief } from '../../src/features/suite/briefs/bundleBriefs';

describe('D17: Build Briefs Scaffold & Progress Tracker (D17.1 - D17.5)', () => {
  beforeEach(() => {
    useBriefProgressStore.getState().clearProgress();
    useProfileStore.setState({
      activeResume: {
        versionId: 'res_test',
        label: 'Candidate Resume',
        ledger: { projects: [] },
        textHash: 'hash_test',
        updatedAt: new Date().toISOString(),
      },
      resumeVersions: [],
      lastTarget: null,
      preferences: {},
    });
  });

  const testBrief: ProjectBrief = {
    id: 'brief_redis_cache',
    title: 'High-Throughput Redis Caching Layer',
    domain: 'Distributed Systems',
    difficulty: 'intermediate',
    estimatedHours: 24,
    techStack: ['Node.js', 'TypeScript', 'Redis'],
    problemStatement: 'Build a distributed read-through caching middleware with LRU eviction.',
    deliverables: [
      'Read-through cache mechanism',
      'LRU eviction under high memory pressure',
      'Benchmark test achieving < 2ms latency',
    ],
  };

  it('generates a complete project scaffold zip containing README, config, src, and failing tests', async () => {
    const { filename, blob } = await generateProjectScaffoldZip(testBrief);

    expect(filename).toContain('high-throughput-redis-caching-layer-scaffold.zip');
    expect(blob.size).toBeGreaterThan(500); // Valid zip archive with content
  });

  it('tracks brief progress and adds completed project with starter bullets into active resume ledger', () => {
    const progressStore = useBriefProgressStore.getState();

    // Default status is 'planned'
    expect(progressStore.getStatus('brief_redis_cache')).toBe('planned');

    // Update to 'building'
    progressStore.setStatus('brief_redis_cache', 'building', 'github.com/candidate/redis-cache');
    expect(useBriefProgressStore.getState().getStatus('brief_redis_cache')).toBe('building');

    // Add project to resume ledger
    const added = progressStore.addProjectToResumeLedger(testBrief);
    expect(added).toBe(true);

    const activeResume = useProfileStore.getState().activeResume;
    expect(activeResume).toBeDefined();

    const projects = activeResume?.ledger?.projects || [];
    expect(projects.length).toBe(1);
    expect(projects[0].name).toBe('High-Throughput Redis Caching Layer');
    expect(projects[0].techStack).toContain('Redis');
    expect(projects[0].bullets.some((b) => b.includes('[METRIC:'))).toBe(true);

    // Status auto-transitions to 'done'
    expect(useBriefProgressStore.getState().getStatus('brief_redis_cache')).toBe('done');
  });
});
