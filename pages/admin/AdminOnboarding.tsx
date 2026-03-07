
import React, { useState } from 'react';
import Card from '../../components/Card';
import BaseModal from '../../components/modals/BaseModal';
import { OnboardingChecklist, OnboardingStep, VolunteerRole, OnboardingStepType, Program } from '../../types';
import { usePersona } from '../../contexts/PersonaContext';

interface AdminOnboardingProps {
    checklists: OnboardingChecklist[];
    roles: VolunteerRole[];
    programs: Program[];
    onSaveChecklist: (checklist: OnboardingChecklist) => void;
    onDeleteChecklist: (id: string) => void;
}

const DOCUMENT_TYPES = ['Background Check', 'Waiver', 'Emergency Contact', 'Government Certificate', 'First Aid', 'Other'];

const AdminOnboarding: React.FC<AdminOnboardingProps> = ({ checklists, roles, programs, onSaveChecklist, onDeleteChecklist }) => {
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [editingChecklist, setEditingChecklist] = useState<OnboardingChecklist | null>(null);
    const { pt, persona } = usePersona();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [roleId, setRoleId] = useState<string>('');
    const [steps, setSteps] = useState<OnboardingStep[]>([]);

    const handleCreateNew = () => {
        setEditingChecklist(null);
        setTitle(`New ${pt('learner')} Workflow`);
        setDescription('');
        setRoleId('');
        setSteps([]);
        setView('builder');
    };

    const handleEdit = (cl: OnboardingChecklist) => {
        setEditingChecklist(cl);
        setTitle(cl.title);
        setDescription(cl.description);
        setRoleId(cl.role_id || '');
        setSteps(cl.steps);
        setView('builder');
    };

    const handleSave = () => {
        if (!title) return alert('Title is required');
        onSaveChecklist({
            checklist_id: editingChecklist?.checklist_id || `cl-${Date.now()}`,
            title, description, role_id: roleId || undefined,
            steps: steps.map((s, i) => ({ ...s, order: i + 1 })),
            persona: persona.type
        });
        setView('list');
    };

    const handleAddStep = () => {
        setSteps([...steps, { step_id: `step-${Date.now()}`, title: 'Untitled Requirement', description: '', type: 'manual_task', order: steps.length + 1 }]);
    };

    if (view === 'builder') {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">🗺️</div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{editingChecklist ? 'Blueprint Editor' : 'Workflow Designer'}</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{pt('readiness')} Orchestration</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setView('list')} className="px-6 py-2 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm">Cancel</button>
                        <button onClick={handleSave} style={{ backgroundColor: persona.accentColor }} className="px-8 py-2 text-white rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all text-sm">
                            Save Blueprint
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Global Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card title="Workflow Scope">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Blueprint Name</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border-2 rounded-xl dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Targeted Role</label>
                                    <select value={roleId} onChange={e => setRoleId(e.target.value)} className="w-full p-3 border-2 rounded-xl dark:bg-slate-700 font-bold">
                                        <option value="">Organization Standard</option>
                                        {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.title}</option>)}
                                    </select>
                                </div>
                            </div>
                        </Card>

                        <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                             <div className="relative z-10">
                                 <h4 className="font-black text-lg mb-2">Automated Triggers</h4>
                                 <p className="text-sm opacity-80 leading-relaxed">This workflow auto-assigns to any new {pt('learner')} matching the scope. Completion instantly updates {pt('readiness')} status.</p>
                             </div>
                             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                        </div>
                    </div>

                    {/* Right Panel: The Visual Step Builder */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center mb-2 px-2">
                             <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Step Pipeline</h3>
                             <button onClick={handleAddStep} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black">
                                 <span>+</span> Add Process Step
                             </button>
                        </div>

                        {steps.length === 0 && (
                            <div className="h-64 border-4 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center text-slate-400 text-center p-8">
                                <div className="text-5xl mb-4 opacity-20">🧱</div>
                                <p className="font-bold">Your pipeline is empty.</p>
                                <p className="text-sm">Start building your {pt('readiness')} roadmap.</p>
                            </div>
                        )}

                        <div className="space-y-4 relative">
                            {steps.map((step, index) => (
                                <div key={step.step_id} className="relative group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                    {index < steps.length - 1 && (
                                        <div className="absolute left-10 top-20 w-1 h-12 bg-slate-200 dark:bg-slate-700 z-0"></div>
                                    )}
                                    <div className="relative z-10 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-md border-2 border-slate-100 dark:border-slate-700 hover:border-blue-400 transition-colors">
                                        <div className="flex gap-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-xl font-black">
                                                    {index + 1}
                                                </div>
                                                <button onClick={() => setSteps(steps.filter((_, i) => i !== index))} className="text-xs font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">DELETE</button>
                                            </div>
                                            
                                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Requirement Title</label>
                                                        <input type="text" value={step.title} onChange={e => {
                                                            const ns = [...steps]; ns[index].title = e.target.value; setSteps(ns);
                                                        }} className="w-full p-2 border-b-2 bg-transparent focus:border-blue-500 outline-none font-bold text-lg" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Logic Type</label>
                                                        <select value={step.type} onChange={e => {
                                                            const ns = [...steps]; ns[index].type = e.target.value as any; ns[index].reference_id = ''; setSteps(ns);
                                                        }} className="w-full p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm font-bold">
                                                            <option value="manual_task">Manual Validation</option>
                                                            <option value="course">LMS Completion</option>
                                                            <option value="document">Artifact Upload</option>
                                                            <option value="external_link">Knowledge Hub Link</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                                                    {step.type === 'course' && (
                                                        <div>
                                                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Linked Program</label>
                                                            <select value={step.reference_id} onChange={e => {
                                                                const ns = [...steps]; ns[index].reference_id = e.target.value; setSteps(ns);
                                                            }} className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 text-sm font-medium">
                                                                <option value="">Select Path...</option>
                                                                {programs.map(p => <option key={p.program_id} value={p.program_id}>{p.title}</option>)}
                                                            </select>
                                                        </div>
                                                    )}
                                                    {step.type === 'document' && (
                                                        <div>
                                                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Evidence Required</label>
                                                            <select value={step.reference_id} onChange={e => {
                                                                const ns = [...steps]; ns[index].reference_id = e.target.value; setSteps(ns);
                                                            }} className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 text-sm font-medium">
                                                                <option value="">Select Type...</option>
                                                                {DOCUMENT_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                                                            </select>
                                                        </div>
                                                    )}
                                                    {step.type === 'manual_task' && <p className="text-xs text-slate-400 font-medium">Learner marks this complete via simple toggle in their dashboard.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card title={`${pt('readiness')} Workflows`}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <p className="text-slate-500 font-medium">Manage the entry roadmap for every {pt('learner')} role.</p>
                </div>
                <button onClick={handleCreateNew} className="bg-hh-red text-white font-black uppercase tracking-widest text-xs py-3 px-8 rounded-2xl hover:bg-hh-red-dark shadow-lg">
                    New Blueprint
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {checklists.filter(cl => !cl.persona || cl.persona === persona.type).map(cl => {
                    const roleName = roles.find(r => r.role_id === cl.role_id)?.title || 'Global Entry';
                    return (
                        <div key={cl.checklist_id} className="p-8 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-800 hover:border-blue-500 transition-all group relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl">🧩</div>
                                    <h3 className="font-black text-xl tracking-tight">{cl.title}</h3>
                                </div>
                                <p className="text-sm text-slate-500 mb-6 font-medium line-clamp-2">{cl.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">{roleName}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(cl)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">✏️</button>
                                        <button onClick={() => onDeleteChecklist(cl.checklist_id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">🗑️</button>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-slate-50 dark:bg-slate-700/30 rounded-full group-hover:scale-110 transition-transform"></div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default AdminOnboarding;
