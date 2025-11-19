/**
 * Insights Engine - PhD Virtual Consultant Final Analysis
 *
 * Purpose: Analyze completed assessment and generate deep insights that
 * humans might miss. Uses Claude API to detect patterns, root causes,
 * financial impact, and strategic recommendations.
 *
 * Cost: ~R$ 0.60 per analysis (~6000 tokens)
 * When: Run conditionally (high-value leads only)
 */

import Anthropic from '@anthropic-ai/sdk';
import { AssessmentData } from '../types';

// ============================================
// TYPES
// ============================================

export interface DeepInsights {
  // Padrões detectados
  patterns: {
    type: 'tech-debt-spiral' | 'velocity-crisis' | 'quality-crisis' | 'people-crisis' | 'market-pressure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence: string[];
  }[];

  // Root causes (causas raiz, não sintomas)
  rootCauses: {
    primary: string;
    secondary: string[];
    reasoning: string;
  };

  // Impacto financeiro calculado
  financialImpact: {
    directCostMonthly: number; // R$ por mês em produtividade perdida
    opportunityCostAnnual: number; // R$ ARR perdido / oportunidades
    totalAnnualImpact: number; // Soma total
    confidence: number; // 0-1
    breakdown: string; // Explicação do cálculo
  };

  // Urgência vs budget analysis
  urgencyAnalysis: {
    timelinePressure: string; // "Board deadline Q2", "Competitor threat"
    budgetAdequacy: 'under-budgeted' | 'adequate' | 'over-budgeted';
    roi: number; // ROI múltiplo (ex: 4.2x)
    recommendation: string;
  };

  // Recomendações estratégicas (ordenadas por prioridade)
  recommendations: {
    priority: number; // 1, 2, 3...
    action: string; // O que fazer
    reasoning: string; // Por que
    impact: 'low' | 'medium' | 'high';
    estimatedCost: string; // "R$100k-200k"
    timeframe: string; // "1-2 meses", "6 meses"
  }[];

  // Red flags críticos
  redFlags: {
    flag: string;
    severity: 'warning' | 'critical';
    reasoning: string;
    consequence: string; // O que acontece se ignorar
  }[];

  // Summary executivo (para email/report header)
  executiveSummary: string;
}

// ============================================
// ANTHROPIC CLIENT
// ============================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Generate deep insights from completed assessment
 */
