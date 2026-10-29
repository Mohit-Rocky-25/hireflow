// ============================================================
// HIREFLOW 5 CANONICAL RESUME TEMPLATES (STAGE 6)
// Point-based typographic and geometric specifications (I-19)
// ============================================================

import { ResumeTemplateId } from '../types';
import { RESUME_CONFIG } from '../../../config/resume';

export interface TemplateStyleSpec {
  id: ResumeTemplateId;
  name: string;
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  headingFontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  titleFontSizePt: number;
  headingFontSizePt: number;
  entryFontSizePt: number;
  bodyFontSizePt: number;
  lineHeightRatio: number;
  defaultMarginsPt: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hasSectionRule: boolean;
  accentColorHex: string;
  isCenteredHeader: boolean;
  isCompactTable: boolean;
}

export const TEMPLATE_SPECS: Record<ResumeTemplateId, TemplateStyleSpec> = {
  classic: {
    id: 'classic',
    name: 'Classic Academic / Corporate',
    fontFamily: 'Times-Roman',
    headingFontFamily: 'Times-Roman',
    titleFontSizePt: 18.0,
    headingFontSizePt: 12.0,
    entryFontSizePt: 10.5,
    bodyFontSizePt: Math.max(RESUME_CONFIG.TYPOGRAPHY.MIN_FONT_SIZE_PT, 10.0),
    lineHeightRatio: 1.25,
    defaultMarginsPt: { top: 36.0, bottom: 36.0, left: 36.0, right: 36.0 },
    hasSectionRule: true,
    accentColorHex: '#111827',
    isCenteredHeader: true,
    isCompactTable: false,
  },

  modern: {
    id: 'modern',
    name: 'Modern Tech & Systems',
    fontFamily: 'Helvetica',
    headingFontFamily: 'Helvetica',
    titleFontSizePt: 20.0,
    headingFontSizePt: 12.5,
    entryFontSizePt: 10.5,
    bodyFontSizePt: Math.max(RESUME_CONFIG.TYPOGRAPHY.MIN_FONT_SIZE_PT, 10.0),
    lineHeightRatio: 1.3,
    defaultMarginsPt: { top: 36.0, bottom: 36.0, left: 36.0, right: 36.0 },
    hasSectionRule: true,
    accentColorHex: '#0284c7', // Professional Blue
    isCenteredHeader: false,
    isCompactTable: false,
  },

  compact: {
    id: 'compact',
    name: 'Compact Single-Page Maximum Density',
    fontFamily: 'Helvetica',
    headingFontFamily: 'Helvetica',
    titleFontSizePt: 16.0,
    headingFontSizePt: 11.0,
    entryFontSizePt: 9.5,
    bodyFontSizePt: RESUME_CONFIG.TYPOGRAPHY.MIN_FONT_SIZE_PT, // 9.5 pt strict floor
    lineHeightRatio: 1.2,
    defaultMarginsPt: { top: 28.0, bottom: 28.0, left: 28.0, right: 28.0 },
    hasSectionRule: true,
    accentColorHex: '#16a34a',
    isCenteredHeader: false,
    isCompactTable: true,
  },

  campus: {
    id: 'campus',
    name: 'Indian Engineering Campus Placement',
    fontFamily: 'Helvetica',
    headingFontFamily: 'Helvetica',
    titleFontSizePt: 18.0,
    headingFontSizePt: 12.0,
    entryFontSizePt: 10.0,
    bodyFontSizePt: Math.max(RESUME_CONFIG.TYPOGRAPHY.MIN_FONT_SIZE_PT, 10.0),
    lineHeightRatio: 1.25,
    defaultMarginsPt: { top: 36.0, bottom: 36.0, left: 36.0, right: 36.0 },
    hasSectionRule: true,
    accentColorHex: '#d97706', // Campus Amber
    isCenteredHeader: false,
    isCompactTable: true, // Formats 10th/12th/B.Tech into clean tabular grid
  },

  executive: {
    id: 'executive',
    name: 'Executive & Principal Leadership',
    fontFamily: 'Times-Roman',
    headingFontFamily: 'Helvetica',
    titleFontSizePt: 22.0,
    headingFontSizePt: 13.0,
    entryFontSizePt: 11.0,
    bodyFontSizePt: Math.max(RESUME_CONFIG.TYPOGRAPHY.MIN_FONT_SIZE_PT, 10.5),
    lineHeightRatio: 1.35,
    defaultMarginsPt: { top: 40.0, bottom: 40.0, left: 40.0, right: 40.0 },
    hasSectionRule: true,
    accentColorHex: '#4f46e5',
    isCenteredHeader: false,
    isCompactTable: false,
  },
};

