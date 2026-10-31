// ============================================================
// HireFlow — 3-Day Automated Live Market Job Ingestion Engine
// Stage 3 "Levels.fyi" Real Data Pipeline: Public ATS Ingestion
// Connects to public, unauthenticated ATS endpoints (Greenhouse, Lever)
// Zero API keys required | 100% Verified Primary Source Data
// Runs in CI on a 3-day cron schedule and writes code-split JSON chunks
// ============================================================

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { extractSkills, getDeduplicatedSkills } from '../../src/lib/ats/extractSkills';

export interface FlagshipRegistryEntry {
  id: string;
  name: string;
  ats: 'lever' | 'greenhouse';
  slug: string;
  tier: string;
  sector: string;
  headquarters: string;
  website: string;
}

export interface LiveVerifiedRole {
  id: string;
  title: string;
  level: string;
  desc: string;
  location: string;
  workplaceType: 'remote' | 'hybrid' | 'on-site' | 'unspecified';
  team?: string;
  department?: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
  confidence: 'high';
  status: 'verified';
  contentHash: string;
  competencies: string[];
  requiredSkills: string[];
  toolsAndTech: string[];
  responsibilities: string[];
  requiredQualifications: string[];
  fullText?: string;
}

export interface LiveCompanyData {
  companyId: string;
  companyName: string;
  ats: 'lever' | 'greenhouse';
  slug: string;
  tier: string;
  sector: string;
  headquarters: string;
  website: string;
  lastSyncedAt: string;
  liveRoleCount: number;
  status: 'verified';
  confidence: 'high';
  roles: LiveVerifiedRole[];
}

export interface LiveMarketIndex {
  lastSyncTimestamp: string;
  totalLiveRoles: number;
  companyCount: number;
  cadence: '3-days';
  companies: Array<{
    companyId: string;
    companyName: string;
    ats: 'lever' | 'greenhouse';
    liveRoleCount: number;
    lastSyncedAt: string;
    topSkills: string[];
  }>;
}

// ── Helpers ──

function isIndiaLocation(loc: string | null | undefined): boolean {
  if (!loc) return false;
  const l = loc.toLowerCase();
  if (
    /\b(india|bengaluru|bangalore|hyderabad|pune|gurgaon|gurugram|noida|mumbai|delhi|new delhi|chennai|kolkata|karnataka|telangana|maharashtra|haryana|tamil nadu)\b/i.test(
      l
    )
  ) {
    return true;
  }
  if (/\b(remote\s*[-–,]\s*(?:global|worldwide|apac|anywhere))\b/i.test(l)) {
    return true;
  }
  return false;
}

function isTechRole(title: string, department?: string): boolean {
  const t = `${title} ${department || ''}`.toLowerCase();
  return /\b(software|engineer|developer|architect|backend|frontend|full[- ]?stack|platform|infra|infrastructure|cloud|devops|sre|site reliability|data|machine learning|ml|ai|deep learning|security|appsec|qa|quality|sdet|test automation|mobile|ios|android|firmware|distributed systems|engineering manager|tech lead|lead engineer|staff engineer|principal engineer)\b/i.test(
    t
  );
}

function extractSeniorityLevel(title: string): string {
  const t = title.toLowerCase();
  if (/\b(principal|distinguished|fellow)\b/i.test(t)) return 'Principal';
  if (/\b(staff|architect)\b/i.test(t)) return 'Staff';
  if (/\b(lead|tech lead|team lead)\b/i.test(t)) return 'Lead';
  if (/\b(director|vp|head)\b/i.test(t)) return 'Director / Leadership';
  if (/\b(manager|em)\b/i.test(t)) return 'Engineering Manager';
  if (/\b(senior|sr\.?|iii|3)\b/i.test(t)) return 'Senior';
  if (/\b(ii|2|mid)\b/i.test(t)) return 'Mid-Level (L2/SDE-2)';
  if (/\b(intern|internship|trainee|apprentice)\b/i.test(t)) return 'Intern';
  if (/\b(junior|jr\.?|associate|entry|i|1|fresher|graduate)\b/i.test(t))
    return 'Entry / Fresher (L1/SDE-1)';
  return 'Mid-Level';
}

function decodeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

function htmlToBullets(html: string): string[] {
  const decoded = decodeHtml(html);
  const bullets: string[] = [];
  const liMatches = decoded.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (liMatches) {
    for (const m of liMatches) {
      const clean = m
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (clean.length > 5) bullets.push(clean);
    }
  }
  return bullets;
}

