/**
 * Debug script to test Business Quiz diagnostic generation
 *
 * Run with: npx tsx tests/debug-business-quiz-completion.ts
 */

import { generateDiagnosticWithLLM } from '../lib/business-quiz/llm-diagnostic-generator';
import type { BusinessQuizContext } from '../lib/business-quiz/types';

async function testDiagnosticGeneration() {
  console.log('🧪 Testing Business Quiz diagnostic generation...\n');

  // Create a minimal mock session with 19 answers
  const mockSession: BusinessQuizContext = {
    sessionId: 'test-session',
    startedAt: new Date(),
    currentBlock: 'risk-scan',
    currentQuestionIndex: 18, // 0-indexed, so 19th question
    answers: [
      // Block 1: Context (7 questions)
      { questionId: 'ctx-1', answerText: 'TechCorp Inc.', timestamp: new Date() },
      { questionId: 'ctx-2', answerText: 'Software de análise de dados', timestamp: new Date() },
      { questionId: 'ctx-3', answerText: '50 funcionários', timestamp: new Date() },
      { questionId: 'ctx-4', answerText: '5 milhões de reais', timestamp: new Date() },
      { questionId: 'ctx-5', answerText: '3 anos', timestamp: new Date() },
      { questionId: 'ctx-6', answerText: 'B2B SaaS', timestamp: new Date() },
      { questionId: 'ctx-7', answerText: 'Crescimento rápido mas com desafios de escalabilidade', timestamp: new Date() },

      // Block 2: Expertise (4 questions)
      { questionId: 'exp-1', answerText: 'Foco em tecnologia e produto', timestamp: new Date() },
      { questionId: 'exp-2', answerText: 'Arquitetura de software e DevOps', timestamp: new Date() },
      { questionId: 'exp-3', answerText: '8 anos em desenvolvimento de software', timestamp: new Date() },
      { questionId: 'exp-4', answerText: 'Muito confiante em tecnologia, menos em vendas', timestamp: new Date() },

      // Block 3: Deep-dive (5 questions)
      { questionId: 'deep-1', answerText: 'Stack: React, Node.js, PostgreSQL, AWS', timestamp: new Date() },
      { questionId: 'deep-2', answerText: 'CI/CD com GitHub Actions, monitoramento com Datadog', timestamp: new Date() },
      { questionId: 'deep-3', answerText: 'Dívida técnica acumulada, falta de documentação', timestamp: new Date() },
      { questionId: 'deep-4', answerText: 'Equipe pequena, todos generalistas', timestamp: new Date() },
      { questionId: 'deep-5', answerText: 'Precisamos escalar sem aumentar muito o time', timestamp: new Date() },

      // Block 4: Risk Scan (3 questions)
      { questionId: 'risk-1', answerText: 'Vendas inconsistentes, pipeline pequeno', timestamp: new Date() },
      { questionId: 'risk-2', answerText: 'Não temos um CFO dedicado, controles financeiros básicos', timestamp: new Date() },
      { questionId: 'risk-3', answerText: 'Processos manuais em várias áreas', timestamp: new Date() },
    ],
    extractedData: {
      company: {
        name: 'TechCorp Inc.',
        industry: 'Software de análise de dados',
        size: '50 funcionários',
        stage: '3 anos',
        businessModel: 'B2B SaaS',
        revenue: '5 milhões de reais',
      },
      expertise: {
        area: 'technology',
        confidence: 0.85,
        reasoning: 'Strong technical background and focus on technology/product',
      },
      deepDiveInsights: {
        technology: {
          strengths: ['Modern stack', 'CI/CD pipeline', 'Cloud infrastructure'],
          weaknesses: ['Technical debt', 'Lack of documentation', 'Small generalist team'],
          opportunities: ['Automation', 'Better architecture', 'Team specialization'],
        },
      },
      riskAreas: {
        areas: ['sales', 'finance', 'processes'],
        reasoning: {
          sales: 'Inconsistent sales, small pipeline',
          finance: 'No dedicated CFO, basic controls',
          processes: 'Manual processes across areas',
        },
      },
    },
  };

  console.log('📋 Mock session created with 19 answers');
  console.log(`   Company: ${mockSession.extractedData.company.name}`);
  console.log(`   Expertise: ${mockSession.extractedData.expertise.area}`);
  console.log(`   Risk areas: ${mockSession.extractedData.riskAreas.areas.join(', ')}\n`);

  try {
    console.log('⏱️  Starting diagnostic generation (this may take 30-60 seconds)...\n');

    const startTime = Date.now();
    const diagnostic = await generateDiagnosticWithLLM(mockSession);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ Diagnostic generated successfully in ${duration}s!`);
    console.log(`   Diagnostic ID: ${diagnostic.id}`);
    console.log(`   Overall Score: ${diagnostic.overallScore}/100`);
    console.log(`   Health Scores: ${diagnostic.healthScores.length} areas`);
    console.log(`   Recommendations: ${diagnostic.recommendations.length} actions`);
    console.log(`   Roadmap phases: ${diagnostic.roadmap.phases.length}\n`);

    console.log('📊 Sample Health Scores:');
    diagnostic.healthScores.slice(0, 3).forEach(area => {
      console.log(`   - ${area.area}: ${area.score}/100 (${area.status})`);
    });

    console.log('\n🎯 Sample Recommendations:');
    diagnostic.recommendations.slice(0, 2).forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority}] ${rec.title}`);
    });

    console.log('\n✅ Test completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Diagnostic generation failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack?.split('\n').slice(0, 3).join('\n   ')}`);

    if (error.message.includes('ANTHROPIC_API_KEY')) {
      console.error('\n⚠️  API key issue detected. Check your .env.local file.');
    } else if (error.message.includes('timeout')) {
      console.error('\n⚠️  Timeout detected. The LLM call may be taking too long.');
    }

    process.exit(1);
  }
}

// Run the test
testDiagnosticGeneration().catch(console.error);
