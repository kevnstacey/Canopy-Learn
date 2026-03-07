export type Role = 'Learner' | 'Admin' | 'Manager' | 'Executive';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Volunteer';
export type Department = 'General' | 'Lumber' | 'Garden' | 'Paint' | 'Cashier';

export type PersonaType = 'Non-Profit' | 'University' | 'Business';

export interface User {
  user_id: string;
  name: string;
  role: Role;
  email?: string;
  profilePictureUrl?: string;
  departments: Department[];
  employmentType?: EmploymentType;
  managerId?: string | null;
  startDate?: number;
  managerType?: string;
  id?: string; // Compatibility
}

export interface StrategicProspectus {
    executiveSummary: string;
    financialImpact: {
        mitigatedLiability: number;
        operationalEfficiencyGain: number;
        roiMultiple: number;
    };
    riskAnalysis: {
        criticalGaps: string[];
        complianceDriftRating: string;
        regulatoryPosture: string;
    };
    futureRoadmap: string[];
}

export interface TalentGapPoint {
    month: string;
    currentCapacity: number;
    requiredCapacity: number;
    gap: number;
}

export interface DriftIncident {
    id: string;
    submissionId: string;
    learnerName: string;
    managerName: string;
    issue: string;
    severity: 'High' | 'Medium' | 'Low';
    aiVerdict: string;
    humanVerdict: string;
    timestamp: number;
}

export interface CalibrationResult {
    suggestedRubricChange: string;
    alignmentImpact: number;
    reasoning: string;
}

export interface TeamPerformance {
    department: Department;
    totalPoints: number;
    completionRate: number;
    velocity: 'Up' | 'Down' | 'Steady';
    velocityValue: number; // Points per day
    activeLearners: number;
    rank: number;
}

export interface SocialActivity {
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: number;
    points: number;
    emoji: string;
}

export interface CohortForecast {
    department: Department;
    currentReadiness: number;
    projectedReadiness: number; // in 30 days
    estimatedCompletionDate: number;
    velocityPointsPerDay: number;
    confidenceLevel: 'High' | 'Medium' | 'Low';
    historicalReadiness: { date: number; value: number }[];
}

export interface GlobalChallenge {
    id: string;
    title: string;
    description: string;
    targetPoints: number;
    currentPoints: number;
    reward: string;
    endsAt: number;
}

export interface DriftFlag {
    severity: 'High' | 'Medium' | 'Low';
    reason: string;
    aiVerdict: 'Pass' | 'Fail';
    humanVerdict: 'Approved' | 'Rejected';
    timestamp: number;
}

export interface ShelfAuditResult {
    fileId: string;
    fileName: string;
    score: number; // 0-100
    findings: {
        category: 'Stock' | 'Safety' | 'Labeling' | 'Hygiene';
        issue: string;
        severity: 'Critical' | 'Minor' | 'Info';
        fix: string;
    }[];
    summary: string;
}

export interface BatchAuditReport {
    id: string;
    timestamp: number;
    overallCompliance: number;
    totalIssues: number;
    topRiskArea: string;
    results: ShelfAuditResult[];
    suggestedTrainingTopic?: string;
}

export interface Program {
  program_id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  departments: Department[];
  module_ids: string[];
  validity_months?: number;
  version: string;
  supersedes_program_id?: string;
  retraining_required?: boolean;
  persona?: PersonaType; 
  confidence_score?: number;
  thumbnail_url?: string; // Added for Advanced Visual Identity
}

export interface SopPatch {
    lessonId: string;
    originalHtml: string;
    suggestedHtml: string;
    reasoning: string;
    improvementScore: number;
}

export interface TrainerInsight {
  frequentQuestions: string[];
  knowledgeGaps: string[];
  courseSentiment: {
      lessonId: string;
      title: string;
      score: number; // 0-5
      status: 'High Clarity' | 'Confusing' | 'Needs Review';
      quotes?: string[];
  }[];
  globalRecommendations: string[];
  gradingConsistencyScore?: number; // 0-100
}

export interface Module {
  module_id: string;
  program_id: string;
  title: string;
  order: number;
  lesson_ids: string[];
}

