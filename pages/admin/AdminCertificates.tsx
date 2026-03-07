
import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { Certificate, User, Program } from '../../types';

interface AdminCertificatesProps {
    certificates: Certificate[];
    users: User[];
    programs: Program[];
    onRevokeCertificate: (certId: string) => void;
}

const AdminCertificates: React.FC<AdminCertificatesProps> = ({ certificates, users, programs, onRevokeCertificate }) => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Revoked' | 'Expired'>('All');

    const filteredCertificates = useMemo(() => {
        return certificates.filter(cert => {
            const user = users.find(u => u.user_id === cert.user_id);
            const userName = user?.name.toLowerCase() || '';
            const certName = cert.name.toLowerCase();
            
            const matchesSearch = userName.includes(search.toLowerCase()) || certName.includes(search.toLowerCase());
            const matchesStatus = filterStatus === 'All' || cert.status === filterStatus;

            return matchesSearch && matchesStatus;
        }).sort((a, b) => b.issued_at - a.issued_at);
    }, [certificates, users, search, filterStatus]);

    return (
        <Card title="Certificate Registry">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Search by name or certificate..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-hh-red w-full md:w-auto"
                />
                <div className="flex gap-2 w-full md:w-auto">
                    {(['All', 'Active', 'Revoked', 'Expired'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                                filterStatus === s 
                                ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900' 
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 uppercase text-slate-500 font-semibold text-xs border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3">Learner</th>
                            <th className="px-6 py-3">Certificate / Program</th>
                            <th className="px-6 py-3">Issued</th>
                            <th className="px-6 py-3">Expires</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                        {filteredCertificates.map(cert => {
                            const user = users.find(u => u.user_id === cert.user_id);
                            const program = programs.find(p => p.program_id === cert.program_id);
                            const isExpiring = cert.expires_at && (cert.expires_at - Date.now() < 30 * 24 * 60 * 60 * 1000) && cert.expires_at > Date.now();

                            return (
                                <tr key={cert.certificate_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{user?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{cert.name}</div>
                                        <div className="text-xs text-slate-500">{program?.title}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(cert.issued_at).toLocaleDateString()}</td>
                                    <td className={`px-6 py-4 ${isExpiring ? 'text-orange-600 font-bold' : 'text-slate-500'}`}>
                                        {cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            cert.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            cert.status === 'Revoked' ? 'bg-red-100 text-red-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                            {cert.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {cert.status === 'Active' && (
                                            <button 
                                                onClick={() => onRevokeCertificate(cert.certificate_id)}
                                                className="text-red-600 hover:text-red-800 font-semibold text-xs border border-red-200 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                        {cert.status === 'Revoked' && <span className="text-slate-400 text-xs italic">Revoked</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            {filteredCertificates.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No certificates found.
                </div>
            )}
        </Card>
    );
};

export default AdminCertificates;
