import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { runAtsEngine } from '../../src/features/ats/engine';
import { computeScore, deepAnalyzeCompetency } from '../../src/pages/demo/talentLensEngine';
import { evaluateTruthGate } from '../../src/engine/tailor/truthGate';
import { compareJDsAndCandidate } from '../../src/engine/compare/compareEngine';
import { SkillEvidence } from '../../src/engine/matching/types';
import { ResumeFactLedger } from '../../src/engine/ledger/types';

const FIXTURES = path.resolve(process.cwd(), 'tests/fixtures/golden');
function readFixture(name: string): string {
  return fs.readFileSync(path.join(FIXTURES, name), 'utf-8');
}

describe('Capture and verify engine goldens', () => {
  it('captures 10 golden fixtures across 4 engines', async () => {
    const jdBackend = readFixture('golden_jd_01_backend_sde.txt');
    const jdFrontend = readFixture('golden_jd_02_frontend_react.txt');
    const resumeSingle = readFixture('golden_resume_01_single_column.txt');
    const resumeStuffed = readFixture('golden_resume_05_stuffed_skills.txt');
    const resumeWeak = readFixture('golden_resume_06_weak_fresher.txt');
    const resumeStrong = readFixture('golden_resume_07_strong_fresher.txt');

    const goldens: Record<string, unknown> = {};

    // 1. ATS Roaster on 5 combinations
    goldens['ats_single_backend'] = await runAtsEngine(resumeSingle, jdBackend, { targetTier: 'top_product', experienceLevel: '1-3', skipAi: true });
    goldens['ats_single_frontend'] = await runAtsEngine(resumeSingle, jdFrontend, { targetTier: 'top_product', experienceLevel: '1-3', skipAi: true });
    goldens['ats_stuffed_backend'] = await runAtsEngine(resumeStuffed, jdBackend, { targetTier: 'top_product', experienceLevel: '1-3', skipAi: true });
    goldens['ats_weak_backend'] = await runAtsEngine(resumeWeak, jdBackend, { targetTier: 'top_product', experienceLevel: '1-3', skipAi: true });
    goldens['ats_strong_backend'] = await runAtsEngine(resumeStrong, jdBackend, { targetTier: 'top_product', experienceLevel: '1-3', skipAi: true });

    // 2. TalentLens computeScore on 2 combinations
    const comps = ['python', 'postgresql', 'docker', 'system design'];
    const reqLevelMap: Record<string, string> = {
      python: 'working',
      postgresql: 'working',
      docker: 'working',
      'system design': 'working'
    };
    const analysesStrong = comps.map((c) => deepAnalyzeCompetency(resumeStrong, c, reqLevelMap[c] || 'working'));
    const analysesWeak = comps.map((c) => deepAnalyzeCompetency(resumeWeak, c, reqLevelMap[c] || 'working'));

    const dummyCompany = { name: 'Swiggy', tier: 'top_product', industry: 'tech' };
    const dummyRole = { title: 'Software Engineer - Backend', level: 'IC2' };

    goldens['talentlens_strong'] = {
      score: computeScore(analysesStrong, reqLevelMap, resumeStrong, dummyCompany, dummyRole),
      analyses: analysesStrong.map(a => ({ status: a.status }))
    };
    goldens['talentlens_weak'] = {
      score: computeScore(analysesWeak, reqLevelMap, resumeWeak, dummyCompany, dummyRole),
      analyses: analysesWeak.map(a => ({ status: a.status }))
    };

    // 3. Tailor evaluateTruthGate
    const dummyLedger: any = {
      schemaVersion: '2.0.0',
      provenance: { source: 'Test', sourceUrl: null, lastVerified: '2026-10-18', confidence: 'high', status: 'verified' },
      education: [{ degree: 'B.Tech', branch: 'CS', institute: 'NIT', startYear: 2021, endYear: 2025, cgpa: { value: 8.4, scale: 10 } }],
      tenth: { percentage: 88, board: 'CBSE', year: 2019 },
      twelfth: { percentage: 92, board: 'CBSE', year: 2021 },
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
      projects: [{ name: 'Chat App', domain: 'Networking', techStack: ['Java', 'WebSocket'], role: 'Developer', bullets: ['Handled 1000 concurrent users'] }],
      experience: [],
      certifications: []
    };
    goldens['tailor_truth_valid'] = evaluateTruthGate({
      candidateLedger: dummyLedger,
      originalBullet: 'Built a Chat App in Java.',
      proposedBullet: 'Built a high-concurrency Chat App in Java handling 1000 users.'
    });
    goldens['tailor_truth_unclaimed_skill'] = evaluateTruthGate({
      candidateLedger: dummyLedger,
      originalBullet: 'Built a Chat App in Java.',
      proposedBullet: 'Expert in Kubernetes, Rust and Solana smart contracts.'
    });

    // 4. Compare JDs
    const dummyEvidence: SkillEvidence[] = [
      { skillId: 'react', canonical: 'React', level: 2, section: 'Work Experience', phrase: 'Developed React UI', spanStart: 0, spanEnd: 20, strength: 'strong', confidence: 'high', hasMetric: false },
      { skillId: 'python', canonical: 'Python', level: 2, section: 'Work Experience', phrase: 'Engineered Python backend', spanStart: 0, spanEnd: 20, strength: 'strong', confidence: 'high', hasMetric: false }
    ];
    goldens['compare_jds'] = compareJDsAndCandidate(dummyEvidence, jdBackend, jdFrontend);

    const outDir = path.resolve(process.cwd(), 'tests/__goldens__');
    const targetFile = path.join(outDir, 'golden_engine_outputs.json');
    if (process.env.HIREFLOW_UPDATE_GOLDENS === '1') {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(targetFile, JSON.stringify(goldens, null, 2), 'utf-8');
    } else if (!fs.existsSync(targetFile)) {
      throw new Error(`Missing golden snapshot file at ${targetFile}. Re-run with HIREFLOW_UPDATE_GOLDENS=1 to generate.`);
    }

    const saved = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
    expect(Object.keys(saved).length).toBe(10);
    for (const k of Object.keys(goldens)) {
      if (saved[k]?.result?.canonicalResult) {
        delete saved[k].result.canonicalResult.timestamp;
      }
      if (goldens[k]?.result?.canonicalResult) {
        delete goldens[k].result.canonicalResult.timestamp;
      }
      expect(JSON.stringify(goldens[k])).toBe(JSON.stringify(saved[k]));
    }
  });
});
