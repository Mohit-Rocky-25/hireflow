import fs from 'node:fs';
import { fitMessageToLength } from '../../src/features/suite/outreach/engine/lengthFit';
import { OutreachSlotsV2, OutreachTemplateV2 } from '../../src/features/suite/outreach/types';

const templates: OutreachTemplateV2[] = JSON.parse(
  fs.readFileSync('src/data/suite/outreach/templates.json', 'utf8')
);

// 5 Fictional Candidate Profiles (Indian Engineering Students & Freshers)
const CANDIDATES: Array<{ name: string; slots: OutreachSlotsV2 }> = [
  {
    name: 'Candidate 1: Aarav Menon (NIT Warangal, Go backend)',
    slots: {
      targetCompany: 'Finlo Technologies',
      targetRole: 'Backend Engineering Intern',
      recipientName: 'Rahul Deshmukh',
      primarySkill: 'Go, PostgreSQL & Redis',
      admiredProject: 'settlement reconciliation engine',
      proofPoint: 'built Go distributed job queue handling 6,500 jobs/sec',
      proofShort: 'built Go job queue (6.5k jobs/s)',
      college: 'NIT Warangal',
      portfolio: 'github.com/aarav-demo/pgqueue',
      followUpNewInfo: 'published reproducibility benchmarks and test suite',
      daysSince: 7,
      your_name: 'Aarav Menon',
    },
  },
  {
    name: 'Candidate 2: Neha Sharma (IIT Roorkee, ML / Computer Vision)',
    slots: {
      targetCompany: 'Kavach Vision Labs',
      targetRole: 'ML Intern',
      recipientName: 'Dr. Priya Srinivasan',
      primarySkill: 'PyTorch, TensorRT & Python',
      admiredProject: 'edge inference pipeline for autonomous inspection',
      proofPoint: 'optimized YOLOv8 model achieving 42 FPS on Jetson Nano with 94.2% mAP',
      proofShort: 'optimized YOLOv8 to 42 FPS on Jetson Nano (94% mAP)',
      college: 'IIT Roorkee',
      portfolio: 'github.com/neha-cv/edge-yolo',
      followUpNewInfo: 'added Quantization-Aware Training notebook and ONNX export',
      daysSince: 8,
      your_name: 'Neha Sharma',
    },
  },
  {
    name: 'Candidate 3: Vikramaditya Nair (BITS Pilani, Cloud & DevOps)',
    slots: {
      targetCompany: 'CloudScale Networks',
      targetRole: 'Site Reliability Engineering Intern',
      recipientName: 'Er. Rajesh Kulkarni',
      primarySkill: 'Kubernetes, Terraform & Prometheus',
      admiredProject: 'multi-cluster service mesh failover architecture',
      proofPoint: 'engineered automated canary deployment controller reducing rollback latency by 45%',
      proofShort: 'built K8s canary controller reducing rollback latency by 45%',
      college: 'BITS Pilani',
      portfolio: 'github.com/vikram-ops/canary-ctl',
      followUpNewInfo: 'published Grafana dashboard and load-testing methodology',
      daysSince: 6,
      your_name: 'Vikramaditya Nair',
    },
  },
  {
    name: 'Candidate 4: Ananya Iyer (PES University, Frontend / Web)',
    slots: {
      targetCompany: 'DesignDock India',
      targetRole: 'Frontend Software Engineer',
      recipientName: 'K. V. S. R. Murthy',
      primarySkill: 'TypeScript, React & WebGL',
      admiredProject: 'real-time canvas collaboration workspace',
      proofPoint: 'implemented virtualized infinite canvas rendering 10,000 DOM nodes at 60 FPS',
      proofShort: 'built infinite canvas rendering 10k nodes at 60 FPS',
      college: 'PES University, Bengaluru',
      portfolio: 'github.com/ananya-web/fast-canvas',
      followUpNewInfo: 'benchmarked memory usage and open-sourced custom Web Worker renderer',
      daysSince: 9,
      your_name: 'Ananya Iyer',
    },
  },
  {
    name: 'Candidate 5: Rohan Gupta (Thapar University, Data Engineering)',
    slots: {
      targetCompany: 'DataSprint Analytics',
      targetRole: 'Data Engineering Fresher',
      recipientName: 'Smt. Vandana Joshi',
      primarySkill: 'Apache Spark, Kafka & ClickHouse',
      admiredProject: 'real-time streaming analytics engine',
      proofPoint: 'built streaming event pipeline processing 25,000 events/sec with sub-second ingestion',
      proofShort: 'built Spark streaming pipeline (25k events/s)',
      college: 'Thapar Institute of Engineering & Technology',
      portfolio: 'github.com/rohan-data/spark-pipeline',
      followUpNewInfo: 'published end-to-end latency benchmarks on AWS EMR cluster',
      daysSince: 7,
      your_name: 'Rohan Gupta',
    },
  },
];

// Pick 20 diverse template IDs across all channels and goals
const SAMPLE_TEMPLATE_IDS = [
  'recruiter-direct-note',
  'peer-engineer-tech-convo',
  'response-we-are-hiring-post',
  'li-connect-alumni-curiosity',
  'li-connect-founder-early-stage',
  'li-connect-campus-recruiter-event',
  'recruiter-inmail-value-prop',
  'li-inmail-manager-project-deep-dive',
  'li-inmail-founder-scaling-pitch',
  'li-inmail-peer-tech-exchange',
  'cold-email-direct-role-app',
  'cold-email-scannable-pitch',
  'hiring-manager-project-hook',
  'cold-email-solutions-problem-solving',
  'post-accept-manager-role-inquiry',
  'alumni-warm-referral-ask',
  'post-accept-alumni-referral-ask',
  'warm-referral-former-colleague-forwardable',
  'gentle-follow-up',
  'follow-up-hiring-manager-new-benchmark',
];

const samples: Array<{ id: string; name: string; candidate: string; output: string }> = [];

let candIdx = 0;
for (const tid of SAMPLE_TEMPLATE_IDS) {
  const tmpl = templates.find((t) => t.id === tid);
  if (!tmpl) continue;

  const candidate = CANDIDATES[candIdx % CANDIDATES.length];
  candIdx++;

  const fit = fitMessageToLength(tmpl, candidate.slots, 0, { isPremiumLinkedIn: false });
  const display = fit.subject ? `Subject: ${fit.subject}\n\n${fit.body}` : fit.body;

  samples.push({
    id: tmpl.id,
    name: tmpl.name,
    candidate: candidate.name,
    output: display,
  });
}

fs.writeFileSync(
  'docs/outreach/SAMPLE_MESSAGES.json',
  JSON.stringify(samples, null, 2),
  'utf8'
);

let md = '# HireFlow — 20 Sample Generated Outreach Messages (Stage 3 Gate Proof)\n\n';
md += 'Generated deterministically across 5 fictional Indian candidate profiles with zero runtime network egress.\n\n';

for (let i = 0; i < samples.length; i++) {
  const s = samples[i];
  md += `### ${i + 1}. [${s.id}] ${s.name}\n`;
  md += `**Profile**: ${s.candidate}\n\n`;
  md += '```text\n' + s.output + '\n```\n\n---\n\n';
}

fs.writeFileSync('docs/outreach/SAMPLE_MESSAGES.md', md, 'utf8');
console.log(`Generated ${samples.length} sample messages successfully.`);
