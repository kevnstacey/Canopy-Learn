import React, { useState } from 'react';
import ComplianceDashboard from './ComplianceDashboard';
import ComplianceCertificates from './ComplianceCertificates';
import ComplianceReadiness from './ComplianceReadiness';
import ComplianceExport from './ComplianceExport';
import ExecutiveBoardroom from './admin/ExecutiveBoardroom';
import AuditLogViewer from './admin/AuditLogViewer';

import { User, TraineeProgress, SopDraft, Department, Enrollment, Submission, Certificate, Program, AssessmentTemplate, ActionLog } from '../types';

interface ExecutivePortalProps {
    executive: User;
    managers: User[];
    allUsers: User[];
    allProgress: TraineeProgress[];
    allSubmissions: Submission[];
    enrollments: Enrollment[];
    submissions: Submission[];
    certificates: Certificate[];
    programs: Program[];
    assessmentTemplates: AssessmentTemplate[];
    actionLogs: ActionLog[];
    onOpenAddUser: () => void;
    onAddSop: (draft: SopDraft, departments: Department[]) => void;
}

type ComplianceSubTab = 'Boardroom' | 'Overview' | 'Certificates & Expiry' | 'Readiness by Program' | 'Audit Export' | 'Action Log';

const ExecutivePortal: React.FC<ExecutivePortalProps> = (props) => {
    const [activeSubTab, setActiveSubTab] = useState<ComplianceSubTab>('Boardroom');

     const renderContent = () => {
        switch(activeSubTab) {
            case 'Boardroom':
                return <ExecutiveBoardroom 
                    users={props.allUsers}
                    programs={props.programs}
                    enrollments={props.enrollments}
                    certificates={props.certificates}
                />;
            case 'Overview':
                return <ComplianceDashboard 
                    learners={props.allUsers.filter(u => u.role === 'Learner')}
                    enrollments={props.enrollments}
                    certificates={props.certificates}
                    submissions={props.submissions}
                    onNavigate={(tab) => setActiveSubTab(tab as ComplianceSubTab)}
                />;
            case 'Certificates & Expiry':
                return <ComplianceCertificates />;
            case 'Readiness by Program':
                return <ComplianceReadiness enrollments={props.enrollments} />;
            case 'Audit Export':
                return <ComplianceExport 
                    users={props.allUsers}
                    programs={props.programs}
                    enrollments={props.enrollments}
                    certificates={props.certificates}
                    submissions={props.submissions}
                    assessmentTemplates={props.assessmentTemplates}
                />;
            case 'Action Log':
                return <AuditLogViewer logs={props.actionLogs} users={props.allUsers} />;
            default: return null;
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Compliance Intelligence Portal</h2>
            </div>
             <div className="mb-6 border-b border-slate-200 dark:border-slate-700 relative overflow-x-auto scrollbar-hide">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {(['Boardroom', 'Overview', 'Certificates & Expiry', 'Readiness by Program', 'Audit Export', 'Action Log'] as ComplianceSubTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveSubTab(tab)}
                            className={`${activeSubTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}
                            whitespace-nowrap py-4 px-1 border-b-2 font-black text-xs uppercase tracking-widest transition-all`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};

export default ExecutivePortal;