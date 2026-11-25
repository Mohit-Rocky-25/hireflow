// ============================================================
// ATS Resume Roaster — Logical Requirement Expression Engine (Phase 06 / 10.2)
// Recursive AST parsing and evaluation for compound AND / OR / Alternative requirements
// ============================================================

import { resolveCompetency } from '../knowledge/ontology';
import { ALL_TAXONOMY_SKILLS, resolveSkillByTerm, verifyAmbiguityGuard } from '../knowledge/taxonomy';
import { BranchEvaluation, RequirementMatchStatus } from './types';

export type LogicalOperator = 'LEAF' | 'AND' | 'OR' | 'UNRESOLVED';

export interface LogicalExpression {
  operator: LogicalOperator;
  skillId?: string;
  canonical?: string;
  operands?: LogicalExpression[];
  rawText?: string;
  unresolved?: boolean;
  parseError?: string;
}

const ATOMIC_SLASH_TERMS = new Set([
  'ci/cd',
  'tcp/ip',
  'tcp/udp',
  'pl/sql',
  'ui/ux',
  'i/o',
  'r/w',
  'http/2',
  'os/2',
  's/4hana',
  'pub/sub',
  'a/b',
  'shadcn/ui',
  'pro/engineer',
  'gitlab ci/cd',
  'mobile ci/cd',
]);

const PROSE_ONLY_TOKENS = new Set([
  'experience', 'proficiency', 'expertise', 'familiarity', 'knowledge', 'understanding',
  'skills', 'skill', 'background', 'engineering', 'development', 'developer', 'engineer',
  'software', 'programming', 'frameworks', 'framework', 'platforms', 'platform', 'tools',
  'tool', 'technologies', 'technology', 'providers', 'provider', 'systems', 'system',
  'modern', 'strong', 'solid', 'deep', 'proven', 'demonstrated', 'hands-on', 'working',
  'practical', 'extensive', 'advanced', 'clean', 'maintainable', 'code', 'building',
  'using', 'with', 'in', 'of', 'for', 'on', 'to', 'from', 'across', 'at', 'least', 'one',
  'any', 'either', 'both', 'such', 'as', 'including', 'like', 'degree', 'bachelor',
  "bachelor's", 'master', "master's", 'phd', 'related', 'technical', 'field', 'equivalent',
  'native', 'mobile', 'relational', 'databases', 'key-value', 'storage', 'web', 'applications',
  'cloud', 'data', 'pipeline', 'warehousing', 'automated', 'testing', 'automation', 'coding',
  'production', 'scale', 'principles', 'first', 'love', 'want', 'hear', 'you', 'we',
  'environment', 'environments', 'solutions', 'concepts', 'design', 'capabilities',
  'craftsmanship', 'collaboration', 'passion', 'team', 'ability', 'demonstrated',
]);

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface IndexedAlias {
  alias: string;
  skillId: string;
  canonical: string;
  taxonomyEntry?: (typeof ALL_TAXONOMY_SKILLS)[number];
}

let cachedSortedAliases: IndexedAlias[] | null = null;