export interface Lesson {
  lesson_id: string;
  module_id?: string;
  title: string;
  content: string;
  category: string;
  estimated_minutes: number;
  last_updated: number;
  departments?: Department[];
  video_url?: string;
  audio_url?: string; 
  podcast_script?: string; 
  contentType?: 'article' | 'video' | 'pdf' | 'link' | 'external_course';
  resource_url?: string; 
  external_platform_name?: string;
  attestation_text?: string;
  require_certificate_upload?: boolean;
  version?: string;
  supersedes_lesson_id?: string;
}

export type RequirementType = 'lesson_view' | 'quiz_pass' | 'practical_submit' | 'roleplay_complete' | 'form_ack' | 'policy_acknowledgment' | 'live_proctor';

export interface Requirement {
  requirement_id: string;
  program_id: string;
  type: RequirementType;
  reference_id: string; 
  description: string;
  required: boolean;
  prerequisite_requirement_ids: string[];
  contributes_to_readiness: boolean;
  contributes_to_certificate: boolean;
}

export interface Enrollment {
  enrollment_id: string;
  user_id: string;
  program_id: string;
  status: 'Not Started' | 'In Progress' | 'Completed'; 
  assigned_at: number;
  completed_at?: number; 
  completed_requirements: string[]; 
}

export interface Quiz {
  quiz_id: string;
  module_id: string;
  title: string;
  pass_score: number;
  max_attempts: number;
  related_lesson_id?: string;
  questions: QuizQuestion[];
  version?: string;
  supersedes_quiz_id?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false';
  prompt: string;
  options: string[];
  correct_option: number;
  explain?: string;
}

export interface QuizAttempt {
  attempt_id: string;
  quiz_id: string;
  user_id: string;
  answers: Record<string, number>;
  score: number;
  passed: boolean;
  timestamp: number;
}

export interface AssessmentTemplate {
  assessment_template_id: string;
  program_id: string;
  title: string;
  instructions: string;
  rubric?: string;
  evidence_type: 'video' | 'image' | 'document';
}

export interface Submission {
  submission_id: string;
  assessment_template_id: string;
  user_id: string;
  artifact_url?: string;
  artifact_data?: string; 
  media_type?: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  submitted_at: number;
  reviewer_id?: string;
  reviewer_notes?: string;
  ai_analysis?: VideoAnalysis; // Added to store AI proctor/lens result
  drift_flag?: DriftFlag; // Added for sentinel loop
}

export interface Certificate {
  certificate_id: string;
  user_id: string;
  program_id: string;
  name: string;
  issued_at: number;
  expires_at?: number;
  status: 'Active' | 'Expired' | 'Revoked';
}

export interface ComplianceDocument {
  document_id: string;
  user_id: string;
  type: string;
  file_name: string;
  url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  uploaded_at: number;
  issued_at?: number;
  expires_at?: number;
  notes?: string;
}

export interface VolunteerRole {
  role_id: string;
  title: string;
  description: string;
  required_course_ids: string[];
  required_document_types?: string[];
  persona?: PersonaType; 
}

export interface VolunteerRoleAssignment {
  assignment_id: string;
  user_id: string;
  role_id: string;
  assigned_at: number;
}

// FIX: Added missing Onboarding types
export type OnboardingStepType = 'manual_task' | 'course' | 'document' | 'external_link';

export interface OnboardingStep {
  step_id: string;
  title: string;
  description: string;
  type: OnboardingStepType;
  reference_id?: string;
  order: number;
}

export interface OnboardingChecklist {
  checklist_id: string;
  title: string;
  description: string;
  steps: OnboardingStep[];
  role_id?: string;
  persona?: PersonaType;
}

export interface OnboardingProgress {
  user_id: string;
  checklist_id: string;
  completed_step_ids: string[];
  is_complete: boolean;
  started_at: number;
  completed_at?: number;
}

export interface Blocker {
    type: 'Course' | 'Document' | 'Assessment' | 'Policy';
    label: string;
    actionLabel: string;
    targetTab: string;
    targetId: string;
}

export interface VolunteerReadinessStatus {
    user_id: string;
    org_id: string;
    overall_status: 'Approved' | 'Pending' | 'Expired' | 'Missing';
    blockers: Blocker[];
    role_statuses: {
        role_id: string;
        role_title: string;
        status: 'Ready' | 'Not Ready';
        missing_requirements: string[];
    }[];
}

