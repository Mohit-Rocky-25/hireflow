// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { normalizeText, countWords } from '@/lib/text/normalize';
import { sha256Hex } from '@/lib/crypto/sha256';
import { diffWords } from '@/lib/text/diff';
import { makeGapId, makeTargetKey, slug } from '@/domain/ids';

describe('normalizeText', () => {
  it('is idempotent across tricky inputs', () => {
    const samples = ['a\r\nb\r\n\r\n\r\n\r\nc  \n', '\uFEFFHello\u200B world\u00A0\u00A0x', 'x \t\n  \n\n\n\ny', '', '   ', 'e\u0301', 'नमस्ते\u200Dx'];
    for (const s of samples) { const once = normalizeText(s); expect(normalizeText(once)).toBe(once); }
  });
  it('unifies line endings, strips invisibles, collapses blanks, trims', () => {
    expect(normalizeText('\uFEFFa\r\nb \r\n\r\n\r\n\r\nc\u200B\n')).toBe('a\nb\n\nc');
  });
  it('applies NFC so composed and decomposed forms hash equal', async () => {
    expect(await sha256Hex(normalizeText('e\u0301'))).toBe(await sha256Hex(normalizeText('\u00e9')));
  });
  it('keeps ZWJ/ZWNJ which carry meaning in Indic scripts', () => {
    expect(normalizeText('क\u200Dष')).toContain('\u200D');
  });
  it('counts words', () => { expect(countWords('  a  b\nc ')).toBe(3); expect(countWords('')).toBe(0); });
});

describe('sha256Hex', () => {
  it('matches the known vector for "abc"', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('ids', () => {
  it('keeps c, c++, c#, .net and node.js distinct', () => {
    const ids = ['C', 'C++', 'C#', '.NET', 'Node.js'].map((l) => makeGapId('skill', l));
    expect(new Set(ids).size).toBe(5);
    expect(ids).toEqual(['skill:c', 'skill:c++', 'skill:c#', 'skill:.net', 'skill:node.js']);
  });
  it('is stable across case, spacing and accents', () => {
    expect(makeGapId('skill', ' Spring  Boot ')).toBe(makeGapId('skill', 'spring boot'));
    expect(slug('Café Münch')).toBe('cafe-munch');
  });
  it('falls back for empty labels', () => { expect(makeGapId('other', '!!!')).toBe('other:unlabeled'); });
  it('builds target keys by priority', async () => {
    expect(await makeTargetKey({ companyId: 'airtel', roleId: 'be', jdSnapshotHash: 'h' })).toBe('tl:airtel:be');
    const a = await makeTargetKey({ company: 'Airtel', roleTitle: 'Backend  Engineer', jdSnapshotHash: 'h1' });
    const b = await makeTargetKey({ company: 'airtel', roleTitle: 'backend engineer', jdSnapshotHash: 'h2' });
    expect(a).toBe(b); expect(a.startsWith('jd:')).toBe(true);
    expect(await makeTargetKey({ jdSnapshotHash: 'abc' })).toBe('jd:abc');
  });
});

function rebuild(ops: ReturnType<typeof diffWords>) {
  return { a: ops.filter((o) => o.type !== 'add').map((o) => o.text).join(''), b: ops.filter((o) => o.type !== 'remove').map((o) => o.text).join('') };
}
describe('diffWords', () => {
  it('reconstructs both sides exactly (seeded random fuzz)', () => {
    let seed = 42; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
    const vocab = ['java', 'spring', 'kafka', 'sql', 'docker', 'api', 'built', 'led', '\n', 'x'];
    const gen = () => Array.from({ length: Math.floor(rnd() * 40) }, () => vocab[Math.floor(rnd() * vocab.length)]).join(' ');
    for (let i = 0; i < 300; i++) { const a = gen(); const b = gen(); const r = rebuild(diffWords(a, b)); expect(r.a).toBe(a); expect(r.b).toBe(b); }
  });
  it('handles identical, empty and one-sided inputs', () => {
    expect(diffWords('', '')).toEqual([]);
    expect(diffWords('same', 'same')).toEqual([{ type: 'equal', text: 'same' }]);
    expect(diffWords('', 'new')).toEqual([{ type: 'add', text: 'new' }]);
    expect(diffWords('old', '')).toEqual([{ type: 'remove', text: 'old' }]);
  });
  it('marks a localized change minimally', () => {
    const ops = diffWords('built an API with Java', 'built an API with Kotlin');
    expect(ops.filter((o) => o.type !== 'equal')).toEqual([{ type: 'remove', text: 'Java' }, { type: 'add', text: 'Kotlin' }]);
  });
  it('degrades gracefully on very large unrelated inputs and still reconstructs', () => {
    const a = Array.from({ length: 6000 }, (_, i) => `a${i}`).join(' ');
    const b = Array.from({ length: 6000 }, (_, i) => `b${i}`).join(' ');
    const t0 = performance.now(); const r = rebuild(diffWords(a, b)); const dt = performance.now() - t0;
    expect(r.a).toBe(a); expect(r.b).toBe(b); expect(dt).toBeLessThan(1500);
  });
});
