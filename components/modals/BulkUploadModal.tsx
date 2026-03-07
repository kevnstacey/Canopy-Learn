
import React, { useState, useRef } from 'react';
import BaseModal from './BaseModal';
import { User, Role, Department, EmploymentType } from '../../types';
import { parseCSV } from '../../utils/csvParser';
import { SAMPLE_CSV_DATA } from '../../data';

interface BulkUploadModalProps {
    onClose: () => void;
    onImport: (users: Omit<User, 'user_id' | 'startDate'>[]) => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onClose, onImport }) => {
    const [stagedUsers, setStagedUsers] = useState<Omit<User, 'user_id' | 'startDate'>[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.name.endsWith('.csv')) {
            setError("Please upload a valid CSV file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsed = parseCSV(text);
                if (parsed.length === 0) throw new Error("No users found in CSV.");
                setStagedUsers(parsed);
                setError(null);
            } catch (err) {
                setError("Failed to parse CSV. Check your headers.");
            }
        };
        reader.readAsText(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const downloadTemplate = () => {
        const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'canopy_import_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <BaseModal title="Bulk Personnel Import" onClose={onClose}>
            <div className="space-y-6">
                {stagedUsers.length === 0 ? (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📋</span>
                                <div>
                                    <p className="text-sm font-bold text-blue-800 dark:text-blue-200">New to Bulk Upload?</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-300">Download our validated template to ensure zero errors during ingest.</p>
                                </div>
                            </div>
                            <button 
                                onClick={downloadTemplate}
                                className="px-4 py-2 bg-white dark:bg-slate-800 text-blue-600 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
                            >
                                Download Template
                            </button>
                        </div>

                        <div 
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-4 border-dashed rounded-[2.5rem] p-16 text-center transition-all cursor-pointer group ${
                                isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                            }`}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
                                className="hidden" 
                                accept=".csv" 
                            />
                            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📥</div>
                            <p className="font-black text-slate-400 uppercase tracking-widest mb-2">Drop CSV File Here</p>
                            <p className="text-xs text-slate-400 font-medium">Or click to browse your computer</p>
                        </div>
                        
                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-2 animate-fade-in">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-end px-2">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Import Staging area</h3>
                                <p className="text-sm text-slate-500 font-medium">We found {stagedUsers.length} valid personnel records.</p>
                            </div>
                            <button onClick={() => setStagedUsers([])} className="text-xs font-black text-slate-400 hover:text-red-500 uppercase tracking-widest">Clear All</button>
                        </div>

                        <div className="max-h-64 overflow-y-auto border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                            <table className="min-w-full text-left text-xs">
                                <thead className="bg-white dark:bg-slate-800 sticky top-0 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-black uppercase text-slate-400">Name</th>
                                        <th className="px-4 py-3 font-black uppercase text-slate-400">Role</th>
                                        <th className="px-4 py-3 font-black uppercase text-slate-400">Depts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {stagedUsers.map((u, i) => (
                                        <tr key={i} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                            <td className="px-4 py-3 font-bold">{u.name}</td>
                                            <td className="px-4 py-3 font-medium text-blue-600">{u.role}</td>
                                            <td className="px-4 py-3 text-slate-500">{u.departments.join(', ')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={onClose}
                                className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => { onImport(stagedUsers); onClose(); }}
                                className="flex-[2] py-4 bg-hh-red text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-hh-red-dark active:scale-95 transition-all"
                            >
                                Finalize Import ({stagedUsers.length} Users)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </BaseModal>
    );
};

export default BulkUploadModal;
