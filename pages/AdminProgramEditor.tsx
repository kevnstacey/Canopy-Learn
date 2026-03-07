
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/Card';
import BaseModal from '../components/modals/BaseModal';
import LessonPickerModal from '../components/modals/LessonPickerModal';
import { Program, Module, Lesson, Quiz, AssessmentTemplate, Requirement, RequirementType, Policy } from '../types';

interface AdminProgramEditorProps {
    program: Program;
    allModules: Module[];
    allLessons: Lesson[];
    allQuizzes: Quiz[];
    allTemplates: AssessmentTemplate[];
    allPolicies?: Policy[]; // Added
    existingRequirements: Requirement[];
    onSave: (program: Program, requirements: Requirement[], modules: Module[]) => void;
    onPublishVersion?: (program: Program, retrainingRequired: boolean) => void;
    onCancel: () => void;
}

type EditorTab = 'Structure' | 'Requirements' | 'Certificates';

// Helper to get title for reference ID
const getReferenceTitle = (type: RequirementType, refId: string, lessons: Lesson[], quizzes: Quiz[], templates: AssessmentTemplate[], policies: Policy[] = []) => {
    if (type === 'lesson_view') return lessons.find(l => l.lesson_id === refId)?.title || refId;
    if (type === 'quiz_pass') return quizzes.find(q => q.quiz_id === refId)?.title || refId;
    if (type === 'practical_submit') return templates.find(t => t.assessment_template_id === refId)?.title || refId;
    if (type === 'policy_acknowledgment') return policies.find(p => p.policy_id === refId)?.title || refId;
    return refId;
};

