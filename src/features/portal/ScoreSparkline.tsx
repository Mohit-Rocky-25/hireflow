import React from 'react';

interface ScoreSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export const ScoreSparkline: React.FC<ScoreSparklineProps> = ({
  data,
  width = 64,
  height = 20,
  className = '',
}) => {
  if (!data || data.length === 0) {
    return <div className={`w-[${width}px] h-[${height}px] bg-neutral-900/50 rounded`} />;
  }

  if (data.length === 1) {
    return (
      <svg width={width} height={height} className={className}>
        <circle cx={width / 2} cy={height / 2} r={2.5} fill="#faff69" />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const usableHeight = height - padding * 2;
  const usableWidth = width - padding * 2;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * usableWidth;
      const y = height - padding - ((val - min) / range) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const lastPoint = points.split(' ').slice(-1)[0];
  const [lastX, lastY] = lastPoint ? lastPoint.split(',').map(Number) : [width - padding, height / 2];

  return (
    <svg width={width} height={height} className={`overflow-visible ${className}`}>
      <polyline
        fill="none"
        stroke="#faff69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle cx={lastX} cy={lastY} r={2} fill="#faff69" />
    </svg>
  );
};

