import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import KPIBlock from '../components/KPIBlock';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import RiskHeatmap from '../components/charts/RiskHeatmap';
import FinancialIntelligenceModal from '../components/modals/FinancialIntelligenceModal';
import { User, Enrollment, Certificate, Submission, Department } from '../types';
import { usePersona } from '../contexts/PersonaContext';

interface ComplianceDashboardProps {
    learners: User[];
    enrollments: Enrollment[];
    certificates: Certificate[];
    submissions: Submission[];
    onNavigate: (tab: string) => void;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ learners, enrollments, certificates, submissions, onNavigate }) => {
    const [drillDownFilter, setDrillDownFilter] = useState<string | null>(null);
    const [finModal, setFinModal] = useState<{ type: 'liability' | 'risk', value: string } | null>(null);
    const { pt, persona } = usePersona();

    const stats = useMemo(() => {
        const totalLearners = learners.length;
        const userStatuses: Record<string, string> = {};
        
        let readyCount = 0;
        let inProgressCount = 0;
        let notEligibleCount = 0;

        // Investment Metrics
        const VALUE_PER_READY_HEAD = persona.type === 'Business' ? 2500 : 1200; 
        const COST_OF_UNREADINESS = persona.type === 'Business' ? 3000 : 1500; 

        learners.forEach(user => {
            const userEnr = enrollments.filter(e => e.user_id === user.user_id);
            const userSubs = submissions.filter(s => s.user_id === user.user_id);
            const userCerts = certificates.filter(c => c.user_id === user.user_id);

            const hasRejected = userSubs.some(s => s.status === 'Rejected');
            const hasRevoked = userCerts.some(c => c.status === 'Revoked');

            if (hasRejected || hasRevoked) {
                notEligibleCount++;
                userStatuses[user.user_id] = 'Not Eligible';
                return;
            }

            const inProg = userEnr.some(e => e.status === 'In Progress' || e.status === 'Not Started') || userEnr.length === 0;
            if (inProg) {
                inProgressCount++;
                userStatuses[user.user_id] = 'In Progress';
            } else {
                readyCount++;
                userStatuses[user.user_id] = 'Ready';
            }
        });

        const mitigatedLiability = readyCount * VALUE_PER_READY_HEAD;
        const totalUnreadyCost = inProgressCount * COST_OF_UNREADINESS;
        
        // DYNAMIC DEPARTMENTS FROM ACTUAL ROSTER
        const actualDepts = Array.from(new Set(learners.flatMap(u => u.departments))) as Department[];
        const heatmapData = actualDepts.map(dept => {
            const deptStaff = learners.filter(u => u.departments.includes(dept));
            if (deptStaff.length === 0) return { department: dept, readiness: 100 };
            const deptReady = deptStaff.filter(u => userStatuses[u.user_id] === 'Ready').length;
            return { department: dept, readiness: Math.round((deptReady / deptStaff.length) * 100) };
        });

        const now = new Date();
        const monthLabels = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            return d.toLocaleString('default', { month: 'short' });
        });

        const expiryData = monthLabels.map((label, i) => {
            const targetMonth = (now.getMonth() + i) % 12;
            const targetYear = now.getFullYear() + Math.floor((now.getMonth() + i) / 12);
            const count = certificates.filter(c => {
                if (!c.expires_at || c.status !== 'Active') return false;
                const expDate = new Date(c.expires_at);
                return expDate.getMonth() === targetMonth && expDate.getFullYear() === targetYear;
            }).length;
            
            let color = 'bg-blue-400';
            if (i < 3 && count > 5) color = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
            else if (i < 3) color = 'bg-orange-400';

            return { label, value: count, color };
        });

        return {
            totalLearners,
            readyPct: totalLearners ? Math.round((readyCount / totalLearners) * 100) : 0,
            mitigatedLiability,
            totalUnreadyCost,
            heatmapData,
            expiryProjection: expiryData,
            userStatuses,
            raw: { ready: readyCount, inProgress: inProgressCount, notEligible: notEligibleCount }
        };
    }, [learners, enrollments, certificates, submissions, persona.type]);

    const pieData = [
        { label: 'Ready', value: stats.raw.ready, color: '#10B981' },
        { label: 'In Progress', value: stats.raw.inProgress, color: '#3b82f6' },
        { label: 'Not Eligible', value: stats.raw.notEligible, color: '#ef4444' }
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white italic lowercase">Strategic {pt('readiness')} Insight</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Asset Intelligence & Organization Risk</p>
                </div>
                <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10B981]"></div>
                     <span className="text-[10px] font-black uppercase tracking-widest">Sentinel Network Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPIBlock 
                    label="Risk Mitigation ($)" 
                    value={`$${stats.mitigatedLiability.toLocaleString()}`} 
                    sub={`Annualized ${pt('readiness')} Shield`} 
                    valueClassName="text-emerald-600" 
                    onInfoClick={() => setFinModal({ type: 'liability', value: `$${stats.mitigatedLiability.toLocaleString()}` })}
                />
                <KPIBlock 
                    label="Active Gaps Cost" 
                    value={`$${stats.totalUnreadyCost.toLocaleString()}`} 
                    sub="Drift-Induced Drag" 
                    valueClassName="text-red-500" 
                    onInfoClick={() => setFinModal({ type: 'risk', value: `$${stats.totalUnreadyCost.toLocaleString()}` })}
                />
                <KPIBlock 
                    label={`${pt('readiness')} Coverage`} 
                    value={`${stats.readyPct}%`} 
                    valueClassName="text-blue-600" 
                    sub={`${stats.raw.ready} ${pt('learners')} mission-ready`} 
                />
                <Card title="Compliance Health">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="text-4xl font-black text-slate-800 dark:text-white">A+</div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-black tracking-tighter shadow-sm border border-emerald-200">VERIFIED</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Instance passes {persona.type === 'University' ? 'FERPA' : 'PIPEDA'} standard.</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card title="Strategic Risk Heatmap">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest">Identify structural {pt('readiness')} gaps by organizational unit.</p>
                        <RiskHeatmap data={stats.heatmapData} />
                    </Card>

                    <div className="relative group">
                        <Card title={`The 'Compliance Cliff' (12-Month ${pt('readiness')} Projection)`}>
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Projected credential decay across the roster.</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[8px] font-black uppercase text-red-500">Decay Risk</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div><span className="text-[8px] font-black uppercase text-slate-400">Stable</span></div>
                                </div>
                            </div>
                            <BarChart data={stats.expiryProjection} height={180} />
                        </Card>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <Card title={`${pt('readiness')} Distribution`}>
                        <div className="flex flex-col items-center py-6">
                            <PieChart data={pieData} size={200} donut />
                        </div>
                        <div className="space-y-2 mt-4">
                             {pieData.map(item => (
                                 <button 
                                    key={item.label} 
                                    onClick={() => setDrillDownFilter(item.label)}
                                    className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all border-2 ${drillDownFilter === item.label ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border-transparent'}`}
                                 >
                                     <div className="flex items-center gap-3">
                                         <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: item.color }}></div>
                                         <span className="text-xs font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                                     </div>
                                     <span className="font-black text-lg text-slate-900 dark:text-white">{item.value}</span>
                                 </button>
                             ))}
                        </div>
                    </Card>

                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                         <div className="relative z-10">
                             <h4 className="text-xl font-black italic tracking-tighter uppercase mb-2">Strategy Yield</h4>
                             <p className="text-xs opacity-80 font-medium leading-relaxed mb-6">Completing current bottlenecks will result in a <strong>{Math.round(stats.readyPct * 1.1)}%</strong> aggregate {pt('readiness')} by Q3.</p>
                             <button className="w-full py-3 bg-white text-blue-700 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg group-hover:scale-[1.02] transition-all">Download Board PDF</button>
                         </div>
                    </div>
                </div>
            </div>

            {finModal && (
                <FinancialIntelligenceModal 
                    type={finModal.type}
                    value={finModal.value}
                    onClose={() => setFinModal(null)}
                />
            )}
        </div>
    );
};

export default ComplianceDashboard;