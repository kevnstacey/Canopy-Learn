
import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import BaseModal from '../../components/modals/BaseModal';
import { VolunteerRole, Program } from '../../types';
import { usePersona } from '../../contexts/PersonaContext';

interface AdminRolesProps {
    roles: VolunteerRole[];
    programs: Program[];
    onSaveRole: (role: VolunteerRole) => void;
    onDeleteRole: (roleId: string) => void;
}

const DOCUMENT_TYPES = ['Background Check', 'Waiver', 'Emergency Contact', 'Government Certificate', 'First Aid', 'Other', 'Student Photo ID', 'Immunization Record', 'CPR Level C', 'OSHA-30 Card'];

const AdminRoles: React.FC<AdminRolesProps> = ({ roles, programs, onSaveRole, onDeleteRole }) => {
    const [editingRole, setEditingRole] = useState<VolunteerRole | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { pt, persona } = usePersona();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);

    const filteredRoles = useMemo(() => {
        return roles.filter(r => !r.persona || r.persona === persona.type);
    }, [roles, persona]);

    const filteredPrograms = useMemo(() => {
        return programs.filter(p => !p.persona || p.persona === persona.type);
    }, [programs, persona]);

    const handleCreateNew = () => {
        setEditingRole(null);
        setTitle('');
        setDescription('');
        setSelectedCourseIds([]);
        setSelectedDocTypes([]);
        setIsModalOpen(true);
    };

    const handleEdit = (role: VolunteerRole) => {
        setEditingRole(role);
        setTitle(role.title);
        setDescription(role.description);
        setSelectedCourseIds(role.required_course_ids || []);
        setSelectedDocTypes(role.required_document_types || []);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!title) return alert('Role title is required');
        onSaveRole({
            role_id: editingRole?.role_id || `role-${Date.now()}`,
            title, description, required_course_ids: selectedCourseIds,
            required_document_types: selectedDocTypes,
            persona: persona.type
        });
        setIsModalOpen(false);
    };

    const toggleSelection = (list: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (list.includes(item)) setter(list.filter(i => i !== item));
        else setter([...list, item]);
    };

    return (
        <Card title={`Role Definitions (${persona.type})`}>
            <div className="flex justify-between items-center mb-8">
                <p className="text-slate-500 font-medium">Define industry-specific roles and their prerequisites.</p>
                <button onClick={handleCreateNew} className="bg-hh-red text-white font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl hover:bg-hh-red-dark shadow-lg">
                    + Create Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRoles.map(role => (
                    <div key={role.role_id} className="p-6 border-2 border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-800 hover:border-blue-400 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-black text-xl tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{role.title}</h3>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(role)} className="p-2 text-slate-400 hover:text-blue-600">✏️</button>
                                    <button onClick={() => onDeleteRole(role.role_id)} className="p-2 text-slate-400 hover:text-red-600">🗑️</button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">{role.description}</p>
                            
                            <div className="flex flex-wrap gap-2">
                                {role.required_course_ids.map(id => (
                                    <span key={id} className="text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
                                        🎓 {programs.find(p => p.program_id === id)?.title || id}
                                    </span>
                                ))}
                                {role.required_document_types?.map(doc => (
                                    <span key={doc} className="text-[9px] font-black uppercase tracking-wider bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg border border-orange-100">
                                        📄 {doc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <BaseModal title={editingRole ? 'Edit Role' : 'Create Role'} onClose={() => setIsModalOpen(false)}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Role Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border-2 rounded-xl dark:bg-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border-2 rounded-xl dark:bg-slate-700 font-medium" rows={2} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-600">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3">Required Paths</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {filteredPrograms.map(prog => (
                                        <label key={prog.program_id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-xl transition-colors">
                                            <input type="checkbox" checked={selectedCourseIds.includes(prog.program_id)} onChange={() => toggleSelection(selectedCourseIds, prog.program_id, setSelectedCourseIds)} className="rounded text-hh-red" />
                                            <span className="text-xs font-bold">{prog.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-600">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3">Required Documents</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {DOCUMENT_TYPES.map(doc => (
                                        <label key={doc} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-xl transition-colors">
                                            <input type="checkbox" checked={selectedDocTypes.includes(doc)} onChange={() => toggleSelection(selectedDocTypes, doc, setSelectedDocTypes)} className="rounded text-hh-red" />
                                            <span className="text-xs font-bold">{doc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border-2 rounded-xl font-bold">Cancel</button>
                            <button onClick={handleSave} className="px-8 py-2 bg-hh-red text-white rounded-xl font-bold shadow-lg">Save Role</button>
                        </div>
                    </div>
                </BaseModal>
            )}
        </Card>
    );
};

export default AdminRoles;
