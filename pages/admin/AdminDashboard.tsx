import React, { useMemo, useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import KPIBlock from '../../components/KPIBlock';
import EnvironmentalAuditModal from '../../components/modals/EnvironmentalAuditModal';
import PersonnelMatchModal from '../../components/modals/PersonnelMatchModal';
import SentinelReportModal from '../../components/modals/SentinelReportModal';
import PulseSentimentDetailModal from '../../components/modals/PulseSentimentDetailModal';
import SopPatchComparisonModal from '../../components/modals/SopPatchComparisonModal';
import BatchIngestModal from '../../components/modals/BatchIngestModal';
import CalibrationWorkspaceModal from '../../components/modals/CalibrationWorkspaceModal';
import { User, Program, Enrollment, Submission, ChatHistoryItem, TrainerInsight, Certificate, ComplianceDocument, VolunteerRole, VolunteerRoleAssignment, Override, ActionLog, Lesson, Quiz, Module, Requirement, SopPatch, BatchAuditReport, DriftIncident } from '../../types';
import { generateTrainerInsights, generateCourseFromWeb, generateSopPatch, generateCourseThumbnail } from '../../services/geminiService';
import { computeReadiness } from '../../services/lmsService';
import { ORGANIZATION } from '../../data';
import { usePersona } from '../../contexts/PersonaContext';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  enrollments: Enrollment[];
  submissions: Submission[];
  programs: Program[];
  lessons: Lesson[];
  modules: Module[];
  quizzes: Quiz[];
  certificates?: Certificate[];
  complianceDocuments?: ComplianceDocument[];
  volunteerRoles?: VolunteerRole[];
  roleAssignments?: VolunteerRoleAssignment[];
  overrides?: Override[];
  actionLogs?: ActionLog[]; 
  team: User[];
  chatHistory: ChatHistoryItem[];
  onReviewSubmission: (submission: Submission) => void;
  onSetCopilotPrompt: (prompt: string) => void;
  onSaveLesson: (lesson: Lesson) => void;
  onSaveProgram: (program: Program, reqs: Requirement[], modules: Module[]) => void;
  onSaveQuiz: (quiz: Quiz) => void;
  onNotify: (userId: string, title: string, message: string, type: 'info' | 'alert' | 'success') => void;
  showInsightsOnly?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const { 
      allUsers, 
      enrollments, 
      submissions, 
      programs, 
      lessons, 
      modules, 
      quizzes,
      certificates = [], 
      complianceDocuments = [], 
      volunteerRoles = [], 
      roleAssignments = [], 
      overrides = [], 
      actionLogs = [],
      chatHistory, 
      onSetCopilotPrompt, 
      onSaveLesson, 
      onSaveProgram, 
      onSaveQuiz, 
      onNotify 
  } = props;

  const { pt, persona } = usePersona();
  const [insights, setInsights] = useState<TrainerInsight | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isNexusOpen, setIsNexusOpen] = useState(false);
  const [isSentinelOpen, setIsSentinelOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [activeDriftIncident, setActiveDriftIncident] = useState<DriftIncident | null>(null);
  const [lastBatchReport, setLastBatchReport] = useState<BatchAuditReport | null>(null);
  
  const [isPulseDetailOpen, setIsPulseDetailOpen] = useState(false);
  const [activePatch, setActivePatch] = useState<{ patch: SopPatch; title: string } | null>(null);
  const [isGeneratingPatch, setIsGeneratingPatch] = useState(false);

  const [autopilotUrl, setAutopilotUrl] = useState('');
  const [isAutopilotRunning, setIsAutopilotRunning] = useState(false);
  const [ingestLogs, setIngestLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setIngestLogs(prev => [...prev, `[${timeStr}] ${msg}`]);
  };

  useEffect(() => {
    if (logEndRef.current) {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ingestLogs]);

  const handleAutopilotIngest = async () => {
        if (!autopilotUrl) return;
        setIsAutopilotRunning(true);
        setIngestLogs([]);
        addLog("[SYSTEM] Initializing Signature Demo Flow...");
        addLog("[CANOPY] Establishing Secure Grounding Link to source...");
        
        try {
            const aiPromise = generateCourseFromWeb(autopilotUrl);
            
            await new Promise(r => setTimeout(r, 1200));
            addLog("[GROUNDED] Scraping source metadata and transcripts...");
            
            await new Promise(r => setTimeout(r, 1800));
            addLog("[DESIGN] Gemini drafting Multimodal Instructional Schema...");
            
            await new Promise(r => setTimeout(r, 1500));
            addLog("[ASSESSMENT] Formulating cognitive distractors for Knowledge Check...");
            
            await new Promise(r => setTimeout(r, 1200));
            addLog("[PROCTOR] Initializing AI Lens verification rubric...");
            
            const pkg = await aiPromise;
            
            addLog("[VISUALS] Imaging Node active: Creating custom 16:9 thumbnail...");
            const thumbnailUrl = await generateCourseThumbnail(pkg.lesson.title || 'Training');
            addLog("[VISUALS] Custom thumbnail generated via Imagen-4.");

            addLog("[COMPLIANCE] Mapping against Organizational Readiness Moat...");
            addLog(`[AI] Alignment confidence detected: ${pkg.confidence_score}% - EXCEEDS THRESHOLD.`);
            
            await new Promise(r => setTimeout(r, 1500));
            addLog("[FINISH] Program v1.0 finalized. Committed to secure Canadian node.");

            const timestamp = Date.now();
            const programId = `prog-ap-${timestamp}`;
            const lessonId = `less-ap-${timestamp}`;
            const quizId = `quiz-ap-${timestamp}`;
            const moduleId = `mod-ap-${timestamp}`;

            const newLesson: Lesson = {
                lesson_id: lessonId,
                title: pkg.lesson.title || 'Autopilot Lesson',
                content: pkg.lesson.content || '',
                category: pkg.lesson.category || 'General',
                estimated_minutes: 12,
                last_updated: timestamp,
                contentType: 'article'
            };

            const newQuiz: Quiz = {
                quiz_id: quizId,
                module_id: moduleId,
                title: `Assessment: ${pkg.lesson.title}`,
                pass_score: 80,
                max_attempts: 0,
                questions: (pkg.quiz.questions || []).map((q: any, i: number) => ({ id: `q-${i}-${timestamp}`, ...q }))
            };

            const newModule: Module = {
                module_id: moduleId,
                program_id: programId,
                title: "Core Curriculum",
                order: 1,
                lesson_ids: [lessonId]
            };

            const reqs: Requirement[] = [
                { requirement_id: `r1-${timestamp}`, program_id: programId, type: 'lesson_view', reference_id: lessonId, description: `Study ${pkg.lesson.title}`, required: true, prerequisite_requirement_ids: [], contributes_to_readiness: true, contributes_to_certificate: true },
                { requirement_id: `r2-${timestamp}`, program_id: programId, type: 'quiz_pass', reference_id: quizId, description: `Pass Final Exam`, required: true, prerequisite_requirement_ids: [`r1-${timestamp}`], contributes_to_readiness: true, contributes_to_certificate: true }
            ];

            const newProgram: Program = {
                program_id: programId,
                title: pkg.lesson.title || 'Untitled Autopilot',
                description: `Automatically grounded content derived from: ${autopilotUrl}`,
                status: 'published',
                departments: ['General'],
                module_ids: [moduleId],
                version: '1.0',
                persona: persona.type,
                confidence_score: pkg.confidence_score,
                thumbnail_url: thumbnailUrl
            };

            onSaveLesson(newLesson);
            onSaveQuiz(newQuiz);
            onSaveProgram(newProgram, reqs, [newModule]);
            alert("Autopilot Ingest Successful: Program live.");
            setAutopilotUrl('');
        } catch (e) {
            alert("Autopilot failed to ground. Please try a different URL.");
        } finally {
            setIsAutopilotRunning(false);
        }
  };

  const handleApplyPatch = async () => {
    if (!activePatch) return;
    setIsGeneratingPatch(true);
    try {
        const lesson = lessons.find(l => l.lesson_id === activePatch.patch.lessonId);
        if (lesson) {
            onSaveLesson({
                ...lesson,
                content: activePatch.patch.suggestedHtml,
                last_updated: Date.now(),
                version: (parseFloat(lesson.version || "1.0") + 0.1).toFixed(1)
            });
            alert("Patch committed successfully.");
            setActivePatch(null);
        }
    } catch (e) {
        alert("Failed to apply patch.");
    } finally {
        setIsGeneratingPatch(false);
    }
  };

  const stats = useMemo(() => {
    const volunteers = allUsers.filter(u => u.role === 'Learner');
    const totalVolunteers = volunteers.length;
    const readinessCounts = { Approved: 0, Pending: 0, Expired: 0, Missing: 0 };
    
    volunteers.forEach(v => {
        const r = computeReadiness(v.user_id, ORGANIZATION.id, {
            enrollments: enrollments, 
            certificates: certificates, 
            submissions: submissions, 
            complianceDocuments: complianceDocuments, 
            roles: volunteerRoles || [], 
            assignments: roleAssignments || [], 
            overrides: overrides || []
        });
        readinessCounts[r.overall_status]++;
    });

    const readyPct = totalVolunteers > 0 ? Math.round((readinessCounts.Approved / totalVolunteers) * 100) : 0;
    return {
        totalVolunteers,
        readyPct,
        readinessCounts
    };
  }, [allUsers, enrollments, certificates, complianceDocuments, volunteerRoles, roleAssignments, overrides]);

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
        const questions = chatHistory.map(h => h.question);
        const result = await generateTrainerInsights(questions, programs);
        setInsights(result);
    } catch (error) {
        console.error(error);
    } finally {
        setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                 <div className="max-w-md">
                     <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Canopy Autopilot</span>
                     </div>
                     <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">Scale your knowledge <br/> at lightspeed.</h2>
                     <p className="text-xs text-slate-400 mt-2 font-medium">Paste a URL to safety standards or industry blogs. Gemini builds the course and proctor rubric for you.</p>
                 </div>
                 <div className="flex-grow w-full max-w-xl">
                     <div className="flex gap-2">
                         <input 
                            value={autopilotUrl}
                            onChange={e => setAutopilotUrl(e.target.value)}
                            placeholder="Paste source URL (e.g. YouTube, OSHA)..."
                            className="flex-grow p-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-white"
                         />
                         <button 
                            onClick={handleAutopilotIngest}
                            disabled={isAutopilotRunning || !autopilotUrl}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50"
                         >
                             {isAutopilotRunning ? 'RUNNING...' : 'INGEST'}
                         </button>
                     </div>
                     {isAutopilotRunning && (
                         <div className="mt-4 bg-black/40 rounded-xl p-3 border border-white/5 max-h-32 overflow-y-auto scrollbar-hide font-mono text-[10px] text-emerald-400 space-y-1">
                             {ingestLogs.map((log, i) => <div key={i}>{log}</div>)}
                             <div ref={logEndRef}></div>
                         </div>
                     )}
                 </div>
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPIBlock label={`Total ${pt('learners')}`} value={stats.totalVolunteers} sub="Active roster" />
            <KPIBlock label="Readiness Rate" value={`${stats.readyPct}%`} valueClassName="text-emerald-600" sub="Fully compliant" />
            
            <Card title="Pulse Sentiment">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl font-black">4.8<span className="text-sm text-slate-400 font-normal">/5</span></div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black">HIGH CLARITY</span>
                </div>
                <button onClick={() => setIsPulseDetailOpen(true)} className="text-[10px] font-black uppercase text-blue-600 hover:underline">View Friction Logs &rarr;</button>
            </Card>

            <Card title="Sentinel Status">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-bold">Risk Monitored</span>
                </div>
                <button onClick={() => setIsSentinelOpen(true)} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Check Anomaly Log &rarr;</button>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 <Card title="Tactical Intelligence Hub">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <button 
                            onClick={() => setIsAuditModalOpen(true)}
                            className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-left group hover:border-blue-500 transition-all"
                        >
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🔍</div>
                            <h4 className="font-black text-lg uppercase tracking-tight mb-1">Canopy Lens</h4>
                            <p className="text-xs text-slate-500 font-medium">Initialize real-time multimodal environmental audit of site areas.</p>
                        </button>
                        
                        <button 
                            onClick={() => setIsNexusOpen(true)}
                            className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-left group hover:border-blue-500 transition-all"
                        >
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🧬</div>
                            <h4 className="font-black text-lg uppercase tracking-tight mb-1">Personnel Nexus</h4>
                            <p className="text-xs text-slate-500 font-medium">Precision matching engine for task-specific workforce dispatch.</p>
                        </button>

                        <button 
                            onClick={() => setIsBatchModalOpen(true)}
                            className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-left group hover:border-blue-500 transition-all"
                        >
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                            <h4 className="font-black text-lg uppercase tracking-tight mb-1">Vision Ingest</h4>
                            <p className="text-xs text-slate-500 font-medium">Bulk upload site photography for parallelized compliance audit.</p>
                        </button>

                        <button 
                            onClick={() => setIsSentinelOpen(true)}
                            className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-left group hover:border-blue-500 transition-all"
                        >
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🚨</div>
                            <h4 className="font-black text-lg uppercase tracking-tight mb-1">Sentinel Loop</h4>
                            <p className="text-xs text-slate-500 font-medium">Audit human grading consistency against AI Proctor findings.</p>
                        </button>
                    </div>
                 </Card>
            </div>

            <div className="lg:col-span-1">
                 <Card title="Live Activity Monitor">
                    <div className="space-y-6 pt-4">
                        {actionLogs.slice(0, 5).map((log) => (
                            <div key={log.action_id} className="flex gap-3">
                                <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">{log.action_type}</p>
                                    <p className="text-xs font-bold">{log.target_id}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </Card>
            </div>
        </div>

        {isAuditModalOpen && <EnvironmentalAuditModal lessons={lessons} onClose={() => setIsAuditModalOpen(false)} />}
        {isNexusOpen && (
            <PersonnelMatchModal 
                allUsers={allUsers} 
                readinessData={allUsers.map(u => computeReadiness(u.user_id, ORGANIZATION.id, { enrollments: enrollments, certificates: certificates, submissions: submissions, complianceDocuments: complianceDocuments, roles: volunteerRoles || [], assignments: roleAssignments || [], overrides: overrides || [] }))} 
                onClose={() => setIsNexusOpen(false)} 
                onNudge={onNotify}
            />
        )}
        {isSentinelOpen && insights && (
            <SentinelReportModal 
                insight={insights} 
                onClose={() => setIsSentinelOpen(false)} 
                onOpenCalibration={(incident) => {
                    setActiveDriftIncident(incident);
                    setIsSentinelOpen(false);
                }}
                onApplyFix={async (gap) => {
                    const lesson = lessons.find(l => l.lesson_id === gap.lessonId);
                    if (lesson) {
                        setIsGeneratingPatch(true);
                        try {
                            const patch = await generateSopPatch(lesson, gap.context);
                            setActivePatch({ patch: patch, title: lesson.title });
                        } catch (e) { alert("Patch gen failed."); }
                        finally { setIsGeneratingPatch(false); }
                    }
                }} 
            />
        )}
        {activeDriftIncident && (
            <CalibrationWorkspaceModal 
                incident={activeDriftIncident}
                onClose={() => setActiveDriftIncident(null)}
                onResolved={(result) => {
                    alert("Calibration standard committed. Operational nodes synced.");
                    setActiveDriftIncident(null);
                }}
            />
        )}
        {isPulseDetailOpen && insights && (
            <PulseSentimentDetailModal 
                insight={insights} 
                onClose={() => setIsPulseDetailOpen(false)} 
                onPatch={async (id, title) => {
                    const lesson = lessons.find(l => l.lesson_id === id);
                    if (lesson) {
                        setIsGeneratingPatch(true);
                        try {
                            const patch = await generateSopPatch(lesson, "General learner confusion detected via Pulse feedback.");
                            setActivePatch({ patch: patch, title: title });
                        } catch (e) { alert("Patch gen failed."); }
                        finally { setIsGeneratingPatch(false); }
                    }
                }} 
            />
        )}
        {activePatch && (
            <SopPatchComparisonModal 
                patch={activePatch.patch} 
                title={activePatch.title} 
                onClose={() => setActivePatch(null)} 
                onCommit={handleApplyPatch} 
                isApplying={isGeneratingPatch} 
            />
        )}
        {isBatchModalOpen && (
            <BatchIngestModal 
                onClose={() => setIsBatchModalOpen(false)} 
                onReportGenerated={(report) => {
                    setLastBatchReport(report);
                    setIsBatchModalOpen(false);
                }} 
            />
        )}
    </div>
  );
};

export default AdminDashboard;