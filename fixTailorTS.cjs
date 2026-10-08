const fs = require('fs');
let text = fs.readFileSync('src/features/suite/tailor/TailorResumePage.tsx', 'utf8');

text = text.replace('const res = tailorResume(resumeText, jdText, profile);', 'const res = tailorResume(resumeText, jdText, new Set<string>());');

text = text.replace(
  `// Default all rephrase and add_context to 'accepted' initially
        const initialStatus: Record<string, 'accepted' | 'rejected' | 'edited'> = {};
        res.suggestions.forEach((s) => {
          initialStatus[s.id] = 'accepted';
        });`,
  `// Default all to pending initially
        const initialStatus: Record<string, 'pending' | 'accepted' | 'rejected' | 'edited'> = {};
        res.suggestions.forEach((s) => {
          initialStatus[s.id] = 'pending';
        });`
);

fs.writeFileSync('src/features/suite/tailor/TailorResumePage.tsx', text);
