
import React, { useState, useRef, useEffect } from 'react';
import { generateComplianceAuditAnswer } from '../services/geminiService';
import { Certificate, Program, Policy } from '../types';

interface Message {
    text: string;
    isUser: boolean;
    isBot: boolean;
}

interface ComplianceChatbotProps {
    certificates: Certificate[];
    programs: Program[];
    policies: Policy[];
}

const ComplianceChatbot: React.FC<ComplianceChatbotProps> = ({ certificates, programs, policies }) => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "System ready. I am the Canopy Compliance Officer AI. How can I assist with your verification or audit today?", isUser: false, isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { text: userMsg, isUser: true, isBot: false }]);
        setIsLoading(true);

        try {
            const answer = await generateComplianceAuditAnswer(userMsg, certificates, programs, policies);
            setMessages(prev => [...prev, { text: answer, isUser: false, isBot: true }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Connection to registry lost. Please retry.", isUser: false, isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden animate-fade-in-up">
            {/* Bot Header */}
            <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-inner">
                        AI
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm leading-none">Compliance Officer</h4>
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Registry V1.2.0 ● SECURE</span>
                    </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            {/* Chat History */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-hide bg-slate-900/50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                            m.isUser 
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-md'
                        }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 animate-pulse flex gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]"></div>
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]"></div>
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></div>
                         </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700">
                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about credentials, policies or security..."
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 transition-all"
                    />
                    <button 
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
                <p className="text-[9px] text-slate-500 mt-2 text-center font-bold uppercase tracking-widest">
                    Encrypted Registry Query Session
                </p>
            </form>
        </div>
    );
};

export default ComplianceChatbot;
