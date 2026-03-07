
import React, { useState } from 'react';
import Card from '../components/Card';
import ComplianceChatbot from '../components/ComplianceChatbot';
import { CERTIFICATES, USERS, PROGRAMS, POLICIES } from '../data';

const CertificateVerification: React.FC = () => {
    const [certId, setCertId] = useState('');
    const [result, setResult] = useState<any>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [showAuditAI, setShowAuditAI] = useState(false);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setHasSearched(true);
        const cert = CERTIFICATES.find(c => c.certificate_id.toLowerCase() === certId.trim().toLowerCase());
        
        if (cert) {
            const user = USERS.find(u => u.user_id === cert.user_id);
            const program = PROGRAMS.find(p => p.program_id === cert.program_id);
            setResult({ cert, user, program });
        } else {
            setResult(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                {/* Left Side: Traditional Verification */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-hh-red text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">C</div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Public Registry</h1>
                            <p className="text-slate-500 font-medium italic">Canopy Learn Verification Engine</p>
                        </div>
                    </div>

                    <Card title="Verify Credential ID">
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Certificate Unique ID</label>
                                <input 
                                    type="text" 
                                    value={certId} 
                                    onChange={e => setCertId(e.target.value)} 
                                    placeholder="e.g. cert-sample-123"
                                    className="w-full p-4 border-2 rounded-2xl bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95">
                                Run Verification
                            </button>
                        </form>
                    </Card>

                    {hasSearched && (
                        <div className="animate-fade-in-up">
                            {result ? (
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border-4 border-emerald-500/30 shadow-2xl text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                                    <div className="inline-block p-4 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Credential Verified</h2>
                                    <div className="mt-6 space-y-3 text-sm text-left bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase text-[10px]">Issued To</span> <span className="font-black text-slate-900 dark:text-white">{result.user?.name}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase text-[10px]">Credential</span> <span className="font-black text-slate-900 dark:text-white">{result.cert.name}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase text-[10px]">Registry Date</span> <span className="font-bold">{new Date(result.cert.issued_at).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase text-[10px]">Valid Until</span> <span className="font-bold">{result.cert.expires_at ? new Date(result.cert.expires_at).toLocaleDateString() : 'Never'}</span></div>
                                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-400 text-center uppercase tracking-widest">
                                            ID: {result.cert.certificate_id}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[2rem] border-4 border-red-500/30 text-center shadow-xl">
                                    <div className="inline-block p-4 bg-red-100 text-red-600 rounded-2xl mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-black text-red-700 dark:text-red-400">Record Not Found</h2>
                                    <p className="text-sm text-red-600 dark:text-red-300 mt-2 font-medium">No active certificate found matching this ID in the Canopy Registry.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Compliance Audit AI */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col">
                        <div className="relative z-10 mb-8">
                            <h3 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-2">
                                🛡️ Audit Assistant
                                <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-black tracking-widest">GEMINI AI</span>
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                External stakeholders can use this AI to query organization compliance, security standards, and credential validity.
                            </p>
                        </div>

                        {!showAuditAI ? (
                            <div className="flex-grow flex flex-col items-center justify-center space-y-6 animate-fade-in">
                                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-4xl border border-white/10 shadow-inner">🤖</div>
                                <div className="text-center space-y-2">
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Stakeholder Portal</p>
                                    <h4 className="text-xl font-bold">Initiate Secure Audit Session</h4>
                                </div>
                                <button 
                                    onClick={() => setShowAuditAI(true)}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 uppercase text-xs tracking-[0.2em]"
                                >
                                    Start Session
                                </button>
                            </div>
                        ) : (
                            <ComplianceChatbot 
                                certificates={CERTIFICATES} 
                                programs={PROGRAMS} 
                                policies={POLICIES} 
                            />
                        )}

                        <div className="mt-auto pt-6 text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">
                            Official Registry Access Node: CAN-WEST-01
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto mt-12 text-center">
                 <p className="text-xs text-slate-400 font-medium">
                     Registry powered by Canopy Learn. This portal is for external verification only. 
                     If you are a volunteer, please <a href="/" className="text-blue-500 hover:underline">Log In</a> to your dashboard.
                 </p>
            </div>
        </div>
    );
};

export default CertificateVerification;
