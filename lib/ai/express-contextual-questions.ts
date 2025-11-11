/**
 * Contextual Questions for Express Mode - Phase 2
 *
 * Genera perguntas adaptativas baseadas no contexto do AI Router:
 * - Perguntas de quantificação
 * - Perguntas persona-específicas
 * - Follow-ups baseados em contexto
 */

import { UserPersona, DeepPartial, AssessmentData } from '../types';
import { QuestionTemplate } from './dynamic-questions';

/**
 * Get context-aware quantification questions based on AI Router data
 */
export function getQuantificationQuestions(
  persona: UserPersona,
  partialData: any
): QuestionTemplate[] {
  const questions: QuestionTemplate[] = [];

  // ============ QUANTIFY DEPLOY FREQUENCY ============
  // If user mentioned process issues, ask about deploys
  if (partialData?.bottlenecks || partialData?.cycleTime) {
    questions.push({
      id: 'deploy-frequency-quantify',
      text: 'Quantos deploys/releases vocês fazem por mês atualmente?',
      category: 'context',
      personas: ['engineering-tech', 'it-devops', 'product-business'],
      priority: 'important',
      inputType: 'single-choice',
      options: [
        { value: 'less-than-1', label: 'Menos de 1 por mês', description: 'Deploy trimestral ou raro' },
        { value: '1-2', label: '1-2 deploys por mês', description: 'Mensal ou bimestral' },
        { value: '3-4', label: 'Semanal (~4/mês)', description: 'Uma vez por semana' },
        { value: '8-20', label: 'Múltiplos por semana (8-20/mês)', description: '2-5x por semana' },
        { value: '30plus', label: 'Diário ou múltiplos por dia (30+/mês)', description: 'CI/CD contínuo' }
      ],
      dataExtractor: (answer, data) => {
        const deployMap: Record<string, string> = {
          'less-than-1': 'quarterly',
          '1-2': 'monthly',
          '3-4': 'weekly',
          '8-20': 'multiple-weekly',
          '30plus': 'daily'
        };
        const value = Array.isArray(answer) ? answer[0] : answer;
        return {
          currentState: {
            ...data.currentState,
            deploymentFrequency: deployMap[value] || 'monthly',
            // Store raw answer for more context
            customFields: {
              ...(data.currentState?.customFields || {}),
              deployFrequencyDetail: value
            }
          }
        };
      }
    });
  }

  // ============ QUANTIFY BOTTLENECK ============
  // If user mentioned bottlenecks, ask where specifically
  if (partialData?.bottlenecks?.length > 0) {
    questions.push({
      id: 'bottleneck-location-quantify',
      text: 'Onde está o maior gargalo no seu processo de desenvolvimento?',
      category: 'pain-points',
      personas: ['engineering-tech', 'it-devops'],
      priority: 'important',
      inputType: 'single-choice',
      options: [
        { value: 'code-review', label: 'Code review demora muito', description: 'PRs ficam dias sem review' },
        { value: 'manual-testing', label: 'Testes manuais demoram dias', description: 'QA manual extensivo' },
        { value: 'approvals', label: 'Aprovações/compliance travam fluxo', description: 'Burocracia excessiva' },
        { value: 'infra-deploy', label: 'Infraestrutura/deploy é complicado', description: 'Deploy manual e arriscado' },
        { value: 'requirements', label: 'Specs/requirements não ficam claros', description: 'Retrabalho frequente' },
        { value: 'bugs-production', label: 'Muitos bugs em produção', description: 'Firefighting constante' }
      ],
      dataExtractor: (answer, data) => {
        const value = Array.isArray(answer) ? answer[0] : answer;
        // Store as pain point
        const existing = data.currentState?.painPoints || [];
        return {
          currentState: {
            ...data.currentState,
            painPoints: [...existing, `Gargalo: ${value}`],
            customFields: {
              ...(data.currentState?.customFields || {}),
              mainBottleneck: value
            }
          }
        };
      }
    });
  }

  // ============ QUANTIFY MEASURABLE IMPACT ============
  // If user mentioned impact, ask for specifics
  if (partialData?.measurableImpact || partialData?.impactNumbers) {
    questions.push({
      id: 'impact-detail-quantify',
      text: 'Consegue estimar quanto tempo/dinheiro está sendo perdido com esse problema?',
      category: 'urgency',
      personas: ['board-executive', 'finance-ops', 'engineering-tech'],
      priority: 'important',
      inputType: 'single-choice',
      options: [
        { value: 'hours-week', label: '10-20 horas/semana de tempo perdido', description: '~R$20k-40k/ano em produtividade' },
        { value: 'hours-day', label: '50+ horas/semana de tempo perdido', description: '~R$100k+/ano em produtividade' },
        { value: 'revenue-delay', label: 'Atraso de 2-4 meses em lançamentos', description: 'Perda de oportunidade de receita' },
        { value: 'revenue-lost', label: 'Perda direta de receita/clientes', description: 'Churn ou competição' },
        { value: 'cost-extra', label: 'R$20k-50k/mês em custos extras', description: 'Overtime, terceiros, retrabalho' },
        { value: 'hard-to-quantify', label: 'Difícil quantificar mas sentimos impacto', description: 'Impacto qualitativo' }
      ],
      dataExtractor: (answer, data) => {
        const value = Array.isArray(answer) ? answer[0] : answer;
        return {
          goals: {
            ...data.goals,
            customFields: {
              ...(data.goals?.customFields || {}),
              quantifiedImpact: value
            }
          }
        };
      }
    });
  }

  // ============ QUANTIFY TEAM SKILLS ============
  // For technical personas, ask about team level
  if (['engineering-tech', 'it-devops'].includes(persona)) {
    questions.push({
      id: 'team-skills-quantify',
      text: 'Como você avalia o nível técnico médio do time?',
      category: 'context',
      personas: ['engineering-tech', 'it-devops'],
      priority: 'important',
      inputType: 'single-choice',
      options: [
        { value: 'mostly-junior', label: 'Maioria júnior - precisam de orientação', description: '<2 anos experiência média' },
        { value: 'mid-level', label: 'Mid-level - autônomos mas limitados', description: '2-5 anos experiência' },
        { value: 'mostly-senior', label: 'Maioria sênior - forte expertise', description: '5+ anos experiência' },
        { value: 'mixed-heavy-junior', label: 'Mix - poucos seniors, maioria junior', description: 'Pyramid invertido' },
        { value: 'high-turnover', label: 'Alta rotatividade - sempre treinando', description: 'Perda constante de conhecimento' }
      ],
      dataExtractor: (answer, data) => {
        const value = Array.isArray(answer) ? answer[0] : answer;

        // Map to seniority distribution
        const seniorityMap: Record<string, any> = {
          'mostly-junior': { junior: 6, mid: 2, senior: 1, lead: 1 },
          'mid-level': { junior: 3, mid: 4, senior: 2, lead: 1 },
          'mostly-senior': { junior: 1, mid: 2, senior: 5, lead: 2 },
          'mixed-heavy-junior': { junior: 7, mid: 2, senior: 1, lead: 0 },
          'high-turnover': { junior: 5, mid: 3, senior: 1, lead: 1 }
        };

        const seniority = seniorityMap[value] || { junior: 3, mid: 4, senior: 2, lead: 1 };

        return {
          currentState: {
            ...data.currentState,
            devSeniority: seniority,
            customFields: {
              ...(data.currentState?.customFields || {}),
              teamSkillsAssessment: value
            }
          }
        };
      }
    });
  }

  // ============ QUANTIFY AI USAGE ============
  // Ask about current AI adoption
  questions.push({
    id: 'ai-usage-detail-quantify',
    text: 'Alguém no time já usa ferramentas de AI hoje? Como?',
    category: 'context',
    personas: ['engineering-tech', 'it-devops', 'product-business'],
    priority: 'important',
    inputType: 'single-choice',
    options: [
      { value: 'copilot-widespread', label: 'Sim - GitHub Copilot amplamente adotado', description: '50%+ do time usa' },
      { value: 'informal-chatgpt', label: 'Alguns usam ChatGPT informalmente', description: 'Uso esporádico, não oficial' },
      { value: 'no-ai-tools', label: 'Não - não temos ferramentas de AI', description: 'Nenhuma adoção ainda' },
      { value: 'pilot-small', label: 'Piloto com 2-3 pessoas', description: 'Testando antes de escalar' },
      { value: 'blocked-compliance', label: 'Bloqueado por compliance/segurança', description: 'Interesse mas barreiras' }
    ],
    dataExtractor: (answer, data) => {
      const value = Array.isArray(answer) ? answer[0] : answer;

      // Map to AI usage stage
      const usageMap: Record<string, string> = {
        'copilot-widespread': 'production',
        'informal-chatgpt': 'exploring',
        'no-ai-tools': 'none',
        'pilot-small': 'piloting',
        'blocked-compliance': 'exploring'
      };

      return {
        currentState: {
          ...data.currentState,
          aiToolsUsage: usageMap[value] || 'none',
          customFields: {
            ...(data.currentState?.customFields || {}),
            aiUsageDetail: value
          }
        }
      };
    }
  });

  return questions;
}

