
import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import BaseModal from '../../components/modals/BaseModal';
import { Policy } from '../../types';

interface AdminPoliciesProps {
    policies: Policy[];
    onSavePolicy: (policy: Policy) => void;
    onDeletePolicy: (id: string) => void;
}

const AdminPolicies: React.FC<AdminPoliciesProps> = ({ policies, onSavePolicy, onDeletePolicy }) => {
    const [search, setSearch] = useState('');
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter
    const filteredPolicies = useMemo(() => 
        policies.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.created_at - a.created_at),
    [policies, search]);

    // Modal State
    const [title, setTitle] = useState('');
    const [version, setVersion] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<Policy['status']>('draft');

    const handleCreate = () => {
        setEditingPolicy(null);
        setTitle('');
        setVersion('1.0');
        setContent('');
        setStatus('draft');
        setIsModalOpen(true);
    };

    const handleEdit = (p: Policy) => {
        setEditingPolicy(p);
        setTitle(p.title);
        setVersion(p.version);
        setContent(p.content);
        setStatus(p.status);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!title || !content || !version) {
            alert("All fields are required.");
            return;
        }

        const newPolicy: Policy = {
            policy_id: editingPolicy?.policy_id || `pol-${Date.now()}`,
            series_id: editingPolicy?.series_id || `series-${Date.now()}`,
            title,
            version,
            content,
            status,
            effective_date: editingPolicy?.effective_date || Date.now(),
            created_at: editingPolicy?.created_at || Date.now()
        };

        // Supersede logic: If activating, archive other active policies in same series
        if (status === 'active') {
            const others = policies.filter(p => p.series_id === newPolicy.series_id && p.policy_id !== newPolicy.policy_id && p.status === 'active');
            others.forEach(other => {
                onSavePolicy({ ...other, status: 'archived' });
            });
        }

        onSavePolicy(newPolicy);
        setIsModalOpen(false);
    };

    return (
        <Card title="Policy Management">
            <div className="flex justify-between items-center mb-6">
                <input 
                    type="text" 
                    placeholder="Search policies..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="p-2 border rounded w-64 dark:bg-slate-700 dark:border-slate-600"
                />
                <button onClick={handleCreate} className="bg-hh-red text-white font-semibold py-2 px-4 rounded-lg hover:bg-hh-red-dark">
                    + New Policy
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-slate-500 font-semibold text-xs">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Version</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Effective Date</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                        {filteredPolicies.map(p => (
                            <tr key={p.policy_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-3 font-medium">{p.title}</td>
                                <td className="px-4 py-3">{p.version}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                                        p.status === 'active' ? 'bg-green-100 text-green-800' :
                                        p.status === 'archived' ? 'bg-slate-200 text-slate-600' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{new Date(p.effective_date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => { if(confirm('Delete?')) onDeletePolicy(p.policy_id); }} className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {filteredPolicies.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-slate-500">No policies found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <BaseModal title={editingPolicy ? 'Edit Policy' : 'Create Policy'} onClose={() => setIsModalOpen(false)}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Version</label>
                                <input type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full p-2 border rounded" placeholder="1.0" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2 border rounded">
                                <option value="draft">Draft</option>
                                <option value="active">Active (Publishes)</option>
                                <option value="archived">Archived</option>
                            </select>
                            {status === 'active' && <p className="text-xs text-orange-600 mt-1">Warning: Activating this version will archive all other versions of this policy.</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Content (HTML)</label>
                            <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full p-2 border rounded h-64 font-mono text-sm" placeholder="<h3>Policy Header</h3><p>Content...</p>" />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-hh-red text-white rounded font-bold">Save Policy</button>
                        </div>
                    </div>
                </BaseModal>
            )}
        </Card>
    );
};

export default AdminPolicies;
