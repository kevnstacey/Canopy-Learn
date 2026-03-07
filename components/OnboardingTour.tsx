
import React, { useState } from 'react';

interface OnboardingTourProps {
    onClose: () => void;
}

const STEPS = [
    {
        title: "Welcome to Canopy Learn!",
        content: "You're about to start your journey. This platform is your central hub for all training, safety certifications, and readiness requirements.",
        icon: "👋"
    },
    {
        title: "Your Dashboard",
        content: "The main screen shows your assigned programs. You can see your progress bars, upcoming deadlines, and current 'Readiness' status at a glance.",
        icon: "📊"
    },
    {
        title: "Completing Lessons",
        content: "Click on any program card to view modules. You can read SOPs, watch videos, and take quizzes directly in the app. Content is bite-sized for easy learning.",
        icon: "🎓"
    },
    {
        title: "Uploading Documents",
        content: "Need to submit a background check or First Aid certificate? Look for the 'Upload' sections within your Compliance programs. You can snap a photo directly from your phone.",
        icon: "📁"
    },
    {
        title: "Get Certified",
        content: "Once you complete a program, you'll earn a digital certificate. You can download these or share them to LinkedIn from the 'Certificates' tab.",
        icon: "🏆"
    },
    {
        title: "You're All Set!",
        content: "That's it! You are ready to begin. Click 'Finish' to jump into your first training module.",
        icon: "🚀"
    }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handleSkip = () => {
        onClose();
    };

    const stepData = STEPS[currentStep];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm transition-all">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-fade-in-up">
                
                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 dark:bg-slate-700 w-full">
                    <div 
                        className="h-full bg-hh-red transition-all duration-300 ease-out" 
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    ></div>
                </div>

                <div className="p-8 text-center">
                    <div className="text-6xl mb-6 animate-bounce-short">{stepData.icon}</div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{stepData.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                        {stepData.content}
                    </p>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleNext}
                            className="w-full bg-hh-red hover:bg-hh-red-dark text-white font-bold py-3 px-4 rounded-xl transition-transform active:scale-95 shadow-md"
                        >
                            {currentStep === STEPS.length - 1 ? "Finish & Start Learning" : "Next"}
                        </button>
                        {currentStep < STEPS.length - 1 && (
                            <button 
                                onClick={handleSkip}
                                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                Skip Tour
                            </button>
                        )}
                    </div>
                </div>

                {/* Dots Indicator */}
                <div className="flex justify-center gap-2 pb-6">
                    {STEPS.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-hh-red' : 'bg-slate-300 dark:bg-slate-600'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
