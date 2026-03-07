
import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { Lesson } from '../../types';
import { generateMultiSpeakerPodcast } from '../../services/geminiService';

interface PodcastStudioModalProps {
    lesson: Lesson;
    onClose: () => void;
    onCommit: (audioUrl: string, script: string) => void;
}

const PodcastStudioModal: React.FC<PodcastStudioModalProps> = ({ lesson, onClose, onCommit }) => {
    const [status, setStatus] = useState<'idle' | 'scripting' | 'synthesizing' | 'review'>('idle');
    const [script, setScript] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleProduce = async () => {
        setStatus('scripting');
        try {
            const result = await generateMultiSpeakerPodcast(lesson);
            setScript(result.script);
            
            setStatus('synthesizing');
            // Wait slightly for UX
            await new Promise(r => setTimeout(r, 1000));

            // Create a Blob from the base64 audio
            const byteCharacters = atob(result.audioBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/pcm' });
            // In a real app, you'd convert PCM to WAV here for broader support,
            // but for the demo we'll simulate the URL.
            const url = URL.createObjectURL(blob);
            
            setAudioUrl(url);
            setStatus('review');
        } catch (e) {
            alert("Studio production failed. Ensure your API key supports multi-speaker TTS.");
            setStatus('idle');
        }
    };

    return (
        <BaseModal title="Canopy Radio: Podcast Studio" onClose={onClose}>
            <div className="min-h-[500px] flex flex-col gap-6">
                {status === 'idle' && (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-8 py-10">
                        <div className="relative">
                            <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl">🎙️</div>
                            <div className="absolute -right-2 -top-2 bg-hh-red text-white text-[8px] font-black px-2 py-1 rounded-full animate-bounce">STUDIO</div>
                        </div>
                        <div className="text-center space-y-2 max-w-sm">
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Conversational Learning</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Transform the "<strong>{lesson.title}</strong>" SOP into an engaging dialogue between a Site Manager and a Safety Expert.
                            </p>
                        </div>
                        <button 
                            onClick={handleProduce}
                            className="w-full max-w-xs py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
                        >
                            Initialize Production
                        </button>
                    </div>
                )}

                {(status === 'scripting' || status === 'synthesizing') && (
                    <div className="flex-grow flex flex-col items-center justify-center bg-slate-950 rounded-[2.5rem] p-10 relative overflow-hidden text-white">
                        {/* Audio Waveform Animation */}
                        <div className="flex items-end gap-1.5 h-16 mb-10">
                            {[...Array(12)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-2 bg-blue-500 rounded-full animate-pulse" 
                                    style={{ 
                                        height: `${20 + Math.random() * 80}%`,
                                        animationDuration: `${0.5 + Math.random() * 1}s`,
                                        opacity: status === 'synthesizing' ? 1 : 0.3
                                    }}
                                ></div>
                            ))}
                        </div>

                        <div className="text-center space-y-3 z-10">
                            <h3 className="text-2xl font-black italic tracking-tighter animate-pulse">
                                {status === 'scripting' ? 'Writing Conversational Script...' : 'Synthesizing Voices...'}
                            </h3>
                            <div className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-widest text-blue-400">
                                <p className={status === 'scripting' ? 'animate-pulse' : 'opacity-40'}>● Analyzing Core Instruction</p>
                                <p className={status === 'synthesizing' ? 'animate-pulse' : 'opacity-40'}>● Mapping Speaker Personas (Joe & Jane)</p>
                                <p className={status === 'synthesizing' ? 'animate-pulse' : 'opacity-40'}>● Rendering Raw PCM Stream</p>
                            </div>
                        </div>

                        {/* Background Pulsing Circles */}
                        <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-20">
                            <div className="w-64 h-64 border-4 border-blue-500 rounded-full animate-ping"></div>
                            <div className="absolute w-96 h-96 border-2 border-blue-500 rounded-full animate-ping [animation-delay:0.5s]"></div>
                        </div>
                    </div>
                )}

                {status === 'review' && (
                    <div className="flex flex-col h-full animate-fade-in">
                        <div className="flex-grow border-4 border-slate-100 rounded-[2.5rem] p-8 overflow-y-auto max-h-[400px] bg-slate-50 dark:bg-slate-900">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">AI</div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Production Review</h4>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Multi-Speaker Mastery</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Duration</span>
                                    <p className="font-bold text-slate-900 dark:text-white">02:14</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Script Snippet</h5>
                                    <div className="font-mono text-xs leading-relaxed space-y-3 opacity-80">
                                        {script.split('\n').slice(0, 4).map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                        <p className="italic text-slate-400">... and 12 more lines</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-600 text-white rounded-3xl shadow-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl">▶️</div>
                                        <div>
                                            <p className="font-black text-lg leading-tight">Canopy Radio Edit</p>
                                            <p className="text-xs opacity-80 font-bold">Voices: Joe (Manager), Jane (Expert)</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30">Preview Audio</button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setStatus('idle')} className="px-10 py-5 rounded-[2rem] border-4 border-slate-100 font-black uppercase text-[10px] text-slate-400 hover:bg-slate-50">Discard</button>
                            <button 
                                onClick={() => onCommit(audioUrl || '#', script)} 
                                className="flex-grow py-5 bg-hh-red text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-hh-red-dark text-xs active:scale-95 transition-all"
                            >
                                Publish Audio Learning Module
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </BaseModal>
    );
};

export default PodcastStudioModal;
