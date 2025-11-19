/**
 * Conversational Interviewer - PhD Virtual Consultant Interview System
 *
 * Purpose: Generate dynamic questions and extract data from free-form answers
 * in a natural, conversational way (not structured questionnaire)
 *
 * Cost: ~R$0.31 per assessment
 * - Question generation: 10x R$0.008 = R$0.08
 * - Data extraction: 10x R$0.010 = R$0.10
 * - Completeness checks: 10x R$0.002 = R$0.02
 * - Insights (30% leads): R$0.109
 */

import Anthropic from '@anthropic-ai/sdk';
import type { UserPersona, AssessmentData } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// ============================================================================
// TYPES - Essential Data Schema
// ============================================================================

/**
 * Essential Data Requirements (13 fields minimum to finish assessment)
 */
export interface EssentialData {
  // COMPANY CONTEXT (4 fields)
  companyName?: string;
  industry?: string;
  stage?: string;
  teamSize?: number;

  // PAIN POINTS (2 fields)
  primaryPain?: string;
  painSeverity?: 'low' | 'medium' | 'high' | 'critical';

  // QUANTIFICATION (3 fields)
  velocityMetric?: {
    type: 'cycle-time' | 'deploy-frequency' | 'feature-time';
    value: string;
    details?: string;
  };
  qualityMetric?: {
    type: 'bugs' | 'downtime' | 'rework';
    value: string;
    details?: string;
  };
  impactMetric?: {
    type: 'revenue' | 'churn' | 'cost' | 'market-share';
    value: string;
    details?: string;
  };

  // GOALS & BUDGET (3 fields)
  primaryGoal?: string;
  timeline?: string;
  budgetRange?: string;

  // CONTACT (1 field)
  email?: string;
}

/**
 * Conversation Context for Question Generation
 */
export interface ConversationContext {
  persona: UserPersona | null;
  conversationHistory: Array<{
    question: string;
    answer: string;
  }>;
  assessmentDataPartial: Partial<AssessmentData>;
  essentialData: EssentialData;
  questionsAsked: number;
}

/**
 * Generated Question
 */
export interface GeneratedQuestion {
  question: string;
  reasoning: string;
  expectedDataGap: string;
  inputType: 'text' | 'single-choice' | 'multi-choice';
  options?: Array<{ value: string; label: string }>;
}

/**
 * Extracted Data from Answer
 */
export interface ExtractedData {
  extractedFields: Partial<EssentialData> & Partial<AssessmentData>;
  weakSignals: {
    isVague: boolean;
    lacksMetrics: boolean;
    hasUrgency: boolean;
    hasEmotionalLanguage: boolean;
    showsCommitment: boolean;
  };
  needsFollowUp: boolean;
  followUpReason?: string;
}

/**
 * Completeness Check Result
 */
export interface CompletenessResult {
  canFinish: boolean;
  completenessScore: number;
  essentialFieldsCollected: number;
  essentialFieldsTotal: number;
  missingCriticalFields: string[];
  recommendation: 'ask_essential' | 'ask_optional' | 'can_finish';
}

// ============================================================================
// QUESTION GENERATION
// ============================================================================

/**
 * Generate next question dynamically based on conversation context
 */
