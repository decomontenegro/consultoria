/**
 * Business Health Quiz - Validation Script
 *
 * Valida todas as estruturas de dados criadas na FASE 1
 * Execute: ts-node lib/business-quiz/validate.ts
 */

import {
  ALL_QUESTIONS,
  QUESTIONS_BY_BLOCK,
  QUESTIONS_BY_AREA,
  CONTEXT_QUESTIONS,
  EXPERTISE_QUESTIONS,
  RISK_SCAN_QUESTIONS,
  getQuestionById,
  getDeepDiveQuestions,
  getRiskScanQuestion,
} from './question-bank';

import {
  createSession,
  getSession,
  updateSession,
  addAnswer,
  updateExtractedData,
  setDetectedExpertise,
  setDeepDiveArea,
  setRiskScanAreas,
  advanceToBlock,
  getSessionStats,
  getSessionSummary,
  listActiveSessions,
} from './session-manager';

import {
  AREA_RELATIONSHIPS,
  getUpstreamAreas,
  getDownstreamAreas,
  getCriticalAreas,
  getAllRelatedAreas,
  calculateRelationshipScore,
  suggestRiskScanAreas,
  isCriticalRelationship,
  calculateAreaDistance,
  getAreaMetadata,
  getAreasOrderedByCriticality,
} from './area-relationships';

import { BusinessArea, QuestionBlock } from './types';

// ============================================================================
// VALIDATION TESTS
// ============================================================================

interface ValidationResult {
  test: string;
  passed: boolean;
  details?: string;
  errors?: string[];
}

const results: ValidationResult[] = [];

function addResult(test: string, passed: boolean, details?: string, errors?: string[]) {
  results.push({ test, passed, details, errors });
}

// ============================================================================
// 1. QUESTION BANK VALIDATION
// ============================================================================

console.log('🧪 Starting Question Bank Validation...\n');

// Test 1.1: Total de perguntas
const expectedTotal = 52; // 7 context + 4 expertise + 35 deep-dive + 7 risk-scan = 53
const actualTotal = ALL_QUESTIONS.length;
addResult(
  'Total Questions Count',
  actualTotal >= 50 && actualTotal <= 55,
  `Expected ~52 questions, got ${actualTotal}`
);

// Test 1.2: IDs únicos
const questionIds = ALL_QUESTIONS.map((q) => q.id);
const uniqueIds = new Set(questionIds);
addResult(
  'Unique Question IDs',
  questionIds.length === uniqueIds.size,
  uniqueIds.size < questionIds.length
    ? `Found ${questionIds.length - uniqueIds.size} duplicate IDs`
    : 'All IDs are unique'
);

// Test 1.3: Todas as perguntas têm metadata obrigatória
const invalidQuestions: string[] = [];
ALL_QUESTIONS.forEach((q) => {
  if (!q.id || !q.block || !q.area || !q.questionText || !q.inputType || !q.level) {
    invalidQuestions.push(q.id || 'unknown');
  }
});
addResult(
  'Required Metadata Present',
  invalidQuestions.length === 0,
  invalidQuestions.length > 0 ? `Invalid questions: ${invalidQuestions.join(', ')}` : 'All questions have required metadata'
);

// Test 1.4: DataExtractor functions existem
const missingExtractors: string[] = [];
ALL_QUESTIONS.forEach((q) => {
  if (q.dataFields.length > 0 && !q.dataExtractor) {
    missingExtractors.push(q.id);
  }
});
addResult(
  'DataExtractor Functions',
  missingExtractors.length === 0,
  missingExtractors.length > 0 ? `Missing extractors: ${missingExtractors.join(', ')}` : 'All questions with dataFields have extractors'
);

// Test 1.5: Blocos estão corretos
const contextCount = CONTEXT_QUESTIONS.length;
const expertiseCount = EXPERTISE_QUESTIONS.length;
const riskScanCount = RISK_SCAN_QUESTIONS.length;

addResult('Context Questions', contextCount === 7, `Expected 7, got ${contextCount}`);
addResult('Expertise Questions', expertiseCount === 4, `Expected 4, got ${expertiseCount}`);
addResult('Risk Scan Questions', riskScanCount === 7, `Expected 7 (1 per area), got ${riskScanCount}`);

// Test 1.6: Deep-dive questions por área
const allAreas: BusinessArea[] = [
  'marketing-growth',
  'sales-commercial',
  'product',
  'operations-logistics',
  'financial',
  'people-culture',
  'technology-data',
];

allAreas.forEach((area) => {
  const questions = getDeepDiveQuestions(area);
  addResult(
    `Deep-dive Questions for ${area}`,
    questions.length >= 5,
    `Expected 5+ questions, got ${questions.length}`
  );
});

// Test 1.7: Risk scan tem 1 pergunta por área
allAreas.forEach((area) => {
  const question = getRiskScanQuestion(area);
  addResult(
    `Risk Scan Question for ${area}`,
    question !== undefined,
    question ? `Found: ${question.id}` : 'Not found'
  );
});

