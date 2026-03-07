
import React, { useState } from 'react';
import CourseCatalog from './CourseCatalog';
import CourseDetail from './CourseDetail';
import CoursePlayer from './CoursePlayer';
import { User, Program, Enrollment, Module, Lesson, Requirement, Certificate, QuizItem, AssessmentTemplate, CanopyContext, Quiz, QuizAttempt, Policy, PolicyAcknowledgment } from '../../types';

interface LearnerCoursesProps {
    user: User;
    enrollments: Enrollment[];
    programs: Program[];
    modules: Module[];
    lessons: Lesson[];
    requirements: Requirement[];
    assessmentTemplates: AssessmentTemplate[];
    certificates: Certificate[];
    integrationContext?: CanopyContext | null;
    onEnroll: (programId: string) => void;
    onMarkLessonComplete: (lessonId: string) => void;
    quizzes?: Quiz[];
    quizAttempts?: QuizAttempt[];
    onSaveQuizAttempt?: (attempt: QuizAttempt) => void;
    
    // Policy props
    policies?: Policy[];
    policyAcknowledgments?: PolicyAcknowledgment[];
    onAcknowledgePolicy?: (policyId: string, version: string) => void;
    onCompleteRequirement?: (programId: string, requirementId: string) => void;
}

type ViewState = 'catalog' | 'detail' | 'player';

const LearnerCourses: React.FC<LearnerCoursesProps> = ({
    user, enrollments, programs, modules, lessons, requirements, certificates, integrationContext, onEnroll, onMarkLessonComplete,
    quizzes = [], quizAttempts = [], onSaveQuizAttempt,
    policies = [], policyAcknowledgments = [], onAcknowledgePolicy, onCompleteRequirement
}) => {
    const [view, setView] = useState<ViewState>('catalog');
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [resumeLessonId, setResumeLessonId] = useState<string | undefined>(undefined);

    // Initial load check for integration context
    React.useEffect(() => {
        if (integrationContext?.requiredProgramId) {
            setSelectedProgramId(integrationContext.requiredProgramId);
            setView('detail');
        }
    }, [integrationContext]);

    const handleSelectCourse = (programId: string) => {
        setSelectedProgramId(programId);
        setView('detail');
    };

    const handleStartCourse = () => {
        if (selectedProgramId) {
            // Enroll if not already
            if (!enrollments.some(e => e.program_id === selectedProgramId)) {
                onEnroll(selectedProgramId);
            }
            setView('player');
        }
    };

    const handleResumeCourse = () => {
        // Logic to find last lesson handled in Player, but we can signal intent here
        setView('player');
    };

    const handleExitPlayer = () => {
        setView('detail');
    };

    const activeProgram = programs.find(p => p.program_id === selectedProgramId);
    const activeEnrollment = enrollments.find(e => e.program_id === selectedProgramId);

    if (view === 'player' && activeProgram && activeEnrollment) {
        return (
            <CoursePlayer 
                program={activeProgram}
                enrollment={activeEnrollment}
                modules={modules}
                lessons={lessons}
                requirements={requirements}
                initialLessonId={resumeLessonId}
                onCompleteLesson={onMarkLessonComplete}
                onExit={handleExitPlayer}
                // Quiz Props
                quizzes={quizzes}
                quizAttempts={quizAttempts}
                onSaveQuizAttempt={onSaveQuizAttempt}
                userId={user.user_id}
                // Policy Props
                policies={policies}
                policyAcknowledgments={policyAcknowledgments}
                onAcknowledgePolicy={onAcknowledgePolicy}
                onCompleteRequirement={onCompleteRequirement}
            />
        );
    }

    if (view === 'detail' && activeProgram) {
        return (
            <CourseDetail 
                program={activeProgram}
                enrollment={activeEnrollment}
                modules={modules}
                lessons={lessons}
                requirements={requirements}
                certificates={certificates}
                onStart={handleStartCourse}
                onResume={handleResumeCourse}
                onBack={() => setView('catalog')}
            />
        );
    }

    return (
        <CourseCatalog 
            programs={programs}
            enrollments={enrollments}
            lessons={lessons}
            modules={modules}
            onSelectCourse={handleSelectCourse}
        />
    );
};

export default LearnerCourses;
