import { NormalizedSectionChunk } from '../normalize';
import {
  CanonicalResume,
  Header,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillGroup,
  AchievementItem,
  CertificationItem,
  CustomSection,
  NeedsReviewBlock,
  LinkItem,
  DATE_GRAMMAR_REGEX
} from '../schema';

const ACTION_VERB_REGEX =
  /^(?:architected|authored|built|conducted|configured|created|deployed|designed|developed|directed|engineered|executed|facilitated|formulated|implemented|initiated|integrated|led|managed|mentored|modeled|modified|monitored|optimized|organized|overhauled|performed|programmed|published|re-signed|rebuilt|redesigned|reduced|resolved|reverse\s*engineered|reviewed|scaled|spearheaded|supervised|triaged|wrote|attempted|competed)\b/i;

const CANONICAL_SKILL_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  rust: 'Rust',
  golang: 'Go',
  go: 'Go',
  'c++': 'C++',
  c: 'C',
  sql: 'SQL',
  html: 'HTML5',
  html5: 'HTML5',
  css: 'CSS3',
  css3: 'CSS3',
  react: 'React',
  'react.js': 'React',
  'react native': 'React Native',
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  express: 'Express',
  'express.js': 'Express',
  'next.js': 'Next.js',
  nextjs: 'Next.js',
  redux: 'Redux',
  tailwindcss: 'Tailwind CSS',
  tailwind: 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  aws: 'AWS',
  gcp: 'Google Cloud Platform',
  azure: 'Azure',
  linux: 'Linux',
  bash: 'Bash',
  powershell: 'PowerShell',
  wireshark: 'Wireshark',
  nmap: 'Nmap',
  jadx: 'JADX',
  apktool: 'APKTool',
  adb: 'ADB',
  'android studio': 'Android Studio',
  'android studio emulator': 'Android Studio Emulator',
  'cisco packet tracer': 'Cisco Packet Tracer',
  'owasp top 10': 'OWASP Top 10',
  'owasp mastg': 'OWASP MASTG',
  'tcp/ip': 'TCP/IP',
  'osi model': 'OSI Model',
  git: 'Git',
  github: 'GitHub',
  'github actions': 'GitHub Actions',
  figma: 'Figma',
  figjam: 'FigJam',
  jest: 'Jest',
  postman: 'Postman'
};

export function routeResumeContent(chunks: NormalizedSectionChunk[]): CanonicalResume {
  let header: Header = { name: 'Candidate Name', email: 'candidate@email.com', links: [] };
  let summary: string | undefined = undefined;
  const education: EducationItem[] = [];
  const experience: ExperienceItem[] = [];
  const projects: ProjectItem[] = [];
  const unmergedSkillGroups: SkillGroup[] = [];
  const achievements: AchievementItem[] = [];
  const leadership: ExperienceItem[] = [];
  const certifications: CertificationItem[] = [];
  const custom: CustomSection[] = [];
  const needs_review: NeedsReviewBlock[] = [];

  for (const chunk of chunks) {
    const hint = chunk.normalizedKindHint || 'custom';

    switch (hint) {
      case 'header': {
        header = parseHeaderChunk(chunk, needs_review);
        break;
      }

      case 'summary': {
        summary = chunk.blocks.map((b) => b.rawText).join(' ').trim();
        break;
      }

      case 'education': {
        parseEducationChunk(chunk, education, needs_review);
        break;
      }

      case 'experience': {
        parseExperienceChunk(chunk, experience, needs_review);
        break;
      }

      case 'projects': {
        parseProjectsChunk(chunk, projects, achievements, needs_review);
        break;
      }

      case 'skills': {
        parseSkillsChunk(chunk, unmergedSkillGroups, projects, experience, needs_review);
        break;
      }

      case 'leadership': {
        parseLeadershipChunk(chunk, leadership, needs_review);
        break;
      }

      case 'certifications': {
        parseCertificationsChunk(chunk, certifications, needs_review);
        break;
      }

      case 'achievements': {
        parseAchievementsChunk(chunk, achievements, needs_review);
        break;
      }

      default: {
        custom.push({
          heading: chunk.rawHeading,
          items: chunk.blocks.map((b) => b.rawText)
        });
        break;
      }
    }
  }

  // Stage 3 Skills Merging Rules:
  // 1. Merge groups with fewer than 2 items into the nearest related group
  // 2. Target 3 to 5 groups, 3 to 10 items each
  // 3. Deduplicate case-insensitively
  const mergedGroups = mergeSkillGroups(unmergedSkillGroups);

  return {
    header,
    summary,
    education,
    experience,
    projects,
    skills: { groups: mergedGroups },
    achievements,
    leadership,
    certifications,
    custom,
    needs_review,
    suggestions: []
  };
}

