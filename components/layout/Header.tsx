import React, { useState, useMemo } from 'react';
import type { MainTab } from '../../App';
import type { User } from '../../types';
import NotificationBell from './NotificationBell';
import { useTranslation } from '../../contexts/LanguageContext';

interface HeaderProps {
  activeTab: MainTab;
  setTab: (tab: MainTab) => void;
  currentUser: User;
  cycleUser: () => void;
  onMenuClick: () => void;
  onResetData?: () => void;
  unreadNotificationCount?: number;
  onNotificationClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    activeTab, setTab, currentUser, cycleUser, onMenuClick, onResetData,
    unreadNotificationCount, onNotificationClick
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { language, setLanguage, t } = useTranslation();

    const visibleTabs = useMemo<{id: MainTab, label: string}[]>(() => {
        const tabs: {id: MainTab, label: string}[] = [];
        if (currentUser.role === 'Learner') {
            tabs.push({ id: 'Dashboard', label: t('Dashboard') });
            tabs.push({ id: 'Courses', label: t('My Courses') });
            tabs.push({ id: 'AI Chat', label: t('AI Tutor') });
        } else if (currentUser.role === 'Admin' || currentUser.role === 'Manager') {
            tabs.push({ id: 'Admin', label: t('Admin Console') });
            tabs.push({ id: 'Dashboard', label: t('Learner View') });
        } else if (currentUser.role === 'Executive') {
            tabs.push({ id: 'Reporting', label: t('Compliance Reports') });
        }
        tabs.push({ id: 'Updates', label: t('Updates') });
        return tabs;
    }, [currentUser.role, t]);
    
    return (
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-2.5 md:py-3 flex justify-between items-center">
                <div className="flex items-center gap-3 md:gap-6">
                    <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Menu">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('Dashboard')}>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden shadow-lg transition-transform hover:rotate-6">
                             <img src="https://res.cloudinary.com/dnecxetmp/image/upload/v1767662376/favicon_so1c2a.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Canopy<span className="text-emerald-500 hidden sm:inline"> Learn</span></div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-1">
                        {visibleTabs.map(tab => (
                            <button key={tab.id} onClick={() => setTab(tab.id)} className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden sm:flex border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden text-[10px] font-black tracking-widest">
                        <button onClick={() => setLanguage('EN')} className={`px-2 py-1.5 ${language === 'EN' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>EN</button>
                        <button onClick={() => setLanguage('FR')} className={`px-2 py-1.5 ${language === 'FR' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>FR</button>
                    </div>

                    <NotificationBell count={unreadNotificationCount} onClick={onNotificationClick} />
                    
                    <div className="relative">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2">
                             <img className="w-8 h-8 rounded-xl border-2 border-slate-100 dark:border-slate-600 shadow-sm" src={currentUser.profilePictureUrl} alt="" />
                             <div className="hidden md:flex flex-col items-start leading-none">
                                 <span className="font-black text-xs">{currentUser.name.split(' ')[0]}</span>
                                 <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{currentUser.role}</span>
                             </div>
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl py-2 z-50 border border-slate-100 dark:border-slate-700 animate-fade-in-up">
                                <button onClick={() => { cycleUser(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-xs font-black text-slate-600 dark:text-slate-200 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700">Cycle Identity</button>
                                <div className="border-t border-slate-50 dark:border-slate-700 my-1"></div>
                                <button className="block w-full text-left px-4 py-3 text-xs font-black text-red-600 uppercase tracking-widest hover:bg-red-50">Log Out</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;