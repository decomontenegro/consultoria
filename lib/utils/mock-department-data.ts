/**
 * Mock Department Data Generator
 * Generates intelligent mock data for multi-departmental assessment
 * based on company size and industry
 */

import {
  CustomerServiceState,
  SalesState,
  MarketingState,
  MeetingGovernanceState,
  OperationsState,
} from '@/lib/types';

interface MockDepartmentData {
  customerService: CustomerServiceState;
  sales: SalesState;
  marketing: MarketingState;
  meetingIntelligence: MeetingGovernanceState;
  operations: OperationsState;
}

/**
 * Generate mock department data based on company size
 */
export function generateMockDepartmentData(
  companySize: 'startup' | 'scaleup' | 'enterprise',
  industry: string
): MockDepartmentData {
  // Size-based multipliers
  const sizeMultipliers = {
    startup: { team: 1, volume: 1, cost: 1 },
    scaleup: { team: 3, volume: 5, cost: 1.5 },
    enterprise: { team: 10, volume: 20, cost: 2 },
  };

  const multiplier = sizeMultipliers[companySize];

  // Customer Service mock data
  const customerService: CustomerServiceState = {
    teamSize: Math.round(5 * multiplier.team),
    monthlyTicketVolume: Math.round(500 * multiplier.volume),
    avgFirstResponseTime: 240, // 4 hours (conservative baseline)
    firstContactResolution: 45, // 45% resolution rate
    costPerInteraction: 4.5, // R$ 4.50 per interaction (conservative)
    channelsSupported: companySize === 'startup'
      ? ['email', 'chat']
      : companySize === 'scaleup'
      ? ['email', 'chat', 'phone']
      : ['email', 'chat', 'phone', 'social'],
    automationLevel: companySize === 'enterprise' ? 'moderate' : 'basic',
  };

  // Sales mock data
  const sales: SalesState = {
    salesTeamSize: Math.round(8 * multiplier.team),
    avgSalesCycle: companySize === 'enterprise' ? 90 : companySize === 'scaleup' ? 45 : 30,
    leadConversionRate: 15, // 15% conversion rate
    avgLeadsPerRep: Math.round(50 * multiplier.volume / multiplier.team),
    timeOnAdminTasks: 35, // 35% of time on admin
    crmUsage: companySize === 'enterprise' ? 'advanced' : companySize === 'scaleup' ? 'basic' : 'none',
    avgDealSize: companySize === 'enterprise' ? 150000 : companySize === 'scaleup' ? 50000 : 15000,
  };

  // Marketing mock data
  const marketing: MarketingState = {
    marketingTeamSize: Math.round(4 * multiplier.team),
    campaignsPerMonth: companySize === 'enterprise' ? 12 : companySize === 'scaleup' ? 6 : 3,
    contentCreationHours: Math.round(20 * multiplier.team),
    cac: companySize === 'enterprise' ? 800 : companySize === 'scaleup' ? 400 : 200,
    leadGenerationRate: Math.round(200 * multiplier.volume),
    automationUsage: companySize === 'enterprise' ? 'moderate' : companySize === 'scaleup' ? 'basic' : 'none',
  };

  // Meeting Intelligence & Governance mock data
  const meetingIntelligence: MeetingGovernanceState = {
    executiveTeamSize: companySize === 'enterprise' ? 8 : companySize === 'scaleup' ? 4 : 2,
    avgMeetingHoursPerWeek: companySize === 'enterprise' ? 15 : companySize === 'scaleup' ? 10 : 8,
    strategicMeetingsPerMonth: companySize === 'enterprise' ? 12 : companySize === 'scaleup' ? 8 : 4,
    minutesPreparationTime: 30, // 30 minutes per meeting
    decisionTrackingProcess: companySize === 'enterprise' ? 'manual' : 'none',
    complianceAuditNeeds: companySize === 'enterprise',
  };

  // Operations mock data
  const operations: OperationsState = {
    opsTeamSize: Math.round(6 * multiplier.team),
    manualProcessesIdentified: companySize === 'enterprise' ? 15 : companySize === 'scaleup' ? 8 : 5,
    avgApprovalTime: companySize === 'enterprise' ? 48 : companySize === 'scaleup' ? 24 : 12,
    documentProcessingVolume: Math.round(300 * multiplier.volume),
    processAutomationLevel: companySize === 'enterprise' ? 'basic' : 'none',
  };

  return {
    customerService,
    sales,
    marketing,
    meetingIntelligence,
    operations,
  };
}

/**
 * Check if assessment data has real (user-provided) multi-dept data
 */
export function hasRealDepartmentData(assessmentData: any): boolean {
  return !!(
    assessmentData.aiScope &&
    (assessmentData.customerService ||
      assessmentData.sales ||
      assessmentData.marketing ||
      assessmentData.meetingIntelligence ||
      assessmentData.operations)
  );
}
