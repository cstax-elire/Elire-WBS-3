import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Use views only - honor view contract (ui-fix.md Critical Bug #3)
    const result = await query(`
      SELECT
        st.code,
        st.name,
        (st.direct_unit_count + st.linked_child_units) as unit_count,
        -- Get alignment metrics from v_ownership_summary
        COALESCE(os.aligned, 0) as aligned_count,
        COALESCE(os.misattributed, 0) as misattributed_count,
        COALESCE(os.not_observed, 0) as not_observed_count,
        COALESCE(os.alignment_pct, 0) as alignment_pct,
        -- Calculate coverage based on observed units
        ROUND(
          100.0 * ((st.direct_unit_count + st.linked_child_units) - COALESCE(os.not_observed, 0)) / 
          NULLIF((st.direct_unit_count + st.linked_child_units), 0), 
          1
        ) as coverage_pct
      FROM v_stream_tree st
      LEFT JOIN v_ownership_summary os ON os.stream = st.code
      WHERE st.parent_id IS NULL  -- Top-level streams only
      ORDER BY st.code
    `);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to fetch streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streams data' },
      { status: 500 }
    );
  }
}