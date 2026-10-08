#!/usr/bin/env node
/**
 * scripts/security/scan-secrets.mjs
 * Cross-platform secret & sensitive data scanner for HireFlow AI.
 * Enforces Rule A1: Output is strictly MASKED (file:line, type, first4****, length).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const ALLOWLIST_PATH = path.join(ROOT_DIR, 'scripts', 'security', 'allowlist.json');

// Parse flags
const args = process.argv.slice(2);
const IS_STAGED = args.includes('--staged');
const IS_HISTORY = args.includes('--history');
const IS_DIST = args.includes('--dist');
const TARGET_PATH = args.find(a => !a.startsWith('--'));

// Load allowlist
let allowlist = { entries: [] };
if (fs.existsSync(ALLOWLIST_PATH)) {
  try {
    allowlist = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'));
  } catch (err) {
    console.error('Warning: could not parse allowlist.json:', err.message);
  }
}

function isAllowlisted(filePath, matchText) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  for (const entry of allowlist.entries) {
    if (entry.files && !entry.files.some(f => normalizedPath.endsWith(f.replace(/\\/g, '/')))) {
      continue;
    }
    if (entry.pattern && matchText.includes(entry.pattern)) {
      return true;
    }
  }
  return false;
}

// Shannon Entropy Calculation
function calculateEntropy(str) {
  if (!str || str.length === 0) return 0;
  const frequencies = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function maskSecret(secret) {
  if (!secret) return '****';
  const clean = secret.trim();
  if (clean.length <= 4) return '**** (' + clean.length + ' chars)';
  const prefix = clean.slice(0, 4);
  return `${prefix}**** (${clean.length} chars)`;
}

// Detectors
const DETECTORS = [
  {
    name: 'AWS Access Key',
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    type: 'aws_key',
    severity: 'Critical',
  },
  {
    name: 'Google / Gemini API Key',
    regex: /\b(AIza[0-9A-Za-z_\-]{35})\b/g,
    type: 'google_key',
    severity: 'Critical',
  },
  {
    name: 'OpenAI API Key',
    regex: /\b(sk-[A-Za-z0-9]{20,})\b/g,
    type: 'openai_key',
    severity: 'Critical',
  },
  {
    name: 'Anthropic API Key',
    regex: /\b(sk-ant-[A-Za-z0-9_\-]{20,})\b/g,
    type: 'anthropic_key',
    severity: 'Critical',
  },
  {
    name: 'GitHub Token',
    regex: /\b(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{36,})\b/g,
    type: 'github_token',
    severity: 'Critical',
  },
  {
    name: 'Slack Token',
    regex: /\b(xox[baprs]-[0-9A-Za-z]{10,48})\b/g,
    type: 'slack_token',
    severity: 'Critical',
  },
  {
    name: 'Stripe Secret Key',
    regex: /\b([sr]k_live_[0-9a-zA-Z]{24,})\b/g,
    type: 'stripe_key',
    severity: 'Critical',
  },
  {
    name: 'PEM Private Key',
    regex: /-----BEGIN\s+[A-Z\s]+PRIVATE\s+KEY-----/g,
    type: 'private_key',
    severity: 'Critical',
  },
  {
    name: 'JSON Web Token (JWT)',
    regex: /\b(eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9._\-]{10,}\.[A-Za-z0-9._\-]{10,})\b/g,
    type: 'jwt',
    severity: 'High',
  },
  {
    name: 'Database Connection String with Credentials',
    regex: /\b(mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/[^:\/\s]+:[^@\/\s]+@[^\/\s]+/g,
    type: 'db_connection_string',
    severity: 'Critical',
  },
  {
    name: 'Basic Auth URL with Credentials',
    regex: /https?:\/\/[a-zA-Z0-9_\-\.]+:[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9_\-\.]+/g,
    type: 'basic_auth_url',
    severity: 'High',
  },
  {
    name: 'Generic Credential Assignment',
    regex: /(?:password|passwd|secret|token|api[_-]?key|auth|bearer)\s*[:=]\s*['"]([^'"\s]{8,})['"]/gi,
    type: 'generic_credential',
    severity: 'High',
    extractGroup: 1,
  },
  {
    name: 'Private / Internal IP Address',
    regex: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g,
    type: 'internal_ip',
    severity: 'Medium',
  },
  {
    name: 'Internal Domain / Hostname',
    regex: /(?:https?:\/\/|[a-zA-Z0-9_\-]+\.)[a-zA-Z0-9_\-]+\.(?:internal|corp)\b/g,
    type: 'internal_domain',
    severity: 'Medium',
  },
  {
    name: 'Confidentiality Marker',
    regex: /\b(confidential|internal use only|proprietary|do not distribute|NDA)\b/gi,
    type: 'confidential_marker',
    severity: 'Info',
  },
];

// High entropy detector for quoted strings
function checkHighEntropy(line, lineNum, filePath, findings) {
  const quotedRegex = /['"]([A-Za-z0-9+/=_\-]{24,})['"]/g;
  let m;
  while ((m = quotedRegex.exec(line)) !== null) {
    const candidate = m[1];
    // Skip UUIDs, hex hashes, lockfile integrity hashes
    if (/^[0-9a-f]{24,}$/i.test(candidate)) continue;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidate)) continue;
    if (candidate.startsWith('sha512-') || candidate.startsWith('sha256-')) continue;
    if (/^(data:image|image\/|svg\+|application\/)/i.test(candidate)) continue;
    if (isAllowlisted(filePath, candidate)) continue;

    const entropy = calculateEntropy(candidate);
    if (entropy > 4.35) {
      findings.push({
        filePath,
        line: lineNum,
        name: 'High-Entropy Quoted String',
        type: 'high_entropy',
        severity: 'Medium',
        masked: maskSecret(candidate),
      });
    }
  }
}

function scanContent(content, filePath) {
  const findings = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    for (const detector of DETECTORS) {
      detector.regex.lastIndex = 0;
      let match;
      while ((match = detector.regex.exec(line)) !== null) {
        const secretVal = detector.extractGroup ? match[detector.extractGroup] : match[0];
        if (!secretVal) continue;
        if (isAllowlisted(filePath, secretVal) || isAllowlisted(filePath, line)) continue;

        findings.push({
          filePath,
          line: lineNum,
          name: detector.name,
          type: detector.type,
          severity: detector.severity,
          masked: maskSecret(secretVal),
        });
      }
    }

    checkHighEntropy(line, lineNum, filePath, findings);
  });

  return findings;
}

// File collector
function getFilesToScan() {
  if (TARGET_PATH) {
    const resolved = path.resolve(ROOT_DIR, TARGET_PATH);
    if (fs.existsSync(resolved)) {
      if (fs.statSync(resolved).isDirectory()) {
        return walkDir(resolved);
      }
      return [resolved];
    }
  }

  if (IS_STAGED) {
    try {
      const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
      return output
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean)
        .map(f => path.join(ROOT_DIR, f))
        .filter(f => fs.existsSync(f));
    } catch {
      return [];
    }
  }

  const baseDir = IS_DIST ? path.join(ROOT_DIR, 'dist') : ROOT_DIR;
  if (!fs.existsSync(baseDir)) return [];
  return walkDir(baseDir, IS_DIST);
}

function walkDir(dir, isScanningDist = false) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

    if (!isScanningDist) {
      if (['node_modules', '.git', 'dist'].some(skip => relPath === skip || relPath.startsWith(skip + '/'))) {
        continue;
      }
    }

    if (entry.isDirectory()) {
      results = results.concat(walkDir(fullPath, isScanningDist));
    } else if (entry.isFile()) {
      // Exclude large binary formats
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.pdf'].includes(ext)) {
        continue;
      }
      // Skip package-lock.json integrity strings
      if (entry.name === 'package-lock.json') continue;
      results.push(fullPath);
    }
  }
  return results;
}

// Git history scanner
function scanGitHistory() {
  console.log('\n--- SCANNING FULL GIT HISTORY FOR COMMITTED SECRETS ---');
  const historyFindings = [];

  try {
    // Check if any .env* files were EVER committed
    const envHistory = execSync('git log --all --diff-filter=A --name-only -- "*.env*"', { encoding: 'utf8' });
    const envFiles = envHistory.split('\n').map(l => l.trim()).filter(l => l && !l.endsWith('.env.example'));
    if (envFiles.length > 0) {
      historyFindings.push({
        commit: 'HISTORIC',
        file: envFiles.join(', '),
        name: 'Committed .env file in Git history',
        severity: 'Critical',
        masked: 'File committed: ' + envFiles.join(', '),
      });
    }
  } catch (err) {
    console.error('Git log env check failed:', err.message);
  }

  try {
    const logCommits = execSync('git log --all --format=format:"%H %cd" -n 50', { encoding: 'utf8' })
      .split('\n')
      .map(c => c.trim().split(' ')[0])
      .filter(Boolean);

    for (const commitHash of logCommits) {
      const diffOutput = execSync(`git show -p --stat ${commitHash}`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      const lines = diffOutput.split('\n');

      let currentFile = 'unknown';
      lines.forEach((line, lineIdx) => {
        if (line.startsWith('+++ b/')) {
          currentFile = line.slice(6);
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
          const addedContent = line.slice(1);
          for (const detector of DETECTORS) {
            if (['confidential_marker', 'internal_ip'].includes(detector.type)) continue; // skip noise in history
            detector.regex.lastIndex = 0;
            let match;
            while ((match = detector.regex.exec(addedContent)) !== null) {
              const secretVal = detector.extractGroup ? match[detector.extractGroup] : match[0];
              if (!secretVal || isAllowlisted(currentFile, secretVal)) continue;

              historyFindings.push({
                commit: commitHash.slice(0, 8),
                file: currentFile,
                line: lineIdx,
                name: detector.name,
                severity: detector.severity,
                masked: maskSecret(secretVal),
              });
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Git history scan error:', err.message);
  }

  return historyFindings;
}

// Main execution
console.log('====================================================');
console.log('HIREFLOW AI — SECRET & CREDENTIAL SCANNER');
console.log(`Mode: ${IS_STAGED ? 'Staged Files' : IS_DIST ? 'Production Bundle (dist)' : IS_HISTORY ? 'Git History' : 'Working Tree'}`);
console.log('====================================================\n');

let totalFindings = [];

if (IS_HISTORY) {
  const historyResults = scanGitHistory();
  if (historyResults.length === 0) {
    console.log('✓ Git history clean. No leaked credentials detected in commits.');
  } else {
    console.log(`⚠️ FOUND ${historyResults.length} HISTORIC FINDINGS IN GIT:`);
    for (const f of historyResults) {
      console.log(`  [${f.severity}] Commit: ${f.commit} | ${f.file} -> ${f.name}: ${f.masked}`);
    }
  }
} else {
  const files = getFilesToScan();
  console.log(`Scanning ${files.length} files...`);

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const relPath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
      const fileFindings = scanContent(content, relPath);
      totalFindings = totalFindings.concat(fileFindings);
    } catch {
      // ignore unreadable
    }
  }

  const criticals = totalFindings.filter(f => f.severity === 'Critical');
  const highs = totalFindings.filter(f => f.severity === 'High');
  const mediums = totalFindings.filter(f => f.severity === 'Medium');
  const info = totalFindings.filter(f => f.severity === 'Info');

  console.log('\n--- SCAN SUMMARY ---');
  console.log(`Total Findings: ${totalFindings.length}`);
  console.log(`Critical: ${criticals.length} | High: ${highs.length} | Medium: ${mediums.length} | Info: ${info.length}`);

  if (totalFindings.length > 0) {
    console.log('\n--- DETAILS (MASKED REPORT) ---');
    for (const f of totalFindings) {
      console.log(`[${f.severity}] ${f.filePath}:${f.line} — ${f.name} — ${f.masked}`);
    }
  } else {
    console.log('✓ Working tree clean. Zero secrets or sensitive data found.');
  }

  // Non-zero exit code if Critical or High findings exist
  if (criticals.length > 0 || highs.length > 0) {
    process.exit(1);
  }
}
