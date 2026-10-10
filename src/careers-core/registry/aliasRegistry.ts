// ============================================================
// Careers Data Platform — Alias Registry & Canonical Resolver
// Resolves company names, program brands, and branch codes to stable canonical IDs
// ============================================================

const COMPANY_ALIASES: Record<string, string> = {
  // Big Tech
  google: 'google',
  'google-india': 'google',
  'google india': 'google',
  goog: 'google',

  microsoft: 'microsoft',
  'microsoft-india': 'microsoft',
  'microsoft india': 'microsoft',
  msft: 'microsoft',

  amazon: 'amazon',
  'amazon-india': 'amazon',
  'amazon india': 'amazon',
  amzn: 'amazon',
  aws: 'amazon',

  meta: 'meta',
  'meta-india': 'meta',
  facebook: 'meta',

  apple: 'apple',
  'apple-india': 'apple',

  uber: 'uber',
  'uber-india': 'uber',

  adobe: 'adobe',
  'adobe-india': 'adobe',

  salesforce: 'salesforce',
  'salesforce-india': 'salesforce',

  oracle: 'oracle',
  'oracle-india': 'oracle',

  cisco: 'cisco',
  'cisco-india': 'cisco',

  atlassian: 'atlassian',
  'atlassian-india': 'atlassian',

  linkedin: 'linkedin',
  'linkedin-india': 'linkedin',

  nvidia: 'nvidia',
  'nvidia-india': 'nvidia',

  qualcomm: 'qualcomm',
  'qualcomm-india': 'qualcomm',

  intel: 'intel',
  'intel-india': 'intel',

  netflix: 'netflix',
  'netflix-india': 'netflix',

  paypal: 'paypal',
  'paypal-india': 'paypal',

  intuit: 'intuit',
  'intuit-india': 'intuit',

  // Indian Unicorns
  flipkart: 'flipkart',
  swiggy: 'swiggy',
  zomato: 'zomato',
  razorpay: 'razorpay',
  cred: 'cred',
  meesho: 'meesho',
  phonepe: 'phonepe',
  paytm: 'paytm',
  'one97 communications': 'paytm',
  zepto: 'zepto',
  blinkit: 'blinkit',
  grofers: 'blinkit',
  ola: 'ola',
  'ola electric': 'ola',
  inmobi: 'inmobi',
  sharechat: 'sharechat',
  dream11: 'dream11',
  groww: 'groww',
  myntra: 'myntra',
  nykaa: 'nykaa',
  zoho: 'zoho',
  freshworks: 'freshworks',
  urbancompany: 'urbancompany',
  'urban company': 'urbancompany',

  // IT Services
  tcs: 'tcs',
  'tata consultancy services': 'tcs',
  infosys: 'infosys',
  infy: 'infosys',
  wipro: 'wipro',
  cognizant: 'cognizant',
  cts: 'cognizant',
  accenture: 'accenture',
  'accenture india': 'accenture',
  hcltech: 'hcltech',
  'hcl tech': 'hcltech',
  hcl: 'hcltech',
  techmahindra: 'tech-mahindra',
  'tech-mahindra': 'tech-mahindra',
  'tech mahindra': 'tech-mahindra',
  ltimindtree: 'ltimindtree',
  'lti mindtree': 'ltimindtree',
  persistent: 'persistent',
  'persistent systems': 'persistent',
  capgemini: 'capgemini',

  // GCC / Finance
  goldmansachs: 'goldman-sachs',
  'goldman-sachs': 'goldman-sachs',
  'goldman sachs': 'goldman-sachs',
  gs: 'goldman-sachs',
  morganstanley: 'morgan-stanley',
  'morgan-stanley': 'morgan-stanley',
  'morgan stanley': 'morgan-stanley',
  jpmorgan: 'jpmorgan',
  'jp morgan': 'jpmorgan',
  'jpmorgan chase': 'jpmorgan',
  wellsfargo: 'wells-fargo',
  'wells-fargo': 'wells-fargo',
  'wells fargo': 'wells-fargo',
  bnymellon: 'bny-mellon',
  'bny-mellon': 'bny-mellon',
  americanexpress: 'american-express',
  'american-express': 'american-express',
  amex: 'american-express',
  fidelity: 'fidelity',
  barclays: 'barclays',
  deutschebank: 'deutsche-bank',
  'deutsche-bank': 'deutsche-bank',
  walmart: 'walmart',
  'walmart global tech': 'walmart',

  // Core Engineering
  tatamotors: 'tata-motors',
  'tata-motors': 'tata-motors',
  'tata motors': 'tata-motors',
  mahindra: 'mahindra',
  'mahindra & mahindra': 'mahindra',
  bosch: 'bosch-india',
  'bosch-india': 'bosch-india',
  'bosch india': 'bosch-india',
  lnt: 'lnt',
  'larsen & toubro': 'lnt',
  lt: 'lnt',
  ather: 'ather',
  'ather energy': 'ather',
};

const BRANCH_CODE_ALIASES: Record<string, string> = {
  cs: 'CSE',
  cse: 'CSE',
  'computer science': 'CSE',
  it: 'IT',
  'information technology': 'IT',
  aiml: 'AIML',
  'ai and ml': 'AIML',
  aids: 'AIDS',
  'ai and ds': 'AIDS',
  ds: 'DS',
  'data science': 'DS',
  ece: 'ECE',
  'electronics and communication': 'ECE',
  eee: 'EEE',
  'electrical and electronics': 'EEE',
  ee: 'EE',
  electrical: 'EE',
  me: 'ME',
  mechanical: 'ME',
  civil: 'CIVIL',
  chem: 'CHEM',
  chemical: 'CHEM',
  biotech: 'BIOTECH',
  biotechnology: 'BIOTECH',
  bca: 'BCA',
  mca: 'MCA',
  mtech: 'MTECH',
  bba: 'BBA',
  mba: 'MBA',
};

/**
 * Resolves any company string, alias, slug, or name to a stable canonical ID.
 */
export function resolveCompanyId(raw: string): string {
  if (!raw) return '';
  const clean = raw.trim().toLowerCase().replace(/[\s_-]+/g, '');
  const direct = COMPANY_ALIASES[raw.trim().toLowerCase()];
  if (direct) return direct;

  for (const [alias, id] of Object.entries(COMPANY_ALIASES)) {
    if (alias.replace(/[\s_-]+/g, '') === clean) {
      return id;
    }
  }

  // Fallback: sanitized slug
  return raw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Resolves standard branch codes from common acronyms or degrees.
 */
export function resolveBranchCode(raw: string): string {
  if (!raw) return 'CSE';
  const clean = raw.trim().toLowerCase();
  return BRANCH_CODE_ALIASES[clean] || raw.toUpperCase();
}