export async function generateNextQuestion(
  context: ConversationContext
): Promise<GeneratedQuestion> {
  console.log('[Conversational] Generating next question...');

  const completeness = checkCompleteness(context.essentialData);
  const missingFields = completeness.missingCriticalFields;

  // Build conversation history for context
  const conversationSummary = context.conversationHistory.length === 0
    ? 'This is the first question (start of conversation)'
    : context.conversationHistory
        .slice(-3) // Last 3 Q&A pairs
        .map((item, i) => `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer}`)
        .join('\n\n');

  const lastUserAnswer = context.conversationHistory.length > 0
    ? context.conversationHistory[context.conversationHistory.length - 1].answer
    : 'N/A';

  const prompt = `You are a PhD business consultant conducting discovery with a potential client.

**CLIENT PERSONA:** ${context.persona || 'Unknown (adapt language carefully)'}

**CONVERSATION SO FAR:**
${conversationSummary}

**LAST USER ANSWER:** "${lastUserAnswer}"

**DATA COLLECTED:**
${JSON.stringify(context.essentialData, null, 2)}

**CRITICAL GAPS (must fill):**
${missingFields.length > 0 ? missingFields.join(', ') : 'None (all essential data collected)'}

**QUESTIONS ASKED SO FAR:** ${context.questionsAsked}
**MAX QUESTIONS ALLOWED:** 12

---

**YOUR TASK:**

Generate the NEXT best question to ask. This must be a natural, conversational question that:

1. **Follows logically** from the user's last answer (build on what they said)
2. **Fills a critical data gap** (prioritize: ${missingFields[0] || 'additional context'})
3. **Is simple** (one question at a time, not compound)
4. **Adapts language** to persona:
   - board-executive / finance-ops → business terms (revenue, growth, ROI)
   - engineering-tech / it-devops → technical terms OK (but not jargon unless necessary)
   - product-business → hybrid (business + some technical)
5. **Is open-ended when possible** (allow free-text answers, not just yes/no)
6. **Sounds natural** (like a consultant talking, not a form)

**CONVERSATION TECHNIQUES:**
- **SPIN Selling:** Situation → Problem → Implication → Need-Payoff
- **5 Whys:** If user mentions problem, dig deeper (why does this happen?)
- **Quantify:** If user says "slow" or "expensive", ask for specifics (numbers, examples)
- **Context:** Reference what they said before ("You mentioned X earlier...")

**EXAMPLES OF GOOD QUESTIONS:**

- "Para começar, conte um pouco sobre a empresa. Em que estágio vocês estão?"
- "Você mencionou que desenvolvimento está lento. Consegue me dar um exemplo de algo que demorou mais do que deveria?"
- "Entendi que tech debt está sendo um problema. Isso está impactando clientes de alguma forma?"
- "Qual o prazo que vocês têm pra resolver isso? Tem alguma pressão externa (board, investidores)?"

**BAD QUESTIONS (avoid):**

- "Qual a cobertura de testes automatizados (%)?" → Too technical
- "Qual o cycle time e deploy frequency?" → Jargon + compound question
- "Quantos bugs por mês E qual o MTTR?" → Multiple questions
- "Em que estágio a empresa está?" → Too generic if we already have context

---

Return ONLY valid JSON (no markdown):

{
  "question": "The next question in PT-BR",
  "reasoning": "Why this question is best right now (1-2 sentences)",
  "expectedDataGap": "Which essential field this fills (e.g., 'primaryPain', 'velocityMetric')",
  "inputType": "text" | "single-choice" | "multi-choice",
  "options": [{"value": "...", "label": "..."}] // Only if inputType is not "text"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001', // Haiku 4.5: fast and cheap for generation
    max_tokens: 512,
    temperature: 0.7, // Higher temp for natural, varied questions
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse question generation response');
  }

  const generated: GeneratedQuestion = JSON.parse(jsonMatch[0]);

  console.log('[Conversational] Generated question:', {
    questionPreview: generated.question.substring(0, 80) + '...',
    expectedDataGap: generated.expectedDataGap,
    reasoning: generated.reasoning
  });

  return generated;
}

// ============================================================================
// DATA EXTRACTION
// ============================================================================

/**
 * Extract structured data from user's free-form answer
 */
export async function extractDataFromAnswer(
  question: string,
  answer: string,
  context: ConversationContext
): Promise<ExtractedData> {
  console.log('[Conversational] Extracting data from answer...');

  const conversationContext = context.conversationHistory.length > 0
    ? context.conversationHistory
        .slice(-2)
        .map(item => `Q: ${item.question}\nA: ${item.answer}`)
        .join('\n\n')
    : 'First question';

  const prompt = `You are analyzing a user's answer during a business assessment interview.

**QUESTION ASKED:** "${question}"

**USER ANSWER:** "${answer}"

**PREVIOUS CONTEXT:**
${conversationContext}

**CURRENT DATA COLLECTED:**
${JSON.stringify(context.essentialData, null, 2)}

---

**YOUR TASK:**

Extract structured data from the answer and analyze it deeply.

**EXTRACTION GUIDELINES:**

1. **Extract what's explicitly stated:**
   - Company name (if mentioned)
   - Numbers (team size, revenue, metrics)
   - Pain points (slow development, bugs, cost)
   - Timeline/urgency (deadlines, pressure)
   - Budget signals (ranges mentioned)

2. **Infer when reasonable:**
   - If they say "Series A" → stage: "growth"
   - If they say "20 devs" → teamSize: 20
   - If they say "feature took 2 months, should be 2 weeks" → velocityMetric
   - If they mention "perdendo clientes" → impactMetric (churn)

3. **Detect weak signals:**
   - **isVague:** Answer lacks specifics ("mais ou menos", "não sei ao certo")
   - **lacksMetrics:** No numbers given when numbers expected
   - **hasUrgency:** Mentions deadlines, pressure, board, competitors
   - **hasEmotionalLanguage:** "frustrado", "preocupado", "crítico"
   - **showsCommitment:** "preciso resolver isso", "estou pronto para investir"

4. **Follow-up decision:**
   - **needsFollowUp = true** if:
     • Answer is vague (lacks details)
     • Metrics are missing (said "slow" but no numbers)
     • Pain mentioned but not quantified
   - **needsFollowUp = false** if:
     • Answer is complete and specific
     • We already have this data from previous answers

---

Return ONLY valid JSON (no markdown):

{
  "extractedFields": {
    // Essential fields extracted (use snake_case for nested objects)
    // Example:
    // "companyName": "Acme Corp",
    // "teamSize": 20,
    // "primaryPain": "Desenvolvimento lento",
    // "painSeverity": "high",
    // "velocityMetric": {
    //   "type": "feature-time",
    //   "value": "2 meses para feature que deveria ser 2 semanas",
    //   "details": "Sistema de notificações push"
    // }
  },
  "weakSignals": {
    "isVague": boolean,
    "lacksMetrics": boolean,
    "hasUrgency": boolean,
    "hasEmotionalLanguage": boolean,
    "showsCommitment": boolean
  },
  "needsFollowUp": boolean,
  "followUpReason": "Reason if needsFollowUp=true (e.g., 'User mentioned slow development but didn't quantify')"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001', // Haiku 4.5: adequate for extraction
    max_tokens: 1024,
    temperature: 0.3, // Lower temp for consistent extraction
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse data extraction response');
  }

  const extracted: ExtractedData = JSON.parse(jsonMatch[0]);

  console.log('[Conversational] Extracted data:', {
    fieldsExtracted: Object.keys(extracted.extractedFields).length,
    weakSignals: extracted.weakSignals,
    needsFollowUp: extracted.needsFollowUp
  });

  return extracted;
}

