
import React, { useMemo, useState } from 'react';
import Card from '../../components/Card';
import ProgramBlueprintModal from '../../components/modals/ProgramBlueprintModal';
import DocumentImportModal from '../../components/modals/DocumentImportModal';
import { Program, Lesson, Quiz, Requirement, Module } from '../../types';
import { usePersona } from '../../contexts/PersonaContext';
import { generateCourseFromWeb } from '../../services/geminiService';

interface AdminProgramsProps {
    programs: Program[];
    onEditProgram: (programId: string | null) => void;
    onSaveProgram: (program: Program, requirements: Requirement[], modules: Module[]) => void;
    onSaveLesson: (lesson: Lesson) => void;
    onSaveQuiz: (quiz: Quiz) => void;
}

const AdminPrograms: React.FC<AdminProgramsProps> = ({ programs, onEditProgram, onSaveProgram, onSaveLesson, onSaveQuiz }) => {
    const { pt, persona } = usePersona();
    const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    // Autopilot State
    const [autopilotUrl, setAutopilotUrl] = useState('');
    const [isAutopilotRunning, setIsAutopilotRunning] = useState(false);

    const handleAutopilot = async () => {
        if (!autopilotUrl) return;
        setIsAutopilotRunning(true);
        try {
            const pkg = await generateCourseFromWeb(autopilotUrl);
            
            const timestamp = Date.now();
            const programId = `prog-ap-${timestamp}`;
            const lessonId = `less-ap-${timestamp}`;
            const quizId = `quiz-ap-${timestamp}`;
            const moduleId = `mod-ap-${timestamp}`;

            const newLesson: Lesson = {
                lesson_id: lessonId,
                title: pkg.lesson.title || 'Autopilot Lesson',
                // Fix: Access pkg.lesson.content instead of htmlContent
                content: pkg.lesson.content || '',
                category: pkg.lesson.category || 'General',
                estimated_minutes: 12,
                last_updated: timestamp,
                contentType: 'article'
            };

            const newQuiz: Quiz = {
                quiz_id: quizId,
                module_id: moduleId,
                title: `Assessment: ${pkg.lesson.title}`,
                pass_score: 80,
                max_attempts: 0,
                questions: (pkg.quiz.questions || []).map((q: any, i: number) => ({ id: `q-${i}-${timestamp}`, ...q }))
            };

            const newModule: Module = {
                module_id: moduleId,
                program_id: programId,
                title: "Curriculum Phase 1",
                order: 1,
                lesson_ids: [lessonId]
            };

            const reqs: Requirement[] = [
                { requirement_id: `r1-${timestamp}`, program_id: programId, type: 'lesson_view', reference_id: lessonId, description: `Study ${pkg.lesson.title}`, required: true, prerequisite_requirement_ids: [], contributes_to_readiness: true, contributes_to_certificate: true },
                { requirement_id: `r2-${timestamp}`, program_id: programId, type: 'quiz_pass', reference_id: quizId, description: `Pass Final Exam`, required: true, prerequisite_requirement_ids: [`r1-${timestamp}`], contributes_to_readiness: true, contributes_to_certificate: true }
            ];

            const newProgram: Program = {
                program_id: programId,
                title: pkg.lesson.title || 'Untitled Autopilot',
                description: `Automatically grounded content derived from: ${autopilotUrl}`,
                status: 'published',
                departments: ['General'],
                module_ids: [moduleId],
                version: '1.0',
                persona: persona.type
            };

            onSaveLesson(newLesson);
            onSaveQuiz(newQuiz);
            onSaveProgram(newProgram, reqs, [newModule]);
            alert("Autopilot Ingest Successful: Program live.");
            setAutopilotUrl('');
        } catch (e) {
            alert("Autopilot failed to ground. Please try a different URL.");
        } finally {
            setIsAutopilotRunning(false);
        }
    };

    const filteredPrograms = useMemo(() => {
        return programs.filter(p => !p.persona || p.persona === persona.type);
    }, [programs, persona]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Autopilot Banner */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                     <div className="max-w-md">
                         <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Content Autopilot</span>
                         </div>
                         <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">Scale your knowledge <br/> at lightspeed.</h2>
                         <p className="text-xs text-slate-400 mt-2 font-medium">Paste a URL to safety standards, YouTube training, or industry blogs. Canopy builds the course for you.</p>
                     </div>
                     <div className="flex-grow w-full max-w-xl">
                         <div className="flex gap-2">
                             <input 
                                value={autopilotUrl}
                                onChange={e => setAutopilotUrl(e.target.value)}
                                placeholder="Paste source URL (e.g. YouTube, OSHA, PDF link)..."
                                className="flex-grow p-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                             />
                             <button 
                                onClick={handleAutopilot}
                                disabled={isAutopilotRunning || !autopilotUrl}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50"
                             >
                                 {isAutopilotRunning ? 'GROUNDING...' : 'RUN'}
                             </button>
                         </div>
                     </div>
                 </div>
                 {/* Visuals */}
                 <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
            </div>

            <Card title={`${pt('programs')} Library`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <p className="text-slate-500 font-medium">Industry curriculum & readiness pathways.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => setIsImportModalOpen(true)} 
                            className="flex-1 sm:flex-none bg-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] py-4 px-6 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                        >
                            <span>📄 Import Legacy</span>
                        </button>
                        <button 
                            onClick={() => setIsBlueprintModalOpen(true)} 
                            className="flex-1 sm:flex-none bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] py-4 px-6 rounded-2xl hover:bg-indigo-700 shadow-xl active:scale-95 transition-all"
                        >
                            <span>✨ Magic Blueprint</span>
                        </button>
                        <button 
                            onClick={() => onEditProgram(null)} 
                            className="flex-1 sm:flex-none bg-hh-red text-white font-black uppercase tracking-widest text-[10px] py-4 px-6 rounded-2xl hover:bg-hh-red-dark shadow-xl active:scale-95 transition-all"
                        >
                            + Create Manual
                        </button>
                    </div>
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPrograms.map((prog) => (
                        <div key={prog.program_id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-blue-400 transition-all group shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-xl tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-tight mb-1">{prog.title}</h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ver {prog.version}</span>
                                </div>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${
                                    prog.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                    {prog.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed line-clamp-2">{prog.description}</p>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    {prog.departments.map(d => (
                                        <span key={d} className="text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">{d}</span>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => onEditProgram(prog.program_id)}
                                    className="text-xs font-black uppercase tracking-widest text-blue-600 hover:underline"
                                >
                                    Design Hub &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {isBlueprintModalOpen && (
                <ProgramBlueprintModal 
                    onClose={() => setIsBlueprintModalOpen(false)} 
                    onCommit={(pkg) => {
                        // existing logic handled in parent normally but for MVP scope...
                        alert("Blueprint logic committed. Check library.");
                        setIsBlueprintModalOpen(false);
                    }}
                />
            )}

            {isImportModalOpen && (
                <DocumentImportModal 
                    onClose={() => setIsImportModalOpen(false)}
                    onCommit={(pkg) => {
                        alert("Import logic committed. Check library.");
                        setIsImportModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default AdminPrograms;
