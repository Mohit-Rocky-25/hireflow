import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'pages', 'candidate', 'CompanyMatch.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const targetStart = '// ── 25 Real Companies with realistic job roles and requirements ───────────────';
const targetEnd = '];\r\n\r\n// ── Simulated AI skill extraction';
const targetEndLf = '];\n\n// ── Simulated AI skill extraction';

const replacement = `// ── Dynamic Companies & Roles from Careers Data Platform ───────────────
import { careers } from '../../careers-core';

const GRADIENTS = [
  'from-blue-600 to-blue-400',
  'from-blue-500 to-cyan-400',
  'from-orange-500 to-yellow-400',
  'from-purple-600 to-pink-400',
  'from-emerald-600 to-teal-400',
  'from-rose-600 to-red-400',
  'from-indigo-600 to-violet-400',
];

const COMPANIES_DATA = careers.companies.list().map((c, idx) => {
  const roles = careers.roles.forCompany(c.id);
  const mappedRoles = roles.slice(0, 3).map((r) => ({
    title: r.title,
    skills: careers.keywords.forRole(r.id).slice(0, 5),
    type: 'Full-time',
    location: c.indiaOffices.join(' / ') || 'Bengaluru',
  }));

  return {
    id: c.id,
    name: c.name,
    logo: c.name.charAt(0).toUpperCase(),
    color: GRADIENTS[idx % GRADIENTS.length],
    industry: c.marketSegment,
    hq: c.headquarters || 'India Tech Hub',
    size: c.marketTier === 'Tier S' ? '100,000+' : c.marketTier === 'Tier A' ? '5,000+' : '10,000+',
    roles: mappedRoles.length > 0 ? mappedRoles : [
      {
        title: 'Software Engineer',
        skills: ['Data Structures', 'System Design', 'Algorithms', 'Java', 'Python'],
        type: 'Full-time',
        location: c.indiaOffices.join(' / ') || 'Bengaluru',
      },
    ],
  };
});

// ── Simulated AI skill extraction`;

const sIdx = content.indexOf(targetStart);
let eIdx = content.indexOf(targetEnd);
let len = targetEnd.length;
if (eIdx === -1) {
  eIdx = content.indexOf(targetEndLf);
  len = targetEndLf.length;
}

if (sIdx !== -1 && eIdx !== -1) {
  content = content.substring(0, sIdx) + replacement + content.substring(eIdx + len);
  // Also update description count
  content = content.replace('requirements of 25 top companies', 'requirements of top companies');
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Successfully migrated CompanyMatch.tsx to careers-core!');
} else {
  console.error('Could not find target boundaries', { sIdx, eIdx });
}
