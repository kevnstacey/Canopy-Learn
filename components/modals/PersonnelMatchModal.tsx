import React, { useState, useEffect, useMemo } from 'react';
import BaseModal from './BaseModal';
import { WorkforceMatch, User } from '../../types';
import { matchPersonnelToTask } from '../../services/geminiService';
import { usePersona } from '../../contexts/PersonaContext';

interface PersonnelMatchModalProps {
    allUsers: User[];
    readinessData: any[]; // Aggregated readiness statuses
    onClose: () => void;
    onNudge: (userId: string, title: string, message: string, type: 'info' | 'alert' | 'success') => void;
}

const PersonnelMatchModal: React.FC<PersonnelMatchModalProps> = ({ allUsers, readinessData, onClose, onNudge }) => {
    const [query, setQuery] = useState('');
    const [matches, setMatches] = useState<WorkforceMatch[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const { pt, persona } = usePersona();

    // Fix: Added useMemo to React imports to resolve "Cannot find name 'useMemo'" error on line 20.
    const EXAMPLES = useMemo(() => {
        if (persona.type === 'Non-Profit') return ["Youth mentor boundary check", "Emergency outreach lead", "Food bank logistics manager"];
        if (persona.type === 'University') return ["Clinical nursing shift candidate", "Lab safety certified student", "HIPAA compliant record clerk"];
        return ["Safety-certified equipment operator", "Customer de-escalation expert", "Shift supervisor candidate"];
    }, [persona.type]);

    const handleSearch = async (overrideQuery?: string) => {
        const activeQuery = overrideQuery || query;
        if (!activeQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await matchPersonnelToTask(activeQuery, readinessData);
            setMatches(results);
        } catch (e) {
            alert("Match Engine Offline.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <BaseModal title={`Canopy Nexus: Intelligent ${pt('learner')} Dispatch`} onClose={onClose}>
            <div className="space-y-8">
                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Precision Matching Nodes Active</span>
                        </div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Target Skill or Project Requirement</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Describe the mission or role requirement..."
                                className="flex-grow p-4 bg-white/10 border border-white/20 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/20 placeholder-slate-500"
                            />
                            <button 
                                onClick={() => handleSearch()}
                                disabled={isSearching || !query}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                            >
                                {isSearching ? '...' : 'Run Nexus Scan'}
                            </button>
                        </div>
                        
                        <div className="mt-6 flex flex-wrap gap-2">
                            {EXAMPLES.map(ex => (
                                <button 
                                    key={ex} 
                                    onClick={() => { setQuery(ex); handleSearch(ex); }}
                                    className="text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-colors"
                                >
                                    ✨ {ex}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                </div>

                <div className="space-y-4">
                    {isSearching && (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-white rounded-full animate-spin mx-auto"></div>
                            <p className="font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Analyzing {pt('readiness')} Passports...</p>
                        </div>
                    )}

                    {!isSearching && matches.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                            {matches.map(m => {
                                const user = allUsers.find(u => u.user_id === m.userId);
                                return (
                                    <div key={m.userId} className="p-6 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-[2.5rem] flex flex-col justify-between transition-all hover:border-blue-400 hover:shadow-2xl group relative overflow-hidden">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="relative">
                                                    <img src={user?.profilePictureUrl} className="w-16 h-16 rounded-[1.5rem] border-4 border-white dark:border-slate-700 shadow-xl group-hover:scale-110 transition-transform duration-500" alt="" />
                                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white dark:border-slate-800">✓</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Score</div>
                                                    <div className="text-3xl font-black italic tracking-tighter text-blue-600 leading-none">{m.matchScore}%</div>
                                                </div>
                                            </div>
                                            <h4 className="font-black text-xl text-slate-800 dark:text-white truncate leading-tight">{user?.name}</h4>
                                            <p className="text-[11px] text-slate-500 font-medium italic mt-3 leading-relaxed">"{m.justification}"</p>
                                            
                                            <div className="mt-6 space-y-3">
                                                 <div>
                                                     <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Prereqs Verified</p>
                                                     <div className="flex flex-wrap gap-1.5">
                                                         {m.metPrerequisites.slice(0, 3).map((p, i) => (
                                                             <span key={i} className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">✅ {p}</span>
                                                         ))}
                                                     </div>
                                                 </div>
                                                 {m.missingPrerequisites.length > 0 && (
                                                     <div>
                                                         <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Gap Training Detected</p>
                                                         <div className="flex flex-wrap gap-1.5">
                                                             {m.missingPrerequisites.map((p, i) => (
                                                                 <span key={i} className="text-[8px] font-black uppercase bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-100">⚠️ {p}</span>
                                                             ))}
                                                         </div>
                                                     </div>
                                                 )}
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                onNudge(m.userId, "Auto-Enrollment Initialized", `You have been precision-matched for: ${query}. Required training has been auto-assigned.`, 'success');
                                                alert(`Auto-assigned ${user?.name} to role and enrolled in required pathways.`);
                                            }}
                                            className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-95"
                                        >
                                            Auto-Enroll & Authorize
                                        </button>
                                        
                                        {/* Background Decor */}
                                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/5 rounded-full pointer-events-none group-hover:scale-150 transition-transform"></div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!isSearching && matches.length === 0 && query && (
                        <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-lg">No Match Found</p>
                            <p className="text-slate-400 text-xs font-medium mt-2">Try clarifying the required competencies.</p>
                        </div>
                    )}
                </div>
            </div>
        </BaseModal>
    );
};

export default PersonnelMatchModal;