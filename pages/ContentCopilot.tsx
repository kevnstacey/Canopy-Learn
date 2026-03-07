
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { generateSop } from '../services/geminiService';
import { SopDraft, Department } from '../types';

interface ContentCopilotProps {
    onAddSop: (draft: SopDraft, departments: Department[]) => void;
    initialPrompt?: string;
}

const ContentCopilot: React.FC<ContentCopilotProps> = ({ onAddSop, initialPrompt = '' }) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [isLoading, setIsLoading] = useState(false);
    const [draft, setDraft] = useState<SopDraft | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedDepts, setSelectedDepts] = useState<Department[]>([]);
    const [useSearch, setUseSearch] = useState(false);

    useEffect(() => {
        // If an initial prompt is passed (e.g., from insights), auto-generate.
        if (initialPrompt) {
            handleGenerate();
        }
    }, [initialPrompt]);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError(null);
        setDraft(null);
        try {
            const result = await generateSop(prompt, useSearch);
            setDraft(result);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSop = () => {
        if (draft && selectedDepts.length > 0) {
            onAddSop(draft, selectedDepts);
            setDraft(null);
            setPrompt('');
            setSelectedDepts([]);
        } else {
            alert('Please select at least one department for this SOP.');
        }
    };
    
    const handleDeptChange = (dept: Department) => {
        setSelectedDepts(prev => 
            prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
        );
    };
    
    const allDepartments: Department[] = ['General', 'Lumber', 'Garden', 'Paint', 'Cashier'];

    return (
        <Card title="AI Content Co-pilot">
            <p className="mb-4">Describe the training document or SOP you need. The AI will generate a structured draft for you to review and edit.</p>
            
            <div className="flex flex-col gap-3">
                 <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g., 'Create a procedure for safely handling customer propane tank exchanges'"
                    className="w-full p-3 h-24 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-hh-red focus:outline-none transition-shadow"
                 />
                 
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                         <input 
                            type="checkbox" 
                            checked={useSearch} 
                            onChange={e => setUseSearch(e.target.checked)}
                            className="rounded text-hh-red focus:ring-hh-red"
                         />
                         <span className="text-sm font-medium">Research Web for Standards (Google Search)</span>
                     </label>

                    <button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full sm:w-auto bg-hh-red text-white font-semibold py-3 px-6 rounded-lg hover:bg-hh-red-dark transition-colors disabled:bg-slate-400">
                        {isLoading ? (
                            <span className="flex items-center gap-2 justify-center">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {useSearch ? 'Researching...' : 'Drafting...'}
                            </span>
                        ) : 'Generate Draft'}
                    </button>
                 </div>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded mt-4">{error}</p>}

            {draft && (
                <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h2 className="text-2xl font-bold mb-4">Generated Draft</h2>
                    
                    {/* Sources Badge */}
                    {draft.sources && draft.sources.length > 0 && (
                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                            <p className="text-xs font-bold text-blue-800 dark:text-blue-200 uppercase mb-1">Sources Used:</p>
                            <ul className="text-xs text-blue-700 dark:text-blue-300 list-disc list-inside">
                                {draft.sources.map((src, i) => (
                                    <li key={i}><a href={src.uri} target="_blank" rel="noreferrer" className="hover:underline">{src.title}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <h3 className="text-xl font-bold">{draft.title}</h3>
                        <div className="prose dark:prose-invert max-w-none mt-4">
                            {draft.sections.map((sec, i) => (
                                <div key={i}>
                                    <h4>{sec.heading}</h4>
                                    <div dangerouslySetInnerHTML={{ __html: sec.html }} />
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign to Departments</label>
                         <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {allDepartments.map(dept => (
                                <label key={dept} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border ${selectedDepts.includes(dept) ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600'}`}>
                                    <input type="checkbox" checked={selectedDepts.includes(dept)} onChange={() => handleDeptChange(dept)} className="form-checkbox rounded text-hh-red focus:ring-hh-red" />
                                    <span className="text-sm">{dept}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                         <button onClick={handleAddSop} disabled={selectedDepts.length === 0} className="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 disabled:bg-slate-400">
                             Add to SOP Library
                         </button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ContentCopilot;
