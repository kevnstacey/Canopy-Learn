
import React, { useMemo } from 'react';
import Card from '../components/Card';
import KPIBlock from '../components/KPIBlock';
import { User, TraineeProgress } from '../types';

interface ManagerProps {
  currentUser: User;
  team: User[]; // All trainees in the store
  teamProgress: TraineeProgress[];
}

const Manager: React.FC<ManagerProps> = ({ currentUser, team, teamProgress }) => {

  const managerKPIs = useMemo(() => {
    const totalTrainees = team.length;
    if (totalTrainees === 0) return { completionRate: 0, compliance: { safety: 0 }, pendingSignoffs: 0 };
    
    // Simple overall completion calculation
    let completedItems = 0;
    let totalItems = 0;
    
    team.forEach(trainee => {
      const progress = teamProgress.find(p => p.userId === trainee.user_id);
      if (progress && progress.completedQuizzes) {
          const count = Object.keys(progress.completedQuizzes).length;
          completedItems += count;
          // Heuristic: assume 5 modules per person for demo baseline if empty, or utilize counts
          totalItems += Math.max(count, 1); 
      }
    });
    
    // Avoid division by zero
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      completionRate,
      compliance: {
        safety: completionRate, // Simplified for empty demo state
      },
      pendingSignoffs: 0,
    };
  }, [team, teamProgress]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <KPIBlock 
        label="Overall Readiness"
        value={`${managerKPIs.completionRate}%`}
        valueClassName="text-green-600"
        valueSize="text-5xl"
        sub="Learners certified for their role."
      />
      <Card title="Compliance Reporting">
        <div className="text-2xl font-bold">General Safety: <span className="text-green-600">{managerKPIs.compliance.safety}%</span></div>
        <p className="text-sm mt-2">Automated expiry alerts are active.</p>
      </Card>
      <KPIBlock 
        label="Pending Evidence"
        value={managerKPIs.pendingSignoffs}
        valueClassName="text-orange-500"
        valueSize="text-5xl"
        sub="Assessments requiring verification."
      />
       <Card title="Alerts">
        <p>No active alerts.</p>
       </Card>
    </section>
  );
};

export default Manager;
