import { describe, it, expect } from 'vitest';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
import {
  getPerformativeEvidence,
  getPrimaryPerformativeBullet,
  PerformativeEvidencePackage,
} from '../engine/resumeEvidenceEngine';
import { OpportunityRecord } from '../types';

describe('Performative Resume Evidence Engine', () => {
  const mockCloudOpp: OpportunityRecord = {
    id: 'test-aws-saa',
    name: 'AWS Solutions Architect Associate',
    slug: 'aws-saa',
    category: ['cloud', 'devops'],
    kind: 'certification',
    type: 'certification',
    issuer: 'Amazon Web Services',
    description: 'Cloud architecture design certification.',
    difficulty: 'intermediate',
    preparationWeeks: 8,
    cost: { amount: 150, currency: 'USD', isFree: false },
    prerequisites: ['AWS Cloud Practitioner or equivalent experience'],
    relatedSkills: ['AWS', 'CloudFormation', 'Terraform', 'Lambda', 'S3'],
    targetRoles: ['Cloud Solutions Architect', 'DevOps Engineer'],
    expectedSalaryImpact: 'High',
    industryRecognition: 95,
    sourceVerified: true,
    lastVerifiedDate: '2026-04-01',
    evidenceArtifacts: ['Digital Badge', 'Cert ID'],
    resumePresentationTemplate: 'AWS Certified Solutions Architect – Associate (Validation ID: [AWS-CERT-ID]).',
    verificationMethod: 'AWS Training and Certification Portal',
    freshnessTier: 'high',
  };

  const mockWebOpp: OpportunityRecord = {
    id: 'test-meta-react',
    name: 'Meta Front-End Developer Certificate',
    slug: 'meta-frontend',
    category: ['frontend', 'web-development'],
    kind: 'certification',
    type: 'certification',
    issuer: 'Meta',
    description: 'Modern React and front-end engineering.',
    difficulty: 'beginner',
    preparationWeeks: 12,
    cost: { amount: 49, currency: 'USD', isFree: false },
    prerequisites: ['Basic HTML/CSS'],
    relatedSkills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Jest'],
    targetRoles: ['Frontend Engineer', 'Full Stack Developer'],
    expectedSalaryImpact: 'Moderate',
    industryRecognition: 88,
    sourceVerified: true,
    lastVerifiedDate: '2026-04-01',
    evidenceArtifacts: ['Coursera Verified Certificate'],
    resumePresentationTemplate: 'Meta Certified Front-End Developer.',
    verificationMethod: 'Coursera Verification',
    freshnessTier: 'high',
  };

  const mockMlOpp: OpportunityRecord = {
    id: 'test-ml-spec',
    name: 'Deep Learning Specialization',
    slug: 'deep-learning-specialization',
    category: ['ai-ml', 'data-science'],
    kind: 'certification',
    type: 'certification',
    issuer: 'DeepLearning.AI',
    description: 'Neural networks and deep learning.',
    difficulty: 'advanced',
    preparationWeeks: 16,
    cost: { amount: 49, currency: 'USD', isFree: false },
    prerequisites: ['Linear algebra', 'Python'],
    relatedSkills: ['PyTorch', 'TensorFlow', 'Computer Vision', 'NLP'],
    targetRoles: ['ML Engineer', 'Research Scientist'],
    expectedSalaryImpact: 'High',
    industryRecognition: 94,
    sourceVerified: true,
    lastVerifiedDate: '2026-04-01',
    evidenceArtifacts: ['Coursera Certificate'],
    resumePresentationTemplate: 'Deep Learning Specialization Certificate.',
    verificationMethod: 'Coursera URL',
    freshnessTier: 'high',
  };

  const mockSecurityOpp: OpportunityRecord = {
    id: 'test-sec-plus',
    name: 'CompTIA Security+',
    slug: 'comptia-security-plus',
    category: ['cybersecurity'],
    kind: 'certification',
    type: 'certification',
    issuer: 'CompTIA',
    description: 'Core cybersecurity certification.',
    difficulty: 'intermediate',
    preparationWeeks: 10,
    cost: { amount: 390, currency: 'USD', isFree: false },
    prerequisites: ['Network+ recommended'],
    relatedSkills: ['SIEM', 'Threat Analysis', 'Cryptography', 'Zero Trust'],
    targetRoles: ['SOC Analyst', 'Security Engineer'],
    expectedSalaryImpact: 'High',
    industryRecognition: 92,
    sourceVerified: true,
    lastVerifiedDate: '2026-04-01',
    evidenceArtifacts: ['CompTIA CertMetrics'],
    resumePresentationTemplate: 'CompTIA Security+ (SY0-701).',
    verificationMethod: 'CompTIA CertMetrics',
    freshnessTier: 'high',
  };

  const mockHackathonOpp: OpportunityRecord = {
    id: 'test-sih-event',
    name: 'Smart India Hackathon',
    slug: 'smart-india-hackathon',
    category: ['hackathon'],
    kind: 'event',
    type: 'hackathon',
    issuer: 'Ministry of Education',
    description: 'Nationwide innovation hackathon.',
    difficulty: 'advanced',
    preparationWeeks: 4,
    cost: { amount: 0, currency: 'INR', isFree: true },
    prerequisites: ['Team of 6'],
    relatedSkills: ['Full Stack', 'System Design', 'Rapid Prototyping'],
    targetRoles: ['Software Engineer', 'Product Engineer'],
    expectedSalaryImpact: 'High',
    industryRecognition: 96,
    sourceVerified: true,
    lastVerifiedDate: '2026-04-01',
    evidenceArtifacts: ['Finalist Certificate', 'Project Repo'],
    resumePresentationTemplate: 'Smart India Hackathon Finalist.',
    verificationMethod: 'SIH Portal',
    freshnessTier: 'high',
  };

  const mockOpenSourceOpp: OpportunityRecord = {
    id: 'test-gsoc-program',
    name: 'Google Summer of Code (GSoC)',
    slug: 'gsoc',
    category: ['open-source'],
    kind: 'program',
    type: 'fellowship',
    issuer: 'Google Open Source',
    description: 'Global open source mentorship program.',
    difficulty: 'advanced',
    preparationWeeks: 12,
    cost: { amount: 0, currency: 'USD', isFree: true },
    prerequisites: ['Prior Git and open-source contributions'],
    relatedSkills: ['Git', 'C++', 'Open Source', 'Architecture'],
    targetRoles: ['Software Engineer', 'Core Contributor'],
    expectedSalaryImpact: 'High',
    industryRecognition: 99,
    sourceVerified: true,
    lastVerifiedDate: '2026-04-01',
    evidenceArtifacts: ['Merged PRs', 'Contributor Archive'],
    resumePresentationTemplate: 'Google Summer of Code Contributor.',
    verificationMethod: 'GSoC Archive',
    freshnessTier: 'high',
  };

  const mockEmbeddedOpp: OpportunityRecord = {
    id: 'test-matlab-associate',
    name: 'MathWorks Certified MATLAB Associate',
    slug: 'matlab-associate',
    category: ['data-science', 'robotics'],
    kind: 'certification',
    type: 'certification',
    issuer: 'MathWorks',
    description: 'Computational modeling and algorithm certification.',
    difficulty: 'intermediate',
    preparationWeeks: 8,
    cost: { amount: 125, currency: 'USD', isFree: false },
    prerequisites: ['Basic MATLAB syntax'],
    relatedSkills: ['MATLAB', 'Simulink', 'DSP', 'Control Systems'],
    targetRoles: ['Embedded Systems Engineer', 'Simulation Engineer'],
    expectedSalaryImpact: 'Moderate',
    industryRecognition: 85,
    sourceVerified: true,
    lastVerifiedDate: '2026-04-01',
    evidenceArtifacts: ['MathWorks Credential'],
    resumePresentationTemplate: 'MathWorks Certified MATLAB Associate.',
    verificationMethod: 'MathWorks Portal',
    freshnessTier: 'high',
  };

  describe('Domain Detection & Format Completeness', () => {
    const testCases: [string, OpportunityRecord, string][] = [
      ['Cloud', mockCloudOpp, 'cloud'],
      ['Web', mockWebOpp, 'web'],
      ['Machine Learning', mockMlOpp, 'ml'],
      ['Security', mockSecurityOpp, 'security'],
      ['Hackathon / Event', mockHackathonOpp, 'event'],
      ['Open Source', mockOpenSourceOpp, 'opensource'],
      ['Embedded / MATLAB', mockEmbeddedOpp, 'embedded'],
    ];

    testCases.forEach(([domainName, opp, expectedDomain]) => {
      it(`generates a complete evidence package for ${domainName} domain (${expectedDomain})`, () => {
        const pkg: PerformativeEvidencePackage = getPerformativeEvidence(opp);

        expect(pkg.opportunityId).toBe(opp.id);
        expect(pkg.opportunityName).toBe(opp.name);
        expect(pkg.domain).toBe(expectedDomain);

        // Formats check: must have 4 distinct formats
        expect(pkg.formats.length).toBe(4);
        const formatIds = pkg.formats.map((f) => f.id);
        expect(formatIds).toContain('xyz_bullet');
        expect(formatIds).toContain('project_entry');
        expect(formatIds).toContain('cert_line');
        expect(formatIds).toContain('summary_hook');

        // Each format must have rich contents
        pkg.formats.forEach((f) => {
          expect(f.title.length).toBeGreaterThan(3);
          expect(f.badge.length).toBeGreaterThan(2);
          expect(f.section.length).toBeGreaterThan(2);
          expect(f.description.length).toBeGreaterThan(10);
          expect(f.template.length).toBeGreaterThan(30);
          expect(f.exampleCompleted.length).toBeGreaterThan(30);
          // Never contain raw un-interpolated template variables like {year} or {id}
          expect(f.template).not.toContain('{year}');
          expect(f.template).not.toContain('{id}');
          expect(f.exampleCompleted).not.toContain('{year}');
          expect(f.exampleCompleted).not.toContain('{id}');
        });

        // Metric suggestions check
        expect(pkg.metricSuggestions.length).toBeGreaterThanOrEqual(3);
        pkg.metricSuggestions.forEach((m) => {
          expect(m.label.length).toBeGreaterThan(2);
          expect(m.examples.length).toBeGreaterThanOrEqual(2);
          expect(m.hint.length).toBeGreaterThan(5);
        });

        // Artifact checklist check
        expect(pkg.artifactsChecklist.length).toBeGreaterThanOrEqual(4);
        pkg.artifactsChecklist.forEach((a) => {
          expect(a.title.length).toBeGreaterThan(2);
          expect(a.description.length).toBeGreaterThan(10);
          expect(a.recommendation.length).toBeGreaterThan(5);
        });

        // ATS Keywords check
        expect(pkg.atsKeywords.primarySkills.length).toBeGreaterThanOrEqual(1);
        expect(pkg.atsKeywords.secondarySkills.length).toBeGreaterThanOrEqual(2);
        expect(pkg.atsKeywords.roleAlignmentKeywords.length).toBeGreaterThanOrEqual(2);

        // Interview Defense STAR check
        expect(pkg.interviewDefense.length).toBeGreaterThanOrEqual(2);
        pkg.interviewDefense.forEach((item) => {
          expect(item.question.length).toBeGreaterThan(10);
          expect(item.starAnswerOutline.situation.length).toBeGreaterThan(10);
          expect(item.starAnswerOutline.task.length).toBeGreaterThan(10);
          expect(item.starAnswerOutline.action.length).toBeGreaterThan(10);
          expect(item.starAnswerOutline.result.length).toBeGreaterThan(10);
          expect(item.keyVocabulary.length).toBeGreaterThanOrEqual(2);
        });
      });
    });
  });

  describe('getPrimaryPerformativeBullet helper', () => {
    it('returns an action-impact XYZ formula bullet for any opportunity', () => {
      const bullet = getPrimaryPerformativeBullet(mockCloudOpp);
      expect(bullet).toBeDefined();
      expect(bullet.length).toBeGreaterThan(40);
      expect(bullet).toMatch(/\[.*\]/); // Contains bracketed placeholders for metrics
    });
  });

  describe('Global Catalog Quality Invariant: Zero Weak Templates Across All 102 Items', () => {
    it('ensures every single opportunity in ALL_OPPORTUNITIES has performative evidence without placeholders', () => {
      expect(ALL_OPPORTUNITIES.length).toBeGreaterThanOrEqual(100);

      const weakOpportunities: { id: string; name: string; template: string }[] = [];

      for (const opp of ALL_OPPORTUNITIES) {
        const template = opp.resumePresentationTemplate || '';

        // Check for legacy low-effort strings
        const isLegacyWeak =
          template.includes('{name}') ||
          template.includes('{year}') ||
          template.includes('{id}') ||
          template.includes('{url}') ||
          template.trim().length < 35;

        if (isLegacyWeak) {
          weakOpportunities.push({ id: opp.id, name: opp.name, template });
        }

        // Test performative package generation for every catalog item
        const pkg = getPerformativeEvidence(opp);
        expect(pkg.formats.length).toBe(4);
        expect(pkg.metricSuggestions.length).toBeGreaterThanOrEqual(3);
        expect(pkg.artifactsChecklist.length).toBeGreaterThanOrEqual(4);
        expect(pkg.interviewDefense.length).toBeGreaterThanOrEqual(2);
      }

      if (weakOpportunities.length > 0) {
        console.error('Found weak resume templates in catalog:', weakOpportunities);
      }
      expect(weakOpportunities).toHaveLength(0);
    });

    it('ensures XYZ format starts with a strong action verb across all catalog items', () => {
      const allowedVerbStarts = [
        'architected',
        'engineered',
        'developed',
        'designed',
        'built',
        'implemented',
        'spearheaded',
        'automated',
        'contributed',
        'containerized',
        'deployed',
        'hardened',
        'optimized',
        'simulated',
        'produced',
        'modeled',
        'ranked',
        'selected',
        'conducted',
      ];

      for (const opp of ALL_OPPORTUNITIES) {
        const pkg = getPerformativeEvidence(opp);
        const xyz = pkg.formats.find((f) => f.id === 'xyz_bullet');
        expect(xyz).toBeDefined();

        const firstWord = xyz!.template.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
        const hasActionVerb = allowedVerbStarts.includes(firstWord);
        expect(
          hasActionVerb,
          `Opportunity ${opp.id} XYZ template starts with "${firstWord}", expected strong action verb`
        ).toBe(true);
      }
    });
  });
});
