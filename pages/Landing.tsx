import React, { useState } from 'react';

interface LandingProps {
    onLogin: () => void;
    onGoToVerify: () => void;
}

type VisitorPersona = 'individual' | 'nonprofit' | 'business' | 'institution';

interface PersonaContent {
    id: VisitorPersona;
    title: string;
    tagline: string;
    icon: string;
    color: string;
    hook: string;
    features: { title: string; desc: string; icon: string }[];
    cta: string;
}

const PERSONA_DATA: Record<VisitorPersona, PersonaContent> = {
    individual: {
        id: 'individual',
        title: 'Volunteer',
        tagline: 'The Ready Individual',
        icon: '👋',
        color: 'emerald',
        hook: 'Own your impact. Complete training once and take your verified status everywhere.',
        cta: 'Create My Passport',
        features: [
            { title: 'Readiness Passport', desc: 'A portable record of your safety and ethics certifications valid across the entire Canopy network.', icon: '🎫' },
            { title: 'Rapid Micro-Learning', desc: 'Mobile-first quizzes and SOPs designed to get you on-site and ready in minutes, not hours.', icon: '⚡' },
            { title: 'Verified Trust', desc: 'Secure, high-fidelity proof of your vulnerable sector checks and specialized skills.', icon: '🛡️' }
        ]
    },
    nonprofit: {
        id: 'nonprofit',
        title: 'Nonprofit / Charity',
        tagline: 'The Compliance Anchor',
        icon: '🤝',
        color: 'blue',
        hook: 'Mobilize high-trust teams without the administrative weight of manual compliance.',
        cta: 'Protect My Organization',
        features: [
            { title: 'Automated Guardrails', desc: 'Set your organization’s standards and let Canopy handle the verification and nagging automatically.', icon: '🚨' },
            { title: 'Certn Integration', desc: 'Seamless, automated background and criminal record checks directly within the onboarding flow.', icon: '🔍' },
            { title: 'Real-time Roster Health', desc: 'A live dashboard showing exactly who is ready for deployment and whose credentials are decaying.', icon: '📈' }
        ]
    },
    business: {
        id: 'business',
        title: 'Business Owner',
        tagline: 'The Social Impact Engine',
        icon: '💼',
        color: 'indigo',
        hook: 'Equip your staff for community impact. Ensure every employee represents your brand with verified safety.',
        cta: 'Launch CSR Portal',
        features: [
            { title: 'Standardized Safety', desc: 'Ensure employees volunteering for food drives or events are trained to the highest safety and ethics standards.', icon: '✅' },
            { title: 'CSR Impact Tracking', desc: 'Real-time reporting of verified social impact hours contributed by your entire workforce.', icon: '📊' },
            { title: 'Liability Protection', desc: 'Minimize corporate risk with standardized, auditable training for all staff community engagements.', icon: '🛡️' }
        ]
    },
    institution: {
        id: 'institution',
        title: 'Institution',
        tagline: 'The Academic Audit Hub',
        icon: '🎓',
        color: 'purple',
        hook: 'Sync student volunteer milestones with academic requirements via a secure, PIPEDA-compliant trail.',
        cta: 'Partner With Canopy',
        features: [
            { title: 'Milestone Sync', desc: 'Automate graduation requirements. Once a student is "Ready" in Canopy, it clears in your records.', icon: '🔗' },
            { title: 'Sovereign Audit Trail', desc: 'Institutional-grade record keeping that exceeds FIPPA and HIPAA standards for student placements.', icon: '⚖️' },
            { title: 'Clinical Readiness', desc: 'Manage complex hospital and school placement requirements with multimodal AI proctoring.', icon: '👁️' }
        ]
    }
};

