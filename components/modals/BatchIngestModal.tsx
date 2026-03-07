import React, { useState, useRef } from 'react';
import BaseModal from './BaseModal';
import { ShelfAuditResult, BatchAuditReport } from '../../types';
import { analyzeShelfImage } from '../../services/geminiService';

interface BatchIngestModalProps {
    onClose: () => void;
    onReportGenerated: (report: BatchAuditReport) => void;
}

const BatchIngestModal: React.FC<BatchIngestModalProps> = ({ onClose, onReportGenerated }) => {
    const [files, setFiles] = useState<{ file: File; base64: string; result?: ShelfAuditResult; status: 'pending' | 'scanning' | 'done' | 'error' }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files) as File[];
        
        selectedFiles.forEach(f => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                const base64Str = result.split(',')[1];
                setFiles(prev => [...prev, { file: f, base64: base64Str, status: 'pending' }]);
            };
            reader.readAsDataURL(f);
        });
    };

    const processBatch = async () => {
        setIsProcessing(true);
        const updatedFiles = [...files];
        
        for (let i = 0; i < updatedFiles.length; i++) {
            if (updatedFiles[i].status !== 'pending') continue;
            
            updatedFiles[i].status = 'scanning';
            setFiles([...updatedFiles]);
            
            try {
                const result = await analyzeShelfImage(updatedFiles[i].base64, updatedFiles[i].file.name);
                updatedFiles[i].result = result;
                updatedFiles[i].status = 'done';
            } catch (e) {
                updatedFiles[i].status = 'error';
            }
            setFiles([...updatedFiles]);
        }

        // Generate aggregate report
        const doneResults = updatedFiles.filter(f => f.status === 'done' && f.result).map(f => f.result!);
        if (doneResults.length > 0) {
            const avgScore = doneResults.reduce((acc, cur) => acc + cur.score, 0) / doneResults.length;
            const totalIssues = doneResults.reduce((acc, cur) => acc + cur.findings.length, 0);
            
            const report: BatchAuditReport = {
                id: `batch-${Date.now()}`,
                timestamp: Date.now(),
                overallCompliance: Math.round(avgScore),
                totalIssues: totalIssues,
                topRiskArea: doneResults[0].findings[0]?.category || 'General Operations',
                results: doneResults
            };
            onReportGenerated(report);
        }
        setIsProcessing(false);
    };

    return (
        <BaseModal title="Vision Ingest: Batch Site Audit" onClose={onClose}>
            <div className="space-y-8 min-h-[500px] flex flex-col">
                {files.length === 0 ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-grow border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-blue-400 transition-all"
                    >
                        <input type="file" multiple ref={fileInputRef} onChange={handleFileSelection} accept="image/*" className="hidden" />
                        <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">📸</div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Upload Audit Batch</h3>
                        <p className="text-sm text-slate-500 max-w-xs mt-2">Upload shelf photos, warehouse floor snaps, or safety station images for parallel AI analysis.</p>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {files.map((f, i) => (
                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-white dark:border-slate-700 shadow-lg group">
                                    <img src={`data:image/jpeg;base64,${f.base64}`} className={`w-full h-full object-cover transition-opacity ${f.status === 'scanning' ? 'opacity-40' : 'opacity-100'}`} alt="" />
                                    
                                    {f.status === 'pending' && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded">Pending</span></div>}
                                    
                                    {f.status === 'scanning' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="w-1/2 h-1 bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-[scan_1s_infinite] rounded-full"></div>
                                            <span className="text-[8px] font-black text-blue-400 uppercase mt-2 animate-pulse">Analyzing...</span>
                                        </div>
                                    )}

                                    {f.status === 'done' && f.result && (
                                        <div className="absolute top-2 right-2">
                                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] shadow-xl ${f.result.score > 80 ? 'bg-emerald-50' : 'bg-red-50'} text-white`}>
                                                 {f.result.score}
                                             </div>
                                        </div>
                                    )}

                                    {f.status === 'error' && <div className="absolute inset-0 flex items-center justify-center bg-red-950/80 text-white font-black text-[8px] uppercase">Analysis Failed</div>}
                                </div>
                            ))}
                            {!isProcessing && (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500"
                                >
                                    <span className="text-2xl">+</span>
                                </button>
                            )}
                        </div>

                        <div className="mt-auto flex gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                            <div className="flex-grow">
                                <h4 className="font-black uppercase text-[10px] text-slate-400 tracking-widest mb-1">Queue Management</h4>
                                <p className="text-sm font-bold">{files.length} evidence artifacts staged.</p>
                            </div>
                            <button 
                                onClick={onClose}
                                disabled={isProcessing}
                                className="px-6 py-3 border-2 border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={processBatch}
                                disabled={isProcessing || files.every(f => f.status === 'done')}
                                className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isProcessing ? 'SCANNING BATCH...' : 'START VISION AUDIT'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-30px); }
                    100% { transform: translateY(30px); }
                }
            `}</style>
        </BaseModal>
    );
};

export default BatchIngestModal;