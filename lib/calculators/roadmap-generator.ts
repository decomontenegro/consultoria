/**
 * Transformation Roadmap Generator
 * Creates customized implementation roadmap based on:
 * - Company goals and timeline
 * - Current maturity level
 * - Industry best practices
 */

import { AssessmentData, RoadmapPhase } from '@/lib/types';

/**
 * Generate roadmap for 3-month timeline (Quick Wins)
 */
function generate3MonthRoadmap(assessment: AssessmentData): RoadmapPhase[] {
  const aiMaturity = assessment.currentState.aiToolsUsage;

  return [
    {
      name: 'Phase 1: Foundation & Pilot',
      duration: '6 weeks',
      objectives: [
        'Train 5-10 early adopters on voice coding fundamentals',
        'Set up AI-assisted code review workflows',
        'Establish baseline metrics (velocity, cycle time, bug rate)',
        'Configure development environment for voice coding',
      ],
      expectedResults: '15-20% productivity increase for pilot team',
    },
    {
      name: 'Phase 2: Scale & Optimize',
      duration: '6 weeks',
      objectives: [
        'Expand training to remaining 50% of team',
        'Implement AI-powered documentation generation',
        'Optimize voice coding templates for your tech stack',
        'Share best practices and success stories',
      ],
      expectedResults: '25% average productivity gain across trained developers',
    },
  ];
}

/**
 * Generate roadmap for 6-month timeline (Pilot Phase)
 */
function generate6MonthRoadmap(assessment: AssessmentData): RoadmapPhase[] {
  return [
    {
      name: 'Phase 1: Assessment & Planning',
      duration: '4 weeks',
      objectives: [
        'Conduct detailed workflow analysis',
        'Identify high-impact use cases for AI coding',
        'Train core team of champions (10-15% of developers)',
        'Set up measurement framework and KPIs',
      ],
      expectedResults: 'Clear baseline and pilot ready to launch',
    },
    {
      name: 'Phase 2: Pilot Deployment',
      duration: '8 weeks',
      objectives: [
        'Full voice coding training for pilot team',
        'Implement AI code review and testing tools',
        'Weekly measurement of productivity metrics',
        'Collect feedback and refine processes',
      ],
      expectedResults: '30% productivity increase in pilot team',
    },
    {
      name: 'Phase 3: Scaled Rollout',
      duration: '12 weeks',
      objectives: [
        'Train remaining 75% of development team',
        'Integrate AI tools into CI/CD pipeline',
        'Deploy AI-assisted documentation system',
        'Establish ongoing training and support',
      ],
      expectedResults: '25% average productivity gain organization-wide',
    },
  ];
}

/**
 * Generate roadmap for 12-month timeline (Full Rollout)
 */
function generate12MonthRoadmap(assessment: AssessmentData): RoadmapPhase[] {
  return [
    {
      name: 'Phase 1: Strategic Planning',
      duration: '6 weeks',
      objectives: [
        'Executive alignment on AI transformation goals',
        'Detailed current-state analysis and gap assessment',
        'Build business case with stakeholder buy-in',
        'Design target operating model for AI-augmented development',
      ],
      expectedResults: 'Approved transformation roadmap with executive sponsorship',
    },
    {
      name: 'Phase 2: Foundation Building',
      duration: '10 weeks',
      objectives: [
        'Train core champions team (15-20% of developers)',
        'Set up AI development infrastructure',
        'Establish baseline metrics and dashboards',
        'Create internal best practice documentation',
      ],
      expectedResults: 'Champion team achieving 35% productivity gains',
    },
    {
      name: 'Phase 3: Departmental Rollout',
      duration: '16 weeks',
      objectives: [
        'Train 60% of development organization',
        'Implement AI-powered code quality gates',
        'Deploy automated documentation and testing',
        'Optimize processes based on pilot learnings',
      ],
      expectedResults: '25-30% productivity improvement across trained teams',
    },
    {
      name: 'Phase 4: Enterprise Scale & Optimization',
      duration: '16 weeks',
      objectives: [
        'Complete training for 100% of developers',
        'Advanced AI workflows (agents, custom models)',
        'Cross-functional integration (Product, QA, DevOps)',
        'Continuous improvement and knowledge sharing',
      ],
      expectedResults: '30-35% sustained productivity gains, 50% faster cycle time',
    },
  ];
}

/**
 * Generate roadmap for 18+ month timeline (Full Transformation)
 */
