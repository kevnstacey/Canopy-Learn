
import React, { useState, useRef } from 'react';
import Card from '../../components/Card';
import { ComplianceDocument, User } from '../../types';

interface LearnerDocumentsProps {
    documents: ComplianceDocument[];
    user: User;
    onUpload: (doc: ComplianceDocument) => void;
}

const DOCUMENT_TYPES = ['Background Check', 'Waiver', 'Emergency Contact', 'Government Certificate', 'First Aid', 'Other'];

const LearnerDocuments: React.FC<LearnerDocumentsProps> = ({ documents, user, onUpload }) => {
    const [view, setView] = useState<'list' | 'upload'>('list');
    
    // Upload State
    const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0]);
    const [file, setFile] = useState<File | null>(null);
    const [issuedDate, setIssuedDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            if (f.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File is too large. Max 5MB.");
                return;
            }
            setFile(f);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file.");
            return;
        }

        const newDoc: ComplianceDocument = {
            document_id: `doc-${Date.now()}`,
            user_id: user.user_id,
            type: selectedType,
            status: 'Pending',
            file_name: file.name,
            uploaded_at: Date.now(),
            issued_at: issuedDate ? new Date(issuedDate).getTime() : undefined,
            expires_at: expiryDate ? new Date(expiryDate).getTime() : undefined,
            // In a real app, we'd upload to cloud storage here and get a URL
            url: '#' 
        };

        onUpload(newDoc);
        // Reset form
        setFile(null);
        setIssuedDate('');
        setExpiryDate('');
        setView('list');
    };

    if (view === 'upload') {
        return (
            <Card title="Upload Document">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium mb-1">Document Type</label>
                        <select 
                            value={selectedType} 
                            onChange={e => setSelectedType(e.target.value)}
                            className="w-full p-2 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                        >
                            {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">File (PDF, JPG, PNG)</label>
                        <div 
                            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                            />
                            {file ? (
                                <div className="text-green-600 font-semibold">{file.name}</div>
                            ) : (
                                <span className="text-slate-500">Click to upload file (Max 5MB)</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Issued Date</label>
                            <input 
                                type="date" 
                                value={issuedDate} 
                                onChange={e => setIssuedDate(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expiry Date <span className="text-slate-400 font-normal">(Optional)</span></label>
                            <input 
                                type="date" 
                                value={expiryDate} 
                                onChange={e => setExpiryDate(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setView('list')}
                            className="px-4 py-2 border rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-6 py-2 bg-hh-red text-white font-bold rounded hover:bg-hh-red-dark shadow-md"
                        >
                            Submit Document
                        </button>
                    </div>
                </form>
            </Card>
        );
    }

    return (
        <Card title="My Compliance Documents">
            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-slate-500">Manage your required certifications and forms.</p>
                <button 
                    onClick={() => setView('upload')}
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                >
                    + Upload Document
                </button>
            </div>

            {documents.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500">No documents uploaded yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {documents.map(doc => (
                        <div key={doc.document_id} className="flex flex-col md:flex-row justify-between md:items-center p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${
                                    doc.status === 'Approved' ? 'bg-green-100 text-green-600' :
                                    doc.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                    'bg-yellow-100 text-yellow-600'
                                }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{doc.type}</h4>
                                    <p className="text-xs text-slate-500">{doc.file_name} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                    {doc.status === 'Rejected' && doc.notes && (
                                        <p className="text-xs text-red-600 mt-1 font-medium">Reason: {doc.notes}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-3 md:mt-0 flex items-center gap-4 text-sm">
                                {doc.expires_at && (
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Expires</p>
                                        <p className={doc.expires_at < Date.now() ? 'text-red-600 font-bold' : 'font-medium'}>
                                            {new Date(doc.expires_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                    doc.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {doc.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default LearnerDocuments;
