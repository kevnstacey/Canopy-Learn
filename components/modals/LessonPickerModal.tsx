
import React, { useState, useMemo } from 'react';
import BaseModal from './BaseModal';
import { Lesson } from '../../types';

interface LessonPickerModalProps {
    lessons: Lesson[];
    onSelect: (lessonId: string) => void;
    onClose: () => void;
}

const LessonPickerModal: React.FC<LessonPickerModalProps> = ({ lessons, onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const categories = useMemo(() => ['All', ...Array.from(new Set(lessons.map(l => l.category)))], [lessons]);

    const filteredLessons = useMemo(() => {
        return lessons.filter(l => {
            const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || l.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [lessons, search, categoryFilter]);

    return (
        <BaseModal title="Select SOP / Lesson" onClose={onClose}>
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Search library..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        className="flex-grow p-2 border rounded"
                        autoFocus
                    />
                    <select 
                        value={categoryFilter} 
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="p-2 border rounded bg-white"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="border rounded-lg max-h-96 overflow-y-auto bg-slate-50">
                    {filteredLessons.length === 0 ? (
                        <p className="p-4 text-center text-slate-500">No content found.</p>
                    ) : (
                        <ul className="divide-y divide-slate-200">
                            {filteredLessons.map(lesson => (
                                <li key={lesson.lesson_id} className="flex justify-between items-center p-3 hover:bg-slate-100 transition-colors">
                                    <div>
                                        <div className="font-semibold text-sm">{lesson.title}</div>
                                        <div className="text-xs text-slate-500">{lesson.category} • {lesson.estimated_minutes} min</div>
                                    </div>
                                    <button 
                                        onClick={() => onSelect(lesson.lesson_id)}
                                        className="text-xs bg-hh-red text-white px-3 py-1.5 rounded hover:bg-hh-red-dark font-medium"
                                    >
                                        Select
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex justify-end pt-2">
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">Cancel</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default LessonPickerModal;
