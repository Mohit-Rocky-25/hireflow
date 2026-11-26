// ============================================================
// Phase 10.7 E2E Synthetic Fixtures & Export Parsers
// Strictly isolated inside e2e/ — zero src/ imports or edits.
// ============================================================

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// ------------------------------------------------------------
// A1 / A5 / A6 / A7-A9 Primary Authoritative Fixture (Candidate A)
// ------------------------------------------------------------
export const CANDIDATE_A_NAME = 'Vikram Menon';
export const CANDIDATE_A_EMAIL = 'vikram.menon@example.com';
export const CANDIDATE_A_EMPLOYER = 'NovaPay Clearing Systems';
export const CANDIDATE_A_ROLE = 'Senior Data Platform Engineer';

export const CANDIDATE_A_RESUME = `Vikram Menon
vikram.menon@example.com | +91 98450 11223 | Bangalore, India
linkedin.com/in/vikrammenon | github.com/vikrammenon

PROFESSIONAL SUMMARY
Senior Data Platform Engineer with 4+ years of production experience building distributed event pipelines, Python microservices, and real-time analytics lakehouses.

EXPERIENCE
Senior Data Platform Engineer | FinCore Clearing | Jan 2021 - Present
- Architected distributed Apache Airflow & Python ETL pipelines processing 18 million records per day across Snowflake and AWS S3.
- Re-engineered dbt incremental models, reducing daily batch pipeline runtime from 94 minutes to 31 minutes.
- Built high-throughput FastAPI microservices backed by PostgreSQL indexing and Redis caching, serving 12,000 RPS with 99.95% SLA.
- Containerized core services with Docker and Kubernetes, automating Pytest and GitHub Actions CI/CD verification.

Software Engineering Intern | ByteBridge Labs | Jan 2020 - May 2020
- Assisted in developing RESTful API telemetry endpoints in Python and SQL for internal monitoring.

PROJECTS
OpenStream Event Replay Engine | github.com/vikrammenon/openstream | 2023
- Built personal open-source Kafka | RabbitMQ event replay CLI with "zero-drop" checkpointing & deterministic batch verification.

EDUCATION
B.Tech in Computer Science and Engineering, IIIT Hyderabad (2016 - 2020) | CGPA: 8.9/10

SKILLS
Languages: Python, SQL
Frameworks & Tools: FastAPI, PostgreSQL, Redis, Apache Airflow, dbt, Snowflake, Docker, Kubernetes, AWS, GitHub Actions, Pytest, GraphQL`;

export const CANDIDATE_A_JD = `Senior Data Platform Engineer
Company: NovaPay Clearing Systems
Location: Bangalore, India

Role Overview:
At NovaPay Clearing Systems, we are scaling high-throughput clearing and risk data pipelines.

Must-Have Requirements:
- Required: 3+ years of professional backend and data engineering experience
- Production proficiency in Python and SQL
- Deep relational database experience with PostgreSQL and Redis caching
- Production workflow orchestration with Apache Airflow and Snowflake
- Containerization and orchestration with Docker and Kubernetes
- Infrastructure automation using Terraform

Nice-to-Have / Preferred:
- Experience with FastAPI and dbt incremental models
- Familiarity with GraphQL APIs`;

export const CANDIDATE_A_JD_ABOUT_THE_ROLE = CANDIDATE_A_JD.replace('Role Overview:', 'About the Role:');

// ------------------------------------------------------------
// A5 Multi-Candidate Isolation Fixtures (Candidates B & C + Alt JD)
// ------------------------------------------------------------
export const CANDIDATE_B_NAME = 'Meera Deshpande';
export const CANDIDATE_B_EMPLOYER = 'OrbitMesh Cloud';
export const CANDIDATE_B_ROLE = 'Cloud Reliability Engineer';