function htmlToPlainText(html: string): string {
  const decoded = decodeHtml(html);
  return decoded
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

function mapSkillsToCompetencies(skills: string[]): string[] {
  const compSet = new Set<string>();
  const sl = skills.map((s) => s.toLowerCase());

  if (sl.some((s) => s.includes('java') || s.includes('spring'))) compSet.add('java');
  if (sl.some((s) => s.includes('python') || s.includes('django') || s.includes('fastapi')))
    compSet.add('python');
  if (sl.some((s) => s.includes('go') || s.includes('golang'))) compSet.add('golang');
  if (sl.some((s) => s.includes('node') || s.includes('express') || s.includes('nest')))
    compSet.add('nodejs');
  if (sl.some((s) => s.includes('react') || s.includes('next') || s.includes('vue')))
    compSet.add('react');
  if (sl.some((s) => s.includes('typescript') || s.includes('javascript')))
    compSet.add('typescript');
  if (sl.some((s) => s.includes('aws') || s.includes('cloud') || s.includes('ec2') || s.includes('s3')))
    compSet.add('aws');
  if (sl.some((s) => s.includes('kubernetes') || s.includes('k8s') || s.includes('docker')))
    compSet.add('kubernetes');
  if (
    sl.some(
      (s) =>
        s.includes('machine learning') ||
        s.includes('pytorch') ||
        s.includes('tensorflow') ||
        s.includes('llm') ||
        s.includes('deep learning')
    )
  )
    compSet.add('ml');
  if (
    sl.some(
      (s) =>
        s.includes('sql') ||
        s.includes('postgres') ||
        s.includes('mysql') ||
        s.includes('mongo') ||
        s.includes('redis')
    )
  )
    compSet.add('databases');
  if (
    sl.some(
      (s) =>
        s.includes('ci/cd') ||
        s.includes('terraform') ||
        s.includes('sre') ||
        s.includes('devops') ||
        s.includes('ansible')
    )
  )
    compSet.add('devops');
  if (
    sl.some(
      (s) =>
        s.includes('security') ||
        s.includes('oauth') ||
        s.includes('jwt') ||
        s.includes('owasp')
    )
  )
    compSet.add('security');
  if (sl.some((s) => s.includes('swift') || s.includes('ios'))) compSet.add('swift');
  if (sl.some((s) => s.includes('kotlin') || s.includes('android'))) compSet.add('kotlin');

  // Default core software competencies
  if (compSet.size === 0) {
    compSet.add('systemdesign');
    compSet.add('dsa');
  } else {
    compSet.add('systemdesign');
  }

  return Array.from(compSet);
}

function computeContentHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// ── Ingestion Handlers ──

async function fetchLeverJobs(
  company: FlagshipRegistryEntry,
  nowIso: string
): Promise<LiveVerifiedRole[]> {
  const url = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) {
    throw new Error(`Lever returned HTTP ${response.status}: ${response.statusText}`);
  }

  const postings = (await response.json()) as any[];
  const verifiedRoles: LiveVerifiedRole[] = [];

  for (const post of postings) {
    const loc = post.categories?.location || '';
    const team = post.categories?.team || '';
    const department = post.categories?.department || '';
    const title = post.text || '';

    // Check India location filter
    if (!isIndiaLocation(loc)) continue;

    // Check tech role filter
    if (!isTechRole(title, `${team} ${department}`)) continue;

    // Build raw text body for skill extraction
    let fullText = `${title}\n\n`;
    if (post.descriptionPlain) fullText += `${post.descriptionPlain}\n\n`;

    const responsibilities: string[] = [];
    const qualifications: string[] = [];

    if (Array.isArray(post.lists)) {
      for (const list of post.lists) {
        const heading = (list.text || '').toLowerCase();
        const bullets = htmlToBullets(list.content || '');
        fullText += `${list.text || ''}:\n${bullets.join('\n')}\n\n`;

        if (/responsibilit|do|role|what you'?ll do|deliver|build/i.test(heading)) {
          responsibilities.push(...bullets);
        } else if (/qualifi|need|requirement|look|experience|bring/i.test(heading)) {
          qualifications.push(...bullets);
        }
      }
    }

    if (post.additionalPlain) fullText += `\n${post.additionalPlain}`;

    // Extract canonical skills
    const mentions = extractSkills(fullText);
    const deduped = getDeduplicatedSkills(mentions);
    const extractedSkills = Array.from(deduped.values()).map((m) => m.canonicalId);
    const competencies = mapSkillsToCompetencies(extractedSkills);
    const level = extractSeniorityLevel(title);

    // Workplace type
    const commitment = (post.categories?.commitment || '').toLowerCase();
    let workplaceType: LiveVerifiedRole['workplaceType'] = 'unspecified';
    if (/remote/i.test(loc) || /remote/i.test(commitment)) workplaceType = 'remote';
    else if (/hybrid/i.test(loc) || /hybrid/i.test(commitment)) workplaceType = 'hybrid';
    else if (/on-site|onsite|office/i.test(loc) || /on-site/i.test(commitment)) workplaceType = 'on-site';

    const cleanDesc = post.descriptionPlain
      ? post.descriptionPlain.slice(0, 320).trim() + (post.descriptionPlain.length > 320 ? '...' : '')
      : `Official live role verified directly from ${company.name}'s Lever career feed.`;

    const contentHash = computeContentHash(`${title}|${loc}|${fullText}`);

    verifiedRoles.push({
      id: `lever-${post.id}`,
      title,
      level,
      desc: cleanDesc,
      location: loc || 'Bengaluru, India',
      workplaceType,
      team: team || undefined,
      department: department || undefined,
      source: `Official ${company.name} Lever ATS Feed`,
      sourceUrl: post.hostedUrl || post.applyUrl || company.website,
      lastVerified: nowIso,
      confidence: 'high',
      status: 'verified',
      contentHash,
      competencies,
      requiredSkills: extractedSkills.slice(0, 15),
      toolsAndTech: extractedSkills.slice(0, 15),
      responsibilities: responsibilities.slice(0, 8),
      requiredQualifications: qualifications.slice(0, 8),
      fullText: fullText.slice(0, 3500),
    });
  }

  return verifiedRoles;
}

