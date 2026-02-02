/**
 * Step -2: Expertise Detection
 *
 * FIRST QUESTION of the assessment - detects user's areas of knowledge
 * to adapt ALL subsequent questions accordingly.
 *
 * This is the foundation of "Regenerative Intelligence" - the system
 * learns what you know BEFORE asking questions, not after.
 */

'use client';

import { useState } from 'react';
import { Check, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export interface ExpertiseArea {
  id: string;
  label: string;
  description: string;
}

export const EXPERTISE_AREAS: ExpertiseArea[] = [
  {
    id: 'strategy-business',
    label: 'Estratégia e Negócios',
    description: 'Visão de mercado, competitividade'
  },
  {
    id: 'engineering-tech',
    label: 'Tecnologia e Engenharia',
    description: 'Arquitetura, DevOps, desenvolvimento'
  },
  {
    id: 'product-ux',
    label: 'Produto e UX',
    description: 'Experiência do usuário, roadmap'
  },
  {
    id: 'finance-ops',
    label: 'Finanças e Operações',
    description: 'ROI, custos, orçamento'
  },
  {
    id: 'marketing-sales',
    label: 'Marketing e Vendas',
    description: 'Go-to-market, crescimento'
  },
  {
    id: 'people-hr',
    label: 'Recursos Humanos',
    description: 'Cultura, talentos, engajamento'
  },
];

interface Props {
  selected: string[];
  onUpdate: (expertise: string[]) => void;
  onNext: () => void;
}

export default function StepExpertiseDetection({ selected, onUpdate, onNext }: Props) {
  const [userExpertise, setUserExpertise] = useState<string[]>(selected);

  const toggleExpertise = (areaId: string) => {
    const updated = userExpertise.includes(areaId)
      ? userExpertise.filter(a => a !== areaId)
      : [...userExpertise, areaId];

    setUserExpertise(updated);
    onUpdate(updated);
  };

  const isValid = () => userExpertise.length > 0;

  return (
    <div className="card-professional p-8 animate-slide-up">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-tech-gray-500">Passo 1 de 8</span>
          <span className="text-xs text-tech-gray-500">12.5%</span>
        </div>
        <div className="w-full bg-tech-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-neon-cyan to-neon-blue h-full rounded-full transition-all duration-300 shadow-glow-cyan"
            style={{ width: '12.5%' }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center flex-shrink-0 shadow-glow-cyan">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-tech-gray-100 mb-2 font-display">
            Suas Áreas de Conhecimento
          </h2>
          <p className="text-tech-gray-400">
            Antes de começar, nos conte: <strong className="text-white">em quais áreas você tem conhecimento?</strong>
          </p>
          <p className="text-sm text-tech-gray-500 mt-2">
            Isso nos ajuda a fazer as perguntas certas para você. Selecione todas que se aplicam.
          </p>
        </div>
      </div>

      {/* Expertise Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {EXPERTISE_AREAS.map((area) => (
          <label
            key={area.id}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              userExpertise.includes(area.id)
                ? 'border-neon-cyan bg-neon-cyan/10 shadow-glow-cyan scale-[1.02]'
                : 'border-tech-gray-800 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 hover:scale-[1.01] hover:shadow-lg'
            }`}
          >
            <input
              type="checkbox"
              checked={userExpertise.includes(area.id)}
              onChange={() => toggleExpertise(area.id)}
              className="mt-1 w-5 h-5 accent-neon-cyan cursor-pointer"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{area.label}</div>
              <div className="text-xs text-tech-gray-400 mt-1">{area.description}</div>
            </div>
          </label>
        ))}
      </div>

      {/* Why This Matters */}
      <div className="mb-8 p-4 bg-gradient-to-r from-neon-cyan/10 to-neon-blue/10 border-2 border-neon-cyan/40 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="relative">
              <Check className="w-5 h-5 text-neon-cyan" />
              <div className="absolute inset-0 blur-md bg-neon-cyan opacity-50"></div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-neon-cyan mb-1">
              💡 Por que isso importa
            </p>
            <p className="text-xs text-tech-gray-300 leading-relaxed">
              Se você <strong>não tiver</strong> conhecimento técnico, faremos perguntas sobre <strong>impacto de negócio</strong> ao invés de métricas técnicas.
              Se você <strong>não tiver</strong> acesso a finanças, perguntaremos sobre <strong>prioridades</strong> ao invés de orçamentos específicos.
              Isso garante que você possa responder com confiança e gerar insights precisos.
            </p>
          </div>
        </div>
      </div>

      {/* Selected Count */}
      {userExpertise.length > 0 && (
        <div className="mb-6 text-center">
          <p className="text-sm text-tech-gray-400">
            ✅ {userExpertise.length} {userExpertise.length === 1 ? 'área selecionada' : 'áreas selecionadas'}
          </p>
        </div>
      )}

      {/* Alert: No areas selected */}
      {!isValid() && (
        <div className="mb-4 p-4 bg-orange-500/10 border-2 border-orange-500/30 rounded-lg animate-pulse">
          <div className="flex items-center gap-3 text-orange-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              👆 Selecione ao menos uma área de conhecimento para continuar
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid()}
          className={`btn-primary ${
            !isValid() && 'opacity-50 cursor-not-allowed'
          }`}
        >
          <span className="flex items-center gap-2">
            Começar Assessment
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
