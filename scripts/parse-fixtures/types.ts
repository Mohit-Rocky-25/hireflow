// ============================================================
// Fixture Ground Truth Schema & Generation Definitions
// ============================================================

export type LayoutFamilyId =
  | 'a_single_col_plain'
  | 'b_two_col_sidebar'
  | 'c_table_skills'
  | 'd_textbox_header'
  | 'e_latex_dense'
  | 'f_decorative_bullets'
  | 'g_ligatures_hyphens'
  | 'h_multipage_header_footer'
  | 'i_annotated_links'
  | 'j_indian_fresher'
  | 'k_image_only'
  | 'l_corrupt_encrypted';

export interface GroundTruthSection {
  canonical: string;
  startLine: number;
  endLine: number;
}

export interface GroundTruthBullet {
  text: string;
  section: string;
  entry?: string;
}

export interface GroundTruthDate {
  start: string;
  end: string;
  isCurrent: boolean;
}

export interface GroundTruthEducation {
  degree: string;
  institution: string;
  cgpaOrPercent: string;
  scale?: 'cgpa10' | 'cgpa4' | 'percent';
}

export interface FixtureTruth {
  id: string;
  name: string;
  email: string;
  phone: string;
  links: string[];
  sections: GroundTruthSection[];
  bullets: GroundTruthBullet[];
  dates: GroundTruthDate[];
  education: GroundTruthEducation[];
  skillsText: string[];
  expectedWarnings: string[];
  layoutFamily: LayoutFamilyId;
  format: 'pdf' | 'docx';
  fullGroundTruthText: string;
  isCorruptOrEncrypted?: boolean;
  isImageOnly?: boolean;
}

export interface CandidateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  education: {
    degree: string;
    institution: string;
    location: string;
    startYear: string;
    endYear: string;
    cgpaOrPercent: string;
    tenthScore?: string;
    twelfthScore?: string;
  }[];
  experience: {
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    bullets: string[];
  }[];
  projects: {
    title: string;
    techStack: string[];
    dateStr: string;
    bullets: string[];
  }[];
  skills: {
    category: string;
    skills: string[];
  }[];
  certifications?: string[];
  achievements?: string[];
  responsibilities?: string[];
  declaration?: string;
}
