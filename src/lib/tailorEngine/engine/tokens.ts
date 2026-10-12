export interface DesignTokens {
  fontFamily: string;
  fontSizes: {
    name: string;
    sectionHeading: string;
    body: string;
    meta: string;
  };
  lineHeight: number;
  spacing: {
    paragraph: string;
    section: string;
  };
  margins: {
    topBottom: string;
    sides: string;
  };
  colors: {
    text: string;
    secondary: string;
    rule: string;
    accent?: string;
  };
  alignment: 'left';
}

export const ATS_DESIGN_TOKENS: DesignTokens = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSizes: {
    name: '24pt',
    sectionHeading: '11pt',
    body: '10pt',
    meta: '9pt'
  },
  lineHeight: 1.35,
  spacing: {
    paragraph: '2pt',
    section: '10pt'
  },
  margins: {
    topBottom: '0.6in',
    sides: '0.7in'
  },
  colors: {
    text: '#111111',
    secondary: '#444444',
    rule: '#999999',
    accent: '#0f172a'
  },
  alignment: 'left'
};
