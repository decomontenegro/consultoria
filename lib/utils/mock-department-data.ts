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
  companySize: 'startup' | 'scaleup' | 'enterprise' | string | undefined,
  industry: string
): MockDepartmentData {
  // Size-based multipliers
  const sizeMultipliers = {
    startup: { team: 1, volume: 1, cost: 1 },
    scaleup: { team: 3, volume: 5, cost: 1.5 },
    enterprise: { team: 10, volume: 20, cost: 2 },
  };

  // Normalize and validate companySize
  const normalizedSize = (companySize as string)?.toLowerCase() || 'scaleup';
  const validSize = ['startup', 'scaleup', 'enterprise'].includes(normalizedSize)
    ? (normalizedSize as 'startup' | 'scaleup' | 'enterprise')
    : 'scaleup'; // Default to scaleup if invalid

  const multiplier = sizeMultipliers[validSize];

  // Customer Service mock data
  const customerService: CustomerServiceState = {
    teamSize: Math.round(5 * multiplier.team),
    monthlyTicketVolume: Math.round(500 * multiplier.volume),
    avgFirstResponseTime: 240, // 4 hours (conservative baseline)
    firstContactResolution: 45, // 45% resolution rate
    costPerInteraction: 4.5, // R$ 4.50 per interaction (conservative)
    channelsSupported: validSize === 'startup'
      ? ['email', 'chat']
      : validSize === 'scaleup'
      ? ['email', 'chat', 'phone']
      : ['email', 'chat', 'phone', 'social'],
    automationLevel: validSize === 'enterprise' ? 'moderate' : 'basic',
  };

  // Sales mock data
  const sales: SalesState = {
    salesTeamSize: Math.round(8 * multiplier.team),
    avgSalesCycle: validSize === 'enterprise' ? 90 : validSize === 'scaleup' ? 45 : 30,
    leadConversionRate: 15, // 15% conversion rate
    avgLeadsPerRep: Math.round(50 * multiplier.volume / multiplier.team),
    timeOnAdminTasks: 35, // 35% of time on admin
    crmUsage: validSize === 'enterprise' ? 'advanced' : validSize === 'scaleup' ? 'basic' : 'none',
    avgDealSize: validSize === 'enterprise' ? 150000 : validSize === 'scaleup' ? 50000 : 15000,
  };

  // Marketing mock data
  const marketing: MarketingState = {
    marketingTeamSize: Math.round(4 * multiplier.team),
    campaignsPerMonth: validSize === 'enterprise' ? 12 : validSize === 'scaleup' ? 6 : 3,
    contentCreationHours: Math.round(20 * multiplier.team),
    cac: validSize === 'enterprise' ? 800 : validSize === 'scaleup' ? 400 : 200,
    leadGenerationRate: Math.round(200 * multiplier.volume),
    automationUsage: validSize === 'enterprise' ? 'moderate' : validSize === 'scaleup' ? 'basic' : 'none',
  };

  // Meeting Intelligence & Governance mock data
  const meetingIntelligence: MeetingGovernanceState = {
    executiveTeamSize: validSize === 'enterprise' ? 8 : validSize === 'scaleup' ? 4 : 2,
    avgMeetingHoursPerWeek: validSize === 'enterprise' ? 15 : validSize === 'scaleup' ? 10 : 8,
    strategicMeetingsPerMonth: validSize === 'enterprise' ? 12 : validSize === 'scaleup' ? 8 : 4,
    minutesPreparationTime: 30, // 30 minutes per meeting
    decisionTrackingProcess: validSize === 'enterprise' ? 'manual' : 'none',
    complianceAuditNeeds: validSize === 'enterprise',
  };

  // Operations mock data
  const operations: OperationsState = {
    opsTeamSize: Math.round(6 * multiplier.team),
    manualProcessesIdentified: validSize === 'enterprise' ? 15 : validSize === 'scaleup' ? 8 : 5,
    avgApprovalTime: validSize === 'enterprise' ? 48 : validSize === 'scaleup' ? 24 : 12,
    documentProcessingVolume: Math.round(300 * multiplier.volume),
    processAutomationLevel: validSize === 'enterprise' ? 'basic' : 'none',
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
