// ============================================================
// HireFlow v3 — Document Ingestion Pipeline Types (R3.1 - R3.9)
// Pure TypeScript types for geometry, layout, and extraction
// ============================================================

export type ReadingOrderConfidence = 'high' | 'medium' | 'low';

export interface LayoutItem {
  str: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontName?: string;
}

export interface DetectedSection {
  name: string;
  normalizedCategory:
    | 'education'
    | 'skills'
    | 'projects'
    | 'experience'
    | 'achievements'
    | 'positions_of_responsibility'
    | 'certifications'
    | 'summary'
    | 'other';
  rawHeader: string;
  startIndex: number;
  endIndex: number;
  content: string;
  confidence: 'high' | 'medium' | 'low';
  inferred: boolean;
}

export interface ExtractedEntities {
  emails: string[];
  phones: string[];
  links: {
    platform: 'github' | 'linkedin' | 'leetcode' | 'codeforces' | 'codechef' | 'hackerrank' | 'geeksforgeeks' | 'portfolio' | 'other';
    url: string;
    handle?: string;
  }[];
  degrees: {
    raw: string;
    normalizedDegree: string;
    normalizedBranch: string;
  }[];
  cgpa: {
    raw: string;
    value: number;
    scale: number;
    isPercentage: boolean;
  } | null;
  dates: {
    raw: string;
    start?: string;
    end?: string;
    isCurrent?: boolean;
  }[];
  boards: {
    level: '10th' | '12th' | 'school';
    board: string;
    percentage?: number;
    year?: number;
  }[];
}

export interface IngestionDiagnostics {
  pageCount: number;
  columnsPerPage: number[];
  readingOrderConfidence: ReadingOrderConfidence;
  totalLines: number;
  totalWords: number;
  removedBoilerplateCount: number;
  sectionsFound: string[];
  entitiesFound: {
    emailsCount: number;
    phonesCount: number;
    linksCount: number;
    degreesCount: number;
    hasCgpa: boolean;
  };
  warnings: string[];
  previewText: string; // "What a parser sees" plain-text preview with section markers
}

export interface IngestionResult {
  success: boolean;
  text: string;
  diagnostics: IngestionDiagnostics;
  sections: DetectedSection[];
  entities: ExtractedEntities;
  error?: string;
}
