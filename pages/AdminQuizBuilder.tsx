
import React, { useState } from 'react';
import { Quiz, QuizQuestion, Module, Lesson } from '../types';

interface AdminQuizBuilderProps {
    quiz?: Quiz | null;
    modules: Module[];
    lessons: Lesson[];
    onSave: (quiz: Quiz) => void;
    onCancel: () => void;
}

const AdminQuizBuilder: React.FC<AdminQuizBuilderProps> = ({ quiz, modules, lessons, onSave, onCancel }) => {
    // Initial State
    const [title, setTitle] = useState(quiz?.title || 'New Quiz');
    const [passScore, setPassScore] = useState(quiz?.pass_score || 80);
    const [maxAttempts, setMaxAttempts] = useState(quiz?.max_attempts || 0);
    const [moduleId, setModuleId] = useState(quiz?.module_id || (modules[0]?.module_id || ''));
    const [relatedLessonId, setRelatedLessonId] = useState(quiz?.related_lesson_id || '');
    const [questions, setQuestions] = useState<QuizQuestion[]>(quiz?.questions || []);
    
    // UI State
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

    const handleSave = () => {
        if (!title || !moduleId) {
            alert("Title and Module are required.");
            return;
        }
        if (questions.length === 0) {
            alert("Please add at least one question.");
            return;
        }

        const newQuiz: Quiz = {
            quiz_id: quiz?.quiz_id || `quiz-${Date.now()}`,
            title,
            module_id: moduleId,
            pass_score: Number(passScore),
            max_attempts: Number(maxAttempts),
            related_lesson_id: relatedLessonId || undefined,
            questions
        };
        onSave(newQuiz);
    };

    const addQuestion = () => {
        const newQ: QuizQuestion = {
            id: `q-${Date.now()}`,
            type: 'multiple_choice',
            prompt: 'New Question',
            options: ['Option 1', 'Option 2'],
            correct_option: 0,
            explain: ''
        };
        setQuestions([...questions, newQ]);
        setActiveQuestionId(newQ.id);
    };

    const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const deleteQuestion = (id: string) => {
        if (confirm("Remove this question?")) {
            setQuestions(prev => prev.filter(q => q.id !== id));
            if (activeQuestionId === id) setActiveQuestionId(null);
        }
    };

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        const newQs = [...questions];
        if (direction === 'up' && index > 0) {
            [newQs[index], newQs[index-1]] = [newQs[index-1], newQs[index]];
        } else if (direction === 'down' && index < newQs.length - 1) {
             [newQs[index], newQs[index+1]] = [newQs[index+1], newQs[index]];
        }
        setQuestions(newQs);
    };

    const renderQuestionEditor = (q: QuizQuestion) => {
        return (
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg">Edit Question</h4>
                    <button onClick={() => deleteQuestion(q.id)} className="text-red-600 hover:underline text-sm">Remove Question</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Question Type</label>
                        <select 
                            value={q.type} 
                            onChange={e => {
                                const newType = e.target.value as 'multiple_choice' | 'true_false';
                                const newOptions = newType === 'true_false' ? ['True', 'False'] : ['Option 1', 'Option 2'];
                                updateQuestion(q.id, { type: newType, options: newOptions, correct_option: 0 });
                            }}
                            className="w-full p-2 border rounded"
                        >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True / False</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Prompt</label>
                        <textarea 
                            value={q.prompt} 
                            onChange={e => updateQuestion(q.id, { prompt: e.target.value })}
                            className="w-full p-2 border rounded h-20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Answers (Check the correct one)</label>
                        <div className="space-y-2">
                            {q.options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name={`correct-${q.id}`} 
                                        checked={q.correct_option === idx} 
                                        onChange={() => updateQuestion(q.id, { correct_option: idx })}
                                        className="w-4 h-4 text-hh-red focus:ring-hh-red"
                                    />
                                    <input 
                                        type="text" 
                                        value={opt} 
                                        onChange={e => {
                                            const newOpts = [...q.options];
                                            newOpts[idx] = e.target.value;
                                            updateQuestion(q.id, { options: newOpts });
                                        }}
                                        disabled={q.type === 'true_false'}
                                        className="flex-grow p-2 border rounded text-sm disabled:bg-slate-100"
                                    />
                                    {q.type === 'multiple_choice' && (
                                        <button 
                                            onClick={() => {
                                                const newOpts = q.options.filter((_, i) => i !== idx);
                                                let newCorrect = q.correct_option;
                                                if (newCorrect === idx) newCorrect = 0;
                                                else if (newCorrect > idx) newCorrect--;
                                                updateQuestion(q.id, { options: newOpts, correct_option: newCorrect });
                                            }}
                                            disabled={q.options.length <= 2}
                                            className="text-slate-400 hover:text-red-500 disabled:opacity-30"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {q.type === 'multiple_choice' && (
                            <button 
                                onClick={() => updateQuestion(q.id, { options: [...q.options, `Option ${q.options.length + 1}`] })}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                            >
                                + Add Option
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Feedback / Explanation</label>
                        <input 
                            type="text" 
                            value={q.explain || ''} 
                            onChange={e => updateQuestion(q.id, { explain: e.target.value })}
                            className="w-full p-2 border rounded" 
                            placeholder="Optional explanation shown after answering"
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen pb-12 flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-20 px-6 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        {quiz ? 'Edit Quiz' : 'New Quiz'}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 text-slate-600">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-hh-red text-white rounded hover:bg-hh-red-dark font-semibold">Save Quiz</button>
                </div>
            </div>

            <div className="flex-grow container mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Settings & List */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Settings Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                        <h3 className="font-bold mb-4">Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Module (Parent)</label>
                                <select value={moduleId} onChange={e => setModuleId(e.target.value)} className="w-full p-2 border rounded">
                                    {modules.map(m => <option key={m.module_id} value={m.module_id}>{m.title}</option>)}
                                    {modules.length === 0 && <option value="">No modules available</option>}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Pass Score (%)</label>
                                <input type="number" min="0" max="100" value={passScore} onChange={e => setPassScore(Number(e.target.value))} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Max Attempts (0 = Unlimited)</label>
                                <input type="number" min="0" value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Related Lesson (Optional)</label>
                                <select value={relatedLessonId} onChange={e => setRelatedLessonId(e.target.value)} className="w-full p-2 border rounded">
                                    <option value="">-- None --</option>
                                    {lessons.map(l => <option key={l.lesson_id} value={l.lesson_id}>{l.title}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Question List */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Questions ({questions.length})</h3>
                            <button onClick={addQuestion} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">+ Add</button>
                        </div>
                        <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                            {questions.map((q, idx) => (
                                <li 
                                    key={q.id} 
                                    onClick={() => setActiveQuestionId(q.id)}
                                    className={`p-3 rounded border cursor-pointer flex justify-between items-center ${
                                        activeQuestionId === q.id 
                                        ? 'border-hh-red bg-red-50 dark:bg-red-900/10' 
                                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className="truncate text-sm font-medium">{idx + 1}. {q.prompt}</span>
                                    <div className="flex gap-1 text-slate-400">
                                        <button onClick={(e) => { e.stopPropagation(); moveQuestion(idx, 'up'); }} disabled={idx === 0} className="hover:text-black">▲</button>
                                        <button onClick={(e) => { e.stopPropagation(); moveQuestion(idx, 'down'); }} disabled={idx === questions.length - 1} className="hover:text-black">▼</button>
                                    </div>
                                </li>
                            ))}
                            {questions.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No questions added.</p>}
                        </ul>
                    </div>
                </div>

                {/* Right: Question Editor */}
                <div className="lg:col-span-2">
                    {activeQuestionId ? (
                        questions.find(q => q.id === activeQuestionId) ? (
                            renderQuestionEditor(questions.find(q => q.id === activeQuestionId)!)
                        ) : <div className="text-center p-12 text-slate-500">Question not found.</div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 p-12">
                            <span className="text-4xl mb-4">✏️</span>
                            <p>Select a question to edit or create a new one.</p>
                            <button onClick={addQuestion} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Add First Question</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminQuizBuilder;
