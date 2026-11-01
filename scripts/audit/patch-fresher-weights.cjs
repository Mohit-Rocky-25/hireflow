const fs = require('fs');
let s = fs.readFileSync('src/features/ats/engine/scorer.ts', 'utf8');

// Replace lines 51 with fresher weight redistribution
s = s.replace(
  /const activeWeights = weights;/,
  `const isFresher = candidateYears <= 1;
  const activeWeights = isFresher
    ? {
        ...weights,
        seniorityFit: 0,
        projectsAndOss: weights.projectsAndOss + 5,
        evidenceDepth: weights.evidenceDepth + 5,
      }
    : weights;`
);

// In format and parse, avoid duplicate isFresher declaration
s = s.replace(
  /const isFresher = candidateYears <= 1;\r?\n\s*const standardSections = isFresher \?/,
  'const standardSections = isFresher ?'
);

fs.writeFileSync('src/features/ats/engine/scorer.ts', s);
console.log('Updated scorer.ts with fresher weight redistribution');
