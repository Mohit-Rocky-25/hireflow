import type {
  ResumeWorkspace,
  ResumeVersion,
  VersionSource,
  Uuid,
  Sha256,
  TextSnapshot,
} from '@/domain/types';
import {
  MAX_WORKSPACES,
  MAX_VERSIONS_PER_WORKSPACE,
  GUEST_MAX_WORKSPACES,
  MAX_RESUME_CHARS,
} from '@/domain/limits';
import { normalizeText, countWords } from '@/lib/text/normalize';
import { sha256Hex } from '@/lib/crypto/sha256';
import { kvSet, kvGet } from '@/lib/storage/kv';
import { getSnapshotKey } from '@/lib/storage/namespace';

export interface CreateWorkspaceInput {
  name: string;
  roleTrack: string;
  text: string;
  source: VersionSource;
  fileName?: string;
  isGuest?: boolean;
}

export interface AddVersionInput {
  workspaceId: Uuid;
  text: string;
  label: string;
  source: VersionSource;
  parentVersionId?: Uuid | null;
  note?: string;
  fileName?: string;
}

export interface ForkWorkspaceInput {
  fromWorkspaceId: Uuid;
  fromVersionId?: Uuid;
  name: string;
  roleTrack: string;
  isGuest?: boolean;
}

function makeId(): Uuid {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function createSnapshot(text: string, now = new Date().toISOString()): Promise<TextSnapshot> {
  const normalized = normalizeText(text);
  if (normalized.length > MAX_RESUME_CHARS) {
    throw new Error(`Resume exceeds maximum allowed length (${MAX_RESUME_CHARS} chars)`);
  }
  const hash = await sha256Hex(normalized);
  const snap: TextSnapshot = {
    hash,
    text: normalized,
    charCount: normalized.length,
    wordCount: countWords(normalized),
    createdAt: now,
  };
  await kvSet(getSnapshotKey(hash), snap);
  return snap;
}

export async function createWorkspaceService(
  workspaces: Record<Uuid, ResumeWorkspace>,
  versions: Record<Uuid, ResumeVersion>,
  input: CreateWorkspaceInput
): Promise<{ workspace: ResumeWorkspace; version: ResumeVersion; snapshot: TextSnapshot }> {
  const activeCount = Object.values(workspaces).filter((w) => !w.archivedAt).length;
  const limit = input.isGuest ? GUEST_MAX_WORKSPACES : MAX_WORKSPACES;
  if (activeCount >= limit) {
    throw new Error(`Workspace limit reached (max ${limit})`);
  }

  const now = new Date().toISOString();
  const snapshot = await createSnapshot(input.text, now);

  const workspaceId = makeId();
  const versionId = makeId();

  const isFirst = activeCount === 0;

  const version: ResumeVersion = {
    id: versionId,
    workspaceId,
    parentVersionId: null,
    label: 'v1: Initial import',
    snapshotHash: snapshot.hash,
    source: input.source,
    note: undefined,
    sourceFileName: input.fileName,
    createdAt: now,
  };

  const workspace: ResumeWorkspace = {
    id: workspaceId,
    name: input.name.trim() || 'Untitled Workspace',
    roleTrack: input.roleTrack.trim(),
    isPrimary: isFirst,
    headVersionId: versionId,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };

  return { workspace, version, snapshot };
}

export async function addVersionService(
  workspaces: Record<Uuid, ResumeWorkspace>,
  versions: Record<Uuid, ResumeVersion>,
  input: AddVersionInput
): Promise<{ version: ResumeVersion; isDeduplicated: boolean; snapshot: TextSnapshot }> {
  const workspace = workspaces[input.workspaceId];
  if (!workspace || workspace.archivedAt) {
    throw new Error('Workspace not found or archived');
  }

  const existingVersions = Object.values(versions).filter((v) => v.workspaceId === input.workspaceId);
  if (existingVersions.length >= MAX_VERSIONS_PER_WORKSPACE) {
    throw new Error(`Version limit reached for this workspace (max ${MAX_VERSIONS_PER_WORKSPACE})`);
  }

  const now = new Date().toISOString();
  const snapshot = await createSnapshot(input.text, now);

  // Deduplication rule: If identical snapshot hash to head AND not an explicit branch, return existing head!
  if (workspace.headVersionId && input.source !== 'branch' && !input.parentVersionId) {
    const headVersion = versions[workspace.headVersionId];
    if (headVersion && headVersion.snapshotHash === snapshot.hash) {
      return { version: headVersion, isDeduplicated: true, snapshot };
    }
  }

  const versionId = makeId();
  const version: ResumeVersion = {
    id: versionId,
    workspaceId: input.workspaceId,
    parentVersionId: input.parentVersionId ?? workspace.headVersionId,
    label: input.label.trim() || `v${existingVersions.length + 1}`,
    snapshotHash: snapshot.hash,
    source: input.source,
    note: input.note,
    sourceFileName: input.fileName,
    createdAt: now,
  };

  return { version, isDeduplicated: false, snapshot };
}

export async function forkWorkspaceService(
  workspaces: Record<Uuid, ResumeWorkspace>,
  versions: Record<Uuid, ResumeVersion>,
  input: ForkWorkspaceInput
): Promise<{ workspace: ResumeWorkspace; version: ResumeVersion; snapshot: TextSnapshot }> {
  const sourceWs = workspaces[input.fromWorkspaceId];
  if (!sourceWs) {
    throw new Error('Source workspace not found');
  }

  const sourceVersionId = input.fromVersionId ?? sourceWs.headVersionId;
  if (!sourceVersionId) {
    throw new Error('Source version not found');
  }

  const sourceVer = versions[sourceVersionId];
  if (!sourceVer) {
    throw new Error('Source version record not found');
  }

  const sourceSnap = await kvGet<TextSnapshot>(getSnapshotKey(sourceVer.snapshotHash));
  if (!sourceSnap) {
    throw new Error('Snapshot text not found');
  }

  return createWorkspaceService(workspaces, versions, {
    name: input.name,
    roleTrack: input.roleTrack,
    text: sourceSnap.text,
    source: 'branch',
    fileName: sourceVer.sourceFileName,
    isGuest: input.isGuest,
  });
}
