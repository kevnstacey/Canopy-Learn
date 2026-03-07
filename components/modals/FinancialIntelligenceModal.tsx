
import React from 'react';
import BaseModal from './BaseModal';

interface FinancialIntelligenceModalProps {
    type: 'liability' | 'risk';
    value: string;
    onClose: () => void;
}

const FinancialIntelligenceModal: React.FC<FinancialIntelligenceModalProps> = ({ type, value, onClose }) => {
    const isLiability = type === 'liability';

    return (
        <BaseModal title={isLiability ? 'Liability Mitigation Logic' : 'Unreadiness Risk Calculation'} onClose={onClose}>
            <div className="space-y-6">
                <div className={`p-6 rounded-[2rem] border-2 shadow-inner ${isLiability ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Calculated Impact</p>
                    <p className={`text-4xl font-black italic tracking-tighter ${isLiability ? 'text-emerald-600' : 'text-red-600'}`}>{value}</p>
                </div>

                <div className="space-y-4">
                    <h4 className="font-black text-xs uppercase text-slate-500 tracking-widest">Mathematical Proof</h4>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl font-mono text-sm space-y-3 shadow-sm">
                        {isLiability ? (
                            <>
                                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Ready Headcount</span>
                                    <span className="font-bold">12</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Industry Base Claim Risk</span>
                                    <span className="font-bold">$4,200</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Mitigation Factor</span>
                                    <span className="font-bold">x 0.85</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-blue-600 font-bold uppercase text-xs">Total Mitigation</span>
                                    <span className="font-black text-emerald-600">{value}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Non-Compliant Staff</span>
                                    <span className="font-bold">2</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Avg. Claim Cost (Safety)</span>
                                    <span className="font-bold">$2,500</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Productivity Drag (Hrs/Wk)</span>
                                    <span className="font-bold">14.5</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-red-600 font-bold uppercase text-xs">Projected Loss</span>
                                    <span className="font-black text-red-600">{value}</span>
                                </div>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 italic">
                        Calculations derived from industry-specific actuarial data for {localStorage.getItem('persona_type') || 'Non-Profit'} sectors.
                    </p>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg">Close Audit Detail</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default FinancialIntelligenceModal;
