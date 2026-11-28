// ============================================================
// HireFlow — Phase 14B.1 Final Closure: Fairness, JD State,
// Domain Capability, Context Provenance & Trace Parity Suite
// ============================================================

import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { runAtsEngine, computeAtsScore } from '../src/features/ats/engine';
import { analyzeJobDescription } from '../src/features/ats/engine/jdAnalyzer';
import { parseLogicalRequirement } from '../src/features/ats/engine/logicalExpression';
import { extractFromFile, extractTextFromFile } from '../src/lib/ats/fileExtractor';

const BACKEND_JD = `Backend Engineer
Required Qualifications:
- Python
- SQL
- REST APIs
- Git
Preferred Qualifications:
- Docker`;

const BASE_EXPERIENCED_RESUME = `Vikram Mehta
vikram@example.com | +91 9876543299 | github.com/vikram | linkedin.com/in/vikram-mehta
Education
B.Tech IT, 2021
Experience
Backend Engineer, PayGrid (Jan 2022 - Jan 2026)
- Engineered Python and SQL REST APIs handling 5,000 req/s with 99.95% uptime.
- Containerized microservices with Docker and automated Git CI/CD pipelines reducing deploy time by 40%.
- Optimized PostgreSQL queries reducing p95 latency by 35%.
Projects
Metrics Exporter
- Built Prometheus exporter in Python with automated unit tests and Docker packaging.
Skills
Python, SQL, REST APIs, Git, Docker, PostgreSQL`;

