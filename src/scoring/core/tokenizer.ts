// ============================================================
// HireFlow Scoring Suite — Pure Tokenizer & Boundary-Safe Matcher
// Handles single-letter and short tokens (C, Go, R, C#, C++, .NET)
// Zero I/O, pure deterministic string analysis.
// ============================================================

import { TokenMatchResult } from './types';

/**
 * Escapes regex special characters in a string
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Searches for a skill/token in text with strict boundaries and language-specific safeguards.
 * Never matches substrings (e.g. 'Go' never matches 'Google' or 'go live').
 */
export function matchTokenInText(
  token: string,
  text: string,
  isSkillsSection: boolean = false
): TokenMatchResult {
  if (!token || !text) {
    return { found: false };
  }

  const tokenLower = token.trim().toLowerCase();

  // 1. Special Language: C
  if (tokenLower === 'c') {
    // Avoid Class C, Vitamin C, California CA, etc.
    const cRegex = /(?:(?:^|[\s,;|/([\]])C(?=[\s,;|/)\].]|$))|(?:C\s*\/\s*C\+\+)|(?:C\s*,\s*C\+\+)|(?:\bC\s+programming\b)|(?:\bANSI\s+C\b)|(?:\bC\s+language\b)/g;
    for (const match of text.matchAll(cRegex)) {
      if (match.index !== undefined) {
        const start = Math.max(0, match.index - 20);
        const end = Math.min(text.length, match.index + match[0].length + 20);
        const window = text.substring(start, end);
        if (
          !window.includes(', CA') &&
          !window.includes('California') &&
          !window.includes('Class C') &&
          !window.includes('Vitamin C')
        ) {
          return { found: true, matchedToken: 'C' };
        }
      }
    }
    return { found: false };
  }

  // 2. Special Language: Go / Golang
  if (tokenLower === 'go' || tokenLower === 'golang') {
    if (/\bGolang\b/i.test(text)) {
      return { found: true, matchedToken: 'Golang' };
    }
    const goRegex = /(?:(?:^|[\s,;/|([\]])Go(?=[\s,;/|)\].]|$))|(?:\bGo\s+(?:language|developer|backend|microservice|service|goroutine|code|SDK)\b)|(?:\b(?:in|with|using|wrote|built\s+in)\s+go\b)/gi;
    for (const match of text.matchAll(goRegex)) {
      if (match.index !== undefined) {
        const start = Math.max(0, match.index - 10);
        const end = Math.min(text.length, match.index + match[0].length + 25);
        const window = text.substring(start, end);
        // Exclude colloquial English "go to", "go live", "go ahead", etc. unless preceded by technical preposition "in/using/with Go"
        const hasTechPreposition = /\b(?:in|using|with|wrote|built\s+in)\s+Go\b/i.test(window);
        const isColloquial = /\bGo\s+(?:through|to|for|ahead|live|on|over|back|beyond)\b/i.test(window);
        if (!isColloquial || hasTechPreposition) {
          return { found: true, matchedToken: 'Go' };
        }
      }
    }
    return { found: false };
  }

  // 3. Special Language: R
  if (tokenLower === 'r') {
    const rRegex = /(?:(?:^|[\s,;/|([\]])R(?=[\s,;/|)\].]|$))|(?:\bR\s+(?:programming|language|package|Shiny)\b)|(?:\bGNU\s+R\b)/g;
    for (const match of text.matchAll(rRegex)) {
      if (match.index !== undefined) {
        const start = Math.max(0, match.index - 15);
        const end = Math.min(text.length, match.index + match[0].length + 15);
        const window = text.substring(start, end);
        if (
          !window.includes('R&D') &&
          !window.includes('R-rated') &&
          !window.includes('Round')
        ) {
          if (isSkillsSection || /programming|language|package|shiny|gnu/i.test(window)) {
            return { found: true, matchedToken: 'R' };
          }
        }
      }
    }
    return { found: false };
  }

  // 4. Special Language: C# / CSharp
  if (tokenLower === 'c#' || tokenLower === 'csharp' || tokenLower === 'c-sharp') {
    const csharpRegex = /(?:(?:^|[\s,;/|([\]])C#(?:[\s,;/|)\].]|$))|(?:\bCSharp\b)|(?:\bC#\.NET\b)/i;
    if (csharpRegex.test(text)) {
      return { found: true, matchedToken: 'C#' };
    }
    return { found: false };
  }

  // 5. Special Language: C++ / CPP
  if (tokenLower === 'c++' || tokenLower === 'cpp') {
    const cppRegex = /(?:(?:^|[\s,;/|([\]])C\+\+(?:[\s,;/|)\].]|$))|(?:\bCPP\b)|(?:\bC\s*\/\s*C\+\+)/i;
    if (cppRegex.test(text)) {
      return { found: true, matchedToken: 'C++' };
    }
    return { found: false };
  }

  // 6. Special Platform: .NET / DotNet
  if (tokenLower === '.net' || tokenLower === 'dotnet') {
    const dotnetRegex = /(?:(?:^|[\s,;/|([\]])\.NET\b)|(?:\bDotNet\b)|(?:\bASP\.NET\b)/i;
    if (dotnetRegex.test(text)) {
      return { found: true, matchedToken: '.NET' };
    }
    return { found: false };
  }

  // 7. Special Platform: Node.js / NodeJS
  if (tokenLower === 'node.js' || tokenLower === 'nodejs' || tokenLower === 'node') {
    const nodeRegex = /(?:\bNode\.js\b)|(?:\bNodeJS\b)|(?:\bNode\s+runtime\b)|(?:\bNode\s+backend\b)/i;
    if (nodeRegex.test(text)) {
      return { found: true, matchedToken: 'Node.js' };
    }
    if (isSkillsSection && /\bNode\b/.test(text)) {
      return { found: true, matchedToken: 'Node.js' };
    }
    return { found: false };
  }

  // 8. Special Language: Java (exclude JavaScript)
  if (tokenLower === 'java') {
    const javaRegex = /\bJava\b(?!\s*script)/i;
    if (javaRegex.test(text)) {
      return { found: true, matchedToken: 'Java' };
    }
    return { found: false };
  }

  // 9. General token with word boundary
  const escaped = escapeRegex(token);
  const generalRegex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`, 'i');
  if (generalRegex.test(text)) {
    return { found: true, matchedToken: token.length <= 40 ? token : token.substring(0, 40) };
  }

  return { found: false };
}

/**
 * Convenient boundary-safe matching alias accepting (text, token).
 */
export function matchesTokenSafely(text: string, token: string): TokenMatchResult {
  return matchTokenInText(token, text);
}
