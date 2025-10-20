/**
 * Specialist Selector Component
 *
 * Allows users to choose which AI specialist(s) to consult with
 */

'use client';

import { SPECIALISTS, SpecialistType, Specialist } from '@/lib/prompts/specialist-prompts';
import { Check } from 'lucide-react';

interface SpecialistSelectorProps {
  selectedSpecialists: SpecialistType[];
  onToggle: (specialist: SpecialistType) => void;
  recommendedSpecialist?: SpecialistType;
  mode: 'single' | 'multiple';
}

export default function SpecialistSelector({
  selectedSpecialists,
  onToggle,
  recommendedSpecialist,
  mode = 'multiple'
}: SpecialistSelectorProps) {

  const specialists = Object.values(SPECIALISTS);

  return (
    <div className="space-y-4">
      <div className="text-sm text-tech-gray-400 mb-4">
        {mode === 'single' ? (
          <>Escolha <strong className="text-white">um especialista</strong> para consultar:</>
        ) : (
          <>Escolha <strong className="text-white">um ou mais especialistas</strong> para consultar (múltiplas perspectivas):</>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {specialists.map((specialist) => {
          const isSelected = selectedSpecialists.includes(specialist.id);
          const isRecommended = specialist.id === recommendedSpecialist;

          return (
            <button
              key={specialist.id}
              onClick={() => onToggle(specialist.id)}
              className={`text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? `${specialist.borderColor} ${specialist.bgColor}`
                  : 'border-tech-gray-800 hover:border-tech-gray-700 bg-tech-gray-900/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox/Radio */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? `${specialist.borderColor} ${specialist.bgColor}`
                      : 'border-tech-gray-700 bg-tech-gray-900'
                  }`}>
                    {isSelected && <Check className={`w-4 h-4 ${specialist.color}`} />}
                  </div>
                </div>

                {/* Icon */}
                <div className="flex-shrink-0 text-4xl">
                  {specialist.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold ${isSelected ? specialist.color : 'text-white'}`}>
                      {specialist.name}
                    </h3>
                    {isRecommended && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30">
                        Recomendado
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-tech-gray-300 mb-2">
                    {specialist.title}
                  </p>

                  <p className="text-sm text-tech-gray-400 mb-3">
                    {specialist.description}
                  </p>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2">
                    {specialist.expertise.slice(0, 3).map((exp, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-1 rounded-full ${
                          isSelected
                            ? `${specialist.bgColor} ${specialist.color}`
                            : 'bg-tech-gray-800 text-tech-gray-400'
                        }`}
                      >
                        {exp}
                      </span>
                    ))}
                    {specialist.expertise.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-tech-gray-800 text-tech-gray-500">
                        +{specialist.expertise.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Example Questions (collapsed by default) */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-tech-gray-800">
                      <p className="text-xs font-semibold text-tech-gray-400 mb-2 uppercase tracking-wide">
                        Exemplos de Perguntas:
                      </p>
                      <ul className="space-y-1">
                        {specialist.exampleQuestions.slice(0, 2).map((q, idx) => (
                          <li key={idx} className="text-xs text-tech-gray-500 flex items-start gap-2">
                            <span className={`${specialist.color} mt-0.5`}>•</span>
                            <span>"{q}"</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {selectedSpecialists.length > 0 && (
        <div className="mt-6 p-4 bg-tech-gray-900/50 border border-tech-gray-800 rounded-lg">
          <p className="text-sm text-tech-gray-300">
            {mode === 'single' ? (
              <>
                <strong className="text-white">{selectedSpecialists.length}</strong> especialista selecionado
              </>
            ) : (
              <>
                <strong className="text-white">{selectedSpecialists.length}</strong> especialista{selectedSpecialists.length !== 1 ? 's' : ''} selecionado{selectedSpecialists.length !== 1 ? 's' : ''} •
                Cada um fará 3-5 perguntas da sua área
              </>
            )}
          </p>
          {mode === 'multiple' && selectedSpecialists.length > 1 && (
            <p className="text-xs text-tech-gray-500 mt-1">
              💡 Múltiplas perspectivas geram análise mais completa, mas levam mais tempo
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact specialist badge for display
 */
export function SpecialistBadge({ specialistType }: { specialistType: SpecialistType }) {
  const specialist = SPECIALISTS[specialistType];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${specialist.bgColor} border ${specialist.borderColor}`}>
      <span className="text-sm">{specialist.icon}</span>
      <span className={`text-xs font-semibold ${specialist.color}`}>
        {specialist.name}
      </span>
    </div>
  );
}

/**
 * Specialist indicator for messages
 */
export function SpecialistIndicator({ specialistType }: { specialistType: SpecialistType }) {
  const specialist = SPECIALISTS[specialistType];

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{specialist.icon}</span>
      <div className="flex-1">
        <div className={`text-xs font-bold ${specialist.color}`}>
          {specialist.name}
        </div>
        <div className="text-xs text-tech-gray-500">
          {specialist.title}
        </div>
      </div>
    </div>
  );
}