const Landing: React.FC<LandingProps> = ({ onLogin, onGoToVerify }) => {
    const [selectedPersona, setSelectedPersona] = useState<VisitorPersona | null>(null);

    const activePersona = selectedPersona ? PERSONA_DATA[selectedPersona] : null;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
            
            {/* --- TOP HUD ECOSYSTEM PULSE --- */}
            <div className="bg-slate-950 text-white py-3 overflow-hidden whitespace-nowrap border-b border-white/5 relative z-[60]">
                <div className="flex animate-[pulse_4s_infinite] gap-12 text-[10px] font-black uppercase tracking-[0.4em] px-6 items-center justify-center">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                        CANOPY NETWORK: SYNCED
                    </span>
                    <span className="text-slate-700 hidden sm:inline">●</span>
                    <span className="hidden sm:inline">READINESS NODES: MONTREAL | TORONTO | VANCOUVER</span>
                    <span className="text-slate-700">●</span>
                    <span>GLOBAL COMPLIANCE MOAT: ACTIVE</span>
                    <span className="text-slate-700">●</span>
                    <span>SENTINEL RISK SCAN: STABLE</span>
                </div>
            </div>

            {/* --- NAVIGATION --- */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-900">
                <div className="container mx-auto px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { setSelectedPersona(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                         <div className="flex items-center gap-3">
                            <img 
                                src="https://res.cloudinary.com/dnecxetmp/image/upload/v1768946660/Canopy_Logo2_zud2d2.png" 
                                alt="Canopy Logo" 
                                className="h-8 md:h-10 w-auto object-contain dark:invert" 
                            />
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Learn</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Intelligence Layer</span>
                            </div>
                         </div>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                        <a href="#ecosystem" className="hover:text-emerald-500 transition-colors">Ecosystem</a>
                        <a href="#intelligence" className="hover:text-emerald-500 transition-colors">Intelligence</a>
                        <a href="#passport" className="hover:text-emerald-500 transition-colors">Passport</a>
                        <a href="#sovereignty" className="hover:text-emerald-500 transition-colors">Sovereignty</a>
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={onGoToVerify} className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors">
                            Registry
                        </button>
                        <button onClick={onLogin} className="bg-slate-950 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/10">
                            Enter Portal
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative pt-12 pb-24 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-all duration-1000">
                <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh] relative z-10">
                    <div className="space-y-12 animate-fade-in-up">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-black tracking-[0.25em] uppercase border-2 border-emerald-100 dark:border-emerald-900 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Official Readiness Intelligence Engine
                            </div>
                            
                            <div className="space-y-6">
                                <h1 className="text-6xl md:text-[5.5rem] font-black text-slate-950 dark:text-white leading-[0.85] tracking-tighter uppercase italic">
                                    The Bridge Between <br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500">Safe Action.</span>
                                </h1>
                                <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
                                    Canopy Learn is the intelligence layer of the network—transforming organizational mission into verified, risk-ready service.
                                </p>
                            </div>
                        </div>

                        {/* --- PERSONA SELECTOR --- */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Start by telling us who you are:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {(Object.keys(PERSONA_DATA) as VisitorPersona[]).map(key => {
                                    const p = PERSONA_DATA[key];
                                    const isActive = selectedPersona === key;
                                    return (
                                        <button 
                                            key={key}
                                            onClick={() => setSelectedPersona(key)}
                                            className={`group flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                                                isActive 
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xl scale-105' 
                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-400'
                                            }`}
                                        >
                                            <span className={`text-4xl mb-3 transition-transform duration-500 ${isActive ? 'scale-125' : 'group-hover:scale-110'}`}>{p.icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none text-center">{p.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* --- LARGE PREDOMINANT LOGO (Fades when persona selected) --- */}
                    <div className={`relative flex items-center justify-center lg:justify-end transition-all duration-1000 ${selectedPersona ? 'opacity-20 scale-90 blur-lg' : 'opacity-100 animate-fade-in'}`}>
                        <div className="relative z-10 p-4 md:p-8 transform hover:scale-105 transition-transform duration-700">
                            <img 
                                src="https://res.cloudinary.com/dnecxetmp/image/upload/v1768946660/Canopy_Logo2_zud2d2.png" 
                                alt="Canopy Ecosystem" 
                                className="w-full max-w-[24rem] md:max-w-[42rem] h-auto object-contain dark:invert opacity-95 drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]" 
                            />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/5 rounded-full blur-[100px] -z-10 group-hover:bg-blue-500/5 transition-colors duration-1000"></div>
                    </div>

                    {/* --- DEEP-DIVE OVERLAY CONTENT --- */}
                    {activePersona && (
                        <div className="absolute inset-0 z-20 flex items-center justify-end pr-0 lg:pr-12 pointer-events-none">
                            <div className="w-full lg:w-[45%] bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-2 border-emerald-500/30 p-10 md:p-12 animate-fade-in-up pointer-events-auto relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 text-6xl opacity-10">{activePersona.icon}</div>
                                <div className="relative z-10 space-y-8">
                                    <div>
                                        <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">{activePersona.tagline}</h2>
                                        <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-[0.9] italic uppercase tracking-tighter mb-4">{activePersona.title} <br/> Intelligence.</h3>
                                        <p className="text-lg text-slate-500 font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-6">
                                            "{activePersona.hook}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        {activePersona.features.map((f, i) => (
                                            <div key={i} className="flex gap-5 items-start">
                                                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">{f.icon}</div>
                                                <div>
                                                    <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">{f.title}</h4>
                                                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{f.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                        <button onClick={onLogin} className="flex-1 py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs">
                                            {activePersona.cta}
                                        </button>
                                        <button onClick={() => setSelectedPersona(null)} className="py-5 px-8 border-2 border-slate-100 dark:border-slate-800 font-black text-slate-400 hover:text-slate-600 rounded-2xl uppercase text-xs tracking-widest">
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Visual grid pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none studio-grid"></div>
            </header>

            {/* --- ECOSYSTEM SECTION --- */}
            <section id="ecosystem" className="py-24 bg-slate-950 border-y border-white/5 relative overflow-hidden">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="max-w-md">
                        <img src="https://res.cloudinary.com/dnecxetmp/image/upload/v1768946660/Canopy_Logo2_zud2d2.png" alt="Canopy Ecosystem" className="h-10 w-auto mb-8 opacity-90 dark:invert" />
                        <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.5em] mb-4">Integrated Network</h2>
                        <p className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Canopy Learn doesn't stand alone.
                        </p>
                        <p className="text-slate-400 mt-4 font-medium leading-relaxed">
                            It continuously syncs with the Canopy App to unlock shifts, block unsafe actions, and provide real-time readiness verification for thousands of users.
                        </p>
                        <div className="mt-8">
                             <a 
                                href="https://canopy-community.replit.app" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-3 text-[10px] font-black uppercase text-blue-500 tracking-[0.3em] hover:text-blue-400 transition-colors"
                             >
                                 Visit Canopy Community Hub <span>&rarr;</span>
                             </a>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-12 bg-white/5 p-12 rounded-[3rem] border border-white/10 shadow-2xl relative group">
                        <a 
                            href="https://canopy-community.replit.app" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-center space-y-3 block hover:scale-105 transition-transform"
                        >
                             <div className="text-4xl">📱</div>
                             <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Canopy App</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">(PARTICIPATION)</p>
                             </div>
                             <span className="text-[8px] font-black text-blue-500 border border-blue-500/30 px-2 py-0.5 rounded">LAUNCH &rarr;</span>
                        </a>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">SYNCING</span>
                        </div>
                        <div className="text-center space-y-3">
                             <div className="text-4xl">🧠</div>
                             <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Canopy Learn</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">(READINESS)</p>
                             </div>
                             <span className="text-[8px] font-black text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded">ACTIVE</span>
                        </div>
                        {/* Interactive Background Glow */}
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]"></div>
                    </div>
                </div>
            </section>

            {/* --- INTELLIGENCE PILLARS --- */}
            <section id="intelligence" className="py-32 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center mb-24 space-y-6">
                        <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.5em]">The Shift in Perspective</h2>
                        <h3 className="text-5xl md:text-7xl font-black text-slate-950 dark:text-white tracking-tighter leading-none italic uppercase">Not Training Software. <br/> Readiness Intelligence.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: '⚡', t: 'Instant Course Creation', d: 'Turn any SOP, PDF, or video into a complete training program in seconds. High-fidelity instruction on demand.' },
                            { icon: '📈', t: 'Predictive Compliance', d: 'Forecast readiness gaps and certification decay months before they become operational incidents.' },
                            { icon: '🚨', t: 'Sentinel Monitoring', d: 'Automatically detect confusing policies via AI analysis of learner behavior and questions before failure occurs.' },
                            { icon: '👁️', t: 'Vision-Based Verification', d: 'Verify safety and compliance in physical environments using vision-based audits—closing the loop on theory.' },
                            { icon: '🛡️', t: 'The Liability Shield', d: 'Generate insurance-grade proof of risk mitigation with cryptographically signed readiness reports for your board.' },
                            { icon: '🔗', t: 'Just-In-Time Authorization', d: 'Training completion instantly clears gating blocks in the Canopy ecosystem, enabling safe service immediately.' }
                        ].map((feat, i) => (
                            <div key={i} className="p-10 rounded-[3rem] bg-slate-50 dark:bg-slate-900 border-2 border-transparent hover:border-emerald-500 transition-all group flex flex-col h-full shadow-sm hover:shadow-xl">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-sm mb-10 group-hover:scale-110 transition-transform group-hover:rotate-6 shadow-emerald-500/5">
                                    {feat.icon}
                                </div>
                                <h4 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mb-4 uppercase italic">{feat.t}</h4>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feat.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- THE READINESS PASSPORT --- */}
            <section id="passport" className="py-32 bg-slate-950 text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative">
                             {/* Ultra-High Fidelity Passport Card */}
                             <div className="max-w-sm mx-auto bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[3.5rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] rotate-[-2deg] hover:rotate-0 transition-transform duration-1000 relative overflow-hidden group">
                                 <div className="flex justify-between items-start mb-14 relative z-10">
                                     <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white/20 overflow-hidden p-1">
                                          <img src="https://res.cloudinary.com/dnecxetmp/image/upload/v1767662376/favicon_so1c2a.png" className="w-full h-full object-contain" alt="" />
                                     </div>
                                     <div className="text-right">
                                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ecosystem Status</p>
                                         <div className="flex items-center gap-2 justify-end">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <p className="text-emerald-400 font-black text-sm uppercase tracking-tighter">Verified ReadY</p>
                                         </div>
                                     </div>
                                 </div>
                                 
                                 <div className="space-y-8 relative z-10">
                                     <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-[0.8] mb-4">Readiness <br/>Passport</h3>
                                     
                                     <div className="flex items-center gap-5 py-6 border-y border-white/10">
                                         <div className="w-16 h-16 rounded-[1.5rem] bg-slate-700 border-4 border-emerald-500/40 overflow-hidden shadow-2xl">
                                             <img src="https://i.pravatar.cc/150?img=9" className="w-full h-full object-cover" alt="Sarah" />
                                         </div>
                                         <div>
                                             <p className="text-lg font-black tracking-tight leading-none">Sarah Jenkins</p>
                                             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                                 <span className="w-1 h-1 bg-blue-500 rounded-full"></span> ID: CAN-4912-X
                                             </p>
                                         </div>
                                     </div>

                                     <div className="flex justify-between items-end pt-2">
                                         <div className="w-20 h-20 bg-white p-2 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                             <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=canopy-verify" className="w-full h-full opacity-80 mix-blend-multiply" alt="QR" />
                                         </div>
                                         <div className="text-right">
                                             <p className="text-[8px] font-mono text-slate-400 uppercase tracking-[0.2em] leading-tight">Cryptographically Signed <br/> Readiness Token v2.0</p>
                                         </div>
                                     </div>
                                 </div>
                                 {/* Dynamic Scanline Overlay */}
                                 <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             </div>

                             {/* Neon Scanner Bar */}
                             <div className="absolute top-1/2 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_30px_#10B981] animate-[scanner_3.5s_infinite] opacity-30 z-20"></div>
                        </div>

                        <div className="order-1 lg:order-2 space-y-10">
                            <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.5em]">The Core Credential</h2>
                            <h3 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase italic">Portable. <br/> Verifiable. <br/> <span className="text-emerald-500">Trusted.</span></h3>
                            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg">
                                Readiness Passports are portable records of competency—verifiable across organizations, institutions, and jurisdictions. One identity for every mission.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['Clinical Placements', 'Volunteer Deployments', 'Regulated Sites', 'Government Grants'].map((use, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]"></div>
                                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-200">{use}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={onGoToVerify} className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-[0.4em] text-xs hover:gap-5 transition-all pt-6">
                                Verify a Passport <span>&rarr;</span>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Visual Glows */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 blur-[150px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-emerald-600/10 blur-[150px] -z-10"></div>
            </section>

            {/* --- PERSONA PILLARS --- */}
            <section className="py-32 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="space-y-8 p-10 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-transparent hover:border-emerald-500/20 transition-all">
                            <div className="h-1.5 bg-emerald-500 w-16 rounded-full"></div>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter">Volunteers</h3>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Unlock higher-impact roles with confidence, clarity, and portable proof of your readiness. Turn your passion into auditable impact.
                            </p>
                        </div>
                        <div className="space-y-8 p-10 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-transparent hover:border-blue-500/20 transition-all">
                            <div className="h-1.5 bg-blue-500 w-16 rounded-full"></div>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter">Managers</h3>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                See exactly who is ready for which task—and automatically generate the training needed to close gaps before they become incidents.
                            </p>
                        </div>
                        <div className="space-y-8 p-10 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-transparent hover:border-slate-800/20 transition-all">
                            <div className="h-1.5 bg-slate-950 dark:bg-white w-16 rounded-full"></div>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter">Institutions</h3>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Monitor readiness at scale, fund programs based on performance, and reduce organizational liability with insurance-grade intelligence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- DATA SOVEREIGNTY / TRUST --- */}
            <section id="sovereignty" className="py-32 bg-slate-100 dark:bg-slate-900/50">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-20">
                        <div className="flex-1 space-y-8">
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-red-600 rounded-2xl text-white font-black text-[10px] tracking-widest uppercase shadow-lg shadow-red-500/10">
                                🍁 Sovereign Canadian Node
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] italic">
                                Built for <br/>Strategic Defense.
                            </h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Data residency is not a feature—it's a shield. Built for the public sector, healthcare, and education. All nodes are isolated within Canadian borders to exceed PIPEDA, FIPPA, and HIPAA standards from day one.
                            </p>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-6 w-full">
                            {[
                                { l: 'PIPEDA', s: 'Verified' },
                                { l: 'FIPPA', s: 'Aligned' },
                                { l: 'HIPAA', s: 'Certified' },
                                { l: 'FERPA', s: 'LTI Aligned' }
                            ].map((s, i) => (
                                <div key={i} className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 text-center shadow-xl transform hover:-translate-y-2 transition-transform">
                                    <p className="text-3xl font-black text-slate-950 dark:text-white leading-none tracking-tighter">{s.l}</p>
                                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mt-3">{s.s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA SECTION --- */}
            <section className="py-40 bg-slate-950 relative overflow-hidden">
                <div className="container mx-auto px-6 text-center relative z-10 space-y-16">
                    <div className="max-w-4xl mx-auto space-y-6">
                         <img src="https://res.cloudinary.com/dnecxetmp/image/upload/v1768946660/Canopy_Logo2_zud2d2.png" alt="Canopy Ecosystem" className="h-16 w-auto mx-auto mb-12 dark:invert" />
                        <h2 className="text-6xl md:text-[5rem] font-black text-white tracking-tighter leading-[0.85] uppercase italic">
                            Engagement Starts in Canopy. <br/>
                            <span className="text-emerald-500">Readiness Is Guaranteed Here.</span>
                        </h2>
                        <p className="text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                            Transform your organization into a high-fidelity intelligence network. Verified safety. Sovereign data. Real impact.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button onClick={onLogin} className="px-16 py-8 bg-white text-slate-950 font-black rounded-[2.5rem] text-xl uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                            Enter the Hub
                        </button>
                        <a href="https://canopy-community.replit.app" target="_blank" rel="noreferrer" className="px-16 py-8 bg-emerald-600 text-white font-black rounded-[2.5rem] text-xl uppercase tracking-[0.2em] hover:bg-emerald-500 active:scale-95 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.1)] flex items-center gap-4 justify-center">
                             Explore Ecosystem <span>&rarr;</span>
                        </a>
                    </div>

                    <div className="pt-20">
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em]">Powered by Canopy Infrastructure Network</p>
                    </div>
                </div>
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none studio-grid"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]"></div>
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]"></div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div className="space-y-8 max-w-md">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg p-1.5 overflow-hidden">
                                    <img src="https://res.cloudinary.com/dnecxetmp/image/upload/v1767662376/favicon_so1c2a.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Learn</span>
                            </div>
                            <p className="text-lg text-slate-500 leading-relaxed font-medium">
                                The strategic readiness and intelligence layer of the Canopy Outreach Network. Built for public sector trust and high-impact volunteer service.
                            </p>
                            <div className="flex items-center gap-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                <span>Montreal Node</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span>Verified Sovereign</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                            <div className="flex flex-col gap-5">
                                <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-[0.2em] border-b-4 border-emerald-500 pb-2 w-fit">Ecosystem</span>
                                <a href="https://canopy-community.replit.app" target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-500 hover:text-emerald-500 transition-colors">Community Hub</a>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-emerald-500 transition-colors">Shift Board</a>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-emerald-500 transition-colors">Global Rewards</a>
                            </div>
                            <div className="flex flex-col gap-5">
                                <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-[0.2em] border-b-4 border-blue-500 pb-2 w-fit">Intelligence</span>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors">Sentinel AI</a>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors">Autopilot Ingest</a>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors">Readiness API</a>
                            </div>
                            <div className="flex flex-col gap-5">
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b-4 border-slate-500 pb-2 w-fit">Trust</span>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Data Residency</a>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Audit & Security</a>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Charter</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-32 pt-10 border-t border-slate-50 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-4">
                             <img src="https://res.cloudinary.com/dnecxetmp/image/upload/v1768946660/Canopy_Logo2_zud2d2.png" alt="Canopy" className="h-6 w-auto opacity-30 grayscale dark:invert" />
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">© 2025 CANOPY INFRASTRUCTURE. DATA RESIDENCY: CANADA.</p>
                        </div>
                        <div className="flex gap-8">
                             <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center opacity-40">🍁</div>
                             <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center opacity-40">🛡️</div>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes scanner { 
                    0% { transform: translateY(-150px); opacity: 0; }
                    15% { opacity: 0.6; }
                    85% { opacity: 0.6; }
                    100% { transform: translateY(450px); opacity: 0; }
                }
                .perspective-1000 { perspective: 1500px; }
                .rotate-y-[-10deg] { transform: rotateY(-10deg) rotateX(5deg); }
                .studio-grid {
                    background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px);
                    background-size: 30px 30px;
                }
                .dark .studio-grid {
                    background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
                }
            `}</style>
        </div>
    );
};

export default Landing;