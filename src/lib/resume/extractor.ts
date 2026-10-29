// ============================================================
// HIREFLOW EVIDENCE & METRIC EXTRACTOR SPECIFICATION (STAGE 1)
// Rigorous extraction of quantifiable metrics with strict negative guards
// against years, dates, version numbers, and non-performance numbers.
// ============================================================

export interface ExtractedMetric {
  raw: string;
  normalized: string;
  category: 'percentage' | 'multiplier' | 'currency' | 'unit_rate' | 'range' | 'compact_number' | 'formatted_number' | 'count';
  value?: number;
  unit?: string;
  startIndex: number;
  endIndex: number;
}

// ── NEGATIVE GUARDS (STRICTLY EXCLUDED) ──

// Calendar years from 1960 to 2040
const YEAR_REGEX = /\b(?:19[6-9]\d|20[0-4]\d)\b/g;

// Software & standard versions: v18, v20, 3.11, v12, v1.3, TLS 1.3, Angular 1.5, kernel 5.15, Python 3.11, etc.
const VERSION_REGEX = /\b(?:v|version|ver\.?|rev\.?)\s*\d+(?:\.\d+)*(?:-[a-z0-9.]+)?\b|\b(?:python|node|react|angular|tls|kernel)\s+\d+(?:\.\d+)*\b/gi;

// Section, tier, phase, or standard numbers: e.g. Phase 1, Step 2, Tier 2, Tier 3, Section 4, ISO 27001, SP 800-61
const STRUCTURAL_INDEX_REGEX = /\b(?:phase|step|tier|level|part|chapter|section|iso|sp|rfc)\s+\d+(?:-\d+)?\b|\b(?:27001|800-61)\b/gi;

// ── POSITIVE METRIC PATTERNS (ORDERED BY SPECIFICITY) ──

// 1. Ranges: e.g. "4-6 weeks", "10-15%", "$50k-$100k", "5 to 8", "8-16", "200-300 ms"
const RANGE_REGEX = /(?:\$\s*\d+(?:\.\d+)?[kKmMbB]?\s*-\s*\$\s*\d+(?:\.\d+)?[kKmMbB]?|\b\d+(?:\.\d+)?\s*(?:-|to)\s*\d+(?:\.\d+)?(?:\s*(?:%|percent|weeks?|months?|days?|hours?|hrs?|mins?|minutes?|ms|seconds?|s|k|m|b|users?|nodes?|engineers?|worker\s+nodes?|tps|qps|rps|req\/s))?\b)/gi;

// 2. Multipliers: e.g. "3x", "10x", "2.5X", "0.5x"
const MULTIPLIER_REGEX = /\b\d+(?:\.\d+)?\s*[xX]\b/g;

// 3. Percentages: e.g. "44%", "28.5%", "99.9%", "60 percent"
const PERCENTAGE_REGEX = /\b\d+(?:\.\d+)?\s*(?:%|percent(?:age)?\b)/gi;

// 4. Currency: e.g. "₹25L", "₹10 Crore", "$1.2M", "$50k", "$300,000", "Rs. 15 Lakhs", "12 LPA", "₹5,00,000", "$4.5B"
const CURRENCY_REGEX = /(?:[₹$£€]|Rs\.?\s*)\s*\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:k|m|b|l|cr|lakhs?|crores?|lpa))?\b|\b\d+(?:,\d+)*(?:\.\d+)?\s*(?:lpa|lakhs?|crores?)\b/gi;

// 5. Engineering units & rates: e.g. "28k req/s", "120ms", "45ms", "1.5s", "2.5 TB", "500 GB"
const UNIT_RATE_REGEX = /\b\d+(?:,\d+)*(?:\.\d+)?\s*(?:ms|sec|seconds?|s|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|req\/s|requests?\/sec|qps|rps|tps|fps|kb|mb|gb|tb|pb)\b/gi;

// 6. Compact numbers: e.g. "1.8M", "500k", "10B"
const COMPACT_NUM_REGEX = /\b\d+(?:\.\d+)?\s*[kKmMbB]\b/g;

// 7. Large formatted numbers (>= 1,000): e.g. "15,000+", "1,200", "50,000"
const FORMATTED_NUM_REGEX = /\b\d{1,3}(?:,\d{3})+(?:\+)?/g;

// 8. Count metrics: numbers followed by "+" or performance nouns:
// e.g. "40+", "120+", "450+", "12 REST API endpoints", "6-engineer", "85 unit tests", "4 cross-functional squad initiatives", "250 customer escalation tickets", "150 enterprise clients"
const COUNT_METRIC_REGEX = /\b\d+(?:\+)?[\s-]*(?:(?:REST\s+API|physical|patient\s+telemetry|high-severity|enterprise|unit|cross-functional|customer\s+escalation)\s+)*(?:endpoints?|devices?|vulnerabilities?|clients?|tickets?|tests?|squads?|initiatives?|engineers?|users?|nodes?|queries|commits?)\b|\b\d+\+/gi;

