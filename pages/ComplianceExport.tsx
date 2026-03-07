
import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { User, Program, Enrollment, Certificate, Submission, AssessmentTemplate } from '../types';

interface ComplianceExportProps {
    users: User[];
    programs: Program[];
    enrollments: Enrollment[];
    certificates: Certificate[];
    submissions: Submission[];
    assessmentTemplates: AssessmentTemplate[];
}

interface ExportRow {
    learnerName: string;
    programTitle: string;
    readiness: string;
    certStatus: string;
    expiryDate: string;
    lastApprovalDate: string;
}

const ComplianceExport: React.FC<ComplianceExportProps> = ({ users, programs, enrollments, certificates, submissions, assessmentTemplates }) => {
    // --- FILTERS ---
    const [selectedProgramId, setSelectedProgramId] = useState<string>('All');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    
    const [includeReqs, setIncludeReqs] = useState(true);
    const [includeApprovals, setIncludeApprovals] = useState(true);
    const [includeCerts, setIncludeCerts] = useState(true);

    // --- LOGIC ---
    const exportData = useMemo(() => {
        const rows: ExportRow[] = [];
        const learners = users.filter(u => u.role === 'Learner');

        learners.forEach(learner => {
            // Filter programs based on selection
            const relevantPrograms = selectedProgramId === 'All' 
                ? programs 
                : programs.filter(p => p.program_id === selectedProgramId);

            relevantPrograms.forEach(prog => {
                // Determine if learner interacts with this program
                const enrollment = enrollments.find(e => e.user_id === learner.user_id && e.program_id === prog.program_id);
                const cert = certificates.find(c => c.user_id === learner.user_id && c.program_id === prog.program_id);
                
                // If not enrolled and no cert, skip unless they have submissions? 
                // Usually audit is for enrolled/certified.
                if (!enrollment && !cert) return;

                // Readiness
                let readiness = 'Not Started';
                if (enrollment) {
                    readiness = enrollment.status;
                }
                if (cert && cert.status === 'Active') {
                    readiness = 'Certified';
                }

                // Cert Status
                const certStatus = cert ? cert.status : 'None';
                const expiry = cert && cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : '-';

                // Last Approval Date
                // Priority: Cert Issued At -> Latest Approved Submission -> Enrollment Assigned (fallback)
                let lastApprovalTime = 0;
                if (cert) {
                    lastApprovalTime = cert.issued_at;
                } else {
                    const progTemplates = assessmentTemplates.filter(t => t.program_id === prog.program_id);
                    const progSubmissions = submissions.filter(s => 
                        s.user_id === learner.user_id && 
                        s.status === 'Approved' && 
                        progTemplates.some(t => t.assessment_template_id === s.assessment_template_id)
                    );
                    if (progSubmissions.length > 0) {
                        // Max submitted_at
                        lastApprovalTime = Math.max(...progSubmissions.map(s => s.submitted_at));
                    }
                }

                // Date Range Filter logic (applied to Last Activity)
                if (startDate || endDate) {
                    if (lastApprovalTime === 0) return; // No date to filter against, exclude? Or keep if just enrolled? Assuming filter applies to activity.
                    const activityDate = new Date(lastApprovalTime);
                    if (startDate && activityDate < new Date(startDate)) return;
                    if (endDate && activityDate > new Date(endDate)) return;
                }

                const lastApprovalDateStr = lastApprovalTime > 0 ? new Date(lastApprovalTime).toLocaleDateString() : '-';

                rows.push({
                    learnerName: learner.name,
                    programTitle: prog.title,
                    readiness,
                    certStatus,
                    expiryDate: expiry,
                    lastApprovalDate: lastApprovalDateStr
                });
            });
        });

        return rows;
    }, [users, programs, enrollments, certificates, submissions, assessmentTemplates, selectedProgramId, startDate, endDate]);

    const handleDownloadCSV = () => {
        const header = ["Learner Name", "Program", "Readiness", "Certificate Status", "Expiry Date", "Last Approval Date"];
        const csvRows = [header.join(',')];
        
        exportData.forEach(row => {
            const values = [
                `"${row.learnerName}"`,
                `"${row.programTitle}"`,
                `"${row.readiness}"`,
                `"${row.certStatus}"`,
                `"${row.expiryDate}"`,
                `"${row.lastApprovalDate}"`
            ];
            csvRows.push(values.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `compliance_audit_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card title="Audit Export">
             {/* Options */}
             <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-200">Export Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Program</label>
                        <select 
                            value={selectedProgramId} 
                            onChange={e => setSelectedProgramId(e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                        >
                            <option value="All">All Programs</option>
                            {programs.map(p => (
                                <option key={p.program_id} value={p.program_id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Date Range (Last Activity)</label>
                        <div className="flex gap-2">
                             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-xs" />
                             <span className="self-center text-slate-400">-</span>
                             <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-xs" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Include Details</label>
                        <div className="flex flex-col gap-2">
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" checked={includeReqs} onChange={e => setIncludeReqs(e.target.checked)} className="rounded text-hh-red focus:ring-hh-red" />
                                 <span className="text-sm">Requirements Met</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" checked={includeApprovals} onChange={e => setIncludeApprovals(e.target.checked)} className="rounded text-hh-red focus:ring-hh-red" />
                                 <span className="text-sm">Approval History</span>
                             </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" checked={includeCerts} onChange={e => setIncludeCerts(e.target.checked)} className="rounded text-hh-red focus:ring-hh-red" />
                                 <span className="text-sm">Certificates</span>
                             </label>
                        </div>
                    </div>
                </div>
             </div>

             {/* Preview */}
             <div className="mb-4 flex justify-between items-center">
                 <h3 className="font-semibold text-slate-800 dark:text-slate-200">Preview ({exportData.length} records)</h3>
             </div>
             
             <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg mb-6">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Learner Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Program</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Readiness</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Cert Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Expiry</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Last Approval</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                        {exportData.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No records found matching filters.</td></tr>
                        ) : (
                            exportData.slice(0, 50).map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-2 font-medium">{row.learnerName}</td>
                                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.programTitle}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                            row.readiness === 'Certified' || row.readiness === 'Completed' ? 'bg-green-100 text-green-800' :
                                            row.readiness === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>{row.readiness}</span>
                                    </td>
                                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.certStatus}</td>
                                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.expiryDate}</td>
                                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.lastApprovalDate}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {exportData.length > 50 && <div className="p-2 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">Showing first 50 rows only. Export to see full data.</div>}
             </div>

             {/* Actions */}
             <div className="flex justify-end gap-4">
                 <button onClick={() => alert("PDF Export coming soon.")} className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium">
                     Export PDF
                 </button>
                 <button onClick={handleDownloadCSV} disabled={exportData.length === 0} className="px-6 py-2 bg-hh-red text-white rounded-lg hover:bg-hh-red-dark font-medium shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed">
                     Download CSV
                 </button>
             </div>
        </Card>
    );
};

export default ComplianceExport;
