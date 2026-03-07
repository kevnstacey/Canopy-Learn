
import { 
    User, Program, Enrollment, Certificate, QuizAttempt, Requirement, 
    Submission, ReadinessPayload, VolunteerReadinessStatus, ComplianceDocument, VolunteerRole, VolunteerRoleAssignment, Override, Blocker, CohortForecast, Department
} from '../types';

export const enrollInCourse = (user: User, course: Program, existingEnrollments: Enrollment[]): Enrollment => {
    const exists = existingEnrollments.find(e => e.user_id === user.user_id && e.program_id === course.program_id);
    if (exists) return exists;

    return {
        enrollment_id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        user_id: user.user_id,
        program_id: course.program_id,
        status: 'Not Started',
        assigned_at: Date.now(),
        completed_requirements: []
    };
};

export const completeLesson = (
    enrollment: Enrollment, 
    lessonId: string, 
    requirements: Requirement[]
): Enrollment => {
    const req = requirements.find(r => r.type === 'lesson_view' && r.reference_id === lessonId && r.program_id === enrollment.program_id);
    
    if (!req) return enrollment;
    if (enrollment.completed_requirements.includes(req.requirement_id)) return enrollment;

    const updatedRequirements = [...enrollment.completed_requirements, req.requirement_id];
    
    return {
        ...enrollment,
        status: 'In Progress',
        completed_requirements: updatedRequirements
    };
};

