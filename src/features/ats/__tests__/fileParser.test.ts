// ============================================================
// HireFlow ATS Resume Roaster — File Parser Unit Tests (Stage 1)
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  countWords,
  isGarbageOrBinary,
  normalizeExtractedText,
  parseResumeFile,
} from '../fileParser';

describe('Stage 1 — File Parser & Normalization Engine', () => {
  describe('Text Normalization', () => {
    it('strips zero-width characters and BOM', () => {
      const dirty = 'Senior\u200B Developer\uFEFF at\u200C Google\u200D';
      const clean = normalizeExtractedText(dirty);
      expect(clean).toBe('Senior Developer at Google');
    });

    it('fixes hyphenated line breaks across wrapped words', () => {
      const hyphenated = 'Architected microser-\nvices and distributed sys-\ntems at scale.';
      const clean = normalizeExtractedText(hyphenated);
      expect(clean).toContain('microservices');
      expect(clean).toContain('systems');
    });

    it('converts bullet glyphs to standard "- "', () => {
      const bullets = `
• Led backend engineering team
▪ Designed high-throughput Kafka streaming architecture
● Reduced p99 latency by 45%
◦ Migrated services to AWS EKS
– Mentored 4 junior engineers
— Authored architecture design documents
`;
      const clean = normalizeExtractedText(bullets);
      expect(clean).toContain('- Led backend engineering team');
      expect(clean).toContain('- Designed high-throughput Kafka streaming architecture');
      expect(clean).toContain('- Reduced p99 latency by 45%');
      expect(clean).toContain('- Migrated services to AWS EKS');
      expect(clean).toContain('- Mentored 4 junior engineers');
      expect(clean).toContain('- Authored architecture design documents');
    });

    it('collapses repeated horizontal spaces while preserving line breaks', () => {
      const messy = 'Java       Spring   Boot\n\n\n\n\nAWS     Docker';
      const clean = normalizeExtractedText(messy);
      expect(clean).toBe('Java Spring Boot\n\nAWS Docker');
    });
  });

  describe('Garbage Guard', () => {
    it('rejects text containing raw PDF stream tokens', () => {
      const pdfBinaryChunk = '%PDF-1.5 4 0 obj << /Type /FontDescriptor /FontFile2 5 0 R >> stream xœÝ’mS';
      expect(isGarbageOrBinary(pdfBinaryChunk)).toBe(true);
    });

    it('rejects text containing obj and endobj structure markers', () => {
      const objMarkers = '12 0 obj\n<< /Length 450 >>\nstream\nxyz\nendstream\nendobj';
      expect(isGarbageOrBinary(objMarkers)).toBe(true);
    });

    it('rejects text with more than 15% non-printable characters', () => {
      // 20 control characters in 50 characters = 40% non-printable
      const binaryString = 'Normal text ' + String.fromCharCode(1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 15, 16, 17, 18, 19, 20) + ' more text';
      expect(isGarbageOrBinary(binaryString)).toBe(true);
    });

    it('accepts legitimate resume text with normal punctuation and newlines', () => {
      const legitText = `
John Doe — Senior Backend Engineer
Email: john.doe@example.com | Phone: +1-555-0199 | San Francisco, CA

EXPERIENCE
Acme Corp — Lead Software Engineer (2021 - Present)
- Designed distributed payment services using Java, Spring Boot, and PostgreSQL.
- Handled 10M+ daily transactions with 99.99% availability.
- Cut infrastructure cloud spend on AWS by 35% through container rightsizing.
`;
      expect(isGarbageOrBinary(legitText)).toBe(false);
    });
  });

  describe('Word Counter', () => {
    it('accurately counts words in multiline text', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
      expect(countWords('Software Engineer with 5 years experience')).toBe(6);
      expect(countWords('Line one\nLine two\n\nLine three')).toBe(6);
    });
  });

  describe('parseResumeFile Integration', () => {
    it('parses valid TXT/MD files cleanly', async () => {
      const content = `
Jane Smith - Staff Frontend Engineer
Experienced in React, TypeScript, Next.js, and Web Performance Optimization.
Architected microfrontends used by 500,000 active monthly users.
Improved core web vitals LCP from 3.2s to 1.1s.
`;
      const file = new File([content], 'resume.txt', { type: 'text/plain' });
      const result = await parseResumeFile(file);

      expect(result.success).toBe(true);
      expect(result.text).toContain('Jane Smith - Staff Frontend Engineer');
      expect(result.wordCount).toBeGreaterThan(20);
      expect(result.pageCount).toBe(1);
    });

    it('rejects files exceeding 5MB limit with a clear error', async () => {
      // Create a dummy 5.1 MB file
      const largeBuffer = new Uint8Array(5.1 * 1024 * 1024);
      const largeFile = new File([largeBuffer], 'giant_resume.pdf', { type: 'application/pdf' });
      const result = await parseResumeFile(largeFile);

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds 5 MB limit');
      expect(result.text).toBe('');
    });

    it('rejects unsupported file formats with informative notice', async () => {
      const file = new File(['binary image data'], 'resume_photo.png', { type: 'image/png' });
      const result = await parseResumeFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported file type');
      expect(result.text).toBe('');
    });

    it('detects scanned image-only PDFs with under 200 characters and refuses to score', async () => {
      // Create a minimal PDF that produces almost no text (scanned image page)
      const scannedPdfRaw = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj
4 0 obj << /Length 30 >> stream
BT /F1 12 Tf (Scan) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000216 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
299
%%EOF`;
      const file = new File([scannedPdfRaw], 'scanned_doc.pdf', { type: 'application/pdf' });
      const result = await parseResumeFile(file);

      expect(result.success).toBe(false);
      expect(result.isScanned).toBe(true);
      expect(result.error).toBe('This PDF looks scanned (image-only). Paste your text instead.');
      expect(result.text).toBe('');
    });

    it('garbage guard safely discards corrupt or binary files disguised with .pdf or .docx', async () => {
      // Renamed binary file with raw binary content and obj tokens
      const fakePdfContent = 'obj stream \x00\x01\x02\x03\x04\x05\x06\x07\x08/FontDescriptor \xFF\xFE\xFD endobj';
      const fakeFile = new File([fakePdfContent], 'corrupt_resume.pdf', { type: 'application/pdf' });
      const result = await parseResumeFile(fakeFile);

      expect(result.success).toBe(false);
      expect(result.text).toBe('');
      // Raw binary text MUST NEVER appear in textarea
      expect(result.text).not.toContain('stream');
      expect(result.text).not.toContain('\x00');
    });

    it('extracts clean text from a real multi-line PDF without stream markers', async () => {
      const realPdfText = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj
4 0 obj << /Length 450 >> stream
BT /F1 12 Tf 72 712 Td (Alexander Vance - Senior Distributed Systems Engineer) Tj ET
BT /F1 10 Tf 72 690 Td (alex.vance@example.com | San Francisco, CA) Tj ET
BT /F1 10 Tf 72 660 Td (Led architecture for high-throughput payment rails processing 12M daily transactions.) Tj ET
BT /F1 10 Tf 72 640 Td (Optimized PostgreSQL query latency reducing p99 response times from 350ms to 42ms.) Tj ET
BT /F1 10 Tf 72 620 Td (Proficient in Java, Go, Kubernetes, Kafka, Docker, and AWS cloud microservices.) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000216 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
715
%%EOF`;
      const file = new File([realPdfText], 'alex_vance_resume.pdf', { type: 'application/pdf' });
      const result = await parseResumeFile(file);

      expect(result.success).toBe(true);
      expect(result.text).toContain('Alexander Vance');
      expect(result.text).toContain('Senior Distributed Systems Engineer');
      expect(result.text).toContain('PostgreSQL query latency');
      expect(result.text).not.toContain('obj');
      expect(result.text).not.toContain('stream');
      expect(result.wordCount).toBeGreaterThan(30);
      expect(result.pageCount).toBe(1);
    });

    it('parses real DOCX files using mammoth and returns clean text', async () => {
      // Create minimal DOCX archive in memory
      const zlib = await import('node:zlib');
      const files: Record<string, string> = {
        '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
        'word/document.xml': '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Morgan Riley - Staff DevOps Engineer with 7 years AWS experience.</w:t></w:r></w:p><w:p><w:r><w:t>Reduced infrastructure costs by 40% using Terraform, Kubernetes, and Docker.</w:t></w:r></w:p></w:body></w:document>',
      };

      const localHeaders: Buffer[] = [];
      const cdHeaders: Buffer[] = [];
      let offset = 0;

      for (const [name, content] of Object.entries(files)) {
        const data = Buffer.from(content);
        const crc = zlib.crc32(data);
        const nameBuf = Buffer.from(name);

        const lh = Buffer.alloc(30);
        lh.writeUInt32LE(0x04034b50, 0);
        lh.writeUInt16LE(20, 4);
        lh.writeUInt16LE(0, 6);
        lh.writeUInt16LE(0, 8); // method 0 (stored)
        lh.writeUInt16LE(0, 10);
        lh.writeUInt16LE(0, 12);
        lh.writeUInt32LE(crc, 14);
        lh.writeUInt32LE(data.length, 18);
        lh.writeUInt32LE(data.length, 22);
        lh.writeUInt16LE(nameBuf.length, 26);
        lh.writeUInt16LE(0, 28);
        localHeaders.push(lh, nameBuf, data);

        const cdh = Buffer.alloc(46);
        cdh.writeUInt32LE(0x02014b50, 0);
        cdh.writeUInt16LE(20, 4);
        cdh.writeUInt16LE(20, 6);
        cdh.writeUInt16LE(0, 8);
        cdh.writeUInt16LE(0, 10);
        cdh.writeUInt16LE(0, 12);
        cdh.writeUInt16LE(0, 14);
        cdh.writeUInt32LE(crc, 16);
        cdh.writeUInt32LE(data.length, 20);
        cdh.writeUInt32LE(data.length, 24);
        cdh.writeUInt16LE(nameBuf.length, 28);
        cdh.writeUInt16LE(0, 30);
        cdh.writeUInt16LE(0, 32);
        cdh.writeUInt16LE(0, 34);
        cdh.writeUInt16LE(0, 36);
        cdh.writeUInt32LE(0, 38);
        cdh.writeUInt32LE(offset, 42);
        cdHeaders.push(cdh, nameBuf);
        offset += lh.length + nameBuf.length + data.length;
      }

      const cdBuf = Buffer.concat(cdHeaders);
      const eocd = Buffer.alloc(22);
      eocd.writeUInt32LE(0x06054b50, 0);
      eocd.writeUInt16LE(0, 4);
      eocd.writeUInt16LE(0, 6);
      eocd.writeUInt16LE(Object.keys(files).length, 8);
      eocd.writeUInt16LE(Object.keys(files).length, 10);
      eocd.writeUInt32LE(cdBuf.length, 12);
      eocd.writeUInt32LE(offset, 16);
      eocd.writeUInt16LE(0, 20);

      const docxBuffer = Buffer.concat([...localHeaders, cdBuf, eocd]);
      const file = new File([docxBuffer], 'morgan_riley.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const result = await parseResumeFile(file);

      expect(result.success).toBe(true);
      expect(result.text).toContain('Morgan Riley');
      expect(result.text).toContain('Staff DevOps Engineer');
      expect(result.text).toContain('Terraform, Kubernetes, and Docker');
      expect(result.wordCount).toBeGreaterThan(15);
    });
  });
});
