import React from 'react';
import Card from '../components/Card';

const Pricing: React.FC = () => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card title="Starter">$150/mo + $500 build</Card>
    <Card title="Growth">$250/mo + $500 build</Card>
    <Card title="Enterprise">$400/mo + $500 build</Card>
  </section>
);

export default Pricing;
