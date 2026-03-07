import React from 'react';
import BaseModal from './BaseModal';
import { TrainerInsight } from '../../types';

interface PulseSentimentDetailModalProps {
    insight: TrainerInsight;
    onClose: () => void;
    onPatch: (lessonId: string, title: string) => void;
}

const PulseSentimentDetailModal: React.FC<PulseSentimentDetailModalProps> = ({ insight, onClose, onPatch }) => {
    const topCourses = [...insight.courseSentiment].sort((a,b) => b.score - a.score).slice(0, 3);
    const bottomCourses = [...insight.courseSentiment].sort((a,b) => a.score - b.score).slice(0, 3);

    // Mock quotes for visual impact as suggested in critique
    const mockQuotes = [
        "The section on hazardous waste disposal was a bit confusing...",
        "Why is there no mention of the emergency shutoff valve?",
        "I'm not sure which PPE is mandatory for the paint station.",
        "The proctor checklist felt inconsistent with the video."
    ];

    return (
        <BaseModal title="Canopy Pulse: Operational Clarity Drill-down" onClose={onClose}>
            <div className="space-y-8">
                {/* Global Clarity Hero */}
                <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border-2 border-emerald-100 dark:border-emerald-800 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Aggregate Readiness Clarity</p>
                        <p className="text-6xl font-black italic tracking-tighter text-emerald-600">4.2<span className="text-2xl text-slate-300">/5.0</span></p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <span className="text-xl">😊</span>
                            <span className="text-sm font-bold text-emerald-700 uppercase tracking-tighter">High Comprehension Index</span>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-emerald-100/30 opacity-50 skew-x-12 translate-x-12"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Needs Improvement - Red Flagged */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Flagged Hotspots (&lt; 3.0)
                        </h4>
                        <div className="space-y-3">
                            {bottomCourses.map(c => (
                                <div key={c.lessonId} className="p-5 bg-red-50 dark:bg-red-900/10 rounded-3xl border-2 border-red-100 dark:border-red-900/30 flex justify-between items-center group transition-all hover:border-red-400">
                                    <div className="max-w-[70%]">
                                        <span className="font-black text-sm text-red-800 dark:text-red-300 uppercase leading-tight">{c.title}</span>
                                        <div className="flex gap-1 mt-1">
                                             {[...Array(5)].map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < Math.round(c.score) ? 'bg-red-500' : 'bg-slate-200'}`}></div>)}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onPatch(c.lessonId, c.title)}
                                        className="text-[9px] font-black uppercase bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-red-700 transition-all active:scale-95"
                                    >
                                        Apply Patch
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Learner Quotes / Voice */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Recent Learner Friction
                        </h4>
                        <div className="space-y-3">
                            {mockQuotes.map((quote, i) => (
                                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 relative">
                                    <div className="absolute -left-2 top-4 text-2xl text-blue-200 opacity-50">"</div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 italic pl-3 leading-relaxed">
                                        {quote}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Tactical Recommendations */}
                <div className="pt-6 border-t-2 border-dashed border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center gap-2">
                        ✨ Gemini Strategic Audit
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insight.globalRecommendations.slice(0, 2).map((rec, i) => (
                            <div key={i} className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border-2 border-blue-100 dark:border-blue-800 relative group overflow-hidden">
                                <p className="text-sm font-bold text-blue-800 dark:text-blue-300 leading-relaxed italic relative z-10">"{rec}"</p>
                                <div className="absolute -right-4 -bottom-4 text-4xl opacity-5 group-hover:scale-150 transition-transform">⚙️</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-4">
                    <button onClick={onClose} className="px-8 py-4 bg-slate-100 text-slate-400 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Dismiss Reports</button>
                    <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all">Download Executive Summary</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default PulseSentimentDetailModal;