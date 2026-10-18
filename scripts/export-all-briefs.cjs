const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const briefsPath = path.join(__dirname, '../src/data/suite/project-briefs.json');
const briefs = JSON.parse(fs.readFileSync(briefsPath, 'utf8'));

console.log(`Loaded ${briefs.length} briefs from ${briefsPath}`);

const rootDir = path.join(__dirname, '..');
const briefsDir = path.join(rootDir, 'briefs');
const downloadsDir = path.join(rootDir, 'public/downloads');

if (!fs.existsSync(briefsDir)) fs.mkdirSync(briefsDir, { recursive: true });
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

// Compute aggregate stats
const totalHours = briefs.reduce((sum, b) => sum + (b.estimatedHours || 0), 0);
const allSkills = new Set();
briefs.forEach(b => (b.coveredSkills || []).forEach(s => allSkills.add(s)));

// Group by domain
const byDomain = {};
briefs.forEach((b) => {
  if (!byDomain[b.domain]) byDomain[b.domain] = [];
  byDomain[b.domain].push(b);
});
const domains = Object.keys(byDomain).sort();

// Helper to generate slug for anchor
function makeSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ============================================================================
// 1. GENERATE MARKDOWN COMPENDIUM
// ============================================================================
let md = `# HireFlow — Complete Production Project Build Briefs Compendium

> **83 Market-Backed, Production-Grade Architecture Briefs**  
> Every brief is engineered to eliminate candidate competency gaps, provide verifiable screener proof, and produce high-signal recruiter shortlist bullets.

---

### Library Summary & Domain Matrix
- **Total Production Briefs:** ${briefs.length} Projects
- **Total Engineering Hours:** ${totalHours.toLocaleString()} hours of deep technical implementation
- **Unique Skill Gaps Covered:** ${allSkills.size} skills across 18 specialized engineering tracks
- **Target Audience:** Software Engineers, Backend Developers, Distributed Systems Engineers, Cloud/DevOps Architects, Data Engineers, and ML/AI Practitioners.

| Domain Track | Projects | Total Hours | Sample Tech Stack |
| :--- | :---: | :---: | :--- |
`;

domains.forEach((dom) => {
  const domProjects = byDomain[dom];
  const domHours = domProjects.reduce((s, p) => s + (p.estimatedHours || 0), 0);
  const sampleTech = Array.from(new Set(domProjects.flatMap(p => p.techStack || []))).slice(0, 4).join(', ');
  md += `| **${dom}** | ${domProjects.length} | ${domHours}h | \`${sampleTech}\` |\n`;
});

md += `\n---\n\n## Table of Contents\n\n`;

domains.forEach((dom) => {
  md += `### ${dom} (${byDomain[dom].length} Projects)\n`;
  byDomain[dom].forEach((b) => {
    const slug = makeSlug(b.title);
    md += `- [${b.title}](#${slug}) — *${b.difficulty.toUpperCase()} · ${b.estimatedHours}h* (Stack: ${(b.techStack || []).slice(0, 3).join(', ')})\n`;
  });
  md += '\n';
});

md += `---\n\n## Complete Project Briefs Catalog\n\n`;

