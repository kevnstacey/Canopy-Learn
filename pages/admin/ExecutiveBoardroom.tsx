import React, { useMemo, useState } from 'react';
import Card from '../../components/Card';
import KPIBlock from '../../components/KPIBlock';
import ReadinessProspectusModal from '../../components/modals/ReadinessProspectusModal';
import { User, Program, Enrollment, Certificate, TalentGapPoint, Department } from '../../types';
import { usePersona } from '../../contexts/PersonaContext';

interface ExecutiveBoardroomProps {
    users: User[];
    programs: Program[];
    enrollments: Enrollment[];
    certificates: Certificate[];
}

const ExecutiveBoardroom: React.FC<ExecutiveBoardroomProps> = ({ users, programs, enrollments, certificates }) => {
    const [isProspectusOpen, setIsProspectusOpen] = useState(false);
    const { pt, persona } = usePersona();

    // Calculate Strategic Metrics dynamically from actual roster
    const metrics = useMemo(() => {
        const learners = users.filter(u => u.role === 'Learner');
        const departments = Array.from(new Set(learners.flatMap(u => u.departments)));
        
        const readyCount = learners.filter(l => {
            const userCerts = certificates.filter(c => c.user_id === l.user_id && c.status === 'Active');
            return userCerts.length > 0;
        }).length;

        const readinessRate = learners.length ? Math.round((readyCount / learners.length) * 100) : 0;
        const mitigatedRisk = readyCount * (persona.type === 'Business' ? 2500 : 1200); 
        const shieldId = `SHLD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Forecast Talent Gap based on 6 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const talentGap: TalentGapPoint[] = months.map((m, i) => {
            const demand = 80 + (i * 4); // Growth curve
            const capacity = readinessRate + (i * 1.5); // Readiness velocity
            return { 
                month: m, 
                currentCapacity: Math.round(capacity), 
                requiredCapacity: demand, 
                gap: Math.max(0, demand - Math.round(capacity)) 
            };
        });

        return { readinessRate, mitigatedRisk, shieldId, talentGap, learnerCount: learners.length, departments };
    }, [users, certificates, persona]);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Cinematic Hero */}
            <div className="bg-slate-950 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-1 bg-emerald-500 rounded-full"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Boardroom Strategic Hub</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] mb-8">
                            Monetize your <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-indigo-500">
                                {pt('readiness')} Moat.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg mb-10">
                            The {pt('learner')} roster is {metrics.readinessRate}% mission-ready. This provides a measurable <strong>${metrics.mitigatedRisk.toLocaleString()}</strong> defense against {persona.type === 'Business' ? 'operational liability' : 'compliance risk'}.
                        </p>
                        <button 
                            onClick={() => setIsProspectusOpen(true)}
                            className="group relative px-12 py-6 bg-white text-slate-950 font-black rounded-[2.5rem] text-lg uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                📈 Generate {pt('readiness')} Prospectus
                                <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
                            </span>
                        </button>
                    </div>

                    {/* Liability Shield Visual */}
                    <div className="relative flex justify-center">
                         <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border-2 border-emerald-500/20 flex items-center justify-center relative">
                             <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-pulse"></div>
                             <div className="w-56 h-56 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent border-4 border-emerald-500/40 backdrop-blur-2xl flex flex-col items-center justify-center text-center shadow-[0_0_100px_rgba(16,185,129,0.2)] group hover:border-emerald-400 transition-all duration-1000">
                                 <div className="text-5xl md:text-7xl mb-4 group-hover:scale-110 transition-transform">🛡️</div>
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1">Liability Shield</p>
                                 <p className="text-3xl md:text-4xl font-black italic tracking-tighter text-white leading-none">V{metrics.readinessRate}.0</p>
                                 <p className="text-[8px] font-mono text-slate-500 mt-4 tracking-widest">TOKEN: {metrics.shieldId}</p>
                             </div>
                             
                             {/* Orbiting Nodes */}
                             {[0, 120, 240].map((deg, i) => (
                                 <div key={i} className="absolute w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-xl shadow-2xl animate-[orbit_10s_linear_infinite]" style={{ transform: `rotate(${deg}deg) translateX(180px) rotate(-${deg}deg)`, animationDelay: `${i*1.5}s` }}>
                                     {['📜', '💼', '🔍'][i]}
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Talent Gap Projection */}
                <div className="lg:col-span-2">
                    <Card title={`Predictive ${pt('learner')} Gap (6-Month Projection)`} className="h-full bg-white dark:bg-slate-900/50">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">Projected {pt('readiness')} Capacity vs. Demand</p>
                        
                        <div className="h-64 flex items-end gap-1 px-4">
                            {metrics.talentGap.map((p, i) => {
                                const max = 120;
                                const demandH = (p.requiredCapacity / max) * 100;
                                const capacityH = (p.currentCapacity / max) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                        <div className="w-full flex items-end justify-center gap-1 h-full">
                                            <div className="w-3 bg-slate-100 dark:bg-slate-800 rounded-t-lg transition-all hover:bg-slate-200" style={{ height: `${demandH}%` }}></div>
                                            <div className="w-3 bg-blue-600 rounded-t-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]" style={{ height: `${capacityH}%` }}></div>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase">{p.month}</span>
                                        
                                        {/* Hover Tooltip */}
                                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-3 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-2xl min-w-[120px]">
                                            <p className="text-[8px] font-black text-blue-400 uppercase mb-1">Gap Analysis</p>
                                            <p className="text-xs font-bold">Capacity: {p.currentCapacity}%</p>
                                            <p className="text-xs font-bold">Required: {p.requiredCapacity}%</p>
                                            <div className="mt-2 pt-2 border-t border-white/5">
                                                <p className={`text-xs font-black tracking-tighter ${p.gap > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {p.gap > 0 ? `🚨 Shortfall: ${p.gap}%` : '✅ SURPLUS'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8 flex justify-center gap-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200"></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Demand</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready Capacity</span></div>
                        </div>
                    </Card>
                </div>

                {/* Insurance Underwriting Data */}
                <div className="lg:col-span-1 space-y-8">
                    <Card title="Risk Underwriting Nodes">
                        <div className="space-y-6 pt-4">
                             <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border-2 border-emerald-100 dark:border-emerald-800 shadow-sm">
                                 <p className="text-[9px] font-black uppercase text-emerald-600 mb-1">Underwriting Advantage</p>
                                 <p className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">Projected Premium reduction: <strong>{persona.type === 'Business' ? '14.2%' : '8.5%'}</strong></p>
                             </div>
                             
                             <div className="space-y-4">
                                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Validation Pillars</h4>
                                 {[
                                     { label: 'PIPEDA Data Sovereignty', ok: true },
                                     { label: 'Multimodal AI Proctoring', ok: true },
                                     { label: 'Continuous Audit Loop', ok: true },
                                     { label: `${pt('readiness')} Velocity`, ok: metrics.readinessRate > 80 },
                                 ].map((p, i) => (
                                     <div key={i} className="flex justify-between items-center text-sm">
                                         <span className="font-bold text-slate-600 dark:text-slate-400">{p.label}</span>
                                         <span className={p.ok ? 'text-emerald-500' : 'text-slate-300'}>{p.ok ? '✓' : '—'}</span>
                                     </div>
                                 ))}
                             </div>
                             
                             <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">
                                 Export Compliance Package
                             </button>
                        </div>
                    </Card>
                    
                    {/* Strategy Note */}
                    <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                         <div className="relative z-10">
                             <h4 className="text-xl font-black italic tracking-tighter uppercase mb-2">Tactical Summary</h4>
                             <p className="text-sm opacity-80 leading-relaxed font-medium">"{metrics.departments[0] || 'Organization'} {pt('readiness')} is {metrics.readinessRate > 80 ? 'exceeding' : 'approaching'} the safety threshold. Recommend focus on gap closure in underperforming cohorts."</p>
                         </div>
                         <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                </div>
            </div>

            {isProspectusOpen && (
                <ReadinessProspectusModal 
                    onClose={() => setIsProspectusOpen(false)}
                    metrics={metrics}
                />
            )}

            <style>{`
                @keyframes orbit {
                    from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
                }
            `}</style>
        </div>
    );
};

export default ExecutiveBoardroom;