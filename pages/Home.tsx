import React from 'react';
import Card from '../components/Card';
import KPIBlock from '../components/KPIBlock';

const Home: React.FC = () => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <KPIBlock label="Outcome" value="30–40%" sub="Faster time-to-competency" valueSize="text-5xl" />
    <KPIBlock label="Deflection" value="40–60%" sub="Fewer repeat questions" valueSize="text-5xl" />
    <KPIBlock label="Compliance" value="95%+" sub="Coverage target" valueSize="text-5xl" />
    <Card title="What this demo shows" className="md:col-span-3">SOP-grounded answers with citations, micro-quizzes, trainer KPIs, and a clean UI similar to Absorb/Connecteam.</Card>
  </section>
);

export default Home;