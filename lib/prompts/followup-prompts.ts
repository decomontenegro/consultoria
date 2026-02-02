/**
 * Follow-Up Prompts
 *
 * Prompts for generating intelligent follow-up questions using LLM.
 * These prompts create natural, context-aware questions that reference user's specific words.
 */

import type { UserPersona } from '@/lib/types';
import type { SignalCategory } from '@/lib/utils/signal-detection';

/**
 * Persona context for prompt adaptation
 */
const PERSONA_CONTEXTS: Record<UserPersona, string> = {
  'engineering-tech': 'técnico (pode usar jargão de engenharia e métricas técnicas)',
  'it-devops': 'técnico de infraestrutura (pode falar sobre deploy, CI/CD, monitoring)',
  'product-business': 'produto/negócios (evite jargão técnico, foque em impacto no usuário e métricas de produto)',
  'board-executive': 'executivo C-level (linguagem estratégica, alto nível, foco em ROI e impacto no negócio)',
  'finance-ops': 'finan\u00e7as/operações (foco em custos, ROI, eficiência operacional)'
};

/**
 * Strategy guidance by signal category
 */
const CATEGORY_STRATEGIES: Record<SignalCategory, string> = {
  innovation: 'Explore o tipo de inovação, timing de mercado, e vantagem competitiva. Pergunte sobre competidores e janela de oportunidade.',
  competition: 'Quantifique a ameaça competitiva. Pergunte sobre market share, features que faltam, e timeline para responder.',
  'pain-quantified': 'Busque métricas concretas. Se mencionaram problema, pergunte quanto custa (R$/mês, horas/semana, clientes perdidos).',
  urgency: 'Entenda os drivers de urgência. Pergunte sobre deadlines específicos, consequências de atraso, e quem está pressionando.',
  growth: 'Explore desafios de scaling. Pergunte sobre gargalos atuais, planos de contratação, e quando esperam dobrar de tamanho.',
  cost: 'Quantifique custos atuais e expectativas de ROI. Pergunte sobre budget aprovado e payback period esperado.',
  quality: 'Quantifique impacto de problemas de qualidade. Pergunte sobre frequência, custo de bugs, e impacto em clientes.',
  none: 'Faça pergunta genérica para elaborar mais.'
};

/**
 * Generates prompt for LLM to create intelligent follow-up question
 */
export function generateFollowUpPrompt(params: {
  originalQuestion: string;
  userAnswer: string;
  persona: UserPersona;
  category: SignalCategory;
  keywords: string[];
  conversationHistory: Array<{ question: string; answer: string }>;
}): string {
  const {
    originalQuestion,
    userAnswer,
    persona,
    category,
    keywords,
    conversationHistory
  } = params;

  const personaContext = PERSONA_CONTEXTS[persona] || PERSONA_CONTEXTS['board-executive'];
  const strategy = CATEGORY_STRATEGIES[category] || CATEGORY_STRATEGIES['none'];
  const recentHistory = conversationHistory
    .slice(-2)
    .map((item, i) => `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer}`)
    .join('\n\n');

  return `Você é um consultor especialista conduzindo um assessment de AI readiness.

**Perfil do Usuário:** ${personaContext}

**Conversa Recente:**
${recentHistory || 'Esta é a primeira pergunta'}

**Pergunta Atual:**
"${originalQuestion}"

**Resposta do Usuário:**
"${userAnswer}"

**Sinais Detectados:**
- Categoria: ${category}
- Palavras-chave: ${keywords.join(', ')}
- Estratégia: ${strategy}

---

**Sua Missão:**

Gere UMA pergunta de follow-up inteligente que:

✅ **DEVE:**
- Fazer referência a algo ESPECÍFICO que o usuário disse (use as palavras exatas dele entre aspas)
- Explorar o ponto mais interessante da resposta dele
- Soar como uma pessoa curiosa e interessada, não um robô
- Ser natural e conversacional
- Buscar quantificar impacto OU entender causa raiz OU explorar contexto
- Ser em português (PT-BR)
- Ser uma única pergunta (não múltiplas perguntas)
- Ter no máximo 2-3 linhas

❌ **NÃO DEVE:**
- Ser genérica ("pode dar mais detalhes?")
- Fazer múltiplas perguntas separadas por "e"
- Repetir informações já coletadas
- Usar jargão técnico se o usuário for não-técnico (${persona})
- Ser uma pergunta fechada de sim/não (prefira perguntas abertas)

---

**Exemplos de Boas Follow-Ups por Categoria:**

**Innovation (Inovação):**
Ruim: "Pode falar mais sobre isso?"
Bom: "Você mencionou 'desenvolver novos produtos inovadores'. Que tipos de produtos vocês estão considerando? Seus principais competidores já têm algo similar?"

**Competition (Competição):**
Ruim: "Quem são seus competidores?"
Bom: "Quando você fala em 'diferenciar da concorrência', quem especificamente está te pressionando? E qual seria o impacto de eles lançarem algo antes de vocês?"

**Pain-Quantified (Dor com Métricas):**
Ruim: "Isso é um problema grande?"
Bom: "Você mencionou 'custos operacionais muito altos'. Consegue estimar quanto isso representa por mês? Por exemplo, quantas horas/semana a equipe gasta com isso?"

**Urgency (Urgência):**
Ruim: "Por que é urgente?"
Bom: "Você disse que há 'decisão estratégica iminente do Board'. Quando é essa decisão? E o que acontece se não tivermos dados suficientes até lá?"

**Growth (Crescimento):**
Ruim: "Vocês vão crescer?"
Bom: "Quando você fala em 'escalar rapidamente', qual o tamanho de equipe que vocês projetam para os próximos 6 meses? E onde está o maior gargalo hoje para esse crescimento?"

**Cost (Custo):**
Ruim: "Quanto custa?"
Bom: "Você mencionou 'orçamento limitado'. Tem uma faixa de investimento aprovada? Por exemplo, algo entre R$10k-50k seria viável?"

**Quality (Qualidade):**
Ruim: "Vocês têm bugs?"
Bom: "Quando você diz 'qualidade está impactando os clientes', quantos clientes foram afetados no último mês? E qual foi o custo (churn, suporte, etc)?"

---

**IMPORTANTE:**
- Cite LITERALMENTE 1-2 palavras ou frases que o usuário usou (coloque entre aspas)
- Faça uma pergunta que ele realmente consiga responder (nada muito abstrato)
- Se o usuário for não-técnico (board-executive, product-business), use linguagem de negócios

---

**Retorne APENAS JSON válido (sem markdown):**

{
  "question": "A pergunta de follow-up em português usando palavras exatas do usuário entre aspas",
  "reasoning": "Por que essa pergunta é valiosa neste momento (1 frase curta)",
  "expectedInsight": "O que esperamos aprender (1 frase)"
}`;
}

/**
 * Fallback follow-up question when LLM fails or times out
 */
export function getFallbackFollowUp(userAnswer: string): string {
  const answerSnippet = userAnswer.substring(0, 60);
  return `Interessante que você mencionou "${answerSnippet}...". Pode elaborar um pouco mais sobre isso?`;
}