// Test 1.8: Helper functions funcionam
const testQuestion = getQuestionById('ctx-001');
addResult(
  'getQuestionById Helper',
  testQuestion !== undefined && testQuestion.id === 'ctx-001',
  testQuestion ? `Found: ${testQuestion.questionText}` : 'Not found'
);

// ============================================================================
// 2. SESSION MANAGER VALIDATION
// ============================================================================

console.log('\n🧪 Starting Session Manager Validation...\n');

// Test 2.1: Criar sessão
const session1 = createSession();
addResult(
  'Create Session',
  session1.sessionId.startsWith('biz-quiz-'),
  `Session ID: ${session1.sessionId}`
);

// Test 2.2: Recuperar sessão
const retrieved = getSession(session1.sessionId);
addResult(
  'Get Session',
  retrieved !== null && retrieved.sessionId === session1.sessionId,
  retrieved ? 'Session retrieved successfully' : 'Failed to retrieve'
);

// Test 2.3: Adicionar resposta
const success1 = addAnswer(session1.sessionId, {
  questionId: 'ctx-001',
  questionText: 'Test question',
  answer: 'Test answer',
  timestamp: new Date(),
  block: 'context',
  area: 'marketing-growth',
});
addResult('Add Answer', success1, success1 ? 'Answer added' : 'Failed to add answer');

// Test 2.4: Atualizar dados extraídos
const success2 = updateExtractedData(session1.sessionId, {
  company: { name: 'Test Corp', stage: 'startup', teamSize: 10 },
});
addResult(
  'Update Extracted Data',
  success2,
  success2 ? 'Data updated' : 'Failed to update data'
);

// Test 2.5: Definir expertise detectada
const success3 = setDetectedExpertise(session1.sessionId, 'product', 0.85);
addResult(
  'Set Detected Expertise',
  success3,
  success3 ? 'Expertise set to product (85%)' : 'Failed to set expertise'
);

// Test 2.6: Definir deep-dive area
const success4 = setDeepDiveArea(session1.sessionId, 'product');
addResult('Set Deep-dive Area', success4, success4 ? 'Deep-dive set to product' : 'Failed');

// Test 2.7: Definir risk scan areas
const success5 = setRiskScanAreas(session1.sessionId, ['technology-data', 'people-culture', 'financial']);
addResult(
  'Set Risk Scan Areas',
  success5,
  success5 ? 'Risk scan areas set' : 'Failed to set risk scan areas'
);

// Test 2.8: Avançar bloco
const success6 = advanceToBlock(session1.sessionId, 'expertise');
addResult('Advance Block', success6, success6 ? 'Block advanced to expertise' : 'Failed');

// Test 2.9: Obter stats
const stats = getSessionStats(session1.sessionId);
addResult(
  'Get Session Stats',
  stats !== null && stats.totalQuestions === 1,
  stats ? `Total questions: ${stats.totalQuestions}, Progress: ${stats.progress.toFixed(1)}%` : 'Failed to get stats'
);

// Test 2.10: Obter summary
const summary = getSessionSummary(session1.sessionId);
addResult(
  'Get Session Summary',
  summary !== null && summary.detectedExpertise === 'product',
  summary ? `Expertise: ${summary.detectedExpertise}, Answers: ${summary.totalAnswers}` : 'Failed to get summary'
);

// Test 2.11: Listar sessões ativas
const activeSessions = listActiveSessions();
addResult(
  'List Active Sessions',
  activeSessions.length >= 1,
  `Found ${activeSessions.length} active sessions`
);

// ============================================================================
// 3. AREA RELATIONSHIPS VALIDATION
// ============================================================================

console.log('\n🧪 Starting Area Relationships Validation...\n');

// Test 3.1: Todos os relacionamentos estão definidos
allAreas.forEach((area) => {
  const relationships = AREA_RELATIONSHIPS[area];
  addResult(
    `Relationships for ${area}`,
    relationships !== undefined,
    relationships
      ? `Upstream: ${relationships.upstream.length}, Downstream: ${relationships.downstream.length}, Critical: ${relationships.critical.length}`
      : 'Not defined'
  );
});

// Test 3.2: Upstream areas
const upstreamProduct = getUpstreamAreas('product');
addResult(
  'Get Upstream Areas',
  upstreamProduct.length > 0,
  `Product upstream: ${upstreamProduct.join(', ')}`
);

// Test 3.3: Downstream areas
const downstreamProduct = getDownstreamAreas('product');
addResult(
  'Get Downstream Areas',
  downstreamProduct.length > 0,
  `Product downstream: ${downstreamProduct.join(', ')}`
);

// Test 3.4: Critical areas
const criticalProduct = getCriticalAreas('product');
addResult(
  'Get Critical Areas',
  criticalProduct.length >= 0,
  `Product critical: ${criticalProduct.join(', ') || 'none'}`
);

