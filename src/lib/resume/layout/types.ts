// ============================================================
// HIREFLOW POINT-BASED LAYOUT TREE TYPES (STAGE 6)
// P5: One layout engine (units: points: 72 points = 1 inch).
// One unified layout tree feeding PDF, DOM preview, and plain text renderers.
// ============================================================

import { ResumeTemplateId } from '../types';

export interface LayoutPoint {
  x: number;
  y: number;
}

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LayoutBlockType =
  | 'header-name'
  | 'header-contact'
  | 'section-heading'
  | 'section-rule'
  | 'entry-title'
  | 'entry-subtitle'
  | 'entry-date'
  | 'entry-location'
  | 'bullet'
  | 'badge'
  | 'text'
  | 'table-cell';

export interface LayoutBlock extends LayoutRect {
  id: string;
  type: LayoutBlockType;
  text?: string;
  fontSizePt: number;
  lineHeightPt: number;
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  isBold?: boolean;
  isItalic?: boolean;
  colorHex: string;
  sectionType?: string;
  factId?: string;
}

export interface LayoutPage {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
  marginsPt: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  usableWidthPt: number;
  usableHeightPt: number;
  blocks: LayoutBlock[];
}

export interface LayoutDocument {
  id: string;
  template: ResumeTemplateId;
  paperSize: 'a4' | 'letter';
  pages: LayoutPage[];
  totalPageCount: number;
  measuredTotalHeightPt: number;
  generatedAt: string;
}

