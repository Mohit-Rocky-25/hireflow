import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { backupRegistry, registerBackupSection } from '../../../src/lib/backup/registry';

describe('HireFlow v4 Backup Registry (X1.6, C9)', () => {
  it('registers backup sections and allows inspection', () => {
    const dummySchema = z.object({ id: z.string() });
    let dummyState = { id: 'state_1' };

    registerBackupSection({
      key: 'test_backup_section',
      schema: dummySchema,
      version: 1,
      export: () => dummyState,
      import: (data) => {
        dummyState = data;
        return true;
      },
    });

    const registered = backupRegistry.get('test_backup_section');
    expect(registered).toBeDefined();
    expect(registered?.version).toBe(1);
    expect(registered?.export()).toEqual({ id: 'state_1' });

    const allKeys = backupRegistry.getKeys();
    expect(allKeys).toContain('test_backup_section');
  });
});
