
import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { ComplianceDocument, User } from '../../types';
import DocumentViewerModal from '../../components/modals/DocumentViewerModal';

interface AdminDocumentQueueProps {
    documents: ComplianceDocument[];
    users: User[];
    onReviewDocument: (docId: string, status: 'Approved' | 'Rejected', notes?: string) => void;
}

const AdminDocumentQueue: React.FC<AdminDocumentQueueProps> = ({ documents, users, onReviewDocument }) => {
    const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

    const filteredDocs = useMemo(() => {
        let docs = documents;
        if (statusFilter !== 'All') {
            docs = docs.filter(d => d.status === statusFilter);
        }
        // Sort by oldest first
        return docs.sort((a, b) => a.uploaded_at - b.uploaded_at);
    }, [documents, statusFilter]);

    const handleCheck = (id: string) => {
        const newChecked = new Set(checkedIds);
        if (newChecked.has(id)) newChecked.delete(id);
        else newChecked.add(id);
        setCheckedIds(newChecked);
    };

    const handleBulkApprove = () => {
        if (!confirm(`Approve ${checkedIds.size} documents?`)) return;
        checkedIds.forEach(id => onReviewDocument(id, 'Approved'));
        setCheckedIds(new Set());
    };

    const activeDoc = documents.find(d => d.document_id === selectedDocId);
    const activeUser = activeDoc ? users.find(u => u.user_id === activeDoc.user_id) : undefined;

    return (
        <Card title="Compliance Document Queue">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex gap-2">
                    {['Pending', 'Approved', 'Rejected', 'All'].map(s => (
                        <button 
                            key={s}
                            onClick={() => setStatusFilter(s as any)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                statusFilter === s 
                                ? 'bg-hh-red text-white' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                
                {checkedIds.size > 0 && (
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 animate-fade-in-up">
                        <span className="text-sm font-bold text-blue-800 dark:text-blue-200">{checkedIds.size} selected</span>
                        <button 
                            onClick={handleBulkApprove}
                            className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-green-700"
                        >
                            Approve Selected
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 uppercase text-slate-500 font-semibold text-xs">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                <input 
                                    type="checkbox" 
                                    onChange={(e) => {
                                        if (e.target.checked) setCheckedIds(new Set(filteredDocs.map(d => d.document_id)));
                                        else setCheckedIds(new Set());
                                    }}
                                    checked={filteredDocs.length > 0 && checkedIds.size === filteredDocs.length}
                                    className="rounded text-hh-red focus:ring-hh-red"
                                />
                            </th>
                            <th className="px-4 py-3">Volunteer</th>
                            <th className="px-4 py-3">Document Type</th>
                            <th className="px-4 py-3">Uploaded</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                        {filteredDocs.map(doc => {
                            const user = users.find(u => u.user_id === doc.user_id);
                            return (
                                <tr key={doc.document_id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${checkedIds.has(doc.document_id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input 
                                            type="checkbox" 
                                            checked={checkedIds.has(doc.document_id)}
                                            onChange={() => handleCheck(doc.document_id)}
                                            className="rounded text-hh-red focus:ring-hh-red"
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                        {user?.name || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{doc.type}</div>
                                        <div className="text-xs text-slate-500">{doc.file_name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {new Date(doc.uploaded_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                            doc.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => setSelectedDocId(doc.document_id)}
                                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 dark:bg-slate-700 px-3 py-1.5 rounded hover:bg-blue-100 dark:hover:bg-slate-600"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredDocs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No documents found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {activeDoc && activeUser && (
                <DocumentViewerModal 
                    document={activeDoc} 
                    user={activeUser}
                    onClose={() => setSelectedDocId(null)}
                    onReview={onReviewDocument}
                />
            )}
        </Card>
    );
};

export default AdminDocumentQueue;
