import fs from 'fs';

const existing = JSON.parse(fs.readFileSync('src/data/suite/project-briefs.json', 'utf8'));

console.log('Total existing briefs:', existing.length);
existing.forEach((b, i) => {
  console.log(`${i+1}. [${b.id}] (${b.difficulty}, ${b.estimatedHours}h, ${b.domain}) ${b.title}`);
});

