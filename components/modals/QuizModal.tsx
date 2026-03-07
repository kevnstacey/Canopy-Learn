
import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { LESSONS } from '../../data';
import type { QuizItem } from '../../types';

interface QuizModalProps {
    quiz: { lessonId: string; items: QuizItem[] };
    onClose: () => void;
    onComplete: (lessonId: string, scorePercent: number) => void;
}

const getLessonTitle = (lessonId: string): string => {
    return LESSONS.find(l => l.lesson_id === lessonId)?.title || lessonId;
}

const QuizModal: React.FC<QuizModalProps> = ({ quiz, onClose, onComplete }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});

    const gradeQuiz = () => {
        if (!quiz) return;
        const items = quiz.items;
        let score = 0;
        const details = items.map((q, i) => {
            const isCorrect = answers[i] === q.answer;
            if (isCorrect) score++;
            return { q: q.q, ok: isCorrect, explain: q.explain };
        });

        const scorePercent = (score / items.length) * 100;
        const passed = scorePercent > 50;

        alert(`Score: ${score}/${items.length} (${scorePercent.toFixed(0)}%)\n\n` + details.map((d, idx) => `${d.ok ? "✅" : "❌"} Q${idx + 1}: ${d.explain}`).join("\n"));
        
        if (passed) {
            onComplete(quiz.lessonId, scorePercent);
        }
        onClose();
    };

    return (
        <BaseModal onClose={onClose} title={`Quiz: ${getLessonTitle(quiz.lessonId)}`}>
            <div className="flex flex-col gap-6">
                {quiz.items.map((q, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                        <div className="font-semibold mb-2"><b>Q{i + 1}.</b> {q.q}</div>
                        <div className="space-y-2">
                            {q.choices.map((c, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-600">
                                    <input type="radio" name={`q${i}`} checked={answers[i] === idx} onChange={() => setAnswers(a => ({ ...a, [i]: idx }))} className="form-radio text-hh-red focus:ring-hh-red" />
                                    {c}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <button 
                    className="bg-hh-red text-white font-semibold py-2 px-4 rounded-lg hover:bg-hh-red-dark transition-colors self-start disabled:bg-slate-400" 
                    onClick={gradeQuiz}
                    disabled={Object.keys(answers).length !== quiz.items.length}
                >
                    Submit Answers
                </button>
            </div>
        </BaseModal>
    );
};

export default QuizModal;
