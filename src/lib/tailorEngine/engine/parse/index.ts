export interface RawBlock {
  id: string;
  lineIndex: number;
  rawText: string;
  isBullet: boolean;
  isHeadingCandidate: boolean;
  indentation: number;
}

/**
 * Stage 1: PARSE
 * Deconstructs raw resume text into atomic raw line blocks
 * preserving all punctuation, indentations, and structural markers.
 */
export function parseRawContent(rawInput: string): RawBlock[] {
  if (!rawInput || !rawInput.trim()) return [];

  const lines = rawInput.split('\n');
  const blocks: RawBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const leadingSpaces = rawLine.match(/^\s*/)?.[0].length || 0;
    const isBullet = /^[-•*●▪‣]\s*/.test(trimmed);

    // Heading candidate if short, uppercase or Title Case, without bullet
    const cleanNoPunct = trimmed.replace(/^[#*_\-\s]+/, '').replace(/[:\-#•*_\s]+$/, '').trim();
    const wordCount = cleanNoPunct.split(/\s+/).length;
    const isHeadingCandidate =
      !isBullet &&
      wordCount >= 1 &&
      wordCount <= 6 &&
      cleanNoPunct.length <= 50 &&
      (cleanNoPunct === cleanNoPunct.toUpperCase() ||
        /^[A-Z][a-z]+(\s+(&|and|of|in|to|for|[A-Z][a-z]+))*$/i.test(cleanNoPunct));

    blocks.push({
      id: `blk-${i}`,
      lineIndex: i,
      rawText: trimmed,
      isBullet,
      isHeadingCandidate,
      indentation: leadingSpaces
    });
  }

  return blocks;
}
