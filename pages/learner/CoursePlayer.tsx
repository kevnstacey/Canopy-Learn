
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Program, Enrollment, Module, Lesson, Requirement, Quiz, QuizAttempt, Policy, PolicyAcknowledgment } from '../../types';
import QuizView from '../../components/player/QuizView';
import PolicyView from '../../components/player/PolicyView';
import LiveProctor from '../../components/player/LiveProctor';
import LiveRadio from '../../components/player/LiveRadio';
import LearnerFeedbackModal from '../../components/modals/LearnerFeedbackModal';
import { translateContent } from '../../services/geminiService';

interface CoursePlayerProps {
    program: Program;
    enrollment: Enrollment;
    modules: Module[];
    lessons: Lesson[];
    requirements: Requirement[];
    initialLessonId?: string;
    onCompleteLesson: (lessonId: string) => void;
    onExit: () => void;
    quizzes?: Quiz[];
    quizAttempts?: QuizAttempt[];
    onSaveQuizAttempt?: (attempt: QuizAttempt) => void;
    userId?: string;
    policies?: Policy[];
    policyAcknowledgments?: PolicyAcknowledgment[];
    onAcknowledgePolicy?: (policyId: string, version: string) => void;
    onCompleteRequirement?: (programId: string, requirementId: string) => void;
}

type PlayerItem = 
    | { type: 'lesson'; id: string; title: string; moduleId: string; data: Lesson }
    | { type: 'quiz'; id: string; title: string; moduleId: string; data: Quiz; relatedLessonContent?: string }
    | { type: 'proctor'; id: string; title: string; moduleId: string; rubric: string; requirementId: string }
    | { type: 'policy'; id: string; title: string; moduleId: string; data: Policy; requirementId: string };