briefs.forEach((b, index) => {
  const slug = makeSlug(b.title);
  md += `### <a id="${slug}"></a>${index + 1}. ${b.title}\n\n`;
  md += `| Attribute | Specification Details |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Project ID** | \`${b.id}\` |\n`;
  md += `| **Domain Track** | \`${b.domain}\` |\n`;
  md += `| **Difficulty** | \`${b.difficulty.toUpperCase()}\` |\n`;
  md += `| **Estimated Build Time** | **${b.estimatedHours} hours** |\n`;
  md += `| **Primary Tech Stack** | ${(b.techStack || []).map(t => `\`${t}\``).join(', ')} |\n`;
  md += `| **Skills Demonstrated** | ${(b.coveredSkills || []).map(s => `\`${s}\``).join(', ')} |\n\n`;

  md += `#### 1. Problem Statement\n${b.problemStatement || '—'}\n\n`;

  if (b.useCases) {
    md += `#### 2. Real-World Use Cases & Production Deployments\n${b.useCases}\n\n`;
  }

  if (b.problemItSolves) {
    md += `#### 3. Why This Is Technically Hard (Competency Reducer)\n${b.problemItSolves}\n\n`;
  }

  if (b.recruiterSignal) {
    md += `#### 4. Recruiter Shortlist Signal\n> **Hiring Manager Insight:** "${b.recruiterSignal}"\n\n`;
  }

  md += `#### 5. System Architecture & Data Flow\n\`\`\`text\n${b.architecture || '—'}\n\`\`\`\n\n`;

  md += `#### 6. Scale & Performance Targets\n> **Target Throughput / Scale:** ${b.scaleTargets || '—'}\n\n`;

  md += `#### 7. Screener Verification Rubric\n`;
  (b.verificationRubric || []).forEach((rubric, rIdx) => {
    md += `- [ ] **Verification Item ${rIdx + 1}:** ${rubric}\n`;
  });
  md += '\n';

  md += `#### 8. High-Impact Resume Portfolio Bullet Formula\n`;
  md += `\`\`\`text\n"${b.portfolioBulletFormula || ''}"\n\`\`\`\n\n`;

  md += `---\n\n`;
});

// Write Markdown files
const mdPath = path.join(rootDir, 'HIREFLOW_PROJECT_BRIEFS_COMPENDIUM.md');
const mdPublicPath = path.join(downloadsDir, 'HIREFLOW_PROJECT_BRIEFS_COMPENDIUM.md');
fs.writeFileSync(mdPath, md, 'utf8');
fs.writeFileSync(mdPublicPath, md, 'utf8');
console.log(`Saved Markdown compendium: ${mdPath} (${Buffer.byteLength(md, 'utf8')} bytes)`);

// ============================================================================
// 2. GENERATE PLAIN-TEXT MONOSPACE COMPENDIUM
// ============================================================================
let txt = `${'='.repeat(80)}
HIREFLOW — COMPLETE PRODUCTION PROJECT BRIEFS LIBRARY (83 BRIEFS)
Everything you need to build, verify, and demonstrate production-grade portfolio projects
${'='.repeat(80)}

Total Projects    : ${briefs.length}
Total Build Hours : ${totalHours} hours
Unique Skills     : ${allSkills.size}
Tracks Covered    : ${domains.length}
Generated Date    : ${new Date().toISOString()}

================================================================================
TABLE OF CONTENTS
================================================================================
`;

domains.forEach((dom) => {
  txt += `\n[ ${dom.toUpperCase()} — ${byDomain[dom].length} Projects ]\n`;
  byDomain[dom].forEach((b, idx) => {
    txt += `  ${String(idx + 1).padStart(2, ' ')}. ${b.title.padEnd(46, ' ')} [${b.difficulty.toUpperCase()} | ${b.estimatedHours}h]\n`;
  });
});

txt += `\n\n${'='.repeat(80)}\nPROJECT BRIEFS SPECIFICATIONS\n${'='.repeat(80)}\n`;

