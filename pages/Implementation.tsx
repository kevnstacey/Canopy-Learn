import React from 'react';
import Card from '../components/Card';

const Implementation: React.FC = () => (
  <section><Card title="Our 6-Week Launch Plan">
    <ul className="list-disc list-inside space-y-2">
      <li><strong>Weeks 1–2: Foundation.</strong> We'll connect with your systems, organize your first 50 training documents, and set up two initial learning paths.</li>
      <li><strong>Weeks 3–4: Build & Test.</strong> We'll activate the AI search so it can provide answers with sources, and create the first set of lessons and quizzes.</li>
      <li><strong>Weeks 5–6: Pilot Program.</strong> A small group of 10–15 staff will test the platform. We'll use their feedback to improve any confusing parts.</li>
      <li><strong>Week 7: Full Launch.</strong> We'll roll out the complete platform to both locations, including features like automatic training reminders.</li>
    </ul>
  </Card></section>
);

export default Implementation;