import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { DriftIncident, CalibrationResult } from '../../types';
import { generateCalibrationAdvice } from '../../services/geminiService';

interface CalibrationWorkspaceModalProps {
    incident: DriftIncident;
    onClose: () => void;
    onResolved: (result: CalibrationResult) => void;
}

const CalibrationWorkspaceModal: React.FC<CalibrationWorkspaceModalProps> = ({ incident, onClose, onResolved }) => {
    const [view, setView] = useState<'compare' | 'advice'>('compare');
    const [isGenerating, setIsGenerating] = useState(false);
    const [advice, setAdvice] = useState<CalibrationResult | null>(null);

    const handleGetAdvice = async () => {
        setIsGenerating(true);
        try {
            const result = await generateCalibrationAdvice(incident);
            setAdvice(result);
            setView('advice');
        } catch (e) {
            alert("Calibration node busy.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <BaseModal title="Sentinel Calibration Workspace" onClose={onClose}>
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-100 dark:border-orange-900/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚖️</span>
                        <div>
                            <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Drift Incident #{incident.id.slice(-4)}</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Conflict: {incident.issue}</p>
                        </div>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-red-100 text-red-700 px-3 py-1 rounded-full">{incident.severity} Severity</span>
                </div>

                {view === 'compare' ? (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* AI Proctor Panel */}
                            <div className="p-6 bg-slate-900 text-white rounded-[2rem] border border-blue-500/30 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">🤖</div>
                                <h4 className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-widest">Sentinel AI Verdict</h4>
                                <div className="text-3xl font-black italic tracking-tighter text-red-500 mb-2 uppercase">{incident.aiVerdict}</div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">"Visual detection identified failure to maintain eye contact and missing secondary hand-sanitization step in sequence."</p>
                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-slate-500">Confidence: 94.2%</span>
                                    <button className="text-[8px] font-black uppercase bg-white/10 px-2 py-1 rounded hover:bg-white/20">View Hotspots</button>
                                </div>
                            </div>

                            {/* Human Manager Panel */}
                            <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm group">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex justify-between">
                                    <span>Reviewer: {incident.managerName}</span>
                                    <span>👤</span>
                                </h4>
                                <div className="text-3xl font-black italic tracking-tighter text-emerald-600 mb-2 uppercase">{incident.humanVerdict}</div>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium italic">"Learner showed great enthusiasm and correctly identified the main hazard. I felt the minor sequence slip didn't warrant a full retry."</p>
                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-slate-400">Date: {new Date(incident.timestamp).toLocaleDateString()}</span>
                                    <button className="text-[8px] font-black uppercase text-blue-600 hover:underline">Full Submission</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={handleGetAdvice}
                                disabled={isGenerating}
                                className="flex-grow py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isGenerating ? 'ANALYZING DRIFT...' : '✨ Gemini Calibration advice'}
                            </button>
                        </div>
                    </div>
                ) : advice && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="p-8 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 rounded-[2.5rem] relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Calibration Logic</span>
                                    <span className="text-xs font-bold text-blue-600">Refining Operational Standards</span>
                                </div>
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 italic leading-relaxed mb-8">
                                    "{advice.reasoning}"
                                </p>
                                
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-blue-100 dark:border-slate-700 shadow-sm mb-8">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Proposed Rubric refinement</h5>
                                    <p className="text-sm font-mono text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
                                        {advice.suggestedRubricChange}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                        +{advice.alignmentImpact}%
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Alignment Yield Forecast</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setView('compare')} className="px-10 py-5 rounded-[2rem] border-2 border-slate-100 font-black uppercase text-xs text-slate-400 hover:bg-slate-50">Back to Case</button>
                            <button 
                                onClick={() => onResolved(advice)}
                                className="flex-grow py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all text-xs"
                            >
                                Apply Calibration & Sync Nodes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </BaseModal>
    );
};

export default CalibrationWorkspaceModal;