import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface TestResult {
  testId: string;
  persona: string;
  scenarioType: string;
  success: boolean;
  metrics: {
    topicsSuggested: number;
    topicsAppropriate: boolean;
    questionsAsked: number;
    questionsAppropriate: number;
    questionnaireFlow: boolean;
    jargonViolations: string[];
    abstractionLevel: string;
  };
  issues: string[];
  timestamp: string;
}

interface PersonaAnalysis {
  persona: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  avgTopicsSuggested: number;
  topicsAppropriateRate: number;
  avgQuestionsAsked: number;
  flowSuccessRate: number;
  commonIssues: string[];
  scenarios: {
    scenarioType: string;
    success: boolean;
    score: number;
  }[];
}

interface ScenarioAnalysis {
  scenarioType: string;
  totalTests: number;
  passedTests: number;
  avgScore: number;
  commonIssues: string[];
}

interface OverallAnalysis {
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  successRate: number;
  byPersona: PersonaAnalysis[];
  byScenario: ScenarioAnalysis[];
  criticalIssues: { issue: string; count: number; affectedTests: string[] }[];
  recommendations: { priority: string; description: string; affectedPersonas: string[] }[];
}

/**
 * Load test results from JSON file
 */
function loadTestResults(): TestResult[] {
  const reportsDir = join(__dirname, '../reports');
  const files = readdirSync(reportsDir).filter(f => f.startsWith('test-results-') && f.endsWith('.json'));

  if (files.length === 0) {
    throw new Error('No test result files found. Run tests first.');
  }

  // Load the most recent file
  const latestFile = files.sort().reverse()[0];
  const filePath = join(reportsDir, latestFile);

  console.log(`📂 Loading results from: ${latestFile}`);

  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Analyze results by persona
 */
function analyzeByPersona(results: TestResult[]): PersonaAnalysis[] {
  const personas = ['board-executive', 'finance-ops', 'product-business', 'engineering-tech', 'it-devops'];

  return personas.map(persona => {
    const personaResults = results.filter(r => r.persona === persona);
    const passed = personaResults.filter(r => r.success);
    const failed = personaResults.filter(r => !r.success);

    const allIssues = personaResults.flatMap(r => r.issues);
    const issueCounts = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([issue]) => issue);

    return {
      persona,
      totalTests: personaResults.length,
      passedTests: passed.length,
      failedTests: failed.length,
      avgTopicsSuggested: avg(personaResults.map(r => r.metrics.topicsSuggested)),
      topicsAppropriateRate: (personaResults.filter(r => r.metrics.topicsAppropriate).length / personaResults.length) * 100,
      avgQuestionsAsked: avg(personaResults.map(r => r.metrics.questionsAsked)),
      flowSuccessRate: (personaResults.filter(r => r.metrics.questionnaireFlow).length / personaResults.length) * 100,
      commonIssues,
      scenarios: personaResults.map(r => ({
        scenarioType: r.scenarioType,
        success: r.success,
        score: calculateTestScore(r),
      })),
    };
  });
}

/**
 * Analyze results by scenario type
 */
function analyzeByScenario(results: TestResult[]): ScenarioAnalysis[] {
  const scenarioTypes = ['otimista', 'pessimista', 'realista', 'cetico', 'urgente'];

  return scenarioTypes.map(scenarioType => {
    const scenarioResults = results.filter(r => r.scenarioType === scenarioType);
    const passed = scenarioResults.filter(r => r.success);

    const allIssues = scenarioResults.flatMap(r => r.issues);
    const issueCounts = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([issue]) => issue);

    return {
      scenarioType,
      totalTests: scenarioResults.length,
      passedTests: passed.length,
      avgScore: avg(scenarioResults.map(r => calculateTestScore(r))),
      commonIssues,
    };
  });
}

/**
 * Identify critical issues
 */
