import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export interface FinancialRow {
  org_unit_id: number;
  org_code: string;
  org_name: string;
  org_type: string;
  parent_org_id: number | null;
  parent_org_code: string | null;
  parent_org_name: string | null;
  headcount: number;
  revenue: number;
  direct_cost: number;
  gross_margin: number;
  gross_margin_pct: number;
  sga_allocation: number | null;
  operating_income: number | null;
  operating_margin_pct: number | null;
  period_month: string;
  fact_type: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query params
    const view = searchParams.get('view') || 'direct'; // 'direct' or 'allocated'
    const orgType = searchParams.get('org_type');
    const parentOrg = searchParams.get('parent_org');
    const period = searchParams.get('period');
    
    // Choose view based on toggle (ui-fix.md Section E)
    const viewName = view === 'allocated' 
      ? 'v_financial_rollup_with_sga' 
      : 'v_financial_rollup';
    
    // Build query with filters
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    if (orgType) {
      whereConditions.push(`org_type = $${paramIndex++}`);
      params.push(orgType);
    }
    
    if (parentOrg) {
      whereConditions.push(`parent_org_code = $${paramIndex++}`);
      params.push(parentOrg);
    }
    
    if (period) {
      whereConditions.push(`period_month = $${paramIndex++}`);
      params.push(period);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // For now, return mock data until we fix the financial views
    const result = [
      {
        org_code: "PILLAR_SERVICE_EXEC",
        org_name: "Service Execution",
        org_type: "pillar",
        revenue: 10000000,
        direct_cost: 7000000,
        gross_margin: 3000000,
        gross_margin_pct: 30,
        headcount: 45,
        period_month: "2025-01",
        fact_type: "budget"
      }
    ];
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Failed to fetch financial data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
}