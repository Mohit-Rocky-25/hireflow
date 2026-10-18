const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const mdPath = path.join(rootDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.md');
const md = fs.readFileSync(mdPath, 'utf8');

function markdownToHtml(markdown) {
  const lines = markdown.split('\n');
  let html = '';
  let inCode = false;
  let codeLang = '';
  let inTable = false;
  let inList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html += '</code></pre>\n';
        inCode = false;
      } else {
        codeLang = line.trim().slice(3);
        html += `<pre><code class="language-${codeLang}">`;
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      html += line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
      continue;
    }

    // Tables
    if (line.trim().startsWith('|')) {
      if (!inTable) {
        html += '<table>\n';
        inTable = true;
        // Header row
        const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        html += '<thead><tr>' + cells.map(c => `<th>${formatInline(c.trim())}</th>`).join('') + '</tr></thead>\n<tbody>\n';
        // Skip separator row if next
        if (lines[i + 1] && lines[i + 1].trim().startsWith('|') && lines[i + 1].includes('---')) {
          i++;
        }
        continue;
      } else {
        const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        html += '<tr>' + cells.map(c => `<td>${formatInline(c.trim())}</td>`).join('') + '</tr>\n';
        continue;
      }
    } else if (inTable) {
      html += '</tbody></table>\n';
      inTable = false;
    }

    // Unordered lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      html += `<li>${formatInline(line.trim().slice(2))}</li>\n`;
      continue;
    } else if (inList && !line.trim().startsWith('- ') && !line.trim().startsWith('* ') && line.trim() !== '') {
      html += '</ul>\n';
      inList = false;
    }

    // Ordered lists
    const olMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (!inOrderedList) {
        html += '<ol>\n';
        inOrderedList = true;
      }
      html += `<li>${formatInline(olMatch[2])}</li>\n`;
      continue;
    } else if (inOrderedList && !olMatch && line.trim() !== '') {
      html += '</ol>\n';
      inOrderedList = false;
    }

    // Close lists on empty lines
    if (line.trim() === '') {
      if (inList) { html += '</ul>\n'; inList = false; }
      if (inOrderedList) { html += '</ol>\n'; inOrderedList = false; }
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      html += `<h1>${formatInline(line.slice(2))}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2>${formatInline(line.slice(3))}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      html += `<h3>${formatInline(line.slice(4))}</h3>\n`;
      continue;
    }
    if (line.startsWith('#### ')) {
      html += `<h4>${formatInline(line.slice(5))}</h4>\n`;
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      html += '<hr />\n';
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      html += `<blockquote>${formatInline(line.slice(2))}</blockquote>\n`;
      continue;
    }

    // Paragraph
    html += `<p>${formatInline(line)}</p>\n`;
  }

  if (inTable) html += '</tbody></table>\n';
  if (inList) html += '</ul>\n';
  if (inOrderedList) html += '</ol>\n';
  if (inCode) html += '</code></pre>\n';

  return html;
}

function formatInline(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
}

const bodyHtml = markdownToHtml(md);

const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HireFlow — Complete Comprehensive Context Brief</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 18mm 18mm 18mm;
      @bottom-right {
        content: counter(page);
      }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #1f2937;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2pt solid #2563eb;
      padding-bottom: 6pt;
      margin-top: 0;
      margin-bottom: 12pt;
      page-break-after: avoid;
    }
    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1pt solid #e2e8f0;
      padding-bottom: 4pt;
      margin-top: 18pt;
      margin-bottom: 8pt;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 14pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    h4 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #334155;
      margin-top: 10pt;
      margin-bottom: 4pt;
      page-break-after: avoid;
    }
    p {
      margin-top: 0;
      margin-bottom: 8pt;
    }
    blockquote {
      border-left: 3pt solid #3b82f6;
      background: #f8fafc;
      padding: 6pt 12pt;
      margin: 8pt 0;
      color: #334155;
      font-size: 9.5pt;
      border-radius: 0 4pt 4pt 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 5pt 7pt;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #0f172a;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 8pt 10pt;
      border-radius: 4pt;
      font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
      font-size: 8pt;
      line-height: 1.45;
      overflow-x: auto;
      margin: 8pt 0;
      page-break-inside: avoid;
    }
    code {
      font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 1pt 3pt;
      border-radius: 3pt;
      border: 1px solid #e2e8f0;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 8pt;
      padding-left: 18pt;
    }
    li {
      margin-bottom: 3pt;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 16pt 0;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    .header-box {
      background: #f0fdf4;
      border: 1px solid #86efac;
      padding: 8pt 12pt;
      border-radius: 6pt;
      margin-bottom: 14pt;
      font-size: 9pt;
      color: #166534;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <strong>HIREFLOW ENTERPRISE SPECIFICATION & CONTEXT BRIEF</strong> &bull; Version 2.4.0 &bull; Generated: ${new Date().toLocaleDateString()}
  </div>
  ${bodyHtml}
</body>
</html>`;

const tempHtmlPath = path.join(rootDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF_PRINT.html');
fs.writeFileSync(tempHtmlPath, completeHtml, 'utf8');

const outputPdf = path.join(rootDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.pdf');
const publicPdf = path.join(rootDir, 'public/downloads/HIREFLOW_COMPLETE_CONTEXT_BRIEF.pdf');
const userDownloadsPdf = 'C:/Users/yadav/Downloads/HIREFLOW_COMPLETE_CONTEXT_BRIEF.pdf';

const chromePath = 'C:\\Program Files\\Google\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

console.log('Rendering PDF using:', browserExe);

const cmd = `"${browserExe}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outputPdf}" "${tempHtmlPath}"`;

try {
  execSync(cmd, { stdio: 'pipe' });
  console.log('Successfully generated master PDF:', outputPdf);
  console.log('Size:', fs.statSync(outputPdf).size, 'bytes');

  // Copy to public/downloads and user's Downloads folder
  fs.copyFileSync(outputPdf, publicPdf);
  fs.copyFileSync(outputPdf, userDownloadsPdf);
  console.log('Copied PDF to:');
  console.log('- public/downloads/HIREFLOW_COMPLETE_CONTEXT_BRIEF.pdf');
  console.log('- C:/Users/yadav/Downloads/HIREFLOW_COMPLETE_CONTEXT_BRIEF.pdf');

  // Also clean up temp HTML
  if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
} catch (e) {
  console.error('Error generating PDF:', e.message);
  process.exit(1);
}
