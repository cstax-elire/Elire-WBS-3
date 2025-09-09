import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface OrgTreeNode {
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
  expected_units: number;
  aligned_units: number;
  misattributed_units: number;
  not_observed_units: number;
  alignment_pct: number;
}

export async function GET() {
  try {
    // Get org tree with ownership stats
    const result = await query<OrgTreeNode>(`
      WITH org_ownership_stats AS (
        SELECT 
          ueo.accountable_org_unit_id as org_unit_id,
          COUNT(*) as expected_units,
          SUM(CASE WHEN vrt.status = 'Aligned' THEN 1 ELSE 0 END) as aligned_units,
          SUM(CASE WHEN vrt.status = 'Misattributed' THEN 1 ELSE 0 END) as misattributed_units,
          SUM(CASE WHEN vrt.status = 'Not Observed' THEN 1 ELSE 0 END) as not_observed_units
        FROM unit_expected_ownership ueo
        JOIN atomic_unit au ON au.unit_id = ueo.unit_id
        LEFT JOIN v_rosetta_truth vrt ON vrt.unit_code = au.code
        GROUP BY ueo.accountable_org_unit_id
      )
      SELECT 
        o.*,
        COALESCE(os.expected_units, 0) as expected_units,
        COALESCE(os.aligned_units, 0) as aligned_units,
        COALESCE(os.misattributed_units, 0) as misattributed_units,
        COALESCE(os.not_observed_units, 0) as not_observed_units,
        CASE 
          WHEN COALESCE(os.expected_units, 0) > 0 
          THEN ROUND(100.0 * os.aligned_units / os.expected_units, 1)
          ELSE 0 
        END as alignment_pct
      FROM v_org_tree o
      LEFT JOIN org_ownership_stats os ON os.org_unit_id = o.org_unit_id
      ORDER BY o.path
    `);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to fetch org tree with ownership:', error);
    return NextResponse.json(
      { error: 'Failed to fetch org tree data' },
      { status: 500 }
    );
  }
}