// -------------------------------------------------------------
// Header Chunk Parser
// -------------------------------------------------------------
function parseHeaderChunk(chunk: NormalizedSectionChunk, needs_review: NeedsReviewBlock[]): Header {
  const allLines = chunk.blocks.map((b) => b.rawText);
  if (allLines.length === 0) {
    return { name: 'Candidate Name', email: 'candidate@email.com', links: [] };
  }

  const firstLine = allLines[0];
  let name = firstLine;
  let title: string | undefined = undefined;

  // Split name and title if e.g. "JESWANTH POSINA CYBERSECURITY" or "SARAH JENKINS, BSN, RN"
  if (name.includes(',') && !name.includes('@')) {
    const parts = name.split(',').map((p) => p.trim());
    name = parts[0];
    title = parts.slice(1).join(', ');
  } else if (/^[A-Z\s]{4,}\s+[A-Z][a-z]+/i.test(name)) {
    const tokens = name.split(/\s+/);
    if (tokens.length >= 3 && /^(?:CYBERSECURITY|ENGINEER|DEVELOPER|DESIGNER|MANAGER|ANALYST)$/i.test(tokens[tokens.length - 1])) {
      title = tokens[tokens.length - 1];
      name = tokens.slice(0, -1).join(' ');
    }
  }

  let email = 'candidate@email.com';
  let phone: string | undefined = undefined;
  let location: string | undefined = undefined;
  const links: LinkItem[] = [];

  const remainingText = allLines.slice(1).join(' | ');
  const tokens = remainingText.split(/(?:\s+[|•·]\s+|\s{2,}|\t)/).map((t) => t.trim()).filter(Boolean);

  for (const token of tokens) {
    if (token.includes('@') && token.includes('.')) {
      email = token;
    } else if (/^(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}$/.test(token.trim())) {
      phone = token;
    } else if (
      /(?:linkedin\.com|github\.com|portfolio|behance|gitlab|twitter|medium|\.co|\.dev|\.io|\.org|\.net)/i.test(token)
    ) {
      let label = 'Portfolio';
      if (/linkedin\.com/i.test(token)) label = 'LinkedIn';
      else if (/github\.com/i.test(token)) label = 'GitHub';
      links.push({ label, url: token.replace(/^(?:https?:\/\/)?/, '') });
    } else if (/^[A-Za-z\s.,-]+,\s*[A-Za-z\s]{2,15}$/.test(token)) {
      location = token;
    } else if (token.length > 2 && token.length < 35 && !title) {
      title = token;
    }
  }

  return { name, title, email, phone, location, links };
}

