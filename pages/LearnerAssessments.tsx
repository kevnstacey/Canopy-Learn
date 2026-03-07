
import React, { useState, useMemo, useRef } from 'react';
import Card from '../components/Card';
import BaseModal from '../components/modals/BaseModal';
import EvidenceCaptureModal from '../components/modals/EvidenceCaptureModal';
import { Submission, User, AssessmentTemplate, Program, Requirement } from '../types';

interface LearnerAssessmentsProps {
    submissions: Submission[];
    user: User;
    programs: Program[];
    requirements: Requirement[];
    assessmentTemplates: AssessmentTemplate[];
    onUpload: (templateId: string, file: File) => void;
    onCaptureEvidence?: (templateId: string, base64: string) => void;
}

type FilterType = 'All' | 'Not Started' | 'Pending Review' | 'Approved' | 'Rejected';

interface AssessmentItem {
    id: string; 
    type: 'Submission' | 'Requirement';
    templateTitle: string;
    programTitle: string;
    submittedAt?: number;
    status: string;
    notes?: string;
    templateId: string;
    submission?: Submission;
    requirement?: Requirement;
}

const LearnerAssessments: React.FC<LearnerAssessmentsProps> = ({ 
    submissions, user, programs, requirements, assessmentTemplates, onUpload, onCaptureEvidence 
}) => {
    const [filter, setFilter] = useState<FilterType>('All');
    const [selectedItem, setSelectedItem] = useState<AssessmentItem | null>(null);
    const [capturingForTemplateId, setCapturingForTemplateId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTemplateId, setUploadTemplateId] = useState<string | null>(null);

    const items = useMemo(() => {
        const list: AssessmentItem[] = [];
        const userSubmissions = submissions.filter(s => s.user_id === user.user_id);
        const practicalReqs = requirements.filter(r => r.type === 'practical_submit');

        userSubmissions.forEach(sub => {
            const template = assessmentTemplates.find(t => t.assessment_template_id === sub.assessment_template_id);
            const req = practicalReqs.find(r => r.reference_id === sub.assessment_template_id);
            const prog = programs.find(p => p.program_id === req?.program_id || template?.program_id);

            list.push({
                id: sub.submission_id,
                type: 'Submission',
                templateTitle: template?.title || 'Practical Verification',
                programTitle: prog?.title || 'Training Path',
                submittedAt: sub.submitted_at,
                status: sub.status,
                notes: sub.reviewer_notes,
                templateId: sub.assessment_template_id,
                submission: sub,
                requirement: req
            });
        });

        practicalReqs.forEach(req => {
            const hasSubmission = userSubmissions.some(s => s.assessment_template_id === req.reference_id);
            if (!hasSubmission) {
                const template = assessmentTemplates.find(t => t.assessment_template_id === req.reference_id);
                const prog = programs.find(p => p.program_id === req.program_id);
                list.push({
                    id: req.requirement_id,
                    type: 'Requirement',
                    templateTitle: template?.title || 'Verification Step',
                    programTitle: prog?.title || 'Training Path',
                    status: 'Not Started',
                    templateId: req.reference_id,
                    requirement: req
                });
            }
        });

        return list.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    }, [submissions, user, requirements, assessmentTemplates, programs]);

    const filteredItems = useMemo(() => {
        if (filter === 'All') return items;
        return items.filter(i => i.status === filter);
    }, [items, filter]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && uploadTemplateId) {
            onUpload(uploadTemplateId, file);
            setUploadTemplateId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    return (
        <div className="space-y-6">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="video/*,image/*,application/pdf" />
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {(['All', 'Not Started', 'Pending Review', 'Approved', 'Rejected'] as FilterType[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                            filter === f 
                            ? 'bg-slate-900 text-white shadow-lg' 
                            : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid gap-4">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm border ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                                <h4 className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">{item.templateTitle}</h4>
                            </div>
                            <p className="text-sm font-bold text-slate-500">{item.programTitle}</p>
                            {item.notes && (
                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 text-sm text-red-700 dark:text-red-400 font-medium">
                                    <span className="font-black uppercase text-[10px] block mb-1">Assessor Feedback</span>
                                    {item.notes}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                            {item.status === 'Not Started' || item.status === 'Rejected' ? (
                                <>
                                    <button 
                                        onClick={() => setCapturingForTemplateId(item.templateId)}
                                        className="bg-hh-red text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-hh-red-dark shadow-lg transition-transform active:scale-95"
                                    >
                                        🎥 Capture Now
                                    </button>
                                    <button 
                                        onClick={() => { setUploadTemplateId(item.templateId); fileInputRef.current?.click(); }}
                                        className="bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-slate-50"
                                    >
                                        Upload File
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => setSelectedItem(item)}
                                    className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-slate-200"
                                >
                                    View Details
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedItem && (
                <BaseModal title={selectedItem.templateTitle} onClose={() => setSelectedItem(null)}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Program</p>
                                <p className="font-bold text-slate-800 dark:text-white">{selectedItem.programTitle}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${getStatusColor(selectedItem.status)}`}>
                                    {selectedItem.status}
                                </span>
                            </div>
                        </div>
                        {selectedItem.notes && (
                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner">
                                <h5 className="text-[10px] font-black uppercase text-slate-400 mb-3">Official Record Note</h5>
                                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">"{selectedItem.notes}"</p>
                            </div>
                        )}
                    </div>
                </BaseModal>
            )}

            {capturingForTemplateId && (
                <EvidenceCaptureModal 
                    title="Capture Competency Evidence"
                    onClose={() => setCapturingForTemplateId(null)}
                    onCapture={(base64) => {
                        if (onCaptureEvidence) onCaptureEvidence(capturingForTemplateId, base64);
                        setCapturingForTemplateId(null);
                    }}
                />
            )}
        </div>
    );
};

export default LearnerAssessments;
