// ============================================================
// HireFlow ATS Engine — fileExtractor
// Clean extraction for user uploaded files (.pdf, .docx, .txt, .md, .json)
// Powered by mammoth (DOCX) and PDF.js (PDF) with robust normalization
// ============================================================

import { parseResumeFile } from '../../features/ats/fileParser';

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // JSON files
  if (fileName.endsWith('.json')) {
    try {
      const raw = await file.text();
      try {
        const parsed = JSON.parse(raw);
        // If JSON resume structure, pretty format
        return JSON.stringify(parsed, null, 2);
      } catch {
        return raw;
      }
    } catch {
      return '';
    }
  }

  // DOCX, PDF, TXT, MD extraction using production-grade parser
  try {
    const parseResult = await parseResumeFile(file);
    if (parseResult.success && parseResult.text && parseResult.text.trim().length > 0) {
      return parseResult.text;
    }
    if (parseResult.error) {
      console.warn('parseResumeFile warning:', parseResult.error);
    }
  } catch (err) {
    console.error('Failed to parse file with primary engine:', err);
  }

  // If binary file type (docx or pdf), DO NOT read raw bytes as text
  if (fileName.endsWith('.docx') || fileName.endsWith('.pdf')) {
    return `[Unable to extract text from ${file.name}. Please ensure the file is not password-protected or corrupted, or paste your text directly.]`;
  }

  // Fallback for plain text files (.txt, .md, etc.)
  try {
    const text = await file.text();
    // Guard against corrupted binary streams masquerading as text
    if (text.startsWith('PK\x03\x04') || text.startsWith('%PDF-')) {
      return `[Binary file detected for ${file.name}. Please upload a standard PDF or DOCX file.]`;
    }
    return text;
  } catch {
    return `[Unable to extract content from ${file.name}. Please paste plain text.]`;
  }
}
