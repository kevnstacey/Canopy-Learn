
import React, { useState, useRef, useEffect } from 'react';
import BaseModal from './BaseModal';
import { Lesson, SceneAudit } from '../../types';
import { auditSceneAgainstSop } from '../../services/geminiService';

interface EnvironmentalAuditModalProps {
    lessons: Lesson[];
    onClose: () => void;
}

const EnvironmentalAuditModal: React.FC<EnvironmentalAuditModalProps> = ({ lessons, onClose }) => {
    const [selectedSop, setSelectedSop] = useState<Lesson | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [lastAudit, setLastAudit] = useState<SceneAudit | null>(null);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'analyzing'>('idle');
    const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isAuditing && !selectedSop) {
             if (lessons.length > 0) setSelectedSop(lessons[0]);
        }
    }, [isAuditing, lessons, selectedSop]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsAuditing(true);
            setStatus('scanning');
        } catch (e) {
            alert("Camera access required for floor audits.");
        }
    };

    const runAnalysis = async () => {
        if (!videoRef.current || !canvasRef.current || !selectedSop) return;
        
        setStatus('analyzing');
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedFrame(dataUrl);
        const base64 = dataUrl.split(',')[1];
        
        try {
            const result = await auditSceneAgainstSop(base64, selectedSop.content);
            setLastAudit(result);
            setStatus('scanning');
        } catch (e) {
            alert("Analysis failed. Try a different angle.");
            setStatus('scanning');
        }
    };

    return (
        <BaseModal title="Canopy Lens: Real-time Facility verification" onClose={onClose}>
            <div className="flex flex-col gap-6 min-h-[600px]">
                {!isAuditing ? (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-10 py-10">
                        <div className="relative">
                            <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl">🔍</div>
                            <div className="absolute -right-2 -top-2 bg-blue-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-pulse uppercase">Floor Node</div>
                        </div>
                        <div className="text-center space-y-3 max-w-sm">
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic">Vision Audit Hub</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">Verify your facility against operational standards using multimodal AI Vision.</p>
                        </div>
                        
                        <div className="w-full max-w-xs space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest text-center">Active SOP to Verify</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all"
                                    value={selectedSop?.lesson_id || ''}
                                    onChange={(e) => setSelectedSop(lessons.find(l => l.lesson_id === e.target.value) || null)}
                                >
                                    {lessons.map(l => <option key={l.lesson_id} value={l.lesson_id}>{l.title}</option>)}
                                </select>
                            </div>
                            <button onClick={startCamera} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                Initialize Audit Lens
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col gap-6">
                        {/* Audit Comparison View */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Live View / Evidence Frame */}
                            <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-900">
                                {status === 'analyzing' || lastAudit ? (
                                    <img src={capturedFrame || ''} className="w-full h-full object-cover opacity-60" alt="Evidence" />
                                ) : (
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-90" />
                                )}
                                
                                {/* HUD Layer */}
                                <div className="absolute inset-0 pointer-events-none">
                                     <div className="absolute inset-x-8 top-8 flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'analyzing' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                                                <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/40 px-3 py-1 rounded-lg border border-white/10">{status === 'analyzing' ? 'Processing...' : 'Live Verifier'}</span>
                                            </div>
                                            <div className="text-[10px] font-mono text-white/60 uppercase tracking-tighter">SOP: {selectedSop?.title}</div>
                                        </div>
                                    </div>
                                    
                                    {status === 'scanning' && !lastAudit && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[audit-scan_3s_linear_infinite] shadow-[0_0_15px_#3b82f6]"></div>
                                        </div>
                                    )}

                                    {/* Corners */}
                                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/40"></div>
                                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/40"></div>
                                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/40"></div>
                                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/40"></div>
                                </div>

                                {status === 'analyzing' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-20">
                                        <div className="w-12 h-12 border-4 border-blue-500 border-t-white rounded-full animate-spin mb-4"></div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Mapping Scene Geometry...</p>
                                    </div>
                                )}
                            </div>

                            {/* Verification Summary Side */}
                            <div className="flex flex-col gap-4">
                                {lastAudit ? (
                                    <div className="flex-grow flex flex-col gap-4 animate-fade-in">
                                         <div className={`p-6 rounded-[2.5rem] border-2 text-center relative overflow-hidden transition-all duration-1000 ${lastAudit.compliance_score > 80 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                            <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest relative z-10">Verification Score</p>
                                            <p className={`text-5xl font-black italic tracking-tighter relative z-10 ${lastAudit.compliance_score > 80 ? 'text-emerald-600' : 'text-red-600'}`}>{lastAudit.compliance_score}%</p>
                                            <div className="absolute -right-4 -bottom-4 opacity-5 text-7xl font-black rotate-12">{lastAudit.compliance_score > 80 ? '✓' : '⚠️'}</div>
                                         </div>
                                         <div className="flex-grow bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 space-y-4 overflow-y-auto max-h-[300px] scrollbar-hide shadow-inner">
                                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Tactical Observations</h4>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 italic leading-relaxed">"{lastAudit.summary}"</p>
                                            
                                            <div className="space-y-3 pt-4">
                                                {lastAudit.violations.map((v, i) => (
                                                    <div key={i} className="flex gap-4 items-start group">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-lg shadow-sm border ${v.type === 'Critical' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-orange-100 text-orange-600 border-orange-200'}`}>
                                                            {v.type === 'Critical' ? '🚨' : '⚠️'}
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-0.5">{v.label}</p>
                                                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{v.description}</p>
                                                            {v.sop_reference && <span className="text-[8px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">Ref: {v.sop_reference}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                                {lastAudit.violations.length === 0 && (
                                                    <div className="py-10 text-center space-y-2">
                                                        <div className="text-4xl">💎</div>
                                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Facility Optimized</p>
                                                    </div>
                                                )}
                                            </div>
                                         </div>
                                    </div>
                                ) : (
                                    <div className="flex-grow border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 space-y-4">
                                        <div className="text-5xl opacity-20">📐</div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Ready for Frame Capture</p>
                                        <p className="text-[10px] text-slate-400 max-w-[200px]">Center the operational area in the viewfinder and click capture.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl">
                            <button 
                                onClick={runAnalysis} 
                                disabled={status === 'analyzing'} 
                                className="flex-grow py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                            >
                                {status === 'analyzing' ? 'AUDITING...' : lastAudit ? 'Retake & re-Audit' : 'Capture Frame & Verify'}
                            </button>
                            {lastAudit && (
                                <button 
                                    onClick={() => { setLastAudit(null); setCapturedFrame(null); }} 
                                    className="px-10 py-5 border-4 border-white bg-white rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <style>{`
                @keyframes audit-scan { from { transform: translateY(0); } to { transform: translateY(400px); } }
            `}</style>
        </BaseModal>
    );
};

export default EnvironmentalAuditModal;
