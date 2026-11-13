import type { GapCategory, Sha256, ToolKind } from './types';
import { sha256Hex } from '@/lib/crypto/sha256';

/** Keeps + # . so that "c", "c++", "c#", ".net" and "node.js" stay distinct. */
export function slug(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function makeGapId(category: GapCategory, label: string): string {
  const s = slug(label);
  return `${category}:${s.length > 0 ? s : 'unlabeled'}`;
}

export interface TargetKeyInput {
  companyId?: string;
  roleId?: string;
  company?: string;
  roleTitle?: string;
  jdSnapshotHash: Sha256;
}

export async function makeTargetKey(i: TargetKeyInput): Promise<string> {
  if (i.companyId && i.roleId) return `tl:${i.companyId}:${i.roleId}`;
  const c = i.company ? slug(i.company) : '';
  const r = i.roleTitle ? slug(i.roleTitle) : '';
  if (c && r) return `jd:${await sha256Hex(`${c}|${r}`)}`;
  return `jd:${i.jdSnapshotHash}`;
}

export function makeRunKey(kind: ToolKind, resumeHash: Sha256, jdHash: Sha256, engineVersion: string): Promise<Sha256> {
  return sha256Hex(`${kind}|${resumeHash}|${jdHash}|${engineVersion}`);
}
