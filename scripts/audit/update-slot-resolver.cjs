const fs = require('fs');
let content = fs.readFileSync('src/features/reach-out/engine/slotResolver.ts', 'utf8');
content = content.replace(
  'Proof point lacks a concrete metric or number (e.g. 45% latency, 10k users, 200ms).',
  'Proof point works best with a concrete metric, repository link, or clear technical achievement (e.g., 200ms latency, or GitHub repo link).'
);
content = content.replace(
  'Tip: Adding quantified metrics or scale numbers can boost recruiter response rates.',
  'Tip: Where available, concrete metrics or repository links give recipients verifiable technical substance.'
);
fs.writeFileSync('src/features/reach-out/engine/slotResolver.ts', content, 'utf8');
console.log('slotResolver updated successfully');
