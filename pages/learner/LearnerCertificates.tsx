
import React, { useMemo } from 'react';
import Card from '../../components/Card';
import { Certificate, Program } from '../../types';
import { USERS } from '../../data';

interface LearnerCertificatesProps {
    certificates: Certificate[];
    programs: Program[];
}

const LearnerCertificates: React.FC<LearnerCertificatesProps> = ({ certificates, programs }) => {
    const sortedCertificates = useMemo(() => {
        return [...certificates].sort((a, b) => {
            // Sort by status primarily (Revoked last, Active first)
            if (a.status === 'Revoked' && b.status !== 'Revoked') return 1;
            if (a.status !== 'Revoked' && b.status === 'Revoked') return -1;

            // Prioritize expiring soon (if active)
            const aExpires = a.expires_at || Number.MAX_VALUE;
            const bExpires = b.expires_at || Number.MAX_VALUE;
            
            // Sort by expiry date ascending (sooner first)
            return aExpires - bExpires;
        });
    }, [certificates]);

    const handlePrint = (cert: Certificate) => {
        const program = programs.find(p => p.program_id === cert.program_id);
        const user = USERS.find(u => u.user_id === cert.user_id);
        const learnerName = user ? user.name : 'Learner';
        
        const printWindow = window.open('', '', 'width=900,height=700');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Certificate - ${cert.name}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
                    body { font-family: 'Lato', sans-serif; text-align: center; background: #333; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .cert-container { background: white; padding: 10px; box-shadow: 0 0 30px rgba(0,0,0,0.5); width: 100%; max-width: 900px; }
                    .cert { padding: 40px; border: 20px solid #f3f4f6; position: relative; background: #fff; outline: 4px double #E41D2A; outline-offset: -10px; }
                    
                    /* Watermark */
                    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; width: 400px; z-index: 0; pointer-events: none; }
                    
                    .content { position: relative; z-index: 10; }
                    
                    .header-logo { margin-bottom: 20px; font-size: 24px; font-weight: bold; color: #E41D2A; letter-spacing: 2px; text-transform: uppercase; }
                    
                    h1 { font-family: 'Playfair Display', serif; font-size: 56px; color: #1f2937; margin: 0 0 10px 0; font-weight: 700; }
                    h2 { font-family: 'Lato', sans-serif; font-size: 18px; color: #E41D2A; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin: 0; }
                    
                    .presented { margin: 40px 0 10px; font-size: 16px; font-style: italic; color: #6b7280; font-family: 'Playfair Display', serif; }
                    
                    .name { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: #111827; border-bottom: 1px solid #d1d5db; display: inline-block; padding: 0 60px 10px; margin-bottom: 30px; min-width: 400px; }
                    
                    .reason { font-size: 16px; color: #4b5563; line-height: 1.5; max-width: 600px; margin: 0 auto 10px; }
                    .program { font-weight: 700; font-size: 28px; color: #1f2937; margin-bottom: 40px; }
                    
                    .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 14px; color: #6b7280; max-width: 600px; margin-left: auto; margin-right: auto; }
                    .sig-block { text-align: center; }
                    .sig-line { border-top: 1px solid #999; padding-top: 10px; width: 220px; margin-bottom: 5px; font-weight: 700; color: #111; }
                    .sig-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                    
                    .meta { margin-top: 40px; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
                    
                    @media print {
                        body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; height: auto; display: block; }
                        .cert-container { box-shadow: none; width: 100%; max-width: none; padding: 0; }
                        .cert { border: 10px solid #fff; outline: 2px solid #E41D2A; width: 100%; height: 100vh; box-sizing: border-box; }
                    }
                </style>
            </head>
            <body>
                <div class="cert-container">
                    <div class="cert">
                        <svg class="watermark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>
                        
                        <div class="content">
                            <div class="header-logo">Canopy Learn LMS</div>
                            
                            <h2>Certificate of Completion</h2>
                            <h1>Achievement Award</h1>
                            
                            <p class="presented">This certificate is proudly presented to</p>
                            <div class="name">${learnerName}</div>
                            
                            <p class="reason">For successfully completing all requirements and demonstrating proficiency in the course:</p>
                            <div class="program">${program?.title || cert.name}</div>
                            
                            <div class="footer">
                                <div class="sig-block">
                                    <div class="sig-line">${new Date(cert.issued_at).toLocaleDateString()}</div>
                                    <div class="sig-title">Date Issued</div>
                                </div>
                                <div class="sig-block">
                                    <div class="sig-line" style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 18px;">Canopy System</div>
                                    <div class="sig-title">Verified By</div>
                                </div>
                            </div>
                            
                            <div class="meta">
                                Certificate ID: ${cert.certificate_id} <br/>
                                ${cert.expires_at ? `Expires: ${new Date(cert.expires_at).toLocaleDateString()}` : 'No Expiration'}
                            </div>
                        </div>
                    </div>
                </div>
                <script>
                    window.onload = () => { setTimeout(() => window.print(), 800); };
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
                            <div key={cert.certificate_id} className={`flex flex-col p-5 bg-white dark:bg-slate-800 rounded-xl border ${
                                cert.status === 'Revoked' ? 'border-red-300 opacity-75' :
                                isExpiringSoon ? 'border-orange-300 ring-1 ring-orange-200' : 
                                'border-slate-200 dark:border-slate-700'
                            } shadow-sm relative overflow-hidden transition-shadow hover:shadow-md group`}>
                                
                                {cert.status === 'Revoked' && (
                                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                        <div className="bg-red-600 text-white px-4 py-1 font-bold transform -rotate-12 shadow-lg">REVOKED</div>
                                    </div>
                                )}

                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                                </div>
                                
                                <div className="mb-4">
                                     <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-1">{program?.title || cert.name}</h4>
                                     <p className="text-sm text-slate-500 dark:text-slate-400">Canopy Learn Certified</p>
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
                                            className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 z-20 relative"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Download
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
