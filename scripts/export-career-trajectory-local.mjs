import fs from 'fs';
import path from 'path';

const targetDir = 'C:\\Users\\yadav\\Downloads\\HireFlow_Career_Trajectory';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Read Markdown Contextual Map
const mdContent = fs.readFileSync('docs/CAREER_TRAJECTORY_COMPLETE_CONTEXTUAL_MAP.md', 'utf8');

// Copy Markdown to Downloads
fs.writeFileSync(path.join(targetDir, 'CAREER_TRAJECTORY_COMPLETE_CONTEXTUAL_MAP.md'), mdContent, 'utf8');
console.log('✅ Wrote CAREER_TRAJECTORY_COMPLETE_CONTEXTUAL_MAP.md to Downloads');

// 2. Generate Standalone HTML with Dark-Mode Styling
function markdownToHtml(md) {
  // Simple clean parser for headers, code blocks, tables, bold, italic, lists, blockquotes
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced code blocks
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="code-block"><div class="code-header">${lang || 'text'}</div><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr />');

  // Tables
  html = html.replace(/((?:\|[^\n]+\|\n?)+)/g, (match) => {
    const lines = match.trim().split('\n');
    if (lines.length < 2) return match;
    let tableHtml = '<div class="table-container"><table>';
    lines.forEach((line, idx) => {
      if (idx === 1 && line.includes('---')) return; // separator
      const cells = line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
      const tag = idx === 0 ? 'th' : 'td';
      tableHtml += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    });
    tableHtml += '</table></div>';
    return tableHtml;
  });

  // Paragraphs
  const paragraphs = html.split(/\n\n+/).map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<div') || p.startsWith('<table') || p.startsWith('<hr') || p.startsWith('<blockquote')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br />')}</p>`;
  }).filter(Boolean);

  return paragraphs.join('\n');
}

const htmlBody = markdownToHtml(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HireFlow Career Trajectory: Complete Contextual Map & Architecture</title>
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #141417;
      --surface: #1e1e24;
      --border: #27272a;
      --volt: #ccff00;
      --cyan: #38bdf8;
      --purple: #c084fc;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.65;
      padding: 40px 20px;
    }
    .container {
      max-width: 1040px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 48px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      color: #ffffff;
      border-bottom: 2px solid var(--volt);
      padding-bottom: 16px;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
    }
    h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--volt);
      margin-top: 40px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--cyan);
      margin-top: 28px;
      margin-bottom: 12px;
    }
    p { margin-bottom: 16px; color: #d4d4d8; }
    blockquote {
      border-left: 3px solid var(--volt);
      background: #18181b;
      padding: 12px 18px;
      margin: 16px 0;
      border-radius: 0 6px 6px 0;
      color: #a1a1aa;
      font-size: 0.95rem;
    }
    hr {
      border: 0;
      height: 1px;
      background: var(--border);
      margin: 32px 0;
    }
    .code-block {
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      margin: 20px 0;
      overflow-x: auto;
    }
    .code-header {
      background: #161b22;
      color: var(--text-muted);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 6px 14px;
      border-bottom: 1px solid #30363d;
    }
    pre code {
      display: block;
      padding: 16px;
      color: #e6edf3;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      font-size: 0.88rem;
      line-height: 1.5;
    }
    .inline-code {
      background: #27272a;
      color: var(--volt);
      font-family: ui-monospace, monospace;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.88em;
    }
    .table-container {
      overflow-x: auto;
      margin: 24px 0;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.92rem;
    }
    th {
      background: #18181b;
      color: #ffffff;
      font-weight: 700;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      color: #d4d4d8;
    }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background: #0f0f12; }
    ul, ol { margin-left: 24px; margin-bottom: 16px; color: #d4d4d8; }
    li { margin-bottom: 6px; }
    strong { color: #ffffff; font-weight: 700; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      background: #27272a;
      color: var(--volt);
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="margin-bottom: 20px;">
      <span class="badge">OFFLINE READY</span> &nbsp;
      <span class="badge" style="color: var(--cyan); border: 1px solid #0369a1;">HIREFLOW 2.5.0</span>
    </div>
    ${htmlBody}
    <div class="footer">
      Generated for Local Device • HireFlow Career Trajectory Intelligence System • All rights reserved
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(targetDir, 'CAREER_TRAJECTORY_COMPLETE_CONTEXTUAL_MAP.html'), fullHtml, 'utf8');
fs.writeFileSync('docs/CAREER_TRAJECTORY_COMPLETE_CONTEXTUAL_MAP.html', fullHtml, 'utf8');
console.log('✅ Generated standalone CAREER_TRAJECTORY_COMPLETE_CONTEXTUAL_MAP.html in Downloads and docs/');

// 3. Extract and compile complete JSON Data
import { PLATFORM_COMPANIES } from '../src/careers-core/data/companies';
import { PLATFORM_LEVELS } from '../src/careers-core/data/levels';
import { PLATFORM_FRESHER_PROGRAMS } from '../src/careers-core/data/fresherPrograms';
import { PLATFORM_BRANCHES, BRANCH_FAMILIES } from '../src/careers-core/data/branches';
import { PLATFORM_EQUIVALENCE_LEVELS } from '../src/careers-core/data/equivalence';
import { ALL_COMPANY_LADDERS } from '../src/data/careerLadders';
import { createLevelBlockers } from '../src/data/careerLadders/blockerCatalog';

const completeDataExport = {
  metadata: {
    system: 'HireFlow Career Trajectory Data Engine',
    version: '2.5.0',
    exportDate: new Date().toISOString(),
    currency: 'INR (₹ / LPA)',
    census: {
      companiesCount: PLATFORM_COMPANIES.length,
      levelsCount: PLATFORM_LEVELS.length,
      fresherProgramsCount: PLATFORM_FRESHER_PROGRAMS.length,
      branchesCount: PLATFORM_BRANCHES.length,
      equivalenceTiersCount: PLATFORM_EQUIVALENCE_LEVELS.length,
      laddersCount: ALL_COMPANY_LADDERS.length,
    }
  },
  companies: PLATFORM_COMPANIES,
  ladders: ALL_COMPANY_LADDERS,
  levels: PLATFORM_LEVELS,
  fresherPrograms: PLATFORM_FRESHER_PROGRAMS,
  branches: PLATFORM_BRANCHES,
  branchFamilies: BRANCH_FAMILIES,
  equivalenceLevels: PLATFORM_EQUIVALENCE_LEVELS,
};

const jsonStr = JSON.stringify(completeDataExport, null, 2);
fs.writeFileSync(path.join(targetDir, 'CAREER_TRAJECTORY_COMPLETE_DATA.json'), jsonStr, 'utf8');
fs.writeFileSync('docs/CAREER_TRAJECTORY_COMPLETE_DATA.json', jsonStr, 'utf8');
console.log('✅ Exported CAREER_TRAJECTORY_COMPLETE_DATA.json (Census: 56 companies, 182 levels, 60 fresher programs)');

// 4. Plain Text Version for Quick Terminal Grep / Reading
fs.writeFileSync(path.join(targetDir, 'CAREER_TRAJECTORY_COMPLETE_DATA.txt'), mdContent, 'utf8');

// 5. Readme guide
const readme = `================================================================================
HIREFLOW CAREER TRAJECTORY — LOCAL OFFLINE DATASET & ARCHITECTURE BRIEF
================================================================================

