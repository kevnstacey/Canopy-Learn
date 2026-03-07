import { 
    User, Program, Module, Lesson, Requirement, Enrollment, Submission, Certificate, 
    Quiz, AssessmentTemplate, VolunteerRole, VolunteerRoleAssignment, 
    ComplianceDocument, OnboardingChecklist, OnboardingProgress, 
    RolePlayScenario, TraineeProgress, Policy, PolicyAcknowledgment, Override, ActionLog, GlobalChallenge, TeamPerformance, SocialActivity
} from './types';

// --- USERS ---
export const USERS: User[] = [
    { user_id: 'user-1', id: 'user-1', name: 'Sarah Miller', role: 'Admin', email: 'smiller@canopynp.org', departments: ['General'], managerType: 'Executive Director', profilePictureUrl: 'https://i.pravatar.cc/150?img=5' },
    { user_id: 'user-2', id: 'user-2', name: 'Mark Evans', role: 'Manager', email: 'mevans@canopynp.org', departments: ['General'], managerId: 'user-1', managerType: 'Volunteer Coordinator', profilePictureUrl: 'https://i.pravatar.cc/150?img=11' },
    { user_id: 'user-3', id: 'user-3', name: 'Alice Chen', role: 'Learner', email: 'alice.chen@example.com', departments: ['General'], managerId: 'user-2', employmentType: 'Volunteer', profilePictureUrl: 'https://i.pravatar.cc/150?img=9' },
    { user_id: 'user-4', id: 'user-4', name: 'David Park', role: 'Learner', email: 'dpark@example.com', departments: ['Lumber'], managerId: 'user-2', employmentType: 'Volunteer', profilePictureUrl: 'https://i.pravatar.cc/150?img=8' },
    { user_id: 'user-5', id: 'user-5', name: 'Emma Watson', role: 'Executive', email: 'ewatson@canopynp.org', departments: ['General'], profilePictureUrl: 'https://i.pravatar.cc/150?img=1' }
];

// --- ARENA DATA ---
export const GLOBAL_CHALLENGE: GlobalChallenge = {
    id: 'ch-1',
    title: 'Safety Sprint 2025',
    description: 'Help the organization reach 10,000 collective readiness points this month.',
    targetPoints: 10000,
    currentPoints: 8420,
    reward: 'Global Hero Badge + Team Pizza Party',
    endsAt: Date.now() + 86400000 * 12
};

export const TEAM_PERFORMANCE: TeamPerformance[] = [
    { department: 'Lumber', totalPoints: 2450, completionRate: 88, velocity: 'Up', velocityValue: 45, activeLearners: 12, rank: 1 },
    { department: 'Paint', totalPoints: 1800, completionRate: 72, velocity: 'Steady', velocityValue: 22, activeLearners: 8, rank: 2 },
    { department: 'Garden', totalPoints: 1200, completionRate: 45, velocity: 'Down', velocityValue: 12, activeLearners: 15, rank: 3 },
    { department: 'Cashier', totalPoints: 950, completionRate: 94, velocity: 'Up', velocityValue: 38, activeLearners: 22, rank: 4 }
];

export const SOCIAL_ACTIVITY_FEED: SocialActivity[] = [
    { id: '1', user: 'Sarah M.', target: 'Lumber Yard Safety', action: 'Pass Final Exam', points: 150, emoji: '🎯', timestamp: Date.now() - 1000 * 60 * 2 },
    { id: '2', user: 'Mark E.', target: 'WHMIS v2.0', action: 'Earned Certificate', points: 500, emoji: '📜', timestamp: Date.now() - 1000 * 60 * 15 },
    { id: '3', user: 'Alice C.', target: 'Volunteer Ethics', action: 'Complete Module', points: 50, emoji: '✅', timestamp: Date.now() - 1000 * 60 * 32 },
    { id: '4', user: 'David P.', target: 'Propane Exchange', action: 'Verified by AI Proctor', points: 300, emoji: '🛡️', timestamp: Date.now() - 1000 * 60 * 45 },
    { id: '5', user: 'Sam K.', target: 'Safety Charter', action: 'Policy Acknowledged', points: 25, emoji: '⚖️', timestamp: Date.now() - 1000 * 60 * 60 }
];

// --- PROGRAMS ---
export const PROGRAMS: Program[] = [
    { 
        program_id: 'prog-youth-mentor', title: 'Youth Mentorship Foundations', 
        description: 'Comprehensive training for volunteers working directly with youth. Covers boundaries, ethics, and engagement.', 
        status: 'published', departments: ['General'], module_ids: ['mod-ym-1'], validity_months: 24, version: '1.2', retraining_required: true, persona: 'Non-Profit'
    },
    { 
        program_id: 'prog-clinical-nursing', title: 'Clinical Nursing Ethics (NURS 400)', 
        description: 'Mandatory ethics training for all nursing students entering clinical rotations.', 
        status: 'published', departments: ['General'], module_ids: ['mod-uni-1'], validity_months: 12, version: '2025.1', retraining_required: true, persona: 'University'
    },
    { 
        program_id: 'prog-safety-officer', title: 'Workplace Safety & Hazard Control', 
        description: 'Industrial safety standards for floor managers and safety officers.', 
        status: 'published', departments: ['Lumber', 'Paint'], module_ids: ['mod-biz-1'], validity_months: 36, version: '4.2', retraining_required: true, persona: 'Business'
    }
];