export const CANDIDATE_B_RESUME = `Meera Deshpande
meera.deshpande@example.com | +91 98111 22334 | Pune, India
linkedin.com/in/meeradeshpande | github.com/meeradeshpande

SUMMARY
Cloud Reliability Engineer with 5+ years of production infrastructure experience in Go, Terraform, Prometheus, and multi-region AWS operations.

EXPERIENCE
Staff SRE | InfraPulse Systems | March 2020 - Present
- Engineered multi-region Terraform modules provisioning 180+ AWS EKS clusters with 99.99% uptime.
- Implemented Go observability exporters feeding Prometheus and Grafana alerts, cutting MTTR from 48 minutes to 11 minutes.
- Automated chaos engineering failover drills across Linux clusters and Istio service mesh nodes.

EDUCATION
B.E. in Information Technology, Pune University (2015 - 2019)

PROJECTS
KubeGuard Policy Enforcer | 2022
- Developed open-source admission controller in Go enforcing network policy compliance across 40+ namespaces.

SKILLS
Languages: Go, Bash
Infrastructure: Terraform, AWS, Kubernetes, Prometheus, Grafana, Linux`;

export const CANDIDATE_B_JD = `Cloud Reliability Engineer
Company: OrbitMesh Cloud
Location: Pune, India

Must-Have Requirements:
- 4+ years of production experience with Go and Terraform
- Deep observability expertise using Prometheus and Grafana
- Production infrastructure administration on AWS and Linux`;

export const CANDIDATE_C_NAME = 'Arjun Kulkarni';
export const CANDIDATE_C_EMPLOYER = 'PixelCraft Studio';
export const CANDIDATE_C_ROLE = 'Frontend Systems Engineer';

export const CANDIDATE_C_RESUME = `Arjun Kulkarni
arjun.kulkarni@example.com | +91 97654 33221 | Mumbai, India
linkedin.com/in/arjunkulkarni | github.com/arjunkulkarni

SUMMARY
Frontend Systems Engineer specializing in accessible TypeScript design systems, React 19 performance, and Next.js web applications.

EXPERIENCE
Senior Frontend Engineer | DesignGrid Interactive | July 2021 - Present
- Architected component design system in TypeScript, React, and Tailwind CSS adopted by 24 product teams.
- Reduced Largest Contentful Paint from 3,200 ms to 980 ms in Next.js storefronts serving 450,000 monthly users.
- Authored 180+ Playwright end-to-end tests in GitHub Actions, reducing UI regressions by 64%.

EDUCATION
B.Tech in Computer Engineering, VJTI Mumbai (2017 - 2021)

PROJECTS
MotionGrid Accessibility Inspector | 2023
- Built browser devtools extension in TypeScript and React auditing WCAG contrast ratios across dynamic themes.

SKILLS
Languages: TypeScript, JavaScript, HTML5, CSS3
Frontend & Testing: React, Next.js, Tailwind CSS, Playwright, Redux`;

export const CANDIDATE_C_JD = `Frontend Systems Engineer
Company: PixelCraft Studio
Location: Mumbai, India

Must-Have Requirements:
- 3+ years of production experience with TypeScript and React
- Production web architecture using Next.js and Tailwind CSS
- Automated browser testing experience with Playwright`;

export const CANDIDATE_A_ALT_JD = `Distributed Backend Architect
Company: Zenith Ledger Corp
Location: Remote

Must-Have Requirements:
- 4+ years of backend systems engineering in Python and Go
- Production expertise with Apache Kafka, GraphQL, and Terraform
- Experience with PostgreSQL and Redis caching`;

// ------------------------------------------------------------
// A2 Format & Edge-Case Resumes
// ------------------------------------------------------------
export const RESUME_MISSING_CONTACT = `PROFESSIONAL SUMMARY
Backend Engineer with 3+ years building Python and PostgreSQL distributed systems.

EXPERIENCE
Backend Software Engineer | Apex Data Corp | Feb 2021 - Present
- Built high-throughput Python and FastAPI microservices handling 9,000 requests per second with PostgreSQL and Redis.
- Containerized production deployments with Docker and Kubernetes, reducing release failures by 42%.

PROJECTS
Distributed Task Scheduler | 2022
- Engineered fault-tolerant task runner using Python, Celery, and RabbitMQ with idempotent job retries.

EDUCATION
B.Tech in Computer Science, NIT Surathkal (2016 - 2020)

SKILLS
Languages: Python, SQL
Backend & Infra: FastAPI, PostgreSQL, Redis, Docker, Kubernetes, Celery, RabbitMQ`;

