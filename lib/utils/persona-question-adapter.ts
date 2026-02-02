/**
 * Persona Question Adapter
 *
 * Translates technical questions to business/product language
 * based on user persona (product-business, board-executive, etc.)
 */

import type { UserPersona } from '@/lib/types';

/**
 * Determines if persona requires non-technical language
 */
export function requiresNonTechnicalLanguage(persona: UserPersona): boolean {
  return persona === 'product-business' || persona === 'board-executive';
}

/**
 * Translation rules for technical → business language
 */
const technicalToBusinessTranslations: Record<string, string> = {
  // Team references
  'equipe de desenvolvimento': 'time',
  'desenvolvedores': 'pessoas do time',
  'devs': 'membros da equipe',
  'seu time': 'sua equipe',

  // Technical terms
  'desafio técnico': 'principal desafio',
  'code review': 'revisão de código',
  'pull requests': 'mudanças de código',
  'linguagem/framework': 'tecnologias principais',
  'tech stack': 'stack tecnológico',
  'bugs críticos': 'problemas críticos',
  'produção': 'ambiente final',

  // Process terms
  'código pronto': 'funcionalidade pronta',
  'deploy': 'publicação',
  'releases': 'lançamentos',
  'CI/CD': 'automação de deploy',
  'pipeline': 'processo automatizado',

  // Quality terms
  'dívida técnica': 'problemas acumulados no código',
  'refactoring': 'melhoria de código',
  'cobertura de testes': 'testes automatizados',
  'onboarding de devs': 'integração de novos membros',

  // Metrics
  'cycle time': 'tempo de entrega',
  'velocidade de desenvolvimento': 'velocidade de entrega'
};

/**
 * Adapts a question text from technical to business language
 */
export function adaptQuestionToPersona(
  questionText: string,
  persona: UserPersona
): string {
  // If persona doesn't need adaptation, return original
  if (!requiresNonTechnicalLanguage(persona)) {
    return questionText;
  }

  let adaptedText = questionText;

  // Apply all translations
  for (const [technical, business] of Object.entries(technicalToBusinessTranslations)) {
    const regex = new RegExp(technical, 'gi');
    adaptedText = adaptedText.replace(regex, business);
  }

  return adaptedText;
}

/**
 * Adapts option labels from technical to business language
 */
export function adaptOptionLabel(
  label: string,
  persona: UserPersona
): string {
  if (!requiresNonTechnicalLanguage(persona)) {
    return label;
  }

  let adaptedLabel = label;

  // Apply translations
  for (const [technical, business] of Object.entries(technicalToBusinessTranslations)) {
    const regex = new RegExp(technical, 'gi');
    adaptedLabel = adaptedLabel.replace(regex, business);
  }

  return adaptedLabel;
}

/**
 * Adapts option description from technical to business language
 */
export function adaptOptionDescription(
  description: string | undefined,
  persona: UserPersona
): string | undefined {
  if (!description || !requiresNonTechnicalLanguage(persona)) {
    return description;
  }

  let adaptedDescription = description;

  // Apply translations
  for (const [technical, business] of Object.entries(technicalToBusinessTranslations)) {
    const regex = new RegExp(technical, 'gi');
    adaptedDescription = adaptedDescription.replace(regex, business);
  }

  return adaptedDescription;
}

/**
 * Adapts placeholder text from technical to business language
 */
export function adaptPlaceholder(
  placeholder: string | undefined,
  persona: UserPersona
): string | undefined {
  if (!placeholder || !requiresNonTechnicalLanguage(persona)) {
    return placeholder;
  }

  let adaptedPlaceholder = placeholder;

  // Apply translations
  for (const [technical, business] of Object.entries(technicalToBusinessTranslations)) {
    const regex = new RegExp(technical, 'gi');
    adaptedPlaceholder = adaptedPlaceholder.replace(regex, business);
  }

  return adaptedPlaceholder;
}

/**
 * Full question adaptation including all text fields
 */
export function adaptFullQuestion(
  question: {
    text: string;
    options?: Array<{
      value: string;
      label: string;
      description?: string;
    }>;
    placeholder?: string;
  },
  persona: UserPersona
): typeof question {
  return {
    ...question,
    text: adaptQuestionToPersona(question.text, persona),
    options: question.options?.map(opt => ({
      ...opt,
      label: adaptOptionLabel(opt.label, persona),
      description: adaptOptionDescription(opt.description, persona)
    })),
    placeholder: adaptPlaceholder(question.placeholder, persona)
  };
}
