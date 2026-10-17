const fs = require('fs');

const companyNames = [
  "TCS", "Infosys", "Wipro", "HCLTech", "Tech Mahindra", 
  "Cognizant", "Capgemini", "Accenture", "IBM India", "L&T Tech", 
  "LTIMindtree", "Hexaware", "Mphasis", "Persistent", "Zensar", 
  "Birlasoft", "Deloitte USI", "PwC India AC", "EY GDS", "KPMG GS", 
  "Zoho", "Freshworks", "Mu Sigma", "DXC Technology", "Genpact"
];

const industries = ["IT Services", "IT Services", "IT Services", "IT Services", "IT Services",
  "IT Services", "IT Services", "Consulting", "IT Services", "IT Services",
  "IT Services", "IT Services", "IT Services", "IT Services", "IT Services",
  "IT Services", "Consulting", "Consulting", "Consulting", "Consulting",
  "Software Development", "Software Development", "Analytics", "IT Services", "Consulting"];

const baseRoles = [
  { title: "Systems Engineer", level: "Entry", competencies: ["java", "dsa", "databases", "communication"], reqLevel: { java: "strong", dsa: "working", databases: "working", communication: "strong" }, desc: "Core application development and maintenance." },
  { title: "Test Automation Engineer", level: "Mid-level", competencies: ["python", "java", "communication"], reqLevel: { python: "strong", java: "working", communication: "strong" }, desc: "Building scalable test automation frameworks using Selenium and PyTest." },
  { title: "Cloud Support Engineer", level: "Mid-level", competencies: ["aws", "devops", "kubernetes", "databases"], reqLevel: { aws: "strong", devops: "strong", kubernetes: "working" }, desc: "Managing enterprise cloud infrastructure, deployments and monitoring." },
  { title: "Full Stack Developer", level: "Mid-level", competencies: ["react", "nodejs", "databases", "dsa"], reqLevel: { react: "strong", nodejs: "strong", databases: "strong", dsa: "working" }, desc: "End-to-end web application development for client projects." },
  { title: "Data Analyst", level: "Entry", competencies: ["python", "databases", "communication"], reqLevel: { python: "strong", databases: "expert", communication: "strong" }, desc: "Data processing, ETL pipelines, and dashboard creation." },
  { title: "DevOps Consultant", level: "Senior", competencies: ["devops", "kubernetes", "aws", "systemdesign"], reqLevel: { devops: "expert", kubernetes: "strong", aws: "strong", systemdesign: "working" }, desc: "Designing and implementing CI/CD pipelines for large scale enterprise applications." },
  { title: "Technical Lead", level: "Lead", competencies: ["java", "systemdesign", "leadership", "communication"], reqLevel: { java: "expert", systemdesign: "strong", leadership: "strong", communication: "expert" }, desc: "Leading development teams, client interaction, and architecture design." },
  { title: "Backend Developer", level: "Mid-level", competencies: ["java", "databases", "systemdesign", "dsa"], reqLevel: { java: "expert", databases: "strong", systemdesign: "working", dsa: "working" }, desc: "Building RESTful microservices for enterprise clients." },
  { title: "Business Analyst", level: "Mid-level", competencies: ["communication", "databases"], reqLevel: { communication: "expert", databases: "working" }, desc: "Requirement gathering, client communication, and functional design." },
  { title: "Security Analyst", level: "Mid-level", competencies: ["security", "python", "communication"], reqLevel: { security: "strong", python: "working", communication: "strong" }, desc: "Vulnerability scanning, penetration testing, and compliance." }
];

let newCompaniesString = "";

companyNames.forEach((name, i) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const industry = industries[i];
  const tier = industry === "Consulting" ? "MNC" : industry === "Software Development" ? "Enterprise" : "IT Services";
  const gradient = `from-blue-${(i % 5 + 4) * 100} to-cyan-${(i % 5 + 3) * 100}`;
  
  const rolesStr = baseRoles.map(r => `      { title: "${r.title}", level: "${r.level}", competencies: ${JSON.stringify(r.competencies)}, reqLevel: ${JSON.stringify(r.reqLevel)}, desc: "${r.desc}" }`).join(',\n');

  newCompaniesString += `  ,{
    id: "${id}", name: "${name}", logo: "${name.substring(0, 2).toUpperCase()}", gradient: "${gradient}",
    industry: "${industry}", hq: "India", tier: "${tier}",
    hiring2023: ${5000 + (i * 1000)}, hiring2024: ${4000 + (i * 800)}, trend: "${i % 3 === 0 ? 'up' : i % 2 === 0 ? 'down' : 'stable'}",
    openRoles: ${50 + (i * 10)}, avgPackage: "₹3.5-12 LPA", glassdoor: ${(3.5 + (i % 10) / 10).toFixed(1)},
    roles: [
${rolesStr}
    ]
  }\n`;
});

const file = 'src/pages/demo/talentLensData.ts';
const contentLines = fs.readFileSync(file, 'utf8').split('\n');

const endLineIndex = contentLines.findIndex((line, i) => i > 1360 && i < 1400 && line.trim() === '];');

if (endLineIndex !== -1) {
  contentLines.splice(endLineIndex, 0, newCompaniesString);
  fs.writeFileSync(file, contentLines.join('\n'));
  console.log("Successfully injected 25 companies.");
} else {
  console.log("Failed to find insertion point.");
}
