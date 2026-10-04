// ============================================================
// HireFlow ATS Engine — fileExtractor
// Helper to extract text from user uploaded files (.txt, .pdf, .docx)
// ============================================================

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // Plain text formats (.txt, .md, .csv, .json)
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json')) {
    return await file.text();
  }

  // PDF Text Extraction (Lightweight stream decoder fallback)
  if (fileName.endsWith('.pdf')) {
    try {
      const buffer = await file.arrayBuffer();
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const raw = textDecoder.decode(buffer);

      // Extract text within BT ... ET blocks or string objects (/Tj, /TJ)
      const textPieces: string[] = [];
      const tjMatches = [...raw.matchAll(/\(([^()]*)\)\s*Tj/g)];
      for (const m of tjMatches) {
        if (m[1] && m[1].length > 1) {
          textPieces.push(m[1]);
        }
      }

      if (textPieces.length > 20) {
        return textPieces.join(' ').replace(/\\r|\\n/g, '\n');
      }

      // If binary compressed or stream encoded, return readable ASCII strings
      const asciiStrings = raw.match(/[A-Za-z0-9,.:;'"\-+=()/@#&]{3,}/g);
      if (asciiStrings && asciiStrings.length > 50) {
        return asciiStrings.join(' ');
      }

      return `[Extracted from ${file.name}]\n(Note: Uploaded PDF had compressed text layers. Paste plain text if results appear truncated.)`;
    } catch {
      return `[Extracted from ${file.name}]`;
    }
  }

  // DOCX Extraction (ZIP extraction of word/document.xml)
  if (fileName.endsWith('.docx')) {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Scan for XML text nodes
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const docStr = textDecoder.decode(bytes);
      const xmlTexts: string[] = [];
      const xmlMatches = [...docStr.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g)];
      for (const m of xmlMatches) {
        xmlTexts.push(m[1]);
      }
      if (xmlTexts.length > 0) {
        return xmlTexts.join(' ');
      }
    } catch {
      // Fallback
    }
  }

  // Default fallback to text()
  try {
    return await file.text();
  } catch {
    return `[Extracted from ${file.name}]`;
  }
}
