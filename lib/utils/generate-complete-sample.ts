/**
 * Generate a complete sample report using the actual report generation service
 * This ensures all fields are present and correctly typed
 */

import { generateReport } from '../services/report-service';
import { AssessmentData } from '../types';

const sampleAssessmentData: AssessmentData = {
  persona: 'engineering-tech',
  companyInfo: {
    name: 'TechCorp Brasil',
    industry: 'fintech',
    size: '11-50',
    revenue: '>R$ 10M',
    stage: 'scale-up',
    techTeamSize: 50
  },
  aiScope: {
    engineering: true,
    customerService: false,
    sales: false,
    marketing: false,
    operations: false,
    meetingIntelligence: false
  },
  currentState: {
    devTeamSize: 50,
    devSeniority: {
      junior: 15,
      mid: 20,
      senior: 12,
      lead: 3
    },
    currentTools: ['vscode', 'git', 'jira', 'github'],
    deploymentFrequency: 'daily',
    avgCycleTime: 5,
    bugRate: 2.1,
    aiToolsUsage: 'piloting',
    painPoints: ['code-review-bottleneck', 'testing-time', 'tech-debt']
  },
  goals: {
    primaryGoals: ['faster-delivery', 'improve-quality', 'reduce-costs'],
    timeline: '6-months',
    budgetRange: 'R$ 50k-100k',
    successMetrics: ['cycle-time', 'deployment-frequency', 'bug-rate'],
    competitiveThreats: 'Concorrentes já usando AI coding tools'
  },
  contactInfo: {
    fullName: 'Tech Lead Example',
    title: 'Engineering Manager',
    email: 'tech@techcorp.com.br',
    company: 'TechCorp Brasil',
    agreeToContact: true
  },
  submittedAt: new Date('2025-01-15T10:00:00Z')
};

const aiInsights = [
  'Seu perfil de Engineering Leader indica forte foco em qualidade e entrega sustentável',
  'Seu time já tem experiência com AI tools em piloto - excelente ponto de partida',
  'Com deployment frequency diário, vocês já têm cultura de CI/CD madura',
  'Foco em velocity + quality sugere que AI coding terá alto impacto imediato'
];

// Generate complete report
export const COMPLETE_SAMPLE_REPORT = generateReport(sampleAssessmentData, aiInsights);

// Override ID to make it predictable for testing
COMPLETE_SAMPLE_REPORT.id = 'sample-report';
