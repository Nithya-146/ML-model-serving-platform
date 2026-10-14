import React from 'react';

interface RadialLatencyGaugeProps {
  label: string;
  value: number; // in milliseconds
  max?: number;
  unit?: string;
  percentiles?: { p50: number; p95: number; p99: number };
  color?: string;
  size?: number;
}

export const RadialLatencyGauge: React.FC<RadialLatencyGaugeProps> = ({
  label,
  value,
  max = 100,
  unit = 'ms',
  percentiles,
  color = 'var(--accent-lime)',
  size = 180
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree gauge arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (Math.min(value, max) / max) * arcLength;
  const center = size / 2;

  // Calculate angle for percentile tick marks
  const getAngle = (val: number) => {
    const ratio = Math.min(val, max) / max;
    return -135 + ratio * 270;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Gauge Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${center} ${center})`}
        />

        {/* Value Arc with Glow */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#gauge-glow)"
          transform={`rotate(135 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Optional Percentile Tick Indicators */}
        {percentiles && (
          <>
            {/* P50 Marker */}
            <g transform={`rotate(${getAngle(percentiles.p50)} ${center} ${center})`}>
              <line x1={center} y1={center - radius - 5} x2={center} y2={center - radius + 5} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            </g>
            {/* P95 Marker */}
            <g transform={`rotate(${getAngle(percentiles.p95)} ${center} ${center})`}>
              <line x1={center} y1={center - radius - 6} x2={center} y2={center - radius + 6} stroke="var(--accent-amber)" strokeWidth="2" />
            </g>
            {/* P99 Marker */}
            <g transform={`rotate(${getAngle(percentiles.p99)} ${center} ${center})`}>
              <line x1={center} y1={center - radius - 7} x2={center} y2={center - radius + 7} stroke="var(--accent-rose)" strokeWidth="2.5" />
            </g>
          </>
        )}
      </svg>

      {/* Center Value Readout */}
      <div style={{
        position: 'absolute',
        top: '46%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value.toFixed(1)}
        </div>
        <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: 2 }}>
          {unit}
        </div>
      </div>

      {/* Label and Subtext */}
      <div style={{ textAlign: 'center', marginTop: -15 }}>
        <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
    </div>
  );
};
