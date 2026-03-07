
import React from 'react';
import Card from '../components/Card';
import { Program } from '../types';

interface AdminProgramsProps {
    programs: Program[];
    onEditProgram: (programId: string | null) => void;
}

const AdminPrograms: React.FC<AdminProgramsProps> = ({ programs, onEditProgram }) => {
    return (
        <Card title="Training Programs">
            <div className="flex justify-between items-center mb-6">
                 <p className="text-slate-500">Manage learning paths, assignments, and content requirements.</p>
                 <button 
                    onClick={() => onEditProgram(null)} 
                    className="bg-hh-red text-white font-semibold py-2 px-4 rounded-lg hover:bg-hh-red-dark transition-colors"
                 >
                    + Create Program
                 </button>
            </div>
           
            <div className="space-y-3">
                {programs.map((prog) => (
                    <div key={prog.program_id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold block text-lg">{prog.title}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full uppercase tracking-wide border ${
                                    prog.status === 'published' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                    {prog.status}
                                </span>
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400 block mt-1">{prog.description}</span>
                            <div className="mt-2 flex gap-2">
                                {prog.departments.map(d => (
                                    <span key={d} className="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded shadow-sm">{d}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 self-start sm:self-center">
                            <button 
                                onClick={() => onEditProgram(prog.program_id)}
                                className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors"
                            >
                                Edit Builder
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {programs.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    No programs found. Create one to get started.
                </div>
            )}
        </Card>
    );
};

export default AdminPrograms;
