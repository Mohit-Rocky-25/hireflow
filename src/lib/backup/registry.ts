/**
 * HireFlow v4: Backup Registry (X1.6, C9)
 * Modular registry allowing every local store to register backup export, import, and merge semantics.
 */

import { z } from 'zod';

export type ImportMode = 'merge' | 'replace';

export interface BackupSectionRegistration<T = unknown> {
  key: string;
  schema: z.ZodType<T>;
  version: number;
  export: () => T;
  import: (data: T, mode: ImportMode) => boolean;
  merge?: (existing: T, incoming: T) => T;
}

class BackupRegistry {
  private sections = new Map<string, BackupSectionRegistration<any>>();

  public register<T>(registration: BackupSectionRegistration<T>): void {
    this.sections.set(registration.key, registration);
  }

  public get(key: string): BackupSectionRegistration | undefined {
    return this.sections.get(key);
  }

  public getAll(): BackupSectionRegistration[] {
    return Array.from(this.sections.values());
  }

  public getKeys(): string[] {
    return Array.from(this.sections.keys());
  }
}

export const backupRegistry = new BackupRegistry();

export function registerBackupSection<T>(registration: BackupSectionRegistration<T>): void {
  backupRegistry.register(registration);
}
