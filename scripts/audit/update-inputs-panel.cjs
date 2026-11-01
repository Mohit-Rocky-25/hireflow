const fs = require('fs');

const path = 'src/features/reach-out/components/TemplateInputsPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add handleAutoTrim definition
const autoTrimDef = `
  // Auto-trim helper for LinkedIn 300-char enforcement
  const handleAutoTrim = () => {
    if (slots.proof_point) {
      let trimmed = slots.proof_point
        .replace(/\\b(responsible for|worked on|in order to|helped to|actively|successfully|currently)\\b\\s*/gi, '')
        .replace(/\\s+/g, ' ')
        .trim();
      const excess = readiness.charCount - 295;
      if (excess > 0 && trimmed.length > excess + 10) {
        trimmed = trimmed.slice(0, trimmed.length - excess).replace(/[,\\s]+$/, '').trim();
      }
      onChangeSlot('proof_point', trimmed);
    } else if (slots.personal_line) {
      const excess = readiness.charCount - 295;
      if (excess > 0 && slots.personal_line.length > excess + 5) {
        const trimmed = slots.personal_line.slice(0, slots.personal_line.length - excess).replace(/[,\\s]+$/, '').trim();
        onChangeSlot('personal_line', trimmed);
      }
    }
  };
`;

// Insert autoTrimDef before personalLineHints
content = content.replace('  // 3 Hints for personal_line', autoTrimDef + '\n  // 3 Hints for personal_line');

// Add the auto-trim button to the length meter
const targetMeter = `              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={\`h-full transition-all \${
                    readiness.charCount > activeCharLimit
                      ? 'bg-rose-500'
                      : readiness.charCount > activeCharLimit * 0.85
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }\`}
                  style={{
                    width: \`\${Math.min(100, (readiness.charCount / activeCharLimit) * 100)}%\`,
                  }}
                />
              </div>
            </div>`;

const replacementMeter = `              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={\`h-full transition-all \${
                    readiness.charCount > 300 || readiness.charCount > activeCharLimit
                      ? 'bg-rose-500'
                      : readiness.charCount > activeCharLimit * 0.85
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }\`}
                  style={{
                    width: \`\${Math.min(100, (readiness.charCount / activeCharLimit) * 100)}%\`,
                  }}
                />
              </div>

              {readiness.charCount > 300 && (
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-800/80">
                  <span className="text-[11px] text-rose-400 font-medium">
                    Over 300-char limit
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoTrim}
                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-[11px] font-semibold transition-colors"
                    title="Trim non-essential words while keeping core pitch"
                  >
                    Auto-trim to 300 chars
                  </button>
                </div>
              )}
            </div>`;

content = content.replace(targetMeter, replacementMeter);

fs.writeFileSync(path, content, 'utf8');
console.log('TemplateInputsPanel.tsx updated successfully');

