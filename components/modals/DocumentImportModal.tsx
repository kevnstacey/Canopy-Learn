
import React, { useState, useRef } from 'react';
import BaseModal from './BaseModal';
import { parseDocumentToLesson } from '../../services/geminiService';
import { Lesson, Quiz } from '../../types';

interface DocumentImportModalProps {
    onClose: () => void;
    onCommit: (pkg: { lesson: Partial<Lesson>; quiz: Partial<Quiz> }) => void;
}

const DocumentImportModal: React.FC<DocumentImportModalProps> = ({ onClose, onCommit }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'review'>('idle');
    const [extracted, setExtracted] = useState<{ lesson: Partial<Lesson>; quiz: Partial<Quiz> } | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addLog = (msg: string) => setLogs(prev => [...prev.slice(-4), msg]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(f);
    };

    const handleStartIngest = async () => {
        if (!preview) return;
        setStatus('scanning');
        setLogs([]);
        
        addLog("[SYSTEM] Initiating Digitization Lab...");
        setTimeout(() => addLog("[SCAN] Calibrating Multimodal OCR..."), 1000);
        setTimeout(() => addLog("[AI] Extracting Knowledge Nodes..."), 3000);
        setTimeout(() => addLog("[AI] Deduplicating Content Nodes..."), 5000);

        try {
            const base64 = preview.split(',')[1];
            const mimeType = file?.type || 'image/jpeg';
            const result = await parseDocumentToLesson(base64, mimeType);
            setExtracted(result);
            setStatus('review');
        } catch (e) {
            alert("Failed to ingest document. Ensure the file is a clear image or PDF.");
            setStatus('idle');
        }
    };

    return (
        <BaseModal title="Legacy Document Ingestor Lab" onClose={onClose}>
            <div className="min-h-[500px] flex flex-col gap-6">
                {status === 'idle' && (
                    <div className="flex-grow flex flex-col items-center justify-center py-10 space-y-8">
                        <div className="text-center space-y-2">
                            <div className="text-5xl mb-4">📄</div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Knowledge Extractor</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">Upload any legacy SOP, manual, or safety poster. Gemini will convert it into a structured LMS path.</p>
                        </div>

                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full max-w-md border-4 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group"
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" className="hidden" />
                            {file ? (
                                <div className="space-y-4">
                                    <div className="text-emerald-500 font-bold">{file.name}</div>
                                    <button onClick={(e) => { e.stopPropagation(); handleStartIngest(); }} className="bg-hh-red text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                                        Digitize Document
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="font-black text-slate-400 group-hover:text-hh-red transition-colors">DROP LEGACY FILE HERE</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Supports PDF, PNG, JPG</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {status === 'scanning' && (
                    <div className="flex-grow flex flex-col items-center justify-center bg-slate-950 rounded-[2.5rem] p-10 relative overflow-hidden text-white">
                        {/* Laser Scanner Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_#10B981] animate-[scanner_2s_ease-in-out_infinite] z-20"></div>
                        
                        {/* Ghost Document */}
                        <div className="w-48 h-64 bg-slate-800 rounded-lg opacity-40 mb-10 relative overflow-hidden border border-white/10">
                            <div className="space-y-2 p-4">
                                <div className="h-2 w-full bg-white/20 rounded"></div>
                                <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                                <div className="h-2 w-full bg-white/20 rounded"></div>
                                <div className="h-10 w-full bg-white/10 rounded mt-4"></div>
                            </div>
                        </div>

                        <div className="w-full max-w-sm font-mono text-[10px] text-emerald-400 space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-3">
                                    <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                            <div className="animate-pulse">_</div>
                        </div>
                    </div>
                )}

                {status === 'review' && extracted && (
                    <div className="flex flex-col h-full animate-fade-in">
                        <div className="flex-grow border-4 border-slate-100 rounded-[2.5rem] p-8 overflow-y-auto max-h-[400px] bg-white dark:bg-slate-900">
                             <div className="flex items-center gap-2 mb-6">
                                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">Parsed from File</span>
                                <span className="text-xs font-bold text-slate-400">{file?.name}</span>
                            </div>

                            <div className="prose dark:prose-invert max-w-none">
                                <h2 className="font-black italic uppercase tracking-tighter text-3xl mb-2">{extracted.lesson.title}</h2>
                                <div className="text-xs uppercase font-black text-emerald-600 mb-6 tracking-widest">LMS COMPATIBLE FORMAT</div>
                                <div dangerouslySetInnerHTML={{ __html: extracted.lesson.content || '' }} />
                            </div>

                            <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-100 dark:border-slate-800">
                                <h4 className="font-black uppercase text-xs mb-6 text-slate-400 tracking-widest">Generated Knowledge Check</h4>
                                <div className="space-y-4">
                                    {extracted.quiz.questions?.map((q: any, i: number) => (
                                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                                            <p className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-300">{i+1}. {q.prompt}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setStatus('idle')} className="px-10 py-5 rounded-[2rem] border-4 border-slate-100 font-black uppercase text-[10px] text-slate-400 hover:bg-slate-50">Discard</button>
                            <button onClick={() => onCommit(extracted)} className="flex-grow py-5 bg-hh-red text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-hh-red-dark active:scale-95 transition-all text-xs">Commit Document to Library</button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes scanner { 
                    0% { transform: translateY(0); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(500px); opacity: 0; }
                }
            `}</style>
        </BaseModal>
    );
};

export default DocumentImportModal;