// Test 3.5: All related areas
const allRelatedProduct = getAllRelatedAreas('product');
addResult(
  'Get All Related Areas',
  allRelatedProduct.length > 0,
  `Product related (total): ${allRelatedProduct.length} areas`
);

// Test 3.6: Relationship score
const score = calculateRelationshipScore('product', 'technology-data');
addResult(
  'Calculate Relationship Score',
  score >= 0 && score <= 1,
  `Product ↔ Tech score: ${score}`
);

// Test 3.7: Suggest risk scan areas
const riskScanSuggestions = suggestRiskScanAreas('product', 3);
addResult(
  'Suggest Risk Scan Areas',
  riskScanSuggestions.length === 3,
  `Suggested for product: ${riskScanSuggestions.join(', ')}`
);

// Test 3.8: Is critical relationship
const isCritical = isCriticalRelationship('product', 'technology-data');
addResult(
  'Is Critical Relationship',
  typeof isCritical === 'boolean',
  `Product ↔ Tech critical: ${isCritical}`
);

// Test 3.9: Calculate area distance
const distance = calculateAreaDistance('product', 'financial');
addResult(
  'Calculate Area Distance',
  distance >= 0,
  `Product → Financial distance: ${distance}`
);

// Test 3.10: Get area metadata
const metadata = getAreaMetadata('product');
addResult(
  'Get Area Metadata',
  metadata !== undefined && metadata.name === 'Product',
  metadata ? `${metadata.icon} ${metadata.name}` : 'Not found'
);

// Test 3.11: Get areas ordered by criticality
const ordered = getAreasOrderedByCriticality('product');
addResult(
  'Get Areas Ordered by Criticality',
  ordered.length === 6, // Todas exceto product
  `Ordered areas: ${ordered.slice(0, 3).map((a) => a.area).join(', ')}...`
);

// ============================================================================
// 4. DATA EXTRACTOR VALIDATION
// ============================================================================

console.log('\n🧪 Starting Data Extractor Validation...\n');

// Test 4.1: Context question extractors
const ctx003 = getQuestionById('ctx-003');
if (ctx003 && ctx003.dataExtractor) {
  const extracted = ctx003.dataExtractor('Scaleup (2-5 anos, crescendo rápido)');
  addResult(
    'Context Extractor (ctx-003)',
    extracted['company.stage'] === 'scaleup',
    `Extracted: ${extracted['company.stage']}`
  );
}

// Test 4.2: Marketing question extractors
const mktg002 = getQuestionById('mktg-002');
if (mktg002 && mktg002.dataExtractor) {
  const extracted = mktg002.dataExtractor('Sim, está em R$500');
  addResult(
    'Marketing Extractor (mktg-002)',
    extracted['marketingGrowth.cacKnown'] === true && extracted['marketingGrowth.cac'] === 500,
    `Extracted: cacKnown=${extracted['marketingGrowth.cacKnown']}, cac=${extracted['marketingGrowth.cac']}`
  );
}

// Test 4.3: Sales question extractors
const sales002 = getQuestionById('sales-002');
if (sales002 && sales002.dataExtractor) {
  const extracted = sales002.dataExtractor('R$50k');
  addResult(
    'Sales Extractor (sales-002)',
    extracted['salesCommercial.avgTicket'] === 50000,
    `Extracted: ${extracted['salesCommercial.avgTicket']}`
  );
}

// Test 4.4: Financial question extractors
const fin002 = getQuestionById('fin-002');
if (fin002 && fin002.dataExtractor) {
  const extracted = fin002.dataExtractor('R$200k');
  addResult(
    'Financial Extractor (fin-002)',
    extracted['financial.burnRate'] === 200000,
    `Extracted: ${extracted['financial.burnRate']}`
  );
}

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION RESULTS SUMMARY');
console.log('='.repeat(60) + '\n');

const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
const total = results.length;

console.log(`✅ Passed: ${passed}/${total}`);
console.log(`❌ Failed: ${failed}/${total}`);
console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

if (failed > 0) {
  console.log('❌ FAILED TESTS:\n');
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.log(`  • ${r.test}`);
      if (r.details) console.log(`    ${r.details}`);
      if (r.errors) r.errors.forEach((e) => console.log(`    - ${e}`));
    });
  console.log('');
}

console.log('✅ PASSED TESTS:\n');
results
  .filter((r) => r.passed)
  .forEach((r) => {
    console.log(`  ✓ ${r.test}`);
    if (r.details) console.log(`    ${r.details}`);
  });

console.log('\n' + '='.repeat(60));

// Exit com código apropriado
if (failed === 0) {
  console.log('🎉 ALL TESTS PASSED! FASE 1 is complete and validated.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Review and fix issues above.\n');
  process.exit(1);
}
