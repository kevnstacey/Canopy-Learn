
import React, { useState, useMemo } from 'react';
import { Quiz, QuizAttempt } from '../../types';
import { generateRemediationLesson } from '../../services/geminiService';

interface QuizViewProps {
    quiz: Quiz;
    onPass: (score: number) => void;
    onCompleteAttempt?: (attempt: QuizAttempt) => void;
    userId?: string;
    previousAttempts?: QuizAttempt[];
    originalLessonContent?: string;
}

const QuizView: React.FC<QuizViewProps> = ({ quiz, onPass, onCompleteAttempt, userId, previousAttempts = [], originalLessonContent = "" }) => {
    const [viewState, setViewState] = useState<'start' | 'question' | 'result' | 'remediation'>('start');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);
    const [remediationHtml, setRemediationHtml] = useState<string | null>(null);
    const [isGeneratingRemediation, setIsGeneratingRemediation] = useState(false);

    const attemptsUsed = previousAttempts.length;
    const remainingAttempts = quiz.max_attempts ? Math.max(0, quiz.max_attempts - attemptsUsed) : Infinity;
    const bestScore = previousAttempts.length > 0 ? Math.max(...previousAttempts.map(a => a.score)) : 0;
    const isLocked = quiz.max_attempts !== undefined && quiz.max_attempts > 0 && remainingAttempts <= 0 && bestScore < quiz.pass_score;

    const handleStart = () => {
        setAnswers({});
        setCurrentQuestionIndex(0);
        setViewState('question');
    };

    const handleAnswer = (optionIndex: number) => {
        const currentQ = quiz.questions[currentQuestionIndex];
        setAnswers(prev => ({ ...prev, [currentQ.id]: optionIndex }));
    };

    const handleSubmit = () => {
        let correctCount = 0;
        quiz.questions.forEach((q) => {
            if (answers[q.id] === q.correct_option) correctCount++;
        });

        const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
        const isPassed = finalScore >= quiz.pass_score;
        
        const attempt: QuizAttempt = {
            attempt_id: `att-${Date.now()}`,
            quiz_id: quiz.quiz_id,
            user_id: userId || 'anon',
            answers: answers,
            score: finalScore,
            passed: isPassed,
            timestamp: Date.now()
        };

        setLastAttempt(attempt);
        setViewState('result');

        if (onCompleteAttempt && userId) onCompleteAttempt(attempt);
        if (isPassed) onPass(finalScore);
    };

    const handleGetRemediation = async () => {
        if (!lastAttempt) return;
        setIsGeneratingRemediation(true);
        try {
            const html = await generateRemediationLesson(quiz, lastAttempt, originalLessonContent);
            setRemediationHtml(html);
            setViewState('remediation');
        } catch (e) {
            alert("Could not generate refresher.");
        } finally {
            setIsGeneratingRemediation(false);
        }
    };

    if (viewState === 'start') {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <div className="mb-6 inline-block p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-3xl font-bold mb-4">{quiz.title}</h2>
                <div className="space-y-2 text-slate-600 dark:text-slate-400 mb-8">
                    <p>Passing Score: <span className="font-bold text-slate-800 dark:text-slate-200">{quiz.pass_score}%</span></p>
                    <p>Questions: <span className="font-bold text-slate-800 dark:text-slate-200">{quiz.questions.length}</span></p>
                    <p>Attempts: <span className="font-bold text-slate-800 dark:text-slate-200">{quiz.max_attempts ? `${attemptsUsed} / ${quiz.max_attempts}` : 'Unlimited'}</span></p>
                </div>
                {!isLocked && <button onClick={handleStart} className="bg-hh-red text-white text-lg font-bold py-3 px-10 rounded-xl hover:bg-hh-red-dark shadow-lg transition-transform active:scale-95">Start Quiz</button>}
            </div>
        );
    }

    if (viewState === 'remediation') {
        return (
            <div className="max-w-3xl mx-auto p-8">
                <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">✨</div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Adaptive Refresher</span>
                            <span className="text-xs font-bold text-amber-600">Personalized logic from Gemini</span>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 mb-10" dangerouslySetInnerHTML={{ __html: remediationHtml || "" }} />
                        <button onClick={handleStart} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest">Return to Quiz</button>
                    </div>
                </div>
            </div>
        );
    }

    if (viewState === 'result' && lastAttempt) {
        return (
            <div className={`text-center p-8 rounded-[2.5rem] border-4 max-w-2xl mx-auto my-8 ${lastAttempt.passed ? 'border-green-500/20 bg-green-50 dark:bg-green-900/20' : 'border-red-500/20 bg-red-50 dark:bg-red-900/20'}`}>
                <div className="text-6xl mb-4">{lastAttempt.passed ? '🎉' : '⏳'}</div>
                <h3 className={`text-2xl font-black italic uppercase tracking-tight mb-2 ${lastAttempt.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {lastAttempt.passed ? 'Competency Confirmed' : 'Knowledge Gap Detected'}
                </h3>
                <p className="text-xl font-bold mb-6">Score: {lastAttempt.score}%</p>
                
                {!lastAttempt.passed && (
                    <div className="flex flex-col gap-3">
                        <button onClick={handleGetRemediation} disabled={isGeneratingRemediation} className="bg-amber-500 hover:bg-amber-600 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                            {isGeneratingRemediation ? 'Analyzing your answers...' : '✨ Get Personalized Refresher'}
                        </button>
                        {remainingAttempts > 0 && <button onClick={handleStart} className="text-slate-500 font-bold hover:underline py-2">Skip and retry now ({remainingAttempts} left)</button>}
                    </div>
                )}

                {lastAttempt.passed && <p className="text-green-700 font-bold">Excellent work. You can now proceed to the next module.</p>}
            </div>
        );
    }

    const currentQ = quiz.questions[currentQuestionIndex];
    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <div className="mb-6"><div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-hh-red h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div></div></div>
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 p-8 md:p-12 min-h-[400px] flex flex-col">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8">{currentQ.prompt}</h3>
                <div className="space-y-3 flex-grow">
                    {currentQ.options.map((opt, idx) => (
                        <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${answers[currentQ.id] === idx ? 'border-hh-red bg-red-50 dark:bg-red-900/10 text-hh-red font-bold' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}>
                            {opt}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between mt-12 pt-8 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0} className="text-slate-400 font-bold disabled:opacity-0">PREV</button>
                    <button onClick={() => currentQuestionIndex < quiz.questions.length - 1 ? setCurrentQuestionIndex(currentQuestionIndex + 1) : handleSubmit()} disabled={answers[currentQ.id] === undefined} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-30">
                        {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizView;
