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
import { parseExperienceSection } from './experienceParser';
import { parseCertificationsSection } from './certificationsParser';
import { parseLeadershipSection } from './leadershipParser';
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
      const techHits = (s.content.match(/\b(?:developer|engineer|security|cybersecurity|cloud|java|python|react|node|iot|web|sql)\b/gi) || []).length;
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
  const eduContent = sections.filter((s) => s.kind === 'education').map((s) => s.content).join('\n');
  const education = eduContent ? parseEducationSection(eduContent) : [];

  // 4. Projects Extraction & Rescue Guard from Skills
  let projectsContent = sections.filter((s) => s.kind === 'projects').map((s) => s.content).join('\n');
  let skillsContent = sections.filter((s) => s.kind === 'skills').map((s) => s.content).join('\n');

  // Rescue Guard: If skillsContent contains an internal Projects heading within multi-line text
  const projectHeadingRegex = /\n\s*(?:(?:security|technical|academic|personal|hands-on|key)?\s*projects?(?:\s*(?:&|and)\s*(?:practical\s*experience|experience|labs|lab\s*work))?)\s*:?\s*(?:\n|$)/i;
  if (projectHeadingRegex.test(skillsContent)) {
    const matchIndex = skillsContent.search(projectHeadingRegex);
    if (matchIndex > 0) {
      const beforeHeading = skillsContent.slice(0, matchIndex).trim();
      const afterHeading = skillsContent.slice(matchIndex).replace(projectHeadingRegex, '').trim();
      if (beforeHeading.length > 0 && afterHeading.length > 0) {
        skillsContent = beforeHeading;
        projectsContent = (projectsContent ? projectsContent + '\n' : '') + afterHeading;
      }
    }
  }

  const projects = parseProjectsSection(projectsContent);

  // 5. Experience Extraction
  const expContent = sections.filter((s) => s.kind === 'experience').map((s) => s.content).join('\n');
  const experience = expContent ? parseExperienceSection(expContent) : [];

  // 6. Leadership Extraction
  const leaderContent = sections.filter((s) => s.kind === 'leadership').map((s) => s.content).join('\n');
  const leadership = leaderContent ? parseLeadershipSection(leaderContent) : [];

  // 7. Certifications & Continuous Learning Extraction
  const certContent = sections.filter((s) => s.kind === 'certifications').map((s) => s.content).join('\n');
  const certifications = certContent ? parseCertificationsSection(certContent) : [];

  // 8. Achievements Extraction
  const achieveContent = sections.filter((s) => s.kind === 'achievements').map((s) => s.content).join('\n');
  const achievements = achieveContent
    ? achieveContent
        .split('\n')
        .map((l) => l.replace(/^[-•*●▪‣]\s*/, '').trim())
        .filter(Boolean)
    : [];

  // 9. Skills Extraction (with hidden skill detection from projects/summary/experience)
  const contextToScan = [
    chosenSummary,
    ...projects.map((p) => `${p.name} ${p.techStack.join(' ')} ${p.bullets.join(' ')} ${p.rawLines.join(' ')}`),
    ...experience.map((e) => `${e.role} ${e.company} ${e.bullets.join(' ')} ${e.rawLines.join(' ')}`),
    ...leadership.map((l) => `${l.role} ${l.company} ${l.bullets.join(' ')} ${l.rawLines.join(' ')}`)
  ];
  const skills = parseSkillsSection(skillsContent, contextToScan);

  // 10. Languages Extraction
  const langSec = sections.find((s) => s.kind === 'languages');
  const languages = langSec ? parseLanguages(langSec.content) : [];

  // 11. Links Extraction
  const linkSec = sections.find((s) => s.kind === 'links');
  let links: string[] = [...header.links];
  if (linkSec) {
    const { professionalLinks, leftOut: linksLeftOut } = parseSocialLinks(linkSec.content);
    links.push(...professionalLinks);
    leftOut.push(...linksLeftOut);
  }
  // Deduplicate links
  links = Array.from(new Set(links));

  // 12. Padding / Declaration sections to Left Out
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

  // Competition to Achievements Re-route
  const COMPETITION_REGEX = /\b(?:contest|ctf|competition|hackathon|rank|award|winner)\b/i;
  const filteredProjects: typeof projects = [];
  for (const proj of projects) {
    if (COMPETITION_REGEX.test(proj.name) || COMPETITION_REGEX.test(proj.bullets.join(' '))) {
      achievements.push(proj.name);
      achievements.push(...proj.bullets);
    } else {
      filteredProjects.push(proj);
    }
  }
  projects = filteredProjects;

  return {
    header,
    summary: chosenSummary,
    duplicateSummaries,
    education,
    skills,
    projects,
    experience,
    certifications,
    leadership,
    achievements,
    languages,
    links,
    leftOut,
    sections,
    confidenceScore,
    lowConfidenceNotes,
    wordCount
  };
}