function getSortedSkillAliases(): IndexedAlias[] {
  if (cachedSortedAliases) return cachedSortedAliases;
  const list: IndexedAlias[] = [];
  const seen = new Set<string>();

  for (const skill of ALL_TAXONOMY_SKILLS) {
    const terms = Array.from(new Set([skill.canonical, ...(skill.aliases || [])]));
    for (const alias of terms) {
      if (!alias || alias.length < 1) continue;
      const key = `${skill.id}::${alias.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      list.push({
        alias,
        skillId: skill.id,
        canonical: skill.canonical,
        taxonomyEntry: skill,
      });
    }
  }

  // Longest alias first so "Apache Airflow" beats "Airflow", "React Native" beats "React", "C++" beats "C"
  list.sort((a, b) => b.alias.length - a.alias.length);
  cachedSortedAliases = list;
  return list;
}

/**
 * Resolves a token or multi-word phrase to a canonical competency ID.
 */
export function resolveTokenToSkillId(token: string): { id: string; canonical: string } {
  const clean = token.trim();
  const ontNode = resolveCompetency(clean);
  if (ontNode) {
    return { id: ontNode.id, canonical: ontNode.canonical };
  }
  const tax = resolveSkillByTerm(clean) || ALL_TAXONOMY_SKILLS.find(
    s =>
      s.canonical.toLowerCase() === clean.toLowerCase() ||
      s.aliases.some(a => a.toLowerCase() === clean.toLowerCase())
  );
  if (tax) {
    return { id: tax.id, canonical: tax.canonical };
  }
  return {
    id: clean.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown',
    canonical: clean,
  };
}

function isAtomicSlashToken(surroundingToken: string): boolean {
  const clean = surroundingToken
    .trim()
    .replace(/^[,;:(["']+/, '')
    .replace(/[,;:.)\]"']+$/, '')
    .toLowerCase();
  if (!clean) return false;
  if (ATOMIC_SLASH_TERMS.has(clean)) return true;
  if (resolveCompetency(clean) || resolveSkillByTerm(clean)) return true;
  return false;
}

function isNumericRatioSlash(input: string, slashIndex: number): boolean {
  const prev = slashIndex > 0 ? input[slashIndex - 1] : '';
  const next = slashIndex + 1 < input.length ? input[slashIndex + 1] : '';
  return /\d/.test(prev) && /\d/.test(next);
}

/**
 * Checks whether a position in `input` is inside a known multi-word skill alias
 * containing "and" (e.g., "Data Structures and Algorithms").
 */
function isInsideKnownSkillAlias(input: string, opIndex: number, opLength: number): boolean {
  const aliases = getSortedSkillAliases();
  for (const item of aliases) {
    if (!/\band\b/i.test(item.alias)) continue;
    const regex = new RegExp(`(?<![A-Za-z0-9+#.])${escapeRegex(item.alias)}(?![A-Za-z0-9+#.])`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (opIndex >= start && opIndex + opLength <= end) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Extracts all non-overlapping known skills/competencies from an IDENT fragment,
 * preserving order and ambiguity guards against the full sentence context.
 */
function extractKnownSkillsFromFragment(
  fragment: string,
  fullLineContext: string
): Array<{ id: string; canonical: string }> {
  let trimmed = fragment.trim().replace(/^[,;:\s]+/, '').replace(/[,;:\s.]+$/, '').trim();
  if (!trimmed) return [];

  // Strip English preamble clauses introduced by ":" or "with / in / using / of / via"
  // when the trailing clause contains at least one known skill (e.g. "Strong data pipeline engineering with Apache Airflow").
  const colonIdx = trimmed.lastIndexOf(':');
  if (colonIdx !== -1 && colonIdx < trimmed.length - 1) {
    const afterColon = trimmed.slice(colonIdx + 1).trim();
    const afterColonSkills = extractKnownSkillsFromFragment(afterColon, fullLineContext);
    if (afterColonSkills.length > 0) {
      return afterColonSkills;
    }
  }

  const preambleMatch = trimmed.match(
    /^.+?\s+\b(?:with|in|using|of|via|at\s+least\s+one\s+of|any\s+one\s+of)\s+(.+)$/i
  );
  if (preambleMatch && preambleMatch[1]) {
    const afterPreamble = preambleMatch[1].trim();
    const afterSkills = extractKnownSkillsFromFragment(afterPreamble, fullLineContext);
    if (afterSkills.length > 0) {
      return afterSkills;
    }
  }

  // 1. Direct exact resolution of the entire fragment
  const directOnt = resolveCompetency(trimmed);
  if (directOnt) {
    const directTax = resolveSkillByTerm(trimmed);
    if (!directTax || verifyAmbiguityGuard(directTax, fullLineContext)) {
      return [{ id: directOnt.id, canonical: directOnt.canonical }];
    }
  }
  const directTax = resolveSkillByTerm(trimmed);
  if (directTax && verifyAmbiguityGuard(directTax, fullLineContext)) {
    return [{ id: directTax.id, canonical: directTax.canonical }];
  }

  // 2. Scan longest-alias-first without overlapping spans
  const aliases = getSortedSkillAliases();
  const occupied: Array<{ start: number; end: number; id: string; canonical: string }> = [];

  for (const item of aliases) {
    if (item.alias.length > trimmed.length) continue;
    const regex = new RegExp(`(?<![A-Za-z0-9+#.])${escapeRegex(item.alias)}(?![A-Za-z0-9+#.])`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(trimmed)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const overlaps = occupied.some(span => !(end <= span.start || start >= span.end));
      if (overlaps) continue;
      if (item.taxonomyEntry && !verifyAmbiguityGuard(item.taxonomyEntry, fullLineContext)) {
        continue;
      }
      occupied.push({ start, end, id: item.skillId, canonical: item.canonical });
    }
  }

  if (occupied.length === 0) return [];
  occupied.sort((a, b) => a.start - b.start);

  const unique: Array<{ id: string; canonical: string }> = [];
  const seenIds = new Set<string>();
  for (const span of occupied) {
    if (!seenIds.has(span.id)) {
      seenIds.add(span.id);
      unique.push({ id: span.id, canonical: span.canonical });
    }
  }
  return unique;
}

function isPureProseFragment(fragment: string): boolean {
  const cleaned = fragment
    .trim()
    .replace(/^[,;:\-.\s]+/, '')
    .replace(/[,;:\-.\s]+$/, '')
    .trim();
  if (!cleaned) return true;
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length > 3) return true;
  return words.every(w => PROSE_ONLY_TOKENS.has(w.toLowerCase().replace(/[^a-z'-]/g, '')));
}

type TokenType = 'LPAREN' | 'RPAREN' | 'AND' | 'OR' | 'SLASH_OR' | 'IDENT';

interface Token {
  type: TokenType;
  value: string;
}

/**
 * Pre-normalizes natural-language patterns before lexing:
 * - Strips leading bullets / trailing periods
 * - Converts Oxford-comma OR lists ("A, B, or C") into "A OR B OR C"
 * - Rewrites trailing context ("A or B on Linux systems") into "(A or B) AND Linux systems"
 * - Strips leading "either"
 */
function preprocessExpressionLine(rawLine: string, fullLineContext: string): string {
  let text = rawLine
    .trim()
    .replace(/^[-*•▪●]+\s*/, '')
    .replace(/[.]+$/, '')
    .trim();

  // Strip "either " when introducing an OR clause
  text = text.replace(/\beither\s+/gi, '');

  // Rewrite "<A> or <B> on <Skill>" (e.g. "C++ or Java on Linux systems") into "(C++ or Java) AND Linux systems"
  const trailingOnMatch = text.match(/^(.+?\bor\b.+?)\s+\b(?:on|using)\s+([A-Za-z0-9+#.\s-]+)$/i);
  if (trailingOnMatch && !trailingOnMatch[1].includes('(') && !trailingOnMatch[1].includes(')')) {
    const trailingSkills = extractKnownSkillsFromFragment(trailingOnMatch[2], fullLineContext);
    if (trailingSkills.length > 0) {
      text = `(${trailingOnMatch[1].trim()}) AND ${trailingOnMatch[2].trim()}`;
    }
  }

  // Convert comma-separated OR lists: e.g. "Python, Java, C++, or Go" -> "Python OR Java OR C++ OR Go"
  // Handles optional colon/preamble before the list ("cloud providers: AWS, GCP, or Azure").
  text = text.replace(
    /([^:;()]+?,\s*[^:;()]+?)(?:,\s*|\s+)\bor\b\s+([^:;(),]+?)(?=$|[.;)\]]|\s+(?:alongside|and|with|on|in|for)\b)/gi,
    (_full, listPart: string, lastItem: string) => {
      // If listPart starts with a colon preamble ("... providers: AWS, GCP"), only expand after the colon
      const colonIdx = listPart.lastIndexOf(':');
      const prefix = colonIdx >= 0 ? listPart.slice(0, colonIdx + 1) + ' ' : '';
      const rawItems = (colonIdx >= 0 ? listPart.slice(colonIdx + 1) : listPart)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (rawItems.length < 2) {
        return `${listPart} OR ${lastItem}`;
      }
      // If the first item has a prose preamble ("Proficiency in any one of Python"), strip only if safe;
      // cleanIdent will extract Python anyway.
      return `${prefix}${rawItems.join(' OR ')} OR ${lastItem.trim()}`;
    }
  );

  // Convert comma-separated AND lists only when ", and " is explicitly present: "Python, SQL, and Snowflake"
  text = text.replace(
    /([^:;()]+?,\s*[^:;()]+?),\s*\band\b\s+([^:;(),]+?)(?=$|[.;)\]])/gi,
    (full, listPart: string, lastItem: string) => {
      if (/\bor\b/i.test(listPart) || /\bor\b/i.test(lastItem)) return full;
      const colonIdx = listPart.lastIndexOf(':');
      const prefix = colonIdx >= 0 ? listPart.slice(0, colonIdx + 1) + ' ' : '';
      const rawItems = (colonIdx >= 0 ? listPart.slice(colonIdx + 1) : listPart)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (rawItems.length < 2) return full;
      return `${prefix}${rawItems.join(' AND ')} AND ${lastItem.trim()}`;
    }
  );

  return text;
}

/**
 * Lexer for boolean requirement expressions.
 * Handles: AND, OR, &&, ||, alongside, non-atomic /, (, ) and skill terms.
 */
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = input.length;

  while (i < len) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }
    if (ch === '/') {
      // Inspect full whitespace/paren-delimited token around '/'
      let tokStart = i;
      while (tokStart > 0 && !/[\s(),;]/.test(input[tokStart - 1])) tokStart--;
      let tokEnd = i + 1;
      while (tokEnd < len && !/[\s(),;]/.test(input[tokEnd])) tokEnd++;
      const surrounding = input.slice(tokStart, tokEnd);

      if (!isNumericRatioSlash(input, i) && !isAtomicSlashToken(surrounding) && !/https?:|github\.com/i.test(surrounding)) {
        tokens.push({ type: 'SLASH_OR', value: '/' });
        i++;
        continue;
      }
    }

    const remaining = input.slice(i);
    const prevIsBoundary = i === 0 || /[\s(]/.test(input[i - 1]);

    if (prevIsBoundary) {
      const andMatch = remaining.match(/^(?:AND|&&|alongside)(?=$|[\s()])/i);
      if (andMatch && !isInsideKnownSkillAlias(input, i, andMatch[0].length)) {
        tokens.push({ type: 'AND', value: andMatch[0] });
        i += andMatch[0].length;
        continue;
      }

      const orMatch = remaining.match(/^(?:OR|\|\|)(?=$|[\s()])/i);
      if (orMatch) {
        tokens.push({ type: 'OR', value: orMatch[0] });
        i += orMatch[0].length;
        continue;
      }
    }

    // Scan identifier / skill name up to next operator, delimiter, or parenthesis
    let ident = '';
    while (i < len) {
      const c = input[i];
      if (c === '(' || c === ')') break;
      if (c === '/') {
        let tokStart = i;
        while (tokStart > 0 && !/[\s(),;]/.test(input[tokStart - 1])) tokStart--;
        let tokEnd = i + 1;
        while (tokEnd < len && !/[\s(),;]/.test(input[tokEnd])) tokEnd++;
        const surrounding = input.slice(tokStart, tokEnd);
        if (!isNumericRatioSlash(input, i) && !isAtomicSlashToken(surrounding)) {
          break;
        }
      }

      const rem = input.slice(i);
      const isAtBoundary = i === 0 || /[\s(]/.test(input[i - 1]);
      if (isAtBoundary) {
        const nextAnd = rem.match(/^(?:AND|&&|alongside)(?=$|[\s()])/i);
        if (nextAnd && !isInsideKnownSkillAlias(input, i, nextAnd[0].length)) break;
        if (/^(?:OR|\|\|)(?=$|[\s()])/i.test(rem)) break;
      }

      ident += c;
      i++;
    }

    const trimmed = ident.trim().replace(/^[,;\s]+/, '').replace(/[,;\s]+$/, '').trim();
    if (trimmed) {
      tokens.push({ type: 'IDENT', value: trimmed });
    }
  }

  return tokens;
}

/**
 * Validates token sequence for malformed boolean syntax before parsing.
 * Also strips pure-prose descriptor IDENTs immediately preceding '(' (e.g. "relational databases (PostgreSQL or MySQL)").
 */
function normalizeAndValidateTokens(
  rawTokens: Token[],
  fullLineContext: string,
  hasExplicitBoolSyntax: boolean
): { tokens: Token[]; error?: string } {
  const tokens: Token[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const tok = rawTokens[i];
    const next = rawTokens[i + 1];

    if (tok.type === 'IDENT') {
      const known = extractKnownSkillsFromFragment(tok.value, fullLineContext);
      // Descriptive prose label before '(' with zero known skills (e.g. "Web application fundamentals (React / WebSockets)")
      if (known.length === 0 && next?.type === 'LPAREN') {
        continue;
      }
      if (known.length === 0 && isPureProseFragment(tok.value)) {
        // Pure prose preamble at start before an operator when no skill was found, or trailing prose
        if (tokens.length === 0 && !hasExplicitBoolSyntax) {
          continue;
        }
        if (tok.value.split(/\s+/).length >= 3 && isPureProseFragment(tok.value)) {
          continue;
        }
      }
    }

    tokens.push(tok);
  }

  if (tokens.length === 0) {
    return { tokens: [] };
  }

  // Validate syntax invariants
  for (let i = 0; i < tokens.length; i++) {
    const curr = tokens[i];
    const prev = tokens[i - 1];
    const next = tokens[i + 1];

    const isBinOp = (t?: Token) => t?.type === 'AND' || t?.type === 'OR' || t?.type === 'SLASH_OR';

    if (i === 0 && isBinOp(curr)) {
      return { tokens, error: `Expression cannot start with operator "${curr.value}"` };
    }
    if (i === tokens.length - 1 && isBinOp(curr)) {
      return { tokens, error: `Expression cannot end with operator "${curr.value}"` };
    }
    if (isBinOp(curr) && isBinOp(next)) {
      return { tokens, error: `Consecutive operators "${curr.value} ${next?.value}"` };
    }
    if (curr.type === 'LPAREN' && (isBinOp(next) || next?.type === 'RPAREN')) {
      return { tokens, error: `Malformed parenthesized group after "("` };
    }
    if (isBinOp(curr) && next?.type === 'RPAREN') {
      return { tokens, error: `Dangling operator "${curr.value}" before ")"` };
    }
    if (prev?.type === 'RPAREN' && curr.type === 'LPAREN') {
      return { tokens, error: `Missing operator between ")" and "("` };
    }
  }

  return { tokens };
}

/**
 * Recursive descent parser for logical requirement expressions.
 * Grammar:
 *   Expr       := AndExpr ( 'OR' AndExpr )*
 *   AndExpr    := SlashExpr ( 'AND' SlashExpr )*
 *   SlashExpr  := Primary ( '/' Primary )*
 *   Primary    := '(' Expr ')' | IDENT
 */
class ExpressionParser {
  private tokens: Token[];
  private fullLineContext: string;
  private hasExplicitBoolSyntax: boolean;
  private pos = 0;

  constructor(tokens: Token[], fullLineContext: string, hasExplicitBoolSyntax: boolean) {
    this.tokens = tokens;
    this.fullLineContext = fullLineContext;
    this.hasExplicitBoolSyntax = hasExplicitBoolSyntax;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  public parse(): LogicalExpression {
    const expr = this.parseOr();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected trailing token "${this.tokens[this.pos].value}"`);
    }
    return expr;
  }

  private parseOr(): LogicalExpression {
    let left = this.parseAnd();

    while (this.peek()?.type === 'OR') {
      this.consume(); // consume OR
      const right = this.parseAnd();
      if (left.operator === 'OR' && left.operands) {
        if (right.operator === 'OR' && right.operands) {
          left.operands.push(...right.operands);
        } else {
          left.operands.push(right);
        }
      } else {
        const rightOps = right.operator === 'OR' && right.operands ? right.operands : [right];
        left = {
          operator: 'OR',
          operands: [left, ...rightOps],
        };
      }
    }

    return left;
  }

  private parseAnd(): LogicalExpression {
    let left = this.parseSlashOr();

    while (this.peek()?.type === 'AND') {
      this.consume(); // consume AND
      const right = this.parseSlashOr();
      if (left.operator === 'AND' && left.operands) {
        if (right.operator === 'AND' && right.operands) {
          left.operands.push(...right.operands);
        } else {
          left.operands.push(right);
        }
      } else {
        const rightOps = right.operator === 'AND' && right.operands ? right.operands : [right];
        left = {
          operator: 'AND',
          operands: [left, ...rightOps],
        };
      }
    }

    return left;
  }

  private parseSlashOr(): LogicalExpression {
    let left = this.parsePrimary();

    while (this.peek()?.type === 'SLASH_OR') {
      this.consume(); // consume /
      const right = this.parsePrimary();
      if (left.operator === 'OR' && left.operands) {
        if (right.operator === 'OR' && right.operands) {
          left.operands.push(...right.operands);
        } else {
          left.operands.push(right);
        }
      } else {
        const rightOps = right.operator === 'OR' && right.operands ? right.operands : [right];
        left = {
          operator: 'OR',
          operands: [left, ...rightOps],
        };
      }
    }

    return left;
  }

  private parsePrimary(): LogicalExpression {
    const tok = this.peek();

    if (!tok) {
      throw new Error('Unexpected end of logical expression');
    }

    if (tok.type === 'LPAREN') {
      this.consume(); // consume '('
      const expr = this.parseOr();
      if (this.peek()?.type !== 'RPAREN') {
        throw new Error('Expected closing parenthesis ")"');
      }
      this.consume(); // consume ')'
      return expr;
    }

    if (tok.type === 'IDENT') {
      this.consume();
      const extracted = extractKnownSkillsFromFragment(tok.value, this.fullLineContext);
      if (extracted.length === 1) {
        return {
          operator: 'LEAF',
          skillId: extracted[0].id,
          canonical: extracted[0].canonical,
          rawText: tok.value,
        };
      }
      if (extracted.length > 1) {
        return {
          operator: 'AND',
          operands: extracted.map(s => ({
            operator: 'LEAF' as const,
            skillId: s.id,
            canonical: s.canonical,
            rawText: s.canonical,
          })),
          rawText: tok.value,
        };
      }

      if (this.hasExplicitBoolSyntax && !isPureProseFragment(tok.value)) {
        const cleaned = tok.value
          .replace(/^(?:in|with|of|for|using|on|at\s+least\s+one\s+of|any\s+one\s+of)\s+/i, '')
          .trim();
        const resolved = resolveTokenToSkillId(cleaned || tok.value);
        return {
          operator: 'LEAF',
          skillId: resolved.id,
          canonical: resolved.canonical,
          rawText: tok.value,
        };
      }

      throw new Error(`Unresolved identifier "${tok.value}"`);
    }

    throw new Error(`Unexpected token "${tok.value}"`);
  }
}

function hasBalancedParentheses(input: string): { valid: boolean; error?: string } {
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '(') depth++;
    else if (input[i] === ')') {
      depth--;
      if (depth < 0) {
        return { valid: false, error: 'Unmatched closing parenthesis ")"' };
      }
    }
  }
  if (depth !== 0) {
    return { valid: false, error: 'Unclosed opening parenthesis "("' };
  }
  if (/\(\s*\)/.test(input)) {
    return { valid: false, error: 'Empty parenthesized group "()"' };
  }
  return { valid: true };
}

function hasAnyNonAtomicSlash(input: string): boolean {
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== '/') continue;
    let tokStart = i;
    while (tokStart > 0 && !/[\s(),;]/.test(input[tokStart - 1])) tokStart--;
    let tokEnd = i + 1;
    while (tokEnd < input.length && !/[\s(),;]/.test(input[tokEnd])) tokEnd++;
    const surrounding = input.slice(tokStart, tokEnd);
    if (!isNumericRatioSlash(input, i) && !isAtomicSlashToken(surrounding)) {
      return true;
    }
  }
  return false;
}

function countKnownSkillsInExpr(expr: LogicalExpression): number {
  if (expr.operator === 'LEAF') {
    const id = expr.skillId || '';
    if (resolveCompetency(id) || ALL_TAXONOMY_SKILLS.some(s => s.id === id)) {
      return 1;
    }
    return 0;
  }
  return (expr.operands || []).reduce((sum, op) => sum + countKnownSkillsInExpr(op), 0);
}

/**
 * Formats a LogicalExpression AST into a clean canonical string (e.g. "Python OR Java OR C++ OR C#").
 */
export function formatLogicalExpression(expr: LogicalExpression): string {
  if (expr.operator === 'LEAF') {
    return expr.canonical || expr.rawText || expr.skillId || 'Unknown';
  }
  if (expr.operator === 'UNRESOLVED') {
    return expr.rawText || 'Unresolved Requirement';
  }
  const ops = expr.operands || [];
  if (ops.length === 0) return expr.rawText || '';
  if (ops.length === 1) return formatLogicalExpression(ops[0]);
  return ops
    .map(op => {
      if (op.operator !== 'LEAF' && op.operator !== expr.operator) {
        return `(${formatLogicalExpression(op)})`;
      }
      return formatLogicalExpression(op);
    })
    .join(` ${expr.operator} `);
}

/**
 * Parses a raw JD sentence or requirement line into an AST LogicalExpression.
 * - Extracts skill expressions cleanly from English preambles/suffixes
 * - Splits non-atomic compact slash alternatives (Python/Java/C++/C#, AWS/GCP/Azure) as OR
 * - Preserves atomic slash terms (CI/CD, TCP/IP, TCP/UDP, PL/SQL, UI/UX, I/O)
 * - Returns an UNRESOLVED AST on malformed parentheses or dangling operators instead of fabricating conditions
 */
export function parseLogicalRequirement(line: string): LogicalExpression | null {
  if (!line || !line.trim()) return null;
  const trimmed = line.trim().replace(/^[-*•▪●]+\s*/, '').trim();
  if (!trimmed) return null;

  // 1. Atomic known competency check (e.g. "CI/CD", "TCP/IP", "PL/SQL")
  if (
    ATOMIC_SLASH_TERMS.has(trimmed.toLowerCase()) ||
    resolveCompetency(trimmed) ||
    ALL_TAXONOMY_SKILLS.some(
      s =>
        s.id === trimmed.toLowerCase() ||
        s.canonical.toLowerCase() === trimmed.toLowerCase() ||
        s.aliases.some(a => a.toLowerCase() === trimmed.toLowerCase())
    )
  ) {
    return null;
  }

  // 2. Malformed parentheses check (must run even before operator checks)
  const parenCheck = hasBalancedParentheses(trimmed);
  if (!parenCheck.valid) {
    return {
      operator: 'UNRESOLVED',
      unresolved: true,
      parseError: parenCheck.error,
      rawText: trimmed,
    };
  }

  // 3. Detect whether the line has boolean / alternative structure
  const hasExplicitAnd = /\bAND\b|&&/.test(trimmed) || /\balongside\b/i.test(trimmed);
  const hasOr = /\bOR\b|\|\||\beither\b|\bany\s+one\s+of\b|\bat\s+least\s+one\s+of\b/i.test(trimmed) || hasAnyNonAtomicSlash(trimmed);

  // Only treat as compound if there is an OR/slash/explicit-AND/alongside/parenthesized-bool structure
  const hasParenBool = /\([^)]*(?:\bAND\b|\bOR\b|\bor\b|&&|\|\|)[^)]*\)/.test(trimmed);
  if (!hasExplicitAnd && !hasOr && !hasParenBool) {
    return null;
  }

  // Distinguish explicit boolean syntax (uppercase AND/OR, &&, ||, non-atomic /) from prose lowercase "and"/"or"
  const hasExplicitBoolSyntax =
    /\b(?:AND|OR)\b|&&|\|\|/.test(trimmed) || hasAnyNonAtomicSlash(trimmed);

  const preprocessed = preprocessExpressionLine(trimmed, trimmed);
  const rawTokens = tokenize(preprocessed);

  if (rawTokens.length === 0) {
    return hasExplicitBoolSyntax
      ? { operator: 'UNRESOLVED', unresolved: true, parseError: 'Empty boolean expression', rawText: trimmed }
      : null;
  }

  // If the line is purely prose with lowercase "and"/"or" and zero known skills (e.g., "Bachelor's or Master's degree"),
  // return null instead of fabricating skill identifiers.
  if (!hasExplicitBoolSyntax) {
    const anySkillFound = rawTokens.some(
      t => t.type === 'IDENT' && extractKnownSkillsFromFragment(t.value, trimmed).length > 0
    );
    if (!anySkillFound) {
      return null;
    }
  }

  const { tokens, error } = normalizeAndValidateTokens(rawTokens, trimmed, hasExplicitBoolSyntax);
  if (error) {
    return {
      operator: 'UNRESOLVED',
      unresolved: true,
      parseError: error,
      rawText: trimmed,
    };
  }
  if (tokens.length === 0) return null;

  try {
    const parser = new ExpressionParser(tokens, trimmed, hasExplicitBoolSyntax);
    const ast = parser.parse();

    // If lowercase prose "and"/"or" produced a LEAF (e.g. "C++ or equivalent" -> just C++),
    // or < 1 known skills overall when there wasn't explicit boolean syntax, handle cleanly:
    if (!hasExplicitBoolSyntax && countKnownSkillsInExpr(ast) === 0) {
      return null;
    }

    // If the parsed result is only a single LEAF (e.g. "Experience with Python (no alternatives)"), return null
    // so jdAnalyzer treats it as a normal single skill.
    if (ast.operator === 'LEAF') {
      return null;
    }

    ast.rawText = trimmed;
    return ast;
  } catch (err) {
    if (hasExplicitBoolSyntax) {
      return {
        operator: 'UNRESOLVED',
        unresolved: true,
        parseError: err instanceof Error ? err.message : 'Invalid logical expression syntax',
        rawText: trimmed,
      };
    }
    return null;
  }
}

/**
 * Recursively evaluates a LogicalExpression against candidate competency evaluation function.
 */
export function evaluateLogicalExpression(
  expr: LogicalExpression,
  evaluator: (skillId: string, canonical?: string) => {
    satisfied: boolean;
    status: RequirementMatchStatus;
    reason: string;
    matchedTechnology?: string;
    evidenceQuotes?: string[];
  }
): {
  satisfied: boolean;
  status: RequirementMatchStatus;
  branches: BranchEvaluation[];
  explanation: string;
} {
  if (expr.operator === 'UNRESOLVED' || expr.unresolved) {
    return {
      satisfied: false,
      status: 'AMBIGUOUS',
      branches: [],
      explanation: expr.parseError || 'Requirement expression is malformed or ambiguous and could not be resolved.',
    };
  }

  if (expr.operator === 'LEAF') {
    const skillId = expr.skillId || 'unknown';
    const evalRes = evaluator(skillId, expr.canonical);
    const branch: BranchEvaluation = {
      expression: expr.canonical || expr.rawText || skillId,
      satisfied: evalRes.satisfied,
      status: evalRes.status,
      reason: evalRes.reason,
      matchedTechnology: evalRes.matchedTechnology,
      evidenceQuotes: evalRes.evidenceQuotes,
    };
    return {
      satisfied: evalRes.satisfied,
      status: evalRes.status,
      branches: [branch],
      explanation: evalRes.reason,
    };
  }

  if (expr.operator === 'OR') {
    const branches: BranchEvaluation[] = [];
    let anySatisfied = false;
    let anyPartial = false;
    let satisfiedBranchName = '';

    for (const op of expr.operands || []) {
      const subEval = evaluateLogicalExpression(op, evaluator);
      branches.push(...subEval.branches);
      if (subEval.satisfied) {
        anySatisfied = true;
        satisfiedBranchName = subEval.branches.find(b => b.satisfied)?.matchedTechnology || op.canonical || 'alternative';
      } else if (subEval.status === 'PARTIALLY_SATISFIED') {
        anyPartial = true;
      }
    }

    if (anySatisfied) {
      return {
        satisfied: true,
        status: 'SATISFIED',
        branches,
        explanation: `Alternative requirement satisfied via: ${satisfiedBranchName}.`,
      };
    }

    if (anyPartial) {
      return {
        satisfied: false,
        status: 'PARTIALLY_SATISFIED',
        branches,
        explanation: `Alternative requirement partially met with limited scope.`,
      };
    }

    return {
      satisfied: false,
      status: 'NOT_DEMONSTRATED',
      branches,
      explanation: `None of the alternative options (${expr.operands?.map(o => o.canonical || formatLogicalExpression(o)).join(', ')}) were demonstrated.`,
    };
  }

  if (expr.operator === 'AND') {
    const branches: BranchEvaluation[] = [];
    let allSatisfied = true;
    let anyPartial = false;
    const missingBranches: string[] = [];
    const satisfiedBranches: string[] = [];

    for (const op of expr.operands || []) {
      const subEval = evaluateLogicalExpression(op, evaluator);
      branches.push(...subEval.branches);
      if (subEval.satisfied) {
        satisfiedBranches.push(op.canonical || formatLogicalExpression(op) || 'requirement');
      } else {
        allSatisfied = false;
        if (subEval.status === 'PARTIALLY_SATISFIED') {
          anyPartial = true;
        }
        missingBranches.push(op.canonical || formatLogicalExpression(op) || 'requirement');
      }
    }

    if (allSatisfied) {
      return {
        satisfied: true,
        status: 'SATISFIED',
        branches,
        explanation: `All compound requirements satisfied: ${satisfiedBranches.join(' AND ')}.`,
      };
    }

    const partialOrMissingStatus: RequirementMatchStatus =
      satisfiedBranches.length > 0 || anyPartial ? 'PARTIALLY_SATISFIED' : 'NOT_DEMONSTRATED';

    return {
      satisfied: false,
      status: partialOrMissingStatus,
      branches,
      explanation: `Compound requirement incomplete. Satisfied: [${satisfiedBranches.join(', ') || 'None'}]. Missing/insufficient: [${missingBranches.join(', ')}].`,
    };
  }

  return {
    satisfied: false,
    status: 'NOT_DEMONSTRATED',
    branches: [],
    explanation: 'Unsupported logical expression operator.',
  };
}
