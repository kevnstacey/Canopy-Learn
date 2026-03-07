
import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { Override } from '../../types';

interface OverrideModalProps {
    userId: string;
    targetId: string;
    targetType: Override['target_type'];
    targetTitle: string;
    currentAdminId: string;
    onSave: (override: Override) => void;
    onClose: () => void;
}

const OverrideModal: React.FC<OverrideModalProps> = ({ 
    userId, targetId, targetType, targetTitle, currentAdminId, onSave, onClose 
}) => {
    const [action, setAction] = useState<Override['action']>(
        targetType === 'Certificate' ? 'Extend Expiry' : 'Mark Completed'
    );
    const [reason, setReason] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    const handleSave = () => {
        if (!reason.trim()) {
            alert("Reason is required for auditing purposes.");
            return;
        }

        if (action === 'Extend Expiry' && !expiryDate) {
            alert("Please select a new expiration date.");
            return;
        }

        const override: Override = {
            override_id: `ov-${Date.now()}`,
            user_id: userId,
            target_id: targetId,
            target_type: targetType,
            action: action,
            reason: reason,
            value: action === 'Extend Expiry' ? new Date(expiryDate).getTime() : undefined,
            created_by: currentAdminId,
            created_at: Date.now()
        };

        onSave(override);
        onClose();
    };

    return (
        <BaseModal title={`Admin Override: ${targetTitle}`} onClose={onClose}>
            <div className="space-y-4">
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-200 text-sm">
                    <strong>Warning:</strong> This action overrides system rules. It will be logged in the audit trail.
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Action</label>
                    <select 
                        value={action} 
                        onChange={(e) => setAction(e.target.value as any)}
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                    >
                        {targetType === 'Certificate' ? (
                            <option value="Extend Expiry">Extend Expiry Date</option>
                        ) : (
                            <>
                                <option value="Mark Completed">Mark as Completed</option>
                                <option value="Waive">Waive Requirement</option>
                            </>
                        )}
                    </select>
                </div>

                {action === 'Extend Expiry' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">New Expiration Date</label>
                        <input 
                            type="date" 
                            value={expiryDate} 
                            onChange={e => setExpiryDate(e.target.value)} 
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Reason (Required)</label>
                    <textarea 
                        value={reason} 
                        onChange={e => setReason(e.target.value)} 
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                        rows={3}
                        placeholder="e.g. Completed equivalent training externally, see HR file #123."
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-hh-red text-white font-bold rounded hover:bg-hh-red-dark">Apply Override</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default OverrideModal;
