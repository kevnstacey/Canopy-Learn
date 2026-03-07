
import React, { useState, useEffect } from 'react';
import { SproutQuestion } from '../../types';
import BaseModal from '../modals/BaseModal';

interface DailySproutProps {
    question: SproutQuestion;
    onClose: () => void;
    onComplete: (correct: boolean) => void;
}

const DailySprout: React.FC<DailySproutProps> = ({ question, onClose, onComplete }) => {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleAnswer = (idx: number) => {
        if (isSubmitted) return;
        setSelectedIdx(idx);
        setIsSubmitted(true);
        setTimeout(() => onComplete(idx === question.correct_option), 2500);
    };

    return (
        <BaseModal title="Canopy Sprout: Daily Knowledge Refresh" onClose={onClose}>
            <div className="space-y-6 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce-short">🌱</div>
                
                <h3 className="text-2xl font-black italic tracking-tighter text-slate-800 dark:text-white leading-tight">
                    {question.prompt}
                </h3>

                <div className="grid grid-cols-1 gap-3">
                    {question.options.map((opt, i) => (
                        <button
                            key={i}
                            disabled={isSubmitted}
                            onClick={() => handleAnswer(i)}
                            className={`p-5 rounded-2xl border-2 font-bold transition-all text-sm text-left ${
                                isSubmitted 
                                    ? i === question.correct_option 
                                        ? 'bg-green-500 text-white border-green-500 scale-105 shadow-xl' 
                                        : i === selectedIdx 
                                            ? 'bg-red-500 text-white border-red-500 opacity-50' 
                                            : 'opacity-20'
                                    : 'bg-white dark:bg-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {isSubmitted && (
                    <div className="animate-fade-in-up mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">
                            {selectedIdx === question.correct_option ? 'Correct! ' : 'Almost... '}
                            {question.explanation}
                        </p>
                    </div>
                )}
            </div>
        </BaseModal>
    );
};

export default DailySprout;
