// ============================================================
// Fuzz Generator: 200 Deterministically Mutated Test Files
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { SeededPRNG } from './prng';

export function generateFuzzSet(outputDir: string, seed: number = 1337): string[] {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const prng = new SeededPRNG(seed);
  const createdFiles: string[] = [];

  for (let i = 1; i <= 200; i++) {
    const padded = String(i).padStart(3, '0');
    const isDocx = i % 2 === 0;
    const ext = isDocx ? '.docx' : '.pdf';
    const filename = `fuzz_${padded}${ext}`;
    const filePath = path.join(outputDir, filename);

    let fileBytes: Uint8Array;
    const mutationType = i % 8;

    switch (mutationType) {
      case 0:
        // Zero-length file
        fileBytes = new Uint8Array(0);
        break;

      case 1:
        // Truncated header
        fileBytes = isDocx
          ? Buffer.from('PK\x03\x04')
          : Buffer.from('%PDF-1.');
        break;

      case 2:
        // Random bytes masquerading as PDF or DOCX
        const len = prng.nextInt(32, 2048);
        const header = isDocx ? Buffer.from('PK\x03\x04\x00\x00') : Buffer.from('%PDF-1.4\n');
        const randPayload = Buffer.alloc(len);
        for (let j = 0; j < len; j++) {
          randPayload[j] = prng.nextInt(0, 255);
        }
        fileBytes = Buffer.concat([header, randPayload]);
        break;

      case 3:
        // Byte flipped valid-looking stream
        const base = isDocx
          ? Buffer.from('PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00word/document.xml\x50\x4B\x05\x06' + 'A'.repeat(50))
          : Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 >>\nxref\n0 3\ntrailer\n<< /Root 1 0 R >>\nstartxref\n120\n%%EOF');
        const mutable = Buffer.from(base);
        for (let k = 0; k < 5; k++) {
          const flipPos = prng.nextInt(0, mutable.length - 1);
          mutable[flipPos] ^= prng.nextInt(1, 255);
        }
        fileBytes = mutable;
        break;

      case 4:
        // Huge claimed page count in PDF / huge table depth
        fileBytes = Buffer.from(
          `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count ${prng.nextInt(50000, 999999)} /Kids [] >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n150\n%%EOF`
        );
        break;

      case 5:
        // Null byte injected sequence
        const nullFilled = Buffer.alloc(prng.nextInt(100, 1000), 0);
        const prefix = isDocx ? Buffer.from('PK\x03\x04\x00\x00\x00\x00') : Buffer.from('%PDF-1.4\x00\x00\x00\x00');
        fileBytes = Buffer.concat([prefix, nullFilled]);
        break;

      case 6:
        // HTML / JavaScript payload disguised as resume document
        fileBytes = Buffer.from(
          `<!DOCTYPE html><html><head><script>alert('xss_${prng.nextInt(100, 999)}')</script></head><body><h1>Resume</h1></body></html>`
        );
        break;

      case 7:
      default:
        // XML BOM / UTF-16 / control char corruption
        const controlChars = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x0B\x0C\x0E\x0F' + 'MalformedContent'.repeat(10);
        fileBytes = Buffer.from(controlChars, 'utf-8');
        break;
    }

    fs.writeFileSync(filePath, fileBytes);
    createdFiles.push(filePath);
  }

  return createdFiles;
}
