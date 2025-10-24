/**
 * API Route: Get Specific Imported Report by ID
 *
 * GET /api/imported-reports/[id] - Get a specific report
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REPORTS_DIR = path.join(process.cwd(), 'external-data-import', 'reports');

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    // Search in both individual and consolidated directories
    const searchDirs = [
      path.join(REPORTS_DIR, 'individual'),
      path.join(REPORTS_DIR, 'consolidated')
    ];

    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

      for (const filename of files) {
        const filePath = path.join(dir, filename);
        const content = fs.readFileSync(filePath, 'utf-8');
        const report = JSON.parse(content);

        if (report.id === reportId) {
          return NextResponse.json({
            success: true,
            report,
            source: 'imported-csv'
          });
        }
      }
    }

    return NextResponse.json(
      { success: false, error: 'Report not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error loading imported report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load report' },
      { status: 500 }
    );
  }
}
