import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, width = 100, height = 30, className = '' }) => {
  if (!data || data.length < 2) {
    return null;
  }

  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - minVal) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={`M ${points}`} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

export default Sparkline;