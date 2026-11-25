// ============================================================
// ATS Resume Roaster — Scan Identity & Isolation Model (P0.1)
// Enforces complete isolation between evaluation scans.
// ============================================================

export interface ScanIdentity {
  scanId: string;
  candidateName: string | null;
  candidateDisplayName: string;
  isCandidateIdentified: boolean;
  employerName: string | null;
  employerDisplayName: string;
  isEmployerIdentified: boolean;
  jobTitle: string;
  resumeContentHash: string;
  jdContentHash: string;
  timestamp: string;
  engineVersion: string;
}

/**
 * Fast synchronous djb2 hash for memory content fingerprints.
 */
export function computeContentHash(content: string): string {
  let hash = 5381;
  const str = content || '';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(16);
}

export function createScanIdentity(params: {
  candidateName: string | null;
  employerName: string | null;
  jobTitle?: string | null;
  resumeText: string;
  jdText: string;
  engineVersion?: string;
  explicitScanId?: string;
}): ScanIdentity {
  const {
    candidateName,
    employerName,
    jobTitle,
    resumeText,
    jdText,
    engineVersion = '4.0.0',
    explicitScanId,
  } = params;

  const cleanCandidate = candidateName?.trim() || null;
  const cleanEmployer = employerName?.trim() || null;
  const cleanTitle = jobTitle?.trim() || 'Target Role';

  const scanId = explicitScanId || `scan_${computeContentHash(resumeText)}_${computeContentHash(jdText)}`;
  const resumeContentHash = computeContentHash(resumeText);
  const jdContentHash = computeContentHash(jdText);

  return {
    scanId,
    candidateName: cleanCandidate,
    candidateDisplayName: cleanCandidate || 'Candidate name not detected',
    isCandidateIdentified: Boolean(cleanCandidate),
    employerName: cleanEmployer,
    employerDisplayName: cleanEmployer || 'Employer not detected',
    isEmployerIdentified: Boolean(cleanEmployer),
    jobTitle: cleanTitle,
    resumeContentHash,
    jdContentHash,
    timestamp: '2026-01-01T00:00:00.000Z',
    engineVersion,
  };
}
