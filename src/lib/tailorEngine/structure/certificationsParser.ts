// ============================================================
// Tailor Engine — Certifications & Training Parser
// Extracts certificates, licenses, courses, and continuous learning entries
// ============================================================

function splitMixedCertLine(clean: string): string[] {
  const inProgressMatch = clean.match(/^(.*?)(?:,\s*and\s+|\s+and\s+|;\s*)((?:studying|preparing|currently|in\s*progress)\b.*)$/i);
  if (inProgressMatch && inProgressMatch[1].trim() && inProgressMatch[2].trim()) {
    const part1 = inProgressMatch[1].trim();
    let part2 = inProgressMatch[2].trim();
    part2 = part2.charAt(0).toUpperCase() + part2.slice(1);
    return [part1, part2];
  }
  const practiceMatch = clean.match(/^(.*?)(?:,\s*and\s+|\s+and\s+|;\s*)((?:actively\s+)?(?:solving\s+)?(?:labs?|platforms?|learning\s*logs?)\b.*)$/i);
  if (practiceMatch && practiceMatch[1].trim() && practiceMatch[2].trim()) {
    const part1 = practiceMatch[1].trim();
    let part2 = practiceMatch[2].trim();
    part2 = part2.charAt(0).toUpperCase() + part2.slice(1);
    return [part1, part2];
  }
  return [clean];
}

export function parseCertificationsSection(content: string): string[] {
  if (!content || !content.trim()) return [];

  const raw = content.trim();
  const items: string[] = [];

  // Split on newlines, bullets, or semicolons
  const lines = raw
    .split(/(?:\n|(?<=[^,])\s*[-•*●▪‣]\s+|;\s*)/)
    .map((l) => l.trim().replace(/^[-•*●▪‣]\s*/, '').trim())
    .filter(Boolean);

  for (const line of lines) {
    if (/^[a-z]/.test(line) && items.length > 0) {
      items[items.length - 1] += ' and ' + line;
      continue;
    }

    const segments = splitMixedCertLine(line);
    for (const seg of segments) {
      // If a segment is comma-separated list of multiple distinct certs (e.g. "AWS SAA, CompTIA Sec+, CEH")
      // but check that it's not a single title with an issuer like "Network Security, Coursera"
      if (seg.includes(',') && !seg.includes('(') && seg.split(',').length >= 3) {
        const parts = seg.split(',').map((p) => p.trim()).filter(Boolean);
        for (const p of parts) {
          if (p.length > 2) {
            items.push(p);
          }
        }
      } else {
        if (seg.length > 2) {
          items.push(seg);
        }
      }
    }
  }

  return items;
}
