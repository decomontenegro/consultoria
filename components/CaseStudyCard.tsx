import { CaseStudy } from '@/lib/types';

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  onClick?: () => void;
}

export default function CaseStudyCard({ caseStudy, onClick }: CaseStudyCardProps) {
  const keyResults = Object.values(caseStudy.results).slice(0, 2); // Show first 2 results

  return (
    <div
      className="card-glow p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-tech-gray-100 group-hover:text-neon-green transition-colors">
              {caseStudy.company}
            </h3>
            {caseStudy.verified && (
              <span className="text-neon-green text-sm" title="Verified Case Study">
                ✓
              </span>
            )}
          </div>
          <p className="text-sm text-tech-gray-400">
            {caseStudy.industry} • {caseStudy.country}
          </p>
        </div>

        {caseStudy.regional && (
          <span className="badge-neon text-xs">
            🇧🇷 Brasil
          </span>
        )}
      </div>

      {/* Area & Tool */}
      <div className="mb-4 p-3 bg-background-card/50 rounded-lg border border-tech-gray-800">
        <div className="text-xs text-tech-gray-500 mb-1">Área de Implementação</div>
        <div className="text-sm font-medium text-tech-gray-200">{caseStudy.area}</div>
        <div className="text-xs text-neon-cyan mt-1">{caseStudy.tool}</div>
      </div>

      {/* Key Results */}
      <div className="space-y-3 mb-4">
        {keyResults.map((result, idx) => (
          <div key={idx} className="border-l-2 border-neon-green pl-3">
            <div className="text-xs text-tech-gray-500">{result.metric}</div>
            <div className="text-lg font-bold text-gradient-neon">
              {result.improvement}
            </div>
          </div>
        ))}
      </div>

      {/* ROI */}
      <div className="flex items-center justify-between text-xs pt-3 border-t border-tech-gray-800">
        <div>
          <span className="text-tech-gray-500">Payback: </span>
          <span className="text-neon-cyan font-semibold">{caseStudy.roi.paybackPeriod}</span>
        </div>
        <a
          href={caseStudy.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon-green hover:text-neon-cyan transition-colors flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <span>Ver fonte</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
