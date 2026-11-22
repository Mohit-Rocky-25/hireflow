import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

async function main() {
  const rootDir = process.cwd();
  const verifyDir = path.join(rootDir, '.verify');
  fs.mkdirSync(verifyDir, { recursive: true });

  const lastRunFile = path.join(verifyDir, 'last-run.txt');
  const fileStream = fs.createWriteStream(lastRunFile, { flags: 'w', encoding: 'utf8' });

  const verifyScriptPath = path.join(rootDir, 'scripts', 'verifyTalentLens.ts');

  // Use npx tsx to invoke verifyTalentLens.ts
  const child = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['tsx', verifyScriptPath],
    {
      cwd: rootDir,
      env: { ...process.env },
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    }
  );

  child.stdout.on('data', (chunk: Buffer) => {
    process.stdout.write(chunk);
    fileStream.write(chunk);
  });

  child.stderr.on('data', (chunk: Buffer) => {
    process.stderr.write(chunk);
    fileStream.write(chunk);
  });

  child.on('close', (code: number | null) => {
    fileStream.end(() => {
      // Compute SHA-256 of the written last-run.txt
      const fileBytes = fs.readFileSync(lastRunFile);
      const hash = crypto.createHash('sha256').update(fileBytes).digest('hex');
      console.log(`SHA-256 ${hash}`);
      process.exit(code ?? 0);
    });
  });

  child.on('error', (err: Error) => {
    console.error('Failed to run verify script:', err);
    process.exit(1);
  });
}

main();
