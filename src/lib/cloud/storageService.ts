// ============================================================
// HireFlow — Private Supabase Storage Service (Phase 10.8)
// Bucket: `user-documents` (private, 5 MB limit, zero public URLs).
// Preserves all Phase 10.6 security validations prior to upload.
// ============================================================

import { getCloudGateway } from '@/sync/supabaseGateway';
import { PRIVATE_DOCUMENT_BUCKET } from '@/lib/supabase/env';
import {
  MAX_FILE_SIZE_BYTES,
  verifyMagicBytes,
  validateDocxArchive,
} from '@/lib/secureFileValidator';
import { createId, sanitizeFilename } from '@/lib/safeUtils';
import {
  userDocumentToRow,
  rowToUserDocument,
  type UserDocumentKind,
  type UserDocumentRecord,
  type UserDocumentRow,
} from '@/sync/mappers';
import {
  CloudAuthRequiredError,
  CloudNotConfiguredError,
  CloudStorageSecurityError,
  CloudWriteFailedError,
  CloudReadFailedError,
} from './errors';
import { isAccountErasureInProgress } from './cloudRepository';

const ALLOWED_EXTENSION_MIME: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ],
  '.txt': ['text/plain'],
  '.md': ['text/markdown', 'text/plain'],
  '.json': ['application/json', 'text/plain'],
};

const MIME_TO_DEFAULT_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'application/json': '.json',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function sha256BufferHex(buffer: ArrayBuffer | Uint8Array): Promise<string> {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
  let out = '';
  for (const b of new Uint8Array(digest)) out += b.toString(16).padStart(2, '0');
  return out;
}

export function extractFileExtension(fileName: string, mimeType: string): string {
  const match = fileName.toLowerCase().match(/(\.[a-z0-9]{1,8})$/);
  if (match) return match[1];
  return MIME_TO_DEFAULT_EXT[mimeType.toLowerCase()] || '';
}

export function buildUserDocumentPath(
  userId: string,
  docKind: UserDocumentKind,
  docId: string,
  fileName: string
): string {
  if (!userId || userId.includes('/') || userId.includes('\\') || userId.includes('..')) {
    throw new CloudStorageSecurityError('Invalid user scope for private storage path.');
  }
  const safeName = sanitizeFilename(fileName || 'document.bin').slice(0, 120) || 'document.bin';
  return `${userId}/${docKind}/${docId}/${safeName}`;
}

export function assertUserOwnedStoragePath(userId: string, storagePath: string): void {
  if (!userId) {
    throw new CloudAuthRequiredError();
  }
  if (
    !storagePath ||
    storagePath.includes('..') ||
    storagePath.includes('\\') ||
    storagePath.includes('\0') ||
    !storagePath.startsWith(`${userId}/`)
  ) {
    throw new CloudStorageSecurityError(
      `Storage path "${storagePath}" violates strict per-user ownership isolation.`
    );
  }
}

export async function validateUploadBuffer(params: {
  buffer: ArrayBuffer;
  fileName: string;
  mimeType: string;
}): Promise<{ ext: string; normalizedMime: string }> {
  const { buffer, fileName, mimeType } = params;

  if (buffer.byteLength === 0) {
    throw new CloudStorageSecurityError('Cannot upload an empty file to private storage.');
  }
  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new CloudStorageSecurityError(
      `File exceeds maximum allowed size (${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB).`
    );
  }

  const ext = extractFileExtension(fileName, mimeType);
  const allowedMimes = ALLOWED_EXTENSION_MIME[ext];
  if (!allowedMimes) {
    throw new CloudStorageSecurityError(
      `Unsupported document format "${ext || fileName}". Allowed formats: .pdf, .docx, .txt, .md, .json.`
    );
  }

  const normalizedMime = (mimeType || allowedMimes[0]).toLowerCase();
  if (mimeType && !allowedMimes.includes(normalizedMime)) {
    throw new CloudStorageSecurityError(
      `MIME type "${mimeType}" does not match file extension "${ext}".`
    );
  }

  const magicCheck = verifyMagicBytes(buffer, ext);
  if (!magicCheck.valid) {
    throw new CloudStorageSecurityError(magicCheck.error || 'File magic bytes check failed.');
  }

  if (ext === '.docx') {
    const docxCheck = await validateDocxArchive(buffer);
    if (!docxCheck.valid) {
      throw new CloudStorageSecurityError(
        docxCheck.error || 'DOCX failed archive traversal/decompression security inspection.'
      );
    }
  }

  return {
    ext,
    normalizedMime: ext === '.docx' ? allowedMimes[0] : normalizedMime,
  };
}

export interface UploadPrivateDocumentParams {
  userId: string;
  docKind: UserDocumentKind;
  fileName: string;
  mimeType: string;
  buffer: ArrayBuffer;
  workspaceId?: string | null;
  versionId?: string | null;
  auditId?: string | null;
}

