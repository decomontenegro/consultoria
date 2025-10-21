'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getImplementationPlan, updateMilestone } from '@/lib/services/implementation-service';
import { ImplementationPlan, Milestone } from '@/lib/types/implementation-tracker';
import { Check, Circle, Clock, AlertCircle, ChevronRight } from 'lucide-react';

export default function TrackerPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<ImplementationPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const planId = params.id as string;
    const loadedPlan = getImplementationPlan(planId);

    if (!loadedPlan) {
      router.push('/dashboard');
      return;
    }

    setPlan(loadedPlan);
    setLoading(false);
  }, [params.id, router]);

  const handleToggleMilestone = (phaseId: string, milestoneId: string, currentStatus: string) => {
    if (!plan) return;

    const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
    const newProgress = newStatus === 'completed' ? 100 : 0;

    updateMilestone(plan.id, phaseId, milestoneId, {
      status: newStatus,
      progress: newProgress,
    });

    // Reload plan
    const updatedPlan = getImplementationPlan(plan.id);
    if (updatedPlan) setPlan(updatedPlan);
  };

  if (loading || !plan) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  const getStatusIcon = (milestone: Milestone) => {
    switch (milestone.status) {
      case 'completed':
        return <Check className="w-5 h-5 text-neon-green" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-neon-cyan" />;
      case 'blocked':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Circle className="w-5 h-5 text-tech-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="nav-dark">
        <div className="container-professional py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gradient-neon">
              CulturaBuilder
            </Link>
            <Link href="/dashboard" className="btn-secondary text-sm">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-professional py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-tech-gray-100">Implementation </span>
              <span className="text-gradient-neon">Tracker</span>
            </h1>
            <p className="text-tech-gray-400">{plan.companyName}</p>
          </div>

          {/* Overall Progress */}
          <div className="card-professional p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-tech-gray-100">Progresso Geral</h2>
              <span className="text-3xl font-bold text-neon-green">{plan.overallProgress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${plan.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-6">
            {plan.phases.map((phase) => {
              const completed = phase.milestones.filter(m => m.status === 'completed').length;
              const total = phase.milestones.length;
              const phaseProgress = Math.round((completed / total) * 100);

              return (
                <div key={phase.id} className="card-professional p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-tech-gray-100 mb-1">
                        {phase.name}
                      </h3>
                      <p className="text-sm text-tech-gray-400">{phase.description}</p>
                    </div>
                    <span className="text-sm text-tech-gray-500">
                      {completed}/{total} completos
                    </span>
                  </div>

                  {/* Phase Progress */}
                  <div className="mb-6">
                    <div className="progress-bar h-2">
                      <div
                        className="progress-fill"
                        style={{ width: `${phaseProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-3">
                    {phase.milestones.map((milestone) => (
                      <button
                        key={milestone.id}
                        onClick={() => handleToggleMilestone(phase.id, milestone.id, milestone.status)}
                        className="w-full text-left p-4 bg-background-card/50 border border-tech-gray-700 rounded-lg hover:border-neon-green/50 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(milestone)}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold mb-1 ${milestone.status === 'completed' ? 'text-tech-gray-500 line-through' : 'text-tech-gray-100'}`}>
                              {milestone.title}
                            </h4>
                            <p className="text-sm text-tech-gray-400">{milestone.description}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-tech-gray-600 group-hover:text-neon-green transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
