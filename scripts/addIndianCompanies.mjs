import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../src/pages/demo/talentLensData.ts');

const NEW_COMPANIES = [
  { id: 'tcs', name: 'Tata Consultancy Services', logo: 'TCS', gradient: 'from-blue-600 to-blue-400', industry: 'IT Services', hq: 'Mumbai, India', tier: 'MNC', hiring2023: 40000, hiring2024: 40000, trend: 'stable', openRoles: 1500, avgPackage: '₹3.3-7.5 LPA', glassdoor: 3.9 },
  { id: 'infosys', name: 'Infosys', logo: 'INF', gradient: 'from-blue-700 to-indigo-500', industry: 'IT Services', hq: 'Bangalore, India', tier: 'MNC', hiring2023: 35000, hiring2024: 20000, trend: 'down', openRoles: 1200, avgPackage: '₹3.6-8.0 LPA', glassdoor: 3.9 },
  { id: 'wipro', name: 'Wipro', logo: 'W', gradient: 'from-blue-500 to-teal-400', industry: 'IT Services', hq: 'Bangalore, India', tier: 'MNC', hiring2023: 20000, hiring2024: 15000, trend: 'down', openRoles: 800, avgPackage: '₹3.5-6.5 LPA', glassdoor: 3.8 },
  { id: 'hcl', name: 'HCLTech', logo: 'HCL', gradient: 'from-blue-600 to-blue-300', industry: 'IT Services', hq: 'Noida, India', tier: 'MNC', hiring2023: 15000, hiring2024: 10000, trend: 'down', openRoles: 600, avgPackage: '₹4.25-6.0 LPA', glassdoor: 3.8 },
  { id: 'techm', name: 'Tech Mahindra', logo: 'TM', gradient: 'from-red-600 to-red-400', industry: 'IT Services', hq: 'Pune, India', tier: 'MNC', hiring2023: 12000, hiring2024: 8000, trend: 'down', openRoles: 500, avgPackage: '₹3.25-5.5 LPA', glassdoor: 3.7 },
  { id: 'cognizant', name: 'Cognizant', logo: 'CTS', gradient: 'from-blue-700 to-blue-500', industry: 'IT Services', hq: 'Teaneck, NJ', tier: 'MNC', hiring2023: 25000, hiring2024: 20000, trend: 'down', openRoles: 1400, avgPackage: '₹4.0-6.7 LPA', glassdoor: 3.9 },
  { id: 'accenture', name: 'Accenture', logo: 'ACN', gradient: 'from-purple-600 to-purple-400', industry: 'Consulting & IT', hq: 'Dublin, Ireland', tier: 'MNC', hiring2023: 30000, hiring2024: 25000, trend: 'stable', openRoles: 2000, avgPackage: '₹4.5-12.0 LPA', glassdoor: 4.0 },
  { id: 'capgemini', name: 'Capgemini', logo: 'CAP', gradient: 'from-blue-500 to-cyan-500', industry: 'IT Services', hq: 'Paris, France', tier: 'MNC', hiring2023: 20000, hiring2024: 15000, trend: 'down', openRoles: 1000, avgPackage: '₹4.25-7.5 LPA', glassdoor: 3.9 },
  { id: 'ibm', name: 'IBM', logo: 'IBM', gradient: 'from-blue-800 to-blue-600', industry: 'Technology', hq: 'Armonk, NY', tier: 'MNC', hiring2023: 10000, hiring2024: 8000, trend: 'stable', openRoles: 900, avgPackage: '₹4.5-9.0 LPA', glassdoor: 4.1 },
  { id: 'amazon_in', name: 'Amazon India', logo: 'AMZ', gradient: 'from-yellow-500 to-orange-400', industry: 'E-commerce/Cloud', hq: 'Seattle, WA', tier: 'FAANG', hiring2023: 8000, hiring2024: 6000, trend: 'stable', openRoles: 1200, avgPackage: '₹15-45 LPA', glassdoor: 4.2 },
  { id: 'microsoft_in', name: 'Microsoft India', logo: 'MS', gradient: 'from-blue-500 to-green-500', industry: 'Technology', hq: 'Redmond, WA', tier: 'FAANG', hiring2023: 5000, hiring2024: 4500, trend: 'stable', openRoles: 800, avgPackage: '₹18-50 LPA', glassdoor: 4.4 },
  { id: 'oracle', name: 'Oracle', logo: 'ORCL', gradient: 'from-red-600 to-orange-500', industry: 'Technology', hq: 'Austin, TX', tier: 'MNC', hiring2023: 6000, hiring2024: 5500, trend: 'stable', openRoles: 750, avgPackage: '₹12-25 LPA', glassdoor: 3.9 },
  { id: 'cisco', name: 'Cisco', logo: 'CSCO', gradient: 'from-blue-500 to-blue-300', industry: 'Networking', hq: 'San Jose, CA', tier: 'MNC', hiring2023: 4000, hiring2024: 3500, trend: 'stable', openRoles: 500, avgPackage: '₹15-30 LPA', glassdoor: 4.3 },
  { id: 'goldman', name: 'Goldman Sachs', logo: 'GS', gradient: 'from-blue-400 to-blue-200', industry: 'Finance', hq: 'New York, NY', tier: 'MNC', hiring2023: 1500, hiring2024: 1200, trend: 'stable', openRoles: 250, avgPackage: '₹20-35 LPA', glassdoor: 4.0 },
  { id: 'jpmc', name: 'JP Morgan Chase', logo: 'JPM', gradient: 'from-stone-600 to-stone-400', industry: 'Finance', hq: 'New York, NY', tier: 'MNC', hiring2023: 2000, hiring2024: 1800, trend: 'stable', openRoles: 400, avgPackage: '₹18-32 LPA', glassdoor: 4.1 },
  { id: 'morgan', name: 'Morgan Stanley', logo: 'MS', gradient: 'from-blue-700 to-blue-500', industry: 'Finance', hq: 'New York, NY', tier: 'MNC', hiring2023: 1200, hiring2024: 1000, trend: 'stable', openRoles: 200, avgPackage: '₹16-30 LPA', glassdoor: 4.1 },
  { id: 'deloitte', name: 'Deloitte', logo: 'DEL', gradient: 'from-green-600 to-green-400', industry: 'Consulting', hq: 'London, UK', tier: 'MNC', hiring2023: 15000, hiring2024: 12000, trend: 'stable', openRoles: 1500, avgPackage: '₹6.5-12 LPA', glassdoor: 4.0 },
  { id: 'ey', name: 'EY', logo: 'EY', gradient: 'from-yellow-400 to-yellow-200', industry: 'Consulting', hq: 'London, UK', tier: 'MNC', hiring2023: 12000, hiring2024: 10000, trend: 'stable', openRoles: 1100, avgPackage: '₹5.5-10 LPA', glassdoor: 3.9 },
  { id: 'pwc', name: 'PwC', logo: 'PWC', gradient: 'from-orange-500 to-orange-300', industry: 'Consulting', hq: 'London, UK', tier: 'MNC', hiring2023: 10000, hiring2024: 8000, trend: 'down', openRoles: 900, avgPackage: '₹6.0-11 LPA', glassdoor: 3.9 },
  { id: 'kpmg', name: 'KPMG', logo: 'KPMG', gradient: 'from-blue-800 to-blue-500', industry: 'Consulting', hq: 'Amstelveen, NL', tier: 'MNC', hiring2023: 8000, hiring2024: 7000, trend: 'stable', openRoles: 800, avgPackage: '₹5.5-10 LPA', glassdoor: 3.8 },
  { id: 'samsung', name: 'Samsung R&D', logo: 'SAM', gradient: 'from-blue-700 to-indigo-600', industry: 'Electronics', hq: 'Suwon, SK', tier: 'MNC', hiring2023: 3000, hiring2024: 2500, trend: 'stable', openRoles: 400, avgPackage: '₹14-22 LPA', glassdoor: 4.0 },
  { id: 'qualcomm', name: 'Qualcomm', logo: 'QCOM', gradient: 'from-blue-600 to-blue-400', industry: 'Semiconductors', hq: 'San Diego, CA', tier: 'MNC', hiring2023: 2000, hiring2024: 1800, trend: 'stable', openRoles: 300, avgPackage: '₹18-35 LPA', glassdoor: 4.1 },
  { id: 'adobe', name: 'Adobe', logo: 'ADBE', gradient: 'from-red-600 to-red-500', industry: 'Software', hq: 'San Jose, CA', tier: 'MNC', hiring2023: 1000, hiring2024: 800, trend: 'stable', openRoles: 150, avgPackage: '₹22-40 LPA', glassdoor: 4.4 },
  { id: 'walmart', name: 'Walmart Global Tech', logo: 'WMT', gradient: 'from-blue-500 to-yellow-400', industry: 'Retail/Tech', hq: 'Bentonville, AR', tier: 'MNC', hiring2023: 4000, hiring2024: 3500, trend: 'stable', openRoles: 600, avgPackage: '₹16-32 LPA', glassdoor: 4.1 },
  { id: 'barclays', name: 'Barclays', logo: 'BARC', gradient: 'from-cyan-600 to-blue-500', industry: 'Finance', hq: 'London, UK', tier: 'MNC', hiring2023: 1500, hiring2024: 1200, trend: 'down', openRoles: 250, avgPackage: '₹14-25 LPA', glassdoor: 4.0 }
];

