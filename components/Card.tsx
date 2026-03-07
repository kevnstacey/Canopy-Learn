import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ title, children, footer, className, style }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col ${className || ''}`}
      style={style}
    >
      {/* Main Content Area */}
      <div className="p-6 flex-grow">
        <b className="font-bold text-slate-600 dark:text-slate-300 block mb-2">{title}</b>
        <div className="text-slate-700 dark:text-slate-300">{children}</div>
      </div>

      {/* Footer Area */}
      {footer && (
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
