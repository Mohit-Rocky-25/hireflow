import fs from 'fs';

const vitePath = 'vite.config.ts';
let content = fs.readFileSync(vitePath, 'utf8');

const oldManualChunks = `        manualChunks(id) {
          if (id.includes('talentLensData')) {
            return 'data-talentlens';
          }
          if (id.includes('node_modules')) {`;

const newManualChunks = `        manualChunks(id) {
          if (id.includes('talentLensData')) {
            return 'data-talentlens';
          }
          if (id.includes('companyCatalog')) {
            return 'data-company-catalog';
          }
          if (id.includes('data/ats') || id.includes('scoring/spec')) {
            return 'ats-taxonomy';
          }
          if (id.includes('node_modules')) {`;

content = content.replace(oldManualChunks, newManualChunks);
fs.writeFileSync(vitePath, content, 'utf8');
console.log('Updated vite.config.ts manualChunks');

