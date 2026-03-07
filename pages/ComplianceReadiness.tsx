
import React, { useMemo } from 'react';
import Card from '../components/Card';
import { Enrollment, Requirement, User } from '../types';
import { PROGRAMS, USERS, REQUIREMENTS } from '../data';
import { generateCohortForecasts } from '../services/lmsService';
import ForecastingChart from '../components/charts/ForecastingChart';

interface ComplianceReadinessProps {
    enrollments: Enrollment[];
}

const ComplianceReadiness: React.FC<ComplianceReadinessProps> = ({ enrollments }) => {
    const forecasts = useMemo(() => generateCohortForecasts(USERS, enrollments, REQUIREMENTS), [enrollments]);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-end mb-4 px-1">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Predictive Intelligence</h2>
                    <p className="text-sm text-slate-500 font-medium">Mathematical readiness projections for operational units.</p>
                </div>
                <div className="hidden md:block">
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                         Velocity Engine: ACTIVE
                     </span>
                </div>
            </div>

            {/* Primary Forecast Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forecasts.map((f, i) => (
                    <ForecastingChart key={i} forecast={f} />
                ))}
            </div>

            <Card title="Program Specific Coverage">
                 <div className="grid grid-cols-1 gap-6 mt-4">
                    {PROGRAMS.map(prog => {
                        const programEnrollments = enrollments.filter(e => e.program_id === prog.program_id);
                        const total = programEnrollments.length;
                        const completed = programEnrollments.filter(e => e.status === 'Completed').length;
                        const inProgress = programEnrollments.filter(e => e.status === 'In Progress').length;
                        const notStarted = programEnrollments.filter(e => e.status === 'Not Started').length;
                        
                        const readinessPct = total > 0 ? Math.round((completed / total) * 100) : 0;

                        return (
                            <div key={prog.program_id} className="p-6 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-blue-400 transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight">{prog.title}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Pathway</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white italic">{readinessPct}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 mb-6 overflow-hidden flex border border-slate-100 dark:border-slate-700">
                                    <div className="bg-emerald-500 h-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] transition-all duration-1000" style={{ width: `${(completed / total) * 100}%` }}></div>
                                    <div className="bg-blue-400 h-4 transition-all duration-1000" style={{ width: `${(inProgress / total) * 100}%` }}></div>
                                    <div className="bg-slate-400 h-4 transition-all duration-1000" style={{ width: `${(notStarted / total) * 100}%` }}></div>
                                </div>
                                <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div> Ready: {completed}</div>
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-400 rounded-sm"></div> In Progress: {inProgress}</div>
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-slate-400 rounded-sm"></div> Pending: {notStarted}</div>
                                </div>
                            </div>
                        );
                    })}
                 </div>
            </Card>
        </div>
    );
};

export default ComplianceReadiness;
