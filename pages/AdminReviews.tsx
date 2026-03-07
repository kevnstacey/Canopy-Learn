
import React from 'react';
import Card from '../components/Card';
import { Submission, User, Program, AssessmentTemplate } from '../types';

interface AdminReviewsProps {
    submissions: Submission[];
    users: User[];
    programs: Program[];
    assessmentTemplates: AssessmentTemplate[];
    onReviewSubmission: (submission: Submission) => void;
}

const AdminReviews: React.FC<AdminReviewsProps> = ({ submissions, users, programs, assessmentTemplates, onReviewSubmission }) => {
    const pendingSubmissions = submissions.filter(s => s.status === 'Pending Review');

    return (
        <Card title="Practical Submissions Queue">
            {pendingSubmissions.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <p>No submissions pending review.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400">Learner</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400">Assessment</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400">Drift Risk</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400">Submitted</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {pendingSubmissions.map(sub => {
                                const trainee = users.find(u => u.user_id === sub.user_id);
                                const template = assessmentTemplates.find(t => t.assessment_template_id === sub.assessment_template_id);
                                const program = programs.find(p => p.program_id === template?.program_id);
                                
                                // Mock initial drift risk logic for UI demo
                                const hasHighDrift = sub.drift_flag?.severity === 'High';

                                return (
                                    <tr key={sub.submission_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={trainee?.profilePictureUrl} className="w-8 h-8 rounded-full shadow-sm" alt="" />
                                                <div className="font-bold text-slate-800 dark:text-slate-100">{trainee?.name || 'Unknown User'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-700 dark:text-slate-300">{template?.title}</div>
                                            <div className="text-[10px] text-slate-400 uppercase font-black">{program?.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {hasHighDrift ? (
                                                <div className="flex items-center gap-2 px-2 py-1 bg-red-100 text-red-700 rounded-lg border border-red-200 animate-pulse">
                                                    <span className="text-sm">⚠️</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Contradiction</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200">
                                                    <span className="text-sm">🛡️</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Grounded</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">{new Date(sub.submitted_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => onReviewSubmission(sub)} 
                                                className="bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-md group-hover:scale-105 active:scale-95"
                                            >
                                                Verify
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default AdminReviews;