// --- ROLES & ASSIGNMENTS ---
export const VOLUNTEER_ROLES: VolunteerRole[] = [
    { 
        role_id: 'role-mentor', title: 'Youth Mentor', description: 'Provide 1-on-1 support and guidance to youth.', 
        required_course_ids: ['prog-youth-mentor'], required_document_types: ['Vulnerable Sector Check', 'Waiver'], persona: 'Non-Profit'
    },
    { 
        role_id: 'role-student-nurse', title: 'Nursing Resident', description: 'Student nurse on active hospital floor rotation.', 
        required_course_ids: ['prog-clinical-nursing'], required_document_types: ['Immunization Record', 'CPR Level C'], persona: 'University'
    },
    { 
        role_id: 'role-shift-lead', title: 'Shift Supervisor', description: 'Responsible for floor safety and team management.', 
        required_course_ids: ['prog-safety-officer'], required_document_types: ['OSHA-30 Card'], persona: 'Business'
    }
];

// --- ONBOARDING ---
export const ONBOARDING_CHECKLISTS: OnboardingChecklist[] = [
    { 
        checklist_id: 'cl-nonprofit', title: 'Global Volunteer Integration', description: 'Essential steps for all new outreach volunteers.', 
        persona: 'Non-Profit',
        steps: [
            { step_id: 'ns1', title: 'Watch Mission Overview', description: 'Intro from the Director', type: 'manual_task', order: 1 },
            { step_id: 'ns2', title: 'Acknowledge DEI Policy', description: 'Review Inclusion Charter', type: 'manual_task', order: 2 }
        ]
    },
    { 
        checklist_id: 'cl-uni', title: 'Institutional Placement Workflow', description: 'Mandatory clinical readiness steps.', 
        persona: 'University',
        steps: [
            { step_id: 'us1', title: 'Upload Student ID', description: 'Verification of enrollment', type: 'document', reference_id: 'Student Photo ID', order: 1 },
            { step_id: 'us2', title: 'HIPAA Compliance Cert', description: 'Privacy module', type: 'course', reference_id: 'prog-clinical-nursing', order: 2 }
        ]
    }
];

// --- MODULES, LESSONS, QUIZZES, ETC ---
export const MODULES: Module[] = [
    { module_id: 'mod-ym-1', program_id: 'prog-youth-mentor', title: 'Ethics & Boundaries', order: 1, lesson_ids: ['less-ym-1-1'] },
    { module_id: 'mod-uni-1', program_id: 'prog-clinical-nursing', title: 'Patient Confidentiality', order: 1, lesson_ids: ['less-uni-1-1'] },
    { module_id: 'mod-biz-1', program_id: 'prog-safety-officer', title: 'Chemical Hazards (WHMIS)', order: 1, lesson_ids: ['less-biz-1-1'] }
];

export const LESSONS: Lesson[] = [
    { 
        lesson_id: 'less-ym-1-1', module_id: 'mod-ym-1', title: 'Professional Boundaries', 
        content: '<p>Volunteers must maintain a clear distinction between being a mentor and being a peer. Financial gifts are strictly prohibited.</p>', 
        category: 'Ethics', estimated_minutes: 15, last_updated: Date.now(), contentType: 'article', version: '1.1' 
    },
    { 
        lesson_id: 'less-uni-1-1', module_id: 'mod-uni-1', title: 'Electronic Medical Records', 
        content: '<p>Strict protocols for logging into and out of student terminals. Never share your password.</p>', 
        category: 'Privacy', estimated_minutes: 25, last_updated: Date.now(), contentType: 'video', version: '1.0' 
    },
    { 
        lesson_id: 'less-biz-1-1', module_id: 'mod-biz-1', title: 'Proper PPE Usage', 
        content: '<p>Standard operating procedures for goggles, gloves, and respirators in Paint and Lumber areas. Ensure a seal check is performed.</p>', 
        category: 'Safety', estimated_minutes: 10, last_updated: Date.now(), contentType: 'article', version: '2.0' 
    }
];

export const QUIZZES: Quiz[] = [
    {
        quiz_id: 'quiz-ym-1', module_id: 'mod-ym-1', title: 'Boundaries Check', pass_score: 100, max_attempts: 3, version: '1.0', 
        related_lesson_id: 'less-ym-1-1', 
        questions: [
            { id: 'q1', type: 'multiple_choice', prompt: 'Volunteers should never give money directly to mentees.', options: ['True', 'False'], correct_option: 0, explain: 'Financial interactions create power imbalances.' }
        ]
    }
];

