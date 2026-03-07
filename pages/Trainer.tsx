
import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import Sparkline from '../components/Sparkline';
import { User, Program, Lesson, Enrollment, Submission, ChatHistoryItem, TrainerInsight } from '../types';
import { generateTrainerInsights } from '../services/geminiService';

interface TrainerProps {
  currentUser: User;
  team: User[];
  enrollments: Enrollment[];
  submissions: Submission[];
  programs: Program[];
  lessons: Lesson[];
  chatHistory: ChatHistoryItem[];
  onReviewSubmission: (submission: Submission) => void;
  onSetCopilotPrompt: (prompt: string) => void;
}

const Trainer: React.FC<TrainerProps> = ({ 
    currentUser, team, enrollments, submissions, programs, lessons, 
    chatHistory, onReviewSubmission, onSetCopilotPrompt 
}) => {
  const [insights, setInsights] = useState<TrainerInsight | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const kpi = useMemo(() => {
    const totalTrainees = team.length;
    if (totalTrainees === 0) return { activeTrainees: 0, avgProgressPct: 0, overdue: 0, trend: [] };

    const activeEnrollments = enrollments.filter(e => team.some(t => t.user_id === e.user_id));
    const completed = activeEnrollments.filter(e => e.status === 'complete').length;
    const total = activeEnrollments.length || 1;
    
    // Readiness is rough % of completed enrollments vs total assigned
    const avgProgressPct = Math.round((completed / total) * 100);

    return {
        activeTrainees: totalTrainees,
        avgProgressPct,
        overdue: 0, // Simplified for demo
        trend: [10, 15, 12, 18, 20, 25, 22, 30, 28, 35] // Mock trend
    };
  }, [team, enrollments]);

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const questions = chatHistory.map(h => h.question);
      const result = await generateTrainerInsights(questions, programs);
      setInsights(result);
    } catch (error) {
      alert((error as Error).message || "An unexpected error occurred.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };
  
  const pendingSubmissions = submissions.filter(s => s.status === 'pending_review' && team.some(t => t.user_id === s.user_id));

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Readiness KPIs">
             <div className="grid grid-cols-2 gap-4">
                <div><div className="text-4xl font-bold">{kpi.activeTrainees}</div><div className="text-sm text-slate-500">Learners</div></div>
                <div><div className="text-4xl font-bold">{kpi.avgProgressPct}%</div><div className="text-sm text-slate-500">Readiness</div></div>
                <div><div className="text-4xl font-bold text-orange-500">{pendingSubmissions.length}</div><div className="text-sm text-slate-500">Pending Review</div></div>
             </div>
            <div className="mt-4">
                <div className="font-semibold text-sm mb-1">Certifications (Last 30d)</div>
                <Sparkline data={kpi.trend} className="text-hh-red" />
            </div>
        </Card>
        
        <Card title="Evidence Review">
          {pendingSubmissions.length > 0 ? (
            <div className="space-y-3">
              {pendingSubmissions.map(sub => {
                const trainee = team.find(u => u.user_id === sub.user_id);
                return (
                <div key={sub.submission_id} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{trainee?.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Practical Assessment</div>
                  </div>
                  <button onClick={() => onReviewSubmission(sub)} className="bg-blue-600 text-white font-semibold text-sm py-1 px-3 rounded-md hover:bg-blue-700">Verify</button>
                </div>
              )})}
            </div>
          ) : <p className="text-sm text-slate-500">No pending evidence to verify.</p>}
        </Card>

        <Card title="AI Insight: Knowledge Gaps">
          <p className="text-sm mb-4">Analyze learner questions to identify missing training content.</p>
          <button onClick={handleGenerateInsights} disabled={isGeneratingInsights || chatHistory.length === 0} className="w-full bg-hh-red text-white font-semibold py-2 px-4 rounded-lg hover:bg-hh-red-dark disabled:bg-slate-400">
            {isGeneratingInsights ? "Analyzing..." : `Analyze ${chatHistory.length} Questions`}
          </button>
          {insights && (
            <div className="mt-4 space-y-3">
              <div><h4 className="font-semibold">Frequent Themes</h4><ul className="list-disc list-inside text-sm">{insights.frequentQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul></div>
              <div><h4 className="font-semibold">Content Gaps</h4>
                <ul className="list-disc list-inside text-sm space-y-2">
                    {insights.knowledgeGaps.map((g, i) => 
                        <li key={i}>
                            <span>{g}</span>
                            <button onClick={() => onSetCopilotPrompt(`Create a new Lesson that addresses: ${g}`)} className="ml-2 text-xs text-blue-600 hover:underline">[Draft Content]</button>
                        </li>
                    )}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card title="Program Content">
            <p className="mb-4">Manage training content and assessments.</p>
            <div className="space-y-3">
                {programs.map((prog) => (
                    <div key={prog.program_id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex justify-between items-center gap-3">
                        <div>
                            <span className="font-semibold block">{prog.title}</span>
                            <span className="text-xs text-slate-500">{prog.departments.join(', ')}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${prog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                            {prog.status}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
      </div>
    </section>
  );
};

export default Trainer;
