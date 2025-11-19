/**
 * Business Health Quiz - Area Relationships Matrix
 *
 * Define como diferentes áreas de negócio se relacionam:
 * - Upstream: Áreas que influenciam esta área
 * - Downstream: Áreas influenciadas por esta área
 * - Critical: Áreas que têm dependência crítica mútua
 *
 * Usado para selecionar inteligentemente perguntas de Risk Scan
 */

import { BusinessArea } from './types';

// ============================================================================
// RELATIONSHIPS MATRIX
// ============================================================================

export interface AreaRelationships {
  upstream: BusinessArea[];      // Áreas que influenciam
  downstream: BusinessArea[];    // Áreas influenciadas
  critical: BusinessArea[];      // Dependências críticas bidirecionais
}

/**
 * Matriz completa de relacionamentos entre áreas
 */
export const AREA_RELATIONSHIPS: Record<BusinessArea, AreaRelationships> = {
  // ===========================================================================
  // MARKETING & GROWTH
  // ===========================================================================
  'marketing-growth': {
    upstream: [
      'product',           // Produto precisa estar pronto para crescer
      'financial',         // Budget define capacidade de investir em marketing
    ],
    downstream: [
      'sales-commercial',  // Marketing gera leads para vendas
      'product',           // Feedback de usuários influencia produto
    ],
    critical: [
      'sales-commercial',  // CAC/LTV são métricas compartilhadas críticas
    ],
  },

  // ===========================================================================
  // SALES & COMMERCIAL
  // ===========================================================================
  'sales-commercial': {
    upstream: [
      'marketing-growth',  // Depende de leads gerados por marketing
      'product',           // Precisa de produto vendável
      'operations-logistics', // Precisa de fulfillment funcional
    ],
    downstream: [
      'financial',         // Receita gerada impacta financeiro
      'product',           // Feedback de vendas influencia roadmap
    ],
    critical: [
      'marketing-growth',  // CAC/LTV compartilhados
      'operations-logistics', // Entrega é parte da promessa de vendas
    ],
  },

  // ===========================================================================
  // PRODUCT
  // ===========================================================================
  'product': {
    upstream: [
      'technology-data',   // Tech stack e qualidade influenciam velocidade
      'people-culture',    // Time de produto depende de talentos
    ],
    downstream: [
      'marketing-growth',  // Produto define o que pode ser vendido
      'sales-commercial',  // Features afetam conversão
      'operations-logistics', // Produto define complexidade operacional
    ],
    critical: [
      'technology-data',   // Tech debt afeta diretamente velocidade de produto
    ],
  },

  // ===========================================================================
  // OPERATIONS & LOGISTICS
  // ===========================================================================
  'operations-logistics': {
    upstream: [
      'product',           // Produto define o que precisa ser operado
      'technology-data',   // Automação depende de tech
      'people-culture',    // Operações dependem de time treinado
    ],
    downstream: [
      'sales-commercial',  // Qualidade operacional afeta churn
      'financial',         // Eficiência operacional afeta margem
    ],
    critical: [
      'sales-commercial',  // Fulfillment é parte da experiência do cliente
      'technology-data',   // Automação é crítica para escalar
    ],
  },

  // ===========================================================================
  // FINANCIAL
  // ===========================================================================
  'financial': {
    upstream: [
      'sales-commercial',  // Receita é principal input
      'operations-logistics', // Custos operacionais impactam margem
      'people-culture',    // Payroll é maior custo
    ],
    downstream: [
      'marketing-growth',  // Budget define capacidade de investir
      'people-culture',    // Define capacidade de contratar
      'technology-data',   // Define orçamento para tech
    ],
    critical: [
      'sales-commercial',  // Receita vs custos define viabilidade
    ],
  },

  // ===========================================================================
  // PEOPLE & CULTURE
  // ===========================================================================
  'people-culture': {
    upstream: [
      'financial',         // Budget define capacidade de contratar
    ],
    downstream: [
      'product',           // Talentos definem capacidade de execução
      'operations-logistics', // Time operacional define qualidade
      'technology-data',   // Devs definem qualidade técnica
      'sales-commercial',  // Time de vendas define conversão
    ],
    critical: [
      'financial',         // Payroll vs receita é crítico
      'product',           // Turnover de produto afeta roadmap
    ],
  },

  // ===========================================================================
  // TECHNOLOGY & DATA
  // ===========================================================================
  'technology-data': {
    upstream: [
      'people-culture',    // Devs definem qualidade técnica
      'financial',         // Budget define investimento em tech
    ],
    downstream: [
      'product',           // Tech debt afeta velocidade
      'operations-logistics', // Automação depende de tech
      'sales-commercial',  // CRM e ferramentas de vendas
    ],
    critical: [
      'product',           // Tech debt é gargalo crítico de produto
      'operations-logistics', // Automação é crítica para escalar operações
    ],
  },
};