describe('Phase 14B.1 Final Closure — Fairness, JD Semantics, Domain & Trace Integrity', () => {
  it('verifies all 10 adversarial candidate profiles with ScoreTrace arithmetic reconciliation & provenance', () => {
    const profiles = [
      {
        id: 'P01_Student_Projects_Only',
        expectedMaxProfYears: 0,
        resume: `Aarav Patel\naarav@example.com | +91 9876543210 | github.com/aarav\nEducation\nB.Tech Computer Science, 2026 (CGPA 8.7)\nProjects\nTask Queue API\n- Built REST APIs in Python and SQL handling 1,200 req/s in local load tests.\n- Containerized with Docker and automated Git CI checks.\nDistributed Cache\n- Implemented LRU cache in Python with unit tests.\nSkills\nPython, SQL, REST APIs, Git, Docker`,
      },
      {
        id: 'P02_Grad_One_Intern',
        expectedMaxProfYears: 0,
        resume: `Neha Rao\nneha@example.com | +91 9876543211 | github.com/neha\nEducation\nB.E. Computer Science, 2025\nExperience\nBackend Intern, Finlo (Jan 2025 - Jun 2025)\n- Built Python REST APIs backed by SQL reducing query latency by 30%.\nProjects\nURL Shortener\n- Built Python and SQL service with Docker and Git.\nSkills\nPython, SQL, REST APIs, Git, Docker`,
      },
      {
        id: 'P03_Grad_Multi_Intern',
        expectedMaxProfYears: 0,
        resume: `Rohan Verma\nrohan@example.com | +91 9876543212 | github.com/rohan\nEducation\nB.Tech CSE, 2025\nExperience\nSoftware Intern, Alpha (May 2024 - Jul 2024)\n- Implemented Python ETL scripts and SQL migrations.\nBackend Intern, Beta (Jan 2025 - Jun 2025)\n- Built REST APIs in Python with Docker and Git CI.\nSkills\nPython, SQL, REST APIs, Git, Docker`,
      },
      {
        id: 'P04_Exp_No_Phone',
        expectedMaxProfYears: 10,
        resume: BASE_EXPERIENCED_RESUME.replace(' | +91 9876543299', ''),
      },
      {
        id: 'P05_Exp_No_Email',
        expectedMaxProfYears: 10,
        resume: BASE_EXPERIENCED_RESUME.replace('vikram@example.com | ', ''),
      },
      {
        id: 'P06_Research_Publications',
        expectedMaxProfYears: 10,
        resume: `Dr. Ananya Sen\nananya@example.com | +91 9876500001 | github.com/ananya\nEducation\nPh.D. Computer Science, IISc, 2025\nPublications\n- Published distributed consensus paper in VLDB 2024 using Python and SQL simulations.\n- Authored benchmark suite for REST APIs and Docker reproducibility.\nResearch Experience\nGraduate Researcher, Systems Lab (Jan 2021 - Jan 2025)\n- Built reproducible Python and SQL experiments versioned in Git.\nSkills\nPython, SQL, REST APIs, Git, Docker`,
      },
      {
        id: 'P07_Project_Heavy_No_Exp',
        expectedMaxProfYears: 0,
        resume: `Kiran Joshi\nkiran@example.com | +91 9876500002 | github.com/kiran\nEducation\nB.Tech CS, 2025\nProjects\nCloud Queue\n- Built Python and SQL REST APIs handling 3,000 jobs/sec.\n- Automated Docker builds and Git workflows.\nLog Aggregator\n- Built Python log parser with SQL indexing.\nAPI Gateway\n- Implemented rate limiting in Python.\nSkills\nPython, SQL, REST APIs, Git, Docker`,
      },
      {
        id: 'P08_Career_Switcher',
        expectedMaxProfYears: 10,
        resume: `Priya Nair\npriya@example.com | +91 9876500003\nSummary\nOperations specialist transitioning to backend engineering.\nEducation\nB.Com, 2020\nProjects\nInventory API\n- Built Python and SQL REST APIs with Git and Docker.\nExperience\nOperations Analyst, RetailCo (Jan 2021 - Jan 2024)\n- Automated reporting spreadsheets and vendor coordination.\nSkills\nPython, SQL, REST APIs, Git, Docker`,
      },
      {
        id: 'P09_Senior_Extensive',
        expectedMaxProfYears: 15,
        resume: `Siddharth Rao\nsid@example.com | +91 9876500004 | github.com/sid\nEducation\nB.E. CS, 2016\nExperience\nStaff Backend Engineer, CloudScale (Jan 2020 - Jan 2026)\n- Architected Python and SQL REST APIs serving 25k RPS with Docker and GitOps.\nSenior Engineer, FinCorp (Jan 2017 - Dec 2019)\n- Built distributed Python services and SQL warehouses.\nSkills\nPython, SQL, REST APIs, Git, Docker`,
      },
      {
        id: 'P10_Concise_Complete',
        expectedMaxProfYears: 10,
        resume: `Dev Kapoor\ndev@example.com | +91 9876500005\nEducation\nB.Tech CS, 2023\nExperience\nBackend Engineer, Nova (Jan 2024 - Jan 2026)\n- Built Python and SQL REST APIs with Docker and Git reducing latency by 25%.\nSkills\nPython, SQL, REST APIs, Git, Docker`,
      },
    ];

    for (const p of profiles) {
      const res = runAtsEngine(p.resume, BACKEND_JD);
      expect(res.success).toBe(true);
      if (!res.success) continue;

      const r = res.result;
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
      expect(r.trace).toBeDefined();

      // Independent ScoreTrace arithmetic reconciliation
      const t = r.trace!;
      const pillarSum = Math.round(t.pillars.reduce((s, x) => s + x.contribution, 0) * 10) / 10;
      expect(t.rawSubtotal).toBe(pillarSum);
      const expectedPreClamp = Math.round((t.rawSubtotal + t.totalBonuses - t.totalDeductions) * 10) / 10;
      expect(t.preClampScore).toBe(expectedPreClamp);
      expect(t.composite).toBe(r.score);

      // Internships / project-only candidates must never receive formal professional tenure
      const profYears = r.seniorityMatchResult?.tenureBreakdown.totalProfessionalYears ?? 0;
      expect(profYears).toBeLessThanOrEqual(p.expectedMaxProfYears);
    }
  });

  it('verifies pairwise fairness across controlled 1-variable mutations', () => {
    const base = runAtsEngine(BASE_EXPERIENCED_RESUME, BACKEND_JD);
    const noPhone = runAtsEngine(BASE_EXPERIENCED_RESUME.replace(' | +91 9876543299', ''), BACKEND_JD);
    const noEmail = runAtsEngine(BASE_EXPERIENCED_RESUME.replace('vikram@example.com | ', ''), BACKEND_JD);
    const noContact = runAtsEngine(
      BASE_EXPERIENCED_RESUME.replace('vikram@example.com | +91 9876543299 | ', ''),
      BACKEND_JD
    );
    const withDemographic = runAtsEngine(
      BASE_EXPERIENCED_RESUME + '\nPersonal Details: Age 27, Marital Status: Single, Nationality: Indian',
      BACKEND_JD
    );
    const aliasPostgres = runAtsEngine(
      BASE_EXPERIENCED_RESUME.replace(/PostgreSQL/g, 'Postgres'),
      BACKEND_JD
    );

    expect(base.success && noPhone.success && noEmail.success && noContact.success && withDemographic.success && aliasPostgres.success).toBe(true);
    if (!base.success || !noPhone.success || !noEmail.success || !noContact.success || !withDemographic.success || !aliasPostgres.success) return;

    // 1. Removing phone when email exists: 4.0.0-ats7d applies no_contact_info (-5) with accurate label
    expect(noPhone.result.penalties.find((p) => p.id === 'no_contact_info')?.points).toBe(-5);
    expect(noPhone.result.penalties.find((p) => p.id === 'no_contact_info')?.label).toBe('Missing Phone Contact Channel');

    // 2. Removing email when phone exists: -5 penalty with accurate label
    expect(noEmail.result.penalties.find((p) => p.id === 'no_contact_info')?.points).toBe(-5);
    expect(noEmail.result.penalties.find((p) => p.id === 'no_contact_info')?.label).toBe('Missing Email Contact Channel');

    // 3. Removing both email & phone: -5 penalty
    expect(noContact.result.penalties.find((p) => p.id === 'no_contact_info')?.points).toBe(-5);

    // 4. Irrelevant demographic text causes zero score change
    expect(withDemographic.result.score).toBe(base.result.score);

    // 5. Equivalent alias ("Postgres" == "PostgreSQL") yields identical match & score
    expect(aliasPostgres.result.mustHavesMet).toBe(base.result.mustHavesMet);
    expect(aliasPostgres.result.score).toBe(base.result.score);
  });

  it('verifies all 10 mandatory JD input conditions (JD-01 through JD-10) and state isolation', () => {
    const runJd = (jd: string) => runAtsEngine(BASE_EXPERIENCED_RESUME, jd);

    // JD-01: No JD supplied
    const jd01 = runJd('');
    expect(jd01.success).toBe(true);
    if (jd01.success) {
      expect(jd01.result.jdState).toBe('no_jd');
      expect(jd01.result.applicationGuidance).toBe('Insufficient evidence to evaluate');
      expect(jd01.result.headline).not.toContain('100%');
    }

    // JD-02: Valid must + nice
    const jd02 = runJd(BACKEND_JD);
    expect(jd02.success).toBe(true);
    if (jd02.success) {
      expect(jd02.result.jdState).toBe('supported_technical');
      expect(jd02.result.domainCapability?.tier).toBe('supported');
      expect(jd02.result.mustHavesMetRatio).toBe(1);
    }

    // JD-03: Preferred-only JD
    const jd03 = runJd('Backend Engineer\nPreferred / Nice to have:\n- Docker\n- Redis');
    expect(jd03.success).toBe(true);
    if (jd03.success) {
      expect(jd03.result.jdState).toBe('preferred_only');
      expect(jd03.result.applicationGuidance).not.toBe('Ready to apply');
    }

    // JD-04: Unrecognizable JD
    const jd04 = runJd('Looking for a motivated self-starter with great synergy and energy across dynamic initiatives.');
    expect(jd04.success).toBe(true);
    if (jd04.success) {
      expect(jd04.result.jdState).toBe('no_requirements_recognized');
      expect(jd04.result.applicationGuidance).toBe('Insufficient evidence to evaluate');
    }

    // JD-05: Very short JD
    const jd05 = runJd('Software Engineer');
    expect(jd05.success).toBe(true);
    if (jd05.success) {
      expect(jd05.result.jdState).toBe('insufficient_context');
      expect(jd05.result.applicationGuidance).toBe('Insufficient evidence to evaluate');
    }

    // JD-06: Ambiguous single-token terms without context hints
    const jd06Text = 'Role: Generalist\nMust be ready to go fast and get C results across cross-team initiatives.';
    const jd06Parsed = analyzeJobDescription(jd06Text);
    expect(jd06Parsed.requiredSkills.some((s) => s.skillId === 'go' || s.skillId === 'c')).toBe(false);
    const jd06 = runJd(jd06Text);
    expect(jd06.success).toBe(true);
    if (jd06.success) {
      expect(jd06.result.skillResults.some((s) => s.skillId === 'go' || s.skillId === 'c')).toBe(false);
      expect(jd06.result.jdState).toBe('no_requirements_recognized');
      expect(jd06.result.applicationGuidance).toBe('Insufficient evidence to evaluate');
    }

    // JD-07: Contradictory seniority ("Entry-level Intern" + "7+ years")
    const jd07 = runJd('Entry-level Junior Intern\nRequired: 7+ years of Python and SQL experience.');
    expect(jd07.success).toBe(true);
    if (jd07.success) {
      expect(jd07.result.contradictionDetected).toBe(true);
      expect(jd07.result.jdState).toBe('ambiguous_or_contradictory');
    }

    // JD-08: Unsupported HR domain
    const jd08 = runJd('HR Business Partner\nRequired: Employee Relations, Payroll Compliance, HRIS Workday, Compensation Benchmarking.');
    expect(jd08.success).toBe(true);
    if (jd08.success) {
      expect(jd08.result.jdState).toBe('unsupported_domain');
      expect(jd08.result.domainCapability?.tier).toBe('unsupported');
      expect(jd08.result.applicationGuidance).toBe('Insufficient evidence to evaluate');
    }

    // JD-09: Education / Certification only (0 technical skills)
    const jd09 = runJd('Operations Compliance Coordinator\nRequired: Bachelor degree in Business Administration and PMP.');
    expect(jd09.success).toBe(true);
    if (jd09.success) {
      expect(jd09.result.jdState).toBe('edu_cert_only');
      expect(jd09.result.jobAnalysis?.requiredEducation).toBeDefined();
      expect(jd09.result.applicationGuidance).toBe('Insufficient evidence to evaluate');
    }

    // JD-10: Compound AND / OR requirements
    const jd10 = runJd('Backend Engineer\nRequired: Python AND (PostgreSQL OR MySQL) AND (Docker OR Kubernetes).');
    expect(jd10.success).toBe(true);
    if (jd10.success) {
      expect(jd10.result.skillResults.length).toBe(3);
      expect(jd10.result.mustHavesMet).toBe('3/3');
    }
  });

  it('verifies Domain Capability tiers (Supported, Partial, Experimental, Unsupported) & disabled 64-pt cap', () => {
    const pm = runAtsEngine(BASE_EXPERIENCED_RESUME, 'Product Manager\nRequired: Product Roadmapping, A/B Testing, Product Analytics');
    expect(pm.success && pm.result.domainCapability?.tier).toBe('partial');

    const fin = runAtsEngine(BASE_EXPERIENCED_RESUME, 'Financial Analyst\nRequired: Financial Modeling, FP&A, GAAP');
    expect(fin.success && fin.result.domainCapability?.tier).toBe('experimental');
    if (fin.success) {
      expect(fin.result.applicationGuidance).not.toBe('Ready to apply');
    }

    // Negative control for obsolete 64-pt cap: <50% must-haves (1/3) with strong evidence/metrics/projects/format exceeds 64
    const uncappedScore = computeAtsScore({
      wordCount: 350,
      skillResults: [
        { skillId: 'python', canonical: 'Python', category: 'languages', required: 'must', weight: 5, found: true, status: 'verified', evidence: [{ quote: 'Built Python API', section: 'Experience', weight: 1 }], proficiency: 4, evidenceScore: 1.0 },
        { skillId: 'kubernetes', canonical: 'Kubernetes', category: 'devops', required: 'must', weight: 5, found: false, status: 'missing', evidence: [], proficiency: 0, evidenceScore: 0 },
        { skillId: 'terraform', canonical: 'Terraform', category: 'devops', required: 'must', weight: 5, found: false, status: 'missing', evidence: [], proficiency: 0, evidenceScore: 0 },
        { skillId: 'sql', canonical: 'SQL', category: 'databases', required: 'nice', weight: 4, found: true, status: 'verified', evidence: [{ quote: 'Optimized SQL', section: 'Experience', weight: 1 }], proficiency: 4, evidenceScore: 1.0 },
        { skillId: 'docker', canonical: 'Docker', category: 'devops', required: 'nice', weight: 4, found: true, status: 'verified', evidence: [{ quote: 'Deployed Docker', section: 'Experience', weight: 1 }], proficiency: 4, evidenceScore: 1.0 },
        { skillId: 'redis', canonical: 'Redis', category: 'databases', required: 'nice', weight: 4, found: true, status: 'verified', evidence: [{ quote: 'Cached with Redis', section: 'Experience', weight: 1 }], proficiency: 4, evidenceScore: 1.0 },
      ] as any,
      experience: [
        {
          company: 'PayGrid',
          role: 'Backend Engineer',
          bullets: [
            { rawText: 'Engineered Python APIs handling 5,000 req/s cutting latency by 40%', wordCount: 10, hasStrongVerb: true, hasWeakPhrase: false, hasMetric: true, hasTechMention: true, score: 95, issues: [] },
            { rawText: 'Optimized SQL queries reducing p95 latency by 35% across 12 services', wordCount: 11, hasStrongVerb: true, hasWeakPhrase: false, hasMetric: true, hasTechMention: true, score: 95, issues: [] },
          ],
        },
      ] as any,
      projects: [
        { title: 'P1', techStack: ['Python'], bullets: [{ rawText: 'Built Python cache achieving 99.4% hit ratio', wordCount: 8, hasStrongVerb: true, hasWeakPhrase: false, hasMetric: true, hasTechMention: true, score: 90, issues: [] }] },
        { title: 'P2', techStack: ['Docker'], bullets: [{ rawText: 'Automated Docker builds cutting deploy time by 50%', wordCount: 8, hasStrongVerb: true, hasWeakPhrase: false, hasMetric: true, hasTechMention: true, score: 90, issues: [] }] },
      ] as any,
      contactInfo: { name: 'Vikram', email: 'v@example.com', phone: '9876543210', linkedin: null, github: null, portfolio: null },
      sections: [
        { type: 'experience', rawTitle: 'Experience', content: 'Backend Engineer', charStart: 0, charEnd: 50 },
        { type: 'education', rawTitle: 'Education', content: 'B.Tech CS', charStart: 51, charEnd: 80 },
        { type: 'skills', rawTitle: 'Skills', content: 'Python, SQL, Docker, Redis', charStart: 81, charEnd: 120 },
      ],
      candidateYears: 3,
      requiredYears: 0,
      targetTier: 'top_product',
    });
    expect(uncappedScore.mustHavesMet).toBe('1/3');
    expect(uncappedScore.score).toBeGreaterThan(64);
  });

  describe('Contact Penalty Policy (4.0.0-ats7d Frozen Contract — 4 Combinations)', () => {
    const runContactCase = (resume: string) => runAtsEngine(resume, BACKEND_JD);

    it('Case 1: both email and phone present -> 0 contact penalty, no trace adjustment', () => {
      const res = runContactCase(BASE_EXPERIENCED_RESUME);
      expect(res.success).toBe(true);
      if (!res.success) return;
      const contactPenalties = res.result.penalties.filter((p) => p.id === 'no_contact_info' || p.cause === 'missing_contact_channels');
      expect(contactPenalties).toHaveLength(0);
      expect(res.result.trace?.adjustments.filter((a) => a.id === 'no_contact_info')).toHaveLength(0);
    });

    it('Case 2: email present, phone missing -> -5 penalty ("Missing Phone Contact Channel")', () => {
      const base = runContactCase(BASE_EXPERIENCED_RESUME);
      const noPhone = runContactCase(BASE_EXPERIENCED_RESUME.replace(' | +91 9876543299', ''));
      expect(base.success && noPhone.success).toBe(true);
      if (!base.success || !noPhone.success) return;
      const contactPenalties = noPhone.result.penalties.filter((p) => p.id === 'no_contact_info');
      expect(contactPenalties).toHaveLength(1);
      expect(contactPenalties[0]).toMatchObject({ id: 'no_contact_info', label: 'Missing Phone Contact Channel', points: -5 });
      expect(noPhone.result.trace?.adjustments.find((a) => a.id === 'no_contact_info')?.delta).toBe(-5);
      expect(noPhone.result.score).toBe(base.result.score - 5);
    });

    it('Case 3: phone present, email missing -> -5 penalty ("Missing Email Contact Channel")', () => {
      const base = runContactCase(BASE_EXPERIENCED_RESUME);
      const noEmail = runContactCase(BASE_EXPERIENCED_RESUME.replace('vikram@example.com | ', ''));
      expect(base.success && noEmail.success).toBe(true);
      if (!base.success || !noEmail.success) return;
      const contactPenalties = noEmail.result.penalties.filter((p) => p.id === 'no_contact_info');
      expect(contactPenalties).toHaveLength(1);
      expect(contactPenalties[0]).toMatchObject({ id: 'no_contact_info', label: 'Missing Email Contact Channel', points: -5 });
      expect(noEmail.result.trace?.adjustments.find((a) => a.id === 'no_contact_info')?.delta).toBe(-5);
      expect(noEmail.result.score).toBe(base.result.score - 5);
    });

    it('Case 4: neither email nor phone present -> -5 penalty ("Missing Critical Contact Information") without duplicate deductions', () => {
      const base = runContactCase(BASE_EXPERIENCED_RESUME);
      const neither = runContactCase(BASE_EXPERIENCED_RESUME.replace('vikram@example.com | +91 9876543299 | ', ''));
      expect(base.success && neither.success).toBe(true);
      if (!base.success || !neither.success) return;
      const contactPenalties = neither.result.penalties.filter((p) => p.id === 'no_contact_info' || p.cause === 'missing_contact_channels');
      expect(contactPenalties).toHaveLength(1);
      expect(contactPenalties[0]).toMatchObject({ id: 'no_contact_info', label: 'Missing Critical Contact Information', points: -5 });
      expect(neither.result.trace?.adjustments.filter((a) => a.id === 'no_contact_info')).toHaveLength(1);
      expect(neither.result.score).toBe(base.result.score - 5);
    });
  });

  describe('PDF Extraction Integrity & Scanned-PDF Recovery', () => {
    it('extracts text-based PDFs completely despite Node pdfjs-dist standardFontDataUrl stderr warning', async () => {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const page = doc.addPage([612, 792]);
      const lines = BASE_EXPERIENCED_RESUME.split('\n');
      lines.forEach((line, idx) => {
        page.drawText(line, { x: 40, y: 740 - idx * 18, size: 11, font });
      });
      const bytes = await doc.save();
      const file = new File([new Uint8Array(bytes)], 'vikram-resume.pdf', { type: 'application/pdf' });
      const text = await extractTextFromFile(file);

      expect(text).toContain('vikram@example.com');
      expect(text).toContain('Python');
      expect(text).toContain('PostgreSQL');
      const engineRes = runAtsEngine(text, BACKEND_JD);
      expect(engineRes.success).toBe(true);
      if (engineRes.success) {
        expect(engineRes.result.mustHavesMetRatio).toBe(1);
      }
    });

    it('detects scanned/image-only PDFs cleanly with recovery guidance and no normal score', async () => {
      const doc = await PDFDocument.create();
      doc.addPage([612, 792]);
      const bytes = await doc.save();
      const file = new File([new Uint8Array(bytes)], 'scanned-resume.pdf', { type: 'application/pdf' });
      const extracted = await extractFromFile(file);

      expect(extracted.ok).toBe(false);
      if (extracted.ok) return;
      expect(extracted.reason).toBe('image-only');
      expect(extracted.message).toMatch(/no selectable text layer|scanned/i);
    });
  });

  describe('12-Domain Behavioral Coverage & False-Positive Avoidance', () => {
    const DOMAIN_CASES: Array<{
      name: string;
      expectedDomainId: string;
      expectedTier: 'supported' | 'partial' | 'experimental' | 'unsupported';
      jd: string;
      matchingResume: string;
      expectedRecognizedCountMin: number;
      expectMatchFound: boolean;
    }> = [
      {
        name: 'Software Engineering',
        expectedDomainId: 'software_engineering',
        expectedTier: 'supported',
        jd: 'Software Engineer\nRequired: TypeScript, React, Node.js, SQL, Git',
        matchingResume: 'Alex Chen\nalex@example.com | +1 5551112222\nExperience\nSoftware Engineer, AppCo (2022-2026)\n- Built TypeScript and React frontend with Node.js APIs and SQL.\nSkills: TypeScript, React, Node.js, SQL, Git',
        expectedRecognizedCountMin: 4,
        expectMatchFound: true,
      },
      {
        name: 'Cloud and DevOps',
        expectedDomainId: 'cloud_devops',
        expectedTier: 'supported',
        jd: 'Cloud DevOps Engineer\nRequired: Kubernetes, Terraform, AWS, Docker, CI/CD',
        matchingResume: 'Samira Ali\nsamira@example.com | +1 5551112223\nExperience\nSRE, CloudOps (2022-2026)\n- Managed Kubernetes clusters on AWS with Terraform, Docker, and CI/CD.\nSkills: Kubernetes, Terraform, AWS, Docker, CI/CD',
        expectedRecognizedCountMin: 4,
        expectMatchFound: true,
      },
      {
        name: 'Data and Analytics',
        expectedDomainId: 'data_analytics',
        expectedTier: 'supported',
        jd: 'Data Analyst\nRequired: SQL, Python, Tableau, dbt, Airflow',
        matchingResume: 'Maya Lin\nmaya@example.com | +1 5551112224\nExperience\nData Analyst, InsightCo (2022-2026)\n- Built SQL and Python pipelines using dbt and Airflow with Tableau dashboards.\nSkills: SQL, Python, Tableau, dbt, Airflow',
        expectedRecognizedCountMin: 4,
        expectMatchFound: true,
      },
      {
        name: 'Cybersecurity',
        expectedDomainId: 'cybersecurity',
        expectedTier: 'partial',
        jd: 'SOC Analyst / Cybersecurity\nRequired: SIEM, Splunk, Incident Response, OWASP, Vulnerability Management, SOC2 Compliance',
        matchingResume: 'Leo Park\nleo@example.com | +1 5551112225\nExperience\nSecurity Analyst, SecCorp (2022-2026)\n- Built SIEM detections in Splunk and led Incident Response and OWASP security audits.\nSkills: SIEM, Splunk, Incident Response, OWASP',
        expectedRecognizedCountMin: 2,
        expectMatchFound: true,
      },
      {
        name: 'Product Management',
        expectedDomainId: 'product_management',
        expectedTier: 'partial',
        jd: 'Product Manager\nRequired: Product Roadmapping, A/B Testing, Product Analytics, Executive Stakeholder Alignment',
        matchingResume: 'Nina Roy\nnina@example.com | +1 5551112226\nExperience\nProduct Manager, SaaSCo (2022-2026)\n- Owned Product Roadmapping, A/B Testing, and Product Analytics improving retention by 18%.\nSkills: Product Roadmapping, A/B Testing, Product Analytics',
        expectedRecognizedCountMin: 2,
        expectMatchFound: true,
      },
      {
        name: 'Design and UX',
        expectedDomainId: 'design_ux',
        expectedTier: 'partial',
        jd: 'Product Designer / UX Designer\nRequired: Figma, UX Research, Design Systems, Usability Testing, Visual Portfolio Review',
        matchingResume: 'Tara Bose\ntara@example.com | +1 5551112227\nExperience\nProduct Designer, StudioX (2022-2026)\n- Built Design Systems in Figma and conducted UX Research and Usability Testing.\nSkills: Figma, UX Research, Design Systems, Usability Testing',
        expectedRecognizedCountMin: 2,
        expectMatchFound: true,
      },
      {
        name: 'Business Operations',
        expectedDomainId: 'business_ops',
        expectedTier: 'experimental',
        jd: 'Business Operations Analyst\nRequired: SQL, Process Improvement, Vendor Management, Supply Chain Coordination',
        matchingResume: 'Omar Khan\nomar@example.com | +1 5551112228\nExperience\nOperations Analyst, LogiCo (2022-2026)\n- Automated SQL reporting and vendor management saving 12% cost.\nSkills: SQL, Vendor Management',
        expectedRecognizedCountMin: 1,
        expectMatchFound: true,
      },
      {
        name: 'Marketing',
        expectedDomainId: 'marketing',
        expectedTier: 'experimental',
        jd: 'Growth Marketing Manager\nRequired: SEO, SEM, Lifecycle Email, Campaign Analytics, HubSpot',
        matchingResume: 'Zoe Reed\nzoe@example.com | +1 5551112229\nExperience\nGrowth Marketer, BrandCo (2022-2026)\n- Scaled SEO and SEM campaigns in HubSpot with campaign analytics.\nSkills: SEO, HubSpot',
        expectedRecognizedCountMin: 1,
        expectMatchFound: true,
      },
      {
        name: 'Finance',
        expectedDomainId: 'finance',
        expectedTier: 'experimental',
        jd: 'Financial Analyst\nRequired: Financial Modeling, FP&A, GAAP, DCF Valuation',
        matchingResume: 'Raj Shah\nraj@example.com | +1 5551112230\nExperience\nFinancial Analyst, CapCo (2022-2026)\n- Built FP&A and DCF Financial Modeling under GAAP.\nSkills: Financial Modeling, FP&A, GAAP',
        expectedRecognizedCountMin: 1,
        expectMatchFound: true,
      },
      {
        name: 'Sales',
        expectedDomainId: 'sales',
        expectedTier: 'unsupported',
        jd: 'Enterprise Account Executive\nRequired: Quota-Carrying B2B Sales, Territory Sales, Cold Calling, Pipeline Quota Attainment',
        matchingResume: 'Chris Bell\nchris@example.com | +1 5551112231\nExperience\nAccount Executive, SalesCo (2022-2026)\n- Exceeded 120% B2B sales quota across enterprise territory.\nSkills: B2B Sales, Territory Sales',
        expectedRecognizedCountMin: 0,
        expectMatchFound: false,
      },
      {
        name: 'HR and Recruitment',
        expectedDomainId: 'hr',
        expectedTier: 'unsupported',
        jd: 'HR Business Partner\nRequired: Employee Relations, HRIS Workday, Payroll Compliance, Compensation Benchmarking',
        matchingResume: 'Elena Diaz\nelena@example.com | +1 5551112232\nExperience\nHRBP, PeopleCo (2022-2026)\n- Led Employee Relations and Workday HRIS administration.\nSkills: Employee Relations, Workday',
        expectedRecognizedCountMin: 0,
        expectMatchFound: false,
      },
      {
        name: 'Non-computational Research',
        expectedDomainId: 'research',
        expectedTier: 'unsupported',
        jd: 'Wet Lab Scientist\nRequired: Molecular Biology, Histology, Bench Research, Clinical Trial Protocol',
        matchingResume: 'Dr. Meera Iyer\nmeera@example.com | +1 5551112233\nExperience\nResearch Fellow, BioLab (2022-2026)\n- Conducted molecular biology and histology bench research.\nSkills: Molecular Biology, Histology',
        expectedRecognizedCountMin: 0,
        expectMatchFound: false,
      },
    ];

    const UNRELATED_CONTROL_RESUME = `Pat Control
pat@example.com | +1 5550000000
Education
High School Diploma, Central High School, 2021
Experience
Lead Barista, CoffeeHouse Roasters (Jan 2023 - Dec 2025)
- Prepared specialty espresso beverages and calibrated daily grinder settings for high-volume morning service.
- Managed daily register reconciliation, inventory ordering, and opening shift checklists for a team of four staff.
Skills
Espresso Extraction, Customer Service, Cash Handling, Inventory Scheduling`;

    const padResume = (r: string) =>
      `${r}\nEducation\nBachelor Degree, State University, 2021\nSummary\nExperienced professional with verified track record of delivering measurable outcomes, cross-functional collaboration, and structured execution across production deliverables.`;

    for (const c of DOMAIN_CASES) {
      it(`evaluates ${c.name} (${c.expectedTier}) with honest disclosure and false-positive avoidance`, () => {
        const matched = runAtsEngine(padResume(c.matchingResume), c.jd);
        const control = runAtsEngine(UNRELATED_CONTROL_RESUME, c.jd);
        expect(matched.success && control.success).toBe(true);
        if (!matched.success || !control.success) return;

        // 1. Domain classification
        expect(matched.result.domainCapability?.domainId).toBe(c.expectedDomainId);
        expect(matched.result.domainCapability?.tier).toBe(c.expectedTier);

        // 2. Recognized requirements
        expect(matched.result.skillResults.length).toBeGreaterThanOrEqual(c.expectedRecognizedCountMin);

        // 3. Unrecognized/unsupported requirements preserved or disclosed
        if (c.expectedTier === 'unsupported') {
          expect(matched.result.jdState).toBe('unsupported_domain');
        }

        // 4. Candidate evidence matches & 5. False-positive avoidance
        if (c.expectMatchFound) {
          expect(
            matched.result.skillResults.some((s) => s.found),
            `Expected match in ${c.name}, got: ${JSON.stringify(matched.result.skillResults.map((s) => ({ id: s.skillId, found: s.found, ev: s.evidence.length, cs: s.claimSupport })))}`
          ).toBe(true);
          expect(control.result.skillResults.some((s) => s.found)).toBe(false);
        }

        // 6. Score availability
        expect(matched.result.score).toBeGreaterThanOrEqual(0);
        expect(matched.result.score).toBeLessThanOrEqual(100);

        // 7. Readiness behavior
        if (c.expectedTier !== 'supported') {
          expect(matched.result.applicationGuidance).not.toBe('Ready to apply');
        }
        if (c.expectedTier === 'unsupported') {
          expect(matched.result.applicationGuidance).toBe('Insufficient evidence to evaluate');
        }

        // 8. Visible limitation disclosure
        expect(matched.result.domainCapability?.reason.length).toBeGreaterThan(15);
      });
    }
  });

  describe('Compound AND/OR Requirement Semantics (8-Case Truth Table, Precedence & No Duplicate Credit)', () => {
    const COMPOUND_JD = `Backend Engineer
Required Qualifications:
- Python AND (PostgreSQL OR MySQL) AND (Docker OR Kubernetes)`;

    const makeCompoundResume = (bullets: string[], skillsLine: string, extraSection = '') => `Aarav Shah
aarav@example.com | +91 9876543210 | github.com/aarav-dev
Education
B.Tech Computer Science, State University, 2022
Experience
Backend Engineer, CloudGrid (Jan 2023 - Jan 2026)
${bullets.map((b) => `- ${b}`).join('\n')}
- Collaborated with cross-functional product teams on sprint planning, observability, and release checklists.
Skills
${skillsLine}
${extraSection}`.trim();

    const TRUTH_TABLE: Array<{
      id: string;
      resume: string;
      groupA: boolean;
      groupB: boolean;
      groupC: boolean;
      expectedMet: string;
      expectedRatio: number;
      expectedDbCanonical?: string;
      expectedContainerCanonical?: string;
    }> = [
      {
        id: 'ANDOR-01',
        resume: makeCompoundResume(
          [
            'Engineered Python APIs backed by MySQL handling 4,000 req/s with 99.9% uptime.',
            'Deployed services to Kubernetes clusters with automated rollbacks reducing deploy time by 35%.',
          ],
          'Python, MySQL, Kubernetes'
        ),
        groupA: true,
        groupB: true,
        groupC: true,
        expectedMet: '3/3',
        expectedRatio: 1,
        expectedDbCanonical: 'MySQL',
        expectedContainerCanonical: 'Kubernetes',
      },
      {
        id: 'ANDOR-02',
        resume: makeCompoundResume(
          [
            'Engineered Python APIs backed by PostgreSQL handling 4,000 req/s with 99.9% uptime.',
            'Deployed services to Kubernetes clusters with automated rollbacks reducing deploy time by 35%.',
          ],
          'Python, PostgreSQL, Kubernetes'
        ),
        groupA: true,
        groupB: true,
        groupC: true,
        expectedMet: '3/3',
        expectedRatio: 1,
        expectedDbCanonical: 'PostgreSQL',
        expectedContainerCanonical: 'Kubernetes',
      },
      {
        id: 'ANDOR-03',
        resume: makeCompoundResume(
          [
            'Engineered Python APIs backed by MySQL handling 4,000 req/s with 99.9% uptime.',
            'Containerized microservices with Docker reducing deployment overhead by 35%.',
          ],
          'Python, MySQL, Docker'
        ),
        groupA: true,
        groupB: true,
        groupC: true,
        expectedMet: '3/3',
        expectedRatio: 1,
        expectedDbCanonical: 'MySQL',
        expectedContainerCanonical: 'Docker',
      },
      {
        id: 'ANDOR-04',
        resume: makeCompoundResume(
          [
            'Engineered Python automation services handling 4,000 req/s with 99.9% uptime.',
            'Improved unit test coverage from 60% to 92% across internal libraries.',
          ],
          'Python'
        ),
        groupA: true,
        groupB: false,
        groupC: false,
        expectedMet: '1/3',
        expectedRatio: 1 / 3,
      },
      {
        id: 'ANDOR-05',
        resume: makeCompoundResume(
          [
            'Engineered Python APIs backed by PostgreSQL handling 4,000 req/s with 99.9% uptime.',
            'Optimized relational query indexing reducing p95 latency by 35%.',
          ],
          'Python, PostgreSQL'
        ),
        groupA: true,
        groupB: true,
        groupC: false,
        expectedMet: '2/3',
        expectedRatio: 2 / 3,
        expectedDbCanonical: 'PostgreSQL',
      },
      {
        id: 'ANDOR-06',
        resume: makeCompoundResume(
          [
            'Engineered backend services backed by PostgreSQL handling 4,000 req/s with 99.9% uptime.',
            'Deployed workloads on Kubernetes clusters reducing deploy time by 35%.',
          ],
          'PostgreSQL, Kubernetes'
        ),
        groupA: false,
        groupB: true,
        groupC: true,
        expectedMet: '2/3',
        expectedRatio: 2 / 3,
        expectedDbCanonical: 'PostgreSQL',
        expectedContainerCanonical: 'Kubernetes',
      },
      {
        id: 'ANDOR-07',
        resume: makeCompoundResume(
          [
            'Engineered Python APIs backed by PostgreSQL and MySQL handling 4,000 req/s with 99.9% uptime.',
            'Deployed Docker containers on Kubernetes clusters reducing deploy time by 35%.',
          ],
          'Python, PostgreSQL, MySQL, Docker, Kubernetes'
        ),
        groupA: true,
        groupB: true,
        groupC: true,
        expectedMet: '3/3',
        expectedRatio: 1,
      },
      {
        id: 'ANDOR-08',
        resume: `Aarav Shah
aarav@example.com | +91 9876543210 | github.com/aarav-dev
Personal Notes
Favorite film: Monty Python and the Holy Grail.
Education
B.Tech Computer Science, State University, 2022
Experience
Backend Engineer, CloudGrid (Jan 2023 - Jan 2026)
- Engineered backend services backed by MySQL handling 4,000 req/s with 99.9% uptime.
- Deployed workloads on Kubernetes clusters with automated rollbacks reducing deploy time by 35%.
- Collaborated with cross-functional product teams on sprint planning, observability, and release checklists.
Skills
MySQL, Kubernetes`,
        groupA: false,
        groupB: true,
        groupC: true,
        expectedMet: '2/3',
        expectedRatio: 2 / 3,
        expectedDbCanonical: 'MySQL',
        expectedContainerCanonical: 'Kubernetes',
      },
    ];

    it('parses Python AND (PostgreSQL OR MySQL) AND (Docker OR Kubernetes) into 3 logical requirement groups', () => {
      const parsed = analyzeJobDescription(COMPOUND_JD);
      expect(parsed.requiredSkills).toHaveLength(3);
      const [gA, gB, gC] = parsed.requiredSkills;
      expect(gA.skillId).toBe('python');
      expect(gA.required).toBe('must');
      expect(gB.logicalExpression?.operator).toBe('OR');
      expect(gB.orAlternatives).toEqual(['mysql']);
      expect(gC.logicalExpression?.operator).toBe('OR');
      expect(gC.orAlternatives).toEqual(['kubernetes']);
    });

    for (const tc of TRUTH_TABLE) {
      it(`${tc.id}: evaluates Group A=${tc.groupA}, Group B=${tc.groupB}, Group C=${tc.groupC} -> ${tc.expectedMet}`, () => {
        const res = runAtsEngine(tc.resume, COMPOUND_JD);
        expect(res.success).toBe(true);
        if (!res.success) return;

        const r = res.result;
        expect(r.skillResults).toHaveLength(3);
        const [resA, resB, resC] = r.skillResults;

        expect(resA.found, `resA=${JSON.stringify({ found: resA.found, ev: resA.evidence, cs: resA.claimSupport })}`).toBe(tc.groupA);
        expect(resB.found).toBe(tc.groupB);
        expect(resC.found).toBe(tc.groupC);
        expect(r.mustHavesMet).toBe(tc.expectedMet);
        expect(r.mustHavesMetRatio).toBeCloseTo(tc.expectedRatio, 2);

        if (tc.expectedDbCanonical && tc.expectedDbCanonical !== 'PostgreSQL') {
          expect(resB.isSubstituteMatch).toBe(true);
          expect(resB.satisfiedByCanonical).toBe(tc.expectedDbCanonical);
        }
        if (tc.expectedContainerCanonical && tc.expectedContainerCanonical !== 'Docker') {
          expect(resC.isSubstituteMatch).toBe(true);
          expect(resC.satisfiedByCanonical).toBe(tc.expectedContainerCanonical);
        }

        // ScoreTrace consistency
        expect(r.trace).toBeDefined();
        const t = r.trace!;
        const pillarSum = Math.round(t.pillars.reduce((s, x) => s + x.contribution, 0) * 10) / 10;
        expect(t.rawSubtotal).toBe(pillarSum);
        expect(t.composite).toBe(r.score);
      });
    }

    it('prevents duplicate must-have or scoring credit when all 5 skills are present (ANDOR-07 vs ANDOR-02)', () => {
      const rAll5 = runAtsEngine(TRUTH_TABLE.find((t) => t.id === 'ANDOR-07')!.resume, COMPOUND_JD);
      const rExact3 = runAtsEngine(TRUTH_TABLE.find((t) => t.id === 'ANDOR-02')!.resume, COMPOUND_JD);
      expect(rAll5.success && rExact3.success).toBe(true);
      if (!rAll5.success || !rExact3.success) return;

      expect(rAll5.result.mustHavesMet).toBe('3/3');
      expect(rAll5.result.subscores.mustHaveCoverage).toBe(rExact3.result.subscores.mustHaveCoverage);
      expect(rAll5.result.score).toBe(rExact3.result.score);
    });

    it('enforces parentheses, precedence, and unresolved handling for malformed expressions', () => {
      const aAndOr = parseLogicalRequirement('Python AND (PostgreSQL OR MySQL)')!;
      const aAndThenOr = parseLogicalRequirement('(Python AND PostgreSQL) OR MySQL')!;
      expect(aAndOr.operator).toBe('AND');
      expect(aAndThenOr.operator).toBe('OR');

      const dockerAndOr = parseLogicalRequirement('Python AND (Docker OR Kubernetes)')!;
      const dockerAndThenOr = parseLogicalRequirement('(Python AND Docker) OR Kubernetes')!;
      expect(dockerAndOr.operator).toBe('AND');
      expect(dockerAndThenOr.operator).toBe('OR');

      const multiOr = parseLogicalRequirement('Python AND (PostgreSQL OR MySQL OR Redis)')!;
      expect(multiOr.operator).toBe('AND');
      expect(multiOr.operands?.[1]?.operator).toBe('OR');
      expect(multiOr.operands?.[1]?.operands).toHaveLength(3);

      const malformed = parseLogicalRequirement('Python AND (PostgreSQL OR MySQL');
      expect(malformed?.operator).toBe('UNRESOLVED');
      expect(malformed?.unresolved).toBe(true);
      const parsedMalformed = analyzeJobDescription('Backend Engineer\nRequired: Python AND (PostgreSQL OR MySQL');
      expect(parsedMalformed.unresolvedRequirements?.length).toBeGreaterThan(0);
    });
  });
});
