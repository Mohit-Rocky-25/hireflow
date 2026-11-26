import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import {
  DOCX_SECURITY_LIMITS,
  MAX_FILE_SIZE_BYTES,
  MAX_PARSER_TIMEOUT_MS,
  MAX_PDF_PAGES,
  validateDocxArchive,
  verifyMagicBytes,
  withParserTimeout,
} from '@/lib/secureFileValidator';
import { extractFromFile } from '@/lib/ats/fileExtractor';
import { parseResumeFile } from '@/features/ats/fileParser';
import { PARSING_THRESHOLDS } from '@/config/thresholds';
import { LIMITS } from '@/config/limits';

const CONTENT_TYPES_STANDARD =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="xml" ContentType="application/xml"/>' +
  '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
  '</Types>';

const VALID_DOCUMENT_XML =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
  '<w:body>' +
  '<w:p><w:r><w:t>Jane Doe - Senior Platform Engineer</w:t></w:r></w:p>' +
  '<w:p><w:hyperlink r:id="rIdGitHub"><w:r><w:t>github.com/user</w:t></w:r></w:hyperlink></w:p>' +
  '<w:p><w:r><w:t>Architected distributed Go and Kubernetes services handling 50k RPS.</w:t></w:r></w:p>' +
  '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Skills</w:t></w:r></w:p></w:tc>' +
  '<w:tc><w:p><w:r><w:t>Go, Kubernetes, PostgreSQL, TypeScript</w:t></w:r></w:p></w:tc></w:tr></w:tbl>' +
  '</w:body></w:document>';

const VALID_RELS_XML =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
  '<Relationship Id="rIdGitHub" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://github.com/user" TargetMode="External"/>' +
  '<Relationship Id="rIdMail" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="mailto:jane@example.com" TargetMode="External"/>' +
  '</Relationships>';

async function buildDocxBuffer(
  entries: Record<string, string | Uint8Array>,
  compression: 'STORE' | 'DEFLATE' = 'DEFLATE'
): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(entries)) {
    zip.file(name, content);
  }
  return zip.generateAsync({ type: 'uint8array', compression });
}

function makeDocxFile(bytes: Uint8Array, name = 'test.docx'): File {
  return new File([bytes as unknown as BlobPart], name, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

describe('Untrusted File Handling & Magic Byte Security (Rule 4.2)', () => {
  it('rejects an executable disguised as a PDF (e.g. MZ header with .pdf extension)', () => {
    // MZ header: 0x4D, 0x5A
    const fakeExe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]).buffer;
    const check = verifyMagicBytes(fakeExe, '.pdf');
    expect(check.valid).toBe(false);
    expect(check.error).toContain('lacks valid PDF binary header');
  });

  it('accepts a valid PDF binary header (%PDF-)', () => {
    const validPdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]).buffer;
    const check = verifyMagicBytes(validPdf, '.pdf');
    expect(check.valid).toBe(true);
  });

  it('rejects a fake DOCX file with invalid header', () => {
    const fakeDocx = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;
    const check = verifyMagicBytes(fakeDocx, '.docx');
    expect(check.valid).toBe(false);
    expect(check.error).toContain('missing PK header');
  });

  it('rejects DOCX archive containing path traversal sequences', () => {
    // PK header followed by path traversal
    const str = 'PK\x03\x04../../../../etc/passwd';
    const buffer = new TextEncoder().encode(str).buffer;
    const check = verifyMagicBytes(buffer, '.docx');
    expect(check.valid).toBe(false);
    expect(check.error).toContain('Suspicious path traversal');
  });

  it('times out when parser execution exceeds threshold', async () => {
    const hangingPromise = new Promise(resolve => setTimeout(resolve, 500));
    await expect(withParserTimeout(hangingPromise, 50, 'Timeout triggered')).rejects.toThrow('Timeout triggered');
  });
});

