
import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { Submission, VideoAnalysis, AssessmentTemplate, DriftFlag } from '../../types';
import { analyzePracticalVideo, detectDrift } from '../../services/geminiService';
import { USERS } from '../../data';
import { useTranslation } from '../../contexts/LanguageContext';

interface SubmissionReviewModalProps {
  submission: Submission;
  templates?: AssessmentTemplate[];
  onClose: () => void;
  onReview: (submissionId: string, status: 'Approved' | 'Rejected', notes: string, drift?: DriftFlag) => void;
}

const SubmissionReviewModal: React.FC<SubmissionReviewModalProps> = ({ submission, templates, onClose, onReview }) => {
    const { t } = useTranslation();
    const [analysis, setAnalysis] = useState<VideoAnalysis | null>(submission.ai_analysis || null);
    const [isLoading, setIsLoading] = useState(!submission.ai_analysis);
    const [isDetectingDrift, setIsDetectingDrift] = useState(false);
    const [notes, setNotes] = useState('');

    const trainee = USERS.find(u => u.user_id === submission.user_id);
    const template = templates ? templates.find(t => t.assessment_template_id === submission.assessment_template_id) : undefined;

    useEffect(() => {
        if (submission.ai_analysis) return;
        
        const fetchAnalysis = async () => {
            setIsLoading(true);
            try {
                const result = await analyzePracticalVideo(submission.artifact_data, template?.rubric);
                setAnalysis(result);
            } catch (error) {
                console.error("Failed to get analysis:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalysis();
    }, [submission, template]);

    const handleFinalizeReview = async (status: 'Approved' | 'Rejected') => {
        if (status === 'Rejected' && !notes) return alert("Please provide rejection notes.");
        
        let drift: DriftFlag | undefined = undefined;
        
        if (analysis) {
            setIsDetectingDrift(true);
            try {
                const detected = await detectDrift(analysis, status, notes, template?.rubric || "Standard Protocol");
                if (detected) drift = detected;
            } catch (e) {
                console.error("Drift check failed");
            } finally {
                setIsDetectingDrift(false);
            }
        }

        onReview(submission.submission_id, status, notes, drift);
        onClose();
    };

    return (
        <BaseModal title={t('Reviews')} onClose={onClose}>
            <div className="flex flex-col gap-6">
                
                {/* Header Info */}
                <div className="flex justify-between items-start bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <div>
                        <h3 className="font-bold text-lg">{template?.title || 'Practical Assessment'}</h3>
                        <p className="text-sm text-slate-500">Learner: <span className="font-medium text-slate-900 dark:text-slate-200">{trainee?.name}</span></p>
                        <p className="text-xs text-slate-400">Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right max-w-xs">
                        <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Instructions</p>
                        <p className="text-sm italic text-slate-600 dark:text-slate-300">{template?.instructions || 'No specific instructions.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Evidence & Rubric */}
                    <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                             <span>Evidence</span>
                        </h4>
                        
                        {submission.artifact_data ? (
                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center overflow-hidden border border-slate-700 mb-4">
                                <img 
                                    src={`data:${submission.media_type || 'image/jpeg'};base64,${submission.artifact_data}`} 
                                    alt="Submission Evidence" 
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-slate-500 mb-4 border border-slate-700">
                                 <div className="text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-sm">Video Preview Unavailable</span>
                                 </div>
                            </div>
                        )}

                        {template?.rubric && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-800">
                                <span className="font-bold block mb-1">Rubric Criteria:</span>
                                {template.rubric}
                            </div>
                        )}
                    </div>

                    {/* Right: AI Analysis */}
                    <div>
                         <h4 className="font-bold mb-2 flex items-center gap-2">
                             <span>Sentinel AI Analysis</span>
                             <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Gemini Proctor</span>
                        </h4>
                        {isLoading ? (
                            <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
                                <svg className="animate-spin h-6 w-6 text-hh-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span className="text-xs font-black uppercase tracking-widest animate-pulse">Running Proctor Scan...</span>
                            </div>
                        ) : analysis ? (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm h-full overflow-y-auto max-h-[400px]">
                                <div className={`mb-4 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-center border ${analysis.checklist.every(i => i.passed) ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                    AI Verdict: {analysis.checklist.every(i => i.passed) ? 'PROVISIONALLY COMPLIANT' : 'FAILURE DETECTED'}
                                </div>
                                <p className="text-sm mb-4 font-medium italic">"{analysis.summary}"</p>
                                <ul className="space-y-3">
                                    {analysis.checklist.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <span className={`mt-0.5 ${item.passed ? "text-green-500" : "text-red-500"}`}>{item.passed ? '✔' : '✖'}</span>
                                            <div className="flex-1">
                                                <span className={item.passed ? "text-slate-700 dark:text-slate-300 font-medium" : "text-red-600 dark:text-red-300 font-bold"}>{item.step}</span>
                                                {!item.passed && item.reason && <p className="text-xs text-red-500 mt-1 pl-2 border-l-2 border-red-200">{item.reason}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-red-500">Analysis unavailable.</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Reviewer Feedback</label>
                        {isDetectingDrift && (
                             <span className="text-[10px] font-black text-blue-600 animate-pulse uppercase tracking-widest">
                                 Sentinel: Checking Decision Alignment...
                             </span>
                        )}
                    </div>
                    <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        placeholder="Provide feedback to the learner. Your decision will be cross-referenced with the AI proctor for drift detection." 
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                         <button 
                            onClick={() => handleFinalizeReview('Rejected')} 
                            disabled={!notes || isDetectingDrift} 
                            className="bg-red-100 text-red-700 border border-red-200 font-semibold py-3 px-8 rounded-xl hover:bg-red-200 disabled:opacity-50 transition-all active:scale-95"
                         >
                             {t('Rejected')}
                         </button>
                        <button 
                            onClick={() => handleFinalizeReview('Approved')} 
                            disabled={isDetectingDrift}
                            className="bg-green-600 text-white font-black uppercase tracking-widest text-xs py-3 px-8 rounded-xl hover:bg-green-700 shadow-lg transition-all active:scale-95"
                        >
                            {t('Approved')}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default SubmissionReviewModal;
