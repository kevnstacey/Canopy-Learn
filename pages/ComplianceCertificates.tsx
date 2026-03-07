
import React from 'react';
import Card from '../components/Card';
import { CERTIFICATES, USERS } from '../data';

const ComplianceCertificates: React.FC = () => {
    return (
        <Card title="Certificates & Expiry">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Certificate Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issued To</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issued Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expires</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-slate-200 dark:divide-slate-700">
                        {CERTIFICATES.map(cert => {
                            const user = USERS.find(u => u.user_id === cert.user_id);
                            return (
                                <tr key={cert.certificate_id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{cert.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(cert.issued_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : 'Never'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            cert.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            cert.status === 'Expired' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {cert.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {CERTIFICATES.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-500">No certificates found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default ComplianceCertificates;
