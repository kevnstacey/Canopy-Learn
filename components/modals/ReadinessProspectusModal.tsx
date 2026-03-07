import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { generateStrategicProspectus } from '../../services/geminiService';
import { StrategicProspectus } from '../../types';

interface ReadinessProspectusModalProps {
    onClose: () => void;
    metrics: any;
}

const ReadinessProspectusModal: React.FC<ReadinessProspectusModalProps> = ({ onClose, metrics }) => {
    const [status, setStatus] = useState<'analyzing' | 'ready'>('analyzing');
    const [prospectus, setProspectus] = useState<StrategicProspectus | null>(null);

    useEffect(() => {
        const fetchProspectus = async () => {
            try {
                const result = await generateStrategicProspectus(metrics);
                setProspectus(result);
                setStatus('ready');
            } catch (e) {
                alert("Board analysis node busy. Please retry.");
                onClose();
            }
        };
        fetchProspectus();
    }, [metrics, onClose]);

    return (
        <BaseModal title="Board Readiness Prospectus" onClose={onClose}>
            <div className="min-h-[600px] flex flex-col">
                {status === 'analyzing' ? (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-10 py-20 relative overflow-hidden bg-slate-900 rounded-[3rem] text-white">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                        <div className="relative">
                            <div className="w-32 h-32 border-8 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-4xl">📈</div>
                        </div>
                        <div className="text-center space-y-3 z-10 px-8">
                            <h3 className="text-3xl font-black italic tracking-tighter animate-pulse uppercase">Gemini Executive Analysis</h3>
                            <div className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                <p className="animate-[fade_1s_infinite]">● CALCULATING ACTUARIAL LIABILITY REDUCTION</p>
                                <p className="animate-[fade_1.2s_infinite]">● BENCHMARKING CROSS-DEPARTMENTAL VELOCITY</p>
                                <p className="animate-[fade_1.5s_infinite]">● DRAFTING STRATEGIC BOARD NARRATIVE</p>
                            </div>
                        </div>
                    </div>
                ) : prospectus && (
                    <div className="animate-fade-in space-y-8 pb-8">
                         {/* Header Branding */}
                         <div className="flex justify-between items-end border-b-4 border-slate-900 pb-6">
                             <div>
                                 <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Readiness <br/>Prospectus</h2>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Fiscal Year 2025 Strategy Document</p>
                             </div>
                             <div className="text-right">
                                 <span className="text-[9px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-[0.2em]">Verified Secure</span>
                             </div>
                         </div>

                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                             {/* Narrative Side (2/3) */}
                             <div className="lg:col-span-2 space-y-8">
                                 <section>
                                     <h4 className="text-xs font-black uppercase text-blue-600 tracking-widest mb-4 flex items-center gap-2">
                                         <span className="w-8 h-px bg-blue-600"></span> Executive Narrative
                                     </h4>
                                     <div className="prose prose-slate max-w-none">
                                         <p className="text-lg font-bold text-slate-800 leading-relaxed italic border-l-4 border-slate-200 pl-6 mb-6">
                                             "{prospectus.executiveSummary}"
                                         </p>
                                     </div>
                                 </section>

                                 <section>
                                     <h4 className="text-xs font-black uppercase text-blue-600 tracking-widest mb-4 flex items-center gap-2">
                                         <span className="w-8 h-px bg-blue-600"></span> Risk Intelligence Audit
                                     </h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                                             <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Regulatory Posture</p>
                                             <p className="text-sm font-black text-slate-900">{prospectus.riskAnalysis.regulatoryPosture}</p>
                                         </div>
                                         <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                                             <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Grading Drift Rating</p>
                                             <p className="text-sm font-black text-slate-900">{prospectus.riskAnalysis.complianceDriftRating}</p>
                                         </div>
                                     </div>
                                     <div className="mt-4 p-6 bg-red-50 rounded-3xl border-2 border-red-100">
                                         <p className="text-[9px] font-black text-red-600 uppercase mb-3">Critical Vulnerabilities</p>
                                         <ul className="space-y-2">
                                             {prospectus.riskAnalysis.criticalGaps.map((g, i) => (
                                                 <li key={i} className="text-sm font-bold text-red-900 flex items-center gap-2">
                                                     <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                                     {g}
                                                 </li>
                                             ))}
                                         </ul>
                                     </div>
                                 </section>
                             </div>

                             {/* Financial Side (1/3) */}
                             <div className="space-y-6">
                                 <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-white shadow-2xl">
                                     <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 text-emerald-200">Financial Impact</h4>
                                     <div className="space-y-6">
                                         <div>
                                             <p className="text-[8px] font-black uppercase text-emerald-300">Liability Mitigation</p>
                                             <p className="text-3xl font-black italic tracking-tighter">${prospectus.financialImpact.mitigatedLiability.toLocaleString()}</p>
                                         </div>
                                         <div>
                                             <p className="text-[8px] font-black uppercase text-emerald-300">Efficiency Yield</p>
                                             <p className="text-3xl font-black italic tracking-tighter">${prospectus.financialImpact.operationalEfficiencyGain.toLocaleString()}</p>
                                         </div>
                                         <div>
                                             <p className="text-[8px] font-black uppercase text-emerald-300">ROI Multiple</p>
                                             <p className="text-3xl font-black italic tracking-tighter">{prospectus.financialImpact.roiMultiple}x</p>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="p-6 border-2 border-slate-100 rounded-3xl">
                                     <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Q3 Roadmap</h4>
                                     <ul className="space-y-3">
                                         {prospectus.futureRoadmap.map((r, i) => (
                                             <li key={i} className="text-[10px] font-bold text-slate-600 uppercase flex items-start gap-2">
                                                 <span className="mt-1">●</span>
                                                 {r}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             </div>
                         </div>

                         <div className="flex gap-4 pt-8 border-t-2 border-slate-100">
                             <button onClick={onClose} className="px-10 py-5 rounded-[2rem] bg-slate-100 font-black uppercase text-xs text-slate-500 hover:bg-slate-200 transition-all">Close Report</button>
                             <button className="flex-grow py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all text-xs">Download Board Briefing Pack (.PDF)</button>
                         </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
            `}</style>
        </BaseModal>
    );
};

export default ReadinessProspectusModal;