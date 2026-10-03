const fs = require('fs');

const realCompanies = [
  "Google", "Microsoft", "Apple", "Meta", "Amazon", "Netflix", "OpenAI", "Anthropic", "Stripe", "Airbnb",
  "Uber", "Lyft", "Pinterest", "Snap", "Spotify", "Shopify", "Atlassian", "Slack", "Discord", "Twitch",
  "Reddit", "LinkedIn", "Twitter", "Block", "Coinbase", "Robinhood", "Plaid", "Databricks", "Snowflake", "Palantir",
  "Cloudflare", "Figma", "Notion", "Airtable", "Canva", "Miro", "Zoom", "Dropbox", "Box", "DocuSign",
  "Salesforce", "Oracle", "SAP", "IBM", "Intel", "AMD", "Nvidia", "Cisco", "Adobe", "Intuit",
  "PayPal", "Visa", "Mastercard", "American Express", "Goldman Sachs", "JPMorgan Chase", "Morgan Stanley", "Citigroup", "Wells Fargo", "Capital One",
  "Walmart", "Target", "Home Depot", "Lowe's", "Costco", "Nike", "Adidas", "Lululemon", "Under Armour", "Patagonia",
  "Tesla", "Ford", "General Motors", "Toyota", "Honda"
].slice(0, 75);

const departments = ["Engineering", "Product", "Design", "Data", "Security", "DevOps"];
const employmentTypes = ["full-time", "contract", "internship"];
const workModes = ["remote", "hybrid", "onsite"];
const locations = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "London, UK", "Remote", "Bangalore, India", "Toronto, Canada"];

const jobTemplates = [
  { title: "Senior Frontend Engineer", dept: "Engineering", reqs: ["React", "TypeScript", "Next.js"], keywords: "Build scalable web applications and intuitive UIs." },
  { title: "Backend Developer", dept: "Engineering", reqs: ["Java", "Spring Boot", "Microservices"], keywords: "Design robust APIs and backend systems." },
  { title: "Full Stack Developer", dept: "Engineering", reqs: ["Node.js", "React", "PostgreSQL"], keywords: "End-to-end product development." },
  { title: "DevOps Engineer", dept: "DevOps", reqs: ["Kubernetes", "AWS", "Terraform", "CI/CD"], keywords: "Scale and secure our cloud infrastructure." },
  { title: "Machine Learning Engineer", dept: "Data", reqs: ["Python", "PyTorch", "TensorFlow"], keywords: "Develop and deploy large scale AI models." },
  { title: "Data Scientist", dept: "Data", reqs: ["Python", "SQL", "Machine Learning"], keywords: "Analyze complex datasets to drive product decisions." },
  { title: "Data Engineer", dept: "Data", reqs: ["Apache Spark", "Airflow", "SQL"], keywords: "Build scalable data pipelines." },
  { title: "Product Manager", dept: "Product", reqs: ["Product Strategy", "Agile", "User Research"], keywords: "Lead product vision and execution." },
  { title: "UX Designer", dept: "Design", reqs: ["Figma", "Prototyping", "User Research"], keywords: "Create beautiful, user-centered designs." },
  { title: "Security Engineer", dept: "Security", reqs: ["Network Security", "Cryptography", "Python"], keywords: "Secure our platform against vulnerabilities." },
  { title: "Mobile Engineer (iOS)", dept: "Engineering", reqs: ["Swift", "Objective-C", "iOS SDK"], keywords: "Build seamless native iOS experiences." },
  { title: "Mobile Engineer (Android)", dept: "Engineering", reqs: ["Kotlin", "Android SDK", "Java"], keywords: "Develop feature-rich Android applications." },
  { title: "Engineering Manager", dept: "Engineering", reqs: ["Leadership", "System Design", "Agile"], keywords: "Lead and grow high-performing engineering teams." },
  { title: "Site Reliability Engineer", dept: "DevOps", reqs: ["Linux", "Go", "Observability"], keywords: "Ensure maximum uptime and system reliability." },
  { title: "Cloud Architect", dept: "Engineering", reqs: ["AWS", "Azure", "System Architecture"], keywords: "Design multi-cloud enterprise solutions." }
];

function genId(prefix) {
  return prefix + '-' + Math.random().toString(36).substr(2, 9);
}

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let outCompanies = [];
let outJobs = [];

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();
const daysFromNow = (d) => new Date(now.getTime() + d * 86400000).toISOString();

realCompanies.forEach((compName, i) => {
  const compId = `comp-massive-${i}`;
  outCompanies.push({
    id: compId,
    name: compName,
    description: `Leading global technology company innovating in the ${compName} space.`,
    industry: "Technology",
    website: `https://www.${compName.toLowerCase().replace(/ /g, '')}.com`,
    location: "Global",
    size: "10000+",
    foundedYear: randRange(1990, 2015),
    headquarters: "San Francisco, CA",
    departments: departments,
    techStack: ["React", "Python", "Go", "AWS", "Kubernetes"],
    hiringLocations: locations,
    workModePolicy: "hybrid",
    interviewStages: ["HR Screen", "Technical", "System Design", "Behavioral"],
    onboardingCompleted: true,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(10)
  });

  const numJobs = randRange(10, 15);
  for (let j = 0; j < numJobs; j++) {
    const template = jobTemplates[randRange(0, jobTemplates.length - 1)];
    const jobId = `job-massive-${i}-${j}`;
    
    // Generate Requirements
    const reqs = template.reqs.map((r, k) => ({
      id: `req-${jobId}-${k}`,
      jobId: jobId,
      name: r,
      category: "skill",
      priority: "MANDATORY",
      weight: randRange(20, 40)
    }));

    outJobs.push({
      id: jobId,
      companyId: compId,
      title: template.title,
      department: template.dept,
      employmentType: employmentTypes[randRange(0, employmentTypes.length - 1)],
      workMode: workModes[randRange(0, workModes.length - 1)],
      location: locations[randRange(0, locations.length - 1)],
      salaryMin: randRange(80000, 150000),
      salaryMax: randRange(160000, 300000),
      salaryCurrency: "USD",
      openings: randRange(1, 5),
      deadline: daysFromNow(randRange(10, 60)),
      summary: template.keywords,
      responsibilities: ["Develop features", "Review code", "Write tests"],
      requirements: reqs,
      screeningConfig: {
        autoResumeExtraction: true,
        skillMatching: true,
        experienceMatching: true,
        educationMatching: false,
        projectRelevance: true,
        certificationMatching: false,
        aiExplanation: true,
        minimumThreshold: 60,
        autoShortlist: false
      },
      status: "published",
      createdAt: daysAgo(randRange(10, 60)),
      updatedAt: daysAgo(randRange(1, 9)),
      publishedAt: daysAgo(randRange(10, 60))
    });
  }
});

const tsContent = `// Auto-generated massive seed data
import type { Company, Job } from '../types';

export const massiveCompanies: Company[] = ${JSON.stringify(outCompanies, null, 2)};

export const massiveJobs: Job[] = ${JSON.stringify(outJobs, null, 2)};
`;

fs.writeFileSync('src/store/seedMassive.ts', tsContent, 'utf-8');
console.log('Successfully generated ' + outCompanies.length + ' companies and ' + outJobs.length + ' jobs.');
