
import React, { useState, useRef, useEffect } from 'react';
import { generateAnswer } from '../services/geminiService';
import { searchLessons } from '../utils/sopUtils';
import { LESSONS } from '../data';
import { Hit } from '../types';

interface Message {
    text: string;
    isUser: boolean;
    sources?: Hit[];
}

interface QandAProps {
    addQuestionToHistory: (question: string) => void;
}

const QandA: React.FC<QandAProps> = ({ addQuestionToHistory }) => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hello! I'm the Canopy Learn AI. Ask me anything about our Standard Operating Procedures (SOPs).", isUser: false }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMessage = query.trim();
        if (!userMessage || isLoading) return;

        addQuestionToHistory(userMessage);
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setQuery('');
        setIsLoading(true);

        try {
            // Find relevant context from SOPs
            const context = searchLessons(userMessage, LESSONS);
            const answer = await generateAnswer(userMessage, context);
            
            // The generateAnswer prompt asks the model to cite sources like [Doc Title: Section]
            // We can just display the answer as is, since it should contain citations.
            // For this demo, let's also pass the structured source data to display it nicely.
            // Fix: Access .text property from answer object
            const hasSources = context.length > 0 && !answer.text.startsWith("I couldn’t find this");

            // Fix: Access .text property from answer object
            setMessages(prev => [...prev, { text: answer.text, isUser: false, sources: hasSources ? context : undefined }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { text: "Sorry, I ran into an issue. Please try again.", isUser: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    const QuickQuestionButton: React.FC<{ text: string }> = ({ text }) => (
        <button
            onClick={() => setQuery(text)}
            className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium py-1.5 px-3 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
            {text}
        </button>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
            {/* Message display area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-800 rounded-t-lg shadow-md">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                         {!msg.isUser && <div className="w-8 h-8 rounded-full bg-hh-red text-yellow-300 grid place-items-center font-black text-sm flex-shrink-0">HH</div>}
                        <div className={`p-3 rounded-lg max-w-lg ${msg.isUser ? 'bg-hh-red text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                                    <p className="text-xs font-semibold mb-1 opacity-70">SOURCES:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.sources.slice(0, 2).map(hit => (
                                             <span key={hit.lesson.lesson_id} className="text-xs bg-slate-200 dark:bg-slate-600 rounded-md px-2 py-0.5">
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
                        <div className="w-8 h-8 rounded-full bg-hh-red text-yellow-300 grid place-items-center font-black text-sm flex-shrink-0">HH</div>
                        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                           <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-b-lg shadow-md">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about store procedures..."
                        className="flex-grow p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-hh-red focus:outline-none transition-shadow"
                        aria-label="Ask a question about store procedures"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="bg-hh-red text-white font-semibold py-3 px-6 rounded-lg hover:bg-hh-red-dark transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex-shrink-0"
                        aria-label="Send message"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default QandA;
