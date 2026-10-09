// ============================================================
// Tailor Engine — Structure Recovery Coordinator
// Coordinates segmentation, specialized parsers, and invariant enforcement
// ============================================================

import { RecoveredResume, LeftOutItem, RecoveredSection } from './types';
import { segmentResumeText } from './inlineSegmenter';
import { parseHeader } from './headerParser';
import { parseEducationSection } from './educationParser';
import { parseSkillsSection } from './skillsParser';
import { parseProjectsSection } from './projectsParser';
import { parseLanguages, parseSocialLinks } from './languagesLinksParser';

export function recoverResumeStructure(rawText: string): RecoveredResume {
  const sections: RecoveredSection[] = segmentResumeText(rawText);
  const leftOut: LeftOutItem[] = [];
  const lowConfidenceNotes: string[] = [];

  // 1. Header Extraction
  const headerSec = sections.find((s) => s.kind === 'header');
  const header = parseHeader(headerSec ? headerSec.content : rawText.split('\n')[0] || '');

  // 2. Summary Extraction (Handling duplicate summaries)
  const summarySecs = sections.filter((s) => s.kind === 'summary');
  let chosenSummary = '';
  const duplicateSummaries: string[] = [];

  if (summarySecs.length === 1) {
    chosenSummary = summarySecs[0].content;
  } else if (summarySecs.length > 1) {
    // Score summaries based on length & technical keyword density
    const scored = summarySecs.map((s) => {
      const words = s.content.split(/\s+/).length;
      const techHits = (s.content.match(/\b(?:developer|engineer|java|python|react|node|iot|web|cloud|sql)\b/gi) || []).length;
      return { sec: s, score: words + techHits * 5 };
    });
    scored.sort((a, b) => b.score - a.score);

    chosenSummary = scored[0].sec.content;
    for (let i = 1; i < scored.length; i++) {
      const dup = scored[i].sec.content;
      duplicateSummaries.push(dup);
      leftOut.push({
        item: dup,
        reason: 'Duplicate summary paragraph moved to Left Out to conserve vertical page space.',
        section: 'Summary'
      });
    }
  }

  // 3. Education Extraction
  const eduSec = sections.find((s) => s.kind === 'education');
  const education = eduSec ? parseEducationSection(eduSec.content) : [];

  // 4. Projects Extraction
  const projSec = sections.find((s) => s.kind === 'projects');
  const projects = projSec ? parseProjectsSection(projSec.content) : [];

  // 5. Experience Extraction
  const expSec = sections.find((s) => s.kind === 'experience');
  const experience = expSec
    ? parseProjectsSection(expSec.content).map((p) => ({
        role: p.name,
        company: p.techStack[0] || 'Organization',
        bullets: p.bullets,
        rawLines: p.rawLines
      }))
    : [];

  // 6. Skills Extraction (with hidden skill detection from projects/summary)
  const contextToScan = [
    chosenSummary,
    ...projects.map((p) => `${p.name} ${p.techStack.join(' ')} ${p.bullets.join(' ')} ${p.rawLines.join(' ')}`),
    ...experience.map((e) => `${e.role} ${e.company} ${e.bullets.join(' ')} ${e.rawLines.join(' ')}`)
  ];
  const skillsSec = sections.find((s) => s.kind === 'skills');
  const skills = parseSkillsSection(skillsSec ? skillsSec.content : '', contextToScan);

  // 7. Languages Extraction
  const langSec = sections.find((s) => s.kind === 'languages');
  const languages = langSec ? parseLanguages(langSec.content) : [];

  // 8. Links Extraction
  const linkSec = sections.find((s) => s.kind === 'links');
  let links: string[] = [...header.links];
  if (linkSec) {
    const { professionalLinks, leftOut: linksLeftOut } = parseSocialLinks(linkSec.content);
    links.push(...professionalLinks);
    leftOut.push(...linksLeftOut);
  }
  // Deduplicate links
  links = Array.from(new Set(links));

  // 9. Padding / Declaration sections to Left Out
  const paddingSecs = sections.filter((s) => s.kind === 'padding');
  for (const pad of paddingSecs) {
    leftOut.push({
      item: pad.content,
      reason: 'Low-value padding / declaration omitted from modern technical resume.',
      section: pad.canonicalTitle
    });
  }

  // Calculate overall confidence
  let totalConfidence = 0;
  for (const s of sections) {
    totalConfidence += s.confidence;
    if (s.confidence < 0.6) {
      lowConfidenceNotes.push(`Boundary for '${s.canonicalTitle}' has lower confidence. Please verify section assignment.`);
    }
  }
  const confidenceScore = sections.length > 0 ? Math.round((totalConfidence / sections.length) * 100) / 100 : 0.5;

  const wordCount = rawText.trim().split(/\s+/).length;

  return {
    header,
    summary: chosenSummary,
    duplicateSummaries,
    education,
    skills,
    projects,
    experience,
    certifications: [],
    achievements: [],
    languages,
    links,
    leftOut,
    sections,
    confidenceScore,
    lowConfidenceNotes,
    wordCount
  };
}
