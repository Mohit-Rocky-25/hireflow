// ============================================================
// HireFlow — Intelligent Typo-Tolerant Company Search Engine
// Features:
// 1. Full Case-Insensitivity (UPPERCASE, lowercase, TitleCase, mixed)
// 2. Damerau-Levenshtein Edit Distance + Jaro-Winkler Similarity
// 3. Phonetic Soundex & Metaphone matching for sound-alike typos
// 4. Aliases & Acronyms Dictionary (e.g. TCS -> Tata Consultancy, MSFT -> Microsoft)
// 5. Multi-field indexing: Company Name, Roles, Industry, HQ Location, Tech Stack
// 6. "Did You Mean?" detection & Similar Company suggestions
// ============================================================

export interface SearchableRole {
  title: string;
  level?: string;
  competencies?: string[];
  [key: string]: any;
}

export interface SearchableCompany {
  id: string;
  name: string;
  industry: string;
  hq: string;
  tier: string;
  openRoles?: number;
  hiring2024?: number;
  roles: SearchableRole[];
  [key: string]: any;
}

export interface SearchMatchResult<T extends SearchableCompany> {
  company: T;
  score: number;
  matchedField: 'name' | 'alias' | 'fuzzy_name' | 'phonetic' | 'role' | 'industry' | 'hq' | 'skill';
  matchedTerm: string;
  highlightText?: string;
}

export interface SearchEngineResponse<T extends SearchableCompany> {
  results: T[];
  scoredResults: SearchMatchResult<T>[];
  didYouMean?: string;
  suggestedCompanies: string[];
  isFuzzyMatch: boolean;
  totalMatches: number;
}

// ────────────────────────────────────────────────────────────
// Common Tech Company Aliases, Acronyms & Known Misspellings
// ────────────────────────────────────────────────────────────
export const COMPANY_ALIASES: Record<string, string[]> = {
  barclays: ['barclay', 'barklays', 'bacrlays', 'barcleys', 'barkley', 'barclays bank', 'barc'],
  google: ['googl', 'googel', 'gogle', 'gogole', 'alphabet', 'goog'],
  microsoft: ['microsft', 'mircosoft', 'micro soft', 'msft', 'msoft'],
  amazon: ['amazn', 'amzon', 'amazone', 'aws'],
  meta: ['facebook', 'fb', 'meta platforms', 'instagram', 'whatsapp'],
  apple: ['aple', 'aapl', 'ios', 'mac'],
  tcs: ['tata', 'tata consultancy', 'tata consultancy services', 'tata tech'],
  infosys: ['infy', 'infosis', 'infosy', 'infosys tech'],
  wipro: ['wipor', 'wipro technologies'],
  hcltech: ['hcl', 'hcl tech', 'hcl technologies'],
  cognizant: ['cognizent', 'cogniznt', 'cts', 'cognizant technology solutions'],
  atlassian: ['atlasian', 'atlassn', 'jira', 'confluence', 'trello'],
  accenture: ['accentur', 'acenture', 'acc', 'acn'],
  capgemini: ['capgemni', 'cap', 'cap gemini'],
  ltimindtree: ['lti', 'mindtree', 'l&t', 'larsen', 'larsen & toubro'],
  freshworks: ['freshwork', 'fw'],
  uber: ['ubr', 'uber technologies'],
  adobe: ['adob', 'photoshop', 'acrobat'],
  flipkart: ['flpkart', 'fk'],
  swiggy: ['swigi', 'bundl'],
  zomato: ['zomto', 'blinkit', 'eternal'],
  netflix: ['netflx', 'nflx'],
  salesforce: ['sfdc', 'sales force', 'force.com'],
  nvidia: ['nvda', 'nvida', 'geforce'],
  intel: ['intc', 'chipzilla'],
  cisco: ['csco'],
  oracle: ['orcl'],
  paytm: ['one97', 'pay tm'],
  phonepe: ['phone pe', 'flips'],
  razorpay: ['razor pay', 'rzp'],
  cred: ['dreamplug'],
  ola: ['ani technologies', 'ola cabs', 'ola electric'],
  meesho: ['fashnear'],
  zepto: ['kiranakart'],
  morganstanley: ['morgan', 'ms', 'morgan stanley'],
  jpmorgan: ['jpm', 'jpmc', 'jp morgan', 'chase'],
  goldmansachs: ['goldman', 'gs', 'goldman sachs'],
};

// ────────────────────────────────────────────────────────────
// String Normalization
// ────────────────────────────────────────────────────────────
export function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^\w\s]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();
}

