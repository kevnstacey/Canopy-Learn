
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import Card from '../components/Card';
import { PROGRAMS, ROLE_PLAY_SCENARIOS } from '../data';
import { RolePlayScenario, TranscriptionTurn, RolePlayFeedback } from '../types';
import { createBlob, decodeAudioData } from '../utils/audioUtils';
import { generateRolePlayFeedback } from '../services/geminiService';

type SessionState = 'idle' | 'loading' | 'active' | 'finished' | 'error';

// --- ICONS ---
const MicIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v1h6v-1h-2v-2.07z" clipRule="evenodd" /></svg>;
const StopIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>;

const RolePlay: React.FC = () => {
    const [selectedScenario, setSelectedScenario] = useState<RolePlayScenario | null>(null);
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [transcription, setTranscription] = useState<TranscriptionTurn[]>([]);
    const [feedback, setFeedback] = useState<RolePlayFeedback | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Refs for audio processing
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    // FIX: Using any for the connect return type to ensure promise chaining compatibility.
    const sessionPromiseRef = useRef<any>(null);

    const cleanupAudio = () => {
        // Stop any currently playing audio
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        
        // Disconnect microphone processing
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
    };

    const handleEndSession = async () => {
        setSessionState('loading');
        cleanupAudio();

        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            } finally {
                sessionPromiseRef.current = null;
            }
        }
        
        // Generate feedback
        if (selectedScenario && transcription.length > 0) {
            const program = PROGRAMS.find(p => p.program_id === selectedScenario.relevantProgramId);
            if (program) {
                try {
                    const fb = await generateRolePlayFeedback(transcription, program);
                    setFeedback(fb);
                } catch (e) {
                   setError("Could not generate feedback for this session.");
                }
            }
        }
        setSessionState('finished');
    };

    const handleStartSession = async (scenario: RolePlayScenario) => {
        setSessionState('loading');
        setError(null);
        setFeedback(null);
        setTranscription([]);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Setup audio contexts
            if (!inputAudioContextRef.current) {
                inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            }
            if (!outputAudioContextRef.current) {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }

            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            // Guideline: Create a new GoogleGenAI instance right before making an API call to ensure latest API key usage.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        setSessionState('active');
                        // Stream audio from the microphone
                        mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            // Guideline: Solely rely on sessionPromise resolves and then call session.sendRealtimeInput.
                            sessionPromiseRef.current?.then((session: any) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         // --- Handle Audio Output ---
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }

                        // --- Handle Transcription ---
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription += message.serverContent.outputTranscription.text;
                        }
                        
                        if (message.serverContent?.turnComplete) {
                            const turnsToAdd: TranscriptionTurn[] = [];
                            const userText = currentInputTranscription.trim();
                            const modelText = currentOutputTranscription.trim();
                            if (userText) {
                                turnsToAdd.push({ speaker: 'user', text: userText });
                            }
                            if (modelText) {
                                turnsToAdd.push({ speaker: 'model', text: modelText });
                            }
                            if (turnsToAdd.length > 0) {
                                setTranscription(prev => [...prev, ...turnsToAdd]);
                            }
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }
                    },
                    onclose: () => {
                        if(sessionState !== 'finished') {
                           handleEndSession();
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error(e);
                        setError('A connection error occurred. Please try again.');
                        setSessionState('error');
                        cleanupAudio();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: scenario.persona,
                },
            });

        } catch (e) {
            console.error(e);
            setError('Could not access the microphone. Please check your browser permissions.');
            setSessionState('error');
        }
    };
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
           if(sessionPromiseRef.current) {
             sessionPromiseRef.current.then((s: any) => s.close());
           }
           cleanupAudio();
        }
    }, []);

    const resetScenario = () => {
        setSelectedScenario(null);
        setSessionState('idle');
        setTranscription([]);
        setFeedback(null);
        setError(null);
    }
    
    if (!selectedScenario) {
        return (
            <Card title="AI Role-Play Scenarios">
                <p className="mb-4">Practice real-world conversations in a safe environment. Select a scenario to begin.</p>
                <div className="space-y-3">
                    {ROLE_PLAY_SCENARIOS.map(sc => (
                        <div key={sc.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{sc.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{sc.description}</p>
                            </div>
                            <button onClick={() => setSelectedScenario(sc)} className="bg-hh-red text-white font-semibold py-2 px-4 rounded-lg hover:bg-hh-red-dark transition-colors flex-shrink-0">
                                Start Practice
                            </button>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card title={selectedScenario.title}>
            {sessionState === 'idle' && (
                <div>
                    <p className="mb-4">{selectedScenario.description}</p>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200">
                        <h4 className="font-bold">Instructions</h4>
                        <ul className="list-disc list-inside mt-2 text-sm">
                            <li>This will start a live voice conversation with an AI.</li>
                            <li>You will need to grant microphone access.</li>
                            <li>Speak clearly. The AI will respond automatically.</li>
                            <li>Click "End Session" when you feel the conversation is complete.</li>
                        </ul>
                    </div>
                    <div className="mt-6">
                        <button onClick={() => handleStartSession(selectedScenario)} className="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors">
                            Begin Scenario
                        </button>
                    </div>
                </div>
            )}

            {(sessionState === 'loading' || sessionState === 'active') && (
                <div className="flex flex-col items-center">
                    <div className="mb-4 text-center">
                        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${sessionState === 'active' ? 'bg-red-100 dark:bg-red-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                            {sessionState === 'active' && <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>}
                            <MicIcon className="w-10 h-10 text-red-500 z-10" />
                        </div>
                        <p className="mt-3 font-semibold">{sessionState === 'loading' ? 'Connecting...' : 'Live Session Active...'}</p>
                         <p className="text-sm text-slate-500">The AI is listening. Start speaking to the customer.</p>
                    </div>
                     <div className="w-full h-48 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 overflow-y-auto space-y-2 mb-4">
                        {transcription.map((turn, i) => (
                           <div key={i} className={`p-2 rounded-lg text-sm ${turn.speaker === 'user' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                               <b className="capitalize">{turn.speaker === 'user' ? 'You' : 'Customer'}:</b> {turn.text}
                           </div>
                        ))}
                         {sessionState === 'loading' && <p className="text-slate-400">Waiting to connect...</p>}
                    </div>
                    <button onClick={handleEndSession} className="bg-hh-red text-white font-semibold py-2 px-5 rounded-lg hover:bg-hh-red-dark transition-colors flex items-center gap-2">
                        <StopIcon className="w-5 h-5"/>End Session
                    </button>
                </div>
            )}
            
            {sessionState === 'finished' && (
                <div>
                   <h3 className="text-xl font-bold mb-4">Session Debrief</h3>
                   {error && <p className="text-red-500 bg-red-100 p-3 rounded">{error}</p>}
                   {feedback ? (
                       <div className="space-y-4">
                           <Card title="Performance Summary"><p>{feedback.summary}</p></Card>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Card title="✅ What Went Well"><ul className="list-disc list-inside space-y-1">{feedback.positivePoints.map((p,i) => <li key={i}>{p}</li>)}</ul></Card>
                               <Card title="💡 Areas for Improvement"><ul className="list-disc list-inside space-y-1">{feedback.improvementAreas.map((p,i) => <li key={i}>{p}</li>)}</ul></Card>
                           </div>
                       </div>
                   ) : <p>Generating feedback...</p>}

                   <div className="mt-6">
                        <h4 className="font-bold mb-2">Full Transcript</h4>
                        <div className="w-full h-48 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 overflow-y-auto space-y-2 mb-4">
                            {transcription.map((turn, i) => (
                               <div key={i} className={`p-2 rounded-lg text-sm ${turn.speaker === 'user' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                                   <b className="capitalize">{turn.speaker === 'user' ? 'You' : 'Customer'}:</b> {turn.text}
                               </div>
                            ))}
                        </div>
                   </div>

                   <button onClick={resetScenario} className="bg-slate-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-700 transition-colors mt-4">
                       Back to Scenarios
                   </button>
                </div>
            )}

             {sessionState === 'error' && (
                 <div className="text-center">
                     <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>
                     <button onClick={resetScenario} className="bg-slate-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-slate-700 transition-colors mt-4">
                       Try Again
                   </button>
                 </div>
             )}
        </Card>
    );
};

export default RolePlay;