// ============================================================================
// COMPLETENESS CHECKING
// ============================================================================

/**
 * Check if we have enough essential data to finish assessment
 */
export function checkCompleteness(essentialData: EssentialData): CompletenessResult {
  const fields = [
    'companyName',
    'industry',
    'stage',
    'teamSize',
    'primaryPain',
    'painSeverity',
    'velocityMetric',
    'qualityMetric',
    'impactMetric',
    'primaryGoal',
    'timeline',
    'budgetRange',
    'email'
  ];

  const collected = fields.filter(field => {
    const value = essentialData[field as keyof EssentialData];
    return value !== undefined && value !== null && value !== '';
  });

  const missing = fields.filter(field => {
    const value = essentialData[field as keyof EssentialData];
    return value === undefined || value === null || value === '';
  });

  const completenessScore = Math.round((collected.length / fields.length) * 100);

  // Critical fields (MUST have to finish)
  const criticalFields = [
    'primaryPain',
    'painSeverity',
    'primaryGoal',
    'timeline',
    'budgetRange',
    'email'
  ];

  const missingCritical = criticalFields.filter(field => {
    const value = essentialData[field as keyof EssentialData];
    return value === undefined || value === null || value === '';
  });

  // Can finish if:
  // 1. All critical fields collected
  // 2. Completeness score >= 70%
  const canFinish = missingCritical.length === 0 && completenessScore >= 70;

  let recommendation: 'ask_essential' | 'ask_optional' | 'can_finish' = 'ask_essential';
  if (canFinish) {
    recommendation = 'can_finish';
  } else if (missingCritical.length === 0 && completenessScore >= 60) {
    recommendation = 'ask_optional';
  }

  console.log('[Completeness Check]', {
    completenessScore,
    collected: collected.length,
    total: fields.length,
    missingCritical: missingCritical.length,
    canFinish,
    recommendation
  });

  return {
    canFinish,
    completenessScore,
    essentialFieldsCollected: collected.length,
    essentialFieldsTotal: fields.length,
    missingCriticalFields: missingCritical,
    recommendation
  };
}

// ============================================================================
// HELPER: Convert Essential Data to AssessmentData
// ============================================================================

/**
 * Convert EssentialData to AssessmentData format
 */
export function essentialDataToAssessmentData(essential: EssentialData): Partial<AssessmentData> {
  return {
    companyInfo: {
      name: essential.companyName || '',
      industry: essential.industry || '',
      size: essential.teamSize ? `${essential.teamSize} pessoas` : '',
      revenue: '', // Not in essential
      stage: essential.stage
    },
    currentState: {
      devTeamSize: essential.teamSize || 0,
      avgCycleTime: essential.velocityMetric?.value,
      bugRate: essential.qualityMetric?.value,
      painPoints: essential.primaryPain ? [essential.primaryPain] : [],
      aiToolsUsage: 'unknown'
    },
    goals: {
      primaryGoals: essential.primaryGoal ? [essential.primaryGoal] : [],
      timeline: essential.timeline || '',
      budgetRange: essential.budgetRange || ''
    },
    contactInfo: {
      email: essential.email || ''
    }
  };
}
