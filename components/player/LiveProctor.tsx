
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decodeAudioData } from '../../utils/audioUtils';

interface LiveProctorProps {
    title: string;
    rubric: string;
    onVerified: () => void;
    onExit: () => void;
}

const LiveProctor: React.FC<LiveProctorProps> = ({ title, rubric, onVerified, onExit }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'success'>('idle');
    const [aiMessages, setAiMessages] = useState<string[]>([]);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sessionPromiseRef = useRef<any>(null);
    
    // Audio Refs
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const cleanup = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then((s: any) => s.close());
        }
        audioSourcesRef.current.forEach(s => s.stop());
        audioSourcesRef.current.clear();
    };

    useEffect(() => cleanup, []);

    const startSession = async () => {
        setStatus('connecting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) videoRef.current.srcObject = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: `You are the Canopy Live Compliance Proctor. 
Your goal is to visually verify that the learner can perform: ${title}.
RUBRIC: ${rubric}.
Rules:
1. Speak to the learner in a professional, encouraging mentor voice.
2. Tell them what you see.
3. If they meet all rubric criteria, verbally say "VERIFICATION COMPLETE" and then call the markVerified function.
4. If they are failing, provide corrective guidance.`,
                },
                callbacks: {
                    onopen: () => {
                        setStatus('active');
                        // Audio Input Loop
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        const processor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        processor.onaudioprocess = (e) => {
                            const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
                            sessionPromiseRef.current.then((s: any) => s.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(processor);
                        processor.connect(inputAudioContextRef.current!.destination);

                        // Video Frame Loop (1 FPS to save tokens)
                        const interval = setInterval(() => {
                            if (videoRef.current && canvasRef.current) {
                                const ctx = canvasRef.current.getContext('2d');
                                canvasRef.current.width = 320;
                                canvasRef.current.height = 180;
                                ctx?.drawImage(videoRef.current, 0, 0, 320, 180);
                                const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
                                sessionPromiseRef.current.then((s: any) => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                            }
                        }, 1000);

                        return () => clearInterval(interval);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const buffer = await decodeAudioData(audioData, ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = buffer;
                            source.connect(ctx.destination);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += buffer.duration;
                        }

                        // Check for completion phrase in transcript (simplified logic for demo)
                        if (msg.serverContent?.modelTurn?.parts[0]?.text?.includes("VERIFICATION COMPLETE")) {
                            setStatus('success');
                            setTimeout(onVerified, 3000);
                        }
                    }
                }
            });
        } catch (e) {
            alert("Live Proctoring requires camera and microphone permissions.");
            setStatus('idle');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <h2 className="text-white font-black uppercase tracking-widest text-sm">Live Proctoring Session</h2>
                </div>
                <button onClick={onExit} className="text-white/50 hover:text-white font-bold text-xs px-3 py-1 border border-white/20 rounded-lg transition-colors">ABORT SESSION</button>
            </div>

            {/* Main Display */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
                {/* Camera Feed */}
                <div className="lg:col-span-3 relative bg-black flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                    
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-[20px] border-slate-950/20">
                        <div className="w-full h-full border-2 border-white/10 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[scan_3s_linear_infinite]"></div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-white shadow-2xl">
                        <h3 className="text-xl font-black mb-1">{title}</h3>
                        <p className="text-xs text-white/60 leading-relaxed max-w-2xl">{rubric}</p>
                    </div>

                    {status === 'idle' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-20">
                            <div className="text-center space-y-6 max-w-sm">
                                <div className="text-6xl">🤖</div>
                                <h3 className="text-2xl font-bold text-white">Multimodal Readiness</h3>
                                <p className="text-slate-400 text-sm">The AI Proctor will watch your feed and listen to your explanation to verify your competency.</p>
                                <button onClick={startSession} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest">Connect to AI Proctor</button>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-600/90 z-30 animate-fade-in">
                            <div className="text-center text-white">
                                <div className="text-8xl mb-4">✅</div>
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter">Competency Verified</h3>
                                <p className="font-bold text-green-100">AI Proctor has confirmed the standard.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Sidebar */}
                <div className="bg-slate-900 border-l border-white/10 flex flex-col p-6 overflow-hidden">
                    <div className="mb-8">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Proctor Brain Status</h4>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-inner font-black text-xs">AI</div>
                            <div>
                                <p className="text-xs text-white font-bold">GEMINI 2.5 FLASH</p>
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Multimodal Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow flex flex-col">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Live Feedback Stream</h4>
                        <div className="flex-grow space-y-4 overflow-y-auto scrollbar-hide">
                            {status === 'connecting' && <div className="p-4 bg-white/5 rounded-2xl text-xs text-slate-400 font-medium animate-pulse italic">Establishing secure neural link...</div>}
                            {status === 'active' && (
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                    <p className="text-xs text-blue-300 font-bold leading-relaxed">"The Proctor is listening. Describe the safety protocols as you perform them."</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="flex items-center gap-1 justify-center mb-2">
                             {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-4 bg-blue-500 animate-[bounce_1s_infinite]" style={{ animationDelay: `${i*0.1}s` }}></div>)}
                        </div>
                        <p className="text-[9px] text-center font-black text-slate-500 uppercase tracking-widest">Real-time Audio Uplink</p>
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <style>{`
                @keyframes scan { from { transform: translateY(0); } to { transform: translateY(100vh); } }
            `}</style>
        </div>
    );
};

export default LiveProctor;
