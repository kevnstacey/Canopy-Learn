
import React from 'react';
import Card from '../../components/Card';
import { NotificationLog } from '../../types';

interface LearnerNotificationsProps {
    notifications: NotificationLog[];
    onMarkRead: (logId?: string) => void;
}

const LearnerNotifications: React.FC<LearnerNotificationsProps> = ({ notifications, onMarkRead }) => {
    // Sort by date desc
    const sorted = [...notifications].sort((a, b) => b.sent_at - a.sent_at);

    return (
        <div className="space-y-6">
            <Card title="Notification Center">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-slate-500">Stay updated on your training progress and tasks.</p>
                    <button 
                        onClick={() => onMarkRead()}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Mark all as read
                    </button>
                </div>

                {sorted.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        No notifications yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sorted.map(notif => (
                            <div 
                                key={notif.log_id} 
                                className={`p-4 rounded-lg border transition-all relative ${
                                    !notif.read 
                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                                    : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 opacity-80 hover:opacity-100'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                        <div>
                                            <h4 className={`font-semibold text-sm ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                {notif.title}
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notif.message}</p>
                                            <p className="text-xs text-slate-400 mt-2">{new Date(notif.sent_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {!notif.read && (
                                        <button 
                                            onClick={() => onMarkRead(notif.log_id)}
                                            className="text-xs text-slate-400 hover:text-blue-600 p-2"
                                            title="Mark as read"
                                        >
                                            Dismiss
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default LearnerNotifications;
