import React from 'react';

// Import all the components to be consolidated
import Executive from './Executive';
import Implementation from './Implementation';
import Pricing from './Pricing';
import Risk from './Risk';
import Appendices from './Appendices';
import ROI from './ROI';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const titleParts = title.split('(');
    const mainTitle = titleParts[0].trim();
    const subtitle = titleParts.length > 1 ? `(${titleParts.slice(1).join('(')}` : null;

    return (
        <div className="mb-12">
            <div className="border-b-2 border-hh-red pb-2 mb-6 flex items-baseline flex-wrap">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">{mainTitle}</h2>
                {subtitle && <span className="text-base font-normal text-slate-500 ml-3">{subtitle}</span>}
            </div>
            {children}
        </div>
    );
};

const FeatureCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{icon}</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h3>
        </div>
        <div className="text-slate-600 dark:text-slate-400 flex-grow">
            {children}
        </div>
    </div>
);


const Proposal: React.FC = () => {
  return (
    <div className="space-y-12">
      <Section title="Executive Summary & Return on Investment">
        <Executive />
        <div className="mt-8">
            <ROI />
        </div>
      </Section>

      <Section title="A Unified Platform for Modern Training">
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-8">
            Move beyond static documents and checklists. This platform is an intelligent, proactive training ecosystem designed to build a safer, more skilled, and more engaged workforce from day one. We provide tailored experiences and powerful tools for every role in your organization.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FeatureCard title="For the Trainee" icon="🎓">
                <p className="mb-4 font-semibold">An Engaging & Supportive Learning Journey</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><b>Instant, Accurate Answers:</b> AI Chat only uses your official documents to answer questions, reducing reliance on managers.</li>
                    <li><b>Guided Learning Paths:</b> Structured onboarding and role-specific training ensure consistent, comprehensive learning.</li>
                    <li><b>Fun & Motivating:</b> Points, badges, and leaderboards turn training into a friendly competition.</li>
                    <li><b>Realistic Practice:</b> A voice-based simulator allows staff to practice difficult customer interactions in a safe, repeatable environment.</li>
                </ul>
            </FeatureCard>
            <FeatureCard title="For the Manager" icon="📊">
                <p className="mb-4 font-semibold">Intelligent Coaching & Administration Tools</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><b>AI Writing Assistant:</b> Generate high-quality training guides and procedures from a simple description, reducing content creation time.</li>
                    <li><b>Proactive Insights:</b> AI analyzes team questions to automatically find knowledge gaps and identify trainees who need extra support.</li>
                    <li><b>AI-Assisted Reviews:</b> Save time with AI-powered analysis of practical video submissions, complete with performance checklists.</li>
                    <li><b>Easy Staff Management:</b> A complete staff roster with training statuses, plus tools to add employees one-by-one or from a spreadsheet.</li>
                </ul>
            </FeatureCard>
             <FeatureCard title="For the Executive" icon="📈">
                 <p className="mb-4 font-semibold">Strategic Oversight & Risk Reduction</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><b>Store-Wide Compliance Dashboards:</b> Get a high-level, real-time view of training completion rates and safety certification status.</li>
                    <li><b>Data-Driven Strategy:</b> Track manager and team performance to identify high-achievers and areas needing more support.</li>
                    <li><b>Reduced Risk & Costs:</b> Ensure consistent training to reduce costly errors, improve safety, and get new hires up to speed faster.</li>
                    <li><b>A Central Knowledge Hub:</b> Build and maintain a single, up-to-date library of best practices that grows with your business.</li>
                </ul>
            </FeatureCard>
        </div>
      </Section>

      <Section title="Implementation Plan">
        <Implementation />
      </Section>
      <Section title="Pricing (Pricing is an estimate only and can vary with company needs and final approval)">
        <Pricing />
      </Section>
      <Section title="Risk & Change Management">
        <Risk />
      </Section>
      <Section title="Appendices">
        <Appendices />
      </Section>
    </div>
  );
};

export default Proposal;