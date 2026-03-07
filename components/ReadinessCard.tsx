
import React from 'react';
import { VolunteerReadinessStatus, Blocker } from '../types';
import { usePersona } from '../contexts/PersonaContext';

interface ReadinessCardProps {
    readiness: VolunteerReadinessStatus;
    onAction: (tab: string, id: string) => void;
}

const ReadinessCard: React.FC<ReadinessCardProps> = ({ readiness, onAction }) => {
    const { pt, persona } = usePersona();
    
    const statusConfig = {
        'Approved': { 
            color: 'bg-green-500', 
            lightColor: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-700 dark:text-green-400',
            icon: '✅', 
            title: 'Fully Ready',
            desc: `You have met all ${pt('readiness')} requirements.`
        },
        'Pending': { 
            color: 'bg-yellow-500', 
            lightColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            textColor: 'text-yellow-700 dark:text-yellow-400',
            icon: '⏳', 
            title: 'Action Required',
            desc: `You have ${readiness.blockers.length} steps remaining.`
        },
        'Expired': { 
            color: 'bg-red-500', 
            lightColor: 'bg-red-50 dark:bg-red-900/20',
            textColor: 'text-red-700 dark:text-red-400',
            icon: '⚠️', 
            title: 'Expired',
            desc: 'Credentials have expired. Action needed.'
        },
        'Missing': { 
            color: 'bg-slate-500', 
            lightColor: 'bg-slate-50 dark:bg-slate-900/20',
            textColor: 'text-slate-700 dark:text-slate-400',
            icon: '📋', 
            title: 'Not Onboarded',
            desc: 'Please start your integration workflow.'
        },
    }[readiness.overall_status];

    const groupedBlockers = readiness.blockers.reduce((acc, blocker) => {
        if (!acc[blocker.type]) acc[blocker.type] = [];
        acc[blocker.type].push(blocker);
        return acc;
    }, {} as Record<string, Blocker[]>);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all">
            {/* Top Status Banner */}
            <div className={`p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 ${statusConfig.lightColor}`}>
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${statusConfig.color} flex items-center justify-center text-3xl md:text-4xl shadow-lg text-white`}>
                        {statusConfig.icon}
                    </div>
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">{pt('readiness')}</span>
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{statusConfig.title}</h2>
                        <p className="text-xs mt-2 opacity-80 font-medium max-w-md">{statusConfig.desc}</p>
                    </div>
                </div>
                <div className={`px-6 py-2 md:py-3 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-sm border-2 shadow-sm ${statusConfig.textColor} ${statusConfig.lightColor.replace('bg-', 'border-')}`}>
                    {readiness.overall_status}
                </div>
            </div>

            {/* Blockers Area - Stacked on Mobile */}
            {readiness.blockers.length > 0 && (
                <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <h3 className="text-[9px] font-black uppercase text-slate-400 mb-6 tracking-[0.25em] flex items-center gap-3">
                        <span className="flex-grow h-px bg-slate-100 dark:bg-slate-700"></span>
                        Action Items
                        <span className="flex-grow h-px bg-slate-100 dark:bg-slate-700"></span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        {(Object.entries(groupedBlockers) as [string, Blocker[]][]).map(([type, blockers]) => (
                            <div key={type} className="space-y-3">
                                <div className="flex items-center gap-2 mb-2 md:mb-4">
                                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">{type}s</span>
                                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 text-[9px] px-1.5 py-0.5 rounded font-black">{blockers.length}</span>
                                </div>
                                {blockers.map((blocker, i) => (
                                    <div key={i} className="group flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-base">
                                                {blocker.type === 'Course' ? '🎓' : '📄'}
                                            </div>
                                            <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] md:text-sm leading-tight max-w-[120px] md:max-w-none truncate">
                                                {blocker.label}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onAction(blocker.targetTab, blocker.targetId)}
                                            style={{ color: persona.accentColor }}
                                            className="text-[10px] font-black uppercase tracking-wider hover:underline"
                                        >
                                            {blocker.actionLabel} &rarr;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadinessCard;
