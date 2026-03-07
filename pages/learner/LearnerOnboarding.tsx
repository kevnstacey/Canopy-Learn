
import React, { useMemo, useState } from 'react';
import Card from '../../components/Card';
import Confetti from '../../components/Confetti'; // Need to create a simple confetti or just use modal
import { OnboardingChecklist, OnboardingProgress, User, Enrollment, ComplianceDocument, VolunteerRoleAssignment, VolunteerRole } from '../../types';

interface LearnerOnboardingProps {
    user: User;
    checklists: OnboardingChecklist[];
    progress: OnboardingProgress[]; // Array of progress records
    roleAssignments: VolunteerRoleAssignment[];
    roles: VolunteerRole[];
    enrollments: Enrollment[];
    documents: ComplianceDocument[];
    onUpdateProgress: (userId: string, checklistId: string, stepId: string) => void;
    onNavigate: (path: string) => void; // Simple navigation helper
}

const LearnerOnboarding: React.FC<LearnerOnboardingProps> = ({ 
    user, checklists, progress, roleAssignments, roles, enrollments, documents, onUpdateProgress, onNavigate 
}) => {
    const [showConfetti, setShowConfetti] = useState(false);

    // 1. Determine active checklist
    const activeChecklist = useMemo(() => {
        // Priority: Role specific -> Default
        const userRoleIds = roleAssignments.filter(ra => ra.user_id === user.user_id).map(ra => ra.role_id);
        const roleChecklist = checklists.find(cl => cl.role_id && userRoleIds.includes(cl.role_id));
        return roleChecklist || checklists.find(cl => !cl.role_id);
    }, [checklists, roleAssignments, user]);

    // 2. Get progress for active checklist
    const currentProgress = useMemo(() => {
        if (!activeChecklist) return null;
        return progress.find(p => p.checklist_id === activeChecklist.checklist_id && p.user_id === user.user_id);
    }, [progress, activeChecklist, user]);

    const completedStepIds = currentProgress?.completed_step_ids || [];

    // 3. Auto-verify steps based on system data (Course/Doc completion)
    const stepsWithStatus = useMemo(() => {
        if (!activeChecklist) return [];
        
        let previousComplete = true; // First step is unlocked by default

        return activeChecklist.steps.map(step => {
            let isComplete = completedStepIds.includes(step.step_id);
            const isLocked = !previousComplete;

            // Auto-Check Logic if not already marked complete in progress tracking
            if (!isComplete) {
                if (step.type === 'course' && step.reference_id) {
                    const enrollment = enrollments.find(e => e.program_id === step.reference_id);
                    if (enrollment && enrollment.status === 'Completed') isComplete = true;
                }
                if (step.type === 'document' && step.reference_id) {
                    // Check for approved doc of this type
                    const doc = documents.find(d => d.type === step.reference_id && d.status === 'Approved');
                    if (doc) isComplete = true;
                }
            }

            // Update chain state
            if (!isComplete) previousComplete = false;

            return { ...step, isComplete, isLocked };
        });
    }, [activeChecklist, completedStepIds, enrollments, documents]);

    // Side Effect: Sync auto-detected completions to progress state
    React.useEffect(() => {
        if (activeChecklist) {
            stepsWithStatus.forEach(step => {
                if (step.isComplete && !completedStepIds.includes(step.step_id)) {
                    onUpdateProgress(user.user_id, activeChecklist.checklist_id, step.step_id);
                }
            });
        }
    }, [stepsWithStatus, activeChecklist, completedStepIds, user.user_id, onUpdateProgress]);

    // Completion Check
    React.useEffect(() => {
        const allComplete = stepsWithStatus.length > 0 && stepsWithStatus.every(s => s.isComplete);
        if (allComplete && !currentProgress?.is_complete) {
            setShowConfetti(true);
            // Could trigger a "Mark Checklist Complete" here
        }
    }, [stepsWithStatus, currentProgress]);


    const handleAction = (step: any) => {
        if (step.isLocked) return;

        if (step.type === 'manual_task' || step.type === 'external_link') {
            // For links, open in new tab
            if (step.type === 'external_link' && step.reference_id) {
                window.open(step.reference_id, '_blank');
            }
            // Mark complete
            if (activeChecklist) {
                onUpdateProgress(user.user_id, activeChecklist.checklist_id, step.step_id);
            }
        } else if (step.type === 'course') {
            onNavigate('Courses');
        } else if (step.type === 'document') {
            onNavigate('Documents');
        }
    };

    if (!activeChecklist) return (
        <Card title="Onboarding">
            <p className="text-slate-500 py-8 text-center">No onboarding checklist assigned.</p>
        </Card>
    );

    const percentComplete = Math.round((stepsWithStatus.filter(s => s.isComplete).length / stepsWithStatus.length) * 100);

    return (
        <div className="relative">
            {showConfetti && <Confetti onClose={() => setShowConfetti(false)} />}
            
            <Card title={activeChecklist.title}>
                <p className="text-slate-500 mb-6">{activeChecklist.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Progress</span>
                        <span>{percentComplete}%</span>
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${percentComplete}%` }}></div>
                    </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                    {stepsWithStatus.map((step, idx) => (
                        <div 
                            key={step.step_id}
                            className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                                step.isComplete 
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                                : step.isLocked 
                                ? 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700 opacity-60' 
                                : 'bg-white border-blue-200 dark:bg-slate-700 dark:border-blue-900 shadow-md'
                            }`}
                        >
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                step.isComplete ? 'bg-green-500 text-white' : step.isLocked ? 'bg-slate-200 text-slate-400' : 'bg-blue-100 text-blue-600'
                            }`}>
                                {step.isComplete ? '✓' : step.isLocked ? '🔒' : (idx + 1)}
                            </div>

                            <div className="flex-grow">
                                <h4 className={`font-bold ${step.isComplete ? 'text-green-800 dark:text-green-200' : 'text-slate-800 dark:text-slate-200'}`}>{step.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{step.description}</p>
                            </div>

                            {/* Action Button */}
                            {!step.isComplete && !step.isLocked && (
                                <button 
                                    onClick={() => handleAction(step)}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 whitespace-nowrap"
                                >
                                    {step.type === 'course' ? 'Go to Course' : 
                                     step.type === 'document' ? 'Upload Doc' : 
                                     step.type === 'external_link' ? 'Open Link' : 
                                     'Mark Done'}
                                </button>
                            )}
                            
                            {step.isComplete && <span className="text-green-600 font-bold text-sm px-4">Done</span>}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default LearnerOnboarding;
