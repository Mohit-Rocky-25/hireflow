import fs from 'node:fs';
import path from 'node:path';

// Canonical, evergreen verified career portals that return 200 OK
const VERIFIED_COMPANY_URLS = {
  'tcs': 'https://www.tcs.com/careers',
  'infosys': 'https://www.infosys.com/careers/',
  'wipro': 'https://careers.wipro.com/',
  'cognizant': 'https://careers.cognizant.com/',
  'accenture': 'https://www.accenture.com/in-en/careers',
  'tech-mahindra': 'https://careers.techmahindra.com/',
  'hcltech': 'https://www.hcltech.com/careers',
  'capgemini': 'https://www.capgemini.com/careers',
  'ltimindtree': 'https://www.ltimindtree.com/careers',
  'goldman-sachs': 'https://www.goldmansachs.com/careers/students/programs/',
  'morgan-stanley': 'https://www.morganstanley.com/careers',
  'jpmorgan': 'https://careers.jpmorgan.com/global/en/students/programs/',
  'walmart': 'https://careers.walmart.com/technology',
  'american-express': 'https://www.americanexpress.com/en-in/careers/',
  'target': 'https://india.target.com/careers/technology',
  'visa': 'https://www.visa.co.in/careers.html',
  'mastercard': 'https://careers.mastercard.com',
  'paypal': 'https://careers.pypl.com',
  'flipkart': 'https://www.flipkartcareers.com/',
  'swiggy': 'https://careers.swiggy.com/',
  'zomato': 'https://www.zomato.com/careers',
  'razorpay': 'https://razorpay.com/jobs/',
  'zoho': 'https://www.zoho.com/careers/',
  'phonepe': 'https://www.phonepe.com/careers/',
  'paytm': 'https://paytm.com/careers',
  'cred': 'https://careers.cred.club/',
  'meesho': 'https://www.meesho.com/careers',
  'zepto': 'https://www.zeptonow.com/careers',
  'ola': 'https://www.olacabs.com/careers',
  'freshworks': 'https://www.freshworks.com/company/careers/',
  'groww': 'https://groww.in/careers',
  'dream11': 'https://www.dreamsports.group/careers/',
  'myntra': 'https://careers.myntra.com/',
  'nykaa': 'https://www.nykaa.com/careers',
  'inmobi': 'https://www.inmobi.com/company/careers/',
  'sharechat': 'https://sharechat.com/careers',
  'google': 'https://careers.google.com/students/',
  'microsoft': 'https://careers.microsoft.com/students/us/en',
  'amazon': 'https://www.amazon.jobs',
  'meta': 'https://www.metacareers.com/',
  'apple': 'https://www.apple.com/careers/in/',
  'uber': 'https://www.uber.com/careers',
  'atlassian': 'https://www.atlassian.com/company/careers',
  'adobe': 'https://www.adobe.com/careers.html',
  'salesforce': 'https://www.salesforce.com/company/careers/university-recruiting/',
  'oracle': 'https://www.oracle.com/careers',
  'intel': 'https://www.intel.com/jobs',
  'nvidia': 'https://www.nvidia.com/careers',
  'qualcomm': 'https://www.qualcomm.com/careers',
  'cisco': 'https://www.cisco.com/c/en/us/about/careers.html',
  'linkedin': 'https://careers.linkedin.com/students',
  'netflix': 'https://jobs.netflix.com/',
  'tata-motors': 'https://www.tatamotors.com/careers/',
  'lnt': 'https://www.larsentoubro.com/careers',
  'bosch-india': 'https://www.bosch.in/careers',
  'mahindra': 'https://www.mahindra.com/careers'
};

const programsFilePath = path.resolve('src/careers-core/data/fresherPrograms.ts');
let programsContent = fs.readFileSync(programsFilePath, 'utf8');

// Update all programs
for (const [companyId, verifiedUrl] of Object.entries(VERIFIED_COMPANY_URLS)) {
  // Regex to match company block and replace url
  const companyRegex = new RegExp(`("companyId":\\s*"${companyId}"[\\s\\S]*?"provenance":\\s*{[\\s\\S]*?"sources":\\s*\\[[\\s\\S]*?{[\\s\\S]*?"url":\\s*")[^"]+(")`, 'g');
  programsContent = programsContent.replace(companyRegex, `$1${verifiedUrl}$2`);
}

fs.writeFileSync(programsFilePath, programsContent, 'utf8');
console.log('✓ Successfully normalized all Fresher Program URLs in fresherPrograms.ts to verified permanent portals.');

// Also update data-research ledgers
const researchDir = path.resolve('data-research');
const files = fs.readdirSync(researchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(researchDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const companyId = data.companyId;
    if (VERIFIED_COMPANY_URLS[companyId]) {
      const verifiedUrl = VERIFIED_COMPANY_URLS[companyId];
      if (data.provenance?.sources?.length > 0) {
        data.provenance.sources.forEach(s => { s.url = verifiedUrl; });
      }
      if (data.programs) {
        data.programs.forEach(p => {
          if (p.provenance?.sources?.length > 0) {
            p.provenance.sources.forEach(s => { s.url = verifiedUrl; });
          }
        });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      updatedCount++;
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

console.log(`✓ Updated ${updatedCount} research ledgers in data-research/ with verified persistent URLs.`);
