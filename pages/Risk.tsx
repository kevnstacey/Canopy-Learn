import React from 'react';
import Card from '../components/Card';

const Risk: React.FC = () => (
  <section>
    <Card title="Our Approach to a Smooth Rollout">
        <p className="mb-4 text-slate-600 dark:text-slate-400">We address common challenges to ensure the platform is adopted successfully and remains a trusted resource:</p>
        <ul className="list-disc list-inside space-y-3">
            <li>
                <strong>Ensuring Staff Use It (Adoption):</strong> We start with a pilot program to get feedback and make sure the platform is genuinely helpful and easy for staff to use before a full launch.
            </li>
            <li>
                <strong>Keeping Content Accurate &amp; Fresh:</strong> The AI helps identify missing training topics. All documents can be versioned to prevent outdated information, and automatic reminders ensure staff complete required retraining on time.
            </li>
            <li>
                <strong>Maintaining AI Trustworthiness (No "Drift"):</strong> We prevent incorrect or "creative" AI answers. The assistant is restricted to using only your official store documents for answers and must always show its sources.
            </li>
        </ul>
    </Card>
  </section>
);

export default Risk;