const fs = require('fs');
let s = fs.readFileSync('src/features/ats/components/ScoreHeader.tsx', 'utf8');

s = s.replace(
  /const cautionText = 'Simulation estimate: no employer sees this number; real ATS software does not publish universal scores\xb7?\.?';?/,
  "const cautionText = 'Score is based on a local rule-based engine that simulates keyword and structure screening. Real ATS systems differ by employer, vendor, and role. This score is a directional signal, not a guarantee.';"
);

fs.writeFileSync('src/features/ats/components/ScoreHeader.tsx', s);
console.log('Updated ScoreHeader cautionText');