async function fetchGreenhouseJobs(
  company: FlagshipRegistryEntry,
  nowIso: string
): Promise<LiveVerifiedRole[]> {
  // Step 1: Fast fetch board listing without bulky content
  const listUrl = `https://api.greenhouse.io/v1/boards/${company.slug}/jobs`;
  const listRes = await fetch(listUrl, { signal: AbortSignal.timeout(15000) });
  if (!listRes.ok) {
    throw new Error(`Greenhouse listing returned HTTP ${listRes.status}: ${listRes.statusText}`);
  }

  const listData = (await listRes.json()) as { jobs?: any[] };
  const allJobs = listData.jobs || [];

  // Step 2: Filter for India tech jobs
  const matchingJobs = allJobs.filter((j) => {
    const loc = j.location?.name || '';
    const title = j.title || '';
    const departments = (j.departments || []).map((d: any) => d.name).join(', ');
    return isIndiaLocation(loc) && isTechRole(title, departments);
  });

  const verifiedRoles: LiveVerifiedRole[] = [];

  // Step 3: Fetch detail in parallel with concurrency pool of 6
  const fetchDetail = async (job: any): Promise<LiveVerifiedRole | null> => {
    try {
      const detailUrl = `https://api.greenhouse.io/v1/boards/${company.slug}/jobs/${job.id}`;
      const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(10000) });
      const detail = detailRes.ok ? await detailRes.json() : job;

      const loc = detail.location?.name || job.location?.name || 'Bengaluru, India';
      const title = detail.title || job.title || '';
      const departments = (detail.departments || job.departments || []).map((d: any) => d.name).join(', ');

      const rawHtml = detail.content || '';
      const plainText = htmlToPlainText(rawHtml);
      const bullets = htmlToBullets(rawHtml);
      const fullText = `${title}\n\nLocation: ${loc}\nDepartment: ${departments}\n\n${plainText}`;

      const responsibilities: string[] = [];
      const qualifications: string[] = [];

      for (const bullet of bullets) {
        if (/experience|proficiency|bachelor|degree|years|proficient|knowledge of|familiar with/i.test(bullet)) {
          qualifications.push(bullet);
        } else {
          responsibilities.push(bullet);
        }
      }

      const mentions = extractSkills(fullText);
      const deduped = getDeduplicatedSkills(mentions);
      const extractedSkills = Array.from(deduped.values()).map((m) => m.canonicalId);
      const competencies = mapSkillsToCompetencies(extractedSkills);
      const level = extractSeniorityLevel(title);

      let workplaceType: LiveVerifiedRole['workplaceType'] = 'unspecified';
      if (/remote/i.test(loc)) workplaceType = 'remote';
      else if (/hybrid/i.test(loc)) workplaceType = 'hybrid';
      else if (/on-site|office/i.test(loc)) workplaceType = 'on-site';

      const cleanDesc = plainText
        ? plainText.slice(0, 320).trim() + (plainText.length > 320 ? '...' : '')
        : `Official live role verified directly from ${company.name}'s Greenhouse career feed.`;

      const contentHash = computeContentHash(`${title}|${loc}|${fullText}`);

      return {
        id: `gh-${job.id}`,
        title,
        level,
        desc: cleanDesc,
        location: loc,
        workplaceType,
        department: departments || undefined,
        source: `Official ${company.name} Greenhouse ATS Feed`,
        sourceUrl: detail.absolute_url || job.absolute_url || company.website,
        lastVerified: nowIso,
        confidence: 'high',
        status: 'verified',
        contentHash,
        competencies,
        requiredSkills: extractedSkills.slice(0, 15),
        toolsAndTech: extractedSkills.slice(0, 15),
        responsibilities: responsibilities.slice(0, 8),
        requiredQualifications: qualifications.slice(0, 8),
        fullText: fullText.slice(0, 3500),
      };
    } catch {
      return null;
    }
  };

  // Run in chunks of 6
  const chunkSize = 6;
  for (let i = 0; i < matchingJobs.length; i += chunkSize) {
    const chunk = matchingJobs.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map((j) => fetchDetail(j)));
    for (const res of chunkResults) {
      if (res) verifiedRoles.push(res);
    }
  }

  return verifiedRoles;
}

