
import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Drawer from './components/layout/Drawer';
import MobileNav from './components/layout/MobileNav';
import Landing from './pages/Landing';
import TraineePortal from './pages/learner/TraineePortal';
import ManagerPortal from './pages/ManagerPortal';
import ExecutivePortal from './pages/ExecutivePortal';
import UpdatesPortal from './pages/UpdatesPortal';
import CertificateVerification from './pages/CertificateVerification';
import PassportVerify from './pages/PassportVerify';
import AIChat from './pages/AIChat';
import RolePlay from './pages/RolePlay';
import IntegrationSimulator from './pages/IntegrationSimulator';
import useLocalStorage from './hooks/useLocalStorage';
import { LanguageProvider } from './contexts/LanguageContext';
import { PersonaProvider, usePersona } from './contexts/PersonaContext';
import { 
    USERS, PROGRAMS, MODULES, LESSONS, QUIZZES, REQUIREMENTS, 
    ASSESSMENT_TEMPLATES, ENROLLMENTS, SUBMISSIONS, CERTIFICATES, 
    VOLUNTEER_ROLES, ROLE_ASSIGNMENTS, COMPLIANCE_DOCUMENTS, 
    ONBOARDING_CHECKLISTS, ONBOARDING_PROGRESS, POLICIES, POLICY_ACKNOWLEDGMENTS, OVERRIDES, ACTION_LOGS
} from './data';
import { 
    User, Enrollment, Program, Lesson, Module, Requirement, 
    Submission, Certificate, Quiz, QuizAttempt, AssessmentTemplate, 
    VolunteerRole, VolunteerRoleAssignment, ComplianceDocument, 
    OnboardingChecklist, OnboardingProgress, ChatHistoryItem, 
    CanopyContext, SopDraft, Department, NotificationLog, Policy, PolicyAcknowledgment, Override, ActionLog, PersonaType
} from './types';
import { enrollInCourse } from './services/lmsService';

export type MainTab = 'Dashboard' | 'Admin' | 'Reporting' | 'Updates' | 'Public Verify' | 'Simulator' | 'AI Chat' | 'Role Play' | 'Courses' | 'Passport' | 'Arena';

