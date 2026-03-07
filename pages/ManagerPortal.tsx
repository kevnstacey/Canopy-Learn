
import React, { useState } from 'react';
import AdminDashboard from './admin/AdminDashboard';
import StaffManagement from './StaffManagement';
import AdminReviews from './AdminReviews';
import AdminPrograms from './AdminPrograms';
import AdminProgramEditor from './AdminProgramEditor';
import AdminQuizzes from './AdminQuizzes';
import AdminQuizBuilder from './AdminQuizBuilder';
import AdminDocumentQueue from './admin/AdminDocumentQueue';
import AdminCertificates from './admin/AdminCertificates';
import AdminOnboarding from './admin/AdminOnboarding';
import AdminRoles from './admin/AdminRoles';
import AdminSettings from './AdminSettings';
import AdminPolicies from './admin/AdminPolicies';
import AuditLogViewer from './admin/AuditLogViewer';
import ContentCopilot from './ContentCopilot';
import { useTranslation } from '../contexts/LanguageContext';
import { incrementVersion } from '../services/lmsService';

import { User, Enrollment, Submission, Program, Lesson, ChatHistoryItem, SopDraft, Department, Module, Quiz, AssessmentTemplate, Requirement, Certificate, ComplianceDocument, OnboardingChecklist, VolunteerRole, VolunteerRoleAssignment, Policy, Override, ActionLog } from '../types';

interface ManagerPortalProps {
    manager: User;
    team: User[];
    allUsers: User[];
    enrollments: Enrollment[];
    submissions: Submission[];
    programs: Program[];
    lessons: Lesson[];
    modules: Module[];
    quizzes: Quiz[];
    assessmentTemplates: AssessmentTemplate[];
    requirements: Requirement[];
    certificates?: Certificate[];
    chatHistory: ChatHistoryItem[];
    policies: Policy[];
    onSavePolicy: (policy: Policy) => void;
    onDeletePolicy: (id: string) => void;
    overrides: Override[];
    onSaveOverride: (override: Override) => void;
    actionLogs: ActionLog[];
    onReviewSubmission: (submission: Submission) => void;
    onAddSop: (draft: SopDraft, departments: Department[]) => void;
    onSaveLesson: (lesson: Lesson) => void;
    onDeleteLesson: (lessonId: string) => void;
    onOpenAddUser: () => void;
    onAddUser: (user: Omit<User, 'user_id' | 'startDate'>) => void;
    onAddUsers: (users: Omit<User, 'user_id' | 'startDate'>[]) => void;
    onSaveProgram: (program: Program, reqs: Requirement[], modules: Module[]) => void;
    onSaveQuiz: (quiz: Quiz) => void;
    onDeleteQuiz: (quizId: string) => void;
    complianceDocuments: ComplianceDocument[];
    onReviewDocument: (docId: string, status: 'Approved' | 'Rejected', notes?: string) => void;
    onRevokeCertificate: (certId: string) => void;
    onboardingChecklists: OnboardingChecklist[];
    onSaveChecklist: (checklist: OnboardingChecklist) => void;
    onDeleteChecklist: (id: string) => void;
    volunteerRoles: VolunteerRole[];
    onSaveRole: (role: VolunteerRole) => void;
    onDeleteRole: (roleId: string) => void;
    roleAssignments: VolunteerRoleAssignment[];
    onAssignRole?: (userId: string, roleId: string) => void;
    onRemoveRole?: (userId: string, roleId: string) => void;
    onNotify: (userId: string, title: string, message: string, type: 'info' | 'alert' | 'success') => void;
}

type AdminSubTab = 'Dashboard' | 'Courses' | 'Quizzes' | 'Policies' | 'Documents' | 'Onboarding' | 'Volunteers' | 'Roles' | 'Certificates' | 'Audit Log' | 'Settings';