briefs.forEach((b, index) => {
  txt += `\n${'='.repeat(80)}\n`;
  txt += `PROJECT #${index + 1}: ${b.title.toUpperCase()}\n`;
  txt += `ID          : ${b.id}\n`;
  txt += `Domain      : ${b.domain}\n`;
  txt += `Difficulty  : ${b.difficulty.toUpperCase()}\n`;
  txt += `Est. Time   : ${b.estimatedHours} hours\n`;
  txt += `Tech Stack  : ${(b.techStack || []).join(', ')}\n`;
  txt += `Skills Gaps : ${(b.coveredSkills || []).join(', ')}\n`;
  txt += `${'='.repeat(80)}\n\n`;

  txt += `[1. PROBLEM STATEMENT]\n${b.problemStatement || '—'}\n\n`;

  if (b.useCases) {
    txt += `[2. REAL-WORLD USE CASES]\n${b.useCases}\n\n`;
  }

  if (b.problemItSolves) {
    txt += `[3. WHY THIS IS HARD (COMPETENCY REDUCER)]\n${b.problemItSolves}\n\n`;
  }

  if (b.recruiterSignal) {
    txt += `[4. RECRUITER SHORTLIST SIGNAL]\n${b.recruiterSignal}\n\n`;
  }

  txt += `[5. SYSTEM ARCHITECTURE & DATA FLOW]\n${b.architecture || '—'}\n\n`;
  txt += `[6. SCALE & PERFORMANCE TARGETS]\n${b.scaleTargets || '—'}\n\n`;

  txt += `[7. SCREENER VERIFICATION RUBRIC]\n`;
  (b.verificationRubric || []).forEach((r, rIdx) => {
    txt += `  [ ] ${rIdx + 1}. ${r}\n`;
  });
  txt += '\n';

  txt += `[8. HIGH-IMPACT RESUME BULLET FORMULA]\n"${b.portfolioBulletFormula || ''}"\n\n`;
  txt += `${'-'.repeat(80)}\n`;
});

const txtPath = path.join(rootDir, 'HIREFLOW_PROJECT_BRIEFS_ALL.txt');
const txtPublicPath = path.join(downloadsDir, 'HIREFLOW_PROJECT_BRIEFS_ALL.txt');
fs.writeFileSync(txtPath, txt, 'utf8');
fs.writeFileSync(txtPublicPath, txt, 'utf8');
console.log(`Saved Text compendium: ${txtPath} (${Buffer.byteLength(txt, 'utf8')} bytes)`);

// ============================================================================
// 3. GENERATE FULL JSON EXPORT
// ============================================================================
const jsonCatalog = {
  version: '1.0.0',
  title: 'HireFlow Complete Production Project Briefs Catalog',
  generatedAt: new Date().toISOString(),
  totalProjects: briefs.length,
  totalEstimatedHours: totalHours,
  uniqueSkillsCount: allSkills.size,
  domainsCount: domains.length,
  domains: domains.map(dom => ({
    name: dom,
    projectCount: byDomain[dom].length,
    estimatedHours: byDomain[dom].reduce((s, p) => s + (p.estimatedHours || 0), 0)
  })),
  briefs: briefs
};
const jsonContent = JSON.stringify(jsonCatalog, null, 2);
const jsonPath = path.join(rootDir, 'HIREFLOW_PROJECT_BRIEFS_CATALOG.json');
const jsonPublicPath = path.join(downloadsDir, 'HIREFLOW_PROJECT_BRIEFS_CATALOG.json');
fs.writeFileSync(jsonPath, jsonContent, 'utf8');
fs.writeFileSync(jsonPublicPath, jsonContent, 'utf8');
console.log(`Saved JSON catalog: ${jsonPath} (${Buffer.byteLength(jsonContent, 'utf8')} bytes)`);

