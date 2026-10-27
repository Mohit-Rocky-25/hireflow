// ============================================================
// Deterministic Pseudo-Random Number Generator (Mulberry32)
// Ensures 100% reproducible fixture generation without Math.random
// ============================================================

export class SeededPRNG {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  /**
   * Returns a pseudo-random float in [0, 1)
   */
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer in [min, max]
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Pick one item from an array
   */
  pick<T>(items: T[]): T {
    return items[this.nextInt(0, items.length - 1)];
  }

  /**
   * Pick n distinct items from an array
   */
  pickMultiple<T>(items: T[], count: number): T[] {
    const copy = [...items];
    const result: T[] = [];
    const n = Math.min(count, copy.length);
    for (let i = 0; i < n; i++) {
      const idx = this.nextInt(0, copy.length - 1);
      result.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return result;
  }

  /**
   * Return true with given probability p
   */
  chance(p: number): boolean {
    return this.next() < p;
  }
}
