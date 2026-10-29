// ============================================================
// HireFlow — Reach Out v2 Schema & Domain Types
// Strictly deterministic, 100% client-side, zero runtime network egress
// ============================================================

export type OutreachChannel =
  | 'linkedin_connect'
  | 'linkedin_inmail'
  | 'cold_email'
  | 'warm_referral'
  | 'follow_up';

export type OutreachTab = 'all' | OutreachChannel;

export type OutreachGoal =
  | 'G1' // introduce and ask about openings
  | 'G2' // ask for a referral
  | 'G3' // ask for brief advice
  | 'G4' // respond to a specific posting
  | 'G5' // share relevant work
  | 'G6' // follow up with no reply
  | 'G7' // follow up after applying
  | 'G8' // thank you after a conversation
  | 'G9'; // outreach built on a shared event/hackathon/campus context

export type OutreachRelationship = 'cold' | 'warm' | 'alumni' | 'after-accept';

export type OutreachRecipientType =
  | 'in-house recruiter'
  | 'hiring manager'
  | 'engineer or peer'
  | 'alumnus/alumna'
  | 'senior leader or founder'
  | 'campus/university relations';

export type CandidateStage = 'student' | 'fresher' | 'intern-seeker';

export type CompanyType = 'it-services' | 'product' | 'startup' | 'gcc' | 'any';

export type OutreachAngle =
  | 'project-led'
  | 'skill-led'
  | 'shared-background-led'
  | 'curiosity-led'
  | 'event-led';

export type AskStrength = 'low' | 'medium' | 'high';

export type BlockKey = 'hook' | 'proof' | 'ask' | 'close';

export interface TemplateBlocks {
  hook: string[];
  proof: string[];
  ask: string[];
  close: string[];
}

export interface LengthProfile {
  metric: 'characters' | 'words';
  target: number;
  warn: number;
  hardMax: number;
}

export interface OutreachTemplateV2 {
  id: string;
  version: number;
  channel: OutreachChannel;
  tab: OutreachChannel;
  name: string;
  goal: OutreachGoal;
  relationship: OutreachRelationship;
  recipientTypes: OutreachRecipientType[];
  candidateStages: CandidateStage[];
  companyTypes: CompanyType[];
  angle: OutreachAngle;
  askStrength: AskStrength;
  requiredSlots: string[];
  optionalSlots: string[];
  subjectVariants?: string[];
  blocks: TemplateBlocks;
  optionalBlockPriority: BlockKey[];
  lengthProfile: LengthProfile;
  whenToUse: string;
  whenNotToUse: string;
  risks: string[];
  whyItWorks: string;
  exampleFilled: string;
  followUpTemplateIds: string[];
  lastReviewed: string;
  notes: string;
  needsAuthoring?: boolean;
  deprecated?: boolean;
  replacedBy?: string;
}

export interface OutreachSlotsV2 {
  targetCompany: string;
  targetRole: string;
  recipientName: string;
  recipientType?: OutreachRecipientType | string;
  primarySkill: string;
  admiredProject: string; // UI label: "What specifically about their work?"
  proofPoint: string;
  proofShort?: string; // <= configured short length
  college?: string;
  portfolio?: string;
  // Maximum 2 new slots (Stage 1 / D2)
  followUpNewInfo?: string;
  daysSince?: number | string;

  // Legacy aliases supported for backward compatibility
  company?: string;
  role?: string;
  recipient_name?: string;
  recipient_type?: string;
  primary_skill?: string;
  admired_project?: string;
  proof_point?: string;
  portfolio_link?: string;
  candidate_name?: string;
  your_name?: string;
  candidate_email?: string;
  your_email?: string;
  [key: string]: unknown;
}

export interface ValidationIssue {
  slot: string;
  severity: 'error' | 'warning';
  message: string;
  exampleGood?: string;
  exampleBad?: string;
}

export interface QualityFinding {
  id: string;
  severity: 'BLOCK' | 'WARN';
  message: string;
  fix: string;
  snippet?: string;
}

export interface AssembledMessage {
  templateId: string;
  channel: OutreachChannel;
  variantIndex: number;
  subject?: string;
  body: string;
  charCount: number;
  wordCount: number;
  lengthFit: {
    status: 'optimal' | 'warning' | 'overflow';
    droppedBlocks: BlockKey[];
    overflowAmount: number;
    longestSlot?: string;
  };
  findings: QualityFinding[];
  isReadyToSend: boolean;
  factsUsed: string[];
  missingRequiredSlots: string[];
  whenToUse: string;
  whenNotToUse: string;
  whyItWorks: string;
}
