import { describe, it } from 'vitest';
import {
  classifyBullet,
  rewriteBullet,
} from '../../src/pages/demo/engine/bulletRewriteEngine';
import { validateReport } from '../../src/pages/demo/engine/reportValidator';

describe('Stage B Verification of 12 Bullets', () => {
  const BULLETS = [
    'Helped the team build a payment service',
    'Reduced API latency by 40% using Redis caching in a Node.js service',
    'Designed resilient event-driven data pipelines and solved complex DSA problems for algorithmic optimization and system design bottlenecks across distributed clusters',
    'Worked on a web app using React',
    'Improved model accuracy from 82% to 91%',
    'Organised a college fest with 500 attendees',
    'Participated in a hackathon and built a chatbot',
    'Responsible for backend APIs in Spring Boot and PostgreSQL',
    'Led a team of 4 to deliver an inventory app in Flutter',
    'Contributed to open source projects',
    'Implemented JWT authentication, role-based access, Docker deployment, CI/CD and unit tests for a REST API',
    'Part of the robotics club',
  ];

  it('runs all 12 bullets through production rewrite pipeline', () => {
    for (let i = 0; i < BULLETS.length; i++) {
      const b = BULLETS[i];
      const cls = classifyBullet(b);
      const rw = rewriteBullet(b);

      const fakeReport = {
        breakdown: [],
        bulletRewrites: [rw],
      };
      const val = validateReport(fakeReport);
      const c19to22 = val.violations.filter(v =>
        ['before-substring', 'no-new-digits', 'allowed-words-or-slots', 'ownership-guard'].includes(v.check)
      );

      console.log(`\n=== BULLET ${i + 1} ===`);
      console.log(`Input: "${b}"`);
      console.log(`Classification: ${cls.qualityClass}`);
      console.log(`Reasons: ${cls.reasons.join('; ')}`);
      console.log(`Signals: action=${cls.signals.hasActionVerb} (${cls.signals.matchedVerb}), artifact=${cls.signals.hasArtifact} (${cls.signals.matchedArtifact}), tech=${cls.signals.hasTechnology} (${cls.signals.matchedTechs.join(',')}), metric=${cls.signals.hasOutcomeOrMetric} (${cls.signals.matchedMetric})`);
      console.log(`After text: "${rw.rewrittenBullet}"`);
      console.log(`IsNoChangeNeeded: ${rw.isNoChangeNeeded}`);
      console.log(`Warnings: ${rw.warnings ? rw.warnings.join('; ') : 'none'}`);
      console.log(`Defend Prompt: "${rw.defendPrompt}"`);
      console.log(`Checks 19-22: ${c19to22.length === 0 ? 'PASS' : 'FAIL: ' + JSON.stringify(c19to22)}`);
    }
  });
});