function generate18MonthRoadmap(assessment: AssessmentData): RoadmapPhase[] {
  return [
    {
      name: 'Phase 1: Strategic Foundation',
      duration: '8 weeks',
      objectives: [
        'Enterprise-wide AI readiness assessment',
        'Build comprehensive transformation business case',
        'Design multi-year AI excellence program',
        'Secure executive sponsorship and budget allocation',
      ],
      expectedResults: 'Board-approved transformation program with multi-year funding',
    },
    {
      name: 'Phase 2: Center of Excellence Launch',
      duration: '12 weeks',
      objectives: [
        'Establish AI Development Center of Excellence',
        'Train 20-25 champions as internal trainers',
        'Build internal certification program',
        'Deploy enterprise AI development platform',
      ],
      expectedResults: 'Self-sustaining CoE delivering 40% productivity gains',
    },
    {
      name: 'Phase 3: Organizational Rollout',
      duration: '24 weeks',
      objectives: [
        'Wave-based training across all departments',
        'Integrate AI into SDLC and governance frameworks',
        'Deploy advanced AI agents for specialized tasks',
        'Establish measurement and continuous improvement',
      ],
      expectedResults: '30% average productivity, 40% faster time-to-market',
    },
    {
      name: 'Phase 4: Innovation & Competitive Advantage',
      duration: '24 weeks',
      objectives: [
        'Custom AI model development for proprietary workflows',
        'AI-driven product innovation initiatives',
        'Industry thought leadership and case studies',
        'Continuous evolution of AI capabilities',
      ],
      expectedResults: 'Industry-leading development practices, measurable competitive edge',
    },
  ];
}

/**
 * Add maturity-specific recommendations to roadmap
 */
function addMaturityRecommendations(phases: RoadmapPhase[], assessment: AssessmentData): RoadmapPhase[] {
  const aiMaturity = assessment.currentState.aiToolsUsage;

  // For companies with NO AI adoption
  if (aiMaturity === 'none') {
    phases[0].objectives.unshift('Address AI skepticism through education and demos');
  }

  // For companies already EXPLORING
  if (aiMaturity === 'exploring' || aiMaturity === 'piloting') {
    phases[0].objectives.unshift('Consolidate existing AI tools into cohesive strategy');
  }

  // For companies in PRODUCTION
  if (aiMaturity === 'production' || aiMaturity === 'mature') {
    phases[0].objectives.unshift('Audit current AI tools for ROI and optimization opportunities');
  }

  return phases;
}

/**
 * Main roadmap generation function
 */
export function generateRoadmap(assessment: AssessmentData): RoadmapPhase[] {
  let roadmap: RoadmapPhase[];

  switch (assessment.goals.timeline) {
    case '3-months':
      roadmap = generate3MonthRoadmap(assessment);
      break;
    case '6-months':
      roadmap = generate6MonthRoadmap(assessment);
      break;
    case '12-months':
      roadmap = generate12MonthRoadmap(assessment);
      break;
    case '18-months':
      roadmap = generate18MonthRoadmap(assessment);
      break;
    default:
      roadmap = generate6MonthRoadmap(assessment);
  }

  // Add maturity-specific recommendations
  return addMaturityRecommendations(roadmap, assessment);
}

/**
 * Generate key recommendations based on assessment
 */
export function generateRecommendations(assessment: AssessmentData): string[] {
  const recommendations: string[] = [];
  const { currentState, goals } = assessment;

  // Deployment frequency recommendations
  if (currentState.deploymentFrequency === 'monthly' || currentState.deploymentFrequency === 'quarterly') {
    recommendations.push('Increase deployment frequency with AI-assisted testing and quality gates');
  }

  // Cycle time recommendations
  if (currentState.avgCycleTime > 14) {
    recommendations.push('Reduce cycle time by 30-40% using voice coding and automated code review');
  }

  // Team size recommendations
  if (currentState.devTeamSize < 10) {
    recommendations.push('Focus on high-impact use cases given small team size - prioritize code generation');
  } else if (currentState.devTeamSize > 50) {
    recommendations.push('Implement phased rollout with champions program for large team');
  }

  // AI maturity recommendations
  if (currentState.aiToolsUsage === 'none' || currentState.aiToolsUsage === 'exploring') {
    recommendations.push('Start with pilot team of 5-10 developers to prove ROI before full rollout');
  }

  // Pain point recommendations
  if (currentState.painPoints?.includes('Slow feature delivery')) {
    recommendations.push('Voice coding can accelerate feature delivery by 25-35% based on McKinsey research');
  }

  if (currentState.painPoints?.includes('High bug rate')) {
    recommendations.push('AI code review reduces production bugs by 30-40% according to GitHub studies');
  }

  if (currentState.painPoints?.includes('Difficulty attracting talent')) {
    recommendations.push('Modern AI tools improve developer satisfaction and help attract top talent');
  }

  // Budget-aligned recommendations
  if (goals.budgetRange === '0-50K' || goals.budgetRange === '50K-200K') {
    recommendations.push('Consider starting with open-source AI tools to minimize upfront investment');
  }

  // Timeline recommendations
  if (goals.timeline === '3-months' && currentState.devTeamSize > 25) {
    recommendations.push('3-month timeline is aggressive for teams >25 - consider 6-month phased approach');
  }

  return recommendations;
}
