import { Page, Route } from '@playwright/test';
import { UserPersona } from '@/lib/types';

/**
 * Mock responses from Claude API based on persona
 * Simulates persona-appropriate questions
 */

interface MockResponse {
  text: string;
  isAppropriate: boolean; // For testing: is this question appropriate for the persona?
  abstractionLevel: 'strategic' | 'tactical' | 'operational' | 'technical';
  usesJargon: string[]; // Technical jargon used (empty if none)
}

const personaResponses: Record<UserPersona, Record<string, MockResponse[]>> = {
  'board-executive': {
    question1: [
      {
        text: 'Como essa lentidão no desenvolvimento está afetando sua posição competitiva no mercado? Seus principais concorrentes estão lançando produtos mais rapidamente?',
        isAppropriate: true,
        abstractionLevel: 'strategic',
        usesJargon: [],
      },
    ],
    question2: [
      {
        text: 'Qual o impacto financeiro estimado de perder oportunidades de mercado por lançar features atrasado? Já conseguem quantificar o custo de oportunidade?',
        isAppropriate: true,
        abstractionLevel: 'strategic',
        usesJargon: [],
      },
    ],
    question3: [
      {
        text: 'Considerando o cenário competitivo, qual seria o retorno esperado de uma transformação digital bem-sucedida? Estamos falando de ganho de market share, retenção de clientes, ou novos mercados?',
        isAppropriate: true,
        abstractionLevel: 'strategic',
        usesJargon: [],
      },
    ],
  },
  'finance-ops': {
    question1: [
      {
        text: 'Qual o custo atual estimado desses atrasos em termos de horas-homem desperdiçadas por mês? Consegue quantificar em reais?',
        isAppropriate: true,
        abstractionLevel: 'tactical',
        usesJargon: [],
      },
    ],
    question2: [
      {
        text: 'Se conseguissem reduzir o ciclo de desenvolvimento pela metade, qual seria o impacto no P&L e na margem operacional?',
        isAppropriate: true,
        abstractionLevel: 'tactical',
        usesJargon: [],
      },
    ],
    question3: [
      {
        text: 'Qual seria um ROI aceitável para um investimento em ferramentas de AI/automation? Qual o payback period máximo que considerariam viável?',
        isAppropriate: true,
        abstractionLevel: 'tactical',
        usesJargon: [],
      },
    ],
  },
  'product-business': {
    question1: [
      {
        text: 'Quais features importantes ficaram em backlog porque o time não teve capacidade de desenvolver? Isso causou perda de clientes ou oportunidades?',
        isAppropriate: true,
        abstractionLevel: 'tactical',
        usesJargon: [],
      },
    ],
    question2: [
      {
        text: 'Como o tempo lento de lançamento afeta sua capacidade de responder a feedback de clientes e adaptar o produto rapidamente?',
        isAppropriate: true,
        abstractionLevel: 'tactical',
        usesJargon: [],
      },
    ],
    question3: [
      {
        text: 'Seus competidores diretos estão lançando inovações mais rápido? Já perderam alguma diferenciação competitiva por isso?',
        isAppropriate: true,
        abstractionLevel: 'tactical',
        usesJargon: [],
      },
    ],
  },
  'engineering-tech': {
    question1: [
      {
        text: 'Quais são os principais gargalos técnicos no dia a dia? Estamos falando de débito técnico acumulado, setup de ambiente complexo, ou problemas de arquitetura?',
        isAppropriate: true,
        abstractionLevel: 'technical',
        usesJargon: ['débito técnico', 'setup de ambiente', 'arquitetura'],
      },
    ],
    question2: [
      {
        text: 'Já tentaram implementar CI/CD ou outras automações no pipeline? O que funcionou e o que não funcionou?',
        isAppropriate: true,
        abstractionLevel: 'technical',
        usesJargon: ['CI/CD', 'pipeline'],
      },
    ],
    question3: [
      {
        text: 'A arquitetura atual (monolito vs microserviços) facilita ou dificulta a adoção de novas ferramentas e práticas de desenvolvimento?',
        isAppropriate: true,
        abstractionLevel: 'technical',
        usesJargon: ['monolito', 'microserviços'],
      },
    ],
  },
  'it-devops': {
    question1: [
      {
        text: 'Qual porcentagem do tempo da equipe é gasta em tarefas operacionais (firefighting, manutenção) vs desenvolvimento de novos recursos?',
        isAppropriate: true,
        abstractionLevel: 'operational',
        usesJargon: ['firefighting'],
      },
    ],
    question2: [
      {
        text: 'Quais processos manuais causam mais fricção no dia a dia? Deploy, provisioning de infra, ou gerenciamento de configurações?',
        isAppropriate: true,
        abstractionLevel: 'operational',
        usesJargon: ['provisioning', 'infra'],
      },
    ],
    question3: [
      {
        text: 'Como é o processo de deploy atualmente? Quantas etapas manuais existem e onde estão os maiores riscos?',
        isAppropriate: true,
        abstractionLevel: 'operational',
        usesJargon: ['deploy'],
      },
    ],
  },
};

/**
 * Setup Claude API mock for Playwright tests
 */
export async function setupClaudeMock(page: Page, persona: UserPersona, scenario: string) {
  let questionIndex = 0;

  await page.route('**/api/consult', async (route: Route) => {
    const request = route.request();
    const body = request.postDataJSON();

    // Simulate streaming response
    const question = questionIndex + 1;
    const responses = personaResponses[persona];
    const questionKey = `question${question}` as keyof typeof responses;
    const mockResponse = responses[questionKey]?.[0] || {
      text: `Pergunta ${question} para ${persona}`,
      isAppropriate: true,
      abstractionLevel: 'tactical',
      usesJargon: [],
    };

    questionIndex++;

    // Create SSE-style response
    const chunks = mockResponse.text.split(' ');
    const responseText = chunks.map((chunk, i) =>
      `data: ${JSON.stringify({ text: chunk + (i < chunks.length - 1 ? ' ' : '') })}\n\n`
    ).join('') + 'data: [DONE]\n\n';

    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      body: responseText,
    });
  });

  return {
    getQuestionMetrics: () => ({
      totalQuestions: questionIndex,
      persona,
      scenario,
    }),
  };
}

/**
 * Validate if a question is appropriate for a persona
 */
export function validateQuestionForPersona(
  question: string,
  persona: UserPersona
): {
  isAppropriate: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for technical jargon in non-technical personas
  const technicalJargon = [
    'débito técnico', 'CI/CD', 'pipeline', 'deploy', 'merge conflict',
    'code coverage', 'refactoring', 'monolito', 'microserviços',
    'container', 'kubernetes', 'docker', 'API Gateway'
  ];

  const nonTechnicalPersonas: UserPersona[] = ['board-executive', 'finance-ops', 'product-business'];

  if (nonTechnicalPersonas.includes(persona)) {
    technicalJargon.forEach(jargon => {
      if (question.toLowerCase().includes(jargon.toLowerCase())) {
        issues.push(`Jargão técnico inadequado: "${jargon}"`);
      }
    });
  }

  // Check for strategic questions in technical personas
  if (persona === 'engineering-tech' || persona === 'it-devops') {
    const strategicTerms = ['market share', 'competitividade de mercado', 'posicionamento estratégico'];
    strategicTerms.forEach(term => {
      if (question.toLowerCase().includes(term.toLowerCase())) {
        issues.push(`Termo muito estratégico para perfil técnico: "${term}"`);
      }
    });
  }

  return {
    isAppropriate: issues.length === 0,
    issues,
  };
}
