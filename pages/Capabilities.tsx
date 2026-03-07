
import React from 'react';
import Card from '../components/Card';

interface CapabilitiesProps {
  openDemo: (docId: string, anchor: string) => void;
}
const Capabilities: React.FC<CapabilitiesProps> = ({ openDemo }) => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card title="Knowledge Base">Searchable SOPs with section anchors and citations.</Card>
    <Card title="AI Assistant">Answers from your docs only; shows source section names.</Card>
    <Card title="Lessons & Quizzes">Micro-lessons with renewal reminders; quick knowledge checks.</Card>
    <Card title="Trainer Console">Gaps, KPIs, assignments, exports.</Card>
    <Card title="Roles & Permissions">Location/department scoping.</Card>
    <Card title="Integrations">SSO, Drive/SharePoint, CSV/Sheets.</Card>
  </section>
);

export default Capabilities;