export async function uploadPrivateDocument(
  params: UploadPrivateDocumentParams
): Promise<UserDocumentRecord> {
  if (!params.userId) {
    throw new CloudAuthRequiredError();
  }
  const gateway = getCloudGateway();
  if (!gateway.isConfigured()) {
    throw new CloudNotConfiguredError();
  }

  const activeUid = await gateway.getAuthenticatedUserId();
  if (!activeUid || activeUid !== params.userId) {
    throw new CloudAuthRequiredError('Authenticated Supabase session does not match target user.');
  }
  if (isAccountErasureInProgress(params.userId)) {
    throw new CloudWriteFailedError(
      'document upload',
      'Account erasure is currently in progress in this client session.'
    );
  }

  const { normalizedMime } = await validateUploadBuffer({
    buffer: params.buffer,
    fileName: params.fileName,
    mimeType: params.mimeType,
  });

  const docId = createId();
  if (!UUID_REGEX.test(docId)) {
    throw new CloudStorageSecurityError('Generated document identifier is invalid.');
  }

  const storagePath = buildUserDocumentPath(params.userId, params.docKind, docId, params.fileName);
  assertUserOwnedStoragePath(params.userId, storagePath);

  const sha256 = await sha256BufferHex(params.buffer);
  const now = new Date().toISOString();

  if (isAccountErasureInProgress(params.userId)) {
    throw new CloudWriteFailedError(
      'document upload',
      'Account erasure is currently in progress in this client session.'
    );
  }
  await gateway.uploadStorageFile(storagePath, params.buffer, normalizedMime);

  const record: UserDocumentRecord = {
    id: docId,
    docKind: params.docKind,
    workspaceId: params.workspaceId ?? null,
    versionId: params.versionId ?? null,
    auditId: params.auditId ?? null,
    storageBucket: PRIVATE_DOCUMENT_BUCKET,
    storagePath,
    fileName: sanitizeFilename(params.fileName || 'document.bin').slice(0, 255) || 'document.bin',
    mimeType: normalizedMime,
    byteSize: params.buffer.byteLength,
    sha256,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await gateway.upsertRows('user_documents', [userDocumentToRow(record) as unknown as Record<string, unknown>]);
  } catch (err) {
    // Rollback private storage object if metadata write fails so no orphaned object remains
    await gateway.removeStorageFiles([storagePath]).catch(() => {});
    throw new CloudWriteFailedError(
      `document metadata (${record.fileName})`,
      err instanceof Error ? err.message : 'Database insert failed',
      err
    );
  }

  return record;
}

export async function getPrivateDocumentSignedUrl(
  userId: string,
  storagePath: string,
  expiresInSeconds = 60
): Promise<string> {
  assertUserOwnedStoragePath(userId, storagePath);
  const gateway = getCloudGateway();
  if (!gateway.isConfigured()) {
    throw new CloudNotConfiguredError();
  }
  try {
    return await gateway.createSignedDownloadUrl(storagePath, Math.min(Math.max(15, expiresInSeconds), 300));
  } catch (err) {
    throw new CloudReadFailedError(
      'signed document link',
      err instanceof Error ? err.message : 'Storage signing failed',
      err
    );
  }
}

export async function downloadPrivateDocument(
  userId: string,
  storagePath: string
): Promise<Blob> {
  assertUserOwnedStoragePath(userId, storagePath);
  const gateway = getCloudGateway();
  if (!gateway.isConfigured()) {
    throw new CloudNotConfiguredError();
  }
  try {
    return await gateway.downloadStorageFile(storagePath);
  } catch (err) {
    throw new CloudReadFailedError(
      'private document',
      err instanceof Error ? err.message : 'Download failed',
      err
    );
  }
}

export async function deletePrivateDocument(
  userId: string,
  docId: string,
  storagePath: string
): Promise<void> {
  assertUserOwnedStoragePath(userId, storagePath);
  const gateway = getCloudGateway();
  if (!gateway.isConfigured()) {
    throw new CloudNotConfiguredError();
  }
  try {
    await gateway.removeStorageFiles([storagePath]);
    await gateway.deleteRows('user_documents', { user_id: userId, id: docId });
  } catch (err) {
    throw new CloudWriteFailedError(
      `delete document (${storagePath})`,
      err instanceof Error ? err.message : 'Delete failed',
      err
    );
  }
}

export async function listUserDocuments(userId: string): Promise<UserDocumentRecord[]> {
  if (!userId) throw new CloudAuthRequiredError();
  const gateway = getCloudGateway();
  if (!gateway.isConfigured()) return [];
  try {
    const rows = await gateway.selectRows<UserDocumentRow>('user_documents', {
      orderBy: 'created_at',
      ascending: false,
      limit: 100,
    });
    return rows.map(rowToUserDocument);
  } catch (err) {
    throw new CloudReadFailedError(
      'user documents',
      err instanceof Error ? err.message : 'Query failed',
      err
    );
  }
}
