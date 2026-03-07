
import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { User, Enrollment, Certificate, Requirement, Submission, ReadinessPayload, Program } from '../types';
import { getReadinessPayload } from '../services/readinessService';

interface IntegrationSimulatorProps {
    users: User[];
    programs: Program[];
    enrollments: Enrollment[];
    certificates: Certificate[];
    requirements: Requirement[];
    submissions: Submission[];
    onDeepLink: (programId: string, intent: string) => void;
}

const IntegrationSimulator: React.FC<IntegrationSimulatorProps> = ({ 
    users, programs, enrollments, certificates, requirements, submissions, onDeepLink 
}) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('user-3'); // Alice
    const [selectedProgramId, setSelectedProgramId] = useState<string>('prog-food-safe');
    const [intent, setIntent] = useState<string>('Food Bank Shift - March 12');
    const [simulatedComplete, setSimulatedComplete] = useState(false);

    const currentUser = users.find(u => u.user_id === selectedUserId) || users[0];

    const payload = useMemo<ReadinessPayload>(() => {
        const basePayload = getReadinessPayload(
            currentUser,
            selectedProgramId,
            enrollments,
            certificates,
            requirements,
            submissions,
            programs
        );
        
        if (simulatedComplete) {
            return {
                ...basePayload,
                training_status: {
                    ...basePayload.training_status,
                    completed: true,
                    status_code: 'APPROVED'
                }
            };
        }
        return basePayload;
    }, [currentUser, selectedProgramId, enrollments, certificates, requirements, submissions, programs, simulatedComplete]);

    const isUnlocked = payload.training_status.status_code === 'APPROVED';

    const statusColor = {
        'APPROVED': 'bg-green-100 text-green-800 border-green-200',
        'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'EXPIRED': 'bg-red-100 text-red-800 border-red-200',
        'MISSING': 'bg-slate-100 text-slate-800 border-slate-200'
    }[payload.training_status.status_code];

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">C</div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tighter">Canopy <span className="text-blue-600 font-black italic">Connect</span></h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT: The "Canopy" UI */}
                    <div className="space-y-6">
                        <div className="relative">
                            <Card title="Shift Assignment" className={`border-l-8 transition-all duration-1000 ${isUnlocked ? 'border-l-emerald-500' : 'border-l-slate-300 opacity-80'}`}>
                                <div className="mb-4">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{intent}</h2>
                                        {isUnlocked ? (
                                            <span className="text-2xl animate-bounce">🟢</span>
                                        ) : (
                                            <span className="text-2xl grayscale">🔒</span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Canopy Community Hub</p>
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl border-2 border-slate-100 dark:border-slate-700 mb-6 transition-all group">
                                    <h4 className="font-black text-[10px] uppercase text-slate-500 mb-2 tracking-widest flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                                        Eligibility Verification
                                    </h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold">{programs.find(p => p.program_id === selectedProgramId)?.title || 'Food Safe Level 1'}</span>
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-full border shadow-sm ${statusColor}`}>
                                            {payload.training_status.status_code}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    disabled={!isUnlocked}
                                    className={`w-full py-4 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl transition-all active:scale-95 ${
                                        isUnlocked 
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 animate-pulse' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isUnlocked ? 'Confirm Signup' : 'Assignment Locked'}
                                </button>

                                {!isUnlocked && (
                                    <div className="mt-6 text-center animate-fade-in">
                                        <p className="text-xs text-slate-500 mb-3 font-medium">Compliance block active. Complete training to unlock.</p>
                                        <button 
                                            onClick={() => onDeepLink(selectedProgramId, intent)}
                                            className="text-blue-600 font-black uppercase text-[10px] tracking-widest hover:underline px-4 py-2 bg-blue-50 rounded-full"
                                        >
                                            Go to Training Portal &rarr;
                                        </button>
                                    </div>
                                )}
                            </Card>
                            
                            {/* Simulator Overlay Success */}
                            {isUnlocked && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden rounded-xl">
                                    <div className="text-9xl opacity-20 animate-ping">⚡</div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-black text-xs uppercase text-slate-500 tracking-widest mb-6">Simulator Dashboard</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Simulate Training Completion</label>
                                    <button 
                                        onClick={() => setSimulatedComplete(!simulatedComplete)}
                                        className={`w-full py-3 rounded-xl font-black uppercase text-xs transition-all border-2 ${
                                            simulatedComplete 
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500'
                                        }`}
                                    >
                                        {simulatedComplete ? 'Training Verified (SIM)' : 'Mark Training Done (SIM)'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Target Personnel</label>
                                        <select 
                                            value={selectedUserId} 
                                            onChange={e => { setSelectedUserId(e.target.value); setSimulatedComplete(false); }}
                                            className="w-full p-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 font-bold text-sm"
                                        >
                                            {users.filter(u => u.role === 'Learner').map(u => (
                                                <option key={u.user_id} value={u.user_id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Compliance Gating</label>
                                        <select 
                                            value={selectedProgramId} 
                                            onChange={e => { setSelectedProgramId(e.target.value); setSimulatedComplete(false); }}
                                            className="w-full p-2.5 border rounded-xl dark:bg-slate-700 dark:border-slate-600 font-bold text-sm"
                                        >
                                            {programs.map(p => (
                                                <option key={p.program_id} value={p.program_id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: The Data Contract */}
                    <div className="space-y-6">
                        <Card title="Readiness API Contract" className="bg-slate-900 text-slate-200">
                             <div className="flex justify-between items-center mb-4">
                                <p className="text-[10px] text-slate-500 font-mono">GET /v1/readiness/{currentUser.user_id}</p>
                                <span className="text-[8px] font-black text-emerald-400 uppercase border border-emerald-400/30 px-2 py-0.5 rounded">Real-time sync</span>
                             </div>
                            <pre className="font-mono text-[11px] bg-black/40 p-4 rounded-2xl overflow-x-auto text-emerald-400 border border-white/5 shadow-inner">
                                {JSON.stringify(payload, null, 2)}
                            </pre>
                            <div className="mt-6 space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Decision Matrix</h4>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Credential Found', val: payload.training_status.completed ? 'PASS' : 'FAIL', ok: payload.training_status.completed },
                                        { label: 'Audit Trail Signature', val: 'VERIFIED', ok: true },
                                        { label: 'Organizational Multi-tenancy', val: 'ISOLATED', ok: true },
                                        { label: 'Overall Authorization', val: isUnlocked ? 'GRANTED' : 'DENIED', ok: isUnlocked },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                            <span className="text-xs text-slate-400">{item.label}</span>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${item.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {item.val}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationSimulator;
