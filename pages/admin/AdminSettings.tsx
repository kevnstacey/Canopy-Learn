
import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { usePersona } from '../../contexts/PersonaContext';
import { ORGANIZATION } from '../../data';

const Integrations = () => {
    const { pt } = usePersona();
    const [connected, setConnected] = useState({
        powerSchool: false,
        canvas: false,
        bamboo: false,
        certn: true,
        readinessApi: true
    });

    const toggleConnect = (key: keyof typeof connected) => {
        if (!connected[key]) {
            const apiKey = prompt(`Enter API Key for ${String(key)}:`, "sk_test_12345");
            if (apiKey) {
                setConnected(prev => ({ ...prev, [key]: true }));
            }
        } else {
            if (confirm("Disconnect this integration?")) {
                setConnected(prev => ({ ...prev, [key]: false }));
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                <p><strong>Enterprise Connect:</strong> Standardized tiles for linking to your existing tech stack. Canopy Learn handles data sync via encrypted webhooks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Certn */}
                <div className="p-5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
                        <div>
                            <h4 className="font-bold">Certn</h4>
                            <p className="text-xs text-slate-500">Automated criminal record verification.</p>
                        </div>
                    </div>
                    <button onClick={() => toggleConnect('certn')} className={`w-full py-2 rounded-lg font-bold text-xs ${connected.certn ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {connected.certn ? '● CONNECTED' : 'CONNECT'}
                    </button>
                </div>

                {/* Readiness API */}
                <div className="p-5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">API</div>
                        <div>
                            <h4 className="font-bold">Readiness API</h4>
                            <p className="text-xs text-slate-500">Expose live {pt('readiness')} status to other apps.</p>
                        </div>
                    </div>
                    <button onClick={() => toggleConnect('readinessApi')} className={`w-full py-2 rounded-lg font-bold text-xs ${connected.readinessApi ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {connected.readinessApi ? '● ACTIVE' : 'ACTIVATE'}
                    </button>
                </div>

                {/* BambooHR */}
                <div className="p-5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-sm flex flex-col justify-between opacity-70">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">Hr</div>
                        <div>
                            <h4 className="font-bold">BambooHR</h4>
                            <p className="text-xs text-slate-500">Sync workforce roster & departments.</p>
                        </div>
                    </div>
                    <button onClick={() => toggleConnect('bamboo')} className={`w-full py-2 rounded-lg font-bold text-xs ${connected.bamboo ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white'}`}>
                        {connected.bamboo ? '● CONNECTED' : 'CONNECT'}
                    </button>
                </div>

                {/* PowerSchool */}
                <div className="p-5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-sm flex flex-col justify-between opacity-70">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">PS</div>
                        <div>
                            <h4 className="font-bold">PowerSchool</h4>
                            <p className="text-xs text-slate-500">Sync participation data to SIS transcripts.</p>
                        </div>
                    </div>
                    <button onClick={() => toggleConnect('powerSchool')} className={`w-full py-2 rounded-lg font-bold text-xs ${connected.powerSchool ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white'}`}>
                        {connected.powerSchool ? '● CONNECTED' : 'CONNECT'}
                    </button>
                </div>
            </div>

            {/* API Contract Preview */}
            <div className="mt-8 bg-slate-900 rounded-2xl p-6 text-slate-400 font-mono text-xs overflow-hidden">
                <h4 className="text-slate-200 font-bold mb-4 flex justify-between">
                    <span>LIVE READINESS PAYLOAD</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">REST API V1</span>
                </h4>
                <pre className="text-emerald-400">
{`{
  "user_id": "user-3",
  "org_id": "org-demo-1",
  "overall_readiness": "PENDING",
  "blocked_reasons": ["Missing: First Aid", "Expired: Waiver"],
  "roles": [
    { "role": "Site Volunteer", "status": "READY" },
    { "role": "Lumber Safety", "status": "NOT_READY" }
  ],
  "last_audit_id": "audit-4921-X",
  "timestamp": "${new Date().toISOString()}"
}`}
                </pre>
            </div>
        </div>
    );
};

const GeneralSettings = () => {
    const { persona, pt } = usePersona();
    const [isResidencyActive, setIsResidencyActive] = useState(true);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="font-black text-xs uppercase text-slate-500 tracking-widest">General Identity</h4>
                    <div>
                        <label className="block text-sm font-bold mb-1">Organization Name</label>
                        <input type="text" defaultValue={ORGANIZATION.name} className="w-full p-3 border-2 rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Legal Subdomain</label>
                        <input type="text" defaultValue="canopylearn.app/secure-instance" disabled className="w-full p-3 border-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 font-mono text-sm" />
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                        <h4 className="font-black text-xs uppercase text-slate-500 tracking-widest mb-4">Branding ({persona.type})</h4>
                        <div className="flex items-center gap-6 p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                            <div style={{ backgroundColor: persona.accentColor }} className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform -rotate-3">
                                LOGO
                            </div>
                            <div className="space-y-2 flex-grow">
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">Theme Engine</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div style={{ backgroundColor: persona.accentColor }} className="w-4 h-4 rounded-full shadow-sm"></div>
                                        <span className="font-mono text-[10px] font-black uppercase text-slate-400">{persona.accentColor}</span>
                                    </div>
                                    <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Customize</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h4 className="font-black text-xs uppercase text-slate-500 tracking-widest">Compliance Moat</h4>
                    <div className={`p-6 rounded-[2.5rem] border-4 transition-all duration-700 ${isResidencyActive ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/10' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg ${isResidencyActive ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'}`}>🍁</div>
                                <div>
                                    <h3 className={`font-black uppercase tracking-tight ${isResidencyActive ? 'text-emerald-800 dark:text-emerald-100' : 'text-slate-500'}`}>Canadian Sovereignty</h3>
                                    <p className={`text-[10px] font-bold ${isResidencyActive ? 'text-emerald-600/70' : 'text-slate-400'}`}>PIPEDA / FIPPA Standard</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isResidencyActive} onChange={e => setIsResidencyActive(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full shadow-inner"></div>
                            </label>
                        </div>

                        {isResidencyActive && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Visual Map of Canada (Stylized) */}
                                <div className="relative h-32 bg-emerald-900/10 rounded-2xl flex items-center justify-center overflow-hidden border border-emerald-500/20">
                                     <svg viewBox="0 0 400 200" className="w-full h-full opacity-20 fill-emerald-500">
                                         <path d="M50,100 Q150,50 350,100 L350,150 Q150,180 50,150 Z" />
                                     </svg>
                                     <div className="absolute inset-0 flex items-center justify-around px-12">
                                         <div className="flex flex-col items-center">
                                             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                                             <span className="text-[7px] font-black text-emerald-800 dark:text-emerald-200 mt-1 uppercase">West Node</span>
                                         </div>
                                         <div className="flex flex-col items-center">
                                             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping [animation-delay:0.5s]"></div>
                                             <span className="text-[7px] font-black text-emerald-800 dark:text-emerald-200 mt-1 uppercase">Central Node</span>
                                         </div>
                                         <div className="flex flex-col items-center">
                                             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping [animation-delay:1s]"></div>
                                             <span className="text-[7px] font-black text-emerald-800 dark:text-emerald-200 mt-1 uppercase">East Node</span>
                                         </div>
                                     </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                     <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-100 flex items-center gap-2">
                                         <span className="text-lg">🛡️</span>
                                         <span className="text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-200 leading-tight">Zero-Export Compliance</span>
                                     </div>
                                     <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-100 flex items-center gap-2">
                                         <span className="text-lg">⚖️</span>
                                         <span className="text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-200 leading-tight">PIPEDA Audit Ready</span>
                                     </div>
                                </div>
                                <button className="w-full py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg">Download Certificate of Residency</button>
                            </div>
                        )}

                        {!isResidencyActive && (
                            <p className="text-xs text-slate-500 italic text-center py-4">Data Sovereignty Moat is currently inactive. Compliance posture is at Standard Global level.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Billing = () => (
    <div className="space-y-6">
        <h3 className="font-bold text-lg mb-4">Plans & Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
                { name: 'Starter', price: '$150/mo', users: 'Up to 50', active: false },
                { name: 'Growth', price: '$400/mo', users: 'Up to 250', active: true },
                { name: 'Enterprise', price: 'Custom', users: 'Unlimited', active: false },
            ].map(plan => (
                <div key={plan.name} className={`p-6 rounded-2xl border-2 transition-all ${plan.active ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-60'}`}>
                    {plan.active && <span className="text-[10px] font-black uppercase text-blue-600 block mb-2 tracking-widest">Current Plan</span>}
                    <h4 className="text-xl font-black">{plan.name}</h4>
                    <p className="text-2xl font-bold mt-2">{plan.price}</p>
                    <ul className="mt-4 space-y-2 text-xs font-medium text-slate-500">
                        <li>• {plan.users} {localStorage.getItem('persona_type')?.includes('Non') ? 'Volunteers' : 'Learners'}</li>
                        <li>• Audit Trail Integration</li>
                        <li>• Custom Branding</li>
                    </ul>
                    <button disabled={plan.active} className={`w-full mt-6 py-2 rounded-lg font-bold text-sm ${plan.active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {plan.active ? 'Active' : 'Upgrade'}
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const AdminSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Infrastructure & Compliance' | 'Enterprise Integrations' | 'Plans & Billing'>('Infrastructure & Compliance');

    return (
        <Card title="System Architecture & Settings">
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8 overflow-x-auto scrollbar-hide px-2">
                {['Infrastructure & Compliance', 'Enterprise Integrations', 'Plans & Billing'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-8 py-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all whitespace-nowrap ${
                            activeTab === tab 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="px-2">
                {activeTab === 'Infrastructure & Compliance' && <GeneralSettings />}
                {activeTab === 'Enterprise Integrations' && <Integrations />}
                {activeTab === 'Plans & Billing' && <Billing />}
            </div>
        </Card>
    );
};

export default AdminSettings;
