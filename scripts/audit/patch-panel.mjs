import fs from 'fs';

const panelPath = 'src/features/reach-out/components/TemplateInputsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');
content = content.replace(
  "onChangeSlot('primary_skill', comp.roles[0].competencies.slice(0, 3).join(', '));",
  "onChangeSlot('primary_skill', (comp.roles[0].competencies || []).slice(0, 3).join(', '));"
);
fs.writeFileSync(panelPath, content, 'utf8');
console.log('Fixed optional competencies access in TemplateInputsPanel.tsx');

