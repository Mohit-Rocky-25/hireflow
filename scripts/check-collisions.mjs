import fs from 'fs';
import path from 'path';

const existing = JSON.parse(fs.readFileSync('src/data/suite/project-briefs.json', 'utf8'));

const dir = 'scripts/briefs-builder';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let allNew = [];
for (const file of files) {
  const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  allNew.push(...content);
}

console.log('Existing count:', existing.length);
console.log('New count:', allNew.length);

const existingTitles = new Set(existing.map(b => b.title.trim().toLowerCase()));
const existingIds = new Set(existing.map(b => b.id.trim().toLowerCase()));

let collisionCount = 0;
allNew.forEach(b => {
  const normTitle = b.title.trim().toLowerCase();
  const normId = b.id.trim().toLowerCase();
  if (existingTitles.has(normTitle)) {
    console.log('Title collision with existing:', b.title);
    collisionCount++;
  }
  if (existingIds.has(normId)) {
    console.log('ID collision with existing:', b.id);
    collisionCount++;
  }
});

console.log('Collisions between existing and new:', collisionCount);

