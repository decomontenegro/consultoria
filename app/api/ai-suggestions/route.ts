/**
 * AI-Powered Suggestion Generation API
 *
 * Uses Claude to analyze AI questions and generate contextual response suggestions
 * Much better than simple pattern matching
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Simple in-memory cache to avoid duplicate API calls
const suggestionCache = new Map<string, any>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (reduced for faster iterations)

// Clear cache on module reload (development hot reload)
if (process.env.NODE_ENV === 'development') {
  suggestionCache.clear();
  console.log('🔄 [AI-SUGGESTIONS] Cache cleared on reload');
}

interface SuggestionRequest {
  question: string;
  context?: string; // Optional context about the conversation
  previousAnswers?: string[]; // Previous user answers for context
  specialistType?: string; // engineering, product, strategy, etc.
}

export async function POST(request: NextRequest) {
  console.log('🟢 [SERVER] /api/ai-suggestions called');

  try {
    const body: SuggestionRequest = await request.json();
    const { question, context, previousAnswers, specialistType } = body;

    console.log('   Question:', question?.substring(0, 80));
    console.log('   Context:', context || 'none');
    console.log('   Previous answers count:', previousAnswers?.length || 0);
    if (previousAnswers && previousAnswers.length > 0) {
      console.log('   📝 Previous answers:');
      previousAnswers.forEach((ans, i) => {
        console.log(`      ${i+1}. ${ans.substring(0, 100)}${ans.length > 100 ? '...' : ''}`);
      });
    }

    if (!question || question.trim() === '') {
      console.error('   ❌ No question provided');
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${question}-${context || ''}-${specialistType || ''}`;
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('   ✅ Cache hit - returning cached suggestions');
      return NextResponse.json({ suggestions: cached.suggestions });
    }

    console.log('   💾 Cache miss - calling Claude API...');

    // Build context for Claude
    let contextPrompt = '';
    if (previousAnswers && previousAnswers.length > 0) {
      contextPrompt = `\n\nPrevious answers in this conversation:\n${previousAnswers.join('\n')}`;
    }

    if (specialistType) {
      contextPrompt += `\n\nSpecialist context: This is a ${specialistType} consultation.`;
    }

    if (context) {
      contextPrompt += `\n\nAdditional context: ${context}`;
    }

    // Call Claude to generate suggestions
    const systemPrompt = `You are a helpful AI assistant generating quick response suggestions for users filling out an AI readiness assessment.

Your task: Analyze the question AND the previous conversation context to generate 4-6 SHORT, SPECIFIC, QUALITATIVE, and CONTEXTUAL response suggestions that:
1. **USE THE CONTEXT**: If previous answers are provided, generate suggestions that make sense given what the user already said
2. **SPECIFIC TO THE QUESTION**: Generate suggestions that directly answer the current question, not generic responses
3. Focus on QUALITATIVE DESCRIPTIONS not quantitative metrics
4. AVOID specific numbers, values, timelines, or monetary amounts
5. Cover the full spectrum of situations with MEANINGFUL differences
6. Are concise but informative (3-15 words)
7. Use Brazilian Portuguese
8. Focus on context, situation, and characteristics rather than exact numbers

**CRITICAL**: Read the "Previous answers" section carefully and tailor your suggestions to match the user's situation and problems they mentioned.

Output format (JSON only, no other text):
{
  "suggestions": [
    { "text": "Suggestion text" },
    { "text": "Another suggestion" }
  ]
}

CONTEXTUAL EXAMPLES - HOW TO USE PREVIOUS ANSWERS:

Example 1: Question about "What problem to solve?"
Previous answers: "Bugs in production", "Deployments are manual", "Tech debt is high"
❌ BAD (generic): "Melhorar qualidade", "Aumentar velocidade"
✅ GOOD (contextual): "Reduzir bugs em produção que impactam clientes", "Automatizar deployments para reduzir erros", "Pagar débito técnico acumulado"

Example 2: Question about "What problem to solve in 3-6 months?"
Previous answers: "CTO at enterprise", "Losing clients to competitors", "Releases take months"
❌ BAD (generic): "Contratar mais pessoas", "Melhorar processos"
✅ GOOD (contextual): "Acelerar time-to-market para competir melhor", "Reduzir cycle time de meses para semanas", "Recuperar competitividade no mercado"

Example 3: Question about "AI tools currently used?"
Previous answers: "Startup early stage", "Manual processes everywhere", "No automation"
❌ BAD (generic): "GitHub Copilot", "ChatGPT", "Claude"
✅ GOOD (contextual): "Nenhuma - tudo ainda é manual", "Apenas experimentos individuais com ChatGPT", "Começando a testar GitHub Copilot"

**RULE**: Always read previous answers and tailor suggestions to match the user's ACTUAL situation, problems, and context.

CRITICAL RULES - QUALITATIVE SPECIFICITY:

For URGENCY/PROBLEM questions:
✅ GOOD: "Sim - decisão estratégica iminente do Board"
✅ GOOD: "Sim - perdendo clientes para concorrentes mais ágeis"
✅ GOOD: "Não - ainda em fase de exploração"
❌ BAD: "Sim - decisão em 30 dias" (specific timeline)
❌ BAD: "Sim", "Tenho problema" (too generic)

For ROLE/RESPONSIBILITY questions:
✅ GOOD: "CTO - responsável por velocidade e qualidade"
✅ GOOD: "Head de Produto - foco em experiência do usuário"
✅ GOOD: "VP Engineering - lidero várias squads"
❌ BAD: "CTO" (too generic)

For TEAM SIZE questions:
✅ GOOD: "Equipe grande distribuída em múltiplas squads"
✅ GOOD: "Time pequeno, todos fazem de tudo"
✅ GOOD: "Equipe média com alguns especialistas"
❌ BAD: "50 pessoas total" (specific numbers)
❌ BAD: "Pequeno" (too vague)

For PROCESS questions:
✅ GOOD: "Ideias demoram bastante até chegarem em produção"
✅ GOOD: "Deploys frequentes mas com muita instabilidade"
✅ GOOD: "Processo totalmente manual - sem automação"
❌ BAD: "2-3 meses" (specific timeline)
❌ BAD: "Lento" (too vague)

For IMPACT questions:
✅ GOOD: "Sim - perdendo clientes constantemente"
✅ GOOD: "Sim - lançamentos sempre atrasam"
✅ GOOD: "Sim - custos operacionais muito altos"
❌ BAD: "Perdemos 3 clientes" (specific numbers)
❌ BAD: "R$50k/mês" (monetary values)
❌ BAD: "Sim" (too generic)

For BUDGET questions:
✅ GOOD: "Budget aprovado para projeto piloto"
✅ GOOD: "Budget significativo para transformação completa"
✅ GOOD: "Ainda sem orçamento - preciso justificar valor"
❌ BAD: "R$ 50k-100k" (specific amounts)
❌ BAD: "Temos budget" (too vague)

For METRICS questions:
✅ GOOD: "Entregamos features com frequência"
✅ GOOD: "Releases são raros e complexos"
✅ GOOD: "Bugs aparecem ocasionalmente em produção"
❌ BAD: "1 release por semana" (specific frequency)
❌ BAD: "5 bugs por mês" (specific numbers)

NEVER:
- Include specific numbers, percentages, or monetary amounts
- Use specific timelines or dates
- Generate 3+ suggestions that are semantically similar
- Use vague one-word answers when qualitative description is possible
- Suggest values that only make sense for certain company sizes or industries

ALWAYS:
- Use relative/qualitative terms (frequent/rare, fast/slow, many/few)
- Describe situations and contexts
- Make suggestions applicable across different company sizes and industries
- Order from most to least common for diverse audiences

SPECIAL RULE - "I Don't Know" Option (CONTEXTUAL):
- When the question asks for TECHNICAL METRICS, SPECIFIC TOOLS, or DETAILED PROCESSES that user might not know
- ALWAYS include ONE "escape hatch" suggestion
- Examples of when to include:
  ✅ "Qual é o code coverage atual?"
  ✅ "Que ferramenta usam para CI/CD?"
  ✅ "Qual o tempo médio de deploy?"
  ✅ "Quantos bugs em produção por sprint?"

- "Don't know" suggestion examples (pick one that fits context):
  ✅ "Não sei ao certo - preciso verificar"
  ✅ "Não tenho esse dado disponível agora"
  ✅ "Não acompanho essa métrica"
  ✅ "Desconheço - não é minha área"
  ✅ "Não tenho acesso a essa informação"

- When to include: Technical questions about metrics, tools, or specific numbers
- When NOT to include: General questions about problems, urgency, strategy, budget approval

If you include the "don't know" option:
- Total suggestions: 4-5 (3-4 specific + 1 "don't know")
- Place "don't know" as the LAST suggestion
- Still provide 3-4 strong contextual suggestions first

ONLY output valid JSON, nothing else.`;

    const userPrompt = `Question from AI: "${question}"${contextPrompt}

Generate 4-6 contextual response suggestions in JSON format.`;

    console.log('🤖 Calling Claude for suggestions...');

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Parse Claude's response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response
    let jsonText = content.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const result = JSON.parse(jsonText);

    // Validate response structure
    if (!result.suggestions || !Array.isArray(result.suggestions)) {
      throw new Error('Invalid response structure from Claude');
    }

    // Ensure each suggestion has required fields
    const validatedSuggestions = result.suggestions
      .filter((s: any) => s.text)
      .map((s: any) => ({
        text: s.text
      }))
      .slice(0, 6); // Max 6 suggestions

    if (validatedSuggestions.length === 0) {
      throw new Error('No valid suggestions generated');
    }

    // Cache the result
    suggestionCache.set(cacheKey, {
      suggestions: validatedSuggestions,
      timestamp: Date.now()
    });

    console.log(`✅ Generated ${validatedSuggestions.length} AI-powered suggestions`);

    return NextResponse.json({
      suggestions: validatedSuggestions
    });

  } catch (error: any) {
    console.error('❌ Error generating AI suggestions:', error);

    // Return fallback suggestions on error
    const fallbackSuggestions = [
      { text: 'Sim' },
      { text: 'Não' },
      { text: 'Parcialmente' },
      { text: 'Não tenho certeza' }
    ];

    return NextResponse.json({
      suggestions: fallbackSuggestions,
      error: 'Using fallback suggestions',
      details: error.message
    });
  }
}

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of suggestionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      suggestionCache.delete(key);
    }
  }
}, CACHE_TTL);
