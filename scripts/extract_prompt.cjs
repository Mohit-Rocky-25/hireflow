const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/yadav/.gemini/antigravity-ide/brain/048e6bf6-bc4f-4d3e-8ec4-d6d22d474939/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  const d = JSON.parse(line);
  if (d.step_index === 10697) {
    fs.writeFileSync('docs/companies-100/mission_prompt.txt', d.content, 'utf8');
    console.log('Written mission_prompt.txt, length:', d.content.length);
    process.exit(0);
  }
});
