
import React, { useState } from 'react';
import Card from '../components/Card';
import { Quiz, Module } from '../types';

interface AdminQuizzesProps {
    quizzes: Quiz[];
    modules: Module[];
    onEditQuiz: (quiz: Quiz | null) => void;
    onDeleteQuiz: (quizId: string) => void;
}

const AdminQuizzes: React.FC<AdminQuizzesProps> = ({ quizzes, modules, onEditQuiz, onDeleteQuiz }) => {
    const [search, setSearch] = useState('');

    const filteredQuizzes = quizzes.filter(q => 
        q.title.toLowerCase().includes(search.toLowerCase())
    );

    const getModuleName = (moduleId: string) => {
        return modules.find(m => m.module_id === moduleId)?.title || 'Unassigned';
    };

    return (
        <Card title="Quiz Management">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Search quizzes..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-hh-red w-full md:w-auto"
                />
                <button 
                    onClick={() => onEditQuiz(null)} 
                    className="bg-hh-red text-white font-semibold py-2 px-6 rounded-lg hover:bg-hh-red-dark transition-colors whitespace-nowrap w-full md:w-auto"
                >
                    + Create Quiz
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700/50 uppercase text-slate-500 font-semibold text-xs border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3">Quiz Title</th>
                            <th className="px-6 py-3">Module</th>
                            <th className="px-6 py-3">Questions</th>
                            <th className="px-6 py-3">Pass Score</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredQuizzes.map(quiz => (
                            <tr key={quiz.quiz_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{quiz.title}</td>
                                <td className="px-6 py-4 text-slate-500">{getModuleName(quiz.module_id)}</td>
                                <td className="px-6 py-4">{quiz.questions.length}</td>
                                <td className="px-6 py-4">{quiz.pass_score}%</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button 
                                        onClick={() => onEditQuiz(quiz)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => { if(confirm('Delete this quiz?')) onDeleteQuiz(quiz.quiz_id); }}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {filteredQuizzes.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No quizzes found. Create one to get started.
                </div>
            )}
        </Card>
    );
};

export default AdminQuizzes;
