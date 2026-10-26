// ============================================================
// Pathways Fetch Helper
// Enforces Constitution Rules B4/H4, H6 (Rate limit, caps, honest UA, cache)
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const CACHE_DIR = path.join(ROOT_DIR, '.evidence-cache');
const FETCH_LOG_FILE = path.join(ROOT_DIR, 'docs', 'pathways', 'fetch-log.jsonl');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const DOMAIN_LAST_REQUEST = new Map();
const SUBJECT_REQUEST_COUNTS = new Map();

export function getUrlCacheHash(url) {
  return crypto.createHash('sha256').update(url.trim()).digest('hex');
}

export function getCachedText(url) {
  const hash = getUrlCacheHash(url);
  const cachePath = path.join(CACHE_DIR, `${hash}.txt`);
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, 'utf8');
  }
  return null;
}

export function saveCachedText(url, text) {
  const hash = getUrlCacheHash(url);
  const cachePath = path.join(CACHE_DIR, `${hash}.txt`);
  fs.writeFileSync(cachePath, text, 'utf8');
  return hash;
}

export function appendFetchLog(entry) {
  const record = {
    url: entry.url,
    httpStatus: entry.httpStatus,
    timestamp: entry.timestamp || new Date().toISOString(),
    subjectId: entry.subjectId,
  };
  fs.appendFileSync(FETCH_LOG_FILE, JSON.stringify(record) + '\n', 'utf8');
}

export function readFetchLog() {
  if (!fs.existsSync(FETCH_LOG_FILE)) return [];
  const lines = fs.readFileSync(FETCH_LOG_FILE, 'utf8').split('\n').filter(Boolean);
  return lines.map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

export async function fetchWithEtiquette(url, subjectId, options = {}) {
  // Cap at 6 pages per subject
  const currentCount = SUBJECT_REQUEST_COUNTS.get(subjectId) || 0;
  if (currentCount >= 6) {
    throw new Error(`Subject "${subjectId}" exceeded 6 page cap per Constitution H6`);
  }

  // Domain rate limit (at most 1 request per 2 seconds)
  const domain = new URL(url).hostname;
  const lastTime = DOMAIN_LAST_REQUEST.get(domain) || 0;
  const elapsed = Date.now() - lastTime;
  if (elapsed < 2000) {
    const waitMs = 2000 - elapsed;
    await new Promise((r) => setTimeout(r, waitMs));
  }
  DOMAIN_LAST_REQUEST.set(domain, Date.now());
  SUBJECT_REQUEST_COUNTS.set(subjectId, currentCount + 1);

  const headers = {
    'User-Agent': 'Pathways-Verification-Bot/1.0 (+https://github.com/Mohit-Rocky-25/hireflow; honest verification bot)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    ...options.headers,
  };

  try {
    const res = await fetch(url, { headers, redirect: 'follow' });
    const status = res.status;
    const timestamp = new Date().toISOString();

    appendFetchLog({ url, httpStatus: status, timestamp, subjectId });

    if (status === 429 || status === 403) {
      throw new Error(`HTTP ${status} encountered on ${url}. Subject "${subjectId}" quarantined per Constitution H6.`);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${status} response from ${url}`);
    }

    const html = await res.text();
    // Strip scripts/styles and extract clean readable text
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    saveCachedText(url, cleanText);
    return { text: cleanText, httpStatus: status };
  } catch (err) {
    appendFetchLog({ url, httpStatus: 0, timestamp: new Date().toISOString(), subjectId });
    throw err;
  }
}
