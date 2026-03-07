
import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import AddUserModal from '../components/modals/AddUserModal';
import BulkUploadModal from '../components/modals/BulkUploadModal';
import VolunteerProfileModal from './admin/VolunteerProfileModal';
import { User, Enrollment, Submission, Department, Certificate, ComplianceDocument, VolunteerRole, VolunteerRoleAssignment, VolunteerReadinessStatus, Override } from '../types';
import { SAMPLE_CSV_DATA, ORGANIZATION } from '../data';
import { computeReadiness } from '../services/lmsService';
import { usePersona } from '../contexts/PersonaContext';

interface StaffManagementProps {
    allUsers: User[];
    enrollments: Enrollment[];
    submissions: Submission[];
    certificates: Certificate[]; 
    complianceDocuments?: ComplianceDocument[];
    roles?: VolunteerRole[];
    roleAssignments?: VolunteerRoleAssignment[];
    overrides?: Override[];
    onSaveOverride?: (override: Override) => void;
    currentUser: User;
    onAddUser: (newUser: Omit<User, 'user_id' | 'startDate'>) => void;
    onAddUsers?: (newUsers: Omit<User, 'user_id' | 'startDate'>[]) => void;
    onNotify: (userId: string, title: string, message: string, type: 'info' | 'alert' | 'success') => void;
    onAssignRole?: (userId: string, roleId: string) => void;
    onRemoveRole?: (userId: string, roleId: string) => void;
}

const ReadinessSpine = ({ readiness }: { readiness: VolunteerReadinessStatus }) => {
    const courses = readiness.blockers.filter(b => b.type === 'Course').length;
    const docs = readiness.blockers.filter(b => b.type === 'Document').length;
    const policy = readiness.blockers.filter(b => b.type === 'Policy').length;

    const Icon = ({ value, label, emoji, colorClass }: { value: number, label: string, emoji: string, colorClass: string }) => (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-tighter border shadow-sm ${value > 0 ? colorClass : 'bg-green-50 text-green-700 border-green-200 opacity-30'}`} title={`${value} ${label} Blocking`}>
            <span>{emoji}</span>
            {value > 0 && <span>{value}</span>}
        </div>
    );

    return (
        <div className="flex gap-1.5 items-center">
            <Icon value={courses} label="Courses" emoji="🎓" colorClass="bg-blue-50 text-blue-700 border-blue-200" />
            <Icon value={docs} label="Documents" emoji="📄" colorClass="bg-orange-50 text-orange-700 border-orange-200" />
            <Icon value={policy} label="Policies" emoji="⚖️" colorClass="bg-purple-50 text-purple-700 border-purple-200" />
        </div>
    );
};

const StaffManagement: React.FC<StaffManagementProps> = ({ 
    allUsers, enrollments, submissions, certificates, 
    complianceDocuments = [], roles = [], roleAssignments = [], overrides = [],
    onSaveOverride, currentUser,
    onAddUser, onAddUsers, onNotify, onAssignRole, onRemoveRole
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState<Department | 'All'>('All');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [selectedVolunteer, setSelectedVolunteer] = useState<{ user: User, readiness: VolunteerReadinessStatus } | null>(null);
    const { pt, persona } = usePersona();

    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = filterDept === 'All' || user.departments.includes(filterDept);
            return matchesSearch && matchesDept;
        });
    }, [allUsers, searchTerm, filterDept]);

    const getReadinessForUser = (userId: string) => {
        return computeReadiness(userId, ORGANIZATION.id, {
            enrollments, certificates, submissions, complianceDocuments, roles, assignments: roleAssignments, overrides: overrides
        });
    };

    const handleRowClick = (user: User) => {
        if (user.role === 'Learner') {
            const readiness = getReadinessForUser(user.user_id);
            setSelectedVolunteer({ user, readiness });
        }
    };

    return (
        <Card title={`${pt('learner')} Roster`}>
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <input
                    type="text"
                    placeholder={`Search ${pt('learners')}...`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex gap-2">
                    <button onClick={() => setIsBulkModalOpen(true)} className="flex-1 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] py-3 px-6 rounded-xl hover:bg-black shadow-sm flex items-center justify-center gap-2">
                        <span>📥</span> Bulk Upload
                    </button>
                    <button onClick={() => setIsAddUserModalOpen(true)} className="flex-1 bg-hh-red text-white font-black uppercase tracking-widest text-[10px] py-3 px-6 rounded-xl hover:bg-hh-red-dark shadow-sm">
                        + Add {pt('learner')}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Full Name</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Readiness Health</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Roles</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredUsers.map(user => {
                            const readiness = user.role === 'Learner' ? getReadinessForUser(user.user_id) : null;
                            const statusColor = readiness?.overall_status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

                            return (
                                <tr key={user.user_id} onClick={() => handleRowClick(user)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <img src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.user_id}`} className="w-8 h-8 rounded-full border shadow-sm group-hover:scale-110 transition-transform" alt="" />
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.employmentType}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border shadow-sm ${statusColor}`}>
                                            {readiness?.overall_status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {readiness ? <ReadinessSpine readiness={readiness} /> : <span className="text-slate-400 text-xs">-</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex -space-x-2">
                                            {readiness?.role_statuses.map(rs => (
                                                <div key={rs.role_id} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-black shadow-sm ${rs.status === 'Ready' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`} title={rs.role_title}>
                                                    {rs.role_title.charAt(0)}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isAddUserModalOpen && <AddUserModal onClose={() => setIsAddUserModalOpen(false)} onAddUser={onAddUser} />}
            {isBulkModalOpen && <BulkUploadModal onClose={() => setIsBulkModalOpen(false)} onImport={(u) => onAddUsers && onAddUsers(u)} />}
            
            {selectedVolunteer && (
                <VolunteerProfileModal 
                    user={selectedVolunteer.user}
                    readiness={selectedVolunteer.readiness}
                    programs={[]} 
                    documents={complianceDocuments}
                    roles={roles}
                    certificates={certificates}
                    overrides={overrides}
                    currentAdminId={currentUser.user_id}
                    onSaveOverride={onSaveOverride}
                    onClose={() => setSelectedVolunteer(null)}
                    onNotify={onNotify}
                    onAssignRole={onAssignRole}
                    onRemoveRole={onRemoveRole}
                />
            )}
        </Card>
    );
};

export default StaffManagement;