const AdminProgramEditor: React.FC<AdminProgramEditorProps> = ({ 
    program, allModules, allLessons, allQuizzes, allTemplates, allPolicies = [], existingRequirements, onSave, onPublishVersion, onCancel 
}) => {
    const [activeTab, setActiveTab] = useState<EditorTab>('Requirements');
    const [localProgram, setLocalProgram] = useState<Program>({ ...program });
    const [localRequirements, setLocalRequirements] = useState<Requirement[]>([...existingRequirements]);
    
    // Module State - Initialize with existing modules for this program or empty
    const [localModules, setLocalModules] = useState<Module[]>(() => {
        return allModules.filter(m => program.module_ids.includes(m.module_id)).sort((a,b) => a.order - b.order);
    });

    // Modal States
    const [editingReq, setEditingReq] = useState<Requirement | null>(null);
    const [isReqModalOpen, setIsReqModalOpen] = useState(false);
    const [pickingLessonForModuleId, setPickingLessonForModuleId] = useState<string | null>(null);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [retrainingRequired, setRetrainingRequired] = useState(false);

    // --- HANDLERS ---

    const handleSaveReq = (req: Requirement) => {
        const exists = localRequirements.find(r => r.requirement_id === req.requirement_id);
        if (exists) {
            setLocalRequirements(prev => prev.map(r => r.requirement_id === req.requirement_id ? req : r));
        } else {
            setLocalRequirements(prev => [...prev, req]);
        }
        setIsReqModalOpen(false);
        setEditingReq(null);
    };

    const handleDeleteReq = (reqId: string) => {
        if(confirm("Delete this requirement?")) {
            setLocalRequirements(prev => prev.filter(r => r.requirement_id !== reqId));
        }
    };

    const moveReq = (index: number, direction: 'up' | 'down') => {
        const newReqs = [...localRequirements];
        if (direction === 'up' && index > 0) {
            [newReqs[index], newReqs[index-1]] = [newReqs[index-1], newReqs[index]];
        } else if (direction === 'down' && index < newReqs.length - 1) {
             [newReqs[index], newReqs[index+1]] = [newReqs[index+1], newReqs[index]];
        }
        setLocalRequirements(newReqs);
    };

    const openNewReqModal = () => {
        const newReq: Requirement = {
            requirement_id: `req-${Date.now()}`,
            program_id: localProgram.program_id,
            type: 'lesson_view',
            reference_id: '',
            description: '',
            required: true,
            prerequisite_requirement_ids: [],
            contributes_to_readiness: true,
            contributes_to_certificate: true
        };
        setEditingReq(newReq);
        setIsReqModalOpen(true);
    };
    
    // --- MODULE HANDLERS ---
    
    const handleAddModule = () => {
        const newModule: Module = {
            module_id: `mod-${Date.now()}`,
            program_id: localProgram.program_id,
            title: 'New Module',
            order: localModules.length + 1,
            lesson_ids: []
        };
        setLocalModules(prev => [...prev, newModule]);
        setLocalProgram(prev => ({
            ...prev,
            module_ids: [...prev.module_ids, newModule.module_id]
        }));
    };

    const handleUpdateModuleTitle = (id: string, newTitle: string) => {
        setLocalModules(prev => prev.map(m => m.module_id === id ? { ...m, title: newTitle } : m));
    };

    const handleLessonPick = (lessonId: string) => {
        if (!pickingLessonForModuleId) return;
        
        // Add lesson to module
        setLocalModules(prev => prev.map(m => {
            if (m.module_id === pickingLessonForModuleId) {
                // Prevent duplicates
                if (m.lesson_ids.includes(lessonId)) return m;
                return { ...m, lesson_ids: [...m.lesson_ids, lessonId] };
            }
            return m;
        }));
        
        setPickingLessonForModuleId(null);
    };

    const handleRemoveLessonFromModule = (moduleId: string, lessonId: string) => {
        setLocalModules(prev => prev.map(m => {
            if (m.module_id === moduleId) {
                return { ...m, lesson_ids: m.lesson_ids.filter(id => id !== lessonId) };
            }
            return m;
        }));
    };

    const handleSaveAll = () => {
        onSave(localProgram, localRequirements, localModules);
    };

    const handlePublishClick = () => {
        if (localProgram.status === 'published' && onPublishVersion) {
            setIsPublishModalOpen(true);
        } else {
            // Just save if draft or no versioning support
            onSave({ ...localProgram, status: 'published' }, localRequirements, localModules);
        }
    };

    const confirmPublish = () => {
        if (onPublishVersion) {
            // Save state first to ensure consistency? 
            // The handler in ManagerPortal handles state updates, so we just pass intent.
            onPublishVersion(localProgram, retrainingRequired);
            setIsPublishModalOpen(false);
        }
    };

    // --- RENDERERS ---

    const renderStructure = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold">Course Content</h3>
                    <p className="text-sm text-slate-500">Organize content into modules. This is what the learner sees.</p>
                </div>
                <button 
                    onClick={handleAddModule}
                    className="text-sm bg-slate-200 text-slate-800 px-3 py-2 rounded font-semibold hover:bg-slate-300 transition-colors"
                >
                    + Add Module
                </button>
            </div>
            
            {localModules.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                    No modules yet. Add one to structure your content.
                </div>
            )}

            {localModules.map((mod, index) => (
                <div key={mod.module_id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-center mb-3">
                        <input 
                            type="text" 
                            value={mod.title} 
                            onChange={(e) => handleUpdateModuleTitle(mod.module_id, e.target.value)}
                            className="font-semibold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-hh-red focus:outline-none px-1"
                        />
                        <span className="text-xs text-slate-400">Module {index + 1}</span>
                    </div>
                    
                    <ul className="pl-2 space-y-2 mb-3">
                        {mod.lesson_ids.map(lid => {
                            const lesson = allLessons.find(l => l.lesson_id === lid);
                            const isExternal = lesson?.contentType === 'external_course';
                            return (
                                <li key={lid} className={`text-sm p-2 rounded border flex justify-between items-center ${isExternal ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400">{isExternal ? '🌐' : '📄'}</span>
                                        <span className="font-medium">{lesson?.title || lid} {isExternal && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 rounded ml-2">EXTERNAL</span>}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveLessonFromModule(mod.module_id, lid)}
                                        className="text-xs text-red-500 hover:underline px-2"
                                    >
                                        Remove
                                    </button>
                                </li>
                            );
                        })}
                        {mod.lesson_ids.length === 0 && <li className="text-xs text-slate-400 italic pl-2">No lessons added.</li>}
                    </ul>
                    
                    <button 
                        onClick={() => setPickingLessonForModuleId(mod.module_id)}
                        className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 pl-2"
                    >
                        + Add Content from Library
                    </button>
                </div>
            ))}
        </div>
    );

    const renderRequirements = () => (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold">Program Requirements</h3>
                    <p className="text-sm text-slate-500">Define what a learner must do to complete this program.</p>
                </div>
                <button onClick={openNewReqModal} className="bg-hh-red text-white font-semibold py-2 px-4 rounded hover:bg-hh-red-dark">
                    + Add Requirement
                </button>
            </div>
            
            {localRequirements.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-300 rounded-lg text-slate-500">
                    No requirements defined. Add one to get started.
                </div>
            ) : (
                <div className="space-y-3">
                    {localRequirements.map((req, idx) => (
                        <div key={req.requirement_id} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                            <div className="flex flex-col gap-1 text-slate-400">
                                <button onClick={() => moveReq(idx, 'up')} disabled={idx === 0} className="hover:text-hh-red disabled:opacity-30">▲</button>
                                <button onClick={() => moveReq(idx, 'down')} disabled={idx === localRequirements.length -1} className="hover:text-hh-red disabled:opacity-30">▼</button>
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wide ${
                                        req.type === 'lesson_view' ? 'bg-blue-100 text-blue-800' : 
                                        req.type === 'quiz_pass' ? 'bg-purple-100 text-purple-800' :
                                        req.type === 'practical_submit' ? 'bg-orange-100 text-orange-800' : 
                                        req.type === 'policy_acknowledgment' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100'
                                    }`}>{req.type.replace('_', ' ')}</span>
                                    {req.required && <span className="text-xs text-red-600 font-semibold">*Required</span>}
                                </div>
                                <div className="font-semibold">{req.description || getReferenceTitle(req.type, req.reference_id, allLessons, allQuizzes, allTemplates, allPolicies)}</div>
                                <div className="text-xs text-slate-500 mt-1 flex gap-3">
                                    <span>ID: {req.requirement_id}</span>
                                    {req.prerequisite_requirement_ids.length > 0 && (
                                        <span>Prereqs: {req.prerequisite_requirement_ids.join(', ')}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-end text-xs text-slate-500 mr-2">
                                    <span title="Contributes to Readiness">{req.contributes_to_readiness ? '✅ Readiness' : '⬜ Readiness'}</span>
                                    <span title="Contributes to Certificate">{req.contributes_to_certificate ? '✅ Certificate' : '⬜ Certificate'}</span>
                                </div>
                                <button onClick={() => { setEditingReq(req); setIsReqModalOpen(true); }} className="text-slate-500 hover:text-blue-600 p-2">Edit</button>
                                <button onClick={() => handleDeleteReq(req.requirement_id)} className="text-slate-500 hover:text-red-600 p-2">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCertificates = () => (
        <div className="space-y-6 max-w-2xl">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                <p><strong>Note:</strong> Certificates are automatically issued when all requirements marked "Contributes to Certificate" are completed with a status of "Approved" or "Completed".</p>
            </div>

            <div>
                <label className="block font-medium mb-1">Certificate Name Template</label>
                <input type="text" className="w-full p-2 border rounded" defaultValue="{Program Name} Certified" />
                <p className="text-xs text-slate-500 mt-1">Use <code>{`{Program Name}`}</code> to insert the program title dynamically.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-medium mb-1">Validity Period</label>
                    <div className="flex gap-2">
                        <input type="number" className="w-full p-2 border rounded" defaultValue="1" />
                        <select className="p-2 border rounded bg-slate-50">
                            <option>Years</option>
                            <option>Months</option>
                        </select>
                    </div>
                </div>
                <div>
                     <label className="block font-medium mb-1">Renewal Window</label>
                     <div className="flex gap-2">
                        <input type="number" className="w-full p-2 border rounded" defaultValue="30" />
                        <span className="p-2 text-slate-500">Days before expiry</span>
                    </div>
                </div>
            </div>

            <div className="border-t pt-4">
                <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="font-medium">Enable Automatic Renewal Assignment</span>
                </label>
                <p className="text-sm text-slate-500 ml-6 mt-1">If checked, the program will be re-assigned to the learner when the renewal window opens.</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen pb-12">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-20 px-6 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <input 
                             type="text" 
                             value={localProgram.title} 
                             onChange={e => setLocalProgram({...localProgram, title: e.target.value})}
                             className="bg-transparent border-b border-dashed border-slate-400 focus:border-hh-red outline-none"
                        />
                        <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-wide border ${
                            localProgram.status === 'published' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                            {localProgram.status} v{localProgram.version || '1.0'}
                        </span>
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 text-slate-600">Cancel</button>
                    <button onClick={handleSaveAll} className="px-4 py-2 bg-slate-100 text-slate-800 rounded hover:bg-slate-200 font-semibold border border-slate-200">Save Draft</button>
                    {onPublishVersion && localProgram.status === 'published' ? (
                        <button onClick={handlePublishClick} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold">Publish New Version</button>
                    ) : (
                        <button onClick={handlePublishClick} className="px-4 py-2 bg-hh-red text-white rounded hover:bg-hh-red-dark font-semibold">Publish</button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-6 py-6">
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex mb-8">
                    {(['Structure', 'Requirements', 'Certificates'] as EditorTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === tab ? 'bg-white dark:bg-slate-700 shadow text-hh-red' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                    {activeTab === 'Structure' && renderStructure()}
                    {activeTab === 'Requirements' && renderRequirements()}
                    {activeTab === 'Certificates' && renderCertificates()}
                </div>
            </div>

            {/* Requirement Modal */}
            {isReqModalOpen && editingReq && (
                <RequirementEditorModal 
                    req={editingReq}
                    allLessons={allLessons}
                    allQuizzes={allQuizzes}
                    allTemplates={allTemplates}
                    allPolicies={allPolicies}
                    otherReqs={localRequirements.filter(r => r.requirement_id !== editingReq.requirement_id)}
                    onSave={handleSaveReq}
                    onClose={() => setIsReqModalOpen(false)}
                />
            )}
            
            {/* Lesson Picker Modal */}
            {pickingLessonForModuleId && (
                <LessonPickerModal 
                    lessons={allLessons}
                    onSelect={handleLessonPick}
                    onClose={() => setPickingLessonForModuleId(null)}
                />
            )}

            {/* Publish Version Modal */}
            {isPublishModalOpen && (
                <BaseModal title="Publish New Version" onClose={() => setIsPublishModalOpen(false)}>
                    <div className="space-y-4">
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-200">
                            <p className="font-bold mb-1">You are about to publish a new version.</p>
                            <p>This will create a copy of the program and increment the version number.</p>
                        </div>
                        
                        <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                            <input 
                                type="checkbox" 
                                checked={retrainingRequired} 
                                onChange={e => setRetrainingRequired(e.target.checked)} 
                                className="mt-1 w-5 h-5 text-hh-red rounded"
                            />
                            <div>
                                <span className="font-bold block">Require Retraining for Existing Learners</span>
                                <span className="text-sm text-slate-500 block mt-1">
                                    If checked, learners who completed the previous version will be marked as "Update Required" and must complete this new version to maintain readiness.
                                </span>
                            </div>
                        </label>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button onClick={() => setIsPublishModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                            <button onClick={confirmPublish} className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700">Confirm & Publish</button>
                        </div>
                    </div>
                </BaseModal>
            )}
        </div>
    );
};

// --- Sub-Component: Requirement Editor Modal ---

const RequirementEditorModal: React.FC<{
    req: Requirement;
    allLessons: Lesson[];
    allQuizzes: Quiz[];
    allTemplates: AssessmentTemplate[];
    allPolicies: Policy[];
    otherReqs: Requirement[];
    onSave: (r: Requirement) => void;
    onClose: () => void;
}> = ({ req, allLessons, allQuizzes, allTemplates, allPolicies, otherReqs, onSave, onClose }) => {
    const [formData, setFormData] = useState<Requirement>({ ...req });

    // Populate description automatically if empty when ref changes
    useEffect(() => {
        if (!formData.description && formData.reference_id) {
            const title = getReferenceTitle(formData.type, formData.reference_id, allLessons, allQuizzes, allTemplates, allPolicies);
            let action = 'Complete';
            if (formData.type === 'quiz_pass') action = 'Pass';
            if (formData.type === 'practical_submit') action = 'Submit';
            if (formData.type === 'policy_acknowledgment') action = 'Acknowledge';
            
            setFormData(prev => ({ ...prev, description: `${action}: ${title}` }));
        }
    }, [formData.reference_id, formData.type]); // eslint-disable-line

    const availableRefs = useMemo(() => {
        switch(formData.type) {
            case 'lesson_view': return allLessons.map(l => ({ id: l.lesson_id, title: l.title }));
            case 'quiz_pass': return allQuizzes.map(q => ({ id: q.quiz_id, title: q.title }));
            case 'practical_submit': return allTemplates.map(t => ({ id: t.assessment_template_id, title: t.title }));
            case 'policy_acknowledgment': return allPolicies.filter(p => p.status === 'active').map(p => ({ id: p.policy_id, title: `${p.title} (v${p.version})` }));
            default: return [];
        }
    }, [formData.type, allLessons, allQuizzes, allTemplates, allPolicies]);

    return (
        <BaseModal title={req.requirement_id.startsWith('req-') ? 'Add Requirement' : 'Edit Requirement'} onClose={onClose}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Requirement Type</label>
                        <select 
                            value={formData.type} 
                            onChange={e => setFormData({ ...formData, type: e.target.value as RequirementType, reference_id: '' })}
                            className="w-full p-2 border rounded"
                        >
                            <option value="lesson_view">Lesson View</option>
                            <option value="quiz_pass">Quiz Pass</option>
                            <option value="practical_submit">Practical Submission</option>
                            <option value="policy_acknowledgment">Policy Acknowledgment</option>
                            <option value="roleplay_complete">Roleplay Complete</option>
                            <option value="form_ack">Form Acknowledgment</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Reference Item</label>
                        <select 
                            value={formData.reference_id}
                            onChange={e => setFormData({ ...formData, reference_id: e.target.value })}
                            className="w-full p-2 border rounded"
                            disabled={availableRefs.length === 0}
                        >
                            <option value="">-- Select Item --</option>
                            {availableRefs.map(item => (
                                <option key={item.id} value={item.id}>{item.title}</option>
                            ))}
                        </select>
                        {availableRefs.length === 0 && <p className="text-xs text-orange-500 mt-1">No items found for this type.</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Display Description</label>
                    <input 
                        type="text" 
                        value={formData.description} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="e.g. Complete Ladder Safety Lesson"
                    />
                </div>

                <div>
                     <label className="block text-sm font-medium mb-1">Prerequisites</label>
                     <p className="text-xs text-slate-500 mb-2">Select requirements that must be completed before this one unlocks.</p>
                     <div className="border rounded p-2 max-h-32 overflow-y-auto bg-slate-50">
                        {otherReqs.map(r => (
                            <label key={r.requirement_id} className="flex items-center gap-2 mb-1 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.prerequisite_requirement_ids.includes(r.requirement_id)}
                                    onChange={e => {
                                        const newPrereqs = e.target.checked 
                                            ? [...formData.prerequisite_requirement_ids, r.requirement_id]
                                            : formData.prerequisite_requirement_ids.filter(id => id !== r.requirement_id);
                                        setFormData({ ...formData, prerequisite_requirement_ids: newPrereqs });
                                    }}
                                />
                                <span className="text-sm truncate">{r.description}</span>
                            </label>
                        ))}
                        {otherReqs.length === 0 && <span className="text-sm text-slate-400">No other requirements available.</span>}
                     </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.required} onChange={e => setFormData({ ...formData, required: e.target.checked })} />
                        <span className="text-sm font-medium">Mandatory</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.contributes_to_readiness} onChange={e => setFormData({ ...formData, contributes_to_readiness: e.target.checked })} />
                        <span className="text-sm font-medium">Counts to Readiness</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.contributes_to_certificate} onChange={e => setFormData({ ...formData, contributes_to_certificate: e.target.checked })} />
                        <span className="text-sm font-medium">Required for Cert</span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                    <button onClick={() => onSave(formData)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save Requirement</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default AdminProgramEditor;
