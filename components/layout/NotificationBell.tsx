
import React from 'react';

interface NotificationBellProps {
    count?: number;
    onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ count = 0, onClick }) => {
  return (
    <button 
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        onClick={onClick}
        aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-hh-red text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-800">
            {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
