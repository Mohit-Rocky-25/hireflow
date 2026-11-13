// @vitest-environment node
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function getAllSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        files.push(...getAllSourceFiles(fullPath));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Import boundary guarantee (C2)', () => {
  it('ensures @supabase/supabase-js is only imported inside src/features/auth/ and src/sync/', () => {
    const srcDir = path.resolve(process.cwd(), 'src');
    const allFiles = getAllSourceFiles(srcDir);

    const violations: string[] = [];
    for (const file of allFiles) {
      const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
      const content = fs.readFileSync(file, 'utf-8');

      const importsSupabaseJs = /from\s+['"]@supabase\/supabase-js['"]|import\s*\(['"]@supabase\/supabase-js['"]\)/.test(content);
      const importsSupabaseClient = /from\s+['"][^'"]*supabaseClient['"]/.test(content);

      if (importsSupabaseJs) {
        if (!rel.startsWith('src/features/auth/')) {
          violations.push(`Forbidden @supabase/supabase-js in ${rel}`);
        }
      }

      if (importsSupabaseClient) {
        if (!rel.startsWith('src/features/auth/') && !rel.startsWith('src/sync/')) {
          violations.push(`Forbidden supabaseClient import in ${rel}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