// ============================================================================
// RELATIONSHIP QUERIES
// ============================================================================

/**
 * Retorna áreas que influenciam a área especificada
 */
export function getUpstreamAreas(area: BusinessArea): BusinessArea[] {
  return AREA_RELATIONSHIPS[area].upstream;
}

/**
 * Retorna áreas influenciadas pela área especificada
 */
export function getDownstreamAreas(area: BusinessArea): BusinessArea[] {
  return AREA_RELATIONSHIPS[area].downstream;
}

/**
 * Retorna áreas com dependência crítica bidirecional
 */
export function getCriticalAreas(area: BusinessArea): BusinessArea[] {
  return AREA_RELATIONSHIPS[area].critical;
}

/**
 * Retorna todas as áreas relacionadas (upstream + downstream + critical, sem duplicatas)
 */
export function getAllRelatedAreas(area: BusinessArea): BusinessArea[] {
  const { upstream, downstream, critical } = AREA_RELATIONSHIPS[area];
  const all = [...upstream, ...downstream, ...critical];

  // Remove duplicatas
  return Array.from(new Set(all));
}

/**
 * Calcula score de relacionamento entre duas áreas (0-1)
 * Usado para priorizar perguntas de risk scan
 */
export function calculateRelationshipScore(
  areaA: BusinessArea,
  areaB: BusinessArea
): number {
  if (areaA === areaB) {
    return 0; // Mesma área, sem relacionamento
  }

  const relationshipsA = AREA_RELATIONSHIPS[areaA];

  // Critical = 1.0
  if (relationshipsA.critical.includes(areaB)) {
    return 1.0;
  }

  // Upstream = 0.7 (área B influencia área A)
  if (relationshipsA.upstream.includes(areaB)) {
    return 0.7;
  }

  // Downstream = 0.6 (área A influencia área B)
  if (relationshipsA.downstream.includes(areaB)) {
    return 0.6;
  }

  // Sem relacionamento direto = 0.3 (ainda pode ser relevante)
  return 0.3;
}

/**
 * Sugere áreas para risk scan baseado na área de expertise detectada
 * Retorna áreas ordenadas por prioridade (críticas primeiro)
 */
export function suggestRiskScanAreas(
  expertiseArea: BusinessArea,
  maxAreas: number = 3
): BusinessArea[] {
  const { upstream, downstream, critical } = AREA_RELATIONSHIPS[expertiseArea];

  // Prioridade: critical > upstream > downstream
  const prioritized: BusinessArea[] = [
    ...critical,
    ...upstream.filter((a) => !critical.includes(a)),
    ...downstream.filter((a) => !critical.includes(a) && !upstream.includes(a)),
  ];

  // Adicionar áreas não relacionadas (baixa prioridade)
  const allAreas: BusinessArea[] = [
    'marketing-growth',
    'sales-commercial',
    'product',
    'operations-logistics',
    'financial',
    'people-culture',
    'technology-data',
  ];

  const remaining = allAreas.filter(
    (a) => a !== expertiseArea && !prioritized.includes(a)
  );

  const result = [...prioritized, ...remaining];

  return result.slice(0, maxAreas);
}

/**
 * Verifica se duas áreas têm relação crítica bidirecional
 */
export function isCriticalRelationship(
  areaA: BusinessArea,
  areaB: BusinessArea
): boolean {
  return (
    AREA_RELATIONSHIPS[areaA].critical.includes(areaB) ||
    AREA_RELATIONSHIPS[areaB].critical.includes(areaA)
  );
}

/**
 * Calcula "distância" entre duas áreas (0 = crítico, 1 = direto, 2 = indireto, 3+ = sem relação)
 */
