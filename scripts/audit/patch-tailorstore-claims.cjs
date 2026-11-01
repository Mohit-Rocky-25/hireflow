const fs = require('fs');

let ts = fs.readFileSync('src/lib/tailor/store/tailorStore.ts', 'utf8');

// Fix line 531: remove invented 99.9% uptime
ts = ts.replace(
  /const bulletText = text \|\| `Architected high-throughput \$\{keyTech\} integration, optimizing API response throughput and achieving 99\.9% uptime\.`;/,
  "const bulletText = text || `Integrated ${keyTech} workflows according to project specifications.`;"
);

// Fix lines 182-183: remove invented metrics from default fallback bullets
ts = ts.replace(
  /text: 'Architected scalable services and REST APIs, sustaining high request throughput with zero downtime\.'/,
  "text: 'Architected scalable services and REST APIs across core product workflows.'"
);

ts = ts.replace(
  /text: 'Optimized database query performance, reducing endpoint latency by 35% across key user workflows\.'/,
  "text: 'Optimized database query performance and index strategies across key user workflows.'"
);

fs.writeFileSync('src/lib/tailor/store/tailorStore.ts', ts);
console.log('✓ tailorStore.ts cleaned of invented claims');