export const POLICIES: Policy[] = [
    { policy_id: 'pol-confidentiality', series_id: 'series-legal', title: 'Confidentiality Agreement', version: '2.0', content: '<h3>Overview</h3><p>Secure data handling.</p>', effective_date: Date.now() - 1000000000, status: 'active', created_at: Date.now() - 1000000000 }
];

export const ROLE_PLAY_SCENARIOS: RolePlayScenario[] = [
    { 
        id: 'rp-hostile', 
        title: 'Conflict De-escalation', 
        description: 'You are a front-desk volunteer. A client is angry about a delayed delivery. Practice staying calm and following the empathy protocol.', 
        persona: 'You are an angry client named Arthur. You are impatient and raise your voice. You only calm down if the volunteer uses "Active Listening" techniques.',
        relevantProgramId: 'prog-youth-mentor' 
    },
    { 
        id: 'rp-ppe', 
        title: 'PPE Compliance Talk', 
        description: 'You are the Shift Lead. You see an employee without safety goggles in the Paint area. Practice the corrective conversation.', 
        persona: 'You are "Rusty", a 20-year veteran who thinks safety goggles are for "newbies". You are stubborn but respect authority if the SOP is cited.',
        relevantProgramId: 'prog-safety-officer' 
    },
    { 
        id: 'rp-privacy', 
        title: 'Patient Privacy Breach', 
        description: 'A student nurse (played by you) is being pressured by a family member to reveal patient details. Practice the HIPAA refusal.', 
        persona: 'You are a persistent relative named Sarah. You are emotional and want to know if your brother is okay. You try to guilt the nurse into checking the EMR.',
        relevantProgramId: 'prog-clinical-nursing' 
    }
];

export const POLICY_ACKNOWLEDGMENTS: PolicyAcknowledgment[] = [];
export const REQUIREMENTS: Requirement[] = [
    { requirement_id: 'req-ym-1', program_id: 'prog-youth-mentor', type: 'lesson_view', reference_id: 'less-ym-1-1', description: 'Complete Boundaries Module', required: true, prerequisite_requirement_ids: [], contributes_to_readiness: true, contributes_to_certificate: true },
    { requirement_id: 'req-ym-quiz', program_id: 'prog-youth-mentor', type: 'quiz_pass', reference_id: 'quiz-ym-1', description: 'Pass Boundaries Check', required: true, prerequisite_requirement_ids: ['req-ym-1'], contributes_to_readiness: true, contributes_to_certificate: true },
    { requirement_id: 'req-ym-live', program_id: 'prog-youth-mentor', type: 'live_proctor', reference_id: 'live-mentor-check', description: 'Verbalize the 3 key boundaries of youth mentorship while maintaining eye contact with camera.', required: true, prerequisite_requirement_ids: ['req-ym-quiz'], contributes_to_readiness: true, contributes_to_certificate: true }
];
export const ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [];
export const ENROLLMENTS: Enrollment[] = [
    { enrollment_id: 'enr-1', user_id: 'user-3', program_id: 'prog-youth-mentor', status: 'In Progress', assigned_at: Date.now() - 86400000 * 5, completed_requirements: [] }
];
export const SUBMISSIONS: Submission[] = [];
export const CERTIFICATES: Certificate[] = [];
export const COMPLIANCE_DOCUMENTS: ComplianceDocument[] = [
    { document_id: 'doc-1', user_id: 'user-3', type: 'Vulnerable Sector Check', file_name: 'vsc_scan.pdf', url: '#', status: 'Approved', uploaded_at: Date.now() - 5000000 }
];
export const ONBOARDING_PROGRESS: OnboardingProgress[] = [];
export const OVERRIDES: Override[] = [];
export const ACTION_LOGS: ActionLog[] = [];
export const ROLE_ASSIGNMENTS: VolunteerRoleAssignment[] = [
    { assignment_id: 'as-1', user_id: 'user-3', role_id: 'role-mentor', assigned_at: Date.now() }
];

export const ORGANIZATION = { id: 'org-canopy-1', name: 'Canopy Outreach Network' };
export const SAMPLE_CSV_DATA = `name,role,employmentType,departments,managerId
John Doe,Learner,Volunteer,General,user-2`;
export const MOCK_TRAINEE_PROGRESS: TraineeProgress[] = [
    { userId: 'user-3', points: 450, streakDays: 3, badges: ['b1', 'b2'], completedQuizzes: { 'quiz-ym-1': 100 } }
];
export const BADGES = [
    { id: 'b1', name: 'Early Bird', icon: '☀️' },
    { id: 'b2', name: 'Safety First', icon: '🛡️' }
];