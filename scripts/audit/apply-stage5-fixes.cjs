const fs = require('fs');

// 1. Update src/engine/tailor/truthGate.ts to support Indian metric formats
let tg = fs.readFileSync('src/engine/tailor/truthGate.ts', 'utf8');
tg = tg.replace(
  /const METRIC_OR_NUMBER_REGEX = .*?;/,
  "const METRIC_OR_NUMBER_REGEX = /\\b(?:\\d+(?:\\.\\d+)?%|\\$\\d+(?:\\.\\d+)?|₹\\d+(?:,\\d+)*(?:\\.\\d+)?|Rs\\.?\\s*\\d+(?:,\\d+)*(?:\\.\\d+)?|\\d+(?:,\\d+)*(?:\\.\\d+)?\\s*(?:ms|s|sec|seconds|users|k|m|requests?|req\\/s|qps|rps|tps|gb|tb|mb|₹|\\$|lpa|lakh|lakhs|crore|crores|cr|stars|lines|records|queries))\\b|\\b\\d{1,2}(?:,\\d{2})*,\\d{3}\\b|\\b\\d{2,}\\b/gi;"
);
fs.writeFileSync('src/engine/tailor/truthGate.ts', tg);
console.log('✓ truthGate.ts updated with Indian numbering & currency regex');

