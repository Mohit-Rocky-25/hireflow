// ============================================================
// HireFlow — Fixed In-Repo Practice Track Definitions (Stage 4)
// Fixed resource names and sequences for DSA and System Design gaps.
// Strict constraints: No URLs, no invented resources, no time estimates.
// ============================================================

export interface PracticeTrackDefinition {
  gapId: 'dsa' | 'systemdesign';
  title: string;
  resources: string[];
  sequence: string[];
}

export const PRACTICE_TRACKS: Record<'dsa' | 'systemdesign', PracticeTrackDefinition> = {
  dsa: {
    gapId: 'dsa',
    title: 'Practice track: Data Structures and Algorithms',
    resources: [
      'LeetCode',
      'NeetCode roadmap',
      "Striver's SDE sheet (takeUforward)",
      'GeeksforGeeks',
    ],
    sequence: [
      'arrays and hashing',
      'two pointers and sliding window',
      'stacks and queues',
      'trees and graphs',
      'dynamic programming',
    ],
  },
  systemdesign: {
    gapId: 'systemdesign',
    title: 'Practice track: System Design',
    resources: [
      'Designing Data-Intensive Applications (Martin Kleppmann)',
      'System Design Primer (GitHub)',
      'ByteByteGo',
    ],
    sequence: [
      'requirements and estimation',
      'data stores and caching',
      'queues and consistency',
      'case studies',
    ],
  },
};

export const APPROVED_PRACTICE_RESOURCE_NAMES = new Set<string>([
  ...PRACTICE_TRACKS.dsa.resources,
  ...PRACTICE_TRACKS.systemdesign.resources,
]);