const ManagerPortal: React.FC<ManagerPortalProps> = (props) => {
    const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('Dashboard');
    const [copilotPrompt, setCopilotPrompt] = useState('');
    const [isCopilotOpen, setIsCopilotOpen] = useState(false);
    const { t } = useTranslation();
    const [editingProgramId, setEditingProgramId] = useState<string | null | undefined>(undefined); 
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null | undefined>(undefined);

    const handleSetCopilotPrompt = (prompt: string) => {
        setCopilotPrompt(prompt);
        setActiveSubTab('Courses');
        setIsCopilotOpen(true);
    };

    const handleEditProgram = (id: string | null) => {
        setEditingProgramId(id);
    };

    const handleSaveProgram = (prog: Program, reqs: Requirement[], modules: Module[]) => {
        props.onSaveProgram(prog, reqs, modules);
        setEditingProgramId(undefined);
    };

    const handlePublishVersion = (program: Program, retrainingRequired: boolean) => {
        const newProgramId = `prog-${Date.now()}`;
        const newVersion = incrementVersion(program.version || '1.0');
        const newProgram: Program = { ...program, program_id: newProgramId, version: newVersion, supersedes_program_id: program.program_id, retraining_required: retrainingRequired, status: 'published' };
        const archivedProgram: Program = { ...program, status: 'archived' };
        const oldModules = props.modules.filter(m => m.program_id === program.program_id);
        const newModules = oldModules.map(m => ({ ...m, module_id: `mod-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, program_id: newProgramId }));
        const oldReqs = props.requirements.filter(r => r.program_id === program.program_id);
        const newReqs = oldReqs.map(r => ({ ...r, requirement_id: `req-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, program_id: newProgramId }));
        const updatedRoles = props.volunteerRoles.map(role => {
            if (role.required_course_ids.includes(program.program_id)) {
                return { ...role, required_course_ids: role.required_course_ids.map(id => id === program.program_id ? newProgramId : id) };
            }
            return role;
        });
        props.onSaveProgram(newProgram, newReqs, newModules);
        props.onSaveProgram(archivedProgram, [], []);
        updatedRoles.forEach(r => props.onSaveRole(r));
        if (retrainingRequired) {
            const completedEnrollments = props.enrollments.filter(e => e.program_id === program.program_id && e.status === 'Completed');
            completedEnrollments.forEach(e => {
                const user = props.allUsers.find(u => u.user_id === e.user_id);
                if (user) props.onNotify(user.user_id, 'Retraining Required', `A new version of ${newProgram.title} (v${newProgram.version}) is available.`, 'alert');
            });
        }
        alert(`Published version ${newVersion} of ${newProgram.title}.`);
        setEditingProgramId(undefined);
    };

    const handleEditQuiz = (quiz: Quiz | null) => {
        setEditingQuiz(quiz);
    };

    const handleSaveQuiz = (quiz: Quiz) => {
        props.onSaveQuiz(quiz);
        setEditingQuiz(undefined);
    };

    const renderContent = () => {
        if (activeSubTab === 'Courses' && editingProgramId !== undefined) {
            const programToEdit = editingProgramId ? props.programs.find(p => p.program_id === editingProgramId) : { program_id: `prog-${Date.now()}`, title: 'New Program', description: '', status: 'draft', departments: [], module_ids: [], version: '1.0' } as Program;
            if (!programToEdit) return <div>Error: Program not found</div>;
            const relevantReqs = editingProgramId ? props.requirements.filter(r => r.program_id === editingProgramId) : [];
            return (
                <AdminProgramEditor program={programToEdit} allModules={props.modules} allLessons={props.lessons} allQuizzes={props.quizzes} allTemplates={props.assessmentTemplates} allPolicies={props.policies} existingRequirements={relevantReqs} onSave={handleSaveProgram} onPublishVersion={handlePublishVersion} onCancel={() => setEditingProgramId(undefined)} />
            );
        }

        if (activeSubTab === 'Quizzes' && editingQuiz !== undefined) {
            return <AdminQuizBuilder quiz={editingQuiz} modules={props.modules} lessons={props.lessons} onSave={handleSaveQuiz} onCancel={() => setEditingQuiz(undefined)} />;
        }

        switch(activeSubTab) {
            case 'Dashboard':
                return (
                    <AdminDashboard 
                        {...props} 
                        onSetCopilotPrompt={handleSetCopilotPrompt}
                        onSaveProgram={props.onSaveProgram}
                        onSaveLesson={props.onSaveLesson}
                        onSaveQuiz={props.onSaveQuiz}
                    />
                );
            case 'Courses':
                return (
                    <div className="space-y-6">
                        {isCopilotOpen ? (
                            <div className="animate-fade-in-up">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-black">AI Content Co-pilot</h3>
                                    <button onClick={() => { setIsCopilotOpen(false); setCopilotPrompt(''); }} className="text-sm font-bold text-slate-500 hover:text-red-500">Close Copilot</button>
                                </div>
                                <ContentCopilot initialPrompt={copilotPrompt} onAddSop={(draft, depts) => { props.onAddSop(draft, depts); setIsCopilotOpen(false); }} />
                            </div>
                        ) : (
                            <AdminPrograms 
                                programs={props.programs} 
                                onEditProgram={handleEditProgram} 
                                onSaveProgram={props.onSaveProgram}
                                onSaveLesson={props.onSaveLesson}
                                onSaveQuiz={props.onSaveQuiz}
                            />
                        )}
                    </div>
                );
            case 'Quizzes': return <AdminQuizzes quizzes={props.quizzes} modules={props.modules} onEditQuiz={handleEditQuiz} onDeleteQuiz={props.onDeleteQuiz} />;
            case 'Policies': return <AdminPolicies policies={props.policies} onSavePolicy={props.onSavePolicy} onDeletePolicy={props.onDeletePolicy} />;
            case 'Documents': return <AdminDocumentQueue documents={props.complianceDocuments} users={props.allUsers} onReviewDocument={props.onReviewDocument} />;
            case 'Onboarding': return <AdminOnboarding checklists={props.onboardingChecklists} roles={props.volunteerRoles} programs={props.programs} onSaveChecklist={props.onSaveChecklist} onDeleteChecklist={props.onDeleteChecklist} />;
            case 'Volunteers': return <StaffManagement allUsers={props.allUsers} enrollments={props.enrollments} submissions={props.submissions} certificates={props.certificates || []} complianceDocuments={props.complianceDocuments} roles={props.volunteerRoles} roleAssignments={props.roleAssignments} overrides={props.overrides} onSaveOverride={props.onSaveOverride} currentUser={props.manager} onAddUser={props.onAddUser} onAddUsers={props.onAddUsers} onNotify={props.onNotify} onAssignRole={props.onAssignRole} onRemoveRole={props.onRemoveRole} />;
            case 'Roles': return <AdminRoles roles={props.volunteerRoles} programs={props.programs} onSaveRole={props.onSaveRole} onDeleteRole={props.onDeleteRole} />;
            case 'Certificates': return <AdminCertificates certificates={props.certificates || []} users={props.allUsers} programs={props.programs} onRevokeCertificate={props.onRevokeCertificate} />;
            case 'Audit Log': return <AuditLogViewer logs={props.actionLogs} users={props.allUsers} />;
            case 'Settings': return <AdminSettings />;
            default: return null;
        }
    }

     return (
        <div>
            {editingProgramId === undefined && editingQuiz === undefined && (
                <>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('Admin')}</h2>
                    </div>
                     <div className="mb-6 border-b border-slate-200 dark:border-slate-700 relative">
                        <nav className="mobile-tabs flex" aria-label="Tabs">
                            {(['Dashboard', 'Courses', 'Quizzes', 'Policies', 'Documents', 'Onboarding', 'Volunteers', 'Roles', 'Certificates', 'Audit Log', 'Settings'] as AdminSubTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveSubTab(tab)}
                                    className={`${activeSubTab === tab ? 'border-hh-red text-hh-red' : 'border-transparent text-slate-500 hover:text-slate-700'}
                                    mobile-tab-item whitespace-nowrap py-4 px-4 border-b-2 font-bold text-[13px] md:text-sm transition-all`}
                                >
                                    {t(tab)}
                                </button>
                            ))}
                        </nav>
                    </div>
                </>
            )}
            {renderContent()}
        </div>
    );
};

export default ManagerPortal;