export const issueCertificate = (user: User, program: Program): Certificate => {
    const now = Date.now();
    let expiresAt: number | undefined = undefined;

    if (program.validity_months && program.validity_months > 0) {
        const date = new Date(now);
        date.setMonth(date.getMonth() + program.validity_months);
        expiresAt = date.getTime();
    }

    if (!expiresAt) {
        expiresAt = now + (365 * 24 * 60 * 60 * 1000); 
    }

    return {
        certificate_id: `cert-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        user_id: user.user_id,
        program_id: program.program_id,
        name: `${program.title} Certified`,
        issued_at: now,
        expires_at: expiresAt,
        status: 'Active'
    };
};

export const computeReadiness = (
    userId: string, 
    orgId: string, 
    dataContext: { 
        enrollments: Enrollment[], 
        certificates: Certificate[], 
        submissions: Submission[], 
        complianceDocuments: ComplianceDocument[],
        roles: VolunteerRole[], 
        assignments: VolunteerRoleAssignment[],
        overrides: Override[] 
    }
): VolunteerReadinessStatus => {
    const userAssignments = dataContext.assignments.filter(a => a.user_id === userId);
    const blockers: Blocker[] = [];
    
    const roleStatuses = userAssignments.map(assign => {
        const role = dataContext.roles.find(r => r.role_id === assign.role_id);
        if (!role) return null;

        const missing: string[] = [];
        
        // 1. Check Courses
        role.required_course_ids.forEach((progId: string) => {
            const override = dataContext.overrides.find(o => 
                o.user_id === userId && o.target_id === progId && o.target_type === 'Program'
            );
            if (override && (override.action === 'Mark Completed' || override.action === 'Waive')) return;

            const cert = dataContext.certificates.find(c => c.user_id === userId && c.program_id === progId && c.status === 'Active');
            if (!cert) {
                missing.push(`Course: ${progId}`);
                const enrollment = dataContext.enrollments.find(e => e.program_id === progId && e.user_id === userId);
                blockers.push({
                    type: 'Course',
                    label: `Required Course: ${progId}`,
                    actionLabel: enrollment ? 'Resume Training' : 'Start Training',
                    targetTab: 'Courses',
                    targetId: progId
                });
            } else if (cert.expires_at && cert.expires_at < Date.now()) {
                 const certOverride = dataContext.overrides.find(o => 
                    o.user_id === userId && o.target_id === cert.certificate_id && o.action === 'Extend Expiry'
                );
                if (certOverride && certOverride.value > Date.now()) return;

                missing.push(`Expired: ${progId}`);
                blockers.push({
                    type: 'Course',
                    label: `Expired Certificate: ${progId}`,
                    actionLabel: 'Retrain Now',
                    targetTab: 'Courses',
                    targetId: progId
                });
            }
        });

        // 2. Check Documents
        if (role.required_document_types) {
            role.required_document_types.forEach((docType: string) => {
                const override = dataContext.overrides.find(o => 
                    o.user_id === userId && o.target_id === docType && o.target_type === 'Document'
                );
                if (override && (override.action === 'Mark Completed' || override.action === 'Waive')) return;

                const userDoc = dataContext.complianceDocuments.find(d => d.user_id === userId && d.type === docType);
                if (!userDoc) {
                    missing.push(`Missing Doc: ${docType}`);
                    blockers.push({
                        type: 'Document',
                        label: `Missing Document: ${docType}`,
                        actionLabel: 'Upload Now',
                        targetTab: 'Documents',
                        targetId: docType
                    });
                } else if (userDoc.status === 'Rejected') {
                    missing.push(`Rejected Doc: ${docType}`);
                    blockers.push({
                        type: 'Document',
                        label: `Rejected Document: ${docType}`,
                        actionLabel: 'View Correction',
                        targetTab: 'Documents',
                        targetId: userDoc.document_id
                    });
                } else if (userDoc.status === 'Pending') {
                     // Not a "Missing" blocker for the user, but still counts to "Not Ready"
                } else if (userDoc.expires_at && userDoc.expires_at < Date.now()) {
                    missing.push(`Expired Doc: ${docType}`);
                    blockers.push({
                        type: 'Document',
                        label: `Expired Document: ${docType}`,
                        actionLabel: 'Renew Doc',
                        targetTab: 'Documents',
                        targetId: docType
                    });
                }
            });
        }

        return {
            role_id: role.role_id,
            role_title: role.title,
            status: missing.length === 0 ? 'Ready' : 'Not Ready',
            missing_requirements: missing
        };
    }).filter(r => r !== null) as VolunteerReadinessStatus['role_statuses'];

    // Deduplicate blockers
    const uniqueBlockers = blockers.filter((v, i, a) => a.findIndex(t => (t.label === v.label)) === i);

    const overallStatus = roleStatuses.some(r => r.status === 'Not Ready') 
        ? 'Pending' 
        : (roleStatuses.length > 0 ? 'Approved' : 'Missing');

    return {
        user_id: userId,
        org_id: orgId,
        overall_status: overallStatus,
        blockers: uniqueBlockers,
        role_statuses: roleStatuses
    };
};

export const generateCohortForecasts = (
    users: User[],
    enrollments: Enrollment[],
    requirements: Requirement[]
): CohortForecast[] => {
    const departments: Department[] = ['Lumber', 'Garden', 'Paint', 'Cashier', 'General'];
    
    return departments.map(dept => {
        const deptUsers = users.filter(u => u.departments.includes(dept));
        if (deptUsers.length === 0) return null;

        const deptEnrollments = enrollments.filter(e => deptUsers.some(u => u.user_id === e.user_id));
        
        // Calculate aggregate requirements
        let totalReqs = 0;
        let completedReqs = 0;

        deptEnrollments.forEach(enr => {
            const progReqs = requirements.filter(r => r.program_id === enr.program_id);
            totalReqs += progReqs.length;
            completedReqs += enr.completed_requirements.length;
        });

        const currentReadiness = totalReqs > 0 ? (completedReqs / totalReqs) * 100 : 100;
        
        // Simulate Velocity (Requirements completed per day in the last 14 days)
        // In a real app, we'd check timestamps of completion.
        const mockVelocity = dept === 'Lumber' ? 2.5 : dept === 'Cashier' ? 4.8 : 1.2;
        const remainingReqs = totalReqs - completedReqs;
        const daysToCompletion = mockVelocity > 0 ? Math.ceil(remainingReqs / mockVelocity) : 999;
        
        const estCompletionDate = Date.now() + (daysToCompletion * 24 * 60 * 60 * 1000);
        const projectedReadiness = Math.min(100, currentReadiness + (mockVelocity * 30 / Math.max(1, totalReqs) * 100));

        // Mock historical data
        const historicalReadiness = Array.from({ length: 7 }, (_, i) => ({
            date: Date.now() - (7 - i) * 24 * 60 * 60 * 1000,
            value: Math.max(0, currentReadiness - (7 - i) * mockVelocity)
        }));

        return {
            department: dept,
            currentReadiness,
            projectedReadiness,
            estimatedCompletionDate: estCompletionDate,
            velocityPointsPerDay: mockVelocity,
            confidenceLevel: mockVelocity > 3 ? 'High' : 'Medium',
            historicalReadiness
        } as CohortForecast;
    }).filter(f => f !== null) as CohortForecast[];
};

export const incrementVersion = (v: string): string => {
    const parts = v.split('.');
    if (parts.length < 2) return '1.1';
    const minor = parseInt(parts[1], 10) + 1;
    return `${parts[0]}.${minor}`;
};
