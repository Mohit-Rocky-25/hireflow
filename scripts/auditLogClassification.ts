import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

export interface LogArgAudit {
  line: number;
  excerpt: string;
  classification: 'COMPUTED' | 'STATIC LABEL' | 'STATIC CLAIM';
  reason?: string;
}

// Banned static claim patterns
const STATIC_DIGIT_PATTERN = /\b\d+\b/;
const STATIC_VERDICT_PATTERN = /\b(?:PASS|FAIL)\b/;
const STATIC_BANNED_WORDS = /\b(?:None|structurally intact|verified)\b/i;
const STATIC_STANDALONE_PERCENT = /(?<!\$\{[^}]*)\b\d+\s*%/;

function findStaticClaimInLiteralText(text: string): string | null {
  const digitMatch = text.match(STATIC_DIGIT_PATTERN);
  if (digitMatch) return `digit "${digitMatch[0]}"`;

  const verdictMatch = text.match(STATIC_VERDICT_PATTERN);
  if (verdictMatch) return `verdict "${verdictMatch[0]}"`;

  const wordMatch = text.match(STATIC_BANNED_WORDS);
  if (wordMatch) return `banned claim word "${wordMatch[0]}"`;

  const pctMatch = text.match(STATIC_STANDALONE_PERCENT);
  if (pctMatch) return `hardcoded percentage "${pctMatch[0]}"`;

  return null;
}

export function classifyLogArgument(node: ts.Expression, sourceFile: ts.SourceFile): LogArgAudit {
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const fullText = node.getText(sourceFile);
  const excerpt = fullText.length > 80 ? fullText.slice(0, 77) + '...' : fullText;

  // Case 1: Simple String Literal
  if (ts.isStringLiteral(node)) {
    const claim = findStaticClaimInLiteralText(node.text);
    if (claim) {
      return { line: line + 1, excerpt, classification: 'STATIC CLAIM', reason: `Literal contains ${claim}` };
    }
    return { line: line + 1, excerpt, classification: 'STATIC LABEL' };
  }

  // Case 2: No-substitution template literal (e.g. `=== SECTION ===`)
  if (ts.isNoSubstitutionTemplateLiteral(node)) {
    const claim = findStaticClaimInLiteralText(node.text);
    if (claim) {
      return { line: line + 1, excerpt, classification: 'STATIC CLAIM', reason: `Template literal contains ${claim}` };
    }
    return { line: line + 1, excerpt, classification: 'STATIC LABEL' };
  }

  // Case 3: Template Expression with substitutions `${...}`
  if (ts.isTemplateExpression(node)) {
    // Check static parts: head, and each template span's literal text
    const staticParts: { text: string; pos: string }[] = [{ text: node.head.text, pos: 'head' }];
    for (const span of node.templateSpans) {
      staticParts.push({ text: span.literal.text, pos: 'span' });
    }

    for (const part of staticParts) {
      const claim = findStaticClaimInLiteralText(part.text);
      if (claim) {
        return {
          line: line + 1,
          excerpt,
          classification: 'STATIC CLAIM',
          reason: `Template static text contains ${claim}`,
        };
      }
    }

    // Static portions contain no hardcoded digits, verdicts, or banned claims
    return { line: line + 1, excerpt, classification: 'COMPUTED' };
  }

  // Case 4: Binary expression concatenation (e.g. 'a' + b)
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    let foundClaim: string | null = null;
    function checkBinary(binNode: ts.Expression) {
      if (ts.isBinaryExpression(binNode) && binNode.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        checkBinary(binNode.left);
        checkBinary(binNode.right);
      } else if (ts.isStringLiteral(binNode) || ts.isNoSubstitutionTemplateLiteral(binNode)) {
        const claim = findStaticClaimInLiteralText(binNode.text);
        if (claim) foundClaim = claim;
      }
    }
    checkBinary(node);

    if (foundClaim) {
      return {
        line: line + 1,
        excerpt,
        classification: 'STATIC CLAIM',
        reason: `Concatenation static text contains ${foundClaim}`,
      };
    }
    return { line: line + 1, excerpt, classification: 'COMPUTED' };
  }

  // Case 5: Identifier, CallExpression, PropertyAccess, ElementAccess
  if (
    ts.isIdentifier(node) ||
    ts.isCallExpression(node) ||
    ts.isPropertyAccessExpression(node) ||
    ts.isElementAccessExpression(node)
  ) {
    return { line: line + 1, excerpt, classification: 'COMPUTED' };
  }

  // Fallback
  const fallbackClaim = findStaticClaimInLiteralText(fullText);
  if (fallbackClaim) {
    return { line: line + 1, excerpt, classification: 'STATIC CLAIM', reason: `Contains ${fallbackClaim}` };
  }
  return { line: line + 1, excerpt, classification: 'COMPUTED' };
}

export function auditScript(filePath: string): LogArgAudit[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  const results: LogArgAudit[] = [];

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      if (
        ts.isPropertyAccessExpression(expr) &&
        ts.isIdentifier(expr.expression) &&
        expr.expression.text === 'console' &&
        expr.name.text === 'log'
      ) {
        for (const arg of node.arguments) {
          results.push(classifyLogArgument(arg, sourceFile));
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return results;
}

if (process.argv[1]?.includes('auditLogClassification')) {
  const targetFile = process.argv[2] || path.join(process.cwd(), 'scripts', 'verifyTalentLens.ts');
  const results = auditScript(targetFile);

  const computed = results.filter((r) => r.classification === 'COMPUTED');
  const label = results.filter((r) => r.classification === 'STATIC LABEL');
  const claim = results.filter((r) => r.classification === 'STATIC CLAIM');

  console.log(`Audited: ${targetFile}`);
  console.log(`Total console.log arguments: ${results.length}`);
  console.log(`  COMPUTED    : ${computed.length}`);
  console.log(`  STATIC LABEL: ${label.length}`);
  console.log(`  STATIC CLAIM: ${claim.length}`);

  if (claim.length > 0) {
    console.log(`\nSTATIC CLAIMS FOUND (${claim.length}):`);
    claim.forEach((c) => {
      console.log(`  Line ${c.line}: [${c.classification}] ${c.excerpt} — ${c.reason}`);
    });
  }
}
