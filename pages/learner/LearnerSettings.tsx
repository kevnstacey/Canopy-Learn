
import React from 'react';
import Card from '../../components/Card';
import { NotificationPreference } from '../../types';

interface LearnerSettingsProps {
    preferences: NotificationPreference;
    onUpdatePreferences: (prefs: NotificationPreference) => void;
}

const LearnerSettings: React.FC<LearnerSettingsProps> = ({ preferences, onUpdatePreferences }) => {
    
    const toggle = (key: keyof NotificationPreference) => {
        onUpdatePreferences({
            ...preferences,
            [key]: !preferences[key as keyof NotificationPreference]
        });
    };

    return (
        <Card title="Account Settings">
            <h3 className="font-bold text-lg mb-4">Notification Preferences</h3>
            <div className="space-y-4 max-w-lg">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Email Notifications</div>
                        <div className="text-xs text-slate-500">Receive updates via email</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={preferences.email_enabled} onChange={() => toggle('email_enabled')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-hh-red"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Push Notifications</div>
                        <div className="text-xs text-slate-500">Receive alerts in the browser/app</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={preferences.push_enabled} onChange={() => toggle('push_enabled')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-hh-red"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">SMS Notifications</div>
                        <div className="text-xs text-slate-500">Receive alerts via text message</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={preferences.sms_enabled} onChange={() => toggle('sms_enabled')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-hh-red"></div>
                    </label>
                </div>
            </div>
        </Card>
    );
};

export default LearnerSettings;
