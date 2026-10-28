import fs from 'fs';
import path from 'path';

export interface ParsedExportBrief {
  id: string;
  title: string;
  domain: string;
  difficulty: string;
  estimatedHours: number;
  techStack: string[];
  coveredSkills: string[];
  problemStatement: string;
  useCases: string;
  problemItSolves: string;
  recruiterSignal: string;
  architecture: string;
  scaleTargets: string;
  verificationRubric: string[];
  portfolioBulletFormula: string;
}

export function parseExportTxt(txtPath: string): ParsedExportBrief[] {
  const content = fs.readFileSync(txtPath, 'utf8').replace(/\r\n/g, '\n');
  const projectBlocks = content.split(/\n={80}\nPROJECT #\d+:\s*/).slice(1);

  const parsedBriefs: ParsedExportBrief[] = [];

  for (const block of projectBlocks) {
    const lines = block.split('\n');
    const title = lines[0].trim();

    // Extract headers
    let id = '';
    let domain = '';
    let difficulty = '';
    let estimatedHours = 0;
    let techStack: string[] = [];
    let coveredSkills: string[] = [];

    let lineIdx = 1;
    while (lineIdx < lines.length && !lines[lineIdx].startsWith('=')) {
      const line = lines[lineIdx].trim();
      if (line.startsWith('ID')) {
        id = line.split(':')[1]?.trim() || '';
      } else if (line.startsWith('Domain')) {
        domain = line.split(':')[1]?.trim() || '';
      } else if (line.startsWith('Difficulty')) {
        difficulty = line.split(':')[1]?.trim().toLowerCase() || '';
      } else if (line.startsWith('Est. Time')) {
        const hMatch = line.match(/(\d+)\s*hours?/i);
        estimatedHours = hMatch ? parseInt(hMatch[1], 10) : 0;
      } else if (line.startsWith('Tech Stack')) {
        techStack = line.split(':')[1]?.split(',').map((s) => s.trim()).filter(Boolean) || [];
      } else if (line.startsWith('Skills Gaps')) {
        coveredSkills = line.split(':')[1]?.split(',').map((s) => s.trim()).filter(Boolean) || [];
      }
      lineIdx++;
    }

    // Skip boundary line
    lineIdx++;

    const restOfBlock = lines.slice(lineIdx).join('\n');

    // Section extractors
    const extractSection = (heading: string, nextHeadings: string[]): string => {
      const regex = new RegExp(`\\[${heading}\\]\\n([\\s\\S]*?)(?=\\n\\[(?:${nextHeadings.join('|')})\\]|\\n-{80}|$)`);
      const match = restOfBlock.match(regex);
      return match ? match[1].trim() : '';
    };

    const problemStatement = extractSection('1. PROBLEM STATEMENT', [
      '2. REAL-WORLD USE CASES',
      '3. WHY THIS IS HARD',
      '4. RECRUITER SHORTLIST SIGNAL',
      '5. SYSTEM ARCHITECTURE & DATA FLOW',
    ]);
    const useCases = extractSection('2. REAL-WORLD USE CASES', [
      '3. WHY THIS IS HARD',
      '4. RECRUITER SHORTLIST SIGNAL',
      '5. SYSTEM ARCHITECTURE & DATA FLOW',
    ]);
    const problemItSolves = extractSection('3. WHY THIS IS HARD (COMPETENCY REDUCER)', [
      '4. RECRUITER SHORTLIST SIGNAL',
      '5. SYSTEM ARCHITECTURE & DATA FLOW',
    ]);
    const recruiterSignal = extractSection('4. RECRUITER SHORTLIST SIGNAL', [
      '5. SYSTEM ARCHITECTURE & DATA FLOW',
    ]);
    const architecture = extractSection('5. SYSTEM ARCHITECTURE & DATA FLOW', [
      '6. SCALE & PERFORMANCE TARGETS',
    ]);
    const scaleTargets = extractSection('6. SCALE & PERFORMANCE TARGETS', [
      '7. SCREENER VERIFICATION RUBRIC',
    ]);

    // Rubric
    const rubricRaw = extractSection('7. SCREENER VERIFICATION RUBRIC', [
      '8. HIGH-IMPACT RESUME BULLET FORMULA',
    ]);
    const verificationRubric: string[] = [];
    if (rubricRaw) {
      const rLines = rubricRaw.split('\n');
      for (const rLine of rLines) {
        const trimmed = rLine.trim();
        if (trimmed.startsWith('[ ]')) {
          // Strips leading "[ ] N. "
          const cleanRubric = trimmed.replace(/^\[ \]\s*\d+\.\s*/, '');
          verificationRubric.push(cleanRubric);
        }
      }
    }

    // Resume bullet formula
    const formulaRaw = extractSection('8. HIGH-IMPACT RESUME BULLET FORMULA', []);
    let portfolioBulletFormula = formulaRaw.trim();
    if (portfolioBulletFormula.startsWith('"') && portfolioBulletFormula.endsWith('"')) {
      portfolioBulletFormula = portfolioBulletFormula.slice(1, -1);
    }

    parsedBriefs.push({
      id,
      title,
      domain,
      difficulty,
      estimatedHours,
      techStack,
      coveredSkills,
      problemStatement,
      useCases,
      problemItSolves,
      recruiterSignal,
      architecture,
      scaleTargets,
      verificationRubric,
      portfolioBulletFormula,
    });
  }

  return parsedBriefs;
}

// Compare function
export function compareExportWithDataset(txtPath: string, jsonPath: string) {
  const parsedExport = parseExportTxt(txtPath);
  const jsonBriefs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`Parsed ${parsedExport.length} briefs from ${txtPath}`);
  console.log(`Loaded ${jsonBriefs.length} briefs from ${jsonPath}`);

  const exportMap = new Map<string, ParsedExportBrief>();
  parsedExport.forEach((b) => exportMap.set(b.id, b));

  const mismatches: Array<{ id: string; field: string; inJson: any; inExport: any }> = [];
  const missingInExport: string[] = [];

  for (const jb of jsonBriefs) {
    const eb = exportMap.get(jb.id);
    if (!eb) {
      missingInExport.push(jb.id);
      continue;
    }

    if (jb.id !== eb.id) mismatches.push({ id: jb.id, field: 'id', inJson: jb.id, inExport: eb.id });
    if (jb.domain !== eb.domain) mismatches.push({ id: jb.id, field: 'domain', inJson: jb.domain, inExport: eb.domain });
    if (jb.difficulty !== eb.difficulty) mismatches.push({ id: jb.id, field: 'difficulty', inJson: jb.difficulty, inExport: eb.difficulty });
    if (jb.estimatedHours !== eb.estimatedHours) mismatches.push({ id: jb.id, field: 'estimatedHours', inJson: jb.estimatedHours, inExport: eb.estimatedHours });
    if (jb.problemStatement !== eb.problemStatement) mismatches.push({ id: jb.id, field: 'problemStatement', inJson: jb.problemStatement, inExport: eb.problemStatement });
    if (jb.architecture !== eb.architecture) mismatches.push({ id: jb.id, field: 'architecture', inJson: jb.architecture, inExport: eb.architecture });
    if (jb.scaleTargets !== eb.scaleTargets) mismatches.push({ id: jb.id, field: 'scaleTargets', inJson: jb.scaleTargets, inExport: eb.scaleTargets });
    if (jb.portfolioBulletFormula !== eb.portfolioBulletFormula) mismatches.push({ id: jb.id, field: 'portfolioBulletFormula', inJson: jb.portfolioBulletFormula, inExport: eb.portfolioBulletFormula });
  }

  return {
    parsedExportCount: parsedExport.length,
    jsonCount: jsonBriefs.length,
    missingInExport,
    mismatches,
  };
}

if (process.argv[1] && process.argv[1].endsWith('parse-export.ts')) {
  const root = process.cwd();
  const txtPath = path.join(root, 'HIREFLOW_PROJECT_BRIEFS_ALL.txt');
  const jsonPath = path.join(root, 'src/data/suite/project-briefs.json');

  const result = compareExportWithDataset(txtPath, jsonPath);
  console.log(`Comparison Results:`);
  console.log(`- Briefs in exported .txt: ${result.parsedExportCount}`);
  console.log(`- Briefs in JSON dataset: ${result.jsonCount}`);
  console.log(`- Missing in export: ${result.missingInExport.length} (${result.missingInExport.slice(0, 5).join(', ')}...)`);
  console.log(`- Content mismatches: ${result.mismatches.length}`);
  if (result.mismatches.length > 0) {
    console.log('Sample mismatches:');
    result.mismatches.slice(0, 5).forEach((m) => {
      console.log(`  [${m.id}] ${m.field}: JSON="${m.inJson}" vs Export="${m.inExport}"`);
    });
  }
}
