
import { Enrollment, Certificate, Requirement, Submission, ReadinessPayload, User, Program } from '../types';

/**
 * Calculates the binary readiness status for a user against a specific program.
 * Returns the payload structure defined in the "App-to-App Contract".
 */
export const getReadinessPayload = (
    user: User,
    programId: string,
    enrollments: Enrollment[],
    certificates: Certificate[],
    requirements: Requirement[],
    submissions: Submission[],
    programs: Program[]
): ReadinessPayload => {
    
    // 1. Find relevant data
    const program = programs.find(p => p.program_id === programId);
    const enrollment = enrollments.find(e => e.user_id === user.user_id && e.program_id === programId);
    const certificate = certificates.find(c => c.user_id === user.user_id && c.program_id === programId && c.status === 'Active');
    const programReqs = requirements.filter(r => r.program_id === programId);

    // 2. Determine "Status Code" (APPROVED | PENDING | EXPIRED | MISSING)
    
    let statusCode: ReadinessPayload['training_status']['status_code'] = 'MISSING';
    let completed = false;

    // Check blocked status first (Rejected submissions)
    const hasRejected = submissions.some(s => 
        s.user_id === user.user_id && 
        programReqs.some(r => r.reference_id === s.assessment_template_id) && 
        s.status === 'Rejected'
    );

    if (hasRejected) {
        statusCode = 'PENDING'; // Or 'BLOCKED' if we had that status, but 'PENDING' implies action needed
    } else if (certificate) {
        // Has active certificate
        statusCode = 'APPROVED';
        completed = true;
        
        // Check if expiring soon (Logic: < 30 days)
        if (certificate.expires_at) {
            const daysUntilExpiry = (certificate.expires_at - Date.now()) / (1000 * 60 * 60 * 24);
            if (daysUntilExpiry < 0) statusCode = 'EXPIRED';
            // Note: "Expiring Soon" might be a UI state, but for gating, if it's valid, it's APPROVED.
        }
    } else if (enrollment) {
        // Enrolled but no cert yet
        // Check if all requirements are met (some might not contribute to cert but are required for readiness)
        const allReadinessReqs = programReqs.filter(r => r.contributes_to_readiness);
        const allMet = allReadinessReqs.every(r => enrollment.completed_requirements.includes(r.requirement_id));
        
        if (allMet) {
            statusCode = 'APPROVED';
            completed = true;
        } else {
            statusCode = 'PENDING';
        }
    } else {
        statusCode = 'MISSING';
    }

    return {
        volunteer_id: user.user_id,
        org_id: 'org-demo-1',
        training_status: {
            required: true,
            completed: completed,
            certification_name: program?.title,
            issued_at: certificate ? new Date(certificate.issued_at).toISOString().split('T')[0] : undefined,
            expires_at: certificate?.expires_at ? new Date(certificate.expires_at).toISOString().split('T')[0] : undefined,
            status_code: statusCode
        }
    };
};
