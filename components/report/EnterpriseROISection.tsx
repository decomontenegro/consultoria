import { EnterpriseROI, DepartmentROI } from '@/lib/types';
import { formatCurrency } from '@/lib/calculators/enterprise-roi-calculator';
import { DataQualityBadge } from './DataQualityBadge';
import {
  Code2,
  Headphones,
  BarChart3,
  Megaphone,
  Video,
  Settings,
  Check,
  AlertTriangle,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface Props {
  enterpriseROI: EnterpriseROI;
  isMockData?: boolean;
}

/**
 * Get icon for each department
 */
function getDepartmentIcon(department: string): React.ReactNode {
  const icons: { [key: string]: React.ReactNode } = {
    'Engineering': <Code2 className="w-5 h-5" />,
    'Customer Service': <Headphones className="w-5 h-5" />,
    'Sales & CRM': <BarChart3 className="w-5 h-5" />,
    'Marketing': <Megaphone className="w-5 h-5" />,
    'Meeting Intelligence & Governance': <Video className="w-5 h-5" />,
    'Operations': <Settings className="w-5 h-5" />,
  };
  return icons[department] || <Settings className="w-5 h-5" />;
}

/**
 * Department ROI Card Component
 */
function DepartmentROICard({ dept }: { dept: DepartmentROI }) {
  return (
    <div className="p-6 bg-background-card/50 border border-tech-gray-700 rounded-lg hover:border-neon-green/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-tech-gray-100 mb-1 flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-neon-green/10 rounded-lg flex items-center justify-center text-neon-green">
              {getDepartmentIcon(dept.department)}
            </div>
            {dept.department}
          </h3>
          <div className="text-sm text-tech-gray-400">
            Payback em <span className="text-neon-green font-semibold">{dept.paybackMonths.toFixed(1)}</span> meses
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gradient-neon">
            {formatCurrency(dept.annualSavings)}
          </div>
          <div className="text-xs text-tech-gray-400">economia anual</div>
        </div>
      </div>

      {/* Investment vs Savings */}
      <div className="flex gap-4 mb-4 pb-4 border-b border-tech-gray-800">
        <div className="flex-1">
          <div className="text-xs text-tech-gray-500 mb-1">Investimento</div>
          <div className="text-sm font-semibold text-tech-gray-300">
            {formatCurrency(dept.investment)}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-tech-gray-500 mb-1">NPV 3 Anos</div>
          <div className="text-sm font-semibold text-neon-green">
            {formatCurrency(dept.threeYearNPV)}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-2">
        {dept.keyMetrics.map((metric, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
            <span className="text-tech-gray-300">{metric}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Enterprise ROI Section Component
 */
export default function EnterpriseROISection({ enterpriseROI, isMockData = false }: Props) {
  const enabledDepartments = [
    enterpriseROI.engineering,
    enterpriseROI.customerService,
    enterpriseROI.sales,
    enterpriseROI.marketing,
    enterpriseROI.meetingIntelligence,
    enterpriseROI.operations,
  ].filter((dept): dept is DepartmentROI => dept?.enabled === true);

  return (
    <div className="card-glow p-8 mb-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">
            <span className="text-tech-gray-100">ROI </span>
            <span className="text-gradient-neon">Enterprise-Wide</span>
          </h2>
          <DataQualityBadge isRealData={!isMockData} variant="compact" showTooltip={true} />
        </div>
        <p className="text-tech-gray-400 text-sm">
          Impacto estimado da transformação de IA em toda a organização
        </p>
      </div>

      {/* Mock Data Disclaimer */}
      {isMockData && (
        <div className="mb-6 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/40 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-amber-200 mb-2 flex items-center gap-2">
                Estimativas Baseadas em Perfil Genérico
              </h4>
              <div className="space-y-2 text-sm text-amber-100/90 mb-4">
                <p className="font-semibold">
                  Importante: Estes números são <strong className="text-amber-200">projeções aproximadas</strong> baseadas
                  apenas no porte da empresa e indústria.
                </p>
                <p>
                  <strong className="text-amber-200">Não use estes valores para decisões de investimento.</strong> Eles servem
                  apenas como referência inicial para entender a ordem de magnitude do impacto potencial.
                </p>
                <p>
                  Para análise precisa com seus números reais, veja os <strong className="text-neon-green">casos verificados
                  acima</strong> que mostram resultados comprovados de empresas similares.
                </p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded border border-amber-400/30">
                <p className="text-xs text-amber-100 font-semibold flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Recomendação: Use os casos reais verificados como referência principal. Complete o assessment
                    multi-departamental para obter cálculos personalizados baseados nos seus dados reais.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Total Enterprise Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-6 bg-gradient-to-br from-neon-green/10 via-cyan-500/5 to-neon-green/5 border border-neon-green/20 rounded-xl">
        <div className="text-center md:text-left">
          <div className="text-xs text-tech-gray-400 uppercase tracking-wider mb-2">
            Investimento Total
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gradient-neon">
            {formatCurrency(enterpriseROI.totalEnterprise.totalInvestment)}
          </div>
        </div>
        <div className="text-center md:text-left">
          <div className="text-xs text-tech-gray-400 uppercase tracking-wider mb-2">
            Economia Anual
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gradient-neon">
            {formatCurrency(enterpriseROI.totalEnterprise.totalAnnualSavings)}
          </div>
        </div>
        <div className="text-center md:text-left">
          <div className="text-xs text-tech-gray-400 uppercase tracking-wider mb-2">
            Payback Médio
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gradient-neon">
            {enterpriseROI.totalEnterprise.avgPaybackMonths.toFixed(1)}
            <span className="text-lg text-tech-gray-400 ml-1">meses</span>
          </div>
        </div>
        <div className="text-center md:text-left">
          <div className="text-xs text-tech-gray-400 uppercase tracking-wider mb-2">
            ROI Enterprise
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gradient-neon">
            {enterpriseROI.totalEnterprise.enterpriseIRR.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* NPV Highlight */}
      <div className="mb-8 p-4 bg-tech-gray-900/50 border border-tech-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-tech-gray-400 mb-1">
              NPV Consolidado (3 Anos)
            </div>
            <div className="text-3xl font-bold text-neon-green">
              {formatCurrency(enterpriseROI.totalEnterprise.totalThreeYearNPV)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-tech-gray-400 mb-1">
              Departamentos Avaliados
            </div>
            <div className="text-3xl font-bold text-tech-gray-100">
              {enabledDepartments.length}
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-tech-gray-100 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-neon-green rounded-full"></span>
          Detalhamento por Departamento
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {enabledDepartments.map((dept) => (
            <DepartmentROICard key={dept.department} dept={dept} />
          ))}
        </div>
      </div>
    </div>
  );
}
