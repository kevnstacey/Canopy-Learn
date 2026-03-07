
import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import BaseModal from '../../components/modals/BaseModal';
import { ActionLog, User, ActionType, TargetType } from '../../types';

interface AuditLogViewerProps {
    logs: ActionLog[];
    users: User[];
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs, users }) => {
    const [selectedLog, setSelectedLog] = useState<ActionLog | null>(null);
    const [search, setSearch] = useState('');
    const [filterAction, setFilterAction] = useState<string>('All');
    const [filterActor, setFilterActor] = useState<string>('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const actionTypes: ActionType[] = [
        'Requirement Completed', 'Quiz Passed', 'Quiz Failed', 'Document Uploaded',
        'Submission Approved', 'Submission Rejected', 'Certificate Issued',
        'Certificate Revoked', 'Policy Acknowledged', 'Override Applied',
        'Course Published', 'Role Assigned', 'Role Removed', 'Document Reviewed'
    ];

    const actors = useMemo(() => {
        const actorIds = new Set(logs.map(l => l.actor_user_id));
        return users.filter(u => actorIds.has(u.user_id));
    }, [logs, users]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = JSON.stringify(log).toLowerCase().includes(search.toLowerCase());
            const matchesAction = filterAction === 'All' || log.action_type === filterAction;
            const matchesActor = filterActor === 'All' || log.actor_user_id === filterActor;
            
            let matchesDate = true;
            if (startDate) {
                matchesDate = matchesDate && log.timestamp >= new Date(startDate).getTime();
            }
            if (endDate) {
                // End of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && log.timestamp <= end.getTime();
            }

            return matchesSearch && matchesAction && matchesActor && matchesDate;
        }).sort((a, b) => b.timestamp - a.timestamp);
    }, [logs, search, filterAction, filterActor, startDate, endDate]);

    const getUserName = (id: string) => users.find(u => u.user_id === id)?.name || id;

    const handleExportCSV = () => {
        const headers = ['Action ID', 'Timestamp', 'Actor', 'Action Type', 'Target Type', 'Target ID', 'Metadata'];
        const rows = filteredLogs.map(log => [
            log.action_id,
            new Date(log.timestamp).toISOString(),
            getUserName(log.actor_user_id),
            log.action_type,
            log.target_type,
            log.target_id,
            JSON.stringify(log.metadata || {}).replace(/"/g, '""') // Escape quotes
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card title="System Action Log">
            <div className="space-y-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <input 
                        type="text" 
                        placeholder="Search metadata..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        className="flex-grow p-2 border rounded text-sm dark:bg-slate-700 dark:border-slate-600"
                    />
                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)} 
                            className="p-2 border rounded text-sm dark:bg-slate-700 dark:border-slate-600"
                        />
                        <span className="self-center text-slate-400">-</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={e => setEndDate(e.target.value)} 
                            className="p-2 border rounded text-sm dark:bg-slate-700 dark:border-slate-600"
                        />
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                        <select 
                            value={filterAction} 
                            onChange={e => setFilterAction(e.target.value)}
                            className="p-2 border rounded text-sm bg-white dark:bg-slate-700 dark:border-slate-600"
                        >
                            <option value="All">All Actions</option>
                            {actionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select 
                            value={filterActor} 
                            onChange={e => setFilterActor(e.target.value)}
                            className="p-2 border rounded text-sm bg-white dark:bg-slate-700 dark:border-slate-600"
                        >
                            <option value="All">All Actors</option>
                            {actors.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleExportCSV}
                        disabled={filteredLogs.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 uppercase text-slate-500 font-semibold text-xs border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Actor</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Target Type</th>
                            <th className="px-4 py-3">Target ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                        {filteredLogs.slice(0, 100).map(log => (
                            <tr 
                                key={log.action_id} 
                                onClick={() => setSelectedLog(log)}
                                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-2 text-slate-500 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-100">
                                    {getUserName(log.actor_user_id)}
                                </td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                        log.action_type.includes('Approved') || log.action_type.includes('Passed') || log.action_type.includes('Issued') ? 'bg-green-50 text-green-700 border-green-200' :
                                        log.action_type.includes('Rejected') || log.action_type.includes('Failed') || log.action_type.includes('Revoked') ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}>
                                        {log.action_type}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{log.target_type}</td>
                                <td className="px-4 py-2 text-xs font-mono text-slate-400">{log.target_id}</td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                            <tr><td colSpan={5} className="p-4 text-center text-slate-500">No logs found matching criteria.</td></tr>
                        )}
                    </tbody>
                </table>
                {filteredLogs.length > 100 && (
                    <div className="p-2 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        Showing recent 100 records. Export to see all {filteredLogs.length}.
                    </div>
                )}
            </div>

            {selectedLog && (
                <BaseModal title="Log Details" onClose={() => setSelectedLog(null)}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-slate-500">Log ID</span>
                                <span className="font-mono">{selectedLog.action_id}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Timestamp</span>
                                <span>{new Date(selectedLog.timestamp).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Actor</span>
                                <span className="font-bold">{getUserName(selectedLog.actor_user_id)}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Action</span>
                                <span className="font-bold">{selectedLog.action_type}</span>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold mb-2 text-sm text-slate-500 uppercase">Metadata</h4>
                            <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                {JSON.stringify(selectedLog.metadata, null, 2)}
                            </pre>
                        </div>
                    </div>
                </BaseModal>
            )}
        </Card>
    );
};

export default AuditLogViewer;
