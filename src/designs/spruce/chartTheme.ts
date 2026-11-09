export interface SpruceChartColors {
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  negative: string;
  gridLight: string;
  gridDark: string;
}

export const spruceChartColors: SpruceChartColors = {
  primary: '#008254',
  secondary: '#005FB9',
  accent: '#8DC63F',
  muted: '#64666A',
  negative: '#DE2828',
  gridLight: 'rgba(0, 0, 0, 0.08)',
  gridDark: 'rgba(244, 250, 247, 0.08)',
};

export const spruceChartSeries = [
  { stroke: spruceChartColors.primary, strokeDasharray: 'none', shape: 'square' },
  { stroke: spruceChartColors.secondary, strokeDasharray: '4 4', shape: 'circle' },
  { stroke: spruceChartColors.accent, strokeDasharray: '2 2', shape: 'triangle' },
  { stroke: spruceChartColors.muted, strokeDasharray: '6 2', shape: 'diamond' },
  { stroke: spruceChartColors.negative, strokeDasharray: '1 2', shape: 'cross' },
];