export interface ActionLog {
    action_id: string;
    actor_user_id: string; 
    action_type: string;
    target_type: string;
    target_id: string;
    metadata?: any; 
    timestamp: number;
}

export interface NotificationLog {
  log_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  read: boolean;
  sent_at: number;
}

export interface NotificationPreference {
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
}

export interface ChatHistoryItem {
  id: string;
  userId: string;
  question: string;
  timestamp: number;
}

export interface RolePlayScenario {
  id: string;
  title: string;
  description: string;
  persona: string;
  relevantProgramId: string;
}

export interface TranscriptionTurn {
  speaker: 'user' | 'model';
  text: string;
}

export interface RolePlayFeedback {
  summary: string;
  positivePoints: string[];
  improvementAreas: string[];
}

export interface SopDraft {
  title: string;
  sections: { heading: string; html: string }[];
  sources?: { title: string; uri: string }[];
}

export interface VideoAnalysis {
  summary: string;
  checklist: { step: string; passed: boolean; reason?: string }[];
}

export interface AuditViolation {
    type: 'Critical' | 'Warning' | 'Instructional';
    label: string;
    description: string;
    sop_reference: string;
}

export interface SceneAudit {
    compliance_score: number;
    violations: AuditViolation[];
    summary: string;
}

export interface LearnerFeedback {
    lesson_id: string;
    rating: number; // 1-5
    comment: string;
    timestamp: number;
}

export interface ContentOptimization {
    suggested_html: string;
    reasoning: string;
    sentiment_summary: string;
}

export interface SproutQuestion {
    id: string;
    lesson_id: string;
    prompt: string;
    options: string[];
    correct_option: number;
    explanation: string;
}

export interface UserSproutStats {
    userId: string;
    memory_strength: number; // 0-100
    last_sprout_date: number;
    total_sprouts_completed: number;
}

// NEW: Workforce Matching Types
export interface WorkforceMatch {
    userId: string;
    matchScore: number; // 0-100
    justification: string;
    missingPrerequisites: string[];
    metPrerequisites: string[];
}

export interface Hit {
  lesson: Lesson;
  score: number;
}

export interface CanopyContext {
  userId: string;
  intent: string;
  requiredProgramId: string;
}

export interface Override {
  override_id: string;
  user_id: string;
  target_id: string; 
  target_type: 'Program' | 'Document' | 'Certificate'; 
  action: 'Mark Completed' | 'Waive' | 'Extend Expiry';
  value?: any; 
  reason: string;
  created_by: string; 
  created_at: number;
}

export interface Policy {
  policy_id: string;
  series_id: string; 
  title: string;
  version: string;
  content: string; 
  effective_date: number;
  status: 'draft' | 'active' | 'archived';
  created_at: number;
}

export interface PolicyAcknowledgment {
  acknowledgment_id: string;
  policy_id: string;
  user_id: string;
  acknowledged_at: number;
  policy_version: string;
}

export interface TraineeProgress {
  userId: string;
  points: number;
  streakDays: number;
  badges: string[];
  completedQuizzes?: Record<string, number>;
}

export interface QuizItem {
  q: string;
  choices: string[];
  answer: number;
  explain: string;
}

export interface ReadinessPayload {
  volunteer_id: string;
  org_id: string;
  training_status: {
    required: boolean;
    completed: boolean;
    certification_name?: string;
    issued_at?: string;
    expires_at?: string;
    status_code: 'APPROVED' | 'PENDING' | 'EXPIRED' | 'MISSING';
  };
}

export type ActionType = 
    | 'Requirement Completed' | 'Quiz Passed' | 'Quiz Failed' | 'Document Uploaded'
    | 'Submission Approved' | 'Submission Rejected' | 'Certificate Issued' | 'Live Proctor Passed'
    | 'Certificate Revoked' | 'Policy Acknowledged' | 'Override Applied'
    | 'Course Published' | 'Role Assigned' | 'Role Removed' | 'Document Reviewed';

export type TargetType = 'Program' | 'Document' | 'Certificate' | 'Requirement' | 'User' | 'Policy' | 'Quiz' | 'Lesson';