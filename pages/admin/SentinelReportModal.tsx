import React from 'react';
import BaseModal from '../modals/BaseModal';
import Card from '../../components/Card';
import { TrainerInsight, DriftIncident } from '../../types';

interface SentinelReportModalProps {
    insight: TrainerInsight;
    onClose: () => void;
    onApplyFix: (gap: { lessonId: string, title: string, context: string }) => void;
    onOpenCalibration?: (incident: DriftIncident) => void;
}

const SentinelReportModal: React.FC<SentinelReportModalProps> = ({ insight, onClose, onApplyFix, onOpenCalibration }) => {
    // Mock Drift Data for demo
    const mockDrifts: DriftIncident[] = [
        { 
            id: 'dr-1', 
            submissionId: 'sub-42', 
            learnerName: 'Alice Chen', 
            managerName: 'Mark E.', 
            issue: 'Safety Goggle Violation', 
            severity: 'High', 
            aiVerdict: 'Fail', 
            humanVerdict: 'Approved',
            timestamp: Date.now() - 86400000 
        },
        { 
            id: 'dr-2', 
            submissionId: 'sub-48', 
            learnerName: 'David Park', 
            managerName: 'Sarah M.', 
            issue: 'Incorrect PPE Sequence', 
            severity: 'Medium', 
            aiVerdict: 'Fail', 
            humanVerdict: 'Approved',
            timestamp: Date.now() - 172800000 
        }
    ];

    return (
        <BaseModal title="Canopy Sentinel: Proactive Risk Audit" onClose={onClose}>
            <div className="space-y-8 pb-4">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Threat Detection Active</span>
                            </div>
                            <h3 className="text-3xl font-black italic tracking-tighter mb-2 leading-none uppercase">Sentinel Report</h3>
                            <p className="text-sm text-slate-400 font-medium">Gemini has identified structural unreadiness and grading drift based on live behavior.</p>
                        </div>
                        
                        {/* Consistency KPI */}
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block mb-1">Grading Consistency</span>
                                <span className="text-3xl font-black italic tracking-tighter text-white">{insight.gradingConsistencyScore || 88}%</span>
                            </div>
                            <div className="text-right">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => <div key={i} className={`w-1 h-4 rounded-full ${i < 4 ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>)}
                                </div>
                                <p className="text-[8px] font-black text-slate-500 uppercase mt-1">High Alignment</p>
                            </div>
                        </div>
                    </div>
                    {/* Radar Visual */}
                    <div className="absolute right-0 top-0 bottom-0 w-48 opacity-20 pointer-events-none">
                        <div className="w-64 h-64 border-2 border-red-500/50 rounded-full absolute -right-20 top-1/2 -translate-y-1/2 animate-pulse"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Knowledge & Content Gaps */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Policy Hotspots
                            </h4>
                            <div className="space-y-3">
                                {insight.courseSentiment.filter(s => s.status === 'Confusing').map((s, i) => (
                                    <div key={i} className="p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm hover:border-red-400 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-slate-800 dark:text-white leading-tight">{s.title}</p>
                                            <span className="text-[10px] font-black text-red-600">{s.score}/5</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-4">Learners frequently asking for clarification on core safety steps.</p>
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
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Trending Gaps
                            </h4>
                            <div className="space-y-3">
                                {insight.knowledgeGaps.slice(0, 3).map((q, i) => (
                                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent hover:border-blue-200 rounded-2xl flex items-start gap-3">
                                        <span className="text-xl">💬</span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{q}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Search Trace • Critical</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Drift Detection Loop */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Drift Incidents (AI vs Human)
                        </h4>
                        
                        <div className="p-6 bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800 rounded-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-2xl">⚠️</div>
                                <h5 className="font-black text-orange-900 dark:text-orange-100 uppercase tracking-tighter">Human Review Drift</h5>
                            </div>
                            <p className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed mb-6 font-medium">
                                Sentinel detected <strong>{mockDrifts.length} incidents</strong> where human reviewers approved candidates that the AI Proctor failed for violations.
                            </p>
                            
                            <div className="space-y-2">
                                {mockDrifts.map((d, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-white">{d.managerName}</p>
                                            <p className="text-[10px] text-orange-600 font-bold uppercase">{d.issue}</p>
                                        </div>
                                        <button 
                                            onClick={() => onOpenCalibration && onOpenCalibration(d)}
                                            className="text-[8px] font-black uppercase bg-orange-600 text-white px-3 py-1 rounded shadow-sm hover:bg-orange-700"
                                        >
                                            Calibrate
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Card title="Strategy Recommendation">
                            <p className="text-xs font-medium text-slate-500 italic leading-relaxed">
                                "The lumber department reviewers are showing significant leniency on WHMIS labeling. Recommend mandatory calibration session for all Unit Managers."
                            </p>
                        </Card>
                    </div>
                </div>

                <div className="pt-8 border-t-2 border-dashed border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => <div key={i} className="w-4 h-1 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
                    </div>
                    <button onClick={onClose} className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl">Dismiss Sentinel Log</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default SentinelReportModal;