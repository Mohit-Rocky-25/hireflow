const fs = require('fs');
let s = fs.readFileSync('src/lib/tailor/export/layoutSentinel.ts', 'utf8');

const badBlock = `  } else {
    densityStatus = 'page_overflow';
    recommendations.push(\`Content spills ~\${Math.ceil(overflowPx / 20)} line(s) onto page \${estimatedPages}. Click Auto-Fit 1P to compress layout.\`);
  }`;

s = s.replace(badBlock, '');
// If line endings are CRLF:
s = s.replace(/\r?\n\s*\}\s*else\s*\{\r?\n\s*densityStatus = 'page_overflow';\r?\n\s*recommendations\.push\(`Content spills.*?`\);\r?\n\s*\}/s, '');

fs.writeFileSync('src/lib/tailor/export/layoutSentinel.ts', s);
console.log('Fixed layoutSentinel.ts duplicate block');
