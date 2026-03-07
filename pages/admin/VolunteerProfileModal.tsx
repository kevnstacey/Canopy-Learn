
import React, { useState } from 'react';
import BaseModal from '../../components/modals/BaseModal';
import OverrideModal from '../../components/modals/OverrideModal';
import { User, VolunteerReadinessStatus, Program, ComplianceDocument, VolunteerRole, Certificate, Override } from '../../types';

interface VolunteerProfileModalProps {
    user: User;
    readiness: VolunteerReadinessStatus;
    programs: Program[];
    documents: ComplianceDocument[];
    roles: VolunteerRole[]; 
    certificates?: Certificate[];
    overrides?: Override[];
    currentAdminId?: string;
    onSaveOverride?: (override: Override) => void;
    onClose: () => void;
    onNotify?: (userId: string, title: string, message: string, type: 'info' | 'alert' | 'success') => void;
    onAssignRole?: (userId: string, roleId: string) => void;
    onRemoveRole?: (userId: string, roleId: string) => void;
}

const VolunteerProfileModal: React.FC<VolunteerProfileModalProps> = ({ 
    user, readiness, programs, documents, roles, certificates = [], overrides = [], currentAdminId, onSaveOverride, onClose, onNotify, onAssignRole, onRemoveRole 
}) => {
    
    const [overrideTarget, setOverrideTarget] = useState<{ id: string, type: Override['target_type'], title: string } | null>(null);
    const [isAssigningRole, setIsAssigningRole] = useState(false);
    const [selectedRoleToAssign, setSelectedRoleToAssign] = useState('');
    const [showPassportLink, setShowPassportLink] = useState(false);

    const handleNudge = () => {
        if (onNotify) {
            onNotify(user.user_id, 'Action Required', `Please complete your missing requirements.`, 'alert');
            alert(`Nudge sent to ${user.name}.`);
        }
    };

    const generatePassport = () => {
        setShowPassportLink(true);
        // Simulating the creation of a secure external record
    };

    const renderRoleBreakdown = (roleStatus: VolunteerReadinessStatus['role_statuses'][0]) => {
        const roleDef = roles.find(r => r.role_id === roleStatus.role_id);
        if (!roleDef) return null;

        const requirements = [
            ...roleDef.required_course_ids.map(id => ({ type: 'Course', id, title: programs.find(p => p.program_id === id)?.title || id })),
            ...(roleDef.required_document_types || []).map(type => ({ type: 'Document', id: type, title: type }))
        ];

        return (
            <div key={roleStatus.role_id} className="mb-6 border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex justify-between items-center border-b-2 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <h4 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">{roleStatus.role_title}</h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            roleStatus.status === 'Ready' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {roleStatus.status}
                        </span>
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                    {requirements.map((req, idx) => {
                        const activeOverride = overrides.find(o => o.user_id === user.user_id && o.target_id === req.id);
                        const isMissing = roleStatus.missing_requirements.some(s => s.includes(req.id));
                        
                        let statusLabel = isMissing ? 'Incomplete' : 'Verified';
                        let statusColor = isMissing ? 'text-red-600' : 'text-emerald-600';
                        let icon = isMissing ? '⚠️' : '✅';

                        if (activeOverride) {
                            statusLabel = 'Override Active';
                            statusColor = 'text-purple-600';
                            icon = '⚙️';
                        }

                        return (
                            <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-black uppercase bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-slate-500 w-16 text-center">{req.type}</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{req.title}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-black text-[10px] uppercase tracking-wider ${statusColor}`}>
                                        {icon} {statusLabel}
                                    </span>
                                    <button 
                                        onClick={() => setOverrideTarget({ id: req.id, type: req.type === 'Course' ? 'Program' : 'Document', title: req.title })}
                                        className="text-[10px] font-black uppercase text-blue-600 hover:underline px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                                    >
                                        Override
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <BaseModal title="Personnel Readiness Record" onClose={onClose}>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                    <img src={user.profilePictureUrl || 'https://i.pravatar.cc/150'} alt={user.name} className="w-24 h-24 rounded-3xl border-4 border-white dark:border-slate-700 shadow-xl" />
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                            {user.departments.map(d => <span key={d} className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">{d}</span>)}
                        </div>
                    </div>
                    <div className="md:ml-auto text-center md:text-right">
                        <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Aggregate Status</div>
                        <span className={`px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-widest border-2 shadow-sm ${
                            readiness.overall_status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            readiness.overall_status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {readiness.overall_status}
                        </span>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap gap-4">
                    <button onClick={generatePassport} className="flex-1 bg-slate-900 text-white font-black uppercase tracking-widest text-xs py-4 px-6 rounded-2xl hover:bg-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
                        📂 Generate Readiness Passport
                    </button>
                    {readiness.overall_status !== 'Approved' && (
                        <button onClick={handleNudge} className="flex-1 bg-blue-600 text-white font-black uppercase tracking-widest text-xs py-4 px-6 rounded-2xl hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
                            🔔 Dispatch Compliance Nudge
                        </button>
                    )}
                </div>

                {showPassportLink && (
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-[2rem] animate-fade-in-up">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🎫</div>
                            <div className="flex-grow">
                                <h4 className="font-black text-emerald-800 dark:text-emerald-100">Passport Created</h4>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">This secure link validates {user.name}'s compliance for 7 days.</p>
                                <div className="mt-3 flex gap-2">
                                    <input readOnly value={`https://verify.canopylearn.app/p/${user.user_id.slice(-4)}`} className="flex-grow text-[10px] font-mono p-2 rounded-lg bg-white/50 border border-emerald-200" />
                                    <button onClick={() => alert("Copied!")} className="bg-emerald-600 text-white text-[10px] font-black uppercase px-4 rounded-lg">Copy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.25em] flex items-center gap-3">
                        <span className="flex-grow h-px bg-slate-100 dark:bg-slate-800"></span>
                        Role Compliance Grid
                        <span className="flex-grow h-px bg-slate-100 dark:bg-slate-800"></span>
                    </h3>
                    {readiness.role_statuses.length === 0 ? (
                        <p className="text-center py-12 text-slate-400 italic font-medium">No roles assigned to this profile.</p>
                    ) : (
                        readiness.role_statuses.map(renderRoleBreakdown)
                    )}
                </div>
            </div>

            {overrideTarget && (
                <OverrideModal
                    userId={user.user_id}
                    targetId={overrideTarget.id}
                    targetType={overrideTarget.type}
                    targetTitle={overrideTarget.title}
                    currentAdminId={currentAdminId || 'sys'}
                    onSave={onSaveOverride || (() => {})}
                    onClose={() => setOverrideTarget(null)}
                />
            )}
        </BaseModal>
    );
};

export default VolunteerProfileModal;
