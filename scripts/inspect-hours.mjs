import fs from 'fs';

const existing = JSON.parse(fs.readFileSync('src/data/suite/project-briefs.json', 'utf8'));

const hours28 = existing.filter(b => b.estimatedHours === 28);
const hours40 = existing.filter(b => b.estimatedHours === 40);

console.log('28h briefs count:', hours28.length);
hours28.forEach(b => console.log(`  '${b.id}': 28, // ${b.title}`));

console.log('\n40h briefs count:', hours40.length);
hours40.forEach(b => console.log(`  '${b.id}': 40, // ${b.title}`));

