
import React from 'react';
import type { MainTab } from '../../App';
import type { User } from '../../types';

interface MobileNavProps {
    activeTab: MainTab;
    setTab: (tab: MainTab) => void;
    currentUser: User;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setTab, currentUser }) => {
    const isLearner = currentUser.role === 'Learner';
    
    // Config based on role
    const tabs = isLearner ? [
        { id: 'Dashboard', label: 'Home', icon: '🏠' },
        { id: 'Courses', label: 'Learn', icon: '🎓' },
        { id: 'Arena', label: 'Arena', icon: '🛡️' },
        { id: 'AI Chat', label: 'Tutor', icon: '🤖' },
        { id: 'Role Play', label: 'Practice', icon: '🎙️' }
    ] : [
        { id: 'Admin', label: 'Admin', icon: '📊' },
        { id: 'Dashboard', label: 'Learner', icon: '👨‍🎓' },
        { id: 'Updates', label: 'Updates', icon: '📢' },
        { id: 'Simulator', label: 'Nexus', icon: '🔗' }
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setTab(tab.id as MainTab)}
                        className={`flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-all active:scale-90 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`}
                    >
                        <span className="text-xl">{tab.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MobileNav;