const CoursePlayer: React.FC<CoursePlayerProps> = ({ 
    program, enrollment, modules, lessons, requirements, initialLessonId, onCompleteLesson, onExit,
    quizzes = [], quizAttempts = [], onSaveQuizAttempt, userId,
    policies = [], policyAcknowledgments = [], onAcknowledgePolicy, onCompleteRequirement
}) => {
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [canComplete, setCanComplete] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedHtml, setTranslatedHtml] = useState<string | null>(null);
    const [isLiveRadioActive, setIsLiveRadioActive] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const playlist = useMemo<PlayerItem[]>(() => {
        const sortedModules = modules.filter(m => m.program_id === program.program_id).sort((a,b) => a.order - b.order);
        const list: PlayerItem[] = [];

        const policyReqs = requirements.filter(r => r.program_id === program.program_id && r.type === 'policy_acknowledgment');
        policyReqs.forEach(req => {
            const policy = policies.find(p => p.policy_id === req.reference_id);
            if (policy) list.push({ type: 'policy', id: req.reference_id, title: policy.title, moduleId: 'virtual-policies', data: policy, requirementId: req.requirement_id });
        });

        sortedModules.forEach(mod => {
            mod.lesson_ids.forEach(lid => {
                const l = lessons.find(x => x.lesson_id === lid);
                if (l) list.push({ type: 'lesson', id: l.lesson_id, title: l.title, moduleId: mod.module_id, data: l });
            });
            quizzes.filter(q => q.module_id === mod.module_id).forEach(q => {
                const relatedLesson = lessons.find(l => l.lesson_id === q.related_lesson_id);
                list.push({ type: 'quiz', id: q.quiz_id, title: q.title, moduleId: mod.module_id, data: q, relatedLessonContent: relatedLesson?.content });
            });
            requirements.filter(r => r.program_id === program.program_id && r.type === 'live_proctor').forEach(req => {
                list.push({ type: 'proctor', id: req.requirement_id, title: 'Physical Check', moduleId: mod.module_id, rubric: req.description, requirementId: req.requirement_id });
            });
        });
        return list;
    }, [program, modules, lessons, quizzes, policies, requirements]);

    const activeItem = useMemo(() => playlist.find(i => i.id === activeItemId) || playlist[0], [playlist, activeItemId]);
    const activeIndex = playlist.indexOf(activeItem);

    useEffect(() => {
        if (!activeItemId && playlist.length > 0) {
            if (initialLessonId && playlist.some(i => i.id === initialLessonId)) {
                setActiveItemId(initialLessonId);
            } else {
                const firstIncomplete = playlist.find(item => {
                    const req = requirements.find(r => r.reference_id === item.id || r.requirement_id === item.id);
                    return req && !enrollment.completed_requirements.includes(req.requirement_id);
                });
                setActiveItemId(firstIncomplete ? firstIncomplete.id : playlist[0].id);
            }
        }
    }, [playlist, initialLessonId, activeItemId, enrollment, requirements]);

    useEffect(() => {
        setCanComplete(false);
        setTranslatedHtml(null); 
        setIsLiveRadioActive(false);
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, [activeItemId]);

    const isItemComplete = (itemId: string) => {
        const req = requirements.find(r => (r.reference_id === itemId || r.requirement_id === itemId) && r.program_id === program.program_id);
        if (!req) return true; 
        return enrollment.completed_requirements.includes(req.requirement_id);
    };

    const isItemLocked = (index: number) => {
        if (index === 0) return false;
        const prevItem = playlist[index - 1];
        return !isItemComplete(prevItem.id);
    };

    const handleMarkComplete = () => {
        if (!activeItem) return;
        onCompleteLesson(activeItem.id);
        if (activeIndex < playlist.length - 1) { 
            setActiveItemId(playlist[activeIndex + 1].id); 
        } else { 
            setShowFeedback(true);
        }
    };

    const renderContent = () => {
        if (!activeItem) return null;
        if (activeItem.type === 'policy') {
            return <PolicyView policy={activeItem.data} isAcknowledged={!!policyAcknowledgments.find(a => a.policy_id === activeItem.data.policy_id && a.user_id === userId)} onAcknowledge={(pid, ver) => {
                if (onAcknowledgePolicy) onAcknowledgePolicy(pid, ver);
                if (onCompleteRequirement && activeItem.requirementId) onCompleteRequirement(program.program_id, activeItem.requirementId);
            }} />;
        }
        if (activeItem.type === 'proctor') {
            return <LiveProctor title={activeItem.title} rubric={activeItem.rubric} onVerified={handleMarkComplete} onExit={() => {}} />;
        }
        if (activeItem.type === 'quiz') {
            return <QuizView quiz={activeItem.data} userId={userId} originalLessonContent={activeItem.relatedLessonContent} previousAttempts={quizAttempts.filter(a => a.quiz_id === activeItem.data.quiz_id)} onPass={() => onCompleteLesson(activeItem.id)} onCompleteAttempt={onSaveQuizAttempt} />;
        }
        const lesson = activeItem.data;
        return (
            <div className="max-w-3xl mx-auto px-6 py-10 md:px-12 md:py-16 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">{lesson.title}</h2>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => setIsLiveRadioActive(true)} className="flex-1 md:flex-none p-3 rounded-xl border-2 border-hh-red bg-white dark:bg-slate-800 text-hh-red transition-all shadow-md flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                            <span className="font-black uppercase text-[10px] tracking-widest">🎧 Radio</span>
                        </button>
                        <button onClick={() => alert("Coming soon")} className="flex-1 md:flex-none p-3 rounded-xl border-2 bg-white dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-widest">🌐 Trans</button>
                    </div>
                </div>
                <div className="prose dark:prose-invert max-w-none text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 pb-20">
                    <div dangerouslySetInnerHTML={{ __html: translatedHtml || lesson.content }} />
                </div>
                <div className="mt-8 text-center border-t border-slate-200 dark:border-slate-700 pt-8">
                    <button onClick={() => setCanComplete(true)} className={`text-[10px] font-black uppercase tracking-widest ${canComplete ? 'text-green-600' : 'text-slate-400'}`}>
                        {canComplete ? 'Requirement Met ✓' : 'Complete Reading to Proceed'}
                    </button>
                </div>
            </div>
        );
    };

    if (!activeItem) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
            {isLiveRadioActive && activeItem.type === 'lesson' && <LiveRadio lessonTitle={activeItem.title} lessonContent={activeItem.data.content} onClose={() => setIsLiveRadioActive(false)} />}

            {/* Header */}
            <div className="h-14 md:h-16 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 bg-white dark:bg-slate-800 flex-shrink-0 z-30 relative shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onExit} className="text-slate-500 hover:text-hh-red font-black text-xs md:text-sm tracking-tight">&larr; EXIT</button>
                    <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                    <h1 className="font-black text-slate-900 dark:text-white truncate text-[11px] md:text-sm uppercase tracking-wider hidden sm:block max-w-[150px] md:max-w-xs">{program.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:inline">{Math.round((enrollment.completed_requirements.length / requirements.length) * 100)}%</span>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
            </div>

            <div className="flex-grow flex relative overflow-hidden">
                {/* Responsive Sidebar */}
                <div className={`${sidebarOpen ? 'w-full md:w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0 pointer-events-none'} bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col absolute inset-y-0 left-0 md:relative z-20 shadow-2xl md:shadow-none`}>
                    <div className="p-4 border-b flex justify-between items-center bg-white dark:bg-slate-900">
                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">Curriculum</span>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">&times;</button>
                    </div>
                    <div className="flex-grow overflow-y-auto scrollbar-hide">
                        {playlist.map((item, idx) => {
                            const locked = isItemLocked(idx);
                            const completed = isItemComplete(item.id);
                            const active = item.id === activeItemId;
                            return (
                                <button key={item.id} disabled={locked} onClick={() => { setActiveItemId(item.id); if(window.innerWidth < 1024) setSidebarOpen(false); }} className={`w-full text-left px-5 py-4 text-sm flex items-center gap-4 transition-all ${active ? 'bg-white dark:bg-slate-900 border-r-4 border-hh-red' : locked ? 'opacity-40' : 'hover:bg-white'}`}>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-[10px] ${completed ? 'bg-emerald-500 text-white' : active ? 'bg-hh-red text-white' : 'bg-slate-200 text-slate-500'}`}>{completed ? '✓' : idx + 1}</div>
                                    <div className="flex-grow min-w-0"><div className={`truncate font-bold text-xs ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{item.title}</div></div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow bg-white dark:bg-slate-900 flex flex-col w-full overflow-hidden">
                    <div ref={contentRef} className="flex-grow overflow-y-auto w-full scrollbar-hide">{renderContent()}</div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center flex-shrink-0 backdrop-blur-md">
                        <button onClick={() => { if(activeIndex > 0) setActiveItemId(playlist[activeIndex-1].id); }} disabled={activeIndex === 0} className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 disabled:opacity-0 transition-opacity">PREV</button>
                        <button onClick={handleMarkComplete} disabled={!isItemComplete(activeItem.id) && !canComplete} className={`px-8 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl transition-all active:scale-95 ${isItemComplete(activeItem.id) || canComplete ? 'bg-hh-red text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {isItemComplete(activeItem.id) ? (activeIndex === playlist.length - 1 ? 'Finish' : 'Next Step →') : 'Verify Complete'}
                        </button>
                    </div>
                </div>
            </div>
            {showFeedback && <LearnerFeedbackModal onClose={() => setShowFeedback(false)} onSubmit={() => onExit()} />}
        </div>
    );
};

export default CoursePlayer;