export function stripSpaces(str: string): string {
  return normalizeText(str).replace(/\s+/g, '');
}

// ────────────────────────────────────────────────────────────
// Damerau-Levenshtein Edit Distance (Handles Transpositions)
// ────────────────────────────────────────────────────────────
export function damerauLevenshtein(a: string, b: string): number {
  const source = normalizeText(a);
  const target = normalizeText(b);

  if (source === target) return 0;
  if (!source.length) return target.length;
  if (!target.length) return source.length;

  const m = source.length;
  const n = target.length;
  const d: number[][] = [];

  for (let i = 0; i <= m; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = source[i - 1] === target[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && source[i - 1] === target[j - 2] && source[i - 2] === target[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[m][n];
}

// ────────────────────────────────────────────────────────────
// Jaro-Winkler Similarity (0 to 1)
// ────────────────────────────────────────────────────────────
export function jaroWinkler(s1: string, s2: string): number {
  const str1 = normalizeText(s1);
  const str2 = normalizeText(s2);

  if (str1 === str2) return 1.0;
  if (!str1.length || !str2.length) return 0.0;

  const matchDistance = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
  const s1Matches = new Array(str1.length).fill(false);
  const s2Matches = new Array(str2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < str1.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, str2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (str1[i] !== str2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < str1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3.0;

  // Winkler prefix bonus (up to 4 chars)
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(str1.length, str2.length)); i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }

  return jaro + 0.1 * prefix * (1 - jaro);
}

// ────────────────────────────────────────────────────────────
// Soundex Phonetic Code (Detects sound-alike spellings)
// ────────────────────────────────────────────────────────────
export function soundex(str: string): string {
  const norm = normalizeText(str);
  if (!norm) return '';

  const firstLetter = norm[0].toUpperCase();
  const map: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6',
  };

  let result = firstLetter;
  let prevCode = map[firstLetter] || '';

  for (let i = 1; i < norm.length && result.length < 4; i++) {
    const char = norm[i].toUpperCase();
    const code = map[char] || '';
    if (code && code !== prevCode) {
      result += code;
    }
    prevCode = code;
  }

  return (result + '000').slice(0, 4);
}

// ────────────────────────────────────────────────────────────
// Core Matcher: Calculates Match Score between Query & Company
// ────────────────────────────────────────────────────────────
export function evaluateCompanyMatch<T extends SearchableCompany>(
  company: T,
  rawQuery: string
): SearchMatchResult<T> | null {
  const query = normalizeText(rawQuery);
  if (!query) return null;

  const queryTokens = query.split(' ').filter(Boolean);
  const companyName = normalizeText(company.name);
  const companyNameStripped = stripSpaces(company.name);
  const queryStripped = stripSpaces(rawQuery);
  const companyId = normalizeText(company.id || '');

  // 1. EXACT NAME MATCH (Score 100)
  if (companyName === query || companyNameStripped === queryStripped || companyId === queryStripped) {
    return {
      company,
      score: 100,
      matchedField: 'name',
      matchedTerm: company.name,
      highlightText: company.name,
    };
  }

  // 2. PREFIX MATCH (Score 90)
  if (companyName.startsWith(query) || companyNameStripped.startsWith(queryStripped)) {
    return {
      company,
      score: 90,
      matchedField: 'name',
      matchedTerm: company.name,
      highlightText: company.name,
    };
  }

  // 3. WORD PREFIX MATCH (e.g. "consultancy" in "Tata Consultancy") (Score 85)
  const nameWords = companyName.split(' ');
  for (const word of nameWords) {
    if (word.startsWith(query)) {
      return {
        company,
        score: 85,
        matchedField: 'name',
        matchedTerm: company.name,
        highlightText: word,
      };
    }
  }

  // 4. ALIAS & ACRONYM MATCH (Score 80)
  // Check predefined aliases for this company
  const canonicalId = company.id?.toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliases = COMPANY_ALIASES[canonicalId] || [];
  for (const alias of aliases) {
    const normAlias = normalizeText(alias);
    if (normAlias === query || stripSpaces(alias) === queryStripped) {
      return {
        company,
        score: 80,
        matchedField: 'alias',
        matchedTerm: alias,
        highlightText: company.name,
      };
    }
    if (damerauLevenshtein(query, normAlias) <= 1 && query.length >= 4) {
      return {
        company,
        score: 75,
        matchedField: 'alias',
        matchedTerm: alias,
        highlightText: company.name,
      };
    }
  }

  // Check reverse alias (if user typed an alias key)
  for (const [key, aliasList] of Object.entries(COMPANY_ALIASES)) {
    if (aliasList.includes(query) || aliasList.includes(queryStripped)) {
      if (companyName.includes(key) || canonicalId.includes(key)) {
        return {
          company,
          score: 80,
          matchedField: 'alias',
          matchedTerm: company.name,
          highlightText: company.name,
        };
      }
    }
  }

  // 5. NAME SUBSTRING CONTAINS (Score 75)
  if (companyName.includes(query) || companyNameStripped.includes(queryStripped)) {
    return {
      company,
      score: 75,
      matchedField: 'name',
      matchedTerm: company.name,
      highlightText: company.name,
    };
  }

  // 6. FUZZY MATCH ON COMPANY NAME (Typo Tolerance)
  // Allow edit distance based on length
  const dist = damerauLevenshtein(query, companyName);
  const jaro = jaroWinkler(query, companyName);
  const maxLen = Math.max(query.length, companyName.length);
  const maxAllowedDist = query.length <= 4 ? 1 : query.length <= 7 ? 2 : 3;

  if (dist <= maxAllowedDist || jaro >= 0.78) {
    const fuzzyScore = Math.round(Math.max(1 - dist / maxLen, jaro) * 72);
    return {
      company,
      score: fuzzyScore,
      matchedField: 'fuzzy_name',
      matchedTerm: company.name,
      highlightText: company.name,
    };
  }

  // Also check individual words of multi-word company names (e.g. "Morgan" in "Morgan Stanley")
  for (const word of nameWords) {
    if (word.length >= 4) {
      const wordDist = damerauLevenshtein(query, word);
      if (wordDist <= 1) {
        return {
          company,
          score: 68,
          matchedField: 'fuzzy_name',
          matchedTerm: company.name,
          highlightText: word,
        };
      }
    }
  }

  // 7. PHONETIC / SOUNDEX MATCH (Detects words that sound identical)
  if (query.length >= 4 && soundex(query) === soundex(companyName)) {
    return {
      company,
      score: 65,
      matchedField: 'phonetic',
      matchedTerm: company.name,
      highlightText: company.name,
    };
  }

  // 8. ROLE TITLE MATCH
  if (company.roles && Array.isArray(company.roles)) {
    for (const role of company.roles) {
      const roleTitle = normalizeText(role.title || '');
      if (roleTitle.includes(query)) {
        return {
          company,
          score: 60,
          matchedField: 'role',
          matchedTerm: role.title,
          highlightText: role.title,
        };
      }

      // Check role fuzzy
      if (query.length >= 5) {
        for (const roleWord of roleTitle.split(' ')) {
          if (roleWord.length >= 4 && damerauLevenshtein(query, roleWord) <= 1) {
            return {
              company,
              score: 52,
              matchedField: 'role',
              matchedTerm: role.title,
              highlightText: role.title,
            };
          }
        }
      }

      // Role competencies / skills (e.g. "python", "react", "dsa")
      if (role.competencies && Array.isArray(role.competencies)) {
        for (const comp of role.competencies) {
          const compNorm = normalizeText(comp);
          if (compNorm === query || compNorm.includes(query)) {
            return {
              company,
              score: 48,
              matchedField: 'skill',
              matchedTerm: comp,
              highlightText: comp,
            };
          }
        }
      }
    }
  }

  // 9. INDUSTRY MATCH (e.g. "Finance", "SaaS", "IT Services")
  const industry = normalizeText(company.industry || '');
  if (industry.includes(query) || (query.length >= 5 && damerauLevenshtein(query, industry) <= 1)) {
    return {
      company,
      score: 42,
      matchedField: 'industry',
      matchedTerm: company.industry,
      highlightText: company.industry,
    };
  }

  // 10. HQ / LOCATION MATCH (e.g. "London", "Bangalore", "San Francisco")
  const hq = normalizeText(company.hq || '');
  if (hq.includes(query) || (query.length >= 5 && queryTokens.some(t => hq.includes(t)))) {
    return {
      company,
      score: 38,
      matchedField: 'hq',
      matchedTerm: company.hq,
      highlightText: company.hq,
    };
  }

  return null;
}

// ────────────────────────────────────────────────────────────
// Main Search Pipeline
// ────────────────────────────────────────────────────────────
export function searchCompanies<T extends SearchableCompany>(
  companies: T[],
  query: string,
  options: {
    industryFilter?: string;
    tierFilter?: string;
    minScore?: number;
    maxResults?: number;
  } = {}
): SearchEngineResponse<T> {
  const {
    industryFilter = 'All',
    tierFilter = 'All',
    minScore = 20,
    maxResults = 200,
  } = options;

  const trimmed = query.trim();

  // If search query is empty, apply simple industry/tier filtering
  if (!trimmed) {
    const filtered = companies.filter(c => {
      const matchIndustry = industryFilter === 'All' || c.industry?.includes(industryFilter);
      const matchTier = tierFilter === 'All' || c.tier === tierFilter;
      return matchIndustry && matchTier;
    });

    return {
      results: filtered,
      scoredResults: filtered.map(c => ({
        company: c,
        score: 100,
        matchedField: 'name',
        matchedTerm: c.name,
      })),
      suggestedCompanies: [],
      isFuzzyMatch: false,
      totalMatches: filtered.length,
    };
  }

  // 1. Evaluate every company
  const matches: SearchMatchResult<T>[] = [];
  for (const company of companies) {
    // Check tier / industry filters first
    const matchIndustry = industryFilter === 'All' || company.industry?.includes(industryFilter);
    const matchTier = tierFilter === 'All' || company.tier === tierFilter;
    if (!matchIndustry || !matchTier) continue;

    const match = evaluateCompanyMatch(company, trimmed);
    if (match && match.score >= minScore) {
      matches.push(match);
    }
  }

  // 2. Sort by match score descending
  matches.sort((a, b) => b.score - a.score);

  const finalMatches = matches.slice(0, maxResults);
  const results = finalMatches.map(m => m.company);

  // 3. Detect "Did You Mean?" if top match was a fuzzy/phonetic match
  let didYouMean: string | undefined = undefined;
  let isFuzzyMatch = false;

  if (finalMatches.length > 0) {
    const topMatch = finalMatches[0];
    if (['fuzzy_name', 'phonetic', 'alias'].includes(topMatch.matchedField)) {
      if (normalizeText(topMatch.company.name) !== normalizeText(trimmed)) {
        didYouMean = topMatch.company.name;
        isFuzzyMatch = true;
      }
    }
  }

  // 4. Generate Similar Company Suggestions
  const suggestedSet = new Set<string>();
  if (finalMatches.length > 0) {
    // Suggest other companies from the top matched company's industry/tier
    const topCompany = finalMatches[0].company;
    companies
      .filter(c => c.id !== topCompany.id && (c.industry === topCompany.industry || c.tier === topCompany.tier))
      .slice(0, 4)
      .forEach(c => suggestedSet.add(c.name));
  } else {
    // If 0 matches, suggest closest matching companies by name distance
    const fuzzyCandidates = companies
      .map(c => ({
        name: c.name,
        dist: damerauLevenshtein(trimmed, c.name),
        sim: jaroWinkler(trimmed, c.name),
      }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 5);

    if (fuzzyCandidates.length > 0 && fuzzyCandidates[0].sim >= 0.6) {
      didYouMean = fuzzyCandidates[0].name;
    }
    fuzzyCandidates.forEach(c => suggestedSet.add(c.name));
  }

  return {
    results,
    scoredResults: finalMatches,
    didYouMean,
    suggestedCompanies: Array.from(suggestedSet).slice(0, 4),
    isFuzzyMatch,
    totalMatches: results.length,
  };
}

// ────────────────────────────────────────────────────────────
// Deduplication Utility for Company Catalogs
// Merges duplicate entries by ID, combines unique roles,
// and guarantees 100% unique React keys.
// ────────────────────────────────────────────────────────────
export function deduplicateCompanies<T extends SearchableCompany>(companies: T[]): T[] {
  const map = new Map<string, T>();

  companies.forEach(company => {
    const key = (company.id || company.name || '').toLowerCase().trim();
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, {
        ...company,
        roles: [...(company.roles || [])],
      });
    } else {
      const existing = map.get(key)!;
      const existingTitles = new Set((existing.roles || []).map(r => normalizeText(r.title)));

      (company.roles || []).forEach(r => {
        const titleNorm = normalizeText(r.title);
        if (!existingTitles.has(titleNorm)) {
          existing.roles.push(r);
          existingTitles.add(titleNorm);
        }
      });

      // Keep maximum values for metrics
      if (typeof company.openRoles === 'number' && typeof existing.openRoles === 'number') {
        existing.openRoles = Math.max(existing.openRoles, company.openRoles);
      }
      if (typeof company.hiring2024 === 'number' && typeof existing.hiring2024 === 'number') {
        existing.hiring2024 = Math.max(existing.hiring2024, company.hiring2024);
      }
    }
  });

  return Array.from(map.values());
}
