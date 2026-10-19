import { describe, it, expect } from 'vitest';
import {
  simulateWhatIfReadiness,
  evaluateAcademicEligibility,
} from '../../src/features/career-path/whatIfSimulator';

describe('D20: Career Trajectory What-If & Academic Eligibility (D20.1 - D20.5)', () => {
  describe('What-If Readiness Simulator', () => {
    it('simulates readiness score gain from closing missing target skills', () => {
      const result = simulateWhatIfReadiness({
        currentSkills: ['HTML', 'CSS', 'JavaScript'],
        targetSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
        currentEvidenceScore: 50,
        projectsCount: 2,
        addedSkills: ['React', 'TypeScript', 'Docker'],
        upgradeProjectToMetrics: false,
      });

      expect(result.simulatedScore).toBeGreaterThan(result.baselineScore);
      expect(result.delta).toBeGreaterThan(0);
      expect(result.pillarDeltas.hardSkills.delta).toBeGreaterThan(0);
      expect(result.explanation.formula).toContain('SimulatedHardSkills');
      expect(result.actionableInsights.length).toBeGreaterThan(0);
    });

    it('simulates additional evidence quality lift from quantified metrics', () => {
      const withMetrics = simulateWhatIfReadiness({
        currentSkills: ['Java', 'Spring Boot'],
        targetSkills: ['Java', 'Spring Boot', 'SQL'],
        currentEvidenceScore: 40,
        projectsCount: 2,
        addedSkills: ['SQL'],
        upgradeProjectToMetrics: true,
      });

      expect(withMetrics.pillarDeltas.evidenceQuality.delta).toBe(25);
      expect(withMetrics.delta).toBeGreaterThan(10);
    });
  });

  describe('Corporate Eligibility Gate Evaluation', () => {
    it('evaluates startups as open/zero-cutoff while checking tier-1 MNC cutoffs', () => {
      const evaluation = evaluateAcademicEligibility({
        tenthPercent: 82,
        twelfthPercent: 78,
        btechCgpa: 8.4,
        activeBacklogs: 0,
      });

      expect(evaluation.length).toBe(3);

      const startup = evaluation.find((e) => e.tierName.includes('Startup'));
      expect(startup?.eligible).toBe(true);
      expect(startup?.status).toBe('fully_eligible');

      const tier1 = evaluation.find((e) => e.tierName.includes('Tier-1'));
      expect(tier1?.eligible).toBe(true);
      expect(tier1?.status).toBe('fully_eligible');
    });

    it('identifies services 60% disqualification while providing encouraging startup guidance', () => {
      const evaluation = evaluateAcademicEligibility({
        tenthPercent: 55, // Below 60%
        twelfthPercent: 70,
        btechCgpa: 7.2,
      });

      const services = evaluation.find((e) => e.tierName.includes('Mass Recruitment'));
      expect(services?.eligible).toBe(false);
      expect(services?.status).toBe('cutoff_disqualified');

      const startup = evaluation.find((e) => e.tierName.includes('Startup'));
      expect(startup?.eligible).toBe(true);
      expect(startup?.strategyGuidance).toContain('32%');
    });
  });
});
