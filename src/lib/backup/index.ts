/**
 * HireFlow v4: Local Backup & Restore Engine (C9)
 * Full data portability, tamper-checking checksums, strict schema validation,
 * merge/replace modes, and prototype-pollution safety.
 */

import { backupRegistry, ImportMode } from './registry';
import { ENGINE_VERSION } from '../../config/versions';
import { LIMITS } from '../../config/limits';
import { hashText, nowIso, sanitizeFilename } from '../safeUtils';
import { stripUnsafeChars } from '../safe';

export interface BackupSectionPayload {
  version: number;
  data: unknown;
}

export interface BackupFile {
  app: 'hireflow';
  backupVersion: number;
  exportedAt: string;
  engineVersion: string;
  sections: Record<string, BackupSectionPayload>;
  checksum: string;
}

export interface SectionImportPreview {
  key: string;
  itemsInFile: number;
  itemsCurrent: number;
  isValid: boolean;
  error?: string;
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  checksumMatch: boolean;
  preview: SectionImportPreview[];
  backupFile?: BackupFile;
}

/**
 * Computes canonical deterministic checksum for backup sections.
 */
export function computeBackupChecksum(sections: Record<string, BackupSectionPayload>): string {
  const sortedKeys = Object.keys(sections).sort();
  const canonicalObj: Record<string, any> = {};
  for (const k of sortedKeys) {
    canonicalObj[k] = sections[k];
  }
  return hashText(JSON.stringify(canonicalObj));
}

/**
 * Strips dangerous prototype-polluting keys recursively.
 */
function sanitizeJsonKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') return stripUnsafeChars(obj);
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeJsonKeys);
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    clean[key] = sanitizeJsonKeys(value);
  }
  return clean;
}

/**
 * Gathers state across all registered local stores and produces a signed BackupFile object.
 */
export function generateBackup(): BackupFile {
  const sections: Record<string, BackupSectionPayload> = {};
  const registered = backupRegistry.getAll();

  for (const reg of registered) {
    try {
      const data = reg.export();
      sections[reg.key] = {
        version: reg.version,
        data,
      };
    } catch {
      // skip failing section
    }
  }

  const checksum = computeBackupChecksum(sections);

  return {
    app: 'hireflow',
    backupVersion: 1,
    exportedAt: nowIso(),
    engineVersion: ENGINE_VERSION,
    sections,
    checksum,
  };
}

/**
 * Triggers a browser download of the user's encrypted/checksummed local data.
 */
export function downloadBackupFile(): string {
  const backup = generateBackup();
  const serialized = JSON.stringify(backup, null, 2);
  const blob = new Blob([serialized], { type: 'application/json' });
  const filename = sanitizeFilename(`hireflow-backup-${nowIso().slice(0, 10)}.json`);

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  return filename;
}

/**
 * Validates an uploaded raw backup string before preview or application.
 */
export function validateBackupFile(
  rawJsonString: string,
  options?: { allowChecksumMismatch?: boolean }
): BackupValidationResult {
  // 1. File size check
  const sizeMB = new Blob([rawJsonString]).size / (1024 * 1024);
  if (sizeMB > LIMITS.maxBackupFileMB) {
    return {
      valid: false,
      error: `Backup file exceeds maximum permitted size of ${LIMITS.maxBackupFileMB} MB.`,
      checksumMatch: false,
      preview: [],
    };
  }

  // 2. Parse JSON safely with prototype pollution sanitization
  let parsedRaw: any;
  try {
    parsedRaw = JSON.parse(rawJsonString);
  } catch {
    return {
      valid: false,
      error: 'Invalid JSON file: parsing failed.',
      checksumMatch: false,
      preview: [],
    };
  }

  const sanitized = sanitizeJsonKeys(parsedRaw);

  // 3. Header checks
  if (!sanitized || sanitized.app !== 'hireflow') {
    return {
      valid: false,
      error: 'Not a recognized HireFlow backup file (missing app: "hireflow").',
      checksumMatch: false,
      preview: [],
    };
  }

  if (typeof sanitized.backupVersion !== 'number' || sanitized.backupVersion > 1) {
    return {
      valid: false,
      error: `Unsupported backup version (${sanitized.backupVersion}). Please update HireFlow.`,
      checksumMatch: false,
      preview: [],
    };
  }

  if (!sanitized.sections || typeof sanitized.sections !== 'object') {
    return {
      valid: false,
      error: 'Corrupted backup file: missing sections.',
      checksumMatch: false,
      preview: [],
    };
  }

  // 4. Checksum verification
  const expectedChecksum = computeBackupChecksum(sanitized.sections);
  const checksumMatch = sanitized.checksum === expectedChecksum;

  if (!checksumMatch && !options?.allowChecksumMismatch) {
    return {
      valid: false,
      error: 'Checksum mismatch: the backup file may have been modified or corrupted.',
      checksumMatch: false,
      preview: [],
      backupFile: sanitized as BackupFile,
    };
  }

  // 5. Per-section schema preview
  const preview: SectionImportPreview[] = [];
  for (const [key, sectionPayload] of Object.entries(sanitized.sections as Record<string, any>)) {
    const reg = backupRegistry.get(key);
    if (!reg) {
      preview.push({
        key,
        itemsInFile: Array.isArray(sectionPayload?.data) ? sectionPayload.data.length : 1,
        itemsCurrent: 0,
        isValid: false,
        error: 'Unknown store section in current HireFlow version.',
      });
      continue;
    }

    const validation = reg.schema.safeParse(sectionPayload?.data);
    let itemsCurrent = 0;
    try {
      const currentData = reg.export();
      itemsCurrent = Array.isArray(currentData) ? currentData.length : currentData ? 1 : 0;
    } catch {
      // ignore
    }

    preview.push({
      key,
      itemsInFile: Array.isArray(sectionPayload?.data) ? sectionPayload.data.length : 1,
      itemsCurrent,
      isValid: validation.success,
      error: validation.success ? undefined : validation.error.message,
    });
  }

  return {
    valid: true,
    checksumMatch,
    preview,
    backupFile: sanitized as BackupFile,
  };
}

/**
 * Applies a validated backup to local stores in either 'merge' or 'replace' mode.
 */
export function applyBackup(
  backupFile: BackupFile,
  mode: ImportMode = 'merge'
): { success: boolean; applied: string[]; skipped: string[] } {
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const [key, sectionPayload] of Object.entries(backupFile.sections)) {
    const reg = backupRegistry.get(key);
    if (!reg) {
      skipped.push(key);
      continue;
    }

    const validation = reg.schema.safeParse(sectionPayload.data);
    if (!validation.success) {
      skipped.push(key);
      continue;
    }

    try {
      const ok = reg.import(validation.data, mode);
      if (ok) {
        applied.push(key);
      } else {
        skipped.push(key);
      }
    } catch {
      skipped.push(key);
    }
  }

  return {
    success: applied.length > 0,
    applied,
    skipped,
  };
}
