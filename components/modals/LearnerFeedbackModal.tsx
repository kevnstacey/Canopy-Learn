
import React, { useState } from 'react';
import BaseModal from './BaseModal';

interface LearnerFeedbackModalProps {
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
}

const LearnerFeedbackModal: React.FC<LearnerFeedbackModalProps> = ({ onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return alert("Please select a rating.");
        onSubmit(rating, comment);
        onClose();
    };

    return (
        <BaseModal title="Canopy Pulse: Share Your Thoughts" onClose={onClose}>
            <div className="space-y-6 text-center">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-2xl font-black uppercase tracking-tight">How was the training?</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">Your feedback directly helps us improve the quality and clarity of our operational standards.</p>

                <div className="flex justify-center gap-4 py-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <button 
                            key={num}
                            onClick={() => setRating(num)}
                            className={`w-12 h-12 rounded-2xl font-black text-lg transition-all ${rating === num ? 'bg-hh-red text-white scale-110 shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <div className="text-left space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">One thing that could be clearer?</label>
                    <textarea 
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="e.g., 'The section on hazardous waste disposal was a bit confusing...'"
                        className="w-full p-4 border-2 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none h-32 text-sm font-medium"
                    />
                </div>

                <button 
                    onClick={handleSubmit}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                >
                    Submit Pulse
                </button>
            </div>
        </BaseModal>
    );
};

export default LearnerFeedbackModal;