// -------------------------------------------------------------
// Education Chunk Parser
// -------------------------------------------------------------
function parseEducationChunk(
  chunk: NormalizedSectionChunk,
  outEdu: EducationItem[],
  needs_review: NeedsReviewBlock[]
): void {
  const lines = chunk.blocks.map((b) => b.rawText);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Single-line format: pipe or dash delimited
    // "M.S. in Computer Science | University of Washington | 2015 – 2017"
    // "B.S. in Computer Science - Oregon State University - 2018 - 2022"
    const hasPipe = line.includes('|');
    const hasDash = line.includes(' - ');

    if (hasPipe || hasDash) {
      const parts = (hasPipe ? line.split('|') : line.split(/\s+-\s+/)).map((p) => p.trim());
      const degree = parts[0];
      const institution = parts[1] || 'University';
      let start: string | undefined = undefined;
      let end: string | undefined = undefined;
      let expected: boolean | undefined = undefined;
      let gpa: string | undefined = undefined;

      for (let pIdx = 2; pIdx < parts.length; pIdx++) {
        const p = parts[pIdx];
        if (/\bexpected\b/i.test(p)) {
          expected = true;
        }
        if (/\b(?:cgpa|gpa)\b/i.test(p)) {
          gpa = p.replace(/^(?:cgpa|gpa)[:\s]*/i, '').trim();
          continue;
        }
        const cleanP = p.replace(/\(?expected\)?/i, '').trim();
        const dateMatch = cleanP.match(/((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present)/i);
        if (dateMatch) {
          start = dateMatch[1];
          end = dateMatch[2];
        } else if (cleanP) {
          end = cleanP;
        }
      }

      outEdu.push({ degree, institution, start, end, expected, gpa });
      i++;
      continue;
    }

    // Multi-line format:
    // Line 0: Degree
    // Line 1: Institution
    // Line 2: Dates / GPA
    const degree = line;
    const institution = lines[i + 1] || 'University';
    let start: string | undefined = undefined;
    let end: string | undefined = undefined;
    let expected: boolean | undefined = undefined;
    let gpa: string | undefined = undefined;

    let offset = 2;
    while (i + offset < lines.length) {
      const subLine = lines[i + offset];
      const dateMatch = subLine.match(/((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present)/i);
      const gpaMatch = subLine.match(/(?:CGPA|GPA):\s*([\d.]+(?:\s*\/\s*[\d.]+)?)/i);

      if (/\bexpected\b/i.test(subLine)) {
        expected = true;
      }

      if (dateMatch) {
        start = dateMatch[1];
        end = dateMatch[2];
        offset++;
      } else if (gpaMatch) {
        gpa = gpaMatch[1];
        offset++;
      } else if (subLine.toLowerCase().includes('cum laude')) {
        offset++;
      } else {
        break;
      }
    }

    outEdu.push({ degree, institution, start, end, expected, gpa });
    i += offset;
  }
}

// -------------------------------------------------------------
// Experience Chunk Parser
function appendOrMergeBullet(
  bullets: string[],
  cleanLine: string,
  sectionName: string,
  needs_review: NeedsReviewBlock[]
): void {
  const isFragment = /^[a-z]/.test(cleanLine);
  if (isFragment) {
    if (bullets.length > 0) {
      bullets[bullets.length - 1] += ' ' + cleanLine;
    } else {
      needs_review.push({
        id: `rev-frag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        rawText: cleanLine,
        candidateSection: sectionName,
        confidence: 0.5,
        reason: 'Sentence fragment starting with lowercase letter cannot be merged'
      });
    }
  } else {
    bullets.push(cleanLine);
  }
}

// -------------------------------------------------------------
function parseExperienceChunk(
  chunk: NormalizedSectionChunk,
  outExp: ExperienceItem[],
  needs_review: NeedsReviewBlock[]
): void {
  const lines = chunk.blocks.map((b) => b.rawText);
  let current: ExperienceItem | null = null;

  for (const line of lines) {
    const isBullet = /^[-•*●▪‣]\s*/.test(line);

    if (isBullet && current) {
      const cleanBullet = line.replace(/^[-•*●▪‣]\s*/, '').trim();
      appendOrMergeBullet(current.bullets, cleanBullet, 'experience', needs_review);
      continue;
    }

    // Role line e.g. "Staff Backend Engineer | Stripe | San Francisco, CA | Mar 2021 – Present"
    // or "Backend Developer - CloudCo Inc - Portland, OR - 2022 - present"
    const delimiter = line.includes('|') ? '|' : line.includes(' - ') ? ' - ' : null;

    if (delimiter) {
      const parts = line.split(delimiter).map((p) => p.trim());
      const role = parts[0];
      const org = parts[1] || 'Company';
      const loc = parts.length >= 4 ? parts[2] : undefined;
      const dateStr = parts[parts.length - 1];

      let start: string | undefined = undefined;
      let end: string | undefined = undefined;
      const dateMatch = dateStr.match(/([A-Za-z]{3,}\s+\d{4}|\d{4})\s*[-–—]\s*([A-Za-z]{3,}\s+\d{4}|\d{4}|present)/i);
      if (dateMatch) {
        start = dateMatch[1];
        end = dateMatch[2];
      }

      current = {
        role,
        org,
        location: loc,
        start,
        end,
        bullets: []
      };
      outExp.push(current);
    } else if (current && (ACTION_VERB_REGEX.test(line) || line.split(/\s+/).length > 7)) {
      appendOrMergeBullet(current.bullets, line.trim(), 'experience', needs_review);
    } else if (!current) {
      current = {
        role: line,
        org: 'Company',
        bullets: []
      };
      outExp.push(current);
    }
  }
}

// -------------------------------------------------------------
// Projects Chunk Parser
// -------------------------------------------------------------
function parseProjectsChunk(
  chunk: NormalizedSectionChunk,
  outProj: ProjectItem[],
  outAch: AchievementItem[],
  needs_review: NeedsReviewBlock[]
): void {
  const lines = chunk.blocks.map((b) => b.rawText);
  let current: ProjectItem | null = null;
  const COMPETITION_REGEX = /\b(?:contest|ctf|competition|hackathon|rank|award|winner)\b/i;

  const commitProject = (p: ProjectItem | null) => {
    if (!p) return;
    const isCompetition = COMPETITION_REGEX.test(p.name) || COMPETITION_REGEX.test(p.bullets.join(' '));
    if (isCompetition) {
      outAch.push({
        title: p.name,
        date: p.date,
        bullets: p.bullets
      });
    } else {
      outProj.push(p);
    }
  };

  for (const line of lines) {
    const isBullet = /^[-•*●▪‣]\s*/.test(line);
    const isAction = ACTION_VERB_REGEX.test(line) || (line.split(/\s+/).length > 6 && /[.!?]$/.test(line));

    if (isBullet || (current && isAction)) {
      const cleanBullet = line.replace(/^[-•*●▪‣]\s*/, '').trim();
      if (!current) {
        current = { name: 'Technical Project', stack: [], bullets: [] };
      }
      appendOrMergeBullet(current.bullets, cleanBullet, 'projects', needs_review);

      // Extract known tools mentioned in bullet to current.stack
      for (const [key, canonical] of Object.entries(CANONICAL_SKILL_NAMES)) {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`(?:^|\\W)${escapedKey}(?:$|\\W)`, 'i').test(cleanBullet)) {
          if (!current.stack.includes(canonical)) {
            current.stack.push(canonical);
          }
        }
      }
      continue;
    }

    // Title line e.g. "FinFlow Mobile Banking Redesign | React Native, Figma | 2023"
    // or "Android Application Security Assessment (AndroGoat) 2026"
    commitProject(current);

    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim());
      const name = parts[0];
      const stack: string[] = [];
      let date: string | undefined = undefined;

      for (let i = 1; i < parts.length; i++) {
        const p = parts[i];
        if (DATE_GRAMMAR_REGEX.test(p)) {
          date = p;
        } else {
          const tools = p.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
          stack.push(...tools);
        }
      }

      current = { name, stack, date, bullets: [] };
    } else {
      let name = line;
      let date: string | undefined = undefined;

      const yearMatch = line.match(/\s+((?:19|20)\d{2}(?:\s*[-–—]\s*(?:present|(?:19|20)\d{2}))?)$/i);
      if (yearMatch) {
        date = yearMatch[1].trim();
        name = line.slice(0, yearMatch.index).trim();
      }

      current = { name, stack: [], date, bullets: [] };
    }
  }

  commitProject(current);
}

// -------------------------------------------------------------
// Skills Chunk Parser (Enforces Atomic Tokens + Sentence Reroute)
// -------------------------------------------------------------
function parseSkillsChunk(
  chunk: NormalizedSectionChunk,
  outSkillGroups: SkillGroup[],
  outProj: ProjectItem[],
  outExp: ExperienceItem[],
  needs_review: NeedsReviewBlock[]
): void {
  const lines = chunk.blocks.map((b) => b.rawText);

  for (const line of lines) {
    // Check if line is an accidental project / experience action verb sentence:
    // e.g. "Performed static analysis with JADX..."
    if (ACTION_VERB_REGEX.test(line) && line.split(/\s+/).length > 6) {
      if (outProj.length > 0) {
        outProj[outProj.length - 1].bullets.push(line.replace(/^[-•*●▪‣]\s*/, '').trim());
      } else {
        needs_review.push({
          id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          rawText: line,
          candidateSection: 'projects',
          confidence: 0.65,
          reason: 'Action verb sentence found inside skills section'
        });
      }
      continue;
    }

    const colonMatch = line.match(/^([A-Za-z0-9\s&/]{2,35})\s*[:–—]\s*(.+)$/);
    if (colonMatch) {
      const rawLabel = colonMatch[1].trim();
      const rawClause = colonMatch[2].trim();

      const tokens = rawClause
        .split(/[,|•●▪‣;]|(?<=[^,])\s*[-–—]\s+/)
        .map((t) => t.trim())
        .filter(Boolean);

      const items: string[] = [];
      for (const t of tokens) {
        // Reroute check: If item is > 6 words or action verb, NOT a skill!
        if (t.split(/\s+/).length > 6 || ACTION_VERB_REGEX.test(t)) {
          if (outProj.length > 0) {
            outProj[outProj.length - 1].bullets.push(t);
          } else {
            needs_review.push({
              id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              rawText: t,
              candidateSection: 'projects',
              confidence: 0.6,
              reason: 'Long sentence inside skill token clause'
            });
          }
          continue;
        }

        const canonical = CANONICAL_SKILL_NAMES[t.toLowerCase()] || t;
        if (!items.includes(canonical)) {
          items.push(canonical);
        }
      }

      if (items.length > 0) {
        outSkillGroups.push({ label: rawLabel, items });
      }
    } else {
      // Loose comma-separated skills: "Node.js, Express, Rust, Docker, PostgreSQL"
      const tokens = line.split(/[,|•●▪‣;]/).map((t) => t.trim()).filter(Boolean);
      const items: string[] = [];

      for (const t of tokens) {
        if (t.split(/\s+/).length > 6 || ACTION_VERB_REGEX.test(t)) continue;
        const canonical = CANONICAL_SKILL_NAMES[t.toLowerCase()] || t;
        if (!items.includes(canonical)) items.push(canonical);
      }

      if (items.length > 0) {
        outSkillGroups.push({ label: 'Technical Skills', items });
      }
    }
  }
}

// -------------------------------------------------------------
// Leadership & Involvement Parser
// -------------------------------------------------------------
function parseLeadershipChunk(
  chunk: NormalizedSectionChunk,
  outLead: ExperienceItem[],
  needs_review: NeedsReviewBlock[]
): void {
  const lines = chunk.blocks.map((b) => b.rawText);
  let current: ExperienceItem | null = null;

  for (const line of lines) {
    const isBullet = /^[-•*●▪‣]\s*/.test(line);

    if (isBullet && current) {
      const cleanBullet = line.replace(/^[-•*●▪‣]\s*/, '').trim();
      appendOrMergeBullet(current.bullets, cleanBullet, 'leadership', needs_review);
      continue;
    }

    if (line.includes('—') || line.includes('|') || line.includes(' - ')) {
      const parts = line.split(/[|—]|\s+-\s+/).map((p) => p.trim());
      const role = parts[0];
      const org = parts[1] || 'Organization';
      const dateStr = parts[parts.length - 1];

      current = { role, org, bullets: [] };
      const dateMatch = dateStr.match(/((?:19|20)\d{2})\s*[-–—]\s*(present|(?:19|20)\d{2})/i);
      if (dateMatch) {
        current.start = dateMatch[1];
        current.end = dateMatch[2];
      }
      outLead.push(current);
    } else if (!current) {
      current = { role: line, org: 'Community', bullets: [] };
      outLead.push(current);
    } else {
      appendOrMergeBullet(current.bullets, line.replace(/^[-•*●▪‣]\s*/, '').trim(), 'leadership', needs_review);
    }
  }
}

// -------------------------------------------------------------
// Certifications Chunk Parser (Typed Status)
// -------------------------------------------------------------
function splitMixedCertLine(clean: string): string[] {
  // Check if line mixes Completed / Coursework with In Progress (studying/preparing/currently)
  const inProgressMatch = clean.match(/^(.*?)(?:,\s*and\s+|\s+and\s+|;\s*)((?:studying|preparing|currently|in\s*progress)\b.*)$/i);
  if (inProgressMatch && inProgressMatch[1].trim() && inProgressMatch[2].trim()) {
    const part1 = inProgressMatch[1].trim();
    let part2 = inProgressMatch[2].trim();
    part2 = part2.charAt(0).toUpperCase() + part2.slice(1);
    return [part1, part2];
  }

  // Check if line mixes with Self-Directed Practice (labs/platforms/learning log)
  const practiceMatch = clean.match(/^(.*?)(?:,\s*and\s+|\s+and\s+|;\s*)((?:actively\s+)?(?:solving\s+)?(?:labs?|platforms?|learning\s*logs?)\b.*)$/i);
  if (practiceMatch && practiceMatch[1].trim() && practiceMatch[2].trim()) {
    const part1 = practiceMatch[1].trim();
    let part2 = practiceMatch[2].trim();
    part2 = part2.charAt(0).toUpperCase() + part2.slice(1);
    return [part1, part2];
  }

  return [clean];
}

function parseCertificationsChunk(
  chunk: NormalizedSectionChunk,
  outCerts: CertificationItem[],
  needs_review: NeedsReviewBlock[]
): void {
  const lines = chunk.blocks.map((b) => b.rawText);

  for (const line of lines) {
    const clean = line.replace(/^[-•*●▪‣]\s*/, '').trim();
    if (!clean) continue;

    // Fragment continuation check: merge into previous cert or send to needs_review
    if (/^[a-z]/.test(clean)) {
      if (outCerts.length > 0) {
        outCerts[outCerts.length - 1].name += ' and ' + clean;
      } else {
        needs_review.push({
          id: `rev-frag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          rawText: clean,
          candidateSection: 'certifications',
          confidence: 0.5,
          reason: 'Certification fragment starting with lowercase letter cannot be merged'
        });
      }
      continue;
    }

    const segments = splitMixedCertLine(clean);

    for (const seg of segments) {
      let status: 'completed' | 'in_progress' | 'practice' = 'completed';
      if (/\b(?:studying|preparing|currently|in\s*progress|pursuing|candidate)\b/i.test(seg)) {
        status = 'in_progress';
      } else if (/\b(?:labs?|platforms?|learning\s*logs?|portswigger|hack\s*the\s*box|tryhackme|leetcode|bug\s*hunting)\b/i.test(seg)) {
        status = 'practice';
      } else {
        status = 'completed';
      }

      let name = seg;
      let issuer: string | undefined = undefined;

      if (seg.includes('—')) {
        const parts = seg.split('—').map((p) => p.trim());
        name = parts[0];
        issuer = parts.slice(1).join(' — ');
      } else if (seg.includes('|')) {
        const parts = seg.split('|').map((p) => p.trim());
        name = parts[0];
        issuer = parts.slice(1).join(' | ');
      } else {
        const parenMatch = seg.match(/^(.*?)\s*\((.*?)\)$/);
        if (parenMatch) {
          name = parenMatch[1].trim();
          issuer = parenMatch[2].trim();
        }
      }

      // Ensure name starts capitalized
      if (name.length > 0) {
        name = name.charAt(0).toUpperCase() + name.slice(1);
      }

      outCerts.push({ name, issuer, status });
    }
  }
}