const PersonaToggle = () => {
    const { persona, setPersona } = usePersona();
    const personas: PersonaType[] = ['Non-Profit', 'University', 'Business'];
    
    return (
        <div className="fixed bottom-20 left-4 z-[100] flex bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-1.5 scale-90 sm:scale-100 lg:bottom-4">
            {personas.map(p => (
                <button 
                    key={p} 
                    onClick={() => setPersona(p)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all flex flex-col items-center gap-1 ${persona.type === p ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                    <span className="text-sm">
                        {p === 'Non-Profit' ? '🤝' : p === 'University' ? '🎓' : '💼'}
                    </span>
                    <span>{p === 'Non-Profit' ? 'Non-Profit' : p === 'University' ? 'Uni' : 'Biz'}</span>
                </button>
            ))}
        </div>
    );
};

const AppContent: React.FC = () => {
    const { pt, persona } = usePersona();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<User>(USERS[0]); 
    const [activeTab, setActiveTab] = useState<MainTab>('Dashboard');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showLanding, setShowLanding] = useState(true);
    const [passportToVerify, setPassportToVerify] = useState<string | null>(null);

    const [users, setUsers] = useLocalStorage<User[]>('users', USERS);
    const [programs, setPrograms] = useLocalStorage<Program[]>('programs', PROGRAMS);
    const [modules, setModules] = useLocalStorage<Module[]>('modules', MODULES);
    const [lessons, setLessons] = useLocalStorage<Lesson[]>('lessons', LESSONS);
    const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>('quizzes', QUIZZES);
    const [requirements, setRequirements] = useLocalStorage<Requirement[]>('requirements', REQUIREMENTS);
    const [enrollments, setEnrollments] = useLocalStorage<Enrollment[]>('enrollments', ENROLLMENTS);
    const [submissions, setSubmissions] = useLocalStorage<Submission[]>('submissions', SUBMISSIONS);
    const [certificates, setCertificates] = useLocalStorage<Certificate[]>('certificates', CERTIFICATES);
    const [documents, setDocuments] = useLocalStorage<ComplianceDocument[]>('documents', COMPLIANCE_DOCUMENTS);
    const [policies, setPolicies] = useLocalStorage<Policy[]>('policies', POLICIES);
    const [policyAcknowledgments, setPolicyAcknowledgments] = useLocalStorage<PolicyAcknowledgment[]>('policy_acknowledgments', POLICY_ACKNOWLEDGMENTS);
    const [overrides, setOverrides] = useLocalStorage<Override[]>('overrides', OVERRIDES);
    const [actionLogs, setActionLogs] = useLocalStorage<ActionLog[]>('action_logs', ACTION_LOGS);
    const [roles, setRoles] = useLocalStorage<VolunteerRole[]>('roles', VOLUNTEER_ROLES);
    const [assignments, setAssignments] = useLocalStorage<VolunteerRoleAssignment[]>('assignments', ROLE_ASSIGNMENTS);
    const [checklists, setChecklists] = useLocalStorage<OnboardingChecklist[]>('checklists', ONBOARDING_CHECKLISTS);
    const [onboardingProgress, setOnboardingProgress] = useLocalStorage<OnboardingProgress[]>('onboarding_progress', ONBOARDING_PROGRESS);
    const [assessmentTemplates, setAssessmentTemplates] = useLocalStorage<AssessmentTemplate[]>('templates', ASSESSMENT_TEMPLATES);
    const [chatHistory, setChatHistory] = useLocalStorage<ChatHistoryItem[]>('chat_history', []);
    const [quizAttempts, setQuizAttempts] = useLocalStorage<QuizAttempt[]>('quiz_attempts', []);
    const [notifications, setNotifications] = useLocalStorage<NotificationLog[]>('notifications', []);
    const [canopyContext, setCanopyContext] = useState<CanopyContext | null>(null);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#passport/')) {
            const id = hash.replace('#passport/', '');
            setPassportToVerify(id);
            setShowLanding(false);
            setActiveTab('Passport');
        }
    }, []);

    useEffect(() => {
        if (!isLoggedIn) return;
        if (currentUser.role === 'Learner' && (activeTab === 'Admin' || activeTab === 'Reporting')) {
            setActiveTab('Dashboard');
        } else if (currentUser.role === 'Manager' && activeTab === 'Reporting') {
            setActiveTab('Admin');
        } else if (currentUser.role === 'Executive' && activeTab === 'Admin') {
            setActiveTab('Reporting');
        }
    }, [currentUser, isLoggedIn, activeTab]);

    const handleLogin = () => {
        setShowLanding(false);
        setIsLoggedIn(true);
        if (currentUser.role === 'Admin' || currentUser.role === 'Manager') setActiveTab('Admin');
        else if (currentUser.role === 'Executive') setActiveTab('Reporting');
        else setActiveTab('Dashboard');
    };

    const cycleUser = () => {
        const currentIndex = users.findIndex(u => u.user_id === currentUser.user_id);
        const nextIndex = (currentIndex + 1) % users.length;
        const nextUser = users[nextIndex];
        setCurrentUser(nextUser);
        if (nextUser.role === 'Admin' || nextUser.role === 'Manager') setActiveTab('Admin');
        else if (nextUser.role === 'Executive') setActiveTab('Reporting');
        else setActiveTab('Dashboard');
    };

    const handleEnroll = (programId: string) => {
        const prog = programs.find(p => p.program_id === programId);
        if (!prog) return;
        const newEnrollment = enrollInCourse(currentUser, prog, enrollments);
        if (!enrollments.find(e => e.enrollment_id === newEnrollment.enrollment_id)) {
            setEnrollments(prev => [...prev, newEnrollment]);
        }
    };

    const handleAddUser = (user: Omit<User, 'user_id' | 'startDate'>) => {
        const newUser: User = {
            ...user,
            user_id: `user-${Date.now()}`,
            id: `user-${Date.now()}`,
            startDate: Date.now(),
            profilePictureUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
        };
        setUsers(prev => [...prev, newUser]);
    };

    const handleAddUsers = (newUsers: Omit<User, 'user_id' | 'startDate'>[]) => {
        const batch: User[] = newUsers.map((u, i) => ({
            ...u,
            user_id: `user-${Date.now()}-${i}`,
            id: `user-${Date.now()}-${i}`,
            startDate: Date.now(),
            profilePictureUrl: `https://i.pravatar.cc/150?u=${Date.now() + i}`
        }));
        setUsers(prev => [...prev, ...batch]);
    };

    if (activeTab === 'Passport' && passportToVerify) {
        return <PassportVerify passportId={passportToVerify} onClose={() => setActiveTab('Dashboard')} />;
    }

    if (showLanding) return <Landing onLogin={handleLogin} onGoToVerify={() => { setShowLanding(false); setIsLoggedIn(false); setActiveTab('Public Verify'); }} />;

    return (
        <div className={`min-h-screen transition-colors duration-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 persona-mode-${persona.type.toLowerCase().replace(' ', '-')}`}>
            <PersonaToggle />
            <Header 
                activeTab={activeTab} 
                setTab={setActiveTab} 
                currentUser={currentUser} 
                cycleUser={cycleUser} 
                onMenuClick={() => setIsDrawerOpen(true)} 
                unreadNotificationCount={notifications.filter(n => !n.read && n.user_id === currentUser.user_id).length} 
                onNotificationClick={() => setActiveTab('Dashboard')} 
            />
            <Drawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
                activeTab={activeTab} 
                setTab={setActiveTab} 
                currentUser={currentUser} 
            />
            <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
                {!isLoggedIn && activeTab === 'Public Verify' && <CertificateVerification />}
                {isLoggedIn && (
                    <>
                        {activeTab === 'Dashboard' && (
                            <TraineePortal 
                                user={currentUser} 
                                enrollments={enrollments.filter(e => e.user_id === currentUser.user_id)} 
                                programs={programs} 
                                modules={modules} 
                                lessons={lessons} 
                                requirements={requirements} 
                                assessmentTemplates={assessmentTemplates} 
                                submissions={submissions} 
                                certificates={certificates.filter(c => c.user_id === currentUser.user_id)} 
                                volunteerRoles={roles} 
                                roleAssignments={assignments} 
                                integrationContext={canopyContext} 
                                onEnroll={handleEnroll} 
                                onMarkLessonComplete={() => {}} 
                                policies={policies} 
                                policyAcknowledgments={policyAcknowledgments} 
                                onAcknowledgePolicy={() => {}} 
                                onCompleteRequirement={() => {}} 
                                overrides={overrides} 
                                quizzes={quizzes} 
                                quizAttempts={quizAttempts} 
                                onSaveQuizAttempt={() => {}} 
                                complianceDocuments={documents} 
                                onUploadDocument={() => {}} 
                                onboardingChecklists={checklists} 
                                onboardingProgress={onboardingProgress} 
                                notifications={notifications} 
                                onMarkNotificationRead={() => {}} 
                                openLesson={() => {}} 
                                startQuiz={() => {}} 
                                onVideoUpload={() => {}} 
                            />
                        )}
                        {activeTab === 'Courses' && (
                            <TraineePortal 
                                requestedTab="Courses" 
                                user={currentUser} 
                                enrollments={enrollments.filter(e => e.user_id === currentUser.user_id)} 
                                programs={programs} 
                                modules={modules} 
                                lessons={lessons} 
                                requirements={requirements} 
                                assessmentTemplates={assessmentTemplates} 
                                submissions={submissions} 
                                certificates={certificates.filter(c => c.user_id === currentUser.user_id)} 
                                volunteerRoles={roles} 
                                roleAssignments={assignments} 
                                onEnroll={handleEnroll} 
                                onMarkLessonComplete={() => {}} 
                                policies={policies} 
                                policyAcknowledgments={policyAcknowledgments} 
                                onAcknowledgePolicy={() => {}} 
                                onCompleteRequirement={() => {}} 
                                overrides={overrides} 
                                quizzes={quizzes} 
                                quizAttempts={quizAttempts} 
                                complianceDocuments={documents} 
                                onUploadDocument={() => {}} 
                                onboardingChecklists={checklists} 
                                onboardingProgress={onboardingProgress} 
                                notifications={notifications} 
                                openLesson={() => {}} 
                                startQuiz={() => {}} 
                                onVideoUpload={() => {}} 
                            />
                        )}
                        {activeTab === 'Arena' && (
                            <TraineePortal 
                                requestedTab="Arena" 
                                user={currentUser} 
                                enrollments={enrollments.filter(e => e.user_id === currentUser.user_id)} 
                                programs={programs} 
                                modules={modules} 
                                lessons={lessons} 
                                requirements={requirements} 
                                assessmentTemplates={assessmentTemplates} 
                                submissions={submissions} 
                                certificates={certificates.filter(c => c.user_id === currentUser.user_id)} 
                                volunteerRoles={roles} 
                                roleAssignments={assignments} 
                                onEnroll={handleEnroll} 
                                onMarkLessonComplete={() => {}} 
                                policies={policies} 
                                policyAcknowledgments={policyAcknowledgments} 
                                onAcknowledgePolicy={() => {}} 
                                onCompleteRequirement={() => {}} 
                                overrides={overrides} 
                                quizzes={quizzes} 
                                quizAttempts={quizAttempts} 
                                complianceDocuments={documents} 
                                onUploadDocument={() => {}} 
                                onboardingChecklists={checklists} 
                                onboardingProgress={onboardingProgress} 
                                notifications={notifications} 
                                openLesson={() => {}} 
                                startQuiz={() => {}} 
                                onVideoUpload={() => {}} 
                            />
                        )}
                        {activeTab === 'AI Chat' && <AIChat currentUser={currentUser} addQuestionToHistory={() => {}} lessons={lessons} />}
                        {activeTab === 'Role Play' && <RolePlay />}
                        {activeTab === 'Admin' && <ManagerPortal manager={currentUser} team={users.filter(u => u.managerId === currentUser.user_id)} allUsers={users} enrollments={enrollments} submissions={submissions} programs={programs} lessons={lessons} modules={modules} quizzes={quizzes} policies={policies} assessmentTemplates={assessmentTemplates} requirements={requirements} certificates={certificates} chatHistory={chatHistory} overrides={overrides} onSaveOverride={() => {}} actionLogs={actionLogs} onReviewSubmission={() => {}} onAddSop={() => {}} onSaveLesson={() => {}} onDeleteLesson={() => {}} onOpenAddUser={() => {}} onAddUser={handleAddUser} onAddUsers={handleAddUsers} onSaveProgram={() => {}} onSaveQuiz={() => {}} onDeleteQuiz={() => {}} onSavePolicy={() => {}} onDeletePolicy={() => {}} complianceDocuments={documents} onReviewDocument={() => {}} onRevokeCertificate={() => {}} onboardingChecklists={checklists} onSaveChecklist={() => {}} onDeleteChecklist={() => {}} volunteerRoles={roles} onSaveRole={() => {}} onDeleteRole={() => {}} roleAssignments={assignments} onNotify={() => {}} />}
                        {activeTab === 'Reporting' && <ExecutivePortal executive={currentUser} managers={users.filter(u => u.role === 'Manager' || u.role === 'Admin')} allUsers={users} allProgress={[]} allSubmissions={[]} enrollments={enrollments} submissions={submissions} certificates={certificates} programs={programs} assessmentTemplates={assessmentTemplates} actionLogs={actionLogs} onOpenAddUser={() => {}} onAddSop={() => {}} />}
                        {activeTab === 'Updates' && <UpdatesPortal />}
                        {activeTab === 'Simulator' && <IntegrationSimulator users={users} programs={programs} enrollments={enrollments} certificates={certificates} requirements={requirements} submissions={submissions} onDeepLink={(pid, intent) => { setCanopyContext({ userId: currentUser.user_id, intent, requiredProgramId: pid }); setActiveTab('Dashboard'); }} />}
                    </>
                )}
            </main>
            {isLoggedIn && <MobileNav activeTab={activeTab} setTab={setActiveTab} currentUser={currentUser} />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <PersonaProvider>
                <AppContent />
            </PersonaProvider>
        </LanguageProvider>
    );
};

export default App;
