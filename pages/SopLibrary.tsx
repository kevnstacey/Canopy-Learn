
import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import SopEditorModal from '../components/modals/SopEditorModal';
import SopModal from '../components/modals/SopModal';
import PodcastStudioModal from '../components/modals/PodcastStudioModal';
import { Lesson, Department } from '../types';
import { generateTrainingVideo } from '../services/geminiService';

interface SopLibraryProps {
    lessons: Lesson[];
    onSaveLesson: (lesson: Lesson) => void;
    onDeleteLesson: (lessonId: string) => void;
}

const SopLibrary: React.FC<SopLibraryProps> = ({ lessons, onSaveLesson, onDeleteLesson }) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewLesson, setViewLesson] = useState<Lesson | null>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [podcastFor, setPodcastFor] = useState<Lesson | null>(null);
    
    // Video Generation State
    const [generatingVideoFor, setGeneratingVideoFor] = useState<string | null>(null);

    const categories = useMemo(() => {
        const cats = new Set(lessons.map(l => l.category));
        return ['All', ...Array.from(cats)];
    }, [lessons]);

    const filteredLessons = useMemo(() => {
        return lessons.filter(l => {
            const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.content.toLowerCase().includes(search.toLowerCase());
            const matchesCat = selectedCategory === 'All' || l.category === selectedCategory;
            return matchesSearch && matchesCat;
        });
    }, [lessons, search, selectedCategory]);

    const handleCreateNew = () => {
        setEditingLesson(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (l: Lesson) => {
        setEditingLesson(l);
        setIsEditorOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this SOP? This may affect training programs.")) {
            onDeleteLesson(id);
        }
    };

    const handleGenerateVideo = async (lesson: Lesson) => {
        const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio?.openSelectKey();
        }

        if(!confirm(`Generate an AI training video for "${lesson.title}"? This may take 1-2 minutes.`)) return;

        setGeneratingVideoFor(lesson.lesson_id);
        try {
            const prompt = `${lesson.title}. ${lesson.content.substring(0, 100).replace(/<[^>]+>/g, '')}...`;
            const videoUrl = await generateTrainingVideo(prompt);
            const updatedLesson = { ...lesson, video_url: videoUrl };
            onSaveLesson(updatedLesson);
            alert("Video generated successfully!");
        } catch (e: any) {
            console.error("Video generation error:", e);
            if (e.message?.includes("Requested entity was not found.")) {
                alert("API Key error: Requested entity was not found. Please re-select your paid API key.");
                await (window as any).aistudio?.openSelectKey();
            } else {
                alert((e as Error).message);
            }
        } finally {
            setGeneratingVideoFor(null);
        }
    };

    return (
        <Card title="SOP Knowledge Base">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Search procedures..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-hh-red"
                />
                <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)} 
                    className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button 
                    onClick={handleCreateNew} 
                    className="bg-hh-red text-white font-semibold py-2 px-4 rounded-lg hover:bg-hh-red-dark transition-colors flex-shrink-0"
                >
                    + New SOP
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredLessons.length === 0 && <p className="text-center text-slate-500 py-8">No SOPs found.</p>}
                
                {filteredLessons.map(lesson => (
                    <div key={lesson.lesson_id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-sm transition-shadow">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">{lesson.title}</h4>
                                <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded-full text-slate-700 dark:text-slate-300">{lesson.category}</span>
                                {lesson.video_url && <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">🎥 Video</span>}
                                {lesson.audio_url && <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">🎙️ Radio</span>}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                <span>Updated: {new Date(lesson.last_updated).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{lesson.departments?.join(', ') || 'All Depts'}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            {/* Radio Studio Button */}
                            {!lesson.audio_url && (
                                <button 
                                    onClick={() => setPodcastFor(lesson)} 
                                    className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-all"
                                >
                                    <span>🎙️ Radio Studio</span>
                                </button>
                            )}

                            {/* Video Gen Button */}
                            {!lesson.video_url && (
                                <button 
                                    onClick={() => handleGenerateVideo(lesson)} 
                                    disabled={generatingVideoFor === lesson.lesson_id}
                                    className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 flex items-center gap-1 disabled:opacity-50"
                                >
                                    {generatingVideoFor === lesson.lesson_id ? (
                                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <span>✨ Create Video</span>
                                    )}
                                </button>
                            )}
                            
                            <button onClick={() => setViewLesson(lesson)} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600">View</button>
                            <button onClick={() => handleEdit(lesson)} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600">Edit</button>
                            <button onClick={() => handleDelete(lesson.lesson_id)} className="px-3 py-1.5 text-sm text-red-600 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-red-50 dark:hover:bg-slate-600 font-bold">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {viewLesson && <SopModal lesson={viewLesson} onClose={() => setViewLesson(null)} />}
            {isEditorOpen && (
                <SopEditorModal 
                    lesson={editingLesson || undefined} 
                    onSave={onSaveLesson} 
                    onClose={() => setIsEditorOpen(false)} 
                />
            )}
            {podcastFor && (
                <PodcastStudioModal 
                    lesson={podcastFor} 
                    onClose={() => setPodcastFor(null)} 
                    onCommit={(url, script) => {
                        onSaveLesson({ ...podcastFor, audio_url: url, podcast_script: script });
                        setPodcastFor(null);
                        alert("Canopy Radio Module Added!");
                    }}
                />
            )}
        </Card>
    );
};

export default SopLibrary;
