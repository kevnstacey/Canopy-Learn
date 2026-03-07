
import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { ComplianceDocument, User } from '../../types';

interface DocumentViewerModalProps {
    document: ComplianceDocument;
    user: User;
    onClose: () => void;
    onReview: (docId: string, status: 'Approved' | 'Rejected', notes?: string) => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, user, onClose, onReview }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const handleReject = () => {
        if (!rejectionReason) {
            alert("Please provide a reason for rejection.");
            return;
        }
        onReview(document.document_id, 'Rejected', rejectionReason);
        onClose();
    };

    return (
        <BaseModal title="Document Review" onClose={onClose}>
            <div className="flex flex-col md:flex-row gap-6 h-[70vh]">
                {/* Left: Preview */}
                <div className="flex-grow bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600">
                    <div className="text-center p-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-semibold text-lg text-slate-700 dark:text-slate-200">{document.file_name}</p>
                        <p className="text-sm text-slate-500 mb-4">Preview not available in demo</p>
                        <a href={document.url || '#'} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">Download File</a>
                    </div>
                </div>

                {/* Right: Metadata & Actions */}
                <div className="w-full md:w-80 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">{document.type}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Submitted By</span>
                                    <span className="font-medium">{user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-medium">{new Date(document.uploaded_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Status</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        document.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        document.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>{document.status}</span>
                                </div>
                                {document.issued_at && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Issued</span>
                                        <span className="font-medium">{new Date(document.issued_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {document.expires_at && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Expires</span>
                                        <span className="font-medium">{new Date(document.expires_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {document.notes && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm text-red-800 dark:text-red-200 border border-red-100">
                                <b>Rejection Reason:</b> {document.notes}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                        {isRejecting ? (
                            <div className="animate-fade-in-up">
                                <label className="block text-sm font-medium mb-1">Reason for Rejection</label>
                                <textarea 
                                    className="w-full p-2 border rounded mb-2 text-sm bg-white dark:bg-slate-700 dark:border-slate-600"
                                    rows={3}
                                    placeholder="e.g. Document is blurry, expired, or incorrect type."
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => setIsRejecting(false)} className="flex-1 py-2 border rounded text-sm hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button>
                                    <button onClick={handleReject} className="flex-1 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Confirm Reject</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setIsRejecting(true)}
                                    className="flex-1 py-3 border border-red-200 text-red-700 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    Reject
                                </button>
                                <button 
                                    onClick={() => { onReview(document.document_id, 'Approved'); onClose(); }}
                                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Approve
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default DocumentViewerModal;
