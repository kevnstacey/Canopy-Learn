
import React, { useEffect, useRef } from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const BaseModal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    // Simple focus trap (optional but good for a11y)
    // modalRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // ID for aria-labelledby
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1} // Allow div to receive focus if we wanted to implement full focus trap
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id={titleId} className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button 
            className="text-slate-500 hover:text-hh-red dark:hover:text-hh-red p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" 
            onClick={onClose}
            aria-label="Close modal"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
