
import React, { useState, useRef, useEffect } from 'react';
import { generateAnswer } from '../services/geminiService';
import { searchLessons } from '../utils/sopUtils';
import { Hit, User, Lesson } from '../types';

interface Message {
    text: string;
    isUser: boolean;
    sources?: Hit[];
    language?: string;
}

interface AIChatProps {
    currentUser: User;
    addQuestionToHistory: (question: string) => void;
    lessons: Lesson[];
}

const SUGGESTIONS = [
    "What is the Danger Zone?",
    "Quelle est la zone de danger?",
    "Opening procedures checklist?",
    "Show me the code of conduct"
];

const AIChat: React.FC<AIChatProps> = ({ currentUser, addQuestionToHistory, lessons }) => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hello! I'm your Canopy Learn AI Tutor. I can help you with training content in English or French.", isUser: false }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent, overrideQuery?: string) => {
        e.preventDefault();
        const userMessage = (overrideQuery || query).trim();
        if (!userMessage || isLoading) return;

        addQuestionToHistory(userMessage);
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setQuery('');
        setIsLoading(true);

        try {
            const context = searchLessons(userMessage, lessons);
            const response = await generateAnswer(userMessage, context);
            
            const hasSources = context.length > 0 && !response.text.startsWith("I couldn’t find this");

            setMessages(prev => [...prev, { 
                text: response.text, 
                isUser: false, 
                sources: hasSources ? context : undefined,
                language: response.detectedLanguage 
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { text: "Sorry, I ran into an issue. Please try again.", isUser: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-800 rounded-t-lg shadow-md">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                         {!msg.isUser && (
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-hh-red text-yellow-300 grid place-items-center font-black text-sm flex-shrink-0">CL</div>
                                {msg.language && (
                                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[6px] font-black rounded px-1 py-0.5 uppercase">
                                        {msg.language === 'English' ? 'EN' : msg.language === 'French' ? 'FR' : 'AI'}
                                    </div>
                                )}
                            </div>
                         )}
                        <div className={`p-3 rounded-2xl max-w-lg ${msg.isUser ? 'bg-hh-red text-white rounded-tr-none shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-600 shadow-sm'}`}>
                            <p className="whitespace-pre-wrap text-sm md:text-base" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\[([^\]]+)\]/g, '<span class="font-semibold text-xs bg-slate-200 dark:bg-slate-600 p-1 rounded-md">$1</span>') }} />
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                                    <p className="text-[10px] font-black mb-1 opacity-70 uppercase tracking-widest">Grounding Context:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.sources.slice(0, 2).map(hit => (
                                             <span key={hit.lesson.lesson_id} className="text-[10px] bg-white/50 dark:bg-slate-800/50 rounded-md px-2 py-0.5 border border-current opacity-60">
                                                 {hit.lesson.title}
                                             </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-hh-red text-yellow-300 grid place-items-center font-black text-sm flex-shrink-0">CL</div>
                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 rounded-tl-none flex gap-1.5 border border-slate-200 dark:border-slate-600">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && !isLoading && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 flex gap-2 flex-wrap border-x border-slate-200 dark:border-slate-700">
                    {SUGGESTIONS.map(s => (
                        <button 
                            key={s} 
                            onClick={(e) => handleSendMessage(e, s)}
                            className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-full px-4 py-2 text-slate-500 dark:text-slate-300 hover:border-blue-400 hover:text-blue-500 transition-all"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-b-lg shadow-md">
                <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Posez une question ou demandez de l'aide..."
                        className="flex-grow p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium"
                        aria-label="Posez une question"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="bg-hh-red text-white font-black uppercase tracking-widest px-8 rounded-2xl hover:bg-hh-red-dark transition-all disabled:bg-slate-400 disabled:cursor-not-allowed flex-shrink-0 active:scale-95 shadow-lg"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChat;
