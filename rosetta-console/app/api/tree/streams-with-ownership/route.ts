import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface StreamTreeNode {
  stream_id: number;
  code: string;
  name: string;
  parent_id: number | null;
  is_enabler: boolean;
  order_in_parent: number;
  depth: number;
  path: string;
  path_codes: string;
  direct_unit_count: number;
  linked_child_units: number;
  total_units: number;
  aligned_units: number;
  misattributed_units: number;
  not_observed_units: number;
  alignment_pct: number;
}

export async function GET() {
  try {
    // Get stream tree with ownership stats
    const result = await query<StreamTreeNode>(`
      WITH stream_unit_stats AS (
        SELECT 
          au.stream_id,
          COUNT(*) as total_units,
          SUM(CASE WHEN vrt.status = 'Aligned' THEN 1 ELSE 0 END) as aligned_units,
          SUM(CASE WHEN vrt.status = 'Misattributed' THEN 1 ELSE 0 END) as misattributed_units,
          SUM(CASE WHEN vrt.status = 'Not Observed' THEN 1 ELSE 0 END) as not_observed_units
        FROM atomic_unit au
        LEFT JOIN v_rosetta_truth vrt ON vrt.unit_code = au.code
        GROUP BY au.stream_id
      )
      SELECT 
        st.*,
        COALESCE(sus.total_units, 0) as total_units,
        COALESCE(sus.aligned_units, 0) as aligned_units,
        COALESCE(sus.misattributed_units, 0) as misattributed_units,
        COALESCE(sus.not_observed_units, 0) as not_observed_units,
        CASE 
          WHEN COALESCE(sus.total_units, 0) > 0 
          THEN ROUND(100.0 * sus.aligned_units / sus.total_units, 1)
          ELSE 0 
        END as alignment_pct
      FROM v_stream_tree st
      LEFT JOIN stream_unit_stats sus ON sus.stream_id = st.stream_id
      ORDER BY st.order_in_parent, st.path
    `);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to fetch stream tree with ownership:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream tree data' },
      { status: 500 }
    );
  }
}