export function normalizeMetric(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\+$/, '')
    .trim();
}

export function extractMetrics(text: string): ExtractedMetric[] {
  if (!text || typeof text !== 'string') return [];

  // Register negative spans to guard against
  const ignoredSpans: Array<{ start: number; end: number }> = [];

  const registerIgnored = (regex: RegExp) => {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      ignoredSpans.push({ start: match.index, end: match.index + match[0].length });
    }
  };

  registerIgnored(YEAR_REGEX);
  registerIgnored(STRUCTURAL_INDEX_REGEX);
  registerIgnored(VERSION_REGEX);

  const isInsideIgnored = (start: number, end: number): boolean => {
    return ignoredSpans.some(span => (start >= span.start && start < span.end) || (end > span.start && end <= span.end));
  };

  const results: ExtractedMetric[] = [];
  const registeredRanges: Array<{ start: number; end: number }> = [];

  const harvestPattern = (
    regex: RegExp,
    category: ExtractedMetric['category'],
    unitExtractor?: (m: string) => string | undefined
  ) => {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const raw = match[0].trim();
      const start = match.index;
      const end = start + match[0].length;

      // Negative check
      if (isInsideIgnored(start, end)) continue;

      // Overlap check
      const overlaps = registeredRanges.some(
        r => (start >= r.start && start < r.end) || (end > r.start && end <= r.end)
      );
      if (overlaps) continue;

      registeredRanges.push({ start, end });

      // Determine numeric value
      let value: number | undefined;
      const cleanNum = raw.replace(/[^0-9.]/g, '');
      if (cleanNum) {
        value = parseFloat(cleanNum);
      }

      // Handle multiplier multipliers (e.g. 50k, 1.2M)
      if (value !== undefined) {
        if (/k\b/i.test(raw)) value *= 1_000;
        else if (/m\b/i.test(raw) || /lpa\b/i.test(raw)) value *= 1_000_000;
        else if (/b\b/i.test(raw) || /crores?\b/i.test(raw) || /cr\b/i.test(raw)) value *= 10_000_000;
        else if (/lakhs?\b/i.test(raw) || /l\b/i.test(raw)) value *= 100_000;
      }

      results.push({
        raw,
        normalized: normalizeMetric(raw),
        category,
        value,
        unit: unitExtractor ? unitExtractor(raw) : undefined,
        startIndex: start,
        endIndex: end
      });
    }
  };

  // 1. Ranges first
  harvestPattern(RANGE_REGEX, 'range', (m) => {
    const u = m.match(/(?:%|percent|weeks?|months?|days?|hours?|hrs?|mins?|minutes?|ms|seconds?|s|k|m|b|users?|nodes?|engineers?|worker\s+nodes?)/i);
    return u ? u[0] : (m.startsWith('$') ? '$' : undefined);
  });

  // 2. Multipliers
  harvestPattern(MULTIPLIER_REGEX, 'multiplier', () => 'x');

  // 3. Percentages
  harvestPattern(PERCENTAGE_REGEX, 'percentage', (m) => /percent/i.test(m) ? 'percent' : '%');

  // 4. Currency
  harvestPattern(CURRENCY_REGEX, 'currency', (m) => {
    if (m.includes('$')) return '$';
    if (m.includes('₹')) return '₹';
    if (m.includes('£')) return '£';
    if (m.includes('€')) return '€';
    if (/Rs/i.test(m)) return 'Rs.';
    if (/LPA/i.test(m)) return 'LPA';
    return undefined;
  });

  // 5. Engineering units & rates
  harvestPattern(UNIT_RATE_REGEX, 'unit_rate', (m) => {
    const u = m.match(/(?:ms|sec|seconds?|s|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|req\/s|requests?\/sec|qps|rps|tps|fps|kb|mb|gb|tb|pb)/i);
    return u ? u[0] : undefined;
  });

  // 6. Compact numbers
  harvestPattern(COMPACT_NUM_REGEX, 'compact_number', (m) => {
    const u = m.match(/[kKmMbB]/);
    return u ? u[0] : undefined;
  });

  // 7. Formatted numbers
  harvestPattern(FORMATTED_NUM_REGEX, 'formatted_number');

  // 8. Counts
  harvestPattern(COUNT_METRIC_REGEX, 'count', (m) => {
    const u = m.match(/(?:endpoints?|devices?|vulnerabilities?|clients?|tickets?|tests?|squads?|initiatives?|engineers?|users?|nodes?|queries|commits?)/i);
    return u ? u[0] : undefined;
  });

  // Sort chronologically by appearance
  results.sort((a, b) => a.startIndex - b.startIndex);

  return results;
}
