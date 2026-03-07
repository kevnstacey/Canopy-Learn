
import React, { useMemo } from 'react';
import { Program, Enrollment, Module, Lesson, Requirement, Certificate } from '../../types';

interface CourseDetailProps {
    program: Program;
    enrollment?: Enrollment;
    modules: Module[];
    lessons: Lesson[];
    requirements: Requirement[];
    certificates?: Certificate[];
    onStart: () => void;
    onResume: () => void;
    onBack: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ 
    program, enrollment, modules, lessons, requirements, certificates, onStart, onResume, onBack 
}) => {
    const isEnrolled = !!enrollment;
    const isCompleted = enrollment?.status === 'Completed';
    const activeCert = certificates?.find(c => c.program_id === program.program_id && c.status === 'Active');

    const courseStructure = useMemo(() => {
        // Sort modules
        const progModules = modules.filter(m => m.program_id === program.program_id).sort((a,b) => a.order - b.order);
        
        return progModules.map(mod => {
            const modLessons = lessons.filter(l => l.module_id === mod.module_id);
            return {
                ...mod,
                lessons: modLessons.map(l => {
                    const req = requirements.find(r => r.reference_id === l.lesson_id && r.type === 'lesson_view');
                    const isComplete = enrollment?.completed_requirements.includes(req?.requirement_id || '');
                    
                    // Simple lock logic: If previous lesson/module isn't done. 
                    // For MVP, we can just show locked if not enrolled.
                    const isLocked = !isEnrolled; 
                    
                    return { ...l, isComplete, isLocked, reqId: req?.requirement_id };
                })
            };
        });
    }, [modules, lessons, requirements, enrollment, isEnrolled, program.program_id]);

    const totalLessons = courseStructure.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedLessons = courseStructure.reduce((acc, m) => acc + m.lessons.filter(l => l.isComplete).length, 0);
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 text-sm font-medium">
                &larr; Back to Catalog
            </button>

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{program.title}</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mb-6">{program.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-8">
                        <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{totalLessons} Lessons</span>
                        <span>•</span>
                        <span>Self-Paced</span>
                    </div>

                    <div className="flex gap-4">
                        {!isEnrolled ? (
                            <button onClick={onStart} className="bg-hh-red text-white text-lg font-bold py-3 px-8 rounded-xl hover:bg-hh-red-dark shadow-lg transition-transform active:scale-95">
                                Start Course
                            </button>
                        ) : isCompleted ? (
                            <div className="flex gap-4">
                                <button className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl cursor-default">
                                    Completed
                                </button>
                                {activeCert && (
                                    <button className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700">
                                        View Certificate
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button onClick={onResume} className="bg-hh-red text-white text-lg font-bold py-3 px-8 rounded-xl hover:bg-hh-red-dark shadow-lg transition-transform active:scale-95">
                                Resume Course ({progress}%)
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 dark:bg-slate-700 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* Curriculum */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold">Course Curriculum</h2>
                {courseStructure.map((mod, i) => (
                    <div key={mod.module_id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 border-b border-slate-200 dark:border-slate-700 font-semibold flex justify-between items-center">
                            <span>Module {i + 1}: {mod.title}</span>
                            <span className="text-xs text-slate-500 font-normal">{mod.lessons.length} Lessons</span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {mod.lessons.map(lesson => (
                                <div key={lesson.lesson_id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                            lesson.isComplete 
                                            ? 'bg-green-500 border-green-500 text-white' 
                                            : 'border-slate-300 dark:border-slate-600 text-transparent'
                                        }`}>
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                        </div>
                                        <div>
                                            <div className={`font-medium ${lesson.isLocked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {lesson.title}
                                            </div>
                                            <div className="text-xs text-slate-400">{lesson.estimated_minutes} min</div>
                                        </div>
                                    </div>
                                    {lesson.isLocked && (
                                        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseDetail;