// ============================================================================
// 4. WRITE INDIVIDUAL .TXT BRIEFS IN briefs/ FOLDER
// ============================================================================
function buildIndividualBriefText(brief) {
  return [
    `PROJECT BRIEF — ${brief.title.toUpperCase()}`,
    `${'='.repeat(70)}`,
    ``,
    `Project ID  : ${brief.id}`,
    `Domain      : ${brief.domain}`,
    `Difficulty  : ${String(brief.difficulty).toUpperCase()}`,
    `Est. Time   : ${brief.estimatedHours} hours`,
    `Tech Stack  : ${(brief.techStack || []).join(', ')}`,
    `Covered Gaps: ${(brief.coveredSkills || []).join(', ')}`,
    ``,
    `1. PROBLEM STATEMENT`,
    `----------------------------------------------------------------------`,
    brief.problemStatement || '—',
    ``,
    `2. REAL-WORLD USE CASES`,
    `----------------------------------------------------------------------`,
    brief.useCases || '—',
    ``,
    `3. WHY THIS IS HARD (COMPETENCY REDUCER)`,
    `----------------------------------------------------------------------`,
    brief.problemItSolves || '—',
    ``,
    `4. RECRUITER SHORTLIST SIGNAL`,
    `----------------------------------------------------------------------`,
    brief.recruiterSignal || '—',
    ``,
    `5. ARCHITECTURE & DATA FLOW`,
    `----------------------------------------------------------------------`,
    brief.architecture || '—',
    ``,
    `6. SCALE & PERFORMANCE TARGETS`,
    `----------------------------------------------------------------------`,
    brief.scaleTargets || '—',
    ``,
    `7. SCREENER VERIFICATION RUBRIC`,
    `----------------------------------------------------------------------`,
    (brief.verificationRubric || []).map((r, i) => `[ ] ${i + 1}. ${r}`).join('\n'),
    ``,
    `8. RESUME PORTFOLIO BULLET FORMULA`,
    `----------------------------------------------------------------------`,
    `"${brief.portfolioBulletFormula || ''}"`,
    ``,
    `${'-'.repeat(70)}`,
    `Generated by HireFlow — ATS Resume Engine & Decision Suite (hireflow.io)`,
    ``,
  ].join('\n');
}

let writtenIndividual = 0;
for (const b of briefs) {
  const filename = `${b.id}.txt`;
  fs.writeFileSync(path.join(briefsDir, filename), buildIndividualBriefText(b), 'utf8');
  writtenIndividual++;
}
console.log(`Refreshed ${writtenIndividual} individual brief text files in ${briefsDir}`);

// ============================================================================
// 5. GENERATE ZIP ARCHIVE (HIREFLOW_ALL_BRIEFS.zip)
// ============================================================================
const zip = new JSZip();

// Add top-level compendiums into zip
zip.file('HIREFLOW_PROJECT_BRIEFS_COMPENDIUM.md', md);
zip.file('HIREFLOW_PROJECT_BRIEFS_ALL.txt', txt);
zip.file('HIREFLOW_PROJECT_BRIEFS_CATALOG.json', jsonContent);

// Add README inside zip
const readmeInsideZip = `# HireFlow All Project Briefs Archive
Contains all ${briefs.length} production project build briefs across 18 engineering domains.

Included files:
- HIREFLOW_PROJECT_BRIEFS_COMPENDIUM.md : Full Markdown compendium with index and tables
- HIREFLOW_PROJECT_BRIEFS_ALL.txt       : Plain text compendium for terminal or text editors
- HIREFLOW_PROJECT_BRIEFS_CATALOG.json  : Complete machine-readable JSON dataset
- individual-briefs/                    : Folder containing ${briefs.length} individual brief .txt files

Generated by HireFlow (hireflow.io).
`;
zip.file('README.txt', readmeInsideZip);

// Add individual briefs in a subfolder inside the zip
const indFolder = zip.folder('individual-briefs');
for (const b of briefs) {
  indFolder.file(`${b.id}.txt`, buildIndividualBriefText(b));
}

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
  .then((buffer) => {
    const zipPath = path.join(rootDir, 'HIREFLOW_ALL_BRIEFS.zip');
    const zipPublicPath = path.join(downloadsDir, 'HIREFLOW_ALL_BRIEFS.zip');
    fs.writeFileSync(zipPath, buffer);
    fs.writeFileSync(zipPublicPath, buffer);
    console.log(`Saved ZIP archive: ${zipPath} (${buffer.length} bytes)`);
    console.log(`Copied ZIP archive to public downloads: ${zipPublicPath}`);
    console.log(`ALL 83 BRIEFS EXPORTED SUCCESSFULLY!`);
  })
  .catch((err) => {
    console.error('Error generating zip archive:', err);
    process.exit(1);
  });