// ── Main Pipeline Runner ──

export async function runLiveMarketSync(): Promise<LiveMarketIndex> {
  const rootDir = process.cwd();
  const registryPath = path.join(
    rootDir,
    'src',
    'data',
    'market',
    'registry',
    'flagshipRegistry.json'
  );
  const outputDir = path.join(rootDir, 'src', 'data', 'market', 'live-companies');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const rawRegistry = fs.readFileSync(registryPath, 'utf8');
  const registry: FlagshipRegistryEntry[] = JSON.parse(rawRegistry);

  const nowIso = new Date().toISOString();
  console.log(`\n============================================================`);
  console.log(`[HireFlow Live ATS Sync] Starting 3-Day Ingestion Pipeline`);
  console.log(`Timestamp: ${nowIso}`);
  console.log(`Registry size: ${registry.length} flagship companies`);
  console.log(`============================================================\n`);

  let totalLiveRoles = 0;
  const indexCompanies: LiveMarketIndex['companies'] = [];

  for (const company of registry) {
    const companyFilePath = path.join(outputDir, `${company.id}.json`);
    let roles: LiveVerifiedRole[] = [];

    try {
      console.log(`-> Ingesting [${company.name}] via ${company.ats.toUpperCase()} (${company.slug})...`);
      if (company.ats === 'lever') {
        roles = await fetchLeverJobs(company, nowIso);
      } else if (company.ats === 'greenhouse') {
        roles = await fetchGreenhouseJobs(company, nowIso);
      }

      console.log(`   ✓ Ingested ${roles.length} verified India tech roles for ${company.name}`);

      const companyData: LiveCompanyData = {
        companyId: company.id,
        companyName: company.name,
        ats: company.ats,
        slug: company.slug,
        tier: company.tier,
        sector: company.sector,
        headquarters: company.headquarters,
        website: company.website,
        lastSyncedAt: nowIso,
        liveRoleCount: roles.length,
        status: 'verified',
        confidence: 'high',
        roles,
      };

      fs.writeFileSync(companyFilePath, JSON.stringify(companyData, null, 2), 'utf8');

      // Aggregate top skills for summary index
      const skillFreq = new Map<string, number>();
      for (const r of roles) {
        for (const s of r.requiredSkills) {
          skillFreq.set(s, (skillFreq.get(s) || 0) + 1);
        }
      }
      const topSkills = Array.from(skillFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([s]) => s);

      indexCompanies.push({
        companyId: company.id,
        companyName: company.name,
        ats: company.ats,
        liveRoleCount: roles.length,
        lastSyncedAt: nowIso,
        topSkills,
      });

      totalLiveRoles += roles.length;
    } catch (err: any) {
      console.error(`   ✗ Failed to ingest ${company.name}: ${err?.message || err}`);

      // If existing file exists, keep it as fallback
      if (fs.existsSync(companyFilePath)) {
        try {
          const cached = JSON.parse(fs.readFileSync(companyFilePath, 'utf8')) as LiveCompanyData;
          console.log(`   ⚠️ Retaining ${cached.roles.length} cached roles from previous sync`);
          indexCompanies.push({
            companyId: company.id,
            companyName: company.name,
            ats: company.ats,
            liveRoleCount: cached.roles.length,
            lastSyncedAt: cached.lastSyncedAt,
            topSkills: [],
          });
          totalLiveRoles += cached.roles.length;
        } catch {
          // ignore corrupted cache
        }
      }
    }
  }

  const marketIndex: LiveMarketIndex = {
    lastSyncTimestamp: nowIso,
    totalLiveRoles,
    companyCount: indexCompanies.length,
    cadence: '3-days',
    companies: indexCompanies,
  };

  const indexPath = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(marketIndex, null, 2), 'utf8');

  console.log(`\n============================================================`);
  console.log(`[HireFlow Live ATS Sync] Completed Ingestion`);
  console.log(`Total Verified India Roles: ${totalLiveRoles}`);
  console.log(`Companies Indexed: ${indexCompanies.length}`);
  console.log(`Index written: ${indexPath}`);
  console.log(`============================================================\n`);

  return marketIndex;
}

// Direct execution guard
if (process.argv[1] && process.argv[1].includes('sync-live-jobs')) {
  runLiveMarketSync()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal sync failure:', err);
      process.exit(1);
    });
}
