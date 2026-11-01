const fs = require('fs');

// 1. bulletAnalyzer.ts
let ba = fs.readFileSync('src/features/ats/engine/bulletAnalyzer.ts', 'utf8');
ba = ba.replace(
  /const METRIC_REGEX = .*?;/,
  "const METRIC_REGEX = /\\b(?:\\d+(?:\\.\\d+)?%|\\d+x|\\d+k|\\d+m|\\d+ms|(?:₹|rs\\.?|\\$)\\s*\\d+(?:,\\d+)*(?:\\.\\d+)?|\\d+(?:,\\d+)*\\s*(?:users|requests|qps|rps|tps|transactions|dau|mau|records|clients|customers|downloads|stars|views|inr|usd|lakh|lakhs|cr|crore|crores|lpa)|\\$\\s*\\d+|\\b\\d+\\s*%)|\\b(?:reduced|increased|improved|saved|accelerated|cut)\\s+(?:by\\s+)?\\d+/i;"
);
fs.writeFileSync('src/features/ats/engine/bulletAnalyzer.ts', ba);
console.log('✓ bulletAnalyzer.ts updated with Indian formats');

// 2. skillMatcher.ts
let sm = fs.readFileSync('src/features/ats/engine/skillMatcher.ts', 'utf8');
sm = sm.replace(
  /const METRIC_REGEX = .*?;/,
  "const METRIC_REGEX = /\\b(?:\\d+(?:\\.\\d+)?%|\\d+x|\\d+k|\\d+m|\\d+ms|(?:₹|rs\\.?|\\$)\\s*\\d+(?:,\\d+)*(?:\\.\\d+)?|\\d+(?:,\\d+)*\\s*(?:users|requests|qps|rps|tps|transactions|dau|mau|records|clients|customers|downloads|stars|views|inr|usd|lakh|lakhs|cr|crore|crores|lpa)|\\$\\s*\\d+|\\b\\d+\\s*%)|\\b(?:reduced|increased|improved|saved|accelerated|cut)\\s+(?:by\\s+)?\\d+/i;"
);
fs.writeFileSync('src/features/ats/engine/skillMatcher.ts', sm);
console.log('✓ skillMatcher.ts updated with Indian formats');

// 3. extractor.ts
let ex = fs.readFileSync('src/lib/resume/extractor.ts', 'utf8');
// Update FORMATTED_NUM_REGEX to support Indian comma notation e.g. 8,00,000
ex = ex.replace(
  /const FORMATTED_NUM_REGEX = .*?;/,
  "const FORMATTED_NUM_REGEX = /\\b(?:\\d{1,3}(?:,\\d{3})+|\\d{1,2}(?:,\\d{2})*,\\d{3})(?:\\+)?/g;"
);
// Update CURRENCY_REGEX
ex = ex.replace(
  /const CURRENCY_REGEX = .*?;/,
  "const CURRENCY_REGEX = /(?:[₹$£€]|Rs\\.?\\s*)\\s*\\d+(?:,\\d+)*(?:\\.\\d+)?(?:\\s*(?:k|m|b|l|cr|lakh|lakhs?|crore|crores?|lpa))?\\b|\\b\\d+(?:,\\d+)*(?:\\.\\d+)?\\s*(?:lpa|lakh|lakhs?|crore|crores?)\\b/gi;"
);
fs.writeFileSync('src/lib/resume/extractor.ts', ex);
console.log('✓ extractor.ts updated with Indian formats');