export async function generateDeepInsights(
  assessmentData: AssessmentData,
  conversationHistory?: Array<{
    questionId: string;
    question: string;
    answer: string;
    metrics?: Record<string, any>;
  }>
): Promise<DeepInsights> {
  console.log('🧠 [Insights Engine] Starting deep analysis...');

  // Build context for Claude
  const assessmentSummary = buildAssessmentSummary(assessmentData);
  const conversationContext = conversationHistory
    ? buildConversationContext(conversationHistory)
    : 'No conversation history available';

  const insightsPrompt = `You are a PhD business consultant with 20+ years experience analyzing tech companies.

You just received a completed assessment from a potential client. Your task is to analyze it DEEPLY and find insights that the client themselves might not see.

**ASSESSMENT DATA:**

${assessmentSummary}

**CONVERSATION HISTORY:**

${conversationContext}

---

**YOUR ANALYSIS TASK:**

Analyze this assessment and return a JSON object with deep insights. Think like a top-tier consultant, not a generic advisor.

1. **PATTERNS** - What critical patterns do you detect?

Look for:
- **Tech Debt Death Spiral:** Slow cycle time + high bugs + high firefighting = velocity getting WORSE over time
- **Velocity Crisis:** Long cycle time + low deploy frequency + frustrated team = competitive disadvantage
- **Quality Crisis:** Many bugs + customer churn + urgent deadlines = unsustainable
- **People Crisis:** High junior ratio + seniors leaving + burnout signals = knowledge drain
- **Market Pressure:** Competitor threats + board pressure + timeline urgency = existential risk

For each pattern, provide:
- Type (one of the above)
- Severity (low/medium/high/critical)
- Description (1-2 sentences explaining the pattern)
- Evidence (specific data points from assessment that prove this pattern)

2. **ROOT CAUSES** - What's REALLY causing these problems?

Don't just describe symptoms. Find the ROOT CAUSE.

Examples of good root causes:
- "Lack of senior technical leadership - 8 plenos making architecture decisions without experience"
- "Process bottlenecks in approval flow - 3 layers of approval taking 2 weeks each"
- "Legacy monolith tech debt accumulated over 5 years, now blocking all changes"

Bad root causes (too vague):
- "Bad processes"
- "Need more people"
- "Technical issues"

Provide:
- Primary root cause (the #1 thing causing most problems)
- Secondary root causes (2-3 contributing factors)
- Reasoning (explain how you identified these as root causes)

3. **FINANCIAL IMPACT** - Calculate the REAL cost in R$

Be specific. Use the data provided to calculate:

- **Direct Cost (Monthly):** Wasted productivity × dev cost
  Example: 25h/week firefighting × 15 devs × 4 weeks × R$15k/mês/dev ÷ 160h = R$140k/mês

- **Opportunity Cost (Annual):** Lost revenue + delayed launches
  Example: 5 clients churned × R$80k ARR = R$400k/ano

- **Total Annual Impact:** Sum of direct + opportunity costs

Provide:
- directCostMonthly: number (R$ per month)
- opportunityCostAnnual: number (R$ per year)
- totalAnnualImpact: number (R$ per year)
- confidence: 0-1 (how confident you are in this calculation)
- breakdown: string (explain your calculation clearly)

4. **URGENCY VS BUDGET** - Is the budget adequate?

Analyze:
- Timeline pressure: What's forcing urgency? (board deadline, competitor, customer threat)
- Budget adequacy: Is the budget enough to solve the problem?
  - under-budgeted: budget < 30% of annual impact
  - adequate: budget = 30-60% of annual impact
  - over-budgeted: budget > 60% of annual impact
- ROI: Calculate ROI multiple (annual impact ÷ budget)
- Recommendation: Should they increase budget? Change scope?

5. **STRATEGIC RECOMMENDATIONS** - What should they do?

Be SPECIFIC. Prioritize by impact.

Good recommendations:
- "Hire 2 senior engineers (one for architecture, one for quality) - NOT juniors. Cost: R$60k/mês. Impact: Reduce tech debt decisions, improve quality."
- "Implement AI pair programming for 5 plenos before hiring more people. Cost: R$50k setup. Impact: 30% productivity boost."

Bad recommendations (too generic):
- "Improve processes"
- "Hire more people"
- "Use better tools"

For each recommendation:
- priority: 1, 2, 3... (ranked by impact)
- action: What to do (specific)
- reasoning: Why this will work
- impact: low/medium/high
- estimatedCost: "R$100k-200k"
- timeframe: "1-2 meses", "6 meses"

6. **RED FLAGS** - What critical risks do you see?

Look for:
- Death spirals (problem feeding itself and getting worse)
- Burnout risks (unsustainable workload, people will leave)
- Budget risks (investing too little for problem size)
- Market risks (competitor threat, customer churn accelerating)

For each red flag:
- flag: Short description
- severity: warning | critical
- reasoning: Why this is a red flag
- consequence: What happens if ignored

7. **EXECUTIVE SUMMARY** - 2-3 sentences

Summarize the key findings for a busy CEO:
- What's the critical problem?
- What's the cost of inaction?
- What's the #1 recommendation?

---

**RETURN VALID JSON (no markdown):**

{
  "patterns": [
    {
      "type": "tech-debt-spiral",
      "severity": "high",
      "description": "...",
      "evidence": ["...", "..."]
    }
  ],
  "rootCauses": {
    "primary": "...",
    "secondary": ["...", "..."],
    "reasoning": "..."
  },
  "financialImpact": {
    "directCostMonthly": 140000,
    "opportunityCostAnnual": 400000,
    "totalAnnualImpact": 2080000,
    "confidence": 0.75,
    "breakdown": "..."
  },
  "urgencyAnalysis": {
    "timelinePressure": "...",
    "budgetAdequacy": "under-budgeted",
    "roi": 4.2,
    "recommendation": "..."
  },
  "recommendations": [
    {
      "priority": 1,
      "action": "...",
      "reasoning": "...",
      "impact": "high",
      "estimatedCost": "R$100k-200k",
      "timeframe": "1-2 meses"
    }
  ],
  "redFlags": [
    {
      "flag": "...",
      "severity": "critical",
      "reasoning": "...",
      "consequence": "..."
    }
  ],
  "executiveSummary": "..."
}`;

  console.log('[Insights Engine] Calling Claude for deep analysis...');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929', // Sonnet 4.5: best quality for deep insights
    max_tokens: 4096,
    temperature: 0.4, // Lower temp for more analytical, less creative
    messages: [
      {
        role: 'user',
        content: insightsPrompt
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  console.log('[Insights Engine] Response received, parsing JSON...');

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse insights response - no JSON found');
  }

  const insights: DeepInsights = JSON.parse(jsonMatch[0]);

  console.log('✅ [Insights Engine] Deep insights generated:', {
    patterns: insights.patterns.length,
    recommendations: insights.recommendations.length,
    redFlags: insights.redFlags.length,
    totalImpact: insights.financialImpact.totalAnnualImpact
  });

  return insights;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build assessment summary for Claude
 */
function buildAssessmentSummary(data: AssessmentData): string {
  const sections: string[] = [];

  // Company info
  if (data.companyInfo) {
    sections.push(`**EMPRESA:**
- Nome: ${data.companyInfo.name || 'N/A'}
- Setor: ${data.companyInfo.industry || 'N/A'}
- Tamanho: ${data.companyInfo.size || 'N/A'}
- Receita: ${data.companyInfo.revenue || 'N/A'}`);
  }

  // Current state
  if (data.currentState) {
    sections.push(`**ESTADO ATUAL:**
- Time de Desenvolvimento: ${data.currentState.devTeamSize || 'N/A'} pessoas
- Seniority: ${data.currentState.devSeniority?.junior || 0} juniors, ${data.currentState.devSeniority?.mid || 0} plenos, ${data.currentState.devSeniority?.senior || 0} seniors
- Cycle Time: ${data.currentState.avgCycleTime || 'N/A'} dias
- Deploy Frequency: ${data.currentState.deploymentFrequency || 'N/A'}
- Bug Rate: ${data.currentState.bugRate || 'N/A'}
- Pain Points: ${data.currentState.painPoints?.join(', ') || 'N/A'}
- AI Tools Usage: ${data.currentState.aiToolsUsage || 'N/A'}`);
  }

  // Goals
  if (data.goals) {
    sections.push(`**OBJETIVOS:**
- Prazo: ${data.goals.timeline || 'N/A'}
- Orçamento: ${data.goals.budgetRange || 'N/A'}
- Goals Principais: ${data.goals.primaryGoals?.join(', ') || 'N/A'}
- Métricas de Sucesso: ${data.goals.successMetrics?.join(', ') || 'N/A'}`);
  }

  return sections.join('\n\n');
}

/**
 * Build conversation context for Claude
 */
function buildConversationContext(
  history: Array<{
    questionId: string;
    question: string;
    answer: string;
    metrics?: Record<string, any>;
  }>
): string {
  return history
    .map((item, index) => {
      let entry = `**Q${index + 1} (${item.questionId}):** ${item.question}\n**A:** ${item.answer}`;

      if (item.metrics && Object.keys(item.metrics).length > 0) {
        entry += `\n**Metrics Extracted:** ${JSON.stringify(item.metrics)}`;
      }

      return entry;
    })
    .join('\n\n');
}

// ============================================
// CONDITIONAL LOGIC
// ============================================

/**
 * Should we run insights engine for this assessment?
 * Budget-aware: only run for high-value leads
 */
export function shouldGenerateInsights(assessmentData: AssessmentData): boolean {
  // Criteria 1: High budget (R$ 200k+)
  const budget = assessmentData.goals?.budgetRange || '';
  const hasHighBudget = budget.includes('200k') || budget.includes('500k') || budget.includes('1M') || budget.includes('2M') || budget.includes('5M');

  // Criteria 2: Critical urgency
  const timeline = assessmentData.goals?.timeline || '';
  const isCritical = timeline.includes('3-months') || timeline.includes('urgent') || timeline.includes('crítico');

  // Criteria 3: High pain (many issues mentioned)
  const painPoints = assessmentData.currentState?.painPoints || [];
  const hasHighPain = painPoints.length >= 3;

  const shouldRun = hasHighBudget || isCritical || hasHighPain;

  console.log('[Insights Engine] Should run?', {
    budget,
    timeline,
    painPointsCount: painPoints.length,
    hasHighBudget,
    isCritical,
    hasHighPain,
    decision: shouldRun
  });

  return shouldRun;
}
