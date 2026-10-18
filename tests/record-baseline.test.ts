import { describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { runAtsEngine } from '../src/features/ats/engine';

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures/synthetic');

function load(name: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf-8');
}

describe('Baseline Recording (Stage 0.6)', () => {
  it('Evaluates the 6 synthetic fresher pairs and records baseline metrics', () => {
    const pairs = [
      {
        id: 'Pair 1: Strong CS Fresher vs Campus SDE Drive',
        resumeFile: 'resume_01_strong_cs.txt',
        jdFile: 'jd_01_campus_sde_fresher.txt',
        profile: 'Strong CS B.Tech, 8.64 CGPA, Node/React/PG, Internship',
      },
      {
        id: 'Pair 2: ECE Embedded Fresher vs Embedded Firmware GET',
        resumeFile: 'resume_02_ece_embedded.txt',
        jdFile: 'jd_05_embedded_firmware_engineer.txt',
        profile: 'ECE B.E., Embedded C, FreeRTOS, STM32/ESP32, No internship',
      },
      {
        id: 'Pair 3: Sparse Bullets Fresher vs Campus SDE Drive',
        resumeFile: 'resume_03_sparse_bullets.txt',
        jdFile: 'jd_01_campus_sde_fresher.txt',
        profile: 'Tier-3 IT B.Tech, 7.15 CGPA, weak verbs, no metrics',
      },
      {
        id: 'Pair 4: Two-Column Paste Fresher vs Junior Frontend Startup',
        resumeFile: 'resume_04_twocolumn_raw_paste.txt',
        jdFile: 'jd_02_startup_frontend_fresher.txt',
        profile: 'Two-column interleaved paste, React/TS/Next, FinTech intern',
      },
      {
        id: 'Pair 5: Mechanical Switcher vs Fintech Backend SDE 1',
        resumeFile: 'resume_05_career_switcher_mech.txt',
        jdFile: 'jd_03_backend_intern_to_fte.txt',
        profile: 'Mechanical B.Tech switcher, Django/Python/SQL projects',
      },
      {
        id: 'Pair 6: Overstuffed Skills Fresher vs Fintech Backend SDE 1',
        resumeFile: 'resume_06_overstuffed_skills.txt',
        jdFile: 'jd_03_backend_intern_to_fte.txt',
        profile: '40+ buzzwords listed, only 1 basic portfolio project',
      },
    ];

    let md = `# HireFlow v3 Baseline Performance Report (Stage 0.6)\n\n`;
    md += `> Recorded on: ${new Date().toISOString().split('T')[0]}\n`;
    md += `> Status: Baseline measurements before any engine changes or refactoring.\n\n`;
    md += `## Baseline Evaluation Matrix\n\n`;
    md += `| Test Pair | Candidate & Role | Overall ATS Score | Hard Skills Met | Evidence Score | Seniority / Readiness | Format Safety | Top Warnings / Findings |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    let detailsMd = `\n## Detailed Fixture Outputs\n\n`;

    for (const p of pairs) {
      const resume = load(p.resumeFile);
      const jd = load(p.jdFile);

      let resOutput: any = null;
      let errorMsg: string | null = null;

      try {
        const res = runAtsEngine(resume, jd, { tier: 'service' });
        if (res.success) {
          resOutput = res.result;
        } else {
          errorMsg = res.message;
        }
      } catch (err: any) {
        errorMsg = err?.message || String(err);
      }

      if (resOutput) {
        const score = resOutput.score;
        const subscores = resOutput.subscores || {};
        const skillsFound = (resOutput.skillResults || []).filter((s: any) => s.found).map((s: any) => s.skillId);
        const missingSections = resOutput.audit?.missingStandardSections || [];
        const penalties = (resOutput.penalties || []).map((p: any) => `${p.label} (${p.points})`);

        md += `| **${p.id.split(':')[0]}** | ${p.profile} | **${score} / 100** | ${resOutput.mustHavesMet} | ${subscores.evidenceQuality ?? 'N/A'} | ${subscores.seniorityFit ?? 'N/A'} | ${subscores.formatSafety ?? 'N/A'} | ${penalties.join('; ') || 'None'} |\n`;

        detailsMd += `### ${p.id}\n`;
        detailsMd += `- **Resume Fixture:** \`${p.resumeFile}\`\n`;
        detailsMd += `- **JD Fixture:** \`${p.jdFile}\`\n`;
        detailsMd += `- **ATS Overall Score:** ${score}\n`;
        detailsMd += `- **Band:** ${resOutput.band}\n`;
        detailsMd += `- **Confidence:** ${resOutput.confidence}\n`;
        detailsMd += `- **Headline:** ${resOutput.headline}\n`;
        detailsMd += `- **Must Haves Met:** ${resOutput.mustHavesMet}\n`;
        detailsMd += `- **Subscores:** Hard Skills: ${subscores.hardSkills}, Evidence: ${subscores.evidenceQuality}, Seniority: ${subscores.seniorityFit}, Format Safety: ${subscores.formatSafety}\n`;
        detailsMd += `- **Penalties:** ${penalties.join(', ') || 'None'}\n`;
        detailsMd += `- **Skills Detected (${skillsFound.length}):** ${skillsFound.join(', ') || 'None'}\n`;
        detailsMd += `- **Missing Sections:** ${missingSections.join(', ') || 'None'}\n`;
        detailsMd += `- **Weak Bullets Count:** ${resOutput.audit?.weakBulletsCount ?? 0}\n`;
        detailsMd += `- **Metrics Ratio:** ${resOutput.audit?.metricsRatio ? Math.round(resOutput.audit.metricsRatio * 100) + '%' : '0%'}\n\n`;
      } else {
        md += `| **${p.id.split(':')[0]}** | ${p.profile} | **ERROR** | N/A | N/A | N/A | N/A | ${errorMsg} |\n`;
        detailsMd += `### ${p.id}\n- **Engine Error:** ${errorMsg}\n\n`;
      }
    }

    fs.writeFileSync(path.resolve(__dirname, '../docs/baseline.md'), md + detailsMd, 'utf-8');
    console.log('Successfully wrote docs/baseline.md');
  });
});