function expandRole(roleTitle, companyName) {
  const isSDE = roleTitle.includes('Software') || roleTitle.includes('Developer') || roleTitle.includes('SDE');
  
  const competencies = isSDE ? ['dsa', 'java', 'databases', 'communication'] : ['communication', 'databases', 'python'];
  
  return {
    title: roleTitle,
    level: "Fresher / Entry-Level",
    competencies: competencies,
    reqLevel: Object.fromEntries(competencies.map(c => [c, "strong"])),
    desc: "Campus recruitment for " + roleTitle + " at " + companyName + ". Extensive multi-round evaluation.",
    location: "Pan India",
    employmentType: "Full-time",
    experienceLevel: "0-2 years",
    aboutRole: "Join " + companyName + " as a " + roleTitle + " and kickstart your career working on enterprise-scale projects. You will undergo rigorous training and work with global teams to deliver high-quality solutions.",
    responsibilities: [
      "Understand project requirements and business logic.",
      "Develop, test, and deploy software modules.",
      "Collaborate with senior developers and cross-functional teams.",
      "Participate in code reviews and agile rituals.",
      "Ensure adherence to coding standards and security guidelines.",
      "Continuously learn and adapt to new technologies and frameworks."
    ],
    qualifications: [
      "B.Tech/B.E/M.Tech/MCA in Computer Science, IT, or related fields.",
      "Minimum 60% or 6.0 CGPA throughout academics.",
      "No active backlogs at the time of joining.",
      "Strong foundational knowledge in Data Structures and Algorithms.",
      "Good understanding of RDBMS, SQL, and Object-Oriented Programming.",
      "Excellent communication and teamwork skills."
    ],
    hiringProcess: [
      "Online Aptitude & Technical Test",
      "Coding Assessment",
      "Technical Interview",
      "HR Interview",
      "Offer Rollout"
    ],
    fullText: "Job Title: " + roleTitle + "\\nCompany: " + companyName + "\\nLocation: Pan India\\n\\nAbout the Role:\\nJoin " + companyName + " as a " + roleTitle + "... [Expanded Full JD Content]\\n\\nKey Responsibilities:\\n- Understand project requirements and business logic.\\n- Develop, test, and deploy software modules.\\n- Collaborate with senior developers and cross-functional teams.\\n\\nQualifications:\\n- B.Tech/B.E/M.Tech/MCA in Computer Science, IT, or related fields.\\n- Minimum 60% or 6.0 CGPA throughout academics.\\n- Strong foundational knowledge in Data Structures and Algorithms.\\n\\nHiring Process:\\n- Online Aptitude & Technical Test\\n- Coding Assessment\\n- Technical Interview\\n- HR Interview"
  };
}

