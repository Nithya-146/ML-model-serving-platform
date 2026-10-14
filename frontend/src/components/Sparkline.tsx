import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 32,
  color = 'var(--accent-lime)',
  fill = true
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height, background: 'rgba(255,255,255,0.02)', borderRadius: 4 }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const innerHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - (((val - min) / range) * innerHeight + padding);
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)},${height} L ${points[0].x.toFixed(1)},${height} Z`;
  const gradId = `sparkline-grad-${Math.random().toString(36).substr(2, 6)}`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible', verticalAlign: 'middle' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {fill && <path d={areaD} fill={`url(#${gradId})`} />}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End pulse dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2.5"
        fill={color}
      />
    </svg>
  );
};
