
import React from 'react';
import { CohortForecast } from '../../types';

interface ForecastingChartProps {
    forecast: CohortForecast;
    height?: number;
}

const ForecastingChart: React.FC<ForecastingChartProps> = ({ forecast, height = 200 }) => {
    const maxVal = 100;
    const padding = 20;
    const width = 400;
    const innerWidth = width - (padding * 2);
    const innerHeight = height - (padding * 2);

    // Calculate points for historical line
    const points = forecast.historicalReadiness.map((d, i) => {
        const x = padding + (i / (forecast.historicalReadiness.length - 1)) * (innerWidth / 2);
        const y = height - padding - (d.value / maxVal) * innerHeight;
        return `${x},${y}`;
    }).join(' ');

    // Current point
    const currentX = padding + innerWidth / 2;
    const currentY = height - padding - (forecast.currentReadiness / maxVal) * innerHeight;

    // Projected point (30 days out)
    const projectedX = width - padding;
    const projectedY = height - padding - (forecast.projectedReadiness / maxVal) * innerHeight;

    return (
        <div className="relative bg-slate-950 rounded-3xl p-6 overflow-hidden border border-white/10 group shadow-2xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Launch Forecast</h4>
                    <p className="text-xl font-black text-white italic tracking-tighter uppercase">{forecast.department} Unit</p>
                </div>
                <div className="text-right">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        forecast.confidenceLevel === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                        {forecast.confidenceLevel} Confidence
                    </span>
                </div>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map(val => {
                    const y = height - padding - (val / maxVal) * innerHeight;
                    return (
                        <line 
                            key={val} 
                            x1={padding} 
                            y1={y} 
                            x2={width - padding} 
                            y2={y} 
                            stroke="rgba(255,255,255,0.05)" 
                            strokeWidth="1" 
                        />
                    );
                })}

                {/* Historical Path */}
                <polyline 
                    points={points} 
                    fill="none" 
                    stroke="rgba(59, 130, 246, 0.4)" 
                    strokeWidth="2" 
                />

                {/* Projection Path (Dashed) */}
                <line 
                    x1={currentX} 
                    y1={currentY} 
                    x2={projectedX} 
                    y2={projectedY} 
                    stroke="#10B981" 
                    strokeWidth="3" 
                    strokeDasharray="5,5" 
                    className="animate-[dash_2s_linear_infinite]"
                />

                {/* Current Marker */}
                <circle cx={currentX} cy={currentY} r="6" fill="#3B82F6" className="animate-pulse" />
                
                {/* Projected Marker */}
                <circle cx={projectedX} cy={projectedY} r="6" fill="#10B981" />

                {/* Value Labels */}
                <text x={currentX} y={currentY - 15} textAnchor="middle" fill="#3B82F6" className="text-[10px] font-black">{Math.round(forecast.currentReadiness)}%</text>
                <text x={projectedX} y={projectedY - 15} textAnchor="middle" fill="#10B981" className="text-[10px] font-black">PROJ: {Math.round(forecast.projectedReadiness)}%</text>
            </svg>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Full readiness</p>
                    <p className="text-sm font-black text-white">{new Date(forecast.estimatedCompletionDate).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Req Velocity</p>
                    <p className="text-sm font-black text-emerald-400">+{forecast.velocityPointsPerDay} units/day</p>
                </div>
            </div>

            {/* Visual Scanline */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            
            <style>{`
                @keyframes dash {
                    to { stroke-dashoffset: -20; }
                }
            `}</style>
        </div>
    );
};

export default ForecastingChart;
