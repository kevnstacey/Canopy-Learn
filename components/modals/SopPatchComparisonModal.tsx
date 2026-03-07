
import React from 'react';
import BaseModal from './BaseModal';
import { SopPatch } from '../../types';

interface SopPatchComparisonModalProps {
    patch: SopPatch;
    title: string;
    onClose: () => void;
    onCommit: () => void;
    isApplying: boolean;
}

const SopPatchComparisonModal: React.FC<SopPatchComparisonModalProps> = ({ patch, title, onClose, onCommit, isApplying }) => {
    return (
        <BaseModal title={`Sentinel Patch: ${title}`} onClose={onClose}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800">
                         <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">💡</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">AI Reasoning</span>
                         </div>
                         <p className="text-sm font-medium text-blue-900 dark:text-blue-200 italic">"{patch.reasoning}"</p>
                    </div>
                    <div className="flex-none p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Clarity Boost</span>
                        <span className="text-3xl font-black text-emerald-700">+{patch.improvementScore}%</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[50vh]">
                    {/* Left: Original */}
                    <div className="flex flex-col border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b-2 font-black text-[10px] uppercase text-slate-400 tracking-widest text-center">Original Confusing Content</div>
                        <div className="flex-grow overflow-y-auto p-6 prose dark:prose-invert max-w-none opacity-50 grayscale scale-95 origin-top transition-all">
                             <div dangerouslySetInnerHTML={{ __html: patch.originalHtml }} />
                        </div>
                    </div>

                    {/* Right: Suggested */}
                    <div className="flex flex-col border-4 border-blue-500 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                        <div className="p-3 bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] text-center">Optimized High-Clarity Patch</div>
                        <div className="flex-grow overflow-y-auto p-6 prose dark:prose-invert max-w-none">
                             <div dangerouslySetInnerHTML={{ __html: patch.suggestedHtml }} />
                        </div>
                        {/* Highlights Overlay (Simulation) */}
                        <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20"></div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={onClose} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs text-slate-400 hover:bg-slate-50">Discard Patch</button>
                    <button 
                        onClick={onCommit}
                        disabled={isApplying}
                        className="flex-[2] py-4 bg-hh-red text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-hh-red-dark transition-all active:scale-95"
                    >
                        {isApplying ? 'Applying Patch...' : 'Commit Optimized Version'}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default SopPatchComparisonModal;
