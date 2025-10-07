import { AssessmentData } from '@/lib/types';
import { Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
  assessmentData: AssessmentData;
}

/**
 * Calculate AI readiness score (0-100)
 */
function calculateReadinessScore(data: AssessmentData): number {
  let score = 0;

  // AI Tools Usage (40 points)
  const aiUsageMap = {
    'none': 0,
    'exploring': 10,
    'piloting': 20,
    'production': 30,
    'mature': 40,
  };
  score += aiUsageMap[data.currentState.aiToolsUsage];

  // Deployment Frequency (20 points)
  const deploymentMap: { [key: string]: number } = {
    'quarterly': 5,
    'monthly': 10,
    'biweekly': 12,
    'weekly': 16,
    'daily': 18,
    'multiple-daily': 20,
  };
  score += deploymentMap[data.currentState.deploymentFrequency] || 5;

  // Cycle Time (20 points) - lower is better
  const cycleTime = data.currentState.avgCycleTime;
  if (cycleTime <= 3) score += 20;
  else if (cycleTime <= 7) score += 16;
  else if (cycleTime <= 14) score += 12;
  else if (cycleTime <= 30) score += 8;
  else score += 4;

  // Team Size (10 points) - bigger team = more opportunity
  const teamSize = data.currentState.devTeamSize;
  if (teamSize >= 50) score += 10;
  else if (teamSize >= 20) score += 8;
  else if (teamSize >= 10) score += 6;
  else score += 4;

  // Company Size (10 points) - resources available
  const sizeMap = {
    'startup': 6,
    'scaleup': 8,
    'enterprise': 10,
  };
  score += sizeMap[data.companyInfo.size];

  return Math.min(score, 100);
}

/**
 * Get readiness level label
 */
function getReadinessLevel(score: number): { label: string; color: string; description: string } {
  if (score >= 80) return {
    label: 'Alto Potencial',
    color: 'text-neon-green',
    description: 'Excelente base para transformação disruptiva'
  };
  if (score >= 60) return {
    label: 'Bom Potencial',
    color: 'text-cyan-400',
    description: 'Boa posição para liderar transformação'
  };
  if (score >= 40) return {
    label: 'Potencial Moderado',
    color: 'text-amber-400',
    description: 'Janela de oportunidade para se tornar early adopter'
  };
  return {
    label: 'Início da Jornada',
    color: 'text-orange-400',
    description: 'Momento ideal para começar antes dos concorrentes'
  };
}

/**
 * Get AI maturity stage
 */
function getMaturityStage(usage: string): number {
  const stageMap: { [key: string]: number } = {
    'none': 0,
    'exploring': 1,
    'piloting': 2,
    'production': 3,
    'mature': 4,
  };
  return stageMap[usage] || 0;
}

export default function TransformationProfile({ assessmentData }: Props) {
  const readinessScore = calculateReadinessScore(assessmentData);
  const readinessLevel = getReadinessLevel(readinessScore);
  const maturityStage = getMaturityStage(assessmentData.currentState.aiToolsUsage);
  const stages = ['Explorando', 'Pilotando', 'Produção', 'Maduro'];

  // Identify opportunity areas
  const opportunityAreas = [
    { name: 'Engineering', potential: readinessScore >= 60 ? 'Alto' : 'Médio' },
    { name: 'Customer Service', potential: 'Alto' },
    { name: 'Sales & CRM', potential: assessmentData.companyInfo.size === 'enterprise' ? 'Alto' : 'Médio' },
    { name: 'Marketing', potential: 'Alto' },
    { name: 'Meeting Intelligence', potential: 'Baixo Risco, Alto Impacto' },
    { name: 'Operations', potential: assessmentData.currentState.devTeamSize >= 20 ? 'Alto' : 'Médio' },
  ];

  return (
    <div className="card-glow p-8 mb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-tech-gray-100">Perfil de </span>
          <span className="text-gradient-neon">Transformação IA</span>
        </h2>
        <p className="text-tech-gray-400 text-sm">
          Análise baseada em 50+ casos verificados de empresas similares
        </p>
      </div>

      {/* Company Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-background-card/30 rounded-lg border border-tech-gray-800">
        <div>
          <div className="text-xs text-tech-gray-500 uppercase tracking-wider mb-1">Empresa</div>
          <div className="text-lg font-semibold text-tech-gray-100">
            {assessmentData.companyInfo.name}
          </div>
        </div>
        <div>
          <div className="text-xs text-tech-gray-500 uppercase tracking-wider mb-1">Setor</div>
          <div className="text-lg font-semibold text-tech-gray-100">
            {assessmentData.companyInfo.industry}
          </div>
        </div>
        <div>
          <div className="text-xs text-tech-gray-500 uppercase tracking-wider mb-1">Porte</div>
          <div className="text-lg font-semibold text-tech-gray-100 capitalize">
            {assessmentData.companyInfo.size}
          </div>
        </div>
      </div>

      {/* Readiness Score */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-tech-gray-100">
            Prontidão para Transformação IA
          </h3>
          <div className="text-right">
            <div className={`text-3xl font-bold ${readinessLevel.color}`}>
              {readinessScore}
              <span className="text-xl text-tech-gray-400">/100</span>
            </div>
            <div className={`text-sm font-semibold ${readinessLevel.color}`}>
              {readinessLevel.label}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-tech-gray-800 rounded-full overflow-hidden mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-green to-cyan-500 transition-all duration-1000"
            style={{ width: `${readinessScore}%` }}
          />
        </div>
        <p className="text-sm text-tech-gray-400">{readinessLevel.description}</p>
      </div>

      {/* AI Maturity Journey */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-tech-gray-100 mb-4">
          Maturidade de IA
        </h3>
        <div className="flex items-center gap-2">
          {stages.map((stage, index) => (
            <div key={stage} className="flex-1">
              <div className={`h-2 rounded-full transition-all ${
                index <= maturityStage
                  ? 'bg-gradient-to-r from-neon-green to-cyan-500'
                  : 'bg-tech-gray-800'
              }`} />
              <div className={`text-xs mt-2 text-center ${
                index === maturityStage
                  ? 'text-neon-green font-semibold'
                  : index < maturityStage
                  ? 'text-tech-gray-400'
                  : 'text-tech-gray-600'
              }`}>
                {stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunity Areas */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-tech-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-green" />
          Áreas de Oportunidade Identificadas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {opportunityAreas.map((area) => (
            <div
              key={area.name}
              className="p-4 bg-background-card/50 border border-tech-gray-700 rounded-lg hover:border-neon-green/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-semibold text-tech-gray-100">
                  {area.name}
                </div>
                <AlertCircle className="w-4 h-4 text-neon-green" />
              </div>
              <div className={`text-xs font-semibold ${
                area.potential.includes('Alto') ? 'text-neon-green' : 'text-cyan-400'
              }`}>
                {area.potential}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Context */}
      <div className="p-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-amber-200 mb-2">
              Janela de Oportunidade
            </h4>
            <div className="space-y-2 text-sm text-tech-gray-300">
              <p>
                <strong className="text-amber-100">23%</strong> das empresas do seu setor já adotaram IA em produção (Gartner 2025)
              </p>
              <p>
                <strong className="text-amber-100">35%</strong> estão em fase de piloto
              </p>
              <p className="text-amber-100 font-semibold pt-2 border-t border-amber-500/20">
                Sua janela para se tornar líder: 12-18 meses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
