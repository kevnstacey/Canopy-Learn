import React, { useState, useEffect } from 'react';
import LearnerCourses from './learner/LearnerCourses';
import LearnerCertificates from './LearnerCertificates';
import LearnerDocuments from './learner/LearnerDocuments';
import LearnerOnboarding from './learner/LearnerOnboarding';
import LearnerNotifications from './learner/LearnerNotifications';
import LearnerSettings from './learner/LearnerSettings';
import OnboardingTour from '../components/OnboardingTour';
import PlaceholderPage from '../components/PlaceholderPage';
import Card from '../components/Card';
import { Program, Enrollment, Module, Lesson, Requirement, Submission, Certificate, QuizItem, User, AssessmentTemplate, CanopyContext, VolunteerRole, VolunteerRoleAssignment, Quiz, QuizAttempt, ComplianceDocument, OnboardingChecklist, OnboardingProgress, NotificationLog, NotificationPreference, Override } from '../types';
import { MOCK_TRAINEE_PROGRESS, BADGES, ORGANIZATION } from '../data';
import { useTranslation } from '../contexts/LanguageContext';
import { computeReadiness } from '../services/lmsService';

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
  // Fix: Added overrides prop to match computeReadiness requirements
  overrides?: Override[];
  integrationContext?: CanopyContext | null;
  onReturnToCanopy?: () => void;
  openLesson: (lessonId: string) => void;
  onMarkLessonComplete: (lessonId: string) => void;
  startQuiz: (quiz: { lessonId: string; items: QuizItem[] }) => void;
  onVideoUpload: (templateId: string, file: File) => void;
  onEnroll: (programId: string) => void;
  // Quiz Props
  quizzes?: Quiz[];
  quizAttempts?: QuizAttempt[];
  onSaveQuizAttempt?: (attempt: QuizAttempt) => void;
  // Document Props
  complianceDocuments?: ComplianceDocument[];
  onUploadDocument?: (doc: ComplianceDocument) => void;
  // Onboarding Props
  onboardingChecklists?: OnboardingChecklist[];
  onboardingProgress?: OnboardingProgress[];
  onUpdateOnboardingProgress?: (userId: string, checklistId: string, stepId: string) => void;
  // Notification Props
  notifications?: NotificationLog[];
  notificationPreferences?: NotificationPreference;
  onMarkNotificationRead?: (logId?: string) => void;
  onUpdateNotificationPreferences?: (prefs: NotificationPreference) => void;
  requestedTab?: string;
}

export type LearnerSubTab = 'Dashboard' | 'Onboarding' | 'Courses' | 'Documents' | 'Certificates' | 'Notifications' | 'Settings';

