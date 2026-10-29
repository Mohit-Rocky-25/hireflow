import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import templatesData from '../../src/data/suite/outreach/templates.json';
import { OutreachTemplateV2, OutreachSlotsV2 } from '../../src/features/suite/outreach/types';
import { assembleRawMessage } from '../../src/features/suite/outreach/engine/assemble';
import { fitMessageToLength } from '../../src/features/suite/outreach/engine/lengthFit';

const CANONICAL_PERSONAS: Array<{ name: string; slots: OutreachSlotsV2 }> = [
  {
    name: 'Aarav Menon (NIT Warangal, Go backend)',
    slots: {
      recipientName: 'Rahul Verma',
      targetCompany: 'Finlo Technologies',
      targetRole: 'Backend Engineering Intern',
      primarySkill: 'Go, PostgreSQL & Redis',
      admiredProject: 'settlement reconciliation engine',
      proofPoint: 'built Go distributed job queue handling 6,500 jobs/sec',
      proofShort: '6.5k jobs/sec queue',
      college: 'NIT Warangal',
      portfolio: 'github.com/aarav-demo/pgqueue',
      followUpNewInfo: 'benchmarks and chaos test suite added',
      daysSince: 7,
      your_name: 'Aarav Menon',
      your_email: 'aarav.menon@example.com',
    },
  },
  {
    name: 'Neha Sharma (IIT Roorkee, ML / Computer Vision)',
    slots: {
      recipientName: 'Priya Sundaram',
      targetCompany: 'Kavach Vision Labs',
      targetRole: 'Computer Vision Intern',
      primarySkill: 'PyTorch, TensorRT & Python',
      admiredProject: 'edge inference pipeline for autonomous inspection',
      proofPoint: 'optimized YOLOv8 achieving 42 FPS on Jetson Nano with 94.2% mAP',
      proofShort: '42 FPS YOLOv8 model',
      college: 'IIT Roorkee',
      portfolio: 'github.com/neha-cv/edge-yolo',
      followUpNewInfo: 'published latency benchmarks and quantization guide',
      daysSince: 6,
      your_name: 'Neha Sharma',
      your_email: 'neha.sharma@example.com',
    },
  },
  {
    name: 'Vikramaditya Nair (BITS Pilani, Cloud & DevOps)',
    slots: {
      recipientName: 'Rajesh Kulkarni',
      targetCompany: 'CloudScale Networks',
      targetRole: 'Cloud Infrastructure Intern',
      primarySkill: 'Kubernetes, Terraform & Prometheus',
      admiredProject: 'multi-cluster service mesh failover architecture',
      proofPoint: 'engineered automated canary deployment controller reducing rollback latency by 45%',
      proofShort: 'canary controller -45% rollback',
      college: 'BITS Pilani',
      portfolio: 'github.com/vikram-ops/canary-ctl',
      followUpNewInfo: 'added multi-cluster failover integration test suite',
      daysSince: 8,
      your_name: 'Vikramaditya Nair',
      your_email: 'vikram.nair@example.com',
    },
  },
  {
    name: 'Ananya Iyer (PES University, Frontend / Web)',
    slots: {
      recipientName: 'Murthy Krishnamurthy',
      targetCompany: 'DesignDock India',
      targetRole: 'Frontend Developer Intern',
      primarySkill: 'TypeScript, React & WebGL',
      admiredProject: 'collaborative canvas state sync engine',
      proofPoint: 'implemented virtualized infinite canvas rendering 10,000 DOM nodes at 60 FPS',
      proofShort: '60 FPS 10k nodes canvas',
      college: 'PES University, Bengaluru',
      portfolio: 'github.com/ananya-web/fast-canvas',
      followUpNewInfo: 'added gesture zoom benchmarks and mobile touch support',
      daysSince: 5,
      your_name: 'Ananya Iyer',
      your_email: 'ananya.iyer@example.com',
    },
  },
  {
    name: 'Rohan Gupta (Thapar University, Data Engineering)',
    slots: {
      recipientName: 'Vandana Deshmukh',
      targetCompany: 'DataSprint Analytics',
      targetRole: 'Data Engineering Intern',
      primarySkill: 'Apache Spark, Kafka & ClickHouse',
      admiredProject: 'real-time clickstream processing architecture',
      proofPoint: 'built streaming event pipeline processing 25,000 events/sec with sub-second ingestion',
      proofShort: '25k events/sec pipeline',
      college: 'Thapar University',
      portfolio: 'github.com/rohan-data/spark-pipeline',
      followUpNewInfo: 'added deduplication benchmarks and memory leak tests',
      daysSince: 9,
      your_name: 'Rohan Gupta',
      your_email: 'rohan.gupta@example.com',
    },
  },
];

describe('Stage 6: Golden Snapshot Regression Suite', () => {
  const templates = templatesData as unknown as OutreachTemplateV2[];

  it('renders all 85 templates across 5 personas and verifies golden SHA-256 snapshot', () => {
    expect(templates).toHaveLength(85);
    expect(CANONICAL_PERSONAS).toHaveLength(5);

    const corpus: string[] = [];

    for (const persona of CANONICAL_PERSONAS) {
      for (const t of templates) {
        const fitted = fitMessageToLength(t, persona.slots, 0, { isPremiumLinkedIn: false });
        const entry = [
          t.id,
          t.channel,
          persona.name,
          fitted.subject || '',
          fitted.body,
        ].join('|||');
        corpus.push(entry);
      }
    }

    expect(corpus).toHaveLength(85 * 5); // 425 rendered combinations

    const serialized = corpus.join('\n===ENTRY===\n');
    const hash = crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');

    // Expected golden SHA-256 hash for deterministic corpus regression
    const EXPECTED_GOLDEN_HASH = '7ca08f1bb550b7d7b983d80e9422da0c55f227b9fd3e0dc8958531a156e4ec79';

    expect(hash).toBe(EXPECTED_GOLDEN_HASH);
  });
});
