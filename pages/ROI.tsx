
import React from 'react';
import Card from '../components/Card';
import KPIBlock from '../components/KPIBlock';

const ROI: React.FC = () => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <KPIBlock 
      label="Total Annual Savings"
      value="$33,300"
      valueClassName="text-green-600"
      sub="From getting new hires up to speed faster and reducing costly operational errors."
    />
     <KPIBlock 
      label="Year-1 Cost"
      value="$3,500"
      valueClassName="text-slate-700 dark:text-slate-300"
      sub="Includes initial setup and 12 months subscription."
    />
    <KPIBlock 
      label="Net Benefit (Year 1)"
      value="$29,800"
      valueClassName="text-green-600"
      sub="An 8.5x return on investment, delivering significant value from day one."
    />
     <Card title="Summary" className="md:col-span-3">
      <p>By investing in a central, AI-powered training hub, you can expect significant returns through greater efficiency, reduced risk, and improved employee performance. The system pays for itself within the first year by saving time on training and reducing mistakes.</p>
    </Card>
  </section>
);

export default ROI;
