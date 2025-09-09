import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export interface OrgTreeNode {
  org_unit_id: number;
  code: string;
  name: string;
  parent_id: number | null;
  depth: number;
  path: string;
  path_codes: string;
  direct_headcount: number;
  direct_revenue: number;
  direct_cos: number;
  direct_gross_margin: number;
  direct_gm_pct: number;
}

export async function GET() {
  try {
    // Fetch full org hierarchy from v_org_tree
    const result = await query<OrgTreeNode>(`
      SELECT
        org_unit_id,
        code,
        name,
        parent_id,
        depth,
        path,
        path_codes,
        direct_headcount,
        direct_revenue,
        direct_cos,
        direct_gross_margin,
        direct_gm_pct
      FROM v_org_tree
      ORDER BY path_codes
    `);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to fetch org tree:', error);
    return NextResponse.json(
      { error: 'Failed to fetch org tree' },
      { status: 500 }
    );
  }
}