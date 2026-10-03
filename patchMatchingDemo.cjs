const fs = require('fs');
const file = 'src/pages/demo/MatchingDemo.tsx';
let content = fs.readFileSync(file, 'utf8');

const additionalCompanies = [
  "Stripe", "Airbnb", "Uber", "Lyft", "Pinterest", "Snap", "Spotify", "Shopify", "Atlassian", "Slack",
  "Discord", "Twitch", "Reddit", "LinkedIn", "Twitter"
];

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let newCompaniesStr = "";

const templates = [
  { title: "Senior Frontend Engineer", level: "Senior", comps: ["react", "typescript", "systemdesign", "communication"], reqs: '{ react: "expert", typescript: "expert", systemdesign: "strong", communication: "strong" }', desc: "Build scalable web applications and intuitive UIs for our core product." },
  { title: "Backend Developer", level: "Mid-level", comps: ["java", "systemdesign", "databases", "dsa"], reqs: '{ java: "expert", systemdesign: "strong", databases: "strong", dsa: "expert" }', desc: "Design robust APIs and backend systems handling millions of requests." },
  { title: "DevOps Engineer", level: "Senior", comps: ["kubernetes", "devops", "aws", "golang"], reqs: '{ kubernetes: "expert", devops: "expert", aws: "strong", golang: "working" }', desc: "Scale and secure our cloud infrastructure and deployment pipelines." },
  { title: "Machine Learning Engineer", level: "Senior", comps: ["ml", "python", "dsa", "databases"], reqs: '{ ml: "expert", python: "expert", dsa: "strong", databases: "strong" }', desc: "Develop and deploy large scale AI models for personalization." },
  { title: "Data Scientist", level: "Senior", comps: ["ml", "python", "communication", "databases"], reqs: '{ ml: "strong", python: "expert", communication: "expert", databases: "strong" }', desc: "Analyze complex datasets to drive product decisions and user growth." },
  { title: "Security Engineer", level: "Senior", comps: ["security", "python", "systemdesign", "dsa"], reqs: '{ security: "expert", python: "strong", systemdesign: "strong", dsa: "working" }', desc: "Secure our platform against vulnerabilities and conduct red team exercises." },
  { title: "Mobile Engineer (iOS)", level: "Mid-level", comps: ["swift", "dsa", "systemdesign", "communication"], reqs: '{ swift: "expert", dsa: "strong", systemdesign: "strong", communication: "working" }', desc: "Build seamless native iOS experiences for our flagship app." },
  { title: "Mobile Engineer (Android)", level: "Mid-level", comps: ["kotlin", "java", "dsa", "systemdesign"], reqs: '{ kotlin: "expert", java: "strong", dsa: "strong", systemdesign: "strong" }', desc: "Develop feature-rich Android applications with offline-first capabilities." },
  { title: "Engineering Manager", level: "Manager", comps: ["leadership", "systemdesign", "communication", "java"], reqs: '{ leadership: "expert", systemdesign: "expert", communication: "expert", java: "strong" }', desc: "Lead and grow high-performing engineering teams while guiding architecture." },
  { title: "Site Reliability Engineer", level: "Senior", comps: ["devops", "kubernetes", "systemdesign", "golang"], reqs: '{ devops: "expert", kubernetes: "expert", systemdesign: "expert", golang: "strong" }', desc: "Ensure maximum uptime and system reliability for critical services." }
];

additionalCompanies.forEach((comp, index) => {
  const rolesCount = randRange(10, 15);
  let rolesStr = "[\n";
  for (let i = 0; i < rolesCount; i++) {
    const t = templates[randRange(0, templates.length - 1)];
    rolesStr += `      { title: "${t.title} - ${i+1}", level: "${t.level}", competencies: ${JSON.stringify(t.comps)}, reqLevel: ${t.reqs}, desc: "${t.desc}" }${i < rolesCount - 1 ? ',' : ''}\n`;
  }
  rolesStr += "    ]";

  const compStr = `  ,{
    id: "${comp.toLowerCase()}", name: "${comp}", logo: "${comp[0]}", gradient: "from-blue-500 to-indigo-500",
    industry: "Technology", hq: "San Francisco, CA", tier: "Tech Giant",
    hiring2023: ${randRange(500, 3000)}, hiring2024: ${randRange(300, 2000)}, trend: "stable",
    openRoles: ${randRange(20, 150)}, avgPackage: "₹30-60 LPA", glassdoor: ${(randRange(38, 48)/10).toFixed(1)},
    roles: ${rolesStr}
  }\n`;
  
  newCompaniesStr += compStr;
});

// find 'const COMPANIES = [' 
const startIndex = content.indexOf('const COMPANIES = [');
if (startIndex === -1) throw new Error("Could not find const COMPANIES");

// find matching bracket
let openBrackets = 0;
let endIndex = -1;

for (let i = startIndex + 18; i < content.length; i++) {
  if (content[i] === '[') openBrackets++;
  else if (content[i] === ']') {
    openBrackets--;
    if (openBrackets === 0) {
      endIndex = i;
      break;
    }
  }
}

if (endIndex === -1) throw new Error("Could not find end of COMPANIES");

const before = content.substring(0, endIndex);
const after = content.substring(endIndex);

content = before + newCompaniesStr + "\n" + after;
fs.writeFileSync(file, content, 'utf8');
console.log("Successfully injected properly!");
