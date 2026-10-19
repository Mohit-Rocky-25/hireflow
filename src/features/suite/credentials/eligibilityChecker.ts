/**
 * HireFlow v4: Exam & Credential Eligibility Checker (D18)
 * Checks candidate's degree, engineering branch, graduation year, and CGPA
 * against standard Indian national exam and competitive technical certification criteria.
 */

export interface CandidateAcademicProfile {
  degree?: string; // e.g. "B.Tech", "B.E.", "BCA", "MCA", "B.Sc"
  branch?: string; // e.g. "Computer Science", "ECE", "Mechanical", "Civil"
  graduationYear?: number;
  cgpaOrPercentage?: number; // scale of 10 or 100
}

export interface EligibilityResult {
  examId: string;
  examName: string;
  eligible: boolean;
  status: 'eligible' | 'conditionally_eligible' | 'ineligible';
  reason: string;
  cutoffNotes?: string;
  recommendations: string[];
}

export function checkExamEligibility(
  examId: string,
  profile: CandidateAcademicProfile
): EligibilityResult {
  const currentYear = new Date().getFullYear();
  const gradYear = profile.graduationYear || currentYear;
  const degree = (profile.degree || '').toLowerCase();
  const branch = (profile.branch || '').toLowerCase();
  const score = profile.cgpaOrPercentage;

  switch (examId.toLowerCase()) {
    case 'gate': {
      // GATE: Candidates in 3rd or higher years of any undergraduate degree (B.Tech/B.E./MCA/M.Sc)
      const isBTech = /b\.?tech|b\.?e\.?|bca|mca|m\.?sc|integrated/i.test(degree);
      const isEligibleYear = gradYear >= currentYear - 10 && gradYear <= currentYear + 2;

      if (!profile.degree) {
        return {
          examId: 'gate',
          examName: 'GATE (Graduate Aptitude Test in Engineering)',
          eligible: true,
          status: 'conditionally_eligible',
          reason: 'Set your degree in profile to confirm GATE paper stream.',
          recommendations: ['GATE has no minimum graduation percentage cutoff for appearing.'],
        };
      }

      if (isBTech && isEligibleYear) {
        return {
          examId: 'gate',
          examName: 'GATE',
          eligible: true,
          status: 'eligible',
          reason: `Eligible for GATE. Candidates in 3rd/final year or graduates of ${profile.degree} can appear.`,
          cutoffNotes: 'No minimum percentage required to appear. M.Tech / PSU cutoffs vary post-results.',
          recommendations: ['Select your primary subject paper (e.g. CS / EC / EE / ME / DA).'],
        };
      }

      return {
        examId: 'gate',
        examName: 'GATE',
        eligible: false,
        status: 'ineligible',
        reason: 'GATE requires currently pursuing 3rd/4th year or completion of an approved bachelor degree.',
        recommendations: ['Verify degree classification recognized by AICTE / UGC.'],
      };
    }

    case 'isro-icrb': {
      // ISRO Scientist / Engineer: B.Tech / B.E. First class with minimum 65% marks or 6.84/10 CGPA
      const isEng = /b\.?tech|b\.?e\.?/i.test(degree);
      const isCseEceMech = /computer|cse|it|electronics|ece|electrical|mechanical/i.test(branch);

      const isCgpaPassing = score ? (score > 10 ? score >= 65 : score >= 6.84) : true;

      if (!isEng) {
        return {
          examId: 'isro-icrb',
          examName: 'ISRO ICRB Scientist/Engineer \'SC\'',
          eligible: false,
          status: 'ineligible',
          reason: 'ISRO ICRB mandates a B.E. / B.Tech or equivalent degree.',
          recommendations: ['Consider Technical Assistant or Scientific Assistant roles instead.'],
        };
      }

      if (!isCseEceMech) {
        return {
          examId: 'isro-icrb',
          examName: 'ISRO ICRB',
          eligible: false,
          status: 'ineligible',
          reason: `Branch "${profile.branch}" is outside ISRO ICRB's advertised technical streams (CSE, ECE, ME).`,
          recommendations: ['Check DRDO CEPTAM or state aerospace technical notifications.'],
        };
      }

      if (score && !isCgpaPassing) {
        return {
          examId: 'isro-icrb',
          examName: 'ISRO ICRB',
          eligible: false,
          status: 'ineligible',
          reason: `Current CGPA/Percentage (${score}) is below ISRO strict cutoff (65% or 6.84 CGPA).`,
          cutoffNotes: 'ISRO strictly does not round off percentages (e.g., 64.9% is ineligible).',
          recommendations: ['Focus on PSU GATE recruitment where cutoffs are gate-score driven.'],
        };
      }

      return {
        examId: 'isro-icrb',
        examName: 'ISRO ICRB Scientist/Engineer \'SC\'',
        eligible: true,
        status: score ? 'eligible' : 'conditionally_eligible',
        reason: 'Eligible based on engineering discipline. Verify final CGPA remains >= 6.84 / 65%.',
        recommendations: ['Prepare core university subjects: OS, CN, DBMS, Compiler, Algorithms.'],
      };
    }

    case 'aws-saa': {
      // AWS Solutions Architect Associate: No academic gating
      return {
        examId: 'aws-saa',
        examName: 'AWS Certified Solutions Architect – Associate',
        eligible: true,
        status: 'eligible',
        reason: 'No formal academic degree or CGPA gating. Open to all students and freshers.',
        cutoffNotes: 'Exam passing score is 720/1000 scaled score.',
        recommendations: [
          'Recommended 6+ months hands-on experience with AWS Free Tier before attempting.',
        ],
      };
    }

    case 'cdac-cat': {
      // C-DAC CCAT: Graduate in engineering or post-graduate in science/MCA
      const isEligibleDegree = /b\.?tech|b\.?e\.?|mca|m\.?sc|m\.?tech/i.test(degree);
      return {
        examId: 'cdac-cat',
        examName: 'C-DAC CCAT (Post Graduate Diploma Admissions)',
        eligible: isEligibleDegree,
        status: isEligibleDegree ? 'eligible' : 'ineligible',
        reason: isEligibleDegree
          ? 'Eligible for C-DAC CCAT entrance test across Section A & B.'
          : 'C-DAC PG diplomas require an engineering degree, MCA, or M.Sc in CS/IT.',
        recommendations: ['Aim for Rank < 1000 for top centers (ACTS Pune, Sunbeam).'],
      };
    }

    default: {
      return {
        examId,
        examName: examId.toUpperCase(),
        eligible: true,
        status: 'eligible',
        reason: 'General certification. No strict graduation year or branch gating.',
        recommendations: ['Review official syllabus blueprint before booking test center slot.'],
      };
    }
  }
}
