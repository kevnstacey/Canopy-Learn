
import React, { useEffect } from 'react';

const Confetti: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] animate-fade-in"></div>
            <div className="text-center relative z-10 animate-bounce-short">
                <div className="text-8xl">🎉</div>
                <h2 className="text-4xl font-black text-white drop-shadow-lg mt-4">Onboarding Complete!</h2>
                <p className="text-white text-xl font-bold mt-2 drop-shadow-md">You are ready to start.</p>
            </div>
            {/* Simple CSS particles could go here, but emoji is sufficient for MVP */}
        </div>
    );
};

export default Confetti;
