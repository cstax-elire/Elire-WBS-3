import StreamGrid from "@/components/StreamGrid";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StreamsPage() {
  // Query includes all 6 streams including EXPAND (v4 spec lines 213-250)
  const data = await query(`
    SELECT
      s.code,
      s.name,
      s.stream_id,
      s.is_enabler,
      COUNT(DISTINCT au.unit_id) as unit_count,
      COUNT(DISTINCT CASE WHEN obs.unit_id IS NOT NULL THEN au.unit_id END) as units_with_ownership,
      ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN obs.unit_id IS NOT NULL THEN au.unit_id END) / 
        NULLIF(COUNT(DISTINCT au.unit_id), 0), 
        1
      ) as coverage_pct
    FROM stream s
    LEFT JOIN atomic_unit au ON au.stream_id = s.stream_id
    LEFT JOIN LATERAL (
      SELECT unit_id FROM unit_observed_ownership 
      WHERE unit_id = au.unit_id 
      LIMIT 1
    ) obs ON true
    WHERE s.parent_id IS NULL
    GROUP BY s.stream_id, s.code, s.name, s.is_enabler, s.order_in_parent
    ORDER BY s.order_in_parent;
  `);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Value Streams</h1>
        <p className="text-muted-foreground">
          Navigate all six value streams including the EXPAND stream. Click any stream to see its atomic units and ownership details.
        </p>
      </div>
      <StreamGrid streams={data as any[]} />
    </div>
  );
}
