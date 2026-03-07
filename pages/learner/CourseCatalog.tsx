
import React, { useState, useMemo } from 'react';
import { Program, Enrollment, Lesson, Module } from '../../types';

interface CourseCatalogProps {
    programs: Program[];
    enrollments: Enrollment[];
    lessons: Lesson[];
    modules: Module[];
    onSelectCourse: (programId: string) => void;
}

const CourseCatalog: React.FC<CourseCatalogProps> = ({ programs, enrollments, lessons, modules, onSelectCourse }) => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Not Started' | 'In Progress' | 'Completed'>('All');

    // Helper to calculate duration and progress
    const getCourseMeta = (program: Program) => {
        const progModules = modules.filter(m => m.program_id === program.program_id);
        const progLessonIds = progModules.flatMap(m => m.lesson_ids);
        const progLessons = lessons.filter(l => progLessonIds.includes(l.lesson_id));
        const duration = progLessons.reduce((acc, l) => acc + (l.estimated_minutes || 0), 0);
        
        const enrollment = enrollments.find(e => e.user_id === localStorage.getItem('current_user_id') || enrollments[0]?.user_id === e.user_id);
        let status = enrollment ? enrollment.status : 'Not Started';
        
        // Retraining Logic Check
        let updateRequired = false;
        if (program.retraining_required && program.supersedes_program_id) {
            const oldEnrollment = enrollments.find(e => e.program_id === program.supersedes_program_id && e.status === 'Completed');
            if (oldEnrollment && status !== 'Completed') {
                updateRequired = true;
            }
        }

        return { duration, status, category: progLessons[0]?.category || 'General', updateRequired };
    };

    const filteredPrograms = useMemo(() => {
        return programs.filter(p => {
            if (p.status !== 'published') return false;
            const meta = getCourseMeta(p);
            const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = filterStatus === 'All' || meta.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [programs, enrollments, search, filterStatus, modules, lessons]);

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 px-1">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none mb-2 italic">Curriculum Hub</h2>
                    <p className="text-sm text-slate-500 font-medium">Explore certified pathways and knowledge modules.</p>
                </div>
                
                <div className="flex w-full md:w-auto gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <input 
                        type="text" 
                        placeholder="Search pathways..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        className="flex-grow md:w-64 px-4 py-2 bg-transparent text-sm font-bold outline-none"
                    />
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value as any)} 
                        className="bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none"
                    >
                        <option value="All">All Status</option>
                        <option value="Not Started">Available</option>
                        <option value="In Progress">Active</option>
                        <option value="Completed">Verified</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPrograms.map(prog => {
                    const meta = getCourseMeta(prog);
                    const statusConfig = {
                        'Not Started': { color: 'bg-slate-900 text-white', label: 'Start Path' },
                        'In Progress': { color: 'bg-blue-600 text-white', label: 'Resume' },
                        'Completed': { color: 'bg-emerald-500 text-white', label: 'Completed' }
                    }[meta.status as keyof typeof statusConfig];

                    return (
                        <div 
                            key={prog.program_id} 
                            onClick={() => onSelectCourse(prog.program_id)}
                            className="group bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border-2 border-slate-100 dark:border-slate-700 hover:border-blue-400 hover:shadow-2xl transition-all cursor-pointer flex flex-col h-full"
                        >
                            {/* AI Thumbnail Area */}
                            <div className="aspect-video relative overflow-hidden bg-slate-900">
                                {prog.thumbnail_url ? (
                                    <img 
                                        src={prog.thumbnail_url} 
                                        alt="" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 group-hover:rotate-12 transition-transform">📚</div>
                                )}
                                
                                {/* Overlay Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${statusConfig.color}`}>
                                        {meta.status}
                                    </span>
                                    {meta.updateRequired && (
                                        <span className="px-3 py-1 bg-orange-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg animate-pulse">
                                            Update Required
                                        </span>
                                    )}
                                </div>

                                <div className="absolute bottom-4 right-4">
                                     <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-[9px] font-black text-white uppercase tracking-widest">
                                         ⏱ {meta.duration}m
                                     </div>
                                </div>
                            </div>

                            <div className="p-8 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{meta.category}</span>
                                    <span className="text-[10px] font-bold text-slate-400">V{prog.version}</span>
                                </div>
                                <h3 className="font-black text-2xl text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-blue-600 transition-colors">{prog.title}</h3>
                                <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-8 leading-relaxed">
                                    {prog.description}
                                </p>
                                
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                                                {i + 1}
                                            </div>
                                        ))}
                                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-50 flex items-center justify-center text-[8px] font-black text-slate-300">+</div>
                                    </div>
                                    <button className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-md transition-all active:scale-95 ${statusConfig.color} hover:shadow-xl`}>
                                        {statusConfig.label}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredPrograms.length === 0 && (
                <div className="text-center py-32 bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-slate-400 font-black uppercase tracking-widest">No matching pathways detected</p>
                </div>
            )}
        </div>
    );
};

export default CourseCatalog;
