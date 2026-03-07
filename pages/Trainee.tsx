
import React, { useState, useRef, useMemo } from 'react';
import Card from '../components/Card';
import { ASSESSMENT_TEMPLATES, BADGES, MOCK_TRAINEE_PROGRESS } from '../data';
import { generateQuiz } from '../services/geminiService';
import { Program, Enrollment, Module, Lesson, Requirement, Submission, Certificate, QuizItem, User, CanopyContext } from '../types';

interface TraineeProps {
  user: User;
  enrollments: Enrollment[];
  programs: Program[];
  modules: Module[];
  lessons: Lesson[];
  requirements: Requirement[];
  submissions: Submission[];
  certificates: Certificate[];
  integrationContext?: CanopyContext | null; 
  openLesson: (lessonId: string) => void;
  startQuiz: (lessonId: string, items: QuizItem[]) => void;
  onVideoUpload: (templateId: string, file: File) => void;
  onReturnToCanopy?: () => void; 
}

const CheckmarkIcon = () => <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>;
const PendingIcon = () => <div className="h-6 w-6 rounded-full border-2 border-slate-300" />;

const PracticalUpload: React.FC<{ requirement: Requirement, submission?: Submission, onUpload: (templateId: string, file: File) => void }> = ({ requirement, submission, onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const template = ASSESSMENT_TEMPLATES.find(t => t.assessment_template_id === requirement.reference_id);
    
    if (!template) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) onUpload(template.assessment_template_id, file);
    };

    const handleCertnSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => {
            // Simulate receiving a "file" or result from the API
            const dummyFile = new File(["verified"], "certn_result.pdf", { type: "application/pdf" });
            onUpload(template.assessment_template_id, dummyFile);
            setIsSimulating(false);
        }, 2500);
    };

    const isApproved = submission?.status === 'Approved';
    const isPending = submission?.status === 'Pending Review';
    const isBackgroundCheck = template.title.includes('Background') || template.title.includes('Criminal');

    return (
        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm mb-2">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    {isApproved ? <CheckmarkIcon /> : (isPending ? <div className="h-6 w-6 rounded-full bg-yellow-100 border-yellow-200 border-2" /> : <PendingIcon />)}
                    <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            {template.title}
                            {isBackgroundCheck && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">Certn Integrated</span>}
                        </div>
                        <div className="text-xs text-slate-500">{template.instructions}</div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-2">
                <input type="file" accept={template.evidence_type === 'video' ? "video/*" : "image/*,application/pdf"} ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                
                {isPending && <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg self-center">Pending Review</span>}
                {isApproved && <span className="text-xs font-semibold bg-green-100 text-green-800 px-3 py-2 rounded-lg self-center">Verified</span>}
                
                {!isApproved && !isPending && (
                    <>
                        {isBackgroundCheck ? (
                            <button
                                onClick={handleCertnSimulation}
                                disabled={isSimulating}
                                className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all text-sm flex items-center gap-2 disabled:bg-slate-400"
                            >
                                {isSimulating ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Connecting to Certn...
                                    </>
                                ) : 'Initiate Background Check'}
                            </button>
                        ) : (
                            <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 active:scale-95 transition-all text-sm"
                            >
                                {submission?.status === 'Rejected' ? 'Retry Upload' : 'Upload Evidence'}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const Trainee: React.FC<TraineeProps> = ({ 
    user, enrollments, programs, modules, lessons, requirements, submissions, 
    integrationContext, openLesson, startQuiz, onVideoUpload, onReturnToCanopy
}) => {
    const [generatingQuizId, setGeneratingQuizId] = useState<string | null>(null);

    // Mock progress data for the current user
    const userProgress = useMemo(() => 
        MOCK_TRAINEE_PROGRESS.find(p => p.userId === user.user_id) || { points: 0, streakDays: 0, badges: [] }, 
    [user]);

    const userBadges = useMemo(() => 
        BADGES.filter(b => userProgress.badges.includes(b.id)), 
    [userProgress]);

    const handleGenerateQuiz = async (lesson: Lesson) => {
        setGeneratingQuizId(lesson.lesson_id);
        try {
            const quizItems = await generateQuiz(lesson);
            startQuiz(lesson.lesson_id, quizItems);
        } catch (error) {
            alert((error as Error).message || "An unexpected error occurred.");
        } finally {
            setGeneratingQuizId(null);
        }
    };
    
    // Filter programs: If integration context exists, show ONLY the required program
    let displayedPrograms = programs.filter(p => enrollments.some(e => e.program_id === p.program_id));
    if (integrationContext) {
        displayedPrograms = programs.filter(p => p.program_id === integrationContext.requiredProgramId);
    }
    
    // Sticky bottom bar logic
    const showStickyBar = !!integrationContext;

    return (
        <section className={`space-y-6 ${showStickyBar ? 'pb-24' : ''}`}>
              
              {/* --- GAMIFICATION HEADER --- */}
              {!integrationContext && (
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                      {/* Decorative Circles */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                          <div>
                              <h2 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h2>
                              <p className="text-slate-300 text-sm">You're on a roll. Keep it up!</p>
                          </div>
                          <div className="flex gap-4">
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center min-w-[80px]">
                                  <span className="text-2xl">🔥</span>
                                  <span className="font-bold text-lg">{userProgress.streakDays}</span>
                                  <span className="text-[10px] uppercase tracking-wider opacity-70">Day Streak</span>
                              </div>
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center min-w-[80px]">
                                  <span className="text-2xl">⚡</span>
                                  <span className="font-bold text-lg">{userProgress.points}</span>
                                  <span className="text-[10px] uppercase tracking-wider opacity-70">Points</span>
                              </div>
                          </div>
                      </div>

                      {/* Badges Preview */}
                      {userBadges.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-white/10">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Recent Badges</p>
                              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                  {userBadges.map(badge => (
                                      <div key={badge.id} className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600/50 flex-shrink-0">
                                          <span className="text-lg">{badge.icon}</span>
                                          <span className="text-sm font-medium">{badge.name}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* --- INTEGRATION HEADER --- */}
              {integrationContext && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 mb-6 rounded-r-lg shadow-sm">
                      <div>
                          <h4 className="font-bold text-orange-800 dark:text-orange-200">Action Required: {integrationContext.intent}</h4>
                          <p className="text-sm text-orange-700 dark:text-orange-300">Complete the training below to unlock this opportunity in Canopy.</p>
                      </div>
                  </div>
              )}

              {displayedPrograms.length === 0 && <p className="text-slate-500 text-center py-10">You're all caught up! No active training programs.</p>}
              
              {displayedPrograms.map(prog => {
                  const enrollment = enrollments.find(e => e.program_id === prog.program_id);
                  const progModules = modules.filter(m => m.program_id === prog.program_id).sort((a,b) => a.order - b.order);
                  const progReqs = requirements.filter(r => r.program_id === prog.program_id);
                  
                  // Calculate Progress
                  const totalReqs = progReqs.filter(r => r.contributes_to_readiness).length;
                  const completedReqs = enrollment ? enrollment.completed_requirements.filter(cr => progReqs.some(pr => pr.requirement_id === cr && pr.contributes_to_readiness)).length : 0;
                  const progress = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;
                  const isReady = progress === 100;

                  return (
                    <div key={prog.program_id}>
                         {/* Program Header Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-6 overflow-hidden relative">
                             {/* Celebration Banner if Ready */}
                             {isReady && (
                                 <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-8 py-1 rotate-45 translate-x-8 translate-y-3 shadow-sm">
                                     CERTIFIED
                                 </div>
                             )}
                             
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{prog.title}</h2>
                                        {isReady && <span className="text-xl">🏆</span>}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{prog.description}</p>
                                    {isReady && <p className="text-green-600 font-semibold text-sm mt-2">Congratulations! You have completed this program.</p>}
                                </div>
                                <div className="text-right">
                                     <span className={`block text-2xl font-bold ${isReady ? 'text-green-600' : 'text-hh-red'}`}>{progress}%</span>
                                     <span className="text-xs text-slate-500 uppercase">Complete</span>
                                </div>
                             </div>
                             <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                                  <div className={`${isReady ? 'bg-green-500' : 'bg-hh-red'} h-3 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                             </div>
                        </div>
                      
                      <div className="space-y-6">
                          {progModules.map(mod => {
                              const modLessons = lessons.filter(l => l.module_id === mod.module_id);
                              
                              return (
                                  <div key={mod.module_id}>
                                      <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-3 ml-1">{mod.title}</h3>
                                      <div className="space-y-3">
                                          {modLessons.map(less => {
                                              const viewReq = progReqs.find(r => r.type === 'lesson_view' && r.reference_id === less.lesson_id);
                                              const isViewed = viewReq && enrollment?.completed_requirements.includes(viewReq.requirement_id);
                                              
                                              return (
                                                  <div 
                                                    key={less.lesson_id} 
                                                    onClick={() => openLesson(less.lesson_id)}
                                                    className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm flex justify-between items-center cursor-pointer active:scale-[0.99] transition-transform"
                                                  >
                                                      <div className="flex items-center gap-3">
                                                          {isViewed ? <CheckmarkIcon /> : <PendingIcon />}
                                                          <div>
                                                              <div className="font-semibold text-slate-800 dark:text-slate-100">{less.title}</div>
                                                              <div className="text-xs text-slate-500">{less.estimated_minutes} min read</div>
                                                          </div>
                                                      </div>
                                                      <div className="text-slate-400">
                                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                                      </div>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  </div>
                              );
                          })}

                          {/* Knowledge Checks */}
                          {(progReqs.filter(r => r.type === 'quiz_pass').length > 0) && (
                              <div className="mt-6">
                                  <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-3 ml-1">Knowledge Checks</h3>
                                  <div className="space-y-3">
                                      {progReqs.filter(r => r.type === 'quiz_pass').map(req => {
                                          const isPassed = enrollment?.completed_requirements.includes(req.requirement_id);
                                          // Simple logic: pick first lesson in program as context if specific reference missing
                                          const contextLesson = lessons.find(l => progModules.some(m => m.module_id === l.module_id));

                                          return (
                                              <div 
                                                key={req.requirement_id} 
                                                onClick={() => !isPassed && contextLesson && handleGenerateQuiz(contextLesson)}
                                                className={`bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm flex justify-between items-center ${!isPassed ? 'cursor-pointer active:scale-[0.99]' : ''} transition-transform`}
                                              >
                                                  <div className="flex items-center gap-3">
                                                      {isPassed ? <CheckmarkIcon /> : <PendingIcon />}
                                                      <div>
                                                          <div className="font-semibold text-slate-800 dark:text-slate-100">{req.description}</div>
                                                          <div className="text-xs text-slate-500">{isPassed ? 'Passed' : 'Quiz • 3 Questions'}</div>
                                                      </div>
                                                  </div>
                                                  {!isPassed && (
                                                      <button className="text-xs bg-hh-red text-white px-3 py-1.5 rounded-full font-bold">
                                                          {generatingQuizId ? '...' : 'Start'}
                                                      </button>
                                                  )}
                                              </div>
                                          );
                                      })}
                                  </div>
                              </div>
                          )}

                          {/* Assessments */}
                          {(progReqs.filter(r => r.type === 'practical_submit' || r.type === 'compliance_upload').length > 0) && (
                              <div className="mt-6">
                                  <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-3 ml-1">Required Evidence</h3>
                                  <div className="space-y-2">
                                    {progReqs.filter(r => r.type === 'practical_submit' || r.type === 'compliance_upload').map(req => {
                                        const sub = submissions.find(s => s.assessment_template_id === req.reference_id && s.user_id === user.user_id);
                                        return <PracticalUpload key={req.requirement_id} requirement={req} submission={sub} onUpload={onVideoUpload} />;
                                    })}
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Sticky Action Bar for Integration */}
                      {integrationContext && isReady && (
                          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                               <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                                   <div className="hidden sm:block">
                                        <p className="font-bold text-green-700 dark:text-green-400">You are ready!</p>
                                        <p className="text-xs text-slate-500">Return to Canopy to claim your shift.</p>
                                   </div>
                                   <button 
                                        onClick={onReturnToCanopy}
                                        className="w-full sm:w-auto flex-grow bg-green-600 text-white font-bold text-lg py-3 px-8 rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all animate-pulse"
                                    >
                                        Return to Canopy
                                   </button>
                               </div>
                          </div>
                      )}
                    </div>
                  );
              })}
        </section>
    );
};

export default Trainee;
