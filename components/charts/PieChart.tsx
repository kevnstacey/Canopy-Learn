
import React from 'react';

interface DataPoint {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: DataPoint[];
    size?: number;
    donut?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ data, size = 200, donut = true }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    const radius = size / 2;
    const center = size / 2;
    const innerRadius = donut ? radius * 0.6 : 0;
    
    let currentAngle = 0;

    // Create accessible description string
    const accessibleDesc = data.map(d => `${d.label}: ${d.value}`).join(', ');

    if (total === 0) {
        return (
            <div className="flex items-center justify-center text-slate-400 text-xs" style={{ width: size, height: size }} role="img" aria-label="Empty chart">
                No Data
            </div>
        );
    }

    const paths = data.map((point, i) => {
        const sliceAngle = (point.value / total) * 360;
        
        // Calculate coordinates
        const x1 = center + radius * Math.cos(Math.PI * currentAngle / 180);
        const y1 = center + radius * Math.sin(Math.PI * currentAngle / 180);
        const x2 = center + radius * Math.cos(Math.PI * (currentAngle + sliceAngle) / 180);
        const y2 = center + radius * Math.sin(Math.PI * (currentAngle + sliceAngle) / 180);
        
        // Inner arc for donut
        const x3 = center + innerRadius * Math.cos(Math.PI * (currentAngle + sliceAngle) / 180);
        const y3 = center + innerRadius * Math.sin(Math.PI * (currentAngle + sliceAngle) / 180);
        const x4 = center + innerRadius * Math.cos(Math.PI * currentAngle / 180);
        const y4 = center + innerRadius * Math.sin(Math.PI * currentAngle / 180);

        // SVG Path command
        // L = Line to, A = Arc
        const largeArc = sliceAngle > 180 ? 1 : 0;

        let d = '';
        if (donut) {
             d = `
                M ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                L ${x3} ${y3}
                A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
                Z
            `;
        } else {
             d = `
                M ${center} ${center}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                Z
            `;
        }

        currentAngle += sliceAngle;
        
        return (
            <g key={i} tabIndex={0} role="graphics-symbol" aria-label={`${point.label}: ${point.value} (${Math.round(point.value/total * 100)}%)`}>
                <path d={d} fill={point.color} stroke="white" strokeWidth="2" className="hover:opacity-80 transition-opacity cursor-pointer" />
                <title>{`${point.label}: ${point.value} (${Math.round(point.value/total * 100)}%)`}</title>
            </g>
        );
    });

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg 
                width={size} 
                height={size} 
                viewBox={`0 0 ${size} ${size}`} 
                className="rotate-[-90deg]"
                role="img"
                aria-label={`Pie chart showing: ${accessibleDesc}`}
            >
                {paths}
            </svg>
            {donut && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" aria-hidden="true">
                     <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{total}</span>
                     <span className="text-xs text-slate-500 uppercase">Total</span>
                </div>
            )}
        </div>
    );
};

export default PieChart;