// 2. Update src/lib/tailor/export/layoutSentinel.ts to support targetPages: 1 | 2
let ls = fs.readFileSync('src/lib/tailor/export/layoutSentinel.ts', 'utf8');
ls = ls.replace(
  /export function evaluateLayoutHeight\(resume: TailoredResume\): LayoutSentinelReport \{/,
  `export function evaluateLayoutHeight(resume: TailoredResume): LayoutSentinelReport {
  const targetPages = resume.layoutSettings.targetPages ?? 1;`
);

ls = ls.replace(
  /const estimatedPages = Math\.max\(1, Math\.ceil\(totalHeight \/ usablePageHeight\)\);\r?\n\s*const overflowPx = Math\.max\(0, totalHeight - usablePageHeight\);/,
  `const targetCapacity = targetPages === 2 ? usablePageHeight * 2 : usablePageHeight;
  const estimatedPages = Math.max(1, Math.ceil(totalHeight / usablePageHeight));
  const overflowPx = Math.max(0, totalHeight - targetCapacity);`
);

ls = ls.replace(
  /if \(overflowPx === 0\) \{[\s\S]*?\} else \{[\s\S]*?\}/,
  `if (overflowPx === 0) {
    if (targetPages === 2) {
      densityStatus = totalHeight > usablePageHeight ? 'multi_page_balanced' : 'optimal_single_page';
      recommendations.push(
        totalHeight > usablePageHeight
          ? '2-page target achieved with balanced multi-page distribution.'
          : 'Content currently fits on 1 page; you can add further project details to utilize 2 pages.'
      );
    } else if (totalHeight <= usablePageHeight * 0.88) {
      densityStatus = 'optimal_single_page';
    } else {
      densityStatus = 'tight_fit';
      recommendations.push('Layout is near single-page capacity; avoid adding additional lines.');
    }
  } else {
    densityStatus = 'page_overflow';
    const spillPage = targetPages === 1 ? 'page 2' : \`page \${estimatedPages}\`;
    recommendations.push(
      \`Content spills ~\${Math.ceil(overflowPx / 20)} line(s) onto \${spillPage}. Trim bullets or tighten density to fit \${targetPages} page\${targetPages > 1 ? 's' : ''}.\`
    );
  }`
);
fs.writeFileSync('src/lib/tailor/export/layoutSentinel.ts', ls);
console.log('✓ layoutSentinel.ts updated with targetPages 1 | 2 support');

// 3. Update DarkPaperPreview.tsx with 1 Page / 2 Pages toggle
let dp = fs.readFileSync('src/features/suite/tailor/components/DarkPaperPreview.tsx', 'utf8');

// Insert targetPages buttons right after the paper size selector
const paperSizeBlock = `<div className="flex items-center bg-surface p-0.5 rounded border border-charcoal">
            <button
              type="button"
              onClick={() => setLayoutSetting('paperSize', 'a4')}
              className={\`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded transition cursor-pointer \${
                paperSize === 'a4'
                  ? 'bg-volt text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }\`}
              title="Standard International A4 (210mm x 297mm)"
            >
              A4
            </button>
            <button
              type="button"
              onClick={() => setLayoutSetting('paperSize', 'letter')}
              className={\`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded transition cursor-pointer \${
                paperSize === 'letter'
                  ? 'bg-volt text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }\`}
              title="US Letter (8.5in x 11in)"
            >
              Letter
            </button>
          </div>`;

const targetPagesBlock = `<div className="flex items-center bg-surface p-0.5 rounded border border-charcoal">
            <button
              type="button"
              onClick={() => {
                setLayoutSetting('targetPages', 1);
                autoFitOnePage();
              }}
              className={\`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded transition cursor-pointer \${
                (settings.targetPages ?? 1) === 1
                  ? 'bg-volt text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }\`}
              title="Target 1-page compact layout"
            >
              1 Page
            </button>
            <button
              type="button"
              onClick={() => setLayoutSetting('targetPages', 2)}
              className={\`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded transition cursor-pointer \${
                settings.targetPages === 2
                  ? 'bg-volt text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }\`}
              title="Target 2-page detailed layout"
            >
              2 Pages
            </button>
          </div>`;

dp = dp.replace(paperSizeBlock, `${paperSizeBlock}\n\n          {/* Target Pages Toggle (Stage 5.1) */}\n          ${targetPagesBlock}`);

// Update height badge text
dp = dp.replace(
  /\{heightReport\.estimatedPages === 1 \? '1 Page • Optimal Fit' : `\$\{heightReport\.estimatedPages\} Pages • Spillover`\}/,
  `{(settings.targetPages === 2)
                ? (heightReport.estimatedPages <= 2 ? '2 Pages • Balanced' : \`\${heightReport.estimatedPages} Pages • Overflow\`)
                : (heightReport.estimatedPages === 1 ? '1 Page • Optimal Fit' : \`\${heightReport.estimatedPages} Pages • Spillover\`)}`
);

fs.writeFileSync('src/features/suite/tailor/components/DarkPaperPreview.tsx', dp);
console.log('✓ DarkPaperPreview.tsx updated with 1 Page / 2 Pages toggle');

// 4. Update FresherIntakeModal.tsx with plain tier labels
let fim = fs.readFileSync('src/components/common/FresherIntakeModal.tsx', 'utf8');
fim = fim.replace(
  '<option value="service_track">Tier C: IT Services & Multi-Track Drives (TCS, Infosys, Wipro)</option>',
  '<option value="service_track">IT services & consultancies (TCS, Infosys, Wipro)</option>'
);
fim = fim.replace(
  '<option value="product_mnc_gcc">Tier B: Product MNCs & Global Capability Centers (Oracle, Cisco)</option>',
  '<option value="product_mnc_gcc">Enterprise & mid-market (Oracle, Cisco)</option>'
);
fim = fim.replace(
  '<option value="indian_high_growth">Tier A: Indian High-Growth Scale-ups (Swiggy, Razorpay)</option>',
  '<option value="indian_high_growth">High-growth unicorns (Swiggy, Razorpay)</option>'
);
fim = fim.replace(
  '<option value="big_tech_product">Tier S: Big Tech & Global Product (Google, Microsoft)</option>',
  '<option value="big_tech_product">Global product companies (Google, Microsoft)</option>'
);
fs.writeFileSync('src/components/common/FresherIntakeModal.tsx', fim);
console.log('✓ FresherIntakeModal.tsx updated with plain tier labels');
