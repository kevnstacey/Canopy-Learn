
import React from 'react';
import { Policy } from '../../types';

interface PolicyViewProps {
    policy: Policy;
    onAcknowledge: (policyId: string, version: string) => void;
    isAcknowledged: boolean;
}

const PolicyView: React.FC<PolicyViewProps> = ({ policy, onAcknowledge, isAcknowledged }) => {
    return (
        <div className="max-w-3xl mx-auto p-8 md:p-12">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">Policy</span>
                    {isAcknowledged && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase">Acknowledged</span>}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{policy.title}</h1>
                <div className="text-sm text-slate-500 flex gap-4">
                    <span>Version: {policy.version}</span>
                    <span>Effective: {new Date(policy.effective_date).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 leading-relaxed mb-12">
                <div dangerouslySetInnerHTML={{ __html: policy.content }} />
            </div>

            {/* Action Footer */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <h3 className="font-bold text-lg mb-2">Acknowledgment</h3>
                <p className="text-sm text-slate-500 mb-6">
                    By clicking the button below, I acknowledge that I have read, understood, and agree to abide by the <strong>{policy.title}</strong> (v{policy.version}).
                </p>
                
                <button
                    onClick={() => onAcknowledge(policy.policy_id, policy.version)}
                    disabled={isAcknowledged}
                    className={`px-8 py-3 rounded-lg font-bold shadow-md transition-all ${
                        isAcknowledged 
                        ? 'bg-green-600 text-white cursor-default' 
                        : 'bg-hh-red text-white hover:bg-hh-red-dark active:scale-95'
                    }`}
                >
                    {isAcknowledged ? `Acknowledged on ${new Date().toLocaleDateString()}` : 'I Acknowledge'}
                </button>
            </div>
        </div>
    );
};

export default PolicyView;
