// ============================================================
// Reach Out v2 - TypeScript Schema & Taxonomy
// Strict deterministic outreach model across 12 scenario groups
// ============================================================

export type ScenarioGroupId =
  | 'first-touch-recruiters'
  | 'first-touch-engineers'
  | 'alumni-mutual-warm'
  | 'follow-ups'
  | 'startup-founder-direct'
  | 'campus-fresher-programs'
  | 'open-source-portfolio'
  | 'events-community'
  | 'referral-engine'
  | 'interview-lifecycle'
  | 'informational-chats'
  | 're-engagement-replies';

export type ChannelId =
  | 'linkedin_connect'
  | 'linkedin_inmail'
  | 'cold_email'
  | 'direct_message'
  | 'reply';

export type RecipientTypeId =
  | 'Recruiter'
  | 'Hiring Manager'
  | 'Peer Engineer'
  | 'Alumnus'
  | 'Founder/CTO'
  | 'Referrer'
  | 'Campus Recruiter';

export type OpeningMove =
  | 'observation'
  | 'proof-first'
  | 'question-first'
  | 'mutual-context'
  | 'event-context'
  | 'artifact-first'
  | 'reply-context';

export type AskType =
  | 'connect'
  | 'ten-minute-chat'
  | 'single-question'
  | 'referral'
  | 'resume-review'
  | 'status-update'
  | 'schedule'
  | 'keep-warm'
  | 'feedback-on-artifact';

export type ExperienceFit = 'Intern' | 'Fresher' | '0-2 yrs';

export type RoleFamilyId =
  | 'all'
  | 'Backend'
  | 'Frontend'
  | 'Full-stack'
  | 'Data/ML/AI'
  | 'DevOps/SRE/Platform'
  | 'Mobile'
  | 'QA/SDET'
  | 'General';

export type ReferrerRelationship =
  | 'alumnus'
  | 'mutual_connection'
  | 'prior_interaction'
  | 'former_colleague'
  | 'community_peer'
  | 'stranger';

export interface ReachOutTemplate {
  id: string; // stable kebab-case
  group: ScenarioGroupId;
  channel: ChannelId;
  name: string;
  recipientTypes: RecipientTypeId[]; // allowed recipient types
  intent: string; // what the sender wants to happen
  openingMove: OpeningMove;
  askType: AskType;
  toneNote: string;
  body: string; // with {{slot}} markers
  subjects?: string[]; // 2-3, emails/InMail only
  altOpeners: string[]; // 2-3, rotated deterministically to avoid identical messages
  requiredSlots: string[];
  optionalSlots: string[];
  limits?: {
    maxChars?: number;
    maxWords?: number;
  };
  whenToUse: string;
  whenNotToUse: string;
  sendWindowNote: string;
  followUpNote: string; // recommended next follow-up template by id
  riskNotes: string[];
  experienceFit: ExperienceFit[];
  roleFamilies: RoleFamilyId[] | 'all';
  reviewedBy?: TemplateReviewer;
}

export interface TemplateReviewer {
  name: string;
  role: string;
  date: string;
}

export interface ScenarioGroupMeta {
  id: ScenarioGroupId;
  number: number;
  title: string;
  shortLabel: string;
  description: string;
  count: number;
}

export interface ReachOutSlots {
  // Existing 9 baseline slots + sender identity
  company?: string;
  role?: string;
  recipient_type?: RecipientTypeId;
  recipient_name?: string;
  primary_skill?: string;
  admired_project?: string;
  proof_point?: string;
  college?: string;
  portfolio?: string;
  your_name?: string;
  your_email?: string;

  // Extended slots (Stage 2)
  role_family?: RoleFamilyId;
  experience_level?: ExperienceFit;
  batch_year?: string;
  job_id?: string;
  source_trigger?: string; // post/event/talk/PR
  event_name?: string;
  talk_topic?: string;
  interviewer_topic?: string;
  referrer_relationship?: ReferrerRelationship;
  days_since_last_contact?: number | string;
  availability_date?: string;
  notice_period?: string;
  location_preference?: string;
  personal_line?: string;

  // Additional context-specific slots
  what_changed?: string;
  use_case?: string;
  specific_observation?: string;
  demo_link?: string;
  pr_link?: string;
  takeaway_area?: string;
  expected_ctc?: string;
  target_tier?: string;
  is_real_deadline?: boolean;
}

export interface SlotFieldDefinition {
  key: keyof ReachOutSlots;
  label: string;
  placeholder: string;
  helperText?: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  options?: string[];
  promptHints?: string[];
}