describe('Phase 10.6 — Unified Parser Limits & Adversarial Archive Hardening', () => {
  it('unifies shared size, timeout, and PDF page limits consistently', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(LIMITS.maxFileUploadMB * 1024 * 1024);
    expect(MAX_PARSER_TIMEOUT_MS).toBe(PARSING_THRESHOLDS.maxExtractorTimeoutMs);
    expect(MAX_PDF_PAGES).toBe(PARSING_THRESHOLDS.maxPdfPages);
  });

  it('rejects ZIP path traversal hidden beyond the first 4096 bytes and encoded/rooted paths', async () => {
    // Use STORED incompressible padding so ../../etc/passwd sits strictly past byte 4,096
    const padding = new Uint8Array(5000);
    for (let i = 0; i < padding.length; i++) {
      padding[i] = (i * 73 + 19) & 0xff;
    }
    const traversalZip = await buildDocxBuffer(
      {
        '[Content_Types].xml': CONTENT_TYPES_STANDARD,
        'word/media/pad.png': padding,
        'word/document.xml': VALID_DOCUMENT_XML,
        '../../etc/passwd': 'root:x:0:0:root:/root:/bin/bash',
      },
      'STORE'
    );
    expect(traversalZip.byteLength).toBeGreaterThan(5000);
    // Confirm verifyMagicBytes's 4KB pre-scan alone did not catch it before byte 4096
    expect(verifyMagicBytes(traversalZip.buffer as ArrayBuffer, '.docx').valid).toBe(true);

    const validatorRes = await validateDocxArchive(traversalZip);
    expect(validatorRes.valid).toBe(false);
    expect(validatorRes.error).toContain('path traversal');

    const file = makeDocxFile(traversalZip, 'late_traversal.docx');
    const extractorRes = await extractFromFile(file);
    expect(extractorRes.ok).toBe(false);
    if (!extractorRes.ok) expect(extractorRes.reason).toBe('corrupt');

    const parserRes = await parseResumeFile(file);
    expect(parserRes.success).toBe(false);
    expect(parserRes.error).toContain('path traversal');

    const urlEncodedZip = await buildDocxBuffer({
      '[Content_Types].xml': CONTENT_TYPES_STANDARD,
      'word/document.xml': VALID_DOCUMENT_XML,
      'word/%2e%2e/%2e%2e/pwn.xml': '<evil/>',
    });
    expect((await validateDocxArchive(urlEncodedZip)).valid).toBe(false);

    const rootedZip = await buildDocxBuffer({
      '[Content_Types].xml': CONTENT_TYPES_STANDARD,
      'word/document.xml': VALID_DOCUMENT_XML,
      '/etc/cron.d/pwn': '* * * * * root id',
    });
    expect((await validateDocxArchive(rootedZip)).valid).toBe(false);
  });

  it('rejects high-ratio zip bombs, forged uncompressedSize headers, and excessive entry counts', async () => {
    // 1. High-ratio DEFLATE compression bomb (>100:1)
    const bombPayload = 'A'.repeat(200_000);
    const bombZip = await buildDocxBuffer(
      {
        '[Content_Types].xml': CONTENT_TYPES_STANDARD,
        'word/document.xml': VALID_DOCUMENT_XML,
        'word/bloat.xml': `<w:t>${bombPayload}</w:t>`,
      },
      'DEFLATE'
    );
    const bombCheck = await validateDocxArchive(bombZip);
    expect(bombCheck.valid).toBe(false);
    expect(bombCheck.error).toContain('compression ratio');

    const bombFile = makeDocxFile(bombZip, 'bomb.docx');
    const extBomb = await extractFromFile(bombFile);
    expect(extBomb.ok).toBe(false);
    const parseBomb = await parseResumeFile(bombFile);
    expect(parseBomb.success).toBe(false);

    // 2. Forged ZIP header lying about uncompressedSize (claims 50 bytes when actual deflated stream is 200,000 bytes)
    const zlib = await import('node:zlib');
    const rawBomb = Buffer.from(`<w:t>${bombPayload}</w:t>`);
    const deflatedBomb = zlib.deflateRawSync(rawBomb);
    const crc = zlib.crc32(rawBomb);
    const entryName = Buffer.from('word/bloat.xml');
    const forgedUncompressed = 50; // Lie in both local header and central directory

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8); // DEFLATE
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(deflatedBomb.length, 18);
    lh.writeUInt32LE(forgedUncompressed, 22);
    lh.writeUInt16LE(entryName.length, 26);

    const cdh = Buffer.alloc(46);
    cdh.writeUInt32LE(0x02014b50, 0);
    cdh.writeUInt16LE(20, 4);
    cdh.writeUInt16LE(20, 6);
    cdh.writeUInt16LE(0, 8);
    cdh.writeUInt16LE(8, 10);
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(deflatedBomb.length, 20);
    cdh.writeUInt32LE(forgedUncompressed, 24);
    cdh.writeUInt16LE(entryName.length, 28);
    cdh.writeUInt32LE(0, 42);

    const cdOffset = lh.length + entryName.length + deflatedBomb.length;
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(1, 8);
    eocd.writeUInt16LE(1, 10);
    eocd.writeUInt32LE(cdh.length + entryName.length, 12);
    eocd.writeUInt32LE(cdOffset, 16);

    const forgedZip = Buffer.concat([lh, entryName, deflatedBomb, cdh, entryName, eocd]);
    const forgedCheck = await validateDocxArchive(forgedZip);
    expect(forgedCheck.valid).toBe(false);
    expect(forgedCheck.error).toContain('compression ratio');

    // 3. Excessive entry count (> 500 entries)
    const manyEntries: Record<string, string> = {
      '[Content_Types].xml': CONTENT_TYPES_STANDARD,
      'word/document.xml': VALID_DOCUMENT_XML,
    };
    for (let i = 0; i <= DOCX_SECURITY_LIMITS.maxEntries; i++) {
      manyEntries[`word/extra/item_${i}.xml`] = '<x/>';
    }
    const manyZip = await buildDocxBuffer(manyEntries);
    const manyCheck = await validateDocxArchive(manyZip);
    expect(manyCheck.valid).toBe(false);
    expect(manyCheck.error).toContain('entry count');
  });

  it('rejects macro-enabled Word payloads, vbaProject.bin, ActiveX, and OLE embeddings', async () => {
    const vbaZip = await buildDocxBuffer({
      '[Content_Types].xml': CONTENT_TYPES_STANDARD,
      'word/document.xml': VALID_DOCUMENT_XML,
      'word/vbaProject.bin': new Uint8Array([0xd0, 0xcf, 0x11, 0xe0]),
    });
    expect((await validateDocxArchive(vbaZip)).valid).toBe(false);
    expect((await extractFromFile(makeDocxFile(vbaZip))).ok).toBe(false);
    expect((await parseResumeFile(makeDocxFile(vbaZip))).success).toBe(false);

    const oleZip = await buildDocxBuffer({
      '[Content_Types].xml': CONTENT_TYPES_STANDARD,
      'word/document.xml': VALID_DOCUMENT_XML,
      'word/embeddings/oleObject1.bin': new Uint8Array([0x01, 0x02, 0x03, 0x04]),
    });
    expect((await validateDocxArchive(oleZip)).valid).toBe(false);

    const activeXZip = await buildDocxBuffer({
      '[Content_Types].xml': CONTENT_TYPES_STANDARD,
      'word/document.xml': VALID_DOCUMENT_XML,
      'word/activeX/activeX1.xml': '<ax:ocx/>',
    });
    expect((await validateDocxArchive(activeXZip)).valid).toBe(false);

    const macroContentTypes =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.ms-word.document.macroEnabled.main+xml"/>' +
      '</Types>';
    const macroTypeZip = await buildDocxBuffer({
      '[Content_Types].xml': macroContentTypes,
      'word/document.xml': VALID_DOCUMENT_XML,
    });
    expect((await validateDocxArchive(macroTypeZip)).valid).toBe(false);
  });

  it('rejects XML DOCTYPE / ENTITY XXE injection before DOM parsing', async () => {
    const xxeDocXml =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:body><w:p><w:r><w:t>&xxe;</w:t></w:r></w:p></w:body></w:document>';

    const xxeZip = await buildDocxBuffer({
      '[Content_Types].xml': CONTENT_TYPES_STANDARD,
      'word/document.xml': xxeDocXml,
    });
    const check = await validateDocxArchive(xxeZip);
    expect(check.valid).toBe(false);
    expect(check.error).toContain('DOCTYPE');

    const file = makeDocxFile(xxeZip, 'xxe.docx');
    expect((await extractFromFile(file)).ok).toBe(false);
    expect((await parseResumeFile(file)).success).toBe(false);

    const xxeRelsZip = await buildDocxBuffer({
      '[Content_Types].xml': CONTENT_TYPES_STANDARD,
      'word/document.xml': VALID_DOCUMENT_XML,
      'word/_rels/document.xml.rels':
        '<?xml version="1.0"?><!DOCTYPE rels [<!ENTITY e "1">]><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>',
    });
    expect((await validateDocxArchive(xxeRelsZip)).valid).toBe(false);
  });

  it('rejects unsafe external relationships (attachedTemplate, file://, javascript:, data:, UNC)', async () => {
    const maliciousRels = [
      '<Relationship Id="r1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/attachedTemplate" Target="https://evil.example/template.dotm" TargetMode="External"/>',
      '<Relationship Id="r2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="file:///etc/passwd" TargetMode="External"/>',
      '<Relationship Id="r3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="javascript:alert(1)" TargetMode="External"/>',
      '<Relationship Id="r4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="data:text/html,&lt;script&gt;alert(1)&lt;/script&gt;" TargetMode="External"/>',
      '<Relationship Id="r5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="\\\\attacker-smb\\share\\leak" TargetMode="External"/>',
    ];

    for (const relTag of maliciousRels) {
      const zipBytes = await buildDocxBuffer({
        '[Content_Types].xml': CONTENT_TYPES_STANDARD,
        'word/document.xml': VALID_DOCUMENT_XML,
        'word/_rels/document.xml.rels': `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relTag}</Relationships>`,
      });
      const res = await validateDocxArchive(zipBytes);
      expect(res.valid, `Expected rejection for ${relTag}`).toBe(false);
      expect((await extractFromFile(makeDocxFile(zipBytes))).ok).toBe(false);
      expect((await parseResumeFile(makeDocxFile(zipBytes))).success).toBe(false);
    }
  });

  it('extracts legitimate DOCX with hyperlinks, tables, headers/footers cleanly through both extractFromFile and parseResumeFile', async () => {
    const validDocxBytes = await buildDocxBuffer({
      '[Content_Types].xml': CONTENT_TYPES_STANDARD,
      '_rels/.rels':
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
        '</Relationships>',
      'word/document.xml': VALID_DOCUMENT_XML,
      'word/header1.xml':
        '<?xml version="1.0" encoding="UTF-8"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>Jane Doe Resume</w:t></w:r></w:p></w:hdr>',
      'word/_rels/document.xml.rels': VALID_RELS_XML,
    });

    const validFile = makeDocxFile(validDocxBytes, 'jane_doe.docx');

    const extracted = await extractFromFile(validFile);
    expect(extracted.ok).toBe(true);
    if (extracted.ok) {
      expect(extracted.data.text).toContain('Jane Doe - Senior Platform Engineer');
      expect(extracted.data.text).toContain('Go, Kubernetes, PostgreSQL, TypeScript');
      expect(extracted.data.links).toContain('https://github.com/user');
      expect(extracted.data.warnings).toContain('header-footer-content');
      expect(extracted.data.warnings).toContain('table-layout');
    }

    const parsed = await parseResumeFile(validFile);
    expect(parsed.success).toBe(true);
    expect(parsed.text).toContain('Jane Doe - Senior Platform Engineer');
    expect(parsed.text).toContain('Architected distributed Go and Kubernetes services');
  });

  it('rejects oversized TXT/JSON (> 5 MB) and binary payloads disguised as TXT/MD/JSON', async () => {
    const oversizedBytes = new Uint8Array(MAX_FILE_SIZE_BYTES + 1024);
    oversizedBytes.fill(0x41); // 'A'

    const bigTxt = new File([oversizedBytes], 'huge.txt', { type: 'text/plain' });
    const extBigTxt = await extractFromFile(bigTxt);
    expect(extBigTxt.ok).toBe(false);
    if (!extBigTxt.ok) expect(extBigTxt.reason).toBe('too-large');

    const bigJson = new File([oversizedBytes], 'huge.json', { type: 'application/json' });
    const extBigJson = await extractFromFile(bigJson);
    expect(extBigJson.ok).toBe(false);
    if (!extBigJson.ok) expect(extBigJson.reason).toBe('too-large');

    // Binary ELF / null bytes hidden after 1 KB of valid ASCII text
    const prefix = new TextEncoder().encode('Jane Doe\nSoftware Engineer\n'.repeat(50));
    const binaryTail = new Uint8Array([0x00, 0x01, 0x02, 0x00, 0x7f, 0x45, 0x4c, 0x46]);
    const disguised = new Uint8Array(prefix.length + binaryTail.length);
    disguised.set(prefix, 0);
    disguised.set(binaryTail, prefix.length);

    const fakeMd = new File([disguised], 'fake.md', { type: 'text/markdown' });
    expect((await extractFromFile(fakeMd)).ok).toBe(false);
    expect((await parseResumeFile(fakeMd)).success).toBe(false);

    const fakeJson = new File([disguised], 'fake.json', { type: 'application/json' });
    expect((await extractFromFile(fakeJson)).ok).toBe(false);

    // Valid UTF-8 text & JSON still pass cleanly
    const validMd = new File(['# Jane Doe\nSenior Engineer — Bengaluru 🚀'], 'resume.md', {
      type: 'text/markdown',
    });
    const okMd = await extractFromFile(validMd);
    expect(okMd.ok).toBe(true);
    if (okMd.ok) expect(okMd.data.text).toContain('Jane Doe');

    const validJson = new File([JSON.stringify({ name: 'Jane Doe', role: 'SWE' })], 'resume.json', {
      type: 'application/json',
    });
    const okJson = await extractFromFile(validJson);
    expect(okJson.ok).toBe(true);
    if (okJson.ok) expect(okJson.data.text).toContain('Jane Doe');
  });
});
