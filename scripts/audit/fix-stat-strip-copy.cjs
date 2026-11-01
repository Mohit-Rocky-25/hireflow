#!/usr/bin/env node
// Fix over-marketed stat strip copy in MatchingDemo.tsx and CompanyRolesPage.tsx
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../../');

const files = [
  'src/pages/demo/MatchingDemo.tsx',
  'src/pages/demo/CompanyRolesPage.tsx',
];

const replacements = [
  // "Verified Employers" -> plain wording
  [/label: "Verified Employers"/, 'label: "Employer Profiles"'],
  [/label: 'Verified Employers'/, "label: 'Employer Profiles'"],
  // sub line
  [/sub: "Tier-S FAANG, Tier-A Unicorns \u0026 Cybersecurity"/, 'sub: "FAANG, unicorns and cybersecurity firms (static catalogue, Oct 2026)"'],
  [/sub: 'Tier-S FAANG, Tier-A Unicorns \u0026 Cybersecurity'/, "sub: 'FAANG, unicorns and cybersecurity firms (static catalogue, Oct 2026)'"],
  // Calibrated Roles label
  [/label: "Calibrated Roles"/, 'label: "Role Listings"'],
  [/label: 'Calibrated Roles'/, "label: 'Role Listings'"],
  // Calibrated Roles sub
  [/sub: "10\+ verified career tracks per employer"/, 'sub: "Representative career tracks based on public job postings"'],
  [/sub: '10\+ verified career tracks per employer'/, "sub: 'Representative career tracks based on public job postings'"],
  // Authenticity Guard
  [/label: "Authenticity Guard"/, 'label: "Offline Analysis"'],
  [/label: 'Authenticity Guard'/, "label: 'Offline Analysis'"],
  [/sub: "Structural parser \u0026 anti-gaming verification"/, 'sub: "All analysis runs locally in your browser — no data leaves your device"'],
  [/sub: 'Structural parser \u0026 anti-gaming verification'/, "sub: 'All analysis runs locally in your browser — no data leaves your device'"],
  // 100% Deterministic Math
  [/value: "100%"/, 'value: "Local"'],
  [/value: '100%'/, "value: 'Local'"],
  [/label: "Deterministic Math"/, 'label: "Deterministic Scoring"'],
  [/label: 'Deterministic Math'/, "label: 'Deterministic Scoring'"],
  [/sub: "Single source of truth with zero random drift"/, 'sub: "Rule-based scoring with no ML randomness — same input always yields the same score"'],
  [/sub: 'Single source of truth with zero random drift'/, "sub: 'Rule-based scoring with no ML randomness — same input always yields the same score'"],
  // tag: Calibrated Roles -> Role Listings
  [/tag: "Calibrated Roles"/, 'tag: "Role Listings"'],
  [/tag: 'Calibrated Roles'/, "tag: 'Role Listings'"],
  // tag: Zero-Egress Security -> Zero Egress
  [/tag: "Zero-Egress Security"/, 'tag: "Zero Egress"'],
  [/tag: 'Zero-Egress Security'/, "tag: 'Zero Egress'"],
  // tag: Candidate Intelligence -> Scoring
  [/tag: "Candidate Intelligence"/, 'tag: "Scoring"'],
  [/tag: 'Candidate Intelligence'/, "tag: 'Scoring'"],
];

for (const file of files) {
  const filePath = path.join(root, file);
  let src = fs.readFileSync(filePath, 'utf8');
  const original = src;
  for (const [pattern, replacement] of replacements) {
    src = src.replace(pattern, replacement);
  }
  fs.writeFileSync(filePath, src);
  const changed = src !== original;
  console.log(`${changed ? '✓' : '–'} ${file}`);
}

console.log('\nStat strip copy cleaned.');

