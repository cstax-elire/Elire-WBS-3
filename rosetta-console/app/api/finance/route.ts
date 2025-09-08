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
    
    // Fetch financial data from the appropriate view
    const result = await query<FinancialRow>(`
      SELECT 
        org_unit_id,
        org_code,
        org_name,
        org_type,
        parent_org_id,
        parent_org_code,
        parent_org_name,
        headcount,
        revenue,
        direct_cost,
        gross_margin,
        gross_margin_pct,
        ${view === 'allocated' 
          ? 'sga_allocation, operating_income, operating_margin_pct,'
          : 'NULL as sga_allocation, NULL as operating_income, NULL as operating_margin_pct,'
        }
        period_month,
        fact_type
      FROM ${viewName}
      ${whereClause}
      ORDER BY 
        org_type DESC,  -- Pillar first, then COE, then Practice
        parent_org_code NULLS FIRST,
        org_name
    `, params);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Failed to fetch financial data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
}