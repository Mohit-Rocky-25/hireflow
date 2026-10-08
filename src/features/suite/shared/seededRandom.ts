// Mulberry32 deterministic pseudo-random number generator
// Ensures byte-identical outputs across runs for any given seed.

import { fnv1a } from './hash';

export class SeededRandom {
  private state: number;

  constructor(seed: number | string) {
    if (typeof seed === 'string') {
      this.state = parseInt(fnv1a(seed), 16) || 123456789;
    } else {
      this.state = (seed >>> 0) || 123456789;
    }
  }

  /**
   * Returns a pseudo-random float between 0 (inclusive) and 1 (exclusive).
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer between min (inclusive) and max (inclusive).
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Deterministically picks one element from an array.
   */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const idx = Math.floor(this.next() * items.length);
    return items[idx];
  }
}
