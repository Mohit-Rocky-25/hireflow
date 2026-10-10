const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'src/pages/tools/ResumeChecker.tsx');
let content = fs.readFileSync(file, 'utf8');

// Find start and end indices of the div
const startIndex = content.indexOf('{/* Quick Load Campus Hiring Target Selector */}');
const endString = '            </div>\n\n            <AtsInputSection';
const endIndex = content.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex + 14); // skipping '            </div>\n\n'
  fs.writeFileSync(file, content);
  console.log('Removed Quick Load UI');
} else {
  console.log('Could not find boundaries: ', startIndex, endIndex);
}