/**
 * Get persona-specific deep-dive questions
 */
export function getPersonaSpecificQuestions(
  persona: UserPersona,
  partialData: any
): QuestionTemplate[] {
  const questions: QuestionTemplate[] = [];

  // ============ FOR ENGINEERING/TECH ============
  if (persona === 'engineering-tech' || persona === 'it-devops') {
    questions.push({
      id: 'tech-stack-maturity',
      text: 'Quais ferramentas de desenvolvimento e automação vocês usam hoje?',
      category: 'context',
      personas: ['engineering-tech', 'it-devops'],
      priority: 'important',
      inputType: 'single-choice',
      options: [
        { value: 'full-stack', label: 'Stack completo: CI/CD, monitoring, etc', description: 'DevOps maduro' },
        { value: 'basic-cicd', label: 'GitHub/GitLab + CI/CD básico', description: 'Automação parcial' },
        { value: 'git-only', label: 'Só Git - sem automação', description: 'Processos manuais' },
        { value: 'legacy-tools', label: 'Ferramentas legadas/antigas', description: 'Tecnologia desatualizada' },
        { value: 'fragmented', label: 'Mix de ferramentas sem integração', description: 'Falta de padronização' }
      ],
      dataExtractor: (answer, data) => {
        const value = Array.isArray(answer) ? answer[0] : answer;
        const tools = value === 'full-stack' ? ['GitHub', 'CI/CD', 'Docker', 'Kubernetes', 'Monitoring'] :
                      value === 'basic-cicd' ? ['GitHub', 'CI/CD'] :
                      value === 'git-only' ? ['Git'] :
                      ['Legacy Tools'];

        return {
          currentState: {
            ...data.currentState,
            currentTools: tools,
            customFields: {
              ...(data.currentState?.customFields || {}),
              techStackMaturity: value
            }
          }
        };
      }
    });
  }

  // ============ FOR EXECUTIVES/FINANCE ============
  if (persona === 'board-executive' || persona === 'finance-ops') {
    questions.push({
      id: 'executive-timeline-pressure',
      text: 'Há alguma pressão de timeline específica? (Board, competição, meta fiscal)',
      category: 'urgency',
      personas: ['board-executive', 'finance-ops'],
      priority: 'important',
      inputType: 'single-choice',
      options: [
        { value: 'board-deadline', label: 'Sim - decisão/apresentação de Board próxima', description: '30-60 dias' },
        { value: 'fiscal-target', label: 'Sim - meta fiscal/trimestre precisa bater', description: 'Q1, Q2, etc' },
        { value: 'competitor-threat', label: 'Sim - competidor está ganhando terreno', description: 'Risco competitivo' },
        { value: 'moderate-timeline', label: 'Moderada - queremos ver progresso em 6m', description: 'Timeline normal' },
        { value: 'no-hard-deadline', label: 'Não - explorando sem deadline rígido', description: 'Planejamento' }
      ],
      dataExtractor: (answer, data) => {
        const value = Array.isArray(answer) ? answer[0] : answer;

        // Map to timeline
        const timelineMap: Record<string, string> = {
          'board-deadline': '1-3-months',
          'fiscal-target': '3-6-months',
          'competitor-threat': '1-3-months',
          'moderate-timeline': '6-months',
          'no-hard-deadline': '12-months'
        };

        return {
          goals: {
            ...data.goals,
            timeline: timelineMap[value] || '6-months',
            customFields: {
              ...(data.goals?.customFields || {}),
              timelinePressure: value
            }
          }
        };
      }
    });
  }

  // ============ FOR PRODUCT/BUSINESS ============
  if (persona === 'product-business') {
    questions.push({
      id: 'product-kpi-focus',
      text: 'Qual métrica de produto você mais precisa melhorar?',
      category: 'goals',
      personas: ['product-business'],
      priority: 'important',
      inputType: 'single-choice',
      options: [
        { value: 'conversion', label: 'Taxa de conversão', description: 'Funil de vendas, ativação' },
        { value: 'retention', label: 'Retenção / Churn', description: 'Manter clientes ativos' },
        { value: 'engagement', label: 'Engajamento / DAU/MAU', description: 'Uso ativo do produto' },
        { value: 'time-to-value', label: 'Time-to-value para usuários', description: 'Onboarding mais rápido' },
        { value: 'nps', label: 'NPS / Satisfação', description: 'Experiência do usuário' }
      ],
      dataExtractor: (answer, data) => {
        const value = Array.isArray(answer) ? answer[0] : answer;
        return {
          goals: {
            ...data.goals,
            primaryGoals: [...(data.goals?.primaryGoals || []), `Melhorar: ${value}`],
            customFields: {
              ...(data.goals?.customFields || {}),
              productKPIFocus: value
            }
          }
        };
      }
    });
  }

  return questions;
}

/**
 * Main function: get all contextual questions for Express Mode
 */
export function getAllContextualQuestions(
  persona: UserPersona,
  partialData: any
): QuestionTemplate[] {
  return [
    ...getQuantificationQuestions(persona, partialData),
    ...getPersonaSpecificQuestions(persona, partialData)
  ];
}
