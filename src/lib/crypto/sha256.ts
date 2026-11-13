import type { Sha256 } from '@/domain/types';

/** Requires a secure context (https or localhost) in browsers; Node 20+ provides globalThis.crypto. */
export async function sha256Hex(text: string): Promise<Sha256> {
  const data = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  let out = '';
  for (const b of new Uint8Array(digest)) out += b.toString(16).padStart(2, '0');
  return out;
}