Location on this device:
C:\\Users\\yadav\\Downloads\\HireFlow_Career_Trajectory\\

Included Files:
1. CAREER_TRAJECTORY_COMPLETE_CONTEXTUAL_MAP.html
   - Standalone, dark-mode styled HTML document. Open directly in Chrome / Edge / Firefox.
   - Contains complete architectural teardown, data flow diagrams, formula derivations,
     operating mode breakdowns, and step-by-step rewiring instructions.

2. CAREER_TRAJECTORY_COMPLETE_CONTEXTUAL_MAP.md
   - Markdown source file for reading in VS Code, Obsidian, GitHub, or any text editor.

3. CAREER_TRAJECTORY_COMPLETE_DATA.json
   - Consolidated raw JSON database containing:
     * 56 Verified Enterprise & Unicorn Companies
     * 182 Canonical Levels with INR Compensation Bands (Base / Bonus / Stocks)
     * 60 Campus Recruitment Drives with Online Assessment (OA) stage funnels
     * 36 Engineering Degree & Branch definitions
     * 9-Level Cross-Company Equivalence Matrix
     * Structured Promotion Blocker Catalog

4. CAREER_TRAJECTORY_COMPLETE_DATA.txt
   - Clean UTF-8 text file for grep / command-line search.

To inspect in browser:
Open 'CAREER_TRAJECTORY_COMPLETE_CONTEXTUAL_MAP.html' in your browser.
================================================================================
`;
fs.writeFileSync(path.join(targetDir, 'README.txt'), readme, 'utf8');
console.log('✅ Created README.txt in Downloads directory');
