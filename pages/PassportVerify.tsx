
import React, { useMemo } from 'react';
import { USERS, ENROLLMENTS, CERTIFICATES, SUBMISSIONS, COMPLIANCE_DOCUMENTS, VOLUNTEER_ROLES, ROLE_ASSIGNMENTS, OVERRIDES } from '../data';
import { computeReadiness } from '../services/lmsService';

interface PassportVerifyProps {
    passportId: string;
    onClose: () => void;
}

const PassportVerify: React.FC<PassportVerifyProps> = ({ passportId, onClose }) => {
    // Simulate look-up from ID (which would be userId)
    const user = USERS.find(u => u.user_id === passportId || u.user_id.endsWith(passportId));

    const readiness = useMemo(() => {
        if (!user) return null;
        return computeReadiness(user.user_id, 'org-canopy-1', {
            enrollments: ENROLLMENTS,
            certificates: CERTIFICATES,
            submissions: SUBMISSIONS,
            complianceDocuments: COMPLIANCE_DOCUMENTS,
            roles: VOLUNTEER_ROLES,
            assignments: ROLE_ASSIGNMENTS,
            overrides: OVERRIDES
        });
    }, [user]);

    if (!user || !readiness) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
                <div className="text-center space-y-6 max-w-md">
                    <div className="text-6xl">⚠️</div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Passport Invalid</h1>
                    <p className="text-slate-400">The requested readiness passport could not be found or has expired.</p>
                    <button onClick={onClose} className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl">Return</button>
                </div>
            </div>
        );
    }

    const isApproved = readiness.overall_status === 'Approved';

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-1000 ${isApproved ? 'bg-emerald-950' : 'bg-red-950'}`}>
            {/* Header */}
            <div className="p-6 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                         <img src="https://res.cloudinary.com/dnecxetmp/image/upload/v1767662376/favicon_so1c2a.png" className="w-5 h-5 invert brightness-0" alt="" />
                    </div>
                    <span className="text-white font-black uppercase tracking-widest text-xs">Canopy Passport Verify</span>
                </div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Node: {readiness.org_id}</div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-6 md:p-12">
                {/* Large Status Ring */}
                <div className={`w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center text-center relative mb-12 shadow-3xl ${isApproved ? 'bg-emerald-500/10 border-8 border-emerald-500 shadow-emerald-500/20' : 'bg-red-500/10 border-8 border-red-500 shadow-red-500/20'}`}>
                    <div className="text-8xl mb-2">{isApproved ? '✅' : '⛔'}</div>
                    <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">{isApproved ? 'READY' : 'NOT READY'}</h2>
                    <div className="mt-4 px-4 py-1 bg-white rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-lg animate-pulse">
                        {new Date().toLocaleTimeString()}
                    </div>
                    
                    {/* Animated scanning bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/40 animate-[passport-scan_2s_linear_infinite] blur-sm"></div>
                </div>

                {/* User Data Card */}
                <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 space-y-8">
                    <div className="flex items-center gap-6">
                        <img src={user.profilePictureUrl} className="w-20 h-20 rounded-3xl border-4 border-white/10 shadow-lg" alt="" />
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1">{user.name}</h3>
                            <p className="text-xs text-white/50 font-bold uppercase tracking-widest">{user.employmentType} Personnel</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Authorized Roles</div>
                        <div className="grid grid-cols-1 gap-2">
                            {readiness.role_statuses.map(rs => (
                                <div key={rs.role_id} className={`p-4 rounded-2xl border flex justify-between items-center ${rs.status === 'Ready' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                    <span className="font-bold text-sm">{rs.role_title}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{rs.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!isApproved && (
                        <div className="p-4 bg-red-500/20 rounded-2xl border border-red-500/30">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Critical Blockers</p>
                            <ul className="space-y-1">
                                {readiness.blockers.map((b, i) => (
                                    <li key={i} className="text-xs text-red-100 font-medium">● {b.label}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mb-4">Cryptographically Signed Token</p>
                    <button onClick={onClose} className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest">End Verification Session</button>
                </div>
            </div>

            <style>{`
                @keyframes passport-scan { 
                    0% { transform: translateY(0); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(320px); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default PassportVerify;
