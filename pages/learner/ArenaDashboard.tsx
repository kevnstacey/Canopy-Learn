
import React, { useMemo } from 'react';
import { TEAM_PERFORMANCE, GLOBAL_CHALLENGE, SOCIAL_ACTIVITY_FEED } from '../../data';
import Card from '../../components/Card';
import { usePersona } from '../../contexts/PersonaContext';

const ArenaDashboard: React.FC = () => {
    const { pt, persona } = usePersona();
    const sortedTeams = useMemo(() => [...TEAM_PERFORMANCE].sort((a,b) => b.totalPoints - a.totalPoints), []);
    const velocityLeaders = useMemo(() => [...TEAM_PERFORMANCE].sort((a,b) => b.velocityValue - a.velocityValue).slice(0, 3), []);
    
    const challengeProgress = Math.round((GLOBAL_CHALLENGE.currentPoints / GLOBAL_CHALLENGE.targetPoints) * 100);

    return (
        <div className="space-y-8 pb-12 animate-fade-in-up">
            {/* War Room Header */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden border-b-4 border-emerald-500 shadow-2xl">
                 <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                     <div>
                         <div className="flex items-center gap-2 mb-4">
                             <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Live Combat Arena</span>
                         </div>
                         <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none mb-6">
                             Social <span className="text-emerald-500">Prestige</span>
                         </h2>
                         <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
                             Collective intelligence in action. Your team's training velocity directly affects your department's global standing.
                         </p>
                     </div>

                     {/* Global Challenge Card */}
                     <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 relative group overflow-hidden">
                         <div className="flex justify-between items-start mb-6">
                             <div>
                                 <h3 className="text-xl font-black uppercase tracking-tighter text-emerald-400">{GLOBAL_CHALLENGE.title}</h3>
                                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ends in 12 days</p>
                             </div>
                             <div className="text-right">
                                 <span className="text-[10px] font-black text-slate-500 uppercase block">Global Goal</span>
                                 <span className="text-2xl font-black text-white">{GLOBAL_CHALLENGE.targetPoints.toLocaleString()}</span>
                             </div>
                         </div>

                         <div className="space-y-2 mb-6">
                             <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                 <span>Current Progress</span>
                                 <span>{challengeProgress}%</span>
                             </div>
                             <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                 <div 
                                    className="h-full bg-emerald-500 shadow-[0_0_15px_#10B981] transition-all duration-1000 ease-out" 
                                    style={{ width: `${challengeProgress}%` }}
                                 ></div>
                             </div>
                         </div>

                         <div className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                             <div className="text-2xl">🎁</div>
                             <div>
                                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Reward</p>
                                 <p className="text-sm font-bold text-white">{GLOBAL_CHALLENGE.reward}</p>
                             </div>
                         </div>
                         
                         {/* Radar Visual */}
                         <div className="absolute -right-10 -bottom-10 w-40 h-40 border-2 border-emerald-500/10 rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                     </div>
                 </div>
                 {/* Visual grid background */}
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none studio-grid"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Velocity Leaders Mini-Board */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {velocityLeaders.map((team, i) => (
                            <div key={team.department} className="p-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-xs">#{i+1}</div>
                                        <span className="text-[10px] font-black text-emerald-500">↑ {team.velocityValue} pts/day</span>
                                    </div>
                                    <h4 className="font-black text-lg text-slate-800 dark:text-white uppercase leading-none">{team.department}</h4>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Velocity Leader</p>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-5 text-4xl font-black group-hover:scale-125 transition-transform">🚀</div>
                            </div>
                        ))}
                    </div>

                    <Card title="Departmental Prestige Rankings">
                        <div className="space-y-4 pt-4">
                            {sortedTeams.map((team, idx) => (
                                <div key={team.department} className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.01] hover:border-blue-500/30 group">
                                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl text-white font-black italic text-xl shadow-lg transition-colors ${idx === 0 ? 'bg-emerald-600' : 'bg-slate-900 group-hover:bg-blue-600'}`}>
                                        #{idx + 1}
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <h4 className="text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase">{team.department}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-black uppercase ${team.velocity === 'Up' ? 'text-emerald-500' : team.velocity === 'Down' ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {team.velocity === 'Up' ? '▲ GAINING' : team.velocity === 'Down' ? '▼ SLOWING' : '● STABLE'}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{team.activeLearners} Active Personnel</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-slate-900 dark:text-white">{team.totalPoints.toLocaleString()}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase block tracking-widest">Team Pts</span>
                                            </div>
                                        </div>

                                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${idx === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${team.completionRate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Social Pulse Ticker (1/3) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl flex flex-col h-full min-h-[600px]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Live Pulse</h3>
                            <div className="flex gap-1">
                                <div className="w-1 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-1 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>

                        <div className="flex-grow p-6 space-y-8 overflow-y-auto max-h-[500px] scrollbar-hide">
                            {SOCIAL_ACTIVITY_FEED.map((feed, i) => (
                                <div key={feed.id} className="flex gap-4 group animate-fade-in-up" style={{ animationDelay: `${i*0.1}s` }}>
                                    <div className="text-2xl grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-125 duration-500">
                                        {feed.emoji}
                                    </div>
                                    <div className="flex-grow border-b border-slate-50 dark:border-slate-800 pb-4 last:border-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">{feed.user}</p>
                                            <span className="text-[10px] font-black text-emerald-600">+{feed.points} Pts</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-500 leading-tight">
                                            {feed.action} <br/> 
                                            <span className="text-[9px] text-slate-400 uppercase tracking-widest">{feed.target}</span>
                                        </p>
                                        <p className="text-[8px] text-slate-300 font-bold uppercase mt-2">{Math.floor((Date.now() - feed.timestamp) / (1000 * 60))}m ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-8 bg-blue-600 text-white text-center rounded-t-[2.5rem]">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-blue-200">Active Dominators</p>
                            <div className="flex justify-center -space-x-3 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="relative group">
                                        <img className="w-12 h-12 rounded-full border-4 border-blue-600 shadow-xl group-hover:-translate-y-3 transition-transform cursor-pointer" src={`https://i.pravatar.cc/150?u=mvp${i}`} alt="" />
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-2xl border border-white/10">
                                            Readiness Elite
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">View All Activity</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArenaDashboard;