// -------------------------------------------------------------
// Achievements Chunk Parser
// -------------------------------------------------------------
function parseAchievementsChunk(
  chunk: NormalizedSectionChunk,
  outAch: AchievementItem[],
  needs_review: NeedsReviewBlock[]
): void {
  const lines = chunk.blocks.map((b) => b.rawText);

  for (const line of lines) {
    const clean = line.replace(/^[-•*●▪‣]\s*/, '').trim();
    if (!clean) continue;

    if (/^[a-z]/.test(clean)) {
      if (outAch.length > 0) {
        outAch[outAch.length - 1].title += ' ' + clean;
      } else {
        needs_review.push({
          id: `rev-frag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          rawText: clean,
          candidateSection: 'achievements',
          confidence: 0.5,
          reason: 'Achievement fragment starting with lowercase letter cannot be merged'
        });
      }
      continue;
    }

    outAch.push({ title: clean });
  }
}

// -------------------------------------------------------------
// Skills Merger: Merge single-item orphan groups into related groups
// -------------------------------------------------------------
function mergeSkillGroups(groups: SkillGroup[]): SkillGroup[] {
  if (groups.length <= 1) return groups;

  const validGroups: SkillGroup[] = [];
  const orphanItems: string[] = [];

  for (const group of groups) {
    if (group.items.length < 2) {
      orphanItems.push(...group.items);
    } else {
      validGroups.push(group);
    }
  }

  // If we had orphan items, merge them into the first group or create a "Tools & Platforms" group
  if (orphanItems.length > 0) {
    if (validGroups.length > 0) {
      for (const item of orphanItems) {
        if (!validGroups[0].items.includes(item)) {
          validGroups[0].items.push(item);
        }
      }
    } else {
      validGroups.push({ label: 'Core Technical Skills', items: orphanItems });
    }
  }

  return validGroups;
}