export const RESUME_AMBIGUOUS_DATES = `Neha Verma
neha.verma@example.com | +91 98222 44556 | Delhi, India
linkedin.com/in/nehaverma | github.com/nehaverma

SUMMARY
Software Engineer with experience in Python, PostgreSQL, and Docker backend systems.

EXPERIENCE
Backend Engineer | Horizon Tech | 2022 - 2023
- Implemented Python and FastAPI APIs with PostgreSQL database migrations, improving throughput by 38%.
- Automated Docker image builds and CI checks using GitHub Actions.

Software Intern | SparkLabs | Summer 2021 - Fall 2021
- Built internal analytics scripts in Python and SQL for weekly reporting.

EDUCATION
B.Tech in Computer Science, DTU Delhi (2018 - 2022)

SKILLS
Languages: Python, SQL
Tools: FastAPI, PostgreSQL, Docker, GitHub Actions`;

// ------------------------------------------------------------
// A3 Complex JD Semantics Fixtures
// ------------------------------------------------------------
export const JD_COMPLEX_LOGIC_AND_MALFORMED = `Principal Platform Engineer
Company: QuantumStack AI
Location: Bangalore, India

Must-Have Requirements:
- Python AND SQL
- PostgreSQL OR MySQL
- Docker AND (AWS OR GCP)
- Experience with ((Redis OR Memcached AND Apache Kafka

Nice-to-Have / Preferred:
- Terraform OR Ansible
- Familiarity with Kubernetes`;

export const JD_NO_EMPLOYER_NO_EXPERIENCE = `Backend Software Engineer

Responsibilities and Technical Requirements:
- Strong proficiency in Python and modern web frameworks such as FastAPI
- Hands-on experience designing relational database schemas with PostgreSQL and Docker containers
- Practical familiarity with Redis caching and automated API testing`;

// ------------------------------------------------------------
// A4 Evidence Semantics Fixture
// ------------------------------------------------------------
export const EVIDENCE_SEMANTICS_NAME = 'Kavya Sundaram';
export const EVIDENCE_SEMANTICS_RESUME = `Kavya Sundaram
kavya.sundaram@example.com | +91 98333 77889 | Chennai, India
linkedin.com/in/kavyasundaram | github.com/kavyasundaram

SUMMARY
Data and Backend Engineer building high-scale production pipelines and resilient APIs.

EXPERIENCE
Senior Data Engineer | Meridian Analytics | Jan 2021 - Present
- Architected Apache Airflow orchestration pipelines processing 18 million records per day into Snowflake.
- Refactored dbt incremental models, cutting daily pipeline runtime from 94 minutes to 31 minutes.
- Built PostgreSQL query optimization layer and migrated away from MongoDB to PostgreSQL; never used Cassandra in production.
- Planning to introduce Terraform in next quarter infrastructure roadmap.

Platform Engineering Intern | BlueWave Tech | Jan 2020 - June 2020
- Assisted in writing Docker compose test fixtures for staging environment integration runs.

PROJECTS
Personal Cache Toy | 2024
- Built a personal prototype key-value store in Go for weekend experimentation and learning.

EDUCATION
B.Tech in Computer Science, Anna University (2016 - 2020)

SKILLS
Languages: Python, SQL, Go
Data & Infra: Apache Airflow, Snowflake, dbt, PostgreSQL, Redis, GraphQL, Docker`;

export const EVIDENCE_SEMANTICS_JD = `Senior Data Infrastructure Engineer
Company: LedgerPulse Corp
Location: Chennai, India

Must-Have Requirements:
- 3+ years of experience with Apache Airflow and Snowflake
- Production experience with dbt and PostgreSQL
- Experience with Redis caching
- Production experience with Docker
- Experience with Go (Golang) backend services
- Hands-on experience with Terraform
- Experience with MongoDB
- Experience with Cassandra`;

// ------------------------------------------------------------
// Real Binary Fixture Builders (for <input type="file"> uploads)
// ------------------------------------------------------------
export async function buildDocxBufferFromLines(lines: string[]): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: lines.map(
          (line) =>
            new Paragraph({
              children: [new TextRun(line)],
            })
        ),
      },
    ],
  });
  return await Packer.toBuffer(doc);
}

