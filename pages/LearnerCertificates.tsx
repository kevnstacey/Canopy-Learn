
import React, { useMemo } from 'react';
import Card from '../components/Card';
import { Certificate, Program, User } from '../types';
import { USERS } from '../data';

interface LearnerCertificatesProps {
    certificates: Certificate[];
    programs: Program[];
}

const LearnerCertificates: React.FC<LearnerCertificatesProps> = ({ certificates, programs }) => {
    const sortedCertificates = useMemo(() => {
        return [...certificates].sort((a, b) => {
            // Prioritize expiring soon (if active)
            const aExpires = a.expires_at || Number.MAX_VALUE;
            const bExpires = b.expires_at || Number.MAX_VALUE;
            
            // Sort by expiry date ascending (sooner first)
            return aExpires - bExpires;
        });
    }, [certificates]);

    const handlePrint = (cert: Certificate) => {
        const program = programs.find(p => p.program_id === cert.program_id);
        const user = USERS.find(u => u.user_id === cert.user_id) || { name: 'Learner' } as User;
        
        const printWindow = window.open('', '', 'width=900,height=700');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Certificate - ${cert.name}</title>
                <style>
                    body { font-family: 'Georgia', serif; text-align: center; background: #f9fafb; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .cert { width: 800px; padding: 40px; border: 10px solid #ddd; background: #fff; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
                    .border-inner { border: 2px solid #E41D2A; padding: 40px; height: 100%; box-sizing: border-box; }
                    h1 { font-size: 48px; color: #E41D2A; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
                    h2 { font-size: 20px; color: #555; font-weight: normal; margin-top: 0; }
                    .presented { margin: 40px 0 10px; font-size: 18px; font-style: italic; color: #777; }
                    .name { font-size: 42px; font-weight: bold; border-bottom: 2px solid #333; display: inline-block; padding: 0 40px 10px; margin-bottom: 30px; }
                    .reason { font-size: 18px; color: #555; line-height: 1.5; }
                    .program { font-weight: bold; font-size: 22px; color: #333; }
                    .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 14px; color: #777; }
                    .sig-line { border-top: 1px solid #999; padding-top: 10px; width: 200px; }
                    @media print {
                        body { background: white; -webkit-print-color-adjust: exact; }
                        .cert { box-shadow: none; border: 5px solid #ccc; width: 100%; height: 100%; }
                    }
                </style>
            </head>
            <body>
                <div class="cert">
                    <div class="border-inner">
                        <h1>Certificate</h1>
                        <h2>OF COMPLETION</h2>
                        
                        <p class="presented">This is to certify that</p>
                        <div class="name">${user.name}</div>
                        
                        <p class="reason">Has successfully completed the training requirements for:</p>
                        <div class="program">${program?.title || cert.name}</div>
                        
                        <div class="footer">
                            <div>
                                <div class="sig-line">${new Date(cert.issued_at).toLocaleDateString()}</div>
                                Date Issued
                            </div>
                            <div>
                                <div class="sig-line">Canopy Learn LMS</div>
                                Authorized Signature
                            </div>
                        </div>
                        
                        <div style="margin-top: 40px; font-size: 10px; color: #ccc;">Certificate ID: ${cert.certificate_id}</div>
                    </div>
                </div>
                <script>
                    window.onload = () => { setTimeout(() => window.print(), 500); };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Card title="My Certificates">
            {sortedCertificates.length === 0 ? (
                 <div className="text-center py-8">
                    <div className="inline-block p-4 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No certificates yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        Complete all requirements in a training program to earn your certificate. Once approved, it will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCertificates.map(cert => {
                         const program = programs.find(p => p.program_id === cert.program_id);
                         const isExpiringSoon = cert.expires_at && (cert.expires_at - Date.now() < 30 * 24 * 60 * 60 * 1000) && cert.status === 'Active';
                         
                         return (
                            <div key={cert.certificate_id} className={`flex flex-col p-5 bg-white dark:bg-slate-800 rounded-xl border ${isExpiringSoon ? 'border-orange-300 ring-1 ring-orange-200' : 'border-slate-200 dark:border-slate-700'} shadow-sm relative overflow-hidden transition-shadow hover:shadow-md`}>
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                                </div>
                                
                                <div className="mb-4">
                                     <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{cert.name}</h4>
                                     <p className="text-sm text-slate-500 dark:text-slate-400">{program?.title || 'Unknown Program'}</p>
                                </div>

                                <div className="mt-auto space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Issued</span>
                                        <span className="font-medium">{new Date(cert.issued_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Expires</span>
                                        <span className={`font-medium ${isExpiringSoon ? 'text-orange-600 font-bold' : ''}`}>
                                            {cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : 'Never'}
                                        </span>
                                    </div>
                                    <div className="pt-2 flex justify-between items-center">
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide ${
                                            cert.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                            cert.status === 'Expired' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                            {cert.status}
                                        </span>
                                        <button 
                                            onClick={() => handlePrint(cert)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Print
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

export default LearnerCertificates;
