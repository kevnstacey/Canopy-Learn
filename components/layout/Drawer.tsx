
import React, { useMemo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import type { MainTab } from '../../App';
import type { User } from '../../types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: MainTab;
  setTab: (tab: MainTab) => void;
  currentUser: User;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, activeTab, setTab, currentUser }) => {
  const { t } = useTranslation();

  const handleNav = (tab: MainTab) => {
    setTab(tab);
    onClose();
  };

  const visibleTabs = useMemo<{id: MainTab, label: string}[]>(() => {
    const tabs: {id: MainTab, label: string}[] = [];

    if (currentUser.role === 'Learner') {
        tabs.push({ id: 'Dashboard', label: t('Dashboard') });
        tabs.push({ id: 'Courses', label: t('My Courses') });
        tabs.push({ id: 'AI Chat', label: t('AI Tutor') });
        tabs.push({ id: 'Role Play', label: t('Practice') });
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
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden backdrop-blur-sm" 
            onClick={onClose}
            aria-hidden="true"
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Menu</h2>
            <button 
                onClick={onClose} 
                className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-hh-red" 
                aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <nav className="flex-grow">
            <ul className="space-y-3">
                {visibleTabs.map(tab => (
                    <li key={tab.id}>
                        <button 
                            onClick={() => handleNav(tab.id)} 
                            className={`w-full text-left p-3 rounded-lg font-semibold transition-colors ${
                                activeTab === tab.id 
                                ? 'bg-hh-red text-white shadow-md' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>
          </nav>
          
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-400 text-center">&copy; 2025 Canopy Learn</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Drawer;
