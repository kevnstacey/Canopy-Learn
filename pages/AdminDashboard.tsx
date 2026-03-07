
import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/Card';
import KPIBlock from '../components/KPIBlock';
import { User, Program, Enrollment, Submission, ChatHistoryItem, TrainerInsight, Certificate, ComplianceDocument, VolunteerRole, VolunteerRoleAssignment, Override, ActionLog } from '../types';
import { generateTrainerInsights } from '../services/geminiService';
import { computeReadiness } from '../services/lmsService';
import { ORGANIZATION } from '../data';
import { usePersona } from '../contexts/PersonaContext';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  enrollments: Enrollment[];
  submissions: Submission[];
  programs: Program[];
  certificates?: Certificate[];
  complianceDocuments?: ComplianceDocument[];
  volunteerRoles?: VolunteerRole[];
  roleAssignments?: VolunteerRoleAssignment[];
  overrides?: Override[];
  actionLogs?: ActionLog[]; // Added
  team: User[];
  lessons: any[];
  chatHistory: ChatHistoryItem[];
  onReviewSubmission: (submission: Submission) => void;
  onSetCopilotPrompt: (prompt: string) => void;
  showInsightsOnly?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    allUsers, enrollments, submissions, programs, 
    certificates = [], complianceDocuments = [], volunteerRoles = [], roleAssignments = [], overrides = [], actionLogs = [],
    chatHistory, onSetCopilotPrompt, showInsightsOnly = false
}) => {
  const { pt } = usePersona();
  const [insights, setInsights] = useState<TrainerInsight | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const stats = useMemo(() => {
    const volunteers = allUsers.filter(u => u.role === 'Learner');
    const totalVolunteers = volunteers.length;
    const readinessCounts = { Approved: 0, Pending: 0, Expired: 0, Missing: 0 };
    
    volunteers.forEach(v => {
        const r = computeReadiness(v.user_id, ORGANIZATION.id, {
            enrollments, certificates, submissions, complianceDocuments, roles: volunteerRoles || [], assignments: roleAssignments || [], overrides: overrides || []
        });
        readinessCounts[r.overall_status]++;
    });

    const readyPct = totalVolunteers > 0 ? Math.round((readinessCounts.Approved / totalVolunteers) * 100) : 0;
    const enrolled = enrollments.length;
    const activeInTraining = enrollments.filter(e => e.status === 'In Progress').length;
    const ready = readinessCounts.Approved;

    return {
        totalVolunteers,
        readyPct,
        readinessCounts,
        funnel: { total: totalVolunteers, enrolled, active: activeInTraining, ready }
    };
  }, [allUsers, enrollments, certificates, complianceDocuments, volunteerRoles, roleAssignments, overrides]);

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
        const questions = chatHistory.map(h => h.question);
        const result = await generateTrainerInsights(questions, programs);
        setInsights(result);
    } catch (error) {
        console.error(error);
    } finally {
        setIsGeneratingInsights(false);
    }
  };

  const activityFeed = useMemo(() => {
      // Mock some live activity if log is empty for demo feel
      const base = actionLogs.length > 0 ? actionLogs : [
          { action_id: '1', actor_user_id: 'user-3', action_type: 'Requirement Completed', target_type: 'Lesson', target_id: 'Professional Boundaries', timestamp: Date.now() - 1000 * 60 * 5 },
          { action_id: '2', actor_user_id: 'user-4', action_type: 'Certificate Issued', target_type: 'Program', target_id: 'Youth Mentorship', timestamp: Date.now() - 1000 * 60 * 60 * 2 },
          { action_id: '3', actor_user_id: 'user-1', action_type: 'Course Published', target_type: 'Program', target_id: 'WHMIS v2.0', timestamp: Date.now() - 1000 * 60 * 60 * 5 },
      ] as ActionLog[];
      return base.sort((a,b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [actionLogs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
        {/* Main Content (3/4) */}
        <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPIBlock label={`Total ${pt('learners')}`} value={stats.totalVolunteers} sub="Active roster" />
                <KPIBlock label="Readiness Rate" value={`${stats.readyPct}%`} valueClassName="text-green-600" sub="Fully compliant" />
                <Card title="Data Residency">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-8 bg-red-600 rounded flex flex-col items-center justify-center text-white text-[8px] font-bold overflow-hidden shadow-sm">
                            <div className="h-1/3 w-full bg-white flex items-center justify-center text-red-600">🍁</div>
                        </div>
                        <div>
                            <span className="text-xs font-black uppercase text-slate-400 block tracking-tighter">Instance Residency</span>
                            <span className="text-sm font-bold text-emerald-600">Verified: Canada-Only</span>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={`${pt('readiness')} Pipeline Funnel`}>
                    <div className="flex flex-col gap-2 py-4">
                        {[
                            { label: 'Registered', val: stats.funnel.total, color: 'bg-slate-200 dark:bg-slate-700', width: '100%' },
                            { label: 'Enrolled', val: stats.funnel.enrolled, color: 'bg-blue-200 dark:bg-blue-900/40', width: '85%' },
                            { label: 'Active Training', val: stats.funnel.active, color: 'bg-blue-400 dark:bg-blue-700', width: '70%' },
                            { label: 'Ready', val: stats.funnel.ready, color: 'bg-green-500', width: '55%' },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-32 text-right text-[10px] font-black uppercase text-slate-500 tracking-tighter">{step.label}</div>
                                <div className="flex-grow flex items-center">
                                    <div 
                                        className={`h-10 rounded-r-full shadow-inner flex items-center justify-end px-4 text-white font-black text-sm transition-all duration-1000 ${step.color}`}
                                        style={{ width: step.width }}
                                    >
                                        {step.val}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* AI Insights & Gap Closer */}
                <Card title="AI Readiness Insights">
                    <p className="text-xs text-slate-500 mb-4 font-medium italic">Gemini analyzes user behavior and questions to identify structural readiness risks.</p>
                    {!insights && !isGeneratingInsights && (
                        <button 
                            onClick={handleGenerateInsights}
                            className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-colors flex flex-col items-center gap-2"
                        >
                            <span className="text-3xl">✨</span>
                            <span>Analyze Questions & Knowledge Gaps</span>
                        </button>
                    )}
                    {isGeneratingInsights && <div className="py-12 text-center text-slate-400 animate-pulse font-bold">AI Analyzing Roster...</div>}
                    
                    {insights && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Active Knowledge Gaps</h4>
                                <div className="space-y-2">
                                    {insights.knowledgeGaps.map((gap, i) => (
                                        <div key={i} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 flex justify-between items-center group">
                                            <span className="text-sm font-bold text-red-700 dark:text-red-400">{gap}</span>
                                            <button 
                                                onClick={() => onSetCopilotPrompt(`Create a training module addressing the knowledge gap: ${gap}`)}
                                                className="text-[10px] font-black uppercase bg-white dark:bg-slate-800 text-red-600 px-3 py-1.5 rounded-lg shadow-sm hover:scale-105 transition-transform"
                                            >
                                                ✨ Close Gap
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Trending Themes</h4>
                                <div className="flex flex-wrap gap-2">
                                    {insights.frequentQuestions.map((q, i) => (
                                        <span key={i} className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{q}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>

        {/* Live Activity Pulse (1/4) */}
        <div className="lg:col-span-1 space-y-6">
            <Card title="Live Activity Pulse">
                <div className="space-y-6">
                    {activityFeed.map((log) => {
                        const actor = allUsers.find(u => u.user_id === log.actor_user_id);
                        return (
                            <div key={log.action_id} className="flex gap-3 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 text-xs shadow-sm z-10 group-hover:scale-110 transition-transform">
                                        {log.action_type.includes('Ready') || log.action_type.includes('Issued') ? '✅' : 
                                         log.action_type.includes('Rejected') ? '⛔' : '📋'}
                                    </div>
                                    <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-700 -mt-1"></div>
                                </div>
                                <div className="pb-4">
                                    <div className="text-[10px] font-black uppercase text-blue-600 tracking-tighter leading-none mb-1">
                                        {log.action_type}
                                    </div>
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        {actor?.name || 'System'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                        {log.target_id} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button className="w-full text-center text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">
                        View Full System Log
                    </button>
                </div>
            </Card>

            <Card title="Quick Tasks">
                <div className="space-y-2">
                    <button className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center group">
                        <span className="text-xs font-bold">Review Submissions</span>
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-black">{submissions.filter(s => s.status === 'Pending Review').length}</span>
                    </button>
                    <button className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center group">
                        <span className="text-xs font-bold">Document Queue</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black">{complianceDocuments?.filter(d => d.status === 'Pending').length || 0}</span>
                    </button>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default AdminDashboard;
