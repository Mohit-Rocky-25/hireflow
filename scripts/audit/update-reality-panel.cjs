const fs = require('fs');
let content = fs.readFileSync('src/components/common/RealityFactorsPanel.tsx', 'utf8');
content = content.replace(
  "'Off-Campus Reality: Blind portal applications often yield under 2% response rates. Your highest-ROI investment is targeting hackathons, referral outreach, or open-source programs.'",
  "'Off-Campus Reality: Blind portal applications typically yield under 2% response rates (Jobscan 2024, SHRM 2023 talent benchmarks). Your highest-leverage strategy is targeting hackathons, direct referral outreach, or open-source contributions.'"
);
fs.writeFileSync('src/components/common/RealityFactorsPanel.tsx', content, 'utf8');
console.log('RealityFactorsPanel updated');
