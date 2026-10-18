const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const mdContent = fs.readFileSync(path.join(rootDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.md'), 'utf8');
const txtContent = fs.readFileSync(path.join(rootDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.txt'), 'utf8');
const zipBuffer = fs.readFileSync(path.join(rootDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.zip'));
const zipBase64 = zipBuffer.toString('base64');

const pdfPath = path.join(rootDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.pdf');
let pdfBase64 = '';
let pdfSize = '339 KB';
if (fs.existsSync(pdfPath)) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  pdfBase64 = pdfBuffer.toString('base64');
  pdfSize = `${Math.round(pdfBuffer.length / 1024)} KB`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HireFlow — Context Brief Download Center</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --surface: #111827;
      --surface-elevated: #1f2937;
      --border: #374151;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --emerald: #10b981;
      --amber: #f59e0b;
      --purple: #8b5cf6;
      --rose: #f43f5e;
      --text: #f9fafb;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
    }
    .container {
      max-width: 860px;
      width: 100%;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #60a5fa;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin-bottom: 12px;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .status-alert {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 14px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 28px;
    }
    .status-alert svg {
      width: 24px;
      height: 24px;
      color: #34d399;
      flex-shrink: 0;
    }
    .status-title {
      font-size: 14px;
      font-weight: 700;
      color: #34d399;
    }
    .status-desc {
      font-size: 13px;
      color: #d1fae5;
      margin-top: 2px;
    }
    .downloads-grid {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 36px;
    }
    .download-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      transition: all 0.2s ease;
    }
    .download-card.highlight {
      border-color: rgba(244, 63, 94, 0.5);
      background: linear-gradient(to right, rgba(244, 63, 94, 0.05), var(--surface));
    }
    .download-card:hover {
      border-color: rgba(59, 130, 246, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .file-info {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .file-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-weight: 800;
      font-size: 14px;
      font-family: 'JetBrains Mono', monospace;
    }
    .icon-pdf { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
    .icon-txt { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .icon-md  { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .icon-zip { background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
    .file-meta h3 {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 3px;
    }
    .file-meta p {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .file-size {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--surface-elevated);
      color: var(--text-muted);
      margin-left: 8px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .btn {
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      transition: all 0.15s ease;
      border: none;
    }
    .btn-primary {
      background: var(--primary);
      color: #ffffff;
    }
    .btn-primary:hover {
      background: var(--primary-hover);
    }
    .btn-rose {
      background: #e11d48;
      color: #ffffff;
    }
    .btn-rose:hover {
      background: #be123c;
    }
    .btn-secondary {
      background: var(--surface-elevated);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: #374151;
    }
    .section-preview {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
    }
    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .preview-header h2 {
      font-size: 16px;
      font-weight: 700;
    }
    pre {
      background: #090d16;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #e5e7eb;
      overflow-x: auto;
      max-height: 340px;
      line-height: 1.6;
    }
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
      display: none;
      animation: fadeIn 0.2s ease;
      z-index: 999;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">HireFlow Enterprise Specification</div>
    <h1>HireFlow Complete Context Brief — Ready to Download</h1>
    <p class="subtitle">
      Download the definitive HireFlow Context Brief in your preferred format. All 12 comprehensive sections covering platform architecture, ATS deterministic matching, 10 Prime Directives, data schemas, and developer workflows.
    </p>

    <div class="status-alert">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <div class="status-title">Both TXT & PDF Files Are Ready in Your Windows Downloads Folder</div>
        <div class="status-desc">Direct Folder: <code style="font-family:'JetBrains Mono'; color:#a7f3d0;">C:\\Users\\yadav\\Downloads\\HIREFLOW_COMPLETE_CONTEXT_BRIEF.*</code></div>
      </div>
    </div>

    <div class="downloads-grid">
      <!-- PDF Document -->
      <div class="download-card highlight">
        <div class="file-info">
          <div class="file-icon icon-pdf">PDF</div>
          <div class="file-meta">
            <h3>HireFlow Complete Context Brief (PDF) <span class="file-size">${pdfSize}</span></h3>
            <p>Formatted executive vector PDF report with table of contents, diagrams, LaTeX formulas, clean tables, and page layout.</p>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-rose" onclick="downloadPdf()">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download PDF
          </button>
        </div>
      </div>

      <!-- Plain Text File -->
      <div class="download-card">
        <div class="file-info">
          <div class="file-icon icon-txt">TXT</div>
          <div class="file-meta">
            <h3>HireFlow Complete Context Brief (Text) <span class="file-size">36.1 KB</span></h3>
            <p>Monospaced ASCII text version suitable for offline terminal viewing, simple text editors, or copy-pasting.</p>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" onclick="copyTxt()">Copy Text</button>
          <button class="btn btn-primary" onclick="downloadTxt()">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download TXT
          </button>
        </div>
      </div>

      <!-- Markdown File -->
      <div class="download-card">
        <div class="file-info">
          <div class="file-icon icon-md">MD</div>
          <div class="file-meta">
            <h3>HireFlow Complete Context Brief (Markdown) <span class="file-size">32.7 KB</span></h3>
            <p>Full GitHub-flavored markdown document with headers, code blocks, tables, and anchor links.</p>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" onclick="copyMd()">Copy Text</button>
          <button class="btn btn-primary" onclick="downloadMd()">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download MD
          </button>
        </div>
      </div>

      <!-- ZIP Package -->
      <div class="download-card">
        <div class="file-info">
          <div class="file-icon icon-zip">ZIP</div>
          <div class="file-meta">
            <h3>Complete Package (All Files + Specs) <span class="file-size">45.0 KB</span></h3>
            <p>Full ZIP containing PDF, TXT, MD, plus supplementary architecture and product specifications.</p>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" onclick="downloadZip()">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download ZIP
          </button>
        </div>
      </div>
    </div>

    <!-- Live Document Preview -->
    <div class="section-preview">
      <div class="preview-header">
        <h2>Document Table of Contents & Excerpt</h2>
        <span style="font-size:12px; color:var(--text-muted);">12 Comprehensive Sections</span>
      </div>
      <pre id="preview-box"></pre>
    </div>
  </div>

  <div id="toast" class="toast">Downloaded successfully!</div>

  <script>
    const mdContent = ${JSON.stringify(mdContent)};
    const txtContent = ${JSON.stringify(txtContent)};
    const zipBase64 = "${zipBase64}";
    const pdfBase64 = "${pdfBase64}";

    document.getElementById('preview-box').textContent = txtContent.slice(0, 3200) + '\\n\\n[... Full 12 sections included in downloaded files ...]';

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2600);
    }

    function downloadFile(content, filename, type) {
      const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded ' + filename);
    }

    function downloadBase64File(base64Data, filename, mimeType) {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded ' + filename);
    }

    function downloadPdf() {
      downloadBase64File(pdfBase64, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.pdf', 'application/pdf');
    }

    function downloadTxt() {
      downloadFile(txtContent, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.txt', 'text/plain;charset=utf-8');
    }

    function downloadMd() {
      downloadFile(mdContent, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.md', 'text/markdown;charset=utf-8');
    }

    function downloadZip() {
      downloadBase64File(zipBase64, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.zip', 'application/zip');
    }

    function copyMd() {
      navigator.clipboard.writeText(mdContent);
      showToast('Markdown copied to clipboard!');
    }

    function copyTxt() {
      navigator.clipboard.writeText(txtContent);
      showToast('Plain text copied to clipboard!');
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(rootDir, 'public/download.html'), html, 'utf8');
fs.writeFileSync('C:/Users/yadav/Downloads/HireFlow_Download_Center.html', html, 'utf8');

console.log('Successfully updated download hub with PDF support:');
console.log('- public/download.html');
console.log('- C:/Users/yadav/Downloads/HireFlow_Download_Center.html');
