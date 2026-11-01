import fs from 'fs';
import path from 'path';

const target = 'data-talentlens-D577XVz7.js';
const files = [
  'careers-core-DAZLewCp.js',
  'CareersContext-By7eXC0w.js',
  'CompanyLogo-Di2PZmIU.js',
  'DataProvenanceModal-BRwwP4NX.js',
  'PublicNavbar-CKC6MkQl.js',
  'vendor-charts-BeboddxR.js',
  'vendor-react-DV_oTaQ-.js'
];

for (const f of files) {
  const p = path.join('dist/assets', f);
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    if (c.includes(target)) {
      console.log('YES! Chunks that import target:', f);
    }
  }
}

