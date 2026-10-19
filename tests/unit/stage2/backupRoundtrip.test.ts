import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import {
  generateBackup,
  validateBackupFile,
  applyBackup,
  computeBackupChecksum,
  BackupFile,
} from '../../../src/lib/backup';
import { backupRegistry, registerBackupSection } from '../../../src/lib/backup/registry';

describe('C9.5: Data Portability, Backup & Restore Round-Trip Tests', () => {
  const SampleStoreSchema = z.object({
    id: z.string(),
    title: z.string(),
    items: z.array(z.string()),
    updatedAt: z.string(),
  });

  type SampleStore = z.infer<typeof SampleStoreSchema>;

  let mockStoreData: SampleStore = {
    id: 'store_1',
    title: 'Fresher Career Plan',
    items: ['Learn TypeScript', 'Build Portfolio'],
    updatedAt: '2026-10-19T06:00:00.000Z',
  };

  beforeEach(() => {
    mockStoreData = {
      id: 'store_1',
      title: 'Fresher Career Plan',
      items: ['Learn TypeScript', 'Build Portfolio'],
      updatedAt: '2026-10-19T06:00:00.000Z',
    };

    registerBackupSection<SampleStore>({
      key: 'test_sample_store',
      schema: SampleStoreSchema,
      version: 1,
      export: () => mockStoreData,
      import: (incoming, mode) => {
        if (mode === 'replace') {
          mockStoreData = incoming;
        } else {
          // Merge items
          mockStoreData = {
            ...incoming,
            items: Array.from(new Set([...mockStoreData.items, ...incoming.items])),
          };
        }
        return true;
      },
    });
  });

  it('performs full round-trip: export, clear, validate, import, assert deep-equal', () => {
    // 1. Export
    const backup = generateBackup();
    expect(backup.app).toBe('hireflow');
    expect(backup.checksum).toBeTruthy();
    expect(backup.sections.test_sample_store).toBeDefined();

    // 2. Clear store in memory
    mockStoreData = { id: '', title: '', items: [], updatedAt: '' };

    // 3. Validate
    const serialized = JSON.stringify(backup);
    const validation = validateBackupFile(serialized);
    expect(validation.valid).toBe(true);
    expect(validation.checksumMatch).toBe(true);

    // 4. Apply Restore (Replace mode)
    const result = applyBackup(validation.backupFile!, 'replace');
    expect(result.success).toBe(true);
    expect(result.applied).toContain('test_sample_store');

    // 5. Assert data restored
    expect(mockStoreData).toEqual({
      id: 'store_1',
      title: 'Fresher Career Plan',
      items: ['Learn TypeScript', 'Build Portfolio'],
      updatedAt: '2026-10-19T06:00:00.000Z',
    });
  });

  it('handles merge mode by combining unique items without overwriting existing state', () => {
    const incomingData: SampleStore = {
      id: 'store_1',
      title: 'Fresher Career Plan Updated',
      items: ['Build Portfolio', 'Contribute to Open Source'],
      updatedAt: '2026-10-19T07:00:00.000Z',
    };

    const backup: BackupFile = {
      app: 'hireflow',
      backupVersion: 1,
      exportedAt: '2026-10-19T07:00:00.000Z',
      engineVersion: '4.0.0',
      sections: {
        test_sample_store: { version: 1, data: incomingData },
      },
      checksum: computeBackupChecksum({
        test_sample_store: { version: 1, data: incomingData },
      }),
    };

    const res = applyBackup(backup, 'merge');
    expect(res.success).toBe(true);

    // Combined unique items
    expect(mockStoreData.items).toEqual([
      'Learn TypeScript',
      'Build Portfolio',
      'Contribute to Open Source',
    ]);
  });

  it('rejects corrupt JSON and non-HireFlow files', () => {
    const corrupt = '{ invalid json';
    expect(validateBackupFile(corrupt).valid).toBe(false);

    const alienApp = JSON.stringify({ app: 'other_system', backupVersion: 1, sections: {} });
    expect(validateBackupFile(alienApp).valid).toBe(false);
  });

  it('detects checksum mismatch when sections have been tampered with', () => {
    const backup = generateBackup();
    // Tamper with data without updating checksum
    (backup.sections.test_sample_store.data as any).title = 'Hacked Title';

    const validation = validateBackupFile(JSON.stringify(backup));
    expect(validation.checksumMatch).toBe(false);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('Checksum mismatch');
  });

  it('rejects forward-version backups (backupVersion > 1)', () => {
    const backup = generateBackup();
    backup.backupVersion = 999;

    const validation = validateBackupFile(JSON.stringify(backup));
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('Unsupported backup version');
  });

  it('rejects oversized backup files (> 10 MB)', () => {
    // Generate large JSON string
    const largeString = 'X'.repeat(11 * 1024 * 1024);
    const validation = validateBackupFile(largeString);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('exceeds maximum permitted size');
  });
});