function identifyCriticalIssues(results: TestResult[]): { issue: string; count: number; affectedTests: string[] }[] {
  const issueMap: Map<string, string[]> = new Map();

  results.forEach(r => {
    r.issues.forEach(issue => {
      const existing = issueMap.get(issue) || [];
      existing.push(r.testId);
      issueMap.set(issue, existing);
    });
  });

  return Array.from(issueMap.entries())
    .map(([issue, affectedTests]) => ({
      issue,
      count: affectedTests.length,
      affectedTests,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Generate recommendations
 */
function generateRecommendations(analysis: OverallAnalysis): typeof analysis.recommendations {
  const recommendations: typeof analysis.recommendations = [];

  // P0 - Critical issues affecting multiple personas
  analysis.criticalIssues.slice(0, 3).forEach(issue => {
    if (issue.count >= 5) {
      recommendations.push({
        priority: 'P0 - Crítico',
        description: `${issue.issue} (afeta ${issue.count} testes)`,
        affectedPersonas: [...new Set(issue.affectedTests.map(t => t.split('-')[1]))],
      });
    }
  });

  // P1 - Persona-specific issues
  analysis.byPersona.forEach(persona => {
    if (persona.topicsAppropriateRate < 70) {
      recommendations.push({
        priority: 'P1 - Alto',
        description: `Tópicos sugeridos inadequados para ${persona.persona} (${persona.topicsAppropriateRate.toFixed(0)}% apropriados)`,
        affectedPersonas: [persona.persona],
      });
    }

    if (persona.flowSuccessRate < 80) {
      recommendations.push({
        priority: 'P1 - Alto',
        description: `Fluxo de conversa problemático para ${persona.persona} (${persona.flowSuccessRate.toFixed(0)}% sucesso)`,
        affectedPersonas: [persona.persona],
      });
    }
  });

  // P2 - Scenario-specific improvements
  analysis.byScenario.forEach(scenario => {
    if (scenario.avgScore < 70) {
      recommendations.push({
        priority: 'P2 - Médio',
        description: `Cenário "${scenario.scenarioType}" precisa melhorias (score médio: ${scenario.avgScore.toFixed(0)})`,
        affectedPersonas: [],
      });
    }
  });

  return recommendations.sort((a, b) => a.priority.localeCompare(b.priority));
}

/**
 * Calculate test score (0-100)
 */
function calculateTestScore(result: TestResult): number {
  let score = 0;

  if (result.success) score += 40;
  if (result.metrics.topicsAppropriate) score += 20;
  if (result.metrics.questionnaireFlow) score += 20;
  if (result.metrics.questionsAsked >= 3) score += 10;
  if (result.metrics.jargonViolations.length === 0) score += 10;

  return score;
}

/**
 * Helper: Calculate average
 */
function avg(numbers: number[]): number {
  return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(analysis: OverallAnalysis): string {
  let md = `# Relatório de Análise UX - Consulta AI Multi-Persona\n\n`;
  md += `**Data:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Total de Testes:** ${analysis.totalTests}\n\n`;

  md += `## 📊 Executive Summary\n\n`;
  md += `- **Taxa de Sucesso:** ${analysis.successRate.toFixed(1)}%\n`;
  md += `- **Testes Passados:** ${analysis.totalPassed}/${analysis.totalTests}\n`;
  md += `- **Testes Falhados:** ${analysis.totalFailed}/${analysis.totalTests}\n\n`;

  md += `## 🎭 Análise por Persona\n\n`;
  md += `| Persona | Testes | Passou | Score Topics | Flow OK | Questões Médias |\n`;
  md += `|---------|--------|--------|--------------|---------|------------------|\n`;

  analysis.byPersona.forEach(p => {
    md += `| **${p.persona}** | ${p.totalTests} | ${p.passedTests} (${((p.passedTests/p.totalTests)*100).toFixed(0)}%) | ${p.topicsAppropriateRate.toFixed(0)}% | ${p.flowSuccessRate.toFixed(0)}% | ${p.avgQuestionsAsked.toFixed(1)} |\n`;
  });

  md += `\n### Detalhes por Persona\n\n`;
  analysis.byPersona.forEach(p => {
    md += `#### ${p.persona}\n\n`;
    md += `**Performance:**\n`;
    md += `- Tópicos sugeridos (média): ${p.avgTopicsSuggested.toFixed(1)}\n`;
    md += `- Tópicos apropriados: ${p.topicsAppropriateRate.toFixed(0)}%\n`;
    md += `- Fluxo correto: ${p.flowSuccessRate.toFixed(0)}%\n\n`;

    if (p.commonIssues.length > 0) {
      md += `**Problemas Comuns:**\n`;
      p.commonIssues.forEach(issue => {
        md += `- ${issue}\n`;
      });
      md += `\n`;
    }

    md += `**Resultados por Cenário:**\n`;
    md += `| Cenário | Sucesso | Score |\n`;
    md += `|---------|---------|-------|\n`;
    p.scenarios.forEach(s => {
      md += `| ${s.scenarioType} | ${s.success ? '✅' : '❌'} | ${s.score}/100 |\n`;
    });
    md += `\n`;
  });

  md += `## 📈 Análise por Tipo de Cenário\n\n`;
  md += `| Cenário | Testes | Passou | Score Médio |\n`;
  md += `|---------|--------|--------|-------------|\n`;
  analysis.byScenario.forEach(s => {
    md += `| **${s.scenarioType}** | ${s.totalTests} | ${s.passedTests} | ${s.avgScore.toFixed(0)}/100 |\n`;
  });
  md += `\n`;

  md += `## 🐛 Problemas Críticos Identificados\n\n`;
  if (analysis.criticalIssues.length > 0) {
    analysis.criticalIssues.slice(0, 10).forEach((issue, i) => {
      md += `### ${i + 1}. ${issue.issue}\n\n`;
      md += `- **Frequência:** ${issue.count} testes afetados\n`;
      md += `- **Testes:** ${issue.affectedTests.join(', ')}\n\n`;
    });
  } else {
    md += `✅ Nenhum problema crítico identificado!\n\n`;
  }

  md += `## 💡 Recomendações Priorizadas\n\n`;
  analysis.recommendations.forEach((rec, i) => {
    md += `### ${i + 1}. [${rec.priority}] ${rec.description}\n\n`;
    if (rec.affectedPersonas.length > 0) {
      md += `**Personas afetadas:** ${rec.affectedPersonas.join(', ')}\n\n`;
    }
  });

  md += `## 📝 Próximos Passos\n\n`;
  md += `1. Corrigir problemas **P0** (críticos) primeiro\n`;
  md += `2. Ajustar prompts específicos para personas com baixa performance\n`;
  md += `3. Melhorar geração de tópicos para cenários com score < 70\n`;
  md += `4. Re-testar após correções\n\n`;

  md += `---\n\n`;
  md += `*Relatório gerado automaticamente em ${new Date().toISOString()}*\n`;

  return md;
}

/**
 * Main analysis function
 */
export function analyzeTestResults(): void {
  console.log('🔍 Analisando resultados dos testes...\n');

  const results = loadTestResults();

  const analysis: OverallAnalysis = {
    totalTests: results.length,
    totalPassed: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    successRate: 0,
    byPersona: analyzeByPersona(results),
    byScenario: analyzeByScenario(results),
    criticalIssues: identifyCriticalIssues(results),
    recommendations: [],
  };

  analysis.successRate = (analysis.totalPassed / analysis.totalTests) * 100;
  analysis.recommendations = generateRecommendations(analysis);

  // Generate markdown report
  const markdownReport = generateMarkdownReport(analysis);

  // Save report
  const reportsDir = join(__dirname, '../reports');
  const reportFile = join(reportsDir, `persona-study-report-${Date.now()}.md`);
  writeFileSync(reportFile, markdownReport);

  console.log(`\n✅ Análise completa!`);
  console.log(`📄 Relatório salvo em: ${reportFile}`);
  console.log(`\n📊 Resumo:`);
  console.log(`   - Taxa de sucesso: ${analysis.successRate.toFixed(1)}%`);
  console.log(`   - Problemas críticos: ${analysis.criticalIssues.length}`);
  console.log(`   - Recomendações: ${analysis.recommendations.length}`);
}

// Run if called directly
if (require.main === module) {
  analyzeTestResults();
}
