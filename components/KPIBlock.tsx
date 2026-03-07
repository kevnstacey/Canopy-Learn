
import React from 'react';
import Card from './Card';

interface KPIBlockProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  sub?: React.ReactNode;
  className?: string;
  valueSize?: string;
  onInfoClick?: () => void;
}

const KPIBlock: React.FC<KPIBlockProps> = ({ label, value, valueClassName, sub, className, valueSize = 'text-4xl', onInfoClick }) => {
  return (
    <Card title={label} className={className}>
      <div className="flex justify-between items-start">
        <div className={`${valueSize} font-extrabold ${valueClassName || 'text-hh-red'} tracking-tighter`}>{value}</div>
        {onInfoClick && (
          <button 
            onClick={(e) => { e.stopPropagation(); onInfoClick(); }}
            className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
            title="View Financial Logic"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
      {sub && <p className="mt-2 text-[10px] font-bold uppercase text-slate-500 tracking-widest leading-tight">{sub}</p>}
    </Card>
  );
};

export default KPIBlock;
