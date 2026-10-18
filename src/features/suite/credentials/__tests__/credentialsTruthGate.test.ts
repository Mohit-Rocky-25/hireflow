import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateTruthGate,
  generateSafeForwardLookingBullet,
  fillCredentialTemplate,
  PLACEHOLDER_REGEX,
} from '../engine/truthGate';
import { CredentialsStorage } from '../storage';
import { OpportunityRecord } from '../types';

describe('Truth Gate & Credential Bullet Integrity Engine', () => {
  const mockOpportunity: OpportunityRecord = {
    id: 'aws-certified-solutions-architect-associate',
    name: 'AWS Solutions Architect Associate',
    slug: 'aws-saa',
    category: ['cloud', 'devops'],
    kind: 'certification',
    type: 'certification',
    issuer: 'Amazon Web Services',
    organizer: 'Amazon Web Services',
    description: 'Cloud architecture design certification.',
    difficulty: 'intermediate',
    preparationWeeks: 8,
    cost: { amount: 150, currency: 'USD', isFree: false },
    prerequisites: 'AWS Cloud Practitioner or equivalent',
    relatedSkills: ['AWS', 'CloudFormation', 'Terraform', 'Kubernetes'],
    targetRoles: ['Cloud Solutions Architect', 'DevOps Engineer'],
    expectedSalaryImpact: 'High',
    industryRecognition: 95,
    sourceVerified: true,
    lastVerifiedDate: '2026-04-01',
    evidenceArtifacts: ['Digital Badge', 'Cert ID'],
    resumePresentationTemplate: 'AWS Certified Solutions Architect – Associate (Validation ID: [AWS-CERT-ID]).',
    verificationMethod: 'AWS Training and Certification Portal',
    freshnessTier: 'high',
    benefits: ['Industry benchmark cloud credential'],
    estimatedPreparationTime: '8-10 weeks',
    officialUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    resumeValue: 'high',
    evidenceValue: 'high',
    portfolioValue: 'high',
    skillsDemonstrated: ['AWS VPC', 'Auto Scaling', 'S3'],
    preparationChecklist: ['Review exam guide', 'Complete practice exams'],
    projectOutcomeExpectations: 'Deploy 3-tier VPC architecture with RDS failover',
    relatedProjects: ['High Availability WordPress', 'Serverless API'],
    recommendedOrder: 1,
    suitabilityNotes: 'Best intermediate cloud credential',
    confidence: 'verified_active',
    lastVerifiedAt: '2026-04-01',
    sourceUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    lastVerified: '2026-04-01',
    verificationStatus: 'verified',
    recurrence: 'ongoing',
    datesChangeYearly: false,
    eligibility: null,
    feeWaiverNote: '50% exam discount voucher granted upon passing any prior AWS exam.',
    nextWindowNote: 'Exam available on-demand daily via Pearson VUE.',
  };

  beforeEach(() => {
    CredentialsStorage.clearPlan();
  });

  describe('Truth Gate Validation Rules', () => {
    it('blocks empty content', () => {
      const res = validateTruthGate('', 'Earned');
      expect(res.isValid).toBe(false);
      expect(res.reason).toBe('empty_content');
    });

    it('blocks Earned credential when [CREDENTIAL_ID] placeholder is unfilled', () => {
      const text =
        'AWS Solutions Architect Associate | Amazon Web Services (Credential ID: [CREDENTIAL_ID], Earned: Nov 2025, Score: 920/1000) — Validated expertise.';
      const res = validateTruthGate(text, 'Earned');
      expect(res.isValid).toBe(false);
      expect(res.reason).toBe('unfilled_placeholder');
      expect(res.unfilledPlaceholders).toContain('[CREDENTIAL_ID]');
    });

    it('blocks Earned credential when [DATE_EARNED] or [SCORE] placeholder is unfilled', () => {
      const text =
        'AWS Solutions Architect Associate | Amazon Web Services (Credential ID: AWS-8812, Earned: [DATE_EARNED], Score: [SCORE]) — Validated expertise.';
      const res = validateTruthGate(text, 'Earned');
      expect(res.isValid).toBe(false);
      expect(res.reason).toBe('unfilled_placeholder');
      expect(res.unfilledPlaceholders).toEqual(expect.arrayContaining(['[DATE_EARNED]', '[SCORE]']));
    });

    it('passes Earned credential when all placeholders are filled with genuine values', () => {
      const text =
        'AWS Solutions Architect Associate | Amazon Web Services (Credential ID: AWS-8812903, Earned: Nov 2025, Score: 920/1000) — Validated expertise in AWS, CloudFormation, and Terraform; deployed production-grade capstone architectures.';
      const res = validateTruthGate(text, 'Earned');
      expect(res.isValid).toBe(true);
      expect(res.unfilledPlaceholders).toBeUndefined();
    });

    it('rejects fraudulent completion claims when state is Planned or In progress', () => {
      const fraudulentText =
        'AWS Solutions Architect Associate | Amazon Web Services (Credential ID: AWS-8812903, Earned: Nov 2025, Score: 920/1000) — Validated expertise.';
      
      const resPlanned = validateTruthGate(fraudulentText, 'Planned');
      expect(resPlanned.isValid).toBe(false);
      expect(resPlanned.reason).toBe('unearned_claim');

      const resInProgress = validateTruthGate(fraudulentText, 'In progress');
      expect(resInProgress.isValid).toBe(false);
      expect(resInProgress.reason).toBe('unearned_claim');
    });

    it('passes safe forward-looking pursuit bullet for Planned state when expected date is filled', () => {
      const safeBullet = generateSafeForwardLookingBullet(mockOpportunity, 'Planned', 'Q4 2026');
      expect(safeBullet).toContain('Pursuing AWS Solutions Architect Associate');
      expect(safeBullet).toContain('targeted completion Q4 2026');
      expect(safeBullet).not.toContain('Credential ID:');

      const res = validateTruthGate(safeBullet, 'Planned');
      expect(res.isValid).toBe(true);
    });

    it('passes safe forward-looking pursuit bullet for In progress state when expected date is filled', () => {
      const safeBullet = generateSafeForwardLookingBullet(mockOpportunity, 'In progress', 'December 2026');
      expect(safeBullet).toContain('In progress: AWS Solutions Architect Associate');
      expect(safeBullet).toContain('expected December 2026');
      expect(safeBullet).not.toContain('Credential ID:');

      const res = validateTruthGate(safeBullet, 'In progress');
      expect(res.isValid).toBe(true);
    });

    it('detects unfilled [EXPECTED_DATE] placeholder in forward-looking bullet', () => {
      const unfilledSafeBullet = generateSafeForwardLookingBullet(mockOpportunity, 'Planned');
      expect(unfilledSafeBullet).toContain('[EXPECTED_DATE]');

      const res = validateTruthGate(unfilledSafeBullet, 'Planned');
      expect(res.isValid).toBe(false);
      expect(res.reason).toBe('unfilled_placeholder');
      expect(res.unfilledPlaceholders).toContain('[EXPECTED_DATE]');
    });
  });

  describe('Template Filling Engine', () => {
    it('accurately replaces all explicit placeholders', () => {
      const rawTemplate =
        'Cert: [CREDENTIAL_ID], Date: [DATE_EARNED], Score: [SCORE], Target: [EXPECTED_DATE]';
      const filled = fillCredentialTemplate(rawTemplate, {
        credentialId: 'AWS-99120',
        dateEarned: 'Nov 2025',
        score: '850/1000',
        expectedDate: 'Dec 2026',
      });

      expect(filled).toBe('Cert: AWS-99120, Date: Nov 2025, Score: 850/1000, Target: Dec 2026');
      expect(filled.match(PLACEHOLDER_REGEX)).toBeNull();
    });
  });

  describe('Storage Persistence for Truth States', () => {
    it('defaults to Planned when no state is saved', () => {
      const details = CredentialsStorage.getCredentialTruthDetails('unknown-opp');
      expect(details.truthState).toBe('Planned');
    });

    it('persists and retrieves Earned truth details with metadata', () => {
      CredentialsStorage.saveCredentialTruthDetails(mockOpportunity.id, {
        truthState: 'Earned',
        credentialId: 'AWS-CERT-9901',
        dateEarned: 'October 2025',
        score: '910/1000',
      });

      const retrieved = CredentialsStorage.getCredentialTruthDetails(mockOpportunity.id);
      expect(retrieved.truthState).toBe('Earned');
      expect(retrieved.credentialId).toBe('AWS-CERT-9901');
      expect(retrieved.dateEarned).toBe('October 2025');
      expect(retrieved.score).toBe('910/1000');
    });

    it('persists and retrieves In progress state with expectedDate', () => {
      CredentialsStorage.saveCredentialTruthDetails(mockOpportunity.id, {
        truthState: 'In progress',
        expectedDate: 'Q1 2027',
      });

      const retrieved = CredentialsStorage.getCredentialTruthDetails(mockOpportunity.id);
      expect(retrieved.truthState).toBe('In progress');
      expect(retrieved.expectedDate).toBe('Q1 2027');
    });
  });
});