export function calculateAreaDistance(
  areaA: BusinessArea,
  areaB: BusinessArea
): number {
  if (areaA === areaB) {
    return 0;
  }

  const relationshipsA = AREA_RELATIONSHIPS[areaA];

  // Distância 0: Relacionamento crítico
  if (relationshipsA.critical.includes(areaB)) {
    return 0;
  }

  // Distância 1: Relacionamento direto (upstream ou downstream)
  if (
    relationshipsA.upstream.includes(areaB) ||
    relationshipsA.downstream.includes(areaB)
  ) {
    return 1;
  }

  // Distância 2: Relacionamento indireto (através de área intermediária)
  const allRelated = getAllRelatedAreas(areaA);
  for (const intermediateArea of allRelated) {
    const relationshipsIntermediate = AREA_RELATIONSHIPS[intermediateArea];
    if (
      relationshipsIntermediate.upstream.includes(areaB) ||
      relationshipsIntermediate.downstream.includes(areaB) ||
      relationshipsIntermediate.critical.includes(areaB)
    ) {
      return 2;
    }
  }

  // Distância 3+: Sem relacionamento significativo
  return 3;
}

// ============================================================================
// AREA METADATA
// ============================================================================

export interface AreaMetadata {
  name: string;
  icon: string;
  description: string;
  keyMetrics: string[];
}

export const AREA_METADATA: Record<BusinessArea, AreaMetadata> = {
  'marketing-growth': {
    name: 'Marketing & Growth',
    icon: '📈',
    description: 'Aquisição, ativação e retenção de usuários',
    keyMetrics: ['CAC', 'LTV', 'Conversion Rate', 'Activation Rate'],
  },

  'sales-commercial': {
    name: 'Sales & Commercial',
    icon: '💼',
    description: 'Processo de vendas e sucesso do cliente',
    keyMetrics: ['Win Rate', 'Sales Cycle', 'Avg Ticket', 'Churn Rate'],
  },

  'product': {
    name: 'Product',
    icon: '🎯',
    description: 'Desenvolvimento e evolução do produto',
    keyMetrics: ['Development Cycle', 'PMF Score', 'Feature Adoption', 'User Feedback'],
  },

  'operations-logistics': {
    name: 'Operations & Logistics',
    icon: '⚙️',
    description: 'Execução operacional e entrega',
    keyMetrics: ['Fulfillment Time', 'Error Rate', 'Automation Level', 'Process Efficiency'],
  },

  'financial': {
    name: 'Financial',
    icon: '💰',
    description: 'Saúde financeira e planejamento',
    keyMetrics: ['Runway', 'Burn Rate', 'Profit Margin', 'Revenue Growth'],
  },

  'people-culture': {
    name: 'People & Culture',
    icon: '👥',
    description: 'Time, cultura e talentos',
    keyMetrics: ['Turnover Rate', 'Onboarding Time', 'Employee NPS', 'Growth Rate'],
  },

  'technology-data': {
    name: 'Technology & Data',
    icon: '💻',
    description: 'Infraestrutura técnica e dados',
    keyMetrics: ['CI/CD', 'Test Coverage', 'Incident Frequency', 'Tech Debt'],
  },
};

/**
 * Retorna metadata de uma área
 */
export function getAreaMetadata(area: BusinessArea): AreaMetadata {
  return AREA_METADATA[area];
}

/**
 * Retorna todas as áreas ordenadas por criticidade para uma área específica
 */
export function getAreasOrderedByCriticality(
  expertiseArea: BusinessArea
): { area: BusinessArea; score: number; relationship: string }[] {
  const allAreas: BusinessArea[] = [
    'marketing-growth',
    'sales-commercial',
    'product',
    'operations-logistics',
    'financial',
    'people-culture',
    'technology-data',
  ];

  const scored = allAreas
    .filter((a) => a !== expertiseArea)
    .map((area) => {
      const score = calculateRelationshipScore(expertiseArea, area);
      let relationship = 'unrelated';

      if (score === 1.0) relationship = 'critical';
      else if (score === 0.7) relationship = 'upstream';
      else if (score === 0.6) relationship = 'downstream';

      return { area, score, relationship };
    });

  // Ordenar por score decrescente
  scored.sort((a, b) => b.score - a.score);

  return scored;
}
