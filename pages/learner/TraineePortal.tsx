
import React, { useState, useEffect, useMemo } from 'react';
import LearnerCourses from './LearnerCourses';
import LearnerCertificates from './LearnerCertificates';
import LearnerDocuments from './LearnerDocuments';
import LearnerOnboarding from './LearnerOnboarding';
import LearnerNotifications from './LearnerNotifications';
import LearnerSettings from './LearnerSettings';
import ArenaDashboard from './ArenaDashboard';
import OnboardingTour from '../../components/OnboardingTour';
import Card from '../../components/Card';
import ReadinessCard from '../../components/ReadinessCard';
import DailySprout from '../../components/player/DailySprout';
import { Program, Enrollment, Module, Lesson, Requirement, Submission, Certificate, QuizItem, User, AssessmentTemplate, CanopyContext, VolunteerRole, VolunteerRoleAssignment, Quiz, QuizAttempt, ComplianceDocument, OnboardingChecklist, OnboardingProgress, NotificationLog, NotificationPreference, Override, SproutQuestion, UserSproutStats } from '../../types';
import { ORGANIZATION } from '../../data';
import { useTranslation } from '../../contexts/LanguageContext';
import { usePersona } from '../../contexts/PersonaContext';
import { computeReadiness } from '../../services/lmsService';
import { generateDailySprout } from '../../services/geminiService';
import useLocalStorage from '../../hooks/useLocalStorage';

interface TraineePortalProps {
  user: User;
  enrollments: Enrollment[];
  programs: Program[];
  modules: Module[];
  lessons: Lesson[];
  requirements: Requirement[];
  assessmentTemplates: AssessmentTemplate[];
  submissions: Submission[];
  certificates: Certificate[];
  volunteerRoles?: VolunteerRole[];
  roleAssignments?: VolunteerRoleAssignment[];
  overrides?: Override[];
  integrationContext?: CanopyContext | null;
  onReturnToCanopy?: () => void;
  openLesson: (lessonId: string) => void;
  onMarkLessonComplete: (lessonId: string) => void;
  startQuiz: (quiz: { lessonId: string; items: QuizItem[] }) => void;
  onVideoUpload: (templateId: string, file: File) => void;
  onEnroll: (programId: string) => void;
  quizzes?: Quiz[];
  quizAttempts?: QuizAttempt[];
  onSaveQuizAttempt?: (attempt: QuizAttempt) => void;
  complianceDocuments?: ComplianceDocument[];
  onUploadDocument?: (doc: ComplianceDocument) => void;
  onboardingChecklists?: OnboardingChecklist[];
  onboardingProgress?: OnboardingProgress[];
  onUpdateOnboardingProgress?: (userId: string, checklistId: string, stepId: string) => void;
  notifications?: NotificationLog[];
  notificationPreferences?: NotificationPreference;
  onMarkNotificationRead?: (logId?: string) => void;
  onUpdateNotificationPreferences?: (prefs: NotificationPreference) => void;
  requestedTab?: string;
}

export type LearnerSubTab = 'Dashboard' | 'Arena' | 'Onboarding' | 'Courses' | 'Documents' | 'Certificates' | 'Notifications' | 'Settings';

