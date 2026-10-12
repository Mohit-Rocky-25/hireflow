// ============================================================
// Tailor Engine — Certifications & Training Parser
// Extracts certificates, licenses, courses, and continuous learning entries
// ============================================================

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
    // If a line is comma-separated list of multiple distinct certs (e.g. "AWS SAA, CompTIA Sec+, CEH")
    // but check that it's not a single title with an issuer like "Network Security, Coursera"
    if (line.includes(',') && !line.includes('(') && line.split(',').length >= 3) {
      const parts = line.split(',').map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        if (p.length > 2) {
          items.push(p);
        }
      }
    } else {
      if (line.length > 2) {
        items.push(line);
      }
    }
  }

  return items;
}
