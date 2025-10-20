/**
 * Webhook API for Report Notifications
 *
 * Sends report data to admin webhook URL when a new assessment is completed.
 * This allows admin to receive all client assessments even though they're stored
 * in client's localStorage.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const webhookUrl = process.env.NEXT_PUBLIC_ADMIN_WEBHOOK_URL;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@culturabuilder.com';

    // If webhook URL is not configured, skip silently
    if (!webhookUrl || webhookUrl.includes('your-unique-url')) {
      console.log('⚠️  Webhook URL not configured, skipping notification');
      return NextResponse.json({
        success: true,
        message: 'Webhook not configured'
      });
    }

    // Prepare payload with relevant information
    const payload = {
      timestamp: new Date().toISOString(),
      source: 'culturabuilder-assessment',
      adminEmail: adminEmail,
      report: {
        id: data.reportId,
        companyName: data.companyName,
        contactEmail: data.contactEmail,
        contactName: data.contactName,
        industry: data.industry,
        teamSize: data.teamSize,
        persona: data.persona,
        reportUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/report/${data.reportId}`,
        createdAt: data.createdAt,
      },
      summary: {
        paybackMonths: data.summary?.paybackMonths,
        threeYearNPV: data.summary?.threeYearNPV,
        annualROI: data.summary?.annualROI,
      },
      fullReportData: data.fullReportData, // Complete data for backup
    };

    // Send to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CulturaBuilder-Assessment/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('❌ Webhook failed:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Webhook request failed'
      }, { status: 500 });
    }

    console.log('✅ Webhook notification sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Notification sent to admin'
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);

    // Don't fail the report generation if webhook fails
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
