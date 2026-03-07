
import React, { useState } from 'react';
import Card from '../components/Card';

interface AuditEntry {
    id: string;
    timestamp: number;
    user: string;
    role: string;
    action: string;
    target: string;
    ip: string;
}

const MOCK_LOGS: AuditEntry[] = [
    { id: 'log-1', timestamp: Date.now() - 1000 * 60 * 5, user: 'Training Manager', role: 'Admin', action: 'Approved Submission', target: 'Alice Johnson (Hand Washing)', ip: '192.168.1.42' },
    { id: 'log-2', timestamp: Date.now() - 1000 * 60 * 60 * 2, user: 'Alice Johnson', role: 'Learner', action: 'Uploaded Document', target: 'Background Check', ip: '10.0.0.5' },
    { id: 'log-3', timestamp: Date.now() - 1000 * 60 * 60 * 24, user: 'Training Manager', role: 'Admin', action: 'Created Program', target: 'Customer Service 101', ip: '192.168.1.42' },
    { id: 'log-4', timestamp: Date.now() - 1000 * 60 * 60 * 25, user: 'System', role: 'System', action: 'Auto-assigned', target: 'Bob Smith (Food Safe)', ip: '127.0.0.1' },
    { id: 'log-5', timestamp: Date.now() - 1000 * 60 * 60 * 48, user: 'Compliance Officer', role: 'Compliance', action: 'Exported Report', target: 'Audit_Q1.csv', ip: '172.16.0.23' },
];

const AuditLogs: React.FC = () => {
    const [filter, setFilter] = useState('');

    const filteredLogs = MOCK_LOGS.filter(log => 
        log.user.toLowerCase().includes(filter.toLowerCase()) || 
        log.action.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <Card title="Security Audit Logs">
            <div className="flex justify-between items-center mb-4">
                <input 
                    type="text" 
                    placeholder="Search logs..." 
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-sm"
                />
                <button 
                    onClick={() => alert("Simulating CSV export of 500 records...")}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Export All Logs
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-500 uppercase font-semibold text-xs">
                        <tr>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Target</th>
                            <th className="px-4 py-3">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-2 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-2 font-medium">{log.user}</td>
                                <td className="px-4 py-2 text-xs text-slate-400">{log.role}</td>
                                <td className="px-4 py-2">
                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-600">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{log.target}</td>
                                <td className="px-4 py-2 text-xs font-mono text-slate-400">{log.ip}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default AuditLogs;
