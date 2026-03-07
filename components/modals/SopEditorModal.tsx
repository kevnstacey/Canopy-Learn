
import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { Lesson, Department } from '../../types';

interface SopEditorModalProps {
    lesson?: Lesson; // If null, creating new
    onSave: (lesson: Lesson) => void;
    onClose: () => void;
}

const SopEditorModal: React.FC<SopEditorModalProps> = ({ lesson, onSave, onClose }) => {
    const [title, setTitle] = useState(lesson?.title || '');
    const [category, setCategory] = useState(lesson?.category || 'General');
    const [content, setContent] = useState(lesson?.content || '');
    const [departments, setDepartments] = useState<Department[]>(lesson?.departments || ['General']);
    const [contentType, setContentType] = useState<Lesson['contentType']>(lesson?.contentType || 'article');
    
    // External Fields
    const [resourceUrl, setResourceUrl] = useState(lesson?.resource_url || '');
    const [externalPlatform, setExternalPlatform] = useState(lesson?.external_platform_name || '');
    const [attestation, setAttestation] = useState(lesson?.attestation_text || '');
    const [requireUpload, setRequireUpload] = useState(lesson?.require_certificate_upload || false);
    
    const allDepartments: Department[] = ['General', 'Lumber', 'Garden', 'Paint', 'Cashier'];
    const categories = ['General', 'Food Safety', 'Operations', 'HR', 'Safety', 'Customer Service'];

    const handleSave = () => {
        if (!title || !content) {
            alert("Title and content are required.");
            return;
        }

        const updatedLesson: Lesson = {
            lesson_id: lesson?.lesson_id || `less-${Date.now()}`,
            module_id: lesson?.module_id,
            title,
            category,
            content,
            estimated_minutes: 5,
            last_updated: Date.now(),
            departments,
            contentType,
            resource_url: resourceUrl,
            external_platform_name: externalPlatform,
            attestation_text: attestation,
            require_certificate_upload: requireUpload,
        };
        onSave(updatedLesson);
        onClose();
    };

    const handleDeptChange = (dept: Department) => {
        setDepartments(prev => 
            prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
        );
    };

    return (
        <BaseModal title={lesson ? 'Edit Content' : 'Create New Content'} onClose={onClose}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            className="w-full p-2 border rounded dark:bg-slate-700" 
                            placeholder="e.g. Opening Procedures"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select 
                            value={category} 
                            onChange={e => setCategory(e.target.value)} 
                            className="w-full p-2 border rounded dark:bg-slate-700"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Content Type</label>
                    <div className="flex flex-wrap gap-2">
                        {['article', 'video', 'pdf', 'link', 'external_course'].map(t => (
                            <button
                                key={t}
                                onClick={() => setContentType(t as any)}
                                className={`px-4 py-2 text-sm rounded-lg border font-medium transition-colors ${
                                    contentType === t 
                                    ? 'bg-hh-red text-white border-hh-red shadow-sm' 
                                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200'
                                }`}
                            >
                                {t.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {contentType === 'external_course' && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 space-y-4 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">External Portal URL</label>
                                <input 
                                    type="text" 
                                    value={resourceUrl} 
                                    onChange={e => setResourceUrl(e.target.value)} 
                                    className="w-full p-2 border rounded bg-white dark:bg-slate-800" 
                                    placeholder="https://partner-portal.com/training"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Platform Name</label>
                                <input 
                                    type="text" 
                                    value={externalPlatform} 
                                    onChange={e => setExternalPlatform(e.target.value)} 
                                    className="w-full p-2 border rounded bg-white dark:bg-slate-800" 
                                    placeholder="e.g. Red Cross, FoodSafe"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Attestation Message (Honor System)</label>
                            <input 
                                type="text" 
                                value={attestation} 
                                onChange={e => setAttestation(e.target.value)} 
                                className="w-full p-2 border rounded bg-white dark:bg-slate-800" 
                                placeholder="e.g. I confirm I have completed this 3rd party training."
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={requireUpload} 
                                onChange={e => setRequireUpload(e.target.checked)} 
                                className="rounded text-emerald-600"
                            />
                            <span className="text-sm font-semibold text-emerald-800">Require learner to upload certificate for verification</span>
                        </label>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Departments</label>
                    <div className="flex flex-wrap gap-2">
                        {allDepartments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => handleDeptChange(dept)}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                    departments.includes(dept) 
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-white text-slate-600 dark:text-slate-300 border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Instructions / Description (HTML)</label>
                    <textarea 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        className="w-full p-2 border rounded font-mono text-sm h-48 dark:bg-slate-700"
                        placeholder="<h3>Section 1</h3><p>Content...</p>"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-hh-red text-white font-semibold rounded hover:bg-hh-red-dark shadow-sm">Save Content</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default SopEditorModal;
