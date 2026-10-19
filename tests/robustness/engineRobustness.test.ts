import { describe, it, expect } from 'vitest';
import { parseResume } from '../../src/lib/ats/parseResume';
import { parseJD } from '../../src/lib/ats/parseJD';
import { matchSkills } from '../../src/lib/ats/matchSkills';
import { runAtsEngine } from '../../src/features/ats/engine';
import { bundleBriefsForGaps } from '../../src/features/suite/briefs/bundleBriefs';

describe('R8.3: Engine Robustness, Unicode, & Boundary Resilience', () => {
  it('handles completely empty, whitespace, and newline inputs without throwing', () => {
    const emptyInputs = ['', '   ', '\n\n\r\n\t  \t'];
    for (const input of emptyInputs) {
      expect(() => parseResume(input)).not.toThrow();
      const parsedResume = parseResume(input);
      expect(parsedResume).toBeDefined();

      expect(() => parseJD(input)).not.toThrow();
      const parsedJd = parseJD(input);
      expect(parsedJd).toBeDefined();

      const atsResult = runAtsEngine(input, input);
      expect(atsResult.success).toBe(false);
      expect(atsResult.message).toBeDefined();

      const bundleResult = bundleBriefsForGaps([]);
      expect(bundleResult.recommendedBriefs.length).toBeGreaterThan(0);
      expect(bundleResult.coveragePercentage).toBe(0);
    }
  });

  it('handles non-English names including Devanagari, Tamil, and multilingual scripts cleanly', () => {
    const devanagariResume = `
      रोहित शर्मा (Rohit Sharma)
      ईमेल: rohit.sharma@example.in | दूरभाष: +91 98765 43210
      आईआईटी दिल्ली (IIT Delhi) - बी.टेक कंप्यूटर साइंस (B.Tech Computer Science)
      
      कौशल (Skills):
      • React, TypeScript, Node.js, Python, PostgreSQL, Docker
      
      अनुभव और प्रोजेक्ट (Experience & Projects):
      • Architected distributed UPI payment gateway in Node.js and PostgreSQL.
      • Reduced database query latency by 45% through Redis caching and query indexing.
    `;

    expect(() => parseResume(devanagariResume)).not.toThrow();
    const parsed = parseResume(devanagariResume);
    expect(parsed.rawText).toContain('रोहित शर्मा');

    const jd = 'Looking for Software Engineer with React, Node.js, TypeScript, PostgreSQL.';
    const result = runAtsEngine(devanagariResume, jd);
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
    expect(result.result?.score).toBeGreaterThan(40);
  });

  it('handles heavy emoji strings without crashing or mangling tokenization', () => {
    const emojiResume = `
      🚀 Alex Rivera 💻 Full-Stack Software Builder 🛠️
      Email: alex@example.com | 🌐 GitHub: https://github.com/alexrivera
      
      ⚡ Core Superpowers:
      ⚛️ React.js | 🔷 TypeScript | 🟢 Node.js | 🐍 Python | 🐳 Docker | ☸️ Kubernetes
      
      🏆 Key Missions:
      • 🚀 Deployed Kubernetes cluster managing 50+ microservices with 99.99% uptime.
      • 📈 Optimized frontend bundle size by 35% using code-splitting and dynamic imports.
    `;

    expect(() => parseResume(emojiResume)).not.toThrow();
    const parsed = parseResume(emojiResume);
    expect(parsed.skillsExtracted).toEqual(expect.arrayContaining(['React', 'TypeScript', 'Docker', 'Kubernetes']));

    const jd = 'Need engineer experienced in Kubernetes, React, Docker.';
    const run = runAtsEngine(emojiResume, jd);
    expect(run.success).toBe(true);
  });

  it('handles very long uninterrupted lines (15,000+ characters) without ReDoS or stack overflow', () => {
    const hugeLine = 'React TypeScript Node.js Python Docker Kubernetes PostgreSQL Redis Kafka AWS '.repeat(200);
    expect(hugeLine.length).toBeGreaterThan(15000);

    const start = performance.now();
    expect(() => parseResume(hugeLine)).not.toThrow();
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000);
  });

  it('handles massive 200 KB text input gracefully within memory and execution budget', () => {
    const paragraph = `Built high-throughput payment settlement pipelines in Go and Kafka handling 20,000 TPS.
    Configured Prometheus alerts, Grafana dashboards, and automated failover in AWS EKS. `;
    const massiveDoc = paragraph.repeat(1500); // ~220 KB
    expect(massiveDoc.length).toBeGreaterThan(200000);

    const start = performance.now();
    const parsed = parseResume(massiveDoc);
    const duration = performance.now() - start;

    expect(parsed).toBeDefined();
    expect(duration).toBeLessThan(2000);
  });

  it('guarantees idempotency across 20 consecutive rapid invocations with zero state drift', () => {
    const resume = 'Built web applications in React, TypeScript, and Tailwind CSS. Implemented REST APIs in Express.';
    const jd = 'Required skills: React, TypeScript, Express, REST APIs, Tailwind CSS.';

    const firstRun = runAtsEngine(resume, jd);
    for (let i = 0; i < 20; i++) {
      const nextRun = runAtsEngine(resume, jd);
      expect(nextRun.result?.score).toBe(firstRun.result?.score);
      expect(nextRun.result?.skillResults.length).toBe(firstRun.result?.skillResults.length);
    }
  });
});
