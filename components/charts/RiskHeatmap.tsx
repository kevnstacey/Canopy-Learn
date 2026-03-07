
import React from 'react';
import { Department } from '../../types';

interface HeatmapData {
    department: Department;
    readiness: number; // 0 to 100
}

interface RiskHeatmapProps {
    data: HeatmapData[];
}

const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ data }) => {
    const getColor = (val: number) => {
        if (val >= 90) return 'bg-emerald-500';
        if (val >= 75) return 'bg-yellow-500';
        if (val >= 50) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {data.map((item) => (
                <div 
                    key={item.department} 
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.department}</span>
                        <div className={`w-3 h-3 rounded-full ${getColor(item.readiness)} shadow-sm`}></div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{item.readiness}%</span>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                            className={`h-full ${getColor(item.readiness)} transition-all duration-1000`} 
                            style={{ width: `${item.readiness}%` }}
                        ></div>
                    </div>
                    <p className="mt-2 text-[10px] font-bold text-slate-500 group-hover:text-blue-600 cursor-pointer">
                        View Gap Report →
                    </p>
                </div>
            ))}
        </div>
    );
};

export default RiskHeatmap;
