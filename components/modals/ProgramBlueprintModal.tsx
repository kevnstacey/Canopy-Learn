
import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { generateFullProgramBlueprint } from '../../services/geminiService';
import { Lesson, Quiz, Requirement, Module, Program } from '../../types';

interface BlueprintPackage {
    lesson: Partial<Lesson>;
    quiz: Partial<Quiz>;
    rubric: string;
}

interface ProgramBlueprintModalProps {
    onClose: () => void;
    onCommit: (pkg: BlueprintPackage) => void;
}

const ProgramBlueprintModal: React.FC<ProgramBlueprintModalProps> = ({ onClose, onCommit }) => {
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'generating' | 'review'>('idle');
    const [blueprint, setBlueprint] = useState<BlueprintPackage | null>(null);
    const [activeTab, setActiveTab] = useState<'lesson' | 'quiz' | 'proctor'>('lesson');

    const handleGenerate = async () => {
        if (!prompt) return;
        setStatus('generating');
        try {
            const result = await generateFullProgramBlueprint(prompt);
            setBlueprint(result);
            setStatus('review');
        } catch (e) {
            alert("Blueprint construction failed. Please try a simpler topic.");
            setStatus('idle');
        }
    };

    return (
        <BaseModal title="AI Blueprint Authoring Studio" onClose={onClose}>
            <div className="flex flex-col gap-6 min-h-[500px]">
                {status === 'idle' && (
                    <div className="space-y-8 py-10">
                        <div className="text-center space-y-4">
                            <div className="text-5xl">⚡</div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Instant readiness Architect</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Describe any operational task. Gemini will construct the SOP, Knowledge Check, and practical verification rubric.</p>
                        </div>
                        <div className="max-w-xl mx-auto space-y-4">
                            <textarea 
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="e.g., 'Operating a commercial wood chipper safely' or 'Advanced customer de-escalation for retail'"
                                className="w-full h-32 p-4 border-4 border-slate-100 rounded-[2rem] bg-slate-50 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                            />
                            <button onClick={handleGenerate} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                                Initialize Blueprinting
                            </button>
                        </div>
                    </div>
                )}

                {status === 'generating' && (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-10 relative overflow-hidden bg-blue-900 rounded-[2rem] text-white">
                        {/* Blueprint Grid Background */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                        
                        <div className="relative">
                            <div className="w-32 h-32 border-8 border-white/20 border-t-white rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-3xl">📐</div>
                        </div>

                        <div className="text-center space-y-3 z-10">
                            <h3 className="text-3xl font-black italic tracking-tighter animate-pulse">Drafting Architectures...</h3>
                            <div className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-widest text-blue-300">
                                <p className="animate-[fade_1s_infinite]">● CALCULATING SAFETY PARAMETERS</p>
                                <p className="animate-[fade_1.2s_infinite]">● STRUCTURING KNOWLEDGE NODES</p>
                                <p className="animate-[fade_1.5s_infinite]">● ORCHESTRATING PROCTOR LOGIC</p>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'review' && blueprint && (
                    <div className="flex flex-col h-full animate-fade-in">
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
                            {(['lesson', 'quiz', 'proctor'] as const).map(tab => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400'}`}
                                >
                                    {tab} preview
                                </button>
                            ))}
                        </div>

                        <div className="flex-grow border-4 border-slate-100 rounded-[2.5rem] p-8 overflow-y-auto max-h-[400px] bg-white dark:bg-slate-900">
                            {activeTab === 'lesson' && (
                                <div className="prose dark:prose-invert">
                                    <h2 className="font-black italic uppercase tracking-tighter text-3xl mb-4">{blueprint.lesson.title}</h2>
                                    <div dangerouslySetInnerHTML={{ __html: blueprint.lesson.content || '' }} />
                                </div>
                            )}

                            {activeTab === 'quiz' && (
                                <div className="space-y-6">
                                    <h2 className="font-black italic uppercase tracking-tighter text-3xl mb-4">{blueprint.quiz.title}</h2>
                                    {blueprint.quiz.questions?.map((q: any, i: number) => (
                                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                                            <p className="font-bold text-lg mb-3">{i+1}. {q.prompt}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {q.options.map((opt: string, oi: number) => (
                                                    <div key={oi} className={`p-3 rounded-xl border-2 text-sm font-medium ${q.correct_option === oi ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700' : 'border-slate-200 opacity-60'}`}>
                                                        {opt} {q.correct_option === oi && '✓'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'proctor' && (
                                <div className="space-y-6">
                                    <h2 className="font-black italic uppercase tracking-tighter text-3xl mb-4 text-blue-600">Multimodal Proctor Rubric</h2>
                                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border-2 border-blue-100 dark:border-blue-800 font-mono text-xs leading-relaxed">
                                        {blueprint.rubric}
                                    </div>
                                    <p className="text-xs text-slate-500 italic">This rubric is injected into the Gemini Live session for automated physical competency verification.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setStatus('idle')} className="px-10 py-5 rounded-[2rem] border-4 border-slate-100 font-black uppercase text-xs text-slate-400 hover:bg-slate-50">Discard</button>
                            <button onClick={() => onCommit(blueprint)} className="flex-grow py-5 bg-hh-red text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-hh-red-dark">Commit Blueprint to Library</button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
            `}</style>
        </BaseModal>
    );
};

export default ProgramBlueprintModal;
