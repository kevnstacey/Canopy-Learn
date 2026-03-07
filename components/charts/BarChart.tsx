
import React from 'react';

interface BarData {
    label: string;
    value: number;
    color?: string;
}

interface BarChartProps {
    data: BarData[];
    height?: number;
    labelSize?: string;
    showValues?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ data, height = 150, labelSize = 'text-[8px]', showValues = true }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="w-full flex items-end gap-1 px-2" style={{ height: `${height}px` }}>
            {data.map((item, i) => {
                const percentage = (item.value / maxValue) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                        {showValues && item.value > 0 && (
                            <span className="text-[10px] font-black text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.value}
                            </span>
                        )}
                        <div 
                            className={`w-full rounded-t-sm transition-all duration-700 ease-out min-h-[2px] ${item.color || 'bg-blue-500'}`}
                            style={{ height: `${percentage}%` }}
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap">
                                {item.label}: {item.value}
                            </div>
                        </div>
                        <div className={`mt-2 ${labelSize} font-bold text-slate-400 uppercase tracking-tighter w-full text-center truncate`}>
                            {item.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BarChart;
