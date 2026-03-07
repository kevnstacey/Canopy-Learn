
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decodeAudioData } from '../../utils/audioUtils';

interface LiveRadioProps {
    lessonTitle: string;
    lessonContent: string;
    onClose: () => void;
}

const LiveRadio: React.FC<LiveRadioProps> = ({ lessonTitle, lessonContent, onClose }) => {
    const [status, setStatus] = useState<'connecting' | 'active' | 'error'>('connecting');
    const [isAisSpeaking, setIsAiSpeaking] = useState(false);
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    
    const sessionPromiseRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const micStreamRef = useRef<MediaStream | null>(null);

    const cleanup = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then((s: any) => s.close());
        }
        audioSourcesRef.current.forEach(s => s.stop());
        audioSourcesRef.current.clear();
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => t.stop());
        }
    };

    useEffect(() => {
        const startRadio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                micStreamRef.current = stream;

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

                sessionPromiseRef.current = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                        },
                        systemInstruction: `You are the "Canopy Guide", an AI safety mentor hosting a live audio study session.
                        The topic is: "${lessonTitle}".
                        The content is: "${lessonContent.replace(/<[^>]+>/g, '')}".
                        
                        Your Goal:
                        1. Summarize the lesson naturally in a conversational, friendly, and expert tone.
                        2. Actively invite the user to ask for examples or clarifications.
                        3. If the user interrupts, stop immediately and answer their question based on the SOP content.
                        4. Start the session with: "Welcome to Canopy Live Radio. I'm your mentor. Let's walk through ${lessonTitle} together."`,
                    },
                    callbacks: {
                        onopen: () => {
                            setStatus('active');
                            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                            const processor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                            
                            processor.onaudioprocess = (e) => {
                                const inputData = e.inputBuffer.getChannelData(0);
                                // Detect user speech activity for UI
                                const volume = inputData.reduce((a, b) => a + Math.abs(b), 0) / inputData.length;
                                setIsUserSpeaking(volume > 0.05);

                                const pcmBlob = createBlob(inputData);
                                sessionPromiseRef.current.then((s: any) => s.sendRealtimeInput({ media: pcmBlob }));
                            };
                            source.connect(processor);
                            processor.connect(inputAudioContextRef.current!.destination);
                        },
                        onmessage: async (msg: LiveServerMessage) => {
                            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                            if (audioData && outputAudioContextRef.current) {
                                setIsAiSpeaking(true);
                                const ctx = outputAudioContextRef.current;
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                                const buffer = await decodeAudioData(audioData, ctx, 24000, 1);
                                const source = ctx.createBufferSource();
                                source.buffer = buffer;
                                source.connect(ctx.destination);
                                source.onended = () => {
                                    audioSourcesRef.current.delete(source);
                                    if (audioSourcesRef.current.size === 0) setIsAiSpeaking(false);
                                };
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += buffer.duration;
                                audioSourcesRef.current.add(source);
                            }

                            if (msg.serverContent?.interrupted) {
                                audioSourcesRef.current.forEach(s => s.stop());
                                audioSourcesRef.current.clear();
                                nextStartTimeRef.current = 0;
                                setIsAiSpeaking(false);
                            }
                        },
                        onerror: () => setStatus('error'),
                        onclose: () => setStatus('error'),
                    }
                });
            } catch (e) {
                console.error(e);
                setStatus('error');
            }
        };

        startRadio();
        return cleanup;
    }, [lessonTitle, lessonContent]);

    return (
        <div className="fixed inset-0 z-[70] bg-slate-950 flex flex-col items-center justify-center p-6 studio-grid">
            <div className="absolute top-6 right-6">
                <button 
                    onClick={onClose}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="w-full max-w-md space-y-12 text-center">
                {/* Header */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 rounded-lg text-white font-black text-[10px] tracking-[0.3em] uppercase animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        Live Studio
                    </div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter leading-tight uppercase">
                        Canopy Radio
                    </h2>
                    <p className="text-emerald-400 font-bold tracking-widest text-xs uppercase">
                        Interactive Session: {lessonTitle}
                    </p>
                </div>

                {/* Visualizer */}
                <div className="relative h-64 flex items-center justify-center">
                    {/* Ring */}
                    <div className={`absolute w-48 h-48 rounded-full border-4 transition-all duration-500 ${
                        isAisSpeaking ? 'border-emerald-500 scale-110 shadow-[0_0_30px_#10B981]' : 
                        isUserSpeaking ? 'border-blue-500 scale-105 shadow-[0_0_30px_#3b82f6]' : 
                        'border-white/10'
                    }`}></div>

                    {/* Waveform */}
                    <div className="flex items-end gap-2 h-20">
                        {[...Array(12)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`wave-bar ${isAisSpeaking ? 'bg-emerald-500' : isUserSpeaking ? 'bg-blue-500' : 'bg-white/20'}`}
                                style={{ 
                                    animationDuration: `${0.6 + Math.random() * 0.4}s`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationPlayState: (isAisSpeaking || isUserSpeaking) ? 'running' : 'paused',
                                    height: (isAisSpeaking || isUserSpeaking) ? '100%' : '10%'
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center px-4">
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mentor Status</p>
                            <p className={`font-bold text-sm ${isAisSpeaking ? 'text-emerald-400' : 'text-white/60'}`}>
                                {isAisSpeaking ? 'Speaking...' : 'Listening...'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connection</p>
                            <p className="text-emerald-400 font-bold text-sm">ENCRYPTED</p>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-slate-400 italic">
                            {status === 'connecting' ? 'Connecting to study guide...' : 
                             isAisSpeaking ? 'Your mentor is summarizing the lesson.' :
                             'Ask a question or stay silent to continue.'}
                        </p>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-8">
                    <button 
                        onClick={onClose}
                        className="px-12 py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all active:scale-95"
                    >
                        End Session
                    </button>
                </div>
            </div>

            {status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/90 backdrop-blur-xl z-[80]">
                    <div className="text-center space-y-4 max-w-sm px-6">
                        <div className="text-5xl">⚠️</div>
                        <h3 className="text-2xl font-black text-white">Uplink Lost</h3>
                        <p className="text-red-200">The Live Radio session was disconnected. Please check your mic and try again.</p>
                        <button onClick={onClose} className="w-full py-4 bg-white text-red-900 font-black rounded-2xl">Return to Lesson</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveRadio;
