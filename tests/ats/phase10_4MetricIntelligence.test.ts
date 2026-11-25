// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 10.4 (Workstream B)
// Metric Polarity, Indian Locale & Currency Parsing,
// Span Exclusion Accuracy & Bullet Analyzer Sync
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  extractMetricsFromText,
  evaluateResumeImpact,
  analyzeBullet,
  runAtsEngine,
} from '@/features/ats/engine';
import {
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
} from '@/features/ats/fixtures/benchmarkFixtures';

describe('Phase 10.4 — Workstream B: Metric Polarity, Locale, Exclusions & Bullet Sync', () => {
  // ============================================================
  // B1: Delta/Transition Polarity & Verb Coverage
  // ============================================================
  describe('B1: Delta/Transition Polarity & Verb Coverage', () => {
    it('supports expanded improvement verbs (raised, lifted, elevated, grew, expanded, accelerated, halved, doubled, tripled)', () => {
      const raisedDelta = extractMetricsFromText('Raised throughput by 25% across distributed payment workers.');
      expect(raisedDelta).toHaveLength(1);
      expect(raisedDelta[0].polarity).toBe('POSITIVE');
      expect(raisedDelta[0].value).toBe(25);
      expect(raisedDelta[0].unit).toBe('%');
      expect(raisedDelta[0].attribution).toBe('DIRECT_OWNERSHIP');

      const raisedRange = extractMetricsFromText('Raised test coverage from 70% to 88% across core services.');
      expect(raisedRange).toHaveLength(1);
      expect(raisedRange[0].polarity).toBe('POSITIVE');
      expect(raisedRange[0].calculatedPercentagePointDelta).toBe(18);

      const positiveCases = [
        'Raising API availability from 99.1% to 99.95%.',
        'Lifted conversion rate by 18% through checkout redesign.',
        'Elevated cache hit rate from 75% to 94% using Redis.',
        'Grew retention rate by 12% across enterprise accounts.',
        'Expanded ingestion throughput by 40% across Kafka partitions.',
        'Accelerated CI build time by 35% with remote caching.',
        'Halved p95 latency from 400ms to 200ms via connection pooling.',
        'Doubled daily throughput to 2,000 RPS on Go microservices.',
        'Tripled adoption rate from 15% to 45% in Q3.',
      ];

      for (const text of positiveCases) {
        const extracted = extractMetricsFromText(text);
        expect(extracted.length, `Expected metric in "${text}"`).toBeGreaterThanOrEqual(1);
        expect(extracted[0].polarity, `Expected POSITIVE polarity in "${text}"`).toBe('POSITIVE');
      }
    });

    it('marks decreasing a GAIN noun as NEGATIVE with zero Impact credit', () => {
      const regressiveGainCases = [
        'Reduced throughput by 20% during migration.',
        'Decreased test coverage from 85% to 60% after refactor.',
        'Dropped availability to 95% due to regional failover.',
        'Cut conversion rate by 12% after form changes.',
        'Halved RPS from 2000 to 1000 under single-node fallback.',
      ];

      for (const text of regressiveGainCases) {
        const metrics = extractMetricsFromText(text, {
          sourceType: 'PROFESSIONAL_EXPERIENCE',
          environmentMaturity: 'PRODUCTION',
        });
        expect(metrics.length, `Expected extraction for "${text}"`).toBeGreaterThanOrEqual(1);
        expect(metrics[0].polarity, `Expected NEGATIVE polarity for "${text}"`).toBe('NEGATIVE');

        const impact = evaluateResumeImpact({
          bullets: [{ rawText: text, sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION' }],
          impactWeight: 15,
          targetTier: 'top_product',
        });
        expect(impact.impactMetricsScore).toBe(0);
        expect(impact.creditedMetricsCount).toBe(0);

        const bullet = analyzeBullet(text);
        expect(bullet.hasMetric).toBe(false);
        expect(bullet.metricMatched).toBeUndefined();
      }
    });

    it('marks increasing a COST noun as NEGATIVE with zero Impact credit', () => {
      const regressiveCostCases = [
        'Increased error rate by 15% after schema rollout.',
        'Boosted p95 latency from 120ms to 340ms under peak traffic.',
        'Raised cloud spend by $10K during unoptimized backfill.',
        'Expanded pipeline runtime from 20 minutes to 55 minutes.',
      ];

      for (const text of regressiveCostCases) {
        const metrics = extractMetricsFromText(text, {
          sourceType: 'PROFESSIONAL_EXPERIENCE',
          environmentMaturity: 'PRODUCTION',
        });
        expect(metrics.length, `Expected extraction for "${text}"`).toBeGreaterThanOrEqual(1);
        expect(metrics[0].polarity, `Expected NEGATIVE polarity for "${text}"`).toBe('NEGATIVE');

        const impact = evaluateResumeImpact({
          bullets: [{ rawText: text, sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION' }],
          impactWeight: 15,
          targetTier: 'top_product',
        });
        expect(impact.impactMetricsScore).toBe(0);
        expect(impact.creditedMetricsCount).toBe(0);
      }
    });

    it('credits decreasing COST nouns and increasing GAIN nouns as POSITIVE while rejecting unitless transitions', () => {
      const goodCostReduction = extractMetricsFromText('Cut downtime by 45% and lowered memory overhead by 30%.');
      expect(goodCostReduction.length).toBeGreaterThanOrEqual(2);
      expect(goodCostReduction.every((m) => m.polarity === 'POSITIVE')).toBe(true);

      const goodGainIncrease = extractMetricsFromText('Increased efficiency by 28% and boosted QPS from 1200 to 3600.');
      expect(goodGainIncrease.length).toBeGreaterThanOrEqual(2);
      expect(goodGainIncrease.every((m) => m.polarity === 'POSITIVE')).toBe(true);

      expect(extractMetricsFromText('Improved internal process from 10 -> 20 across squads.')).toHaveLength(0);
    });
  });

  // ============================================================
  // B2: Standalone Error-Rate / Non-Achievement Percentage Safeguard
  // ============================================================
  describe('B2: Standalone Error-Rate & Non-Achievement Percentage Safeguard', () => {
    it('never credits raw error rate, packet loss, or downtime percentages as POSITIVE Quality impact', () => {
      const negativeStandalone = [
        'Observed 12% error rate on legacy ingestion jobs.',
        'Cluster suffered 5% packet loss across cross-region links.',
        'Service experienced 3% downtime during database upgrade.',
        'Tracked 4% defect rate in manual QA cycles.',
      ];

      for (const text of negativeStandalone) {
        const metrics = extractMetricsFromText(text, {
          sourceType: 'PROFESSIONAL_EXPERIENCE',
          environmentMaturity: 'PRODUCTION',
        });
        expect(metrics.length, `Expected extraction for "${text}"`).toBeGreaterThanOrEqual(1);
        expect(metrics[0].polarity).not.toBe('POSITIVE');
        expect(metrics[0].polarity).toBe('NEGATIVE');

        const impact = evaluateResumeImpact({
          bullets: [{ rawText: text, sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION' }],
          impactWeight: 15,
          targetTier: 'top_product',
        });
        expect(impact.impactMetricsScore).toBe(0);
        expect(impact.creditedMetricsCount).toBe(0);

        const bullet = analyzeBullet(text);
        expect(bullet.hasMetric).toBe(false);
        expect(bullet.metricMatched).toBeUndefined();
      }
    });

    it('keeps genuine quality benchmarks as QUALITY + POSITIVE and rejects remote tags', () => {
      const cov = extractMetricsFromText('Authored Pytest suite achieving 86% branch coverage.');
      expect(cov[0].metricCategories).toContain('QUALITY');
      expect(cov[0].polarity).toBe('POSITIVE');

      const uptime = extractMetricsFromText('Maintained 99.95% uptime across payment microservices.');
      expect(uptime[0].metricCategories).toContain('QUALITY');
      expect(uptime[0].polarity).toBe('POSITIVE');

      const cacheHit = extractMetricsFromText('Tuned Redis TTL policies achieving 98% cache hit rate.');
      expect(cacheHit[0].metricCategory).toBe('QUALITY');
      expect(cacheHit[0].polarity).toBe('POSITIVE');

      expect(extractMetricsFromText('Collaborated 100% remotely across distributed squads.')).toHaveLength(0);
    });
  });

  // ============================================================
  // B3: Indian Numbering System & INR/Rs Currency Support
  // ============================================================
  describe('B3: Indian Numbering System & INR/Rs Currency Support', () => {
    it('parses Indian comma grouping alongside Western grouping', () => {
      const indianScale = extractMetricsFromText('Processed 8,00,000 records/day and served 1,25,00,000 requests/month.');
      expect(indianScale).toHaveLength(2);
      expect(indianScale[0].value).toBe(800_000);
      expect(indianScale[0].unit).toBe('records');
      expect(indianScale[0].timeframe).toBe('per_day');
      expect(indianScale[1].value).toBe(12_500_000);
      expect(indianScale[1].unit).toBe('requests');
      expect(indianScale[1].timeframe).toBe('per_month');

      const westernScale = extractMetricsFromText('Handled 1,250,000 transactions/day in settlement service.');
      expect(westernScale).toHaveLength(1);
      expect(westernScale[0].value).toBe(1_250_000);
    });

    it('parses INR/Rs/₹/USD/EUR/GBP and South Asian magnitude words across baseline->result and deltas', () => {
      const rangeInr = extractMetricsFromText('Reduced annual AWS spend from ₹12,50,000 to ₹4,00,000 via spot instances.');
      expect(rangeInr).toHaveLength(1);
      expect(rangeInr[0].baselineValue).toBe(1_250_000);
      expect(rangeInr[0].resultValue).toBe(400_000);
      expect(rangeInr[0].unit).toBe('inr');
      expect(rangeInr[0].calculatedDelta).toBe(850_000);
      expect(rangeInr[0].calculatedRelativeChange).toBe(68);
      expect(rangeInr[0].polarity).toBe('POSITIVE');

      const deltaInr = extractMetricsFromText('Saved INR 8,00,000/year by consolidating redundant RDS clusters.');
      expect(deltaInr).toHaveLength(1);
      expect(deltaInr[0].value).toBe(800_000);
      expect(deltaInr[0].unit).toBe('inr');
      expect(deltaInr[0].timeframe).toBe('per_year');
      expect(deltaInr[0].polarity).toBe('POSITIVE');

      const deltaLakhs = extractMetricsFromText('Cut infra spend by Rs 5.5 lakhs across staging clusters.');
      expect(deltaLakhs).toHaveLength(1);
      expect(deltaLakhs[0].value).toBe(550_000);
      expect(deltaLakhs[0].unit).toBe('inr');
      expect(deltaLakhs[0].polarity).toBe('POSITIVE');

      const deltaCrores = extractMetricsFromText('Grew annual GMV by Rs. 2.5 crores using automated onboarding.');
      expect(deltaCrores).toHaveLength(1);
      expect(deltaCrores[0].value).toBe(25_000_000);
      expect(deltaCrores[0].unit).toBe('inr');
      expect(deltaCrores[0].polarity).toBe('POSITIVE');

      const scaleLakhSymbol = extractMetricsFromText('Managed ₹50L annual cloud budget across 12 services.');
      expect(scaleLakhSymbol.some((m) => m.value === 5_000_000 && m.unit === 'inr')).toBe(true);

      const eurGbp = extractMetricsFromText('Saved €20,000/year and cut vendor fees by GBP 15,000.');
      expect(eurGbp).toHaveLength(2);
      expect(eurGbp[0].unit).toBe('eur');
      expect(eurGbp[0].value).toBe(20_000);
      expect(eurGbp[1].unit).toBe('gbp');
      expect(eurGbp[1].value).toBe(15_000);

      // Guard: bare "L" without currency/known unit must NOT match normal words
      expect(extractMetricsFromText('Built 12 L-shaped brackets and 5 L of coolant.')).toHaveLength(0);
    });
  });

  // ============================================================
  // B4: False-Positive Span Exclusion Accuracy
  // ============================================================
  describe('B4: False-Positive Span Exclusion Accuracy', () => {
    it('allows 1980-2039 numeric metrics when immediately followed by valid units/scale nouns', () => {
      const users = extractMetricsFromText('Scaled notification service to 2000 users in production.');
      expect(users).toHaveLength(1);
      expect(users[0].value).toBe(2000);
      expect(users[0].unit).toBe('users');

      const rps = extractMetricsFromText('Sustained 2020 RPS across edge API gateways.');
      expect(rps).toHaveLength(1);
      expect(rps[0].value).toBe(2020);
      expect(rps[0].unit).toBe('rps');

      const records = extractMetricsFromText('Ingested 2024 records/day into Redshift warehouse.');
      expect(records).toHaveLength(1);
      expect(records[0].value).toBe(2024);
      expect(records[0].unit).toBe('records');
      expect(records[0].timeframe).toBe('per_day');

      const orders = extractMetricsFromText('Processed 1999 orders/hour during flash sales.');
      expect(orders).toHaveLength(1);
      expect(orders[0].value).toBe(1999);
      expect(orders[0].unit).toBe('orders');
      expect(orders[0].timeframe).toBe('per_hour');

      const rangeUsers = extractMetricsFromText('Grew platform from 2000 to 2024 users in Q4.');
      expect(rangeUsers).toHaveLength(1);
      expect(rangeUsers[0].baselineValue).toBe(2000);
      expect(rangeUsers[0].resultValue).toBe(2024);
      expect(rangeUsers[0].unit).toBe('users');
    });

    it('still strictly excludes actual dates, copyrights, HTTP codes, hashes, and tech versions', () => {
      const excluded = [
        'Senior Engineer at Acme Corp | June 2021 - Present.',
        'Worked on billing platform from 2021-2024.',
        'Engineered microservices from 2020 - 2023.',
        'Migrated 2020 to 2024 services.',
        'Maintained legacy services (2022 - Present) using Python 3.11 and HTTP 404 handlers.',
        'Verified SHA256 digests and Copyright 2024 Acme Systems.',
      ];

      for (const text of excluded) {
        expect(extractMetricsFromText(text), `Expected no metrics in "${text}"`).toHaveLength(0);
        const bullet = analyzeBullet(text);
        expect(bullet.hasMetric).toBe(false);
        expect(bullet.metricMatched).toBeUndefined();
      }
    });
  });

  // ============================================================
  // B5: Polarity, Learning, Aspirational & Bullet Analyzer Sync
  // ============================================================
  describe('B5: Learning, Aspirational, Mixed Clauses & Impact Evaluation Sync', () => {
    it('prevents LEARNING, ASPIRATIONAL, and negated bullets from earning metric or Impact credit', () => {
      const nonExecuted = [
        'Currently learning Rust to achieve 86% branch coverage.',
        'Planning to introduce Spark to reduce latency by 40%.',
        'Never achieved 68% query latency reduction on staging.',
      ];

      for (const text of nonExecuted) {
        const bullet = analyzeBullet(text);
        expect(bullet.hasMetric, `Expected hasMetric=false for "${text}"`).toBe(false);
        expect(bullet.metricMatched, `Expected metricMatched=undefined for "${text}"`).toBeUndefined();
        expect(bullet.breakdown?.metricScore).toBe(0);
        expect(bullet.metricEvidences?.every((m) => m.claimSupport === 'NEGATED')).toBe(true);

        const impact = evaluateResumeImpact({
          bullets: [{ rawText: text, metricEvidences: bullet.metricEvidences, sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION' }],
          impactWeight: 15,
          targetTier: 'top_product',
        });
        expect(impact.impactMetricsScore).toBe(0);
        expect(impact.creditedMetricsCount).toBe(0);
      }
    });

    it('credits only the executed positive clause in mixed bullets while marking learning/aspirational clause NEGATED', () => {
      const mixed = 'Built FastAPI service cutting latency by 45%, currently learning Rust to achieve 90% branch coverage.';
      const bullet = analyzeBullet(mixed);

      expect(bullet.hasMetric).toBe(true);
      expect(bullet.metricMatched).toContain('cutting latency by 45%');
      expect(bullet.breakdown?.metricScore).toBe(30);

      const supported = bullet.metricEvidences?.filter((m) => m.claimSupport === 'SUPPORTED') || [];
      const negated = bullet.metricEvidences?.filter((m) => m.claimSupport === 'NEGATED') || [];
      expect(supported.length).toBe(1);
      expect(negated.length).toBe(1);

      const impact = evaluateResumeImpact({
        bullets: [{ rawText: bullet.rawText, metricEvidences: bullet.metricEvidences, sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION' }],
        impactWeight: 15,
        targetTier: 'top_product',
      });
      expect(impact.creditedMetricsCount).toBe(1);
      expect(impact.excludedMetricsCount).toBe(1);
    });

    it('preserves leading numbers in analyzeBullet and handles deduplication, isFresher scaling, and impactTrace provenance', () => {
      const leadingNumBullet = analyzeBullet('2000 users served daily via FastAPI and Redis caching.');
      expect(leadingNumBullet.hasMetric).toBe(true);
      expect(leadingNumBullet.rawText).toBe('2000 users served daily via FastAPI and Redis caching.');

      // Deduplication: same INR delta in different wording deduplicates, while distinct % domains do not collide
      const dedupEval = evaluateResumeImpact({
        bullets: [
          { rawText: 'Cut infra spend by ₹5,50,000 across AWS.', sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION', entryId: 'exp_1', sectionType: 'experience' },
          { rawText: 'Reduced infra spend by Rs 5.5 lakhs via spot instances.', sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION', entryId: 'exp_1', sectionType: 'experience' },
          { rawText: 'Reduced p95 latency by 45% via Redis.', sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION', entryId: 'exp_1', sectionType: 'experience' },
          { rawText: 'Reduced defect rate by 45% via Pytest.', sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION', entryId: 'exp_1', sectionType: 'experience' },
        ],
        jdText: 'Backend engineer optimizing AWS cost, p95 latency, and defect rate with Python',
        impactWeight: 15,
        targetTier: 'top_product',
      });
      expect(dedupEval.creditedMetricsCount).toBe(3);
      expect(dedupEval.excludedMetricsCount).toBe(1);
      expect(dedupEval.impactTrace[0].entryId).toBe('exp_1');
      expect(dedupEval.impactTrace[0].sectionType).toBe('experience');

      // isFresher scales targetUnits by 0.75, yielding higher factor than non-fresher for same single metric
      const singleBullet = [{ rawText: 'Reduced p95 latency from 400ms to 120ms using Redis.', sourceType: 'INTERNSHIP' as const, environmentMaturity: 'DEVELOPMENT' as const }];
      const standardImpact = evaluateResumeImpact({ bullets: singleBullet, impactWeight: 15, targetTier: 'top_product', isFresher: false });
      const fresherImpact = evaluateResumeImpact({ bullets: singleBullet, impactWeight: 15, targetTier: 'top_product', isFresher: true });
      expect(fresherImpact.metricScoreFactor).toBeGreaterThan(standardImpact.metricScoreFactor);
    });

    it('keeps runAtsEngine zero Impact Metrics for resumes with only regressive or learning metrics', () => {
      const resume = [
        'Alex Rivera',
        'alex.rivera@example.com | +1 555-0100',
        '',
        'EXPERIENCE',
        'Backend Engineer | Acme Corp | Jan 2021 - Oct 2024',
        '- Reduced throughput by 20% and increased error rate by 15% during rewrite.',
        '- Currently learning Rust to achieve 86% branch coverage.',
        '- Planning to introduce Spark to reduce latency by 40%.',
        '- Observed 12% error rate and 5% packet loss on legacy jobs.',
        '',
        'EDUCATION',
        'B.S. Computer Science | State University | 2016 - 2020',
        '',
        'SKILLS',
        'Python, PostgreSQL, Docker',
      ].join('\n');

      const jd = 'Backend Engineer. Required: Python, PostgreSQL, Docker, latency, throughput. 3+ years experience.';
      const res = runAtsEngine(resume, jd, { today: new Date(2024, 10, 24) });
      expect(res.success).toBe(true);
      if (!res.success) return;

      expect(res.result.subscores.impactMetrics).toBe(0);
    });

    it('preserves Benchmark A plural cost nouns ("cutting query response times by 68%") and score=90 / impactMetrics=15', () => {
      const pluralBullet =
        'Implemented PostgreSQL composite B-tree indexes and optimized query plans using EXPLAIN ANALYZE, cutting query response times by 68%.';
      const extracted = extractMetricsFromText(pluralBullet, {
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
      });
      expect(extracted).toHaveLength(1);
      expect(extracted[0].polarity).toBe('POSITIVE');
      expect(extracted[0].metricCategories).toContain('LATENCY');

      const benchA = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(benchA.success).toBe(true);
      if (!benchA.success) return;

      expect(benchA.result.subscores.impactMetrics).toBe(15);
      expect(benchA.result.score).toBe(90);
      expect(benchA.result.impactTrace?.some((t) => t.sourceQuote.includes('cutting query response times by 68%') && t.credited)).toBe(true);

      // Regression guard: dead-letter queue + retry in same bullet must not invert "improving notification success from 91.2% to 99.4%"
      const celeryBullet =
        'Built asynchronous webhook delivery engine with Celery, RabbitMQ, and exponential backoff retry with dead-letter queue, improving notification success from 91.2% to 99.4%.';
      const celeryMetrics = extractMetricsFromText(celeryBullet, {
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
      });
      expect(celeryMetrics).toHaveLength(1);
      expect(celeryMetrics[0].polarity).toBe('POSITIVE');
      expect(analyzeBullet(celeryBullet).hasMetric).toBe(true);
    });
  });
});
