// ============================================================
// Tailor Engine — Word-Level Diff (Pure JS, Zero Dependencies)
// ============================================================

export type DiffChangeType = 'same' | 'added' | 'removed';

export interface DiffToken {
  type: DiffChangeType;
  value: string;
}

function normalizeWord(w: string): string {
  return w.replace(/[.,;:!?]+$/, '').toLowerCase();
}

/**
 * Computes a word-level diff using Longest Common Subsequence (LCS).
 * Fast, deterministic, and safe for standard bullet lengths.
 */
export function computeWordDiff(original: string, proposed: string): DiffToken[] {
  // Strip bullet markers for cleaner comparison if both have them
  const origClean = original.replace(/^[-•*]\s*/, '').trim();
  const propClean = proposed.replace(/^[-•*]\s*/, '').trim();

  const origWords = origClean.split(/\s+/).filter(Boolean);
  const propWords = propClean.split(/\s+/).filter(Boolean);

  const m = origWords.length;
  const n = propWords.length;

  // LCS DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (normalizeWord(origWords[i]) === normalizeWord(propWords[j])) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to build diff
  let i = m;
  let j = n;
  const diffs: DiffToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalizeWord(origWords[i - 1]) === normalizeWord(propWords[j - 1])) {
      // Unchanged word (prefer proposed capitalization/punctuation)
      diffs.unshift({ type: 'same', value: propWords[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffs.unshift({ type: 'added', value: propWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diffs.unshift({ type: 'removed', value: origWords[i - 1] });
      i--;
    }
  }

  // Combine adjacent tokens of the same type for cleaner rendering
  const merged: DiffToken[] = [];
  for (const token of diffs) {
    const last = merged[merged.length - 1];
    if (last && last.type === token.type) {
      last.value += ' ' + token.value;
    } else {
      merged.push({ type: token.type, value: token.value });
    }
  }

  return merged;
}
