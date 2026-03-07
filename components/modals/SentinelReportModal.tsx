
import React from 'react';
import BaseModal from './BaseModal';
import { TrainerInsight } from '../../types';

interface SentinelReportModalProps {
    insight: TrainerInsight;
    onClose: () => void;
    onApplyFix: (gap: { lessonId: string, title: string, context: string }) => void;
}

const SentinelReportModal: React.FC<SentinelReportModalProps> = ({ insight, onClose, onApplyFix }) => {
    return (
        <BaseModal title="Canopy Sentinel: Proactive Risk Audit" onClose={onClose}>
            <div className="space-y-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Threat Detection Active</span>
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tighter mb-2 leading-none uppercase">Sentinel Report</h3>
                        <p className="text-sm text-slate-400 font-medium">Gemini has identified structural unreadiness based on live question patterns.</p>
                    </div>
                    {/* Radar Visual */}
                    <div className="absolute right-0 top-0 bottom-0 w-48 opacity-20 pointer-events-none">
                        <div className="w-64 h-64 border-2 border-red-500/50 rounded-full absolute -right-20 top-1/2 -translate-y-1/2 animate-pulse"></div>
                        <div className="w-48 h-48 border-2 border-red-500/30 rounded-full absolute -right-12 top-1/2 -translate-y-1/2"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Confusing Policy Hotspots
                        </h4>
                        <div className="space-y-3">
                            {insight.courseSentiment.filter(s => s.status === 'Confusing').map((s, i) => (
                                <div key={i} className="p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm hover:border-red-400 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-slate-800 dark:text-white leading-tight">{s.title}</p>
                                        <span className="text-[10px] font-black text-red-600">{s.score}/5</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4">Frequent questions indicate learners are struggling with the safety parameters in this lesson.</p>
                                    <button 
                                        onClick={() => onApplyFix({ lessonId: s.lessonId, title: s.title, context: "Learners frequently asking for clarification on core safety steps." })}
                                        className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all"
                                    >
                                        Auto-Generate SOP Patch
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Trending Knowledge Gaps
                        </h4>
                        <div className="space-y-3">
                            {insight.knowledgeGaps.map((q, i) => (
                                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent hover:border-blue-200 rounded-2xl flex items-start gap-3">
                                    <span className="text-xl">💬</span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{q}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">High Volume • Search Trace</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t-2 border-dashed border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => <div key={i} className="w-4 h-1 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
                    </div>
                    <button onClick={onClose} className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl">Dismiss Log</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default SentinelReportModal;
