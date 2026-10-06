// ============================================================
// Campus & Fresher Hiring Routes Catalog — India Market
// Documented hiring routes, college tier offers, and selection rounds
// ============================================================

import type { HiringRoute } from './types';

export function createHiringRoutes(
  companyName: string,
  entryLevelCode: string,
  entryTitle: string,
  tier1OfferLPA: number,
  tier2OfferLPA: number,
  tier3OfferLPA: number,
  tier1Likelihood: 'High' | 'Medium' | 'Low',
  tier2Likelihood: 'High' | 'Medium' | 'Low',
  tier3Likelihood: 'High' | 'Medium' | 'Low'
): HiringRoute[] {
  const routes: HiringRoute[] = [
    {
      routeType: 'on-campus',
      name: `On-Campus Placement Drive (${companyName})`,
      eligibility: {
        cgpaMin: 7.0,
        allowedBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech EE', 'M.Tech CSE'],
        batches: 'Final Year Graduating Batch',
      },
      selectionRounds: [
        'Round 1: Online Assessment (DSA, Algorithms, Core CS & Aptitude)',
        'Round 2: Technical Interview 1 (Data Structures, Algorithms & Coding)',
        'Round 3: Technical Interview 2 (System Design / Object-Oriented Design & Problem Solving)',
        'Round 4: Hiring Manager / HR & Behavioral Culture Fit Round',
      ],
      typicalOfferByTier: {
        tier1: Math.round(tier1OfferLPA * 100000),
        tier2: Math.round(tier2OfferLPA * 100000),
        tier3: Math.round(tier3OfferLPA * 100000),
      },
      assignedLevelCode: entryLevelCode,
      assignedTitle: entryTitle,
      likelihoodByTier: {
        tier1: tier1Likelihood,
        tier2: tier2Likelihood,
        tier3: tier3Likelihood,
      },
      notes: `Primary hiring channel for ${companyName} in India. Day 1/Day 2 presence at Tier-1 campuses (IITs/BITS/NITs).`,
    },
    {
      routeType: 'intern-to-full-time',
      name: `Summer Internship to Pre-Placement Offer (PPO)`,
      eligibility: {
        cgpaMin: 7.5,
        allowedBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'Dual Degree'],
        batches: 'Penultimate Year (3rd Year B.Tech / 1st Year M.Tech)',
      },
      selectionRounds: [
        'Round 1: Online Coding Contest / Assessment',
        'Round 2: Technical Problem-Solving Interview',
        'Round 3: 8 to 12 Week Summer Internship Project Delivery',
        'Round 4: Final PPO Evaluation Presentation to Leadership Committee',
      ],
      typicalOfferByTier: {
        tier1: Math.round(tier1OfferLPA * 100000),
        tier2: Math.round(tier2OfferLPA * 100000),
        tier3: Math.round(tier3OfferLPA * 100000),
      },
      assignedLevelCode: entryLevelCode,
      assignedTitle: entryTitle,
      likelihoodByTier: {
        tier1: 'High',
        tier2: 'Medium',
        tier3: 'Low',
      },
      notes: 'Highest conversion rate route into full-time roles. 60-75% of intern cohorts receive PPOs upon successful project delivery.',
    },
    {
      routeType: 'hackathon-competition',
      name: `National Competitive Challenge / Hackathon`,
      eligibility: {
        cgpaMin: 6.5,
        allowedBranches: ['All Engineering Disciplines'],
        batches: '3rd Year & Final Year Engineering Students',
      },
      selectionRounds: [
        'Round 1: National Online DSA & CS Fundamentals Qualifier',
        'Round 2: Prototype / Technical Problem Statement Submission',
        'Round 3: Grand Finale Demo & Technical Defense before Senior Judges',
        'Round 4: Fast-Track Direct Executive Interview',
      ],
      typicalOfferByTier: {
        tier1: Math.round(tier1OfferLPA * 100000),
        tier2: Math.round(tier2OfferLPA * 100000),
        tier3: Math.round(tier3OfferLPA * 100000),
      },
      assignedLevelCode: entryLevelCode,
      assignedTitle: entryTitle,
      likelihoodByTier: {
        tier1: 'Medium',
        tier2: 'Medium',
        tier3: 'Medium', // Equalized meritocracy for competitive track
      },
      notes: 'College-tier agnostic pathway. Top national finalists receive direct interview invites regardless of college tier.',
    },
    {
      routeType: 'off-campus',
      name: `Off-Campus Drive & Careers Portal Application`,
      eligibility: {
        cgpaMin: 6.5,
        allowedBranches: ['All Engineering & MCA Disciplines'],
        batches: 'Graduates & Early Career (< 1 Year Experience)',
      },
      selectionRounds: [
        'Round 1: Resume Screening & ATS Shortlisting',
        'Round 2: Automated Proctored Coding Test (LeetCode Medium-Hard)',
        'Round 3: Technical Screening Interview',
        'Round 4: System Architecture & Data Structures Onsite',
        'Round 5: Bar Raiser / Final Executive Interview',
      ],
      typicalOfferByTier: {
        tier1: Math.round(tier1OfferLPA * 100000),
        tier2: Math.round(tier2OfferLPA * 100000),
        tier3: Math.round(tier3OfferLPA * 100000),
      },
      assignedLevelCode: entryLevelCode,
      assignedTitle: entryTitle,
      likelihoodByTier: {
        tier1: 'Medium',
        tier2: 'Low',
        tier3: 'Low',
      },
      notes: 'High applicant volume channel (100k+ applicants). Requires strong open-source portfolio or high competitive programming rating.',
    },
    {
      routeType: 'referral',
      name: `Employee Referral Pathway`,
      eligibility: {
        cgpaMin: 7.0,
        allowedBranches: ['B.Tech / M.Tech / MCA'],
        batches: 'Graduating Batches & Alumni',
      },
      selectionRounds: [
        'Round 1: Internal Employee Referral Endorsement',
        'Round 2: Priority Recruiter Screen',
        'Round 3: Technical Coding Round 1',
        'Round 4: Technical Problem Solving Round 2',
        'Round 5: Hiring Manager Alignment',
      ],
      typicalOfferByTier: {
        tier1: Math.round(tier1OfferLPA * 100000),
        tier2: Math.round(tier2OfferLPA * 100000),
        tier3: Math.round(tier3OfferLPA * 100000),
      },
      assignedLevelCode: entryLevelCode,
      assignedTitle: entryTitle,
      likelihoodByTier: {
        tier1: 'High',
        tier2: 'Medium',
        tier3: 'Low',
      },
      notes: 'Bypasses standard portal queue. A referral from a Staff/Senior engineer guarantees recruiter review within 14 days.',
    },
  ];

  return routes;
}
