import React, { useState } from 'react';
import Card from '../components/Card';

const Integrations = () => {
    const [connected, setConnected] = useState({
        powerSchool: false,
        canvas: false,
        bamboo: false,
        certn: true, // Certn is active for demo
    });

    const toggleConnect = (key: keyof typeof connected) => {
        if (!connected[key]) {
            const apiKey = prompt(`Enter API Key for ${String(key)}:`, "sk_test_12345");
            if (apiKey) {
                setConnected(prev => ({ ...prev, [key]: true }));
                alert("Integration successfully connected!");
            }
        } else {
            if (confirm("Disconnect this integration?")) {
                setConnected(prev => ({ ...prev, [key]: false }));
            }
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-lg mb-4">External Integrations</h3>
            
            {/* Certn (Pre-connected for demo) */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
                    <div>
                        <h4 className="font-bold">Certn Background Checks</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Automated criminal record verification.</p>
                    </div>
                </div>
                <button 
                    onClick={() => toggleConnect('certn')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${connected.certn ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-slate-100 text-slate-700'}`}
                >
                    {connected.certn ? 'Connected' : 'Connect'}
                </button>
            </div>

            {/* SIS Integrations */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">PS</div>
                    <div>
                        <h4 className="font-bold">PowerSchool SIS</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Sync student volunteer hours to transcripts.</p>
                    </div>
                </div>
                <button 
                    onClick={() => toggleConnect('powerSchool')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${connected.powerSchool ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                >
                    {connected.powerSchool ? 'Connected' : 'Connect'}
                </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">Cv</div>
                    <div>
                        <h4 className="font-bold">Canvas LMS</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Import courses via LTI 1.3 standard.</p>
                    </div>
                </div>
                <button 
                    onClick={() => toggleConnect('canvas')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${connected.canvas ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                >
                    {connected.canvas ? 'Connected' : 'Connect'}
                </button>
            </div>

             <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">Hr</div>
                    <div>
                        <h4 className="font-bold">BambooHR</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Sync employee roster and departments.</p>
                    </div>
                </div>
                <button 
                    onClick={() => toggleConnect('bamboo')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${connected.bamboo ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                >
                    {connected.bamboo ? 'Connected' : 'Connect'}
                </button>
            </div>
        </div>
    );
};

const GeneralSettings = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium mb-1">Organization Name</label>
                <input type="text" defaultValue="Community Helpers Inc." className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Subdomain</label>
                <input type="text" defaultValue="community-helpers.canopylearn.app" disabled className="w-full p-2 border rounded bg-slate-100 dark:bg-slate-600 text-slate-500" />
            </div>
        </div>
        
        <div>
            <h4 className="font-bold mb-2">Branding</h4>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-hh-red rounded-lg flex items-center justify-center text-white font-bold">Logo</div>
                <button className="text-blue-600 text-sm hover:underline">Upload New Logo</button>
            </div>
        </div>

        <div>
            <h4 className="font-bold mb-2">Regional Settings</h4>
            <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-hh-red" />
                <span className="text-sm">Enforce Data Residency (Canada Only)</span>
            </div>
            <p className="text-xs text-slate-500 ml-6">Required for PIPEDA compliance.</p>
        </div>
    </div>
);

const NotificationSettings = () => (
    <div className="space-y-4">
        <h3 className="font-bold text-lg mb-4">Notification Preferences</h3>
        
        {['Course Assigned', 'Certificate Earned', 'Certificate Expiring (30 days)', 'Document Rejected'].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="font-medium">{item}</span>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded text-hh-red" /> Email
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked={i % 2 === 0} className="rounded text-hh-red" /> SMS
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded text-hh-red" /> Push
                    </label>
                </div>
            </div>
        ))}
    </div>
);

const AdminSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'General' | 'Integrations' | 'Notifications'>('General');

    return (
        <Card title="Settings">
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                {['General', 'Integrations', 'Notifications'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab 
                            ? 'border-hh-red text-hh-red' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'General' && <GeneralSettings />}
            {activeTab === 'Integrations' && <Integrations />}
            {activeTab === 'Notifications' && <NotificationSettings />}
        </Card>
    );
};

export default AdminSettings;