const TraineePortal: React.FC<TraineePortalProps> = (props) => {
    const [activeSubTab, setActiveSubTab] = useState<LearnerSubTab>('Dashboard');
    const [showTour, setShowTour] = useState(false);
    const { t } = useTranslation();
    const { pt, persona } = usePersona();

    const [sproutStats, setSproutStats] = useLocalStorage<UserSproutStats>(`sprout_stats_${props.user.user_id}`, { userId: props.user.user_id, memory_strength: 100, last_sprout_date: 0, total_sprouts_completed: 0 });
    const [activeSprout, setActiveSprout] = useState<SproutQuestion | null>(null);
    const [isGeneratingSprout, setIsGeneratingSprout] = useState(false);

    useEffect(() => {
        if (props.integrationContext) {
            setActiveSubTab('Courses');
        } else if (props.requestedTab) {
            setActiveSubTab(props.requestedTab as LearnerSubTab);
        }
    }, [props.integrationContext, props.requestedTab]);

    const handleCloseTour = () => {
        setShowTour(false);
        sessionStorage.setItem('onboarding_seen', 'true');
    };

    const readiness = computeReadiness(props.user.user_id, ORGANIZATION.id, {
        enrollments: props.enrollments,
        certificates: props.certificates,
        submissions: props.submissions,
        complianceDocuments: props.complianceDocuments || [],
        roles: props.volunteerRoles || [],
        assignments: props.roleAssignments || [],
        overrides: props.overrides || []
    });

    const completedLessonIds = useMemo(() => {
        const ids: string[] = [];
        props.enrollments.forEach(enr => {
            const progReqs = props.requirements.filter(r => r.program_id === enr.program_id && r.type === 'lesson_view');
            progReqs.forEach(req => {
                if (enr.completed_requirements.includes(req.requirement_id)) {
                    ids.push(req.reference_id);
                }
            });
        });
        return ids;
    }, [props.enrollments, props.requirements]);

    const completedLessonsData = useMemo(() => props.lessons.filter(l => completedLessonIds.includes(l.lesson_id)), [props.lessons, completedLessonIds]);

    const handleStartSprout = async () => {
        if (completedLessonsData.length === 0) return alert("Complete a lesson to unlock Sprouts!");
        setIsGeneratingSprout(true);
        try {
            const q = await generateDailySprout(completedLessonsData);
            setActiveSprout(q);
        } catch (e) {
            alert("System offline.");
        } finally {
            setIsGeneratingSprout(false);
        }
    };

    const handleSproutComplete = (correct: boolean) => {
        setSproutStats(prev => ({
            ...prev,
            memory_strength: Math.min(100, prev.memory_strength + (correct ? 10 : -5)),
            last_sprout_date: Date.now(),
            total_sprouts_completed: prev.total_sprouts_completed + 1
        }));
        setActiveSprout(null);
    };

    const renderDashboard = () => {
        const totalEnrollments = props.enrollments.length;
        const completedEnrollments = props.enrollments.filter(e => e.status === 'Completed').length;
        const onboardingPct = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
        const isSproutDoneToday = new Date(sproutStats.last_sprout_date).toDateString() === new Date().toDateString();

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <ReadinessCard readiness={readiness} onAction={(tab, id) => setActiveSubTab(tab as LearnerSubTab)} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                         <div className={`p-5 md:p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${isSproutDoneToday ? 'bg-slate-50 border-slate-100 opacity-80' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800 shadow-lg'}`}>
                             <div>
                                <div className="flex justify-between items-start mb-4">
                                     <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm">🌱</div>
                                     <div className="text-right">
                                         <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Memory</span>
                                         <span className={`text-lg md:text-xl font-black ${sproutStats.memory_strength > 70 ? 'text-emerald-600' : 'text-orange-500'}`}>{sproutStats.memory_strength}%</span>
                                     </div>
                                </div>
                                <h3 className="text-base md:text-lg font-black italic tracking-tight text-slate-800 dark:text-white leading-none mb-2">Canopy Sprout</h3>
                                <p className="text-[11px] md:text-xs text-slate-500 font-medium mb-6">
                                    {isSproutDoneToday ? "Memory remains strong!" : "Knowledge is decaying. Refresh now!"}
                                </p>
                             </div>
                             <button 
                                onClick={handleStartSprout}
                                disabled={isSproutDoneToday || isGeneratingSprout}
                                className={`w-full py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-md transition-all ${
                                    isSproutDoneToday ? 'bg-white text-slate-300 border' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                             >
                                 {isGeneratingSprout ? '...' : isSproutDoneToday ? 'Done for Today' : 'Water My Knowledge'}
                             </button>
                         </div>

                        <Card title={`${pt('learner')} Integration`}>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="flex-grow bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                                    <div style={{ width: `${onboardingPct}%`, backgroundColor: persona.accentColor }} className="h-3 rounded-full transition-all duration-500"></div>
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200">{onboardingPct}%</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mb-4">{completedEnrollments} of {totalEnrollments} completed</p>
                            {onboardingPct < 100 && (
                                <button onClick={() => setActiveSubTab('Onboarding')} className="text-blue-600 font-bold text-[10px] hover:underline uppercase tracking-wider">
                                    Complete Profile &rarr;
                                </button>
                            )}
                        </Card>
                    </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                    <Card title="Achiever's Road">
                         <div className="relative pt-4 pb-2">
                             <div className="flex justify-between items-end mb-4">
                                 <div className="text-center">
                                     <span className="text-lg opacity-50 grayscale">🐣</span>
                                     <p className="text-[7px] font-black text-slate-400 mt-1 uppercase">Start</p>
                                 </div>
                                 <div className="text-center">
                                     <span className="text-2xl animate-bounce-short inline-block">🚀</span>
                                     <p className="text-[7px] font-black text-blue-600 mt-1 uppercase">Active</p>
                                 </div>
                                 <div className="text-center">
                                     <span className="text-lg opacity-50 grayscale">👑</span>
                                     <p className="text-[7px] font-black text-slate-400 mt-1 uppercase">Elite</p>
                                 </div>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                 <div className="w-[45%] h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                             </div>
                         </div>
                    </Card>

                    <Card title="Roster Role(s)">
                         <div className="space-y-2">
                            {readiness.role_statuses.map(rs => (
                                <div key={rs.role_id} className={`px-4 py-3 rounded-xl border flex justify-between items-center ${rs.status === 'Ready' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                                    <span className="font-bold text-sm">{rs.role_title}</span>
                                    <span className="text-[9px] font-black uppercase">{rs.status}</span>
                                </div>
                            ))}
                            {readiness.role_statuses.length === 0 && <p className="text-xs text-slate-500 italic">No roles assigned.</p>}
                         </div>
                    </Card>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-[calc(100vh-100px)]">
            {showTour && <OnboardingTour onClose={handleCloseTour} />}
            {activeSprout && <DailySprout question={activeSprout} onClose={() => setActiveSprout(null)} onComplete={handleSproutComplete} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="px-1">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{pt('learner')} Portal</h2>
                    <p className="text-slate-500 text-xs md:text-sm font-medium">{ORGANIZATION.name}</p>
                </div>
                {!props.integrationContext && (
                    <button onClick={() => setShowTour(true)} className="w-full md:w-auto text-[10px] bg-slate-200 dark:bg-slate-700 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-black uppercase tracking-wide">
                        Quick Help
                    </button>
                )}
            </div>

             <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide px-1" aria-label="Tabs">
                    {(['Dashboard', 'Arena', 'Onboarding', 'Courses', 'Documents', 'Certificates', 'Notifications', 'Settings'] as LearnerSubTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveSubTab(tab)}
                            className={`${activeSubTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}
                            whitespace-nowrap py-4 px-1 border-b-2 font-bold text-[13px] md:text-sm transition-all`}
                        >
                            {tab === 'Dashboard' ? t('Dashboard') : tab === 'Courses' ? pt('programs') : tab === 'Onboarding' ? 'Progress' : t(tab)}
                        </button>
                    ))}
                </nav>
            </div>
            {activeSubTab === 'Dashboard' && renderDashboard()}
            {activeSubTab === 'Arena' && <ArenaDashboard />}
            {activeSubTab === 'Courses' && <LearnerCourses {...props} onEnroll={props.onEnroll} onMarkLessonComplete={props.onMarkLessonComplete} quizzes={props.quizzes} quizAttempts={props.quizAttempts} onSaveQuizAttempt={props.onSaveQuizAttempt} />}
            {activeSubTab === 'Onboarding' && <LearnerOnboarding user={props.user} checklists={props.onboardingChecklists || []} progress={props.onboardingProgress || []} roleAssignments={props.roleAssignments || []} roles={props.volunteerRoles || []} enrollments={props.enrollments} documents={props.complianceDocuments || []} onUpdateProgress={props.onUpdateOnboardingProgress || (() => {})} onNavigate={(tab) => setActiveSubTab(tab as LearnerSubTab)} />}
            {activeSubTab === 'Documents' && <LearnerDocuments documents={props.complianceDocuments || []} user={props.user} onUpload={props.onUploadDocument || (() => {})} />}
            {activeSubTab === 'Certificates' && <LearnerCertificates certificates={props.certificates} programs={props.programs} />}
            {activeSubTab === 'Notifications' && <LearnerNotifications notifications={props.notifications || []} onMarkRead={props.onMarkNotificationRead || (() => {})} />}
            {activeSubTab === 'Settings' && <LearnerSettings preferences={props.notificationPreferences || { user_id: props.user.user_id, email_enabled: true, sms_enabled: false, push_enabled: true }} onUpdatePreferences={props.onUpdateNotificationPreferences || (() => {})} />}
        </div>
    );
};

export default TraineePortal;
