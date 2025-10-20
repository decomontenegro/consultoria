/**
 * Triage Engine - AI Readiness Urgency Classification
 *
 * Inspired by healthcare triage systems, this engine classifies companies
 * by urgency level to route them through appropriate paths:
 *
 * - CRITICAL (90-100): Immediate sales engagement needed
 * - HIGH (70-89): Fast-track assessment + consultation
 * - STANDARD (50-69): Standard flow
 * - EXPLORATORY (0-49): Educational content first
 */

import {
  UserPersona,
  CompanyInfo,
  CurrentState,
  Goals,
  NonTechCurrentState,
  NonTechGoals
} from './types';

export type UrgencyLevel = 'critical' | 'high' | 'standard' | 'exploratory';
export type RecommendedPath = 'fast-track' | 'standard' | 'educational';

export interface TriageResult {
  score: number; // 0-100
  urgencyLevel: UrgencyLevel;
  recommendedPath: RecommendedPath;
  reasoning: string[];
  urgencyIndicators: {
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    points: number;
  }[];
  quickWins: string[]; // Immediate actionable items
  timeline: {
    recommended: string;
    rationale: string;
  };
  routingRecommendation: {
    action: string;
    reason: string;
  };
}

/**
 * Calculate triage score based on assessment data
 */
export function calculateTriageScore(
  persona: UserPersona,
  companyInfo: Partial<CompanyInfo>,
  currentState: Partial<CurrentState> | Partial<NonTechCurrentState>,
  goals: Partial<Goals> | Partial<NonTechGoals>
): TriageResult {
  let score = 0;
  const reasoning: string[] = [];
  const urgencyIndicators: TriageResult['urgencyIndicators'] = [];
  const quickWins: string[] = [];

  // 1. PERSONA URGENCY (0-15 points)
  const personaScore = scorePersona(persona);
  score += personaScore.points;
  if (personaScore.points > 0) {
    reasoning.push(personaScore.reason);
    if (personaScore.points >= 12) {
      urgencyIndicators.push({
        category: 'Decision Maker Level',
        severity: 'high',
        description: personaScore.reason,
        points: personaScore.points
      });
    }
  }

  // 2. COMPANY SIZE & SCALE (0-20 points)
  const sizeScore = scoreCompanySize(companyInfo);
  score += sizeScore.points;
  if (sizeScore.points > 0) {
    reasoning.push(sizeScore.reason);
    if (sizeScore.points >= 15) {
      urgencyIndicators.push({
        category: 'Company Scale',
        severity: 'high',
        description: sizeScore.reason,
        points: sizeScore.points
      });
    }
  }

  // 3. CURRENT PAIN SEVERITY (0-30 points) - HIGHEST WEIGHT
  const painScore = scorePainPoints(currentState);
  score += painScore.points;
  reasoning.push(...painScore.reasons);
  urgencyIndicators.push(...painScore.indicators);
  quickWins.push(...painScore.quickWins);

  // 4. TIMELINE URGENCY (0-20 points)
  const timelineScore = scoreTimeline(goals);
  score += timelineScore.points;
  if (timelineScore.points > 0) {
    reasoning.push(timelineScore.reason);
    if (timelineScore.points >= 15) {
      urgencyIndicators.push({
        category: 'Timeline Pressure',
        severity: timelineScore.points >= 20 ? 'critical' : 'high',
        description: timelineScore.reason,
        points: timelineScore.points
      });
    }
  }

  // 5. COMPETITIVE THREAT (0-15 points)
  const competitiveScore = scoreCompetitiveThreats(currentState, goals);
  score += competitiveScore.points;
  if (competitiveScore.points > 0) {
    reasoning.push(competitiveScore.reason);
    if (competitiveScore.points >= 10) {
      urgencyIndicators.push({
        category: 'Competitive Risk',
        severity: competitiveScore.points >= 15 ? 'critical' : 'high',
        description: competitiveScore.reason,
        points: competitiveScore.points
      });
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Determine urgency level and path
  const urgencyLevel = getUrgencyLevel(score);
  const recommendedPath = getRecommendedPath(urgencyLevel);

  // Generate timeline recommendation
  const timeline = generateTimelineRecommendation(score, goals);

  // Generate routing recommendation
  const routingRecommendation = generateRoutingRecommendation(
    score,
    urgencyLevel,
    persona,
    companyInfo
  );

  return {
    score,
    urgencyLevel,
    recommendedPath,
    reasoning,
    urgencyIndicators: urgencyIndicators.sort((a, b) => b.points - a.points), // Sort by severity
    quickWins,
    timeline,
    routingRecommendation
  };
}

/**
 * Score based on decision-maker level
 */
function scorePersona(persona: UserPersona): { points: number; reason: string } {
  switch (persona) {
    case 'board-executive':
      return {
        points: 15,
        reason: 'C-Level/Board member - strategic decision-maker with budget authority'
      };
    case 'finance-ops':
      return {
        points: 12,
        reason: 'Finance/Ops executive - controls budget allocation and ROI approval'
      };
    case 'product-business':
      return {
        points: 10,
        reason: 'Product/Business leader - influences strategic technology investments'
      };
    case 'engineering-tech':
      return {
        points: 8,
        reason: 'Engineering leader - technical authority but may need exec buy-in'
      };
    case 'it-devops':
      return {
        points: 6,
        reason: 'IT/DevOps manager - operational decision-maker with limited budget authority'
      };
    default:
      return { points: 0, reason: '' };
  }
}

/**
 * Score based on company size and revenue
 */
function scoreCompanySize(companyInfo: Partial<CompanyInfo>): { points: number; reason: string } {
  let points = 0;
  let reason = '';

  if (companyInfo.size === 'enterprise') {
    points += 20;
    reason = 'Enterprise company - high-value opportunity with significant potential impact';
  } else if (companyInfo.size === 'scaleup') {
    points += 12;
    reason = 'Scaleup company - rapid growth phase, ideal time for AI transformation';
  } else if (companyInfo.size === 'startup') {
    points += 5;
    reason = 'Startup - early stage, good for building AI-native culture';
  }

  // Bonus for high revenue (if provided)
  if (companyInfo.revenue) {
    if (companyInfo.revenue.includes('100M+') || companyInfo.revenue.includes('50M-100M')) {
      points += 5;
      reason += ' with substantial revenue';
    }
  }

  return { points: Math.min(points, 20), reason };
}

/**
 * Score pain severity (highest weight)
 */
function scorePainPoints(
  currentState: Partial<CurrentState> | Partial<NonTechCurrentState>
): {
  points: number;
  reasons: string[];
  indicators: TriageResult['urgencyIndicators'];
  quickWins: string[];
} {
  let points = 0;
  const reasons: string[] = [];
  const indicators: TriageResult['urgencyIndicators'] = [];
  const quickWins: string[] = [];

  // Check if it's technical or non-technical state
  const isTechnical = 'painPoints' in currentState;

  if (isTechnical) {
    const techState = currentState as Partial<CurrentState>;

    // Critical pain: Very slow deployment
    if (
      techState.deploymentFrequency?.includes('monthly') ||
      techState.deploymentFrequency?.includes('quarterly')
    ) {
      points += 10;
      reasons.push('Very slow deployment frequency indicates systemic bottlenecks');
      indicators.push({
        category: 'Deployment Velocity',
        severity: 'critical',
        description: `Deploying ${techState.deploymentFrequency} - significantly slower than industry standard`,
        points: 10
      });
      quickWins.push('Implement CI/CD pipeline automation');
    }

    // Critical pain: Long cycle time
    if (techState.avgCycleTime && techState.avgCycleTime > 14) {
      const cyclePoints = techState.avgCycleTime > 30 ? 10 : 7;
      points += cyclePoints;
      reasons.push(`${techState.avgCycleTime}-day cycle time is killing innovation speed`);
      indicators.push({
        category: 'Development Velocity',
        severity: techState.avgCycleTime > 30 ? 'critical' : 'high',
        description: `Average cycle time of ${techState.avgCycleTime} days`,
        points: cyclePoints
      });
      quickWins.push('Use AI coding assistants to reduce development time');
    }

    // Pain points analysis
    if (techState.painPoints && techState.painPoints.length > 0) {
      const criticalPains = [
        'Bugs em produção frequentes',
        'Dependência de desenvolvedores-chave',
        'Dificuldade em contratar/reter talentos'
      ];

      techState.painPoints.forEach(pain => {
        if (criticalPains.includes(pain)) {
          points += 5;
          reasons.push(`Critical issue: ${pain}`);
          indicators.push({
            category: 'Operational Risk',
            severity: 'high',
            description: pain,
            points: 5
          });

          if (pain.includes('Bugs')) {
            quickWins.push('Implement AI-powered code review and testing');
          }
          if (pain.includes('talentos')) {
            quickWins.push('Modernize tech stack to attract/retain developers');
          }
        }
      });

      // Bonus for multiple pain points
      if (techState.painPoints.length >= 3) {
        points += 5;
        reasons.push('Multiple critical pain points indicate urgent need for transformation');
      }
    }

    // AI adoption lag
    if (techState.aiToolsUsage === 'none' || techState.aiToolsUsage === 'exploring') {
      points += 5;
      reasons.push('No AI tools in use - falling behind competitors');
      quickWins.push('Start pilot with GitHub Copilot or Cursor');
    }

  } else {
    // Non-technical state
    const nonTechState = currentState as Partial<NonTechCurrentState>;

    if (nonTechState.deliverySpeed === 'very-slow' || nonTechState.deliverySpeed === 'slow') {
      points += 10;
      reasons.push('Slow delivery to market is impacting competitiveness');
      indicators.push({
        category: 'Time-to-Market',
        severity: 'critical',
        description: 'Delivery speed is slow',
        points: 10
      });
      quickWins.push('Accelerate development with AI coding tools');
    }

    if (nonTechState.techCompetitiveness === 'behind') {
      points += 10;
      reasons.push('Falling behind competitors in tech capabilities');
      indicators.push({
        category: 'Competitive Position',
        severity: 'critical',
        description: 'Technology competitiveness is behind market',
        points: 10
      });
      quickWins.push('AI transformation to close technology gap');
    }

    if (nonTechState.talentAttraction === 'difficult') {
      points += 5;
      reasons.push('Difficulty attracting talent indicates outdated practices');
      quickWins.push('Modernize with AI tools to become more attractive to talent');
    }

    if (nonTechState.innovationLevel === 'low') {
      points += 5;
      reasons.push('Low innovation level threatens long-term growth');
      quickWins.push('Use AI to accelerate innovation cycles');
    }
  }

  return {
    points: Math.min(points, 30),
    reasons,
    indicators,
    quickWins
  };
}

/**
 * Score timeline urgency
 */
function scoreTimeline(
  goals: Partial<Goals> | Partial<NonTechGoals>
): { points: number; reason: string } {
  if (!goals.timeline) return { points: 0, reason: '' };

  switch (goals.timeline) {
    case '3-months':
      return {
        points: 20,
        reason: '3-month timeline is extremely aggressive - immediate action required'
      };
    case '6-months':
      return {
        points: 15,
        reason: '6-month timeline requires fast-track implementation'
      };
    case '12-months':
      return {
        points: 8,
        reason: '12-month timeline allows for structured approach'
      };
    case '18-months':
      return {
        points: 4,
        reason: '18-month timeline provides flexibility for comprehensive transformation'
      };
    default:
      return { points: 0, reason: '' };
  }
}

/**
 * Score competitive threats
 */
function scoreCompetitiveThreats(
  currentState: Partial<CurrentState> | Partial<NonTechCurrentState>,
  goals: Partial<Goals> | Partial<NonTechGoals>
): { points: number; reason: string } {
  let points = 0;

  // Check for competitive threats in goals
  const goalsWithCompetitive = goals as Partial<Goals>;
  if (goalsWithCompetitive.competitiveThreats) {
    points += 15;
    return {
      points,
      reason: 'Explicit competitive threats mentioned - market pressure is high'
    };
  }

  // Check business challenges for competitive mentions
  const nonTechState = currentState as Partial<NonTechCurrentState>;
  if (nonTechState.businessChallenges) {
    const hasCompetitivePressure = nonTechState.businessChallenges.some(
      c => c.toLowerCase().includes('competitiv') || c.toLowerCase().includes('concorrên')
    );
    if (hasCompetitivePressure) {
      points += 12;
      return {
        points,
        reason: 'Competitive pressure identified in business challenges'
      };
    }
  }

  return { points, reason: '' };
}

/**
 * Convert score to urgency level
 */
function getUrgencyLevel(score: number): UrgencyLevel {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 50) return 'standard';
  return 'exploratory';
}

/**
 * Get recommended assessment path
 */
function getRecommendedPath(urgencyLevel: UrgencyLevel): RecommendedPath {
  switch (urgencyLevel) {
    case 'critical':
    case 'high':
      return 'fast-track';
    case 'standard':
      return 'standard';
    case 'exploratory':
      return 'educational';
  }
}

/**
 * Generate timeline recommendation
 */
function generateTimelineRecommendation(
  score: number,
  goals: Partial<Goals> | Partial<NonTechGoals>
): TriageResult['timeline'] {
  if (score >= 90) {
    return {
      recommended: 'Immediate action (0-3 months)',
      rationale:
        'Critical urgency detected. Recommend fast-track implementation with executive sponsorship.'
    };
  }

  if (score >= 70) {
    return {
      recommended: 'Fast-track (3-6 months)',
      rationale:
        'High urgency identified. Accelerated timeline recommended to address pain points quickly.'
    };
  }

  if (score >= 50) {
    return {
      recommended: 'Standard (6-12 months)',
      rationale:
        'Standard urgency. Structured approach with phased rollout recommended.'
    };
  }

  return {
    recommended: 'Educational phase (12+ months)',
    rationale:
      'Lower urgency detected. Focus on education and pilot programs before full commitment.'
  };
}

/**
 * Generate routing recommendation for sales/marketing
 */
function generateRoutingRecommendation(
  score: number,
  urgencyLevel: UrgencyLevel,
  persona: UserPersona,
  companyInfo: Partial<CompanyInfo>
): TriageResult['routingRecommendation'] {
  const isExecutive = persona === 'board-executive' || persona === 'finance-ops';
  const isEnterprise = companyInfo.size === 'enterprise';

  if (score >= 90 && isExecutive) {
    return {
      action: 'IMMEDIATE SALES CALL',
      reason:
        'Critical urgency + C-Level contact. Priority 1 lead - engage within 24 hours for consultative selling.'
    };
  }

  if (score >= 85 && isEnterprise) {
    return {
      action: 'PRIORITY SALES ENGAGEMENT',
      reason:
        'High urgency enterprise lead. Schedule strategic consultation within 48 hours.'
    };
  }

  if (score >= 70) {
    return {
      action: 'FAST-TRACK CONSULTATION',
      reason:
        'High urgency detected. Offer expedited AI consultation and custom roadmap.'
    };
  }

  if (score >= 50) {
    return {
      action: 'STANDARD NURTURE',
      reason:
        'Standard urgency. Send full report + follow-up email sequence for consideration.'
    };
  }

  return {
    action: 'EDUCATIONAL CONTENT',
    reason:
      'Lower urgency. Focus on education - send case studies, webinar invites, and AI readiness content.'
  };
}

/**
 * Get color/style for urgency level
 */
export function getUrgencyStyle(urgencyLevel: UrgencyLevel): {
  color: string;
  bg: string;
  border: string;
  label: string;
} {
  switch (urgencyLevel) {
    case 'critical':
      return {
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        label: 'CRÍTICO'
      };
    case 'high':
      return {
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        label: 'ALTO'
      };
    case 'standard':
      return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        label: 'PADRÃO'
      };
    case 'exploratory':
      return {
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        label: 'EXPLORATÓRIO'
      };
  }
}