export async function buildPdfBufferFromLines(lines: string[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 42;
  const lineHeight = 13;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const rawLine of lines) {
    const safeLine = rawLine.replace(/[^\x20-\x7E]/g, ' ');
    // Simple wrap at 88 chars so nothing overflows horizontally
    const chunks: string[] = [];
    if (safeLine.length <= 88) {
      chunks.push(safeLine);
    } else {
      const words = safeLine.split(' ');
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).trim().length <= 88) {
          cur = (cur + ' ' + w).trim();
        } else {
          if (cur) chunks.push(cur);
          cur = w;
        }
      }
      if (cur) chunks.push(cur);
    }

    for (const chunk of chunks) {
      if (y < margin + 20) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      if (chunk.trim().length > 0) {
        page.drawText(chunk, {
          x: margin,
          y,
          size: 9.5,
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
      }
      y -= lineHeight;
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

export function buildCorruptDocxBuffer(): Buffer {
  return Buffer.from('NOT_A_VALID_PK_ZIP_DOCX_BINARY_PAYLOAD_CORRUPTED_STREAM_9999', 'utf-8');
}

export function buildOversizedTxtBuffer(sizeBytes = 5_300_000): Buffer {
  const chunk = 'Oversized resume padding line with software engineering keywords Python SQL Docker.\n';
  const repeats = Math.ceil(sizeBytes / chunk.length);
  return Buffer.from(chunk.repeat(repeats).slice(0, sizeBytes), 'utf-8');
}

// ------------------------------------------------------------
// Exported Binary / XML / Markdown Inspection Helpers
// ------------------------------------------------------------
export interface ParsedPdfSummary {
  pageCount: number;
  pagesText: string[];
  fullText: string;
}

export async function inspectDownloadedPdf(pdfBuffer: Buffer): Promise<ParsedPdfSummary> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
    verbosity: 0,
  });
  const pdf = await loadingTask.promise;
  const pagesText: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageStr = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pagesText.push(pageStr);
  }
  return {
    pageCount: pdf.numPages,
    pagesText,
    fullText: pagesText.join('\n'),
  };
}

export interface ParsedDocxSummary {
  entryNames: string[];
  documentXml: string;
  xmlParseErrors: string[];
  tableCount: number;
  paragraphTexts: string[];
  fullText: string;
}

export async function inspectDownloadedDocx(docxBuffer: Buffer): Promise<ParsedDocxSummary> {
  const zip = await JSZip.loadAsync(docxBuffer);
  const entryNames = Object.keys(zip.files);
  const xmlFile = zip.file('word/document.xml');
  if (!xmlFile) {
    throw new Error('Downloaded DOCX archive is missing word/document.xml');
  }
  const documentXml = await xmlFile.async('string');

  const xmlParseErrors: string[] = [];
  const parser = new DOMParser({
    errorHandler: {
      warning: () => {},
      error: (msg: string) => xmlParseErrors.push(msg),
      fatalError: (msg: string) => xmlParseErrors.push(msg),
    },
  });
  const doc = parser.parseFromString(documentXml, 'text/xml');

  const tables = doc.getElementsByTagName('w:tbl');
  const paragraphs = doc.getElementsByTagName('w:p');
  const paragraphTexts: string[] = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const tNodes = paragraphs[i].getElementsByTagName('w:t');
    let pText = '';
    for (let j = 0; j < tNodes.length; j++) {
      pText += tNodes[j].textContent || '';
    }
    if (pText.trim()) paragraphTexts.push(pText.trim());
  }

  return {
    entryNames,
    documentXml,
    xmlParseErrors,
    tableCount: tables.length,
    paragraphTexts,
    fullText: paragraphTexts.join('\n'),
  };
}

export interface ParsedMarkdownTable {
  heading: string;
  headers: string[];
  rows: string[][];
  rawLines: string[];
}

export function extractMarkdownTables(mdText: string): ParsedMarkdownTable[] {
  const lines = mdText.split(/\r?\n/);
  const tables: ParsedMarkdownTable[] = [];
  let lastHeading = '';

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('#')) {
      lastHeading = line;
      i++;
      continue;
    }
    if (line.startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('| :')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const splitRow = (rowLine: string): string[] => {
        // Split on unescaped pipes only (ignore \|)
        const unescaped = rowLine.replace(/\\\|/g, '__ESCAPED_PIPE__');
        const parts = unescaped.split('|').slice(1, -1);
        return parts.map((c) => c.replace(/__ESCAPED_PIPE__/g, '|').trim());
      };
      const headers = splitRow(tableLines[0]);
      const rows = tableLines.slice(2).map(splitRow);
      tables.push({
        heading: lastHeading,
        headers,
        rows,
        rawLines: tableLines,
      });
      continue;
    }
    i++;
  }
  return tables;
}