async function main() {
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  
  const startMarker = 'export const COMPANIES = [';
  const startIndex = content.indexOf(startMarker);
  
  const endMatch = content.match(/];\s*\/\/\s*════════════════════════════════════════════════════════════\s*\/\/\s*TALENTLENS™ AI ENGINE v7/);
  if (!endMatch) {
    throw new Error('Could not find end of COMPANIES array');
  }
  const endIndex = endMatch.index;

  const arrayString = content.substring(startIndex + 'export const COMPANIES = '.length, endIndex + 1);
  const existingCompanies = eval('(' + arrayString + ')');

  const newCompaniesWithRoles = NEW_COMPANIES.map(c => {
    return {
      ...c,
      roles: [
        expandRole('Systems Engineer', c.name),
        expandRole('Software Developer', c.name),
        expandRole('Data Analyst', c.name)
      ]
    };
  });

  const mergedCompanies = [...existingCompanies, ...newCompaniesWithRoles];

  const newArrayString = JSON.stringify(mergedCompanies, null, 2)
    .replace(/"([^"]+)":/g, '$1:');

  const newContent = content.substring(0, startIndex) +
                     'export const COMPANIES = ' + newArrayString +
                     content.substring(endIndex + 1);

  fs.writeFileSync(DATA_FILE, newContent, 'utf8');
  console.log('Added 25 Indian College Hiring companies with expanded roles.');
}

main().catch(console.error);