const TraineePortal: React.FC<TraineePortalProps> = (props) => {
    const [activeSubTab, setActiveSubTab] = useState<LearnerSubTab>('Dashboard');
    const [showTour, setShowTour] = useState(false);
    const { t } = useTranslation();

    // Handle deep linking / external navigation requests
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

    // --- DASHBOARD CALCULATIONS ---
    const readiness = computeReadiness(props.user.user_id, ORGANIZATION.id, {
        enrollments: props.enrollments,
        certificates: props.certificates,
        submissions: props.submissions,
        complianceDocuments: props.complianceDocuments || [],
        roles: props.volunteerRoles || [],
        assignments: props.roleAssignments || [],
        // Fix: Pass overrides to computeReadiness
        overrides: props.overrides || []
    });

    const inProgressCourses = props.enrollments.filter(e => e.status === 'In Progress').map(e => {
        const program = props.programs.find(p => p.program_id === e.program_id);
        const progReqs = props.requirements.filter(r => r.program_id === e.program_id);
        const total = progReqs.length;
        const completed = e.completed_requirements.length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Find next lesson to resume
        const nextReq = progReqs.find(r => !e.completed_requirements.includes(r.requirement_id) && r.type === 'lesson_view');
        
        return {
            id: e.enrollment_id,
            programId: e.program_id,
            programTitle: program?.title || 'Unknown Program',
            progress: pct,
            nextLessonId: nextReq?.reference_id
        };
    });

    const expiringCertificates = props.certificates.filter(c => {
        if (!c.expires_at || c.status !== 'Active') return false;
        const daysUntil = (c.expires_at - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntil > 0 && daysUntil <= 90;
    });

    // Helper for Dashboard view
    const renderDashboard = () => {
        // Status config
        const statusConfig = {
            'Approved': { color: 'bg-green-100 text-green-800 border-green-200', icon: '✅', cta: 'View certificates', action: () => setActiveSubTab('Certificates') },
            'Pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳', cta: 'Continue Onboarding', action: () => setActiveSubTab('Onboarding') },
            'Expired': { color: 'bg-red-100 text-red-800 border-red-200', icon: '⚠️', cta: 'Complete requirements', action: () => setActiveSubTab('Courses') },
            'Missing': { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: '📋', cta: 'Start Onboarding', action: () => setActiveSubTab('Onboarding') },
        }[readiness.overall_status];

        // Overall progress for onboarding card
        const totalEnrollments = props.enrollments.length;
        const completedEnrollments = props.enrollments.filter(e => e.status === 'Completed').length;
        const onboardingPct = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Readiness Status Card */}
                    <div className={`p-6 rounded-xl border-l-4 shadow-sm bg-white dark:bg-slate-800 ${statusConfig.color.replace('bg-', 'border-').split(' ')[2]}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">Readiness Status</h3>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${statusConfig.color}`}>
                                    <span>{statusConfig.icon}</span>
                                    <span>{readiness.overall_status}</span>
                                </div>
                            </div>
                            <button 
                                onClick={statusConfig.action}
                                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
                            >
                                {statusConfig.cta}
                            </button>
                        </div>
                        
                        {/* Reason Chips */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {readiness.role_statuses.map(rs => (
                                <div key={rs.role_id} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${rs.status === 'Ready' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                    {rs.role_title}: {rs.status}
                                    {rs.missing_requirements.length > 0 && ` (${rs.missing_requirements.length} missing)`}
                                </div>
                            ))}
                            {readiness.role_statuses.length === 0 && <span className="text-slate-500 text-sm">No roles assigned.</span>}
                        </div>
                    </div>

                    {/* Onboarding Progress Card */}
                    <Card title="Onboarding Progress">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="flex-grow bg-slate-100 dark:bg-slate-700 rounded-full h-4">
                                <div className="bg-hh-red h-4 rounded-full transition-all duration-500" style={{ width: `${onboardingPct}%` }}></div>
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{onboardingPct}%</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{completedEnrollments} of {totalEnrollments} programs completed</p>
                        {onboardingPct < 100 && (
                            <button 
                                onClick={() => setActiveSubTab('Courses')} 
                                className="text-blue-600 font-semibold text-sm hover:underline"
                            >
                                Continue Onboarding &rarr;
                            </button>
                        )}
                    </Card>

                    {/* Courses In Progress */}
                    <Card title="Courses In Progress">
                        {inProgressCourses.length === 0 ? (
                            <p className="text-slate-500 text-sm">No courses currently in progress.</p>
                        ) : (
                            <div className="space-y-3">
                                {inProgressCourses.map(course => (
                                    <div key={course.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{course.programTitle}</h4>
                                            <p className="text-xs text-slate-500">{course.progress}% Complete</p>
                                        </div>
                                        <button 
                                            // Simple redirect to Courses tab, usually we'd pass ID to auto-open, but for MVP just switching tab
                                            onClick={() => setActiveSubTab('Courses')}
                                            className="px-3 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
                                        >
                                            Resume
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Upcoming Expiries */}
                    <Card title="Upcoming Expiries">
                        {expiringCertificates.length === 0 ? (
                            <div className="text-center py-4">
                                <span className="text-3xl">🎉</span>
                                <p className="text-sm text-slate-500 mt-2">No certificates expiring soon.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {expiringCertificates.map(cert => {
                                    const days = Math.ceil((cert.expires_at! - Date.now()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <div key={cert.certificate_id} className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg">
                                            <p className="font-semibold text-sm text-orange-800 dark:text-orange-200">{cert.name}</p>
                                            <p className="text-xs text-orange-600 dark:text-orange-300">Expires in {days} days</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    {/* Latest Notifications Preview */}
                    <Card title="Notifications">
                        <div className="space-y-3">
                            {props.notifications && props.notifications.slice(0, 3).map(n => (
                                <div key={n.log_id} className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-700 pb-2 last:border-0 last:pb-0">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-slate-300' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{n.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.message}</p>
                                    </div>
                                </div>
                            ))}
                            {!props.notifications?.length && <p className="text-sm text-slate-400 text-center py-2">No notifications.</p>}
                        </div>
                        <button onClick={() => setActiveSubTab('Notifications')} className="w-full text-center text-xs text-blue-600 font-medium mt-3 hover:underline">View All</button>
                    </Card>

                    {/* Achievements Placeholder */}
                    <Card title="Achievements">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-2 grayscale opacity-50">🏆</div>
                            <p className="text-sm text-slate-500 font-medium">Badges & Leaderboards</p>
                            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded mt-2 inline-block">Coming Soon</span>
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeSubTab) {
            case 'Dashboard':
                return renderDashboard();
            case 'Courses':
                return <LearnerCourses 
                    {...props} 
                    onEnroll={props.onEnroll}
                    onMarkLessonComplete={props.onMarkLessonComplete}
                    // Quiz Props
                    quizzes={props.quizzes}
                    quizAttempts={props.quizAttempts}
                    onSaveQuizAttempt={props.onSaveQuizAttempt}
                />;
            case 'Onboarding':
                return <LearnerOnboarding 
                    user={props.user}
                    checklists={props.onboardingChecklists || []}
                    progress={props.onboardingProgress || []}
                    roleAssignments={props.roleAssignments || []}
                    roles={props.volunteerRoles || []}
                    enrollments={props.enrollments}
                    documents={props.complianceDocuments || []}
                    onUpdateProgress={props.onUpdateOnboardingProgress || (() => {})}
                    onNavigate={(tab) => setActiveSubTab(tab as LearnerSubTab)}
                />;
            case 'Documents':
                return <LearnerDocuments 
                    documents={props.complianceDocuments || []} 
                    user={props.user} 
                    onUpload={props.onUploadDocument || (() => {})}
                />;
            case 'Certificates':
                return <LearnerCertificates certificates={props.certificates} programs={props.programs} />;
            case 'Notifications':
                return <LearnerNotifications 
                    notifications={props.notifications || []} 
                    onMarkRead={props.onMarkNotificationRead || (() => {})} 
                />;
            case 'Settings':
                return <LearnerSettings 
                    preferences={props.notificationPreferences || { user_id: props.user.user_id, email_enabled: true, sms_enabled: false, push_enabled: true }}
                    onUpdatePreferences={props.onUpdateNotificationPreferences || (() => {})}
                />;
            case 'Profile':
                return <PlaceholderPage title="My Profile" description="Edit your personal details. Go to Settings for notification preferences." />;
            default:
                return null;
        }
    }

    return (
        <div className="relative min-h-[calc(100vh-100px)]">
            {showTour && <OnboardingTour onClose={handleCloseTour} />}

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{t('Learner')}</h2>
                <div className="flex items-center gap-2">
                    {!props.integrationContext && (
                        <button 
                            onClick={() => setShowTour(true)}
                            className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            Tour
                        </button>
                    )}
                </div>
            </div>
             <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                    {(['Dashboard', 'Courses', 'Onboarding', 'Documents', 'Certificates', 'Notifications', 'Settings'] as LearnerSubTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveSubTab(tab)}
                            className={`${activeSubTab === tab ? 'border-hh-red text-hh-red' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'}
                            whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                        >
                            {t(tab)}
                        </button>
                    ))}
                </nav>
            </div>
            
            {renderContent()}
        </div>
    );
};

export default TraineePortal;