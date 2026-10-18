const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const rootDir = path.resolve(__dirname, '..');
const mdPath = path.join(rootDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.md');
const md = fs.readFileSync(mdPath, 'utf8');

// Generate monospaced, formatted plain text version
let txt = `================================================================================
HIREFLOW — COMPLETE COMPREHENSIVE CONTEXT BRIEF
The Definitive System Architecture, Product Specification & Operational Encyclopedia
Version: 2.4.0 · Production Ready · Privacy-First Client-Side Architecture
Generated: ${new Date().toISOString()}
================================================================================

`;

// Clean up markdown markers for plain text readability
const cleanTxt = md
  .replace(/^# (.*$)/gim, '\n================================================================================\n$1\n================================================================================')
  .replace(/^## (.*$)/gim, '\n--------------------------------------------------------------------------------\n$1\n--------------------------------------------------------------------------------')
  .replace(/^### (.*$)/gim, '\n[ $1 ]\n')
  .replace(/^#### (.*$)/gim, '\n* $1\n')
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/\*(.*?)\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');

txt += cleanTxt;

const txtPath = path.join(rootDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.txt');
fs.writeFileSync(txtPath, txt, 'utf8');

const downloadsDir = path.join(rootDir, 'public/downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

fs.copyFileSync(mdPath, path.join(downloadsDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.md'));
fs.copyFileSync(txtPath, path.join(downloadsDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.txt'));

// Create a dedicated ZIP archive containing all context documents
const zip = new JSZip();
zip.file('HIREFLOW_COMPLETE_CONTEXT_BRIEF.md', md);
zip.file('HIREFLOW_COMPLETE_CONTEXT_BRIEF.txt', txt);

// Include supplementary spec files for complete coverage
const specFiles = [
  'PRODUCT_SPEC.md',
  'ARCHITECTURE.md',
  'DECISIONS.md',
  'IMPLEMENTATION_PLAN.md',
  'DATA_DICTIONARY.md',
  'DATA_SOURCES.md',
  'METRICS_SPEC.md',
  'KNOWLEDGE_BASE_SPEC.md',
  'SECURITY_AND_PRIVACY.md',
  'README.md'
];

const specsFolder = zip.folder('supplementary-specs');
for (const file of specFiles) {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    specsFolder.file(file, fs.readFileSync(filePath, 'utf8'));
  }
}

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
  .then((buffer) => {
    const zipPath = path.join(rootDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.zip');
    const zipPublicPath = path.join(downloadsDir, 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.zip');
    fs.writeFileSync(zipPath, buffer);
    fs.writeFileSync(zipPublicPath, buffer);

    console.log('Successfully generated complete context brief suite:');
    console.log('- Markdown:', mdPath, `(${fs.statSync(mdPath).size} bytes)`);
    console.log('- Plain Text:', txtPath, `(${fs.statSync(txtPath).size} bytes)`);
    console.log('- ZIP Package:', zipPath, `(${buffer.length} bytes)`);
    console.log('- Public Downloads Folder:', downloadsDir);
  })
  .catch((err) => {
    console.error('Failed to generate context zip:', err);
    process.exit(1);
  });
