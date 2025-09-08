import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Use views only - honor view contract (ui-fix.md Critical Bug #3)
    const result = await query(`
      SELECT
        st.stream_code as code,
        st.stream_name as name,
        st.stream_id,
        st.is_enabler,
        st.unit_count,
        -- Get alignment metrics from v_ownership_summary
        COALESCE(os.aligned, 0) as aligned_count,
        COALESCE(os.misattributed, 0) as misattributed_count,
        COALESCE(os.not_observed, 0) as not_observed_count,
        COALESCE(os.alignment_pct, 0) as alignment_pct,
        -- Calculate coverage based on observed units
        ROUND(
          100.0 * (st.unit_count - COALESCE(os.not_observed, 0)) / 
          NULLIF(st.unit_count, 0), 
          1
        ) as coverage_pct
      FROM v_stream_tree st
      LEFT JOIN v_ownership_summary os ON os.stream = st.stream_code
      WHERE st.parent_id IS NULL  -- Top-level streams only
      ORDER BY st.order_in_parent
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