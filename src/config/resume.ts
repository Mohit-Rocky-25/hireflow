// ============================================================
// HIREFLOW CANONICAL RESUME CONFIGURATION (RULE A1)
// All thresholds, weights, constants, and layout specifications
// ============================================================

export const RESUME_CONFIG = {
  // Section Sequence Rules (Stage 3)
  SEQUENCE: {
    RECENT_GRAD_YEARS_THRESHOLD: 2,
    MID_CAREER_YEARS_MIN: 3,
    MID_CAREER_YEARS_MAX: 5,
    EXPERIENCED_YEARS_MIN: 6,
    MAX_SKILLS_TO_EMPHASIZE: 10,
    MAX_ORGS_PER_SECTION: 5,
    MAX_BULLETS_PER_ENTRY: 6,
  },

  // Dimensions in Points (72 points = 1 inch) (Stage 6)
  DIMENSIONS: {
    A4: {
      WIDTH_PT: 595.28,
      HEIGHT_PT: 841.89,
      DEFAULT_MARGIN_PT: 36.0, // 0.5 in
      PAGE_CAPACITY_LINES: 58,
    },
    LETTER: {
      WIDTH_PT: 612.0,
      HEIGHT_PT: 792.0,
      DEFAULT_MARGIN_PT: 36.0, // 0.5 in
      PAGE_CAPACITY_LINES: 54,
    },
  },

  // Typography Floors (Stage 6)
  TYPOGRAPHY: {
    MIN_FONT_SIZE_PT: 9.5,
    BODY_FONT_SIZE_PT: 10.0,
    HEADING_FONT_SIZE_PT: 13.0,
    TITLE_FONT_SIZE_PT: 18.0,
    LINE_HEIGHT_RATIO: 1.25,
  },

  // Regional Profiles Default Rules
  REGIONS: {
    'india-campus': {
      paperSize: 'a4' as const,
      allowPhoto: false,
      allowDateOfBirth: false,
      allowCgpaScale: true,
      requiresDeclaration: false,
      spellingVariant: 'en-IN' as const,
    },
    'india-private': {
      paperSize: 'a4' as const,
      allowPhoto: false,
      allowDateOfBirth: false,
      allowCgpaScale: true,
      requiresDeclaration: false,
      spellingVariant: 'en-IN' as const,
    },
    'us': {
      paperSize: 'letter' as const,
      allowPhoto: false,
      allowDateOfBirth: false,
      allowCgpaScale: false,
      requiresDeclaration: false,
      spellingVariant: 'en-US' as const,
    },
    'uk': {
      paperSize: 'a4' as const,
      allowPhoto: false,
      allowDateOfBirth: false,
      allowCgpaScale: false,
      requiresDeclaration: false,
      spellingVariant: 'en-GB' as const,
    },
    'gulf': {
      paperSize: 'a4' as const,
      allowPhoto: true,
      allowDateOfBirth: true,
      allowCgpaScale: true,
      requiresDeclaration: false,
      spellingVariant: 'en-GB' as const,
    },
    'eu': {
      paperSize: 'a4' as const,
      allowPhoto: false,
      allowDateOfBirth: false,
      allowCgpaScale: false,
      requiresDeclaration: false,
      spellingVariant: 'en-GB' as const,
    },
  },
} as const;

