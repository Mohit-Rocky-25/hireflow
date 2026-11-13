export type DiffOp = { type: 'equal' | 'add' | 'remove'; text: string };

const MAX_CELLS = 4_000_000;

function tokenizeWords(s: string): string[] {
  return s.length === 0 ? [] : s.split(/(\s+)/).filter((t) => t.length > 0);
}
function tokenizeLines(s: string): string[] {
  if (s.length === 0) return [];
  const parts = s.split('\n');
  return parts.map((p, i) => (i < parts.length - 1 ? p + '\n' : p)).filter((t) => t.length > 0);
}

function lcsDiff(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const w = m + 1;
  const dp = new Uint32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * w + j] =
        a[i] === b[j] ? (dp[(i + 1) * w + j + 1] ?? 0) + 1 : Math.max(dp[(i + 1) * w + j] ?? 0, dp[i * w + j + 1] ?? 0);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'equal', text: a[i] as string });
      i++;
      j++;
    } else if ((dp[(i + 1) * w + j] ?? 0) >= (dp[i * w + j + 1] ?? 0)) {
      ops.push({ type: 'remove', text: a[i] as string });
      i++;
    } else {
      ops.push({ type: 'add', text: b[j] as string });
      j++;
    }
  }
  while (i < n) ops.push({ type: 'remove', text: a[i++] as string });
  while (j < m) ops.push({ type: 'add', text: b[j++] as string });
  return ops;
}

function diffTokens(a: string[], b: string[]): DiffOp[] | null {
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  if ((midA.length + 1) * (midB.length + 1) > MAX_CELLS) return null;
  return [
    ...a.slice(0, start).map((t): DiffOp => ({ type: 'equal', text: t })),
    ...lcsDiff(midA, midB),
    ...a.slice(endA).map((t): DiffOp => ({ type: 'equal', text: t })),
  ];
}

function coalesce(ops: DiffOp[]): DiffOp[] {
  const out: DiffOp[] = [];
  for (const op of ops) {
    const last = out[out.length - 1];
    if (last && last.type === op.type) last.text += op.text;
    else out.push({ ...op });
  }
  return out;
}

/** Word diff with prefix/suffix trimming; falls back to line diff, then to a whole-block replace. */
export function diffWords(a: string, b: string): DiffOp[] {
  if (a === b) return a.length === 0 ? [] : [{ type: 'equal', text: a }];
  const words = diffTokens(tokenizeWords(a), tokenizeWords(b));
  if (words) return coalesce(words);
  const lines = diffTokens(tokenizeLines(a), tokenizeLines(b));
  if (lines) return coalesce(lines);
  return coalesce([
    ...(a ? [{ type: 'remove', text: a } as DiffOp] : []),
    ...(b ? [{ type: 'add', text: b } as DiffOp] : []),
  ]);
}
